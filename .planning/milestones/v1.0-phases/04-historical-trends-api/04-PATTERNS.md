# Phase 4: Historical Trends API - Pattern Map

**Mapped:** 2026-09-19  
**Files analyzed:** 2  
**Analogs found:** 2 / 2

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/api/readings/route.ts` | route | request-response | `src/app/api/ingest/route.ts` | role-match |
| `tests/readings.route.test.ts` | test | request-response / CRUD | `tests/ingest.route.test.ts` | exact |

`tests/helpers/cleanup.ts` is already sufficient: its range deletion deletes parent `readings`, whose `risk_scores` rows cascade-delete. Do not modify it unless test-fixture requirements expose a concrete gap.

## Pattern Assignments

### `src/app/api/readings/route.ts` (route, request-response)

**Primary analog:** `src/app/api/ingest/route.ts` (tracked source)

**Imports and Route Handler export** (lines 1-4, 14):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
```

Use the same alias and `NextRequest`/`NextResponse` convention, but export `GET`. Read query values with `request.nextUrl.searchParams`; this public route must validate them before it touches `supabaseAdmin`, because that client bypasses RLS.

**Public JSON response pattern** (lines 16-20, 86-90, 109):

```typescript
return NextResponse.json(
  { error: "Invalid or missing API key" },
  { status: 401 }
);

if (insertError) {
  return NextResponse.json(
    { error: "Failed to store reading" },
    { status: 500 }
  );
}

return NextResponse.json({ status: "ok" }, { status: 201 });
```

Return fixed public JSON error bodies, never raw Supabase errors. For this endpoint, attach `{ headers: { "Cache-Control": "no-store" } }` to **every** response (successful and error) and use the locked status/body contracts: field-specific 400, exact `{ error: "Device not found" }` 404, and exact `{ error: "Unable to load reading history" }` 500.

**Server-only diagnostic logging** (lines 97-106):

```typescript
try {
  await computeAndPersistRiskScore(insertedReading);
} catch (scoringError) {
  console.error(
    "Risk scoring failed for reading",
    insertedReading.id,
    scoringError
  );
}
```

Follow the same boundary: diagnostics stay in `console.warn` for invalid query input during development and `console.error` for unexpected database failures; clients receive only the safe fixed message. Do not log secrets or send the caught error over HTTP.

**Pagination analog:** `src/lib/risk/compute.ts` (tracked source), lines 65-102:

```typescript
const WINDOW_PAGE_SIZE = 1000;

const rows: WindowRow[] = [];
let from = 0;

for (;;) {
  const to = from + WINDOW_PAGE_SIZE - 1;
  const { data: page, error } = await supabaseAdmin
    .from("readings")
    .select("id, timestamp, heartRate, temperature, activityScore")
    .eq("deviceId", deviceId)
    .lte("timestamp", toTimestamp)
    .gte("timestamp", fromTimestamp)
    .order("timestamp", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) throw error;

  const pageRows = (page ?? []) as WindowRow[];
  rows.push(...pageRows);

  if (pageRows.length < WINDOW_PAGE_SIZE) break;
  from += WINDOW_PAGE_SIZE;
}
```

Copy this complete-page loop locally in the new route, changing the selected columns to the public vitals plus `risk_scores(status, breakdown)`. Filter `.eq("deviceId", "nb-001")`, use inclusive `.gte("timestamp", from)` / `.lte("timestamp", to)`, and preserve ascending original-`timestamp` order. Do **not** use an inner embedded join: optional `risk_scores` must map to `risk: null`. Do not leak IDs or `created_at`; map a dedicated nested DTO.

**Embedded relationship analog:** `tests/risk.compute.test.ts` (tracked source), lines 661-677:

```typescript
const { data: rangeRows, error } = await supabaseAdmin
  .from("readings")
  .select("timestamp, risk_scores(status, breakdown)")
  .eq("deviceId", DEVICE_ID)
  .gte("timestamp", timestamps[1])
  .lte("timestamp", timestamps[2])
  .order("timestamp", { ascending: true });

for (const row of rangeRows ?? []) {
  const nested = row.risk_scores as unknown as { status: string; breakdown: unknown } | null;
  expect(nested).not.toBeNull();
}
```

This proves the schema's generated one-to-one `risk_scores` relationship is selected from `readings`. The handler should accept the nullable nested value and map it to `risk: null` when missing, rather than relying on this test's non-null assertion.

---

### `tests/readings.route.test.ts` (test, request-response / CRUD)

**Primary analog:** `tests/ingest.route.test.ts` (tracked source)

**Direct handler integration-test setup** (lines 1-26):

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ingest/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteReadingByTimestamp } from "./helpers/cleanup";

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/ingest", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/ingest — valid submissions and storage integrity", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
  });
```

Keep the Vitest/`NextRequest` direct-handler setup. Adapt the request helper to construct a `GET` URL with `deviceId`, `from`, and `to`; import `GET` from the new route. The route test suite uses the live project through the same environment setup, rather than a mocked database.

**Range-fixture cleanup pattern:** `tests/ingest.batch.test.ts` (tracked source), lines 40-48:

```typescript
describe("POST /api/ingest/batch", () => {
  const ranges: Array<[number, number]> = [];

  afterEach(async () => {
    while (ranges.length) {
      const [from, to] = ranges.pop()!;
      await deleteReadingsInRange(DEVICE_ID, from, to);
    }
  });
```

For the 8 daily reading fixture spanning seven continuous days, record a padded `[from, to]` range before writes and use `deleteReadingsInRange`. It prevents persistent data in the shared test project; deleting readings cascades to their paired scores.

**Response and field-specific error assertions** (lines 38-57, 114-120):

```typescript
const res = await POST(makeRequest(payload, { "x-api-key": VALID_KEY }));
expect(res.status).toBe(201);
const json = await res.json();
expect(json).toEqual({ status: "ok" });

expect(res.status).toBe(400);
const json = await res.json();
expect(json.error).toBe("Invalid payload");
const paths = json.details.map((d: { path: unknown[] }) => d.path.join("."));
expect(paths.some((p: string) => p.includes("heartRate"))).toBe(true);
```

Assert the complete success envelope, exact device-not-found and safe-500 bodies, header `cache-control: no-store`, ascending timestamp array, nested vitals/risk data, `risk: null`, and empty valid ranges. For each invalid query input, assert `400` and the stable field-specific error message; spy on console warnings only where the environment condition makes diagnostic logging applicable.

## Shared Patterns

### Server-only Supabase boundary

**Source:** `src/lib/supabase/admin.ts` (tracked source), lines 1-18.

```typescript
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server-only.
 *
 * This module must NEVER be imported by any file carrying a "use client"
 * directive (directly or transitively). Doing so would leak
 * SUPABASE_SERVICE_ROLE_KEY into the client bundle.
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

Apply only in the server route. Since it bypasses RLS, exact `nb-001` validation must precede the query; no arbitrary device ID may be passed through.

### Original-timestamp range and embedded score relationship

**Sources:** `src/lib/risk/compute.ts:73-102`; `tests/risk.compute.test.ts:661-677`.

Use `readings` as the parent relation, timestamp filters inclusive of requested endpoints, `timestamp` ascending order, and an ordinary (not inner) embedded `risk_scores(status, breakdown)` selection. Existing database types declare `risk_scores.reading_id` as a one-to-one relationship to `readings`; use it to pair persisted data, not to recalculate risk.

### Live Supabase test hygiene

**Source:** `tests/helpers/cleanup.ts:17-28`.

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

Use a unique future or isolated timestamp block and always remove it in `afterEach`. The migration's `ON DELETE CASCADE` cleans `risk_scores` at the same time.

## No Analog Found

| File | Role | Data Flow | Reason / planner direction |
|---|---|---|---|
| None | — | — | Existing ingestion route, pagination helper, embedded-join test, and route integration tests cover all Phase 4 responsibilities. |

## Metadata

**Analog search scope:** `src/app/api`, `src/lib/risk`, `src/lib/supabase`, `tests`, `supabase/migrations`  
**Files scanned:** 12  
**Pattern extraction date:** 2026-09-19
