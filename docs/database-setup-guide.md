# 🐘 Guide: PostgreSQL & Async SQLAlchemy 2.0 Integration

This guide documents the database infrastructure setup for the Personal AI News Aggregator, covering containerization with Docker Compose, environment configuration via Pydantic Settings, and asynchronous database connectivity with SQLAlchemy 2.0 and asyncpg.

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Step 1: PostgreSQL Service in Docker Compose](#2-step-1-postgresql-service-in-docker-compose)
3. [Step 2: Python Dependencies & Docker Caching](#3-step-2-python-dependencies--docker-caching)
4. [Step 3: Type-Safe Configuration with Pydantic](#4-step-3-type-safe-configuration-with-pydantic)
5. [Step 4: Asynchronous Session Factory (SQLAlchemy 2.0)](#5-step-4-asynchronous-session-factory-sqlalchemy-20)
6. [Step 5: Application Health Check & Verification](#6-step-5-application-health-check--verification)
7. [Step 6: Troubleshooting & Common Pitfalls](#7-step-6-troubleshooting--common-pitfalls)

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   Docker Bridge Network                │
│                                                        │
│  ┌───────────────────────┐   asyncpg (Port 5432)   ┌──┴───────────────────┐
│  │   news_ai_app         ├────────────────────────►│  news_ai_postgres    │
│  │   (Python 3.12-slim)  │                         │  (postgres:16-alpine)│
│  └───────────────────────┘                         └──┬───────────────────┘
│                                                       │
└───────────────────────────────────────────────────────┼────────────────┘
                                                        ▼
                                             ┌──────────────────────┐
                                             │ Docker Named Volume  │
                                             │   (postgres_data)    │
                                             └──────────────────────┘
```

**Key Architectural Decisions:**

- **Alpine Linux Base Image** (`postgres:16-alpine`): Minimizes disk footprint (~140 MB vs ~450 MB) and memory usage for our low-resource Lenovo laptop.
- **Persistent Storage** (`postgres_data` volume): Ensures database data survives container restarts, updates, and rebuilds.
- **Internal Network Isolation:** Database port 5432 is not exposed to the local network (the `ports:` directive is omitted), protecting database access to only containers within the Compose network.
- **Dual Driver Strategy:**
  - `asyncpg`: High-performance asynchronous driver used by the core app for non-blocking I/O operations.
  - `psycopg2-binary`: Synchronous driver required for Alembic schema migrations.

## 2. Step 1: PostgreSQL Service in Docker Compose

**File: `compose.yaml`**

Defines two services: `app` (our Python application, built from the local `Dockerfile`) and `postgres` (the database, based on the lightweight `postgres:16-alpine` image). The `app` service waits until Postgres reports itself healthy (`depends_on` + `condition: service_healthy`) before starting, so the app never tries to connect too early. A `healthcheck` on the `postgres` service runs `pg_isready` every 5 seconds to confirm the database is accepting connections. Database credentials are injected via environment variables, and data is persisted in a named volume (`postgres_data`) so it survives container rebuilds.

**File: `.env`**

Holds the actual environment values used by `compose.yaml` and the app: app environment/log level, plus the Postgres database name, user, password, host, and port. Keeping these out of the compose file makes it easy to change credentials per environment without editing code.

## 3. Step 2: Python Dependencies & Docker Caching

**File: `requirements.txt`**

Lists the Python packages needed for the database layer: `sqlalchemy[asyncio]`, `asyncpg` (async driver), `psycopg2-binary` (sync driver for migrations), `alembic` (migrations), and `pydantic` / `pydantic-settings` (typed configuration).

**File: `Dockerfile`**

Builds the app image on top of `python:3.12-slim`, installs system packages needed to compile database drivers (`gcc`, `libpq-dev`), creates a non-root user for security, then installs the Python dependencies. Crucially, `requirements.txt` is copied and installed **before** the rest of the application code is copied in — this lets Docker cache the installed packages as a separate layer, so changing your Python code later doesn't force a full reinstall of dependencies, keeping rebuilds fast.

## 4. Step 3: Type-Safe Configuration with Pydantic

**File: `app/config.py`**

Defines a `Settings` class (via `pydantic-settings`) that automatically loads and validates all environment variables from `.env` — so if a required variable is missing, the app fails fast with a clear error instead of crashing later with a confusing one. It also exposes two computed properties: `async_database_url` (built for `asyncpg`, used by the app at runtime) and `sync_database_url` (built for `psycopg2`, used by Alembic for migrations). A `get_settings()` function wraps this in an `lru_cache` so settings are parsed only once and reused everywhere as a singleton.

## 5. Step 4: Asynchronous Session Factory (SQLAlchemy 2.0)

**File: `app/database/session.py`**

Creates the SQLAlchemy async `engine` using the connection URL from settings, tuned for a low-resource environment (`pool_size=5`, `max_overflow=10`, `pool_pre_ping=True` to detect dead connections before using them). Defines `async_session_maker`, a factory for producing new database sessions. Provides `get_db_session()`, a reusable async generator/dependency that opens a session, yields it for use, rolls back on error, and always closes it afterward — the standard pattern for safe session handling. Also includes `check_db_connection()`, a small helper that runs `SELECT version();` to confirm the app can actually reach and query the database.

## 6. Step 5: Application Health Check & Verification

**File: `app/main.py`**

The application's entry point. On startup it configures logging, then calls `check_db_connection()` to verify the database is reachable — logging success (with the Postgres version) or exiting with an error code if the connection fails. This acts as a simple smoke test to confirm the whole stack (config → engine → container network) is wired correctly before any real application logic runs.

**Verification commands:**

```bash
# 1. Start PostgreSQL container in detached mode
docker compose up -d postgres
# 2. Build Python application image with new dependencies
docker compose build app
# 3. Execute one-off test run of the Python application
docker compose run --rm app
```

A successful run logs the app name/version, confirms the Postgres host connection, and prints the database engine version — confirming the full setup works end to end.

## 7. Step 6: Troubleshooting & Common Pitfalls

**`connection to server at "postgres" failed: Connection refused`**
- **Cause:** PostgreSQL container is still initializing or stopped.
- **Fix:** Run `docker compose ps` and check logs with `docker compose logs postgres`. Ensure `condition: service_healthy` is present in `depends_on`.

**`password authentication failed for user "news_user"`**
- **Cause:** Password changed in `.env` after initial volume creation.
- **Fix:** If the database contains no valuable data, reset the volume:
```bash
docker compose down -v
docker compose up -d postgres
```

**`ModuleNotFoundError: No module named 'asyncpg'`**
- **Cause:** Container was not rebuilt after updating `requirements.txt`.
- **Fix:** Rebuild the container: `docker compose build app`.

To add this guide to your repository documentation:

```bash
git add docs/database-setup-guide.md
git commit -m "docs: add postgresql and async sqlalchemy setup guide"
git push
```
