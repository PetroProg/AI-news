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

while true; do
    # Current local hour (00-23)
    CURRENT_HOUR=$(date +"%H" | sed 's/^0//')
    [ -z "$CURRENT_HOUR" ] && CURRENT_HOUR=0
    
    # Active window: 08:00 to 19:59 (8 AM to 8 PM)
    if [ "$CURRENT_HOUR" -ge 8 ] && [ "$CURRENT_HOUR" -lt 20 ]; then
        # Wake lock only during measurement and transmission
        termux-wake-lock 2>/dev/null
        
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
        
        # Release CPU lock so phone can enter Deep Sleep
        termux-wake-unlock 2>/dev/null
        
        sleep $DAY_INTERVAL
    else
        # Night mode: Ensure wake lock is released
        termux-wake-unlock 2>/dev/null
        
        TIMESTAMP=$(date +"%H:%M:%S")
        echo "[$TIMESTAMP] Night window (20:00-08:00): Sleeping until next check..."
        
        # Calculate seconds until 08:00 AM
        # Check every 15 minutes during night so it wakes up promptly at 08:00
        sleep 900
    fi
done
