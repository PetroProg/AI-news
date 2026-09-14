import logging
from datetime import datetime, timedelta, timezone
from typing import List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Article, ArticleStatus
from app.processing.cleaner import ContentCleaner
from app.processing.deduplicator import ContentDeduplicator

logger = logging.getLogger("news_ai.services.processing")


class ProcessingService:
    """Orchestrates content sanitization, hashing, and cross-source deduplication."""

    DEDUPLICATION_WINDOW_HOURS = 48

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def process_collected_articles(self) -> Tuple[int, int]:
        """Fetch pending COLLECTED articles, clean text, and perform deduplication.
        
        Returns:
            Tuple[int, int]: (count of processed unique articles, count of duplicates detected)
        """
        stmt = (
            select(Article)
            .where(Article.status == ArticleStatus.COLLECTED)
            .order_by(Article.published_at.asc())
        )
        res = await self.session.execute(stmt)
        pending_articles = list(res.scalars().all())

        if not pending_articles:
            logger.info("No new articles pending processing.")
            return 0, 0

        logger.info("Starting processing pipeline for %d collected articles...", len(pending_articles))

        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=self.DEDUPLICATION_WINDOW_HOURS)
        ref_stmt = (
            select(Article.id, Article.title, Article.content_hash)
            .where(
                Article.published_at >= cutoff_time,
                Article.status.in_([ArticleStatus.PROCESSED, ArticleStatus.SUMMARIZED, ArticleStatus.REPORTED]),
            )
        )
        ref_res = await self.session.execute(ref_stmt)

        reference_articles: List[Tuple[int, str, str]] = list(ref_res.all())

        unique_count = 0
        duplicate_count = 0

        for article in pending_articles:
            cleaned = ContentCleaner.clean(article.raw_content)
            article.cleaned_content = cleaned or article.title

            content_hash = ContentDeduplicator.compute_content_hash(article.cleaned_content)
            article.content_hash = content_hash

            duplicate_id = ContentDeduplicator.find_duplicate(
                candidate_title=article.title,
                candidate_hash=content_hash,
                existing_articles=reference_articles,
            )

            if duplicate_id:
                article.status = ArticleStatus.DUPLICATE
                article.duplicate_of_id = duplicate_id
                duplicate_count += 1
                logger.debug(
                    "Article '%s' marked as DUPLICATE of article ID %d",
                    article.title[:40], duplicate_id
                )
            else:
                article.status = ArticleStatus.PROCESSED
                unique_count += 1
                reference_articles.append((article.id, article.title, content_hash))

        await self.session.commit()

        logger.info(
            "Processing completed: %d unique marked as PROCESSED, %d marked as DUPLICATE",
            unique_count, duplicate_count
        )
        return unique_count, duplicate_count