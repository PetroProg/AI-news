import html
import re
from bs4 import BeautifulSoup


class ContentCleaner:
    """Utility for sanitizing raw HTML and Telegram text for AI, web UI, and reports."""

    DISCARD_TAGS = {
        "script", "style", "noscript", "iframe", "object", "embed",
        "header", "footer", "nav", "aside", "form"
    }

    WHITESPACE_RE = re.compile(r"[ \t]+")
    MULTILINE_RE = re.compile(r"\n\s*\n+")
    
    TG_MARKDOWN_RE = re.compile(r"(\*\*|__|\~\~|```|`|\#\#+)")

    # Comprehensive Unicode regex covering all emojis, flags, pictographs, dingbats, and symbols
    EMOJI_SYMBOLS_RE = re.compile(
        r'['
        r'\U0001F1E6-\U0001F1FF'  # flags (regional indicator symbols)
        r'\U0001F300-\U0001F5FF'  # symbols & pictographs (💀, 🏆, 🗲, etc.)
        r'\U0001F600-\U0001F64F'  # emoticons (😀, 🫤, 😱, etc.)
        r'\U0001F680-\U0001F6FF'  # transport & map
        r'\U0001F700-\U0001F77F'  # alchemical
        r'\U0001F780-\U0001F7FF'  # geometric shapes extended
        r'\U0001F800-\U0001F8FF'  # supplemental arrows
        r'\U0001F900-\U0001F9FF'  # supplemental symbols (🤝, 🥇, 🤟, etc.)
        r'\U0001FA00-\U0001FA6F'  # chess symbols
        r'\U0001FA70-\U0001FAFF'  # symbols extended-A
        r'\U00002600-\U000026FF'  # misc symbols (⚡, ⚠️, ☕, etc.)
        r'\U00002700-\U000027BF'  # dingbats (✨, ❌, ‼️, ❗️, etc.)
        r'\U00002300-\U000023FF'  # misc technical (⌚, ⌛, etc.)
        r'\U00002B00-\U00002BFF'  # misc symbols and arrows (⬇, ⭐, etc.)
        r'\U00002190-\U000021FF'  # arrows (←, ↑, →, ↓)
        r'\U0000FE00-\U0000FE0F'  # variation selectors
        r'\U0000200D'              # zero-width joiner
        r'\U0000200B-\U0000200F'  # zero-width spaces
        r'\U0001F000-\U0001F02F'  # mahjong
        r']+',
        flags=re.UNICODE
    )

    # Clean leftover textual country code prefixes (e.g. "FR ", "TR ", "UA ", "EU ")
    COUNTRY_PREFIX_RE = re.compile(r'^(?:FR|TR|UA|EU|RU|DK|BR|US|DE|PL|KZ|NA|SA)\s+', re.IGNORECASE)

    # Clean inline country prefixes before teams/players (e.g. "eu Vitality" -> "Vitality", "ua NAVI" -> "NAVI")
    INLINE_COUNTRY_CODE_RE = re.compile(
        r'\b(?:eu|ua|fr|tr|ru|dk|br|us)\s+(vitality|navi|spirit|astralis|furia|faze|mouz|falcons|g2|virtus\.pro|heroic|liquid|complexity|mongolz|aurora|xantares|zywoo|s1mple|donk|m0nesy)\b',
        re.IGNORECASE
    )

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
        """Clean titles from markdown artifacts, all emojis, country flags/codes, and noise."""
        if not raw_title:
            return "Новость"
        
        # 1. Strip telegram markdown tags
        title = cls.TG_MARKDOWN_RE.sub("", raw_title)

        # 2. Strip all emojis, flags, symbols, and pictographs
        title = cls.EMOJI_SYMBOLS_RE.sub("", title)

        # 3. Strip country code prefixes and inline team country markers
        title = cls.COUNTRY_PREFIX_RE.sub("", title)
        title = cls.INLINE_COUNTRY_CODE_RE.sub(r"\1", title)

        # 4. Strip trailing slang words before removed emojis (e.g. "это 💀 💀" -> "")
        title = re.sub(r"\s+это$", "", title, flags=re.IGNORECASE)

        # 5. Clean leading and trailing punctuation, spaces, quotes
        title = re.sub(r"^[ \t\-\:\,\.\!\?\|—–«»\"]+", "", title)
        title = re.sub(r"[ \t\-\:\,\|—–«»\"]+$", "", title)

        # 6. Normalize whitespace
        title = cls.WHITESPACE_RE.sub(" ", title).strip()
        return title or "Новость"

    @classmethod
    def _normalize_text(cls, text: str) -> str:
        """Decode HTML entities, strip telegram noise, and collapse spaces."""
        text = html.unescape(text)
        
        text = cls.TG_MARKDOWN_RE.sub("", text)
        text = cls.EMOJI_SYMBOLS_RE.sub(" ", text)
        text = cls.INLINE_COUNTRY_CODE_RE.sub(r"\1", text)
        
        text = cls.WHITESPACE_RE.sub(" ", text)
        text = cls.MULTILINE_RE.sub("\n\n", text)

        lines = [line.strip() for line in text.split("\n") if line.strip()]
        cleaned_lines = []
        for line in lines:
            if any(pattern.search(line) for pattern in cls.FOOTER_PATTERNS):
                continue
            cleaned_lines.append(line)

        return "\n\n".join(cleaned_lines).strip()
