import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.collectors.base import BaseCollector, CollectedItem
from app.database.models import Article, ArticleStatus, Source, SourceType

logger = logging.getLogger("news_ai.services.ingestion")


class IngestionService:
    """Service orchestrating collection and persistent storage of news articles."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_or_create_source(
        self,
        name: str,
        url: str,
        source_type: SourceType = SourceType.RSS,
        fetch_interval_minutes: int = 60,
    ) -> Source:
        """Fetch existing source by URL or create a new active record."""
        stmt = select(Source).where(Source.url == url)
        result = await self.session.execute(stmt)
        source = result.scalar_one_or_none()

        if not source:
            logger.info("Registering new source in database: '%s' (%s)", name, url)
            source = Source(
                name=name,
                url=url,
                source_type=source_type,
                fetch_interval_minutes=fetch_interval_minutes,
                is_active=True,
            )
            self.session.add(source)
            await self.session.commit()
            await self.session.refresh(source)

        return source

    async def run_collector(self, collector: BaseCollector, source_type: SourceType = SourceType.RSS) -> int:
        """Execute a collector, filter out existing items, and save new articles."""
        source = await self.get_or_create_source(
            name=collector.source_name,
            url=collector.source_url,
            source_type=source_type,
        )

        raw_items: List[CollectedItem] = await collector.collect()
        if not raw_items:
            logger.info("No items returned for source '%s'", source.name)
            return 0

        new_articles_count = 0

        for item in raw_items:
            is_new = await self._is_article_new(source.id, item)
            if not is_new:
                continue

            article = Article(
                source_id=source.id,
                external_id=item.external_id,
                title=item.title,
                original_url=item.original_url,
                author=item.author,
                published_at=item.published_at,
                raw_content=item.raw_content,
                language=item.language,
                status=ArticleStatus.COLLECTED,
            )
            self.session.add(article)
            new_articles_count += 1

        source.last_fetched_at = datetime.now(timezone.utc)
        await self.session.commit()

        logger.info(
            "Source '%s': saved %d new articles (out of %d fetched)",
            source.name,
            new_articles_count,
            len(raw_items),
        )
        return new_articles_count

    async def _is_article_new(self, source_id: int, item: CollectedItem) -> bool:
        """Check if article already exists for this source by external_id or URL."""
        if item.external_id:
            stmt = select(Article.id).where(
                Article.source_id == source_id,
                Article.external_id == item.external_id,
            )
            res = await self.session.execute(stmt)
            if res.scalar_one_or_none() is not None:
                return False

        if item.original_url:
            stmt = select(Article.id).where(
                Article.source_id == source_id,
                Article.original_url == item.original_url,
            )
            res = await self.session.execute(stmt)
            if res.scalar_one_or_none() is not None:
                return False

        return True