import html
import logging
import re
from typing import Optional
from urllib.parse import urljoin
import httpx

logger = logging.getLogger("news_ai.services.image_scraper")

DEFAULT_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,image/apng,*/*;q=0.8"
    ),
    "Accept-Language": "uk-UA,uk;q=0.9,ru;q=0.8,en-US;q=0.7,en;q=0.6",
    "Referer": "https://www.google.com/",
}

DISALLOWED_IMAGE_SUBSTRINGS = [
    "favicon",
    "1x1",
    "spacer.gif",
    "pixel.gif",
    "tracking",
    "blank.gif",
    "default_avatar",
    "no-photo",
    "placeholder",
]


async def fetch_article_image(url: str, client: Optional[httpx.AsyncClient] = None, timeout: float = 6.0) -> Optional[str]:
    """Fetch article webpage and extract the primary lead image from OpenGraph, Twitter Cards, or schema markup."""
    if not url or not url.startswith("http"):
        return None

    # Skip telegram links (they have no open web HTML with meta tags)
    if "t.me/" in url:
        return None

    close_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=timeout, follow_redirects=True)
        close_client = True

    try:
        resp = await client.get(url, headers=DEFAULT_BROWSER_HEADERS, timeout=timeout, follow_redirects=True)
        if resp.status_code != 200:
            return None

        content = resp.text
        if not content:
            return None

        # 1. OpenGraph & Twitter Card image
        m = re.search(
            r'<meta[^>]+(?:property|name)=["\'](?:og:image|twitter:image|image)["\'][^>]+content=["\']([^"\']+)["\']',
            content,
            re.IGNORECASE,
        )
        if not m:
            m = re.search(
                r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\'](?:og:image|twitter:image|image)["\']',
                content,
                re.IGNORECASE,
            )
        if not m:
            m = re.search(
                r'<link[^>]+rel=["\'](?:image_src|apple-touch-icon-precomposed)["\'][^>]+href=["\']([^"\']+)["\']',
                content,
                re.IGNORECASE,
            )
        # 2. Main article figure image if meta tag was absent
        if not m:
            m = re.search(
                r'<(?:article|figure|main)[^>]*>.*?<img[^>]+src=["\']([^"\']+)["\']',
                content,
                re.IGNORECASE | re.DOTALL,
            )

        if m:
            raw_img = html.unescape(m.group(1)).strip()
            # Resolve relative URLs
            final_img = urljoin(str(resp.url), raw_img)
            lower = final_img.lower()
            if not any(bad in lower for bad in DISALLOWED_IMAGE_SUBSTRINGS):
                return final_img

    except Exception as exc:
        logger.debug("Failed to extract image for %s: %s", url, exc)
    finally:
        if close_client:
            await client.aclose()

    return None
