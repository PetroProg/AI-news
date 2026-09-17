import asyncio
import logging
from aiogram import Bot, Dispatcher

from app.config import settings
from app.bot.handlers import router
from app.scheduler import setup_scheduler

logger = logging.getLogger("news_ai.bot")

async def start_bot():
    """Initializes and runs the Telegram bot along with the APScheduler."""
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not configured in .env! Bot cannot start.")
        return

    bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)

    # Запуск планировщика расписания (07:45 и 19:45)
    scheduler = setup_scheduler(bot=bot)
    scheduler.start()

    logger.info("Starting Telegram bot polling and APScheduler...")
    try:
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot)
    finally:
        scheduler.shutdown(wait=False)
        await bot.session.close()
        logger.info("Telegram bot and scheduler stopped.")

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    asyncio.run(start_bot())