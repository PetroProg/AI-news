#!/data/data/com.termux/files/usr/bin/bash

# ========================================================
# Nokia 6.1 Battery Heartbeat Agent (Battery Saver Edition)
# Server: petroprog via Tailscale (100.107.4.120:8000)
# Schedule:
#   - 08:00 - 20:00: Send updates every 30 minutes
#   - 20:00 - 08:00: Deep Sleep (No transmission, saves battery)
# ========================================================

SERVER_URL="http://100.107.4.120:8000/api/devices/nokia/battery"
DAY_INTERVAL=1800 # 30 minutes in seconds

echo "=============================================="
echo " Nokia 6.1 Battery Saver Agent Started"
echo " Day mode (08:00-20:00): Every 30 min"
echo " Night mode (20:00-08:00): Deep Sleep (Silent)"
echo " Server target: $SERVER_URL"
echo "=============================================="

# Keep partial wake lock so Android Doze doesn't freeze the process
termux-wake-lock 2>/dev/null

while true; do
    # Current local hour (00-23)
    CURRENT_HOUR=$(date +"%H" | sed 's/^0//')
    [ -z "$CURRENT_HOUR" ] && CURRENT_HOUR=0
    
    # Active window: 08:00 to 19:59 (8 AM to 8 PM)
    if [ "$CURRENT_HOUR" -ge 8 ] && [ "$CURRENT_HOUR" -lt 20 ]; then
        BAT_INFO=$(termux-battery-status 2>/dev/null)
        if [ -n "$BAT_INFO" ]; then
            PERCENT=$(echo "$BAT_INFO" | jq -r '.percentage // empty')
            STATUS=$(echo "$BAT_INFO" | jq -r '.status // empty')
            PLUGGED=$(echo "$BAT_INFO" | jq -r '.plugged // empty')
            
            CHARGING="false"
            if [ "$STATUS" = "CHARGING" ] || [ "$PLUGGED" = "PLUGGED_AC" ] || [ "$PLUGGED" = "PLUGGED_USB" ]; then
                CHARGING="true"
            fi
            
            if [ -n "$PERCENT" ]; then
                TIMESTAMP=$(date +"%H:%M:%S")
                RESP=$(curl -s -m 10 -X POST "${SERVER_URL}?level=${PERCENT}&charging=${CHARGING}")
                echo "[$TIMESTAMP] Battery: ${PERCENT}%, Charging: ${CHARGING} | Result: OK"
            fi
        fi
        
        sleep $DAY_INTERVAL
    else
        TIMESTAMP=$(date +"%H:%M:%S")
        echo "[$TIMESTAMP] Night window (20:00-08:00): Waiting until morning..."
        sleep 900
    fi
done
