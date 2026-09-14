# 🧹 Architectural Design: Content Cleaning & Algorithmic Deduplication Pipeline

## 1. Core Objectives

Phase 4 implements a fast, deterministic preprocessing pipeline between raw ingestion and artificial intelligence inference. Its primary responsibilities are:

- **Context window optimization:** stripping markup boilerplate and non-content noise to reduce token consumption and inference latency on resource-constrained local hardware.
- **Deterministic identity:** deriving uniform mathematical signatures (SHA-256) from unstructured text.
- **Cross-source story clustering:** grouping coverage of the same event across different publishers without using computationally expensive neural networks.

## 2. Processing Pipeline Flow

```
               [ Raw Article Record (Status: COLLECTED) ]
                                  │
                                  ▼
                      [ Stage 1: Content Sanitizer ]
                      ├── Strips <script>, <style>, <iframe>, nav, and footers
                      ├── Decodes HTML entities (&amp;, &nbsp;, quotes)
                      └── Collapses repetitive whitespace and breaks
                                  │
                                  ▼
                   [ Cleaned Text + Canonical Formatting ]
                                  │
                                  ▼
                      [ Stage 2: Deterministic Hashing ]
                      └── Computes SHA-256 fingerprint of normalized text
                                  │
                                  ▼
                     [ Stage 3: Multi-Tier Deduplication ]
                      (Queries active window: past 48 hours)
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            [ Match Found ]             [ Novel Article ]
         ├── Set Status: DUPLICATE   ├── Set Status: PROCESSED
         └── Link duplicate_of_id    └── Add to Active Comparison Pool
                                                 │
                                                 ▼
                                     [ Ready for Local LLM ]
```

## 3. Engineering Decisions & Algorithmic Logic

### 3.1 Parser Selection & DOM Sanitization

- **High-performance parser (`lxml`):** HTML parsing is handled by the C-backed `lxml` engine rather than Python's built-in parser, ensuring sub-millisecond execution times even on low-power CPUs — important since this stage runs on every single incoming article.
- **Aggressive element pruning:** non-content DOM nodes (`script`, `style`, `noscript`, `header`, `footer`, `nav`, `aside`, `form`) are recursively stripped along with all their inner contents *before* any text extraction begins — so ads, navigation menus, and embedded scripts never leak into the extracted article text. Structural tags (`p`, `div`, `h1`–`h6`, `li`) are instead injected with uniform line breaks, which preserves paragraph boundaries and the logical structure of the document even after all the markup itself is gone.
- **Editorial cleanup:** regular expression filters remove recurring feed artifacts that aren't actual article content — things like promotional footers ("Subscribe to our Telegram", "Read more at source...") and tracking strings that many feeds append automatically. Left in, this kind of boilerplate would waste LLM context and occasionally get treated as if it were real content by the summarizer.

### 3.2 Deterministic Cryptographic Fingerprinting

- **Text canonicalization:** before hashing, the body text is lowercased, punctuation is removed, and repeated whitespace is collapsed to single spaces. This ensures two texts that are substantively identical but differ only in trivial formatting (capitalization, extra spaces, punctuation) still produce the exact same hash.
- **Exact collision detection:** the resulting SHA-256 hash is stored in the indexed `content_hash` column. This gives constant-time (`O(1)`) database lookups for exact textual duplicates — the classic case of wire-service syndicated copies or identical cross-posts published verbatim across multiple channels.

### 3.3 Two-Tier Heuristic Deduplication

Exact hashing alone isn't enough — different outlets covering the *same event* almost always word their headlines slightly differently. To catch these near-duplicates, a second, fuzzier layer of comparison is applied:

- **Tokenization & stop-word filtering:** both Cyrillic and Latin stop-words (prepositions, conjunctions, pronouns — words that carry no real topical meaning) are filtered out of headlines before comparison. Punctuation is stripped and single-character noise tokens are discarded, leaving only the higher-entropy, topically meaningful words to compare.
- **Hybrid similarity metric (Jaccard + Overlap):** a plain Jaccard similarity score tends to unfairly penalize comparisons between a short wire-service headline and a longer, more elaborate blog title covering the same story, purely because of the length difference. To correct for this, the engine calculates *both* the standard Jaccard Index and the Overlap (Containment) Coefficient, and takes whichever score is higher — giving a fairer signal regardless of how verbose a particular outlet's headlines tend to be.
- **Empirically tuned threshold:** a similarity threshold of `0.45` was chosen to reliably flag genuinely identical event coverage, while still avoiding false positives between distinct stories that merely share a topic or category (e.g. two unrelated articles both about "Linux kernel" wouldn't be wrongly merged).

### 3.4 Temporal Scoping (48-Hour Deduplication Window)

Comparing every new article against the entire historical database would cause lookup performance to degrade linearly (`O(N)`) as the archive grows over time — eventually making each new article check slower and slower. Instead, the comparison pool for deduplication is restricted to articles published within a rolling **48-hour window**, since news cycles essentially never re-report an identical breaking story outside that timeframe. Older articles remain safely stored for historical archival and search purposes; they're simply excluded from the active comparison pool, keeping real-time pipeline performance constant regardless of how large the archive grows.

### 3.5 State Lifecycle & Provenance Preservation

Rather than discarding detected duplicates outright, they're retained in the database with status `DUPLICATE`, and their `duplicate_of_id` foreign key is set to point back at the original ("primary") story.

**Architectural advantages of this approach:**
- **Preserves source diversity:** a future summary-generation phase can report something like "Covered by OpenNET, Habr, and Hacker News" for a single story, without ever needing to re-analyze the duplicate text multiple times.
- **Prevents redundant downstream inference:** since duplicates are flagged before reaching the LLM stage, the (comparatively expensive) local AI summarization step only ever runs once per unique story, not once per copy of it.

## 4. Verification & Validation Metrics

- **Efficiency:** batch sanitization, hashing, and cross-comparison of dozens of multi-source articles executes in under 1 second — confirming the pipeline is lightweight enough to run frequently on constrained hardware.
- **Relational integrity:** duplicate items should always reference valid, existing parent IDs via `duplicate_of_id`, with no orphaned foreign keys left behind.
- **Queue health:** the system should cleanly transition candidate records from `COLLECTED` to a terminal, pipeline-ready state (`PROCESSED`), producing a clean, deduplicated intake queue ready for local AI summarization.