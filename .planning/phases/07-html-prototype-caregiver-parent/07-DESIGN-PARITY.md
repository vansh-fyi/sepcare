# Frontend and example parity — 2026-10-19

This maintenance update applies the latest design-system decisions to the existing Phase 7 Next.js frontend. It does not advance backend/live-integration phases or replace the Phase 7 data contract. Current shared implementation and docs supersede historical visual experiments in Phase 6 plans.

| Surface | Frontend consumers | Shared implementation and example parity |
| --- | --- | --- |
| Viewport | caregiver/layout, parent/layout | ClinicalScreen: white canvas, stationary header, independently scrolling main, matching content geometry. Caregiver navigation is a static flex child, matching the example. Static-data notice remains explicit. |
| Header | caregiver chrome, parent/layout | DeviceHeader: common wordmark/action geometry. Parent supplies only settingsHref for its single device link; caregiver/contained example use both actions. |
| Home | caregiver/page, parent/page | HomeOverview: InfantStatusSection, HomeVitals, See all, and state-specific instructions. Preserve real fixture values/Celsius/activity score. Caution and critical no longer show routine safe feeding guidance. |
| Vitals | VitalsView in both roles | ClinicalMetricGrid matches the example grid. Three supported numeric summaries, three unavailable signals, unscored semantics and risk history remain intact. |
| Stats | StatsView in both roles | Shared TrendTimeScale and ClinicalMetricGrid, 2/4/6/8/10/12/24H and default 4H. getTrendWindow retains all readings with their original timestamps; no interpolation, smoothing, or resampling. |
| Settings | caregiver/settings, parent/device/[deviceId] | Shared DeviceDetails, also consumed by the clinical example. Includes connection pulse, battery, freshness, contact, and disabled connection control. Removed the example-only unwired reminders preference. |

## Product constraints retained

07-CONTEXT D-01/D-02: these are existing Next.js fixture-driven routes, not detached HTML awaiting a port. D-03: parent See all reaches the same Vitals/Stats through two tabs, without persistent Home navigation. D-04: one device selection entry before details. D-05: caregiver Settings and parent Device Details remain the same composition. D-06/D-07: unsupported HRV, perfusion, and respiratory summaries remain unavailable; the illustrative design example does not establish backend support. CARE-02 retains redundant icon/text/color risk coding. CARE-03 retains risk history. No telemetry, transport or connection-control endpoint is invented.

The seven-option selector supersedes the earlier prototype's 1/6/24H presentation; the filtering helper still accepts 1H for existing data-window callers. Status tone scenarios remain example fixtures, not clinical risk calculations. See docs/DESIGN-SYSTEM.md and source DESIGN notes for current visual/API contracts.

## Verification

Production build and TypeScript passed. Targeted ESLint passed (including the touched frontend routes, compositions, documentation metadata, and updated tests). Twenty focused design-system/prototype test files passed, 83 tests total. Tests cover shared Home content, state-specific instructions, unsupported/unscored signals, original chart timestamps across all seven ranges, parent/caregiver data parity, and navigation destinations. The caregiver page was inspected through its rendered accessibility tree, and a narrow Settings viewport was visually checked. A complete rendered phone/tablet/desktop comparison of every screen was not performed.
