import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.models import (
    Article,
    ArticleStatus,
    Report,
    ReportArticle,
    ReportType,
    Source,
)
from app.processing.cleaner import ContentCleaner
from zoneinfo import ZoneInfo

logger = logging.getLogger("news_ai.services.report")


class ReportBuilderService:
    """Aggregates, ranks, filters, and formats curated daily digests."""

    MIN_IMPORTANCE_THRESHOLD = 5.0
    
    TOP_HIGHLIGHT_THRESHOLD = 7.5

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

        top_articles: List[Article] = []
        categorized: Dict[str, List[Article]] = {}

        for art in articles:
            art.title = ContentCleaner.clean_title(art.title)
            
            if art.importance_score and art.importance_score >= self.TOP_HIGHLIGHT_THRESHOLD and len(top_articles) < 4:
                top_articles.append(art)
            else:
                cat_name = art.category.name if art.category else "Technology"
                categorized.setdefault(cat_name, []).append(art)

        title_text = "🌅 УТРЕННИЙ ДАЙДЖЕСТ" if report_type == ReportType.MORNING else "🌃 ВЕЧЕРНИЙ ДАЙДЖЕСТ"
        tz = ZoneInfo("Europe/Zurich")
        now_str = datetime.now(tz).strftime("%d.%m.%Y — %H:%M")
        
        lines: List[str] = [
            f"📰 {title_text}",
            f"📅 {now_str}\n",
        ]

        if top_articles:
            lines.append("🔥 ГЛАВНОЕ\n")
            for i, art in enumerate(top_articles, 1):
                score_str = f" [🔥 {art.importance_score:.1f}]" if art.importance_score else ""
                lines.append(f"{i}. {art.title}{score_str}")
                
                if art.summary:
                    lines.append(f"   {art.summary.short_summary}")
                    if art.summary.why_it_matters:
                        lines.append(f"   💡 Почему важно: {art.summary.why_it_matters}")
                
                source_name = art.source.name if art.source else "Источник"
                lines.append(f"   🔗 {source_name}: {art.original_url or '#'}\n")

        for cat_name, cat_articles in categorized.items():
            clean_cat = cat_name.split("(")[0].strip() or "Технологии"
            lines.append(f"📂 {clean_cat.upper()}")
            for art in cat_articles[:5]:
                summary_snippet = ""
                if art.summary and art.summary.short_summary:
                    summary_snippet = f"\n   ↳ {art.summary.short_summary[:120]}..."
                
                lines.append(f"• {art.title} — {art.original_url or '#'}{summary_snippet}")
            lines.append("")

        lines.append("─────────────────────────")
        lines.append(
            f"📊 Всего собрано: {total_collected} | Отобрано в отчет: {len(articles)}"
        )
        lines.append("🌐 Личный веб-дашборд: http://100.107.4.120:8000")

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