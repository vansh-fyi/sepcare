---
phase: 07-html-prototype-caregiver-parent
plan: 05
subsystem: ui
tags: [react, vitals, charts, fixtures, tdd]
requires:
  - phase: 07-01
    provides: Original timestamped fixture readings and risk mapping
  - phase: 07-02
    provides: Unavailable vital treatment
  - phase: 07-03
    provides: RiskTimeline and hourly history selection
provides:
  - Shared VitalsView with three genuine summaries and three unavailable signals
  - Shared StatsView with inclusive original-reading trend windows
affects: [07-06, 07-07, 07-08]
tech-stack:
  added: []
  patterns: [Shared transport-to-metric mapping, timestamp-preserving chart gaps]
key-files:
  created: [src/lib/fixtures/trend-window.ts, src/lib/fixtures/vital-metrics.ts, src/components/patterns/vitals-view.tsx, src/components/patterns/stats-view.tsx, tests/prototype.trend-window.test.ts, tests/prototype.stats.test.ts]
  modified: [src/components/patterns/vital-detail-card.tsx, src/app/design-system/docs/_lib/component-examples.tsx, tests/prototype.status.test.ts, tests/prototype.timeline.test.ts]
key-decisions:
  - Static snapshot trend windows end at the latest supplied original timestamp, preventing aging-out and hydration boundary drift.
  - Null computed ratios retain chart timestamps with an absent value rather than fabricated zero; latest display rounds only the header.
  - Stateless VitalDetailCard supports server consumers and explicit summary values without requiring a chart.
requirements-completed: [CARE-02, CARE-04, PARENT-02]
coverage:
  - id: vitals-summary
    description: Three real summary values, three unavailable metrics, overall status coding, and hourly history
    requirement: CARE-02
    verification:
      - kind: unit
        ref: tests/prototype.status.test.ts
        status: pass
      - kind: unit
        ref: tests/prototype.timeline.test.ts
        status: pass
    human_judgment: false
  - id: stats-window
    description: Inclusive 1H/6H/24H charts preserve every original timestamp and required selection
    requirement: CARE-04
    verification:
      - kind: unit
        ref: tests/prototype.stats.test.ts
        status: pass
      - kind: unit
        ref: tests/prototype.trend-window.test.ts
        status: pass
    human_judgment: false
actuals:
  tokens: 8676
  tasks: 3
  commits: 6
plan_head_before: fca4227da5affc51ba5321765c5810fa6aa10e72
duration: 404min wall clock including quota interruption and approval waits
completed: 2026-10-01
status: complete
---

# Phase 7 Plan 5: Shared Vitals and Stats Summary

**Shared caregiver/parent compositions show genuine fixture values and timestamped trends, with unsupported signals explicitly unavailable.**

## Accomplishments

- Inclusive 1/6/24-hour filtering preserves reading identity, order, and timestamps.
- VitalsView composes StatusCard/Badge, six summary cards, and newest-first hourly RiskTimeline.
- StatsView uses the same metric mapping, a required ToggleGroup selection, and genuine temperature, computed ratio, and activity charts. Missing ratios remain gaps.
- Shared summary values, documentation API text, and a working Summary only preview/code control stay aligned.
- Components are ready for the caregiver and parent routes in plans 06/07; this plan does not claim those future route imports are already implemented.

## Task Commits

1. Task 1 RED `81e9338`; GREEN `31d03e5` — inclusive windows.
2. Task 2 RED `633a563`; GREEN `f040d13` — summary grid and history.
3. Task 3 RED `fe97567`; GREEN `a3d0067` — chart ranges and documentation preview.

## Verification

- Scoped fixture/status/timeline/Stats/design-system suites: **44 passed**.
- `npx tsc --noEmit`, scoped ESLint, and `git diff --check`: passed.
- `npm run build -- --webpack`: passed, including static page generation.
- Default Turbopack build and its escalated retry failed on worker port binding (`Operation not permitted`); Webpack is supported by the installed Next CLI guide.
- Network-enabled `npm test`: **120 passed, 2 failed, 1 existing skipped**. Both failures are existing Realtime INSERT delivery timeouts. Serial rerun: **3 passed, 1 failed** (risk_scores INSERT delivery). No affected source or test imports involve these backend paths. See deferred-items.md and WINDOWS.md.
- No browser visual comparison was performed. Parent/caregiver route integration follows in the next plans.

## TDD Gate Compliance

All three tasks have RED-before-GREEN commits and persisted `RED_EVIDENCE_OK` records. Raw Vitest TAP is preserved alongside flattened summary output for the GSD parser. Missing implementation assertions guard dynamic imports, avoiding load-failure evidence. No refactor commit was required. The Stats hook harness was corrected for ESM module immutability before GREEN; it exercises the actual range callback and resulting card data.

## Deviations from Plan

1. **[Rule 2 — missing critical functionality]** VitalDetailCard suppressed values when chart was omitted. Enabled the same numeric header for explicit summary values, maintained unavailable suppression, and updated design notes, API docs, and the live copyable preview.
2. **[Rule 3 — blocking issue]** Removed VitalDetailCard's unnecessary client directive. It has no hooks; its chart renderer retains its client boundary. Server VitalsView can now read VITAL_DETAILS normally.
3. **[Rule 2 — data correctness]** Shared getVitalMetric prevents duplicated feature mappings. Null ratios remain missing instead of converting to zero or dropping original timestamps. Empty readings do not claim an overall Safe status.
4. **[Rule 1 — snapshot consistency]** Stats anchors the selected window to the last supplied timestamp, avoiding time-dependent mismatch between static server data and client rendering. The helper retains its documented Date.now default for general callers.
5. Followed the task action and design contract that Vitals shows summaries and Stats shows charts, resolving the contradictory chart wording in the plan's opening truths/behavior. Newest-first history follows the existing getRiskHistory contract.

## Known Stubs

None added. The three unavailable signals are the intentional product contract, not fabricated implementations. No new endpoints, auth paths, file access, or trust boundaries were introduced.

## Self-Check: PASSED

All six task commits are present; all declared output files and design notes exist. No tracked files were deleted. Unrelated dispatch sentinel and milestone lock were preserved.
