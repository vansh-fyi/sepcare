---
phase: 07-html-prototype-caregiver-parent
plan: "07"
subsystem: ui
tags: [nextjs, parent, routes, fixtures, parity]
requires:
  - phase: 07-03
    provides: shared device selection and details
  - phase: 07-04
    provides: parent shell and See All link
  - phase: 07-05
    provides: shared VitalsView and StatsView
  - phase: 07-06
    provides: caregiver route parity reference
provides:
  - Parent Select Device and guarded Device Details routes
  - Parent Vitals and Stats routes with pathname-driven two-tab navigation
  - Actual route rendering parity tests for normal, empty, and boundary fixtures
affects: [07-08, phase-10-live-wiring]
tech-stack:
  added: []
  patterns: [typed App Router wrappers, shared fixture identity, route-driven ToggleGroup]
key-files:
  created:
    - src/app/(prototype)/parent/device/page.tsx
    - src/app/(prototype)/parent/device/[deviceId]/page.tsx
    - src/app/(prototype)/parent/detail/layout.tsx
    - src/app/(prototype)/parent/detail/vitals/page.tsx
    - src/app/(prototype)/parent/detail/stats/page.tsx
    - tests/prototype.parent-device.test.ts
    - tests/prototype.parent-detail.test.ts
  modified: []
key-decisions:
  - Parent detail routes reuse caregiver wrappers and unchanged shared views with the identical READINGS.entries reference.
requirements-completed: [PARENT-02, PARENT-03, PARENT-04, PARENT-05]
actuals:
  tokens: 2534
  tasks: 3
  commits: 5
plan_head_before: 000d05e189261effb1fc0a98be8aef5ef0470ef1
duration: 6min
completed: 2026-10-01
status: complete
---

# Phase 7 Plan 7: Parent Device and Detail Routes Summary

**Parent device selection and two-tab health details now resolve to real routes using the caregiver's shared components and exact readings array.**

## Accomplishments

- `/parent/device` lists exactly one real device. The dynamic destination awaits typed params, renders shared DeviceDetails for `nb-001`, and shows honest error copy with a retry link for unknown IDs.
- Parent detail layout offers exactly two links in Vitals/Stats order. Selection follows the URL, with current-page semantics and no persistent bottom navigation.
- Parent Vitals/Stats render the existing views unchanged, including all six metrics, three unavailable signals, chronological history, and chart range controls. Home's See All link already points to `/parent/detail/vitals`; no change was necessary.
- Tests render actual route exports and prove shared component/data identity and byte-identical caregiver/parent markup for normal, empty, and boundary readings.

## Task Commits

1. Task 1 RED: `8e4dd3d`; implementation: `8e6c364`.
2. Task 2 layout: `eaec024`.
3. Task 3 RED: `5291de7`; implementation and assertion cleanup: `3afb87c`.

## Verification

- Scoped Vitest: 10/10 passed across parent-device and parent-detail tests. Detail tests rerun after lint cleanup: 6/6 passed.
- Three `npm run build -- --webpack` runs passed, covering each task; final output includes both device routes and both detail routes. Webpack uses the phase's previously established fallback for Turbopack sandbox failures.
- Scoped ESLint and `npx tsc --noEmit`: passed.
- Full `npm test`: 134 passed, 1 failed, 1 existing skipped. Failure is the previously recorded `tests/realtime.subscribe.test.ts` INSERT-delivery timeout; no backend or Realtime code changed. This remains a phase regression limitation, not a green full suite.
- No rendered browser/visual verification performed in this plan; phase review remains responsible for visual sign-off.

## Deviations from Plan

- Tests exercise actual page exports in addition to shared components, avoiding a vacuous comparison of two identical direct component calls. Added unknown-device guard and pathname-selected tab coverage.
- Task 1 RED checker initially rejected Vitest's nested TAP and Node's default spec output. The implementation was inadvertently written before the checker returned a valid verdict. Replayed the route-presence assertion against the immutable RED commit using explicit Node TAP; `RED_EVIDENCE_OK` then passed before the GREEN commit. This is an ordering deviation, not a claim of a clean gate sequence.
- Task 3 RED used an explicit Node TAP route-presence probe and passed `RED_EVIDENCE_OK` before production edits. Both tasks have RED commits preceding GREEN commits; no refactor was needed.
- Tab test was corrected to inspect anchor attributes independently of SSR attribute order; lint cleanup invokes the mocked-pathname layout directly.

## Known Stubs

None introduced. Existing shared device actions intentionally remain disabled without handlers, and three unavailable signals remain explicitly labeled pending firmware/backend support per D-07. Static fixtures and unauthenticated prototype routes remain the accepted phase contract.

## Deferred Issues

Known full-suite Realtime timeout and existing skipped test remain recorded in the phase deferred-items and cross-phase WINDOWS ledger. No new backend/auth trust boundary was introduced: the five route files only consume fixture/shared UI code, plus Next navigation and links.

## Self-Check: PASSED

All seven created files exist. All five listed task commits exist. Final production build, scoped tests, typecheck and scoped lint pass. Full-suite failure is explicitly reported above.
