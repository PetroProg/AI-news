# 📡 Architectural Design: Telegram MTProto Ingestion, Hybrid Compute (WoL) & Live Web Dashboard

## 1. Core Objectives & System Evolution

This phase marks the transformation of the system from a single-node RSS reader into a distributed, multi-source intelligence aggregator with hybrid hardware acceleration:

- **Multi-source ingestion (Telegram channels):** direct consumption of high-velocity public channels via Telegram's native binary MTProto protocol, without requiring bot administrative rights.
- **Hybrid compute topology (edge master + GPU worker):** decoupling the 24/7 low-power orchestrator (Intel Celeron N3060) from heavy AI inference by introducing on-demand Wake-on-LAN (WoL) hardware acceleration on an NVIDIA RTX 3060 12GB.
- **Private web surface:** delivering a responsive, mobile-first single-page application (HomeGuard) backed by an asynchronous FastAPI REST layer, accessible globally through Tailscale mesh routing.

## 2. Distributed System Topology

```
  [ Public Telegram Channels ]         [ Public RSS / Atom Feeds ]
                │                                    │
                ▼ (Telethon MTProto)                 ▼ (httpx + feedparser)
  ┌────────────────────────────────────────────────────────────────────────┐
  │  MASTER NODE: Headless 24/7 Server (Lenovo Laptop / Ubuntu Server)     │
  │  - Low Power Idle (~6W)                                                │
  │  - PostgreSQL 16 (Relational Persistence & JSONB Summaries)            │
  │  - FastAPI Engine (:8000 -> REST API & Web Dashboard)                 │
  │  - Content Sanitizer (BeautifulSoup & Regex)                           │
  │  - Deduplication Engine (SHA-256 Content Fingerprint + Overlap Jaccard)│
  │                                                                        │
  │  [ Trigger Window (e.g. 07:45 / 19:45) ]                               │
  │  └── Sends Magic Packet (UDP :9 Broadcast) ────────┐                   │
  └────────────────────────────────────────────────────┼───────────────────┘
                                                       │
                                                       ▼ (Wake-on-LAN over Ethernet)
  ┌────────────────────────────────────────────────────────────────────────┐
  │  COMPUTE NODE: Main Workstation (Intel i3 / 32GB RAM / RTX 3060 12GB)  │
  │  - Powered Down / S3 Sleep State                                       │
  │  - Awakens automatically on Magic Packet receipt                       │
  │  - Ollama Engine (:11434 with CUDA Acceleration)                       │
  │  - Runs Qwen 2.5 7B (Full precision / ~100 tokens/sec)                 │
  │  - Returns Structured JSON Inference across Tailscale Mesh             │
  │  - Automatically transitions back to Sleep on idle timeout             │
  └────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ (Tailscale Mesh Network: 100.x.y.z)
  ┌────────────────────────────────────────────────────────────────────────┐
  │  CLIENT SURFACES: Smartphone (iOS / Android) & Workstation             │
  │  - HomeGuard Web Dashboard (:8000 via Browser)                         │
  │  - Real-time AI News Feed, Importance Heatmaps & Original Sources      │
  └────────────────────────────────────────────────────────────────────────┘
```

## 3. Engineering Decisions & Algorithmic Logic

### 3.1 Client MTProto Protocol vs. Bot API (Telethon)

**The architectural problem:** standard Telegram Bots can't read messages inside a channel unless they're explicitly added as a channel administrator — which makes automated aggregation of arbitrary public channels (that you don't own or moderate) impossible through the normal Bot API.

**The solution:** the system uses Telethon to talk to Telegram directly over its native MTProto binary protocol — the same protocol the official mobile/desktop clients use. This means the application authenticates as a standalone personal client rather than a bot, which grants it read-only streaming access to any public channel by name (`@channel_name`), with no administrator permissions required.

**Cryptographic session persistence:** authentication relies on a Diffie-Hellman key exchange performed against Telegram's own Data Centers, which produces an encrypted `AuthKey`. This key is cached locally in a small SQLite file (`news_collector.session`), so once the initial login is done, every subsequent run of the daemon reuses that session automatically — no repeated SMS codes or manual re-verification needed.

### 3.2 Hybrid Compute & Wake-on-LAN (WoL) Orchestration

**Hardware bottleneck being solved:** the 2-core Celeron N3060 handles database indexing and network I/O without any trouble, but running matrix multiplication for a 7-billion-parameter model purely on that CPU took around 90 seconds per summary — far too slow to be practical for regular batch runs.

**Hardware roles:**
- **Master node** — Intel Celeron N3060, 4GB RAM. Runs 24/7, handles all I/O (ingestion, database, web dashboard), and consumes only ~6W at idle.
- **Worker node** — Intel i3-8100, 32GB DDR4, NVIDIA RTX 3060 (12GB VRAM). Normally powered down, and only wakes up on demand.

**How the wake-up actually works:** the master node builds and sends a standard IEEE 802.3 Ethernet "magic packet" — a 6-byte synchronization sequence (`0xFFFFFFFFFFFF`) followed by the target machine's MAC address repeated 16 times — broadcast over UDP port 9. This causes the (technically powered-off, but network-armed) worker's motherboard NIC to boot the machine directly into its Windows lock screen with networking already active, ready to receive requests.

**Why this is worth the complexity:** once awake, the inference request is routed to the worker over the Tailscale mesh network. This cuts summarization latency from ~90 seconds down to roughly ~9.7 seconds per article, while also unlocking a much more capable model (7B parameters instead of 0.5B) for noticeably better reasoning quality. To avoid wasting power, the worker automatically goes back to sleep after 5 minutes of inactivity — so the GPU machine is only ever actually running during the short windows when it's genuinely needed.

### 3.3 Asynchronous REST & Dashboard Architecture (FastAPI)

**Zero-redundancy runtime:** the web layer isn't a separate service — it's embedded directly into the existing application container using FastAPI and Uvicorn, so there's no extra container, no extra deployment step, and no duplicated database connection logic to maintain.

**API surface:**
- **`GET /api/news`** — loads the related models (`Article`, `Summary`, `Category`, `Source`) together via SQLAlchemy's async session, and streams back a normalized news payload for the frontend to render.
- **`GET /api/stats`** — exposes real-time throughput metrics: total article volume, number of active feeds, and how many articles have been summarized so far.
- **`GET /`** — serves the standalone HomeGuard single-page app (`index.html`) itself.

**Network boundary:** the service is only ever bound to the Tailscale network interface, not the public internet — meaning the dashboard is reachable from any of your own devices anywhere in the world via the VPN mesh, but has zero public exposure or attack surface on the open internet.

## 4. Signal-to-Noise Ratio & Pre-Phase 7 Strategy

High-velocity social feeds — like gaming or tech Telegram channels — introduce noise challenges that traditional RSS feeds mostly don't have:

- **Formatting artifacts:** Telegram messages routinely contain raw Markdown syntax (`**`, `__`), sponsor headers, and "react to this post" prompts. The existing cleaning pipeline was extended with targeted regex rules specifically for these Telegram-style artifacts, so only genuine article text reaches the summarization stage.
- **Humor, slang & irony:** small models (under 1B parameters) tend to take sarcasm and memes literally, occasionally misreporting a joke as if it were a real event. This is one of the main reasons the larger 7B model on the RTX 3060 matters — its stronger reasoning lets the summarization prompt be steered to isolate genuine factual events and discount promotional or joke content, something the tiny local model simply isn't reliable enough to do consistently.
- **Stratified prioritization:** every article already receives a numeric importance score (1.0–10.0). This score isn't just cosmetic — it's designed to directly drive the editorial layout of the upcoming Phase 7 (Report Builder): high-scoring events get full summaries and "why it matters" analysis, moderate ones get compressed into brief one-liners, and low-scoring chatter is filtered out of the final report entirely.