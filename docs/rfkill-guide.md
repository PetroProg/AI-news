# Managing Wireless Devices with rfkill

`rfkill` is a built-in Linux command-line utility used to query, enable, and disable wireless communication devices such as Wi-Fi (WLAN), Bluetooth, Mobile Broadband (3G/4G/LTE/5G), and NFC.

It acts as a system-level "Airplane Mode" toggle for your hardware interfaces.

---

## Understanding Block Types

When you check the status of a device, `rfkill` distinguishes between two types of hardware states:

1. **Soft Block (Software Block):**
   - Activated by the operating system, drivers, or user space applications.
   - Can be easily cleared using standard terminal commands.

2. **Hard Block (Hardware Block):**
   - Triggered by a physical switch on the laptop chassis or a keyboard hotkey combination (e.g., `Fn + F2`).
   - **Note:** The operating system cannot override a hard block. You must physically toggle the switch or press the hotkey combination to restore power to the module.

---

## Common Commands Reference

### 1. List Wireless Device Status

To view all available wireless interfaces and their current block states:

```bash
rfkill list
```

Alternatively, you can just type `rfkill` for a simplified overview.

### 2. Unblocking Devices

If your Wi-Fi or Bluetooth interface throws an error like `Operation not possible due to RF-kill`, use the following commands to unblock them:

- Unblock Wi-Fi only:
  ```bash
  sudo rfkill unblock wifi
  ```

- Unblock Bluetooth only:
  ```bash
  sudo rfkill unblock bluetooth
  ```

- Unblock all wireless devices:
  ```bash
  sudo rfkill unblock all
  ```

### 3. Blocking Devices (Power Saving)

To disable radios completely to save battery or for security purposes:

- Block Wi-Fi:
  ```bash
  sudo rfkill block wifi
  ```

- Block Bluetooth:
  ```bash
  sudo rfkill block bluetooth
  ```

---

## Troubleshooting Workflow

If your network interface (e.g., `wlp2s0`) remains `DOWN` after modifying your network configuration, follow these steps:

1. **Identify the device ID and block status:**
   ```bash
   rfkill list
   ```

2. **Clear any active software blocks:**
   ```bash
   sudo rfkill unblock all
   ```

3. **Check for hardware restrictions:** If `Hard blocked: yes` persists, locate the physical wireless switch or use the `Fn` keys on your keyboard to toggle the Wi-Fi state.

4. **Force-enable your interface:** Once both block states show `no`, activate the network interface link:
   ```bash
   sudo ip link set wlp2s0 up
   ```

5. **Apply Network Configuration:** Finally, re-apply your Netplan or network management settings:
   ```bash
   sudo netplan apply
   ```