# Pakistan Office Guide

A web app that helps you find and navigate government offices across Pakistan — Postgres-backed search with full-text ranking, a hybrid (keyword + vector) RAG chatbot with real citations, Redis caching, rate limiting, and a mobile-first PWA design.

This started as a JSON-file prototype and was rebuilt into a real backend: Postgres + Prisma (schema, migrations, indexes), Postgres full-text search behind `/api/search`, a hybrid RAG pipeline behind `/api/chat`, Redis caching + rate limiting, Zod validation, tests, CI, lightweight monitoring, and load-tested benchmarks. See [Performance](#performance) for real before/after numbers.

## Features

- **Postgres-backed search** — structured filters (city/category/area) + weighted full-text ranking (`tsvector`/`ts_rank_cd`, GIN-indexed) + real pagination, via `/api/search`
- **AI Search** — natural language ("passport office in Islamabad") → structured filters via GPT-4o-mini, then the same ranked Postgres search
- **RAG chatbot** — hybrid retrieval (pgvector cosine similarity + Postgres full-text search, merged via Reciprocal Rank Fusion) feeds GPT-4o-mini, with real clickable source citations
- **Redis caching** — search results, AI filter extraction, and chat retrieval are cached (Upstash, TTL-based), with a measurable hit rate
- **Rate limiting** — sliding-window limits on `/api/chat`, `/api/ai-search`, `/api/search` to cap OpenAI cost and abuse
- **Browse by City / Category** — Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, Faisalabad, Quetta, Sialkot × NADRA, Passport, Driving License, Utilities, Traffic, and more
- **Office/Guide/Embassy details** — requirements, step-by-step procedures, fees, hours, notes
- **Google Maps links, Favorites, PWA** — installable, offline-capable

## Tech Stack

- **Next.js 16** (App Router, webpack) + **React 19**
- **PostgreSQL** + **Prisma 7** (`@prisma/adapter-pg`) — schema, migrations, relations, indexes
- **Postgres full-text search** — weighted `tsvector` (maintained by DB triggers) + GIN indexes + `ts_rank_cd`
- **pgvector** — HNSW-indexed embeddings for hybrid RAG retrieval
- **OpenAI API** — `gpt-4o-mini` (chat/filter extraction) + `text-embedding-3-small` (RAG embeddings)
- **Upstash Redis** — caching (`@upstash/redis`) + rate limiting (`@upstash/ratelimit`)
- **Zod** — request validation
- **Vitest** — unit / integration / RAG retrieval tests
- **GitHub Actions** — lint, typecheck, test, build on every PR
- **Sentry** (`@sentry/nextjs`) — error + performance monitoring (optional, inert without a DSN)
- **next-pwa** + Workbox — service worker, offline caching

## Architecture

```
                    ┌─────────────────────┐
  Browser  ───────► │  Next.js App Router  │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
 /api/search            /api/ai-search           /api/chat
 structured filters     NL → filters (GPT)        hybrid RAG retrieval
 + Postgres FTS         + /api/search             + GPT-4o-mini answer
 + pagination           (delegates ranking)        + citations
        │                      │                      │
        └──────────┬───────────┘                      │
                   ▼                                  ▼
         src/lib/search/officeSearch.js      src/lib/rag/retrieve.js
         (ts_rank_cd, GIN index)             (pgvector cosine + FTS, RRF fusion)
                   │                                  │
                   └────────────┬─────────────────────┘
                                ▼
                     Postgres (Prisma) — Office/Guide/Embassy
                     + DocumentChunk (pgvector embeddings)
                                │
                     Redis (Upstash) — cache-aside + rate limiting
                     wraps all three routes above
```

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database with the `vector` and `pg_trgm` extensions available (a local [`prisma dev`](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#prisma-dev) database works for development; both extensions must be installable by the connecting user — most managed providers, including Prisma Postgres, Neon, and Supabase, support this)
- An OpenAI API key (optional — search/chat fall back to keyword-only behavior without one)
- Optional: an Upstash Redis database (caching/rate limiting are no-ops without one)
- Optional: a Sentry DSN (monitoring is inert without one)

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in what you have:

```env
# Postgres — see .env.example for the DATABASE_URL vs DIRECT_DATABASE_URL distinction
DATABASE_URL=...
DIRECT_DATABASE_URL=...

OPENAI_API_KEY=...                 # optional
UPSTASH_REDIS_REST_URL=...         # optional
UPSTASH_REDIS_REST_TOKEN=...       # optional
SENTRY_DSN=...                     # optional
```

**Local Postgres, no cloud account needed:** run `npx prisma dev` in a separate terminal — it starts a local Postgres and prints both a `DATABASE_URL` (a proxy URL the Prisma CLI uses) and a raw `TCP` connection string (use that one as `DIRECT_DATABASE_URL` — the app's runtime client talks to Postgres directly via `@prisma/adapter-pg`, which can't speak the CLI's proxy protocol).

**Local Redis, no Upstash account needed:** `brew install redis && brew services start redis`, then run `npm run dev:redis-shim` in a separate terminal — it's a small local stand-in for Upstash's REST API (`scripts/dev/upstash-rest-shim.js`) backed by that real Redis, so caching and rate limiting work end-to-end in dev. Point `UPSTASH_REDIS_REST_URL` at `http://localhost:8079` and `UPSTASH_REDIS_REST_TOKEN` at `dev-local-token` (or whatever you set `UPSTASH_SHIM_TOKEN` to).

### Database setup

```bash
npm run db:migrate   # applies prisma/migrations (schema, FTS triggers, GIN/HNSW indexes)
npm run db:seed       # loads src/data/*.json into Postgres (offices, guides, embassies)
npm run rag:build      # chunks + embeds guides/offices/embassies into DocumentChunk (needs OPENAI_API_KEY)
```

`src/data/*.json` is now seed-only — the app reads exclusively from Postgres at runtime (`src/lib/{offices,guides,embassies}.js`).

### Run (Development)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & Start (Production)

```bash
npm run build
npm start
```

## How search works

`/api/search` (and the manual search UI) queries Postgres directly:

- **Structured filters** — city/category (matched by slug) and area (`ILIKE`)
- **Full-text ranking** — a `tsvector` column on `Office`, maintained by a Postgres trigger (`prisma/migrations/*/migration.sql`) that weights `name` (A) > category/city (B) > area (C) > address (D), ranked with `ts_rank_cd`
- **GIN index** on that `tsvector` for fast lookups at scale (see [Performance](#performance))
- **Real pagination** (`page`/`pageSize`, `COUNT(*) OVER()` for totals)

`/api/ai-search` uses GPT-4o-mini to turn a natural-language query into those same structured filters (with a regex-based fallback if no API key is set), then delegates to the same ranked search — no duplicated scoring logic.

## How the RAG chatbot works

`/api/chat` retrieves relevant content **before** calling GPT, then constrains the answer to what was retrieved:

1. **Chunking** (`src/lib/rag/chunk.js`) — guides/offices/embassies are split along their natural boundaries (one chunk per guide step/FAQ, one per office, one per embassy) rather than a generic sliding window.
2. **Embeddings** — each chunk is embedded with `text-embedding-3-small` and stored in `DocumentChunk.embedding` (pgvector, HNSW-indexed).
3. **Hybrid retrieval** (`src/lib/rag/retrieve.js`) — a query is embedded and searched two ways in parallel: pgvector cosine similarity (semantic) and Postgres full-text search on the same chunk table (keyword). The two ranked lists are merged with **Reciprocal Rank Fusion** (`src/lib/rag/fusion.js`, k=60) — this is the part that actually makes it "hybrid": semantic matches and exact keyword matches both surface, without needing their raw scores to be comparable.
4. **Answering with citations** — the top fused chunks are given to GPT-4o-mini as context; the response includes a `sources` array (guide/office/embassy links) built from the *actual retrieved chunks*, not a second guess — `ChatBot.js` renders them as clickable links.

Example queries:
- `passport office in islamabad`
- `nadra near dha lahore`
- `How do I renew my CNIC?`

## Caching, rate limiting, and metrics

- **Caching** (`src/lib/cache/redis.js`) — `/api/search` results (60s TTL), `/api/ai-search` filter extraction (1h TTL, keyed by query text — the OpenAI call is the expensive part), and `/api/chat` retrieval (30min TTL). Cache-aside with hit/miss counters.
- **Rate limiting** (`src/lib/rateLimit.js`) — sliding window, 20 req/min on `/api/chat` and `/api/ai-search` (AI-cost-sensitive), 60 req/min on `/api/search`. Returns `429` + `Retry-After`.
- **Everything above is a no-op without Redis configured** — same graceful-degradation pattern as `OPENAI_API_KEY`.
- **`GET /api/metrics`** — cache hit rate, search count/latency (avg/p95), zero-result rate, OpenAI call latency. Works without any monitoring account configured.

## Monitoring

Sentry (`@sentry/nextjs`) is wired for server/edge/client, capturing API errors (via `src/lib/http/errors.js`) and React render errors (`src/app/global-error.js`). It's inert without `SENTRY_DSN` set — the SDK no-ops rather than erroring.

## Testing

```bash
npm run test        # unit + integration + RAG retrieval tests (vitest)
npm run test:watch
```

- **Unit** — hours parsing, RAG chunking, Reciprocal Rank Fusion, Zod schemas (no DB/network)
- **Integration** — `/api/search` route handler + `searchOffices` ranking, run directly against a seeded Postgres database (no `next dev` server needed)
- **RAG retrieval** — hybrid retrieval tested end-to-end against real Postgres/pgvector SQL, using a deterministic mock embedding function instead of real OpenAI calls (`src/lib/rag/embeddings.js`'s `mockEmbed`) — so CI never calls OpenAI

Integration/RAG tests expect a seeded database (`npm run db:migrate && npm run db:seed`) with `DATABASE_URL`/`DIRECT_DATABASE_URL` pointed at it.

## CI/CD

`.github/workflows/ci.yml` runs on every PR and push to `main`: lint → typecheck → migrate + seed a `pgvector/pgvector:pg16` Postgres service container → test → build. No API keys/secrets are required — RAG tests use the mock embedding function, so nothing in CI calls OpenAI.

## Performance

Measured with `npm run bench:generate` / `npm run bench:run` (`scripts/benchmark/`) against a synthetic `BenchOffice` table (isolated from real app data), on local dev hardware — a MacBook, against a local Postgres instance, not a production cloud database. Absolute numbers will differ elsewhere; the *relative* effect of indexing and caching is the interesting part.

| Scale | Rows | Seq scan (avg / p95) | GIN index (avg / p95) | Index speedup | Uncached | Cached (Redis) | Cache speedup |
|---|---|---|---|---|---|---|---|
| 10k | 10,000 | 8.24ms / 10.67ms | 5.46ms / 7.23ms | **1.5x** | 38.43ms | 1.15ms | **33.4x** |
| 100k | 100,000 | 41.93ms / 55.83ms | 19.13ms / 41.42ms | **2.2x** | 104.93ms | 1.88ms | **55.8x** |

Each row: 50 sampled full-text queries (10 distinct query strings × 5 repeats), `WHERE "searchVector" @@ plainto_tsquery(...)` — timed with the GIN index dropped ("seq scan") and then rebuilt ("GIN index"), on the same data. Cached/uncached is the same single query through the real `getOrSetCache` Redis helper (Upstash REST protocol, either real Upstash or the local dev shim — see `scripts/dev/upstash-rest-shim.js`), first call vs. second.

Takeaways at this scale/hardware:
- The GIN index's advantage grows with table size (1.5x at 10k → 2.2x at 100k) — expected, since a sequential scan's cost grows linearly with row count while an index lookup barely moves.
- Redis caching wins by far the most — an in-memory hit avoids the DB round-trip (and, on `/api/ai-search`/`/api/chat`, an OpenAI call) entirely, which matters more than index efficiency once a query has been seen before.

Reproduce: `npm run bench:generate -- --count 100000 && npm run bench:run -- --label 100k && npm run bench:generate -- --count 10000 && npm run bench:run -- --label 10k`, then `node scripts/benchmark/report.js`. Results are written to `benchmark/results/*.json`.

## Project Structure

```
src/
├── app/
│   ├── page.js, layout.js, sitemap.js, robots.js, global-error.js
│   ├── cities/, city/[city]/, categories/, category/[category]/, guides/, guides/[slug]/,
│   │   overseas/, overseas/embassy/[id]/, office/[id]/, search/, favorites/
│   └── api/
│       ├── search/route.js        # structured filters + Postgres FTS + pagination
│       ├── ai-search/route.js     # NL -> filters (GPT) -> officeSearch
│       ├── chat/route.js          # hybrid RAG retrieval -> GPT -> citations
│       ├── offices/route.js       # lookup by id (Favorites page, client-side)
│       └── metrics/route.js       # cache hit rate, latency, zero-result rate
├── components/                    # AISearchBox, ChatBot, BottomNav, ...
├── data/                          # offices/guides/embassies.json — seed-only now
├── generated/prisma/              # generated Prisma client (gitignored)
├── instrumentation.js, instrumentation-client.js   # Sentry wiring
└── lib/
    ├── db.js                      # Prisma client singleton (adapter-pg + retry)
    ├── offices.js, guides.js, embassies.js          # Postgres-backed data access
    ├── search/officeSearch.js     # structured filters + ts_rank_cd + pagination
    ├── rag/                       # chunk.js, embeddings.js, retrieve.js, fusion.js
    ├── cache/redis.js             # Upstash cache-aside + hit-rate counters
    ├── rateLimit.js, metrics.js
    ├── validation/search.js       # Zod schemas
    └── http/errors.js             # error envelope + Sentry reporting
prisma/
├── schema.prisma, migrations/, seed.js
scripts/
├── addOffice.js                   # interactive CLI -> Postgres
├── rag/build-embeddings.js        # chunk + embed + store DocumentChunk
├── benchmark/                     # generate-synthetic.js, run.js, report.js
└── dev/upstash-rest-shim.js       # local Upstash REST API stand-in
tests/
├── unit/, integration/, rag/
.github/workflows/ci.yml
```

## Adding Offices

```bash
npm run add-office
```

Interactively adds an office directly to Postgres (writes through Prisma — no longer edits `src/data/offices.json`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check the backend/data layer (`tsc --noEmit`, JSDoc-based) |
| `npm run test` / `test:watch` | Run the test suite (vitest) |
| `npm run db:migrate` / `db:deploy` / `db:seed` / `db:studio` | Prisma migrate/seed/inspect |
| `npm run rag:build` | Rebuild RAG embeddings (`DocumentChunk`) |
| `npm run dev:redis-shim` | Local Upstash-REST-compatible dev server backed by real Redis |
| `npm run bench:generate` / `bench:run` | Synthetic-dataset search benchmarks |
| `npm run add-office` | Interactively add an office to Postgres |
