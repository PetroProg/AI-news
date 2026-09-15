import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import OllamaClient
from app.database.models import Article, ArticleStatus, Category, Summary

logger = logging.getLogger("news_ai.services.summarizer")


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
            logger.info("Analyzing article ID %d: '%s'...", article.id, article.title[:35])

            analysis = await self.ai_client.analyze_article(
                title=article.title,
                text=article.cleaned_content or article.raw_content,
            )

            if not analysis:
                logger.warning("AI analysis returned None for article ID %d, skipping.", article.id)
                continue

            category = await self.get_or_create_category(analysis.category)
            article.category_id = category.id

            article.importance_score = analysis.importance_score

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
            logger.info("Saved summary for article ID %d (Score: %.1f)", article.id, analysis.importance_score)

        logger.info("Batch completed: %d articles successfully summarized.", summarized_count)
        return summarized_count