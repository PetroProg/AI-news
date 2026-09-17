import logging
from zoneinfo import ZoneInfo
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from aiogram import Bot

from app.database.models import ReportType
from app.services.orchestrator import PipelineOrchestrator

logger = logging.getLogger("news_ai.scheduler")


def setup_scheduler(bot: Bot) -> AsyncIOScheduler:
    """Configures scheduled morning and evening autonomous pipeline execution."""
    scheduler = AsyncIOScheduler(timezone=ZoneInfo("Europe/Zurich"))
    orchestrator = PipelineOrchestrator(bot=bot)

    scheduler.add_job(
        orchestrator.run_full_pipeline,
        trigger=CronTrigger(hour=7, minute=45, timezone=ZoneInfo("Europe/Zurich")),
        kwargs={"report_type": ReportType.MORNING},
        id="morning_digest_pipeline",
        name="Morning Digest Pipeline",
        replace_existing=True,
    )

    scheduler.add_job(
        orchestrator.run_full_pipeline,
        trigger=CronTrigger(hour=19, minute=45, timezone=ZoneInfo("Europe/Zurich")),
        kwargs={"report_type": ReportType.EVENING},
        id="evening_digest_pipeline",
        name="Evening Digest Pipeline",
        replace_existing=True,
    )

    logger.info("Scheduler configured: Morning at 07:45, Evening at 19:45 (Europe/Zurich).")
    return scheduler