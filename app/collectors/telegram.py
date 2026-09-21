import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional
from telethon import TelegramClient
from telethon.tl.types import Channel

from app.collectors.base import BaseCollector, CollectedItem
from app.processing.cleaner import ContentCleaner
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
                    raw_title = lines[0] if lines else "Новость из Telegram"
                    title = ContentCleaner.clean_title(raw_title)
                    if len(title) > 150:
                        title = title[:147] + "..."

                    msg_url = f"https://t.me/{self.channel_username}/{message.id}"
                    external_id = f"tg_{self.channel_username}_{message.id}"

                    pub_date = message.date.astimezone(timezone.utc) if message.date else datetime.now(timezone.utc)

                    author = self.source_name
                    if hasattr(entity, 'title'):
                        author = entity.title

                    raw_content = text
                    media_dir = Path("/app/media")
                    media_dir.mkdir(parents=True, exist_ok=True)

                    # Check and download video / animation if attached
                    is_video = bool(message.video) or (
                        bool(message.document) and getattr(message.document, 'mime_type', '').startswith('video/')
                    )
                    if is_video:
                        video_filename = f"tg_{self.channel_username}_{message.id}.mp4"
                        video_path = media_dir / video_filename
                        thumb_filename = f"tg_{self.channel_username}_{message.id}_thumb.jpg"
                        thumb_path = media_dir / thumb_filename
                        try:
                            # 1. Download video thumbnail
                            if not thumb_path.exists() or thumb_path.stat().st_size == 0:
                                await client.download_media(message, file=str(thumb_path), thumb=-1)

                            # 2. Download video file if reasonable size (<= 50 MB)
                            file_size = getattr(message.file, 'size', 0) if hasattr(message, 'file') and message.file else 0
                            if not file_size and hasattr(message, 'document') and message.document:
                                file_size = getattr(message.document, 'size', 0)

                            if file_size <= 100 * 1024 * 1024:  # Support up to 100 MB for 1080p highlights
                                if not video_path.exists() or video_path.stat().st_size == 0:
                                    await client.download_media(message, file=str(video_path))

                            has_video_file = video_path.exists() and video_path.stat().st_size > 0
                            has_thumb_file = thumb_path.exists() and thumb_path.stat().st_size > 0

                            video_tags = []
                            if has_video_file:
                                poster_attr = f' poster="/media/{thumb_filename}"' if has_thumb_file else ''
                                video_tags.append(f'<video src="/media/{video_filename}"{poster_attr} controls preload="metadata"></video>')
                            if has_thumb_file:
                                video_tags.append(f'<img src="/media/{thumb_filename}" alt="{title}" />')

                            if video_tags:
                                raw_content = "\n".join(video_tags) + "\n" + raw_content
                                logger.info("Downloaded video media for Telegram post %s -> video=%s, thumb=%s", external_id, has_video_file, has_thumb_file)
                        except Exception as dl_err:
                            logger.warning("Failed to download video media for post %s: %s", external_id, dl_err)

                    # Check and download photo if attached to message
                    elif message.photo:
                        photo_filename = f"tg_{self.channel_username}_{message.id}.jpg"
                        photo_path = media_dir / photo_filename
                        try:
                            if not photo_path.exists() or photo_path.stat().st_size == 0:
                                await client.download_media(message, file=str(photo_path))
                            if photo_path.exists() and photo_path.stat().st_size > 0:
                                raw_content = f'<img src="/media/{photo_filename}" alt="{title}" />\n' + raw_content
                                logger.info("Downloaded photo for Telegram post %s -> %s", external_id, photo_filename)
                        except Exception as dl_err:
                            logger.warning("Failed to download photo for post %s: %s", external_id, dl_err)

                    collected_items.append(
                        CollectedItem(
                            title=title,
                            raw_content=raw_content,
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