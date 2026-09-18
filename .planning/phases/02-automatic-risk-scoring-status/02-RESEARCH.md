# Phase 2: Automatic Risk Scoring & Status - Research

**Researched:** 2026-09-18
**Domain:** Server-side composite risk scoring (Next.js/TypeScript) over Postgres/Supabase, extending an existing single-device ingest pipeline
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-12:** Status mapping by count of abnormal+trending features (of 3 total: temp direction, HR-temp proportionality, activity/lethargy trend): **0 or 1 abnormal → Green, 2 abnormal (co-occurring) → Amber, all 3 abnormal → Red.** A single isolated abnormal feature never escalates past Green — mirrors §7.1.1's breadth-gating intent ("a common illness perturbs 1–2 of these systems and resolves; sepsis perturbs 3+ simultaneously"), rescaled from the original ≥3-of-6 threshold to v1's 3-of-3 subset. — **Reversibility:** costly.
- **D-13:** A feature counts as "abnormal" the moment a single reading crosses its threshold (e.g. `temp ≥ 38.0°C`); this flag is set immediately, not gated on persistence. The trend/window computation refines severity and confirms worsening, but does not gate whether the abnormal flag is set in the first place.
- **D-14:** The activity/lethargy feature is simplified from §7.1.1's "recovers with comfort vs. stays flat" model to a straightforward **declining `activityScore` trend over the rolling window** — the comfort-response nuance is dropped entirely because the device sends no caregiver-interaction events to support it.
- **D-15:** The rolling trend window is **12 hours**, applied uniformly across all 3 v1 features.
- **D-16:** HR–temperature proportionality and activity trend compare against a **rolling personal baseline computed from the device's own reading history** — not fixed population reference ranges.
- **D-17:** Before a device has accumulated enough history to establish its personal baseline, status defaults to **Green**. Temperature-threshold gating does *not* need a baseline (it's absolute), so it is active from reading #1 regardless of cold-start state.
- **D-18:** The baseline is considered established after **the first 1 hour of readings** for a device.
- **D-19:** A new **`risk_scores` table**, 1:1 linked to `readings` by a foreign key (`reading_id`), stores the computed status — not columns added directly to `readings`.
- **D-20:** `risk_scores` is added to the Supabase Realtime publication alongside `readings`.
- **D-21:** `risk_scores` gets the **same RLS pattern as `readings`** (Phase 1's D-08): anon read-only, scoped to the single provisioned device, no anon write.
- **D-22:** Each `risk_scores` row stores a **full jsonb per-feature breakdown** — raw abnormal/trending booleans plus the driving values (temp value, HR/temp ratio, activityScore delta) for each of the 3 features — not just the final status.
- **D-23:** `POST /api/ingest` computes the risk score **synchronously, in the same request**, immediately after the `readings` insert succeeds — before returning `201`. No background/async job infrastructure for v1.
- **D-24:** If risk-score computation fails after the reading was already successfully inserted, the endpoint still returns **`201`** and logs the scoring failure server-side — it does not fail the whole request.
- **D-25:** Risk-computation logic is built as a **standalone importable function** (e.g. `src/lib/risk/compute.ts`), not inlined in the route handler.
- **D-26:** The scoring function's window is always **relative to the target reading's own timestamp** (`timestamp <= target AND timestamp >= target - 12h`), never "the N most-recently-inserted rows."

### Claude's Discretion
None — all four discussed areas reached explicit user decisions.

### Deferred Ideas (OUT OF SCOPE)
- Full six-feature composite model (HRV pattern, perfusion index trend, respiratory irregularity) — RISK-V2-01.
- Trained ML model as an alternative/complement to the threshold-and-trend composite — RISK-V2-02.
- Async/background risk computation (`waitUntil` or queued jobs) — explicitly rejected in favor of D-23.
- Amber "insufficient data" cold-start status — explicitly rejected in favor of D-17's Green-default.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RISK-01 | Backend computes a sepsis-risk score from incoming readings using a simplified composite of temperature thresholds, HR–temperature proportionality, and activity/lethargy trend | Code Examples (compute.ts skeleton with the exact verbatim thresholds from §7.1.1), Pattern 1 |
| RISK-02 | Backend derives a Green/Amber/Red traffic-light status from the risk score, applying breadth-gating logic | Pattern 1 (status derivation from D-12's count-based mapping), Code Examples |
| RISK-03 | Risk computation runs automatically as new readings arrive, without requiring a manual trigger | Pattern 2 (synchronous in-route invocation per D-23), Common Pitfalls (Pitfall 3: don't fail the request on scoring error) |
| STOR-02 | Computed risk scores and Green/Amber/Red status are persisted alongside (or linked to) their source readings, queryable by time range | Migration Mechanics section, Don't Hand-Roll (index for range queries), Code Examples (`risk_scores` schema) |
</phase_requirements>

## Summary

Phase 2 is a vertical extension of Phase 1's already-working ingest pipeline, not a new pipeline. Nothing about the request shape, auth, or `readings` table changes — the only new surface area is (1) one new table (`risk_scores`) added via a second migration file following the exact conventions Phase 1's `20260912172701_init.sql` already established (quoted camelCase-where-relevant columns, RLS, Realtime publication), and (2) one new pure-ish TypeScript module (`src/lib/risk/compute.ts`) that reads a timestamp-bounded window of a device's own `readings` history, derives three boolean abnormal/trending flags per D-12–D-18, and writes a `risk_scores` row — invoked synchronously from `POST /api/ingest` after the existing `readings` insert succeeds, with a try/catch that never turns a scoring failure into anything but a `201` (D-24).

The most consequential technical finding is that the current `readings` table has **no index beyond its primary key** — every one of Phase 2's window queries filters `"deviceId" = ? AND "timestamp" BETWEEN ? AND ?`, which will sequential-scan the whole table without a composite index on `("deviceId", "timestamp")`. This is invisible at v1's single-device demo scale but is a real, if low-severity, correctness-adjacent gap: cheap to fix now (a `CREATE INDEX` in the same migration file that adds `risk_scores`) and expensive to notice later once Phase 4's trend queries and a full day of readings exist. A second consequential finding: this repo's tests run against a *live* Supabase project with no mocking (`vitest.config.ts`'s own comment says so) and clean up via a `deleteReadingByTimestamp` helper — a `risk_scores` row referencing a deleted `readings` row via `ON DELETE CASCADE` (rather than `ON DELETE RESTRICT`/no action) is what keeps that existing cleanup pattern from silently leaving orphaned `risk_scores` test rows or, worse, failing the `readings` delete outright with a foreign-key violation.

**Primary recommendation:** Make `risk_scores.reading_id` **the table's primary key** (not a separate surrogate `id` with a unique constraint) — this makes the "1:1 linked to readings" requirement (D-19) a schema-level guarantee rather than an application-level convention, and it makes `compute.ts`'s write step a natural `upsert` (idempotent if a reading is ever re-scored), which matters once Phase 3's batch sync starts calling the same function.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Risk feature computation (thresholds, proportionality, trend) | API / Backend | — | PROJECT.md's own prior decision: "composite risk math runs in Next.js/TS, not SQL/Edge Functions" — reading window data out and computing in TypeScript is the established project-level architecture, not a Phase 2 choice to relitigate |
| Rolling window data retrieval | Database / Storage (query) | API / Backend (issues the query) | Postgres is the source of truth for reading history; the backend issues a bounded range query, it does not maintain its own cache of readings |
| Risk score + status persistence | Database / Storage | API / Backend (issues the insert) | `risk_scores` is a new table, same tier ownership pattern as `readings` in Phase 1 |
| Realtime status delivery | Database / Storage (Postgres replication + RLS) | Browser/Client (frontend subscribes, out of scope this repo) | Extends Phase 1's D-07 Realtime pattern — the backend's job is only to provision the publication + RLS correctly for the new table |
| Scoring trigger (when computation runs) | API / Backend | — | D-23 locks this as synchronous in-request; no queue/worker tier is introduced |

## Standard Stack

### Core
No new runtime dependencies are required for this phase. All work is additive to the stack Phase 1 already installed and verified:

| Library | Version (installed) | Purpose in Phase 2 | Why no change needed |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.116.0 [VERIFIED: npm registry — `npm view @supabase/supabase-js version` returned `2.116.0`, matching `package.json`'s `^2.116.0`] | `compute.ts` uses the existing `supabaseAdmin` service-role client for both the window read query and the `risk_scores` write | Same client, same auth model as Phase 1's `readings` insert — no new client needed |
| zod | 4.6.2 [VERIFIED: npm registry — `npm view zod version` returned `4.6.2`, matching `package.json`'s `^4.6.2`] | Not required for risk computation itself (no new external input is validated — the target reading is already-validated data pulled from `readings`), but available if the planner wants to assert the shape of `compute.ts`'s return value internally | No new install |
| vitest | installed `^4.1.11`; registry latest is `5.0.1` [VERIFIED: npm registry — `npm view vitest version` returned `5.0.1`] | Test framework for new risk-scoring tests, same pattern as `tests/ingest.route.test.ts` | Registry has a newer major (5.x) than installed (4.1.11), but upgrading is out of scope for this phase — not blocking, note only |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Supabase CLI | installed `2.105.0` [VERIFIED: local `supabase --version`]; latest available `2.117.0` [VERIFIED: `supabase/.temp/cli-latest` written by the CLI itself after Phase 1's use] | Migration authoring/push/type-gen, identical to Phase 1's workflow | Every migration + type-regen step in this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TypeScript composite scoring in `compute.ts` | A Postgres function/trigger (`AFTER INSERT ON readings`) that computes risk in SQL | Rejected — this is an explicit prior project-level decision (`PROJECT.md`: "composite risk math is far easier to write and test as real code than as SQL/Edge Functions"), and D-25's standalone-function requirement assumes TypeScript callable from both the route handler and Phase 3's batch handler |
| Synchronous in-request scoring | Supabase Database Webhook → separate Edge Function on `readings` INSERT | Rejected by D-23 specifically — would reintroduce the "no manual trigger, but also no background job infra" tension the user explicitly resolved in favor of synchronous, no-new-infra scoring |
| `risk_scores.reading_id` as PK | Surrogate `id` + `UNIQUE(reading_id)` constraint | Both enforce 1:1; PK-as-FK is simpler (no extra index, no separate uniqueness check) and makes writes naturally idempotent via `upsert`; the tradeoff is losing an independent surrogate key, which this table has no use for (nothing else references `risk_scores` rows by id in this phase's scope) |

**Installation:**
```bash
# No new packages. This phase only adds a migration file and a new src/lib/risk/ module.
```

**Version verification:** All versions above were checked live against the npm registry and the locally-installed Supabase CLI on 2026-09-18 (see Sources). No package.json changes are anticipated for this phase.

## Package Legitimacy Audit

Not applicable — Phase 2 introduces zero new npm dependencies. All packages used (`@supabase/supabase-js`, `zod`, `vitest`) were already audited and approved in `01-RESEARCH.md`'s Package Legitimacy Audit (all `SUS`/`too-new` false-positive flags from that audit remain the same packages, unchanged versions in Phase 2's usage of `@supabase/supabase-js` and `zod`).

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none newly introduced this phase.

## Architecture Patterns

### System Architecture Diagram

```
ESP32 device
   │  POST /api/ingest  (UNCHANGED from Phase 1)
   ▼
Next.js Route Handler (Vercel serverless function)
   │
   ├─► 1. Auth check (X-API-Key vs devices)         [Phase 1, unchanged]
   ├─► 2. Validate body (zod IngestSchema)           [Phase 1, unchanged]
   ├─► 3. INSERT INTO readings                       [Phase 1, unchanged]
   │       │
   │       ▼ insert succeeded (has new reading.id + timestamp)
   ├─► 4. NEW: await computeAndPersistRiskScore(deviceId, targetReading)
   │       │        (src/lib/risk/compute.ts)
   │       │
   │       ├─► 4a. SELECT readings WHERE "deviceId" = :deviceId
   │       │         AND "timestamp" <= :target.timestamp
   │       │         AND "timestamp" >= :target.timestamp - 12h
   │       │         ORDER BY "timestamp" ASC
   │       │         (uses composite index — see Don't Hand-Roll)
   │       │
   │       ├─► 4b. Derive baseline-established flag from the window's
   │       │        earliest timestamp vs. D-18's 1h threshold
   │       │
   │       ├─► 4c. Evaluate 3 features (temp threshold [absolute, no
   │       │        baseline needed], HR-temp proportionality [needs
   │       │        baseline], activity trend [needs baseline]) → count
   │       │        of abnormal features → status (D-12)
   │       │
   │       └─► 4d. UPSERT INTO risk_scores (reading_id, "deviceId",
   │                status, breakdown jsonb)
   │
   │       try/catch around all of 4: on ANY failure, log server-side,
   │       do NOT throw — step 5 still runs (D-24)
   │
   └─► 5. Return 201 { status: "ok" }  [UNCHANGED response contract]

Postgres `readings` table ──┐
                             ├─► both in supabase_realtime publication
Postgres `risk_scores` table┘    (Phase 1's readings + Phase 2's risk_scores)
   ▼
Supabase Realtime channel ── RLS-filtered for `anon` ──► Frontend (out of scope this repo)
```

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       └── ingest/
│           └── route.ts            # EXTENDED: calls computeAndPersistRiskScore after insert
├── lib/
│   ├── risk/
│   │   ├── compute.ts              # NEW: computeAndPersistRiskScore(...) — D-25's standalone function
│   │   └── thresholds.ts           # optional: named constants (38.0, 35.5, 6-14 bpm/°C band, 1h/12h windows)
│   ├── supabase/
│   │   ├── admin.ts                # unchanged
│   │   └── types.ts                # REGENERATED after migration (adds risk_scores Row/Insert/Update types)
│   └── validation/
│       └── ingest-schema.ts        # unchanged
supabase/
└── migrations/
    ├── 20260912172701_init.sql             # Phase 1, unchanged
    └── <new-timestamp>_risk_scores.sql     # NEW: table + index + RLS + publication
tests/
├── helpers/
│   └── cleanup.ts                  # EXTENDED: delete risk_scores test rows (or rely on ON DELETE CASCADE)
├── risk.compute.test.ts            # NEW: unit-ish tests of computeAndPersistRiskScore against live Supabase
└── ingest.route.test.ts            # EXTENDED: assert a risk_scores row now exists after a successful POST
```

### Pattern 1: Timestamp-Relative Window Query (supabase-js)
**What:** Query `readings` bounded by the *target reading's own timestamp*, not "most recent N rows" — required by D-26 for Phase 3 batch-sync correctness.
**When to use:** Every call into `compute.ts`, from both the live-ingest path (this phase) and the future batch-sync path (Phase 3).
**Example:**
```typescript
// Source: pattern synthesized from Supabase JS client docs (.gte/.lte/.order) —
// [CITED: supabase.com/docs/reference/javascript/gte, supabase.com/docs/reference/javascript/lte]
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

const { data: window, error } = await supabaseAdmin
  .from("readings")
  .select("timestamp, heartRate, temperature, activityScore")
  .eq("deviceId", deviceId)
  .lte("timestamp", targetReading.timestamp)
  .gte("timestamp", targetReading.timestamp - TWELVE_HOURS_MS)
  .order("timestamp", { ascending: true });

if (error) throw error;

// The window query does double duty for D-18's cold-start check: since the
// window is already capped at 12h (>> the 1h baseline threshold), the
// earliest timestamp actually returned tells you how much history exists
// without a second query, in every case:
//  - device age < 1h  -> earliest === device's true first reading -> gap < 1h -> cold start
//  - 1h <= device age < 12h -> earliest === device's true first reading -> gap >= 1h -> established
//  - device age >= 12h -> earliest === the 12h-ago cutoff itself -> gap === 12h >= 1h -> established
const earliest = window[0]?.timestamp ?? targetReading.timestamp;
const baselineEstablished = targetReading.timestamp - earliest >= ONE_HOUR_MS;
```
*Note on `numeric` columns:* `heartRate`, `temperature`, `activityScore` are Postgres `numeric` [VERIFIED: supabase/migrations/20260912172701_init.sql:17-19 — `"heartRate" numeric not null,\n  "spo2" numeric not null,\n  "temperature" numeric not null,\n  "activityScore" numeric not null`]. `@supabase/supabase-js` returns `numeric` columns as JavaScript `number` for values within safe range (no special parsing needed here — vitals are small decimals, not arbitrary-precision values).

### Pattern 2: Synchronous Post-Insert Scoring, Non-Blocking on Failure
**What:** Call the scoring function immediately after `readings` insert succeeds, inside the same request; wrap the whole call in try/catch so a scoring bug never turns a successful reading-store into a failed request (D-23, D-24).
**Example:**
```typescript
// Extends src/app/api/ingest/route.ts after the existing readings insert
const { data: insertedReading, error: insertError } = await supabaseAdmin
  .from("readings")
  .insert({ deviceId, timestamp, heartRate: vitals.heartRate, spo2: vitals.spo2,
             temperature: vitals.temperature, activityScore: vitals.activityScore })
  .select("id, deviceId, timestamp, heartRate, temperature, activityScore")
  .single();

if (insertError) {
  return NextResponse.json({ error: "Failed to store reading" }, { status: 500 });
}

try {
  await computeAndPersistRiskScore(insertedReading);
} catch (scoringError) {
  // D-24: log only, never fail the request — the reading is already safely stored.
  console.error("Risk scoring failed for reading", insertedReading.id, scoringError);
}

return NextResponse.json({ status: "ok" }, { status: 201 });
```
Note the `.select(...).single()` added to the existing insert call — the current Phase 1 insert (`src/app/api/ingest/route.ts:64-71`) does a bare `.insert({...})` with no `.select()`, so it never gets the generated `id` back. Phase 2 needs that `id` (for `risk_scores.reading_id`) and the inserted row's own timestamp (to pass into the window query) — this is a required, minimal change to the existing insert call, not new logic.

### Pattern 3: RLS + Realtime for a Second Table (mirrors Phase 1's readings pattern)
**What:** `risk_scores` gets RLS enabled, one `anon`-scoped `select` policy, and a publication membership line — the exact same three moves Phase 1 made for `readings` (D-21).
**Example:**
```sql
-- Source: Supabase official docs, same citations as 01-RESEARCH.md's Pattern 3 —
-- [CITED: supabase.com/docs/guides/database/postgres/row-level-security,
--          supabase.com/docs/guides/realtime/postgres-changes]
alter table public.risk_scores enable row level security;

create policy "anon read-only single device"
on public.risk_scores
for select
to anon
using ("deviceId" = 'nb-001');

alter publication supabase_realtime add table public.risk_scores;
```
`"deviceId"` is denormalized onto `risk_scores` (copied from the source reading at write time) specifically so this RLS policy can stay a simple literal comparison identical in shape to `readings`' policy — avoiding a subquery-through-`readings` in the policy, which would otherwise be needed to know which device a `risk_scores` row belongs to.

### Anti-Patterns to Avoid
- **Adding risk-scoring columns directly to `readings`:** Already rejected by D-19 — keep `readings` as pure raw-vitals-in.
- **Querying "the last N readings" instead of a timestamp-bounded range:** Breaks the moment Phase 3 batch-inserts an out-of-order reading; D-26 exists specifically to prevent this.
- **Computing risk in a Postgres trigger/function:** Contradicts the project's own prior architectural decision (composite math belongs in TypeScript, not SQL) — see Alternatives Considered.
- **Swallowing the scoring error silently with no log line:** D-24 says don't fail the request, but it does NOT say don't observe the failure — an empty catch block makes scoring bugs undiagnosable in production.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fast `(deviceId, timestamp)` range lookups | Hoping the table stays small enough that a sequential scan is fine | A composite B-tree index: `create index readings_deviceid_timestamp_idx on public.readings ("deviceId", "timestamp");` | The `readings` table currently has **no index beyond the primary key** [VERIFIED: supabase/migrations/20260912172701_init.sql:12-21 — table DDL declares only `id bigint generated always as identity primary key` as a constraint; no other `CREATE INDEX` or indexed constraint appears anywhere in the migration file]. Every window query Phase 2 introduces filters on exactly `("deviceId", "timestamp")` — general Postgres guidance is that composite indexes should put the most selective/equality-filtered column first [CITED via WebSearch, LOW confidence — see Sources], which for this table is `"deviceId"` (equality filter) before `"timestamp"` (range filter) |
| 1:1 enforcement between `readings` and `risk_scores` | An application-level "check before insert" or a `UNIQUE(reading_id)` constraint plus a separate surrogate `id` | `reading_id` as the table's own primary key (`reading_id bigint primary key references public.readings(id) on delete cascade`) | Fewer moving parts than a surrogate id + unique index; makes `compute.ts`'s write an `upsert(...)` that's naturally idempotent if a reading is ever (re-)scored twice — relevant once Phase 3's batch handler calls the same function and could theoretically retry |
| Cleaning up orphaned `risk_scores` test rows after a `readings` test row is deleted | A second manual `deleteRiskScoreByReadingId` call added to every test's teardown | `on delete cascade` on the `reading_id` foreign key | The existing test helper `tests/helpers/cleanup.ts`'s `deleteReadingByTimestamp` only deletes from `readings`; without `ON DELETE CASCADE`, that delete either orphans a `risk_scores` row (if no FK constraint enforces referential integrity at all) or fails outright with a foreign-key violation (if a default-action FK exists) — cascade delete keeps the existing single-call cleanup pattern working unmodified |

**Key insight:** Everything in this phase is either (a) wiring a second table into patterns Phase 1 already established (RLS, Realtime, migration mechanics — verification risk, not design risk), or (b) translating already-locked business rules (D-12 through D-18) into a pure function — the risk here is arithmetic/off-by-one bugs in the window/threshold logic, not architectural novelty. Plan verification steps accordingly: more time proving the threshold math against known-good synthetic data (a "common fever" trace that stays Amber, a "sepsis-shaped" trace that reaches Red — echoing the source doc's own demo-script recommendation in §11) than on infrastructure wiring.

## Runtime State Inventory

Not applicable — this phase adds a new table and a new code module to an existing, already-deployed schema; it does not rename, rebrand, or migrate any existing stored data, service configuration, OS-registered state, secrets, or build artifacts. The only "existing state" touched is the `readings` table's read path (queried, never mutated) and the live Supabase project already linked from Phase 1 (`supabase/.temp/linked-project.json` confirms project ref `oiegbyrjipsjmnnihnjt` is already linked — no new linking step needed).

## Common Pitfalls

### Pitfall 1: Missing Composite Index Makes Window Queries Silently Slow, Not Silently Wrong
**What goes wrong:** Without an index on `("deviceId", "timestamp")`, every `compute.ts` invocation triggers a full sequential scan of `readings`. At v1's single-device, demo-scale row counts this is invisible (sub-millisecond either way); it becomes a real latency problem once the table accumulates days of continuous readings, and Phase 4's trend queries will hit the identical gap.
**Why it happens:** Phase 1's migration only declares a primary key on `id`; nothing about Phase 1's success criteria required range-filtering by device+time, so no index was needed then.
**How to avoid:** Add `create index readings_deviceid_timestamp_idx on public.readings ("deviceId", "timestamp");` in Phase 2's migration file, alongside the new `risk_scores` table. This is a schema change to an *existing* table via a *new* migration file — standard, low-risk (`CREATE INDEX` without `CONCURRENTLY` takes a brief `ACCESS EXCLUSIVE` lock, acceptable given `readings` is small and this runs during a deploy window, not live traffic).
**Warning signs:** `EXPLAIN ANALYZE` on the window query shows `Seq Scan on readings` instead of `Index Scan`/`Bitmap Heap Scan` once the table has meaningful row counts.

### Pitfall 2: Bare `.insert()` Doesn't Return the Generated `id`
**What goes wrong:** The current `readings` insert in `src/app/api/ingest/route.ts:64-71` is a bare `.insert({...})` with no `.select()` — by default this returns no row data, only success/error. Phase 2's `compute.ts` needs the newly-inserted reading's `id` (for `risk_scores.reading_id`) and its stored `timestamp`/vitals values.
**Why it happens:** Phase 1 never needed the inserted row back, so the simplest call was used.
**How to avoid:** Add `.select("id, deviceId, timestamp, heartRate, temperature, activityScore").single()` to the existing insert chain (see Pattern 2's code example) — this is one line changed, not a new query.
**Warning signs:** `insertedReading` is `undefined`/`null` where `compute.ts` expects a row; TypeScript will actually catch this at compile time once `types.ts` is regenerated with the change, since the insert's inferred return type changes shape.

### Pitfall 3: `ON DELETE` Behavior on `risk_scores.reading_id` Is a Silent Test-Suite Trap
**What goes wrong:** `tests/helpers/cleanup.ts`'s `deleteReadingByTimestamp` (used by all three existing ingest test files) issues `supabaseAdmin.from("readings").delete().eq("timestamp", timestamp)`. If `risk_scores.reading_id` references `readings.id` with the Postgres default FK action (`NO ACTION`), that delete will fail with a foreign-key-violation error the moment any test inserts a reading that successfully gets risk-scored — silently breaking every existing test's `afterEach` cleanup, not just new risk-scoring tests.
**Why it happens:** Postgres's default `REFERENCES` behavior (no explicit `ON DELETE` clause) is `NO ACTION`, which is the correct safety default for most schemas but wrong for this test-cleanup pattern specifically.
**How to avoid:** Declare the FK as `reading_id bigint primary key references public.readings(id) on delete cascade` (see Don't Hand-Roll). Deleting a `readings` test row then automatically removes its `risk_scores` row too, with zero changes needed to the existing `cleanup.ts` helper or any of the three already-passing test files.
**Warning signs:** Any existing Phase 1 test (`ingest.route.test.ts`, `ingest.auth.test.ts`, `realtime.subscribe.test.ts`) starts failing its `afterEach`/`afterAll` cleanup step with a Postgres foreign-key-violation error, immediately after Phase 2's migration is pushed — this is a regression signal in previously-passing tests, worth calling out explicitly in the plan's verification steps.

### Pitfall 4: Realtime Publication Membership Is Not Part of the Schema Diff
**What goes wrong:** `ALTER PUBLICATION supabase_realtime ADD TABLE ...` is a publication-membership change, not a schema (DDL) change in the sense `supabase db diff` tracks — it will not be auto-generated by any CLI diffing workflow. It must be hand-written into the migration file, exactly as Phase 1's `20260912172701_init.sql:30` already did for `readings`.
**Why it happens:** Publication membership lives in Postgres's replication catalog, a different concern from table/column DDL, even though both are expressed as SQL and both live in the same migration file mechanically.
**How to avoid:** Include `alter publication supabase_realtime add table public.risk_scores;` explicitly at the end of the new migration's SQL, the same way the existing migration does for `readings` — don't rely on any Supabase CLI command to add this automatically.
**Warning signs:** After `supabase db push`, the frontend's (future) Realtime subscription to `risk_scores` never receives INSERT events even though rows are being written — checkable via `select * from pg_publication_tables where pubname = 'supabase_realtime';` in Supabase Studio's SQL editor.

## Code Examples

### `risk_scores` migration (new file)
```sql
-- Source: pattern mirrors supabase/migrations/20260912172701_init.sql's own
-- readings table (RLS + Realtime conventions), extended for D-19–D-22
create table public.risk_scores (
  reading_id bigint primary key references public.readings(id) on delete cascade,
  "deviceId" text not null references public.devices(device_id),
  status text not null check (status in ('green', 'amber', 'red')),
  breakdown jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.risk_scores enable row level security;

create policy "anon read-only single device"
on public.risk_scores
for select
to anon
using ("deviceId" = 'nb-001');

alter publication supabase_realtime add table public.risk_scores;

-- Addresses Pitfall 1 — composite index on the existing readings table,
-- needed by every rolling-window query this phase introduces:
create index readings_deviceid_timestamp_idx
on public.readings ("deviceId", "timestamp");
```
The `status` column stores the lowercase string form (`'green' | 'amber' | 'red'`); the wire/API-facing casing (`Green`/`Amber`/`Red`, per the success criteria's own capitalization) is a presentation-layer concern for whichever route reads this table back — not addressed by this migration.

### Example `breakdown` jsonb shape (D-22)
```typescript
// Illustrative shape only — exact field names are the planner's/executor's
// call; this example demonstrates satisfying D-22's requirement (raw
// abnormal/trending booleans PLUS the driving values, per feature).
interface RiskBreakdown {
  temperature: { abnormal: boolean; value: number };
  hrTempProportionality: {
    abnormal: boolean;
    ratio: number | null; // null when no baseline yet (D-17)
  };
  activityTrend: {
    trending: boolean;
    delta: number | null; // null when no baseline yet (D-17)
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| §7.1.1's full 6-feature/≥3-of-6 breadth gate | v1's 3-feature/3-of-3 rescaled gate (D-12) | Locked in this phase's CONTEXT.md, not an industry timeline change | This is a project-specific scope reduction, not a "the field moved on" finding — flagging here only so the planner doesn't mistake it for outdated research |

**Deprecated/outdated:** Nothing in this phase's stack has moved since Phase 1's research 6 days prior (2026-09-12 → 2026-09-18); no version churn expected to matter.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Postgres composite-index column ordering guidance (`equality column first, range column second`) applies here as stated | Don't Hand-Roll | Low — even a suboptimally-ordered `("timestamp", "deviceId")` index still beats no index at all for this phase's success criteria; only matters if Phase 4's trend queries have a different filter shape that favors the other ordering |
| A2 | `risk_scores.reading_id` as PK (rather than a surrogate id) is the right call | Standard Stack, Code Examples | Low-Medium — if a future phase needs to reference a `risk_scores` row by something other than its reading, a surrogate key would need to be added retroactively; no such need is visible in Phase 3/4's roadmap descriptions |
| A3 | `ON DELETE CASCADE` is desirable production behavior, not just a test-convenience choice | Pitfall 3 | Low — in production, `readings` rows are never deleted (no delete path exists anywhere in this codebase), so cascade-delete semantics are effectively test-only in practice; if a future admin/cleanup tool needs to delete readings while preserving audit-trail risk_scores, this would need revisiting |
| A4 | Supabase composite-index and CREATE INDEX CONCURRENTLY guidance sourced via WebSearch accurately reflects current Supabase docs | Pitfall 1, Don't Hand-Roll | Low — this is well-established, decades-old Postgres behavior (index column ordering, ACCESS EXCLUSIVE lock semantics), not something likely to have changed or been misreported |

**If this table is empty:** N/A — see entries above.

## Open Questions

1. **Should `status` be stored as a Postgres `text` with a `CHECK` constraint, or as a native Postgres `enum` type?**
   - What we know: Either works with supabase-js and Realtime; `text` + `CHECK` is simpler to alter later (adding a value requires `DROP CONSTRAINT`/`ADD CONSTRAINT` vs. `ALTER TYPE ... ADD VALUE`, which has its own transactional quirks in Postgres).
   - What's unclear: Whether the planner has a preference given this project's existing style (Phase 1 introduced no enum types).
   - Recommendation: Use `text` + `CHECK (status in ('green','amber','red'))` as shown in Code Examples — consistent with the project having introduced zero enum types so far, and avoids Postgres's `ALTER TYPE ... ADD VALUE` transactional restrictions if a `RISK-V2` phase ever adds a status value.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Supabase CLI | Migration authoring, `db push`, `gen types` | ✓ [VERIFIED: local `supabase --version`] | 2.105.0 (latest available: 2.117.0) | None needed — 2.105.0 supports all commands this phase uses (`migration new`, `db push`, `migration list --linked`, `gen types typescript --linked`), all already proven working in Phase 1 with this same CLI install |
| Live Supabase project (linked) | All migration/push/type-gen steps | ✓ [VERIFIED: `supabase/.temp/linked-project.json` shows project ref `oiegbyrjipsjmnnihnjt` already linked from Phase 1] | Postgres 17.6.1.166 [VERIFIED: `supabase/.temp/postgres-version`] | None needed — no re-linking required |
| Node.js | Next.js dev/build, Vitest | ✓ [VERIFIED: `node --version` → v25.8.2] | v25.8.2 | — |
| npm | package scripts | ✓ [VERIFIED: `npm --version` → 11.11.1] | 11.11.1 | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none — this phase's environment is a strict subset of what Phase 1 already proved working.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `^4.1.11` [VERIFIED: package.json], config at `vitest.config.ts` |
| Config file | `/Users/hp/Desktop/Work/Repositories/sepcare/vitest.config.ts` — tests run against the **live** Supabase project, no mocking [VERIFIED: vitest.config.ts:8-11 comment: "Vitest does not auto-load .env.local into process.env like Next.js does — tests exercise the live Supabase project (no mocking)"] |
| Quick run command | `npx vitest run tests/risk.compute.test.ts` |
| Full suite command | `npm test` (→ `vitest run`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RISK-01 | Given a synthetic 12h reading history, `computeAndPersistRiskScore` correctly flags each of the 3 features per D-13/D-14's rules | integration (against live Supabase, following existing pattern) | `npx vitest run tests/risk.compute.test.ts` | ❌ Wave 0 |
| RISK-02 | 0/1 abnormal → green, 2 → amber, 3 → red (D-12's exact mapping) — including the "common fever" trace (isolated temp, stays green/amber) vs. "sepsis-shaped" trace (all 3, reaches red) from §11's own demo-script framing | integration | `npx vitest run tests/risk.compute.test.ts` | ❌ Wave 0 |
| RISK-03 | A POST to `/api/ingest` results in a `risk_scores` row existing for that reading, with no manual trigger | integration (extends existing `tests/ingest.route.test.ts` pattern) | `npx vitest run tests/ingest.route.test.ts` | extends existing file |
| STOR-02 | A `risk_scores` row is FK-linked to its `readings` row and queryable by time range (via the reading's timestamp) | integration | `npx vitest run tests/risk.compute.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/risk.compute.test.ts` (or the specific file touched)
- **Per wave merge:** full `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`, plus a manual check that Realtime delivers `risk_scores` INSERT events (extending `tests/realtime.subscribe.test.ts`'s existing pattern, or a dedicated new subscriber test) since this is the same class of "verify the wiring, not just the unit logic" risk Phase 1 flagged for `readings`.

### Wave 0 Gaps
- [ ] `tests/risk.compute.test.ts` — covers RISK-01, RISK-02, STOR-02
- [ ] Extend `tests/helpers/cleanup.ts` — likely unnecessary if `ON DELETE CASCADE` is used (Pitfall 3), but confirm during Wave 0 that existing cleanup still passes after the migration lands
- [ ] Extend `tests/ingest.route.test.ts` — one new assertion block confirming a `risk_scores` row now exists after a successful POST (RISK-03)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | no (unchanged from Phase 1) | No new auth surface — scoring runs entirely server-side inside the already-authenticated ingest request |
| V3 Session Management | no | Not applicable |
| V4 Access Control | yes | Same RLS pattern as `readings` (D-21): `anon` read-only, scoped to the single device; only the service-role client (server-side `compute.ts`) writes `risk_scores` |
| V5 Input Validation | no new surface | `compute.ts`'s input is already-validated, already-stored data pulled back out of `readings` — no new external/untrusted input is introduced by this phase |
| V6 Cryptography | no | Not applicable — no new secrets or crypto operations |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|------------------------|
| Anon key used to read another device's risk status (once multi-device exists) | Elevation of Privilege | Same mitigation as Phase 1: RLS policy filters at the row level regardless of client request shape — carried forward unchanged by mirroring the `readings` policy pattern exactly |
| A scoring bug (e.g. an unhandled exception in `compute.ts`) crashing the ingest request | Denial of Service (self-inflicted) | D-24's try/catch requirement directly mitigates this — a scoring failure must never propagate into a failed `readings` insert response |
| Malformed/unexpected `breakdown` jsonb shape written to `risk_scores` | Tampering (data-integrity, not external attacker) | Internal-only concern since `compute.ts` is the sole writer; a TypeScript interface (see Code Examples) is sufficient guardrail — no external validation layer needed since no external input reaches this table |

## Sources

### Primary (HIGH confidence — direct tool verification)
- `npm view @supabase/supabase-js version`, `npm view zod version`, `npm view vitest version` — run directly via Bash, 2026-09-18.
- `supabase --version`, `cat supabase/.temp/cli-latest`, `cat supabase/.temp/linked-project.json`, `cat supabase/.temp/postgres-version` — local environment probes, 2026-09-18.
- Direct `Read` of `supabase/migrations/20260912172701_init.sql`, `src/app/api/ingest/route.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/types.ts`, `vitest.config.ts`, `tests/helpers/cleanup.ts`, `tests/ingest.route.test.ts`, `tests/ingest.auth.test.ts`, `tests/realtime.subscribe.test.ts` this session — informs every `[VERIFIED: <path>:<lines>]` claim above.
- Direct `Read` of `context/implementation-plans/neonatal-sepsis-armband.md:158-173` (§7.1.1) and `:204-210` (§10) — the exact verbatim thresholds (`temp ≥ 38.0°C`, `temp < 35.5°C`, `6–14 bpm/°C` Liebermeister band) and safety framing this phase's D-13/D-17 rescale.

### Secondary (MEDIUM confidence — this session had no Context7/other MCP research tools available; all doc-style questions fell back to WebSearch, same gap 01-RESEARCH.md hit)
- https://supabase.com/docs/reference/javascript/gte, https://supabase.com/docs/reference/javascript/lte — `.gte()`/`.lte()` range filter syntax.
- https://supabase.com/docs/guides/realtime/postgres-changes — `alter publication supabase_realtime add table`, replica identity notes.
- https://supabase.com/docs/reference/cli/supabase-db-push, https://supabase.com/docs/reference/cli/v1/supabase-gen-types-typescript — CLI workflow, cross-checked directly against this repo's own Phase 1 plan/summary files (`01-02-PLAN.md`, `01-02-SUMMARY.md`) which already used and confirmed this exact command sequence (`supabase migration new`, `supabase db push --password`, `supabase migration list --linked`, `supabase gen types typescript --linked > src/lib/supabase/types.ts`) worked end-to-end.

### Tertiary (LOW confidence — WebSearch-aggregated, not fetched from a single canonical page; flagged for validation)
- Postgres composite-index column-ordering guidance ("equality column first, range column second") and `CREATE INDEX CONCURRENTLY` lock-avoidance — aggregated from Supabase's own query-optimization/indexing docs pages per WebSearch summary, not fetched directly; low-stakes claim (worst case, a suboptimally-ordered index still outperforms no index).
- Vercel Hobby-tier function timeout figures (legacy 10s vs. Fluid Compute default/ceiling 300s) — not load-bearing for this phase's plan (a single window-select + single-row upsert is trivially fast at v1's data volume regardless of which limit applies), included only as background confirmation that Phase 2's synchronous-scoring approach (D-23) has no realistic timeout risk at this scale.

**Note on tooling:** Same as 01-RESEARCH.md — no `mcp__context7__*` (or any other MCP research) tools were exposed in this session's toolset, so every `research-plan`-routed `context7` item fell back to `WebSearch`. Per the classify-confidence seam, this caps those findings at `LOW` numeric confidence regardless of whether the underlying page is an official docs domain; the `[CITED: ...]` tags above reflect source authority, the confidence tier reflects access method. Treat the index-ordering and Realtime-publication SQL syntax as worth a quick Wave 0 sanity check against the actual `EXPLAIN` output / `pg_publication_tables` view once the migration is live, rather than as blindly trusted fact.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages, all version claims are direct `npm view`/local CLI checks
- Architecture: MEDIUM-HIGH — the RLS/Realtime/migration mechanics are a direct extension of Phase 1's own already-verified-in-production pattern (not new ground), but the SQL syntax details (composite index ordering, publication add-table) were WebSearch-sourced this session, same gap as Phase 1
- Pitfalls: HIGH for Pitfalls 2–4 (directly derived from reading this repo's actual current code, not external sourcing); MEDIUM for Pitfall 1 (the missing-index observation is directly verified by reading the migration file; the *recommended fix's* exact column ordering is WebSearch-sourced, LOW-tier)

**Research date:** 2026-09-18
**Valid until:** ~30 days (this phase's core findings are about this specific repo's existing code and locked CONTEXT.md decisions, not fast-moving external packages — low decay risk relative to Phase 1's greenfield-stack research)
