# Phase 3: Offline-Buffered Batch Sync - Research

**Researched:** 2026-09-19
**Domain:** Postgres bulk upsert/dedup semantics, Supabase JS client behavior, Vercel serverless limits, Next.js route handlers
**Confidence:** MEDIUM-HIGH (one core mechanism — in-batch duplicate handling under `ON CONFLICT DO NOTHING` — has conflicting secondary sources; a defensive code pattern sidesteps the ambiguity entirely, see Pitfall 1)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Backfill rescoring**
- **D-27:** When a batch inserts readings older than the current time, any *already-scored* existing reading whose 12h trend window (`[timestamp - 12h, timestamp]`) now overlaps one or more of the newly-inserted batch timestamps MUST be rescored — its stored `risk_scores` row may have been computed against an incomplete baseline before the gap was backfilled.
- **D-28:** The rescoring scope is **uncapped** — after inserting a batch spanning `[batch_min, batch_max]`, query all of the device's existing readings with `timestamp` in `[batch_min, batch_max + 12h]` and rescore every one via `computeAndPersistRiskScore`. No row-count cap.
- **D-29:** Within a single batch, readings are sorted by `timestamp` ascending before insert, and each is inserted then scored sequentially in that order.

**Batch endpoint & payload shape**
- **D-30:** New endpoint `POST /api/ingest/batch`. Payload: `{ deviceId: string, readings: [{ timestamp: number, vitals: { heartRate, spo2, temperature, activityScore } } , ...] }`.
- **D-31:** Auth is identical to `POST /api/ingest` (D-05) — `X-API-Key` validated once against the top-level `deviceId` for the whole batch, before any body/array validation.
- **D-32:** The batch is capped at **500 readings per request**; exceeding it returns `400` before any processing.

**Duplicate / replay handling**
- **D-33:** A new **unique constraint on `readings("deviceId", "timestamp")`** is added via migration. Both `POST /api/ingest` (single) and `POST /api/ingest/batch` insert using **upsert with on-conflict-do-nothing** against this constraint.
- **D-34:** When an upsert-ignore hits an existing duplicate (no new row actually inserted), **risk scoring is skipped for that specific reading**. Only newly-inserted rows (and D-27's backfill-affected rows) get scored/rescored.

**Partial-batch failure handling**
- **D-35:** Batch validation is **all-or-nothing**: every item validated before anything is inserted. Any single invalid item → `400` with field-level, array-indexed error body (D-11 shape). Nothing stored.
- **D-36:** The batch is inserted via a **single bulk upsert call**, not a loop of per-row inserts.
- **D-37:** Scoring failures (new-row or backfill-rescore) follow D-24: log server-side and continue — never fail the HTTP response.

### Claude's Discretion
None — all four discussed areas reached explicit user decisions.

### Deferred Ideas (OUT OF SCOPE)
- Capping the backfill-rescore query (e.g. max 200 rows) — explicitly rejected in favor of uncapped rescan (D-28).
- Partial-success (207-style) batch responses — explicitly rejected in favor of all-or-nothing validation (D-35).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ING-03 | Device can POST a batch (array) of buffered offline readings to a dedicated sync endpoint, and each reading is stored with its original device timestamp, not the upload time | Standard Stack, Architecture Patterns (batch route + upsert + backfill), Code Examples, Common Pitfalls sections below fully specify the implementation |
</phase_requirements>

## Summary

This phase extends Phase 1/2's ingest pipeline with a bulk-sync path. No new packages are required — the implementation is a new route handler, a new Zod schema (derived from the existing `IngestSchema` via `.omit()`), one migration adding a composite unique constraint, and a new backfill-rescore query built by exporting the existing `fetchWindow` helper from `src/lib/risk/compute.ts`.

The load-bearing technical finding is that **`supabase-js`'s `.upsert(rows, { onConflict: 'deviceId,timestamp', ignoreDuplicates: true }).select(...)` returns only the rows Postgres actually inserted** — rows skipped via `ON CONFLICT DO NOTHING` never appear in a `RETURNING` result set. This directly answers D-34: the `.select()` response *is* the "newly inserted" set, no `xmax` trick or diffing needed. The one genuinely uncertain area is whether a **single INSERT statement containing two rows that duplicate each other** (not against existing DB rows) is handled gracefully by `ON CONFLICT DO NOTHING` or raises a cardinality-violation error — official Postgres docs only explicitly document the failure mode for `DO UPDATE`, and secondary sources disagree about `DO NOTHING`. The safe, cheap mitigation — deduplicating the batch by `(deviceId, timestamp)` in application code before the single bulk upsert call — sidesteps the ambiguity entirely and is compatible with D-36's "single bulk upsert" requirement (the dedup happens in JS before the one DB round-trip, not via a per-row loop of calls).

Vercel's Hobby (free) tier now defaults to **300s (5 minute) function duration** under Fluid Compute (a major change from the older, widely-quoted 10s Hobby limit — verify this is confirmed at the official docs URL, not older blog posts), which gives D-28's uncapped backfill rescore comfortable headroom even at "a few hundred rows" scale. Request body size is capped at a hard, non-configurable 4.5MB, far above a 500-reading JSON payload (~100KB).

**Primary recommendation:** Build the batch route as: auth (raw-body deviceId extraction, mirroring the single route) → Zod-validate the whole array up front (all-or-nothing) → sort ascending → dedupe by `(deviceId, timestamp)` in JS → one `.upsert(..., { onConflict: 'deviceId,timestamp', ignoreDuplicates: true }).select('id, deviceId, timestamp, heartRate, temperature, activityScore')` → sort the *returned* rows ascending by timestamp again (don't trust upsert response ordering) → score each sequentially (D-29) → compute `[batchMin, batchMax + 12h]` from the full validated batch → export and reuse `fetchWindow` for the backfill query, excluding the batch's own just-scored IDs → rescore each backfill hit, catching and logging all scoring errors (D-37) without failing the response.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Batch auth + payload validation | API / Backend | — | Mirrors existing `/api/ingest` route; stateless per-request check, no session/browser involvement |
| Duplicate rejection (retry safety) | Database / Storage | API / Backend | Enforced at the DB level via a unique constraint (source of truth); API layer only supplies the upsert-ignore intent |
| Backfill rescoring orchestration | API / Backend | Database / Storage | Business logic (which readings need rescoring, in what order) lives in `compute.ts`/route; DB tier only serves the range read and write-back |
| Risk computation | API / Backend | — | Already isolated in `src/lib/risk/compute.ts` (D-25); this phase calls it, does not change its logic |
| Realtime propagation to dashboard | Database / Storage | — | Already wired via `supabase_realtime` publication (Phase 1/2); batch inserts need no new plumbing — every row insert/upsert automatically publishes, satisfying success criterion #4 ("indistinguishable from live") with zero new code |

## Standard Stack

### Core
No new libraries. This phase is implemented entirely with packages already in `package.json`:

| Library | Version (installed) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.116.0 [VERIFIED: npm registry — `npm view @supabase/supabase-js version`] | Bulk `.upsert()` with `onConflict`/`ignoreDuplicates` | Already the project's sole DB client (`src/lib/supabase/admin.ts`); no alternative considered |
| `zod` | 4.6.5 latest, package.json pins `^4.6.2` [VERIFIED: npm registry — `npm view zod version`] | Batch payload schema, array-length cap, per-item validation | Already used for `IngestSchema`; `.omit()` composes the batch item schema without duplicating field definitions |
| `next` | 16.3.5 (pinned exact, matches installed) [VERIFIED: npm registry — `npm view next@16.3.5 version`] | Route handler (`POST`), route segment config (`maxDuration`) | Existing framework; this is the project's custom Next.js AGENTS.md fork — route-segment config (`maxDuration`, `runtime`) confirmed unchanged from mainline Next.js docs shipped in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/{maxDuration,runtime}.md` [VERIFIED: node_modules/next/dist/docs/.../maxDuration.md, runtime.md — read in full this session] |

### Package Legitimacy Audit

**Not applicable — this phase installs no new packages.** All work reuses `@supabase/supabase-js`, `zod`, and `next`, already present and verified in Phases 1/2.

## Architecture Patterns

### System Architecture Diagram

```
ESP32 device (buffered readings, WiFi restored)
        │
        │ POST /api/ingest/batch
        │ { deviceId, readings: [{timestamp, vitals}, ...] }  (≤500 items)
        ▼
┌───────────────────────────────────────────────────────────┐
│ Route handler (src/app/api/ingest/batch/route.ts)          │
│                                                              │
│ 1. Extract raw.deviceId from unparsed JSON body             │
│ 2. Auth: devices lookup (deviceId + X-API-Key)  ──401──▶ reject (no body read yet, timing-safe like Phase 1)
│ 3. Zod-parse full BatchIngestSchema (array ≤500,            │
│    all-or-nothing)                            ──400──▶ reject with indexed field errors (D-35)
│ 4. Sort readings ascending by timestamp (D-29)               │
│ 5. Dedupe by (deviceId, timestamp) in JS (defensive,         │
│    see Pitfall 1) — keep last occurrence                     │
│ 6. ONE bulk upsert:                                          │
│    .upsert(rows, {onConflict:'deviceId,timestamp',           │
│                    ignoreDuplicates:true})                   │
│    .select('id, deviceId, timestamp, heartRate,              │
│             temperature, activityScore')          (D-36)     │
│    → response.data = ONLY newly-inserted rows                │
│      (Postgres RETURNING never includes                      │
│       ON-CONFLICT-DO-NOTHING-skipped rows)                    │
│ 7. Re-sort response.data ascending by timestamp               │
│    (don't trust upsert response row order)                    │
│ 8. For each newly-inserted row, sequentially:                 │
│      try computeAndPersistRiskScore(row)                      │
│      catch → log, continue (D-37)                              │
│ 9. Compute batchMin/batchMax from the FULL validated batch     │
│    (not just newly-inserted subset)                            │
│ 10. fetchWindow(deviceId, batchMin, batchMax + 12h)  (exported │
│     from compute.ts, reused as-is — see Code Examples)         │
│     minus the IDs already scored in step 8                     │
│ 11. For each backfill hit, sequentially:                       │
│       try computeAndPersistRiskScore(hit)                      │
│       catch → log, continue (D-37)                              │
│ 12. Return 201 { status: "ok" } regardless of scoring outcomes │
└───────────────────────────────────────────────────────────┘
        │                                    │
        ▼                                    ▼
  readings table                       risk_scores table
  (unique constraint on                (upserted per reading_id,
   "deviceId","timestamp")              cascades from readings)
        │                                    │
        └──────────── supabase_realtime publication ────────────┐
                                                                  ▼
                                                     Dashboard (existing
                                                     Phase 1/2 subscription —
                                                     no new wiring needed)
```

### Recommended Project Structure
```
src/
├── app/api/ingest/
│   ├── route.ts             # MODIFIED: .insert() → .upsert() + .maybeSingle() (D-33)
│   └── batch/
│       └── route.ts         # NEW: batch sync endpoint
├── lib/
│   ├── validation/
│   │   └── ingest-schema.ts # MODIFIED: export a batch item/array schema alongside IngestSchema
│   └── risk/
│       └── compute.ts       # MODIFIED: export fetchWindow (was module-private)
supabase/migrations/
└── <new-ts>_readings_unique_device_timestamp.sql   # NEW: unique constraint migration
```

### Pattern 1: Batch item schema via `.omit()` (reuse, don't duplicate)

**What:** The batch payload's per-item shape (`{timestamp, vitals}`, no `deviceId`) is exactly `IngestSchema` minus its `deviceId` field.

**When to use:** Any time a bulk endpoint's per-item shape is a strict subset of an existing single-item schema.

```typescript
// src/lib/validation/ingest-schema.ts — ADD to existing file
export const BatchItemSchema = IngestSchema.omit({ deviceId: true });

export const BatchIngestSchema = z.object({
  deviceId: z.string().min(1),
  readings: z.array(BatchItemSchema).min(1).max(500), // D-32 cap enforced here
});

export type BatchIngestPayload = z.infer<typeof BatchIngestSchema>;
```
`.omit()` is Zod's standard object-schema-narrowing method, unchanged across the v3→v4 major version [ASSUMED — standard, stable Zod API; not independently verified against the v4 changelog this session, but the existing codebase already exercises `IngestSchema.safeParse` and `.issues` successfully under the installed 4.6.5, so the object-schema primitives are confirmed working in this exact codebase]. On validation failure, Zod's `.issues[].path` for an item at array index `i` failing on `timestamp` is `["readings", i, "timestamp"]` — this **already satisfies D-35's "field-level error body... indexed by array position"** with zero extra code; return `{ error: "Invalid payload", details: parsed.error.issues }` exactly as the existing single-reading route does (`route.ts:57-60`).

### Pattern 2: Bulk upsert-ignore returns only newly-inserted rows

**What:** `.upsert(rows, { onConflict: 'col1,col2', ignoreDuplicates: true }).select(...)` — the returned `data` array contains only rows Postgres actually inserted.

**Why this is true:** `@supabase/supabase-js` → `@supabase/postgrest-js`'s `upsert()` sets header `Prefer: resolution=ignore-duplicates` and query param `on_conflict=<columns>` [VERIFIED: node_modules/@supabase/postgrest-js/src/PostgrestQueryBuilder.ts:1372,1393,1395 — read this session; exact code: `ignoreDuplicates = false` (param default), `headers.append('Prefer', \`resolution=${ignoreDuplicates ? 'ignore' : 'merge'}-duplicates\`)`, `if (onConflict !== undefined) url.searchParams.set('on_conflict', onConflict)`]. PostgREST translates this into `INSERT ... ON CONFLICT (col1, col2) DO NOTHING RETURNING ...`, and Postgres's own docs state RETURNING never includes conflict-skipped rows: *"Only rows that were successfully inserted or updated will be returned."* [CITED: postgresql.org/docs/current/sql-insert.html].

```typescript
// src/app/api/ingest/batch/route.ts (excerpt)
const { data: insertedRows, error: upsertError } = await supabaseAdmin
  .from("readings")
  .upsert(rowsToInsert, { onConflict: "deviceId,timestamp", ignoreDuplicates: true })
  .select("id, deviceId, timestamp, heartRate, temperature, activityScore");

if (upsertError) {
  return NextResponse.json({ error: "Failed to store batch" }, { status: 500 });
}

// insertedRows now contains ONLY rows Postgres actually inserted (D-34) —
// duplicate-skipped rows are absent, no diffing/xmax trick required.
const newlyInserted = (insertedRows ?? []).sort((a, b) => a.timestamp - b.timestamp);
```

**onConflict column-list syntax with quoted camelCase columns:** the `onConflict` option is a comma-separated string of the *actual DB column names* (`'deviceId,timestamp'`), not a raw SQL fragment — no quoting needed in the JS string itself, consistent with how the existing codebase already passes unquoted `deviceId`/`timestamp` as JS object keys to `.insert()`/`.eq()` even though the underlying columns are SQL-quoted camelCase (`"deviceId"`) in the migration DDL [VERIFIED: supabase/migrations/20260912172701_init.sql:14-15 — `"deviceId" text not null references public.devices(device_id)`, `"timestamp" bigint not null`; and src/app/api/ingest/route.ts:67-73 already sends `{ deviceId, timestamp, ... }` successfully against these same quoted columns]. Postgres resolves the `on_conflict` target by column-list inference against the table's constraints — it does not need to know the constraint's name, only its column set, so it works whether the unique constraint was created via `unique (...)` or `create unique index`.

### Pattern 3: Exporting and reusing `fetchWindow` for the backfill query

**What:** `src/lib/risk/compute.ts`'s private `fetchWindow(deviceId, from, to)` already does exactly what D-28's backfill query needs: a paginated (past PostgREST's 1000-row cap), device-scoped, timestamp-range read.

```typescript
// src/lib/risk/compute.ts — CHANGE: export fetchWindow (currently module-private)
export async function fetchWindow(
  deviceId: string,
  fromTimestamp: number,
  toTimestamp: number
): Promise<WindowRow[]> { /* unchanged body — see full file, lines 73-103 */ }
```
[VERIFIED: src/lib/risk/compute.ts:73-103 — read this session; exact signature `async function fetchWindow(deviceId: string, fromTimestamp: number, toTimestamp: number): Promise<WindowRow[]>`, body already paginates via `.range(from, to)` in `WINDOW_PAGE_SIZE = 1000` chunks and queries `.eq("deviceId", deviceId).lte("timestamp", toTimestamp).gte("timestamp", fromTimestamp)`]

```typescript
// src/app/api/ingest/batch/route.ts (excerpt) — backfill pass
import { fetchWindow, computeAndPersistRiskScore } from "@/lib/risk/compute";
import { TREND_WINDOW_MS } from "@/lib/risk/thresholds";

const batchMin = Math.min(...validatedReadings.map((r) => r.timestamp));
const batchMax = Math.max(...validatedReadings.map((r) => r.timestamp));

const affected = await fetchWindow(deviceId, batchMin, batchMax + TREND_WINDOW_MS);
const alreadyScoredIds = new Set(newlyInserted.map((r) => r.id));

for (const row of affected.filter((r) => !alreadyScoredIds.has(r.id))) {
  try {
    await computeAndPersistRiskScore({ ...row, deviceId }); // fetchWindow's WindowRow lacks deviceId; attach it — single-device batch, so this is always correct
  } catch (err) {
    console.error("Backfill rescore failed for reading", row.id, err);
  }
}
```
`TREND_WINDOW_MS` (already exported from `src/lib/risk/thresholds.ts:38` — `export const TREND_WINDOW_MS = 12 * 60 * 60 * 1000;` [VERIFIED: src/lib/risk/thresholds.ts:38, read this session]) makes `batchMax + TREND_WINDOW_MS` exactly D-28's `batch_max + 12h`, with no magic number duplicated in the route.

**Why `[batch_min, batch_max + 12h]` is the correct range (derivation, not just copied from CONTEXT.md):** a reading's window is `[timestamp - 12h, timestamp]`. That window overlaps the batch's new-data range `[batch_min, batch_max]` exactly when `timestamp - 12h <= batch_max` AND `timestamp >= batch_min` — i.e., `timestamp` in `[batch_min, batch_max + 12h]`. This confirms D-28's formula is the exact algebraic overlap condition, not an approximation — useful for the executor writing a boundary test.

**Why the newly-inserted rows do NOT need to be excluded from the affected query for correctness (only for avoiding redundant work):** `computeAndPersistRiskScore`'s own `prior` filter already excludes any row with `timestamp >= target.timestamp` (or equal timestamp with a higher id) from the baseline computation [VERIFIED: src/lib/risk/compute.ts:140-144 — exact code: `row.timestamp < target.timestamp || (row.timestamp === target.timestamp && row.id < target.id)`]. Since D-36's single bulk upsert inserts the *entire* batch before any scoring begins, every row's window read in step 8 or step 11 already sees the full final DB state — **scoring order therefore has zero effect on the computed result**, only on log/trace readability. D-29's "sorted ascending, sequential" requirement is a locked decision to honor regardless (it mirrors the live-arrival mental model and aids debugging), but implementers should not treat it as a correctness lever — if it's violated by an off-by-one in a future edit, computed scores remain correct; only the "as if inserted live" narrative breaks.

### Anti-Patterns to Avoid
- **Looping single-row upserts for the batch insert:** violates D-36 directly, and reintroduces exactly the N-round-trip cost this phase's bulk-upsert design exists to avoid.
- **Trusting upsert response row order as insertion order:** Postgres/PostgREST give no documented ordering guarantee for a multi-row `RETURNING`; always re-sort client-side before treating "first" as "earliest."
- **Reusing `.single()` after switching `/api/ingest` to upsert-ignore:** `.single()` throws/errors when zero rows are returned, which is now the *expected* outcome for a duplicate-skip retry. Must switch to `.maybeSingle()` (see Pitfall 2).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| "Which rows were actually new vs skipped as duplicates?" | A diff of submitted vs. existing rows, or an `xmax`-based insert/update detector | `.upsert(..., {ignoreDuplicates:true}).select(...)` — response `data` IS the new-rows set | Postgres's own `RETURNING` semantics already exclude conflict-skipped rows; no extra query or column needed (Pattern 2) |
| "Windowed read across possibly >1000 rows" | A new pagination loop for the backfill query | Export and reuse `fetchWindow` from `compute.ts` | Already pagination-safe past PostgREST's `max_rows` cap (Phase 2's Pitfall 1); duplicating this logic risks silently reintroducing the truncation bug in only one of the two call sites |
| Batch item schema | A hand-written duplicate of `{timestamp, vitals: {...}}` | `IngestSchema.omit({ deviceId: true })` | Any future field added to `vitals` in `IngestSchema` (e.g. a v2 feature) automatically propagates to the batch schema with no parallel edit |

**Key insight:** every "hard part" of this phase (dedup-vs-insert detection, windowed pagination, per-item validation) already has a load-bearing implementation from Phase 1/2 that was explicitly built anticipating batch/out-of-order use (D-25, D-26). The phase is almost entirely composition of existing pieces, not new algorithmic work — the main net-new logic is the backfill-scope query and the JS-level pre-dedup safety net.

## Common Pitfalls

### Pitfall 1: In-batch duplicate timestamps and `ON CONFLICT DO NOTHING` — genuinely ambiguous, mitigate defensively

**What goes wrong:** If the same bulk `INSERT ... ON CONFLICT DO NOTHING` statement contains two *proposed* rows that share the same `(deviceId, timestamp)` (not a conflict against an existing DB row, but the two new rows conflicting with **each other**), the behavior is disputed across sources consulted this session:
- Official Postgres docs [CITED: postgresql.org/docs/current/sql-insert.html] state plainly that *"`INSERT` with an `ON CONFLICT DO UPDATE` clause is a 'deterministic' statement... a cardinality violation error will be raised"* — this restriction is explicitly scoped to `DO UPDATE` in the docs' own wording, not stated for `DO NOTHING`.
- Multiple secondary sources (aggregated web search, not a primary Postgres source) [ASSUMED — LOW confidence, conflicting/unverifiable this session] claim the same cardinality-violation error also applies to `DO NOTHING` when the VALUES list itself contains duplicate keys, and recommend deduplicating before the statement.
- No falsification test could be run in this environment (no `psql`, `docker`, or `pg` Node module available locally; the project's live Supabase instance was not queried empirically for this specific mechanic this session — a genuine no-observation gap, not a verified absence).

**Why it happens:** ON CONFLICT's conflict-detection is defined against the arbiter index; whether that detection also fires for two rows proposed in the *same* command (vs. only against rows visible before the command started) is the disputed point.

**How to avoid:** Deduplicate the batch by `(deviceId, timestamp)` in application code (JS `Map` keyed by `` `${timestamp}` `` since deviceId is uniform per batch — keep the last occurrence, or reject the whole batch if strict all-or-nothing purity is preferred) **before** calling `.upsert()`. This is cheap, fully removes dependence on the disputed Postgres behavior, and does not violate D-36 (dedup is a JS-side array transform before the single DB call, not a loop of DB calls).

**Warning signs:** A 500 from the batch route specifically when the submitted array (not the DB) contains two identical `timestamp` values — if this is ever observed in testing, it confirms the pessimistic reading of the ambiguous behavior; the dedup mitigation above prevents it from ever reaching that code path either way.

### Pitfall 2: `/api/ingest`'s existing `.single()` breaks once switched to upsert-ignore (D-33)

**What goes wrong:** The current single-reading route (`src/app/api/ingest/route.ts:65-83`) does `.insert({...}).select(...).single()` and treats `insertError || !insertedReading` as a 500. Once switched to `.upsert({...}, {onConflict:'deviceId,timestamp', ignoreDuplicates:true})`, a duplicate-skip retry legitimately returns **zero rows** from `.select()` — `.single()` will error on zero rows, and the existing `!insertedReading` branch will incorrectly turn a safe idempotent retry into a spurious 500.

**Why it happens:** `.single()` semantically asserts "exactly one row," which was true under plain `.insert()` but is no longer guaranteed once duplicates can be silently ignored.

**How to avoid:** Switch to `.maybeSingle()`. Treat `insertError` as the only failure case; treat `!insertedReading && !insertError` as "duplicate, already stored, no-op" — return the same `201 { status: "ok" }` (the retry succeeded from the device's point of view) and **skip** the `computeAndPersistRiskScore` call for that case (D-34, applied to the single-reading path too, per D-33's explicit note that both routes get this treatment).

**Warning signs:** A retried single-reading POST (same deviceId+timestamp) that previously succeeded now returns 500 instead of 201 after the D-33 migration lands, if this fix is missed.

### Pitfall 3: Unbounded backfill-rescore range from unvalidated timestamps (flagged as an open question, not silently assumed safe)

**What goes wrong:** D-28's uncapped backfill-rescore assumes "a few hundred rows" based on realistic gap sizes ("readings every few minutes, gaps measured in hours" per CONTEXT.md's own reasoning). Neither `IngestSchema` nor the new batch schema validates that `timestamp` values are within any sane bound relative to "now" [VERIFIED: src/lib/validation/ingest-schema.ts:9-18 — the full schema body was read this session; `timestamp: z.number().int()` has no min/max/range check]. A buggy or malicious device sending a batch with `timestamp: 0` (or any far-past value) would make `batchMin` extremely small, and the backfill query `[batchMin, batchMax + 12h]` could sweep the device's *entire* reading history, not "a few hundred rows."

**Why it happens:** D-28 was scoped and reasoned about at demo scale, but no corresponding input-bound was locked as a decision in CONTEXT.md — this is a real gap between the stated assumption and the enforced constraint.

**How to avoid:** Not a locked decision to unilaterally resolve — surface to the planner/user as an explicit open question (see Open Questions below) rather than silently adding an unrequested timestamp bound, since CONTEXT.md's decisions list is exhaustive and this wasn't among them.

**Warning signs:** A test batch with an intentionally ancient timestamp causing the backfill query to visibly scan/rescore far more rows than the batch's realistic span.

### Pitfall 4: Vercel Hobby function-duration assumptions from stale sources

**What goes wrong:** Widely-repeated web content (blog posts, older Stack Overflow-style answers) states Vercel Hobby functions time out at **10 seconds**. The current official docs (last updated 2026-08-24) state Hobby functions default to **300s (5 minutes)** under Fluid Compute, which is enabled by default for new projects [CITED: vercel.com/docs/functions/limitations].

**Why it happens:** Fluid Compute's higher defaults are a relatively recent platform change; search-engine-ranked content has not caught up uniformly.

**How to avoid:** Do not assume the pessimistic 10s figure when reasoning about D-28's uncapped backfill-rescore cost. Do independently confirm (Vercel dashboard → Project Settings → Functions) that Fluid Compute is actually active for *this specific* project — the docs' "enabled by default for new projects" phrasing leaves ambiguity for a project created earlier in Phase 1's timeline [no observation this session — the project's actual Fluid Compute setting was not checked, since it requires a Vercel dashboard/API call outside this session's tool access]. Defensively, set an explicit `export const maxDuration = 60;` (or similar) route segment config on the batch route regardless of the ambient default, per Next.js's documented `maxDuration` mechanism [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/maxDuration.md, read this session — exact syntax `export const maxDuration = 5` sets seconds].

**Warning signs:** A 504 (`FUNCTION_INVOCATION_TIMEOUT`) on a batch request with a large backfill scope — would indicate either Fluid Compute is not active on this project, or `maxDuration` needs raising.

## Code Examples

Verified patterns from official/primary sources, adapted to this codebase's exact conventions:

### Migration: unique constraint with defensive pre-dedup

```sql
-- Defensively remove any pre-existing exact duplicate (deviceId, timestamp)
-- rows before adding the constraint — a no-op if none exist, but required
-- because ALTER TABLE ... ADD CONSTRAINT ... UNIQUE fails immediately if
-- any existing rows violate it (UNIQUE constraints cannot use NOT VALID,
-- unlike foreign-key/check constraints — verification is always immediate).
-- Source: postgresql.org/docs/current/sql-altertable.html [CITED]
delete from public.readings a
using public.readings b
where a.id > b.id
  and a."deviceId" = b."deviceId"
  and a."timestamp" = b."timestamp";

alter table public.readings
  add constraint readings_deviceid_timestamp_key unique ("deviceId", "timestamp");
```
Quoted-camelCase column syntax matches the existing table definition exactly [VERIFIED: supabase/migrations/20260912172701_init.sql:14-15, quoted above]. Note Phase 2 already added a *non-unique* composite index on the same two columns (`readings_deviceid_timestamp_idx` [VERIFIED: supabase/migrations/20260918102702_risk_scores.sql:22-23 — `create index readings_deviceid_timestamp_idx on public.readings ("deviceId", "timestamp");`]); the new unique constraint's implicit index will overlap it. At this project's demo scale the redundant index costs negligible storage — leaving both is safe, but the planner may optionally drop the now-redundant plain index in the same migration since the unique constraint's index serves every query the plain index did.

### Modified single-reading route (D-33 applied to `/api/ingest`)
```typescript
// src/app/api/ingest/route.ts — CHANGE lines 65-83
const { data: insertedReading, error: insertError } = await supabaseAdmin
  .from("readings")
  .upsert(
    { deviceId, timestamp, heartRate: vitals.heartRate, spo2: vitals.spo2,
      temperature: vitals.temperature, activityScore: vitals.activityScore },
    { onConflict: "deviceId,timestamp", ignoreDuplicates: true }
  )
  .select("id, deviceId, timestamp, heartRate, temperature, activityScore")
  .maybeSingle(); // CHANGED from .single() — see Pitfall 2

if (insertError) {
  return NextResponse.json({ error: "Failed to store reading" }, { status: 500 });
}

if (insertedReading) {
  // Only newly-inserted rows get scored (D-34)
  try {
    await computeAndPersistRiskScore(insertedReading);
  } catch (scoringError) {
    console.error("Risk scoring failed for reading", insertedReading.id, scoringError);
  }
}

return NextResponse.json({ status: "ok" }, { status: 201 });
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Vercel Hobby: 10s max function duration | Hobby: 300s default/max under Fluid Compute | Fluid Compute rollout (recent; confirmed via docs dated 2026-08-24) | D-28's uncapped backfill rescore has far more headroom than a "10s Hobby limit" mental model would suggest — do not descope based on the old assumption |

**Deprecated/outdated:**
- The "Vercel free tier times out at 10s" claim: outdated for projects on Fluid Compute (now default for new projects); verify actual project setting rather than assuming either figure.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `ON CONFLICT DO NOTHING` gracefully skips (rather than errors on) two proposed rows in the same INSERT statement that duplicate each other | Pitfall 1 | If wrong and the app-level pre-dedup mitigation is skipped, a batch with an internal duplicate timestamp would 500 instead of the intended graceful skip. Mitigation (JS-level dedup before upsert) already neutralizes this regardless of which way the ambiguity resolves — treat as low-risk given the mitigation is recommended unconditionally |
| A2 | Zod v4's `.omit()` and array-index issue paths (`["readings", i, "field"]`) behave identically to v3 | Pattern 1 | If the array-index path format changed, D-35's field-indexed error body would need adjustment; low risk since this codebase already proves `.issues`/`.safeParse` work as expected under the installed 4.6.5 for the existing single-item schema |
| A3 | Fluid Compute is actually enabled for this specific Vercel project (not just "new projects" generically) | Pitfall 4 | If not enabled, actual Hobby duration could be the older, lower default; mitigated by explicitly setting `maxDuration` regardless, which is a required action either way, not merely a nice-to-have |

**If this table is empty:** N/A — see above; overall confidence remains MEDIUM-HIGH because every assumption has a cheap, unconditional mitigation already folded into the recommended implementation.

## Open Questions

1. **Should batch/single-reading `timestamp` values be bounded relative to "now" to cap D-28's backfill-rescore blast radius?**
   - What we know: D-28 was reasoned about assuming "gaps measured in hours," but no timestamp range validation exists in `IngestSchema` today, and none was locked as a CONTEXT.md decision for this phase.
   - What's unclear: Whether this is in-scope for Phase 3 (tightening validation) or an accepted residual risk for a single-device demo with a trusted device.
   - Recommendation: Surface to the user/planner explicitly rather than assuming either "add a bound" or "leave unbounded" — this is a genuine gap between stated assumption (D-28's rationale) and enforced constraint (schema), not something research should unilaterally decide.

2. **Does `ON CONFLICT DO NOTHING` actually error on in-statement duplicate keys in this project's Postgres version?**
   - What we know: Official docs only explicitly document the failure mode for `DO UPDATE`; secondary sources disagree about `DO NOTHING`.
   - What's unclear: The definitive behavior, since no falsification test could be run in this session (no local Postgres, no `pg` package, live Supabase instance not probed for this specific mechanic).
   - Recommendation: The JS-level pre-dedup mitigation (Pitfall 1) makes this moot for correctness — no action needed beyond including that dedup step in the plan. If the planner wants certainty regardless, a Wave 0 spike test against the live Supabase instance (post-migration) would resolve it definitively at negligible cost.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@supabase/supabase-js` | Batch upsert, `fetchWindow` reuse | ✓ | 2.116.0 | — |
| `zod` | Batch payload schema | ✓ | 4.6.5 (pinned `^4.6.2`) | — |
| Next.js route segment config (`maxDuration`) | Defensive timeout override for backfill rescore | ✓ | Confirmed in `node_modules/next/dist/docs` | — |
| Vercel Fluid Compute (300s Hobby duration) | Headroom for D-28's uncapped rescore | Unconfirmed for this specific project | — | Explicit `maxDuration` route config regardless (see Pitfall 4) |
| Local Postgres / `psql` / `docker` / Node `pg` | Falsifying Pitfall 1's ambiguity directly | ✗ | — | JS-level pre-dedup mitigation (no DB access needed to resolve) |

**Missing dependencies with no fallback:** None — every gap above has a viable fallback already folded into the recommended implementation.

**Missing dependencies with fallback:**
- Local Postgres access for Pitfall 1's falsification test → JS-level dedup sidesteps the need entirely.
- Confirmed Fluid Compute status → explicit `maxDuration` config makes the behavior deterministic regardless of the platform default.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.11 [VERIFIED: package.json:26] |
| Config file | `vitest.config.ts` (loads `.env.local` via `loadEnv`, aliases `@/` to `src/`) |
| Quick run command | `npx vitest run tests/ingest.batch.test.ts` |
| Full suite command | `npm test` (= `vitest run`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ING-03 | Batch POST stores each reading under its original timestamp, not upload time | integration (live Supabase) | `npx vitest run tests/ingest.batch.test.ts -t "original timestamp"` | ❌ Wave 0 |
| ING-03 | Batch capped at 500 — 501st item rejected with 400 before any insert | integration | `npx vitest run tests/ingest.batch.test.ts -t "500"` | ❌ Wave 0 |
| ING-03 | All-or-nothing: one invalid item rejects the whole batch, nothing stored (D-35) | integration | `npx vitest run tests/ingest.batch.test.ts -t "all-or-nothing"` | ❌ Wave 0 |
| ING-03 | Retried batch (duplicate deviceId+timestamp) is a safe no-op, no duplicate rows, no rescoring of unaffected duplicates (D-33/D-34) | integration | `npx vitest run tests/ingest.batch.test.ts -t "duplicate"` | ❌ Wave 0 |
| ING-03 | Backfill rescore: inserting older readings updates an already-scored existing reading's status (D-27/D-28) | integration | `npx vitest run tests/ingest.batch.test.ts -t "backfill"` | ❌ Wave 0 |
| ING-03 | Batch and single-route readings are indistinguishable in storage/downstream queries (success criterion #4) | integration | `npx vitest run tests/ingest.batch.test.ts -t "indistinguishable"` | ❌ Wave 0 |
| ING-03 | `/api/ingest` (single) retry after D-33 migration returns 201 no-op, not 500 (Pitfall 2) | integration | `npx vitest run tests/ingest.route.test.ts -t "duplicate"` | ❌ Wave 0 (extend existing file) |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/ingest.batch.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/ingest.batch.test.ts` — new file, covers ING-03 batch behaviors above
- [ ] `tests/helpers/cleanup.ts` — extend with a range-delete helper (e.g. `deleteReadingsInRange(deviceId, fromTs, toTs)`) since batch tests insert many timestamps at once and the existing `deleteReadingByTimestamp` is single-row; a loop over the existing helper also works but a range helper is cleaner for 500-row test cases
- [ ] `tests/ingest.route.test.ts` — extend with a duplicate-retry case exercising the D-33 upsert change on the single-reading route (Pitfall 2)
- [ ] Migration must land (and `src/lib/supabase/types.ts` regenerate) before any batch test can run, since the unique constraint is required for `onConflict` to have a target

*(All gaps are net-new test coverage for this phase's new behavior — no framework install needed, Vitest is already configured and working.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Static per-device `X-API-Key` header, checked before body parse — identical to Phase 1's D-05/D-10 pattern, reused verbatim (D-31) |
| V3 Session Management | no | Stateless API-key auth, no sessions/cookies involved |
| V4 Access Control | yes | Batch payload's per-item shape carries no per-item `deviceId` (D-30) — every row in a batch is scoped to the single authenticated top-level `deviceId` by construction, preventing a device from spoofing writes under another device's identity within its own batch |
| V5 Input Validation | yes | Zod schema (`BatchIngestSchema`), array bounded to 500 items (D-32), all-or-nothing validation (D-35) |
| V6 Cryptography | no | No new cryptographic operations introduced; API key comparison remains the existing Phase 1 plain equality lookup against `devices.api_key`, unchanged by this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Oversized/unbounded array payload → resource exhaustion | Denial of Service | D-32's 500-item cap enforced both at the schema level (`z.array(...).max(500)`) and expected to reject with 400 *before* any DB work — verify the cap check happens pre-parse-cost-heavy work, not just as a schema constraint that still fully parses 10,000 items before rejecting |
| Replayed/retried batch creating duplicate readings | Tampering (data integrity) | D-33's unique constraint + upsert-ignore-duplicates, enforced at the DB layer (source of truth, not just app-layer idempotency-key tracking) |
| Cross-device spoofing via a crafted per-item `deviceId` in the batch array | Spoofing | Prevented by construction — the batch schema (D-30) has no per-item `deviceId` field at all, so there is no field to spoof; the single top-level `deviceId` is the only one ever written |
| Crafted extreme-past `timestamp` values inflating the uncapped backfill-rescore query (D-28) into a full-table scan | Denial of Service | **Not currently mitigated** — see Open Question 1; flagged, not silently resolved, since no input-bound was among CONTEXT.md's locked decisions |

## Sources

### Primary (HIGH confidence — in-repo source read this session)
- `src/app/api/ingest/route.ts` (full file) — existing auth-before-validate, insert, scoring-isolation pattern
- `src/lib/validation/ingest-schema.ts` (full file) — `IngestSchema` shape to `.omit()` from
- `src/lib/risk/compute.ts` (full file) — `fetchWindow`, `computeAndPersistRiskScore`, `prior` filter logic, pagination-safety comment
- `src/lib/risk/thresholds.ts` (full file) — `TREND_WINDOW_MS`, `BASELINE_MIN_MS` exact values
- `supabase/migrations/20260912172701_init.sql`, `20260918102702_risk_scores.sql` (full files) — existing schema, existing composite index
- `node_modules/@supabase/postgrest-js/src/PostgrestQueryBuilder.ts:1114-1420` — actual installed `.upsert()` implementation (onConflict/ignoreDuplicates → Prefer header/query param mapping)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/{maxDuration,runtime}.md` — this project's exact installed Next.js version's route segment config docs (per AGENTS.md's mandate to read these before writing code)
- `npm view @supabase/supabase-js version`, `npm view zod version`, `npm view next@16.3.5 version` — registry version confirmation

### Secondary (MEDIUM confidence — official external docs, fetched this session)
- postgresql.org/docs/current/sql-insert.html — RETURNING-excludes-conflict-skipped-rows behavior; ON CONFLICT DO UPDATE cardinality violation wording
- postgresql.org/docs/current/sql-altertable.html — ADD CONSTRAINT UNIQUE fails immediately on existing violations (no NOT VALID option for UNIQUE)
- vercel.com/docs/functions/limitations (last updated 2026-08-24) — Hobby plan duration (300s under Fluid Compute), request body size (4.5MB hard cap), memory (2GB)

### Tertiary (LOW confidence — aggregated web search, unresolved conflict)
- Multiple secondary sources on whether `ON CONFLICT DO NOTHING` errors on same-statement duplicate keys — conflicting with each other and not resolved against a primary source or live falsification test this session (see Pitfall 1, Open Question 2)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all versions confirmed against the npm registry and already proven working in this exact codebase
- Architecture: HIGH — every pattern composes existing, already-tested Phase 1/2 code (`fetchWindow`, `computeAndPersistRiskScore`, `IngestSchema`) with source-code-verified behavior for the new upsert mechanism
- Pitfalls: MEDIUM — three of four pitfalls are HIGH confidence (source-verified); Pitfall 1 (in-batch duplicate handling) is explicitly flagged LOW/unresolved with an unconditional mitigation

**Research date:** 2026-09-19
**Valid until:** 30 days (stable stack; re-verify Vercel Fluid Compute status and Zod version if this research is reused past that window)
