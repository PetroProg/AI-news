import logging
from datetime import datetime, timezone
from typing import List, Optional
from telethon import TelegramClient
from telethon.tl.types import Channel

from app.collectors.base import BaseCollector, CollectedItem
from app.config import get_settings

logger = logging.getLogger("news_ai.collectors.telegram")
settings = get_settings()


class TelegramCollector(BaseCollector):
    """Collector for public Telegram channels using Telethon (MTProto)."""

    def __init__(
        self,
        channel_username: str,
        limit: int = 15,
        language: str = "ru",
    ) -> None:
        clean_channel = channel_username.lstrip("@").strip()
        super().__init__(
            source_name=f"Telegram: @{clean_channel}",
            source_url=f"https://t.me/{clean_channel}",
        )
        self.channel_username = clean_channel
        self.limit = limit
        self.language = language

        if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
            raise ValueError("TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in .env")

    async def collect(self) -> List[CollectedItem]:
        """Connect to Telegram, fetch recent messages from channel and return CollectedItems."""
        logger.info("Fetching messages from Telegram channel '@%s'...", self.channel_username)
        collected_items: List[CollectedItem] = []

        async with TelegramClient(
            settings.TELEGRAM_SESSION_NAME,
            settings.TELEGRAM_API_ID,
            settings.TELEGRAM_API_HASH,
        ) as client:
            try:
                entity = await client.get_entity(self.channel_username)
                
                async for message in client.iter_messages(entity, limit=self.limit):
                    text = message.text or message.message or ""
                    if not text or len(text.strip()) < 20:
                        continue

                    lines = [line.strip() for line in text.split("\n") if line.strip()]
                    title = lines[0] if lines else "Новость из Telegram"
                    if len(title) > 150:
                        title = title[:147] + "..."

                    msg_url = f"https://t.me/{self.channel_username}/{message.id}"
                    external_id = f"tg_{self.channel_username}_{message.id}"

                    pub_date = message.date.astimezone(timezone.utc) if message.date else datetime.now(timezone.utc)

                    author = self.source_name
                    if hasattr(entity, 'title'):
                        author = entity.title

                    collected_items.append(
                        CollectedItem(
                            title=title,
                            raw_content=text,
                            original_url=msg_url,
                            external_id=external_id,
                            author=author,
                            published_at=pub_date,
                            language=self.language,
                        )
                    )

                logger.info("Successfully collected %d posts from '@%s'", len(collected_items), self.channel_username)

            except Exception as e:
                logger.error("Failed to collect from Telegram channel '@%s': %s", self.channel_username, e)

        return collected_items