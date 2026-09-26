---
phase: 06-design-system-tailwind-v4-tokens
plan: 04
subsystem: ui
tags: [nextjs, tailwind, shadcn, design-system, app-router]
requires:
  - phase: "06-03"
    provides: "Restyled Button (primary/secondary/tertiary/critical), Card (structurally invariant), Badge (safe/caution/critical, Icon+label+color), Input (error/disabled) — all token-driven, all confirmed via 06-03's own build/grep checks"
provides:
  - "Three real Next.js App Router sample pages under src/app/design-system/* — states, empty-loading, nested — exercising every restyled atomic component (Button/Card/Badge/Input) against the shared token set"
  - "Confirmation that exactly one @theme block exists under src/ after all three sample pages exist (DSYS-03 final regression check)"
  - "Full phase-gate regression (npm run build && npm test) green after the phase's full component set is in place"
affects: ["07"]
actuals:
  tokens: 1351
  tasks: 2
  commits: 2
  plan_head_before: 337ca117d3e350c5e508ab765e066d0bb1cd3fae
tech-stack:
  added: []
  patterns:
    - "Token-driven skeleton/pulse animation duration must use arbitrary-value syntax against the same --duration-* CSS custom properties (e.g. `[animation-duration:var(--duration-slow)]`), confirmed again in this plan (carried forward from 06-03's discovery) — the bare `duration-slow` class name would silently compile to zero CSS in Tailwind v4."
    - "Sample-page header comments must not contain the literal string \"@theme\" even in prose — this plan's own <verify> grep instruments (and DSYS-03's final regression check) match any occurrence of that string, not just an actual @theme block declaration, so a page can trip a false positive by merely describing the token system in a comment."
key-files:
  created:
    - src/app/design-system/states/page.tsx
    - src/app/design-system/empty-loading/page.tsx
  modified:
    - src/app/design-system/nested/page.tsx
key-decisions:
  - "Replaced Plan 06-01's tracer-era manual `className=\"bg-brand-fill text-white\"` override on nested/page.tsx's Button with the `variant=\"primary\"` prop now that Button carries its own restyled CVA contract (Plan 06-03) — the manual override predated the restyle and would have silently double-declared color."
  - "Used plain `<h2>` elements styled directly with the `text-heading`/`text-text` tokens for Card headings in states/page.tsx and empty-loading/page.tsx, rather than the shadcn-stock `CardTitle` — 06-03-SUMMARY.md documents CardTitle/CardDescription/CardAction/CardFooter as still referencing undefined shadcn stock tokens (deferred, out of scope), so using CardTitle here would have reintroduced an unstyled/undefined-token element into a page whose whole purpose is proving one shared, fully-token-driven system."
patterns-established:
  - "design-system/*/page.tsx pages compose only from @/components/ui/* + @/components/icon — no page declares its own colors, spacing, or @theme block; every visual value traces back to src/app/globals.css's single token source (DSYS-03's 'one shared token source' invariant, now proven across all 3 required sample routes)."
requirements-completed: [DSYS-02, DSYS-03]
coverage:
  - id: D1
    description: "Sample pages 1 (states) and 2 (empty-loading) render all three Badge/Card status pairs and both Card empty/loading treatments using only the shared token set — no @theme redeclaration, no inline hex/oklch values"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: other
        ref: "grep -c \"@theme\" src/app/design-system/states/page.tsx src/app/design-system/empty-loading/page.tsx | awk -F: '{sum+=$2} END {print sum}' -> 0"
        status: pass
    human_judgment: true
    rationale: "The plan's own <flagged_assumptions> block states DSYS-02 came back `category: unclassified` from the deterministic edge-probe — there is no shape-based check for 'does this look right and match the design intent'; that judgment is explicitly deferred to the human-reviewed checkpoint (see this SUMMARY's Human Verification Needed section). The automated build/grep checks above prove the pages compile and don't duplicate the token source, but not that they look correct — both facts are recorded, not conflated."
  - id: D2
    description: "Sample page 3 (nested) expands the Plan 06-01 tracer into a real Card > Input + 2 Buttons nesting, and the full regression suite (build + test) is green with exactly one @theme block under src/"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: other
        ref: "grep -rl \"@theme\" src/ | wc -l -> 1 (src/app/globals.css only)"
        status: pass
      - kind: other
        ref: "npm test -> 59 passed, 1 skipped, 0 failed"
        status: pass
    human_judgment: true
    rationale: "Same as D1 — the plan's <flagged_assumptions> block explicitly defers the 'does the nesting render correctly with no layout breakage' visual judgment to the human-reviewed checkpoint. The automated build/grep/test checks prove the code compiles, uses one token source, and doesn't regress the existing suite, but not the visual-correctness claim itself."
duration: 25min
completed: 2026-09-26
status: complete
---

# Phase 6 Plan 04: Sample Pages + Regression Summary

**3 real App Router sample pages (states/empty-loading/nested) render the full restyled component set against one shared token source, full build+test regression green.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2
- **Files modified:** 3 (2 created, 1 expanded)

## Accomplishments
- `src/app/design-system/states/page.tsx` — three `Card`+`Badge` pairs (safe/"Stable", caution/"Monitor", critical/"Critical") rendered side by side (stacked on narrow viewports), each Badge showing Icon+label+color together
- `src/app/design-system/empty-loading/page.tsx` — one `Card` in empty-state (locked copy: "No readings yet" / "Vitals will appear here once the device starts sending data.") and one in loading-state (token-driven pulse skeleton, `[animation-duration:var(--duration-slow)]`, `motion-reduce:animate-none`)
- `src/app/design-system/nested/page.tsx` — expanded from Plan 06-01's single-Button tracer into a `Card` > `Input` (with label) + primary/secondary `Button` composition, proving token cascade through real 3-level nesting
- Confirmed exactly one `@theme` block exists under `src/` (`src/app/globals.css`) after all three sample pages exist — DSYS-03's final regression check
- Full phase-gate regression green: `npm run build` (all 3 new routes compile) and `npm test` (59 passed, 1 skipped, 0 failed — no realtime flake reproduced this run)

## Task Commits
1. **Task 1: Build sample page 1 (states) and sample page 2 (empty-loading)** - `cc2b923` (feat)
2. **Task 2: Expand sample page 3 (nested composition) and run the phase-gate regression** - `41f706c` (feat)

## Files Created/Modified
- `src/app/design-system/states/page.tsx` - new, D-10 sample page 1: 3 Badge/Card status pairs
- `src/app/design-system/empty-loading/page.tsx` - new, D-10 sample page 2: Card empty-state + loading-state skeleton
- `src/app/design-system/nested/page.tsx` - expanded, D-10 sample page 3: Card > Input + 2 Buttons nesting, tracer's manual color override replaced with `variant="primary"`

## Decisions Made
- Replaced the tracer's manual `bg-brand-fill text-white` Button override with `variant="primary"` now that Button has its own restyled CVA contract (avoids double-declaring color against the same token).
- Used plain `<h2>` styled directly with `text-heading`/`text-text` tokens for Card headings instead of the still-unstyled shadcn-stock `CardTitle` (deferred in 06-03), keeping every visual value in these pages traceable to the one token source.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Own header comment tripped the plan's own `@theme` grep instrument**
- **Found during:** Task 1 (verifying `states/page.tsx`)
- **Issue:** The file-header comment on `states/page.tsx` used the literal prose phrase "exercising the shared @theme token set" — this is not an actual `@theme` block declaration, but the plan's `<verify>` grep (`grep -c "@theme" ... | sum -> 0`) matches the literal string anywhere in the file, so the comment alone produced a false-positive failure (sum = 1, not 0).
- **Fix:** Reworded the comment to reference "the shared token set (globals.css)" instead of the literal string "@theme". No behavior change — comment-only edit.
- **Files modified:** `src/app/design-system/states/page.tsx`
- **Verification:** `grep -c "@theme" src/app/design-system/states/page.tsx src/app/design-system/empty-loading/page.tsx | awk -F: '{sum+=$2} END {print sum}'` → `0`; `npm run build` re-confirmed green after the edit
- **Commit:** `cc2b923` (fixed before commit, not a separate commit)

---

**Total deviations:** 1 auto-fixed (Rule 1). **Impact:** Comment-wording-only fix, caught before commit by running the plan's own verify command; no code or behavior change.

## Issues Encountered
None beyond the deviation above.

## User Setup Required
None - no external service configuration required.

## Human Verification Needed

Per `workflow.human_verify_mode: end-of-phase`, both tasks' `<human-check>` blocks are harvested here verbatim for the phase-end UAT rather than acted on as mid-flight checkpoints:

**Task 1 human-check:**
> Run `npm run dev`, then visit http://localhost:3000/design-system/states and confirm the three Badge/Card pairs render with visibly distinct Safe (green)/Caution (amber)/Critical (pink) colors, each showing icon + label + color together. Visit http://localhost:3000/design-system/empty-loading and confirm the empty-state Card shows the exact copy above and the loading-state Card's skeleton pulses smoothly (or holds still if your OS has "reduce motion" enabled).

**Task 2 human-check:**
> Run `npm run dev`, visit http://localhost:3000/design-system/nested, and confirm the Card containing the Input and two Buttons renders with correct spacing/radius/color at every nesting level — no layout breakage, no unstyled flash. Then do a quick code-level comparison across all three `/design-system/*` pages: confirm they all import from `@/components/ui/*` and none of them imports a second, divergent token source.

## Next Phase Readiness
All three D-10 sample pages exist as real, build-verified App Router routes rendering the full restyled Button/Card/Badge/Input set against the single shared token source (`src/app/globals.css`). DSYS-02's human-reviewed validation checkpoint is ready for end-of-phase UAT (see above). DSYS-03 holds: one `@theme` block under `src/`, demonstrably reused across every sample page. Phase 6's remaining plan (06-05) and Phase 7's composite screens can build on this proven atomic set.

## Self-Check: PASSED

Files confirmed present on disk: `src/app/design-system/states/page.tsx`, `src/app/design-system/empty-loading/page.tsx`, `src/app/design-system/nested/page.tsx` (modified). Both task commits (`cc2b923`, `41f706c`) confirmed present in `git log --oneline --all`.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-26*
