from datetime import datetime, timezone, timedelta
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Set
import re
import httpx
try:
    from curl_cffi.requests import AsyncSession as CurlAsyncSession
except ImportError:
    CurlAsyncSession = None
from bs4 import BeautifulSoup
from fastapi import FastAPI, Depends, HTTPException, Request
from app.services.cleanup import delete_single_article, cleanup_old_articles
from app.processing.deduplicator import ContentDeduplicator
from app.processing.cleaner import ContentCleaner
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import case, func, select, or_, text
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

F1_INDICATORS = [
    "formula 1", "formula1", "f1", "формула-1", "формула 1", "grand prix", "гран-при",
    "red bull", "verstappen", "ферстаппен", "leclerc", "леклер", "hamilton", "хэмилтон",
    "champion", "чемпион", "ferrari", "mercedes", "mclaren", "гонщик", "пилот"
]

F1_RED_BULL_PRIORITY = [
    "red bull", "ред булл", "ред булл", "verstappen", "ферстаппен", "макс ферстаппен",
    "leclerc", "леклер", "шарль леклер", "hamilton", "хэмилтон", "льюис хэмилтон", "champion", "чемпион"
]

FOOTBALL_INDICATORS = [
    "футбол", "football", "soccer", "ла лига", "laliga", "la liga",
    "лига чемпионов", "champions league", "championsleague", "лига европы", "europa league",
    "лига наций", "nations league", "барселона", "барса", "barcelona", "barca",
    "месси", "messi", "интер майами", "inter miami", "испания", "spain",
    "primera", "terrikon", "террикон", "uefa", "уефа", "fifa", "фифа"
]

FOOTBALL_PRIORITY = [
    "месси", "messi", "лео месси", "лионель месси",
    "барселона", "barcelona", "барса", "barca", "каталон", "fc barcelona",
    "испания", "spain", "сборная испании", "ла лига", "laliga",
    "интер майами", "inter miami", "майами", "интер-майами"
]

# Cache for HLTV ranking
_hltv_cache: Dict[str, Any] = {}
_hltv_cache_time: float = 0.0

# Cache for F1 Races & Drivers
_f1_races_cache: Dict[str, Any] = {}
_f1_races_cache_time: float = 0.0
_f1_drivers_cache: Dict[str, Any] = {}
_f1_drivers_cache_time: float = 0.0

# Cache for Football Tournaments & Results (Terrikon)
_football_cache: Dict[str, Any] = {}
_football_cache_time: Dict[str, float] = {}


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
    if any(k in s for k in ["marca", "primera", "sportsru", "fabrizio", "terrikon", "uefa", "футбол", "football"]):
        return "Футбол"
    if any(k in s for k in ["formula 1", "formula1", "f1", "формула-1", "формула 1"]):
        return "F1"
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


@app.get("/api/f1/results")
async def get_f1_results(force: bool = False) -> Dict[str, Any]:
    """Получить результаты гонок (Races) и положение пилотов (Drivers) F1 2026 с автообновлением."""
    global _f1_races_cache, _f1_races_cache_time
    now = time.time()

    # 15-minute in-memory cache
    if not force and _f1_races_cache and (now - _f1_races_cache_time) < 900:
        return _f1_races_cache

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    races = []
    drivers = []

    try:
        async with httpx.AsyncClient(headers=headers, timeout=20.0, follow_redirects=True) as client:
            # 1. Fetch Races
            try:
                resp_r = await client.get("https://www.formula1.com/en/results/2026/races")
                if resp_r.status_code == 200:
                    soup_r = BeautifulSoup(resp_r.text, "html.parser")
                    t_r = soup_r.find("table")
                    if t_r:
                        for tr in t_r.find_all("tr")[1:]:
                            tds = [td.get_text(separator=" ", strip=True) for td in tr.find_all("td")]
                            if len(tds) >= 6:
                                gp_clean = re.sub(r"^Flag of\s+", "", tds[0], flags=re.IGNORECASE).strip()
                                # Clean redundant country repeat e.g. "Australia Australia" -> "Australia"
                                parts = gp_clean.split()
                                if len(parts) == 2 and parts[0].lower() == parts[1].lower():
                                    gp_clean = parts[0]
                                races.append({
                                    "grand_prix": gp_clean,
                                    "date": tds[1],
                                    "winner": tds[2],
                                    "team": tds[3],
                                    "laps": tds[4],
                                    "time": tds[5]
                                })
            except Exception as e_r:
                print(f"Error fetching F1 races: {e_r}")

            # 2. Fetch Drivers
            try:
                resp_d = await client.get("https://www.formula1.com/en/results/2026/drivers")
                if resp_d.status_code == 200:
                    soup_d = BeautifulSoup(resp_d.text, "html.parser")
                    t_d = soup_d.find("table")
                    if t_d:
                        for tr in t_d.find_all("tr")[1:]:
                            tds = [td.get_text(separator=" ", strip=True) for td in tr.find_all("td")]
                            if len(tds) >= 5:
                                drivers.append({
                                    "pos": tds[0],
                                    "driver": tds[1],
                                    "nationality": tds[2],
                                    "team": tds[3],
                                    "points": tds[4]
                                })
            except Exception as e_d:
                print(f"Error fetching F1 drivers: {e_d}")

        if races or drivers:
            _f1_races_cache = {
                "races": races,
                "drivers": drivers,
                "races_url": "https://www.formula1.com/en/results/2026/races",
                "drivers_url": "https://www.formula1.com/en/results/2026/drivers",
                "season": "2026",
                "updated_at": datetime.now(timezone.utc).strftime("%d.%m.%Y %H:%M UTC")
            }
            _f1_races_cache_time = now
            return _f1_races_cache

    except Exception as e:
        print(f"Error updating F1 results: {e}")

    if _f1_races_cache:
        return _f1_races_cache

    return {
        "races": [],
        "drivers": [],
        "races_url": "https://www.formula1.com/en/results/2026/races",
        "drivers_url": "https://www.formula1.com/en/results/2026/drivers",
        "season": "2026",
        "updated_at": datetime.now(timezone.utc).strftime("%d.%m.%Y %H:%M UTC")
    }


def _parse_terrikon_standings(table) -> List[Dict[str, Any]]:
    standings = []
    if not table:
        return standings
    rows = table.find_all("tr")
    for tr in rows[1:]:
        tds = tr.find_all("td")
        if len(tds) >= 10:
            pos = tds[0].get_text(strip=True).replace(".", "")
            team_img = tds[1].find("img")
            icon_url = team_img.get("src") if team_img else ""
            if icon_url and icon_url.startswith("/"):
                icon_url = f"https://terrikon.com{icon_url}"
            team_name = tds[1].get_text(strip=True)
            games = tds[2].get_text(strip=True)
            win = tds[3].get_text(strip=True)
            draw = tds[4].get_text(strip=True)
            loss = tds[5].get_text(strip=True)
            gf = tds[6].get_text(strip=True)
            ga = tds[8].get_text(strip=True)
            pts = tds[9].get_text(strip=True)
            standings.append({
                "pos": pos,
                "team": team_name,
                "icon": icon_url,
                "games": games,
                "win": win,
                "draw": draw,
                "loss": loss,
                "goals": f"{gf}-{ga}",
                "pts": pts
            })
    return standings


def _parse_terrikon_matches(table, limit: int = 15) -> List[Dict[str, Any]]:
    matches = []
    if not table:
        return matches
    rows = table.find_all("tr")
    for tr in rows:
        tds = tr.find_all("td")
        if len(tds) >= 6:
            home = tds[1].get_text(strip=True)
            score = tds[2].get_text(strip=True)
            away = tds[3].get_text(strip=True)
            date = tds[5].get_text(strip=True)
            if home and away:
                matches.append({
                    "home": home,
                    "score": score,
                    "away": away,
                    "date": date
                })
    return matches[:limit]


@app.get("/api/football/results")
async def get_football_results(tournament: str = "laliga", force: bool = False) -> Dict[str, Any]:
    """
    Получить турнирную таблицу и результаты матчей с Terrikon.
    Турниры: laliga (Ла Лига), cl (Лига Чемпионов), el (Лига Европы), nations (Лига Наций).
    """
    global _football_cache, _football_cache_time
    now = time.time()
    t_key = tournament.lower().strip()
    if t_key not in ["laliga", "cl", "el", "nations"]:
        t_key = "laliga"

    last_time = _football_cache_time.get(t_key, 0.0)
    if not force and t_key in _football_cache and (now - last_time) < 900:
        return _football_cache[t_key]

    urls_map = {
        "laliga": {
            "url": "https://terrikon.com/football/spain/championship/",
            "title": "Ла Лига (Испания)",
            "flag": "🇪🇸"
        },
        "cl": {
            "url": "https://terrikon.com/champions-league",
            "title": "Лига Чемпионов УЕФА",
            "flag": "⭐"
        },
        "el": {
            "url": "https://terrikon.com/europa-league",
            "title": "Лига Европы УЕФА",
            "flag": "🏆"
        },
        "nations": {
            "url": "https://terrikon.com/nations-league",
            "title": "Лига Наций УЕФА",
            "flag": "🌍"
        }
    }

    t_info = urls_map[t_key]
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US,en;q=0.8",
    }

    standings = []
    matches = []
    groups = []

    try:
        async with httpx.AsyncClient(headers=headers, timeout=20.0, follow_redirects=True) as client:
            resp = await client.get(t_info["url"])
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                
                # Check for multiple group tables (e.g. Nations League)
                group_tables = soup.find_all("table", class_="grouptable")
                if len(group_tables) > 1:
                    for idx, g_tab in enumerate(group_tables):
                        # Find preceding h2 or h3 heading specifically (avoid div.col1/team-info text dump)
                        prev_h = g_tab.find_previous(["h2", "h3"])
                        if prev_h:
                            g_title = prev_h.get_text(strip=True)
                        else:
                            g_title = f"Группа {idx + 1}"
                        # Clean title e.g. "Лига Наций УЕФА 2026-27. Группа А1" -> "Группа А1"
                        if "Группа" in g_title:
                            g_title = "Группа " + g_title.split("Группа")[-1].strip()

                        g_items = _parse_terrikon_standings(g_tab)
                        if g_items:
                            groups.append({
                                "group": g_title,
                                "standings": g_items
                            })
                    if groups and groups[0]["standings"]:
                        standings = groups[0]["standings"]
                elif len(group_tables) == 1:
                    standings = _parse_terrikon_standings(group_tables[0])

                # Matches: collect up to 60 matches from all match tables
                match_tables = soup.find_all("table", class_="gameresult")
                seen_pairs = set()
                for m_tab in match_tables:
                    parsed_m = _parse_terrikon_matches(m_tab, limit=50)
                    for m in parsed_m:
                        pair_key = (m["home"], m["away"], m["date"])
                        if pair_key not in seen_pairs:
                            seen_pairs.add(pair_key)
                            matches.append(m)
                    if len(matches) >= 60:
                        break
                matches = matches[:60]

        result_payload = {
            "tournament": t_key,
            "title": t_info["title"],
            "flag": t_info["flag"],
            "url": t_info["url"],
            "standings": standings,
            "matches": matches,
            "groups": groups,
            "updated_at": datetime.now(timezone.utc).strftime("%d.%m.%Y %H:%M UTC")
        }

        if standings or matches or groups:
            _football_cache[t_key] = result_payload
            _football_cache_time[t_key] = now
            return result_payload

    except Exception as e:
        print(f"Error fetching football results from Terrikon ({t_key}): {e}")

    if t_key in _football_cache:
        return _football_cache[t_key]

    return {
        "tournament": t_key,
        "title": t_info["title"],
        "flag": t_info["flag"],
        "url": t_info["url"],
        "standings": [],
        "matches": [],
        "groups": [],
        "updated_at": datetime.now(timezone.utc).strftime("%d.%m.%Y %H:%M UTC")
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
        .where(Article.status.in_([ArticleStatus.SUMMARIZED, ArticleStatus.REPORTED]))
        .order_by(Article.published_at.desc())
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

        is_football = any(k in source_combined for k in ["marca", "primera", "sportsru", "fabrizio", "terrikon", "uefa", "футбол", "football"]) or \
                      (raw_cat and ("футбол" in raw_cat.lower() or "football" in raw_cat.lower())) or \
                      any(k in title_lower for k in FOOTBALL_INDICATORS)
        is_f1 = any(k in source_combined for k in ["formula 1", "formula1", "f1", "формула-1"]) or \
                (raw_cat and raw_cat.lower() == "f1") or \
                any(k in title_lower for k in F1_INDICATORS)
        is_ukraine = any(k in source_combined for k in ["novynaukr", "украин", "украина", "україна"]) or (raw_cat and "украин" in raw_cat.lower())
        is_gaming = any(k in source_combined for k in ["csgo", "cs3", "clashroyalepin", "hltv", "game", "киберспорт"]) or \
                    any(k in title_lower for k in GAMING_INDICATORS)

        if is_football:
            cat_name = "Футбол"
        elif is_f1:
            cat_name = "F1"
        elif is_ukraine:
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
            elif cat_name.lower() in ["футбол", "football"]:
                cat_name = "Футбол"
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

        has_f1_priority = (cat_name == "F1") and any(kw in text_for_check for kw in F1_RED_BULL_PRIORITY)
        if has_f1_priority:
            if any(k in text_for_check for k in ["red bull", "ред булл"]):
                if "Red Bull" not in matched_kws:
                    matched_kws.append("Red Bull")
            if any(k in text_for_check for k in ["verstappen", "ферстаппен"]):
                if "Verstappen" not in matched_kws:
                    matched_kws.append("Verstappen")
            if any(k in text_for_check for k in ["leclerc", "леклер"]):
                if "Leclerc" not in matched_kws:
                    matched_kws.append("Leclerc")
            if any(k in text_for_check for k in ["hamilton", "хэмилтон"]):
                if "Hamilton" not in matched_kws:
                    matched_kws.append("Hamilton")
            if any(k in text_for_check for k in ["champion", "чемпион"]):
                if "Champion" not in matched_kws:
                    matched_kws.append("Champion")

        has_football_priority = (cat_name == "Футбол") and any(kw in text_for_check for kw in FOOTBALL_PRIORITY)
        if has_football_priority:
            if any(k in text_for_check for k in ["месси", "messi"]):
                if "Месси" not in matched_kws:
                    matched_kws.append("Месси")
            if any(k in text_for_check for k in ["барселона", "barcelona", "барса", "barca"]):
                if "Барселона" not in matched_kws:
                    matched_kws.append("Барселона")
            if any(k in text_for_check for k in ["испания", "spain", "испан"]):
                if "Испания" not in matched_kws:
                    matched_kws.append("Испания")
            if any(k in text_for_check for k in ["интер майами", "inter miami", "майами"]):
                if "Интер Майами" not in matched_kws:
                    matched_kws.append("Интер Майами")

        is_priority = (len(matched_kws) > 0 or is_final_or_winner or has_ukr_priority or has_f1_priority or has_football_priority) and not is_meme_or_ad and not is_operational_alert


        score = float(art.importance_score or 5.0)
        if is_operational_alert:
            score = min(score, 5.0)
        elif is_meme_or_ad and score > 4.0:
            score = 3.0
        elif is_final_or_winner and not is_meme_or_ad:
            score = max(score, 9.0)
        elif is_priority and score >= 6.0 and score < 8.5:
            score = 8.5

        # Strict rule: user is not interested in news below 5.1
        if score < 5.1:
            continue

        # Safeguard: Never display untranslated Ukrainian titles in the feed
        has_ukr_letters = any(c in "ієїґІЄЇҐ" for c in (art.title or ""))
        if has_ukr_letters and (cat_name == "Украина" or "novynaukr" in source_combined):
            continue

        # Require a valid AI summary
        if not art.summary or not art.summary.short_summary:
            continue

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


@app.delete("/api/news/category/{category_slug_or_name}")
async def delete_category_news(
    category_slug_or_name: str,
    session: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    """
    Удалить из базы данных все новости выбранной категории (или все новости, если передан 'all').
    Также удаляет локальные медиафайлы.
    """
    target = category_slug_or_name.strip()
    is_all = target.lower() in ["all", "все"]

    # Gather matching category IDs
    cat_ids = []
    if not is_all:
        cat_stmt = select(Category)
        cat_res = await session.execute(cat_stmt)
        categories = cat_res.scalars().all()
        t_low = target.lower()

        for c in categories:
            c_name_low = (c.name or "").lower()
            c_slug_low = (c.slug or "").lower()
            # Match directly or by common aliases
            if t_low in [c_name_low, c_slug_low]:
                cat_ids.append(c.id)
            elif (t_low == "it" or "it" in t_low or "разработ" in t_low or "программир" in t_low) and ("it" in c_name_low or "аналитик" in c_name_low):
                cat_ids.append(c.id)
            elif (t_low == "cs2" or "cs" in t_low or "игры" in t_low or "киберспорт" in t_low) and ("cs" in c_name_low or "игры" in c_name_low):
                cat_ids.append(c.id)
            elif ("украин" in t_low or "ukraine" in t_low) and "украин" in c_name_low:
                cat_ids.append(c.id)
            elif ("ai" in t_low or "нейро" in t_low) and ("ai" in c_name_low or "нейро" in c_name_low):
                cat_ids.append(c.id)
            elif ("linux" in t_low or "devops" in t_low) and ("linux" in c_name_low or "devops" in c_name_low):
                cat_ids.append(c.id)
            elif ("f1" in t_low or "формул" in t_low or "formula" in t_low) and ("f1" in c_name_low or "формул" in c_name_low):
                cat_ids.append(c.id)
            elif ("футбол" in t_low or "football" in t_low or "soccer" in t_low) and ("футбол" in c_name_low or "football" in c_name_low):
                cat_ids.append(c.id)
            elif "swiss" in t_low and "swiss" in c_name_low:
                cat_ids.append(c.id)

    # Build Article selection
    if is_all:
        stmt = select(Article)
    else:
        conditions = []
        if cat_ids:
            conditions.append(Article.category_id.in_(cat_ids))
        
        # Also match unassigned/source-inferred articles if matching category
        t_low = target.lower()
        if "it" in t_low:
            conditions.append(Article.source.has(Source.url.ilike("%habr%")))
            conditions.append(Article.source.has(Source.url.ilike("%tproger%")))
            conditions.append(Article.source.has(Source.name.ilike("%golang%")))
            conditions.append(Article.source.has(Source.name.ilike("%rust%")))
            conditions.append(Article.source.has(Source.name.ilike("%proglib%")))
        elif "cs" in t_low or "игры" in t_low:
            conditions.append(Article.source.has(Source.url.ilike("%csgo%")))
            conditions.append(Article.source.has(Source.url.ilike("%cs3%")))
            conditions.append(Article.source.has(Source.url.ilike("%clashroyalepin%")))
        elif "украин" in t_low or "ukraine" in t_low:
            conditions.append(Article.source.has(Source.name.ilike("%NovynaUKR%")))
            conditions.append(Article.source.has(Source.url.ilike("%NovynaUKR%")))
        elif "f1" in t_low or "formula" in t_low:
            conditions.append(Article.source.has(Source.url.ilike("%formula1.com%")))
        elif "футбол" in t_low or "football" in t_low:
            conditions.append(Article.source.has(Source.url.ilike("%marca%")))
            conditions.append(Article.source.has(Source.url.ilike("%as.com%")))
            conditions.append(Article.source.has(Source.url.ilike("%sportsru%")))
            conditions.append(Article.source.has(Source.url.ilike("%fabriziorom%")))
            conditions.append(Article.source.has(Source.url.ilike("%terrikon%")))
        elif "swiss" in t_low:
            conditions.append(Article.source.has(Source.name.ilike("%rts%")))
            conditions.append(Article.source.has(Source.name.ilike("%blick%")))
            conditions.append(Article.source.has(Source.name.ilike("%20minutes%")))

        if not conditions:
            return {"success": True, "deleted_count": 0, "category": target, "message": "Категория не найдена или уже пуста"}
        stmt = select(Article).options(selectinload(Article.source)).where(or_(*conditions))

    res = await session.execute(stmt)
    articles_to_delete = res.scalars().all()

    if not articles_to_delete:
        return {"success": True, "deleted_count": 0, "category": target, "message": "В данной категории нет новостей для удаления"}

    all_media_to_delete: Set[str] = set()
    from app.services.cleanup import extract_media_filenames, remove_media_files

    for art in articles_to_delete:
        raw_text = (art.raw_content or "") + " " + (art.cleaned_content or "")
        all_media_to_delete.update(extract_media_filenames(raw_text))
        await session.delete(art)

    await session.commit()

    if all_media_to_delete:
        remove_media_files(all_media_to_delete)

    return {
        "success": True,
        "deleted_count": len(articles_to_delete),
        "category": target,
        "message": f"Удалено {len(articles_to_delete)} новостей из категории '{target}'"
    }


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


@app.get("/api/quiz/next")
async def get_next_quiz(category: str = "ai", exclude: Optional[str] = None):
    """Return the next dynamic or pre-fetched AI quiz challenge."""
    from app.services.quiz_service import QuizService
    exclude_list = [item.strip() for item in exclude.split(",") if item.strip()] if exclude else []
    question_data = await QuizService.get_next_question(category, exclude_list)
    return question_data


import subprocess
import asyncio
from pydantic import BaseModel

class BatteryPayload(BaseModel):
    level: int
    is_charging: Optional[bool] = False
    temperature: Optional[float] = None
    voltage: Optional[float] = None


class DeviceCreatePayload(BaseModel):
    name: str
    category: str = "computers"
    icon: str = "laptop"
    ip: Optional[str] = ""
    tailscale_ip: Optional[str] = ""
    mac: Optional[str] = ""
    vendor: Optional[str] = ""
    location: Optional[str] = ""


class DeviceUpdatePayload(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    ip: Optional[str] = None
    tailscale_ip: Optional[str] = None
    mac: Optional[str] = None
    vendor: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


async def _async_ping(ip: str, timeout_sec: float = 0.8) -> tuple[bool, Optional[int]]:
    """Fast async ping checking if device or gateway is reachable and returns latency in ms."""
    if not ip or ip.strip() == "":
        return False, None
    clean_ip = ip.strip()
    
    # 1. If checking FRITZ!Box gateway, probe port 49000 or 80 fast
    if clean_ip in ("192.168.178.1", "192.168.1.1"):
        try:
            t0 = time.time()
            reader, writer = await asyncio.wait_for(asyncio.open_connection(clean_ip, 49000), timeout=timeout_sec)
            writer.close()
            await writer.wait_closed()
            dt_ms = max(1, int((time.time() - t0) * 1000))
            return True, dt_ms
        except Exception:
            pass

    # 2. Try ICMP ping if available
    try:
        t0 = time.time()
        proc = await asyncio.create_subprocess_exec(
            "ping", "-c", "1", "-W", str(int(max(1, timeout_sec))), clean_ip,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL
        )
        returncode = await asyncio.wait_for(proc.wait(), timeout=timeout_sec + 0.5)
        dt_ms = int((time.time() - t0) * 1000)
        if returncode == 0:
            return True, dt_ms
    except Exception:
        pass

    return False, None


def _get_tailscale_peer_map() -> Dict[str, Any]:
    """Retrieve live Tailscale peer statuses using unix socket or tailscale binary."""
    sock_path = Path("/var/run/tailscale/tailscaled.sock")
    peers = {}
    try:
        data = None
        # 1. First try unix socket (works inside Docker container if socket is mounted)
        if sock_path.exists():
            import httpx
            with httpx.Client(transport=httpx.HTTPTransport(uds=str(sock_path)), timeout=2.0) as client:
                resp = client.get("http://local-tailscaled.sock/localapi/v0/status")
                if resp.status_code == 200:
                    data = resp.json()
        
        # 2. Fallback to CLI command if socket not mounted
        if not data:
            res = subprocess.run(["tailscale", "status", "--json"], capture_output=True, text=True, timeout=2)
            if res.returncode == 0:
                import json
                data = json.loads(res.stdout)

        if data:
            # Self node
            self_node = data.get("Self", {})
            if self_node:
                for tip in self_node.get("TailscaleIPs", []):
                    peers[tip] = {"online": True, "last_seen": "online", "hostname": self_node.get("HostName", "")}
            # Other peers
            for k, p in data.get("Peer", {}).items():
                is_online = p.get("Online", False)
                last_seen = p.get("LastSeen", "")
                hname = p.get("HostName", "")
                for tip in p.get("TailscaleIPs", []):
                    peers[tip] = {"online": is_online, "last_seen": last_seen, "hostname": hname}
            return peers
    except Exception as e:
        pass
    return {}


@app.get("/api/devices")
async def get_managed_devices(session: AsyncSession = Depends(get_db_session)) -> Dict[str, Any]:
    """
    Получить реестр устройств пользователя с живым статусом (LAN ping + Tailscale status).
    Изолирует устройства пользователя от чужих устройств соседа.
    """
    ts_map = _get_tailscale_peer_map()

    # Query managed devices
    stmt = text("SELECT id, key_id, name, category, icon, vendor, location, ip, tailscale_ip, mac, is_my_device, connection, battery_level, battery_charging, battery_updated_at, is_online, ping_ms, last_seen, notes FROM managed_devices WHERE is_my_device = true ORDER BY id ASC")
    res = await session.execute(stmt)
    rows = res.fetchall()

    devices = []
    ping_tasks = []

    for r in rows:
        dev = {
            "id": r[0],
            "key_id": r[1],
            "name": r[2],
            "category": r[3],
            "icon": r[4],
            "vendor": r[5],
            "location": r[6],
            "ip": r[7],
            "tailscale_ip": r[8],
            "mac": r[9],
            "is_my_device": r[10],
            "connection": r[11],
            "battery_level": r[12],
            "battery_charging": r[13],
            "battery_updated_at": r[14].isoformat() if r[14] else None,
            "is_online": r[15],
            "ping_ms": r[16],
            "last_seen": r[17].isoformat() if r[17] else None,
            "notes": r[18],
        }
        devices.append(dev)
        # Target for ping: prioritize LAN IP, fallback to Tailscale IP
        target_ip = dev["ip"] or dev["tailscale_ip"]
        ping_tasks.append(_async_ping(target_ip))

    # Fast parallel ping check
    ping_results = await asyncio.gather(*ping_tasks, return_exceptions=True)

    online_count = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    for i, dev in enumerate(devices):
        # 1. Local LAN Ping result
        lan_res = ping_results[i] if (i < len(ping_results) and not isinstance(ping_results[i], Exception)) else (False, None)
        is_lan_online, ping_latency = lan_res

        # 2. Tailscale live check
        ts_peer = ts_map.get(dev["tailscale_ip"]) if dev["tailscale_ip"] else None
        is_ts_online = ts_peer.get("online", False) if ts_peer else False

        # Server node itself is always online
        if dev["key_id"] == "server_node":
            is_lan_online = True
            ping_latency = 1

        # Recent battery heartbeat (e.g. from Termux within 15 minutes) keeps device online
        is_battery_fresh = False
        if dev.get("battery_updated_at"):
            try:
                b_time = datetime.fromisoformat(dev["battery_updated_at"])
                if (datetime.now(timezone.utc) - b_time).total_seconds() < 900:
                    is_battery_fresh = True
            except Exception:
                pass

        is_online = is_lan_online or is_ts_online or is_battery_fresh
        dev["is_online"] = is_online
        dev["ping_ms"] = ping_latency if ping_latency is not None else ((3 if is_ts_online else 5) if is_online else None)
        if is_online:
            online_count += 1
            dev["last_seen"] = now_iso

    return {
        "devices": devices,
        "total": len(devices),
        "online_count": online_count,
        "offline_count": len(devices) - online_count,
        "updated_at": now_iso
    }


@app.get("/api/devices/nokia/battery")
@app.post("/api/devices/nokia/battery")
async def update_nokia_battery(
    request: Request,
    level: Optional[int] = None,
    charging: Optional[bool] = None,
    session: AsyncSession = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Эндпоинт для автоотправки процентов заряда батареи с телефона Nokia 6.1 (через Termux / curl / Tasker).
    Поддерживает как POST JSON/form, так и GET с параметрами ?level=85&charging=true.
    """
    bat_level = level
    bat_charging = charging if charging is not None else False

    if request.method == "POST":
        try:
            body = await request.json()
            if isinstance(body, dict):
                if "level" in body:
                    bat_level = int(body["level"])
                elif "percentage" in body:
                    bat_level = int(body["percentage"])
                if "is_charging" in body:
                    bat_charging = bool(body["is_charging"])
                elif "plugged" in body:
                    bat_charging = str(body["plugged"]).upper() != "UNPLUGGED"
        except Exception:
            pass

    if bat_level is None:
        raise HTTPException(status_code=400, detail="Missing battery 'level' (percentage)")

    now = datetime.now(timezone.utc)
    stmt = text("""
        UPDATE managed_devices 
        SET battery_level = :level, 
            battery_charging = :charging, 
            battery_updated_at = :updated_at,
            is_online = true,
            last_seen = :updated_at
        WHERE key_id = 'nokia_afk'
        RETURNING id, name, battery_level, battery_charging
    """)
    res = await session.execute(stmt, {
        "level": bat_level,
        "charging": bat_charging,
        "updated_at": now
    })
    await session.commit()
    row = res.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Nokia device not found in database")

    return {
        "success": True,
        "device": row[1],
        "battery_level": row[2],
        "battery_charging": row[3],
        "message": f"Battery updated to {row[2]}%"
    }


@app.post("/api/devices")
async def add_managed_device(
    payload: DeviceCreatePayload,
    session: AsyncSession = Depends(get_db_session)
) -> Dict[str, Any]:
    """Добавить новое устройство (новый ноутбук, NAS или гаджет)."""
    import uuid
    key_id = f"dev_{uuid.uuid4().hex[:8]}"
    stmt = text("""
        INSERT INTO managed_devices (key_id, name, category, icon, vendor, location, ip, tailscale_ip, mac, is_my_device)
        VALUES (:key_id, :name, :category, :icon, :vendor, :location, :ip, :tailscale_ip, :mac, true)
        RETURNING id, key_id, name
    """)
    res = await session.execute(stmt, {
        "key_id": key_id,
        "name": payload.name,
        "category": payload.category,
        "icon": payload.icon,
        "vendor": payload.vendor or "",
        "location": payload.location or "",
        "ip": payload.ip or "",
        "tailscale_ip": payload.tailscale_ip or "",
        "mac": payload.mac or ""
    })
    await session.commit()
    row = res.fetchone()
    return {"success": True, "device_id": row[0], "key_id": row[1], "name": row[2]}


@app.put("/api/devices/{device_id}")
async def update_managed_device(
    device_id: int,
    payload: DeviceUpdatePayload,
    session: AsyncSession = Depends(get_db_session)
) -> Dict[str, Any]:
    """Обновить параметры устройства (IP, имя, локацию, заметки)."""
    fields = []
    params: Dict[str, Any] = {"id": device_id}
    if payload.name is not None:
        fields.append("name = :name")
        params["name"] = payload.name
    if payload.category is not None:
        fields.append("category = :category")
        params["category"] = payload.category
    if payload.icon is not None:
        fields.append("icon = :icon")
        params["icon"] = payload.icon
    if payload.ip is not None:
        fields.append("ip = :ip")
        params["ip"] = payload.ip
    if payload.tailscale_ip is not None:
        fields.append("tailscale_ip = :tailscale_ip")
        params["tailscale_ip"] = payload.tailscale_ip
    if payload.mac is not None:
        fields.append("mac = :mac")
        params["mac"] = payload.mac
    if payload.vendor is not None:
        fields.append("vendor = :vendor")
        params["vendor"] = payload.vendor
    if payload.location is not None:
        fields.append("location = :location")
        params["location"] = payload.location
    if payload.notes is not None:
        fields.append("notes = :notes")
        params["notes"] = payload.notes

    if not fields:
        return {"success": True, "message": "No fields to update"}

    stmt = text(f"UPDATE managed_devices SET {', '.join(fields)} WHERE id = :id RETURNING id, name")
    res = await session.execute(stmt, params)
    await session.commit()
    row = res.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Device not found")

    return {"success": True, "device_id": row[0], "name": row[1]}


@app.get("/api/router/stats")
async def get_router_stats() -> Dict[str, Any]:
    """Получить статус подключения к роутеру FRITZ!Box и скорость интернета."""
    fritz_ip = "192.168.178.1"
    is_up, ping_ms = await _async_ping(fritz_ip, timeout_sec=0.5)

    return {
        "router": "FRITZ!Box",
        "gateway_ip": fritz_ip,
        "is_online": is_up,
        "ping_ms": ping_ms or 2,
        "port": 49000,
        "status": "online" if is_up else "offline",
        "speed_down": "500 Mb/s",
        "speed_up": "100 Mb/s",
        "updated_at": datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
    }

