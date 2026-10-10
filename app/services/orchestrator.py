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
from app.collectors.instagram import InstagramCollector
from app.services.ingestion import IngestionService
from app.services.processing import ProcessingService
from app.services.summarizer import SummarizerService
from app.services.report import ReportBuilderService
from app.ai.client import OllamaClient
from app.bot.utils import send_wake_on_lan, send_remote_sleep, split_message

logger = logging.getLogger("news_ai.orchestrator")


class PipelineOrchestrator:
    """Orchestrates end-to-end autonomous news collection, AI analysis and dispatch."""

    def __init__(self, bot: Bot | None = None):
        self.bot = bot

    async def is_pc_already_online(self) -> bool:
        """Checks if the GPU node / Ollama or the Windows PC is already reachable before sending WoL."""
        url = f"{settings.OLLAMA_BASE_URL}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=2.5) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    return True
        except Exception:
            pass

        # Check if Windows PC SSH port 22 is open (PC is awake and reachable)
        try:
            _, writer = await asyncio.wait_for(
                asyncio.open_connection(settings.WINDOWS_SSH_HOST, 22),
                timeout=2.5,
            )
            writer.close()
            await writer.wait_closed()
            return True
        except Exception:
            return False

    async def wait_for_gpu_node(self, timeout_seconds: int = 90) -> bool:
        """Pings Ollama on remote PC. If not responding, triggers Ollama supervisor via SSH."""
        logger.info("Checking AI GPU worker availability at %s...", settings.OLLAMA_BASE_URL)
        url = f"{settings.OLLAMA_BASE_URL}/api/tags"

        start_time = asyncio.get_event_loop().time()
        ssh_attempted = False
        while (asyncio.get_event_loop().time() - start_time) < timeout_seconds:
            try:
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        logger.info("AI GPU Worker is ONLINE and responding.")
                        return True
            except Exception:
                pass

            # If Ollama is not up yet after first check, trigger start via SSH
            if not ssh_attempted:
                ssh_attempted = True
                try:
                    logger.info("Ollama HTTP not yet responding, triggering remote Ollama supervisor via SSH...")
                    import asyncssh
                    async with asyncssh.connect(
                        settings.WINDOWS_SSH_HOST,
                        username=settings.WINDOWS_SSH_USER,
                        client_keys=[settings.WINDOWS_SSH_KEY_PATH],
                        known_hosts=None,
                        connect_timeout=4.0,
                    ) as conn:
                        await conn.run(r'explorer.exe "C:\Users\Admin\AppData\Local\Programs\Ollama\run_ollama_hidden.vbs"')
                        logger.info("Remote Ollama supervisor triggered via SSH.")
                except Exception as exc:
                    logger.debug("Remote SSH trigger note: %s", exc)

            await asyncio.sleep(3.0)

        logger.warning("AI GPU Worker did not respond within %ds. Will proceed with fallback/local.", timeout_seconds)
        return False

    async def run_full_pipeline(self, report_type: ReportType = ReportType.MORNING) -> None:
        """Executes the complete autonomous pipeline from WoL to Telegram dispatch."""
        logger.info("==================================================")
        logger.info("  STARTING AUTONOMOUS PIPELINE: %s", report_type.value.upper())
        logger.info("==================================================")

        # 1. Check if the PC was already online before the pipeline
        # We record this state to determine if we should put it to sleep at the end.
        was_already_online = await self.is_pc_already_online()
        if was_already_online:
            logger.info("AI GPU Worker PC was ALREADY ONLINE before pipeline started. Will NOT put to sleep at the end.")
        else:
            logger.info("PC is offline. We will wake it up later just before AI Summarization.")

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
                ("ByteByteGo: System Design", "https://www.youtube.com/feeds/videos.xml?channel_id=UCZgt6AzoyjslHTC9dz0UoTw"),
                ("Fireship: Code & Tech", "https://www.youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA"),
                ("Украинская правда", "https://www.pravda.com.ua/rss/"),
                ("LIGA.net", "https://news.liga.net/ua/all/rss.xml"),
                ("Formula 1 Official RSS", "https://www.formula1.com/en/latest/all.xml"),
                ("Marca Football", "https://e00-marca.uecdn.es/rss/en/football.xml"),
                ("SkySports Football", "https://www.skysports.com/rss/12040"),
                ("Хабр: DevOps", "https://habr.com/ru/rss/hub/devops/all/?fl=ru"),
                ("Хабр: Linux", "https://habr.com/ru/rss/hub/linux/all/?fl=ru"),
                ("3DNews", "https://3dnews.ru/news/rss/"),
                ("iXBT", "https://www.ixbt.com/export/news.rss"),
                ("The Verge", "https://www.theverge.com/rss/index.xml"),
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
                "ai_newz",
                "devops_def",
                "newcsgo",
                "ClashRoyalePin",
                "NovynaUKR",
                "fabrizioromano_ru",
            ]
            for ch in tg_channels:
                try:
                    collector = TelegramCollector(channel_username=ch, limit=50)
                    await ingestion.run_collector(collector, source_type=SourceType.TELEGRAM)
                except Exception as exc:
                    logger.error("Error collecting Telegram channel @%s: %s", ch, exc)

            # Instagram Swiss Channels via RSS-Bridge
            ig_accounts = ["rtsinfo", "rtsarchives", "blick_media", "20minutesonline"]
            for acc in ig_accounts:
                try:
                    collector = InstagramCollector(username=acc, limit=15, language="fr")
                    await ingestion.run_collector(collector, source_type=SourceType.CUSTOM)
                except Exception as exc:
                    logger.error("Error collecting Instagram account @%s: %s", acc, exc)

            # 4. Cleaning & Deduplication Phase
            processing = ProcessingService(session=session)
            await processing.process_collected_articles()

            # 5. AI Summarization Phase (batch of top unsummarized articles)
            if not was_already_online:
                from datetime import datetime
                import asyncio
                now = datetime.now()
                
                if report_type == ReportType.MORNING and now.hour < 8:
                    wait_secs = (datetime(now.year, now.month, now.day, 8, 0, 0) - now).total_seconds()
                    if wait_secs > 0:
                        logger.info("Strict rule: It is before 08:00 AM. Waiting %d seconds before waking PC...", wait_secs)
                        await asyncio.sleep(wait_secs)
                        now = datetime.now()

                if report_type == ReportType.EVENING and now.hour >= 22:
                    logger.warning("Strict rule: It is 22:00 or later. Skipping PC wake to avoid night disturbance.")
                else:
                    try:
                        send_wake_on_lan()
                        logger.info("Sent WoL magic packet to wake GPU worker just in time for summarization!")
                        logger.info("Waiting 45 seconds for PC to boot up before verifying...")
                        await asyncio.sleep(45)
                    except Exception as exc:
                        logger.error("Failed to send WoL packet: %s", exc)

            gpu_timeout = 60 if was_already_online else 150
            logger.info("Verifying AI GPU worker reachability (timeout: %ds)...", gpu_timeout)
            gpu_online = await self.wait_for_gpu_node(timeout_seconds=gpu_timeout)

            if gpu_online:
                from app.bot.utils import check_gpu_load
                import asyncio
                
                for attempt in range(3):
                    gpu_load = await check_gpu_load()
                    if gpu_load is not None and gpu_load > 50:
                        logger.warning(f"GPU load is {gpu_load}% (>50%). User might be gaming. Delaying for 1 hour (Attempt {attempt+1}/3).")
                        if self.bot and settings.TELEGRAM_ADMIN_CHAT_ID:
                            try:
                                await self.bot.send_message(
                                    chat_id=settings.TELEGRAM_ADMIN_CHAT_ID,
                                    text=f"⚠️ *Видеокарта нагружена на {gpu_load}%*. Вероятно, вы играете.\nОткладываю суммаризацию на 1 час...",
                                    parse_mode="Markdown"
                                )
                            except Exception:
                                pass
                        await asyncio.sleep(3600)
                    else:
                        break
                        
                if self.bot and settings.TELEGRAM_ADMIN_CHAT_ID:
                    try:
                        await self.bot.send_message(
                            chat_id=settings.TELEGRAM_ADMIN_CHAT_ID,
                            text="🟢 *GPU-нода подключена и свободна!* Начинаю суммаризацию на RTX 3060...",
                            parse_mode="Markdown"
                        )
                    except Exception:
                        pass
                summarizer = SummarizerService(session=session)
                try:
                    await summarizer.summarize_pending_articles(limit=30)
                except Exception as sum_err:
                    logger.error("Error during GPU summarization: %s", sum_err, exc_info=True)
            else:
                logger.warning("AI GPU worker did not respond within %ds. Attempting fallback to local Ollama (qwen2.5:0.5b)...", gpu_timeout)
                # Try fallback to local Ollama on host
                local_available = False
                try:
                    async with httpx.AsyncClient(timeout=3.0) as client:
                        resp = await client.get("http://localhost:11434/api/tags")
                        local_available = (resp.status_code == 200)
                except Exception:
                    local_available = False

                if local_available:
                    logger.info("Local Ollama fallback is ONLINE. Summarizing with local model...")
                    local_ai = OllamaClient(base_url="http://localhost:11434", model="qwen2.5:0.5b", timeout=120.0)
                    summarizer = SummarizerService(session=session, ai_client=local_ai)
                    try:
                        await summarizer.summarize_pending_articles(limit=15)
                    except Exception as sum_err:
                        logger.error("Error during local summarizer fallback: %s", sum_err, exc_info=True)
                    if self.bot and settings.TELEGRAM_ADMIN_CHAT_ID:
                        try:
                            await self.bot.send_message(
                                chat_id=settings.TELEGRAM_ADMIN_CHAT_ID,
                                text=f"⚠️ *Предупреждение*: GPU-нода не ответила за {gpu_timeout} сек. Дайджест составлен на локальной резервной модели.",
                                parse_mode="Markdown"
                            )
                        except Exception:
                            pass
                else:
                    logger.warning("Local Ollama also unavailable. Skipping summarization for this run.")
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
            # Morning covers overnight (18h), Evening covers workday (14h)
            hours_back = 18 if report_type == ReportType.MORNING else 14
            report = await builder.build_digest(report_type=report_type, hours_back=hours_back)
            if not report:
                logger.info("No articles in %dh window, expanding search to 24h...", hours_back)
                report = await builder.build_digest(report_type=report_type, hours_back=24)

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
