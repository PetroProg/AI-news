import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.types import BotCommand, BotCommandScopeDefault, BotCommandScopeChat

from app.config import settings
from app.bot.handlers import router
from app.bot.middlewares import AdminAccessMiddleware
from app.scheduler import setup_scheduler

logger = logging.getLogger("news_ai.bot")

async def start_bot():
    """Initializes and runs the Telegram bot along with the APScheduler."""
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not configured in .env! Bot cannot start.")
        return

    bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
    dp = Dispatcher()

    # Register access control outer middleware for all incoming messages and callbacks
    admin_middleware = AdminAccessMiddleware()
    dp.message.outer_middleware(admin_middleware)
    dp.callback_query.outer_middleware(admin_middleware)

    dp.include_router(router)

    # Register bot commands in English for the Telegram menu (restricted to admin scope)
    commands = [
        BotCommand(command="start", description="Show main menu & keyboard"),
        BotCommand(command="run_pipeline", description="Run full autonomous pipeline"),
        BotCommand(command="generate", description="Compile digest from recent articles (48h)"),
        BotCommand(command="digest", description="Show the latest compiled digest"),
        BotCommand(command="pc_status", description="Check Windows PC Online/Offline status"),
        BotCommand(command="wake_pc", description="Wake up Windows PC (Wake-on-LAN)"),
        BotCommand(command="sleep_pc", description="Put Windows PC to sleep"),
        BotCommand(command="status", description="Show server, DB & AI worker status"),
        BotCommand(command="containers", description="Show all homelab Docker containers status"),
    ]
    try:
        # Clear default/public command scope so unauthorized users see no command list
        await bot.delete_my_commands(scope=BotCommandScopeDefault())
        # Register commands exclusively for the allowed admin chat(s)
        for admin_id in settings.allowed_user_ids:
            try:
                await bot.set_my_commands(commands, scope=BotCommandScopeChat(chat_id=admin_id))
            except Exception as e:
                logger.warning("Failed to set scoped commands for chat_id %s: %s", admin_id, e)
        logger.info("Bot commands menu registered exclusively for admin user(s) %s.", settings.allowed_user_ids)
    except Exception as e:
        logger.warning("Failed to set bot commands: %s", e)

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