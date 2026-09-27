---
phase: 06-design-system-tailwind-v4-tokens
plan: 16
subsystem: ui
tags: [nextjs, tailwind-v4, design-system-docs, forms, button, radix-ui]

requires:
  - phase: 06-design-system-tailwind-v4-tokens
    provides: "Figma-verified 8-variant Button (06-06); Input/Label/Field family (06-09); Select/Textarea (06-12); Checkbox/RadioGroup/Switch (06-13); the persistent docs sidebar shell + token-parsing helpers + per-category sidebar-linking pattern (06-11/06-17)"
provides:
  - "9 live, interactive Actions & Forms docs routes — Button (all 8 variants), Input, Label, Field, Select, Textarea, Checkbox, Radio Group, Switch"
  - "Shared docs/_lib/token-swatch.tsx (TokenSwatch/TokenSwatchGrid) and docs/_lib/code-block.tsx (CodeBlock) — reusable live-token and structured-code-block renderers for every future docs route"
  - "docs/_lib/tokens.ts's getExactToken — exact-name token lookup, avoids parseThemeTokens prefix-collision on full token names"
  - "Actions/Forms categories wired into the docs sidebar (previously 'Coming soon' placeholders)"
affects: [06-18, 06-19, 06-20, 06-21]

actuals:
  tokens: 16569
  tasks: 3
  commits: 3
  plan_head_before: 52c18a59c8c21a0be8c25454c13d335886e87d97

tech-stack:
  added: []
  patterns:
    - "Server Component page.tsx (reads live globals.css tokens via node:fs) + a small Client 'playground' subcomponent, used only where a useState-driven picker/toggle is genuinely required (Button, Input, Field) — avoids bundling node:fs into a client chunk while still allowing per-page live token values"
    - "Radix-backed fields (Select/Textarea/Checkbox/RadioGroup/Switch) stay pure Server Components in their docs pages — the component's own uncontrolled internal state (a real click/keyboard toggle) already satisfies 'live and interactive' with zero extra client wrapper"
    - "Shared docs/_lib/token-swatch.tsx and docs/_lib/code-block.tsx modules — every docs route's 'tokens this component consumes' and 'Correct/Incorrect usage' sections render through one shared implementation instead of 9 near-duplicates"

key-files:
  created:
    - src/app/design-system/docs/button/page.tsx
    - src/app/design-system/docs/button/button-playground.tsx
    - src/app/design-system/docs/input/page.tsx
    - src/app/design-system/docs/input/input-playground.tsx
    - src/app/design-system/docs/label/page.tsx
    - src/app/design-system/docs/field/page.tsx
    - src/app/design-system/docs/field/field-playground.tsx
    - src/app/design-system/docs/select/page.tsx
    - src/app/design-system/docs/textarea/page.tsx
    - src/app/design-system/docs/checkbox/page.tsx
    - src/app/design-system/docs/radio-group/page.tsx
    - src/app/design-system/docs/switch/page.tsx
    - src/app/design-system/docs/_lib/token-swatch.tsx
    - src/app/design-system/docs/_lib/code-block.tsx
  modified:
    - src/app/design-system/docs/_lib/tokens.ts
    - src/app/design-system/docs/_lib/categories.ts

key-decisions:
  - "Split page.tsx into a Server Component (reads live token values) + a Client 'playground' subcomponent, but only for the 3 pages that actually need useState (Button's variant/loading picker, Input's error toggle, Field's error toggle) — the other 6 pages render the real Radix-backed component directly from a Server Component parent, since Checkbox/RadioGroup/Switch/Select already manage their own uncontrolled interactive state client-side."
  - "Added 3 files not in the plan's declared <files> list (button-playground.tsx, input-playground.tsx, field-playground.tsx) — a necessary consequence of the Server/Client split above, not scope creep: importing node:fs (via readThemeBlock) inside a 'use client' file would either fail to bundle or require fragile tree-shaking, so the interactive state had to live in a sibling file."
  - "Added docs/_lib/token-swatch.tsx and docs/_lib/code-block.tsx as new shared modules (also outside the declared per-task <files>) rather than duplicating swatch-rendering and code-block-rendering logic across all 9 pages — matches the established docs/_lib/*.ts shared-module pattern from 06-11."
  - "Button's variant picker uses the project's own Select component (not a plain HTML <select> or a hand-rolled dropdown), per the plan's own explicit instruction — 8 variants render as Select items rather than a ToggleGroup, since 8 items in a segmented control would overflow the content pane's width."
  - "Checkbox/RadioGroup/Switch pages explicitly state 'No dedicated Figma frame exists for X' near the top of each page, matching each component's own DESIGN.md honest disposition — no page implies a Figma source that doesn't exist."

patterns-established:
  - "docs/_lib/token-swatch.tsx and docs/_lib/code-block.tsx are now the canonical shared renderers for live token swatches and structured usage-notes code blocks — future docs plans (06-18/19/20/21) should import from here rather than re-inventing either."

requirements-completed: []  # DSYS-01/02/03 shared with sibling 06-18..06-21 plans still in progress; shared-ID gate defers marking until all declaring plans finish (0/3 ready per requirements.ready-ids, see #2388).

coverage:
  - id: D1
    description: "Button docs route covers all 8 Figma-verified variants (not just the original 4) with a real Select-driven variant picker, a loading toggle, live token swatches, and structured Correct/Incorrect usage (no raw markdown <pre> dump)"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/button)"
        status: pass
      - kind: other
        ref: "grep -c \"<pre\" src/app/design-system/docs/button/page.tsx -> 0"
        status: pass
    human_judgment: true
    rationale: "Whether the picker/preview reads as genuinely 'shadcn-quality' (D-13's bar) and whether the 8-variant coverage feels complete on real inspection is a visual/UX judgment no automated check can certify."
  - id: D2
    description: "Input docs route with a live error-state toggle, live token swatches, and structured usage notes"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/input)"
        status: pass
      - kind: other
        ref: "grep -c \"<pre\" src/app/design-system/docs/input/page.tsx -> 0"
        status: pass
    human_judgment: true
    rationale: "Same visual-quality judgment as D1."
  - id: D3
    description: "Label, Field, Select, and Textarea docs routes all render live, real components; Field's page demonstrates the error-state toggle live; Label/Select/Textarea each link to Field's page instead of re-explaining the composition"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/{label,field,select,textarea})"
        status: pass
      - kind: other
        ref: "grep -l \"design-system/docs/field\" src/app/design-system/docs/{label,select,textarea}/page.tsx -> all 3 match"
        status: pass
    human_judgment: true
    rationale: "Visual/compositional fidelity of the four pages against D-13's shadcn-quality bar is a judgment call a human should confirm on real inspection."
  - id: D4
    description: "Checkbox, Radio Group, and Switch docs routes render live, clickable toggles (real Radix interaction, not a static two-image comparison); none falsely implies a dedicated Figma source where none exists"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "npm run build (exit 0, static generation of /design-system/docs/{checkbox,radio-group,switch})"
        status: pass
      - kind: other
        ref: "grep -l \"No dedicated Figma frame exists\" src/app/design-system/docs/{checkbox,radio-group,switch}/page.tsx -> all 3 match"
        status: pass
    human_judgment: true
    rationale: "Whether the live click/keyboard interaction genuinely reads as 'interactive, not a static comparison' is a judgment call a human should confirm."
  - id: D5
    description: "npm run build compiles cleanly with all 9 new docs routes in place, alongside every pre-existing route"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "npm run build (exit 0, all 26 routes including the 9 new Actions & Forms routes statically generated)"
        status: pass
    human_judgment: false

duration: 40min
completed: 2026-09-27
status: complete
---

# Phase 6 Plan 16: Actions & Forms Docs Category Summary

**Built 9 live, interactive design-system docs routes (Button's all-8-variants + Input, Label, Field, Select, Textarea, Checkbox, Radio Group, Switch) inside the 06-11 sidebar shell — each rendering the real component, live-parsed token swatches, and structured Correct/Incorrect usage, with the sidebar's Actions/Forms placeholders wired to real links.**

## Performance

- **Duration:** 40 min
- **Started:** 2026-09-27T04:50:00Z (approx.)
- **Completed:** 2026-09-27T05:30:00Z (approx.)
- **Tasks:** 3
- **Files modified:** 16 (14 created, 2 modified)

## Accomplishments

- Built `docs/button/page.tsx` (+ `button-playground.tsx`): a real `Select`-driven variant picker across all 8 Figma-verified `Button` variants (not just the original 4), a loading toggle exercising the loading sub-state, live token swatches (`--radius-btn`, `--color-brand-fill`, `--radius-cta`, `--gradient-cta`, `--gradient-cta-critical`, `--shadow-cta`, `--radius-icon-btn`, `--color-icon-fill-dark`), and structured Correct/Incorrect usage rendered as real JSX code blocks (no raw markdown `<pre>` dump).
- Built `docs/input/page.tsx` (+ `input-playground.tsx`): a live error-state toggle, live token swatches, and structured usage notes.
- Built `docs/field/page.tsx` (+ `field-playground.tsx`): a live error-state toggle demonstrating the canonical `Field`/`FieldLabel`/`FieldDescription`/`FieldError` composition; `docs/label/page.tsx`, `docs/select/page.tsx`, and `docs/textarea/page.tsx` each render their own live, real component (two openable `Select` instances, two focusable `Textarea` instances) and explicitly link to Field's page rather than re-explaining the composition.
- Built `docs/checkbox/page.tsx`, `docs/radio-group/page.tsx`, `docs/switch/page.tsx`: each renders the real, uncontrolled Radix component so clicking (or arrow-keying, for Radio Group) is a genuine state change, not a static comparison — each page states plainly that no dedicated Figma frame exists for that component, matching its own `.DESIGN.md`'s honest disposition.
- Added two new shared docs modules — `docs/_lib/token-swatch.tsx` (`TokenSwatch`/`TokenSwatchGrid`, rendering a live CSS-variable-referenced visual sample plus its live-parsed value text) and `docs/_lib/code-block.tsx` (`CodeBlock`, a non-`<pre>` structured code renderer) — reused by all 9 new routes instead of duplicating either 9 times. Extended `docs/_lib/tokens.ts` with `getExactToken` (exact-name lookup, avoids `parseThemeTokens`' prefix-collision on full token names like `--color-brand-fill` vs. `--color-brand-fill-hover`).
- Populated the docs sidebar's Actions (Button) and Forms (Input/Label/Field/Select/Textarea/Checkbox/Radio Group/Switch) categories with real links, replacing their "Coming soon" placeholders — the last two of the six original sidebar categories 06-11 deferred to Wave 5 (Cards/Navigation already closed by 06-17).
- Invoked `/emil-design-vocabulary`, `/emil-ui-polish`, and `/emil-animations` skills per D-13 during the build, then verified compliance directly: no `transition-all`, no `animate-in`/`fade-in`/`slide-in` mount animations on any of the 9 new pages, and the only `"..."` occurrences across all 12 new files are literal placeholder copy (`"Add any observations..."`, matching `textarea.DESIGN.md`'s own locked example) or code-elision shorthand inside a `CodeBlock` — not prose needing a real ellipsis character.

## Task Commits

Each task was committed atomically:

1. **Task 1: Docs routes for Button and Input** - `f435dd3` (feat)
2. **Task 2: Docs routes for Label, Field, Select, Textarea** - `4eaf9f8` (feat)
3. **Task 3: Docs routes for Checkbox, RadioGroup, Switch** - `1a2a1d6` (feat)

**Plan metadata:** (this commit, docs)

## Files Created/Modified

- `src/app/design-system/docs/button/page.tsx` / `button-playground.tsx` - Live 8-variant Button docs route
- `src/app/design-system/docs/input/page.tsx` / `input-playground.tsx` - Live Input docs route
- `src/app/design-system/docs/label/page.tsx` - Live Label docs route
- `src/app/design-system/docs/field/page.tsx` / `field-playground.tsx` - Live Field docs route (canonical composition)
- `src/app/design-system/docs/select/page.tsx` - Live Select docs route
- `src/app/design-system/docs/textarea/page.tsx` - Live Textarea docs route
- `src/app/design-system/docs/checkbox/page.tsx` - Live Checkbox docs route
- `src/app/design-system/docs/radio-group/page.tsx` - Live Radio Group docs route
- `src/app/design-system/docs/switch/page.tsx` - Live Switch docs route
- `src/app/design-system/docs/_lib/token-swatch.tsx` - Shared `TokenSwatch`/`TokenSwatchGrid`
- `src/app/design-system/docs/_lib/code-block.tsx` - Shared `CodeBlock`
- `src/app/design-system/docs/_lib/tokens.ts` - Added `getExactToken`
- `src/app/design-system/docs/_lib/categories.ts` - Populated Actions/Forms sidebar links

## Decisions Made

See `key-decisions` in frontmatter above — summarized: split each page into a Server Component (live token reads via `node:fs`) plus a Client "playground" subcomponent only where a picker/toggle genuinely needed `useState` (Button/Input/Field); the other 6 pages stayed pure Server Components since Radix's own uncontrolled state already makes Select/Textarea/Checkbox/RadioGroup/Switch live and clickable; Button's variant picker uses the real `Select` component (not a plain `<select>` or `ToggleGroup`, since 8 items would overflow a segmented control); Checkbox/RadioGroup/Switch pages state plainly that no dedicated Figma frame exists for each, matching their own `.DESIGN.md` files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added 3 client "playground" subcomponent files not in the plan's declared `<files>` list**
- **Found during:** Task 1 (Button/Input docs pages)
- **Issue:** The plan's must_haves require live-parsed token values (via `docs/_lib/tokens.ts`'s helpers, which use `node:fs`) AND client-side interactivity (a `useState`-driven variant/error picker) on the same page. `node:fs` cannot be bundled into a Next.js Client Component (`"use client"` files run in the browser), so a single-file page combining both would either fail to build or require relying on fragile dead-code elimination of an unused `fs` import.
- **Fix:** Split `button/page.tsx`, `input/page.tsx`, and `field/page.tsx` into a Server Component (reads tokens, renders static structure) importing a small sibling Client Component (`button-playground.tsx`, `input-playground.tsx`, `field-playground.tsx`) that holds only the interactive state — the standard Next.js Server/Client "island" pattern.
- **Files added:** `src/app/design-system/docs/button/button-playground.tsx`, `src/app/design-system/docs/input/input-playground.tsx`, `src/app/design-system/docs/field/field-playground.tsx`
- **Verification:** `npm run build` exits 0 with all 3 pages statically generated; each playground file correctly renders on the client (Select/Button state responds to clicks).
- **Committed in:** `f435dd3` (button/input), `4eaf9f8` (field)

**2. [Rule 3 - Blocking] Added two new shared `docs/_lib/*.tsx` modules not in the plan's declared `<files>` list**
- **Found during:** Task 1 (Button/Input docs pages)
- **Issue:** All 9 pages need to render live token swatches and structured Correct/Incorrect usage blocks. Writing this rendering logic independently in each of 9 files would either drift out of sync or require copy-pasting near-identical code 9 times — the exact kind of duplication the project's existing `docs/_lib/*.ts` shared-module pattern (established by 06-11) exists to avoid.
- **Fix:** Added `docs/_lib/token-swatch.tsx` (`TokenSwatch`/`TokenSwatchGrid`) and `docs/_lib/code-block.tsx` (`CodeBlock`), both imported by all 9 new pages.
- **Files added:** `src/app/design-system/docs/_lib/token-swatch.tsx`, `src/app/design-system/docs/_lib/code-block.tsx`
- **Verification:** `npm run build` exits 0; all 9 pages render their token/usage sections identically in structure.
- **Committed in:** `f435dd3`

**3. [Rule 2 - Missing Critical] Wired the Actions and Forms sidebar categories to real links**
- **Found during:** Task 1
- **Issue:** The plan's `<files>` tags only listed the 9 `page.tsx` routes, but `docs/_lib/categories.ts`'s `DOCS_COMPONENT_CATEGORIES` still had empty `links: []` for both `Actions` and `Forms` — 06-11's own SUMMARY explicitly named this wiring as deferred to whichever Wave 5 plan builds each category's routes (06-17 already did this for Cards/Navigation). Without it, all 9 new routes this plan builds would be unreachable from the sidebar shell they are documented as living inside.
- **Fix:** Populated `Actions` with a link to `docs/button`, and `Forms` with links to all 8 remaining routes, following 06-17's exact `{ name, links }` shape — no other category was touched.
- **Files modified:** `src/app/design-system/docs/_lib/categories.ts`
- **Verification:** `npm run build` exits 0; sidebar renders real links for both categories instead of "Coming soon."
- **Committed in:** `f435dd3`

---

**Total deviations:** 3 auto-fixed (2 Rule 3 - blocking technical necessity, 1 Rule 2 - missing critical functionality).
**Impact on plan:** All three were necessary for the plan's own stated deliverable (live + token-accurate + reachable docs routes) to actually work — no scope creep beyond what completing this plan's own must_haves required.

## Issues Encountered

None. This executor's environment had no Figma MCP tool access this session — consistent with every prior 06-* plan touching Select/Textarea/Checkbox/RadioGroup/Switch, this is documented honestly in each new docs page (matching each component's own `.DESIGN.md`) rather than hidden or guessed around.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 9 Actions & Forms docs routes are live, reachable, and build-clean — ready for the deferred visual-quality pass (D-13's "shadcn-quality or better" bar is a human judgment call, not automatable).
- `docs/_lib/token-swatch.tsx` and `docs/_lib/code-block.tsx` are now the established shared renderers for future docs plans (06-18 Feedback/Status, 06-19/20/21) to reuse rather than re-inventing either.
- The Server-Component-page + Client-playground-subcomponent split (only where `useState` is genuinely needed) is the pattern future docs plans should follow when a page needs both live `node:fs` token reads and client-side interactivity.
- No blockers. Per D-13's mandate, `/emil-design-vocabulary`, `/emil-ui-polish`, and `/emil-animations` were invoked during this build, and compliance was independently verified via grep (no `transition-all`, no mount-time entrance animations, no un-typographic ellipsis in prose).

## Self-Check: PASSED

- FOUND: src/app/design-system/docs/button/page.tsx
- FOUND: src/app/design-system/docs/button/button-playground.tsx
- FOUND: src/app/design-system/docs/input/page.tsx
- FOUND: src/app/design-system/docs/input/input-playground.tsx
- FOUND: src/app/design-system/docs/label/page.tsx
- FOUND: src/app/design-system/docs/field/page.tsx
- FOUND: src/app/design-system/docs/field/field-playground.tsx
- FOUND: src/app/design-system/docs/select/page.tsx
- FOUND: src/app/design-system/docs/textarea/page.tsx
- FOUND: src/app/design-system/docs/checkbox/page.tsx
- FOUND: src/app/design-system/docs/radio-group/page.tsx
- FOUND: src/app/design-system/docs/switch/page.tsx
- FOUND: src/app/design-system/docs/_lib/token-swatch.tsx
- FOUND: src/app/design-system/docs/_lib/code-block.tsx
- FOUND commit: f435dd3
- FOUND commit: 4eaf9f8
- FOUND commit: 1a2a1d6
- `npm run build` exits 0 (verified after all 3 tasks, all 9 new routes + all pre-existing routes statically generated)
- `grep -c "<pre" src/app/design-system/docs/{button,input}/page.tsx` -> 0, 0
- `grep -l "design-system/docs/field" src/app/design-system/docs/{label,select,textarea}/page.tsx` -> all 3 match
- `grep -l "No dedicated Figma frame exists" src/app/design-system/docs/{checkbox,radio-group,switch}/page.tsx` -> all 3 match

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*
