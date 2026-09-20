---
phase: 01-device-ingest-live-readout
plan: 03
subsystem: api
tags: [nextjs, supabase, zod, vitest, realtime, tracer]

requires:
  - phase: 01-device-ingest-live-readout (plan 01)
    provides: "supabaseAdmin client, IngestSchema, devices/readings migration"
  - phase: 01-device-ingest-live-readout (plan 02)
    provides: "live Supabase project (schema pushed, seeded nb-001 device, .env.local runtime keys)"
provides:
  - "POST /api/ingest route handler: auth -> validate -> store"
  - "10 passing automated tests against the live Supabase project (no mocking)"
  - "Working vitest.config.ts env-loading + @/* path alias for tests"
affects: ["01-04"]

actuals:
  tokens: 58000
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Auth-before-validate ordering structurally enforced (X-API-Key/devices lookup precedes IngestSchema.safeParse in source, not just tested)"
    - "Realtime test subscriptions must await the SUBSCRIBED ack before triggering the write under test, or the event is silently dropped"

key-files:
  created:
    - src/app/api/ingest/route.ts
    - tests/ingest.route.test.ts
    - tests/ingest.auth.test.ts
    - tests/realtime.subscribe.test.ts
  modified:
    - vitest.config.ts

key-decisions:
  - "vitest.config.ts needed vite's loadEnv() to populate process.env from .env.local, plus a @/* resolve.alias matching tsconfig.json — vitest doesn't auto-load .env.local the way Next.js's dev/build pipeline does. Discovered as a blocking gap while writing the first live-project test."
  - "Fixed a Realtime test race condition: the anon channel's .subscribe() callback must report SUBSCRIBED before the INSERT under test fires, otherwise the event can be missed entirely (not flaky — deterministic race against an unready channel)."

patterns-established:
  - "Every test that inserts into readings cleans up via deleteReadingByTimestamp in afterEach/afterAll — the live project is the only test environment (RESEARCH.md's Wave 0 gap, accepted as-is for v1)."

requirements-completed: [ING-01, ING-02, STOR-01, READ-01, DEV-01]

coverage:
  - id: D1
    description: "Valid POST with correct key + well-formed body returns 201 and the reading is persisted with all fields intact"
    requirement: "ING-01"
    verification:
      - kind: integration
        ref: "tests/ingest.route.test.ts#returns 201 and persists all fields exactly on a valid POST"
        status: pass
    human_judgment: false
  - id: D2
    description: "Field-level 400 for missing vitals.heartRate; non-JSON body returns 400 not 500"
    requirement: "STOR-01"
    verification:
      - kind: integration
        ref: "tests/ingest.route.test.ts#returns 400 for a valid key but a body missing vitals.heartRate"
        status: pass
      - kind: integration
        ref: "tests/ingest.route.test.ts#returns 400 (not 500) for a non-JSON body with a valid key"
        status: pass
    human_judgment: false
  - id: D3
    description: "Missing/empty/invalid X-API-Key and device-id mismatch all return the uniform 401 body before any insert"
    requirement: "ING-02"
    verification:
      - kind: integration
        ref: "tests/ingest.auth.test.ts (4 rejection cases + 1 control case, all pass)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Anon-key Realtime subscriber receives the live reading with correctly-cased camelCase keys, and does not receive a different device's reading (RLS boundary)"
    requirement: "READ-01"
    verification:
      - kind: integration
        ref: "tests/realtime.subscribe.test.ts (2 tests, both pass)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The seeded nb-001 device's credentials work end-to-end for both auth success and Realtime delivery"
    requirement: "DEV-01"
    verification:
      - kind: integration
        ref: "shared across ingest.auth.test.ts control case and realtime.subscribe.test.ts"
        status: pass
    human_judgment: false

duration: 26min
completed: 2026-09-12
status: complete
---

# Phase 01 Plan 03: Live Ingest + Realtime Tracer Summary

**POST /api/ingest wired end-to-end against the live Supabase project — 10 tests pass with zero mocking, including a real anon-key Realtime subscriber proving the RLS boundary and camelCase wire contract**

## Performance

- **Duration:** 26 min
- **Started:** 2026-09-12T23:22:00+05:30
- **Completed:** 2026-09-12T23:28:19+05:30
- **Tasks:** 2 (tracer + expansion)
- **Files modified:** 5 (4 created, 1 config fix)

## Accomplishments

- Implemented `POST /api/ingest` exactly per RESEARCH.md Pattern 1: X-API-Key check → devices lookup → zod validation → insert, in that structural order
- 8 tests in `ingest.route.test.ts`/`ingest.auth.test.ts` cover every success/failure path from CONTEXT.md's locked decisions, running against the live project with no mocking
- 2 tests in `realtime.subscribe.test.ts` prove the Realtime read path end-to-end: correct camelCase field delivery and RLS-scoped device isolation
- Fixed a blocking gap in `vitest.config.ts` (env loading + path alias) discovered while writing the first live-project test

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire POST /api/ingest end-to-end (tracer)** - `8b2ee5d` (feat)
2. **Task 2: Prove the live Realtime read path with a real anon-key subscriber** - `0cc6476` (feat)

## Files Created/Modified

- `src/app/api/ingest/route.ts` - the ingest route handler (auth → validate → store)
- `tests/ingest.route.test.ts` - valid-submission and field-integrity coverage
- `tests/ingest.auth.test.ts` - auth rejection coverage (missing/empty/invalid key, device-id mismatch)
- `tests/realtime.subscribe.test.ts` - anon Realtime subscriber, camelCase + RLS-boundary proof
- `vitest.config.ts` - added `loadEnv()` to populate `process.env` from `.env.local`, and a `@/*` resolve alias matching `tsconfig.json`

## Decisions Made

- vitest doesn't auto-load `.env.local` (unlike Next.js's own dev/build pipeline) — added `vite`'s `loadEnv()` to `vitest.config.ts`'s `test.env` option, plus a `resolve.alias` for `@/*` so tests can import route/lib modules the same way application code does.
- Realtime test subscriptions must wait for the `SUBSCRIBED` ack before triggering the insert under test — an earlier draft fired the POST immediately after calling `.subscribe()` and silently missed the event because the channel wasn't listening yet.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest.config.ts did not load .env.local or resolve the @/* alias**
- **Found during:** Task 1, while writing the first test that imports `route.ts` and needs `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` at runtime
- **Issue:** Tests failed with `process.env.SUPABASE_URL` undefined, and `@/lib/...` imports unresolved — neither was configured for the test runner (only for Next.js's own build).
- **Fix:** Added `test.env: loadEnv("test", process.cwd(), "")` (loads all vars, no prefix filter) and `resolve.alias: { "@": path.resolve(__dirname, "./src") }`.
- **Files modified:** `vitest.config.ts`
- **Verification:** A throwaway sanity test confirmed `process.env.SUPABASE_URL` was populated before writing the real test suite.
- **Committed in:** `8b2ee5d` (Task 1 commit)

**2. [Rule 1 - Bug] Realtime subscription race condition dropped the INSERT event**
- **Found during:** Task 2, first test run — the nb-001 delivery test timed out (10s) with no event received, while the RLS-boundary test correctly received nothing (a false negative masking as a true negative)
- **Issue:** `.subscribe()` is asynchronous; the original test fired the `POST` immediately after calling `.subscribe()` without waiting for Supabase's `SUBSCRIBED` acknowledgment, so the channel wasn't actually listening yet when the INSERT happened.
- **Fix:** Restructured the helper to resolve a promise only once the `.subscribe((status) => ...)` callback reports `SUBSCRIBED`, then start waiting for the row only after that ack.
- **Files modified:** `tests/realtime.subscribe.test.ts`
- **Verification:** Re-ran the suite — both Realtime tests pass consistently.
- **Committed in:** `0cc6476` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking config gap, 1 correctness bug in test infrastructure)
**Impact on plan:** Both fixes were necessary for the tests to run/pass at all against the live project as the plan required (no mocking). No scope creep — both are test-infrastructure corrections, not changes to the route handler's behavior or the locked D-01–D-11 decisions.

## Issues Encountered

None beyond the two deviations documented above, both resolved within the same task.

## User Setup Required

None - no external service configuration required (Plan 02 already provisioned everything this plan needed).

## Next Phase Readiness

- The full device → auth → validate → store → live-read pipeline works end-to-end against the real Supabase project, proven by 10 passing automated tests with zero residual test data
- Plan 04 can deploy this working route to Vercel and run a deployed end-to-end smoke test
- No blockers

---
*Phase: 01-device-ingest-live-readout*
*Completed: 2026-09-12*
