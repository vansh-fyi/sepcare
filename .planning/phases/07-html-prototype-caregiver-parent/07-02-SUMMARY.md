---
phase: 07-html-prototype-caregiver-parent
plan: 02
subsystem: ui
tags: [react, fixtures, clinical-status, connection-status]
status: complete
requires:
  - phase: 06
    provides: Shared clinical cards, icons, chart renderer and documentation
provides:
  - Honest unavailable vital presentation without values or charts
  - Shared live/stale/reconnecting reading freshness indicator
affects: [07-03, 07-05, 07-06, 10]
tech-stack:
  added: []
  patterns: [Explicit data availability, Caller-controlled retry state, Effect timer cleanup]
key-files:
  created: [src/lib/fixtures/connection-status.ts, src/components/patterns/connection-status.tsx, src/components/patterns/connection-status.DESIGN.md, src/app/design-system/docs/connection-status/page.tsx, src/app/design-system/docs/_lib/connection-status-example.tsx, tests/prototype.connection-status.test.ts, tests/prototype.vital-detail-card-unavailable.test.ts]
  modified: [src/components/patterns/vital-detail-card.tsx, src/components/patterns/vital-detail-card.DESIGN.md, docs/DESIGN-SYSTEM.md, src/app/design-system/docs/_lib/component-content.ts, src/app/design-system/docs/_lib/component-examples.tsx, src/app/design-system/docs/_lib/component-docs.tsx, src/app/design-system/docs/_lib/categories.ts]
key-decisions:
  - Unavailable status overrides supplied description and chart props so unsupported data cannot masquerade as clinical readings.
  - Connection retry state is caller-controlled; elapsed time derives only live or stale.
requirements-completed: [CARE-02, CARE-05]
actuals:
  tokens: 7829
  tasks: 2
  commits: 4
plan_head_before: c9bbb267bdbaa6c12245f2c22da434f90c34f262
duration: 12min active (interrupted overnight)
completed: 2026-10-01
coverage:
  - id: D1
    description: Unavailable vitals suppress fabricated values, charts and calendar ranges
    requirement: CARE-02
    verification:
      - kind: unit
        ref: tests/prototype.vital-detail-card-unavailable.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Connection freshness distinguishes live, stale, and explicit reconnecting
    requirement: CARE-05
    verification:
      - kind: unit
        ref: tests/prototype.connection-status.test.ts
        status: pass
    human_judgment: false
---

# Phase 7 Plan 2: Unavailable vitals and connection freshness Summary

VitalDetailCard now exposes an honest neutral unavailable state; ConnectionStatus combines an icon, label, and semantic color for reading freshness.

## Accomplishments

- Added component-local unavailable status while preserving ClinicalStatus's three values and existing chart behavior. Unsupported Cardiac Autonomic, Perfusion Index, and Respiratory Pattern descriptions now disclose device-support absence.
- Suppressed chart, numeric value, and calendar range even if an unavailable card receives stale chart/value props. Its description always uses the honest shared copy.
- Added pure strict-threshold freshness calculation and a shared indicator with 15-second clock and effect cleanup. Reconnecting is explicit; stale minutes round and clamp to zero.
- Added a searchable connection-status documentation route, controlled preview and copyable code, API and tokens. Updated the chart preview/API and shared design notes.

## Task Commits

1. Task 1 RED — `09e4284`: unavailable data suppression tests and evidence.
2. Task 1 GREEN — `94e1b79`: unavailable implementation and documentation parity.
3. Task 2 RED — `51a0685`: connection contract tests and evidence.
4. Task 2 GREEN — `58f897c`: shared indicator, cleanup test and documentation.

## Verification

- Three scoped suites passed: 40 tests across prototype.vital-detail-card-unavailable, prototype.connection-status, and existing design-system tests.
- Targeted ESLint, TypeScript checking, git diff whitespace check, and production build passed. Build produced 42 routes, including /design-system/docs/connection-status.
- Effect cleanup was exercised with captured React effect callbacks and fake timers in the node test environment; no browser mount/unmount comparison was performed.
- Full npm test was not repeated per orchestrator instruction after the earlier phase run exposed a known Realtime concurrency flake. Phase-level integration regression remains pending; this is not a claimed full-suite pass.
- Rendered browser comparison was not performed in this plan.

## TDD Gate Compliance

Both tasks have RED commits before GREEN commits. Task 1's selected assertion proved the old unsupported-vital descriptions were wrong; Task 2's selected assertion proved the shared indicator was missing. New boundary/render tests passed after implementation. Both persisted evidence records validate as RED_EVIDENCE_OK. Vitest's nested TAP required flattening and selected-test summary counts for the GSD node-TAP parser; raw output is retained alongside normalization details. No refactor commit was needed.

## Deviations from Plan

- [Rule 2] Extended unavailable guarding to description and calendar metadata, beyond the plan's two chart/value guards, so accidentally supplied chart props cannot conceal the unavailable explanation.
- [Rule 2] Added live docs, navigation/search entry, API, tokens, and design-system documentation in the same commits, as required by AGENTS.md.
- Full-suite repetition deferred to the phase orchestrator, which already identified the integration concurrency issue. No unrelated backend fixes were made.

## Known Stubs

None. Unavailable vital presentation is an intentional supported state, not fabricated data or unfinished implementation.

## Threat Review

Text renders through React escaping. Effect cleanup clears the clock interval. No network, authentication, file-access, or schema trust boundary was introduced.

## Next Plan Readiness

DeviceDetails can import ConnectionStatus and fixture-backed Vitals/Stats can use status="unavailable" without charts. Later screen plans own those integrations.

## Self-Check: PASSED

All new files exist, all four task commits exist, both RED evidence checks passed, and only orchestrator-owned sentinel/lock changes remained after production commits.
