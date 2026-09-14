import asyncio
import logging
import sys
from sqlalchemy import func, select

from app.collectors.rss import RSSCollector
from app.config import get_settings
from app.database.models import Article, ArticleStatus, Source
from app.database.session import async_session_maker, check_db_connection
from app.services.ingestion import IngestionService
from app.services.processing import ProcessingService

settings = get_settings()

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger("news_ai")

FEEDS = [
    {
        "name": "OpenNET Linux News",
        "url": "https://www.opennet.ru/opennews/opennews_all.rss",
        "lang": "ru",
    },
    {
        "name": "Hacker News Frontpage",
        "url": "https://news.ycombinator.com/rss",
        "lang": "en",
    },
]


async def main() -> None:
    logger.info("==========================================")
    logger.info("  Personal AI News Aggregator v0.1.0      ")
    logger.info("  Pipeline: Ingestion + Processing        ")
    logger.info("==========================================")

    try:
        await check_db_connection()
    except Exception as e:
        logger.error("Database connection failed: %s", e)
        sys.exit(1)

    async with async_session_maker() as session:
        ingestion_service = IngestionService(session=session)
        for feed in FEEDS:
            collector = RSSCollector(
                source_name=feed["name"],
                source_url=feed["url"],
                language=feed["lang"],
            )
            await ingestion_service.run_collector(collector)

        processing_service = ProcessingService(session=session)
        unique_cnt, dup_cnt = await processing_service.process_collected_articles()

        total_articles = await session.scalar(select(func.count(Article.id)))
        processed_articles = await session.scalar(
            select(func.count(Article.id)).where(Article.status == ArticleStatus.PROCESSED)
        )
        duplicate_articles = await session.scalar(
            select(func.count(Article.id)).where(Article.status == ArticleStatus.DUPLICATE)
        )

        logger.info("==========================================")
        logger.info("  PIPELINE EXECUTION SUMMARY")
        logger.info("  Total articles in DB:  %d", total_articles)
        logger.info("  Ready for AI (PROCESSED): %d", processed_articles)
        logger.info("  Duplicates filtered:    %d", duplicate_articles)
        logger.info("==========================================")


if __name__ == "__main__":
    asyncio.run(main())