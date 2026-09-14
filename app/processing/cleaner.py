import html
import re
from bs4 import BeautifulSoup


class ContentCleaner:
    """Utility for sanitizing raw HTML and normalizing text for AI processing."""

    DISCARD_TAGS = {
        "script", "style", "noscript", "iframe", "object", "embed",
        "header", "footer", "nav", "aside", "form"
    }

    WHITESPACE_RE = re.compile(r"[ \t]+")
    MULTILINE_RE = re.compile(r"\n\s*\n+")
    
    FOOTER_PATTERNS = [
        re.compile(r"Подписывайтесь на наш (Telegram|телеграм|канал).*$", re.IGNORECASE),
        re.compile(r"Читать далее( в источнике)?:?.*$", re.IGNORECASE),
        re.compile(r"Источник:?\s*https?://\S+", re.IGNORECASE),
        re.compile(r"Original source:?\s*https?://\S+", re.IGNORECASE),
    ]

    @classmethod
    def clean(cls, raw_html_or_text: str) -> str:
        """Sanitize raw HTML or text into clean, normalized plain text."""
        if not raw_html_or_text or not raw_html_or_text.strip():
            return ""

        if "<" not in raw_html_or_text and ">" not in raw_html_or_text:
            return cls._normalize_text(raw_html_or_text)

        soup = BeautifulSoup(raw_html_or_text, "lxml")

        for tag in soup.find_all(cls.DISCARD_TAGS):
            tag.decompose()

        for block_tag in soup.find_all(["p", "br", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li"]):
            block_tag.append("\n")

        extracted_text = soup.get_text(separator=" ")

        return cls._normalize_text(extracted_text)

    @classmethod
    def _normalize_text(cls, text: str) -> str:
        """Decode HTML entities, strip extra spaces, and trim noisy footers."""
        text = html.unescape(text)

        text = cls.WHITESPACE_RE.sub(" ", text)

        text = cls.MULTILINE_RE.sub("\n\n", text)

        lines = [line.strip() for line in text.split("\n") if line.strip()]
        cleaned_lines = []
        for line in lines:
            if any(pattern.search(line) for pattern in cls.FOOTER_PATTERNS):
                continue
            cleaned_lines.append(line)

        return "\n\n".join(cleaned_lines).strip()