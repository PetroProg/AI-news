import logging
import shutil
import time
from aiogram import Bot
from app.config import settings

logger = logging.getLogger("news_ai.disk_monitor")

_alert_warning_sent: bool = False
_alert_critical_sent: bool = False
_last_alert_timestamp: float = 0.0

# Re-alert interval for persistent low disk space (12 hours)
RE_ALERT_INTERVAL_SECONDS: float = 12 * 3600


def get_disk_info(path: str | None = None) -> tuple[float, float, float, float] | None:
    """
    Returns (free_gb, total_gb, used_gb, used_pct) or None on error.
    Values are in Gigabytes (1024^3 bytes).
    """
    target_path = path or getattr(settings, "DISK_MONITOR_PATH", "/app")
    try:
        usage = shutil.disk_usage(target_path)
        total_gb = usage.total / (1024 ** 3)
        free_gb = usage.free / (1024 ** 3)
        used_gb = usage.used / (1024 ** 3)
        used_pct = (usage.used / usage.total) * 100 if usage.total > 0 else 0.0
        return free_gb, total_gb, used_gb, used_pct
    except Exception as e:
        logger.error("Failed to check disk usage for path '%s': %s", target_path, e)
        return None


async def check_server_disk_job(bot: Bot, force_alert: bool = False):
    """
    APScheduler background job:
    Monitors host disk space and alerts Telegram admin if free space is below threshold (< 10 GB).
    Includes critical alert (< 5 GB), recovery notification, and anti-spam hysteresis.
    """
    global _alert_warning_sent, _alert_critical_sent, _last_alert_timestamp

    disk_info = get_disk_info()
    if not disk_info:
        return

    free_gb, total_gb, used_gb, used_pct = disk_info
    admin_id = settings.TELEGRAM_ADMIN_CHAT_ID
    if not admin_id:
        return

    warn_threshold = getattr(settings, "DISK_WARN_THRESHOLD_GB", 10.0)
    crit_threshold = getattr(settings, "DISK_CRITICAL_THRESHOLD_GB", 5.0)

    now = time.time()
    time_since_last_alert = now - _last_alert_timestamp
    should_re_alert = time_since_last_alert > RE_ALERT_INTERVAL_SECONDS

    # 1. Critical Level (< 5 GB)
    if free_gb < crit_threshold:
        if not _alert_critical_sent or should_re_alert or force_alert:
            msg = (
                f"🚨 <b>КРИТИЧЕСКИЙ УРОВЕНЬ ДИСКОВОГО ПРОСТРАНСТВА!</b>\n\n"
                f"• <b>Свободно:</b> <code>{free_gb:.2f} GB</code> (критический порог: &lt; {crit_threshold:.0f} GB)\n"
                f"• <b>Всего:</b> {total_gb:.1f} GB\n"
                f"• <b>Занято:</b> {used_gb:.1f} GB ({used_pct:.1f}%)\n\n"
                f"⚠️ <b>Внимание:</b> Риск аварийной остановки PostgreSQL и Docker-контейнеров!\n"
                f"<b>Срочно выполните очистку диска на сервере!</b>"
            )
            logger.critical("Critical disk space warning sent: %.2f GB remaining", free_gb)
            try:
                await bot.send_message(chat_id=admin_id, text=msg, parse_mode="HTML")
                _alert_critical_sent = True
                _alert_warning_sent = True
                _last_alert_timestamp = now
            except Exception as e:
                logger.error("Failed to send critical disk alert: %s", e)
        return

    # 2. Warning Level (< 10 GB)
    if free_gb < warn_threshold:
        if not _alert_warning_sent or should_re_alert or force_alert:
            msg = (
                f"⚠️ <b>Внимание: Заканчивается место на диске сервера!</b>\n\n"
                f"• <b>Свободно:</b> <code>{free_gb:.2f} GB</code> (порог: &lt; {warn_threshold:.0f} GB)\n"
                f"• <b>Всего:</b> {total_gb:.1f} GB\n"
                f"• <b>Занято:</b> {used_gb:.1f} GB ({used_pct:.1f}%)\n\n"
                f"💡 <i>Рекомендуется освободить место (например, <code>docker system prune -a</code>).</i>"
            )
            logger.warning("Low disk space warning sent: %.2f GB remaining", free_gb)
            try:
                await bot.send_message(chat_id=admin_id, text=msg, parse_mode="HTML")
                _alert_warning_sent = True
                _last_alert_timestamp = now
            except Exception as e:
                logger.error("Failed to send low disk alert: %s", e)
        return

    # 3. Recovery Level (>= 10 GB)
    if free_gb >= warn_threshold and (_alert_warning_sent or _alert_critical_sent):
        _alert_warning_sent = False
        _alert_critical_sent = False
        _last_alert_timestamp = 0.0
        msg = (
            f"✅ <b>Дисковое пространство сервера в норме!</b>\n\n"
            f"• <b>Свободно:</b> <code>{free_gb:.2f} GB</code> (порог: {warn_threshold:.0f} GB)\n"
            f"• <b>Всего:</b> {total_gb:.1f} GB ({used_pct:.1f}% занято)\n\n"
            f"<i>Триггер предупреждений сброшен. Мониторинг диска активен.</i>"
        )
        logger.info("Disk space recovered to %.2f GB. Reset triggers.", free_gb)
        try:
            await bot.send_message(chat_id=admin_id, text=msg, parse_mode="HTML")
        except Exception as e:
            logger.error("Failed to send disk recovery notice: %s", e)
