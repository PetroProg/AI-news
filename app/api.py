from pathlib import Path
from typing import Any, Dict, List
import re
from fastapi import FastAPI, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import case, func, select
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

DIAGRAM_KEYWORDS = [
    "benchmark", "chart", "diagram", "graph", "perf", "comparison", "speedup",
    "latency", "throughput", "architecture", "сравнение", "бенчмарк", "график",
    "диаграмма", "производительность", "архитектура", "рейтинг", "скорость", "память"
]

def extract_article_images(raw_content: str) -> list[str]:
    """Extract candidate image URLs from HTML or Markdown."""
    if not raw_content:
        return []
    html_imgs = re.findall(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', raw_content, re.IGNORECASE)
    md_imgs = re.findall(r'!\[[^\]]*\]\((https?://[^\s\)]+)\)', raw_content)
    direct_imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp|svg)', raw_content, re.IGNORECASE)
    
    candidates = []
    seen = set()
    for u in html_imgs + md_imgs + direct_imgs:
        clean_u = u.replace('\\"', '').replace('\\/', '/').strip()
        if clean_u in seen:
            continue
        seen.add(clean_u)
        lower_u = clean_u.lower()
        if any(bad in lower_u for bad in ["pixel", "avatar", "gravatar", "1x1", "icon", "badge", "emoji", "tracker"]):
            continue
        candidates.append(clean_u)
    return candidates

def detect_diagram_image(raw_content: str, images: list[str]) -> tuple[str | None, bool]:
    """Finds if any image is a benchmark/diagram or returns primary image."""
    if not images:
        return None, False
    
    # 1. Check if image URL contains diagram/benchmark keywords
    for img in images:
        if any(kw in img.lower() for kw in DIAGRAM_KEYWORDS):
            return img, True
            
    # 2. Check surrounding text around image tag
    for img in images:
        idx = raw_content.find(img)
        if idx != -1:
            snippet = raw_content[max(0, idx - 150):min(len(raw_content), idx + len(img) + 150)].lower()
            if any(kw in snippet for kw in DIAGRAM_KEYWORDS):
                return img, True
                
    return images[0], False


def infer_category_from_source(source_name: str) -> str:
    """Infer topic category from source name if AI category is not assigned yet."""
    s = source_name.lower()
    if any(k in s for k in ["python", "rust", "golang", "go", "c++", "tproger"]):
        return "IT & Аналитика"
    if any(k in s for k in ["linux", "opennet"]):
        return "Linux & Infrastructure"
    if any(k in s for k in ["csgo", "game", "игры"]):
        return "Gaming"
    if any(k in s for k in ["security", "sec", "безопас"]):
        return "Cybersecurity"
    if "ai" in s or "нейро" in s:
        return "AI"
    return "Technology"


@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Раздача главного файла веб-интерфейса index.html."""
    html_file = WEB_DIR / "index.html"
    if html_file.exists():
        return html_file.read_text(encoding="utf-8")
    return "<h1>Error: web/index.html not found on server</h1>"


@app.get("/api/news")
async def get_news_feed(
    limit: int = 100,
    session: AsyncSession = Depends(get_db_session),
) -> List[Dict[str, Any]]:
    """Получить свежую ленту новостей с саммари, изображениями и детекцией диаграмм."""
    stmt = (
        select(Article)
        .options(selectinload(Article.summary), selectinload(Article.category), selectinload(Article.source))
        .where(Article.status.in_([ArticleStatus.SUMMARIZED, ArticleStatus.REPORTED, ArticleStatus.PROCESSED]))
        .order_by(
            case((Article.status.in_([ArticleStatus.SUMMARIZED, ArticleStatus.REPORTED]), 0), else_=1),
            Article.published_at.desc()
        )
        .limit(limit)
    )
    res = await session.execute(stmt)
    articles = res.scalars().all()

    news_items = []
    for art in articles:
        raw_text = art.raw_content or ""
        imgs = extract_article_images(raw_text)
        primary_img, is_diagram = detect_diagram_image(raw_text, imgs)

        cat_name = art.category.name if art.category else (
            infer_category_from_source(art.source.name) if art.source else "Technology"
        )

        news_items.append({
            "id": art.id,
            "title": art.title,
            "url": art.original_url or "#",
            "source": art.source.name if art.source else "Web",
            "category": cat_name,
            "published_at": art.published_at.isoformat() if art.published_at else None,
            "importance_score": art.importance_score or 5.0,
            "summary": art.summary.short_summary if art.summary else (art.cleaned_content[:200] + "..." if art.cleaned_content else "Краткое резюме формируется."),
            "why_it_matters": art.summary.why_it_matters if art.summary else None,
            "key_points": art.summary.key_points if art.summary else [],
            "model_used": art.summary.model_used if art.summary else None,
            "image_url": primary_img,
            "has_diagram": is_diagram,
        })

    return news_items


@app.get("/api/stats")
async def get_stats(session: AsyncSession = Depends(get_db_session)) -> Dict[str, Any]:
    """Общая статистика системы для дашборда."""
    total_sources = await session.scalar(select(func.count(Source.id)))
    total_articles = await session.scalar(select(func.count(Article.id)))
    summarized_articles = await session.scalar(
        select(func.count(Article.id)).where(Article.status.in_([ArticleStatus.SUMMARIZED, ArticleStatus.REPORTED]))
    )

    return {
        "sources_count": total_sources or 0,
        "articles_count": total_articles or 0,
        "summarized_count": summarized_articles or 0,
        "status": "online",
    }
