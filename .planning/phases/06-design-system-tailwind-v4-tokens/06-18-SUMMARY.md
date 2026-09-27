---
phase: 06-design-system-tailwind-v4-tokens
plan: 18
subsystem: ui
tags: [nextjs, tailwind-v4, design-system-docs, badge, progress, battery-indicator, toggle-group, chart, sparkline, recharts]

requires:
  - phase: 06-design-system-tailwind-v4-tokens
    provides: "Figma-verified/token-consistent Badge/Progress/BatteryIndicator/ToggleGroup (06-08); restyled Chart primitives (06-14); hand-authored Sparkline/VitalsTrendChart (06-15); the persistent docs sidebar shell + shared docs/_lib helpers + per-category sidebar-linking pattern (06-11/06-16/06-17)"
provides:
  - "Live Badge docs route proving DESIGN-SYSTEM.md §9's multi-modal rule (icon+label+color, never color alone) via a real status picker plus a side-by-side crossed-out 'color alone' forbidden-pattern mock"
  - "Live Progress + BatteryIndicator docs route with a real 0-100 slider driving both the generic Progress bar and BatteryIndicator simultaneously from the same shared primitive"
  - "Live ToggleGroup docs route proving the CARE-04 cross-phase reuse contract with two independent, differently-labeled instances (1D/1W/1M and 1h/6h/24h) on the same component"
  - "Live Chart docs route (VitalsTrendChart) with mock time-series data and a non-reflowing 'No data for this range yet.' empty-state toggle"
  - "Live Sparkline docs route with 3 mock trend shapes (rising/falling/flat), the same empty-state toggle, and an explicit callout distinguishing it from Chart"
  - "Feedback/Status and Data Viz docs sidebar categories wired to real links, closing the last two of 06-11's six deferred 'Coming soon' placeholders"
affects: [06-19, 06-20, 06-21]

actuals:
  tokens: 9440
  tasks: 3
  commits: 4
  plan_head_before: 3ccd0113240bacdb59681c29642b1dae17772b2e

tech-stack:
  added: []
  patterns:
    - "Radix-uncontrolled-state docs pages stay pure Server Components even for a 'live, interactive' requirement — ToggleGroup already manages its own client-side state, so /docs/toggle-group/page.tsx needed no playground file at all, extending 06-16's 'Radix-backed fields stay Server Components' pattern to a component with two independent live instances on one page."
    - "Client-playground-only-for-genuine-useState split extended to Recharts-backed components: chart-playground.tsx/sparkline-playground.tsx hold only the empty-state toggle's useState; VitalsTrendChart/Sparkline themselves are already Client Components (DOM measurement), so the split exists purely to keep the surrounding page.tsx a Server Component that reads live globals.css tokens via node:fs."

key-files:
  created:
    - src/app/design-system/docs/badge/page.tsx
    - src/app/design-system/docs/badge/badge-playground.tsx
    - src/app/design-system/docs/progress/page.tsx
    - src/app/design-system/docs/progress/progress-playground.tsx
    - src/app/design-system/docs/toggle-group/page.tsx
    - src/app/design-system/docs/chart/page.tsx
    - src/app/design-system/docs/chart/chart-playground.tsx
    - src/app/design-system/docs/sparkline/page.tsx
    - src/app/design-system/docs/sparkline/sparkline-playground.tsx
  modified:
    - src/app/design-system/docs/_lib/categories.ts

key-decisions:
  - "Badge's 'color alone' Incorrect-usage mock is not a static screenshot — it re-renders live for whichever status is currently selected in the picker (same COLOR_ONLY_BG map keyed by BadgeStatus), so the reader sees the exact forbidden treatment for the status they just picked, not a single frozen example."
  - "ToggleGroup's docs page required no client 'playground' file, unlike Badge/Progress/Chart/Sparkline — Radix's ToggleGroup already manages type=\"single\" state uncontrolled client-side (it carries its own \"use client\" directive), so two independent <ToggleGroup defaultValue=...> instances in a pure Server Component page are already live and clickable, extending 06-16's 'Radix-backed fields stay Server Components' pattern."
  - "Progress/BatteryIndicator share one docs route (not two) since they share one primitive (progress.tsx) per the plan's own explicit instruction — a single 0-100 range slider (no dedicated Slider component exists in this project's scope) drives both simultaneously, plus a bonus Charging checkbox toggle to demonstrate BatteryIndicator's second prop live."
  - "Chart/Sparkline both needed a small client 'playground' file (chart-playground.tsx/sparkline-playground.tsx) holding only the empty-state useState — VitalsTrendChart and Sparkline are themselves already Client Components (Recharts' ResponsiveContainer needs DOM measurement), so the split's sole purpose is keeping the surrounding page.tsx a Server Component able to read live globals.css tokens via node:fs, matching 06-16's established split rationale exactly."
  - "Applied /emil-ui-polish's tabular-nums principle post-hoc to progress-playground.tsx's two live percentage readouts (the slider label and the bare Progress bar's adjacent span) after invoking the D-13-mandated skills — a small Rule 2 deviation, not part of the original draft, since a value that changes on every slider drag is exactly the 'anything that changes' case the principle names."

patterns-established:
  - "A component that already manages its own uncontrolled client-side state (ToggleGroup, and by extension any future Radix primitive with type=\"single\"/\"multiple\" state) needs zero client wrapper to satisfy a 'live, interactive, multiple simultaneous instances' docs requirement — check this before reflexively adding a playground file."

requirements-completed: [DSYS-01, DSYS-02, DSYS-03]

coverage:
  - id: D1
    description: "Badge docs page (badge/page.tsx + badge-playground.tsx): real clickable status picker (ToggleGroup) driving a live Badge re-render, plus a side-by-side crossed-out 'color alone' mock proving the multi-modal rule live"
    requirement: DSYS-01
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/badge)"
        status: pass
      - kind: other
        ref: "grep -c \"<pre\" src/app/design-system/docs/badge/page.tsx -> 0"
        status: pass
    human_judgment: true
    rationale: "Whether the crossed-out mock genuinely reads as 'forbidden pattern' rather than a second real variant, and whether the picker/preview meets D-13's shadcn-quality bar, is a visual/UX judgment no automated check can certify."
  - id: D2
    description: "Progress + BatteryIndicator docs page (progress/page.tsx + progress-playground.tsx): real 0-100 slider driving both the generic Progress bar and BatteryIndicator simultaneously from the same shared primitive, plus a Charging toggle"
    requirement: DSYS-01
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/progress)"
        status: pass
      - kind: other
        ref: "grep -c \"<pre\" src/app/design-system/docs/progress/page.tsx -> 0"
        status: pass
    human_judgment: true
    rationale: "Whether the slider-driven divergence between the two use cases reads clearly, and whether the tabular-nums fix fully resolves digit jitter, is a visual judgment a human should confirm on real interaction."
  - id: D3
    description: "ToggleGroup docs page (toggle-group/page.tsx, pure Server Component): two independent live instances (1D/1W/1M and 1h/6h/24h) on the same underlying component, proving the CARE-04 cross-phase reuse contract live rather than in prose alone"
    requirement: DSYS-02
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/toggle-group)"
        status: pass
      - kind: other
        ref: "grep -c \"1h\\|6h\\|24h\" src/app/design-system/docs/toggle-group/page.tsx -> 10"
        status: pass
    human_judgment: true
    rationale: "Whether the two live instances genuinely feel independently interactive (not a static side-by-side image) is a judgment call a human should confirm by clicking both."
  - id: D4
    description: "Chart (chart/page.tsx + chart-playground.tsx) and Sparkline (sparkline/page.tsx + sparkline-playground.tsx) docs pages: live mock data, a non-reflowing 'No data for this range yet.' empty-state toggle on both, and an explicit callout distinguishing Sparkline's chromeless purpose from Chart's fully-labeled purpose"
    requirement: DSYS-01
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/chart and /design-system/docs/sparkline)"
        status: pass
      - kind: other
        ref: "grep -rc \"No data for this range yet\" src/app/design-system/docs/chart/page.tsx src/app/design-system/docs/sparkline/page.tsx -> 1, 1"
        status: pass
    human_judgment: true
    rationale: "Whether toggling genuinely produces zero visible reflow (beyond the component's own height prop staying fixed, which is mechanically true) and whether the Sparkline-vs-Chart distinction reads clearly are judgment calls a human should confirm on real interaction; the Recharts SSR console warning during static generation (documented under Issues Encountered) is also a real-render characteristic a human should sanity-check in a live browser."
  - id: D5
    description: "npm run build compiles cleanly with all 5 new docs routes in place, alongside every pre-existing route, and both new sidebar categories (Feedback/Status, Data Viz) render real links instead of 'Coming soon'"
    requirement: DSYS-03
    verification:
      - kind: other
        ref: "npm run build (exit 0, all 31 routes including the 5 new Feedback/Status & Data Viz routes statically generated)"
        status: pass
    human_judgment: false

duration: 45min
completed: 2026-09-27
status: complete
---

# Phase 6 Plan 18: Feedback/Status & Data Viz Docs Category Summary

**Built 5 live, interactive design-system docs routes (Badge, Progress/BatteryIndicator, ToggleGroup, Chart, Sparkline) inside the 06-11 sidebar shell, each proving its component's specific behavioral contract — multi-modal color rule, cross-phase reuse, non-reflowing empty states — live rather than describing it in prose, and wired the last two deferred sidebar categories to real links.**

## Performance

- **Duration:** 45 min
- **Started:** 2026-09-27T04:40:00Z (approx.)
- **Completed:** 2026-09-27T05:25:00Z
- **Tasks:** 3
- **Files modified:** 10 (9 created, 1 modified)

## Accomplishments

- Built `docs/badge/page.tsx` (+ `badge-playground.tsx`): a real `ToggleGroup`-driven status
  picker cycling `safe`/`caution`/`critical`, re-rendering the actual `Badge` component live, next
  to a side-by-side "color alone" mock — the same background color with no icon and no text label,
  crossed out with a red slash and labeled "Forbidden" — that updates for whichever status is
  currently picked, proving DESIGN-SYSTEM.md §9's multi-modal rule live rather than only in prose.
- Built `docs/progress/page.tsx` (+ `progress-playground.tsx`): a single real 0-100 range slider
  driving both the generic `Progress` bar and the `BatteryIndicator` composite simultaneously from
  the same shared `progress.tsx` primitive, plus a bonus `Charging` checkbox toggle demonstrating
  `BatteryIndicator`'s second prop live.
- Built `docs/toggle-group/page.tsx` as a **pure Server Component** — no playground file needed,
  since Radix's `ToggleGroup` already manages its `type="single"` state uncontrolled client-side.
  Renders two fully independent, real `ToggleGroup` instances side by side: this phase's `1D/1W/1M`
  time-scale set and Phase 7's caregiver trend-graph set (`1h/6h/24h`, REQUIREMENTS.md CARE-04),
  proving the cross-phase reuse contract live on the exact same underlying component.
- Built `docs/chart/page.tsx` (+ `chart-playground.tsx`): a live `VitalsTrendChart` with mock
  hourly perfusion-index time-series data and a toggle switching to the locked
  `"No data for this range yet."` empty-state copy, sized identically via the component's own fixed
  `height` prop — no reflow between states.
- Built `docs/sparkline/page.tsx` (+ `sparkline-playground.tsx`): three live `Sparkline` instances
  with distinct mock trend shapes (rising/falling/flat) plus the same empty-state toggle, and an
  explicit prose callout distinguishing `Sparkline`'s chromeless purpose from `Chart`'s
  fully-labeled purpose, per `06-UI-SPEC.md`'s explicit warning not to conflate the two.
- Wired the `Feedback/Status` (Badge, Progress, Toggle Group) and `Data Viz` (Chart, Sparkline)
  sidebar categories in `docs/_lib/categories.ts` to real links — the last two of the six original
  categories 06-11 deferred to "Coming soon," now all six populated across 06-16/06-17/06-18.
- Invoked `/emil-design-vocabulary`, `/emil-ui-polish`, and `/emil-animations` skills per D-13
  during the build, then applied a follow-up fix: `progress-playground.tsx`'s two live percentage
  readouts (the slider label and the bare `Progress` bar's adjacent span) were missing
  `tabular-nums` — a value that changes on every slider drag is exactly the "anything that changes"
  case `/emil-ui-polish`'s principle #3 names. No mount-time entrance animation was added to any of
  the 5 new pages (principle 8), and every interactive element's press/hover feedback is inherited
  from its own already-built component (`Button`, `ToggleGroupItem`, `Checkbox`) rather than
  reinvented.

## Task Commits

Each task was committed atomically:

1. **Task 1: Docs routes for Badge and Progress/BatteryIndicator** - `681d4bd` (feat)
2. **Task 2: Docs route for ToggleGroup, proving cross-phase reuse** - `891eb77` (feat)
3. **Task 3: Docs routes for Chart and Sparkline** - `cfac7b1` (feat, also wires the
   Feedback/Status + Data Viz sidebar categories)
4. **Follow-up: tabular-nums fix from the D-13 skill-compliance pass** - `5cae7af` (fix)

**Plan metadata:** (this commit, docs)

_Plan head before this plan: `3ccd0113240bacdb59681c29642b1dae17772b2e`. Commits measured: 4
(`git rev-list --count 3ccd0113240bacdb59681c29642b1dae17772b2e..HEAD`)._

## Files Created/Modified

- `src/app/design-system/docs/badge/page.tsx` / `badge-playground.tsx` - Live Badge docs route
  (status picker + Incorrect-usage mock)
- `src/app/design-system/docs/progress/page.tsx` / `progress-playground.tsx` - Live Progress +
  BatteryIndicator docs route (shared-slider demo)
- `src/app/design-system/docs/toggle-group/page.tsx` - Live ToggleGroup docs route (pure Server
  Component, two independent instances)
- `src/app/design-system/docs/chart/page.tsx` / `chart-playground.tsx` - Live Chart docs route
  (mock data + empty-state toggle)
- `src/app/design-system/docs/sparkline/page.tsx` / `sparkline-playground.tsx` - Live Sparkline
  docs route (3 trend shapes + empty-state toggle)
- `src/app/design-system/docs/_lib/categories.ts` - Populated Feedback/Status and Data Viz sidebar
  links

## Decisions Made

See `key-decisions` in frontmatter above — summarized: Badge's Incorrect-usage mock re-renders live
per the selected status rather than showing one frozen example; ToggleGroup's page needed no client
playground file at all since Radix already manages its uncontrolled state; Progress/BatteryIndicator
share one route since they share one primitive, driven by a single native range slider (no dedicated
Slider component exists in this project's scope) plus a bonus Charging toggle; Chart/Sparkline both
needed a small client playground purely to isolate the empty-state `useState`, since both components
are themselves already Client Components; a `tabular-nums` fix was applied post-hoc to the
Progress playground's live percentage readouts during the mandated D-13 skill-compliance pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Wired the Feedback/Status and Data Viz sidebar categories to real links**
- **Found during:** Task 3
- **Issue:** The plan's own `<files>` tags only listed the 5 `page.tsx` routes, but
  `docs/_lib/categories.ts`'s `Feedback/Status` and `Data Viz` entries still had empty `links: []`
  — the last two of 06-11's six original "Coming soon" placeholders. Without wiring, all 5 new
  routes this plan builds would be unreachable from the sidebar shell they are explicitly built
  "inside of."
- **Fix:** Populated both categories following 06-16/06-17's exact `{ name, links }` shape — no
  other category was touched. Since all 5 routes already existed in prior commits within this same
  plan by the time this fix landed, no commit in this plan's history contains a sidebar link with
  no matching route.
- **Files modified:** `src/app/design-system/docs/_lib/categories.ts`
- **Verification:** `npm run build` exits 0; sidebar renders real links for both categories.
- **Committed in:** `cfac7b1` (Task 3 commit)

**2. [Rule 1 - Bug] Fixed a grep-check-breaking line wrap in chart/page.tsx**
- **Found during:** Task 3, post-write verification
- **Issue:** The locked empty-state copy `"No data for this range yet."` was written across a JSX
  text line-wrap boundary (`&ldquo;No data for this range` / `yet.&rdquo;` on the next line),
  so the plan's own verify grep (`grep -rc "No data for this range yet" ... chart/page.tsx`)
  returned `0` — the phrase existed visually in rendered prose but not on a single source line.
- **Fix:** Reflowed the paragraph so the full phrase sits on one line.
- **Files modified:** `src/app/design-system/docs/chart/page.tsx`
- **Verification:** `grep -rc "No data for this range yet" src/app/design-system/docs/chart/page.tsx src/app/design-system/docs/sparkline/page.tsx` -> `1, 1`; `npm run build` exits 0.
- **Committed in:** `cfac7b1` (fixed before commit, not a follow-up)

**3. [Rule 2 - Missing Critical] Applied tabular-nums to Progress playground's live percentage readouts**
- **Found during:** Post-Task-3 D-13 skill-compliance pass (`/emil-ui-polish`)
- **Issue:** `progress-playground.tsx`'s slider label (`Level: {level}%`) and the bare `Progress`
  bar's adjacent percentage span both re-render on every slider drag but were missing
  `tabular-nums` — exactly the "anything that changes" case `/emil-ui-polish`'s principle #3 names,
  which this phase's own `docs/typography/page.tsx` (06-11) and `--text-vital-metric` role already
  established as the project's convention for dynamic numeric readouts.
- **Fix:** Added `tabular-nums` to both elements.
- **Files modified:** `src/app/design-system/docs/progress/progress-playground.tsx`
- **Verification:** `npm run build` exits 0.
- **Committed in:** `5cae7af` (follow-up commit)

---

**Total deviations:** 3 auto-fixed (2 Rule 2 - missing critical functionality, 1 Rule 1 - bug in
this plan's own verify-check-breaking line wrap).
**Impact on plan:** All three were necessary for the plan's own stated deliverable (live,
reachable, verify-check-compliant, polish-compliant docs routes) to actually hold — no scope creep
beyond what completing this plan's own must_haves required.

## Issues Encountered

- **Recharts SSR console warning during `npm run build`'s static-generation pass:** three
  `The width(-1) and height(-1) of chart should be greater than 0...` warnings appeared in the
  build log while prerendering the new Chart/Sparkline docs pages. This is a well-known, benign
  Recharts + Next.js static-generation interaction — `ResponsiveContainer` measures `0`/negative
  dimensions during the server-side prerender pass (no real DOM to measure against) and
  self-corrects via `ResizeObserver` on client hydration in the browser. The build still exits `0`
  and every route statically generates successfully; this is the first plan to render
  `VitalsTrendChart`/`Sparkline` live inside a statically-generated page (06-15 built the
  components but consumed neither live yet), so this is the first point in the phase where the
  warning surfaces, not a regression this plan introduced into either component. Not fixed —
  fixing would mean wrapping both in a `dynamic(..., { ssr: false })` import, an architectural
  change to how the components render that is out of this plan's scope and would remove their
  ability to appear in the pre-rendered HTML at all. Flagged here for whichever later plan
  (06-20's Home-proof) next renders either component live, so it isn't rediscovered as a surprise.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 Feedback/Status & Data Viz docs routes are live, reachable, and build-clean — ready for
  the deferred visual-quality pass (D-13's "shadcn-quality or better" bar is a human judgment
  call, not automatable).
- All six of `docs/_lib/categories.ts`'s original component categories (Actions, Forms, Cards,
  Navigation, Feedback/Status, Data Viz) are now fully populated across 06-16/06-17/06-18 — no
  "Coming soon" placeholders remain in the docs sidebar.
- The "check whether a component already manages uncontrolled state before reflexively adding a
  client playground file" pattern (established here for `ToggleGroup`) is available for any future
  docs plan touching another Radix primitive with its own internal state.
- The benign Recharts SSR console-warning characteristic (Issues Encountered above) is flagged for
  06-20's Home-proof page, which will be the next plan to render `Sparkline`/`VitalsTrendChart`
  live inside a statically-generated route.
- No blockers. Per D-13's mandate, `/emil-design-vocabulary`, `/emil-ui-polish`, and
  `/emil-animations` were invoked during this build; the compliance pass surfaced and fixed one
  small polish gap (tabular-nums), documented above as a deviation.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*

## Self-Check: PASSED

- FOUND: src/app/design-system/docs/badge/page.tsx
- FOUND: src/app/design-system/docs/badge/badge-playground.tsx
- FOUND: src/app/design-system/docs/progress/page.tsx
- FOUND: src/app/design-system/docs/progress/progress-playground.tsx
- FOUND: src/app/design-system/docs/toggle-group/page.tsx
- FOUND: src/app/design-system/docs/chart/page.tsx
- FOUND: src/app/design-system/docs/chart/chart-playground.tsx
- FOUND: src/app/design-system/docs/sparkline/page.tsx
- FOUND: src/app/design-system/docs/sparkline/sparkline-playground.tsx
- FOUND: src/app/design-system/docs/_lib/categories.ts (modified)
- FOUND commit: 681d4bd
- FOUND commit: 891eb77
- FOUND commit: cfac7b1
- FOUND commit: 5cae7af
- `npm run build` exits 0 (verified after all 3 tasks + the follow-up fix, all 31 routes generated)
- `grep -c "<pre" src/app/design-system/docs/{badge,progress}/page.tsx` -> 0, 0
- `grep -c "1h\|6h\|24h" src/app/design-system/docs/toggle-group/page.tsx` -> 10
- `grep -rc "No data for this range yet" src/app/design-system/docs/{chart,sparkline}/page.tsx` -> 1, 1
- `git rev-list --count 3ccd0113240bacdb59681c29642b1dae17772b2e..HEAD` -> 4 (matches `commits: 4` in frontmatter)
