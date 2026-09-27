#!/data/data/com.termux/files/usr/bin/bash

# ========================================================
# Nokia 6.1 Battery Heartbeat Agent for AI News Dashboard
# Server: petroprog via Tailscale (100.107.4.120:8000)
# ========================================================

SERVER_URL="http://100.107.4.120:8000/api/devices/nokia/battery"
INTERVAL=300 # 5 minutes

echo "=============================================="
echo " Starting Nokia 6.1 Battery Sync Agent..."
echo " Server target: $SERVER_URL"
echo " Interval: every ${INTERVAL}s (5 min)"
echo "=============================================="

# Keep CPU running in background without Android killing it
termux-wake-lock 2>/dev/null

while true; do
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
        else
            echo "[$(date +"%H:%M:%S")] Could not extract percentage from termux-battery-status"
        fi
    else
        echo "[$(date +"%H:%M:%S")] termux-battery-status is empty. Is Termux:API installed and permissions granted?"
    fi
    
    sleep $INTERVAL
done
