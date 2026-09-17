import asyncio
import logging
import httpx
from aiogram import Bot
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database.session import async_session_maker
from app.database.models import ReportType, SourceType
from app.collectors.rss import RSSCollector
from app.collectors.telegram import TelegramCollector
from app.services.ingestion import IngestionService
from app.services.processing import ProcessingService
from app.services.summarizer import SummarizerService
from app.services.report import ReportBuilderService
from app.bot.utils import send_wake_on_lan, split_message

logger = logging.getLogger("news_ai.orchestrator")


class PipelineOrchestrator:
    """Orchestrates end-to-end autonomous news collection, AI analysis and dispatch."""

    def __init__(self, bot: Bot | None = None):
        self.bot = bot

    async def wait_for_gpu_node(self, timeout_seconds: int = 30) -> bool:
        """Pings Ollama on the remote PC via Tailscale until it responds or times out."""
        logger.info("Checking AI GPU worker availability at %s...", settings.OLLAMA_BASE_URL)
        url = f"{settings.OLLAMA_BASE_URL}/api/tags"
        
        start_time = asyncio.get_event_loop().time()
        while (asyncio.get_event_loop().time() - start_time) < timeout_seconds:
            try:
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        logger.info("AI GPU Worker is ONLINE and responding.")
                        return True
            except Exception:
                pass
            await asyncio.sleep(3.0)

        logger.warning("AI GPU Worker did not respond within %ds. Will proceed with fallback/local.", timeout_seconds)
        return False

    async def run_full_pipeline(self, report_type: ReportType = ReportType.MORNING) -> None:
        """Executes the complete autonomous pipeline from WoL to Telegram dispatch."""
        logger.info("==================================================")
        logger.info("  STARTING AUTONOMOUS PIPELINE: %s", report_type.value.upper())
        logger.info("==================================================")

        # 1. Wake up remote PC via Wake-on-LAN
        try:
            send_wake_on_lan()
            logger.info("Sent WoL magic packet to %s", settings.WOL_MAC_ADDRESS)
        except Exception as exc:
            logger.error("Failed to send WoL packet: %s", exc)

        # 2. Give the PC a few seconds to wake and check reachability
        await self.wait_for_gpu_node(timeout_seconds=25)

        async with async_session_maker() as session:
            # 3. Collection Phase (RSS + Telegram)
            ingestion = IngestionService(session=session)

            # RSS Sources
            rss_sources = [
                ("OpenNET Linux News", "https://www.opennet.ru/opennews/opennews_all.rss"),
                ("Hacker News Frontpage", "https://news.ycombinator.com/rss"),
            ]
            for name, feed_url in rss_sources:
                try:
                    collector = RSSCollector(source_name=name, source_url=feed_url)
                    await ingestion.run_collector(collector, source_type=SourceType.RSS)
                except Exception as exc:
                    logger.error("Error collecting RSS '%s': %s", name, exc)

            # Telegram Sources
            tg_channels = ["newcsgo", "habr_com"]
            for ch in tg_channels:
                try:
                    collector = TelegramCollector(channel_username=ch, limit=15)
                    await ingestion.run_collector(collector, source_type=SourceType.TELEGRAM)
                except Exception as exc:
                    logger.error("Error collecting Telegram channel @%s: %s", ch, exc)

            # 4. Cleaning & Deduplication Phase
            processing = ProcessingService(session=session)
            await processing.process_collected_articles()

            # 5. AI Summarization Phase (batch of top unsummarized articles)
            summarizer = SummarizerService(session=session)
            await summarizer.summarize_pending_articles(limit=10)

            # 6. Report Compilation Phase
            builder = ReportBuilderService(session=session)
            # Morning covers overnight (14h), Evening covers workday (12h)
            hours_back = 14 if report_type == ReportType.MORNING else 12
            report = await builder.build_digest(report_type=report_type, hours_back=hours_back)

            # 7. Dispatch to Telegram
            if report and self.bot and settings.TELEGRAM_ADMIN_CHAT_ID:
                logger.info("Dispatching compiled report ID %d to Telegram admin chat...", report.id)
                chunks = split_message(report.content_markdown)
                for chunk in chunks:
                    try:
                        await self.bot.send_message(
                            chat_id=settings.TELEGRAM_ADMIN_CHAT_ID,
                            text=chunk,
                            parse_mode="Markdown",
                            disable_web_page_preview=True
                        )
                    except Exception:
                        await self.bot.send_message(
                            chat_id=settings.TELEGRAM_ADMIN_CHAT_ID,
                            text=chunk,
                            disable_web_page_preview=True
                        )
                logger.info("Digest successfully delivered to Telegram.")
            elif not report:
                logger.info("No articles met threshold for scheduled digest. Nothing sent.")

        logger.info("Autonomous pipeline finished.")