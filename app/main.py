import asyncio
import logging
import sys
from sqlalchemy import func, select

from app.collectors.rss import RSSCollector
from app.collectors.telegram import TelegramCollector
from app.config import get_settings
from app.database.models import Article, ArticleStatus, Source, SourceType
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

RSS_FEEDS = [
    {
        "name": "OpenNET Linux News",
        "url": "https://www.opennet.ru/opennews/opennews_all.rss",
        "lang": "ru",
    },
]

TELEGRAM_CHANNELS = [
    {"username": "newcsgo", "lang": "ru", "limit": 10},
    {"username": "habr_com", "lang": "ru", "limit": 10},
]


async def main() -> None:
    logger.info("==========================================")
    logger.info("  Personal AI News Aggregator v0.1.0      ")
    logger.info("  Full Pipeline: RSS + Telegram + AI      ")
    logger.info("==========================================")

    try:
        await check_db_connection()
    except Exception as e:
        logger.error("Database connection failed: %s", e)
        sys.exit(1)

    async with async_session_maker() as session:
        ingestion_service = IngestionService(session=session)

        logger.info("--- 📡 СБОР RSS ЛЕНТ ---")
        for feed in RSS_FEEDS:
            collector = RSSCollector(
                source_name=feed["name"],
                source_url=feed["url"],
                language=feed["lang"],
            )
            await ingestion_service.run_collector(collector, source_type=SourceType.RSS)

        if settings.TELEGRAM_API_ID and settings.TELEGRAM_API_HASH:
            logger.info("--- ✈️ СБОР TELEGRAM КАНАЛОВ ---")
            for tg in TELEGRAM_CHANNELS:
                collector = TelegramCollector(
                    channel_username=tg["username"],
                    limit=tg["limit"],
                    language=tg["lang"],
                )
                await ingestion_service.run_collector(collector, source_type=SourceType.TELEGRAM)
        else:
            logger.warning("Telegram credentials not found in .env, skipping Telegram collection.")

        logger.info("--- 🧹 ОЧИСТКА И ДЕДУПЛИКАЦИЯ ---")
        processing_service = ProcessingService(session=session)
        unique_cnt, dup_cnt = await processing_service.process_collected_articles()

        logger.info("--- 🧠 AI АНАЛИЗ И САММАРИЗАЦИЯ ---")
        summarizer_service = SummarizerService(session=session)
        summarized_cnt = await summarizer_service.summarize_pending_articles(limit=5)

        total_articles = await session.scalar(select(func.count(Article.id)))
        tg_articles = await session.scalar(
            select(func.count(Article.id)).join(Source).where(Source.source_type == SourceType.TELEGRAM)
        )
        total_summaries = await session.scalar(select(func.count(Article.id)).where(Article.status == ArticleStatus.SUMMARIZED))

        logger.info("==========================================")
        logger.info("  PIPELINE EXECUTION COMPLETE")
        logger.info("  Total articles in DB:      %d", total_articles)
        logger.info("  Telegram articles in DB:   %d", tg_articles)
        logger.info("  Total summarized by AI:    %d", total_summaries)
        logger.info("==========================================")


if __name__ == "__main__":
    asyncio.run(main())