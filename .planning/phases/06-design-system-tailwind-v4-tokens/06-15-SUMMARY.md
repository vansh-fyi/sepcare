---
phase: 06-design-system-tailwind-v4-tokens
plan: 15
subsystem: ui
tags: [tailwind-v4, figma, recharts, chart, sparkline, dual-axis, design-tokens, d15, d16]

requires:
  - phase: 06-14
    provides: "recharts@3.8.0 real dependency + restyled ChartContainer/ChartTooltip/ChartLegend primitives (chart.tsx) this plan builds directly on top of"
provides:
  - "Sparkline — chromeless single-Line Recharts wrapper for the 76x26px vitals-card trend slot"
  - "VitalsTrendChart — generic data/series ComposedChart supporting real dual-axis layouts, composing chart.tsx's ChartContainer/ChartTooltip/ChartLegend chrome"
  - "Both Figma-verified via the 06-FIGMA-EXTRACTS.md relay mechanism (D-15), documented in sparkline.DESIGN.md/vitals-trend-chart.DESIGN.md"
affects: [06-18, 06-20]

actuals:
  tokens: 5360
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "prefers-reduced-motion detection via window.matchMedia + isAnimationActive, since Recharts' own line-draw entrance animation is JS-driven (react-smooth) and not interceptable by Tailwind's motion-reduce: CSS variant"
    - "Series-config-driven conditional axis rendering: a second YAxis only renders when a series declares yAxisId:\"right\", so a component built for genuine dual-axis reuse doesn't force an unused second axis onto single-series data"

key-files:
  created:
    - src/components/ui/sparkline.tsx
    - src/components/ui/sparkline.DESIGN.md
    - src/components/ui/vitals-trend-chart.tsx
    - src/components/ui/vitals-trend-chart.DESIGN.md
  modified: []

key-decisions:
  - "Followed the plan's own figma_extraction_workaround note over 06-CONTEXT.md D-16's general dual-axis research framing: node 203-13216's real Figma frame is single-axis (one pink/red line, hourly X-axis, one numeric Y-axis) per 06-FIGMA-EXTRACTS.md's relayed extraction. VitalsTrendChart is built to genuinely support two Y-axes via Recharts' composable YAxis/yAxisId pattern (right axis renders only when a series opts in via yAxisId:\"right\"), but does not force a decorative unused second axis onto this specific single-series frame."
  - "Sparkline's default color prop stays var(--color-safe) (matching 06-RESEARCH.md's Pattern 1 code example) rather than defaulting to white, but sparkline.DESIGN.md documents — as an authoritative FIGMA-EXTRACTS.md finding, more specific than the plan's own speculative 'likely maps to status tokens' framing — that the real Vital Stat Card usage (node 266-9344) renders the line white-on-gradient via an explicit color=\"var(--color-text-inverse)\" override at that future call site, since the whole card background is itself the status-colored gradient."
  - "Legend (ChartLegend/ChartLegendContent) in VitalsTrendChart only renders when series.length > 1 - a single-series consumer (the real Perfusion Index Figma frame) shows no legend, matching that frame, while a genuine multi-series/dual-axis consumer gets one automatically without a separate prop."
  - "Neither component builds the full Perfusion Index card composition (icon tile, status pill, surrounding Card shell) - 06-15-PLAN.md's own <files> and <tasks> scope this plan to the two chart body components only; the full composition is 06-18 (docs preview) / 06-20 (Home-proof)'s job per this plan's own key_links, not rebuilt here despite chart.DESIGN.md's forward-looking note from 06-14 suggesting otherwise."

patterns-established:
  - "Chromeless-vs-fully-labeled chart split enforced by machine-checkable grep verify (no XAxis/YAxis/CartesianGrid/Tooltip/Legend substring anywhere in sparkline.tsx, including comments) - a durable regression guard against Sparkline ever silently accreting Chart's chrome."

requirements-completed: [DSYS-01, DSYS-02, DSYS-03]

coverage:
  - id: D1
    description: "Sparkline: chromeless single-Line Recharts wrapper, no axes/tooltip/legend/grid, Figma-verified against 266-9350 (Pulse) and 266-9363 (Temp)"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -c \"XAxis|YAxis|CartesianGrid|Tooltip|Legend\" src/components/ui/sparkline.tsx -> 0"
        status: pass
      - kind: other
        ref: "npm run build (exit 0)"
        status: pass
    human_judgment: true
    rationale: "Visual fidelity against the two Home-screen sparkline instances (height, stroke width, white-on-gradient color usage) requires an actual rendered screenshot comparison this executor cannot perform (no Figma MCP/browser tool access) - deferred to the orchestrator's post-dispatch screenshot-diff pass, same deferral pattern as every prior *.DESIGN.md in this phase."
  - id: D2
    description: "Sparkline empty state (\"No data for this range yet.\") sized identically to the populated state - no layout shift when data arrives"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -n \"style={{ height }}\" src/components/ui/sparkline.tsx -> both branches (lines 72, 87)"
        status: pass
    human_judgment: false
  - id: D3
    description: "VitalsTrendChart: dual-axis-capable ComposedChart, every Line/Bar/Area declares a matching yAxisId, composing chart.tsx's ChartContainer/ChartTooltip/ChartLegend chrome, generic data/series shape for Phase 7 reuse"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "grep -c \"yAxisId\" src/components/ui/vitals-trend-chart.tsx -> 8"
        status: pass
      - kind: other
        ref: "npm run build (exit 0)"
        status: pass
    human_judgment: true
    rationale: "Visual fidelity against Figma node 203-13216's real single-axis frame (gridline fade, axis tick styling, dot markers) requires an actual rendered screenshot comparison this executor cannot perform (no Figma MCP/browser tool access) - deferred to the orchestrator's post-dispatch screenshot-diff pass. There is also no consuming Perfusion Index card composition yet to screenshot against - that full composition is 06-18/06-20's job."
  - id: D4
    description: "VitalsTrendChart empty state sized to the populated chart's real height - no reflow"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "grep -n \"style={{ height }}\" src/components/ui/vitals-trend-chart.tsx -> both branches (lines 111, 126)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Both components respect prefers-reduced-motion on their Recharts entrance animation via window.matchMedia + isAnimationActive (a JS-driven animation, not CSS-interceptable)"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "grep -c \"prefers-reduced-motion\" src/components/ui/sparkline.tsx src/components/ui/vitals-trend-chart.tsx -> 1 each"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-09-27
status: complete
---

# Phase 6 Plan 15: Sparkline + Dual-Axis VitalsTrendChart Summary

**Hand-authored a chromeless single-Line `Sparkline` for the 76x26px vitals-card slot and a generically dual-axis-capable `VitalsTrendChart` on top of 06-14's restyled `chart.tsx` primitives, both Figma-verified via the 06-FIGMA-EXTRACTS.md relay mechanism.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-09-27T05:05:00Z (approx)
- **Completed:** 2026-09-27T05:30:00Z (approx)
- **Tasks:** 2
- **Files modified:** 4 (all new)

## Accomplishments

- Authored `sparkline.tsx` — a `"use client"` `ResponsiveContainer`/`LineChart`/single-`Line`
  wrapper with zero axis/grid/hover-popover/legend chrome, verified via a grep-based regression
  guard (`0` matches for `XAxis|YAxis|CartesianGrid|Tooltip|Legend`, including in comments — the
  first attempt tripped on a JSDoc comment literally naming those elements as things to avoid,
  fixed by rephrasing).
- Resolved the Figma-relay finding that the real Vital Stat Card usage (node `266-9344`) renders
  the sparkline line **white**, not status-colored, since the whole card background is itself the
  status gradient — documented in `sparkline.DESIGN.md` as more specific/authoritative than this
  plan's own speculative "Pulse/Temp likely map to status tokens" framing, while keeping the
  component's own default (`var(--color-safe)`) matching `06-RESEARCH.md`'s Pattern 1 example for
  generic reuse outside that gradient context.
- Authored `vitals-trend-chart.tsx` — a `ComposedChart` composing `chart.tsx`'s
  `ChartContainer`/`ChartTooltip`/`ChartLegend`, with a generic `data`/`series` shape (not
  hardcoded to `pulse`/`spo2`), so Phase 7 can feed real vitals field names without a rewrite.
- Implemented genuine dual-axis support per Recharts' `yAxisId` constraint (every `Line` must
  declare a matching `yAxisId` once any `YAxis` declares one) — the right axis and legend only
  render when a series actually opts in (`yAxisId: "right"` / `series.length > 1`), so the
  component doesn't force a decorative unused second axis or legend onto the single-series data
  that Figma node `203-13216`'s real frame actually shows.
- Re-inspected node `203-13216` via the 06-FIGMA-EXTRACTS.md relay and confirmed 06-CONTEXT.md
  D-16's "dual-axis" framing was a general vitals-dashboard research finding, not a literal Figma
  frame in this file — recorded this honestly in `vitals-trend-chart.DESIGN.md` rather than
  building a fake second axis to match the task name.
- Both components detect `prefers-reduced-motion` via `window.matchMedia` and pass the result to
  every `Line`'s `isAnimationActive` prop — Recharts' own line-draw entrance animation is
  JS-driven (`react-smooth`), so Tailwind's `motion-reduce:` CSS variant cannot intercept it.
- `npm run build` exits 0 with both components in place.

## Task Commits

1. **Task 1: Figma-verify + hand-author Sparkline** - `739ab9a` (feat)
2. **Task 2: Figma-verify + hand-author the dual-axis analytics chart** - `32a1922` (feat)

**Plan metadata:** (this commit, docs)

_Plan head before this plan: `e387fb7`. Commits measured: 2 (`git rev-list --count e387fb7..HEAD`)._

## Files Created/Modified

- `src/components/ui/sparkline.tsx` - Chromeless `Sparkline`, `"use client"`, `data`/`color`/
  `height` props, empty state, reduced-motion detection.
- `src/components/ui/sparkline.DESIGN.md` - Figma provenance (nodes `266-9350`/`266-9363`), the
  white-on-gradient color finding, props table, motion/accessibility notes.
- `src/components/ui/vitals-trend-chart.tsx` - `VitalsTrendChart`, `"use client"`, generic
  `data`/`series` shape, conditional dual-axis/legend rendering, empty state, reduced-motion
  detection.
- `src/components/ui/vitals-trend-chart.DESIGN.md` - Figma provenance (node `203-13216`), the
  single-axis-vs-D-16-framing resolution, dual-axis support mechanics, Correct/Incorrect usage
  pairs including the `yAxisId` mismatch anti-pattern.

## Decisions Made

See `key-decisions` in frontmatter above — summarized: followed the plan's own figma-extraction
workaround note over D-16's general research framing (real Figma frame is single-axis; component
built to genuinely support two axes without forcing one); kept `Sparkline`'s default color
matching `06-RESEARCH.md`'s pattern while documenting the real white-on-gradient usage;
auto-hide the legend for single-series `VitalsTrendChart` usage; scoped this plan strictly to the
two chart-body components per 06-15-PLAN.md's own `<files>`/`<tasks>`, not the full card
composition some 06-14 documentation gestured toward.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Sparkline's own JSDoc comment tripped its own chrome-regression grep check**
- **Found during:** Task 1
- **Issue:** The first draft's JSDoc comment literally named `XAxis`/`YAxis`/`CartesianGrid`/
  `Tooltip`/`Legend` (describing what the component must never include), which is exactly the
  substring the plan's own verify step (`grep -c "XAxis|YAxis|CartesianGrid|Tooltip|Legend"`)
  matches — the check doesn't distinguish prose from code, so the comment itself failed the gate.
- **Fix:** Rephrased the comment to describe the constraint without using any of those five
  literal identifiers ("no axis/grid/hover-popover/key chrome of any kind").
- **Files modified:** src/components/ui/sparkline.tsx
- **Verification:** `grep -c "XAxis|YAxis|CartesianGrid|Tooltip|Legend" src/components/ui/sparkline.tsx` -> `0`; `npm run build` exits 0.
- **Committed in:** `739ab9a` (Task 1 commit — fixed before commit, not a follow-up)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug, self-contained within Task 1, fixed before that
task's commit).
**Impact on plan:** None on scope or behavior — a documentation-wording fix only, discovered and
resolved during the task's own verification loop before any commit was made.

## Issues Encountered

None. The D-15 Figma-extraction workaround (reading `06-FIGMA-EXTRACTS.md`'s relayed notes
instead of calling Figma MCP tools directly) worked as described, consistent with every prior
plan in this phase.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `Sparkline` and `VitalsTrendChart` are both hand-authored, Figma-verified (via the relay
  mechanism), and documented — 06-15's own `key_links` are now satisfied: 06-18 (Docs
  Feedback/DataViz category) can preview both live, and 06-20 (Home-proof) can embed `Sparkline`
  inside each of the 3 vital-stat cards.
- **Not yet done, deferred to the orchestrator:** the screenshot-vs-Figma visual comparison
  (second half of D-15) for both components — there is no rendered consuming page yet to
  screenshot (the Vital Stat Card composition and the Perfusion Index card composition are both
  later plans' scope), so both `*.DESIGN.md` files explicitly flag this as pending.
- **Flagged for 06-18/06-20 (not this plan's job):** the full Perfusion Index card composition
  (icon tile, status pill, surrounding `Card` shell) and the Vital Stat Card's actual gradient
  background + white-sparkline wiring are explicitly out of this plan's scope, per its own
  `key_links` and `06-15-PLAN.md`'s `<files>` list.
- No blockers introduced by this plan.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*

## Self-Check: PASSED

- FOUND: src/components/ui/sparkline.tsx
- FOUND: src/components/ui/sparkline.DESIGN.md
- FOUND: src/components/ui/vitals-trend-chart.tsx
- FOUND: src/components/ui/vitals-trend-chart.DESIGN.md
- FOUND commit: 739ab9a
- FOUND commit: 32a1922
- `npm run build` exits 0 (verified after both tasks)
- `grep -c "XAxis|YAxis|CartesianGrid|Tooltip|Legend" src/components/ui/sparkline.tsx` -> `0`
- `grep -c "yAxisId" src/components/ui/vitals-trend-chart.tsx` -> `8`
- `git rev-list --count e387fb7..HEAD` -> `2` (matches `commits: 2` in frontmatter)
