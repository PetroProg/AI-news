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
from app.bot.keyboards import get_main_keyboard
from app.bot.utils import send_wake_on_lan, send_remote_sleep, split_message

logger = logging.getLogger("news_ai.bot.handlers")
router = Router(name="main_handlers")


@router.message(CommandStart())
async def cmd_start(message: Message):
    """Handles the /start command, registers user/shows main menu."""
    welcome_text = (
        "👋 **Привет! Я твой персональный AI-агрегатор новостей.**\n\n"
        "Я собираю важные статьи и посты из RSS-лент и Telegram-каналов, "
        "фильтрую дубликаты и с помощью локальной нейросети (Llama-3/Mistral) "
        "готовлю ёмкие и структурированные выжимки.\n\n"
        "Используй кнопки меню ниже для управления."
    )
    await message.answer(welcome_text, parse_mode="Markdown", reply_markup=get_main_keyboard())


@router.message(Command("digest"))
@router.message(F.text == "📰 Свежий дайджест")
async def cmd_latest_digest(message: Message):
    """Fetches and displays the most recent compiled digest from the database."""
    await message.answer("🔍 Ищу последний готовый дайджест...")

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
            "📭 В базе пока нет сохраненных дайджестов.\n"
            "Нажми **⚡ Сгенерировать сейчас**, чтобы составить первый отчёт!",
            parse_mode="Markdown"
        )
        return

    chunks = split_message(latest_report.content_markdown)
    for chunk in chunks:
        try:
            await message.answer(chunk, parse_mode="Markdown", disable_web_page_preview=True)
        except Exception:
            await message.answer(chunk, disable_web_page_preview=True)


@router.message(Command("generate"))
@router.message(F.text.in_(["⚡ Сгенерировать", "⚡ Сгенерировать сейчас"]))
async def cmd_generate_digest(message: Message):
    """Triggers on-demand digest generation and returns the compiled result."""
    status_msg = await message.answer("⏳ Анализирую статьи за последние 48 часов и формирую дайджест...")

    try:
        async with async_session_maker() as session:
            builder = ReportBuilderService(session=session)
            report = await builder.build_digest(report_type=ReportType.CUSTOM, hours_back=48)

        if not report:
            await status_msg.edit_text("📭 Нет новых проанализированных статей с высокой важностью для отчета.")
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
        await status_msg.edit_text(f"❌ Ошибка генерации дайджеста: `{exc}`", parse_mode="Markdown")


@router.message(Command("status"))
@router.message(F.text == "🖥 Статус сервера")
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
    ollama_status = "🔴 Недоступен"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                ollama_status = f"🟢 Онлайн ({settings.OLLAMA_MODEL})"
    except Exception:
        ollama_status = "🔴 Офлайн (ПК выключен или спит)"

    text = (
        f"🖥 **Статус системы News AI**\n\n"
        f"🕒 **Время сервера:** `{now_local}` (Zurich)\n"
        f"🤖 **AI Worker (Ollama):** {ollama_status}\n"
        f"🌐 **Адрес нейросети:** `{settings.OLLAMA_BASE_URL}`\n\n"
        f"📊 **Статистика базы данных:**\n"
        f" • Всего статей: **{total_articles}**\n"
        f" • Обработано AI: **{summarized}**\n"
        f" • Добавлено в отчёты: **{reported}**\n"
        f" • Всего дайджестов в БД: **{total_reports}**\n"
    )
    await message.answer(text, parse_mode="Markdown")


@router.message(Command("wake_pc"))
@router.message(F.text.in_(["🔌 Разбудить ПК", "🔌 Разбудить ПК (WoL)"]))
async def cmd_wake_pc(message: Message):
    """Sends a Wake-on-LAN magic packet to wake up the RTX 3060 PC."""
    try:
        send_wake_on_lan()
        await message.answer(
            f"⚡ **Magic Packet отправлен!**\n\n"
            f"• **MAC:** `{settings.WOL_MAC_ADDRESS}`\n"
            f"• **Broadcast:** `{settings.WOL_BROADCAST_IP}`\n\n"
            f"ПК с RTX 3060 должен проснуться в течение 10-15 секунд. "
            f"Проверить доступность можно через кнопку **🖥 Статус сервера**.",
            parse_mode="Markdown"
        )
    except Exception as exc:
        logger.error(f"Failed to send WoL packet: {exc}", exc_info=True)
        await message.answer(f"❌ Ошибка отправки Wake-on-LAN: `{exc}`", parse_mode="Markdown")

from app.services.orchestrator import PipelineOrchestrator

@router.message(Command("run_pipeline"))
@router.message(F.text.in_(["🚀 Полный запуск", "🚀 Запустить полный пайплайн"]))
async def cmd_run_pipeline(message: Message, bot: Bot):
    """Executes the complete autonomous pipeline on demand and reports progress."""
    status_msg = await message.answer(
        "🚀 **Запуск полного автономного пайплайна!**\n\n"
        "1. Отправляю WoL на ПК с RTX 3060...\n"
        "2. Сбор RSS и Telegram...\n"
        "3. Очистка и дедупликация...\n"
        "4. AI-суммаризация...\n"
        "5. Формирование и отправка дайджеста.\n\n"
        "⏳ Подожди около 30–60 секунд...",
        parse_mode="Markdown"
    )

    try:
        orchestrator = PipelineOrchestrator(bot=bot)
        await orchestrator.run_full_pipeline(report_type=ReportType.CUSTOM)
        await status_msg.edit_text("✅ **Автономный пайплайн успешно завершен!**", parse_mode="Markdown")
    except Exception as exc:
        logger.error("Manual pipeline run failed: %s", exc, exc_info=True)
        await status_msg.edit_text(f"❌ Ошибка выполнения пайплайна: `{exc}`", parse_mode="Markdown")


@router.message(Command("sleep_pc"))
@router.message(F.text.in_(["💤 Усыпить ПК", "💤 Спать ПК"]))
async def cmd_sleep_pc(message: Message):
    """Sends a remote sleep command via SSH to suspend the workstation."""
    status_msg = await message.answer("⏳ Отправляю сигнал перехода в спящий режим на ПК...")
    success = await send_remote_sleep(force=True)
    if success:
        await status_msg.edit_text("💤 *Компьютер переведён в спящий режим.*", parse_mode="Markdown")
    else:
        await status_msg.edit_text("⚠️ Не удалось отправить команду сна. Проверьте соединение через Tailscale.")
