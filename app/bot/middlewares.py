import html
import logging
import time
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Any, Awaitable, Callable, Dict
from aiogram import BaseMiddleware, Bot
from aiogram.types import TelegramObject, Message, CallbackQuery

from app.config import settings

logger = logging.getLogger("news_ai.bot.access")

# Anti-flood tracker: user_id -> timestamp of last alert sent to admin
_unauthorized_alert_cooldowns: Dict[int, float] = {}
COOLDOWN_SECONDS: float = 60.0


class AdminAccessMiddleware(BaseMiddleware):
    """
    Middleware that restricts access exclusively to authorized users.
    Blocks any unauthorized message or callback query, replies with Access Denied,
    logs the event, and immediately alerts the admin in Telegram.
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
            now_ts = time.time()
            last_alert_ts = _unauthorized_alert_cooldowns.get(user.id, 0.0)
            should_notify_admin = (now_ts - last_alert_ts) > COOLDOWN_SECONDS

            # Determine action details
            if isinstance(event, Message):
                action_type = "Сообщение / Команда"
                raw_text = event.text or event.caption or "<медиа/стикер без текста>"
                action_content = html.escape(raw_text[:200])
            elif isinstance(event, CallbackQuery):
                action_type = "Кнопка (Callback)"
                action_content = html.escape(str(event.data)[:100] if event.data else "<нет данных>")
            else:
                action_type = "Другое действие"
                action_content = html.escape(str(type(event).__name__))

            logger.warning(
                "Access blocked for unauthorized user: id=%s, username=@%s, name='%s', action='%s: %s'",
                user.id,
                user.username or "none",
                user.full_name or "none",
                action_type,
                action_content,
            )

            # 1. Inform the unauthorized user that the bot is private
            try:
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
            except Exception as e:
                logger.error("Failed to respond to unauthorized user %s: %s", user.id, e)

            # 2. Alert the admin in Telegram
            admin_id = settings.TELEGRAM_ADMIN_CHAT_ID
            bot: Bot | None = data.get("bot") or getattr(event, "bot", None)

            if admin_id and bot and should_notify_admin:
                _unauthorized_alert_cooldowns[user.id] = now_ts
                now_str = datetime.now(ZoneInfo("Europe/Zurich")).strftime("%d.%m.%Y %H:%M:%S")
                username_str = f"@{html.escape(user.username)}" if user.username else "<i>нет</i>"
                user_name_escaped = html.escape(user.full_name or "N/A")

                alert_text = (
                    "🚨 <b>Попытка несанкционированного доступа к боту!</b>\n\n"
                    f"• <b>ID пользователя:</b> <code>{user.id}</code>\n"
                    f"• <b>Имя:</b> {user_name_escaped}\n"
                    f"• <b>Username:</b> {username_str}\n"
                    f"• <b>Действие:</b> {action_type}\n"
                    f"• <b>Содержимое:</b> <code>{action_content}</code>\n"
                    f"• <b>Время:</b> <code>{now_str}</code> (Zurich)\n\n"
                    "🛡 <i>Пользователю отказано в доступе. Никаких команд не выполнено.</i>"
                )
                try:
                    await bot.send_message(chat_id=admin_id, text=alert_text, parse_mode="HTML")
                except Exception as e:
                    logger.error("Failed to send unauthorized access alert to admin %s: %s", admin_id, e)

            return None

        return await handler(event, data)
