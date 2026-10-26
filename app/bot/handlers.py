from datetime import datetime
from zoneinfo import ZoneInfo
import logging
import httpx
from aiogram import Router, F, Bot
from aiogram.filters import CommandStart, Command
from aiogram.types import Message
from sqlalchemy import select, func

from app.config import settings
from app.database.session import async_session_maker
from app.database.models import Article, ArticleStatus, Report, ReportType
from app.services.report import ReportBuilderService
from app.services.orchestrator import PipelineOrchestrator
from app.bot.keyboards import get_main_keyboard
from app.bot.utils import send_wake_on_lan, send_remote_sleep, split_message

logger = logging.getLogger("news_ai.bot.handlers")
router = Router(name="main_handlers")


@router.message(CommandStart())
async def cmd_start(message: Message):
    """Handles the /start command, registers user/shows main menu."""
    welcome_text = (
        "👋 **Hello! I am your personal AI News Aggregator.**\n\n"
        "I collect important articles and posts from RSS feeds and Telegram channels, "
        "filter duplicates, and produce concise, structured summaries using a local neural network.\n\n"
        "Use the menu buttons below to manage the system."
    )
    await message.answer(welcome_text, parse_mode="Markdown", reply_markup=get_main_keyboard())


@router.message(Command("digest"))
@router.message(F.text.in_(["📰 Latest Digest", "📰 Свежий дайджест", "📰 Digest"]))
async def cmd_latest_digest(message: Message):
    """Fetches and displays the most recent compiled digest from the database."""
    await message.answer("🔍 Searching for the latest compiled digest...", reply_markup=get_main_keyboard())

    async with async_session_maker() as session:
        query = (
            select(Report)
            .order_by(Report.created_at.desc())
            .limit(1)
        )
        result = await session.execute(query)
        latest_report = result.scalar_one_or_none()

    if not latest_report:
        await message.answer(
            "📭 No saved digests found in the database yet.\n"
            "Tap **⚡ Generate Digest** to build your first report!",
            parse_mode="Markdown",
            reply_markup=get_main_keyboard()
        )
        return

    chunks = split_message(latest_report.content_markdown)
    for chunk in chunks:
        try:
            await message.answer(chunk, parse_mode="Markdown", disable_web_page_preview=True)
        except Exception:
            await message.answer(chunk, disable_web_page_preview=True)


@router.message(Command("generate"))
@router.message(F.text.in_(["⚡ Generate Digest", "⚡ Generate Now", "⚡ Сгенерировать", "⚡ Сгенерировать сейчас"]))
async def cmd_generate_digest(message: Message):
    """Triggers on-demand digest generation and returns the compiled result."""
    status_msg = await message.answer(
        "⏳ Analyzing articles from the last 48 hours and compiling digest...",
        reply_markup=get_main_keyboard()
    )

    try:
        async with async_session_maker() as session:
            builder = ReportBuilderService(session=session)
            report = await builder.build_digest(report_type=ReportType.CUSTOM, hours_back=48)

        if not report:
            await status_msg.edit_text("📭 No new high-importance analyzed articles found for the report.")
            return

        await status_msg.delete()

        chunks = split_message(report.content_markdown)
        for chunk in chunks:
            try:
                await message.answer(chunk, parse_mode="Markdown", disable_web_page_preview=True)
            except Exception:
                await message.answer(chunk, disable_web_page_preview=True)

    except Exception as exc:
        logger.error(f"Error generating digest on demand: {exc}", exc_info=True)
        await status_msg.edit_text(f"❌ Error generating digest: `{exc}`", parse_mode="Markdown")


@router.message(Command("status"))
@router.message(F.text.in_(["🖥 Server Status", "🖥 Статус сервера", "🖥 Status"]))
async def cmd_status(message: Message):
    """Reports system health: database stats and Ollama GPU worker status."""
    now_local = datetime.now(ZoneInfo("Europe/Zurich")).strftime("%d.%m.%Y %H:%M:%S")

    # 1. Database statistics
    async with async_session_maker() as session:
        total_articles = await session.scalar(select(func.count(Article.id))) or 0
        summarized = await session.scalar(
            select(func.count(Article.id)).where(Article.status.in_([ArticleStatus.SUMMARIZED, ArticleStatus.REPORTED]))
        ) or 0
        reported = await session.scalar(
            select(func.count(Article.id)).where(Article.status == ArticleStatus.REPORTED)
        ) or 0
        total_reports = await session.scalar(select(func.count(Report.id))) or 0

    # 2. Check Ollama reachability (GPU worker / local)
    ollama_status = "🔴 Unavailable"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                ollama_status = f"🟢 Online ({settings.OLLAMA_MODEL})"
    except Exception:
        ollama_status = "🔴 Offline (PC is powered off or sleeping)"

    text = (
        f"🖥 **News AI System Status**\n\n"
        f"🕒 **Server Time:** `{now_local}` (Zurich)\n"
        f"🤖 **AI Worker (Ollama):** {ollama_status}\n"
        f"🌐 **Neural Network Endpoint:** `{settings.OLLAMA_BASE_URL}`\n\n"
        f"📊 **Database Statistics:**\n"
        f" • Total articles: **{total_articles}**\n"
        f" • Processed by AI: **{summarized}**\n"
        f" • Included in reports: **{reported}**\n"
        f" • Total digests in DB: **{total_reports}**\n"
    )
    await message.answer(text, parse_mode="Markdown", reply_markup=get_main_keyboard())


@router.message(Command("wake_pc"))
@router.message(F.text.in_(["🔌 Wake PC", "🔌 Wake PC (WoL)", "🔌 Разбудить ПК", "🔌 Разбудить ПК (WoL)"]))
async def cmd_wake_pc(message: Message):
    """Sends a Wake-on-LAN magic packet to wake up the RTX 3060 PC."""
    try:
        send_wake_on_lan()
        await message.answer(
            f"⚡ **Magic Packet Sent!**\n\n"
            f"• **MAC:** `{settings.WOL_MAC_ADDRESS}`\n"
            f"• **Broadcast:** `{settings.WOL_BROADCAST_IP}`\n\n"
            f"The RTX 3060 PC should wake up within 10–15 seconds. "
            f"You can verify its availability with the **🖥 Server Status** button.",
            parse_mode="Markdown",
            reply_markup=get_main_keyboard()
        )
    except Exception as exc:
        logger.error(f"Failed to send WoL packet: {exc}", exc_info=True)
        await message.answer(
            f"❌ Failed to send Wake-on-LAN: `{exc}`",
            parse_mode="Markdown",
            reply_markup=get_main_keyboard()
        )


@router.message(Command("run_pipeline"))
@router.message(F.text.in_(["🚀 Run Full Pipeline", "🚀 Full Run", "🚀 Полный запуск", "🚀 Запустить полный пайплайн"]))
async def cmd_run_pipeline(message: Message, bot: Bot):
    """Executes the complete autonomous pipeline on demand and reports progress."""
    status_msg = await message.answer(
        "🚀 **Starting Full Autonomous Pipeline!**\n\n"
        "1. Sending WoL to RTX 3060 PC...\n"
        "2. Collecting RSS and Telegram feeds...\n"
        "3. Cleaning and deduplicating articles...\n"
        "4. AI summarization...\n"
        "5. Building and delivering digest.\n\n"
        "⏳ Please wait about 30–60 seconds...",
        parse_mode="Markdown",
        reply_markup=get_main_keyboard()
    )

    try:
        orchestrator = PipelineOrchestrator(bot=bot)
        await orchestrator.run_full_pipeline(report_type=ReportType.CUSTOM)
        await status_msg.edit_text("✅ **Autonomous pipeline completed successfully!**", parse_mode="Markdown")
    except Exception as exc:
        logger.error("Manual pipeline run failed: %s", exc, exc_info=True)
        await status_msg.edit_text(f"❌ Pipeline execution error: `{exc}`", parse_mode="Markdown")


@router.message(Command("sleep_pc"))
@router.message(F.text.in_(["💤 Sleep PC", "💤 Усыпить ПК", "💤 Спать ПК"]))
async def cmd_sleep_pc(message: Message):
    """Sends a remote sleep command via SSH to suspend the workstation."""
    status_msg = await message.answer("⏳ Sending sleep signal to PC...", reply_markup=get_main_keyboard())
    success = await send_remote_sleep(force=True)
    if success:
        await status_msg.edit_text("💤 *Computer has been put into sleep mode.*", parse_mode="Markdown")
    else:
        await status_msg.edit_text(
            "⚠️ Failed to send sleep command. Check Tailscale connection.",
            parse_mode="Markdown"
        )
