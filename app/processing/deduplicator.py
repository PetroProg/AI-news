import hashlib
import re
from typing import List, Optional, Set, Tuple


class ContentDeduplicator:
    """Multi-stage algorithmic deduplicator for news articles."""

    DEFAULT_SIMILARITY_THRESHOLD = 0.45

    STOP_WORDS: Set[str] = {
        "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is", "are", "with", "by",
        "в", "на", "с", "по", "к", "о", "об", "и", "или", "не", "для", "от", "из", "за", "как", "что"
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
    def tokenize_title(cls, title: str) -> Set[str]:
        """Extract significant meaningful tokens (words) from title."""
        normalized = cls.normalize_string(title)
        tokens = normalized.split()
        return {token for token in tokens if token not in cls.STOP_WORDS and len(token) > 1}

    @classmethod
    def calculate_similarity(cls, set_a: Set[str], set_b: Set[str]) -> float:
        """Calculate hybrid similarity using Jaccard and Overlap (Containment) coefficient."""
        if not set_a or not set_b:
            return 0.0

        intersection = len(set_a.intersection(set_b))
        min_len = min(len(set_a), len(set_b))
        union = len(set_a.union(set_b))

        overlap = intersection / min_len if min_len > 0 else 0.0

        jaccard = intersection / union if union > 0 else 0.0

        return max(jaccard, overlap * 0.75)

    @classmethod
    def find_duplicate(
        cls,
        candidate_title: str,
        candidate_hash: str,
        existing_articles: List[Tuple[int, str, Optional[str]]],
        threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
    ) -> Optional[int]:
        """Check if candidate matches any existing article."""
        candidate_tokens = cls.tokenize_title(candidate_title)

        for existing_id, existing_title, existing_hash in existing_articles:
            if candidate_hash and existing_hash and candidate_hash == existing_hash:
                return existing_id

            existing_tokens = cls.tokenize_title(existing_title)
            similarity = cls.calculate_similarity(candidate_tokens, existing_tokens)

            if similarity >= threshold:
                return existing_id

        return None