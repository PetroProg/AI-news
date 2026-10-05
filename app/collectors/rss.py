import asyncio
import calendar
import logging
from datetime import datetime, timezone
from typing import List, Optional
import feedparser
import httpx

from app.collectors.base import BaseCollector, CollectedItem

logger = logging.getLogger("news_ai.collectors.rss")


class RSSCollector(BaseCollector):
    """Collector for RSS, Atom, and RDF feeds using httpx and feedparser."""

    DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (PersonalNewsAI/0.1)"
    DEFAULT_TIMEOUT_SECONDS = 15.0

    def __init__(
        self,
        source_name: str,
        source_url: str,
        language: str = "en",
        timeout: float = DEFAULT_TIMEOUT_SECONDS,
    ) -> None:
        super().__init__(source_name=source_name, source_url=source_url)
        self.language = language
        self.timeout = timeout

    async def collect(self) -> List[CollectedItem]:
        """Fetch feed XML asynchronously, parse entries and enrich missing lead images from article pages."""
        logger.info("Fetching RSS feed for '%s' from %s", self.source_name, self.source_url)
        
        raw_bytes = await self._fetch_feed_bytes()
        if not raw_bytes:
            logger.warning("Empty response or fetch failed for source '%s'", self.source_name)
            return []

        items = self._parse_feed(raw_bytes)
        await self._enrich_missing_images(items)
        return items

    async def _fetch_feed_bytes(self) -> Optional[bytes]:
        """Download raw feed bytes using httpx with timeout and custom headers."""
        headers = {"User-Agent": self.DEFAULT_USER_AGENT}
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(self.source_url, headers=headers)
                response.raise_for_status()
                return response.content
        except httpx.TimeoutException:
            logger.error("Timeout (%ss) while fetching RSS feed: %s", self.timeout, self.source_url)
        except httpx.HTTPStatusError as e:
            logger.error("HTTP error %s while fetching RSS feed: %s", e.response.status_code, self.source_url)
        except Exception as e:
            logger.error("Unexpected error fetching RSS feed '%s': %s", self.source_url, e)
        return None

    def _parse_feed(self, raw_bytes: bytes) -> List[CollectedItem]:
        """Parse raw XML bytes using feedparser (handles KOI8-R, CP1251, UTF-8 automatically)."""
        parsed_feed = feedparser.parse(raw_bytes)

        if parsed_feed.bozo and not parsed_feed.entries:
            logger.error("Malformed XML in feed '%s': %s", self.source_name, parsed_feed.bozo_exception)
            return []

        items: List[CollectedItem] = []

        for entry in parsed_feed.entries:
            item = self._convert_entry(entry)
            if item:
                items.append(item)

        logger.info("Successfully parsed %d items from '%s'", len(items), self.source_name)
        return items

    async def _enrich_missing_images(self, items: List[CollectedItem]) -> None:
        """Fetch article webpage and extract og:image if not present in RSS feed."""
        unimaged = [
            it for it in items
            if it.original_url and it.original_url.startswith("http") and ("<img" not in (it.raw_content or ""))
        ]
        if not unimaged:
            return

        sem = asyncio.Semaphore(6)
        async with httpx.AsyncClient(timeout=7.0, follow_redirects=True) as client:
            async def _enrich_one(it: CollectedItem):
                async with sem:
                    try:
                        from app.services.image_scraper import fetch_article_image
                        img = await fetch_article_image(it.original_url, client=client, timeout=6.0)
                        if img:
                            it.raw_content = f'<img src="{img}" /><br>' + (it.raw_content or "")
                            logger.debug("Enriched article '%s' with og:image %s", it.title[:30], img)
                    except Exception as err:
                        logger.debug("Failed enriching image for %s: %s", it.original_url, err)

            await asyncio.gather(*[_enrich_one(it) for it in unimaged], return_exceptions=True)

    def _convert_entry(self, entry: feedparser.FeedParserDict) -> Optional[CollectedItem]:
        """Convert a single feed entry dictionary into a validated CollectedItem."""
        title = entry.get("title", "").strip()
        if not title:
            return None 

        raw_content = ""
        if "content" in entry and entry.content:
            raw_content = entry.content[0].get("value", "")
        elif "summary" in entry:
            raw_content = entry.get("summary", "")
        elif "description" in entry:
            raw_content = entry.get("description", "")

        # Extract YouTube/media thumbnails or standard enclosures if present
        thumbnail_url = None
        if "media_thumbnail" in entry and entry.media_thumbnail:
            thumbnail_url = entry.media_thumbnail[0].get("url")
        elif "media_content" in entry and entry.media_content:
            thumbnail_url = entry.media_content[0].get("url")
        elif "enclosures" in entry and entry.enclosures:
            for enc in entry.enclosures:
                if enc.get("type", "").startswith("image/") and enc.get("href"):
                    thumbnail_url = enc.get("href")
                    break
        elif "links" in entry and entry.links:
            for lk in entry.links:
                if lk.get("type", "").startswith("image/") and lk.get("href"):
                    thumbnail_url = lk.get("href")
                    break

        if thumbnail_url and "<img" not in raw_content:
            raw_content = f'<img src="{thumbnail_url}" /><br>' + raw_content

        original_url = entry.get("link", None)
        external_id = entry.get("id") or original_url or title

        author = entry.get("author", None)

        published_at = self._extract_published_date(entry)

        return CollectedItem(
            title=title,
            raw_content=raw_content or title,
            original_url=original_url,
            external_id=external_id,
            author=author,
            published_at=published_at,
            language=self.language,
        )

    def _extract_published_date(self, entry: feedparser.FeedParserDict) -> datetime:
        """Extract and convert publication date to timezone-aware UTC datetime."""
        time_struct = entry.get("published_parsed") or entry.get("updated_parsed")
        if time_struct:
            try:
                timestamp = calendar.timegm(time_struct)
                return datetime.fromtimestamp(timestamp, tz=timezone.utc)
            except Exception:
                pass

        return datetime.now(timezone.utc)
