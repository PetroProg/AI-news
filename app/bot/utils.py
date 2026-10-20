import socket
import re
from typing import List
from app.config import settings

def send_wake_on_lan(
    mac_address: str | None = None,
    broadcast_ip: str | None = None,
    port: int = 9,
) -> bool:
    """Sends Wake-on-LAN magic packets over physical network interfaces."""
    import logging
    logger = logging.getLogger("news_ai.bot.utils")
    mac = mac_address or settings.WOL_MAC_ADDRESS
    bcast = broadcast_ip or settings.WOL_BROADCAST_IP

    clean_mac = re.sub(r"[^0-9A-Fa-f]", "", mac)
    if len(clean_mac) != 12:
        logger.error("Invalid MAC address for WoL: %s", mac)
        return False

    magic_packet = bytes.fromhex("FF" * 6 + clean_mac * 16)
    
    # Broadcast to subnet IP and global 255.255.255.255 across ports 9 and 7
    targets = [
        (bcast, 9),
        (bcast, 7),
        ("255.255.255.255", 9),
        ("255.255.255.255", 7),
    ]

    sent_any = False
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        for target_ip, target_port in targets:
            try:
                sock.sendto(magic_packet, (target_ip, target_port))
                sent_any = True
            except Exception as exc:
                logger.debug("Failed sending WoL to %s:%s: %s", target_ip, target_port, exc)

    if sent_any:
        logger.info("Wake-on-LAN magic packet successfully sent for %s to %s", mac, bcast)
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


async def is_windows_user_active(
    host: str | None = None,
    user: str | None = None,
    key_path: str | None = None,
    max_idle_minutes: int = 5,
) -> bool:
    """Checks via SSH whether an interactive console user is actively using the Windows PC.

    Uses the scheduled task `CheckUserIdle` (running interactively in Session 1)
    to query the Win32 `GetLastInputInfo` API. This accurately detects true physical
    mouse and keyboard idle time.
    Note: `quser` on Windows 10/11 client always reports IDLE TIME as 'none' on
    local console sessions, so `quser` must NOT be used to infer active user presence.
    """
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
            # Trigger interactive task to query GetLastInputInfo in Session 1
            cmd = r'cmd.exe /c "chcp 65001 >nul && schtasks /run /tn CheckUserIdle && ping 127.0.0.1 -n 2 >nul && type C:\Users\Admin\Desktop\project-news\idle.txt"'
            res = await conn.run(cmd, timeout=8.0)
            raw_bytes = res.stdout if isinstance(res.stdout, bytes) else (res.stdout or "").encode()
            output = raw_bytes.decode("utf-8", errors="ignore")

            idle_mins = None
            for line in reversed(output.splitlines()):
                line = line.strip()
                try:
                    idle_mins = float(line)
                    break
                except ValueError:
                    continue

            if idle_mins is not None:
                if idle_mins < max_idle_minutes:
                    logger.info("Windows user activity detected on %s: idle for %.1f min (< threshold %d min).", ssh_host, idle_mins, max_idle_minutes)
                    return True
                else:
                    logger.info("No active user interaction on %s: idle for %.1f min (>= threshold %d min).", ssh_host, idle_mins, max_idle_minutes)
                    return False

            logger.warning("Could not parse idle minutes from CheckUserIdle on %s. Raw output: %r", ssh_host, output)
            return False
    except Exception as exc:
        logger.warning("Could not check user activity on %s via SSH: %s", ssh_host, exc)
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
