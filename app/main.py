import asyncio
import logging
import sys
from sqlalchemy import func, select

from app.collectors.rss import RSSCollector
from app.config import get_settings
from app.database.models import Article, ArticleStatus, Source, Summary
from app.database.session import async_session_maker, check_db_connection
from app.services.ingestion import IngestionService
from app.services.processing import ProcessingService
from app.services.summarizer import SummarizerService

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
    logger.info("  Pipeline: Ingest -> Process -> AI       ")
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
        await processing_service.process_collected_articles()
        
        summarizer_service = SummarizerService(session=session)
        summarized_count = await summarizer_service.summarize_pending_articles(limit=3)

        total_articles = await session.scalar(select(func.count(Article.id)))
        summarized_articles = await session.scalar(
            select(func.count(Article.id)).where(Article.status == ArticleStatus.SUMMARIZED)
        )

        logger.info("==========================================")
        logger.info("  PIPELINE EXECUTION SUMMARY")
        logger.info("  Total articles in DB:      %d", total_articles)
        logger.info("  Total summarized by AI:    %d", summarized_articles)
        logger.info("==========================================")


if __name__ == "__main__":
    asyncio.run(main())