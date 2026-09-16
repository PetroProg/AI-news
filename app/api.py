from pathlib import Path
from typing import Any, Dict, List
from fastapi import FastAPI, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.models import Article, ArticleStatus, Category, Source, Summary
from app.database.session import get_db_session

app = FastAPI(title="News AI Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = BASE_DIR / "web"


@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Раздача главного файла веб-интерфейса index.html."""
    html_file = WEB_DIR / "index.html"
    if html_file.exists():
        return html_file.read_text(encoding="utf-8")
    return "<h1>Error: web/index.html not found on server</h1>"


@app.get("/api/news")
async def get_news_feed(
    limit: int = 20,
    session: AsyncSession = Depends(get_db_session),
) -> List[Dict[str, Any]]:
    """Получить свежую ленту новостей с саммари и оценками из базы данных."""
    stmt = (
        select(Article)
        .options(selectinload(Article.summary), selectinload(Article.category), selectinload(Article.source))
        .where(Article.status.in_([ArticleStatus.SUMMARIZED, ArticleStatus.PROCESSED]))
        .order_by(Article.published_at.desc())
        .limit(limit)
    )
    res = await session.execute(stmt)
    articles = res.scalars().all()

    news_items = []
    for art in articles:
        news_items.append({
            "id": art.id,
            "title": art.title,
            "url": art.original_url or "#",
            "source": art.source.name if art.source else "Web",
            "category": art.category.name if art.category else "Technology",
            "published_at": art.published_at.isoformat() if art.published_at else None,
            "importance_score": art.importance_score or 5.0,
            "summary": art.summary.short_summary if art.summary else art.cleaned_content[:200] + "...",
            "why_it_matters": art.summary.why_it_matters if art.summary else None,
            "key_points": art.summary.key_points if art.summary else [],
            "model_used": art.summary.model_used if art.summary else None,
        })

    return news_items


@app.get("/api/stats")
async def get_stats(session: AsyncSession = Depends(get_db_session)) -> Dict[str, Any]:
    """Общая статистика системы для дашборда."""
    total_sources = await session.scalar(select(func.count(Source.id)))
    total_articles = await session.scalar(select(func.count(Article.id)))
    summarized_articles = await session.scalar(
        select(func.count(Article.id)).where(Article.status == ArticleStatus.SUMMARIZED)
    )

    return {
        "sources_count": total_sources or 0,
        "articles_count": total_articles or 0,
        "summarized_count": summarized_articles or 0,
        "status": "online",
    }