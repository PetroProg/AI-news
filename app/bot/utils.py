import socket
import re
from typing import List
from app.config import settings

def send_wake_on_lan(
    mac_address: str | None = None,
    broadcast_ip: str | None = None,
    port: int = 9,
    repeat: int = 6,
    interval: float = 0.15,
) -> bool:
    """Sends a robust burst-train of Wake-on-LAN magic packets over network interfaces.
    
    A single packet is often dropped or ignored when transmitting over Wi-Fi or when the
    sleeping target NIC has its PHY clock in low-power idle. Sending 5-6 spaced bursts
    (every 150ms) guarantees that the first packet wakes the NIC's PHY and router buffers,
    while subsequent packets cleanly match the hardware pattern filter and power on the ATX PSU.
    """
    import logging
    import time
    logger = logging.getLogger("news_ai.bot.utils")
    mac = mac_address or settings.WOL_MAC_ADDRESS
    bcast = broadcast_ip or settings.WOL_BROADCAST_IP

    clean_mac = re.sub(r"[^0-9A-Fa-f]", "", mac)
    if len(clean_mac) != 12:
        logger.error("Invalid MAC address for WoL: %s", mac)
        return False

    magic_packet = bytes.fromhex("FF" * 6 + clean_mac * 16)

    # Discover known local IP from ARP table if present
    target_unicast_ip = None
    try:
        with open("/proc/net/arp", "r", encoding="utf-8") as f:
            for line in f.readlines()[1:]:
                parts = line.split()
                if len(parts) >= 4:
                    ip_candidate, hw_addr = parts[0], parts[3]
                    clean_hw = re.sub(r"[^0-9A-Fa-f]", "", hw_addr).lower()
                    if clean_hw and clean_hw == clean_mac.lower():
                        target_unicast_ip = ip_candidate
                        break
    except Exception:
        pass

    # Build targets across ports 9 (standard WoL) and 7 (Echo/Discard WoL)
    targets = [
        (bcast, 9),
        (bcast, 7),
        ("255.255.255.255", 9),
        ("255.255.255.255", 7),
    ]
    if target_unicast_ip:
        targets.extend([
            (target_unicast_ip, 9),
            (target_unicast_ip, 7),
        ])

    sent_any = False
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        for burst_idx in range(repeat):
            for target_ip, target_port in targets:
                try:
                    sock.sendto(magic_packet, (target_ip, target_port))
                    sent_any = True
                except Exception as exc:
                    logger.debug("Failed sending WoL to %s:%s: %s", target_ip, target_port, exc)

            if burst_idx < repeat - 1 and interval > 0:
                time.sleep(interval)

    if sent_any:
        target_str = f"{bcast}, 255.255.255.255" + (f", {target_unicast_ip}" if target_unicast_ip else "")
        logger.info(
            "Wake-on-LAN: Sent burst of %d wave packets for MAC %s to [%s]",
            repeat, mac, target_str
        )
        return True
    return False

def split_message(text: str, max_length: int = 4000) -> List[str]:
    """
    Splits long markdown text into chunks <= max_length characters,
    preserving paragraph and newline boundaries.
    """
    if len(text) <= max_length:
        return [text]

    chunks = []
    lines = text.split("\n")
    current_chunk = []
    current_length = 0

    for line in lines:
        line_len = len(line) + 1  # include newline
        if current_length + line_len > max_length and current_chunk:
            chunks.append("\n".join(current_chunk))
            current_chunk = [line]
            current_length = line_len
        else:
            current_chunk.append(line)
            current_length += line_len

    if current_chunk:
        chunks.append("\n".join(current_chunk))

    return chunks


async def get_windows_idle_info(
    host: str | None = None,
    user: str | None = None,
    key_path: str | None = None,
) -> dict | None:
    """Queries the Windows PC via SSH to get detailed user input and uptime stats.

    Uses the scheduled task `CheckUserIdle` (running interactively in Session 1)
    to query the Win32 `GetLastInputInfo` API.
    Returns a dict with:
      - idle_sec (float)
      - idle_min (float)
      - uptime_sec (float)
      - uptime_min (float)
      - dw_time (int)
      - tick_count (int)
    or None if query failed.
    """
    import json
    import logging
    import asyncssh

    logger = logging.getLogger("news_ai.bot.utils")
    ssh_host = host or settings.WINDOWS_SSH_HOST
    ssh_user = user or settings.WINDOWS_SSH_USER
    ssh_key = key_path or settings.WINDOWS_SSH_KEY_PATH

    try:
        async with asyncssh.connect(
            ssh_host,
            username=ssh_user,
            client_keys=[ssh_key],
            known_hosts=None,
            connect_timeout=6.0,
            encoding=None,
        ) as conn:
            cmd = r'cmd.exe /c "chcp 65001 >nul && schtasks /run /tn CheckUserIdle && ping 127.0.0.1 -n 2 >nul && type C:\Users\Admin\Desktop\project-news\idle.txt"'
            res = await conn.run(cmd, timeout=8.0)
            raw_bytes = res.stdout if isinstance(res.stdout, bytes) else (res.stdout or "").encode()
            output = raw_bytes.decode("utf-8", errors="ignore")

            for line in reversed(output.splitlines()):
                line = line.strip()
                if line.startswith("{") and line.endswith("}"):
                    try:
                        return json.loads(line)
                    except Exception:
                        continue
                # Fallback for plain float
                try:
                    val = float(line.replace(",", "."))
                    return {
                        "idle_sec": val * 60.0,
                        "idle_min": val,
                        "uptime_sec": 999999.0,
                        "uptime_min": 16666.0,
                        "dw_time": 0,
                        "tick_count": 0,
                    }
                except ValueError:
                    continue

            logger.warning("Could not parse idle stats from CheckUserIdle on %s. Raw output: %r", ssh_host, output)
            return None
    except Exception as exc:
        logger.warning("Could not query user idle stats on %s via SSH: %s", ssh_host, exc)
        return None


async def is_windows_user_active(
    host: str | None = None,
    user: str | None = None,
    key_path: str | None = None,
    max_idle_minutes: int = 5,
    initial_dw_time: int | None = None,
) -> bool:
    """Checks via SSH whether an interactive console user is actively using the Windows PC.

    Accounts for machine uptime and startup initialization:
    1. If initial_dw_time was captured at wake-up and hasn't changed -> False (zero input events)
    2. If PC is freshly booted (uptime < max_idle_minutes) and last input was during system boot (<= 90s) -> False
    3. If PC has been running normally (uptime >= max_idle_minutes): user active if idle_min < max_idle_minutes
    """
    import logging
    logger = logging.getLogger("news_ai.bot.utils")
    ssh_host = host or settings.WINDOWS_SSH_HOST

    info = await get_windows_idle_info(host=host, user=user, key_path=key_path)
    if not info:
        return False

    idle_sec = float(info.get("idle_sec", 0.0))
    idle_min = float(info.get("idle_min", idle_sec / 60.0))
    uptime_sec = float(info.get("uptime_sec", 999999.0))
    uptime_min = float(info.get("uptime_min", uptime_sec / 60.0))
    dw_time = int(info.get("dw_time", 0))

    # 1. Delta check: If baseline dw_time was recorded when PC came online, and it has not changed,
    # zero physical input events have occurred while pipeline was running.
    if initial_dw_time is not None and dw_time != 0 and dw_time == initial_dw_time:
        logger.info(
            "Windows PC %s has zero new input events since wake-up (dw_time unchanged: %d). User is NOT active.",
            ssh_host, dw_time
        )
        return False

    # 2. Fresh boot / wake check:
    # If the PC has only been awake for less than max_idle_minutes, idle_min cannot possibly reach max_idle_minutes.
    # Check if the last input occurred during system boot/logon (first 90s of uptime).
    if uptime_min < max_idle_minutes:
        last_input_uptime_sec = uptime_sec - idle_sec
        if last_input_uptime_sec <= 90.0:
            logger.info(
                "Windows PC %s freshly booted (uptime %.1fm); last input was system startup at %.1fs. User is NOT active.",
                ssh_host, uptime_min, last_input_uptime_sec
            )
            return False
        else:
            # Input occurred AFTER startup sequence. Check if it was recent (< 3 min)
            if idle_sec < 180.0:
                logger.info(
                    "Windows user activity detected on %s: active input after boot (idle %.1fs < 180s).",
                    ssh_host, idle_sec
                )
                return True
            else:
                logger.info(
                    "Windows PC on %s idle since last activity (idle %.1fs >= 180s).",
                    ssh_host, idle_sec
                )
                return False

    # 3. Standard check for PC that has been online for a while (uptime >= max_idle_minutes)
    if idle_sec < 60.0:
        logger.info("Windows user actively at PC on %s: input detected %.1fs ago.", ssh_host, idle_sec)
        return True

    if idle_min < max_idle_minutes:
        logger.info(
            "Windows user activity detected on %s: idle for %.1f min (< threshold %d min).",
            ssh_host, idle_min, max_idle_minutes
        )
        return True

    logger.info("No active user interaction on %s: idle for %.1f min (>= threshold %d min).", ssh_host, idle_min, max_idle_minutes)
    return False


async def send_remote_sleep(
    host: str | None = None,
    user: str | None = None,
    key_path: str | None = None,
    force: bool = False,
    max_idle_minutes: int = 10,
) -> bool:
    """Sends a remote command over SSH to put the Windows PC into S3 sleep.

    If force=False, it performs an activity check first. If user activity is detected,
    sleep is safely cancelled to prevent interrupting their work.
    """
    import asyncio
    import logging
    import asyncssh
    logger = logging.getLogger("news_ai.bot.utils")

    ssh_host = host or settings.WINDOWS_SSH_HOST
    ssh_user = user or settings.WINDOWS_SSH_USER
    ssh_key = key_path or settings.WINDOWS_SSH_KEY_PATH

    if not force:
        logger.info("Checking if user is active on %s before sleep...", ssh_host)
        user_active = await is_windows_user_active(
            host=ssh_host,
            user=ssh_user,
            key_path=ssh_key,
            max_idle_minutes=max_idle_minutes,
        )
        if user_active:
            logger.warning("Sleep CANCELLED: user is currently active on %s!", ssh_host)
            return False

    logger.info("Sending remote sleep command to %s@%s...", ssh_user, ssh_host)
    try:
        async with asyncssh.connect(
            ssh_host,
            username=ssh_user,
            client_keys=[ssh_key],
            known_hosts=None,
            connect_timeout=6.0,
        ) as conn:
            try:
                await asyncio.wait_for(
                    conn.run("rundll32.exe powrprof.dll,SetSuspendState 0,1,0"),
                    timeout=3.0
                )
            except (asyncio.TimeoutError, asyncssh.Error, OSError):
                # When Windows enters S3 sleep, socket drops immediately
                pass
        logger.info("Remote sleep signal successfully dispatched to %s.", ssh_host)
        return True
    except Exception as exc:
        logger.error("Failed to send remote sleep to %s: %s", ssh_host, exc)
        return False


async def check_gpu_load(
    host: str | None = None,
    user: str | None = None,
    key_path: str | None = None,
    samples: int = 3,
    interval_sec: float = 3.0,
) -> int | None:
    """Checks the real 3D/compute GPU utilization on the Windows PC via SSH.

    Queries `utilization.gpu,pstate,clocks.current.graphics,power.draw`.
    Note: In idle desktop states (P8/P5 at 210-405 MHz), `nvidia-smi` reports
    20-40% utilization relative to the 210 MHz clock (which is only ~2-4% of
    the GPU's actual 1800+ MHz P0 capacity). We normalize utilization by clock
    when in low-power P-states so desktop apps (DWM, Steam helper, browsers)
    never falsely trigger gaming detection.
    """
    import asyncio
    import logging
    import asyncssh

    logger = logging.getLogger("news_ai.bot.utils")
    ssh_host = host or settings.WINDOWS_SSH_HOST
    ssh_user = user or settings.WINDOWS_SSH_USER
    ssh_key = key_path or settings.WINDOWS_SSH_KEY_PATH
    threshold = getattr(settings, "GPU_LOAD_THRESHOLD", 15)

    try:
        async with asyncssh.connect(
            ssh_host,
            username=ssh_user,
            client_keys=[ssh_key],
            known_hosts=None,
            connect_timeout=6.0,
        ) as conn:
            readings: list[int] = []
            raw_details: list[str] = []
            for i in range(max(1, samples)):
                res = await conn.run(
                    'nvidia-smi "--query-gpu=utilization.gpu,pstate,clocks.current.graphics,power.draw" "--format=csv,noheader,nounits"',
                    term_type="vt100",
                )
                output = res.stdout or ""
                cleaned = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]|\x1b\].*?\x07', '', output).strip()
                lines = [ln.strip() for ln in cleaned.splitlines() if ln.strip() and "," in ln]
                if not lines:
                    m = re.search(r'\d+', cleaned)
                    if not m:
                        return None
                    val = int(m.group(0))
                    readings.append(val)
                else:
                    parts = [p.strip() for p in lines[-1].split(",")]
                    raw_util = int(re.search(r'\d+', parts[0]).group(0)) if len(parts) > 0 and re.search(r'\d+', parts[0]) else 0
                    pstate = parts[1].upper() if len(parts) > 1 else "P0"
                    clock_mhz = int(re.search(r'\d+', parts[2]).group(0)) if len(parts) > 2 and re.search(r'\d+', parts[2]) else 1800
                    power_str = parts[3] if len(parts) > 3 else "0"

                    # If in low-power idle states (P8/P5/P4/P3 or clock < 800 MHz), normalize against 1800 MHz P0 clock
                    if pstate not in ("P0", "P1", "P2") or clock_mhz < 800:
                        val = int(round(raw_util * min(1.0, clock_mhz / 1800.0)))
                    else:
                        val = raw_util

                    raw_details.append(f"{raw_util}%@{pstate}/{clock_mhz}MHz/{power_str}W->{val}%")
                    readings.append(val)

                if val < threshold:
                    logger.info("GPU check on %s: %s (below %d%% threshold)", ssh_host, raw_details[-1] if raw_details else val, threshold)
                    return val
                if i < samples - 1:
                    await asyncio.sleep(interval_sec)

            sustained = min(readings)
            logger.info("GPU load samples on %s: %s -> sustained real load: %d%%", ssh_host, ", ".join(raw_details), sustained)
            return sustained
    except Exception as exc:
        logger.warning("Could not check GPU load on %s via SSH: %s", ssh_host, exc)
        return None
