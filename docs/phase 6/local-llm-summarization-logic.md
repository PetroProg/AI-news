# 🤖 Architectural Design: Local LLM Integration & Analytical Summarization

## 1. Core Objectives

Phase 6 introduces local, open-source artificial intelligence into the news pipeline. Its primary responsibilities are:

- **Zero-cost privacy & autonomy:** running all neural inference locally on the home server without external SaaS dependencies (no OpenAI/Anthropic/Gemini API calls).
- **Deterministic information extraction:** distilling verbose articles into structured summaries (core narrative, engineering importance, key takeaways).
- **Automated relevance scoring:** assigning numerical significance scores (1.0–10.0) and categorizing stories into technical domain buckets.
- **Hardware adaptation:** operating within the extreme physical constraints of a 2-core Intel Celeron CPU (Braswell, SSE4.2 without AVX2) and 4 GB DDR3 RAM, without destabilizing the host OS.

## 2. System Topology & Processing Flow

```
       [ Unique Novel Article (Status: PROCESSED) ]
                           │
                           ▼
               [ SummarizerService Layer ]
               ├── Batches pending records (limit: 3-5 items)
               └── Truncates leading text to high-entropy intro (600 chars)
                           │
                           ▼
                  [ Ollama HTTP Client ]
               ├── Custom Async POST (/api/generate)
               ├── Strict JSON Schema Enforcement (format: "json")
               └── Tuned inference parameters (num_ctx: 1024, predict: 180)
                           │
                           ▼
              [ Local LLM: qwen2.5:0.5b ]
            (Runs on 2 Celeron Cores / 600 MB RAM)
                           │
                           ▼
             [ Validated Pydantic DTO ]
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
 [ Article Table ]                  [ Summaries Table ]
 ├── Set importance_score (e.g. 8.0) ├── Persist short_summary
 ├── Link category_id (FK)           ├── Persist why_it_matters
 └── Transition status: SUMMARIZED   ├── Persist key_points (JSONB)
                                     └── Record model_used signature
```

## 3. Engineering Decisions & Hardware Optimization

### 3.1 Model Selection for Low-Power x86 Hardware

**The challenge:** the Intel Celeron N3060 lacks AVX/AVX2 vector acceleration, meaning matrix arithmetic relies purely on older SSE4.2 instructions — this directly limits how many tokens per second any local model can realistically generate on this hardware.

**The solution — `qwen2.5:0.5b`:**
- **Memory footprint:** occupies roughly 350 MB on disk and ~600 MB of active RAM, compared to ~3.5 GB for typical 3B/7B-parameter models. On a machine with only 4 GB of total RAM, this leaves enough headroom for the OS, PostgreSQL, and the rest of the app to keep running normally alongside it.
- **Instruction efficiency:** despite its very small parameter count, it retains solid multilingual reasoning ability (tested for both Russian and English), which matters since the news sources being summarized are multilingual.
- **Throughput:** sustains roughly 6–8 tokens/sec on this legacy dual-core hardware — slow by modern standards, but workable for a background batch job rather than a live chat interface.

### 3.2 Linux Cgroups Resource Isolation

In `compose.yaml`, the Ollama service is constrained using Docker's deploy resource limits (`cpus: 2.0`, `memory: 2500M`) rather than being left to consume whatever the host has available.

**Why this matters:**
- It prevents thermal throttling and runaway CPU thrashing — without a hard cap, an unconstrained inference workload could peg both CPU cores indefinitely and overheat a laptop-class chip.
- It guarantees the host's SSH daemon, networking stack, and the PostgreSQL database engine stay responsive even while inference is actively running — so the rest of the system doesn't grind to a halt every time a batch of articles is being summarized.
- `OLLAMA_NUM_PARALLEL=1` forces strictly serialized, one-article-at-a-time execution. On a 2-core machine, trying to process multiple articles concurrently wouldn't actually be faster — it would just split the already-limited compute between competing requests and slow everything down.

### 3.3 Strict JSON Mode (Constrained Decoding)

Language models typically like to wrap their output in conversational preamble ("Here is your summary...") or markdown code fences, which makes the raw text unreliable to parse programmatically. Instead of trying to strip this out afterward with regex, the pipeline uses Ollama's native `format: "json"` constraint. This works at the token-generation level itself — the model's output vocabulary is masked during inference so that only tokens which keep the output syntactically valid JSON can ever be produced. The practical result is that every response can be deserialized directly into a typed Pydantic object with zero cleanup step and zero risk of a malformed parse.

### 3.4 In-Memory Keep-Alive Optimization

Loading a neural network from disk into memory incurs a "cold start" penalty of roughly 20–30 seconds on this hardware — acceptable once, but wasteful if it happened before every single article. To avoid repeating that cost, the daemon is configured with `OLLAMA_KEEP_ALIVE=5m` (extended further during active batch runs), which keeps the model resident in RAM between requests. Once it's loaded the first time, every subsequent article in the same batch skips the loading step entirely, bringing the typical per-article turnaround down to roughly 10–15 seconds.

### 3.5 Transactional Persistence

The `SummarizerService` commits each article's analysis atomically, one at a time, rather than batching the whole group into a single all-or-nothing transaction. This has a concrete recovery benefit: if a network hiccup or inference timeout happens partway through — say, on article *N* out of a batch — every article processed before it (`1` through `N−1`) is already safely committed to PostgreSQL and won't be lost or need to be reprocessed. Each successfully summarized item transitions from `PROCESSED` to `SUMMARIZED`, so if the pipeline crashes and restarts, it can simply resume from wherever it left off, picking up only the articles still sitting in `PROCESSED`.

## 4. Verification & Validation Metrics

- **State transition:** cleaned articles should reliably transition to `SUMMARIZED` with no orphaned records left stuck mid-pipeline.
- **Relational integrity:** each `Summary` record should link cleanly back to its parent `article_id`, and any newly identified categories should be auto-provisioned into the `categories` table via slug lookup rather than causing a foreign-key error.
- **Payload precision:** generated summaries should capture genuinely actionable takeaways and produce accurate, sensible importance scores — all while staying within the hardware's memory limits throughout the run.