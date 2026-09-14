# 📡 Architectural Design: Ingestion Pipeline & Modular RSS Collection

## 1. Core Architectural Goals

The objective of Phase 3 is to establish an extensible, non-blocking ingestion layer capable of consuming unstructured external feeds, standardizing heterogeneous inputs, and maintaining relational persistence with strict uniqueness guarantees.

## 2. Ingestion Flow & Component Interaction

```
  [ External RSS / Atom Feeds ]
                │
                ▼ (Non-blocking HTTP GET via httpx)
      [ Raw Binary Ingestion ]
                │
                ▼ (Charset detection & XML deserialization via feedparser)
    [ BaseCollector Abstraction ]
                │
                ▼ (Validation & Normalization via Pydantic DTO)
      [ CollectedItem Stream ]
                │
                ▼
      [ IngestionService Layer ]
         ├── 1. Register or retrieve active Source record
         ├── 2. Identity Check (Filter by Source ID + External ID / URL)
         └── 3. Batch commit novel records into PostgreSQL (Status: COLLECTED)
```

## 3. Key Design Decisions & Logic

### 3.1 Modular Abstraction (`BaseCollector`)

- **Uniform interface contract:** to support future ingestion channels (Telegram channels, web scrapers, REST APIs) without refactoring the persistence pipeline, every collector must implement a single abstract method — `collect()`. Whatever the source type, the rest of the system only ever interacts with this one method.
- **Decoupling collection from persistence:** collectors are responsible exclusively for network transport and payload deserialization. They have no awareness of database transactions, ORM sessions, or downstream storage schemas — that separation keeps each collector simple and independently testable, and means a bug in one collector can't accidentally corrupt data through a shared session.

### 3.2 Standardized Data Transfer Object (`CollectedItem`)

Feeds from different protocols use inconsistent schema naming (e.g., `<guid>` vs. `<id>`, `<pubDate>` vs. `<updated>`, summary descriptions vs. full article content). Rather than let this inconsistency leak into the rest of the system, every collector maps its raw output into a single canonical model — `CollectedItem` — before anything else touches it.

This model enforces:
- Required headline fields, so nothing incomplete ever reaches storage.
- Timezone-aware UTC timestamp normalization, so articles from feeds using different local formats are always comparable.
- Fallback mechanisms — for example, using the headline as a content stub if the body is missing, or deriving a GUID from the canonical URL when the feed doesn't provide one explicitly.

In short: no matter how messy or inconsistent the source feed is, everything downstream of this DTO only ever has to deal with one clean, predictable shape.

### 3.3 Network Transport & Encoding Resilience

- **Asynchronous network I/O:** feed fetching is handled by an asynchronous HTTP client (`httpx`) with custom headers and configurable timeouts. Because it's async, a slow or unresponsive remote server doesn't block the application's event loop — other feeds keep being processed in parallel instead of the whole system stalling on one bad source.
- **Binary content deserialization:** instead of decoding the response body as UTF-8 immediately (which would break on non-UTF-8 feeds), the raw byte stream is passed to `feedparser`. It inspects the XML headers itself and correctly resolves legacy regional encodings — such as KOI8-R, CP1251, or ISO-8859 — into standard Unicode. This matters for feeds in Russian, other Cyrillic-script languages, or older Western European encodings, which would otherwise come through as garbled text (mojibake).
- **Fault isolation:** network timeouts, HTTP errors (404/500), or malformed XML are caught and logged at the level of the individual collector. A failure in one feed is contained there and never interrupts or crashes the processing of the remaining sources in the same run.

### 3.4 Ingestion Service & Deduplication Strategy

- **Source auto-registration:** before saving any articles, the service checks whether the publishing feed already exists in the `sources` table. If it's a new feed being seen for the first time, it's automatically registered with default polling metadata — no manual setup step is required to add a new feed.
- **Level-1 deduplication (feed-level uniqueness):** before inserting a new `Article` row, the service checks existing records scoped to that specific `source_id`. An incoming item is discarded (not saved again) if either its provider-assigned `external_id` (e.g. the RSS `<guid>`) or its canonical URL is already present for that source. This is what prevents the same article from being re-inserted every time the feed is polled again, and avoids primary-key conflicts from duplicate writes.
- **State initialization:** every newly stored article starts in the `COLLECTED` lifecycle state. This is what makes it visible to the next stages of the pipeline (cleaning, further deduplication, and AI summarization) — those later stages simply query for articles still sitting in `COLLECTED` and pick up from there.

## 4. Verification & Validation Metrics

- **State isolation:** consecutive polling runs of the same feed should execute without re-inserting previously collected entries — a good sign the deduplication logic above is working correctly.
- **Encoding integrity:** multilingual payloads (Cyrillic, Latin, etc.) should preserve character fidelity once stored in PostgreSQL, with no corruption or truncation — confirming the binary-first decoding strategy is doing its job.
- **Audit trail:** each source's `last_fetched_at` timestamp should update after every successful processing run, which will later enable interval-based scheduling — polling each source only as often as it actually needs, rather than on a single fixed global interval.