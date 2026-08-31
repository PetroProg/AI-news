# 🚀 Guide: Database Migrations with Alembic & Schema Deployment

This guide documents the database migration workflow for the Personal AI News Aggregator, detailing how Alembic integrates with SQLAlchemy 2.0, manages declarative schema diffing (autogenerate), and deploys DDL changes to PostgreSQL.

## 📑 Table of Contents
1. [Architecture & Why Migrations Matter](#1-architecture--why-migrations-matter)
2. [Step 1: Docker Volume Mount Optimization](#2-step-1-docker-volume-mount-optimization)
3. [Step 2: Alembic Initialization](#3-step-2-alembic-initialization)
4. [Step 3: Dynamic Environment Configuration](#4-step-3-dynamic-environment-configuration)
5. [Step 4: Autogenerating the Initial Migration Revision](#5-step-4-autogenerating-the-initial-migration-revision)
6. [Step 5: Applying Migrations to PostgreSQL](#6-step-5-applying-migrations-to-postgresql)
7. [Step 6: Schema Verification via psql](#7-step-6-schema-verification-via-psql)
8. [Step 7: Troubleshooting & Common Pitfalls](#8-step-7-troubleshooting--common-pitfalls)

## 1. Architecture & Why Migrations Matter

In production applications, modifying a database schema by running `Base.metadata.create_all()` is dangerous because it cannot alter existing tables or handle structural evolution without data loss.

Alembic acts as version control for database schemas:

- **Automatic diffing:** compares the active state of PostgreSQL tables against the SQLAlchemy ORM `Base.metadata` and generates Python migration scripts.
- **Bi-directional execution:** supports forward upgrades (`upgrade head`) and rollbacks (`downgrade -1`).
- **History tracking:** stores the current schema revision hash in a dedicated `alembic_version` table inside PostgreSQL, so the system always knows exactly which version of the schema is currently deployed.

```
┌─────────────────────────┐           Autogenerate           ┌─────────────────────────┐
│ SQLAlchemy ORM Models   ├─────────────────────────────────►│ Alembic Migration File  │
│ (app/database/models.py)│                                  │ (alembic/versions/*.py) │
└─────────────────────────┘                                  └────────────┬────────────┘
                                                                          │
                                                                    upgrade head
                                                                          ▼
┌─────────────────────────┐                                  ┌─────────────────────────┐
│ PostgreSQL Database     │◄─────────────────────────────────┤ PostgreSQL DDL Execution│
│ (Tables + Indexes)      │                                  │ (CREATE TABLE / INDEX)  │
└─────────────────────────┘                                  └─────────────────────────┘
```

## 2. Step 1: Docker Volume Mount Optimization

**File: `compose.yaml`**

To ensure migration files generated *inside* the container are instantly written to the host filesystem and visible in VS Code, the volume mount is widened from just the `app/` source folder to the entire project directory (`.:/app`). Without this, Alembic would generate migration scripts that only exist inside the ephemeral container filesystem and disappear once the container is removed — this change makes them land directly on disk, ready to be committed to Git.

## 3. Step 2: Alembic Initialization

Run inside the project root:

```bash
docker compose run --rm app alembic init alembic
```

This scaffolds the Alembic toolchain into the project, creating:

- **`alembic.ini`** — the global migration configuration file (logging, script location, etc.).
- **`alembic/env.py`** — the Python runtime environment that Alembic executes whenever a migration command runs; this is the file that needs customizing to connect it to the app's own settings and models.
- **`alembic/script.py.mako`** — a template used to generate the boilerplate for every new migration file.
- **`alembic/versions/`** — the directory where each individual migration script (one per schema change) is stored.

## 4. Step 3: Dynamic Environment Configuration

**File: `alembic.ini`**

The default, hardcoded `sqlalchemy.url` line is commented out. Instead of storing the database connection string as plain text in a config file, the URL will be provided dynamically at runtime — keeping credentials out of version control and in sync with the app's own `.env` configuration.

**File: `alembic/env.py`**

This file is rewritten to plug Alembic into the application's existing configuration and models rather than using Alembic's own defaults. The logic does three key things:

1. **Import path fix:** the app's own `app` package isn't on Python's import path by default inside the `alembic/` folder, so the project root is added manually. This lets `env.py` import the app's real settings and models.
2. **Reuse existing configuration:** instead of duplicating the database URL, `env.py` calls the same `get_settings()` used by the rest of the app and pulls `sync_database_url` (the `psycopg2`-based connection string) — so there's a single source of truth for credentials, and the `.env` file remains the only place they're defined.
3. **Bind ORM metadata:** `target_metadata` is set to `Base.metadata` from `app/database/models.py`. This is what makes "autogenerate" possible — Alembic compares this metadata (the models as Python currently defines them) against the real, live schema in PostgreSQL, and computes the difference.

The file also defines two migration modes:
- **Offline mode** — generates raw SQL DDL statements without needing a live database connection (useful for review or manual execution).
- **Online mode** — connects directly to the PostgreSQL engine and applies changes; it also enables `compare_type=True` so column *type* changes (not just new/removed columns) are detected during autogeneration.

## 5. Step 4: Autogenerating the Initial Migration Revision

```bash
docker compose run --rm app alembic revision --autogenerate -m "initial_schema"
```

Alembic inspects the (currently empty) PostgreSQL database, compares it against `Base.metadata`, and — since nothing exists yet — generates a migration file containing the full set of `CREATE TABLE` operations for every model: `sources`, `categories`, `tags`, `article_tags`, `articles`, `summaries`, `reports`, and `report_articles`. This includes all primary keys, foreign keys with their `CASCADE` / `SET NULL` delete behavior, unique constraints, and the composite indexes defined in the models. The resulting file is just Python code and should be reviewed before applying it, since autogenerate is a helpful starting point but not always perfectly accurate for complex changes.

## 6. Step 5: Applying Migrations to PostgreSQL

```bash
docker compose run --rm app alembic upgrade head
```

This command tells Alembic to bring the database up to the latest ("head") revision by executing any pending migration scripts in order. On a fresh database, it runs the initial migration generated above, creating every table and constraint. The `alembic_version` table is also created automatically at this point, storing a hash that marks exactly which migration was last applied — this is what lets Alembic know where to resume from next time, and what makes rollbacks (`downgrade`) possible.

## 7. Step 6: Schema Verification via psql

```bash
docker compose exec postgres psql -U news_user -d news_db -c "\dt"
```

This connects directly to the running PostgreSQL container and lists all tables in the `news_db` database, confirming that the migration was actually applied at the database level (not just that Alembic *thinks* it succeeded). Seeing all the expected tables — plus `alembic_version` — confirms the schema deployment worked end to end.

## 8. Step 7: Troubleshooting & Common Pitfalls

**`no configuration file provided: not found`**
- **Cause:** Running `docker compose` while in the home directory (`~`) rather than the project directory.
- **Fix:** `cd ~/Projects/news-ai` before executing Compose commands.

**Generated files do not appear in VS Code**
- **Cause:** The Docker container volume was restricted to `./app:/app/app:ro` instead of mounting the project root `.:/app`.
- **Fix:** Mount `.:/app` in `compose.yaml` (see Step 1).

**`Can't locate revision identified by 'xxxx'`**
- **Cause:** The `alembic_version` table in PostgreSQL has a revision hash that doesn't match any file in `alembic/versions/` — usually because the migration files weren't committed to Git while the database itself was.
- **Fix:** Ensure all `alembic/versions/*.py` files are committed to Git and kept in sync across environments.