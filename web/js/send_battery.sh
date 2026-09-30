#!/data/data/com.termux/files/usr/bin/bash

SERVER_URL="http://100.107.4.120:8000/api/devices/nokia/battery"

BAT_INFO=$(termux-battery-status 2>/dev/null)
if [ -n "$BAT_INFO" ]; then
    # Extract percentage without relying on jq
    PERCENT=$(echo "$BAT_INFO" | grep -o '"percentage": *[0-9]*' | grep -o '[0-9]*')
    
    # Check if plugged or charging
    CHARGING="false"
    if echo "$BAT_INFO" | grep -qE '"(CHARGING|PLUGGED_AC|PLUGGED_USB)"'; then
        CHARGING="true"
    fi
    
    if [ -n "$PERCENT" ]; then
        curl -s -m 10 -X POST "${SERVER_URL}?level=${PERCENT}&charging=${CHARGING}" >/dev/null 2>&1
    fi
fi
