import asyncio
import logging
import os
import time
from typing import Any, Dict, List, Optional, Tuple
from aiogram import Bot
import httpx

from app.config import settings

logger = logging.getLogger("news_ai.container_monitor")

# In-memory tracking of container states
# Structure: {container_name: {"id": str, "state": str, "status": str, "exit_code": int, "crashed": bool, "down_since": float}}
_previous_states: Dict[str, Dict[str, Any]] = {}
_alert_timestamps: Dict[str, float] = {}
_first_check_done: bool = False

# Known project mapping: name/compose label -> (Title, Emoji)
KNOWN_PROJECTS = {
    "tech-trainer": ("Tech Trainer", "🏋️‍♂️"),
    "jellyfin-spotify": ("Jellyfin & Spotify", "🎵"),
    "films-list": ("Films List", "🎬"),
    "recipe-app": ("Recipe App", "🍳"),
    "gym-tracker": ("Gym Tracker", "🏃"),
    "news-ai": ("AI News", "🤖"),
}


def get_project_metadata(container_name: str, labels: Dict[str, str]) -> Tuple[str, str]:
    """
    Identifies human-readable project title and emoji from container name and labels.
    """
    c_name = container_name.lstrip("/").lower()
    compose_proj = labels.get("com.docker.compose.project", "").lower()

    if compose_proj in KNOWN_PROJECTS:
        return KNOWN_PROJECTS[compose_proj]

    if "tech-trainer" in c_name:
        return "Tech Trainer", "🏋️‍♂️"
    if "jellyfin" in c_name or "spotify" in c_name:
        return "Jellyfin & Spotify", "🎵"
    if "films" in c_name:
        return "Films List", "🎬"
    if "recipe" in c_name:
        return "Recipe App", "🍳"
    if "gym" in c_name:
        return "Gym Tracker", "🏃"
    if c_name.startswith("news_ai_"):
        return "AI News", "🤖"
    if "glances" in c_name:
        return "System Monitor", "📊"

    if compose_proj:
        return compose_proj.capitalize(), "📦"
    return "Standalone Service", "📦"


def is_legacy_or_ignored(c: Dict[str, Any]) -> bool:
    """
    Filter out ancient one-off test containers like 'hello-world' from months ago.
    """
    image = c.get("Image", "").lower()
    c_name = (c.get("Names", [""])[0] if c.get("Names") else "").lower()
    status = c.get("Status", "").lower()

    # Ignore hello-world or test containers stopped months ago
    if "hello-world" in image or "inspiring_keldysh" in c_name:
        return True
    if "months ago" in status and c.get("State") == "exited":
        return True
    return False


async def get_docker_client(sock_path: Optional[str] = None) -> httpx.AsyncClient:
    """Returns an async HTTP client connected to the Docker UDS socket."""
    socket_path = sock_path or getattr(settings, "DOCKER_SOCKET_PATH", "/var/run/docker.sock")
    transport = httpx.AsyncHTTPTransport(uds=socket_path)
    return httpx.AsyncClient(transport=transport, timeout=6.0)


async def fetch_all_containers(sock_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches all containers from Docker daemon via Unix socket."""
    socket_path = sock_path or getattr(settings, "DOCKER_SOCKET_PATH", "/var/run/docker.sock")
    if not os.path.exists(socket_path):
        logger.debug("Docker socket '%s' not found.", socket_path)
        return []

    try:
        async with await get_docker_client(socket_path) as client:
            resp = await client.get("http://docker/containers/json?all=1")
            if resp.status_code == 200:
                containers = resp.json()
                return [c for c in containers if not is_legacy_or_ignored(c)]
    except Exception as e:
        logger.warning("Failed to query Docker daemon via socket: %s", e)

    return []


async def fetch_container_details(container_id: str, sock_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Fetches full inspect JSON for a specific container."""
    socket_path = sock_path or getattr(settings, "DOCKER_SOCKET_PATH", "/var/run/docker.sock")
    try:
        async with await get_docker_client(socket_path) as client:
            resp = await client.get(f"http://docker/containers/{container_id}/json")
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.debug("Failed to inspect container %s: %s", container_id, e)
    return None


async def fetch_container_logs(container_id: str, tail: int = 8, sock_path: Optional[str] = None) -> str:
    """Fetches the last N lines of stdout/stderr logs from a container."""
    socket_path = sock_path or getattr(settings, "DOCKER_SOCKET_PATH", "/var/run/docker.sock")
    try:
        async with await get_docker_client(socket_path) as client:
            resp = await client.get(f"http://docker/containers/{container_id}/logs?stdout=1&stderr=1&tail={tail}")
            if resp.status_code == 200:
                raw_bytes = resp.content
                lines = []
                for chunk in raw_bytes.split(b"\n"):
                    # Strip Docker stream header (first 8 bytes: type, 0, 0, 0, size)
                    if len(chunk) > 8 and (chunk[0] in (1, 2)):
                        chunk = chunk[8:]
                    text = chunk.decode("utf-8", errors="ignore").strip()
                    if text:
                        lines.append(text)
                return "\n".join(lines[-tail:])
    except Exception as e:
        logger.debug("Failed to fetch logs for container %s: %s", container_id, e)
    return ""


async def check_containers_job(bot: Bot, force_alert: bool = False):
    """
    APScheduler periodic job:
    Monitors all Docker containers across all homelab projects on petroprog.
    Alerts admin when any container crashes, exits with error, or gets OOM killed.
    Sends recovery confirmation when it comes back up.
    """
    global _previous_states, _alert_timestamps, _first_check_done

    admin_id = settings.TELEGRAM_ADMIN_CHAT_ID
    if not admin_id:
        return

    containers = await fetch_all_containers()
    if not containers:
        return

    now = time.time()
    cooldown_seconds = getattr(settings, "CONTAINER_COOLDOWN_MINUTES", 10) * 60

    # 1. On first run after bot start, record initial state without alerting
    if not _first_check_done:
        for c in containers:
            name = c.get("Names", [""])[0].lstrip("/")
            state = c.get("State", "")
            _previous_states[name] = {
                "id": c.get("Id", ""),
                "state": state,
                "status": c.get("Status", ""),
                "crashed": False,
                "down_since": 0.0,
            }
        _first_check_done = True
        logger.info("Container monitor initialized: tracking %d containers.", len(_previous_states))
        return

    current_names = set()

    for c in containers:
        name = c.get("Names", [""])[0].lstrip("/")
        c_id = c.get("Id", "")
        current_names.add(name)

        curr_state = c.get("State", "").lower()
        curr_status = c.get("Status", "")
        labels = c.get("Labels", {})
        proj_title, proj_emoji = get_project_metadata(name, labels)

        prev = _previous_states.get(name)

        # A. DETECT CRASH / ABNORMAL EXIT
        # Container was running (or restarting) and is now exited or dead
        if prev and prev.get("state") in ("running", "restarting") and curr_state in ("exited", "dead"):
            # Inspect details for exit code and OOM status
            details = await fetch_container_details(c_id)
            state_info = (details or {}).get("State", {})
            exit_code = state_info.get("ExitCode", 0)
            oom_killed = state_info.get("OOMKilled", False)
            error_text = state_info.get("Error", "")

            # If exit code != 0 or OOM killed or unexpected exit
            # Note: exit code 0 can also be an alert if it was supposed to run continuously
            is_error = exit_code != 0 or oom_killed or bool(error_text)

            time_since_last_alert = now - _alert_timestamps.get(name, 0.0)
            if time_since_last_alert >= cooldown_seconds or force_alert:
                logs = await fetch_container_logs(c_id, tail=8)

                reason_str = "Нештатное завершение (Error)"
                if oom_killed or exit_code == 137:
                    reason_str = "💥 OOM Killed (Нехватка оперативной памяти)"
                elif exit_code == 1:
                    reason_str = "🛑 Сбой приложения (Application Exception)"
                elif exit_code == 143:
                    reason_str = "🛑 Остановлен сигналом SIGTERM"
                elif error_text:
                    reason_str = f"🛑 Ошибка: {error_text[:100]}"

                logs_block = f"\n\n📋 <b>Последние строки логов:</b>\n<pre><code>{logs}</code></pre>" if logs else ""

                msg = (
                    f"🚨 <b>АВАРИЙНАЯ ОСТАНОВКА КОНТЕЙНЕРА!</b>\n\n"
                    f"• <b>Проект:</b> {proj_emoji} <b>{proj_title}</b>\n"
                    f"• <b>Контейнер:</b> <code>{name}</code>\n"
                    f"• <b>Статус:</b> <code>{curr_status}</code>\n"
                    f"• <b>Код завершения:</b> <code>Exit Code {exit_code}</code>\n"
                    f"• <b>Причина:</b> {reason_str}"
                    f"{logs_block}\n\n"
                    f"⚙️ <i>Политика перезапуска: Docker пытается восстановить контейнер (если настроен restart: unless-stopped).</i>"
                )

                try:
                    await bot.send_message(chat_id=admin_id, text=msg, parse_mode="HTML")
                    _alert_timestamps[name] = now
                    logger.error("Container crash alert sent for %s (%s, Exit Code: %d)", name, proj_title, exit_code)
                except Exception as e:
                    logger.error("Failed to send container alert: %s", e)

            _previous_states[name] = {
                "id": c_id,
                "state": curr_state,
                "status": curr_status,
                "crashed": True,
                "down_since": prev.get("down_since") or now,
            }
            continue

        # B. DETECT RECOVERY
        # Container was crashed/exited and is now running again
        if prev and prev.get("crashed") and curr_state == "running":
            down_since = prev.get("down_since", now)
            downtime_sec = max(1, int(now - down_since))
            downtime_str = (
                f"{downtime_sec // 60} мин {downtime_sec % 60} сек"
                if downtime_sec >= 60
                else f"{downtime_sec} сек"
            )

            msg = (
                f"🟢 <b>КОНТЕЙНЕР ВОССТАНОВЛЕН</b>\n\n"
                f"• <b>Проект:</b> {proj_emoji} <b>{proj_title}</b>\n"
                f"• <b>Контейнер:</b> <code>{name}</code>\n"
                f"• <b>Статус:</b> 🟢 Running (<code>{curr_status}</code>)\n"
                f"• <b>Время простоя:</b> {downtime_str}\n\n"
                f"✅ <i>Сервис успешно перезапустился и работает в штатном режиме.</i>"
            )

            try:
                await bot.send_message(chat_id=admin_id, text=msg, parse_mode="HTML")
                logger.info("Container recovery notice sent for %s (%s)", name, proj_title)
            except Exception as e:
                logger.error("Failed to send recovery notice: %s", e)

            _previous_states[name] = {
                "id": c_id,
                "state": curr_state,
                "status": curr_status,
                "crashed": False,
                "down_since": 0.0,
            }
            continue

        # C. NORMAL UPDATE
        _previous_states[name] = {
            "id": c_id,
            "state": curr_state,
            "status": curr_status,
            "crashed": prev.get("crashed", False) if prev else False,
            "down_since": prev.get("down_since", 0.0) if prev else 0.0,
        }


async def format_all_containers_status() -> str:
    """
    Formats a clean grouped summary of all running and configured containers
    for the /containers Telegram command.
    """
    containers = await fetch_all_containers()
    if not containers:
        return "❌ Не удалось получить список контейнеров с Docker-демона."

    # Group by project
    grouped: Dict[str, Tuple[str, List[Dict[str, Any]]]] = {}

    for c in containers:
        name = c.get("Names", [""])[0].lstrip("/")
        labels = c.get("Labels", {})
        proj_title, proj_emoji = get_project_metadata(name, labels)

        if proj_title not in grouped:
            grouped[proj_title] = (proj_emoji, [])
        grouped[proj_title][1].append(c)

    lines = ["📊 <b>СТАТУС ВСЕХ КОНТЕЙНЕРОВ ХОСТА</b>\n"]

    total_up = 0
    total_count = len(containers)

    for proj_title, (emoji, c_list) in sorted(grouped.items(), key=lambda x: x[0]):
        lines.append(f"{emoji} <b>{proj_title}:</b>")
        for c in sorted(c_list, key=lambda x: x.get("Names", [""])[0]):
            name = c.get("Names", [""])[0].lstrip("/")
            state = c.get("State", "").lower()
            status = c.get("Status", "")

            if state == "running":
                total_up += 1
                state_badge = "🟢"
            elif state in ("restarting", "created"):
                state_badge = "🟡"
            else:
                state_badge = "🔴"

            # Clean short status
            short_status = status.replace("Up ", "").replace("Exited ", "Off ")
            lines.append(f"  {state_badge} <code>{name}</code>: {short_status}")
        lines.append("")

    lines.append(f"<b>Всего активно:</b> <code>{total_up}/{total_count}</code> контейнеров")
    return "\n".join(lines)
