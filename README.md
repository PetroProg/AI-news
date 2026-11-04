# 📡 Autonomous Personal AI News Aggregator & Net-Sec Homelab Engine

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose_v2-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16_Alpine-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy 2.0](https://img.shields.io/badge/SQLAlchemy-2.0_Async-D71F00.svg)](https://www.sqlalchemy.org/)
[![aiogram 3.x](https://img.shields.io/badge/Telegram_Bot-aiogram_3.x-2CA5E0.svg?logo=telegram&logoColor=white)](https://docs.aiogram.dev/)
[![Telethon](https://img.shields.io/badge/Telegram_Ingestion-Telethon_MTProto-blue.svg)](https://docs.telethon.dev/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Gemini_Flash-8E75B2.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![Ollama](https://img.shields.io/badge/Local_Fallback_LLM-Qwen_2.5_7B-black.svg?logo=ollama&logoColor=white)](https://ollama.ai/)
[![AdGuard Home](https://img.shields.io/badge/DNS_Shield-AdGuard_Home-68bc71.svg?logo=adguard&logoColor=white)](https://adguard.com/)
[![Tailscale](https://img.shields.io/badge/Mesh_VPN-Tailscale-235882.svg?logo=tailscale&logoColor=white)](https://tailscale.com/)

> **A 100% self-hosted, 24/7 autonomous intelligence and homelab security platform running on an energy-efficient Ubuntu Linux server (`petroprog`). It ingests news across ~40 channels (RSS, Telegram MTProto, Instagram via RSS-Bridge), sanitizes noise and ads, performs deep neural summarization using Google Gemini (with local Ollama fallback), delivers scheduled morning and evening intelligence briefings via Telegram, and provides a Cyber-Ops Web Dashboard with integrated Tailscale mesh monitoring, AdGuard DNS Shield, server battery/disk watchdogs, and Wake-on-LAN workstation control.**

---

## 📑 Table of Contents
- [Problem & Motivation](#-problem--motivation)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [AI Engine & Rate-Limit Strategy](#-ai-engine--rate-limit-strategy)
- [Hardware & Watchdog Services](#-hardware--watchdog-services)
- [SYNAPSE // Net-Sec Ops Dashboard](#-synapse--net-sec-ops-dashboard)
- [Pipeline Lifecycle](#-pipeline-lifecycle)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Configuration (.env)](#configuration-env)
  - [Deployment with Docker Compose](#deployment-with-docker-compose)
- [Telegram Bot Commands](#-telegram-bot-commands)
- [Progressive Web App (PWA)](#-progressive-web-app-pwa)
- [License & AI Attribution](#-license--attribution)

---

## 🎯 Problem & Motivation

Modern information consumption across Telegram, RSS feeds, and technical portals is hindered by acute **information overload**, disguised marketing, spam disclosures, and duplicate reporting across media outlets.

**AI News solves this by:**
1. **Self-Hosted Autonomy:** Operates 24/7 on private homelab hardware without third-party aggregator subscriptions.
2. **Aggressive Multi-Stage Sanitization:** Strips UTM tracking, promo disclosures (`#реклама`, `erid:`), and emoji clickbait before LLM analysis.
3. **Structured AI Synthesis:** Evaluates every article from 1.0 to 10.0, extracts key takeaways, categorizes into domains (AI & Neural Networks, Development, Cybersecurity, Football, F1, Science, World News), and provides an objective Russian executive summary.
4. **Reliable Scheduled Delivery:** Compiles and delivers curated digests at 07:45 CET (morning) and 19:45 CET (evening) directly to Telegram.
5. **Integrated Infrastructure Management:** Combines news intelligence with homelab network security, Tailscale peer monitoring, AdGuard DNS control, and hardware telemetry.

---

## ✨ Key Features

### 📡 1. Multi-Protocol Content Ingestion
- **23 Technical & Sports RSS Feeds:** Habr hubs, Tproger, Python/Go/Rust official feeds, OpenNET, BBC/Sky/Guardian Football, Formula 1, The Verge, 3DNews, LIGA, Pravda. Features character encoding detection (`KOI8-R`, `Windows-1251`, `UTF-8`).
- **14 Telegram Channels via Telethon:** Real-time MTProto ingestion parsing raw channel broadcasts without intermediary aggregators.
- **Instagram Ingestion:** Integrated `RSS-Bridge` container for photo/content scraping.

### 🧹 2. Cleansing & Deduplication
- **Regex & Heuristic Sanitization:** Automatically scrubs UTM tags, tracking parameters, referral links, and promotional hashtags.
- **Two-Tier Deduplication:**
  - *Tier 1:* SHA-256 URL and canonical slug matching.
  - *Tier 2:* Sliding-window title similarity and Jaccard overlap thresholding over 48-hour comparison pools.

### 🧠 3. Dual AI Summarization Engine
- **Primary AI (Google Gemini):** Powered by `gemini-2.5-flash` / `gemini-3.5-flash-lite` through `GeminiClient` with strict pacing (4.5s delay between requests to guarantee $\le 13.3$ RPM, staying safe within free tier limits) and exponential backoff retry.
- **Local Fallback (Ollama + Qwen 2.5 7B):** Containerized local worker providing offline inference fallback.
- **Strict Structured Schemas:** Generates rating, domain category, concise Russian synopsis, key points, and impact analysis.

### 🛡️ 4. SYNAPSE // Net-Sec Ops HUD
- **Bandwidth Throughput Monitor:** Real-time network speed telemetry (`↓ RX` / `↑ TX`) rendered on a custom HTML5 Canvas with sharp cyber grid lines and Y-axis tick intervals.
- **VPN Mesh Peers List:** Tailscale mesh monitor reporting real-time node availability (`Desktop-PC`, `Fedora-Server`, `Основной ПК`, `Samsung-A54`, `Asus-VBook`, `Nokia-G22`), latency, and WireGuard status.
- **DNS Query Log Table:** Live DNS inspect table featuring client IP badges, requested domain, `ALLOWED`/`BLOCKED` status, and query response latency.
- **AdGuard DNS Shield Engine:** Active shield toggle, 15-minute protection bypass button, upstream DoH latency cards (Quad9, Cloudflare, AdGuard), and 4 quick security toggles (AdBlocker, Malware Protection, DoH Encryption, SafeSearch).
- **Interactive Three-Dots (`•••`) Menus:** Action menus for instant telemetry refresh, copying server IP, clearing filters, and direct links to AdGuard Home.
- **Live Clock:** Real-time ticking clock in the top status bar with one-click toggling between UTC and CET.

### 🔋 5. Server & Hardware Health Watchdogs
- **Battery & AC Power Monitor:** Tracks laptop battery percentage and AC charging state via Linux sysfs (`/sys/class/power_supply/`), alerting via Telegram on power disconnect or low battery ($\le 20\%$).
- **Disk Space Watchdog:** Checks root storage every 10 minutes, triggering Telegram warnings when free space drops below 10GB and critical alerts below 5GB.
- **Auto-Cleanup Service:** Runs nightly at 03:00 CET, purging articles older than 7 days while preserving compiled digest reports.
- **Workstation Control (WoL & Sleep):** Burst IEEE 802.3 Magic Packet broadcast with ARP discovery for waking remote PCs, coupled with SSH sleep routines.

---

## 🏛 System Architecture

```
                                  +---------------------------------------+
                                  |         External News Sources         |
                                  |   (23 RSS Feeds, 14 Telegram Channels)|
                                  +-------------------+-------------------+
                                                      │
                                                      ▼
+─────────────────────────────────────────────────────────────────────────────────────────────────────────────+
| HOMELAB SERVER NODE: petroprog (Ubuntu Linux x86_64, Tailscale Mesh: 100.107.4.120)                         |
|                                                                                                             |
|  [ Docker Compose Infrastructure ]                                                                          |
|                                                                                                             |
|  ┌──────────────────────┐      ┌─────────────────────────────┐      ┌───────────────────────────────────┐   |
|  │  news_ai_postgres    │      │       news_ai_app           │      │           news_ai_bot             │   |
|  │  (PostgreSQL 16)     │<────>│   (FastAPI REST + PWA SPA)  │<────>│   (aiogram 3.x Long Polling)      │   |
|  │  Database Storage    │      │   Port: 8000                │      │   + APScheduler Engine (CET)      │   |
|  └──────────┬───────────┘      └──────────────┬──────────────┘      │   + Battery & Disk Watchdogs      │   |
|             │                                 │                     └─────────────────┬─────────────────┘   |
|             ▼                                 ▼                                       │                     |
|  ┌──────────────────────┐      ┌─────────────────────────────┐                        ▼                     |
|  │  news_ai_adguard     │      │     news_ai_rss_bridge      │      ┌───────────────────────────────────┐   |
|  │  (AdGuard Home DNS)  │      │     (Instagram Ingestion)   │      │        Telegram Channel / Chat    │   |
|  │  Ports: 53, 3053     │      │     Port: 3000              │      │        @petroprog_news_bot        │   |
|  └──────────────────────┘      └─────────────────────────────┘      └───────────────────────────────────┘   |
|                                                                                                             |
+─────────────────────────────────────────────────────────────────────────────────────────────────────────────+
         │                                                      │
         ▼                                                      ▼
+──────────────────────────────────+           +──────────────────────────────────+
|       Google Gemini API          |           |      Tailscale Encrypted Mesh    |
|   gemini-2.5-flash (4.5s pacing) |           |  (Desktop-PC, Samsung-A54, etc.) |
+──────────────────────────────────+           +──────────────────────────────────+
```

---

## 🧠 AI Engine & Rate-Limit Strategy

To operate reliably on the free Google Gemini tier without hitting HTTP 429 Too Many Requests:
1. **Start-to-Start Pacing:** A strict 4.5-second pacing interval between requests guarantees an operating rate of $\le 13.3$ RPM (below the 15 RPM ceiling).
2. **Exponential Backoff:** If a 429 or network timeout occurs, `GeminiClient` retries up to 3 times (`5s -> 10s -> 20s`) respecting the `Retry-After` header.
3. **Database String Slicing:** Text fields are automatically sliced (`external_id[:1020]`, `title[:490]`, `author[:490]`) to protect PostgreSQL from `StringDataRightTruncationError`.
4. **Fallback Mechanism:** If the Gemini API becomes unavailable, tasks fall back to local `news_ai_ollama` running `qwen2.5:7b`.

---

## ⚡ Hardware & Watchdog Services

| Service | Interval / Schedule | Purpose |
|---|---|---|
| **Morning Digest** | 07:45 CET | Analyzes 18h window, generates report, pushes to Telegram & web |
| **Evening Digest** | 19:45 CET | Analyzes 14h window (24h fallback), generates report, pushes to Telegram |
| **Battery Monitor** | Every 60 seconds | Reads `/sys/class/power_supply/`, notifies on AC disconnect and low battery ($\le 20\%$) |
| **Disk Monitor** | Every 10 minutes | Checks free space, sends warnings if $<10\text{ GB}$ and critical alerts if $<5\text{ GB}$ |
| **Nightly Cleanup** | 03:00 CET | Deletes articles older than 7 days, maintaining lightweight database footprint |

---

## 🛡️ SYNAPSE // Net-Sec Ops Dashboard

Accessible over Tailscale at `http://100.107.4.120:8000/?tab=vpn` or the PWA web app:

1. **Cyber-Ops Status Bar:** Real-time system health pill (`SYSTEM: OPTIMAL`), uptime percentage (`99.98%`), live bandwidth indicator, active VPN peer count (`3/6`), interactive `•••` action dropdown, administrator badge (`Admin`), and live ticking UTC/CET clock.
2. **Bandwidth Throughput Monitor:** High-frequency canvas graph charting download (neon emerald) and upload (electric cyan) traffic against coordinate grid ticks (`250 Kb/s`, `100`, `50`, `0`).
3. **VPN Mesh Peers List:** Live status table of all Tailscale cluster nodes with device icons (💻, 📱, 🐧), IP addresses, `ONLINE / IDLE` badges, and ping latency.
4. **DNS Query Log Table:** Live query stream showing client origin badges (`[192.168.178.39 • PC]`, `[100.76.188.111 • Mobile]`, `[192.168.178.65 • Server]`), requested domain, color-coded status (`ALLOWED` / `BLOCKED`), and resolution latency.
5. **AdGuard DNS Shield Engine:** Visual shield badge, 15-minute protection bypass button, 24-hour query and block percentages, upstream DoH benchmark cards (Quad9, Cloudflare, AdGuard), and 4 instant security switches.

---

## 🔄 Pipeline Lifecycle

```
 [ Ingestion Collectors ]
   (RSS, Telegram, Instagram)
             │
             ▼
      (COLLECTED) ──[ Tier 1 & 2 Deduplication ]──> (DUPLICATE) ──> Linked to canonical article
             │
             ▼
      (PROCESSED) ──[ Sanitization, UTM & Emoji Strip ]
             │
             ▼
     (SUMMARIZED) ──[ Gemini Neural Engine (Rating, Synopsis, Takeaways) ]
             │
             ▼
      (REPORTED)  ──[ Compiled into Digest & Delivered to Telegram / Web ]
```

Articles marked as `REPORTED` are archived in PostgreSQL and never re-sent in future digests.

---

## 🛠 Tech Stack

| Layer | Component | Technologies |
|---|---|---|
| **Core Backend** | API & Pipeline | Python 3.12, FastAPI, Uvicorn, AsyncIO, Pydantic v2 |
| **Database** | Relational Store | PostgreSQL 16 Alpine, asyncpg, SQLAlchemy 2.0, Alembic |
| **Telegram Ingestion** | Channel Scraper | Telethon (MTProto API), Pyrogram |
| **Telegram Bot** | Bot & Automation | aiogram 3.x, APScheduler 3.x |
| **AI Summarization** | Cloud & Local | Google Gemini API (`gemini-2.5-flash`), Ollama (`qwen2.5:7b`) |
| **DNS & Security** | Ad-Blocking & DNS | AdGuard Home (DoH, DNS-over-TLS, blocklists) |
| **Network & Mesh** | Secure Networking | Tailscale, WireGuard Mesh |
| **Frontend** | Web UI & PWA | HTML5 Canvas, Tailwind CSS, Vanilla JS, Service Workers |
| **Hardware Control** | Power & WOL | Wake-on-LAN (IEEE 802.3), Paramiko SSH, Linux sysfs |
| **Containers** | Infrastructure | Docker, Docker Compose v2 |

---

## 📁 Repository Structure

```
.
├── alembic/                    # Database migration scripts
│   ├── env.py                  # Migration runner environment
│   └── versions/               # Incremental database revisions
├── app/
│   ├── ai/                     # GeminiClient and prompt templates
│   ├── bot/                    # aiogram 3.x bot (handlers, keyboards, utils)
│   ├── collectors/             # RSS, Telegram, and Instagram collectors
│   ├── database/               # SQLAlchemy models and async session engine
│   ├── processing/             # HTML sanitization & deduplication algorithms
│   ├── services/               # Ingestion, summarizer, report, battery & disk monitors
│   ├── api.py                  # FastAPI REST API & DNS/VPN endpoints
│   ├── config.py                # Pydantic Settings (.env schema)
│   ├── main.py                  # Standalone pipeline CLI runner
│   └── scheduler.py             # APScheduler cron configuration
├── web/                         # Single-Page Application (SPA) & PWA assets
│   ├── index.html              # Dashboard UI & Net-Sec Ops HUD
│   ├── manifest.json           # Progressive Web App manifest
│   ├── sw.js                   # Service Worker offline caching
│   ├── css/                    # Custom styling
│   └── js/
│       └── app.js              # Real-time state, charts, and API client
├── compose.yaml                 # Docker Compose multi-service topology
├── Dockerfile                   # Python 3.12 application container definition
├── requirements.txt             # Python production dependencies
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Docker Engine 24.0+ and Docker Compose v2
- A Telegram account with API credentials from [my.telegram.org](https://my.telegram.org)
- A Telegram Bot token from [@BotFather](https://t.me/BotFather)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)
- Tailscale installed on the host

### Configuration (.env)
Create a `.env` file in the project root:

```env
# Database
POSTGRES_DB=news_db
POSTGRES_USER=news_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# AI Engine (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Local AI Fallback (Ollama)
OLLAMA_BASE_URL=http://news_ai_ollama:11434
OLLAMA_MODEL=qwen2.5:7b

# Telegram Ingestion (Telethon)
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=your_32_character_hash
TELEGRAM_SESSION_NAME=news_collector

# Telegram Bot (aiogram)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_ADMIN_CHAT_ID=your_numeric_telegram_id

# AdGuard Home DNS
ADGUARD_URL=http://news_ai_adguard:3000
ADGUARD_USER=adguard_admin
ADGUARD_PASSWORD=adguard_password

# Hardware Management (Wake-on-LAN & Sleep)
WOL_MAC_ADDRESS=18:31:BF:B5:27:AA
WOL_BROADCAST_IP=192.168.178.255
SSH_PC_HOST=192.168.178.39
SSH_PC_USER=your_pc_username
```

### Deployment with Docker Compose

Build and launch all services:

```bash
docker compose up -d --build
```

Check container status:

```bash
docker compose ps
```

Expected active services:
- `news_ai_app`: FastAPI backend & dashboard (port `8000`)
- `news_ai_bot`: Telegram Bot, scheduler, and hardware watchdogs
- `news_ai_postgres`: PostgreSQL 16 database (port `5432`)
- `news_ai_ollama`: Ollama LLM worker (port `11434`)
- `news_ai_rss_bridge`: RSS-Bridge for Instagram (port `3000`)
- `news_ai_adguard`: AdGuard Home DNS shield (ports `53`, `3053`)

Access the dashboard in your browser at `http://<server-ip>:8000` or securely over Tailscale.

---

## 📱 Telegram Bot Commands

| Command | Action |
|---|---|
| `/start` | Displays welcome overview and mounts interactive quick-action keyboard |
| `/run_pipeline` | Triggers complete cycle manually: Ingest $\rightarrow$ Dedupe $\rightarrow$ AI $\rightarrow$ Digest $\rightarrow$ Delivery |
| `/generate` | Compiles an on-demand digest from recent unprocessed articles (48h window) |
| `/digest` | Retrieves and delivers the most recent compiled intelligence briefing |
| `/wake_pc` | Sends multi-packet IEEE 802.3 WoL burst with ARP discovery to boot workstation |
| `/sleep_pc` | Puts the GPU workstation to sleep via SSH (with Smart Activity Guard) |
| `/pc_status` | Reports workstation reachability, ping latency, and Tailscale connection |
| `/status` | Reports server time, battery level, disk space, and database article count |

---

## 🌐 Progressive Web App (PWA)

The web dashboard is a fully installable Progressive Web App with offline caching:
- **Zero-Config Installation:** One-click "Install App" prompt on Android, iOS Safari, and Chromium desktop.
- **Offline Reading:** App shell and recent news cached locally via Service Worker (`sw.js`).
- **Encrypted Mesh Access:** Securely accessible from anywhere via Tailscale (`http://100.107.4.120:8000`).

---

## 📄 License & Attribution

This project is open-source software licensed under the [MIT License](LICENSE).

---

> 🤖 **AI-Native Engineering Notice:**
> Этот проект полностью спроектирован, разработан, отлажен и развернут с использованием **Искусственного Интеллекта** (AI-assisted & Agentic Engineering).
> 
> *This project was built entirely with AI.*
