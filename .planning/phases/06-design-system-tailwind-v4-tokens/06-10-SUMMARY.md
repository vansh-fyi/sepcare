---
phase: 06-design-system-tailwind-v4-tokens
plan: 10
subsystem: ui
tags: [cva, tailwind-v4, figma, navigation, design-tokens, d17]

requires:
  - phase: 06-01
    provides: "Single @theme token block in src/app/globals.css (DSYS-01/03)"
  - phase: 06-06
    provides: "--gradient-cta/--shadow-cta precedent (additive semantic tokens for Figma-revealed gradient/shadow values) and the D-17-style pink-for-non-critical resolution pattern"
provides:
  - "Hand-authored NavLink (active/inactive CVA, Figma-verified against node 279-220) implementing D-17's locked pink/gradient active-state color directly"
  - "Hand-authored NavBar (Figma-verified against node 279-320/279-758), fixed-bottom container composing 4 NavLink instances driven by a currentRoute prop"
  - "--radius-nav-bar (20px), the one remaining unresolved token UI-SPEC.md flagged as TBD, extracted from Figma rather than assumed equal to --radius-card"
  - "4 new additive semantic tokens (--gradient-nav-active, --gradient-nav-indicator, --radius-nav-bar, --shadow-nav-bar) — no existing token value changed"
affects: [06-11, 06-12, 06-13, 06-14, 06-15, 06-16, 06-17, 06-18, 06-19, 06-20, 06-21]

actuals:
  tokens: 5950
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Reused an existing semantic token (--color-bg, --shadow-cta) directly wherever a new Figma-extracted value turned out numerically identical, instead of adding a duplicate-valued token — extends the primitive/semantic layering convention beyond '06-06's promote-to-new-token default"
    - "Per-node Figma extraction relayed via the orchestrator-authored 06-FIGMA-EXTRACTS.md handoff doc (same D-15 workaround as 06-06) — extraction half done pre-dispatch, screenshot-diff half deferred to the orchestrator post-dispatch"

key-files:
  created:
    - src/components/ui/nav-link.tsx
    - src/components/ui/nav-link.DESIGN.md
    - src/components/ui/nav-bar.tsx
    - src/components/ui/nav-bar.DESIGN.md
  modified:
    - src/app/globals.css
    - src/app/design-system/nested/page.tsx

key-decisions:
  - "Implemented NavLink's real Figma-extracted pill design (gradient background fill, drop shadow, conditional label-only-when-active, plus a separate indicator bar) rather than 06-PATTERNS.md's earlier illustrative text-color-only sketch — the real extraction in 06-FIGMA-EXTRACTS.md supersedes that pre-extraction speculation, per D-15's 'match exactly' mandate."
  - "D-17 implemented directly: NavLink's active state reuses the critical/pink gradient hue as a distinct navigation-selected semantic dimension, not re-flagged as an open tension (matches the same resolution 06-06 already applied to Button's cta/cta-critical pink-for-non-critical tension)."
  - "--gradient-nav-active (116deg) kept as a token distinct from --gradient-cta (127deg) despite sharing the same two pink color stops, per the extraction's explicit instruction not to collapse the two."
  - "Reused --shadow-cta directly for NavLink's active-pill drop shadow and --color-bg directly for the inactive pill's border/indicator-bar color, instead of adding new tokens for values that were already numerically identical to an existing semantic token."
  - "--radius-nav-bar extracted as 20px, kept distinct from --radius-card's 24px per UI-SPEC's explicit 'do not guess this value' instruction, even though the two are numerically close."
  - "Cross-checked the real Figma tab set (Home/Vitals/Stats/Settings) against icon.tsx's existing keys and found a full match (home/monitoring/history/settings) — no new icon or second icon library introduced."

patterns-established:
  - "NavLink's label is conditionally rendered (active-only) rather than always-present-but-recolored — a legitimate Figma-authored content difference between states, not a shortcut, and still satisfies Badge's multi-modal rule since 5+ visual properties change together, not color alone."

requirements-completed: [DSYS-01, DSYS-02, DSYS-03]

coverage:
  - id: D1
    description: "NavLink hand-authored and Figma-verified against node 279-220 (both active/inactive states), implementing D-17's locked active-state color directly"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, includes NavLink + nested-page demo)"
        status: pass
      - kind: other
        ref: "grep -c \"min-h-11 min-w-11\\|min-w-11 min-h-11\" src/components/ui/nav-link.tsx -> 1"
        status: pass
    human_judgment: true
    rationale: "The visual fidelity claim (rendered NavLink states match the Figma get_screenshot output for node 279-220) requires an actual pixel/visual comparison, which this executor cannot perform (no Figma MCP/browser tool access, per the D-15 workaround) — deferred to the orchestrator's post-dispatch screenshot-diff pass."
  - id: D2
    description: "NavBar hand-authored and Figma-verified against node 279-320/279-758, composing 4 NavLink instances with --radius-nav-bar extracted (not guessed) and the icon cross-check completed with no gap"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, includes NavBar + nested-page demo)"
        status: pass
      - kind: other
        ref: "grep -c \"^\\s*--radius-nav-bar:\" src/app/globals.css -> 1"
        status: pass
      - kind: other
        ref: "grep -c \"lucide-react\" src/components/ui/nav-bar.tsx -> 0"
        status: pass
    human_judgment: true
    rationale: "Same as D1 — visual fidelity for the rendered NavBar against its Figma screenshot requires the orchestrator's deferred comparison pass."
  - id: D3
    description: "DSYS-01/03 lock preserved: globals.css changes are purely additive, no existing token value changed"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "git diff <plan-base>..HEAD -- src/app/globals.css | grep -E \"^-[^-]\" -> empty"
        status: pass
    human_judgment: false

duration: 22min
completed: 2026-09-27
status: complete
---

# Phase 6 Plan 10: NavLink + NavBar (D-17 Color Resolution) Summary

**Hand-authored NavLink and NavBar Figma-verified against nodes 279-220/279-320, implementing D-17's locked pink-active-tab resolution directly and extracting the one remaining unresolved token (`--radius-nav-bar: 20px`) UI-SPEC.md had flagged as TBD.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-09-27T00:20:00Z
- **Completed:** 2026-09-27T00:42:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Extracted NavLink's real active/inactive pill design from Figma node `279-220` (gradient pill,
  drop shadow, conditional icon+label vs. icon-only, plus a separate indicator bar) and rebuilt
  it exactly — not the simplified text-color-only sketch 06-PATTERNS.md had speculated before
  the real extraction was available.
- Implemented D-17 directly: NavLink's active state reuses the critical/pink gradient hue for a
  distinct navigation-selected semantic dimension, exactly as the user's locked resolution
  specifies — not re-flagged as an open tension.
- Extracted NavBar's real container treatment from node `279-320`/`279-758` (white rounded-top
  container, upward drop shadow, 4 evenly-spaced NavLink instances) and the one remaining
  UI-SPEC.md "TBD" token, `--radius-nav-bar` (20px) — confirmed distinct from `--radius-card`'s
  24px rather than assumed equal.
- Cross-checked the real Figma tab set (Home/Vitals/Stats/Settings) against `icon.tsx`'s existing
  40+ icon keys and found a full match (`home`/`monitoring`/`history`/`settings`) — no new icon
  or second icon library introduced.
- Added 4 small additive semantic tokens (`--gradient-nav-active`, `--gradient-nav-indicator`,
  `--radius-nav-bar`, `--shadow-nav-bar`) while reusing 2 existing tokens (`--shadow-cta`,
  `--color-bg`) directly wherever the extracted value was already numerically identical — no
  existing token value changed.
- Mounted live demo instances of both components on `/design-system/nested` for the
  orchestrator's deferred D-15 screenshot-diff pass.

## Task Commits

1. **Task 1: Figma-verify + hand-author NavLink (D-17 color resolution)** - `cdcdb36` (feat)
2. **Task 2: Figma-verify + hand-author NavBar, extract --radius-nav-bar** - `3522580` (feat)

**Plan metadata:** (this commit, docs)

## Files Created/Modified

- `src/components/ui/nav-link.tsx` - `NavLink`, active/inactive CVA, D-17 color resolution,
  44x44px touch target, `aria-current` on active link.
- `src/components/ui/nav-link.DESIGN.md` - Full Figma extraction notes for node `279-220`, D-17
  resolution rationale, multi-modal rule reasoning, token-reuse decisions.
- `src/components/ui/nav-bar.tsx` - `NavBar`, fixed-bottom container composing 4 `NavLink`
  instances, `currentRoute`-driven active state, safe-area-inset padding.
- `src/components/ui/nav-bar.DESIGN.md` - Full Figma extraction notes for node `279-320`/`279-758`,
  the icon cross-check table, and the `--radius-nav-bar`/`--shadow-nav-bar` extraction rationale.
- `src/app/globals.css` - Added 4 additive semantic tokens (`--gradient-nav-active`,
  `--gradient-nav-indicator`, `--radius-nav-bar`, `--shadow-nav-bar`); no existing token changed.
- `src/app/design-system/nested/page.tsx` - Added live demo instances of both `NavLink` states
  and a mounted `NavBar`, for the orchestrator's deferred screenshot-diff pass.

## Decisions Made

See `key-decisions` in frontmatter above — summarized: built NavLink's real Figma-extracted pill
design (not the earlier illustrative sketch); D-17 implemented directly per the locked
resolution; `--gradient-nav-active` kept distinct from `--gradient-cta` despite sharing color
stops (different angle, per the extraction's explicit instruction); reused `--shadow-cta` and
`--color-bg` directly instead of adding duplicate-valued tokens; `--radius-nav-bar` extracted as
20px, distinct from `--radius-card`'s 24px; icon cross-check found a full match, no gap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added 4 additive semantic tokens to `globals.css` in Task 1**
- **Found during:** Task 1
- **Issue:** Task 1's own `<files>` tag only listed `nav-link.tsx`/`nav-link.DESIGN.md`, but the
  extracted Figma gradient values (116deg active-pill fill, gradient-to-top indicator bar) don't
  match any existing token, and the codebase's own convention (established in 06-06) expects new
  Figma-revealed values to become named semantic tokens. The plan's own top-level
  `files_modified` frontmatter already listed `src/app/globals.css` for the whole plan, so this
  is within the plan's declared scope, just executed a task earlier than Task 2's own globals.css
  work.
- **Fix:** Added `--gradient-nav-active` and `--gradient-nav-indicator` in Task 1; reused
  `--shadow-cta` and `--color-bg` directly (no new token) where the extracted value was already
  identical to an existing one.
- **Files modified:** `src/app/globals.css`
- **Verification:** `npm run build` exits 0; plan-level `git diff` check (D3 above) confirms no
  existing token value changed.
- **Committed in:** `cdcdb36` (Task 1)

**2. [Rule 2 - Missing Critical] Added a live NavLink/NavBar demo to `/design-system/nested`**
- **Found during:** Task 1 and Task 2
- **Issue:** The orchestrator's deferred screenshot-diff verification (second half of D-15) needs
  an actual rendered instance of each state/component to compare against Figma; none existed on
  any page prior to this plan.
- **Fix:** Added a "NavLink states (06-10)" demo card and a live mounted `NavBar` to the existing
  `nested` sample page, without touching its original Device Sync / Button-archetype cards.
- **Files modified:** `src/app/design-system/nested/page.tsx`
- **Verification:** `npm run build` exits 0; route renders in the static page list.
- **Committed in:** `cdcdb36` (NavLink states card), `3522580` (NavBar mount)

---

**Total deviations:** 2 auto-fixed (both Rule 2 - missing critical functionality, both additive/
non-breaking to existing tokens and pages, both within the plan's own declared
`files_modified` scope).
**Impact on plan:** Both were necessary infrastructure for the plan's own stated D-15 mechanism
to be checkable at all — no scope creep beyond what NavLink/NavBar's own Figma reconciliation
required.

## Issues Encountered

None — the D-15 Figma-extraction workaround (reading `06-FIGMA-EXTRACTS.md` instead of calling
Figma MCP tools directly) worked as described; no tool-access blockers. The real extraction data
in `06-FIGMA-EXTRACTS.md` showed a richer NavLink pill design (gradient fill, conditional label,
indicator bar) than 06-PATTERNS.md's earlier illustrative text-color-only sketch — resolved by
treating the real per-node extraction as authoritative (D-15's own "match exactly" mandate),
not a conflict requiring escalation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `nav-link.tsx`'s exported `NavLinkState` type (`"active" | "inactive"`) and `nav-bar.tsx`'s
  exported `NavBarTab`/`NAV_TABS` are ready for Home-proof (06-20) to mount `<NavBar
  currentRoute={...} />` as its fixed bottom element, per this plan's `key_links`.
- `--radius-nav-bar` is now declared exactly once — no later plan touching `globals.css` should
  re-declare or duplicate it (per this plan's own `key_links` constraint).
- **Not yet done, deferred to the orchestrator:** the screenshot-vs-Figma visual comparison
  (second half of D-15) for both `279-220` (NavLink) and `279-320`/`279-758` (NavBar).
  `nav-link.DESIGN.md`/`nav-bar.DESIGN.md` explicitly flag this as pending in their "Screenshot
  comparison" sections. The orchestrator should screenshot `/design-system/nested`'s NavLink/
  NavBar demo blocks against the Figma `get_screenshot` output for both nodes and record the
  result (match or documented deviation) before this plan is considered fully closed on the D-15
  mechanism. Two specific gaps flagged for that pass: (1) neither gradient's exact color-stop
  percentages were part of this extraction (both default to 0%/100%); (2) the icon-to-label gap
  inside the active pill used a default `gap-1` (4px) since no exact value was extracted.
- 06-11 and later plans can proceed; no blockers introduced by this plan.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*

## Self-Check: PASSED

- FOUND: src/components/ui/nav-link.tsx
- FOUND: src/components/ui/nav-link.DESIGN.md
- FOUND: src/components/ui/nav-bar.tsx
- FOUND: src/components/ui/nav-bar.DESIGN.md
- FOUND commit: cdcdb36
- FOUND commit: 3522580
- `npm run build` exits 0 (verified after both tasks)
- `grep -c "min-h-11 min-w-11\|min-w-11 min-h-11" src/components/ui/nav-link.tsx` -> 1
- `grep -c "^\s*--radius-nav-bar:" src/app/globals.css` -> 1
- `grep -c "lucide-react" src/components/ui/nav-bar.tsx` -> 0
- `git diff <plan-base>..HEAD -- src/app/globals.css` shows only additive lines, no existing
  token value changed
