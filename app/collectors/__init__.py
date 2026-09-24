from app.collectors.base import BaseCollector, CollectedItem
from app.collectors.rss import RSSCollector
from app.collectors.telegram import TelegramCollector
from app.collectors.instagram import InstagramCollector

__all__ = ["BaseCollector", "CollectedItem", "RSSCollector", "TelegramCollector", "InstagramCollector"]