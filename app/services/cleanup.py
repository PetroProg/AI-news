import logging
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional, Set

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Article
from app.database.session import async_session_maker

logger = logging.getLogger("news_ai.services.cleanup")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MEDIA_DIR = BASE_DIR / "media"


def extract_media_filenames(content: Optional[str]) -> Set[str]:
    """Find all local /media/... filenames mentioned in the article content."""
    if not content:
        return set()
    matches = re.findall(r'/media/([a-zA-Z0-9_\-\.]+)', content)
    return set(matches)


def remove_media_files(filenames: Set[str]) -> None:
    """Safely unlink local media files from disk."""
    for fname in filenames:
        try:
            target = MEDIA_DIR / fname
            if target.exists() and target.is_file():
                target.unlink()
                logger.info("Deleted orphaned media file: %s", target)
        except Exception as e:
            logger.warning("Failed to delete media file %s: %s", fname, e)


async def delete_single_article(article_id: int, session: AsyncSession) -> bool:
    """Delete a single article by ID along with its orphaned media files."""
    res = await session.execute(select(Article).where(Article.id == article_id))
    art = res.scalar_one_or_none()
    if not art:
        return False

    # Collect media filenames before deleting
    raw_text = (art.raw_content or "") + " " + (art.cleaned_content or "")
    media_files = extract_media_filenames(raw_text)

    # Delete article from database (cascades handle summaries, tags, report_articles)
    await session.delete(art)
    await session.commit()

    # Clean up local media files
    if media_files:
        remove_media_files(media_files)

    logger.info("Successfully deleted article ID %d and its media files (%s)", article_id, media_files)
    return True


async def cleanup_old_articles(days: int = 7) -> int:
    """
    Automatically delete all articles published more than `days` days ago.
    Returns the count of deleted articles.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    logger.info("Running automatic cleanup for articles older than %d days (cutoff: %s)", days, cutoff.isoformat())

    deleted_count = 0
    all_media_to_delete: Set[str] = set()

    async with async_session_maker() as session:
        stmt = select(Article).where(Article.published_at < cutoff)
        res = await session.execute(stmt)
        old_articles = res.scalars().all()

        if not old_articles:
            logger.info("No articles found older than %d days.", days)
            return 0

        for art in old_articles:
            raw_text = (art.raw_content or "") + " " + (art.cleaned_content or "")
            all_media_to_delete.update(extract_media_filenames(raw_text))
            await session.delete(art)
            deleted_count += 1

        await session.commit()

    # Unlink media files after DB commit
    if all_media_to_delete:
        remove_media_files(all_media_to_delete)

    logger.info("Automatic cleanup completed: deleted %d articles and cleaned up %d media files.", deleted_count, len(all_media_to_delete))
    return deleted_count
