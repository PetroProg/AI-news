# ⏱️ Architectural Guide: Autonomous Scheduling & Remote Hardware Orchestration (Phase 9)

## 1. Executive Summary

Phase 9 completes the transformation of the Personal AI News Aggregator into an entirely hands-off, self-sustaining autonomous intelligence appliance. By pairing an asynchronous scheduling engine (`APScheduler`) with hardware-level remote power management (Wake-on-LAN) and cross-network health checking over Tailscale, the system executes scheduled ingestion, AI inference, and mobile publication without any manual trigger or oversight.

## 2. End-to-End Orchestrated Pipeline Flow

```
                  +-------------------------------------------------+
                  |       APScheduler Cron Trigger (Europe/Zurich)  |
                  |             07:45 (Morning) / 19:45 (Evening)   |
                  +------------------------+------------------------+
                                           |
                                           v
                  +-------------------------------------------------+
                  |      Step 1: Hardware Orchestration (WoL)       |
                  | Broadcast magic packet to MAC 18:31:BF:B5:27:AA |
                  +------------------------+------------------------+
                                           |
                                           v
                  +-------------------------------------------------+
                  |   Step 2: Tailscale Node Verification (Ping)    |
                  |     HTTP GET 100.114.251.81:11434/api/tags      |
                  |  [Online: RTX 3060 7B] <-> [Offline: Fallback]  |
                  +------------------------+------------------------+
                                           |
                                           v
                  +-------------------------------------------------+
                  |      Step 3: Multi-Source Ingestion Engine      |
                  |  - RSS: OpenNET, Hacker News                    |
                  |  - Telegram MTProto: @newcsgo, @habr_com        |
                  +------------------------+------------------------+
                                           |
                                           v
                  +-------------------------------------------------+
                  |  Step 4: Cleaning & Deduplication Service       |
                  |  - HTML/Ad Sanitization + SHA-256 / Jaccard Sim |
                  +------------------------+------------------------+
                                           |
                                           v
                  +-------------------------------------------------+
                  |     Step 5: High-Speed Neural Inference         |
                  |  - Structured Pydantic analysis on RTX 3060 GPU |
                  +------------------------+------------------------+
                                           |
                                           v
                  +-------------------------------------------------+
                  |    Step 6: Curated Digest Synthesis             |
                  |  - Threshold filter >= 5.0, Top Highlights      |
                  |  - Categorization & Report Transition (REPORTED)|
                  +------------------------+------------------------+
                                           |
                                           v
                  +-------------------------------------------------+
                  |      Step 7: Automated Telegram Delivery        |
                  |  - Message chunking (<= 4000 chars)             |
                  |  - Direct push to TELEGRAM_ADMIN_CHAT_ID        |
                  +-------------------------------------------------+
```

This is essentially the culmination of every previous phase: ingestion, cleaning, deduplication, AI summarization, report building, and Telegram delivery are no longer separate manual steps — they're wired together into one continuous pipeline that runs itself on a schedule.

## 3. Key Components & Implementation Design

### 3.1 `PipelineOrchestrator` (`app/services/orchestrator.py`)

This component acts as the central coordinator, tying together all the previously independent, decoupled parts of the system (collectors, cleaner, summarizer, report builder) into a single end-to-end run.

- **`wait_for_gpu_node(timeout_seconds=30)`** — before sending any inference workload to the GPU workstation, this proactively checks HTTP connectivity to it across the Tailscale mesh. This matters because the worker node was just woken up via Wake-on-LAN moments earlier and needs a short window to fully boot and start its inference service — trying to send requests to it immediately, without this check, would just produce connection timeouts. By polling for readiness first, the orchestrator avoids failing a run simply because it didn't wait long enough.
- **Fail-safe collector loop:** each source's collection step (RSS, Telegram) runs inside its own isolated `try/except` block. This means if one specific feed or channel has a transient network failure, that failure is contained and logged, but doesn't stop the rest of the sources from being processed in the same run — a single flaky source can never bring down the whole scheduled job.
- **Relational integrity:** every database operation across the whole pipeline run happens inside managed SQLAlchemy async session transactions, so partial or inconsistent writes are avoided even when a step in the middle of the run fails.

### 3.2 Scheduled Worker Engine (`app/scheduler.py`)

- Uses `APScheduler`'s `AsyncIOScheduler`, which shares the same event loop as the existing `aiogram` long-polling dispatcher. This means the scheduler and the Telegram bot can run side-by-side in the same process without needing separate threads or a second container just to handle timing.
- The cron triggers are anchored to a native timezone object (`ZoneInfo("Europe/Zurich")`) rather than working in raw UTC offsets. Since the containers themselves run in UTC internally, this explicit timezone anchoring is what keeps the actual trigger times (07:45 and 19:45 local time) accurate year-round, including correctly shifting across daylight-saving transitions without any manual adjustment.

### 3.3 Containerized Microservice Topology (`compose.yaml`)

The system is split into four cooperating services, each with a distinct responsibility:

- **`news_ai_bot`** — hosts both the Telegram bot listener and the APScheduler background daemon; this is the service that actually triggers and runs the scheduled pipeline.
- **`news_ai_app`** — hosts the FastAPI REST backend and the static single-page dashboard, served on port 8000.
- **`news_ai_postgres`** — the PostgreSQL 16 database, with an automated healthcheck that other services wait on before starting.
- **`news_ai_ollama`** — a local CPU-based inference container that serves as an emergency fallback, used if the GPU workstation fails to wake up or become reachable in time.

All services are configured with `restart: unless-stopped`, meaning that after a server reboot (planned or unplanned), the entire stack — database, bot, scheduler, and dashboard — comes back online automatically without any manual intervention.

## 4. Verification & Production Metrics

During end-to-end testing of a full scheduled run:

- **Total articles harvested:** 42 items across RSS and Telegram channels in a single collection cycle.
- **Filtered and summarized:** 9 high-value intelligence items made it past the editorial threshold and were categorized into domain groups.
- **Message transport:** the finished digest was delivered to the mobile Telegram client within 15–20 seconds of the scheduled trigger firing — confirming the full pipeline, including the GPU wake-up and inference step, comfortably completes well within a reasonable time window.