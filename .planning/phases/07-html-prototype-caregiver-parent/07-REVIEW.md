---
phase: 07-html-prototype-caregiver-parent
reviewed: 2026-10-02
depth: standard
diff_base: d290ae213733dd1b37af9b66ab56734ed8f65635
files_reviewed: 68
files_reviewed_list:
  - docs/BUILD.md
  - docs/DESIGN-SYSTEM.md
  - package.json
  - src/app/(prototype)/caregiver/_components/chrome.tsx
  - src/app/(prototype)/caregiver/layout.tsx
  - src/app/(prototype)/caregiver/page.tsx
  - src/app/(prototype)/caregiver/settings/page.tsx
  - src/app/(prototype)/caregiver/stats/page.tsx
  - src/app/(prototype)/caregiver/vitals/page.tsx
  - src/app/(prototype)/parent/detail/layout.tsx
  - src/app/(prototype)/parent/detail/stats/page.tsx
  - src/app/(prototype)/parent/detail/vitals/page.tsx
  - src/app/(prototype)/parent/device/[deviceId]/page.tsx
  - src/app/(prototype)/parent/device/page.tsx
  - src/app/(prototype)/parent/layout.tsx
  - src/app/(prototype)/parent/page.tsx
  - src/app/design-system/docs/_lib/categories.ts
  - src/app/design-system/docs/_lib/component-content.ts
  - src/app/design-system/docs/_lib/component-docs.tsx
  - src/app/design-system/docs/_lib/component-examples.tsx
  - src/app/design-system/docs/_lib/connection-status-example.tsx
  - src/app/design-system/docs/_lib/device-history-examples.tsx
  - src/app/design-system/docs/_lib/status-summary-examples.tsx
  - src/app/design-system/docs/connection-status/page.tsx
  - src/app/design-system/docs/device-details/page.tsx
  - src/app/design-system/docs/device-select-list/page.tsx
  - src/app/design-system/docs/risk-timeline/page.tsx
  - src/components/patterns/connection-status.DESIGN.md
  - src/components/patterns/connection-status.tsx
  - src/components/patterns/device-details.DESIGN.md
  - src/components/patterns/device-details.tsx
  - src/components/patterns/device-select-list.DESIGN.md
  - src/components/patterns/device-select-list.tsx
  - src/components/patterns/infant-status-section.DESIGN.md
  - src/components/patterns/infant-status-section.tsx
  - src/components/patterns/risk-timeline.DESIGN.md
  - src/components/patterns/risk-timeline.tsx
  - src/components/patterns/stats-view.DESIGN.md
  - src/components/patterns/stats-view.tsx
  - src/components/patterns/vital-detail-card.DESIGN.md
  - src/components/patterns/vital-detail-card.tsx
  - src/components/patterns/vitals-view.DESIGN.md
  - src/components/patterns/vitals-view.tsx
  - src/lib/fixtures/connection-status.ts
  - src/lib/fixtures/device.ts
  - src/lib/fixtures/readings.ts
  - src/lib/fixtures/risk-history.ts
  - src/lib/fixtures/risk-status.ts
  - src/lib/fixtures/trend-window.ts
  - src/lib/fixtures/vital-metrics.ts
  - tests/prototype.caregiver-home.test.ts
  - tests/prototype.caregiver-nav.test.ts
  - tests/prototype.caregiver-settings.test.ts
  - tests/prototype.caregiver-vitals.test.ts
  - tests/prototype.connection-initial-render.test.ts
  - tests/prototype.connection-status.test.ts
  - tests/prototype.device-details.test.ts
  - tests/prototype.device-select-list.test.ts
  - tests/prototype.fixtures.test.ts
  - tests/prototype.parent-detail.test.ts
  - tests/prototype.parent-device.test.ts
  - tests/prototype.parent-home.test.ts
  - tests/prototype.stats.test.ts
  - tests/prototype.status.test.ts
  - tests/prototype.timeline.test.ts
  - tests/prototype.trend-window.test.ts
  - tests/prototype.unscored-risk.test.ts
  - tests/prototype.vital-detail-card-unavailable.test.ts
findings:
  critical: 2
  warning: 1
  info: 0
  total: 3
status: issues_found
---

# Phase 7: Code Review Report

Reviewed Phase 7 source changes identified by the eight plan summaries and their implementation-base diff. Scope includes routes, fixture mapping, shared compositions, documentation consumers, and regression tests. Existing shared dependencies were followed where needed. No source files were changed. No full suite was repeated. Structural pre-pass is disabled in project configuration.

## Narrative Findings (AI reviewer)

### CR-01: BLOCKER — Missing assessments become reassuring clinical states

**Files:** `/Users/hp/Desktop/Work/Repositories/sepcare/src/lib/fixtures/vital-metrics.ts:14` (also lines 22 and 32); `/Users/hp/Desktop/Work/Repositories/sepcare/src/components/patterns/vitals-view.tsx:35`.

**Issue:** The real transport explicitly permits `risk: null`. Optional chaining followed by a truthiness condition interprets missing breakdowns as false abnormalities and emits `safe`. VitalsView also converts a null historical assessment into green before rendering a literal Safe timeline row. Thus one view can say “Risk status not yet calculated” while showing Safe history, green numeric values, and an accessible “Stable · Latest reading” announcement. Empty readings also produce green supported-metric cards. A missing ratio or baseline must not be presented as established normality.

**Evidence:** A direct executable probe of getVitalMetric returned `{status:"safe",value:39,unit:"°C"}` for a 39°C reading with null risk, and `{status:"safe",description:"No readings yet"}` without an entry. The historical fallback is unconditional for every null-risk hourly entry. Existing tests check missing numeric values but omit assertions rejecting Safe/Stable labels.

**Fix:** Represent unknown assessment independently from unsupported hardware. Preserve measured temperature/activity values while using a neutral unknown/unscored treatment when the necessary assessment is absent; keep missing ratio/baseline states explicit. Preserve unknown timeline rows or explicitly omit unassessed rows with honest empty-state copy. Do not coerce them to green. Update shared card/timeline APIs, docs, and both Vitals/Stats consumers together. Add null-risk and empty-input regression assertions for both visible and accessible output.

### CR-02: BLOCKER — Time-dependent first renders cause hydration failures

**Files:** `/Users/hp/Desktop/Work/Repositories/sepcare/src/components/patterns/connection-status.tsx:16`; `/Users/hp/Desktop/Work/Repositories/sepcare/src/app/design-system/docs/_lib/connection-status-example.tsx:11`; `/Users/hp/Desktop/Work/Repositories/sepcare/src/app/design-system/docs/_lib/device-history-examples.tsx:20` (also lines 28 and 34).

**Issue:** ConnectionStatus initializes its first rendered clock from Date.now separately on the server and browser. The static caregiver Settings page embeds a module-load lastSyncedAt and prerendered Live state; loading the production page after the freshness threshold renders stale on the client instead. Even already-stale output differs when its rounded elapsed minutes change. React receives different text and icon subtrees and must recover hydration.

The new documentation examples separately construct visible code strings with time-dependent values: ConnectionStatusExample initializes lastSyncedAt from Date.now, and DeviceHistoryExample serializes DEVICE, whose lastSyncedAt is generated separately by server and browser module evaluation. These snippets mismatch even if ConnectionStatus itself is repaired.

**Evidence:** With fixed lastSyncedAt=170000, the same freshness computation produces live at server now=180000 and stale at browser now=300000. Both now values are explicitly independently initialized by the component. The example code includes the differing timestamp as rendered text.

**Fix:** Make initial markup deterministic. Pass a serialized initial reference time or render a neutral deterministic initial state and initialize the live clock after mounting; refresh immediately on mount and retain interval cleanup. Use fixed sample timestamps or server-serialized fixture props for documentation snippets. Cover delayed hydration and verify no recoverable hydration error rather than only rendering each component independently with renderToStaticMarkup.

### WR-01: WARNING — Device selection list lacks required list-item semantics

**File:** `/Users/hp/Desktop/Work/Repositories/sepcare/src/components/patterns/device-select-list.tsx:15`.

**Issue:** ItemGroup emits role=list. Each Item uses asChild to become a direct anchor, but Item does not add role=listitem and no wrapper supplies it. The resulting list has no semantic list items, so assistive technology cannot reliably announce its device count and list structure. RiskTimeline explicitly supplies listitem, but DeviceSelectList does not.

**Fix:** Wrap each existing link/card in a semantic list item (for example a div with role=listitem inside ItemGroup), retaining the inner anchor's link role. Do not replace the anchor's link role with listitem. Add an accessibility/markup assertion that every direct list child is a list item containing the navigable device link.

## Review limits

This is a source and focused executable review, not a rendered browser certification. The parent orchestrator owns integration checks, fixes, and subsequent re-review. Static sample data and intentionally disabled unwired device actions are documented scope choices and were not treated as defects.

_Reviewer: gsd-code-reviewer_

