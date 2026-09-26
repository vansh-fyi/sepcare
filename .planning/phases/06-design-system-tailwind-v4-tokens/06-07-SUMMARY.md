---
phase: 06-design-system-tailwind-v4-tokens
plan: 07
subsystem: ui
tags: [tailwind-v4, figma, card, item, shadcn, design-tokens, d15, d12]

requires:
  - phase: 06-06
    provides: "Proven D-15 Figma-extraction-then-screenshot-diff mechanism (extraction half); per-node semantic-token additive pattern"
provides:
  - "Figma-verified Card base surface primitive (radius/padding/shadow corrected to real extracted values, CardTitle/CardDescription restyled, CardFooter double-padding bug fixed)"
  - "Fully resolved 6-row Card Type Map — every D-12 card-type node given a working name and disposition, zero left open"
  - "shadcn Item row primitive installed and restyled to the project's semantic token layer, documented as the canonical row/list-item primitive"
  - "9 new additive semantic tokens (--color-text-strong, --color-text-subtle, --color-text-hero-muted, --color-icon-tile-neutral, --color-icon-tile-green, --gradient-card-hero-icon, --gradient-card-device-icon, --shadow-card-device, --gradient-metric-pulse) plus 2 corrected existing values (--radius-card 20px->24px, --shadow-card guessed->real)"
affects: [06-08, 06-09, 06-10, 06-11, 06-12, 06-13, 06-14, 06-15, 06-16, 06-17, 06-18, 06-19, 06-20, 06-21]

actuals:
  tokens: 8378
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Cross-component token reuse: Item's icon-tile and title/description colors reuse the exact same additive tokens Card's own restyle introduced (--color-icon-tile-neutral, --color-text-strong, --color-text-subtle), since both primitives render the same instruction-row content depending on composition choice"
    - "Node-ID/label mismatch correction: when a plan's own guessed node-to-name pairing conflicts with the real Figma extraction, trust the real extraction and document the correction explicitly (same class of fix as 06-06's stale 'Monotone add' layer-name correction)"
    - "Deliberately deferred component promotion: a genuinely distinct Figma pattern (Vital Stat Card) with only partial extracted data (one of three tones) is documented as a composition, not force-promoted into an incomplete new component — the promotion decision waits for the plan that has full data"

key-files:
  created:
    - src/components/ui/item.tsx
    - src/components/ui/item.DESIGN.md
    - src/components/ui/separator.tsx
  modified:
    - src/components/ui/card.tsx
    - src/components/ui/card.DESIGN.md
    - src/app/globals.css

key-decisions:
  - "Corrected the plan's own guessed node-to-label pairing: 266-9387 is the Instruction Row Card (not 'vital stat card' as the plan/prior UI-SPEC assumed), and 266-9344 is the Vital Stat Card (not 'status hero card') — trusted the real Figma extraction over the stale guess, per D-15's whole purpose."
  - "--radius-card corrected 20px -> 24px and --shadow-card corrected to a real plain-neutral value; Card's own padding corrected p-6 -> p-4 — all three were guessed values from before any real per-node Figma data existed for Card."
  - "Card title weight-discipline tension (UI-SPEC's '700 reserved for 3 roles only' rule vs. real Figma data showing card titles as Bold across every node) resolved by matching Figma exactly, per the same precedent 06-06 and D-17 already established twice this phase."
  - "Vital Stat Card (266-9344) is documented as a composition, not promoted to a new CardMetric export — only its Pulse gradient was exactly extracted (Temp/Activity gradients were described only as 'follow the same pattern,' no exact stops given), so a 3-tone component would either fabricate two gradients or ship an incomplete enum. Deferred to whichever later plan builds the real vitals row."
  - "Node 203-11669's progress bar resolves D-16's open question: a generic percentage-driven horizontal bar named `progress`, not a battery-shaped indicator — confirmed no card node shows an actual battery glyph. Building the Progress primitive itself is 06-08's job, not this plan's."
  - "Item's icon-tile/title/description restyle deliberately reuses the exact same tokens Card's Task 1/2 restyle introduced, rather than deriving parallel values, since both primitives can render the same instruction-row content depending on which composition (Card-per-row vs. Card+many-Items) a later plan picks."
  - "Item's focus-visible state uses Input's existing border-border-focus/shadow-focus convention (a box-shadow token) instead of inventing a ring-color/ring-width mechanism, keeping exactly one focus-ring approach across the whole component set."

patterns-established:
  - "Additive semantic tokens are named for role, not for the single component that first needed them, when the value is expected to recur (e.g. --color-icon-tile-neutral is shared by Card's icon tile and Item's icon-tile media variant)."

requirements-completed: [DSYS-01, DSYS-02, DSYS-03]

coverage:
  - id: D1
    description: "Card's base surface (radius/padding/shadow) and CardTitle/CardDescription/CardFooter restyled against real Figma-extracted values from nodes 266-9387/266-9344, with the plan's own node/label mismatch documented and corrected"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, includes restyled Card + all 3 tasks' changes)"
        status: pass
      - kind: other
        ref: "grep -c \"Verified against Figma node\" src/components/ui/card.DESIGN.md -> 3"
        status: pass
    human_judgment: true
    rationale: "The visual fidelity claim (rendered Card matches the Figma get_screenshot output for nodes 266-9387/266-9344) requires an actual pixel/visual comparison this executor cannot perform (no Figma MCP/browser tool access, per the D-15 workaround) — deferred to the orchestrator's post-dispatch screenshot-diff pass, same deferral 06-06 already documented for Button."
  - id: D2
    description: "All 6 Card Type Map rows resolved to a working name + disposition ((a)/(b)/(c)), zero left 'Unconfirmed'"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -c \"Unconfirmed\" src/components/ui/card.DESIGN.md -> 0"
        status: pass
      - kind: other
        ref: "npm run build (exit 0)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Item (+ ItemMedia/ItemContent/ItemTitle/ItemDescription/ItemActions/ItemGroup) installed via shadcn and restyled to the token layer, zero stock shadcn tokens remaining"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "grep -c \"bg-card\\\\|text-card-foreground\\\\|text-muted-foreground\" src/components/ui/item.tsx -> 0"
        status: pass
      - kind: other
        ref: "npm run build (exit 0)"
        status: pass
      - kind: other
        ref: "git show --stat <item-install-commit> -> card.tsx absent from the changed-files list"
        status: pass
    human_judgment: true
    rationale: "Visual fidelity of Item's restyled instruction-row typography against the Home screen node 266-9257 requires the orchestrator's deferred screenshot-diff pass, same as D1."
  - id: D4
    description: "DSYS-03 adjacency: no audience-specific (caregiver/parent) color token was introduced by this plan's additive token changes"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "grep -c \"^\\\\s*--color-.*\\\\(caregiver\\\\|parent\\\\)\" src/app/globals.css -> 0"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-09-27
status: complete
---

# Phase 6 Plan 07: Figma-Verified Card Restyle + Resolved 6-Card Type Map + Item Row Primitive Summary

**Restyled Card's base surface against real Figma-extracted values (correcting a stale node/label mismatch), fully resolved all 6 D-12 card-type nodes into documented dispositions, and installed+restyled the shadcn Item row primitive as the canonical instruction-row building block.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-09-26T23:44:00Z
- **Completed:** 2026-09-26T23:49:43Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Extracted exact padding (16px), radius (24px), and shadow values from Figma nodes `266-9387`
  and `266-9344` and applied them to `Card`'s base surface — correcting three previously-guessed
  values (`p-6`→`p-4`, `--radius-card` 20px→24px, `--shadow-card`'s deeper guessed value → the
  real plain-neutral one).
- Discovered and documented that the plan's own guessed node-to-label pairing was backwards:
  `266-9387` is the **Instruction Row Card**, not the "vital stat card" the plan/prior UI-SPEC
  assumed; `266-9344` is the **Vital Stat Card**, not the "status hero card." Corrected the
  restyle to use the real per-node data rather than the stale labels.
- Restyled `CardTitle`/`CardDescription` from unstyled/placeholder classes to real Figma
  typography (14px Bold / 12px Regular), adding two small additive tokens
  (`--color-text-strong`, `--color-text-subtle`) since neither existing text token matched.
- Fixed a pre-existing `CardFooter` double-padding bug (`px-6` stacked on top of `Card`'s own
  `p-6`/`p-4`) — a Rule 1 correctness fix unrelated to the Figma extraction itself.
- Inspected all 4 remaining unconfirmed card-type nodes (`266-9323`, `203-13605`, `203-13559`,
  `203-11669`) and resolved each to a disposition, rewriting `card.DESIGN.md`'s Card Type Map
  with all 6 rows fully resolved — zero left "Unconfirmed."
- Deliberately did **not** promote the Vital Stat Card to a new `CardMetric` export, since only
  its Pulse gradient was exactly extracted; documented as a composition instead, with the gap
  flagged for whichever later plan builds the real vitals row.
- Resolved D-16's progress-vs-battery-indicator question for node `203-11669`: a generic
  percentage-driven horizontal bar (named `progress`), not a battery glyph — the primitive itself
  is 06-08's job.
- Installed `shadcn add item` (no `-b` flag, confirmed live) — `card.tsx` untouched by the
  install, per the plan's own install-order guard concern.
- Replaced every stock shadcn semantic token in the generated `item.tsx` (`bg-muted`, `bg-accent`,
  `border-ring`/`ring-ring`, `text-muted-foreground`, `text-primary`) with real project tokens,
  reusing Card's own new tokens where the visual role is identical (icon-tile fill, title/
  description color) and Input's existing focus-ring convention rather than inventing a second one.
- Authored `item.DESIGN.md` documenting `Item` as the canonical row primitive, citing the Home
  screen node `266-9257` and the full stock-token restyle table.

## Task Commits

1. **Task 1: Figma-verify Card's base surface against the two confirmed nodes** - `8674b6f` (feat)
2. **Task 2: Resolve the 4 unconfirmed card-type nodes into the final Card Type Map** - `26ecae3` (docs)
3. **Task 3: Install + restyle the Item row primitive** - `eb0a866` (feat)

**Plan metadata:** (this commit, docs)

_Note: Task 2's additive semantic tokens for the 4 resolved node dispositions
(`--color-text-hero-muted`, `--gradient-card-hero-icon`, `--gradient-card-device-icon`,
`--shadow-card-device`, `--gradient-metric-pulse`, `--color-icon-tile-green`) were added to
`globals.css` in the same edit pass as Task 1's tokens and landed in Task 1's commit
(`8674b6f`) rather than Task 2's — a minor sequencing deviation, documented below, with no
functional impact (all tokens are additive and correctly scoped to their Task 2 provenance in
`card.DESIGN.md`)._

## Files Created/Modified

- `src/components/ui/card.tsx` - Restyled `Card`'s padding (p-6→p-4), `CardTitle`/
  `CardDescription` typography, fixed `CardFooter`'s double-padding bug.
- `src/components/ui/card.DESIGN.md` - Full Figma extraction notes for both confirmed nodes, the
  node/label mismatch correction, and the fully-resolved 6-row Card Type Map.
- `src/app/globals.css` - Corrected `--radius-card`/`--shadow-card` values; added 9 additive
  semantic tokens across Tasks 1-2.
- `src/components/ui/item.tsx` - shadcn `item` registry component, restyled to the token layer.
- `src/components/ui/item.DESIGN.md` - Item usage rules, Figma provenance, stock-token restyle
  table.
- `src/components/ui/separator.tsx` - Installed as `Item`'s dependency; only its `cn` import path
  needed a (non-functional) consistency fix — its one color class already matched an existing
  token.

## Decisions Made

See `key-decisions` in frontmatter above — summarized: trusted the real Figma extraction over the
plan's own stale node/label guess; corrected three previously-guessed Card token values to real
extracted data; resolved a weight-discipline tension by matching Figma exactly (same precedent as
06-06/D-17); deliberately deferred the Vital Stat Card's promotion to a new component pending full
3-tone extraction; reused Card's new tokens in Item rather than deriving parallel values.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `CardFooter`'s double-padding bug**
- **Found during:** Task 1
- **Issue:** `CardFooter` carried its own `px-6` in addition to `Card`'s own `p-6`/`p-4` wrapper
  padding — double-counting horizontal inset whenever `CardFooter` was used, unlike stock shadcn's
  Card (which has no padding of its own and relies entirely on each region's own `px-6`).
- **Fix:** Removed the redundant `px-6`; changed `pt-6`→`pt-4` to match the corrected 16px scale.
- **Files modified:** `src/components/ui/card.tsx`
- **Verification:** `npm run build` exits 0.
- **Committed in:** `8674b6f` (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed `cn` import path inconsistency in generated `item.tsx`/`separator.tsx`**
- **Found during:** Task 3
- **Issue:** shadcn's `add item` generated files import `cn` directly from the `"cn"` package,
  while every other component in this project imports it via `@/lib/utils` (which re-exports the
  same package). Not a functional bug, but an inconsistency with the established project
  convention every other `ui/*.tsx` file follows.
- **Fix:** Changed both files' import to `import { cn } from "@/lib/utils"`.
- **Files modified:** `src/components/ui/item.tsx`, `src/components/ui/separator.tsx`
- **Verification:** `npm run build` exits 0.
- **Committed in:** `eb0a866` (Task 3 commit)

**3. [Sequencing, no functional impact] Task 2's additive tokens landed in Task 1's commit**
- **Found during:** Writing Task 1's `globals.css` edit (before Task 2 began)
- **Issue:** All new semantic tokens for both tasks were added to `globals.css` in a single edit
  pass, so Task 2's 6 tokens (`--color-text-hero-muted`, `--gradient-card-hero-icon`,
  `--gradient-card-device-icon`, `--shadow-card-device`, `--gradient-metric-pulse`,
  `--color-icon-tile-green`) are physically present in Task 1's commit rather than Task 2's own
  commit.
- **Fix:** None needed — this is a commit-boundary sequencing detail, not a code defect. Each
  token's actual provenance (which Figma node it came from, which task resolved it) is correctly
  documented in `card.DESIGN.md`'s Task 1/Task 2 sections regardless of which commit physically
  introduced the CSS line.
- **Files modified:** `src/app/globals.css` (already covered by Task 1's commit)
- **Verification:** N/A — documentation-accuracy concern only, confirmed by re-reading
  `card.DESIGN.md`'s per-token provenance comments.
- **Committed in:** `8674b6f`

---

**Total deviations:** 3 (1 Rule 1 bug fix, 1 Rule 3 blocking/consistency fix, 1 non-functional
commit-sequencing note).
**Impact on plan:** All necessary or harmless. No scope creep — the CardFooter fix and cn-import
fix are both small, directly-adjacent correctness/consistency fixes; the sequencing note has zero
functional impact and is fully traceable via `card.DESIGN.md`'s documentation.

## Issues Encountered

None — the D-15 Figma-extraction workaround (reading `06-FIGMA-EXTRACTS.md` instead of calling
Figma MCP tools directly) worked as described, same as 06-06. No tool-access blockers.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `card.tsx`'s `Card`/`CardHeader`/`CardContent`/`CardFooter`/`CardTitle`/`CardDescription`/
  `CardAction` are now Figma-verified against real per-node data; every later plan composing a
  card should use the corrected `p-4`/`rounded-card`(24px)/`shadow-card` values, not the old
  `p-6`/20px guesses.
- `card.DESIGN.md`'s Card Type Map is the reference for any later plan (Home-proof, docs-site
  Cards category) that needs to build one of the 6 card types — each row states its exact
  composition recipe (which tokens, which subcomponent overrides).
- `item.tsx`/`ItemMedia`/`ItemContent`/`ItemTitle`/`ItemDescription`/`ItemActions`/`ItemGroup` are
  ready for any "instruction row"/"list-item" composition — no later plan should hand-roll a
  competing row component.
- **Not yet done, deferred to the orchestrator:** the screenshot-vs-Figma visual comparison
  (second half of D-15) for `266-9387`/`266-9344` (Card) and `266-9257`'s instruction-row region
  (Item). Both `card.DESIGN.md` and `item.DESIGN.md` explicitly flag this as pending.
- **Flagged for a later plan (not a blocker):** the Vital Stat Card's Temp/Activity gradients
  need their own exact Figma extraction before whichever plan builds the real 3-column vitals row
  — `card.DESIGN.md`'s Card Type Map row 3 documents this gap explicitly so it isn't silently
  forgotten.
- **Flagged for 06-08 (not this plan's job):** node `203-11669`'s progress bar needs the actual
  `Progress` primitive built and restyled — this plan only resolved its disposition/naming
  (`progress`, not a battery indicator), per D-16.
- 06-08 and later plans can proceed; no blockers introduced by this plan.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*

## Self-Check: PASSED

- FOUND: src/components/ui/card.tsx
- FOUND: src/components/ui/card.DESIGN.md
- FOUND: src/components/ui/item.tsx
- FOUND: src/components/ui/item.DESIGN.md
- FOUND: src/components/ui/separator.tsx
- FOUND commit: 8674b6f
- FOUND commit: 26ecae3
- FOUND commit: eb0a866
- `npm run build` exits 0 (verified after all 3 tasks)
- `grep -c "Verified against Figma node" src/components/ui/card.DESIGN.md` -> 3
- `grep -c "Unconfirmed" src/components/ui/card.DESIGN.md` -> 0
- `grep -c "bg-card\|text-card-foreground\|text-muted-foreground" src/components/ui/item.tsx` -> 0
- `git show --stat eb0a866` confirms card.tsx absent from the item-install commit's changed files
