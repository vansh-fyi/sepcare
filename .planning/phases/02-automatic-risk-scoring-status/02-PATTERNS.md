# Phase 2: Automatic Risk Scoring & Status - Pattern Map

**Mapped:** 2026-09-18
**Files analyzed:** 7 (1 new migration, 1 new lib module, 1 optional constants module, 1 extended route, 1 regenerated types file, 1 new test file, 2 extended test files)
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `supabase/migrations/<ts>_risk_scores.sql` | migration | CRUD (DDL) | `supabase/migrations/20260912172701_init.sql` | exact |
| `src/lib/risk/compute.ts` | service | CRUD (read window + upsert) | `src/app/api/ingest/route.ts` (query/insert style) + `src/lib/supabase/admin.ts` (client) | role-match (no existing `src/lib/*` service module exists yet; route handler is the closest data-access precedent) |
| `src/lib/risk/thresholds.ts` (optional) | config | — | `src/lib/validation/ingest-schema.ts` (constants/shape module style) | partial-match |
| `src/app/api/ingest/route.ts` | controller (route) | request-response | itself (extended in place) | exact |
| `src/lib/supabase/types.ts` | config (generated) | — | itself (regenerated, not hand-edited) | exact |
| `tests/risk.compute.test.ts` | test | CRUD (integration, live Supabase) | `tests/ingest.route.test.ts` | exact |
| `tests/ingest.route.test.ts` (extended) | test | request-response | itself | exact |
| `tests/helpers/cleanup.ts` (possibly extended) | utility | CRUD | itself | exact |

## Pattern Assignments

### `supabase/migrations/<new-timestamp>_risk_scores.sql` (migration)

**Analog:** `supabase/migrations/20260912172701_init.sql` (full file, 30 lines, read in full above)

**Table + RLS + Realtime pattern** (lines 11-30 of analog):
```sql
create table public.readings (
  id bigint generated always as identity primary key,
  "deviceId" text not null references public.devices(device_id),
  "timestamp" bigint not null,        -- epoch ms, D-02
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
using ("deviceId" = 'nb-001');

alter publication supabase_realtime add table public.readings;
```

**What to copy for `risk_scores`:** the exact three-move sequence (`enable row level security` → `create policy ... to anon using ("deviceId" = 'nb-001')` → `alter publication supabase_realtime add table ...`), quoted camelCase column naming convention (`"deviceId"`, matches wire vocabulary per Phase 1 D-09), and the `created_at timestamptz not null default now()` trailing column. RESEARCH.md's Code Examples section already has the exact new-table DDL synthesized from this analog (reading_id as PK + FK on delete cascade, status text+check, breakdown jsonb) plus the new composite index on `readings("deviceId","timestamp")` — use that as the concrete starting SQL, not just this pattern description.

**No `id bigint generated always as identity primary key` for risk_scores** — deviates intentionally from the `readings` pattern per RESEARCH.md's primary recommendation: `reading_id` (FK to `readings.id`) is itself the primary key, not a surrogate id.

---

### `src/lib/risk/compute.ts` (service, new)

**No direct analog exists** — this is the first file in `src/lib/`'s "business logic" tier (as opposed to `src/lib/supabase/` config or `src/lib/validation/` schemas). Closest structural precedents, combined:

**Analog 1 — Supabase client usage:** `src/lib/supabase/admin.ts` (full file, 19 lines, read in full above)
```typescript
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```
`compute.ts` imports this same singleton (`import { supabaseAdmin } from "@/lib/supabase/admin"`) — never constructs its own client. This is the sole service-role writer for `risk_scores`, matching the module-doc comment's stated invariant ("only this module constructs a service-role client... sole place device-credential checks and writes... are allowed").

**Analog 2 — query/insert/error style:** `src/app/api/ingest/route.ts` lines 40-71
```typescript
const { data: device } = await supabaseAdmin
  .from("devices")
  .select("device_id")
  .eq("device_id", bodyDeviceId)
  .eq("api_key", apiKey)
  .maybeSingle();
...
const { error: insertError } = await supabaseAdmin.from("readings").insert({
  deviceId,
  timestamp,
  heartRate: vitals.heartRate,
  spo2: vitals.spo2,
  temperature: vitals.temperature,
  activityScore: vitals.activityScore,
});

if (insertError) {
  return NextResponse.json({ error: "Failed to store reading" }, { status: 500 });
}
```
Copy the `.eq(...)`-chained query style and the `{ data, error }` / `{ error }` destructuring-and-check-immediately convention. `compute.ts`'s window read follows the same `.eq("deviceId", ...).lte("timestamp", ...).gte("timestamp", ...).order("timestamp", { ascending: true })` shape (already given verbatim in RESEARCH.md Pattern 1) and the final write is `supabaseAdmin.from("risk_scores").upsert({...})` using the identical `{ error }` check-and-throw idiom (throw instead of return-response, since this is a plain function, not a route handler — the route's try/catch, per D-24, converts a throw into a log-only no-op).

**Core windowed-computation pattern:** use RESEARCH.md's Pattern 1 (Timestamp-Relative Window Query) verbatim — already cites exact `.lte`/`.gte`/`.order` calls and the cold-start-detection trick reusing the window's own earliest timestamp. No separate analog needed; this is new domain logic (D-12–D-18), not a copy-paste of existing code.

**Function signature convention:** match `IngestSchema`'s TypeScript export style in `src/lib/validation/ingest-schema.ts` line 20 (`export type IngestPayload = z.infer<typeof IngestSchema>`) — i.e., export both the function and any supporting TypeScript interface (see RESEARCH.md's `RiskBreakdown` interface in Code Examples) as named exports from the module, JSDoc comment block at the top explaining the D-reference rules being encoded, mirroring the route's own JSDoc block style (route.ts lines 5-12).

---

### `src/lib/risk/thresholds.ts` (optional, config)

**Analog:** `src/lib/validation/ingest-schema.ts` (full file, 21 lines, read in full above) — for the "small typed module with JSDoc explaining the locked decision it encodes" convention:
```typescript
import { z } from "zod";

/**
 * Validates the nested ingest payload shape locked by CONTEXT.md D-01:
 *   { deviceId, timestamp, vitals: { heartRate, spo2, temperature, activityScore } }
 *
 * `timestamp` is Unix epoch milliseconds as an integer (D-02), not an ISO string.
 */
export const IngestSchema = z.object({ ... });
export type IngestPayload = z.infer<typeof IngestSchema>;
```
For `thresholds.ts`, mirror the doc-comment-cites-decision-ID convention (e.g. `/** D-13: temp ≥ 38.0°C or < 35.5°C is abnormal. D-15: 12h rolling window. D-18: 1h baseline threshold. */`) and export plain named `const` values (`TEMP_HIGH_C = 38.0`, `TEMP_LOW_C = 35.5`, `TWELVE_HOURS_MS`, `ONE_HOUR_MS`) rather than a zod schema — no validation is needed here since these are internal constants, not external input.

---

### `src/app/api/ingest/route.ts` (controller, extended in place)

**Analog:** itself — read in full above (81 lines). This file is both source and its own pattern reference for the extension.

**Existing insert to modify** (lines 64-78):
```typescript
const { error: insertError } = await supabaseAdmin.from("readings").insert({
  deviceId,
  timestamp,
  heartRate: vitals.heartRate,
  spo2: vitals.spo2,
  temperature: vitals.temperature,
  activityScore: vitals.activityScore,
});

if (insertError) {
  return NextResponse.json(
    { error: "Failed to store reading" },
    { status: 500 }
  );
}

return NextResponse.json({ status: "ok" }, { status: 201 });
```

**Required minimal change (per RESEARCH.md Pitfall 2 + Pattern 2):** add `.select("id, deviceId, timestamp, heartRate, temperature, activityScore").single()` to the insert chain to get the generated `id` back, then insert the new scoring call between the insert-error check and the final `return`:
```typescript
try {
  await computeAndPersistRiskScore(insertedReading);
} catch (scoringError) {
  console.error("Risk scoring failed for reading", insertedReading.id, scoringError);
}

return NextResponse.json({ status: "ok" }, { status: 201 });
```
This follows the file's existing try/catch-free-but-error-checked style for the insert (destructure-and-check) combined with a genuine try/catch only around the new scoring call — matching D-24's "log, don't fail the request" requirement. Import `computeAndPersistRiskScore` from `@/lib/risk/compute` using the same `@/lib/...` path-alias convention already used for `@/lib/supabase/admin` and `@/lib/validation/ingest-schema` (route.ts lines 2-3).

---

### `tests/risk.compute.test.ts` (new, integration test)

**Analog:** `tests/ingest.route.test.ts` (full file, 92 lines, read in full above)

**Structure to copy:**
```typescript
import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ingest/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteReadingByTimestamp } from "./helpers/cleanup";

const DEVICE_ID = "nb-001";
const VALID_KEY = process.env.DEVICE_API_KEY!;

describe("...", () => {
  const insertedTimestamps: number[] = [];
  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts); // cascades to risk_scores via ON DELETE CASCADE
    }
  });

  it("...", async () => {
    const timestamp = Date.now() + 1;
    insertedTimestamps.push(timestamp);
    // ... insert synthetic reading(s) directly via supabaseAdmin to build a 12h history,
    // then call computeAndPersistRiskScore directly (not via POST) for pure unit-style
    // coverage of D-12 through D-18's threshold/trend/breadth-gating math, and separately
    // assert via supabaseAdmin.from("risk_scores").select(...).eq("reading_id", ...) that
    // the persisted row matches expectations (status + breakdown jsonb).
  });
});
```
Copy the `describe`/`afterEach`/`insertedTimestamps` cleanup-array idiom exactly — this is the established pattern across all three existing test files (`ingest.route.test.ts` lines 18-26, `realtime.subscribe.test.ts` lines 80-89 uses `afterAll` variant). Because `risk_scores.reading_id` cascades on delete (RESEARCH.md D-19/Pitfall 3), no separate `risk_scores` cleanup call is needed if the migration is built as specified.

**Assertion style** (from `ingest.route.test.ts` lines 43-57):
```typescript
const { data, error } = await supabaseAdmin
  .from("readings")
  .select("deviceId, timestamp, heartRate, spo2, temperature, activityScore")
  .eq("timestamp", timestamp)
  .maybeSingle();

expect(error).toBeNull();
expect(data).toEqual({ ... });
```
Use the identical `{ data, error }` destructure + `expect(error).toBeNull()` + `expect(data).toEqual(...)` idiom for `risk_scores` row assertions.

---

### `tests/ingest.route.test.ts` (extended)

**Analog:** itself. Add one new assertion block to the existing "returns 201 and persists all fields exactly on a valid POST" test (lines 28-58) — after the existing `readings` assertion (lines 43-57), add a parallel `risk_scores` query/assert block confirming RISK-03 (a row now exists with no manual trigger), following the exact same `{ data, error } = await supabaseAdmin.from(...).select(...).eq(...).maybeSingle()` shape.

---

### `tests/helpers/cleanup.ts` (possibly extended)

**Analog:** itself (full file, 10 lines, read in full above)
```typescript
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function deleteReadingByTimestamp(timestamp: number) {
  await supabaseAdmin.from("readings").delete().eq("timestamp", timestamp);
}
```
If `ON DELETE CASCADE` is implemented on `risk_scores.reading_id` (per RESEARCH.md's Don't Hand-Roll recommendation), **no change is needed here** — the existing single function continues to work unmodified for both tables. Only add a second exported function (matching this file's one-function-per-concern style) if the executor deviates from the cascade recommendation.

---

## Shared Patterns

### Supabase service-role client usage
**Source:** `src/lib/supabase/admin.ts` (full file)
**Apply to:** `src/lib/risk/compute.ts`, any new test helpers
```typescript
import { supabaseAdmin } from "@/lib/supabase/admin";
```
Never construct a second client; never import this module from client-side code.

### Query error handling (`{ data, error }` destructure-and-check)
**Source:** `src/app/api/ingest/route.ts` lines 40-45, 64-78
**Apply to:** `compute.ts`'s window read and upsert; all new test assertions
```typescript
const { data, error } = await supabaseAdmin.from(table).select(...)...;
if (error) { /* throw (in compute.ts) or return NextResponse.json({error:...}, {status}) (in route) */ }
```

### Migration file: table + RLS + Realtime, three-move sequence
**Source:** `supabase/migrations/20260912172701_init.sql` lines 22-30
**Apply to:** `supabase/migrations/<new>_risk_scores.sql`
```sql
alter table public.<table> enable row level security;
create policy "anon read-only single device"
on public.<table>
for select
to anon
using ("deviceId" = 'nb-001');
alter publication supabase_realtime add table public.<table>;
```

### Quoted camelCase columns matching wire vocabulary
**Source:** `supabase/migrations/20260912172701_init.sql` lines 12-20 (`"deviceId"`, `"timestamp"`, `"heartRate"`, `"activityScore"`)
**Apply to:** `risk_scores."deviceId"` column (per D-22's denormalization decision — copied from the source reading at write time so the RLS policy stays a simple literal comparison)

### Path-alias imports (`@/lib/...`)
**Source:** `src/app/api/ingest/route.ts` lines 1-3
**Apply to:** every new/modified TS file — `@/lib/risk/compute`, `@/lib/risk/thresholds`, `@/lib/supabase/admin`

### Test cleanup idiom (`insertedTimestamps` array + afterEach/afterAll pop-and-delete)
**Source:** `tests/ingest.route.test.ts` lines 18-26; `tests/realtime.subscribe.test.ts` lines 80-89
**Apply to:** `tests/risk.compute.test.ts`

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/risk/compute.ts` core threshold/trend/breadth-gating math (D-12–D-18) | service | transform | No prior computational/business-logic module exists in this codebase yet — Phase 1 is pure ingest/passthrough with zero derived-value computation. Use RESEARCH.md's Pattern 1, Code Examples (`RiskBreakdown` interface), and `context/implementation-plans/neonatal-sepsis-armband.md` §7.1.1 as the source of truth for the math itself; use the analogs above only for surrounding code style (imports, client usage, error handling). |

## Metadata

**Analog search scope:** `src/app/api/`, `src/lib/`, `supabase/migrations/`, `tests/` (all git-tracked files in these directories)
**Files scanned:** 11 (all tracked files under the searched directories, verified via `git ls-files`)
**Pattern extraction date:** 2026-09-18
