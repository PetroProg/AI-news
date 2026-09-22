import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from zoneinfo import ZoneInfo
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.models import (
    Article,
    ArticleStatus,
    Report,
    ReportArticle,
    ReportType,
)
from app.processing.cleaner import ContentCleaner

logger = logging.getLogger("news_ai.services.report")


class ReportBuilderService:
    """Aggregates, ranks, filters, and formats curated daily digests."""

    MIN_IMPORTANCE_THRESHOLD = 8.0

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def build_digest(
        self,
        report_type: ReportType = ReportType.MORNING,
        hours_back: int = 24,
    ) -> Optional[Report]:
        """Compile a structured digest for articles collected in the given time window."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_back)

        stmt = (
            select(Article)
            .options(
                selectinload(Article.summary),
                selectinload(Article.category),
                selectinload(Article.source),
            )
            .where(
                Article.published_at >= cutoff,
                Article.status == ArticleStatus.SUMMARIZED,
                Article.importance_score >= self.MIN_IMPORTANCE_THRESHOLD,
            )
            .order_by(desc(Article.importance_score), desc(Article.published_at))
        )
        res = await self.session.execute(stmt)
        articles = list(res.scalars().all())

        if not articles:
            logger.info("No summarized articles with score >= %.1f in last %d hours.", self.MIN_IMPORTANCE_THRESHOLD, hours_back)
            return None

        total_collected = await self.session.scalar(
            select(func.count(Article.id)).where(Article.published_at >= cutoff)
        ) or len(articles)

        categorized: Dict[str, List[Article]] = {}

        for art in articles:
            art.title = ContentCleaner.clean_title(art.title)
            cat_name = art.category.name if art.category else "Технологии"
            categorized.setdefault(cat_name, []).append(art)

        title_text = "🌅 УТРЕННИЙ ДАЙДЖЕСТ" if report_type == ReportType.MORNING else "🌃 ВЕЧЕРНИЙ ДАЙДЖЕСТ"
        if report_type == ReportType.CUSTOM:
            title_text = "⚡ АКТУАЛЬНЫЙ ДАЙДЖЕСТ"

        tz = ZoneInfo("Europe/Zurich")
        now_str = datetime.now(tz).strftime("%d.%m.%Y — %H:%M")

        lines: List[str] = [
            f"*{title_text}*",
            f"📅 {now_str}",
            "",
        ]

        cat_icons = {
            "УКРАИНА": "🇺🇦",
            "LINUX": "🐧",
            "DEV": "💻",
            "DEVELOPMENT": "💻",
            "IT": "💻",
            "CS2": "🎮",
            "CS": "🎮",
            "GAMING": "🎮",
            "CYBERSPORT": "🎮",
            "AI": "🤖",
            "КИБЕРБЕЗОПАСНОСТЬ": "🛡",
            "SECURITY": "🛡",
            "TECH": "⚡",
        }

        # Вывод новостей строго по категориям без ссылок
        for cat_name, cat_articles in categorized.items():
            clean_cat = cat_name.split("(")[0].strip().upper() or "ТЕХНОЛОГИИ"

            icon = "📁"
            for key, emoji in cat_icons.items():
                if key in clean_cat:
                    icon = emoji
                    break

            lines.append(f"*{icon} {clean_cat}*")

            for art in cat_articles[:8]:
                safe_title = (
                    art.title.replace("*", "")
                    .replace("_", "")
                    .replace("`", "")
                    .strip()
                )

                lines.append(f"• {safe_title}")

            lines.append("")

        lines.append("─────────────────────────")
        lines.append("🌐 [Веб-дашборд](http://100.107.4.120:8000)")

        content_markdown = "\n".join(lines)

        report_record = Report(
            title=f"{title_text} ({now_str})",
            report_type=report_type,
            content_markdown=content_markdown,
            total_articles_collected=total_collected,
            total_articles_included=len(articles),
            sent_to_telegram=False,
        )
        self.session.add(report_record)
        await self.session.flush()

        for pos, art in enumerate(articles):
            assoc = ReportArticle(
                report_id=report_record.id,
                article_id=art.id,
                position=pos,
            )
            self.session.add(assoc)
            art.status = ArticleStatus.REPORTED

        await self.session.commit()
        logger.info("Report ID %d successfully compiled and saved to database.", report_record.id)
        return report_record
