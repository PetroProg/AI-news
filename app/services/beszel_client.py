import asyncio
import logging
import time
from typing import Any, Dict, List, Optional
import httpx

logger = logging.getLogger("news_ai.beszel")

BESZEL_URL = "http://172.18.0.1:8090"
ADMIN_EMAIL = "admin@petroprog.local"
ADMIN_PASS = "Qwerty_1234"

_token: Optional[str] = None
_token_expires_at: float = 0
_system_id: Optional[str] = None


async def get_beszel_token(client: httpx.AsyncClient) -> Optional[str]:
    """Authenticates to Beszel Hub using superuser credentials and caches token."""
    global _token, _token_expires_at
    if _token and time.time() < _token_expires_at:
        return _token

    try:
        resp = await client.post(
            f"{BESZEL_URL}/api/collections/_superusers/auth-with-password",
            json={"identity": ADMIN_EMAIL, "password": ADMIN_PASS},
            timeout=2.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            _token = data.get("token")
            _token_expires_at = time.time() + 86400
            return _token
        logger.warning("Beszel auth failed: %s %s", resp.status_code, resp.text)
    except Exception as e:
        logger.debug("Beszel hub connection error: %s", e)
    return None


async def get_server_beszel_metrics() -> Optional[Dict[str, Any]]:
    """
    Fetches live and historical performance metrics from Beszel Hub for 'Ноутбук-сервер'.
    Returns structured metrics including sparkline series for CPU, RAM, and Disk.
    """
    global _system_id
    try:
        async with httpx.AsyncClient(timeout=2.5) as client:
            token = await get_beszel_token(client)
            if not token:
                return None

            headers = {"Authorization": token}

            # 1. Resolve system ID if not cached
            if not _system_id:
                sys_resp = await client.get(
                    f"{BESZEL_URL}/api/collections/systems/records",
                    headers=headers,
                )
                if sys_resp.status_code == 200:
                    items = sys_resp.json().get("items", [])
                    for it in items:
                        if "сервер" in it.get("name", "").lower() or "petroprog" in it.get("name", "").lower() or it.get("host") in ("127.0.0.1", "localhost"):
                            _system_id = it.get("id")
                            break
                    if not _system_id and items:
                        _system_id = items[0].get("id")

            if not _system_id:
                return None

            # 2. Get system details & live info
            sys_detail_resp = await client.get(
                f"{BESZEL_URL}/api/collections/systems/records/{_system_id}",
                headers=headers,
            )
            if sys_detail_resp.status_code != 200:
                return None

            sys_data = sys_detail_resp.json()
            info = sys_data.get("info") or {}

            # 3. Get recent time-series stats (for sparklines)
            stats_resp = await client.get(
                f"{BESZEL_URL}/api/collections/system_stats/records",
                params={
                    "filter": f"system='{_system_id}'",
                    "sort": "-created",
                    "limit": 20,
                },
                headers=headers,
            )
            raw_records = []
            if stats_resp.status_code == 200:
                raw_records = stats_resp.json().get("items", [])

            chrono_records = list(reversed(raw_records))

            cpu_sparkline: List[float] = []
            ram_sparkline: List[float] = []
            disk_sparkline: List[float] = []

            for r in chrono_records:
                st = r.get("stats") or {}
                if "cpu" in st:
                    cpu_sparkline.append(round(float(st["cpu"]), 1))
                if "mp" in st:
                    ram_sparkline.append(round(float(st["mp"]), 1))
                if "dp" in st:
                    disk_sparkline.append(round(float(st["dp"]), 1))

            cur_cpu = round(float(info.get("cpu", 0.0)), 1)
            cur_ram_pct = round(float(info.get("mp", 0.0)), 1)
            cur_disk_pct = round(float(info.get("dp", 0.0)), 1)

            if not cpu_sparkline or cpu_sparkline[-1] != cur_cpu:
                cpu_sparkline.append(cur_cpu)
            if not ram_sparkline or ram_sparkline[-1] != cur_ram_pct:
                ram_sparkline.append(cur_ram_pct)
            if not disk_sparkline or disk_sparkline[-1] != cur_disk_pct:
                disk_sparkline.append(cur_disk_pct)

            temps = []
            if chrono_records:
                latest_st = chrono_records[-1].get("stats") or {}
                t_dict = latest_st.get("t") or {}
                if isinstance(t_dict, dict):
                    temps = [v for v in t_dict.values() if isinstance(v, (int, float))]
            max_temp = int(max(temps)) if temps else None

            total_ram_gb = 3.23
            used_ram_gb = round(total_ram_gb * (cur_ram_pct / 100.0), 2)

            total_disk_gb = 97.9
            used_disk_gb = round(total_disk_gb * (cur_disk_pct / 100.0), 1)

            u_sec = info.get("u", 0)
            days = u_sec // 86400
            hours = (u_sec % 86400) // 3600
            mins = (u_sec % 3600) // 60
            if days > 0:
                uptime_str = f"{days}д {hours}ч"
            else:
                uptime_str = f"{hours}:{mins:02d}"

            la = info.get("la") or [0.0, 0.0, 0.0]
            load_min1 = round(float(la[0]), 2) if len(la) > 0 else 0.0

            wf = info.get("wf") or {}
            wifi_dbm = None
            if isinstance(wf, dict):
                for k, v in wf.items():
                    if isinstance(v, (int, float)):
                        wifi_dbm = int(v)
                    elif isinstance(v, dict) and "r" in v:
                        wifi_dbm = int(v["r"])

            return {
                "source": "beszel",
                "system_id": _system_id,
                "cpu": {
                    "percent": cur_cpu,
                    "temp_c": max_temp,
                    "cores": info.get("t", 2),
                    "sparkline": cpu_sparkline[-20:],
                },
                "memory": {
                    "percent": cur_ram_pct,
                    "used_gb": used_ram_gb,
                    "total_gb": total_ram_gb,
                    "sparkline": ram_sparkline[-20:],
                },
                "disk": {
                    "percent": cur_disk_pct,
                    "used_gb": used_disk_gb,
                    "total_gb": total_disk_gb,
                    "sparkline": disk_sparkline[-20:],
                },
                "load": {
                    "min1": load_min1,
                    "min5": round(float(la[1]), 2) if len(la) > 1 else 0.0,
                    "min15": round(float(la[2]), 2) if len(la) > 2 else 0.0,
                },
                "uptime": uptime_str,
                "wifi_dbm": wifi_dbm,
                "is_online": sys_data.get("status") == "up",
            }
    except Exception as e:
        logger.error("Failed to fetch Beszel metrics: %s", e)
        return None