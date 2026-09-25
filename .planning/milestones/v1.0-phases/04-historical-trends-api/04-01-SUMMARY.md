---
phase: 04-historical-trends-api
plan: "01"
subsystem: api
tags: [nextjs, supabase, route-handler, vitals, risk-history]
requires:
  - phase: 03-offline-buffered-batch-sync
    provides: original-timestamp readings with optional persisted risk scores
provides:
  - Public, bounded historical readings endpoint for nb-001
  - Chronological vitals and persisted risk DTO with optional-risk preservation
  - Live Supabase integration coverage for READ-02
affects: [frontend-trends, realtime-refetch, historical-dashboard]
tech-stack:
  added: []
  patterns: [validated-before-admin query boundary, no-store JSON responses, paginated embedded risk join]
key-files:
  created:
    - src/app/api/readings/route.ts
    - tests/readings.route.test.ts
  modified: []
key-decisions:
  - "Allow-list nb-001 before the service-role client query and return a fixed 404 for any other supplied device."
  - "Require strict safe whole-decimal epoch-ms bounds, inclusive query endpoints, and a 15-day maximum."
  - "Use an optional embedded risk_scores relation and 1,000-row page loop so unscored readings and high-volume history are preserved."
patterns-established:
  - "Historical route responses use a shared no-store JSON helper for both success and failure paths."
  - "Public DTOs are explicitly mapped from persistence rows so internal identifiers and timestamps remain private."
requirements-completed: [READ-02]
actuals:
  tokens: 3384
  tasks: 2
  commits: 2
plan_head_before: 755ab00
coverage:
  - id: D1
    description: "GET /api/readings returns every chronological vitals reading and optional persisted risk record for the supported public device."
    requirement: READ-02
    verification:
      - kind: integration
        ref: "tests/readings.route.test.ts#GET /api/readings"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
duration: 6min
completed: 2026-09-19
status: complete
---

# Phase 4 Plan 01: Historical Trends API Summary

**Public no-cache historical readings endpoint delivers every bounded nb-001 vital in timestamp order with its stored risk explanation or an explicit risk gap.**

## Performance

- **Duration:** 6 min
- **Completed:** 2026-09-19T15:06:25Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments

- Added `GET /api/readings?deviceId=nb-001&from=<epoch-ms>&to=<epoch-ms>` with strict input validation before service-role access.
- Returns a no-store metadata envelope containing every original reading, nested canonical vitals, and full persisted risk status/breakdown or `risk: null`.
- Added seven-day/three-day continuity coverage, validation and safe-failure cases, and a 1,001-row pagination seam.

## Task Commits

1. **Task 1: End-to-end historical trend read — page, pair, and return a seven-day fixture** - `26d4bc9` (feat)
2. **Task 2: Harden the public range contract, failure boundary, and coverage declaration** - `a624b74` (test)

## Files Created/Modified

- `src/app/api/readings/route.ts` — bounded public route, validation, pagination, DTO mapping, and safe failure boundary.
- `tests/readings.route.test.ts` — live fixture and direct-handler coverage for READ-02.
- `.planning/phases/04-historical-trends-api/COVERAGE.md` — existing plan-time no-external-integration declaration remains accurate and unchanged.

## Decisions Made

- Preserve an unscored stored reading as `risk: null` instead of using an inner join.
- Apply `Cache-Control: no-store` to every public response so Realtime-triggered refetches see current storage.
- Tolerate either object or array runtime shapes for the one-to-one embedded relationship while exposing one public risk object.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Build type error] Handled generated embedded-relation typing safely.**
- **Found during:** Task 2 build verification.
- **Issue:** TypeScript represents the embedded risk relation as an array despite the database one-to-one constraint.
- **Fix:** Normalized the relation at the DTO boundary and used a narrow structural cast after selecting only public fields.
- **Files modified:** `src/app/api/readings/route.ts`
- **Verification:** `npx vitest run tests/readings.route.test.ts` and `npm run build` pass.
- **Committed in:** `a624b74`

**Total deviations:** 1 auto-fixed (1 Rule 1 bug)

## Issues Encountered

- `npm test` ran 58 tests: 55 passed, 1 skipped, and two pre-existing Supabase Realtime delivery tests timed out without receiving their INSERT events (`tests/realtime.subscribe.test.ts` and `tests/realtime.risk-scores.test.ts`). The focused historical-route suite passes and the production build passes; no unrelated Realtime code was changed.

## User Setup Required

None - the endpoint uses the existing Supabase service-role environment configuration.

## Next Phase Readiness

The frontend can consume the published historical response and re-fetch it when existing Realtime subscriptions report a reading or risk-score change.

## Known Stubs

None.

## Self-Check: PASSED

- Confirmed the route, route test, and summary artifacts exist.
- Confirmed task commits `26d4bc9` and `a624b74` exist in git history.
