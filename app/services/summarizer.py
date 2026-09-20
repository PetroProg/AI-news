import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.client import OllamaClient
from app.database.models import Article, ArticleStatus, Category, Summary

logger = logging.getLogger("news_ai.services.summarizer")

PRIORITY_KEYWORDS = ["simple", "s1mple", "navi", "bcgame", "bc.game", "fut"]
CS_FINAL_KEYWORDS = [
    "финал", "гранд-финал", "гранд финал", "победитель финала", "победители финала",
    "выиграл финал", "выиграла финал", "победил в финале", "победила в финале",
    "стал чемпионом", "стали чемпионами", "чемпионы турнира", "чемпион турнира",
    "победитель турнира", "победители турнира", "выиграл турнир", "выиграли турнир",
    "забрал кубок", "забрали кубок", "поднял кубок", "подняли кубок",
    "grand final", "grand-final", "tournament winner", "champions", "champion"
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
        clean_name = name.strip() or "General Tech"
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
            .options(selectinload(Article.source))
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

            if is_gaming:
                chosen_category = "Игры & Киберспорт"
            else:
                chosen_category = analysis.category
                # Safety check: never allow gaming articles in IT & Analytics
                if "аналитик" in chosen_category.lower() or "dev" in chosen_category.lower():
                    if any(k in title_lower for k in GAMING_INDICATORS):
                        chosen_category = "Игры & Киберспорт"

            category = await self.get_or_create_category(chosen_category)
            article.category_id = category.id

            # Priority keyword boost & meme guard
            score = float(analysis.importance_score)
            text_for_check = title_lower + " " + content_lower
            is_meme_or_ad = any(stop in text_for_check for stop in ["тир-2", "тир 2", "cs.money", "розыгрыш", "бесплатно", "скины", "скин ", "рулетк", "щитпост", "удивительном мире"])
            if is_meme_or_ad and score > 4.0:
                score = 3.0
                logger.info("Article ID %d detected as meme/ad/sarcasm. Reduced score to %.1f", article.id, score)

            has_priority = any(kw in text_for_check for kw in PRIORITY_KEYWORDS)
            is_final_or_winner = is_gaming and any(kw in text_for_check for kw in CS_FINAL_KEYWORDS)

            if is_final_or_winner and not is_meme_or_ad:
                score = max(score, 9.0)
                logger.info("Article ID %d matched CS:GO finals/winner! Set score to %.1f", article.id, score)
            elif has_priority and not is_meme_or_ad and score >= 5.5:
                score = min(10.0, max(score, 8.5))
                logger.info("Article ID %d matched priority keywords! Boosted score to %.1f", article.id, score)

            article.importance_score = score

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

        logger.info("Batch completed: %d articles successfully summarized.", summarized_count)
        return summarized_count
