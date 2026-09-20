import hashlib
import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

try:
    from PIL import Image
except ImportError:
    Image = None

logger = logging.getLogger("news_ai.processing.deduplicator")


def extract_article_media(raw_content: str) -> Tuple[List[str], Optional[str]]:
    """Extract candidate image URLs and primary video URL from HTML or Markdown."""
    if not raw_content:
        return [], None

    # Video extraction
    html_videos = re.findall(r'<video[^>]+src=["\'](https?://[^"\']+|/media/[^"\']+)["\']', raw_content, re.IGNORECASE)
    direct_videos = re.findall(r'(?:https?://[^\s"\'<>]|/media/[^\s"\'<>])+\.(?:mp4|webm|mov)', raw_content, re.IGNORECASE)
    primary_video = None
    all_videos = html_videos + direct_videos
    if all_videos:
        primary_video = all_videos[0].replace('\\"', '').replace('\\/', '/').strip()

    # Image extraction (including video poster attribute)
    posters = re.findall(r'<video[^>]+poster=["\'](https?://[^"\']+|/media/[^"\']+)["\']', raw_content, re.IGNORECASE)
    html_imgs = re.findall(r'<img[^>]+src=["\'](https?://[^"\']+|/media/[^"\']+)["\']', raw_content, re.IGNORECASE)
    md_imgs = re.findall(r'!\[[^\]]*\]\((https?://[^\s\)]+|/media/[^\s\)]+)\)', raw_content)
    direct_imgs = re.findall(r'(?:https?://[^\s"\'<>]|/media/[^\s"\'<>])+\.(?:jpg|jpeg|png|webp|svg)', raw_content, re.IGNORECASE)

    candidates = []
    seen = set()
    for u in posters + html_imgs + md_imgs + direct_imgs:
        clean_u = u.replace('\\"', '').replace('\\/', '/').strip()
        if clean_u in seen:
            continue
        seen.add(clean_u)
        lower_u = clean_u.lower()
        if any(bad in lower_u for bad in ["pixel", "avatar", "gravatar", "1x1", "icon", "badge", "emoji", "tracker"]):
            continue
        candidates.append(clean_u)

    return candidates, primary_video


class ContentDeduplicator:
    """Multi-stage algorithmic deduplicator for news articles with cross-source image and entity matching."""

    DEFAULT_SIMILARITY_THRESHOLD = 0.45

    STOP_WORDS: Set[str] = {
        "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is", "are", "with", "by",
        "в", "на", "с", "по", "к", "о", "об", "и", "или", "не", "для", "от", "из", "за", "как", "что",
        "он", "она", "оно", "они", "это", "то", "же", "уже", "только", "просто", "все", "всё"
    }

    GENERIC_TOURNAMENT_WORDS: Set[str] = {
        "starladder", "starseries", "fall", "2026", "2025", "2024", "major", "blast", "esl", "iem",
        "championship", "tournament", "турнир", "сезон", "season"
    }

    PUNCTUATION_RE = re.compile(r"[^\w\s]", re.UNICODE)
    WHITESPACE_RE = re.compile(r"\s+")

    @classmethod
    def compute_content_hash(cls, cleaned_text: str) -> str:
        """Compute deterministic SHA-256 hash of normalized text."""
        normalized = cls.normalize_string(cleaned_text)
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    @classmethod
    def normalize_string(cls, text: str) -> str:
        """Lowercase, remove punctuation, and collapse whitespace."""
        text = text.lower()
        text = cls.PUNCTUATION_RE.sub(" ", text)
        text = cls.WHITESPACE_RE.sub(" ", text)
        return text.strip()

    @classmethod
    def simple_stem(cls, word: str) -> str:
        """Basic Russian and English suffix stripping."""
        for suff in ["ями", "ами", "ей", "ов", "ев", "ом", "ем", "ам", "ах", "ях", "ою", "ею", "ую", "юю", "ая", "яя", "ое", "ее", "ые", "ие", "ый", "ий", "ой", "ей", "ут", "ют", "ат", "ят", "ил", "ила", "или", "ть", "ти", "ла", "ли", "ло", "ал", "ел", "ы", "и", "а", "я", "у", "ю", "е", "о"]:
            if len(word) > len(suff) + 3 and word.endswith(suff):
                return word[:-len(suff)]
        for suff in ["ing", "tion", "ed", "es", "s"]:
            if len(word) > len(suff) + 3 and word.endswith(suff):
                return word[:-len(suff)]
        return word

    @classmethod
    def tokenize_title(cls, title: str, exclude_generic: bool = True) -> Set[str]:
        """Extract meaningful stemmed tokens from title."""
        normalized = cls.normalize_string(title)
        tokens = normalized.split()
        res = set()
        for token in tokens:
            if token in cls.STOP_WORDS:
                continue
            if exclude_generic and token in cls.GENERIC_TOURNAMENT_WORDS:
                continue
            if len(token) > 1:
                res.add(cls.simple_stem(token))
        return res

    @classmethod
    def compute_image_dhash(cls, image_path: Path | str, hash_size: int = 8) -> Optional[int]:
        """Compute 64-bit difference hash (dHash) for an image."""
        if Image is None:
            return None
        try:
            path = Path(image_path)
            if not path.exists():
                return None
            with Image.open(path) as img:
                img = img.convert("L").resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
                try:
                    pixels = list(img.get_flattened_data())
                except AttributeError:
                    pixels = list(img.getdata())
                diff = []
                for row in range(hash_size):
                    for col in range(hash_size):
                        idx = row * (hash_size + 1) + col
                        diff.append(pixels[idx] > pixels[idx + 1])
                decimal_value = 0
                for index, value in enumerate(diff):
                    if value:
                        decimal_value += 1 << index
                return decimal_value
        except Exception as exc:
            logger.debug("Failed to compute dHash for %s: %s", image_path, exc)
            return None

    @classmethod
    def hamming_distance(cls, h1: int, h2: int) -> int:
        """Count bit differences between two 64-bit hashes."""
        return bin(h1 ^ h2).count("1")

    @classmethod
    def calculate_similarity(cls, set_a: Set[str], set_b: Set[str]) -> Tuple[float, float, float]:
        """Calculate Jaccard, Overlap, and Hybrid similarity."""
        if not set_a or not set_b:
            return 0.0, 0.0, 0.0

        intersection = len(set_a.intersection(set_b))
        min_len = min(len(set_a), len(set_b))
        union = len(set_a.union(set_b))

        overlap = intersection / min_len if min_len > 0 else 0.0
        jaccard = intersection / union if union > 0 else 0.0
        hybrid = max(jaccard, overlap * 0.75)

        return jaccard, overlap, hybrid

    @classmethod
    def find_duplicate(
        cls,
        candidate_title: str,
        candidate_hash: str,
        candidate_image_hash: Optional[int],
        candidate_source_id: Optional[int],
        candidate_published_at: Optional[datetime],
        existing_articles: List[Dict[str, Any]],
        threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
    ) -> Optional[int]:
        """Check if candidate matches any existing article using content, image dHash, and title semantics."""
        candidate_tokens = cls.tokenize_title(candidate_title)

        for ref in existing_articles:
            ref_id = ref["id"]
            ref_title = ref["title"]
            ref_hash = ref.get("content_hash")
            ref_image_hash = ref.get("image_hash")
            ref_source_id = ref.get("source_id")
            ref_pub_at = ref.get("published_at")

            # 1. Exact content hash match
            if candidate_hash and ref_hash and candidate_hash == ref_hash:
                logger.info("Duplicate found: ID %d matched exact content hash with candidate.", ref_id)
                return ref_id

            # Time distance check (default max 48 hours for event deduplication)
            time_diff_hrs = 0.0
            if candidate_published_at and ref_pub_at:
                time_diff_hrs = abs((candidate_published_at - ref_pub_at).total_seconds()) / 3600.0
                if time_diff_hrs > 48.0:
                    continue

            # 2. Perceptual Image Hash Match (dHash)
            if candidate_image_hash and ref_image_hash:
                dist = cls.hamming_distance(candidate_image_hash, ref_image_hash)
                if dist <= 6:
                    # Different sources posting same image: guaranteed cross-channel duplicate
                    if candidate_source_id and ref_source_id and candidate_source_id != ref_source_id:
                        logger.info("Cross-source duplicate found: ID %d image dHash dist=%d (source %s vs %s)", ref_id, dist, candidate_source_id, ref_source_id)
                        return ref_id
                    else:
                        # Same source: verify title shares at least some common theme
                        ref_tokens = cls.tokenize_title(ref_title)
                        if len(candidate_tokens.intersection(ref_tokens)) >= 2:
                            logger.info("Same-source duplicate found: ID %d image dHash dist=%d with title overlap", ref_id, dist)
                            return ref_id

            # 3. Stem-based Title Semantics
            ref_tokens = cls.tokenize_title(ref_title)
            jaccard, overlap, hybrid = cls.calculate_similarity(candidate_tokens, ref_tokens)

            if jaccard >= threshold or overlap >= 0.70:
                logger.info("Duplicate found: ID %d matched title similarity (jaccard=%.2f, overlap=%.2f)", ref_id, jaccard, overlap)
                return ref_id

            # 4. Entity match within short time window (<= 2 hours)
            if time_diff_hrs <= 2.0:
                inter_count = len(candidate_tokens.intersection(ref_tokens))
                if inter_count >= 2 and overlap >= 0.50:
                    logger.info("Duplicate found: ID %d matched close temporal entity within %.1fh (overlap=%.2f)", ref_id, time_diff_hrs, overlap)
                    return ref_id

        return None
