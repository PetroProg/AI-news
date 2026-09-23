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
        await self.cluster_cs_update_bursts()

        logger.info(
            "Processing completed: %d unique marked as PROCESSED, %d marked as DUPLICATE",
            unique_count, duplicate_count
        )
        return unique_count, duplicate_count

    async def cluster_cs_update_bursts(self) -> int:
        """Detects bursts of CS2 posts within a 2.5-hour window regarding a game update,
        merges their details into the primary (first) announcement post, and marks the rest as duplicates.
        """
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=24)
        stmt = (
            select(Article)
            .where(
                Article.published_at >= cutoff_time,
                Article.status == ArticleStatus.PROCESSED,
            )
            .order_by(Article.published_at.asc())
        )
        res = await self.session.execute(stmt)
        candidates = list(res.scalars().all())

        update_markers = [
            "обновлен", "патч", "апдейт", "куроч", "яйц", "питомц", "перезарядк",
            "m14", "rush", "клан-тег", "ночной обнов", "в файлах игры", "коктейл"
        ]

        cs_posts = []
        for a in candidates:
            txt = ((a.title or "") + " " + (a.raw_content or "")).lower()
            if any(m in txt for m in update_markers):
                cs_posts.append(a)

        if len(cs_posts) < 3:
            return 0

        clusters: List[List[Article]] = []
        current_cluster: List[Article] = [cs_posts[0]]

        for next_post in cs_posts[1:]:
            prev_post = current_cluster[-1]
            diff_hours = abs((next_post.published_at - prev_post.published_at).total_seconds()) / 3600.0
            if diff_hours <= 2.5:
                current_cluster.append(next_post)
            else:
                if len(current_cluster) >= 3:
                    clusters.append(current_cluster)
                current_cluster = [next_post]

        if len(current_cluster) >= 3:
            clusters.append(current_cluster)

        merged_count = 0
        for cluster in clusters:
            primary_post = cluster[0]
            collected_lines = []
            for item in cluster:
                cleaned_item = ContentCleaner.clean(item.raw_content or item.title)
                for line in cleaned_item.splitlines():
                    line = line.strip()
                    if line and len(line) > 15 and line not in collected_lines and not line.startswith("#"):
                        collected_lines.append(line)

            merged_text = "\n\n".join(collected_lines[:15])
            if merged_text and primary_post.cleaned_content:
                header = "Детали обновления:"
                if header not in primary_post.cleaned_content:
                    primary_post.cleaned_content += "\n\n" + header + "\n" + merged_text
                    primary_post.title = "В CS2 вышло масштабное обновление"
                    logger.info("Clustered %d CS2 update posts into primary post ID %d", len(cluster), primary_post.id)

            for sub_post in cluster[1:]:
                sub_post.status = ArticleStatus.DUPLICATE
                sub_post.duplicate_of_id = primary_post.id
                merged_count += 1

        if merged_count > 0:
            await self.session.commit()
            logger.info("Total %d burst posts clustered into primary update announcements.", merged_count)
        return merged_count
