import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode

from app.config import settings
from app.bot.handlers import router

logger = logging.getLogger("news_ai.bot")

async def start_bot():
    """Initializes and runs the aiogram 3.x Telegram bot."""
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not configured in .env! Bot cannot start.")
        return

    bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)

    logger.info("Starting Telegram bot polling...")
    try:
        # Delete webhook if previously set and drop pending updates
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot)
    finally:
        await bot.session.close()
        logger.info("Telegram bot stopped.")

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    asyncio.run(start_bot())