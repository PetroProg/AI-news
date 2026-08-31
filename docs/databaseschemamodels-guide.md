# 🗄 Guide: Database Schema & ORM Models Design (SQLAlchemy 2.0)

This guide documents the relational data architecture and ORM model design for the Personal AI News Aggregator, built using modern SQLAlchemy 2.0 declarative mapping, PostgreSQL-specific data types (JSONB), and composite indexing for high-throughput deduplication and reporting.

## 📑 Table of Contents
1. [Entity-Relationship Architecture](#1-entity-relationship-architecture)
2. [Domain Model Specifications](#2-domain-model-specifications)
3. [Deduplication & Indexing Strategy](#3-deduplication--indexing-strategy)
4. [ORM Implementation Logic](#4-orm-implementation-logic)
5. [Package Export Manifest](#5-package-export-manifest)
6. [Verification & Metadata Validation](#6-verification--metadata-validation)

## 1. Entity-Relationship Architecture

```
  ┌────────────┐               ┌────────────────┐
  │   Source   │ 1           * │    Article     │ *         * ┌─────────┐
  │────────────├──────────────►│────────────────├────────────►│   Tag   │
  │ id (PK)    │               │ id (PK)        │(via Article │─────────│
  │ name       │               │ source_id (FK) │     Tag)    │ id (PK) │
  │ type, url  │               │ category_id(FK)│             │ name    │
  └────────────┘               │ content_hash   │             └─────────┘
                               │ status, score  │
  ┌────────────┐ 1           * │ duplicate_of(FK)◄───┐ (Self-ref:
  │  Category  ├──────────────►│ published_at   │    │  Original story)
  │────────────│               └───────┬────────┘    │
  │ id (PK)    │                       │ 1           │
  │ name, slug │                       ▼ 1           │
  └────────────┘                 ┌───────────┐       │
                                 │  Summary  │       │
                                 │───────────│       │
                                 │ id (PK)   │       │
                                 │ key_points│       │
                                 │ summary   │       │
                                 └───────────┘       │
                                                     │
  ┌────────────┐ 1           * ┌────────────────┐    │
  │   Report   ├──────────────►│ ReportArticle  │    │
  │────────────│ (via Report   │────────────────│    │
  │ id (PK)    │   Article)    │ report_id (PK) │    │
  │ 08:00/20:00│               │ article_id(PK) ├────┘
  └────────────┘               └────────────────┘
```

## 2. Domain Model Specifications

### 2.1 Enums

- **`SourceType`** — identifies the ingestion driver: `rss`, `telegram`, `web`, or `custom`. Determines which collector logic is used to fetch new content.
- **`ArticleStatus`** — defines the processing lifecycle state of an article as it moves through the pipeline:
  `collected → cleaned → duplicate | filtered_out → processed → summarized → reported`.
  This lets the system query articles at any stage without needing separate tables per stage.
- **`ReportType`** — defines the scheduled dispatch windows: `morning_0800`, `evening_2000`, or `custom`.

### 2.2 Entities Summary

| Entity | Primary Responsibility | Key Constraints & Relationships |
|---|---|---|
| **Source** | Ingestion feeds (RSS, Telegram channels, Websites). | Unique `url`; cascade delete to its articles. |
| **Category** | Topic classification (AI, Cybersecurity, Linux, etc.). | Unique `slug` & `name`; `is_favorite` flag for preference weighting. |
| **Tag** | Granular keyword tagging. | Many-to-Many association with `Article` via `ArticleTag`. |
| **Article** | Core content storage, metadata, and lifecycle status. | Indexed `content_hash`; self-referencing `duplicate_of_id`; FKs to `Source` & `Category`. |
| **Summary** | Local LLM structured insights. | One-to-One with `Article`; JSONB key points, token metrics, model identifier. |
| **Report** | Generated digests formatted for Telegram delivery. | Ordered Many-to-Many association with `Article` via `ReportArticle`. |

## 3. Deduplication & Indexing Strategy

**Fast exact-match deduplication:**
Each article stores a `content_hash` (a SHA-256 hash of its normalized text). This field is indexed, allowing near-instant lookups to check whether an incoming article has already been seen — before spending time and compute running it through the LLM pipeline.

**Duplicate cluster preservation:**
Instead of silently dropping duplicate stories, a `duplicate_of_id` field links the duplicate article back to the original story. This preserves the fact that the same story was reported by multiple sources, rather than losing that information.

**Composite filtering indexes:**
- `ix_articles_published_status` on `(published_at, status)` — speeds up the periodic report-generation query, which filters articles published within the last 12-hour window and in a specific processing status.
- `ix_articles_source_external_id` on `(source_id, external_id)` — prevents re-fetching and re-processing content that was already scraped, by quickly checking if a given RSS `<guid>` or Telegram `message_id` from a specific source already exists.

## 4. ORM Implementation Logic

**File: `app/database/models.py`**

This is the single source of truth for the database schema, defined using SQLAlchemy 2.0's typed declarative style (`Mapped[...]` + `mapped_column`), which gives full IDE autocompletion and type checking on model fields.

- **`Base`** — the common declarative base class every model inherits from; its metadata is what gets used to create tables and run migrations.

- **`Source`** — represents a single content feed. Stores its type, URL, fetch interval, and last-fetched timestamp so a scheduler can decide when to poll it again. Has a one-to-many relationship to `Article`, with `cascade="all, delete-orphan"` meaning deleting a source also deletes all its collected articles.

- **`Category`** — a simple lookup table for topics. The `slug` field is a URL-safe unique identifier (used e.g. in filters or links), separate from the human-readable `name`.

- **`Tag` / `ArticleTag`** — implements a classic many-to-many relationship. Since an article can have several tags and a tag can belong to many articles, a join table (`ArticleTag`) is needed to connect them, with cascading deletes on both sides so orphaned links are cleaned up automatically.

- **`Article`** — the central entity of the whole schema. Key design choices:
  - `source_id` and `category_id` are foreign keys, but `category_id` uses `SET NULL` on delete (so removing a category doesn't destroy the article, just leaves it uncategorized), while `source_id` uses `CASCADE` (an article can't logically exist without its source).
  - `raw_content` keeps the original scraped text, while `cleaned_content` holds a normalized/processed version — separating "what we collected" from "what we process," which is useful for debugging and reprocessing.
  - `content_hash` and `duplicate_of_id` implement the deduplication logic described above.
  - `status` tracks where the article currently sits in the processing pipeline.
  - `importance_score` is a numeric field reserved for a future ranking/prioritization step (e.g. deciding which articles make it into a report).
  - The two composite indexes are declared explicitly in `__table_args__`, since SQLAlchemy doesn't infer multi-column indexes automatically from single-field settings.

- **`Summary`** — stores the LLM-generated output for a given article: a short summary, a "why it matters" explanation, and structured `key_points` stored as JSONB (letting PostgreSQL index and query into semi-structured data instead of using a plain text blob). It's a strict one-to-one relationship with `Article` (`unique=True` on `article_id`), since each article gets exactly one current summary. `model_used` and token counters track which LLM produced the summary and its cost.

- **`Report`** — represents a compiled digest ready to be sent to Telegram. Stores the final `content_markdown` as well as bookkeeping fields (`total_articles_collected` vs `total_articles_included`) to track how selective the report generation was, and delivery status (`sent_to_telegram`, `sent_at`).

- **`ReportArticle`** — the join table between `Report` and `Article`, similar in purpose to `ArticleTag`, but with one addition: a `position` field. This preserves the *order* in which articles appear inside a specific report, which a plain many-to-many relationship wouldn't capture on its own.

## 5. Package Export Manifest

**File: `app/database/__init__.py`**

Re-exports all models and enums from `models.py` at the package level (`app.database`), so other parts of the application can do a single clean import (e.g. `from app.database import Article, ArticleStatus`) instead of reaching into the internal `models` module directly. The `__all__` list makes this the explicit, documented public interface of the database package.

## 6. Verification & Metadata Validation

Run the following command to verify model relationships and table registration:

```bash
docker compose run --rm app python -c "from app.database import Base; print('Registered tables:', list(Base.metadata.tables.keys()))"
```

Expected output:

```
Registered tables: ['sources', 'categories', 'tags', 'article_tags', 'articles', 'summaries', 'reports', 'report_articles']
```

This confirms that every model class was correctly picked up by SQLAlchemy's declarative metadata and mapped to a table — a useful sanity check before running the first Alembic migration.