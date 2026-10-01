---
phase: 07-html-prototype-caregiver-parent
plan: 03
subsystem: ui
tags: [react, device-management, risk-history]
status: complete
requires:
  - phase: 07-01
    provides: Real-shaped device and readings fixtures
  - phase: 07-02
    provides: ConnectionStatus
provides:
  - Hourly last-reading digest and ordered risk timeline
  - Honest device selection list using shared DeviceCard
  - Shared device details composition with neutral connection action
affects: [07-05, 07-06, 07-07, 10]
tech-stack:
  added: []
  patterns: [Shared documented compositions, Explicit disabled unwired actions]
key-files:
  created: [src/lib/fixtures/risk-history.ts, src/components/patterns/risk-timeline.tsx, src/components/patterns/device-select-list.tsx, src/components/patterns/device-details.tsx, src/app/design-system/docs/_lib/device-history-examples.tsx, tests/prototype.timeline.test.ts, tests/prototype.device-select-list.test.ts, tests/prototype.device-details.test.ts]
  modified: [docs/DESIGN-SYSTEM.md, src/app/design-system/docs/_lib/categories.ts, src/app/design-system/docs/_lib/component-content.ts, src/app/design-system/docs/_lib/component-docs.tsx, src/app/design-system/docs/_lib/component-examples.tsx]
key-decisions:
  - DeviceDetails accepts optional onConnectionChange; absent handlers leave the neutral action disabled.
  - Disconnected device freshness is stale even when its last reading is recent.
requirements-completed: [CARE-03, CARE-05, CARE-06, PARENT-04]
actuals:
  tokens: 8165
  tasks: 3
  commits: 7
plan_head_before: cade29febba3b6d4cdee2fd117845d1cc8a91833
duration: 9min
completed: 2026-10-01
---

# Phase 7 Plan 3: Risk history and device compositions Summary

Hourly risk history preserves original timestamps, device selection reuses DeviceCard, and both future device destinations share one DeviceDetails composition.

## Accomplishments

- getRiskHistory selects each local calendar hour's last reading, sorts newest-first, and does not mutate input. RiskTimeline preserves caller order and combines status icon, word, color, and semantic time; empty data has the required literal copy.
- DeviceSelectList renders only supplied devices, links through hrefFor, and uses DeviceCard for its entire visual treatment.
- DeviceDetails composes Card, DeviceTileRow, BatteryIndicator, ConnectionStatus, Badge, and Button. All sensor-contact labels and connection states are covered.
- Added source design notes, live controlled previews with matching copyable code, API/token documentation, navigation entries, and shared-system guidance for all three patterns.

## Task Commits

1. `31e9f3d` — Task 1 RED: timeline contract and validated evidence.
2. `0940d03` — Task 1 GREEN: hourly digest and timeline.
3. `fd886dc` — Task 2 RED: device selection and validated evidence.
4. `756c446` — Task 2 GREEN: DeviceCard list composition.
5. `708f1d1` — Task 3 RED: device details and validated evidence.
6. `0c9e9d9` — Task 3 GREEN: shared device details.
7. `1612d41` — Shared live documentation parity.

## Verification

- All 10 tests in the three planned test files pass.
- All three RED records returned RED_EVIDENCE_OK for the named missing-artifact assertion before implementation. Remaining behavior tests use dynamic imports so test discovery succeeds before the source exists.
- Scoped ESLint passed for components, helper, and documentation changes.
- Production build passed with TypeScript and all 45 pages, including the three new docs routes.
- No rendered browser comparison performed; phone wrapping is supported by min-width and wrapping layout contracts but not visually certified.
- Full npm test deferred to phase close by the orchestrator due to the existing Realtime concurrency flake; recorded in WINDOWS.md.

## Deviations from Plan

- [Rule 2 - correctness] Disabled unwired pairing/connection actions rather than rendering misleading active no-op buttons. Added optional onConnectionChange so route consumers can enable a demo or real action without duplicating the composition.
- [Rule 1 - correctness] Disconnected freshness explicitly uses stale and labels battery last known, preventing a recently disconnected device from saying Live.
- [Rule 2 - AGENTS parity] Expanded declared files to include live docs, source notes, navigation, API and token descriptions, and shared-system documentation.
- The device-name test counts visible text rather than all raw string occurrences because DeviceCard deliberately repeats its name in accessible battery labels.

## Known Stubs

- `src/components/patterns/device-select-list.tsx:10`: Pairing is intentionally unavailable in the unused zero-device state; Pair a device is disabled pending future pairing integration. This is expressly permitted by the plan and not used by current routes; recorded in WINDOWS.md.
- DeviceDetails is presentational as planned. Its optional connection handler is left to the consuming routes in 07-06/07-07; omission explicitly disables the button.

## Integration Notes

- Fixture-render failures must be handled by the containing route error boundary and its required retry copy. These compositions introduce no async loads or private fixture-render guard.
- No new security boundary or network endpoint was introduced; fixture strings render through JSX escaping.

## Self-Check: PASSED

All seven implementation/documentation commits exist, all created source/test/docs files are present, and scoped tests and production compilation passed.
