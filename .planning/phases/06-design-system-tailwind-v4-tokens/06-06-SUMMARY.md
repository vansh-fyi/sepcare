---
phase: 06-design-system-tailwind-v4-tokens
plan: 06
subsystem: ui
tags: [cva, tailwind-v4, figma, button, design-tokens, d15]

requires:
  - phase: 06-01
    provides: "Single @theme token block in src/app/globals.css (DSYS-01/03)"
  - phase: 06-03
    provides: "Restyled Button CVA skeleton (primary/secondary/tertiary/critical) consuming semantic tokens"
provides:
  - "Figma-reconciled Button CVA variant set: primary/secondary/tertiary/critical (unchanged) plus new cta/cta-critical (gradient CTA-pill archetype) and icon-outline/icon-filled (icon-only archetypes)"
  - "Proven D-15 Figma-extraction-then-screenshot-diff mechanism (extraction half complete; screenshot-diff half deferred to orchestrator per the D-15 workaround)"
  - "6 new additive semantic tokens (--radius-cta, --gradient-cta, --gradient-cta-critical, --shadow-cta, --radius-icon-btn, --color-icon-fill-dark) — no existing token value changed"
affects: [06-07, 06-08, 06-09, 06-10, 06-11, 06-12, 06-13, 06-14, 06-15, 06-16, 06-17, 06-18, 06-19, 06-20, 06-21]

actuals:
  tokens: 5716
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Per-node Figma extraction relayed via an orchestrator-authored handoff doc (06-FIGMA-EXTRACTS.md) when the executor subagent has no Figma MCP tool access — extraction half done by orchestrator pre-dispatch, screenshot-diff half done by orchestrator post-dispatch"
    - "New Figma-revealed radius/gradient/shadow/color values get promoted into small additive semantic tokens (never touching existing token values) rather than hardcoded literals in component files — same pattern UI-SPEC.md already anticipated for --radius-nav-bar"
    - "Per-variant content-gap override map (CONTENT_GAP) for CVA components whose Figma-verified variants need a different icon/label gap than the component's original default"

key-files:
  created: []
  modified:
    - src/components/ui/button.tsx
    - src/components/ui/button.DESIGN.md
    - src/app/globals.css
    - src/components/icon.tsx
    - src/app/design-system/nested/page.tsx

key-decisions:
  - "Node 203-11745 ('Connect Device') does NOT map 1:1 onto the existing primary variant despite the plan's own speculation that it 'likely' would — it's a pink gradient pill with a distinct 10px radius, so it became a new variant, cta, leaving primary/secondary/tertiary/critical untouched."
  - "The 4 Figma 'button treatment' nodes D-12 grouped together are not 4 variants of one family — they resolve to 3 distinct archetypes (gradient CTA pill x2, bordered icon-only, filled icon-only), all kept as 4 new distinct CVA variants (cta, cta-critical, icon-outline, icon-filled) since none folds into an existing variant's pseudo-state or duplicates another."
  - "Resolved the cta/cta-critical pink-for-non-critical tension with D-04 the same way D-17 resolved the analogous Nav tension: matched the Figma screenshot exactly (pink for both Connect Device and Call Ambulance, at two intensities) rather than 'fixing' the non-critical one to blue — device-connectivity and health-status are treated as separate semantic dimensions."
  - "Node 203-11521's layer name ('Monotone add') is stale/mislabeled — built the left-chevron/back-arrow glyph the screenshot actually shows, not a plus sign, per the extraction doc's explicit correction."
  - "New Figma-revealed values (10px/12px radii, two pink gradients, a neutral-tinted shadow, a neutral-700 fill alias) were promoted into 6 small additive semantic tokens in globals.css rather than hardcoded as literals in button.tsx or force-fit onto existing tokens — consistent with the codebase's own primitive/semantic layering convention and the --radius-nav-bar precedent already flagged in UI-SPEC.md. No existing token value was changed."
  - "Applied 06-UI-SPEC.md's Motion press-feedback rule (active:scale-[0.96], 150ms ease-out) to Button's shared base class during Task 2, since none of the 4 original variants had it yet and the task's own action text called for it across 'every kept variant.'"

patterns-established:
  - "CONTENT_GAP per-variant override map for icon+label gap, keyed off the exported ButtonVariant union"
  - "Icon-only Button variants (icon-outline/icon-filled) render a single child with no visible text label — accessible name comes from aria-label, documented in DESIGN.md's Incorrect-usage block"

requirements-completed: [DSYS-01, DSYS-02, DSYS-03]

coverage:
  - id: D1
    description: "Node 203-11745 ('Connect Device') Figma-extracted and rebuilt as new cta variant, with the extraction values and reconciliation finding recorded in button.DESIGN.md"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, includes new cta variant + nested-page demo)"
        status: pass
      - kind: other
        ref: "grep -c \"Verified against Figma node\" src/components/ui/button.DESIGN.md -> 1"
        status: pass
    human_judgment: true
    rationale: "The visual fidelity claim (rendered cta variant matches the Figma get_screenshot output for node 203-11745) requires an actual pixel/visual comparison, which this executor cannot perform (no Figma MCP/browser tool access, per the D-15 workaround) — deferred to the orchestrator's post-dispatch screenshot-diff pass."
  - id: D2
    description: "Remaining 3 Figma nodes (203-14032, 203-11521, 266-9285) inspected and reconciled into cta-critical/icon-outline/icon-filled, with full disposition trail in button.DESIGN.md"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, includes all 3 new variants + nested-page demos)"
        status: pass
      - kind: other
        ref: "grep -c \"203-14032\\|203-11521\\|266-9285\" src/components/ui/button.DESIGN.md -> 8"
        status: pass
    human_judgment: true
    rationale: "Same as D1 — visual fidelity for cta-critical/icon-outline/icon-filled against their respective Figma screenshots requires the orchestrator's deferred comparison pass."
  - id: D3
    description: "DSYS-03 adjacency: no audience-specific (caregiver/parent) color token was introduced by this plan's additive token changes"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "grep -c \"^\\s*--color-.*\\(caregiver\\|parent\\)\" src/app/globals.css -> 0"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-09-27
status: complete
---

# Phase 6 Plan 06: Figma-Verified Button Archetype Expansion Summary

**Reconciled Button's 4 D-12 Figma button-treatment nodes into a real 8-variant CVA union (added `cta`, `cta-critical`, `icon-outline`, `icon-filled` — none a guessed rename), proving the D-15 Figma-extraction mechanism end-to-end on the smallest real slice before the rest of Phase 6 repeats it.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-09-26T23:03:00Z
- **Completed:** 2026-09-26T23:28:21Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Extracted exact padding/radius/gradient/shadow/typography values for Figma node `203-11745`
  ("Connect Device") via the orchestrator's D-15 extraction handoff and rebuilt them as a new
  `cta` variant — explicitly NOT a rename of `primary`, since the frame is a pink gradient pill
  with a 10px radius, not the existing blue flat fill.
- Inspected the remaining 3 button-treatment nodes (`203-14032`, `203-11521`, `266-9285`) and
  discovered they are not 4 variants of one family but 3 distinct archetypes — reconciled into
  `cta-critical` (darker gradient pill, SemiBold), `icon-outline` (bordered, no fill), and
  `icon-filled` (fixed 40×40, dark fill), each with a documented disposition trail.
- Corrected node `203-11521`'s stale "Monotone add" layer name against its actual rendered glyph
  (a left-chevron/back-arrow), mapping it to the existing `back` icon rather than building a `+`.
- Added 6 small, purely additive semantic tokens to `globals.css` (no existing token value
  changed) to back the new archetypes, and applied the UI-SPEC Motion press-feedback rule
  (`active:scale-[0.96]`) to Button's shared base class.
- Extended the `/design-system/nested` sample page with live instances of all 4 new/reconciled
  variants so the orchestrator has real rendered output to screenshot-diff against Figma.

## Task Commits

1. **Task 1: Tracer — Figma-verify + rebuild Button's `primary` treatment end-to-end** - `c763933` (feat)
2. **Task 2: Expand — reconcile the remaining 3 button nodes into the final variant set** - `21ea072` (feat)

**Plan metadata:** (this commit, docs)

## Files Created/Modified

- `src/components/ui/button.tsx` - Added `cta`/`cta-critical`/`icon-outline`/`icon-filled` CVA
  variants, a per-variant `CONTENT_GAP` map, and the shared `active:scale-[0.96]` press-feedback
  base class.
- `src/components/ui/button.DESIGN.md` - Full Figma extraction notes for all 4 nodes, the
  reconciliation trail, updated Variants table, and updated Correct/Incorrect usage examples.
- `src/app/globals.css` - Added 6 additive semantic tokens (`--radius-cta`, `--gradient-cta`,
  `--gradient-cta-critical`, `--shadow-cta`, `--radius-icon-btn`, `--color-icon-fill-dark`).
- `src/components/icon.tsx` - Added a `phone` icon glyph (needed for the Call Ambulance demo;
  the existing 40+ set had no phone icon, per D-09's flagged icon-gap expectation).
- `src/app/design-system/nested/page.tsx` - Added a second demo card rendering all 4 new/
  reconciled Button variants, for the orchestrator's deferred screenshot-diff pass.

## Decisions Made

See `key-decisions` in frontmatter above — summarized: `cta` is a genuinely new variant (not a
`primary` rename); all 4 Figma nodes resolve to 3 distinct archetypes, all kept as distinct
variants (no folding, no duplicates); the pink-for-non-critical tension in `cta` was resolved by
matching Figma exactly (same reasoning D-17 already established for Nav); new radius/gradient/
shadow/color values were promoted into small additive semantic tokens rather than hardcoded
literals, per the codebase's existing primitive/semantic layering convention.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added 6 additive semantic tokens to `globals.css`**
- **Found during:** Task 1
- **Issue:** The plan's declared `files_modified` only listed `button.tsx`/`button.DESIGN.md`,
  but the extracted Figma values (10px radius, two pink gradients, a neutral-tinted shadow, a
  12px radius, a neutral-700 fill alias) don't match any existing token, and the codebase's own
  convention (`globals.css`'s "Components never reference [primitives] directly — only the
  semantic layer... does" comment, plus UI-SPEC.md's `--radius-nav-bar: TBD` precedent) expects
  new Figma-revealed values to become named semantic tokens, not raw literals in component files.
- **Fix:** Added `--radius-cta`, `--gradient-cta`, `--gradient-cta-critical`, `--shadow-cta`,
  `--radius-icon-btn`, `--color-icon-fill-dark` — all additive, none redefining an existing
  token's value (DSYS-01/03 lock preserved; verified via the DSYS-03 grep check returning 0).
- **Files modified:** `src/app/globals.css`
- **Verification:** `npm run build` exits 0; DSYS-03 grep check returns 0.
- **Committed in:** `c763933` (radius-cta/gradient-cta/shadow-cta), `21ea072` (the remaining 3)

**2. [Rule 2 - Missing Critical] Added a `phone` icon glyph to `icon.tsx`**
- **Found during:** Task 2
- **Issue:** Demonstrating the `cta-critical` variant ("Call Ambulance") needed a phone icon;
  none existed in the 40+ icon set (D-09 flagged this exact kind of gap as expected).
- **Fix:** Added a `phone` glyph following the existing stroke-icon convention.
- **Files modified:** `src/components/icon.tsx`
- **Verification:** `npm run build` exits 0.
- **Committed in:** `21ea072`

**3. [Rule 2 - Missing Critical] Added live demo instances to `/design-system/nested`**
- **Found during:** Task 1 and Task 2
- **Issue:** The orchestrator's deferred screenshot-diff verification (second half of D-15) needs
  an actual rendered instance of each new variant to compare against Figma; none existed on any
  page prior to this plan.
- **Fix:** Added an additive "Figma-verified Button archetypes (06-06)" card to the existing
  `nested` sample page, without touching the original Device Sync card/demo.
- **Files modified:** `src/app/design-system/nested/page.tsx`
- **Verification:** `npm run build` exits 0; route renders in the static page list.
- **Committed in:** `c763933` (cta), `21ea072` (the remaining 3)

---

**Total deviations:** 3 auto-fixed (all Rule 2 - missing critical functionality, all additive/
non-breaking to existing tokens and pages).
**Impact on plan:** All three were necessary infrastructure for the plan's own stated mechanism
(D-15) to be checkable at all — no scope creep beyond what the Button reconciliation itself
required.

## Issues Encountered

None — the D-15 Figma-extraction workaround (reading `06-FIGMA-EXTRACTS.md` instead of calling
Figma MCP tools directly) worked as described; no tool-access blockers.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `button.tsx`'s exported `ButtonVariant` type now includes `cta`/`cta-critical`/`icon-outline`/
  `icon-filled` alongside the original 4 — every later plan (docs-site rebuild, Home-proof
  screen, any Card/NavLink/etc. plan that reaches for a Button) should read the variant union
  from this file directly, not assume the old 4-name set.
- **Not yet done, deferred to the orchestrator:** the screenshot-vs-Figma visual comparison
  (second half of D-15) for all 4 button-treatment nodes. `button.DESIGN.md` explicitly flags
  this as pending in its Figma-extraction sections. The orchestrator should screenshot
  `/design-system/nested`'s new "Figma-verified Button archetypes" card against the Figma
  `get_screenshot` output for nodes `203-11745`/`203-14032`/`203-11521`/`266-9285` and record the
  result (match or documented deviation) in `button.DESIGN.md` before this plan is considered
  fully closed on the D-15 mechanism.
- The docs-site (`src/app/design-system/docs/page.tsx`) still shows the stale "Exactly four
  variants — no size axis this phase" copy and only demos the original 4 — out of this plan's
  declared scope (`06-05` already closed the docs-site rebuild; a later docs-sync pass should
  reconcile it against this plan's expanded variant set).
- 06-07 (Card reconciliation) and later plans can proceed; no blockers introduced by this plan.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*

## Self-Check: PASSED

- FOUND: src/components/ui/button.tsx
- FOUND: src/components/ui/button.DESIGN.md
- FOUND commit: c763933
- FOUND commit: 21ea072
- `npm run build` exits 0 (verified after both tasks)
- `grep -c "Verified against Figma node" src/components/ui/button.DESIGN.md` -> 1
- `grep -c "203-14032\|203-11521\|266-9285" src/components/ui/button.DESIGN.md` -> 8
- `grep -c "^\s*--color-.*\(caregiver\|parent\)" src/app/globals.css` -> 0
