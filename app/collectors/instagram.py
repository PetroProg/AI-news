import html
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
import httpx

from app.collectors.base import BaseCollector, CollectedItem
from app.processing.cleaner import ContentCleaner

logger = logging.getLogger("news_ai.collectors.instagram")


class InstagramCollector(BaseCollector):
    """Collector for public Instagram profiles via RSS-Bridge JSON Feed.
    
    Extracts post caption, downloads local high-res cover photos/thumbnails to /media,
    and constructs standardized CollectedItems for the autonomous pipeline.
    """

    def __init__(
        self,
        username: str,
        bridge_base_url: str = "http://rss-bridge",
        limit: int = 15,
        language: str = "fr",
    ) -> None:
        clean_user = username.lstrip("@").strip()
        super().__init__(
            source_name=f"Instagram: @{clean_user}",
            source_url=f"https://www.instagram.com/{clean_user}/",
        )
        self.username = clean_user
        self.bridge_base_url = bridge_base_url.rstrip("/")
        self.limit = limit
        self.language = language

    async def collect(self) -> List[CollectedItem]:
        """Fetch latest posts from RSS-Bridge, download images, and return CollectedItems."""
        logger.info("Fetching Instagram posts for '@%s' via RSS-Bridge...", self.username)
        feed_url = f"{self.bridge_base_url}/?action=display&bridge=Instagram&u={self.username}&media_type=all&format=Json"

        items_data = []
        # Try local docker bridge first, fallback to public bridge if local is temporarily down
        candidate_urls = [
            feed_url,
            f"http://127.0.0.1:3000/?action=display&bridge=Instagram&u={self.username}&media_type=all&format=Json",
            f"https://rss-bridge.org/bridge01/?action=display&bridge=Instagram&u={self.username}&media_type=all&format=Json"
        ]

        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            for url in candidate_urls:
                try:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        items_data = data.get("items", [])
                        if items_data:
                            logger.info("Successfully fetched %d items from %s", len(items_data), url)
                            break
                except Exception as req_err:
                    logger.debug("Bridge request to %s failed: %s", url, req_err)

        if not items_data:
            logger.warning("No items retrieved for Instagram profile '@%s'", self.username)
            return []

        media_dir = Path("/app/media")
        media_dir.mkdir(parents=True, exist_ok=True)

        collected_items: List[CollectedItem] = []

        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as dl_client:
            for item in items_data[:self.limit]:
                try:
                    post_url = item.get("url") or item.get("id") or ""
                    post_id_match = re.search(r"/p/([A-Za-z0-9_-]+)", post_url)
                    shortcode = post_id_match.group(1) if post_id_match else str(abs(hash(post_url)))

                    external_id = f"ig_{self.username}_{shortcode}"

                    raw_html = item.get("content_html") or ""
                    
                    # Extract clean caption text
                    clean_html = re.sub(r'&\s*#0*39\s*;', "'", raw_html)
                    clean_html = re.sub(r'&\s*#x0*27\s*;', "'", clean_html)
                    text_only = re.sub(r"<[^>]+>", " ", clean_html)
                    text_only = html.unescape(text_only)
                    text_only = re.sub(r"\s+", " ", text_only).strip()

                    if not text_only or len(text_only) < 10:
                        text_only = item.get("title") or f"Publication de @{self.username}"
                        text_only = html.unescape(text_only)

                    # Clean title: take first sentence or up to 140 chars
                    lines = [l.strip() for l in text_only.split("\n") if l.strip()]
                    first_line = lines[0] if lines else text_only
                    # Strip leading non-alphanumeric noise
                    title = ContentCleaner.clean_title(first_line)
                    title = html.unescape(title).strip()
                    if len(title) > 140:
                        title = title[:137] + "..."

                    # Published timestamp
                    pub_str = item.get("date_modified") or item.get("date_published")
                    if pub_str:
                        try:
                            pub_date = datetime.fromisoformat(pub_str.replace("Z", "+00:00"))
                        except Exception:
                            pub_date = datetime.now(timezone.utc)
                    else:
                        pub_date = datetime.now(timezone.utc)

                    # Extract and download media (photo / video poster)
                    img_match = re.search(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', raw_html)
                    img_url = img_match.group(1) if img_match else None
                    if not img_url:
                        poster_match = re.search(r'poster=["\'](https?://[^"\']+)["\']', raw_html)
                        if poster_match:
                            img_url = poster_match.group(1)

                    filename = f"ig_{self.username}_{shortcode}.jpg"
                    filepath = media_dir / filename
                    is_video = ("<video" in raw_html) or ("\u25b6" in (item.get("title") or ""))

                    # Try fetching high-resolution CDN og:image directly from Instagram via OpenGraph crawler
                    if not filepath.exists() or filepath.stat().st_size == 0:
                        direct_img_url = None
                        crawler_headers = {
                            "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        }
                        try:
                            og_resp = await dl_client.get(post_url, headers=crawler_headers, timeout=8.0)
                            if og_resp.status_code == 200:
                                m_og = re.search(r'<meta\s+(?:property|name)=["\']og:image["\']\s+content=["\']([^"\']+)["\']', og_resp.text, re.I)
                                if not m_og:
                                    m_og = re.search(r'content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:image["\']', og_resp.text, re.I)
                                if m_og:
                                    direct_img_url = html.unescape(m_og.group(1))
                        except Exception as og_err:
                            logger.debug("Failed to fetch og:image for %s: %s", post_url, og_err)

                        # Try downloading direct CDN image first, fallback to bridge img_url
                        candidate_dl_urls = [u for u in [direct_img_url, img_url] if u]
                        for c_url in candidate_dl_urls:
                            try:
                                img_resp = await dl_client.get(c_url, timeout=10.0)
                                if img_resp.status_code == 200 and len(img_resp.content) > 1000:
                                    filepath.write_bytes(img_resp.content)
                                    logger.info("Downloaded Instagram image -> %s (%d bytes)", filename, len(img_resp.content))
                                    break
                            except Exception as dl_e:
                                logger.debug("Could not download image %s: %s", c_url, dl_e)

                    raw_content = text_only
                    media_tags = []
                    if filepath.exists() and filepath.stat().st_size > 0:
                        if is_video:
                            media_tags.append(f'<video poster="/media/{filename}" controls preload="metadata"></video>')
                        media_tags.append(f'<img src="/media/{filename}" alt="{title}" />')

                    if media_tags:
                        raw_content = "\n".join(media_tags) + "\n" + raw_content

                    collected_items.append(
                        CollectedItem(
                            title=title,
                            raw_content=raw_content,
                            original_url=post_url,
                            external_id=external_id,
                            author=self.source_name,
                            published_at=pub_date,
                            language=self.language,
                        )
                    )
                except Exception as parse_err:
                    logger.warning("Error processing Instagram item for @%s: %s", self.username, parse_err)

        logger.info("Successfully collected %d posts for Instagram '@%s'", len(collected_items), self.username)
        return collected_items
