import logging
from typing import Any, Awaitable, Callable, Dict
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, Message, CallbackQuery

from app.config import settings

logger = logging.getLogger("news_ai.bot.access")


class AdminAccessMiddleware(BaseMiddleware):
    """
    Middleware that restricts access exclusively to authorized users.
    Blocks any unauthorized message or callback query and alerts the log.
    """

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        user = data.get("event_from_user")
        if not user:
            # Drop updates without user info
            return None

        allowed = settings.allowed_user_ids
        if user.id not in allowed:
            logger.warning(
                "Access blocked for unauthorized user: id=%s, username=@%s, name='%s'",
                user.id,
                user.username or "none",
                user.full_name or "none",
            )
            if isinstance(event, Message):
                await event.answer(
                    "⛔ <b>Доступ ограничен</b>\n\n"
                    "Этот бот является приватным и доступен только авторизованному администратору.",
                    parse_mode="HTML"
                )
            elif isinstance(event, CallbackQuery):
                await event.answer(
                    "⛔ Доступ ограничен. Приватный бот.",
                    show_alert=True
                )
            return None

        return await handler(event, data)
