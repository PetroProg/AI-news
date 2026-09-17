import html
import re
from bs4 import BeautifulSoup


class ContentCleaner:
    """Utility for sanitizing raw HTML and Telegram text for AI and reports."""

    DISCARD_TAGS = {
        "script", "style", "noscript", "iframe", "object", "embed",
        "header", "footer", "nav", "aside", "form"
    }

    WHITESPACE_RE = re.compile(r"[ \t]+")
    MULTILINE_RE = re.compile(r"\n\s*\n+")
    
    TG_MARKDOWN_RE = re.compile(r"(\*\*|__|\~\~|```|`|\#\#+)")
    LEADING_SYMBOLS_RE = re.compile(r"^[\s\*\!‼️❗️😲😳🇪🇺🇺🇦🇷🇺💥⚡️🔥⚠️\-:]+")
    
    FOOTER_PATTERNS = [
        re.compile(r"Подписывайтесь на наш (Telegram|телеграм|канал).*$", re.IGNORECASE),
        re.compile(r"Читать далее( в источнике)?:?.*$", re.IGNORECASE),
        re.compile(r"Источник:?\s*https?://\S+", re.IGNORECASE),
        re.compile(r"Original source:?\s*https?://\S+", re.IGNORECASE),
        re.compile(r"#реклама.*$", re.IGNORECASE),
        re.compile(r"erid:.*$", re.IGNORECASE),
    ]

    @classmethod
    def clean(cls, raw_html_or_text: str) -> str:
        """Sanitize raw HTML or Telegram text into clean normalized plain text."""
        if not raw_html_or_text or not raw_html_or_text.strip():
            return ""

        if "<" in raw_html_or_text and ">" in raw_html_or_text:
            soup = BeautifulSoup(raw_html_or_text, "lxml")
            for tag in soup.find_all(cls.DISCARD_TAGS):
                tag.decompose()
            for block_tag in soup.find_all(["p", "br", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li"]):
                block_tag.append("\n")
            text = soup.get_text(separator=" ")
        else:
            text = raw_html_or_text

        return cls._normalize_text(text)

    @classmethod
    def clean_title(cls, raw_title: str) -> str:
        """Clean titles from markdown artifacts, leading emojis, and double spaces."""
        if not raw_title:
            return "Новость"
        
        title = cls.TG_MARKDOWN_RE.sub("", raw_title)

        title = cls.LEADING_SYMBOLS_RE.sub("", title).strip()

        title = cls.WHITESPACE_RE.sub(" ", title).strip()
        return title or "Новость"

    @classmethod
    def _normalize_text(cls, text: str) -> str:
        """Decode HTML entities, strip telegram noise, and collapse spaces."""
        text = html.unescape(text)
        
        text = cls.TG_MARKDOWN_RE.sub("", text)
        
        text = cls.WHITESPACE_RE.sub(" ", text)
        text = cls.MULTILINE_RE.sub("\n\n", text)

        lines = [line.strip() for line in text.split("\n") if line.strip()]
        cleaned_lines = []
        for line in lines:
            if any(pattern.search(line) for pattern in cls.FOOTER_PATTERNS):
                continue
            cleaned_lines.append(line)

        return "\n\n".join(cleaned_lines).strip()