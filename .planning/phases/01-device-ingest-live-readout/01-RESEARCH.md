# Phase 1: Device Ingest & Live Readout - Research

**Researched:** 2026-09-12
**Domain:** Greenfield Next.js API scaffolding + Supabase (Postgres storage, RLS, Realtime) for an ESP32 device-ingest pipeline
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Request body is nested JSON with a `vitals` sub-object: `{ deviceId, timestamp, vitals: { heartRate, spo2, temperature, activityScore } }`.
- **D-02:** Timestamp is Unix epoch milliseconds (integer), not an ISO 8601 string — cheapest for ESP32 firmware to produce and unambiguous for Phase 3's original-timestamp requirement. — **Reversibility:** costly — changing the wire format later requires updating already-flashed firmware in the field, not just backend code.
- **D-03:** Endpoint is `POST /api/ingest` (single reading). Batch sync in Phase 3 will live at a related path (e.g. `/api/ingest/batch`), not decided here.
- **D-04:** API key is validated against a `devices` table in Supabase (`device_id`, `api_key` columns), not an env var — chosen specifically so multi-device support (DEV-V2-01) doesn't require a schema migration later, even though v1 only has one row. — **Reversibility:** reversible — a single-row table costs nothing extra now and is a superset of the env-var approach.
- **D-05:** The API key is sent in an `X-API-Key` header (not `Authorization: Bearer`), keeping `Authorization` free for a possible future bearer/JWT scheme.
- **D-06:** Device pairing for v1 is fully manual, per DEV-01: a `devices` row is inserted directly (Supabase dashboard/SQL/seed script) with a generated `device_id` + `api_key`; the same pair is hardcoded into ESP32 firmware at flash time. No registration endpoint or UI — that's DEV-V2-02, explicitly deferred.
- **D-07:** The frontend reads the latest vitals reading via a **Supabase Realtime subscription** directly on the readings table, not a REST endpoint. Rationale surfaced during discussion: Realtime avoids polling and Vercel function cold-starts, matches this phase's "live readout" framing, and Phase 2 will pre-compute the Green/Amber/Red status server-side at write time (STOR-02) — so no formatting logic needs to live on the frontend regardless of read mechanism. — **Reversibility:** costly — the frontend's data-fetching layer would need to be rewritten (subscription → fetch/polling) if this is reversed after the frontend is built against it.
- **D-08:** Phase 1 must configure Row Level Security so the frontend's anon key can `SELECT` (read-only) rows for the single device, with no write access.
- **D-09:** Field names in the readings table/Realtime payload match the ingest vocabulary (`heartRate`, `temperature`, `activityScore`, `spo2`, `deviceId`, `timestamp`) rather than frontend-display names (`pulse`, `temp`, `activity`) — one consistent vocabulary end-to-end; the frontend does its own display formatting (BPM label, °F, word-state mapping for activity).
- **D-10:** Missing/invalid API key → `401` with JSON body `{ error: "Invalid or missing API key" }`.
- **D-11:** Malformed/missing-field ingest payload → `400` with a field-level error body (e.g. `{ error: "Invalid payload", details: [...] }` naming which field(s) failed) — chosen over a generic-only message specifically to make field-level ESP32 firmware bugs debuggable from server logs/responses.

### Claude's Discretion
None — all four discussed areas reached explicit user decisions.

### Deferred Ideas (OUT OF SCOPE)
- Device registration/provisioning UI — belongs to DEV-V2-02 (v2 requirement), not this phase.
- Multi-device support beyond the single-row `devices` table shape chosen in D-04 — belongs to DEV-V2-01.
- API key rotation/hashing policy — not raised as blocking for v1's single static key; worth revisiting if DEV-V2-02 is built.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| ING-01 | Device can POST a single vitals reading (device ID, timestamp, HR, SpO2/perfusion, temperature, activity score) to a backend ingest endpoint | Pattern 1 (route handler code example) + zod schema in Standard Stack cover the exact nested payload shape from D-01; Code Examples section gives the full `devices`/`readings` schema needed to persist all fields |
| ING-02 | Backend authenticates each ingest request via a static per-device API key, rejecting requests with a missing/invalid key | Pattern 1 (auth-before-validate ordering) + Pattern 2 (service-role client isolation) + Security Domain's V2/V4 rows; Pitfall 4 covers the malformed-body edge case that must not bypass the auth check |
| STOR-01 | Vitals readings are persisted in Supabase (Postgres) with device ID, timestamp, and all reading fields | Code Examples (schema) + Pitfall 1 (column casing) + Pitfall 2 (timestamp type tradeoff) directly address how to persist every field correctly and consistently with the wire contract |
| READ-01 | A read API (or Supabase realtime subscription) exposes the latest vitals and current risk status for the frontend/dashboard to consume | Architecture Patterns (Pattern 3: RLS), Code Examples (`alter publication supabase_realtime add table`), and Pitfall 1 together cover provisioning the Realtime/RLS path D-07 locks in; Validation Architecture's READ-01 row notes this is best verified via a direct subscriber script since no frontend exists in this repo |
| DEV-01 | System supports a single provisioned device/baby profile end-to-end for v1 (device ID + API key configured manually, no registration UI needed) | Pattern 1 (devices table lookup) + Code Examples (manual seed row) + Open Question 1 (keeping the seeded device_id and the RLS policy literal in sync) directly support the manual single-device provisioning flow from D-06 |
</phase_requirements>

## Summary

Phase 1 is pure scaffolding plus one vertical slice: a Next.js App Router project doesn't exist yet in this repo, nor does the Supabase project/schema. The work is (1) `create-next-app` with the App Router, TypeScript, and a single `POST /api/ingest` route handler; (2) two Supabase tables (`devices`, `readings`) with RLS configured so the anon key can read-only the single device's rows while the service-role key (used only server-side in the route handler) does all writes; (3) enabling Postgres Changes replication on the `readings` table so a not-yet-built frontend can subscribe via Supabase Realtime; (4) deploying to Vercel free tier with the two Supabase env vars wired in.

The single highest-leverage finding is a naming-collision risk baked into the locked decisions: D-09 requires the stored/Realtime field names to literally be `heartRate`, `temperature`, `activityScore`, `spo2`, `deviceId`, `timestamp` — but Postgres folds unquoted identifiers to lowercase, so a naively-created `readings` table would broadcast `heartrate`/`activityscore` over Realtime, silently breaking the frontend contract. The column names must either be created as quoted mixed-case identifiers, or the project must deliberately choose snake_case columns and document that the frontend team (on `main`) is responsible for the key-casing translation. This must be an explicit decision in the plan, not an accident of `CREATE TABLE` syntax.

**Primary recommendation:** Use quoted camelCase column identifiers in the `readings` table (`"deviceId"`, `"heartRate"`, `"spo2"`, `"temperature"`, `"activityScore"`, `"timestamp"`) so the Postgres row shape is byte-identical to the wire/Realtime contract with zero translation layer — accept the (well-documented) Postgres ergonomics cost of quoting every reference to these columns in SQL.

## Project Constraints (from CLAUDE.md)

- **Hosting:** Free-tier only — Vercel for the backend, Supabase for storage/DB/realtime. No paid infrastructure for this phase. (Confirmed compatible: Vercel Hobby + Supabase Free cover this phase's needs — see Environment Availability and Common Pitfalls/Pitfall 3 for the one free-tier caveat, auto-pause.)
- **Tech stack:** Next.js (API routes / route handlers) for the backend service, TypeScript, Supabase (Postgres) for storage and realtime. (This research assumes App Router Route Handlers, not the legacy Pages API — see State of the Art.)
- **Device:** ESP32 (WiFi-capable) — replaces the original nRF52840 + BLE + Raspberry Pi design. (No BLE/bridge concerns apply to this phase's ingest endpoint.)
- **GSD Workflow Enforcement:** Direct repo edits outside a GSD workflow (`/gsd-execute-phase`, `/gsd-quick`, `/gsd-debug`) are disallowed — the planner should structure Phase 1 as normal plan-phase output consumed by `/gsd-execute-phase`, not as ad-hoc instructions assuming direct file edits.
- No conflicts identified between these constraints and any locked CONTEXT.md decision.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Device auth (API key check) | API / Backend | Database (devices table is source of truth) | Must reject before any write; only the route handler can see `X-API-Key` header and the service-role key needed to query `devices` under RLS-bypass |
| Payload validation (shape/types) | API / Backend | — | Zod (or equivalent) runs server-side in the route handler; ESP32 firmware bugs must be caught here, not silently stored |
| Reading persistence | Database / Storage | API / Backend (issues the insert) | Postgres is system of record; route handler is a thin writer, no business logic beyond validation+auth at this phase |
| Realtime "latest reading" delivery | Database / Storage (Postgres replication + RLS) | Browser/Client (frontend subscribes, out of scope this repo) | D-07 locks this as direct Supabase Realtime, not a REST poll — the backend's job is only to provision the publication + RLS correctly |
| Device provisioning (devices row) | Database / Storage | Human/manual (dashboard or SQL) | D-06: no registration endpoint in v1; a human inserts one row |
| Deployment/hosting | CDN / Static (Vercel edge) + API/Backend (serverless function) | — | Vercel free tier hosts the Next.js app; API routes run as serverless functions, not always-on |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.3.5 [VERIFIED: npm registry — `npm view next version`] | App Router, API route handlers, Vercel-native deployment target | Locked by PROJECT.md constraints; current major is the App Router generation |
| react / react-dom | 19.3.0 [VERIFIED: npm registry — `npm view react version`] | Required peer of Next.js App Router | Next.js 16 requires React 19 |
| typescript | ^5.x recommended for Next.js 16 tooling compatibility [ASSUMED — `npm view typescript version` returned 7.0.2, but Next.js 16's own `create-next-app` template and most ecosystem tooling (ESLint configs, `@types/*`) target TS 5.x; a major-version jump to TS 7 without checking Next.js's own peer range risks a scaffolding-time compile error] | Static typing for route handlers, Supabase generated types | Project-mandated (CLAUDE.md: "TypeScript throughout") |
| @supabase/supabase-js | 2.116.0 [VERIFIED: npm registry — `npm view @supabase/supabase-js version`] | Supabase client: service-role client for server-side writes, anon client conceptually for the (separate, frontend-side) Realtime subscriber | Official Supabase JS SDK; only supported way to talk to Supabase from Node/Next.js |
| zod | 4.6.2 [VERIFIED: npm registry — `npm view zod version`] | Request-body schema validation, producing the field-level `details` array D-11 requires | De facto standard TS-first validator; parses nested JSON (`vitals` sub-object) and yields structured `.issues` for 400 responses |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv (or Next.js built-in `.env.local`) | n/a — Next.js has built-in env loading | Local dev env var loading | Not a separate install; Next.js reads `.env.local` natively |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| zod | Manual `if` checks / `joi` | Zod gives typed inference + structured issue arrays for free, matching D-11's field-level error requirement with less code than hand-rolled checks; joi is Node-idiomatic but lacks TS-inference ergonomics |
| Quoted camelCase Postgres columns | snake_case columns + a translation layer (view or serialization step) before Realtime | snake_case is idiomatic Postgres and avoids quoting friction everywhere in SQL, but Realtime broadcasts raw table rows — a view does NOT support Postgres Changes replication, so a snake_case table would require the frontend to do case-translation itself, which conflicts with D-09's intent ("one consistent vocabulary end-to-end") |

**Installation:**
```bash
npx create-next-app@latest . --typescript --app --no-tailwind --eslint --src-dir --import-alias "@/*"
npm install @supabase/supabase-js zod
```

**Version verification:** Verified 2026-09-12 via `npm view <pkg> version` against the live npm registry (see table above). Training-data versions for Next.js/React/Supabase-js are known to run several majors stale; always re-verify at execution time since this phase has a long-lived reversibility cost (D-02 timestamp format) that makes late stack changes expensive.

## Package Legitimacy Audit

| Package | Registry | Age (latest publish) | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----------------------|-----------|--------------|---------|-------------|
| next | npm | published 2026-09-11 (1 day old at research time) | 43.4M/week | github.com/vercel/next.js | SUS (`too-new`) | Flagged — see note below |
| @supabase/supabase-js | npm | published 2026-09-07 (5 days old) | 20.1M/week | github.com/supabase/supabase-js | SUS (`too-new`) | Flagged — see note below |
| zod | npm | published 2026-09-10 (2 days old) | 209.2M/week | github.com/colinhacks/zod | SUS (`too-new`) | Flagged — see note below |

**Note on the SUS verdicts:** All three flags are triggered solely by the `too-new` heuristic (days since the *most recent* publish), which is a poor fit for actively-maintained, high-velocity packages that ship patch releases every few days. All three have 20M–209M weekly downloads and multi-year GitHub histories under their official maintainer orgs — the downloads/repo signals are the ones that actually distinguish a slopsquat from a legitimate package, and both are strongly positive here. Per protocol, package names discovered via WebSearch/training data are still tagged `[ASSUMED]` regardless of registry existence, so treat the exact package names above as `[ASSUMED]` and gate first install behind a `checkpoint:human-verify` (confirm `next`, `@supabase/supabase-js`, and `zod` are the packages actually resolved in `package.json` after scaffolding, matching the GitHub repos listed above).

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** `next`, `@supabase/supabase-js`, `zod` — see note above; planner should add one lightweight `checkpoint:human-verify` after `npm install` confirming `package.json`/`package-lock.json` point at the expected repos, rather than three separate checkpoints.

## Architecture Patterns

### System Architecture Diagram

```
ESP32 device
   │  POST /api/ingest
   │  Headers: X-API-Key: <static per-device key>
   │  Body: { deviceId, timestamp, vitals: { heartRate, spo2, temperature, activityScore } }
   ▼
Next.js Route Handler (Vercel serverless function)
   │
   ├─► 1. Read X-API-Key header
   │       │
   │       ▼
   │   Supabase query: SELECT device_id FROM devices
   │                    WHERE device_id = :deviceId AND api_key = :key
   │   (uses SERVICE-ROLE client — bypasses RLS, only place secrets touch DB)
   │       │
   │       ├─ no match ──► 401 { error: "Invalid or missing API key" }  [STOP — nothing stored]
   │       │
   │       ▼ match
   ├─► 2. Parse + validate JSON body (zod schema)
   │       │
   │       ├─ invalid ──► 400 { error: "Invalid payload", details: [...] }  [STOP — nothing stored]
   │       │
   │       ▼ valid
   ├─► 3. INSERT INTO readings (service-role client)
   │       │
   │       ▼
   └─► 4. Return 2xx success JSON to device

Postgres `readings` table
   │  (Postgres Changes replication enabled via
   │   ALTER PUBLICATION supabase_realtime ADD TABLE readings;)
   ▼
Supabase Realtime channel ── RLS-filtered for `anon` role ──► Frontend (built on `main`, out of scope here)
   subscribes with ANON key, receives INSERT events,
   only for rows the anon SELECT policy allows
```

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       └── ingest/
│           └── route.ts       # POST handler: auth → validate → insert
├── lib/
│   ├── supabase/
│   │   ├── admin.ts           # service-role client (server-only, never imported client-side)
│   │   └── types.ts           # generated/hand-written row types for devices/readings
│   └── validation/
│       └── ingest-schema.ts   # zod schema for the nested { deviceId, timestamp, vitals } body
└── ...
supabase/
└── migrations/                # SQL migration files (devices, readings, RLS policies, publication)
```

### Pattern 1: Route Handler — Auth Then Validate, Fail Closed
**What:** Check `X-API-Key` against the `devices` table *before* touching or even fully parsing the body; return 401 immediately on failure. Only after auth succeeds, parse+validate the JSON body with zod and return 400 on failure. Both failure paths return before any `INSERT`.
**When to use:** Every ingest-style endpoint in this project (this phase's `/api/ingest`, and Phase 3's `/api/ingest/batch`).
**Example:**
```typescript
// Source: pattern synthesized from Next.js route handler docs (nextjs.org/docs) + zod docs — [CITED: nextjs.org/docs/app/building-your-application/routing/route-handlers]
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const IngestSchema = z.object({
  deviceId: z.string(),
  timestamp: z.number().int(),
  vitals: z.object({
    heartRate: z.number(),
    spo2: z.number(),
    temperature: z.number(),
    activityScore: z.number(),
  }),
});

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  // Body is read once; keep raw text around only if you need it for logging.
  const raw = await request.json().catch(() => null);
  if (raw === null) {
    return NextResponse.json(
      { error: 'Invalid payload', details: [{ message: 'Body is not valid JSON' }] },
      { status: 400 }
    );
  }

  const { data: device } = await supabaseAdmin
    .from('devices')
    .select('device_id')
    .eq('device_id', raw.deviceId ?? '')
    .eq('api_key', apiKey)
    .maybeSingle();

  if (!device) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  const parsed = IngestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { deviceId, timestamp, vitals } = parsed.data;
  const { error: insertError } = await supabaseAdmin.from('readings').insert({
    deviceId,
    timestamp,
    heartRate: vitals.heartRate,
    spo2: vitals.spo2,
    temperature: vitals.temperature,
    activityScore: vitals.activityScore,
  });

  if (insertError) {
    return NextResponse.json({ error: 'Failed to store reading' }, { status: 500 });
  }

  return NextResponse.json({ status: 'ok' }, { status: 201 });
}
```
*Note: the `.eq('deviceId', ...)`/`.insert({ deviceId, ... })` calls above use the camelCase keys because supabase-js maps object keys directly to column names — this only works if the `readings`/`devices` tables are actually created with quoted camelCase columns (see Pitfall 1 below). If snake_case columns are chosen instead, every key in this handler must change to match.*

### Pattern 2: Service-Role Client Isolation
**What:** Exactly one module (`lib/supabase/admin.ts`) constructs the service-role client, using `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix) — imported only from server-side route handlers, never from any file that could end up in a client bundle.
**When to use:** Any server-side write path. [CITED: multiple official-adjacent guides confirm the `NEXT_PUBLIC_` prefix is what exposes a var to the browser bundle in Next.js — this is standard Next.js env var behavior, not Supabase-specific]
**Example:**
```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

### Pattern 3: RLS — Anon Read-Only, Service-Role Bypass
**What:** Enable RLS on `readings`; grant `SELECT` to `anon` filtered to the single device; revoke/never-grant `INSERT`/`UPDATE`/`DELETE` to `anon`. The service-role key bypasses RLS entirely by design, so the route handler's writes are unaffected.
**Example:**
```sql
-- Source: Supabase official RLS docs — [CITED: supabase.com/docs/guides/database/postgres/row-level-security]
alter table public.readings enable row level security;

create policy "anon can read single device readings"
on public.readings
for select
to anon
using ("deviceId" = 'the-one-provisioned-device-id');
-- No INSERT/UPDATE/DELETE policy is created for `anon`, and no default
-- privilege grants those actions, so anon writes are rejected at the
-- grant layer, before RLS is even evaluated.
```
Hardcoding the device id in the policy is acceptable for v1's single-device scope (D-04/D-06) but should be flagged as a thing that changes shape for DEV-V2-01 (multi-device) — a future policy would instead compare against a value scoped to the requesting session/key rather than a literal.

### Anti-Patterns to Avoid
- **Validating the body before checking the API key:** Wastes work and gives an attacker a way to distinguish "bad key" from "bad payload" timing/response differences on an unauthenticated request. D-10/D-11 order the checks (auth first) for a reason — don't invert them for "cleaner" middleware chaining.
- **Using the service-role client anywhere reachable by a browser bundle:** Even a `"use client"` file that imports the admin module transitively can leak the key into the client JS bundle. Keep it strictly in route handlers / server-only modules.
- **Creating the `readings` table with default (unquoted, lowercased) column names while D-09 requires camelCase keys in the Realtime payload:** produces a silent contract break the frontend team will discover late. See Pitfall 1.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Nested JSON body validation + field-level error reporting | Manual `typeof`/`in` checks with hand-built error arrays | zod `safeParse()` + `.error.issues` | Zod's issues array already carries `path` (which field, including nested `vitals.heartRate`) and `message` — exactly the shape D-11 asks for, with far less code and fewer missed edge cases (wrong type vs missing vs extra fields) |
| Realtime "latest reading" push mechanism | A polling `setInterval` REST endpoint, or a hand-rolled WebSocket server | Supabase Realtime (Postgres Changes) | D-07 already locked this decision; hand-rolling a WS layer on Vercel serverless functions is especially bad since serverless functions don't hold persistent connections — Supabase's managed Realtime is the only free-tier-compatible option |
| API key comparison | Custom string-equality auth middleware | Supabase RLS + a scoped SELECT via service-role client (as shown in Pattern 1) | Keeps device credential material in one place (`devices` table) rather than duplicated logic; also sets up the schema DEV-V2-01 needs later without extra migration |

**Key insight:** Almost everything in this phase is wiring standard building blocks (Next.js route handler, zod, Supabase client, Supabase RLS/Realtime) correctly, not writing novel logic. The risk in this phase is *misconfiguration* (wrong column casing, wrong client/key pairing, RLS gaps) rather than algorithmic complexity — planning should allocate more verification steps to "did we wire this correctly" than to "did we write correct business logic."

## Runtime State Inventory

Not applicable — this is a greenfield phase (new repo, no prior Next.js app, no existing Supabase project, no prior data). No rename/refactor/migration is occurring. Confirmed by directory listing: no `package.json`, no `next.config.*`, no `supabase/` directory exist anywhere in the repo as of this research (verified via `ls` at repo root, project-context read in Step 1).

## Common Pitfalls

### Pitfall 1: Postgres Column Casing Silently Breaks the Realtime Wire Contract
**What goes wrong:** D-09 requires `heartRate`, `activityScore`, `deviceId`, etc. as the literal field names in the Realtime payload. If the `readings` table is created with an ordinary unquoted `CREATE TABLE readings (heartRate int, ...)`, Postgres folds the identifier to lowercase (`heartrate`), and the row Realtime broadcasts will contain `heartrate`, not `heartRate` — a case the frontend team's Realtime subscriber (built separately, on `main`) will not expect per D-09's own rationale ("one consistent vocabulary end-to-end").
**Why it happens:** Postgres always lowercases unquoted identifiers regardless of the case used in the `CREATE TABLE` statement; only double-quoted identifiers (`"heartRate"`) preserve case, and every subsequent reference to that column (in `INSERT`, `SELECT`, RLS policies, indexes) must then also be quoted to match. [CITED: postgresql.org mailing list + Supabase community discussion on camelCase columns and RLS/functions]
**How to avoid:** Decide explicitly (don't let it default): either (a) quote every camelCase column identifier consistently across all DDL/DML/RLS/`supabase-js` calls, or (b) use snake_case columns and add an explicit mapping step before/at the Realtime layer — but note option (b) is hard to reconcile with D-07 (direct Realtime subscription, no backend transform layer) without asking the frontend team to do the casing translation, which conflicts with D-09's stated intent. Recommend (a).
**Warning signs:** A manual test of the Realtime channel (e.g. `supabase-js` test subscriber script) receiving lowercase keys instead of camelCase during phase verification.

### Pitfall 2: `timestamp` as a Bare Column Name / Type Choice
**What goes wrong:** `timestamp` is both the wire field name (D-02, epoch ms integer) and a reserved-ish SQL type keyword in Postgres. Naively typing the column as Postgres `timestamp`/`timestamptz` while also needing to preserve the raw epoch-ms integer for exact round-tripping (relevant to Phase 3's "original timestamp" requirement) creates ambiguity about what's actually stored.
**Why it happens:** The wire format (epoch ms int, D-02) and the natural Postgres storage type (`timestamptz`, better for range queries in Phase 4's trend API) are different representations of the same value, and a column literally named `timestamp` of SQL type `timestamp`/`timestamptz` needs the value converted (`to_timestamp(ms / 1000.0)`) on the way in — an easy off-by-1000 or precision-loss bug (mixing seconds and milliseconds).
**How to avoid:** Store the column as `bigint` holding the raw epoch-ms integer if byte-for-byte wire fidelity matters more than native Postgres time functions in Phase 1 (simplest, matches D-02 exactly, defers range-query ergonomics to Phase 4 research); or store as `timestamptz` with an explicit, tested conversion (`to_timestamp(:ms::numeric / 1000)`) if Phase 4's trend queries are expected to lean on native Postgres time operators. Either choice is legitimate — but it must be a stated decision, tested with a known epoch-ms value, not left implicit. [CITED: PostgreSQL community guidance — bigint avoids 32-bit int overflow (Y2038), and native `timestamptz` is generally preferred for time-range query performance, but neither directly "wins" for this phase's narrow single-reading-fetch success criterion]
**Warning signs:** A reading round-tripped through insert→Realtime→(future) trend query shows a timestamp off by a factor of 1000, or shifted by a timezone offset.

### Pitfall 3: Supabase Free-Tier Project Auto-Pause
**What goes wrong:** A Supabase free-tier project pauses automatically after 7 days of inactivity — if the ESP32 device isn't actively posting (e.g., during a demo gap, or while the backend track is ahead of the hardware track), the project can pause and the next ingest POST (or Realtime subscription) will fail until someone manually resumes it from the dashboard.
**Why it happens:** Documented Supabase free-tier cost-control behavior. [CITED: multiple 2026 Supabase pricing summaries citing the 1-week inactivity auto-pause on free projects — cross-check directly against supabase.com/pricing recommended before relying on this in a demo-critical week]
**How to avoid:** Not a code fix — a process/ops note: whoever owns the Supabase project should be aware pausing can happen, and check project status before a demo if there's been a week+ gap. Not blocking for Phase 1 planning, but worth a one-line note in the plan's assumptions/risks.
**Warning signs:** Ingest POST or Realtime subscription starts failing with a connection-refused/paused-project error after a period of no traffic.

### Pitfall 4: `request.json()` Throws on Malformed Body, Not Returns
**What goes wrong:** `await request.json()` throws (rejects) if the body isn't valid JSON at all (not just schema-invalid) — an uncaught rejection here becomes an unhandled 500 rather than the D-11-mandated 400 with field detail.
**Why it happens:** `request.json()` is a parse step, separate from and prior to zod's schema validation; a naive implementation that only wraps the zod call in error handling misses the raw-parse failure case.
**How to avoid:** Wrap the `request.json()` call itself in a try/catch (or `.catch()`, as shown in Pattern 1's example) and return the same 400 shape for "not JSON at all" as for "JSON but wrong shape."
**Warning signs:** A test POST with a non-JSON body (e.g. plain text, or empty body) returns a raw framework 500 instead of the documented 400 error shape.

## Code Examples

### Enabling Realtime Replication on the readings table
```sql
-- Source: Supabase official docs — [CITED: supabase.com/docs/guides/realtime/postgres-changes]
alter publication supabase_realtime add table public.readings;
```
Note from the same source: RLS policies ARE evaluated per-subscriber for Postgres Changes — an `anon`-role subscriber only receives INSERT/UPDATE events for rows their SELECT policy allows, which is exactly the mechanism D-08 relies on. One documented caveat: RLS is *not* applied to DELETE broadcast events (not relevant to this phase, no deletes occur).

### Minimal devices + readings schema
```sql
-- devices: manually seeded (D-06), one row for v1
create table public.devices (
  device_id text primary key,
  api_key text not null,
  created_at timestamptz not null default now()
);
alter table public.devices enable row level security;
-- No anon policy at all on `devices` — this table should NOT be readable
-- by anon; only the service-role client (auth checks) ever queries it.

-- readings: quoted camelCase columns to match D-09's wire vocabulary exactly
create table public.readings (
  id bigint generated always as identity primary key,
  "deviceId" text not null references public.devices(device_id),
  "timestamp" bigint not null,        -- epoch ms, D-02 (see Pitfall 2 for the tradeoff)
  "heartRate" numeric not null,
  "spo2" numeric not null,
  "temperature" numeric not null,
  "activityScore" numeric not null,
  created_at timestamptz not null default now()
);
alter table public.readings enable row level security;

create policy "anon read-only single device"
on public.readings
for select
to anon
using ("deviceId" = '<the-one-provisioned-device-id>');

alter publication supabase_realtime add table public.readings;
```
`created_at` (server-side insert time, `timestamptz`) is kept separate from `"timestamp"` (device-reported epoch ms) — this distinction matters for Phase 3, where the two can legitimately differ for buffered/batched readings.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Next.js `pages/api/*` API Routes | App Router `app/api/*/route.ts` Route Handlers with `NextRequest`/`NextResponse` | Stabilized since Next.js 13, standard by Next.js 15/16 | This phase should use Route Handlers exclusively; no reason to reach for the legacy Pages API in a greenfield 2026 project |
| Raspberry Pi BLE bridge + nRF52840 | ESP32 direct-to-WiFi POST | Already decided at the project level (PROJECT.md) | Confirmed background context for this phase — no BLE/bridge concerns apply to the ingest endpoint |

**Deprecated/outdated:** Pages Router API routes are not deprecated but are legacy for new Next.js projects; all current official guidance defaults to Route Handlers for new API surfaces.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | TypeScript should target the ~5.x line rather than the registry-latest 7.0.2 for compatibility with the current Next.js/ecosystem tooling | Standard Stack | If wrong, `create-next-app`'s own scaffolding will pin whatever TS version it ships with anyway, making this largely self-correcting — but if TS is added manually later at v7, watch for `@types/*` or ESLint config peer-dependency conflicts |
| A2 | `next`, `@supabase/supabase-js`, and `zod` are legitimate despite `SUS`/`too-new` verdicts (package names were sourced from training knowledge + WebSearch, not Context7) | Package Legitimacy Audit | Low — all three have massive weekly download counts and long-lived official GitHub repos, but per protocol the exact package names are `[ASSUMED]` until confirmed installed correctly; a `checkpoint:human-verify` is recommended, not skipped |
| A3 | Supabase free-tier projects auto-pause after 7 days of inactivity | Pitfall 3 | If wrong (policy changed), the "pause during demo gap" risk note is unnecessary — low impact either way, it's an ops note, not a design decision |
| A4 | Quoted camelCase Postgres columns are the right call over snake_case + translation layer | Summary / Pitfall 1 | If the frontend team would have preferred snake_case with their own mapping layer, this creates rework in the SQL schema (quoting every reference) rather than in frontend code — worth confirming with whoever owns `main`'s Realtime subscriber before locking the schema, since this is exactly the kind of decision D-09 was trying to settle once, end-to-end |

**If this table is empty:** N/A — see entries above.

## Open Questions

1. **Should the anon RLS policy hardcode the device_id literal, or read it from a config/env-driven value?**
   - What we know: v1 has exactly one device (D-06); a literal string in the policy works and is simplest.
   - What's unclear: Whether the planner wants the device_id used in the policy sourced from the same seed script that creates the `devices` row (to avoid two places needing manual sync), or accepts the literal as intentionally hardcoded for v1.
   - Recommendation: Seed script should create the `devices` row and print/output the exact `device_id` value to paste into the RLS policy migration — treat this as one manual step, documented, not two independently-typed literals that could drift.

2. **Does the phase need a `vercel.json`, or does zero-config Next.js detection suffice?**
   - What we know: Vercel auto-detects Next.js projects with zero configuration needed for standard App Router route handlers on the Hobby (free) plan.
   - What's unclear: Whether any custom function timeout/region setting is needed (Hobby plan default serverless function timeout is 10s, which should be more than sufficient for a single insert+auth check).
   - Recommendation: Skip `vercel.json` entirely for this phase; add one only if a concrete need surfaces (there is no research-identified reason to add one now).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|----------|
| Node.js | Next.js dev/build/deploy | not probed this session (no code exists yet to require it) | — | Planner's Wave 0 should verify local Node version meets Next.js 16's minimum before scaffolding |
| npm | package install | ✓ (used in this research session) | not captured | — |
| Supabase project | STOR-01, READ-01, D-04/D-07/D-08 | ✗ — does not exist yet, must be created | — | No fallback; this phase cannot complete without a live Supabase project (free tier). This is a Wave 0 setup task, not optional. |
| Vercel account/project | Deployment | ✗ — does not exist yet | — | No fallback for a deployed pipeline, but note the phase's success criteria (device POST → storage → read) can be verified against a local Next.js dev server before deployment is wired up, if the planner wants to sequence local-verify-first, deploy-second |

**Missing dependencies with no fallback:**
- A live Supabase project (with `devices`/`readings` tables, RLS, and Realtime publication configured) must be created before ingest/read success criteria can be verified. This is inherent to the phase, not a gap — Wave 0 of the plan should include Supabase project creation as an explicit task.

**Missing dependencies with fallback:**
- Vercel deployment can be deferred behind local `next dev` verification of the same route handler code, if the planner wants a tighter inner loop before deploy — deploying is required for the phase to be "done" per the project's free-tier hosting constraint, but not required for every intermediate verification step.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | none installed yet — greenfield repo |
| Config file | none — see Wave 0 |
| Quick run command | TBD after framework choice (recommend `vitest` for a TypeScript/Next.js route-handler-only backend: fast, ESM-native, works without a browser/DOM environment since this phase has no UI) |
| Full suite command | TBD |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|---------------------|-------------|
| ING-01 | Valid POST with correct key + well-formed body returns success and the reading is queryable afterward | integration (route handler invoked directly, or via `next dev` + `fetch`, against a real/test Supabase project) | `vitest run tests/ingest.route.test.ts` | ❌ Wave 0 |
| ING-02 | POST with missing/invalid `X-API-Key` is rejected with 401 before any row is inserted | integration | `vitest run tests/ingest.auth.test.ts` | ❌ Wave 0 |
| STOR-01 | Inserted row has all fields intact (device ID, timestamp, HR, SpO2, temp, activity) matching what was POSTed | integration (query Supabase directly after insert) | `vitest run tests/ingest.route.test.ts` (same file as ING-01, different assertions) | ❌ Wave 0 |
| READ-01 | Reading is fetchable as "the latest" for the device — for this phase, verified via a direct Supabase query/Realtime test client, since there is no REST read endpoint (D-07) | integration/manual | `vitest run tests/realtime.subscribe.test.ts` OR a manual Supabase Studio / `supabase-js` script check, since there's no frontend consumer in this repo to exercise end-to-end | ❌ Wave 0 (or manual-only, justified: the actual consumer is a separate frontend repo/branch not built yet) |
| DEV-01 | The one provisioned device's credentials work end-to-end; a different/fake device_id+key combination is rejected | integration | `vitest run tests/ingest.auth.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `vitest run` (fast subset relevant to the file touched)
- **Per wave merge:** full `vitest run` suite
- **Phase gate:** Full suite green before `/gsd-verify-work`, plus one manual end-to-end check (real or simulated ESP32 POST against the deployed Vercel URL) since D-07's Realtime read path is best confirmed with a live subscriber script, not just a unit test.

### Wave 0 Gaps
- [ ] Install `vitest` (or chosen framework) — `npm install -D vitest`
- [ ] `tests/ingest.route.test.ts` — covers ING-01, STOR-01
- [ ] `tests/ingest.auth.test.ts` — covers ING-02, DEV-01
- [ ] `tests/realtime.subscribe.test.ts` or a documented manual check script — covers READ-01
- [ ] A disposable/test Supabase setup strategy (either a second free-tier project for tests, or careful cleanup of test rows in the same project) — needs an explicit planning decision since this phase has no local Postgres/mocking layer discussed yet

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | yes | Static per-device API key checked server-side against `devices` table (D-04); this is intentionally a lightweight v1 scheme, not a full auth system — acceptable per project's explicit v1 scope (DEV-V2-02 defers proper provisioning) |
| V3 Session Management | no | No sessions/cookies in this phase — stateless per-request API key check |
| V4 Access Control | yes | RLS: `anon` role limited to SELECT on the single device's rows (D-08); service-role key confined to server-side route handler code only |
| V5 Input Validation | yes | zod schema validation on the nested ingest payload; reject on missing/wrong-typed fields with structured 400 (D-11) |
| V6 Cryptography | no direct crypto in this phase | API key is a static shared secret compared via Postgres equality in this v1 design — not hashed. This is a known, discretely-scoped v1 simplification (see Deferred Ideas: "API key rotation/hashing policy" explicitly deferred) — flagging here as a security-relevant simplification the planner should carry forward, not silently accept as if it were a best practice. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|------------------------|
| Service-role key leaked into client bundle | Information Disclosure | Never import the service-role client module from any file reachable by a `"use client"` component; keep it exclusively in route handlers (Pattern 2) |
| Anon key used to bypass the single-device SELECT restriction (e.g., crafting a request for another device_id) | Elevation of Privilege | RLS policy filters at the database row level regardless of what the client requests — this is why D-08's RLS policy (not just "the frontend only asks for one device") is the actual security boundary |
| API key stored/compared in plaintext in `devices` table | Information Disclosure (if the table or a backup leaks) | Deferred for v1 per explicit project decision (see V6 above); acceptable given the `devices` table has no `anon` SELECT policy at all (only service-role can read it), but should not be forgotten if `DEV-V2-02` introduces a registration flow later |
| Malformed/oversized payload causing resource exhaustion | Denial of Service | zod validation rejects malformed bodies early (before insert); Vercel's Hobby plan function timeout (10s) and payload size limits provide a coarse backstop — no additional rate-limiting is in scope for this phase's success criteria |

## Sources

### Primary (HIGH confidence)
- npm registry direct queries (`npm view next version`, `npm view @supabase/supabase-js version`, `npm view zod version`, `npm view typescript version`, `npm view react version`) — run directly via Bash tool, 2026-09-12.
- `gsd-tools query package-legitimacy check` — direct tool output for next, @supabase/supabase-js, zod.

### Secondary (MEDIUM confidence — CITED official documentation)
- https://supabase.com/docs/guides/database/postgres/row-level-security — RLS policy syntax, `to`/`using` clause semantics, grant vs. policy layering.
- https://supabase.com/docs/guides/realtime/postgres-changes — `alter publication supabase_realtime add table ...` syntax; RLS-per-subscriber authorization behavior for Postgres Changes; DELETE-event RLS caveat.
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers (referenced via WebSearch synthesis of Next.js official docs pages) — Route Handler POST/`NextResponse.json` conventions.

### Tertiary (LOW confidence — WebSearch-aggregated, not directly fetched from a single authoritative page; flagged for validation)
- Postgres identifier case-folding behavior (Bytebase blog, Supabase community discussions, postgresql.org mailing list threads) — consistent across multiple independent sources, but no single official "camelCase columns" doc page was fetched directly; recommend the planner spot-check this against a real `psql \d readings` output during Wave 0 rather than trusting research alone, since this finding drives a load-bearing schema decision (Pitfall 1).
- Supabase free-tier limits (auto-pause after 7 days, 200 concurrent Realtime connections, 500MB DB) — aggregated from multiple 2026 third-party pricing-summary blog posts, not Supabase's own pricing page directly; low-stakes for this phase (Pitfall 3 is an ops note, not a blocking design constraint) but should be re-confirmed against supabase.com/pricing before being treated as fact in later phases.
- Postgres `bigint` vs `timestamptz` for epoch-ms storage — general community consensus (postgresql.org mailing list, various 2026 blog posts), not a single canonical source; treated here as informing an open decision (Pitfall 2) rather than a locked recommendation.
- Vercel free-tier deployment steps and limits — aggregated from multiple third-party 2026 "how to deploy" blog posts; core claim (zero-config Next.js detection, env vars via dashboard) is uncontroversial and consistent across sources, but not fetched from vercel.com/docs directly this session.

**Note on tooling:** Context7 MCP tools were not available in this research session's toolset (no `mcp__context7__*` functions were exposed), so the `research-plan` seam's `context7`-routed questions (Next.js route handlers, Supabase client setup, RLS, Realtime) were answered via the `websearch`/`webfetch` fallback path instead. Per the classify-confidence seam, `webfetch`/`websearch`-sourced findings are rated `LOW` regardless of whether the fetched page is an official docs domain — the CITED tags above reflect that the *source* is an official docs page, while the numeric confidence tier reported by the seam is `LOW` because the *access method* wasn't Context7. Treat load-bearing claims (Pitfall 1's column-casing behavior, and the RLS/Realtime SQL syntax) as worth a Wave 0 spot-check against a live Supabase project rather than as Context7-verified fact.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH for version numbers (direct npm registry queries), MEDIUM for "which versions are idiomatic together" (TypeScript major version choice is ASSUMED)
- Architecture: MEDIUM — patterns are standard/uncontroversial Next.js + Supabase conventions, but sourced via WebSearch/WebFetch rather than Context7 this session
- Pitfalls: MEDIUM-HIGH for Pitfall 1 (column casing) despite tertiary sourcing, because it's cross-confirmed by multiple independent sources and is directly checkable in Wave 0; LOW-MEDIUM for Pitfall 3 (Supabase auto-pause specifics) since it's aggregated from non-canonical sources

**Research date:** 2026-09-12
**Valid until:** ~14 days (fast-moving: Next.js/Supabase-js/zod are all high-velocity packages per the legitimacy audit's own "too-new" signal; re-verify exact versions at execution time if planning is delayed)
