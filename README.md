# 📡 Autonomous Personal AI News Aggregator & Intelligence Briefing Engine

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose_v2-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16_Alpine-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy 2.0](https://img.shields.io/badge/SQLAlchemy-2.0_Async-D71F00.svg)](https://www.sqlalchemy.org/)
[![aiogram 3.x](https://img.shields.io/badge/Telegram_Bot-aiogram_3.x-2CA5E0.svg?logo=telegram&logoColor=white)](https://docs.aiogram.dev/)
[![Telethon](https://img.shields.io/badge/Telegram_Ingestion-Telethon_MTProto-blue.svg)](https://docs.telethon.dev/)
[![Ollama](https://img.shields.io/badge/Local_LLM-Qwen_2.5_7B-black.svg?logo=ollama&logoColor=white)](https://ollama.ai/)
[![Tailscale](https://img.shields.io/badge/Mesh_VPN-Tailscale-235882.svg?logo=tailscale&logoColor=white)](https://tailscale.com/)

> **A 100% self-hosted, private intelligence engine running 24/7 on an ultra-low-power homelab server. It autonomously ingests news from technical RSS feeds and public Telegram channels, filters viral noise and spam, offloads deep neural analysis to a remote GPU workstation via Wake-on-LAN, and delivers curated morning and evening briefings directly to a personal Telegram bot and private web dashboard.**

---

## 📑 Table of Contents
- [Problem & Motivation](#-problem--motivation)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Hybrid Compute & Hardware Offloading (WoL)](#-hybrid-compute--hardware-offloading-wol)
- [Pipeline Lifecycle](#-pipeline-lifecycle)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Configuration (.env)](#configuration-env)
  - [Deployment with Docker Compose](#deployment-with-docker-compose)
- [Mobile & Telegram Bot Commands](#-mobile--telegram-bot-commands)
- [License](#-license)

---

## 🎯 Problem & Motivation

Modern digital communication channels (Telegram, RSS, blogs) generate thousands of posts daily, resulting in acute **information overload** and a deteriorating **Signal-to-Noise Ratio (SNR)**. Readers waste valuable time parsing clickbait, viral memes, disguised commercial advertisements, and redundant duplicate coverage across media outlets.

**This project solves the problem by:**

1. Operating **100% privately** on personal hardware without recurring SaaS API subscription costs.
2. Employing **heuristic sanitization and semantic deduplication** to eliminate junk data before AI analysis.
3. Leveraging **local Large Language Models (LLMs)** to summarize complex news, extract key insights, explain *why it matters*, and score importance from 1.0 to 10.0.
4. Delivering concise, actionable briefings on a fixed schedule (08:00 & 20:00).

---

## ✨ Key Features

- **📡 Multi-Protocol Ingestion:**
  - **Asynchronous RSS/Atom Engine:** Robust `httpx` + `feedparser` pipeline featuring binary encoding detection and recovery (`KOI8-R`, `Windows-1251`, `UTF-8`).
  - **Direct Telegram MTProto Ingestion:** Native Telegram client integration via `Telethon`, parsing raw channel posts without third-party aggregator dependencies.
- **🧹 Multi-Tier Sanitization & Deduplication:**
  - Strips promotional disclosures (`#реклама`, `erid:`), Telegram formatting artifacts, and attention-seeking emoji spam.
  - **Level 1:** SHA-256 content hashing for exact-match deduplication.
  - **Level 2:** Sliding-window Jaccard title similarity and Overlap Coefficient (threshold: `0.45`) across 48-hour comparison pools.
- **🧠 Hybrid Local AI Pipeline (Ollama + Qwen 2.5):**
  - Type-safe, structured JSON schema extraction using Pydantic v2.
  - Neural importance scoring (1.0–10.0), domain categorization, bulleted takeaways, and context explanations.
- **⚡ Remote Hardware Compute Offloading (Wake-on-LAN):**
  - Automatically wakes the high-performance desktop workstation (NVIDIA RTX 3060 12GB VRAM) over the local network to process neural inferences in seconds, preserving the homelab server's low power footprint.
- **🤖 Private Telegram Bot (`aiogram 3.x`):**
  - Outbound long-polling architecture requiring zero inbound router port forwarding.
  - Strict zero-trust admin authorization whitelist.
  - Interactive touch buttons, server health telemetry, manual WoL triggers, and smart 4096-character chunking.
- **📊 Real-time Web Dashboard (HomeGuard):**
  - Asynchronous REST API powered by FastAPI and SQLAlchemy 2.0.
  - Lightweight, responsive single-page application (SPA) accessible securely over the Tailscale mesh network.

---

## 🏛 System Architecture

```
                  +-------------------------------------------------------------------------+
                  |                    External News Sources & APIs                         |
                  |     (OpenNET, Hacker News RSS, Telegram MTProto Channels: @newcsgo)     |
                  +--------------------+-------------------------------+--------------------+
                                       │                               │
                                       ▼                               ▼
                  +-------------------------------------------------------------------------+
                  |  HOMELAB NODE: Lenovo Server (Intel Celeron N3060 / 4GB RAM / Ubuntu)   |
                  |                                                                         |
                  |   [ Docker Compose Infrastructure ]                                     |
                  |                                                                         |
                  |   ┌────────────────────────┐         ┌──────────────────────────────┐   |
                  |   │   news_ai_postgres     │         │       news_ai_app            │   |
                  |   │   (PostgreSQL 16)      │<───────>│   (FastAPI REST + Web SPA)   │   |
                  |   │   Persistent Database  │         │   Port: 8000                 │   |
                  |   └───────────▲────────────┘         └──────────────────────────────┘   |
                  |               │                                                         |
                  |               │                      ┌──────────────────────────────┐   |
                  |               │                      │       news_ai_bot            │   |
                  |               └─────────────────────>│   (aiogram 3.x Long Polling) │   |
                  |                                      │   + APScheduler Engine       │   |
                  |                                      └──────────────┬───────────────┘   |
                  +-----------------------------------------------------│-------------------+
                                                                        │
                         ┌──────────────────────────────────────────────┴───────────────┐
                         │                                                              │
         UDP Magic Packet (WoL)                                           Encrypted WireGuard
       MAC: 18:31:BF:B5:27:AA                                              Tailscale Mesh Tunnel
                         │                                                              │
                         ▼                                                              ▼
                  +-------------------------------------------------------------------------+
                  |  COMPUTE WORKER NODE: Primary Workstation (Windows 11 / WSL2)           |
                  |  Hardware: Intel i3-8100 / 32GB RAM / NVIDIA GeForce RTX 3060 12GB VRAM |
                  |                                                                         |
                  |   [ Ollama Service (:11434) ]                                           |
                  |   Model: qwen2.5:7b (Full GPU Layer Offload / FP16)                     |
                  |   Inference Latency: ~9.5s per comprehensive article analysis           |
                  +-------------------------------------------------------------------------+
```

---

## ⚡ Hybrid Compute & Hardware Offloading (WoL)

The primary production server is an energy-efficient laptop consuming under 10W at idle. Running heavy Large Language Models on its dual-core Celeron CPU (without AVX2) would take 2 to 3 minutes per article — far too slow for a practical briefing pipeline.

**The hybrid solution:**

1. At 07:45 / 19:45, the homelab server broadcasts a UDP magic packet (`b'\xff'*6 + MAC*16`) over the local subnet (`192.168.178.255:9`).
2. The primary workstation wakes up within 8–10 seconds.
3. The server validates node reachability via an HTTP GET request over Tailscale (`http://100.114.251.81:11434/api/tags`).
4. Articles are batched to Qwen 2.5 7B running on the RTX 3060 GPU, completing analysis within 15–20 seconds.
5. The workstation automatically returns to sleep after its idle timeout expires, maintaining minimal overall power consumption.

---

## 🔄 Pipeline Lifecycle

Articles transition through a deterministic finite-state machine:

```
 [ Fetch Collector ]
         │
         ▼
    (COLLECTED) ──[ Duplicate Check ]──> (DUPLICATE) ──> Linked to canonical ID
         │
         ▼
    (PROCESSED) ──[ Content Sanitization & Cleaning ]
         │
         ▼
   (SUMMARIZED) ──[ Neural Inference (Score, Why it Matters, Categories) ]
         │
         ▼
    (REPORTED)  ──[ Compiled into Digest & Pushed to Telegram / Web ]
```

**Guaranteed non-redundancy:** articles marked as `REPORTED` are permanently archived in PostgreSQL and will never be re-sent in future digests.

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Core Runtime | Python 3.12 (AsyncIO) | Asynchronous non-blocking architecture |
| Containerization | Docker, Docker Compose | Isolated, reproducible service microservices |
| Relational Database | PostgreSQL 16 Alpine | Persistent relational storage & indexing |
| ORM & Migrations | SQLAlchemy 2.0, Alembic | Type-safe declarative async database layer |
| Web & REST API | FastAPI, Uvicorn | High-throughput web dashboard backend |
| Telegram Ingestion | Telethon (MTProto API) | Direct Telegram channel ingestion |
| Telegram Bot | aiogram 3.x | Reactive mobile bot with long polling |
| Scheduling | APScheduler 3.x | Timezone-aware cron triggers (Europe/Zurich) |
| Local LLM Engine | Ollama (qwen2.5:7b) | Local neural summarization and scoring |
| Networking & Mesh | Tailscale (WireGuard) | Zero-config encrypted cross-device mesh |

---

## 📁 Repository Structure

```
.
├── alembic/                    # Database migration scripts
│   ├── env.py                  # Migration runner environment
│   └── versions/               # Incremental revision versions
├── app/
│   ├── ai/                     # LLM client & structured JSON prompts
│   ├── bot/                    # aiogram 3.x bot (handlers, keyboards, WoL)
│   ├── collectors/             # Asynchronous collectors (RSS, Telegram)
│   ├── database/               # SQLAlchemy models and session factories
│   ├── processing/             # HTML sanitization & deduplication algorithms
│   ├── services/               # Ingestion, summarization, report builder
│   ├── api.py                  # FastAPI REST endpoints
│   ├── config.py                # Pydantic type-safe settings
│   ├── main.py                  # Pipeline entrypoint
│   └── scheduler.py             # APScheduler cron configuration
├── docs/                        # Architectural guides for all 9 phases
├── web/                         # HomeGuard Single-Page Application (SPA)
├── compose.yaml                 # Multi-container production deployment
├── Dockerfile                   # Application container definition
├── requirements.txt             # Python dependencies
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Docker Engine 24.0+ and Docker Compose v2.
- A Telegram account with API credentials ([my.telegram.org](https://my.telegram.org)).
- A Telegram Bot token from [@BotFather](https://t.me/BotFather).
- Ollama running locally or on a LAN/Tailscale workstation.

### Configuration (.env)

Create a `.env` file in the repository root:

```env
# Database Configuration
POSTGRES_DB=news_db
POSTGRES_USER=news_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# AI Inference (Ollama)
OLLAMA_BASE_URL=http://100.114.251.81:11434
OLLAMA_MODEL=qwen2.5:7b

# Telegram Client API (Telethon Ingestion)
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=your_32_character_api_hash
TELEGRAM_SESSION_NAME=news_collector

# Telegram Bot API (aiogram 3.x Delivery)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_ADMIN_CHAT_ID=your_numeric_user_id

# Hardware Management (Wake-on-LAN)
WOL_MAC_ADDRESS=18:31:BF:B5:27:AA
WOL_BROADCAST_IP=192.168.178.255
```

### Deployment with Docker Compose

Build and start all services in the background:

```bash
docker compose up -d --build
```

Verify container health:

```bash
docker compose ps
```

Expected active containers: `news_ai_postgres`, `news_ai_ollama`, `news_ai_app`, `news_ai_bot`.

Access the web dashboard by opening `http://<server-ip>:8000` in your browser (or over Tailscale).

---

## 📱 Mobile & Telegram Bot Commands

The bot operates interactively via touch buttons and slash commands:

| Command | Action |
|---|---|
| `/start` | Displays the welcome guide and mounts interactive reply buttons |
| 📰 Свежий дайджест | Retrieves and delivers the most recent compiled briefing |
| ⚡ Сгенерировать сейчас | Compiles an on-demand digest from accumulated news |
| 🚀 Запустить полный пайплайн | Executes complete cycle: WoL → Ingest → Dedupe → AI → Push |
| 🖥 Статус сервера | Reports database telemetry and checks GPU Ollama reachability |
| 🔌 Разбудить ПК (WoL) | Sends IEEE 802.3 Magic Packet to power on the RTX 3060 PC |

---

## 📄 License

This project is open-source software licensed under the MIT License.