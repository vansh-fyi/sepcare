<!-- refreshed: 2026-09-25 -->
# Architecture

**Analysis Date:** 2026-09-25

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    ESP32 Wearable Device                     │
│           (WiFi, buffers vitals offline when needed)         │
└──────────────────┬──────────────────┬────────────────────────┘
                    │ live POST        │ buffered POST
                    ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Route Handlers (API layer)              │
│  `src/app/api/ingest/route.ts`   `src/app/api/ingest/batch/  │
│  `src/app/api/health/route.ts`    route.ts`                  │
│  `src/app/api/readings/route.ts` (dashboard read API)        │
└──────────────────┬──────────────────┬────────────────────────┘
                    │ validate (zod)   │ auth (device api key)
                    ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Domain / Service Layer                     │
│  `src/lib/validation/ingest-schema.ts` — payload shape       │
│  `src/lib/risk/compute.ts`  — sepsis risk fusion engine       │
│  `src/lib/risk/thresholds.ts` — named clinical constants      │
└──────────────────┬────────────────────────────────────────────┘
                    │ supabase-js (service role)
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase (Postgres, free tier)                  │
│  `src/lib/supabase/admin.ts` — server-only service client    │
│  tables: devices, readings, risk_scores                      │
│  `supabase/migrations/*.sql`                                 │
└─────────────────────────────────────────────────────────────┘
```

There is no traditional "controller/service/repository" split — this is a small serverless API surface where each Next.js route handler does auth → validate → persist → score inline, delegating only the risk-scoring math and Supabase access to `src/lib/`.

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Ingest route (single) | Auth device by API key, validate one reading, upsert, score synchronously | `src/app/api/ingest/route.ts` |
| Ingest route (batch) | Auth device, validate up to 500 buffered readings, bulk upsert, score new rows, backfill-rescore overlapping window | `src/app/api/ingest/batch/route.ts` |
| Readings route | Paginated read API for dashboard: vitals + risk history by device/time range | `src/app/api/readings/route.ts` |
| Health route | Deployment smoke-check | `src/app/api/health/route.ts` |
| Risk engine | Computes Green/Amber/Red composite risk score from a reading + its device's rolling window, persists to `risk_scores` | `src/lib/risk/compute.ts` |
| Thresholds | Named, documented clinical/statistical constants driving the risk engine | `src/lib/risk/thresholds.ts` |
| Ingest schema | Zod validation for single and batch ingest payloads | `src/lib/validation/ingest-schema.ts` |
| Supabase admin client | Sole service-role (RLS-bypassing) DB client, server-only | `src/lib/supabase/admin.ts` |
| Supabase types | Generated `Database` types (tables: devices, readings, risk_scores) | `src/lib/supabase/types.ts` |
| Root page | Default Next.js scaffold landing page (not yet built out) | `src/app/page.tsx` |

## Pattern Overview

**Overall:** Serverless ingestion pipeline built on Next.js Route Handlers, backed by Supabase Postgres. No separate backend process — each API route is its own deployable serverless function on Vercel.

**Key Characteristics:**
- Auth-before-validate ordering on every write endpoint (device API key checked before body is parsed/validated) to avoid leaking payload-shape info to unauthenticated callers.
- Idempotent writes via Postgres `upsert(... ignoreDuplicates: true)` on a `(deviceId, timestamp)` unique constraint — safe retries after connectivity gaps.
- Synchronous, in-request risk scoring — scoring never blocks/fails the ingest response (errors are caught and logged, not surfaced as 500s).
- A single reusable risk-computation function (`computeAndPersistRiskScore`) is shared by both the live and batch ingest paths, guaranteeing identical scoring logic regardless of arrival order.
- Explicit pagination past PostgREST's `max_rows` cap (`fetchWindow` in `src/lib/risk/compute.ts`) rather than trusting an unpaginated `select` to be complete.

## Layers

**API / Route Handler layer:**
- Purpose: HTTP boundary — request parsing, auth, response shaping (all 4xx/5xx decisions live here)
- Location: `src/app/api/**/route.ts`
- Contains: Next.js `GET`/`POST` exports per route segment
- Depends on: `src/lib/validation`, `src/lib/risk`, `src/lib/supabase`
- Used by: ESP32 device (ingest endpoints), dashboard frontend (readings endpoint)

**Domain layer (risk scoring):**
- Purpose: Sepsis-risk fusion logic — pure(ish) computation plus its own DB reads/writes for window fetching and score persistence
- Location: `src/lib/risk/`
- Contains: `compute.ts` (engine), `thresholds.ts` (constants)
- Depends on: `src/lib/supabase/admin.ts`
- Used by: both ingest routes

**Validation layer:**
- Purpose: Payload shape enforcement via Zod schemas
- Location: `src/lib/validation/ingest-schema.ts`
- Depends on: `zod`
- Used by: both ingest routes

**Data access layer:**
- Purpose: Single service-role Supabase client construction; sole gatekeeper of RLS-bypassing DB access
- Location: `src/lib/supabase/admin.ts`, `src/lib/supabase/types.ts`
- Depends on: `@supabase/supabase-js`, `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` env vars
- Used by: all route handlers and the risk engine

**Persistence (Postgres via Supabase):**
- Purpose: Durable storage, migrations, constraints
- Location: `supabase/migrations/*.sql`
- Tables: `devices` (device_id, api_key), `readings` (vitals + timestamp, unique on deviceId+timestamp), `risk_scores` (one-to-one with readings)

## Data Flow

### Live Ingest Path (`POST /api/ingest`)

1. Read `x-api-key` header; reject with 401 if missing (`src/app/api/ingest/route.ts:15`)
2. Parse JSON body defensively (400 on malformed JSON, not an unhandled 500) (`route.ts:26`)
3. Look up `deviceId` + `api_key` pair in `devices` table; 401 if no match (`route.ts:41`)
4. Validate full payload against `IngestSchema` (`route.ts:55`, `src/lib/validation/ingest-schema.ts`)
5. Upsert into `readings` with `onConflict: "deviceId,timestamp", ignoreDuplicates: true` — duplicate retries are safe no-ops (`route.ts:70`)
6. If a new row was actually inserted, synchronously call `computeAndPersistRiskScore` (`route.ts:99`, `src/lib/risk/compute.ts:121`)
7. Always return 201 `{status: "ok"}` regardless of scoring outcome — a scoring exception is caught and logged, never turned into a failed ingest response

### Batch/Offline Sync Path (`POST /api/ingest/batch`)

1. Same auth-before-validate ordering as the live path (`src/app/api/ingest/batch/route.ts:27`)
2. Validate against `BatchIngestSchema` (1–500 readings per batch, `ingest-schema.ts:33`)
3. Sort readings ascending by timestamp, then dedupe same-timestamp entries in JS (last-write-wins) before a single bulk upsert call (`route.ts:74`)
4. Bulk `upsert(..., ignoreDuplicates: true)` — one DB round trip, not a per-row loop (`route.ts:94`)
5. Score only newly-inserted rows in ascending timestamp order (`route.ts:122`)
6. Backfill-rescore every existing reading whose 12h trend window overlaps the batch's `[min, max]` timestamp range, via `fetchWindow` (`route.ts:137`, `thresholds.ts` `TREND_WINDOW_MS`) — this repairs any prior reading whose baseline is affected by newly-arrived out-of-order data
7. Always return 201 regardless of any scoring/backfill outcome

### Risk Scoring (`computeAndPersistRiskScore`)

1. Fetch the target reading's device's rolling 12h window (`timestamp` in `[target.timestamp - 12h, target.timestamp]`), paginated past PostgREST's 1000-row cap (`src/lib/risk/compute.ts:73`, `WINDOW_PAGE_SIZE`)
2. Establish baseline only if the window's earliest reading is ≥1h older than target (`BASELINE_MIN_MS`); cold-start-safe (empty window → no baseline, no error)
3. Compute 3 features against thresholds in `src/lib/risk/thresholds.ts`:
   - Absolute temperature abnormality (fever ≥38.0°C or hypothermia <35.5°C) — always active, no baseline needed
   - HR/temperature proportionality ratio vs. baseline (Liebermeister's-rule-style band [6, 14])
   - Activity-score decline vs. baseline (≤70% of baseline)
4. Status derives purely from count of abnormal features: 0–1 → green, 2 → amber, 3 → red (never from single-feature severity)
5. Upsert result to `risk_scores` keyed by `reading_id`

### Dashboard Read Path (`GET /api/readings`)

1. Validate `deviceId` (hardcoded single-device `"nb-001"` in v1), `from`, `to` query params — strict epoch-millisecond integer parsing (`src/app/api/readings/route.ts:40`)
2. Enforce 15-day max range (`MAX_RANGE_MS`)
3. Page through `readings` joined to `risk_scores` in 1000-row chunks (`fetchHistory`, `route.ts:72`)
4. Shape response as `{ deviceId, from, to, entries: [{timestamp, vitals, risk}] }` with `Cache-Control: no-store`

**State Management:**
- No client-side or server-side application state beyond Postgres. Every request is stateless; all "memory" (rolling windows, baselines) is recomputed from `readings` on each scoring call.

## Key Abstractions

**Route Handler:**
- Purpose: Next.js App Router convention — one file per HTTP method per URL segment
- Examples: `src/app/api/ingest/route.ts`, `src/app/api/ingest/batch/route.ts`, `src/app/api/readings/route.ts`, `src/app/api/health/route.ts`
- Pattern: exported async `GET`/`POST` functions taking `NextRequest`, returning `NextResponse.json(...)`

**TargetReading / WindowRow:**
- Purpose: Minimal typed shapes the risk engine operates on, decoupled from the full Supabase row type
- Examples: `src/lib/risk/compute.ts:26,45`
- Pattern: narrow interfaces reduce coupling between the DB schema and the scoring algorithm

**Zod Schema → inferred Type:**
- Purpose: Single source of truth for both runtime validation and compile-time payload types
- Examples: `IngestSchema`/`IngestPayload`, `BatchIngestSchema`/`BatchIngestPayload` in `src/lib/validation/ingest-schema.ts`

## Entry Points

**`src/app/api/ingest/route.ts` (POST):**
- Triggers: ESP32 device posting a single live vitals reading
- Responsibilities: auth, validate, upsert, synchronous score

**`src/app/api/ingest/batch/route.ts` (POST):**
- Triggers: ESP32 device flushing an offline-buffered batch after reconnecting
- Responsibilities: auth, validate (≤500 items), bulk upsert, score new rows, backfill-rescore affected window
- Note: explicitly sets `export const maxDuration = 60` to avoid being starved by ambient platform timeout defaults on an uncapped backfill pass

**`src/app/api/readings/route.ts` (GET):**
- Triggers: dashboard frontend requesting vitals + risk history for a device/time range
- Responsibilities: query param validation, paginated fetch, response shaping

**`src/app/api/health/route.ts` (GET):**
- Triggers: deployment smoke checks (Vercel)
- Responsibilities: return 200 `{status: "ok"}`

## Architectural Constraints

- **Threading:** N/A — serverless request-per-invocation model (Vercel functions); no persistent process or shared in-memory state across requests.
- **Global state:** `supabaseAdmin` in `src/lib/supabase/admin.ts` is a module-level singleton client instance, safe because it's stateless (no session persistence: `persistSession: false`) and server-only.
- **Circular imports:** None observed — `src/lib` has a strict one-way dependency: routes → risk/validation → supabase/admin.
- **RLS bypass boundary:** `src/lib/supabase/admin.ts` is documented as the *only* file allowed to construct a service-role client; anything importing it must never be reachable from a `"use client"` component, to avoid leaking `SUPABASE_SERVICE_ROLE_KEY` into the browser bundle.
- **PostgREST row cap:** `supabase/config.toml`'s `api.max_rows` caps any single unpaginated query response at 1000 rows — both `fetchWindow` (`src/lib/risk/compute.ts`) and `fetchHistory` (`src/app/api/readings/route.ts`) must paginate explicitly with `.range()`; a naive query here silently truncates and corrupts baselines.

## Anti-Patterns

### Per-row insert loops for batch writes

**What happens:** Nothing in this codebase does this — it's explicitly avoided.
**Why it's wrong:** Would multiply DB round trips for a 500-item batch and risk partial-failure inconsistency.
**Do this instead:** Single bulk `upsert(rows, { onConflict, ignoreDuplicates: true })` call, as done in `src/app/api/ingest/batch/route.ts:94`. Follow this pattern for any future bulk-write endpoint.

### Letting scoring errors fail the ingest response

**What happens:** A naive implementation might let a scoring exception propagate and turn a successful `readings` insert into a 500 response.
**Why it's wrong:** The ingest guarantee (durable storage of vitals) must never depend on the correctness of a downstream, evolving scoring algorithm.
**Do this instead:** Wrap `computeAndPersistRiskScore` calls in try/catch, log, and continue — see `src/app/api/ingest/route.ts:97-107` and `src/app/api/ingest/batch/route.ts:122-129`. New downstream side effects triggered from ingest routes should follow the same isolation pattern.

## Error Handling

**Strategy:** Explicit status-code mapping at the route boundary; no thrown-error-to-500 middleware. Malformed JSON, missing auth, and failed validation are caught explicitly and mapped to 400/401. Only genuinely unexpected DB errors on the primary write/read surface the operation is expected to complete become 500s.

**Patterns:**
- `try { await request.json() } catch { return 400 }` — never let JSON parse failures become unhandled 500s.
- Auth check (`devices` lookup) happens before payload validation so a bad API key never reveals whether the payload shape was valid.
- Scoring/backfill failures are caught, logged via `console.error`, and never propagated to the HTTP response (write-path durability is prioritized over scoring completeness).

## Cross-Cutting Concerns

**Logging:** `console.error`/`console.warn` only — no structured logging framework. Errors are logged with contextual data (device/reading ids, error object) inline at each catch site.
**Validation:** Zod schemas (`src/lib/validation/ingest-schema.ts`) for all write payloads; manual regex/`Number.isSafeInteger` checks for query params in `src/app/api/readings/route.ts`.
**Authentication:** Per-device API key (`x-api-key` header checked against `devices.api_key` in Postgres) for write endpoints. No authentication currently implemented on the `GET /api/readings` dashboard read endpoint beyond a hardcoded single `deviceId`.

---

*Architecture analysis: 2026-09-25*
