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
    max_idle_minutes: int = 10,
) -> bool:
    """Checks via SSH whether an interactive console user is actively using the Windows PC.

    Returns True if an active user session is found with idle time < max_idle_minutes.
    Returns False if the PC is idle, locked, or no interactive session is active.
    """
    import logging
    import re
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
        ) as conn:
            res = await conn.run("cmd.exe /c quser", term_type="vt100")
            output = res.stdout or ""

            # Strip ANSI escape sequences from terminal output
            cleaned = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]|\x1b\].*?\x07', '', output)
            lines = [l.strip() for l in cleaned.splitlines() if l.strip()]

            for line in lines[1:]:  # skip header row
                line_lower = line.lower()
                # Check for active console or RDP session
                if any(kw in line_lower for kw in ["console", "активно", "active"]):
                    # 'отсутствует' (RU), 'none' (EN), or standalone '.' means 0 idle time (active right now)
                    if "отсутствует" in line_lower or "none" in line_lower or " . " in f" {line} ":
                        logger.info("Windows user activity detected: active right now (0m idle).")
                        return True

                    # Match HH:MM idle format (e.g. '0:04' or '1:15')
                    m_time = re.search(r'\b(\d+):(\d+)\b', line)
                    if m_time:
                        idle_mins = int(m_time.group(1)) * 60 + int(m_time.group(2))
                        if idle_mins < max_idle_minutes:
                            logger.info("Windows user activity detected: idle for %d min (< threshold %d min).", idle_mins, max_idle_minutes)
                            return True

                    # Match standalone minutes before date (e.g. '  4  19.09.2026')
                    m_mins = re.search(r'\s+(\d+)\s+\d{2}\.\d{2}\.', line)
                    if m_mins:
                        idle_mins = int(m_mins.group(1))
                        if idle_mins < max_idle_minutes:
                            logger.info("Windows user activity detected: idle for %d min (< threshold %d min).", idle_mins, max_idle_minutes)
                            return True

            logger.info("No active user interaction found on %s (idle exceeds %d min).", ssh_host, max_idle_minutes)
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
