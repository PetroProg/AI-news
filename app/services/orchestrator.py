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
from app.bot.utils import send_wake_on_lan, send_remote_sleep, split_message

logger = logging.getLogger("news_ai.orchestrator")


class PipelineOrchestrator:
    """Orchestrates end-to-end autonomous news collection, AI analysis and dispatch."""

    def __init__(self, bot: Bot | None = None):
        self.bot = bot

    async def is_pc_already_online(self) -> bool:
        """Checks if the GPU node / Ollama is already reachable before sending WoL."""
        url = f"{settings.OLLAMA_BASE_URL}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=2.5) as client:
                resp = await client.get(url)
                return resp.status_code == 200
        except Exception:
            return False

    async def wait_for_gpu_node(self, timeout_seconds: int = 90) -> bool:
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

        # 1. Check if the PC was already online before sending Wake-on-LAN
        was_already_online = await self.is_pc_already_online()
        if was_already_online:
            logger.info("AI GPU Worker PC was ALREADY ONLINE before pipeline started. Will NOT put to sleep at the end.")
        else:
            try:
                send_wake_on_lan()
                logger.info("Sent WoL magic packet to %s (booting in parallel with collection)", settings.WOL_MAC_ADDRESS)
            except Exception as exc:
                logger.error("Failed to send WoL packet: %s", exc)

        async with async_session_maker() as session:
            # 3. Collection Phase (RSS + Telegram)
            ingestion = IngestionService(session=session)

            # Curated Developer & Programming Language Sources
            rss_sources = [
                ("Хабр: Разработка", "https://habr.com/ru/rss/hub/programming/all/?fl=ru"),
                ("Хабр: Python", "https://habr.com/ru/rss/hub/python/all/?fl=ru"),
                ("Хабр: Rust", "https://habr.com/ru/rss/hub/rust/all/?fl=ru"),
                ("Хабр: Golang", "https://habr.com/ru/rss/hub/go/all/?fl=ru"),
                ("Хабр: C++", "https://habr.com/ru/rss/hub/cpp/all/?fl=ru"),
                ("Tproger: Главное", "https://tproger.ru/feed/"),
                ("Python Software Foundation", "https://blog.python.org/feeds/posts/default"),
                ("The Go Blog", "https://go.dev/blog/feed.atom"),
                ("Official Rust Blog", "https://blog.rust-lang.org/feed.xml"),
                ("OpenNET Linux News", "https://www.opennet.ru/opennews/opennews_all.rss"),
            ]
            for name, feed_url in rss_sources:
                try:
                    collector = RSSCollector(source_name=name, source_url=feed_url)
                    await ingestion.run_collector(collector, source_type=SourceType.RSS)
                except Exception as exc:
                    logger.error("Error collecting RSS '%s': %s", name, exc)

            # Telegram Developer & Tech Channels
            tg_channels = [
                "tproger_official",
                "proglib",
                "zen_of_python",
                "golang_tg",
                "rust_tg",
                "habr_com",
                "newcsgo",
                "cs3news",
                "ClashRoyalePin",
                "NovynaUKR"
            ]
            for ch in tg_channels:
                try:
                    collector = TelegramCollector(channel_username=ch, limit=50)
                    await ingestion.run_collector(collector, source_type=SourceType.TELEGRAM)
                except Exception as exc:
                    logger.error("Error collecting Telegram channel @%s: %s", ch, exc)

            # 4. Cleaning & Deduplication Phase
            processing = ProcessingService(session=session)
            await processing.process_collected_articles()

            # 5. AI Summarization Phase (batch of top unsummarized articles)
            gpu_timeout = 15 if was_already_online else 150
            logger.info("Verifying AI GPU worker reachability (timeout: %ds)...", gpu_timeout)
            gpu_online = await self.wait_for_gpu_node(timeout_seconds=gpu_timeout)

            if gpu_online:
                summarizer = SummarizerService(session=session)
                await summarizer.summarize_pending_articles(limit=30)
            else:
                logger.warning("AI GPU worker did not respond within %ds. Skipping summarization for this run.", gpu_timeout)
                if self.bot and settings.TELEGRAM_ADMIN_CHAT_ID:
                    try:
                        await self.bot.send_message(
                            chat_id=settings.TELEGRAM_ADMIN_CHAT_ID,
                            text=f"⚠️ *Предупреждение*: GPU-нода Ollama не ответила за {gpu_timeout} сек. Саммаризация пропущена.",
                            parse_mode="Markdown"
                        )
                    except Exception:
                        pass

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

        # 8. Put GPU worker PC back to sleep (with Smart Sleep Guard)
        if was_already_online:
            logger.info("Skipping sleep: PC was already online before pipeline started (user was already at computer).")
        else:
            try:
                logger.info("Putting AI GPU worker back to sleep (checking user activity first)...")
                slept = await send_remote_sleep(force=False, max_idle_minutes=10)
                if not slept:
                    logger.info("PC sleep was cancelled due to detected user activity.")
                    if self.bot and settings.TELEGRAM_ADMIN_CHAT_ID:
                        try:
                            await self.bot.send_message(
                                chat_id=settings.TELEGRAM_ADMIN_CHAT_ID,
                                text="ℹ️ *Компьютер оставлен включённым*: обнаружена активность пользователя (мышь/клавиатура).",
                                parse_mode="Markdown"
                            )
                        except Exception:
                            pass
                else:
                    logger.info("GPU worker PC successfully put to sleep.")
            except Exception as exc:
                logger.error("Failed to put GPU PC to sleep: %s", exc)

        logger.info("Autonomous pipeline finished.")
