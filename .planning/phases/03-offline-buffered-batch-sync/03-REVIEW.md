---
phase: 03-offline-buffered-batch-sync
reviewed: 2026-09-19T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/app/api/ingest/batch/route.ts
  - src/app/api/ingest/route.ts
  - src/lib/risk/compute.ts
  - src/lib/supabase/types.ts
  - src/lib/validation/ingest-schema.ts
  - supabase/migrations/20260919105432_readings_unique_device_timestamp.sql
  - tests/helpers/cleanup.ts
  - tests/ingest.batch.test.ts
  - tests/ingest.route.test.ts
  - tests/risk.compute.test.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-09-19
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Reviewed the batch-sync endpoint, its shared risk-scoring/upsert machinery, the schema/migration backing the new `(deviceId, timestamp)` uniqueness invariant, and the test suite (including the regression-gate rewrite of `risk.compute.test.ts`'s duplicate-timestamp test).

The overall design is sound: sort-then-dedupe-then-bulk-upsert, window-relative (not insertion-order-relative) scoring, and a backfill pass scoped by `[batchMin, batchMax + TREND_WINDOW_MS]` are all correctly derived and match the documented decisions (D-26 through D-37). The `risk.compute.test.ts` rewrite of the same-timestamp tie-break test is a **sound** adaptation, not a suppression — the scenario it used to construct (two readings for one device sharing an exact timestamp) is now genuinely unreachable given the new unique constraint, and the replacement test correctly asserts the DB-level invariant that makes it unreachable instead of asserting nothing.

However, there is one real correctness bug in the batch route's failure-handling: a newly-inserted reading whose *own* initial scoring attempt throws is permanently excluded from the very backfill pass that exists to give affected readings a second chance, because the exclusion set is built from "attempted" rather than "succeeded" IDs. In a system whose stated purpose is resilience through connectivity gaps, this means a transient scoring failure during a batch sync can leave a reading with no `risk_scores` row indefinitely, silently, with no built-in retry. There are also a few quality/robustness gaps (duplicated auth logic across the two routes, missing physiological bounds validation now amplified by 500-row batches, and a device-unscoped test cleanup helper) worth addressing.

## Critical Issues

### CR-01: A newly-inserted reading whose initial risk score fails to persist is excluded from its own request's backfill retry, and may never be scored

**File:** `src/app/api/ingest/batch/route.ts:109-141`

**Issue:** The batch route scores newly-inserted rows first, then builds `alreadyScoredIds` from **all** `newlyInserted` row IDs regardless of whether `computeAndPersistRiskScore` succeeded or threw:

```ts
for (const row of newlyInserted) {
  try {
    await computeAndPersistRiskScore(row);
  } catch (scoringError) {
    console.error("Risk scoring failed for reading", row.id, scoringError);
  }
}
...
const alreadyScoredIds = new Set(newlyInserted.map((r) => r.id));

for (const row of affected) {
  if (alreadyScoredIds.has(row.id)) continue;   // <-- also skips failed attempts
  ...
}
```

Because every newly-inserted row's own timestamp is trivially inside `[batchMin, batchMax]`, it is always present in `affected` (the result of `fetchWindow(deviceId, batchMin, batchMax + TREND_WINDOW_MS)`). The backfill loop is precisely the mechanism that would otherwise give this row a second scoring attempt in the same request — but it is unconditionally skipped via `alreadyScoredIds`, whether or not the first attempt actually wrote a `risk_scores` row.

Net effect: if `computeAndPersistRiskScore` throws for a newly-inserted row (transient DB error, timeout, etc. — exactly the class of failure this offline-sync feature exists to be resilient to), that reading is stored in `readings` but permanently has no corresponding `risk_scores` row, unless some unrelated future batch happens to touch its 12h trend window. For a sepsis-risk monitor, a reading that silently never receives a risk status is a missed-alert / data-loss-class defect, not merely a logging nuisance.

**Fix:** Track successes, not attempts, so a failed initial score is not excluded from this request's own backfill pass:

```ts
const scoredIds = new Set<number>();
for (const row of newlyInserted) {
  try {
    await computeAndPersistRiskScore(row);
    scoredIds.add(row.id);
  } catch (scoringError) {
    console.error("Risk scoring failed for reading", row.id, scoringError);
  }
}

...

const affected = await fetchWindow(
  parsed.data.deviceId,
  batchMin,
  batchMax + TREND_WINDOW_MS
);

for (const row of affected) {
  if (scoredIds.has(row.id)) continue; // only skip rows that actually succeeded
  try {
    await computeAndPersistRiskScore({ ...row, deviceId: parsed.data.deviceId });
  } catch (err) {
    console.error("Backfill rescore failed for reading", row.id, err);
  }
}
```

## Warnings

### WR-01: Auth + JSON-parsing logic is duplicated verbatim between the single and batch ingest routes

**File:** `src/app/api/ingest/route.ts:14-53`, `src/app/api/ingest/batch/route.ts:26-62`

**Issue:** The API-key header check, JSON-parse-with-catch, `bodyDeviceId` extraction, and device lookup query are copy-pasted between the two route handlers almost identically. This is exactly the kind of security-relevant logic where a future edit to one copy (e.g., adding rate limiting, fixing a timing issue, changing the lookup query) and not the other silently reintroduces a divergence between the two endpoints' auth guarantees.

**Fix:** Extract a shared helper, e.g. `src/lib/auth/authenticateDevice.ts`, that both routes call:

```ts
export async function authenticateDevice(request: NextRequest): Promise<
  { ok: true; raw: unknown } | { ok: false; response: NextResponse }
> {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) return { ok: false, response: unauthorized() };

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: badJson() };
  }

  const bodyDeviceId = /* ... */;
  const { data: device } = await supabaseAdmin
    .from("devices")
    .select("device_id")
    .eq("device_id", bodyDeviceId)
    .eq("api_key", apiKey)
    .maybeSingle();

  if (!device) return { ok: false, response: unauthorized() };
  return { ok: true, raw };
}
```

### WR-02: `IngestSchema`/`BatchIngestSchema` accept physiologically impossible values and unbounded strings, and the batch endpoint amplifies the blast radius to 500 rows per request

**File:** `src/lib/validation/ingest-schema.ts:9-36`

**Issue:** `heartRate`, `spo2`, `temperature`, and `activityScore` are validated only as `z.number()` — no range checks (e.g., `spo2` could be `-50` or `500`, `temperature` could be `-40` or `9999`). `deviceId` has `.min(1)` but no upper bound, and `timestamp` is `z.number().int()` with no sane bounds (negative epoch values or absurd future timestamps are accepted). This predates Phase 3 for the single-reading path, but `BatchIngestSchema` reuses the same permissive item schema and now lets a single malformed/misbehaving device push up to 500 such rows in one request, which then feed directly into the risk-scoring baseline math (`mean()`, HR/temp ratio) for that device — degrading the trustworthiness of the fused signal for a health-safety product.

**Fix:** Add bounds appropriate to the domain, e.g.:

```ts
vitals: z.object({
  heartRate: z.number().min(0).max(300),
  spo2: z.number().min(0).max(100),
  temperature: z.number().min(20).max(45),
  activityScore: z.number().min(0),
}),
deviceId: z.string().min(1).max(128),
timestamp: z.number().int().min(0),
```

### WR-03: Test cleanup helper deletes readings by timestamp only, not scoped to a device — a latent cross-device data-loss risk in the shared live test database

**File:** `tests/helpers/cleanup.ts:7-9`

**Issue:**
```ts
export async function deleteReadingByTimestamp(timestamp: number) {
  await supabaseAdmin.from("readings").delete().eq("timestamp", timestamp);
}
```
This deletes **every** device's reading at a given timestamp, not just the device under test. Every current caller happens to only ever use `DEVICE_ID = "nb-001"`, so it is safe today, but the helper itself provides no such guarantee — any future test file that introduces a second device and reuses one of the many `Date.now() + N * DAY_MS` / `Date.now() - N * HOUR_MS` offsets already scattered across `tests/risk.compute.test.ts` and `tests/ingest.batch.test.ts` would silently delete that other device's data (and cascade-delete its `risk_scores`) with no error surfaced. Given the docstring explicitly acknowledges "the shared live Supabase project," this is worth hardening now rather than after it causes a hard-to-diagnose flaky failure.

**Fix:** Require `deviceId` as a parameter and scope the delete:

```ts
export async function deleteReadingByTimestamp(deviceId: string, timestamp: number) {
  await supabaseAdmin.from("readings").delete().eq("deviceId", deviceId).eq("timestamp", timestamp);
}
```
(and update the ~15 call sites across `tests/ingest.route.test.ts` and `tests/risk.compute.test.ts` accordingly).

## Info

### IN-01: `compute.ts`'s same-timestamp tie-break branch is now dead code, but lives only in `compute.ts` with the explanation parked in a test comment

**File:** `src/lib/risk/compute.ts:140-144`, `tests/risk.compute.test.ts:470-504`

**Issue:** The `prior` filter's second disjunct —
```ts
(row.timestamp === target.timestamp && row.id < target.id)
```
— can no longer be true for any single device now that `readings_deviceid_timestamp_key` (unique on `("deviceId","timestamp")`) exists, since `fetchWindow` only ever returns rows for the same `deviceId` as `target`. The regression-gate rewrite of `risk.compute.test.ts` correctly identifies and documents this, but the explanation lives entirely in the test file's comment (lines 470-482) rather than in `compute.ts` itself, where a future reader of the production code has no signal that this branch is intentionally unreachable rather than a live edge case.

**Fix:** Either remove the dead branch, or at minimum mirror a short pointer comment in `compute.ts` next to the filter (e.g., "unreachable per `readings_deviceid_timestamp_key`; see tests/risk.compute.test.ts for the invariant") so the two files don't silently drift out of sync.

### IN-02: Backfill loop's inline comment overstates duplicate-skip rows as a "safe no-op," but they are in fact unconditionally re-scored by the same request's backfill pass

**File:** `src/app/api/ingest/batch/route.ts:109-110, 132-141`

**Issue:** The comment above the first scoring loop states: "a duplicate-skip retry is a safe no-op since nothing about it changed." That's true of the *first* loop (duplicate-skip rows never appear in `newlyInserted`), but such rows are not actually skipped overall — if their timestamp falls in `[batchMin, batchMax + TREND_WINDOW_MS]` (which it always does, since the duplicate's own timestamp is inside the batch's own range), they are unconditionally re-scored by the second (backfill) loop. This isn't incorrect (the upsert-on-`reading_id` in `computeAndPersistRiskScore` is idempotent), just extra work the comment doesn't account for — worth tightening so the comment doesn't mislead a future reader into thinking duplicate-skip rows are scoring-free.

**Fix:** Adjust the comment to something like: "a duplicate-skip retry gets no *initial* score here, but is picked up and idempotently re-scored by the backfill pass below since its timestamp always falls within the batch's own range."

---

_Reviewed: 2026-09-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
