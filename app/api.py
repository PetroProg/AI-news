from datetime import datetime, timezone, timedelta
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
from fastapi import FastAPI, Depends, HTTPException
from app.services.cleanup import delete_single_article, cleanup_old_articles
from app.processing.deduplicator import ContentDeduplicator
from app.processing.cleaner import ContentCleaner
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import case, func, select, or_
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
CSS_DIR = WEB_DIR / "css"
JS_DIR = WEB_DIR / "js"
CSS_DIR.mkdir(parents=True, exist_ok=True)
JS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/css", StaticFiles(directory=str(CSS_DIR)), name="css")
app.mount("/js", StaticFiles(directory=str(JS_DIR)), name="js")

DIAGRAM_KEYWORDS = [
    "benchmark", "chart", "diagram", "graph", "perf", "comparison", "speedup",
    "latency", "throughput", "architecture", "сравнение", "бенчмарк", "график",
    "диаграмма", "производительность", "архитектура", "рейтинг", "скорость", "память"
]

PRIORITY_KEYWORDS = ["simple", "s1mple", "navi", "bcgame", "bc.game", "fut"]
CS_FINAL_KEYWORDS = [
    "победитель финала", "победители финала", "победитель гранд-финала", "победители гранд-финала",
    "победил в финале", "победили в финале", "победил в гранд-финале", "победили в гранд-финале",
    "победитель турнира", "победители турнира", "выиграл турнир", "выиграли турнир",
    "выиграл финал", "выиграли финал", "выиграл гранд-финал", "выиграли гранд-финал",
    "забрал финал", "забрали финал", "забрал гранд-финал", "забрали гранд-финал",
    "стал чемпионом", "стали чемпионами", "чемпионы турнира", "чемпион турнира",
    "забрал кубок", "забрали кубок", "поднял кубок", "подняли кубок",
    "забрал трофей", "забрали трофей", "поднял трофей", "подняли трофей",
    "чемпионы starladder", "чемпион starladder", "чемпионы major", "чемпион major",
    "гранд-финал", "гранд финал", "grand final", "tournament winner", "crowned champions"
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
    if any(k in s for k in ["novynaukr", "украин", "украина", "україна"]):
        return "Украина"
    if any(k in s for k in ["csgo", "cs3", "clashroyalepin", "clashroyale", "hltv", "game", "игры", "киберспорт"]):
        return "CS2"
    if any(k in s for k in ["python", "rust", "golang", "go", "c++", "tproger", "habr", "proglib", "dev"]):
        return "IT"
    if any(k in s for k in ["linux", "opennet"]):
        return "Linux & Infrastructure"
    if "ai" in s or "нейро" in s:
        return "AI"
    return "IT"


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

        is_ukraine = any(k in source_combined for k in ["novynaukr", "украин", "украина", "україна"]) or (raw_cat and "украин" in raw_cat.lower())
        is_gaming = any(k in source_combined for k in ["csgo", "cs3", "clashroyalepin", "hltv", "game", "киберспорт"]) or \
                    any(k in title_lower for k in GAMING_INDICATORS)

        if is_ukraine:
            cat_name = "Украина"
        elif is_gaming:
            cat_name = "CS2"
        elif raw_cat:
            cat_name = raw_cat
            # Safety check: if assigned to IT but contains gaming keywords, correct to gaming
            if ("аналитик" in raw_cat.lower() or "dev" in raw_cat.lower() or "it" in raw_cat.lower()) and any(k in title_lower for k in GAMING_INDICATORS):
                cat_name = "CS2"
            elif cat_name.lower() in ["игры & киберспорт", "игры и киберспорт", "gaming", "cs2"]:
                cat_name = "CS2"
            elif cat_name.lower() in ["it & аналитика", "it-аналитик", "development", "общие технологии", "general tech", "technology", "it"]:
                cat_name = "IT"
        else:
            cat_name = infer_category_from_source(source_name)

        # Priority Keywords Detection & CS:GO Final Winner & Meme / Sarcasm Guard
        text_for_check = title_lower + " " + content_lower
        is_meme_or_ad = any(stop in text_for_check for stop in ["тир-2", "тир 2", "cs.money", "розыгрыш", "бесплатно", "скины", "скин ", "рулетк", "щитпост", "удивительном мире"])
        matched_kws = [kw for kw in PRIORITY_KEYWORDS if kw in text_for_check]
        is_digest = any(d in text_for_check for d in ["#дайджест", "дайджест", "утренний дайджест", "новости дня", "главное за день", "итоги недели", "итоги дня", "ура, воскресенье"])
        is_round_only = any(r in text_for_check for r in ["финальный раунд", "финальном раунде", "финального раунда", "финальные раунды"])
        is_final_or_winner = is_gaming and not is_digest and not is_round_only and any(kw in text_for_check for kw in CS_FINAL_KEYWORDS)
        if is_final_or_winner and "финал" not in matched_kws:
            matched_kws.append("финал")

        is_operational_alert = False
        if cat_name == "Украина":
            is_operational_alert = any(ping in text_for_check for ping in [
                "курсом на", "курс на", "напрямку", "в напрямку", "в сторону", "в направлении",
                "летить дрон", "летит дрон", "тривога в", "тревога в", "загроза балістики", "угроза баллистики",
                "чисто в", "відбій", "отбой", "пуски шахедів", "пуски шахедов"
            ]) and len(text_for_check) < 300

        has_ukr_priority = (cat_name == "Украина") and not is_operational_alert and any(kw in text_for_check for kw in [
            "дніпро", "днепр", "дніпров", "оон", "нато", "nato", "тцк", "блекаут", "блэкаут",
            "збито", "сбито", "повітряні сили", "воздушные силы", "генштаб"
        ])
        if has_ukr_priority and any(k in text_for_check for k in ["дніпро", "днепр"]):
            if "дніпро" not in matched_kws:
                matched_kws.append("дніпро")
        if has_ukr_priority and any(k in text_for_check for k in ["оон", "нато", "nato"]):
            if "оон/нато" not in matched_kws:
                matched_kws.append("оон/нато")
        if has_ukr_priority and "тцк" in text_for_check:
            if "тцк" not in matched_kws:
                matched_kws.append("тцк")

        is_priority = (len(matched_kws) > 0 or is_final_or_winner or has_ukr_priority) and not is_meme_or_ad and not is_operational_alert

        score = float(art.importance_score or 5.0)
        if is_operational_alert:
            score = min(score, 5.0)
        elif is_meme_or_ad and score > 4.0:
            score = 3.0
        elif is_final_or_winner and not is_meme_or_ad:
            score = max(score, 9.0)
        elif is_priority and score >= 6.0 and score < 8.5:
            score = 8.5

        news_items.append({
            "id": art.id,
            "title": ContentCleaner.clean_title(art.title),
            "url": art.original_url or "#",
            "source": source_name,
            "source_url": source_url,
            "category": cat_name,
            "published_at": art.published_at.isoformat() if art.published_at else None,
            "importance_score": score,
            "summary": ContentCleaner.clean(art.summary.short_summary) if art.summary else (art.cleaned_content[:200] + "..." if art.cleaned_content else "Краткое резюме формируется."),
            "why_it_matters": art.summary.why_it_matters if art.summary else None,
            "key_points": art.summary.key_points if art.summary else [],
            "model_used": art.summary.model_used if art.summary else None,
            "image_url": primary_img,
            "video_url": primary_video,
            "has_diagram": is_diagram,
            "is_priority": is_priority,
            "is_operational_alert": is_operational_alert,
            "priority_keywords": matched_kws,
        })

    # Dynamic feed-level deduplication safeguard
    deduped_items = []
    seen_media_hashes = []
    seen_title_stems = []
    media_dir = BASE_DIR / "media"

    for item in news_items:
        img = item.get("image_url") or ""
        item_img_hash = None
        if img.startswith("/media/"):
            img_path = media_dir / img.replace("/media/", "")
            item_img_hash = ContentDeduplicator.compute_image_dhash(img_path)

        stems = ContentDeduplicator.tokenize_title(item.get("title") or "")

        is_dup = False

        # 1. Check image hash with earlier items (cross-source duplicate)
        if item_img_hash:
            for prev_src, prev_hash, _ in seen_media_hashes:
                if prev_src != item["source"]:
                    if ContentDeduplicator.hamming_distance(item_img_hash, prev_hash) <= 6:
                        is_dup = True
                        break

        # 2. Check title similarity with earlier items
        if not is_dup and stems:
            for prev_src, prev_stems in seen_title_stems:
                if prev_src != item["source"]:
                    jaccard, overlap, _ = ContentDeduplicator.calculate_similarity(stems, prev_stems)
                    if jaccard >= 0.45 or overlap >= 0.70:
                        is_dup = True
                        break

        if not is_dup:
            deduped_items.append(item)
            if item_img_hash:
                seen_media_hashes.append((item["source"], item_img_hash, item.get("id")))
            if stems:
                seen_title_stems.append((item["source"], stems))

    return deduped_items


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

@app.delete("/api/news/{article_id}")
async def delete_news_article(
    article_id: int,
    session: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    """Удалить новость из базы данных по ID."""
    deleted = await delete_single_article(article_id, session)
    if not deleted:
        raise HTTPException(status_code=404, detail="Новость не найдена в базе данных")
    return {"success": True, "deleted_id": article_id, "message": "Новость успешно удалена из базы данных"}


@app.post("/api/news/cleanup")
async def trigger_news_cleanup(
    days: int = 7,
) -> Dict[str, Any]:
    """Ручной запуск автоматической очистки новостей старше указанного количества дней (по умолчанию 7)."""
    count = await cleanup_old_articles(days=days)
    return {"success": True, "deleted_count": count, "days": days}



@app.get("/api/ukraine/attacks-summary")
async def get_ukraine_attacks_summary(session: AsyncSession = Depends(get_db_session)) -> Dict[str, Any]:
    """Оперативная сводка и анализ атак за последние 24 часа из канала @NovynaUKR."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    stmt = (
        select(Article)
        .options(selectinload(Article.summary), selectinload(Article.source))
        .where(
            Article.published_at >= cutoff,
            or_(
                Article.source.has(Source.name.ilike("%NovynaUKR%")),
                Article.source.has(Source.url.ilike("%NovynaUKR%")),
                Article.original_url.ilike("%NovynaUKR%")
            )
        )
        .order_by(Article.published_at.asc())
    )
    res = await session.execute(stmt)
    articles = res.scalars().all()

    attack_events = []
    drones_count = 0
    missiles_count = 0
    ballistics_count = 0
    air_defense_count = 0
    hotspots = set()
    times = []

    city_keywords = {
        "Дніпро": ["дніпро", "днепр", "дніпропетров"],
        "Київ": ["київ", "киев", "київщин", "киевск"],
        "Харків": ["харків", "харьков", "харківщин"],
        "Одеса": ["одес", "одесс", "одещин"],
        "Запоріжжя": ["запоріж", "запорож"],
        "Полтава": ["полтав", "кременчу"],
        "Суми": ["сум", "сумщин"],
        "Миколаїв": ["микола", "никола"],
        "Хмельницький": ["хмельниц", "старокост"],
        "Вінниця": ["вінниц", "винниц"]
    }

    for art in articles:
        txt = ((art.title or "") + " " + (art.cleaned_content or "")).lower()
        has_attack_keyword = any(kw in txt for kw in [
            "шахед", "дрон", "бпла", "ракета", "балістик", "баллистик", "тривога", "тревога",
            "вибух", "взрыв", "удар", "приліт", "прилет", "обстріл", "обстрел", "ппо", "пво", "збито", "сбито"
        ])
        if not has_attack_keyword:
            continue

        if art.published_at:
            times.append(art.published_at)

        if any(k in txt for k in ["шахед", "дрон", "бпла", "камикадзе"]):
            drones_count += 1
        if any(k in txt for k in ["балістик", "баллистик", "іскандер", "кинжал", "кинджал"]):
            ballistics_count += 1
        elif any(k in txt for k in ["ракета", "ракет", "х-101", "калібр"]):
            missiles_count += 1
        if any(k in txt for k in ["ппо", "пво", "збит", "сбит"]):
            air_defense_count += 1

        for city, keys in city_keywords.items():
            if any(k in txt for k in keys):
                hotspots.add(city)

        attack_events.append({
            "id": art.id,
            "time": art.published_at.strftime("%H:%M") if art.published_at else "",
            "title": ContentCleaner.clean_title(art.title),
            "summary": art.summary.short_summary if art.summary else (art.title or ""),
            "url": art.original_url or (f"https://t.me/NovynaUKR/{art.external_id.split('_')[-1]}" if art.external_id else "#")
        })

    time_window_str = "За последние 24 часа"
    if times:
        start_time = min(times).strftime("%H:%M")
        end_time = max(times).strftime("%H:%M")
        time_window_str = f"с {start_time} до {end_time}"

    summary_parts = []
    if times:
        summary_parts.append(f"В период {time_window_str} зафиксирована активность атак по территории Украины.")
    else:
        summary_parts.append("За последние 24 часа активных сообщений об атаках не зафиксировано.")

    if ballistics_count > 0 or missiles_count > 0:
        missile_types = []
        if ballistics_count > 0:
            missile_types.append("баллистического вооружения")
        if missiles_count > 0:
            missile_types.append("крылатых ракет")
        summary_parts.append(f"Отмечены пуски {' и '.join(missile_types)}.")

    if drones_count > 0:
        summary_parts.append(f"Фиксировались группы ударных БПЛА типа «Shahed» ({drones_count} сигналов).")

    if hotspots:
        top_cities = list(hotspots)[:5]
        summary_parts.append(f"Основные направления: {', '.join(top_cities)}.")

    if air_defense_count > 0:
        summary_parts.append("Силы ПВО вели активную боевую работу по уничтожению воздушных целей.")

    return {
        "status": "active" if times else "quiet",
        "attack_window": time_window_str,
        "summary_text": " ".join(summary_parts),
        "stats": {
            "drones_signals": drones_count,
            "ballistics_signals": ballistics_count,
            "missiles_signals": missiles_count,
            "air_defense_signals": air_defense_count,
            "total_alerts": len(attack_events)
        },
        "hotspots": list(hotspots),
        "recent_signals": attack_events[-8:][::-1],
        "updated_at": datetime.now(timezone.utc).strftime("%d.%m.%Y %H:%M UTC")
    }

