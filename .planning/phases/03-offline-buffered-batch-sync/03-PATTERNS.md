# Phase 3: Offline-Buffered Batch Sync - Pattern Map

**Mapped:** 2026-09-19
**Files analyzed:** 8 (2 new, 4 modified, 1 new migration, 1 new test file + 1 extended)
**Analogs found:** 8 / 8

All analogs below are git-tracked source files (verified: `src/app/api/ingest/route.ts`, `src/lib/validation/ingest-schema.ts`, `src/lib/risk/compute.ts`, `supabase/migrations/*.sql`, `tests/ingest.route.test.ts`, `tests/helpers/cleanup.ts` are ordinary tracked repo files under `src/`, `supabase/`, `tests/` — not a `.gsd/capabilities` mirror).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/api/ingest/batch/route.ts` (new) | route/controller | batch + request-response | `src/app/api/ingest/route.ts` | exact (same auth/validate/insert/score skeleton, batched) |
| `src/app/api/ingest/route.ts` (modified: `.insert()` → `.upsert()` + `.maybeSingle()`) | route/controller | request-response | itself (pre-change version) | exact — in-place upgrade, not a new pattern |
| `src/lib/validation/ingest-schema.ts` (modified: add `BatchItemSchema`, `BatchIngestSchema`) | utility/schema | transform (validation) | itself (`IngestSchema`) | exact — `.omit()` composition of existing schema |
| `src/lib/risk/compute.ts` (modified: export `fetchWindow`) | service | CRUD (read) | itself (`computeAndPersistRiskScore`, currently-private `fetchWindow`) | exact — visibility change only, no logic change |
| `supabase/migrations/<ts>_readings_unique_device_timestamp.sql` (new) | migration | batch (DDL) | `supabase/migrations/20260918102702_risk_scores.sql` | exact — same repo's most recent migration, same quoted-camelCase DDL conventions |
| `src/lib/supabase/types.ts` (regenerated) | config/generated | — | itself (regenerated via existing workflow) | exact — no manual pattern needed, codegen only |
| `tests/ingest.batch.test.ts` (new) | test | request-response / integration | `tests/ingest.route.test.ts` | exact — same describe/afterEach/makeRequest/live-Supabase-assert structure, extended to arrays |
| `tests/helpers/cleanup.ts` (modified: add range-delete helper) | utility/test-helper | CRUD (delete) | itself (`deleteReadingByTimestamp`) | exact — same shape, new range variant |

## Pattern Assignments

### `src/app/api/ingest/batch/route.ts` (route, batch + request-response)

**Analog:** `src/app/api/ingest/route.ts` (full file, 98 lines — already read in full this session)

**Imports pattern** (route.ts lines 1-4):
```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { IngestSchema } from "@/lib/validation/ingest-schema";
import { computeAndPersistRiskScore } from "@/lib/risk/compute";
```
Batch route additionally imports `BatchIngestSchema` from the same schema module, `fetchWindow` from `compute.ts` (once exported), and `TREND_WINDOW_MS` from `@/lib/risk/thresholds`.

**Auth pattern** (route.ts lines 14-53) — copy verbatim, unchanged except the raw-body deviceId is now the top-level batch `deviceId`, not a per-item one (D-31):
```typescript
const apiKey = request.headers.get("x-api-key");
if (!apiKey) {
  return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
}

let raw: unknown;
try {
  raw = await request.json();
} catch {
  return NextResponse.json(
    { error: "Invalid payload", details: [{ message: "Body is not valid JSON" }] },
    { status: 400 }
  );
}

const bodyDeviceId =
  raw && typeof raw === "object" && "deviceId" in raw
    ? String((raw as Record<string, unknown>).deviceId ?? "")
    : "";

const { data: device } = await supabaseAdmin
  .from("devices")
  .select("device_id")
  .eq("device_id", bodyDeviceId)
  .eq("api_key", apiKey)
  .maybeSingle();

if (!device) {
  return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
}
```
This is the auth-before-validate ordering (D-05, D-10, D-31) — reuse exactly; the only difference for the batch route is that `bodyDeviceId`/`device_id` check happens once for the whole array, never per-item.

**Validation pattern** (route.ts lines 55-61, extended for D-35's array-indexed errors):
```typescript
const parsed = BatchIngestSchema.safeParse(raw);
if (!parsed.success) {
  return NextResponse.json(
    { error: "Invalid payload", details: parsed.error.issues },
    { status: 400 }
  );
}
```
Zod's own `.issues[].path` already yields `["readings", i, "field"]` for a per-item failure at array index `i` — no extra bookkeeping needed to satisfy D-35's "indexed by array position" requirement (see RESEARCH.md Pattern 1, verified against Zod 4.6.5 already proven in this codebase).

**Core batch-insert pattern** (RESEARCH.md Pattern 2, verified against `node_modules/@supabase/postgrest-js` and Postgres docs this session — new code, no direct in-repo analog since this is net-new bulk logic):
```typescript
const sorted = [...parsed.data.readings].sort((a, b) => a.timestamp - b.timestamp); // D-29
const dedupMap = new Map<number, typeof sorted[number]>();
for (const r of sorted) dedupMap.set(r.timestamp, r); // Pitfall 1 mitigation
const rowsToInsert = Array.from(dedupMap.values()).map((r) => ({
  deviceId: parsed.data.deviceId,
  timestamp: r.timestamp,
  heartRate: r.vitals.heartRate,
  spo2: r.vitals.spo2,
  temperature: r.vitals.temperature,
  activityScore: r.vitals.activityScore,
}));

const { data: insertedRows, error: upsertError } = await supabaseAdmin
  .from("readings")
  .upsert(rowsToInsert, { onConflict: "deviceId,timestamp", ignoreDuplicates: true })
  .select("id, deviceId, timestamp, heartRate, temperature, activityScore");

if (upsertError) {
  return NextResponse.json({ error: "Failed to store batch" }, { status: 500 });
}

const newlyInserted = (insertedRows ?? []).sort((a, b) => a.timestamp - b.timestamp);
```
Note field mapping (`vitals.heartRate` → `heartRate` column etc.) mirrors route.ts lines 67-73 exactly, just per-array-item instead of once.

**Sequential scoring + D-27/D-28 backfill pattern** (compute.ts's `TargetReading` shape + RESEARCH.md Pattern 3, `TREND_WINDOW_MS` from `src/lib/risk/thresholds.ts:38`):
```typescript
for (const row of newlyInserted) {
  try {
    await computeAndPersistRiskScore(row);
  } catch (scoringError) {
    console.error("Risk scoring failed for reading", row.id, scoringError);
  }
}

const batchMin = Math.min(...parsed.data.readings.map((r) => r.timestamp));
const batchMax = Math.max(...parsed.data.readings.map((r) => r.timestamp));

const affected = await fetchWindow(parsed.data.deviceId, batchMin, batchMax + TREND_WINDOW_MS);
const alreadyScoredIds = new Set(newlyInserted.map((r) => r.id));

for (const row of affected.filter((r) => !alreadyScoredIds.has(r.id))) {
  try {
    await computeAndPersistRiskScore({ ...row, deviceId: parsed.data.deviceId });
  } catch (err) {
    console.error("Backfill rescore failed for reading", row.id, err);
  }
}

return NextResponse.json({ status: "ok" }, { status: 201 });
```
This is the same try/catch-log-continue shape as route.ts lines 87-95 (D-24/D-37), applied per-row in a loop instead of once.

**Route segment config** (Pitfall 4, defensive — no in-repo analog, new for this route):
```typescript
export const maxDuration = 60; // seconds; defensive override regardless of ambient Fluid Compute default
```

---

### `src/app/api/ingest/route.ts` (modified in place)

**Analog:** itself, pre-change (lines 65-83 currently read this session)

**Change required** (D-33, Pitfall 2) — replace `.insert(...).select(...).single()` with:
```typescript
const { data: insertedReading, error: insertError } = await supabaseAdmin
  .from("readings")
  .upsert(
    { deviceId, timestamp, heartRate: vitals.heartRate, spo2: vitals.spo2,
      temperature: vitals.temperature, activityScore: vitals.activityScore },
    { onConflict: "deviceId,timestamp", ignoreDuplicates: true }
  )
  .select("id, deviceId, timestamp, heartRate, temperature, activityScore")
  .maybeSingle(); // CHANGED from .single()

if (insertError) {
  return NextResponse.json({ error: "Failed to store reading" }, { status: 500 });
}

if (insertedReading) {
  // D-34: only newly-inserted rows get scored; a duplicate-skip retry is a no-op
  try {
    await computeAndPersistRiskScore(insertedReading);
  } catch (scoringError) {
    console.error("Risk scoring failed for reading", insertedReading.id, scoringError);
  }
}

return NextResponse.json({ status: "ok" }, { status: 201 });
```
Everything above/below this block (auth, JSON-parse guard, zod-parse) is unchanged from the file already read in full — see route.ts lines 1-64, 97-98.

---

### `src/lib/validation/ingest-schema.ts` (modified)

**Analog:** itself, existing `IngestSchema` (full file, 21 lines, already read in full this session)

**Pattern to append** (RESEARCH.md Pattern 1 — `.omit()` composition, D-30/D-32):
```typescript
export const BatchItemSchema = IngestSchema.omit({ deviceId: true });

export const BatchIngestSchema = z.object({
  deviceId: z.string().min(1),
  readings: z.array(BatchItemSchema).min(1).max(500), // D-32 cap
});

export type BatchIngestPayload = z.infer<typeof BatchIngestSchema>;
```
Keeps `IngestSchema`'s existing shape untouched (lines 9-18) — additive only, matching this file's existing single-export convention.

---

### `src/lib/risk/compute.ts` (modified: visibility only)

**Analog:** itself, `fetchWindow` (currently module-private, lines 73-103, already read in full this session)

**Change required**: prepend `export` to the existing function declaration — no body change:
```typescript
export async function fetchWindow(
  deviceId: string,
  fromTimestamp: number,
  toTimestamp: number
): Promise<WindowRow[]> { /* unchanged body, lines 78-102 */ }
```
Also export the `WindowRow` interface (currently private, lines 45-51) if the batch route needs to type the `affected` array explicitly — otherwise TypeScript infers it fine from the return type alone.

`computeAndPersistRiskScore` (lines 121-198) is called as-is, no modification — its `TargetReading` interface (lines 26-33) is exactly the shape both `newlyInserted` rows and `fetchWindow` rows (with `deviceId` attached) must match.

---

### `supabase/migrations/<ts>_readings_unique_device_timestamp.sql` (new)

**Analog:** `supabase/migrations/20260918102702_risk_scores.sql` (full file, 24 lines, already read in full this session) — most recent migration in the repo, sets the DDL-style/quoting convention to follow.

**Pattern** (quoted camelCase columns per D-09, matching `"deviceId"`/`"timestamp"` usage at `supabase/migrations/20260912172701_init.sql:14-15`):
```sql
-- Defensively remove any pre-existing exact duplicate (deviceId, timestamp)
-- rows before adding the constraint (UNIQUE constraints verify immediately,
-- unlike NOT VALID-capable FK/CHECK constraints).
delete from public.readings a
using public.readings b
where a.id > b.id
  and a."deviceId" = b."deviceId"
  and a."timestamp" = b."timestamp";

alter table public.readings
  add constraint readings_deviceid_timestamp_key unique ("deviceId", "timestamp");
```
Note: this creates an index that overlaps with the existing plain `readings_deviceid_timestamp_idx` from `risk_scores.sql:22-23` — safe to leave both at this project's scale; optionally drop the redundant plain index in the same migration file, following that file's existing `create index ... on public.readings (...)` line as the drop target's exact name.

After this migration lands, regenerate `src/lib/supabase/types.ts` via the same command used in Phases 1/2 (no in-repo command captured this session — follow whatever `npm run` script or `supabase gen types` invocation the existing git history for that file shows).

---

### `tests/ingest.batch.test.ts` (new)

**Analog:** `tests/ingest.route.test.ts` (lines 1-60 read this session; structure clear from that excerpt)

**Pattern to follow** — same imports/fixture/cleanup shape, extended to arrays:
```typescript
import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ingest/batch/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteReadingsInRange } from "./helpers/cleanup"; // new helper, see below

const DEVICE_ID = "nb-001";
const VALID_KEY = process.env.DEVICE_API_KEY!;

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/ingest/batch", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/ingest/batch", () => {
  const ranges: Array<[number, number]> = [];
  afterEach(async () => {
    while (ranges.length) {
      const [from, to] = ranges.pop()!;
      await deleteReadingsInRange(DEVICE_ID, from, to);
    }
  });

  it("stores each reading under its original timestamp, not upload time (ING-03)", async () => {
    // ...build payload, POST via makeRequest, assert via supabaseAdmin.from("readings")
    // exactly as ingest.route.test.ts lines 28-57 do for a single reading
  });
});
```
Cover the ING-03 test map rows from RESEARCH.md's Validation Architecture section: original-timestamp storage, 500-cap rejection, all-or-nothing validation, duplicate/replay no-op, backfill rescore, live/batch indistinguishability.

---

### `tests/helpers/cleanup.ts` (modified: add range helper)

**Analog:** itself, `deleteReadingByTimestamp` (full file, 8 lines, already read in full this session)

**Pattern to append**:
```typescript
export async function deleteReadingsInRange(
  deviceId: string,
  fromTimestamp: number,
  toTimestamp: number
) {
  await supabaseAdmin
    .from("readings")
    .delete()
    .eq("deviceId", deviceId)
    .gte("timestamp", fromTimestamp)
    .lte("timestamp", toTimestamp);
}
```
Same shape (single `supabaseAdmin.from("readings").delete()...` chain, no return value) as the existing `deleteReadingByTimestamp`.

## Shared Patterns

### Auth-before-validate (D-05, D-10, D-31)
**Source:** `src/app/api/ingest/route.ts` lines 14-53
**Apply to:** `src/app/api/ingest/batch/route.ts` — copy verbatim; only the batch's single top-level `deviceId` is checked, never per-item.

### Scoring-failure isolation (D-24, D-37)
**Source:** `src/app/api/ingest/route.ts` lines 87-95
**Apply to:** both the single route's post-upsert scoring call and every scoring call inside the batch route's two loops (newly-inserted pass and backfill-rescore pass) — `try { await computeAndPersistRiskScore(...) } catch (e) { console.error(...); }`, never propagate to the HTTP response.

### Error body shape (D-11, extended by D-35)
**Source:** `src/app/api/ingest/route.ts` lines 30-33, 57-60
**Apply to:** batch route — `{ error: "Invalid payload", details: parsed.error.issues }`; Zod's array-indexed `.issues[].path` (`["readings", i, "field"]`) satisfies D-35 with zero extra code.

### Upsert-ignore-duplicates + `.maybeSingle()`/array-select (D-33, D-34, Pitfall 2)
**Source:** RESEARCH.md Pattern 2, applied identically to both `src/app/api/ingest/route.ts` (single, `.maybeSingle()`) and `src/app/api/ingest/batch/route.ts` (array, `.select(...)` without `.single()`)
**Apply to:** any insert path touching `readings` — always `.upsert(row(s), { onConflict: "deviceId,timestamp", ignoreDuplicates: true })`, never plain `.insert()`.

### Quoted camelCase DB columns (D-09)
**Source:** `supabase/migrations/20260912172701_init.sql:14-15`, `supabase/migrations/20260918102702_risk_scores.sql`
**Apply to:** the new migration's `"deviceId"`/`"timestamp"` constraint definition.

## No Analog Found

None — every file in scope has a direct in-repo analog (mostly itself, pre-change) or a fully-specified, source-verified new pattern from RESEARCH.md (the bulk-upsert and backfill-query blocks, which are net-new composition of existing pieces rather than files needing an external analog).

## Metadata

**Analog search scope:** `src/app/api/ingest/`, `src/lib/validation/`, `src/lib/risk/`, `supabase/migrations/`, `tests/`
**Files scanned:** `src/app/api/ingest/route.ts`, `src/lib/validation/ingest-schema.ts`, `src/lib/risk/compute.ts`, `supabase/migrations/20260912172701_init.sql`, `supabase/migrations/20260918102702_risk_scores.sql`, `tests/ingest.route.test.ts`, `tests/helpers/cleanup.ts` — all read in full this session; RESEARCH.md's already-verified `node_modules` and Postgres-doc citations reused for the two genuinely-new code blocks (bulk upsert, backfill query).
**Pattern extraction date:** 2026-09-19
