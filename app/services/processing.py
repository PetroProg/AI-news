import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Article, ArticleStatus
from app.processing.cleaner import ContentCleaner
from app.processing.deduplicator import ContentDeduplicator, extract_article_media

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
            select(
                Article.id,
                Article.title,
                Article.content_hash,
                Article.raw_content,
                Article.source_id,
                Article.published_at,
            )
            .where(
                Article.published_at >= cutoff_time,
                Article.status.in_([ArticleStatus.PROCESSED, ArticleStatus.SUMMARIZED, ArticleStatus.REPORTED]),
            )
        )
        ref_res = await self.session.execute(ref_stmt)
        ref_rows = ref_res.all()

        media_dir = Path("media")
        reference_articles: List[Dict[str, Any]] = []
        for row in ref_rows:
            ref_id, ref_title, ref_hash, ref_raw, ref_src, ref_pub = row
            img_hash = None
            if ref_raw:
                imgs, _ = extract_article_media(ref_raw)
                if imgs:
                    local_p = media_dir / imgs[0].replace("/media/", "")
                    img_hash = ContentDeduplicator.compute_image_dhash(local_p)

            reference_articles.append({
                "id": ref_id,
                "title": ref_title,
                "content_hash": ref_hash,
                "image_hash": img_hash,
                "source_id": ref_src,
                "published_at": ref_pub,
            })

        unique_count = 0
        duplicate_count = 0

        for article in pending_articles:
            article.title = ContentCleaner.clean_title(article.title)
            cleaned = ContentCleaner.clean(article.raw_content)
            article.cleaned_content = cleaned or article.title

            content_hash = ContentDeduplicator.compute_content_hash(article.cleaned_content)
            article.content_hash = content_hash

            candidate_img_hash = None
            if article.raw_content:
                c_imgs, _ = extract_article_media(article.raw_content)
                if c_imgs:
                    local_p = media_dir / c_imgs[0].replace("/media/", "")
                    candidate_img_hash = ContentDeduplicator.compute_image_dhash(local_p)

            duplicate_id = ContentDeduplicator.find_duplicate(
                candidate_title=article.title,
                candidate_hash=content_hash,
                candidate_image_hash=candidate_img_hash,
                candidate_source_id=article.source_id,
                candidate_published_at=article.published_at,
                existing_articles=reference_articles,
            )

            if duplicate_id:
                article.status = ArticleStatus.DUPLICATE
                article.duplicate_of_id = duplicate_id
                duplicate_count += 1
                logger.info(
                    "Article ID %d '%s' marked as DUPLICATE of article ID %d",
                    article.id, article.title[:40], duplicate_id
                )
            else:
                article.status = ArticleStatus.PROCESSED
                unique_count += 1
                reference_articles.append({
                    "id": article.id,
                    "title": article.title,
                    "content_hash": content_hash,
                    "image_hash": candidate_img_hash,
                    "source_id": article.source_id,
                    "published_at": article.published_at,
                })

        await self.session.commit()

        logger.info(
            "Processing completed: %d unique marked as PROCESSED, %d marked as DUPLICATE",
            unique_count, duplicate_count
        )
        return unique_count, duplicate_count
