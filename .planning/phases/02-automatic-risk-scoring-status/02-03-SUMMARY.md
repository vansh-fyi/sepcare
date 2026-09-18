---
phase: 02-automatic-risk-scoring-status
plan: 03
subsystem: [api/realtime]
tags: [supabase-realtime, vitest, rls, postgrest-join]

requires:
  - phase: 02-02 (risk-computation engine)
    provides: [computeAndPersistRiskScore, wired ingest route]
provides:
  - "tests/realtime.risk-scores.test.ts — automated proof an anon-key Realtime subscriber receives risk_scores INSERT events for nb-001 (D-20/D-21) and is blocked from a different device's row (RLS boundary)"
  - "tests/risk.compute.test.ts extended with a PostgREST embedded-join time-range query test proving STOR-02's queryability requirement"
affects: [phase 4 historical trends API]

actuals:
  tokens: 2401
  tasks: 2
  commits: 2
  plan_head_before: 5b465c35e0b6dc596be8152f0f52a1f32bee486b

tech-stack:
  added: []
  patterns:
    - "Buffer-then-match Realtime subscription pattern: for a table with no timestamp column, subscribe generically before the write and match incoming events by primary/foreign key learned only after the write completes, instead of a pre-known deviceId+timestamp filter"
    - "PostgREST embedded-resource join (readings.select('timestamp, risk_scores(status, breakdown)')) resolved as a nested object (not array) because risk_scores.reading_id is itself the FK-as-PK, making the relationship 1:1"

key-files:
  created: [tests/realtime.risk-scores.test.ts]
  modified: [tests/risk.compute.test.ts]

key-decisions:
  - "Task 1's subscription cannot pre-filter by reading_id (unlike the readings analog's deviceId+timestamp filter) because risk_scores.reading_id is only generated inside POST /api/ingest's synchronous insert — solved by subscribing generically before the POST, buffering all received events, then matching by reading_id once it's known (queried by timestamp after the POST returns)"
  - "Test 2 (RLS boundary) inserts the throwaway reading directly via supabaseAdmin first, so its id is known upfront — allowing subscribe-then-call-computeAndPersistRiskScore-directly, mirroring Phase 1's T-1-02 throwaway-device pattern"

patterns-established:
  - "Realtime tests for join-only/no-timestamp tables buffer-and-match by primary key rather than filtering server-side on values unknown until after the write"

requirements-completed: [RISK-02, STOR-02]

coverage:
  - id: D1
    description: "An anon-key Realtime subscriber receives a risk_scores INSERT event the moment POST /api/ingest computes and persists a status for nb-001, with no polling"
    requirement: "RISK-02"
    verification:
      - kind: integration
        ref: "tests/realtime.risk-scores.test.ts#Supabase Realtime — risk_scores anon subscriber (D-20, D-21, RISK-02, STOR-02) > delivers a risk_scores INSERT for an nb-001 reading scored via POST /api/ingest, with correctly-cased camelCase keys"
        status: pass
    human_judgment: false
  - id: D2
    description: "An anon-key Realtime subscriber does NOT receive a risk_scores event for a different device's reading (RLS boundary, mirrors Phase 1's T-1-02)"
    requirement: "RISK-02"
    verification:
      - kind: integration
        ref: "tests/realtime.risk-scores.test.ts#Supabase Realtime — risk_scores anon subscriber (D-20, D-21, RISK-02, STOR-02) > does NOT deliver a risk_scores INSERT for a different, non-nb-001 device's reading (RLS boundary, mirrors Phase 1's T-1-02)"
        status: pass
    human_judgment: false
  - id: D3
    description: "A risk_scores row is queryable filtered by its linked reading's timestamp range (STOR-02) — a bounded readings-to-risk_scores join returns exactly the expected rows, in timestamp order"
    requirement: "STOR-02"
    verification:
      - kind: integration
        ref: "tests/risk.compute.test.ts#risk_scores queryable by time range through readings (STOR-02, Plan 02-03 Task 2) > a PostgREST embedded-join range query filtered by readings.timestamp returns exactly the in-range readings, each carrying its own non-null nested risk_scores, in ascending timestamp order"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-09-18
status: complete
---

# Phase 2 Plan 03: Realtime Risk-Score Delivery + Time-Range Query Proof Summary

**Live risk_scores Realtime delivery + RLS cross-device boundary + time-range join query, all automated**

## Performance
- **Duration:** 15min
- **Started:** 2026-09-18T11:28:00Z (approx.)
- **Completed:** 2026-09-18T11:43:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Built `tests/realtime.risk-scores.test.ts` — a live anon-key Realtime subscriber proof for `risk_scores` INSERT events, mirroring `tests/realtime.subscribe.test.ts`'s structure (subscribe-before-write, SUBSCRIBED-ack race guard, camelCase-key assertion)
- Proved an nb-001 reading POSTed through `/api/ingest` delivers its computed `risk_scores` row to a live anon subscriber with no polling, closing D-20/D-21's wiring with an executed test instead of the manual-only check `02-VALIDATION.md` flagged
- Proved the RLS boundary: a throwaway non-nb-001 device's `risk_scores` row, scored directly via `computeAndPersistRiskScore`, is invisible to an anon subscriber within a 5s timeout
- Extended `tests/risk.compute.test.ts` with a PostgREST embedded-join range query — 4 spaced readings, each scored, filtered to the 2 middle readings by `readings.timestamp`, returning exactly those 2 rows with non-null nested `risk_scores`, in ascending order (STOR-02)
- Confirmed `npx tsc --noEmit` and the full `npm test` suite (5 files, 33 tests) pass with no regressions

## Task Commits
1. **Task 1: Automated Realtime proof for risk_scores INSERT + RLS boundary** - `84491dd` (test)
2. **Task 2: Prove risk_scores is queryable by time range through its linked reading (STOR-02)** - `d8cb1c9` (test)
**Plan metadata:** (this commit)

## Files Created/Modified
- `tests/realtime.risk-scores.test.ts` - New Vitest file: live anon-key Realtime delivery proof for `risk_scores` INSERT events, plus the RLS cross-device negative-delivery proof
- `tests/risk.compute.test.ts` - Extended with a PostgREST embedded-join time-range query test proving STOR-02's queryability requirement

## Decisions Made
- Task 1's subscription helper buffers all received `risk_scores` INSERT events and matches by `reading_id` once known (queried by timestamp after the POST completes), rather than pre-filtering server-side — because `reading_id` doesn't exist until the POST's synchronous insert generates it, unlike the readings analog where `deviceId`+`timestamp` are known upfront
- Test 2 inserts the throwaway reading directly via `supabaseAdmin` before subscribing, so its `reading_id` is known upfront and `computeAndPersistRiskScore` can be called directly (bypassing the route, matching Phase 1's T-1-02 throwaway-device pattern)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required
None - no external service configuration required. Reused the live Supabase project and `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`/`DEVICE_API_KEY` already present in the test environment per Phase 1.

## Next Phase Readiness
Phase 2 complete — ready for /gsd-verify-work or next phase.

---
*Phase: 02-automatic-risk-scoring-status*
*Completed: 2026-09-18*

## Self-Check: PASSED

- FOUND: tests/realtime.risk-scores.test.ts
- FOUND: tests/risk.compute.test.ts
- FOUND: commit 84491dd
- FOUND: commit d8cb1c9
