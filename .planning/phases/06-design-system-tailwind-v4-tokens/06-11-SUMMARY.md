---
phase: 06-design-system-tailwind-v4-tokens
plan: 11
subsystem: ui
tags: [nextjs, tailwind-v4, design-system-docs, app-router]

requires:
  - phase: 06-design-system-tailwind-v4-tokens
    provides: "globals.css @theme token layer, Button/Card/Badge/Input/Nav component set (Plans 06-01..06-10)"
provides:
  - "Persistent sidebar shell (docs/layout.tsx) for every /design-system/docs/* route"
  - "Relocated, reusable token-parsing helpers (docs/_lib/tokens.ts)"
  - "Live Colors and Typography reference routes"
  - "9-role Typography token set in globals.css (--text-display/--text-heading-page/--text-vital-metric)"
affects: [06-16, 06-17, 06-18]

actuals:
  tokens: 12030
  tasks: 3
  commits: 3
  plan_head_before: 09afe6efd156b925989cfde6d3d8d64d78559d24

tech-stack:
  added: []
  patterns:
    - "docs/_lib/*.ts modules shared between layout and route pages (categories.ts, tokens.ts)"
    - "Live-parse-then-render: page components call the same parseThemeTokens output that the Tailwind utility class itself reads, so the caption text and the rendered sample can never disagree"

key-files:
  created:
    - src/app/design-system/docs/_lib/tokens.ts
    - src/app/design-system/docs/_lib/categories.ts
    - src/app/design-system/docs/layout.tsx
    - src/app/design-system/docs/colors/page.tsx
    - src/app/design-system/docs/typography/page.tsx
  modified:
    - src/app/design-system/docs/page.tsx
    - src/app/globals.css

key-decisions:
  - "Added --text-display/--text-heading-page/--text-vital-metric to globals.css (Rule 2 deviation) — UI-SPEC's 9-role Typography table requires them and no prior plan (06-01..06-10) had declared them"
  - "docs/layout.tsx is a client component (usePathname for active-link state) — simplest way to signal active/inactive via color only without lifting state into every child page"
  - "Sidebar's six component categories render 'Coming soon' placeholders (no links) until Wave 5 (06-16/06-17/06-18) adds per-component routes"
  - "Typography page renders via the token-generated Tailwind utility classes (text-display, text-body, etc.) rather than inline styles, so the visual sample and the live-parsed caption text read the exact same CSS source"

patterns-established:
  - "Shared docs/_lib/categories.ts array consumed by both layout.tsx (sidebar) and page.tsx (landing grid) so the two structural surfaces can never drift out of sync"

requirements-completed: [DSYS-01, DSYS-02, DSYS-03]

coverage:
  - id: D1
    description: "Persistent sidebar shell (docs/layout.tsx) replaces the rejected single-scroll docs page"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (Next.js static generation of /design-system/docs, /design-system/docs/colors, /design-system/docs/typography)"
        status: pass
      - kind: other
        ref: "grep -c 'readdirSync|readdir(' docs/layout.tsx == 0"
        status: pass
    human_judgment: true
    rationale: "Visual quality bar ('shadcn-quality or better', D-13) and active-link color-only signaling are visual/UX judgments no automated check can certify"
  - id: D2
    description: "Token-parsing helpers relocated verbatim to docs/_lib/tokens.ts, unchanged logic"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D3
    description: "Colors reference route renders live, labeled swatches (primitive ramps + semantic roles + tri-state table)"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "npm run build (static generation of docs/colors)"
        status: pass
    human_judgment: true
    rationale: "Swatch layout/labeling quality is a visual judgment; the automated check only proves the route compiles and renders without throwing"
  - id: D4
    description: "Typography reference route renders all 9 roles as live samples with tabular-nums on Vital-metric"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "grep -c 'tabular-nums' docs/typography/page.tsx == 1"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D5
    description: "DSYS-03 empty-input resolution: parseThemeTokens/parsePrimitiveRamps return [] (not throw) for a zero-match prefix, and the Colors page's semantic-groups section renders an explicit fallback"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "one-off scratch script confirming parseThemeTokens(themeBlock, '--color-nonexistent-') returns [] without throwing (discarded after use, not shipped)"
        status: pass
    human_judgment: false
  - id: D6
    description: "DSYS-03 ordering resolution: primitive ramp order fixed by RAMP_STEPS, sidebar category order fixed by a literal array, never filesystem readdir"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "grep -c 'readdirSync|readdir(' docs/layout.tsx == 0"
        status: pass
    human_judgment: false
  - id: D7
    description: "docs/page.tsx rewritten as a landing/overview; zero readFileSync calls, raw-markdown-in-<pre> anti-pattern fully removed"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -c readFileSync docs/page.tsx == 0"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false

duration: ~20min
completed: 2026-09-27
status: complete
---

# Phase 6 Plan 11: Design System Docs Site Rebuild (Shell + Colors + Typography) Summary

**Replaced the rejected single-scroll `docs/page.tsx` (raw `.DESIGN.md` markdown in a `<pre>` tag) with a persistent sidebar shell plus live-parsed Colors and Typography reference routes, relocating the reusable token-parsing helpers and resolving both DSYS-03 edge cases along the way.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-09-27T00:21:22Z (approx.)
- **Completed:** 2026-09-27T00:41:22Z
- **Tasks:** 3
- **Files modified:** 7 (5 created, 2 modified)

## Accomplishments

- Extracted `readThemeBlock`/`parseThemeTokens`/`parsePrimitiveRamps`/`groupSemanticColorTokens` verbatim into `docs/_lib/tokens.ts`, unchanged parsing logic, now importable by every docs route
- Built `docs/layout.tsx`: a persistent left sidebar (client component) with six fixed, literally-declared component categories (Actions/Forms/Cards/Navigation/Feedback-Status/Data-Viz) + top-level Colors/Typography/Overview links, active-state signaling via color only (`text-brand` vs `text-text-muted`), no entrance animation on load
- Built `docs/colors/page.tsx`: real labeled swatches for every primitive ramp (fixed 100→900 order), semantic token groups, and a live-parsed tri-state health-status table (Safe/Caution/Critical × Primary/On-fill/Soft/Dark)
- Built `docs/typography/page.tsx`: all 9 UI-SPEC typography roles rendered as real samples at their compiled size/weight/line-height, `tabular-nums` on Vital-metric, `text-balance` on Display/page-title
- Rewrote `docs/page.tsx` as a short landing/overview — zero `readFileSync` calls, links into the sidebar's categories and reference pages instead of dumping markdown
- Added the three missing Typography tokens (`--text-display`, `--text-heading-page`, `--text-vital-metric`) to `globals.css` so the Typography page's 9-role requirement actually has live tokens to parse
- Resolved DSYS-03's empty-input case (parseThemeTokens returns `[]`, never throws, verified via a discarded scratch check) and ordering case (RAMP_STEPS fixed order + literal category array, no filesystem `readdir`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract token-parsing helpers, build the sidebar shell** - `a1f9536` (feat)
2. **Task 2: Build Colors and Typography reference routes** - `8ce53e2` (feat)
3. **Task 3: Rewrite docs/page.tsx as a landing/overview, remove the raw-markdown anti-pattern** - `d630fd1` (fix)

**Plan metadata:** pending (this commit)

## Files Created/Modified

- `src/app/design-system/docs/_lib/tokens.ts` - Relocated color-token helpers + new `resolveTypographyRoles`/`TYPOGRAPHY_ROLE_SPECS` for the 9-role Typography scale
- `src/app/design-system/docs/_lib/categories.ts` - Shared literal category/top-link arrays consumed by both layout.tsx and page.tsx
- `src/app/design-system/docs/layout.tsx` - Persistent sidebar shell (client component, color-only active-link state)
- `src/app/design-system/docs/colors/page.tsx` - Live color-token reference route
- `src/app/design-system/docs/typography/page.tsx` - Live typography reference route
- `src/app/design-system/docs/page.tsx` - Rewritten landing/overview (raw-markdown anti-pattern removed)
- `src/app/globals.css` - Added `--text-display`/`--text-heading-page`/`--text-vital-metric` tokens

## Decisions Made

- Added the three missing Typography tokens to `globals.css` rather than leaving the Typography page's Display/Heading-page/Vital-metric roles unbacked by any live source — required for the plan's own must_haves truth ("sourced from the live-parsed globals.css tokens") to actually hold, not scope creep beyond what this plan's own deliverable needs.
- Made `docs/layout.tsx` a client component to use `usePathname()` for active-link detection — the simplest correct way to satisfy the color-only active-state rule without prop-drilling the current path through every child page.
- Deferred real per-component sidebar links to Wave 5 (06-16/06-17/06-18); each category currently renders a static "Coming soon" placeholder rather than a broken/dangling link.
- Typography samples render through the token-generated Tailwind utility classes (`text-display`, `text-body`, …) instead of inline `style` objects, so the visible rendering and the live-parsed caption metadata read the identical CSS source — eliminates any chance of the two disagreeing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added the three UI-SPEC Typography tokens to globals.css**
- **Found during:** Task 2 (Colors and Typography reference routes)
- **Issue:** The plan's must_haves truth requires the Typography page to render all 9 UI-SPEC roles "sourced from the live-parsed globals.css tokens," but `--text-display`, `--text-heading-page`, and `--text-vital-metric` did not exist in `globals.css` — no prior plan (06-01 through 06-10) had declared them, since none of them needed a hero headline, page title, or vital-metric role yet.
- **Fix:** Added the exact three tokens + their paired `--line-height` siblings, byte-for-byte matching the CSS block already specified in `06-UI-SPEC.md`'s Typography section. No existing token value changed (additive only, matching the codebase's established primitive/semantic layering convention).
- **Files modified:** `src/app/globals.css`
- **Verification:** `npm run build` succeeds; the Typography page renders live values (not `—`) for all three new roles.
- **Committed in:** `8ce53e2` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Necessary for the plan's own Typography deliverable to actually source live tokens rather than falling back to dashes for 3 of 9 roles. No scope creep — the exact values were already locked in 06-UI-SPEC.md, only their landing location (globals.css) was missing.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The sidebar shell (`docs/layout.tsx`) is ready for Wave 5 (06-16/06-17/06-18) to nest per-component doc routes inside it — each new route under `docs/*` automatically inherits the sidebar.
- `docs/_lib/tokens.ts` and `docs/_lib/categories.ts` are the shared modules future docs plans should import from rather than re-deriving parsing logic or category lists.
- No blockers. Per D-13's mandate, `/emil-design-vocabulary`, `/emil-ui-polish`, and `/emil-animations` were invoked directly during this build (color-only active-state, no shell entrance animation, tabular-nums, text-balance, real typographic characters).

## Self-Check: PASSED

- `src/app/design-system/docs/_lib/tokens.ts` — FOUND
- `src/app/design-system/docs/_lib/categories.ts` — FOUND
- `src/app/design-system/docs/layout.tsx` — FOUND
- `src/app/design-system/docs/colors/page.tsx` — FOUND
- `src/app/design-system/docs/typography/page.tsx` — FOUND
- `src/app/design-system/docs/page.tsx` — FOUND (rewritten)
- Commit `a1f9536` — FOUND in `git log --oneline --all`
- Commit `8ce53e2` — FOUND in `git log --oneline --all`
- Commit `d630fd1` — FOUND in `git log --oneline --all`
- `npm run build` — exits 0, all 3 docs routes statically generated
- `grep -c readFileSync docs/page.tsx` — 0
- `grep -c "readdirSync\|readdir(" docs/layout.tsx` — 0
- `grep -c tabular-nums docs/typography/page.tsx` — 1

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*
