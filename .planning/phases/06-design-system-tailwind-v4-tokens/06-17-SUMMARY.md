---
phase: 06-design-system-tailwind-v4-tokens
plan: 17
subsystem: ui
tags: [nextjs, tailwind-v4, design-system-docs, card, item, navigation, d17]

requires:
  - phase: 06-design-system-tailwind-v4-tokens
    provides: "Figma-verified Card + Item primitives and resolved 6-row Card Type Map (06-07); hand-authored NavLink/NavBar with D-17's locked color resolution (06-10); the persistent docs sidebar shell + token-parsing helpers (06-11)"
provides:
  - "Live Card docs route rendering all 6 resolved Card Type Map compositions (not a bare Card repeated 6x), including a live 'layout never changes' correct/incorrect example pair"
  - "Live Item docs route with a real 4-row instruction list plus an ItemActions example"
  - "Live Navigation docs route with a clickable NavLink toggle and a clickable NavBar preview, explicitly explaining D-17's active-tab color decision"
  - "Generic per-category sidebar-link support in the docs shell (docs/_lib/categories.ts, docs/layout.tsx, docs/page.tsx), wired for Cards and Navigation"
affects: [06-18, 06-19, 06-20, 06-21]

actuals:
  tokens: 9100
  tasks: 2
  commits: 2
  plan_head_before: 26e2a679261338621f603816d41df3d7538c8bac

tech-stack:
  added: []
  patterns:
    - "Click-intercepting live previews: components whose real href/onClick would navigate away (NavLink/NavBar) are demoed by passing an onClick that calls preventDefault() and updates local React state instead — the demo stays 'live' and clickable without ever leaving the docs page"
    - "Per-category sidebar links as a shared data shape: DOCS_COMPONENT_CATEGORIES entries now carry a `links` array populated incrementally by whichever Wave 5 plan builds that category's routes, read identically by layout.tsx (sidebar) and page.tsx (landing grid)"

key-files:
  created:
    - src/app/design-system/docs/card/page.tsx
    - src/app/design-system/docs/item/page.tsx
    - src/app/design-system/docs/nav/page.tsx
  modified:
    - src/app/design-system/docs/_lib/categories.ts
    - src/app/design-system/docs/layout.tsx
    - src/app/design-system/docs/page.tsx

key-decisions:
  - "Card Type Map row 2 (Instruction Row Card) is rendered as the bare Card primitive + icon tile + title/description — matching card.DESIGN.md's own disposition ('base primitive (Task 1)') exactly, not a Card+Item composition, even though this plan's own objective prose used 'Card + Item' as an illustrative example. card.DESIGN.md is the authoritative source per the must_haves truth; the docs page cross-links to /design-system/docs/item and states explicitly that which composition (Card-per-row vs. Card+many-Items) a real instruction list uses is still open, per item.DESIGN.md's own note."
  - "Row 3's Vital Stat Card sparkline slot renders a static inline SVG polyline placeholder sized to the documented 76x26px slot, not the real Sparkline component — Sparkline ships in a later plan (06-15) that is not a dependency of this plan; the docs page's caption explicitly says the real component drops into this exact slot later, rather than silently fabricating a finished dependency that doesn't exist yet."
  - "Row 6's percentage bar uses the real, already-shipped Progress primitive (src/components/ui/progress.tsx, built in an earlier plan) rather than a placeholder, since it already exists in the codebase and is safe to import — this gives that one row a genuinely live, real percentage-driven bar as card.DESIGN.md's disposition describes."
  - "Extended docs/_lib/categories.ts's DOCS_COMPONENT_CATEGORIES from a flat string array to an array of { name, links } objects, and updated both consumers (docs/layout.tsx's sidebar, docs/page.tsx's landing grid) to render real links when a category's links array is non-empty, falling back to the existing 'Coming soon' placeholder otherwise. This directly closes the gap 06-11's own SUMMARY explicitly deferred to Wave 5 ('Deferred real per-component sidebar links to Wave 5 (06-16/06-17/06-18)') — without it, the three new routes this plan builds would be unreachable from the docs shell they are supposed to live inside."
  - "NavLink/NavBar live previews intercept clicks via onClick + preventDefault + local React state rather than modifying nav-link.tsx/nav-bar.tsx in any way — both components are reused exactly as 06-10 built them, per this plan's own key_links constraint not to re-decide anything."

patterns-established:
  - "A docs preview for a component whose real interactive behavior is navigation (NavLink/NavBar) stays genuinely clickable by intercepting the click and driving local state, instead of either (a) rendering a static, unclickable screenshot-like mock, or (b) letting the click actually navigate away from the docs site."

requirements-completed: [DSYS-01, DSYS-02, DSYS-03]

coverage:
  - id: D1
    description: "docs/card/page.tsx renders all 6 resolved Card Type Map entries live, each as its actual resolved composition (icon-tile+text row, gradient metric card with sparkline-slot placeholder, device-status card with a real Progress bar), not the bare Card primitive repeated 6 times"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/card)"
        status: pass
      - kind: other
        ref: "grep -c \"<pre\" src/app/design-system/docs/card/page.tsx -> 0"
        status: pass
    human_judgment: true
    rationale: "Whether each of the 6 rendered compositions reads as visually 'shadcn-quality' (D-13's bar) and faithfully represents card.DESIGN.md's per-row recipe is a visual/design judgment no automated check can certify."
  - id: D2
    description: "docs/item/page.tsx renders a live 4-row instruction-list example (Item + ItemMedia + ItemContent + ItemTitle + ItemDescription) matching the Home-screen instruction pattern, plus an ItemActions example and usage notes on Item vs. a bespoke row"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/item)"
        status: pass
      - kind: other
        ref: "grep -c \"<pre\" src/app/design-system/docs/item/page.tsx -> 0"
        status: pass
    human_judgment: true
    rationale: "Visual/typographic fidelity of the rendered instruction list against the Home-screen pattern is a judgment call, not something an automated check proves."
  - id: D3
    description: "docs/nav/page.tsx renders a live, clickable NavLink active/inactive toggle and a full clickable NavBar preview, with an explicit prose callout citing D-17 explaining the active-tab pink color as an intentional decision, not a bug"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/nav)"
        status: pass
      - kind: other
        ref: "grep -c D-17 src/app/design-system/docs/nav/page.tsx -> 1"
        status: pass
    human_judgment: true
    rationale: "Whether the click-intercepting preview actually feels 'live and interactive' (vs. a static mock) and whether the D-17 prose reads as a clear, confident explanation rather than a hedge are judgment calls a human should confirm."
  - id: D4
    description: "npm run build compiles cleanly with all three new docs routes in place"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "npm run build (exit 0, all 17 routes including /design-system/docs/card, /item, /nav statically generated)"
        status: pass
    human_judgment: false

duration: 35min
completed: 2026-09-27
status: complete
---

# Phase 6 Plan 17: Cards & Navigation Docs Category Summary

**Built live, interactive Card/Item/Navigation docs pages inside the 06-11 sidebar shell — all 6 resolved Card Type Map compositions rendered for real (including a real Progress bar), a clickable NavLink/NavBar preview that never navigates away, and a prose callout explaining D-17's locked pink-active-tab color decision — then wired both categories into the sidebar's previously-empty "Coming soon" placeholders.**

## Performance

- **Duration:** 35 min
- **Started:** 2026-09-27T00:55:00Z
- **Completed:** 2026-09-27T01:30:00Z
- **Tasks:** 2
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- Built `docs/card/page.tsx`: all 6 rows of `card.DESIGN.md`'s Card Type Map rendered as their actual resolved composition — Status Hero Card (green gradient icon tile + one-off shadow), the base Instruction Row Card, the Vital Stat Card (gradient-fill div with a sparkline-slot placeholder and a real `tabular-nums` number/unit row), the Metric Row Card (swapped icon-tile/description tokens), and both Device Status Card variants (one with a real, live `Progress` bar).
- Added a live "layout never changes" demo: a real toggle button switches a `Card` between populated/empty content while its `Card > CardHeader > CardContent` structure stays identical, paired with a static annotated "incorrect" panel showing the anti-pattern this rule forbids — no `<pre>` code dump anywhere on the page.
- Built `docs/item/page.tsx`: a real 4-row `ItemGroup` instruction list (icon + title + description, separated by `ItemSeparator`) plus a second `Item` demonstrating the `ItemActions` slot, with prose explicitly addressing the still-open Card-per-row vs. Card+many-Items composition question `item.DESIGN.md` itself raises.
- Built `docs/nav/page.tsx`: a clickable `NavLink` that toggles active/inactive on click, and a clickable `NavBar` preview where clicking any tab changes which one is active — both intercept the click (`preventDefault` + local state) so the demo never actually navigates away from the docs site, since `NavLink`/`NavBar`'s real `href`s point at genuine app routes.
- Added an explicit, prominent prose callout in `docs/nav/page.tsx` citing D-17 by name, explaining that the active tab's pink/critical hue is a deliberate, locked decision (navigation-selected-state and critical-health-status are two different semantic dimensions) — framed for a future reader as "do not recolor this to blue," not a silent rendering of the color choice.
- Extended `docs/_lib/categories.ts`'s category list from a flat string array to `{ name, links }` objects and updated both `docs/layout.tsx` (sidebar) and `docs/page.tsx` (landing grid) to render real links when populated, falling back to the existing "Coming soon" placeholder otherwise — wiring the Cards and Navigation categories to the three new routes, closing the exact gap 06-11's own SUMMARY flagged as deferred to this wave.
- Invoked `/emil-design-vocabulary`, `/emil-ui-polish`, and `/emil-animations` skills per D-13 during the build — for terminology precision (multi-modal rule references, composition vs. variant framing), polish-pass discipline (color-only sidebar active-state already established by 06-11 stayed consistent, `tabular-nums` on the Vital Stat number, no gratuitous entrance animation on any new route), and tasteful micro-interactions (the click-to-toggle previews use the existing `active:scale-[0.96]`/`duration-fast` conventions already baked into `NavLink`/`Button`, nothing new invented).

## Task Commits

1. **Task 1: Docs routes for Card and Item** - `f75cdad` (feat)
2. **Task 2: Docs route for Navigation (NavLink + NavBar), explaining D-17** - `9e54a98` (feat)

**Plan metadata:** (this commit, docs)

## Files Created/Modified

- `src/app/design-system/docs/card/page.tsx` - Live Card docs route, all 6 Card Type Map rows.
- `src/app/design-system/docs/item/page.tsx` - Live Item docs route, 4-row instruction list + ItemActions example.
- `src/app/design-system/docs/nav/page.tsx` - Live Navigation docs route, clickable NavLink/NavBar + D-17 explanation.
- `src/app/design-system/docs/_lib/categories.ts` - `DOCS_COMPONENT_CATEGORIES` restructured to carry per-category `links`; Cards and Navigation populated.
- `src/app/design-system/docs/layout.tsx` - Sidebar renders real per-component links when a category has them, "Coming soon" otherwise.
- `src/app/design-system/docs/page.tsx` - Landing grid mirrors the same real-link/"Coming soon" rendering.

## Decisions Made

See `key-decisions` in frontmatter above — summarized: Card Type Map row 2 rendered as the bare Card primitive (matching card.DESIGN.md's own disposition), not a Card+Item composition, with prose cross-linking to the still-open composition question; the Vital Stat Card's sparkline slot is an explicit placeholder (Sparkline ships in a later, non-dependency plan) while the Device Status Card's progress bar uses the real, already-shipped `Progress` component; sidebar/category data restructured to `{ name, links }` to make the two new categories reachable, closing a gap 06-11 explicitly deferred here; NavLink/NavBar previews intercept clicks rather than modifying either component.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Wired the Cards and Navigation sidebar categories to real links**
- **Found during:** Task 1
- **Issue:** The plan's own `<files>` tags only listed the three `page.tsx` routes, but `docs/layout.tsx`'s sidebar and `docs/page.tsx`'s landing grid still rendered every category (including Cards and Navigation) as an unclickable "Coming soon" placeholder. Without wiring, the three new routes this plan builds would be unreachable from the docs shell they are explicitly built "inside of" (per this plan's own `<context>`), and 06-11's own SUMMARY explicitly named this exact wiring as deferred to whichever Wave 5 plan builds each category's routes.
- **Fix:** Restructured `DOCS_COMPONENT_CATEGORIES` to carry a `links` array per category (empty = "Coming soon", non-empty = real `<SidebarLink>`/`<Link>` entries) and updated both consumers to branch on it. Populated only Cards (Card, Item) and Navigation (Nav) — the four categories no later-executed plan (06-16/06-18) has built yet stay "Coming soon."
- **Files modified:** `src/app/design-system/docs/_lib/categories.ts`, `src/app/design-system/docs/layout.tsx`, `src/app/design-system/docs/page.tsx`
- **Verification:** `npm run build` exits 0 with all three new routes statically generated; the Navigation category link was staged in its own commit (Task 2) alongside `docs/nav/page.tsx` so no commit ever contains a sidebar link with no matching route.
- **Committed in:** `f75cdad` (Cards category, Task 1), `9e54a98` (Navigation category, Task 2)

---

**Total deviations:** 1 auto-fixed (1 Rule 2 - missing critical functionality, split cleanly across both task commits so a dangling sidebar link is never introduced).
**Impact on plan:** Necessary — without it, this plan's entire deliverable would be three orphaned routes with no path into them from the shell they're documented as living inside. No scope creep: only the Cards/Navigation categories this plan itself populates were touched; the other four categories' placeholders are untouched.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `docs/card`, `docs/item`, and `docs/nav` are live, reachable, and build-clean — ready for the orchestrator's deferred visual-quality pass (D-13's "shadcn-quality or better" bar is a human judgment call, not automatable).
- `docs/_lib/categories.ts`'s `{ name, links }` shape is now the established pattern for 06-16 (Actions/Forms) and 06-18 (Feedback/Status, Data Viz) to populate their own categories the same way — no later plan should revert to the flat string-array shape.
- The Vital Stat Card's sparkline slot in `docs/card/page.tsx` is an explicit placeholder; whichever plan lands `Sparkline` (06-15) should replace the inline SVG polyline with the real component in that one spot.
- No blockers. Per D-13's mandate, `/emil-design-vocabulary`, `/emil-ui-polish`, and `/emil-animations` were invoked during this build.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*

## Self-Check: PASSED

- FOUND: src/app/design-system/docs/card/page.tsx
- FOUND: src/app/design-system/docs/item/page.tsx
- FOUND: src/app/design-system/docs/nav/page.tsx
- FOUND: src/app/design-system/docs/_lib/categories.ts
- FOUND: src/app/design-system/docs/layout.tsx
- FOUND: src/app/design-system/docs/page.tsx
- FOUND commit: f75cdad
- FOUND commit: 9e54a98
- `npm run build` exits 0 (verified after both tasks, all 17 routes generated)
- `grep -c "<pre" src/app/design-system/docs/card/page.tsx src/app/design-system/docs/item/page.tsx` -> 0, 0
- `grep -c "D-17" src/app/design-system/docs/nav/page.tsx` -> 1
