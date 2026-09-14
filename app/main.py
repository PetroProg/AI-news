import asyncio
import logging
import sys
from sqlalchemy import func, select

from app.collectors.rss import RSSCollector
from app.config import get_settings
from app.database.models import Article, Source
from app.database.session import async_session_maker, check_db_connection
from app.services.ingestion import IngestionService

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
    logger.info("  Environment: %s", settings.APP_ENV)
    logger.info("==========================================")

    try:
        await check_db_connection()
        logger.info("Database connection healthy.")
    except Exception as e:
        logger.error("Failed database connection: %s", e)
        sys.exit(1)

    async with async_session_maker() as session:
        service = IngestionService(session=session)

        for feed in FEEDS:
            collector = RSSCollector(
                source_name=feed["name"],
                source_url=feed["url"],
                language=feed["lang"],
            )
            await service.run_collector(collector)

        total_sources = await session.scalar(select(func.count(Source.id)))
        total_articles = await session.scalar(select(func.count(Article.id)))

        logger.info("==========================================")
        logger.info("  INGESTION SUMMARY")
        logger.info("  Total registered sources: %d", total_sources)
        logger.info("  Total stored articles:   %d", total_articles)
        logger.info("==========================================")


if __name__ == "__main__":
    asyncio.run(main())