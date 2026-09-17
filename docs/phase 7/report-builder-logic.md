# 📰 Architectural Design: Curated Report Builder & Editorial Filtering Engine

## 1. Core Objectives

Phase 7 synthesizes raw ingestion, semantic deduplication, and neural summaries into an actionable, human-centric intelligence briefing:

- **Signal-to-noise ratio optimization:** eliminating low-value social banter, viral memes, and channel advertisements, ensuring readers consume only meaningful events.
- **Editorial hierarchy:** stratifying news into prominent top highlights, domain-specific categories, and quick reference links based on algorithmic importance scoring.
- **Non-redundancy & state transition:** enforcing strict lifecycle guarantees so that articles included in one briefing are never repeated in subsequent digests.
- **Timezone awareness:** localizing report metadata and formatting for user-specific regional contexts.

## 2. Editorial State Machine & Report Pipeline

```
               [ Article Table (PostgreSQL) ]
                             │
                             ▼
         [ Query: status = SUMMARIZED, score >= 5.0 ]
                             │
                             ▼
              [ Sanitization & Normalization ]
         ├── Strips Telegram formatting artifacts (**, __, ##)
         └── Prunes leading emoji noise and sponsor tags
                             │
                             ▼
              [ Stratified Scoring Filter ]
                             │
             ┌───────────────┴───────────────┐
             ▼                               ▼
  [ Score >= 7.5 (Top 3-4) ]       [ Score: 5.0 - 7.4 ]
  └── Section: "🔥 ГЛАВНОЕ"        └── Group by Category
      - Title + Score Badge            - Linux & Infrastructure
      - Full AI Summary                - Cybersecurity
      - "Why It Matters" Context       - Gaming / Esports
      - Source Attribution Link        - AI & Development
                             │
                             ▼
                [ Formatter & Localizer ]
         ├── Timezone: Europe/Zurich (UTC+2)
         └── Markdown / Web Dashboard Syntax
                             │
                             ▼
            [ Relational Persistence Commit ]
         ├── Insert into `reports` table
         ├── Map included items via `report_articles`
         └── Transition article status: REPORTED
```

## 3. Engineering Decisions & Algorithmic Logic

### 3.1 Finite State Machine (Preventing Duplicate Reporting)

A key architectural principle here is preventing informational fatigue — a reader should never see the same story twice across two different digests. To guarantee that, every article progresses through a deterministic, one-directional state machine:

`COLLECTED` → ingested raw payload → `PROCESSED` → cleaned and confirmed unique → `SUMMARIZED` → enriched with LLM analytical metadata → `REPORTED` → formatted and committed into a finalized report.

Once an article gets linked to a report via the `report_articles` table, its status flips to `REPORTED`. Because every subsequent report-generation run only ever queries for unread `SUMMARIZED` items, an article that has already appeared in a digest simply can never be picked up again — the state machine itself enforces freshness, rather than relying on some separate "already sent" check.

### 3.2 Editorial Thresholding Strategy

Simply dumping every summarized article into a digest unfiltered would overwhelm the reader with noise. Instead, the report engine applies clear numeric thresholds to decide how (or whether) each story is presented:

- **Major highlights (score ≥ 7.5):** reserved for genuinely systemic events — things like a new Linux kernel release, a critical CVE, or a major acquisition. These get prime placement at the top of the digest, along with the full AI-generated summary and "why it matters" analysis, since they're worth a reader's full attention.
- **Categorical briefs (score 5.0–7.4):** grouped cleanly under topical headings (Linux, Security, Gaming, etc.), each shown as just a cleaned headline, a direct link, and a one-line snippet — enough to be aware of, without demanding deep reading.
- **Noise suppression (score < 5.0):** marketing chatter, giveaway announcements, and minor bug-fix notices are excluded from the daily digest entirely. They aren't deleted, though — they stay archived in PostgreSQL and remain searchable historically, just not surfaced in the day-to-day briefing.

### 3.3 Text Normalization & Social Feed Sanitization

Telegram channels have markup quirks that formal RSS feeds generally don't, so the `ContentCleaner` applies a few targeted preprocessing rules specifically for them:

- **Markdown artifact elimination:** strips orphaned bold/italic asterisks and underscores (`**`, `****`, `__`) that Telegram's formatting leaves behind once the original message structure is stripped down to plain text.
- **Emoji spam pruning:** removes excessive attention-grabbing symbols and emoji (‼️❗️😲😳🇪🇺💥⚡️) that many channels prepend to headlines purely to stand out in a feed — these carry no informational value and would otherwise clutter the digest.
- **Commercial footer stripping:** purges sponsorship disclosure tags and boilerplate (`#реклама`, `erid:`, "Подписывайтесь на...") that are legally or contractually required in the original post but irrelevant to a news summary.

### 3.4 Temporal Scoping & Local Time Representation

Containers run natively under UTC (`Etc/UTC`), which is the right choice internally — but it's not what a human reader wants to see in a report header. The system handles this with a clear separation of concerns:

- Every ingestion and database timestamp is stored strictly in UTC. This avoids the classic bugs that come from mixing timezones in stored data — ambiguous times during daylight-saving transitions, incorrect sorting, and so on.
- Only the presentation layer converts to a human-friendly local time, explicitly localizing the digest header to the user's timezone (`Europe/Zurich`, CEST = UTC+2) using Python's standard `zoneinfo` module at render time, not storage time.

### 3.5 Relational Archival (`reports` and `report_articles`)

Rather than treating each briefing as a disposable block of text that's sent and then forgotten, every digest is persisted as a proper relational record:

- Each report gets its own immutable row in the `reports` table, tracking when it was compiled, how many articles were reviewed in total, and whether it's actually been dispatched (`sent_to_telegram`).
- A many-to-many junction table, `report_articles`, records the exact ordering of which articles appeared in which report and in what position. This is what makes historical questions answerable later — for example, "what were the top news items on September 17?" — since the full composition of every past digest is preserved, not just its final rendered text.