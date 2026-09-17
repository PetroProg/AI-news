import socket
import re
from typing import List
from app.config import settings

def send_wake_on_lan(mac_address: str | None = None, broadcast_ip: str | None = None) -> bool:
    """
    Sends a Wake-on-LAN magic packet to wake up the workstation.
    Magic packet format: 6 bytes of 0xFF followed by MAC address repeated 16 times.
    """
    mac = mac_address or settings.WOL_MAC_ADDRESS
    bcast = broadcast_ip or settings.WOL_BROADCAST_IP

    # Clean MAC string: remove colons, dashes, spaces
    cleaned_mac = re.sub(r"[^0-9A-Fa-f]", "", mac)
    if len(cleaned_mac) != 12:
        raise ValueError(f"Invalid MAC address format: {mac}")

    mac_bytes = bytes.fromhex(cleaned_mac)
    magic_packet = b"\xff" * 6 + mac_bytes * 16

    # Send broadcast UDP packet
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.sendto(magic_packet, (bcast, 9))
    
    return True


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
async def send_remote_sleep(
    host: str | None = None,
    user: str | None = None,
    key_path: str | None = None,
) -> bool:
    """Sends a remote command over SSH to put the Windows PC into S3 sleep."""
    import asyncio
    import logging
    import asyncssh
    logger = logging.getLogger("news_ai.bot.utils")

    ssh_host = host or settings.WINDOWS_SSH_HOST
    ssh_user = user or settings.WINDOWS_SSH_USER
    ssh_key = key_path or settings.WINDOWS_SSH_KEY_PATH

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
