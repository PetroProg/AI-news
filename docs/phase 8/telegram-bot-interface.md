# 🤖 Architectural Guide: Personal Telegram Bot Interface (`aiogram 3.x`)

## 1. Overview & Objectives

Phase 8 establishes an asynchronous, bidirectional mobile management interface for the Personal AI News Aggregator via a private Telegram Bot. Rather than requiring users to manually access the web dashboard or inspect server logs, the bot provides instant access to curated intelligence digests, real-time telemetry, and hardware management from any mobile or desktop device.

**Primary capabilities:**

1. **Interactive digest retrieval:** queries PostgreSQL for the latest compiled briefing and delivers it directly to the chat with clean markdown formatting.
2. **On-demand intelligence compilation:** allows the user to trigger immediate collection, analysis, and digest generation on the fly.
3. **Infrastructure telemetry:** inspects database health, article processing counts, and neural inference node reachability over the Tailscale mesh.
4. **Remote hardware orchestration (Wake-on-LAN):** broadcasts standard UDP magic packets to wake up the high-performance GPU workstation on demand.
5. **Strict zero-trust authorization:** enforces whitelist-based access control, preventing unauthorized users from invoking server controls or accessing private news streams.

## 2. Network Topology & Inbound/Outbound Architecture

```
  +-------------------------------------------------------------------------+
  |                           Telegram Cloud API                            |
  |                           (api.telegram.org)                            |
  +--------------------+-------------------------------+--------------------+
                       ^                               |
        HTTPS Outbound | (No open ports required)      | Incoming Updates /
          Long-Polling | GET /getUpdates               | User Commands
                       |                               v
  +--------------------+-------------------------------+--------------------+
  | Lenovo Server (Homelab / Private Subnet 192.168.178.65)                 |
  |                                                                         |
  |  +-------------------------------------------------------------------+  |
  |  | Container: news_ai_bot (Python 3.12 / aiogram 3.x)                |  |
  |  |                                                                   |  |
  |  |   [ Telegram Update Stream ]                                      |  |
  |  |                |                                                  |  |
  |  |                v                                                  |  |
  |  |       [ IsAdminFilter ]  ──(User ID != Admin ID)──> [ Drop / 403 ]|  |
  |  |                |                                                  |  |
  |  |                v (Authorized: TELEGRAM_ADMIN_CHAT_ID)             |  |
  |  |       [ Command Routers & Handlers ]                              |  |
  |  |         ├── /start, /help   ──> Interactive Reply Keyboard        |  |
  |  |         ├── /digest         ──> Read reports table (PostgreSQL)   |  |
  |  |         ├── /generate       ──> ReportBuilderService pipeline     |  |
  |  |         ├── /status         ──> Check DB counts & Tailscale GPU   |  |
  |  |         └── /wake_pc        ──> Broadcast UDP Magic Packet (WoL)  |  |
  |  +----------------+-------------------------------+------------------+  |
  +-------------------|-------------------------------|---------------------+
                      |                               |
                      v                               v
         [ PostgreSQL 16 (internal) ]   [ UDP Broadcast 192.168.178.255:9 ]
```

### Engineering Rationale: Long-Polling vs. Webhook

- **Homelab suitability:** a traditional webhook setup would require a public IP address, dynamic DNS configuration, a public SSL certificate, and router port-forwarding (ports 80/443) — none of which are desirable or necessary for a personal homelab.
- **Security posture:** long-polling instead relies exclusively on *outbound* HTTPS connections initiated by the server itself (the bot repeatedly asks Telegram "any new messages for me?" rather than Telegram pushing messages in). This means the homelab's network perimeter stays completely closed to any unsolicited incoming traffic — there's simply nothing listening for the outside world to connect to.

## 3. Security & Access Control Architecture

Because public Telegram bots can be found and messaged by literally anyone, strict access control is essential:

- **`IsAdminFilter`:** every incoming message is checked against a single configured `TELEGRAM_ADMIN_CHAT_ID` before it's allowed to reach any actual command handler. This is implemented as a reusable, declarative `aiogram` filter, so it applies uniformly across every command without needing to repeat the check manually inside each handler.
- **Fail-safe processing:** messages from anyone other than the authorized ID are silently dropped — no error message is sent back, no system information is leaked, and no server resources are spent processing the request beyond the initial identity check.
- **Credential protection:** secrets (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`) are injected at runtime via environment variables from `.env`, and are never committed to version control — so even if the repository were made public, the bot's credentials and owner identity wouldn't be exposed.

## 4. Component Structure & Implementation Details

The bot logic is split into small, focused modules rather than one large file:

```
app/bot/
├── __init__.py      # Package declaration
├── keyboards.py     # Persistent reply keyboard layout
├── utils.py         # Socket-level Wake-on-LAN & message chunking
├── handlers.py      # Declarative routing & command execution
└── bot.py           # Polling lifecycle & dispatcher bootstrap
```

### 4.1 Pure Python Wake-on-LAN (`app/bot/utils.py`)

Rather than pulling in and installing heavyweight system binaries (`wakeonlan`, `etherwake`) inside the production Docker image just for this one feature, the magic packet is built and sent using nothing more than Python's standard `socket` module:

- **Packet structure:** the standard IEEE 802.3 Wake-on-LAN packet — 6 bytes of synchronization data (`0xFF` repeated 6 times), followed by the target machine's MAC address repeated 16 times (102 bytes total).
- **Socket configuration:** the socket is opened with the `SO_BROADCAST` option and sends the packet to the LAN's broadcast address on UDP port 9, which any WoL-capable network card on the subnet will pick up and recognize as a wake signal.

This keeps the bot's dependency footprint minimal and avoids relying on external system tools that would need separate installation and maintenance inside the container.

### 4.2 Telegram Chunking Algorithm (`app/bot/utils.py`)

Telegram enforces a hard limit of 4,096 characters per message, but a full compiled news digest regularly runs longer than that. To handle this, a `split_message()` helper breaks the digest text into chunks at line boundaries (`\n`) rather than at arbitrary character counts — this means sentences, bullet points, and markdown formatting (like bold headers or links) are never cut mid-way through, which would otherwise corrupt the rendering or produce broken markdown syntax halfway through a message.

### 4.3 Command Handlers (`app/bot/handlers.py`)

- **`/start`** — welcomes the user and attaches a persistent, two-row reply keyboard so every other command can be triggered with a single tap instead of being typed out.
- **`/digest`** — asynchronously fetches the most recent record from the `reports` table (ordered by creation time), then splits and sends it to the chat using the chunking logic above.
- **`/generate`** — triggers the same `ReportBuilderService` pipeline used by the scheduled jobs, but on demand: it runs deduplication, compiles a fresh report, persists it to PostgreSQL, and immediately delivers the result — useful for getting an up-to-date briefing outside the normal morning/evening schedule.
- **`/status`** — runs aggregate queries against the database (article counts by status) and performs an async health check against the remote GPU inference node over Tailscale, giving a quick at-a-glance view of whether the whole pipeline — from ingestion to AI inference — is healthy.
- **`/wake_pc`** — sends the Wake-on-LAN magic packet described above and replies with confirmation details (target MAC address and broadcast IP used), so the user knows the wake signal was actually sent.

## 5. Verification & Operational Health Check

To verify the bot's operational state and handler responsiveness, the container logs are inspected directly:

```bash
docker compose logs -f bot
```

A healthy startup shows the bot successfully connecting and beginning its polling loop, and a working `/status` check shows a successful outbound request to the GPU node over Tailscale — confirming both the Telegram connection and the cross-node network path are functioning correctly, with each incoming command typically being fully handled in under a second.