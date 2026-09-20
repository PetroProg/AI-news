import time
from pathlib import Path
from typing import Any, Dict, List
import re
import httpx
try:
    from curl_cffi.requests import AsyncSession as CurlAsyncSession
except ImportError:
    CurlAsyncSession = None
from bs4 import BeautifulSoup
from fastapi import FastAPI, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
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
MEDIA_DIR = BASE_DIR / "media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

DIAGRAM_KEYWORDS = [
    "benchmark", "chart", "diagram", "graph", "perf", "comparison", "speedup",
    "latency", "throughput", "architecture", "сравнение", "бенчмарк", "график",
    "диаграмма", "производительность", "архитектура", "рейтинг", "скорость", "память"
]

PRIORITY_KEYWORDS = ["simple", "s1mple", "navi", "bcgame", "bc.game", "fut"]
CS_FINAL_KEYWORDS = [
    "финал", "гранд-финал", "гранд финал", "победитель финала", "победители финала",
    "выиграл финал", "выиграла финал", "победил в финале", "победила в финале",
    "стал чемпионом", "стали чемпионами", "чемпионы турнира", "чемпион турнира",
    "победитель турнира", "победители турнира", "выиграл турнир", "выиграли турнир",
    "забрал кубок", "забрали кубок", "поднял кубок", "подняли кубок",
    "grand final", "grand-final", "tournament winner", "champions", "champion"
]
GAMING_INDICATORS = [
    "csgo", "cs3", "clashroyalepin", "hltv", "game", "игры", "киберспорт",
    "cs2", "cs:go", "starladder", "vitality", "navi", "s1mple", "m0nesy",
    "donk", "zywoo", "clash royale", "bcgame", "fut", "blast", "esl"
]

# Cache for HLTV ranking
_hltv_cache: Dict[str, Any] = {}
_hltv_cache_time: float = 0.0

FALLBACK_HLTV_RANKINGS = [
    {"rank": 1, "name": "Spirit", "points": 2041, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/syrtYYKR7sBRw3ZHy1YFX7.png?ixlib=java-2.1.0&w=50&s=40e66714687bec05ea422255b1c0099e"},
    {"rank": 2, "name": "Legacy", "points": 1900, "region": "AM", "logo": "https://img-cdn.hltv.org/teamlogo/RWbHH6RA8uGwJurGeLFvSr.png?ixlib=java-2.1.0&w=50&s=3d251032e156cab2f6df8c630ca29745"},
    {"rank": 3, "name": "MOUZ", "points": 1852, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/IejtXpquZnE8KqYPB1LNKw.svg?ixlib=java-2.1.0&s=7fd33b8def053fbfd8fdbb58e3bdcd3c"},
    {"rank": 4, "name": "Falcons", "points": 1850, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/4eJSkDQINNM6Tbs4WvLzkN.png?ixlib=java-2.1.0&w=50&s=d8c857ea47046f61eca695beab0d12ef"},
    {"rank": 5, "name": "Vitality", "points": 1832, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/ogcHrcCdzRvxbYvAz04KAN.png?ixlib=java-2.1.0&w=50&s=e1f6019aa9f274ffe45a5e99c88dbc02"},
    {"rank": 6, "name": "FUT", "points": 1829, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/Os71GAOy8KDuQFc0M8HE6O.png?ixlib=java-2.1.0&w=50&s=86f2bded6bcb7c690a42a62250ed69e7"},
    {"rank": 7, "name": "FURIA", "points": 1825, "region": "AM", "logo": "https://img-cdn.hltv.org/teamlogo/mvNQc4csFGtxXk5guAh8m1.svg?ixlib=java-2.1.0&s=11e5056829ad5d6c06c5961bbe76d20c"},
    {"rank": 8, "name": "G2", "points": 1814, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/zFLwAELOD15BjJSDMMNBWQ.png?ixlib=java-2.1.0&w=50&s=affb583e6716d8ee904826992255cc4b"},
    {"rank": 9, "name": "Aurora", "points": 1662, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/yJzPNOeXlyiniNxanYJCrv.png?ixlib=java-2.1.0&w=50&s=2c08f70c2f2f8c2024a438ddcf19bbf1"},
    {"rank": 10, "name": "BETBOOM", "points": 1578, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/G4ZrdB0-q41USPd_z27IQA.png?ixlib=java-2.1.0&w=50&s=9c15ddf70f9c66399d4a47e0d8e93511"},
    {"rank": 11, "name": "B8", "points": 1568, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/O6nRWTCjUzBAR4pcOcrpSG.png?ixlib=java-2.1.0&w=50&s=305dde82e764725dab7e626800328137"},
    {"rank": 12, "name": "9z", "points": 1555, "region": "AM", "logo": "https://img-cdn.hltv.org/teamlogo/COZDFWOIm41AT0srqOHFhM.png?invert=true&ixlib=java-2.1.0&sat=-100&w=50&s=b00d55fe74b90f91c5b7e2b58bda5afb"},
    {"rank": 13, "name": "MIBR", "points": 1551, "region": "AM", "logo": "https://img-cdn.hltv.org/teamlogo/sVnH-oAf1J5TnMwoY4cxUC.png?ixlib=java-2.1.0&w=50&s=b0ef463fa0f1638bce72a89590fbaddf"},
    {"rank": 14, "name": "FaZe", "points": 1526, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/OKLwq88GXjl5GQ48Y5SrvW.png?ixlib=java-2.1.0&w=50&s=0a0d65eeb1b0e82ada20c42c038552fa"},
    {"rank": 15, "name": "Alliance", "points": 1490, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/xsWK0BtR26rN776qdnWFC1.png?ixlib=java-2.1.0&w=50&s=4aaf659c3855ebf08c78c157a0653352"},
    {"rank": 16, "name": "Natus Vincere", "points": 1483, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/9iMirAi7ArBLNU8p3kqUTZ.svg?ixlib=java-2.1.0&s=4dd8635be16122656093ae9884675d0c"},
    {"rank": 17, "name": "Inner Circle", "points": 1474, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/nzJhoae6HI3i1UORM-DBFD.png?ixlib=java-2.1.0&w=50&s=35faf966127b13f4cc4b7250a5aed454"},
    {"rank": 18, "name": "BIG", "points": 1440, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/OgMRQA35hopXA8kDwMFHIY.svg?ixlib=java-2.1.0&s=ec7bc44165c7acf4224a22a1338ab7d7"},
    {"rank": 19, "name": "PARIVISION", "points": 1437, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/MFcDe-M8wfGOUU6x4sRELR.png?ixlib=java-2.1.0&w=50&s=1d91076a58b354d8c3eaeda3162c292e"},
    {"rank": 20, "name": "Astralis", "points": 1432, "region": "EU", "logo": "https://img-cdn.hltv.org/teamlogo/9bgXHp-oh1oaXr7F0mTGmd.svg?ixlib=java-2.1.0&s=f567161ab183001be33948b98c4b2067"},
]


def extract_article_media(raw_content: str) -> tuple[list[str], str | None]:
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


def extract_article_images(raw_content: str) -> list[str]:
    """Backwards-compatible wrapper."""
    imgs, _ = extract_article_media(raw_content)
    return imgs


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
async def get_hltv_ranking(force: bool = False) -> Dict[str, Any]:
    """Получить актуальный топ-20 команд HLTV Valve Ranking (CS2) с автообновлением и кэшированием."""
    global _hltv_cache, _hltv_cache_time
    now = time.time()

    # 30-minute in-memory cache unless forced
    if not force and _hltv_cache and (now - _hltv_cache_time) < 1800:
        return _hltv_cache

    if CurlAsyncSession:
        try:
            url = "https://www.hltv.org/valve-ranking/teams"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://www.hltv.org/",
            }
            async with CurlAsyncSession() as s:
                resp = await s.get(url, headers=headers, impersonate="chrome124", timeout=15)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    ranked_teams = soup.find_all("div", class_=lambda c: c and "ranked-team" in c)
                    teams = []
                    for box in ranked_teams:
                        pos_el = box.find("span", class_=lambda c: c and "position" in c)
                        name_el = box.find("span", class_="name")
                        pts_el = box.find("span", class_="points")
                        reg_el = box.find("span", class_=lambda c: c and "region" in c)
                        logo_el = box.find("img", class_="day-only") or box.find("img")

                        if pos_el and name_el and pts_el:
                            pos_txt = pos_el.get_text(strip=True).replace("#", "")
                            try:
                                rank = int(pos_txt)
                            except ValueError:
                                continue
                            name = name_el.get_text(strip=True)
                            pts_match = re.search(r"(\d+)", pts_el.get_text().replace(" ", "").replace(",", ""))
                            pts = int(pts_match.group(1)) if pts_match else 0
                            reg = reg_el.get_text(strip=True) if reg_el else ""
                            logo = logo_el.get("src") if logo_el else ""
                            teams.append({
                                "rank": rank,
                                "name": name,
                                "points": pts,
                                "region": reg,
                                "logo": logo,
                            })

                    unique_teams = {}
                    for t in teams:
                        if t["rank"] not in unique_teams:
                            unique_teams[t["rank"]] = t

                    top20 = [unique_teams[r] for r in sorted(unique_teams.keys())][:20]

                    date_display = "20 September 2026"
                    m_date = re.search(r"/(\d{4})/([^/]+)/(\d+)", str(resp.url))
                    if m_date:
                        date_display = f"{m_date.group(3)} {m_date.group(2).capitalize()} {m_date.group(1)}"

                    if top20:
                        _hltv_cache = {
                            "date": date_display,
                            "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                            "teams": top20,
                            "source": "HLTV Valve Global Ranking",
                            "url": str(resp.url) or "https://www.hltv.org/valve-ranking/teams",
                        }
                        _hltv_cache_time = now
                        return _hltv_cache
        except Exception as e:
            print(f"Error scraping HLTV Valve ranking: {e}")

    if _hltv_cache:
        return _hltv_cache

    return {
        "date": "20 September 2026",
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "teams": FALLBACK_HLTV_RANKINGS,
        "source": "HLTV Valve Global Ranking",
        "url": "https://www.hltv.org/valve-ranking/teams/2026/september/20",
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
        imgs, primary_video = extract_article_media(raw_text)
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

        # Priority Keywords Detection & CS:GO Final Winner & Meme / Sarcasm Guard
        text_for_check = title_lower + " " + content_lower
        is_meme_or_ad = any(stop in text_for_check for stop in ["тир-2", "тир 2", "cs.money", "розыгрыш", "бесплатно", "скины", "скин ", "рулетк", "щитпост", "удивительном мире"])
        matched_kws = [kw for kw in PRIORITY_KEYWORDS if kw in text_for_check]
        is_final_or_winner = is_gaming and any(kw in text_for_check for kw in CS_FINAL_KEYWORDS)
        if is_final_or_winner and "финал" not in matched_kws:
            matched_kws.append("финал")

        is_priority = (len(matched_kws) > 0 or is_final_or_winner) and not is_meme_or_ad

        score = float(art.importance_score or 5.0)
        if is_meme_or_ad and score > 4.0:
            score = 3.0
        elif is_final_or_winner and not is_meme_or_ad:
            score = max(score, 9.0)
        elif is_priority and score >= 6.0 and score < 8.5:
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
            "video_url": primary_video,
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
