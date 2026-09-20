import time
from pathlib import Path
from typing import Any, Dict, List
import re
import httpx
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

PRIORITY_KEYWORDS = ["simple", "s1mple", "navi", "bcgame", "bc.game", "fut"]
GAMING_INDICATORS = [
    "csgo", "cs3", "clashroyalepin", "hltv", "game", "игры", "киберспорт",
    "cs2", "cs:go", "starladder", "vitality", "navi", "s1mple", "m0nesy",
    "donk", "zywoo", "clash royale", "bcgame", "fut", "blast", "esl"
]

# Cache for HLTV ranking
_hltv_cache: Dict[str, Any] = {}
_hltv_cache_time: float = 0.0

FALLBACK_HLTV_RANKINGS = [
    {"rank": 1, "name": "Spirit", "points": 2028, "rank_diff": 0},
    {"rank": 2, "name": "MOUZ", "points": 1934, "rank_diff": 0},
    {"rank": 3, "name": "Falcons", "points": 1901, "rank_diff": 0},
    {"rank": 4, "name": "Vitality", "points": 1863, "rank_diff": 0},
    {"rank": 5, "name": "FUT", "points": 1862, "rank_diff": 0},
    {"rank": 6, "name": "Legacy", "points": 1803, "rank_diff": 0},
    {"rank": 7, "name": "FURIA", "points": 1774, "rank_diff": 0},
    {"rank": 8, "name": "G2", "points": 1743, "rank_diff": 0},
    {"rank": 9, "name": "9z", "points": 1627, "rank_diff": 0},
    {"rank": 10, "name": "FaZe", "points": 1616, "rank_diff": 0},
    {"rank": 11, "name": "Natus Vincere", "points": 1605, "rank_diff": 0},
    {"rank": 12, "name": "Aurora", "points": 1573, "rank_diff": 0},
    {"rank": 13, "name": "B8", "points": 1533, "rank_diff": 0},
    {"rank": 14, "name": "BetBoom", "points": 1520, "rank_diff": 0},
    {"rank": 15, "name": "BIG", "points": 1495, "rank_diff": 0},
    {"rank": 16, "name": "Inner Circle", "points": 1487, "rank_diff": 0},
    {"rank": 17, "name": "PARIVISION", "points": 1484, "rank_diff": 0},
    {"rank": 18, "name": "Liquid", "points": 1484, "rank_diff": -1},
    {"rank": 19, "name": "The MongolZ", "points": 1481, "rank_diff": 0},
    {"rank": 20, "name": "Astralis", "points": 1467, "rank_diff": 0},
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
    if any(k in s for k in ["csgo", "cs3", "clashroyalepin", "clashroyale", "hltv", "game", "игры", "киберспорт"]):
        return "Игры & Киберспорт"
    if any(k in s for k in ["python", "rust", "golang", "go", "c++", "tproger"]):
        return "IT & Аналитика"
    if any(k in s for k in ["linux", "opennet"]):
        return "Linux & Infrastructure"
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


@app.get("/api/hltv/ranking")
async def get_hltv_ranking() -> Dict[str, Any]:
    """Получить актуальный топ-20 команд HLTV (CS2) с автообновлением и кэшированием."""
    global _hltv_cache, _hltv_cache_time
    now = time.time()

    # 30-minute in-memory cache
    if _hltv_cache and (now - _hltv_cache_time) < 1800:
        return _hltv_cache

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                "https://api.csapi.de/rankings/",
                headers={"User-Agent": "NewsAI-Dashboard/1.0"}
            )
            if resp.status_code == 200:
                data = resp.json()
                raw_rankings = data.get("rankings", [])
                top20 = []
                for item in raw_rankings[:20]:
                    top20.append({
                        "rank": item.get("rank"),
                        "name": item.get("name"),
                        "points": item.get("points"),
                        "rank_diff": item.get("rank_diff", 0),
                        "points_diff": item.get("points_diff", 0),
                    })
                _hltv_cache = {
                    "date": data.get("date", "Актуальный срез"),
                    "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "teams": top20,
                    "source": "HLTV World Ranking (via CSAPI)",
                }
                _hltv_cache_time = now
                return _hltv_cache
    except Exception:
        pass

    if _hltv_cache:
        return _hltv_cache

    return {
        "date": "Сентябрь 2026",
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "teams": FALLBACK_HLTV_RANKINGS,
        "source": "HLTV World Ranking",
    }


@app.get("/api/news")
async def get_news_feed(
    limit: int = 100,
    session: AsyncSession = Depends(get_db_session),
) -> List[Dict[str, Any]]:
    """Получить свежую ленту новостей с саммари, изображениями, детекцией диаграмм и приоритетами."""
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

        source_name = art.source.name if art.source else "Web"
        source_url = art.source.url if art.source else ""
        source_combined = (source_name + " " + source_url).lower()

        # Deterministic category resolution
        raw_cat = art.category.name if art.category else ""
        title_lower = (art.title or "").lower()
        content_lower = (art.cleaned_content or raw_text).lower()

        is_gaming = any(k in source_combined for k in ["csgo", "cs3", "clashroyalepin", "hltv", "game", "киберспорт"]) or \
                    any(k in title_lower for k in GAMING_INDICATORS)

        if is_gaming:
            cat_name = "Игры & Киберспорт"
        elif raw_cat:
            cat_name = raw_cat
            # Safety check: if assigned to IT but contains gaming keywords, correct to gaming
            if ("аналитик" in raw_cat.lower() or "dev" in raw_cat.lower()) and any(k in title_lower for k in GAMING_INDICATORS):
                cat_name = "Игры & Киберспорт"
        else:
            cat_name = infer_category_from_source(source_name)

        # Priority Keywords Detection
        matched_kws = [kw for kw in PRIORITY_KEYWORDS if kw in (title_lower + " " + content_lower)]
        is_priority = len(matched_kws) > 0

        score = float(art.importance_score or 5.0)
        if is_priority and score < 8.0:
            score = 8.5

        news_items.append({
            "id": art.id,
            "title": art.title,
            "url": art.original_url or "#",
            "source": source_name,
            "source_url": source_url,
            "category": cat_name,
            "published_at": art.published_at.isoformat() if art.published_at else None,
            "importance_score": score,
            "summary": art.summary.short_summary if art.summary else (art.cleaned_content[:200] + "..." if art.cleaned_content else "Краткое резюме формируется."),
            "why_it_matters": art.summary.why_it_matters if art.summary else None,
            "key_points": art.summary.key_points if art.summary else [],
            "model_used": art.summary.model_used if art.summary else None,
            "image_url": primary_img,
            "has_diagram": is_diagram,
            "is_priority": is_priority,
            "priority_keywords": matched_kws,
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
