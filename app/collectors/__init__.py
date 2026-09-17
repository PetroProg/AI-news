from app.collectors.base import BaseCollector, CollectedItem
from app.collectors.rss import RSSCollector
from app.collectors.telegram import TelegramCollector

__all__ = ["BaseCollector", "CollectedItem", "RSSCollector", "TelegramCollector"]  