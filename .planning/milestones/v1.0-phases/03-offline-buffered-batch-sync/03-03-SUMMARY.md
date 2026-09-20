---
phase: 03-offline-buffered-batch-sync
plan: 03
subsystem: api
tags: [supabase, upsert, idempotency, next.js, vitest]

# Dependency graph
requires:
  - phase: 03-offline-buffered-batch-sync
    provides: "readings_deviceid_timestamp_key live unique constraint (Plan 03-01), used here as the onConflict target"
provides:
  - "POST /api/ingest (single-reading route) upsert-ignore-duplicates semantics matching POST /api/ingest/batch (Plan 03-02), completing D-33/D-34 across both ingest paths"
affects: []

actuals:
  tokens: 994
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Single-reading and batch ingest routes now share identical upsert-ignore-duplicates + maybeSingle() replay-safety semantics against the same (deviceId,timestamp) unique constraint"

key-files:
  created: []
  modified:
    - src/app/api/ingest/route.ts
    - tests/ingest.route.test.ts

key-decisions:
  - "Applied D-33/D-34 to the single-reading route exactly as RESEARCH.md Pitfall 2's Code Example specified: .upsert(..., {onConflict:'deviceId,timestamp', ignoreDuplicates:true}).maybeSingle(), with insertError as the sole failure branch and scoring wrapped in an `if (insertedReading)` guard so a duplicate-skip no-op still returns 201 without invoking computeAndPersistRiskScore"

patterns-established: []

requirements-completed: [ING-03]

coverage:
  - id: D1
    description: "A retried single-reading POST with an identical deviceId+timestamp pair returns 201 as a safe no-op (not 500), and does not create a duplicate row or re-invoke computeAndPersistRiskScore for the no-op case"
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.route.test.ts#returns 201 (not 500) on a retried duplicate deviceId+timestamp POST, storing exactly one row (D-33/D-34)"
        status: pass
    human_judgment: false
  - id: D2
    description: "A fresh (non-duplicate) POST to /api/ingest is unaffected by the upsert change — same 201 response contract and stored fields as before this plan"
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.route.test.ts#returns 201 and persists all fields exactly on a valid POST (ING-01, STOR-01)"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-09-19
status: complete
---

# Phase 3 Plan 03: Single-Route Upsert-Ignore Summary

**Single-reading POST /api/ingest now upsert-ignores duplicate deviceId+timestamp retries via `.upsert(..., {onConflict, ignoreDuplicates:true}).maybeSingle()`, matching the batch route's D-33/D-34 replay-safety contract**

## Performance

- **Duration:** 12 min
- **Started:** 2026-09-19T11:15:00Z (approx.)
- **Completed:** 2026-09-19T11:22:50Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Replaced `.insert({...}).select(...).single()` in `src/app/api/ingest/route.ts` with `.upsert({...}, {onConflict:"deviceId,timestamp", ignoreDuplicates:true}).select(...).maybeSingle()`, so a retried duplicate POST no longer throws on the now-legitimate zero-rows-returned case
- Narrowed the failure check to `insertError` alone; `computeAndPersistRiskScore` is now wrapped in `if (insertedReading)` so a duplicate-skip no-op (`insertedReading === null`, no error) falls straight through to the existing `201 { status: "ok" }` response with scoring skipped (D-34)
- Added a duplicate-retry regression test to `tests/ingest.route.test.ts`: posts a fresh payload (expect 201), replays the identical payload (expect 201, not 500), then confirms exactly one row exists for that timestamp
- Both ingest paths (`POST /api/ingest` and `POST /api/ingest/batch`) now share identical upsert-ignore-duplicates replay-safety semantics against the same `readings_deviceid_timestamp_key` constraint

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply D-33's upsert-ignore fix to the single-reading route and prove duplicate-retry safety** - `d683d4f` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `src/app/api/ingest/route.ts` - `.insert().single()` replaced with `.upsert(..., {onConflict, ignoreDuplicates:true}).maybeSingle()`; scoring guarded by `if (insertedReading)`
- `tests/ingest.route.test.ts` - New duplicate-retry regression test proving 201-no-op-not-500 and exactly-one-row-stored

## Decisions Made
- Followed RESEARCH.md Pitfall 2's Code Example verbatim for the route change (no deviation from the specified `.upsert()`/`.maybeSingle()` shape or the `if (insertedReading)` scoring guard)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

`npm test` (full suite) reproduced the same pre-existing, already-logged `tests/risk.compute.test.ts` failure ("readings sharing an identical timestamp are ordered deterministically by id...") documented in `.planning/phases/03-offline-buffered-batch-sync/deferred-items.md` and STATE.md's blocker list, caused by Plan 03-01's live unique constraint making that test's two-rows-same-timestamp scenario impossible to construct. This failure is outside this plan's `files_modified` scope (`src/app/api/ingest/route.ts`, `tests/ingest.route.test.ts`) and was not introduced or worsened by this plan's changes — confirmed identical to the failure 03-02 already reported. This plan's own new test (`tests/ingest.route.test.ts`'s duplicate-retry case) and all other suites pass independently: 43 passed, 1 known-failed (exempted), 1 skipped, out of 45 total.

## User Setup Required

None - no external service configuration required. Reuses the live `readings_deviceid_timestamp_key` constraint already pushed in Plan 03-01.

## Next Phase Readiness
- Both ingest paths now share identical replay-safety semantics; ING-03 is fully satisfied across all three declaring plans (03-01, 03-02, 03-03).
- Carried-forward blocker (unchanged, already logged by 03-02): `tests/risk.compute.test.ts`'s identical-timestamp test needs a follow-up plan to reconcile D-26's tie-break coverage with D-33's unique constraint.
- No new blockers introduced by this plan.

---
*Phase: 03-offline-buffered-batch-sync*
*Completed: 2026-09-19*

## Self-Check: PASSED

- FOUND: src/app/api/ingest/route.ts (grep confirms `.upsert(`, `.maybeSingle()`, `onConflict: "deviceId,timestamp"`, `ignoreDuplicates: true`)
- FOUND: tests/ingest.route.test.ts (new "returns 201 (not 500) on a retried duplicate deviceId+timestamp POST" test present)
- FOUND: commit d683d4f
- CONFIRMED: `npx vitest run tests/ingest.route.test.ts` — 4 passed, 0 failed
- CONFIRMED: `npm test` — 43 passed, 1 known-and-exempted pre-existing failure (tests/risk.compute.test.ts), 1 skipped, 0 new failures
