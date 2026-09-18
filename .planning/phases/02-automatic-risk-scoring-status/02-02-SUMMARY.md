---
phase: 02-automatic-risk-scoring-status
plan: 02
subsystem: [api/risk-scoring]
tags: [risk-scoring, tdd, vitest, supabase]

requires:
  - phase: 02-01 (risk_scores migration)
    provides: [risk_scores table, composite index, regenerated types]
provides:
  - "computeAndPersistRiskScore(target) — standalone D-25 risk-computation engine in src/lib/risk/compute.ts"
  - "src/lib/risk/thresholds.ts — named, D-referenced threshold/window constants"
  - "POST /api/ingest synchronously scores every stored reading (D-23/D-24), never failing the request on a scoring error"
  - "20-case regression suite proving D-12 breadth-gating, D-13 temperature boundary, Liebermeister HR/temp band, D-18 cold-start, D-26 causal window + tie-break ordering, and prohibitions P1/P2"
affects: [02-03 realtime/range-query proof]

actuals:
  tokens: 7519
  tasks: 2
  commits: 4
  plan_head_before: d5979f9791c8dd7ed8f9caa432b4f817cb66eee5

tech-stack:
  added: []
  patterns:
    - "Timestamp-relative causal window query (.lte/.gte on target.timestamp, never 'last N rows') for out-of-order-safe rolling history"
    - "Breadth-gating status derivation: plain integer count of abnormal booleans, never a severity-weighted score"
    - "Synchronous post-insert scoring wrapped in try/catch — a scoring failure logs and is swallowed, never turns a successful insert into a failed request"

key-files:
  created: [src/lib/risk/thresholds.ts, src/lib/risk/compute.ts, tests/risk.compute.test.ts]
  modified: [src/app/api/ingest/route.ts, tests/ingest.route.test.ts]

key-decisions:
  - "Task 2's hardening tests required zero changes to compute.ts — Task 1's implementation was already correct against the full boundary/breadth/prohibition matrix, confirming the tracer-quality build discipline paid off"
  - "Added a dedicated same-timestamp tie-break test (D-26's 'ordered by timestamp then id' clause) beyond the plan's explicit action text, since it was an un-exercised must_haves truth otherwise only provable by code inspection"

patterns-established:
  - "compute.ts is the first business-logic module in src/lib/ (not a config or route file) — module-level JSDoc states the D-25/D-26 contract Phase 3's batch handler must also satisfy when it starts calling this same function"

requirements-completed: [RISK-01, RISK-02, RISK-03]

coverage:
  - id: D1
    description: "Temperature feature flags abnormal at temp >= 38.0C and temp < 35.5C, but NOT at exactly 35.5C (D-13 asymmetric boundary)"
    requirement: "RISK-01"
    verification:
      - kind: integration
        ref: "tests/risk.compute.test.ts#computeAndPersistRiskScore — temperature boundary (D-13 asymmetric >=/<, Task 2)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The window query never reads a readings row whose timestamp is after the target's own timestamp (D-26 causal window; prohibition P1)"
    requirement: "RISK-01"
    verification:
      - kind: integration
        ref: "tests/risk.compute.test.ts#computeAndPersistRiskScore — structural prohibitions P1/P2 > P1: a reading inserted with a timestamp AFTER the target is never included in the target's computed window"
        status: pass
    human_judgment: false
  - id: D3
    description: "Status is Green at 0-1 abnormal, Amber at exactly 2, Red only at all 3 (D-12), and this holds regardless of any single feature's severity (prohibition P2)"
    requirement: "RISK-02"
    verification:
      - kind: integration
        ref: "tests/risk.compute.test.ts#computeAndPersistRiskScore — breadth gate + fever-vs-sepsis demo traces (D-12, Task 2)"
        status: pass
      - kind: integration
        ref: "tests/risk.compute.test.ts#computeAndPersistRiskScore — structural prohibitions P1/P2 > P2: an extreme single-feature reading (temperature 40.0) alone still resolves green"
        status: pass
    human_judgment: false
  - id: D4
    description: "HR-temperature proportionality ratio is abnormal only outside the inclusive [6,14] bpm/C band; exactly 6 or 14 is normal"
    requirement: "RISK-01"
    verification:
      - kind: integration
        ref: "tests/risk.compute.test.ts#computeAndPersistRiskScore — HR/temp proportionality boundary (Liebermeister band [6,14], Task 2)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Before 1h of prior history (D-18), HR-temp-proportionality and activity-trend never register abnormal/trending; only the absolute temperature threshold can contribute during cold start, so status defaults Green (D-17)"
    requirement: "RISK-01"
    verification:
      - kind: integration
        ref: "tests/risk.compute.test.ts#computeAndPersistRiskScore — core behaviors (Task 1) > keeps status green for a single fever reading (temp 38.5) with no other abnormal signal — count=1, D-12"
        status: pass
    human_judgment: false
  - id: D6
    description: "A device's very first-ever reading (empty prior history) is still scored without erroring — window returns exactly the target row, prior-history stats are empty, status resolves Green"
    requirement: "RISK-01"
    verification:
      - kind: integration
        ref: "tests/risk.compute.test.ts#computeAndPersistRiskScore — core behaviors (Task 1) > persists green with all 3 breakdown sub-objects non-abnormal for a fresh device history + normal reading"
        status: pass
    human_judgment: false
  - id: D7
    description: "The rolling window is inclusive of a reading exactly 12h before the target (D-26's >= boundary) and ordered by timestamp then id, so same-timestamp readings process in a stable, deterministic order"
    requirement: "RISK-01"
    verification:
      - kind: integration
        ref: "tests/risk.compute.test.ts#computeAndPersistRiskScore — 12h window adjacency (D-26 inclusive >=, Task 2) > a prior reading exactly TREND_WINDOW_MS old IS included; one millisecond older is excluded"
        status: pass
      - kind: integration
        ref: "tests/risk.compute.test.ts#computeAndPersistRiskScore — 12h window adjacency (D-26 inclusive >=, Task 2) > readings sharing an identical timestamp are ordered deterministically by id, and the target excludes only itself from its own baseline"
        status: pass
    human_judgment: false
  - id: D8
    description: "A risk-scoring failure for one reading (caught per D-24) does not block or corrupt scoring for the next reading — each POST invokes computeAndPersistRiskScore fresh with no persisted failure state"
    requirement: "RISK-03"
    verification: []
    human_judgment: true
    rationale: "Not directly integration-tested with a forced-failure-then-success sequence. Proven by code inspection instead: route.ts wraps each POST's computeAndPersistRiskScore call in its own independent try/catch (D-24); compute.ts holds no module-level mutable state, no cache, and no cross-request memoization — every invocation re-runs its own window query and upsert from scratch, so a prior call's thrown error cannot leak into or corrupt a subsequent call's execution."

duration: 33min
completed: 2026-09-18
status: complete
---

# Phase 2 Plan 02: Risk-Computation Engine Summary

**Composite risk-scoring engine (D-13 temperature threshold + Liebermeister HR-temp proportionality + D-14 activity-decline trend) computed via a timestamp-relative causal window and wired synchronously into POST /api/ingest, proven against the full D-12 breadth-gating matrix plus structural prohibitions P1/P2**

## Performance
- **Duration:** 33 min
- **Started:** 2026-09-18T11:21:00Z (approx.)
- **Completed:** 2026-09-18T11:34:32Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Built `src/lib/risk/thresholds.ts` — named, D-reference-documented constants for D-13 (fever/hypothermia), the Liebermeister HR/temp band, D-14's activity-decline ratio, D-15's 12h trend window, and D-18's 1h baseline minimum
- Built `src/lib/risk/compute.ts`'s `computeAndPersistRiskScore(target)` — the standalone D-25 engine: a timestamp-relative causal window query (D-26), cold-start-aware personal baseline (D-17/D-18), the 3-feature composite (D-12–D-14), and breadth-gated status derivation, upserting into `risk_scores`
- Wired scoring synchronously into `POST /api/ingest` (D-23), wrapped in try/catch so a scoring failure logs and never turns a successful readings insert into a failed request (D-24)
- Proved the full boundary/precision/breadth-gating matrix with 20 passing integration tests against the live Supabase project: D-13's asymmetric temperature boundary, the Liebermeister ratio's inclusive [6,14] band, D-12's exact 0/1→green, 2→amber, 3→red count mapping (including "common fever" vs. "sepsis-shaped" demo traces), prohibitions P1 (no future-data leakage) and P2 (severity never bypasses the breadth gate), D-26's inclusive 12h window boundary, and same-timestamp tie-break ordering
- Extended `tests/ingest.route.test.ts`'s existing valid-POST test with a `risk_scores` existence assertion (RISK-03)
- Confirmed `npm run build` passes with no TypeScript errors

## Task Commits
1. **Task 1: Compute and persist a real risk score for one live reading, end-to-end** - test `876e574`, feat `b6ee11d`
2. **Task 2: Harden the breadth-gating matrix, boundary values, and the fever-vs-sepsis demo traces** - test `7d9a7b3`, test `26b0502` (no feat commit — see Deviations)
**Plan metadata:** (this commit)

## TDD Gate Compliance
| Task | RED | GREEN | REFACTOR | Status |
|------|-----|-------|----------|--------|
| 1 | `876e574` | `b6ee11d` | — (none needed) | Pass |
| 2 | `7d9a7b3` (+ `26b0502`, added coverage) | N/A — tests passed immediately against Task 1's implementation | — | Pass |

Task 1's RED commit staged only `tests/risk.compute.test.ts` while a throwing stub `compute.ts` existed on disk (uncommitted) so the test module could import without a resolution error; the stub was then replaced by the real implementation and committed together with `thresholds.ts`/`route.ts` in the GREEN commit. Task 2's tests exercised Task 1's already-complete implementation and passed on first run with zero `compute.ts` changes — a legitimate outcome the plan itself anticipated ("these tests are hardening/regression coverage, not a new design"). A second test-only commit (`26b0502`) was added after discovering one `must_haves` truth (D-26's timestamp-then-id tie-break ordering) had no dedicated test yet.

## Files Created/Modified
- `src/lib/risk/thresholds.ts` - Named D-13/D-14/D-15/D-18 threshold and window constants
- `src/lib/risk/compute.ts` - `computeAndPersistRiskScore`, `TargetReading`, `RiskBreakdown` — the standalone scoring engine
- `src/app/api/ingest/route.ts` - `.select(...).single()` added to the readings insert; synchronous try/catch-wrapped scoring call
- `tests/risk.compute.test.ts` - 20 integration tests covering RISK-01/RISK-02/RISK-03/STOR-02's boundary, breadth-gating, cold-start, and prohibition behaviors
- `tests/ingest.route.test.ts` - Extended valid-POST test with a `risk_scores` existence assertion

## Decisions Made
- Task 2's hardening tests required zero changes to `compute.ts` — Task 1's implementation was already correct against the full boundary/breadth/prohibition matrix
- Added a same-timestamp tie-break test beyond the plan's literal action text, since D-26's "ordered by timestamp then id" clause was otherwise only provable by code inspection, not an executed test

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed two self-authored test bugs discovered during Task 2's first hardening run**
- **Found during:** Task 2, first `npx vitest run tests/risk.compute.test.ts` after writing the hardening describe blocks
- **Issue:** (a) The `it.each` boundary tests destructured a second `index` parameter expecting a numeric array index, but Vitest's `it.each` callback receives the Vitest `TestContext` as its second argument, not an index — `(200 + index) * DAY_MS` evaluated to `NaN`, which serialized to `null` and violated the `readings.timestamp` NOT NULL constraint. (b) The P1 prohibition test's own baseline/target HR-vs-temp values produced an out-of-band ratio (20, not in [6,14]) by miscalculation, so the "everything should stay normal" assertion incorrectly expected `hrTempProportionality.abnormal` to be `false` when the test's own inputs made it `true`.
- **Fix:** (a) Added an explicit `dayOffset` field to each `it.each` case object instead of relying on the array index. (b) Recalculated the P1 test's target reading (`heartRate: 128, temperature: 37.5` against a `heartRate: 120, temperature: 36.5` baseline) to land the ratio at exactly 8, inside the [6,14] band.
- **Files modified:** `tests/risk.compute.test.ts`
- **Verification:** `npx vitest run tests/risk.compute.test.ts` — all 19 (then 20) tests passed after the fix
- **Commit:** `7d9a7b3` (the fix was applied before the RED-evidence run captured in this commit; no separate commit needed since this was corrected before first commit of the file)

**2. [Rule 2 - Missing coverage] Added a dedicated test for D-26's same-timestamp tie-break ordering**
- **Found during:** Post-Task-2 review of the plan frontmatter's `must_haves.truths` against the written test suite
- **Issue:** The 7th `must_haves` truth ("rolling window... ordered by timestamp then id, so readings sharing an identical timestamp are processed in a stable, deterministic order") was only partially covered — the inclusive-12h-boundary half was tested, but the same-timestamp tie-break half was only provable by reading `compute.ts`'s `prior` filter code, not by an executed assertion.
- **Fix:** Added a new test inserting two readings at an identical timestamp (a baseline-establishing older reading, then a same-timestamp `priorRow` and `target` in sequence) and asserted the window query returns them in stable `[older, priorRow, target]` order, and that `computeAndPersistRiskScore` computes a baseline ratio (500, not 333.3) that is only correct if the target reading excludes itself from its own baseline.
- **Files modified:** `tests/risk.compute.test.ts`
- **Verification:** `npx vitest run tests/risk.compute.test.ts` — 20/20 passed
- **Commit:** `26b0502`

**Total deviations:** 2 auto-fixed (1 bug, 1 missing coverage). **Impact:** Both were self-contained within the new test file; neither touched production code (`compute.ts`/`route.ts`/`thresholds.ts` were correct as written in Task 1's GREEN commit).

## Issues Encountered
- One flaky pre-existing test (`tests/realtime.subscribe.test.ts`'s "delivers an nb-001 INSERT with correctly-cased camelCase keys", a network-timing-sensitive Realtime websocket wait) failed once during a `npm test` run and passed on two immediate re-runs with no code changes in between. This is out of scope per the deviation rules' scope boundary (pre-existing, unrelated to this plan's files) — not fixed, not modified.

## User Setup Required
None - no external service configuration required. This plan reused the live Supabase project and service-role client already configured in Phase 1/Plan 02-01.

## Next Phase Readiness
- Plan 02-03 (Realtime/range-query proof) can now build against a live, automatically-populated `risk_scores` table with real computed statuses for every ingested reading.
- `computeAndPersistRiskScore`'s signature (`TargetReading` in, `{status, breakdown}` out) is stable and ready for Phase 3's batch-sync handler to call directly (D-25).
- No blockers or concerns carried forward.

---
*Phase: 02-automatic-risk-scoring-status*
*Completed: 2026-09-18*

## Self-Check: PASSED

- FOUND: src/lib/risk/thresholds.ts
- FOUND: src/lib/risk/compute.ts
- FOUND: tests/risk.compute.test.ts
- FOUND: src/app/api/ingest/route.ts
- FOUND: tests/ingest.route.test.ts
- FOUND: .planning/phases/02-automatic-risk-scoring-status/02-02-SUMMARY.md
- FOUND: commit 876e574
- FOUND: commit b6ee11d
- FOUND: commit 7d9a7b3
- FOUND: commit 26b0502
