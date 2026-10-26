import logging
from aiogram import Bot
from app.config import settings

logger = logging.getLogger("news_ai.battery_monitor")

_alert_under_50_sent = False
_alert_critical_sent = False
_last_adp_state: bool | None = None


def get_server_battery():
    cap = None
    status = "Unknown"
    adp_online = True

    try:
        with open("/sys/class/power_supply/BAT0/capacity") as f:
            cap = int(f.read().strip())
    except Exception:
        pass

    try:
        with open("/sys/class/power_supply/BAT0/status") as f:
            status = f.read().strip()
    except Exception:
        pass

    try:
        with open("/sys/class/power_supply/ADP0/online") as f:
            adp_online = (f.read().strip() == "1")
    except Exception:
        pass

    return cap, status, adp_online


async def check_server_battery_job(bot: Bot):
    global _alert_under_50_sent, _alert_critical_sent, _last_adp_state

    cap, status, adp_online = get_server_battery()
    if cap is None:
        return

    admin_id = settings.TELEGRAM_ADMIN_CHAT_ID
    if not admin_id:
        return

    # 1. AC Adapter state change check
    if _last_adp_state is not None:
        if not adp_online and _last_adp_state:
            logger.warning("AC adapter disconnected! Server running on battery (%d%%).", cap)
            try:
                await bot.send_message(
                    chat_id=admin_id,
                    text=(
                        f"⚠️ <b>Warning: Server unplugged from AC power!</b>\n\n"
                        f"• Laptop switched to battery power: <b>{cap}%</b>.\n"
                        f"• Status: <b>{status}</b>.\n\n"
                        f"<i>Please check the power supply connection!</i>"
                    ),
                    parse_mode="HTML"
                )
            except Exception as e:
                logger.error("Failed to send AC disconnect alert: %s", e)

        elif adp_online and not _last_adp_state:
            logger.info("AC adapter reconnected! Battery: %d%%.", cap)
            try:
                await bot.send_message(
                    chat_id=admin_id,
                    text=(
                        f"🔌 <b>Server AC power restored!</b>\n\n"
                        f"• Battery: <b>{cap}%</b> (charging).\n"
                        f"• Status: <b>{status}</b>."
                    ),
                    parse_mode="HTML"
                )
            except Exception as e:
                logger.error("Failed to send AC reconnect notice: %s", e)

    _last_adp_state = adp_online

    # 2. Battery percentage trigger (< 50%)
    if cap < 50:
        if not _alert_under_50_sent:
            power_desc = "Charging from AC power" if adp_online else "⚠️ Running on battery (AC disconnected!)"
            advice = (
                "ℹ️ <i>Laptop is charging; this notification will automatically reset once 50% is reached.</i>"
                if adp_online else
                "🚨 <i>Please reconnect the charger to prevent server shutdown!</i>"
            )
            msg = (
                f"🔋 <b>Warning: Server battery is below 50%!</b>\n\n"
                f"• <b>Current level:</b> {cap}%\n"
                f"• <b>Power source:</b> {power_desc}\n"
                f"• <b>Status:</b> {status}\n\n"
                f"{advice}"
            )
            logger.warning("Sending low battery (<50%%) alert: %d%% (adp=%s)", cap, adp_online)
            try:
                await bot.send_message(chat_id=admin_id, text=msg, parse_mode="HTML")
                _alert_under_50_sent = True
            except Exception as e:
                logger.error("Failed to send low battery alert: %s", e)

        # Critical battery alert (<= 20% and discharging)
        if cap <= 20 and not adp_online and not _alert_critical_sent:
            msg_crit = (
                f"🚨 <b>CRITICAL SERVER BATTERY LEVEL!</b>\n\n"
                f"• Only <b>{cap}%</b> remaining!\n"
                f"• Server will shut down in a few minutes!\n\n"
                f"<b>URGENT: CONNECT POWER CHARGER TO THE LAPTOP!</b>"
            )
            try:
                await bot.send_message(chat_id=admin_id, text=msg_crit, parse_mode="HTML")
                _alert_critical_sent = True
            except Exception as e:
                logger.error("Failed to send critical battery alert: %s", e)

    else:
        # cap >= 50: Reset alert trigger when charged back up
        if _alert_under_50_sent:
            _alert_under_50_sent = False
            _alert_critical_sent = False
            logger.info("Battery recovered to %d%% (>=50%%). Trigger reset.", cap)
            try:
                await bot.send_message(
                    chat_id=admin_id,
                    text=f"✅ <b>Server battery is back above 50%</b> (currently <b>{cap}%</b>).\nMonitoring alert trigger has been reset and is active.",
                    parse_mode="HTML"
                )
            except Exception as e:
                logger.error("Failed to send battery recovery notice: %s", e)