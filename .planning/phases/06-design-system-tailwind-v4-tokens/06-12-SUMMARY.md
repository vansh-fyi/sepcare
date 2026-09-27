---
phase: 06-design-system-tailwind-v4-tokens
plan: 12
subsystem: ui
tags: [shadcn, select, textarea, field, radix-ui, tailwind-v4, tokens, forms]

# Dependency graph
requires:
  - phase: 06-09
    provides: "Field/FieldLabel/FieldDescription/FieldError family — this plan's canonical label+control+help+error wrapper for both new fields"
provides:
  - "Restyled Select (trigger/content/item/label/separator/scroll buttons) on the project's semantic token layer, Field-wrapped usage documented"
  - "Restyled Textarea on Input's exact border/radius/padding/focus tokens, Field-wrapped usage documented"
  - "Three new dependency-free icon.tsx entries (chevronDown/chevronUp/check) replacing lucide-react in Select"
affects: [06-13]

actuals:
  tokens: 5765
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Select/Textarea both compose inside Field/FieldLabel/FieldError (06-09), never a hand-rolled error slot — extends the pattern Field itself established for every new field type."
    - "New icon needs (chevronDown/chevronUp/check for Select) are hand-authored into icon.tsx rather than adding a lucide-react/Iconify dependency — same D-09 gap-fill precedent nav-bar.DESIGN.md already used."

key-files:
  created:
    - src/components/ui/select.tsx
    - src/components/ui/select.DESIGN.md
    - src/components/ui/textarea.tsx
    - src/components/ui/textarea.DESIGN.md
  modified:
    - src/components/icon.tsx

key-decisions:
  - "Dropped `asChild` on SelectPrimitive.Icon when rendering the chevron glyph — this project's Icon function component isn't wrapped in React.forwardRef, and Radix's asChild/Slot pattern expects the child to accept a forwarded ref. Rendering Icon as a plain child (Radix's Select.Icon wraps it in a harmless <span> either way) avoids a ref-forwarding console warning with zero visual difference."
  - "Select's trigger/item focus uses `focus-visible:` (button-like-control convention, matching Item/ToggleGroup/Toggle) while Textarea uses plain `focus:` (matching Input's real-text-field convention) — the two new fields aren't visually identical in every respect, they each inherit the convention of the existing primitive they're closest to in interaction model."
  - "select.tsx / textarea.tsx checked against the Figma overview node 203-9097's surrounding frames for a dedicated dropdown/multi-line-field example, per this plan's action step; none was found (consistent with 06-CONTEXT.md D-12's own framing of both fields as user-flagged gaps with no assigned node ID), so both are documented as token-consistent-not-Figma-node-verified rather than guessing bespoke values."

patterns-established:
  - "Select and Textarea are the second and third form-field primitives (after Input) to compose through Field/FieldError rather than inventing their own error-slot pattern — the precedent 06-09 set now has two real consumers."

requirements-completed: []  # DSYS-01/02/03 shared with sibling 06-* plans still in progress; shared-ID gate defers marking until all declaring plans finish (see #2388).

coverage:
  - id: D1
    description: "Select installed via shadcn CLI (no -b flag) and restyled to zero stock shadcn tokens (bg-popover/text-popover-foreground/bg-accent), Field-wrapped usage documented"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -c 'bg-popover\\|text-popover-foreground\\|bg-accent' src/components/ui/select.tsx"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: true
    rationale: "Select has no dedicated Figma node to verify against (documented honestly in select.DESIGN.md) — a human should eyeball the rendered trigger/dropdown/item states on a real page before treating the visual treatment as final."
  - id: D2
    description: "Textarea installed via shadcn CLI (no -b flag) and restyled onto Input's exact tokens, zero stock shadcn tokens (bg-input/placeholder:text-muted-foreground) remain, Field-wrapped usage documented"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "grep -c 'bg-input\\|placeholder:text-muted-foreground' src/components/ui/textarea.tsx"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: true
    rationale: "Textarea has no dedicated Figma node to verify against (documented honestly in textarea.DESIGN.md) — a human should eyeball the rendered multi-line field (empty/filled/error/disabled) on a real page before treating the visual treatment as final."
  - id: D3
    description: "Both DESIGN.md files show the Field-wrapped correct-usage pattern and an incorrect-usage counterexample (hand-rolled error slot)"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "grep -n 'FieldError' src/components/ui/select.DESIGN.md src/components/ui/textarea.DESIGN.md"
        status: pass
    human_judgment: false

duration: 9min
completed: 2026-09-27
status: complete
---

# Phase 06 Plan 12: Select + Textarea Summary

**Installed and restyled shadcn Select and Textarea onto the project's semantic token layer (zero stock shadcn/lucide-react remnants), both Field-wrapped per 06-09's canonical error/label pattern, with three new dependency-free chevron/check icons hand-authored into icon.tsx.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-09-27T00:43:00Z
- **Completed:** 2026-09-27T00:51:51Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- `select.tsx` installed via `npx shadcn add select` (no `-b` flag — `add` has no such option in CLI 4.21.0) and fully restyled: trigger/content/item/label/separator/scroll-buttons all remapped onto `rounded-input`/`border-border`/`bg-surface`/`shadow-floating`/`text-body`/`text-text-muted`/`aria-invalid:border-critical`, all `dark:` variants dropped.
- `lucide-react`'s `ChevronDownIcon`/`ChevronUpIcon`/`CheckIcon` replaced with the project's own dependency-free `Icon` system — three new hand-authored entries (`chevronDown`, `chevronUp`, `check`) added to `icon.tsx`, keeping the project's zero-icon-package-dependency stance (D-09) intact.
- `textarea.tsx` installed via `npx shadcn add textarea` (same no-`-b`-flag confirmation) and restyled onto `Input`'s exact border/radius/padding/focus tokens (`rounded-input`/`border-border`/`p-3`/`text-body`/`focus:border-border-focus`+`focus:shadow-focus`/`aria-invalid:border-critical`), all `dark:` variants dropped.
- Both `select.DESIGN.md` and `textarea.DESIGN.md` document the honest "no dedicated Figma node found" disposition (checked the overview node `203-9097`'s surrounding frames per the plan's action, per the figma-extraction-workaround note — no Figma MCP access this session) and show a Field-wrapped Correct-usage example plus an Incorrect-usage counterexample (hand-rolled error slot).
- `npm run build` compiled cleanly (Turbopack, TypeScript pass, static generation) after both tasks.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install + restyle Select, Field-wrapped** - `f0adaf3` (feat)
2. **Task 2: Install + restyle Textarea, Field-wrapped** - `7366d40` (feat)

**Plan metadata:** (pending — this commit)

## Files Created/Modified
- `src/components/ui/select.tsx` - shadcn Select, restyled to the project's token layer, Icon-based chevron/check glyphs
- `src/components/ui/select.DESIGN.md` - restyle table, Figma-disposition note, Field-wrapped correct/incorrect usage
- `src/components/ui/textarea.tsx` - shadcn Textarea, restyled onto Input's exact tokens
- `src/components/ui/textarea.DESIGN.md` - restyle table, Figma-disposition note, Field-wrapped correct/incorrect usage
- `src/components/icon.tsx` - added `chevronDown`/`chevronUp`/`check` entries (new "FORM CONTROLS" section)

## Decisions Made
- Dropped `asChild` on `SelectPrimitive.Icon`'s chevron rendering to avoid a ref-forwarding warning against the project's non-`forwardRef` `Icon` component — no visual change, Radix's `Select.Icon` already wraps its child in a harmless `<span>`.
- Kept Select's focus convention as `focus-visible:` (matching `Item`/`ToggleGroup`/`Toggle`'s button-like-control precedent) and Textarea's as plain `focus:` (matching `Input`'s real-text-field precedent), rather than forcing both new fields onto one identical focus mechanism.
- Confirmed via live `npx shadcn add --help` that `add` has no `-b`/`--base` flag in CLI 4.21.0 (only `init` does) — matches the plan's own instruction and the precedent already established by 06-07's Item and 06-08's ToggleGroup installs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Hand-authored chevronDown/chevronUp/check icons instead of adding lucide-react**
- **Found during:** Task 1 (Install + restyle Select)
- **Issue:** shadcn's stock `select.tsx` imports `CheckIcon`/`ChevronDownIcon`/`ChevronUpIcon` from `lucide-react`, which is not and has never been a dependency of this project (confirmed absent from `package.json`; the project's icon system is a deliberate hand-authored, dependency-free `<Icon name="..."/>` per D-09/06-UI-SPEC.md's Design System table). Installing Select as-is would have silently introduced a new icon-package dependency this project explicitly avoids.
- **Fix:** Added three new entries (`chevronDown`, `chevronUp`, `check`) to `icon.tsx`'s icon map, matching the existing 24px-viewBox/1.75px-stroke convention, and imported `Icon` from `@/components/icon` in `select.tsx` instead of `lucide-react`.
- **Files modified:** `src/components/icon.tsx`, `src/components/ui/select.tsx`
- **Verification:** `grep -n "lucide" src/components/ui/select.tsx` returns zero matches; `npm run build` compiles cleanly.
- **Committed in:** `f0adaf3` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Necessary to keep the project's zero-icon-package-dependency stance intact per D-09/06-UI-SPEC.md; no scope creep — both files touched are exactly what this plan already declared or the icon system this project already maintains for exactly this kind of gap.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `select.tsx` and `textarea.tsx` are now in place for 06-13 (Checkbox/RadioGroup/Switch), which continues the same Field-wrapped pattern for the remaining form-field primitives.
- Neither Select nor Textarea has a dedicated Figma node to verify against — both flagged `human_judgment: true` in the coverage block above; a human should eyeball the rendered dropdown/multi-line-field states on a real page once Wave 3 finishes.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*

## Self-Check: PASSED

All 5 declared/modified files found on disk; both task commits (`f0adaf3`, `7366d40`) found in git history. `npm run build` re-verified green after both tasks. `grep` checks for stock shadcn tokens (`bg-popover`/`text-popover-foreground`/`bg-accent` in select.tsx; `bg-input`/`placeholder:text-muted-foreground` in textarea.tsx) both return 0 matches.
