import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.client import OllamaClient
from app.processing.cleaner import ContentCleaner
from app.database.models import Article, ArticleStatus, Category, Summary

logger = logging.getLogger("news_ai.services.summarizer")

UKRAINE_PRIORITY_KEYWORDS = [
    "дніпро", "днепр", "дніпров", "оон", "нато", "nato", "тцк", "блекаут", "блэкаут",
    "збито", "сбито", "підсумки атаки", "итоги атаки", "повітряні сили", "воздушные силы", "генштаб"
]

PRIORITY_KEYWORDS = ["simple", "s1mple", "navi", "bcgame", "bc.game", "fut"]
CS_FINAL_KEYWORDS = [
    "победитель финала", "победители финала", "победитель гранд-финала", "победители гранд-финала",
    "победил в финале", "победили в финале", "победил в гранд-финале", "победили в гранд-финале",
    "победитель турнира", "победители турнира", "выиграл турнир", "выиграли турнир",
    "выиграл финал", "выиграли финал", "выиграл гранд-финал", "выиграли гранд-финал",
    "забрал финал", "забрали финал", "забрал гранд-финал", "забрали гранд-финал",
    "стал чемпионом", "стали чемпионами", "чемпионы турнира", "чемпион турнира",
    "забрал кубок", "забрали кубок", "поднял кубок", "подняли кубок",
    "забрал трофей", "забрали трофей", "поднял трофей", "подняли трофей",
    "чемпионы starladder", "чемпион starladder", "чемпионы major", "чемпион major",
    "гранд-финал", "гранд финал", "grand final", "tournament winner", "crowned champions"
]
GAMING_INDICATORS = [
    "csgo", "cs3", "clashroyalepin", "hltv", "game", "игры", "киберспорт",
    "cs2", "cs:go", "starladder", "vitality", "navi", "s1mple", "m0nesy",
    "donk", "zywoo", "clash royale", "bcgame", "fut", "blast", "esl"
]


class SummarizerService:
    """Orchestrates LLM summarization, scoring, and categorical classification."""

    def __init__(self, session: AsyncSession, ai_client: Optional[OllamaClient] = None) -> None:
        self.session = session
        self.ai_client = ai_client or OllamaClient()

    async def get_or_create_category(self, name: str) -> Category:
        """Find or create a topic category."""
        clean_name = name.strip() or "IT"
        slug = clean_name.lower().replace(" ", "-").replace("&", "and")

        stmt = select(Category).where(Category.slug == slug)
        res = await self.session.execute(stmt)
        category = res.scalar_one_or_none()

        if not category:
            category = Category(name=clean_name, slug=slug)
            self.session.add(category)
            await self.session.flush()

        return category

    async def summarize_pending_articles(self, limit: int = 5) -> int:
        """Fetch pending PROCESSED articles and run them through the local LLM.
        
        Args:
            limit: Maximum number of articles to process in one batch (protects Celeron CPU).
        """
        stmt = (
            select(Article)
            .options(selectinload(Article.source), selectinload(Article.summary))
            .where(Article.status == ArticleStatus.PROCESSED)
            .order_by(Article.published_at.desc())
            .limit(limit)
        )
        res = await self.session.execute(stmt)
        articles = list(res.scalars().all())

        if not articles:
            logger.info("No articles waiting for AI summarization.")
            return 0

        logger.info("Starting AI summarization batch for %d articles...", len(articles))
        summarized_count = 0

        for article in articles:
            source_name = article.source.name if article.source else ""
            source_url = article.source.url if article.source else ""
            combined_source = (source_name + " " + source_url).lower()

            logger.info("Analyzing article ID %d: '%s' (Source: %s)...", article.id, article.title[:35], source_name)

            analysis = await self.ai_client.analyze_article(
                title=article.title,
                text=article.cleaned_content or article.raw_content,
                source_name=source_name,
            )

            if not analysis:
                logger.warning("AI analysis returned None for article ID %d, skipping.", article.id)
                continue

            # Deterministic Category Assignment
            title_lower = (article.title or "").lower()
            content_lower = (article.cleaned_content or article.raw_content or "").lower()
            is_gaming = any(k in combined_source for k in ["csgo", "cs3", "clashroyalepin", "hltv", "game", "киберспорт"]) or \
                        any(k in title_lower for k in GAMING_INDICATORS)

            is_ukraine = ("novynaukr" in combined_source) or \
                         (analysis.category and "украин" in analysis.category.lower())

            if is_ukraine:
                chosen_category = "Украина"
            elif is_gaming or (analysis.category and analysis.category.lower() in ["игры & киберспорт", "игры и киберспорт", "gaming", "cs2"]):
                chosen_category = "CS2"
            elif analysis.category and analysis.category.lower() in ["it & аналитика", "it-аналитик", "development", "общие технологии", "general tech", "technology"]:
                chosen_category = "IT"
            else:
                chosen_category = analysis.category or "IT"
                # Safety check: never allow gaming articles in IT
                if ("it" in chosen_category.lower() or "аналитик" in chosen_category.lower() or "dev" in chosen_category.lower()):
                    if any(k in title_lower for k in GAMING_INDICATORS):
                        chosen_category = "CS2"

            category = await self.get_or_create_category(chosen_category)
            article.category_id = category.id

            # Priority keyword boost & meme guard
            score = float(analysis.importance_score)
            text_for_check = title_lower + " " + content_lower
            is_meme_or_ad = any(stop in text_for_check for stop in ["тир-2", "тир 2", "cs.money", "розыгрыш", "бесплатно", "скины", "скин ", "рулетк", "щитпост", "удивительном мире"])
            if is_meme_or_ad and score > 4.0:
                score = 3.0
                logger.info("Article ID %d detected as meme/ad/sarcasm. Reduced score to %.1f", article.id, score)

            is_ukr_micro_alert = False
            if chosen_category == "Украина":
                is_ukr_micro_alert = any(ping in text_for_check for ping in [
                    "курсом на", "курс на", "напрямку", "в напрямку", "в сторону", "в направлении",
                    "летить дрон", "летит дрон", "тривога в", "тревога в", "загроза балістики", "угроза баллистики",
                    "чисто в", "відбій", "отбой", "пуски шахедів", "пуски шахедов"
                ]) and len(text_for_check) < 300
                if is_ukr_micro_alert:
                    score = min(score, 5.0)

            has_ukr_priority = chosen_category == "Украина" and not is_ukr_micro_alert and any(kw in text_for_check for kw in UKRAINE_PRIORITY_KEYWORDS)
            has_priority = (any(kw in text_for_check for kw in PRIORITY_KEYWORDS) or has_ukr_priority) and not is_ukr_micro_alert
            is_digest = any(d in text_for_check for d in ["#дайджест", "дайджест", "утренний дайджест", "новости дня", "главное за день", "итоги недели", "итоги дня", "ура, воскресенье"])
            is_round_only = any(r in text_for_check for r in ["финальный раунд", "финальном раунде", "финального раунда", "финальные раунды"])
            is_final_or_winner = is_gaming and not is_digest and not is_round_only and any(kw in text_for_check for kw in CS_FINAL_KEYWORDS)

            if is_final_or_winner and not is_meme_or_ad:
                score = max(score, 9.0)
                logger.info("Article ID %d matched CS:GO finals/winner! Set score to %.1f", article.id, score)
            elif has_priority and not is_meme_or_ad and score >= 5.5:
                score = min(10.0, max(score, 8.5))
                logger.info("Article ID %d matched priority keywords! Boosted score to %.1f", article.id, score)

            # If LLM returned a Russian title and original had Latin, update title
            if analysis.russian_title and len(analysis.russian_title.strip()) > 3:
                has_latin = any(c.isascii() and c.isalpha() for c in (article.title or ""))
                has_ukrainian = any(c in "ієїґІЄЇҐ" for c in (article.title or ""))
                if has_latin or has_ukrainian:
                    article.title = ContentCleaner.clean_title(analysis.russian_title)
            else:
                article.title = ContentCleaner.clean_title(article.title)

            article.importance_score = score

            try:
                # Upsert check to prevent UniqueViolationError on retries
                target_summary = article.summary
                if not target_summary:
                    stmt_sum = select(Summary).where(Summary.article_id == article.id)
                    res_sum = await self.session.execute(stmt_sum)
                    target_summary = res_sum.scalar_one_or_none()

                if target_summary:
                    target_summary.short_summary = analysis.short_summary
                    target_summary.why_it_matters = analysis.why_it_matters
                    target_summary.key_points = analysis.key_points
                    target_summary.model_used = self.ai_client.model
                    logger.info("Updated existing summary for article ID %d", article.id)
                else:
                    summary_record = Summary(
                        article_id=article.id,
                        short_summary=analysis.short_summary,
                        why_it_matters=analysis.why_it_matters,
                        key_points=analysis.key_points,
                        model_used=self.ai_client.model,
                    )
                    self.session.add(summary_record)

                article.status = ArticleStatus.SUMMARIZED
                summarized_count += 1
                await self.session.commit()
                logger.info("Saved summary for article ID %d (Cat: %s, Score: %.1f)", article.id, chosen_category, score)
            except Exception as save_exc:
                await self.session.rollback()
                logger.error("Failed to commit summary for article ID %d: %s", article.id, save_exc)

        logger.info("Batch completed: %d articles successfully summarized.", summarized_count)
        return summarized_count
