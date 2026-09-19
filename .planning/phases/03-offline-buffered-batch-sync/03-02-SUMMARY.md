---
phase: 03-offline-buffered-batch-sync
plan: 02
subsystem: api
tags: [nextjs, zod, supabase, upsert, batch-sync]

requires:
  - phase: 03-offline-buffered-batch-sync
    provides: "readings(\"deviceId\",\"timestamp\") unique constraint, live on Supabase (Plan 03-01), used as this plan's upsert onConflict target"
provides:
  - "POST /api/ingest/batch: auth -> all-or-nothing validate -> sort+dedupe -> single bulk upsert-ignore-duplicates -> sequential score -> backfill rescore -> 201"
  - "BatchItemSchema/BatchIngestSchema/BatchIngestPayload exported from src/lib/validation/ingest-schema.ts"
  - "fetchWindow/WindowRow exported from src/lib/risk/compute.ts for backfill-query reuse"
  - "deleteReadingsInRange test helper for range-based cleanup"
affects: [04-historical-trend-queries]

actuals:
  tokens: 5871
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "JS-level Map-keyed pre-dedup by timestamp before a single bulk upsert, sidestepping the disputed ON CONFLICT DO NOTHING same-statement-duplicate ambiguity"
    - "Backfill-rescore range derived algebraically as [batch_min, batch_max + TREND_WINDOW_MS] from the 12h trend-window overlap condition"

key-files:
  created:
    - src/app/api/ingest/batch/route.ts
    - tests/ingest.batch.test.ts
    - .planning/phases/03-offline-buffered-batch-sync/deferred-items.md
  modified:
    - src/lib/validation/ingest-schema.ts
    - src/lib/risk/compute.ts
    - tests/helpers/cleanup.ts

key-decisions:
  - "Added deleteReadingsInRange to tests/helpers/cleanup.ts during Task 1 (not Task 2 as the plan's task split implied), since Task 1's own multi-timestamp/shuffled-order test already needed range-based cleanup — no functional difference, Task 2 simply reuses it."
  - "Deferred (not fixed) a pre-existing tests/risk.compute.test.ts failure caused by Plan 03-01's live unique-constraint migration — out of this plan's declared file scope, reproduced identically before any 03-02 change, logged to deferred-items.md per the executor's scope-boundary rule."

patterns-established:
  - "Bulk upsert-ignore-duplicates + re-sort-after-select for any future batch insert path (never trust upsert response row order)"

requirements-completed: [ING-03]

coverage:
  - id: D1
    description: "POST /api/ingest/batch stores each reading under its own submitted timestamp value, never the server's request-time \"now\""
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.batch.test.ts#stores each reading under its own submitted timestamp, never the server's request-time now (ING-03)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Batch-inserted readings/risk_scores rows are indistinguishable in shape/columns from a live single-reading POST (Roadmap success criterion #4)"
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.batch.test.ts#produces risk_scores rows with the same column set as the single-reading route (Roadmap success criterion #4)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Inserting a batch of older readings triggers a rescore of every existing, already-scored reading whose 12h trend window overlaps the batch's new-data range (D-27/D-28)"
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.batch.test.ts#backfill-rescores an already-scored existing reading whose 12h window overlaps a batch of older readings (D-27/D-28)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Readings within a single batch are sorted ascending by timestamp before insert, and each newly-inserted row is scored sequentially in that order (D-29)"
    requirement: "ING-03"
    verification: []
    human_judgment: true
    rationale: "route.ts implements the sort-then-sequential-for-loop structure exactly as D-29 specifies (verified by code inspection); no dedicated test asserts scoring call order itself, since D-29's own RESEARCH.md derivation proves scoring order has zero effect on the final computed result (see D10 backstop below) — only the shuffled-input-order test (D1) exercises this code path end-to-end."
  - id: D5
    description: "A batch with two readings sharing an identical timestamp is deduplicated in JS to exactly one row (last occurrence, ascending-sorted), never averaging the two submitted values (dedup-fidelity prohibition)"
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.batch.test.ts#dedupes two same-timestamp entries to one row, keeping a verbatim submitted value, never averaging (dedup-fidelity prohibition)"
        status: pass
    human_judgment: false
  - id: D6
    description: "A batch sync request with an empty readings array is rejected with 400 before any insert"
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.batch.test.ts#rejects a batch sync request with an empty readings array before any insert (empty edge)"
        status: pass
    human_judgment: false
  - id: D7
    description: "A batch exceeding 500 readings is rejected with 400 before any row is inserted (D-32)"
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.batch.test.ts#rejects a batch of 501 readings with 400 before any row is inserted (D-32)"
        status: pass
    human_judgment: false
  - id: D8
    description: "A batch where any single item fails validation is rejected with 400 and none of the batch's other items are stored (D-35 all-or-nothing)"
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.batch.test.ts#rejects the whole batch with 400 when one item fails validation, storing none of it (D-35 all-or-nothing)"
        status: pass
    human_judgment: false
  - id: D9
    description: "A batch retried verbatim after a prior successful POST returns 201 with no additional rows created (D-33/D-34)"
    requirement: "ING-03"
    verification:
      - kind: integration
        ref: "tests/ingest.batch.test.ts#returns 201 with no additional rows on a verbatim batch retry (D-33/D-34)"
        status: pass
    human_judgment: false
  - id: D10
    description: "Scoring order has no effect on the final computed risk status, since the full batch is inserted before any scoring begins and computeAndPersistRiskScore's window query always reads the full final DB state"
    requirement: "ING-03"
    verification: []
    human_judgment: true
    rationale: "Logical consequence of compute.ts's design (fetchWindow reads the full final DB state at scoring time, independent of insertion/scoring order), not independently tested by a dedicated test — this is the plan's one must_haves.truths entry marked verification: backstop."
  - id: D11
    description: "No batch/live discriminator column, flag, or differing status/priority value was added to readings or risk_scores (prohibition)"
    verification:
      - kind: other
        ref: "src/app/api/ingest/batch/route.ts / supabase/migrations — no new column added; batch-inserted rows use the identical readings/risk_scores schema as the single-reading route"
        status: pass
    human_judgment: false

duration: ~35min
completed: 2026-09-19
status: complete
---

# Phase 3 Plan 02: Batch Sync Endpoint Summary

**POST /api/ingest/batch with sort+JS-dedupe, single bulk upsert-ignore-duplicates, sequential scoring, and D-27/D-28 backfill rescore over `[batch_min, batch_max+12h]` — full ING-03 edge/prohibition matrix covered by 8 passing integration tests.**

## Performance

- **Duration:** ~35 min
- **Tasks:** 2 completed
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments
- `POST /api/ingest/batch` implemented end-to-end: auth-before-validate (identical to `/api/ingest`), all-or-nothing `BatchIngestSchema` validation (`.min(1).max(500)`), ascending sort + JS `Map`-keyed pre-dedup, one bulk `.upsert(..., {onConflict:"deviceId,timestamp", ignoreDuplicates:true})` call, sequential scoring of newly-inserted rows, and a backfill-rescore pass over `fetchWindow(deviceId, batchMin, batchMax + TREND_WINDOW_MS)`.
- `fetchWindow`/`WindowRow` exported from `compute.ts` (visibility-only change) for reuse by the backfill query.
- `BatchItemSchema`/`BatchIngestSchema`/`BatchIngestPayload` added to `ingest-schema.ts` via `.omit()` composition, `IngestSchema` unchanged.
- Full edge/prohibition matrix proven by 8 passing tests in `tests/ingest.batch.test.ts`: original-timestamp storage, backfill rescore, risk_scores column parity, 501-item cap rejection, all-or-nothing validation, verbatim-retry no-op, dedup-fidelity (never averaged), and empty-array rejection.

## Task Commits

Each task was committed atomically:

1. **Task 1: Batch sync end-to-end — auth, validate, insert, score, backfill rescore** - `102664e` (feat)
2. **Task 2: Harden batch edge cases — cap, all-or-nothing, replay, dedup, empty** - `526f927` (test)

**Plan metadata:** committed alongside this SUMMARY.

## Files Created/Modified
- `src/app/api/ingest/batch/route.ts` - new batch-sync route handler
- `src/lib/validation/ingest-schema.ts` - added `BatchItemSchema`/`BatchIngestSchema`/`BatchIngestPayload`
- `src/lib/risk/compute.ts` - exported `fetchWindow`/`WindowRow` (visibility only)
- `tests/ingest.batch.test.ts` - new file, 8 integration tests covering the full ING-03 matrix
- `tests/helpers/cleanup.ts` - added `deleteReadingsInRange` range-delete helper
- `.planning/phases/03-offline-buffered-batch-sync/deferred-items.md` - new, logs an out-of-scope pre-existing test failure

## Decisions Made
- Added `deleteReadingsInRange` to `tests/helpers/cleanup.ts` during Task 1 rather than Task 2, since Task 1's own shuffled-order/multi-timestamp test already needed range-based cleanup. No functional difference from the plan's intent — Task 2 simply reuses the helper Task 1 already introduced.
- Narrowed Task 1's original-timestamp test to a per-row `Date.now() - timestamp` distance assertion instead of a device-wide "nothing near now" table scan — the broader scan false-failed under concurrent test-suite load when unrelated tests inserted `nb-001` rows near real "now" timestamps at the same time.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Overly broad "near now" sanity assertion in Task 1's own test caused false failures under concurrent load**
- **Found during:** Task 2 (full-suite `npm test` run)
- **Issue:** Task 1's original-timestamp test queried the entire `nb-001` device for any row within ±1 minute of `Date.now()`, expecting zero results. Under `npm test`'s parallel file execution, other concurrently-running tests legitimately insert `nb-001` rows near real "now", causing this assertion to fail intermittently — a false failure, not a real behavior bug (the per-timestamp exact-match assertions immediately above it already fully prove the required behavior).
- **Fix:** Replaced the device-wide scan with a per-row `expect(Date.now() - data!.timestamp).toBeGreaterThan(HOUR_MS)` check against only the rows this test itself inserted.
- **Files modified:** `tests/ingest.batch.test.ts`
- **Verification:** `npx vitest run tests/ingest.batch.test.ts` passes consistently across repeated runs (8/8).
- **Committed in:** `526f927` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug). **Impact:** Test-only fix, no production code affected; necessary for correctness of the plan's own required verification gate.

## Issues Encountered

**Pre-existing, out-of-scope `tests/risk.compute.test.ts` failure (not fixed — logged to deferred-items.md):**
`npm test`'s full suite consistently shows one failure: `computeAndPersistRiskScore — 12h window
adjacency (D-26 inclusive >=, Task 2) > readings sharing an identical timestamp are ordered
deterministically by id...`, throwing `duplicate key value violates unique constraint
"readings_deviceid_timestamp_key"`. This test's own `insertReading()` helper does a plain
`.insert()` of two rows sharing the same `(deviceId, timestamp)` pair, deliberately, to exercise
`compute.ts`'s D-26 same-timestamp tie-break-by-`id` logic. Plan 03-01's live unique constraint
(landed before this plan started) makes that exact scenario impossible to construct via any
insert path. **Verified NOT caused by this plan:** reproduced identically on `c34b500` (the
commit immediately before Task 1 started, containing zero 03-02 changes). `tests/risk.compute.test.ts`
is not in this plan's declared `files_modified`, and deciding how to reconcile D-26's test
coverage with D-33's constraint is an architectural call belonging to whichever plan owns that
file — logged in full detail to
`.planning/phases/03-offline-buffered-batch-sync/deferred-items.md` per the executor's scope-boundary
rule rather than fixed here.

All other full-suite tests pass: `tests/ingest.auth.test.ts`, `tests/ingest.route.test.ts`,
`tests/ingest.batch.test.ts` (8/8, new), `tests/realtime.subscribe.test.ts`,
`tests/realtime.risk-scores.test.ts` (the latter two were briefly flaky under concurrent load in
one run, confirmed passing on immediate re-run and unrelated to any file this plan touches).

## Flagged Assumptions Carried Forward

Per this plan's `<flagged_assumptions>` block, two deliberate residual risks stand as documented,
not resolved by this plan:
- **Concurrency:** concurrent overlapping batch-sync/live-ingest requests for the same device are
  not explicitly serialized (no advisory lock/queue) — accepted for v1's single-device demo scope;
  the DB-level unique constraint still prevents duplicate-row corruption if two requests race.
- **Unbounded backfill blast radius:** no timestamp-range validation was added to
  `IngestSchema`/`BatchIngestSchema`, so a crafted extreme-past timestamp could inflate the
  backfill-rescore query's row count well beyond the "few hundred rows" assumption. Accepted per
  D-28's explicit correctness-over-throttling rationale; revisit only if a real deployment shows
  pathological batch/timestamp values.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `POST /api/ingest/batch` is live, tested, and shares identical storage/schema semantics with the
  single-reading route — Phase 4's historical trend queries can rely on batch-backfilled and live
  readings being indistinguishable.
- Plan 03-03 (single-route upsert-ignore retrofit) runs independently in the same wave, touching no
  files this plan touched.
- Blocker for Phase 3 close-out: the pre-existing `tests/risk.compute.test.ts` failure (see Issues
  Encountered) should be resolved by a follow-up task before `/gsd-verify-work` treats the full
  suite as green.

## Self-Check: PASSED

- CONFIRMED: `src/app/api/ingest/batch/route.ts` exists
- CONFIRMED: `tests/ingest.batch.test.ts` exists
- CONFIRMED: `.planning/phases/03-offline-buffered-batch-sync/deferred-items.md` exists
- CONFIRMED: `src/lib/validation/ingest-schema.ts` exists (modified)
- CONFIRMED: `src/lib/risk/compute.ts` exists (modified)
- CONFIRMED: `tests/helpers/cleanup.ts` exists (modified)
- CONFIRMED: commit `102664e` found in git log
- CONFIRMED: commit `526f927` found in git log
- CONFIRMED: `npx vitest run tests/ingest.batch.test.ts` — 8/8 passed
- CONFIRMED: `npm test` (full suite) — 42 passed, 1 skipped, 1 known-pre-existing-and-deferred failure (`tests/risk.compute.test.ts`, unrelated to this plan's files, see Issues Encountered)
- CONFIRMED: `npx tsc --noEmit` — no errors

---
*Phase: 03-offline-buffered-batch-sync*
*Completed: 2026-09-19*
