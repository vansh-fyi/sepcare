---
phase: 06-design-system-tailwind-v4-tokens
plan: 02
subsystem: ui
tags: [shadcn, radix, icons, design-system]
requires: ["06-01"]
provides:
  - "Radix-based shadcn Card, Badge, Input primitives (`src/components/ui/{card,badge,input}.tsx`), pre-restyle, ready for Plan 06-03's variant contract"
  - "Typed React `Icon` component (`src/components/icon.tsx`) porting all 60 `icons.js` entries as real JSX, zero raw-HTML-injection API"
affects: ["06-03", "06-04", "06-05"]
actuals:
  tokens: 5074
  tasks: 2
  commits: 2
  plan_head_before: 4a349ccc57cd3788c4dee3f792feb679f77c1236
tech-stack:
  added: []
  patterns:
    - "shadcn CLI 4.21.0's `add` subcommand generates Card/Input with NO primitive-library import at all (plain HTML wrapper divs/inputs) — only Badge imports Radix (`Slot` from the unified `radix-ui` package, for its `asChild` prop), because Card/Input have no complex ARIA/focus behavior needing an unstyled primitive. D-07's 'Radix, not Base UI' intent is satisfied by zero `@base-ui-components/*` presence anywhere, not by every file importing Radix."
    - "All shadcn-generated component files' `cn` import repointed from the bare `\"cn\"` package to `\"@/lib/utils\"`, extending 06-01's established re-export convention to every new component (not just Button)."
    - "Icon component ports each `SepCareIcons[name]` string into a typed JSX fragment; `IconName` is `keyof typeof icons`, so callers get a compile-time error for an invalid name rather than a runtime fallback."
key-files:
  created:
    - src/components/ui/card.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/input.tsx
    - src/components/icon.tsx
  modified: []
key-decisions:
  - "Ran `npx shadcn@4.21.0 add card badge input -y` with no `-b`/`--base` flag at all, per 06-01's already-diagnosed discovery that `add` doesn't accept that flag (only `init` does); confirmed post-install via package-lock.json that zero `@base-ui-components/*` packages exist, satisfying D-07 without needing every generated file to literally import a Radix package."
  - "Fixed Task 1's `<verify>` grep pattern (which expected all 3 files to import a Radix package) against the actual generated output: Card and Input import no primitive library at all (plain divs/inputs), only Badge imports `Slot` from `radix-ui`. Verified via direct read of all three files plus a package-lock.json `@base-ui` grep (0 hits) rather than trusting the plan's literal expectation."
patterns-established:
  - "Icon component: `icons` map + `IconName = keyof typeof icons` + fallback-to-`information` — the pattern any future icon addition should follow (no raw SVG-string injection, ever)."
requirements-completed: [DSYS-01]
coverage:
  - id: D1
    description: "Card, Badge, Input installed as Radix-based (or Radix-adjacent, zero-Base-UI) shadcn primitives, ready for Plan 06-03's restyle"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: other
        ref: "grep for @radix-ui/@base-ui across card.tsx/badge.tsx/input.tsx + package-lock.json @base-ui check (0 hits)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Icon component renders all 60 ported names as real JSX, zero raw-HTML-injection API, safe/caution/critical present, npm run build green"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -c dangerouslySetInnerHTML src/components/icon.tsx -> 0"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
duration: 20min
completed: 2026-09-26
status: complete
---

# Phase 6 Plan 02: Card/Badge/Input + Icon Component Summary

**Card/Badge/Input installed via shadcn (Badge alone pulls in Radix's unified `radix-ui` package; Card/Input need no primitive library at all), and `icons.js` ported to a typed React `Icon` component covering all 60 names with zero raw-HTML-injection use.**

## Performance
- **Duration:** ~20min
- **Tasks:** 2
- **Files modified:** 4 (all new)

## Accomplishments
- Installed `card.tsx`, `badge.tsx`, `input.tsx` via `npx shadcn@4.21.0 add card badge input -y` (no `-b` flag — `add` doesn't accept one, per 06-01's precedent)
- Confirmed zero `@base-ui-components/*` packages anywhere in `package-lock.json`, satisfying D-07's Radix-not-Base-UI intent
- Repointed all three new files' `cn` import from the bare `"cn"` package to `"@/lib/utils"`, matching 06-01's established re-export convention
- Ported all 60 `SepCareIcons` entries from `frontend-design/design-system/icons.js` into `src/components/icon.tsx` as real JSX `<path>`/`<circle>`/`<line>`/`<rect>`/`<ellipse>`/`<polygon>`/`<polyline>` elements — zero raw-HTML-injection API used
- Preserved `renderSepCareIcon`'s exact outer-`<svg>` attributes and the unrecognized-name-falls-back-to-`information` behavior
- `safe`/`caution`/`critical` status keys ported, ready for Plan 06-03's Badge icon+label+color rule
- `npm run build` green after both tasks; `npm test` (existing backend Vitest suite, 59 passed / 1 skipped) unaffected

## Task Commits
1. **Task 1: Install Card, Badge, Input via shadcn CLI** - `b090daf` (feat)
2. **Task 2: Port icons.js to a real React Icon component** - `f374c5c` (feat)

## Files Created/Modified
- `src/components/ui/card.tsx` - shadcn-generated Card primitive; no primitive-library import (plain div wrappers); `cn` repointed to `@/lib/utils`
- `src/components/ui/badge.tsx` - shadcn-generated Badge primitive; imports `Slot` from the unified `radix-ui` package for its `asChild` prop; `cn` repointed to `@/lib/utils`
- `src/components/ui/input.tsx` - shadcn-generated Input primitive; no primitive-library import; `cn` repointed to `@/lib/utils`
- `src/components/icon.tsx` - new file, full React port of `frontend-design/design-system/icons.js`'s `SepCareIcons`/`renderSepCareIcon`, exporting `Icon` and `IconName`

## Decisions Made
- Ran `shadcn add` with no `-b` flag at all (not even attempting `-b radix`), since 06-01 already confirmed `add` has no such flag; verified Radix-not-Base-UI intent via package-lock.json inspection instead of a CLI flag.
- Adjusted Task 1's verify grep pattern in-flight (see Deviations) after discovering Card/Input generate with zero primitive-library import — this is shadcn's actual, correct output for these two components (they're simple structural/form wrappers with no complex accessible-primitive need), not a install failure.
- Repointed the `cn` import in all three new files to `@/lib/utils`, extending the convention 06-01 established for `button.tsx` to the rest of the component set, for consistency and to keep a single point of indirection for any future `cn`-package swap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Verification adjustment] Task 1's verify grep pattern assumed all 3 files import a Radix package; only Badge actually does**
- **Found during:** Task 1
- **Issue:** The plan's `<verify>` command (`grep -l "@radix-ui/react-slot\|@radix-ui/react-label\|@radix-ui/react-" ... | wc -l`, expected output `3`) and the `<known_deviation_from_prior_wave>` dispatch note both anticipated a `radix-ui`-vs-scoped-package mismatch, but the actual mismatch was different in kind: reading all three generated files showed `card.tsx` and `input.tsx` import **no** primitive-library package at all (plain `<div>`/`<input>` wrappers), while only `badge.tsx` imports `Slot` from the unified `radix-ui` package (for its `asChild` prop, same pattern as `button.tsx`). This is shadcn's real, correct generated output — Card/Input have no complex ARIA/focus behavior that needs an unstyled primitive — not a broken install.
- **Fix:** Verified D-07's actual intent (Radix, not Base UI) via `grep -c "@base-ui" package-lock.json` (0 hits) and a direct read of all three files, rather than trusting the plan's literal 3-file Radix-import expectation. Documented here instead of stopping, since this is the same class of "CLI/tooling reality differs from the plan's specific mechanics" pattern 06-01 already resolved once this session, just manifesting differently (zero Radix import on 2 of 3 files rather than a package-name mismatch on all 3).
- **Files affected:** `src/components/ui/card.tsx`, `src/components/ui/input.tsx` (verification approach only, no code fix needed on these two)
- **Verification:** `grep -n "radix-ui\|@radix-ui\|@base-ui" src/components/ui/{card,badge,input}.tsx` → only `badge.tsx:4` matches; `grep -c "@base-ui" package-lock.json` → 0
- **Commit:** `b090daf`

**2. [Rule 1 - Consistency fix] Generated files imported `cn` from the bare `"cn"` package instead of `@/lib/utils`**
- **Found during:** Task 1
- **Issue:** Same as 06-01's Task 2 finding for `button.tsx` — this CLI version's `add` output imports `cn` directly from the `cn` npm package rather than the project's established `@/lib/utils` re-export point.
- **Fix:** Repointed the `cn` import in `card.tsx`, `badge.tsx`, and `input.tsx` from `"cn"` to `"@/lib/utils"`, matching 06-01's already-established convention.
- **Files modified:** `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/input.tsx`
- **Verification:** `npm run build` green
- **Commit:** `b090daf`

**3. [Rule 1 - Bug] Icon component's own header comment tripped its own zero-raw-HTML-injection verify grep**
- **Found during:** Task 2
- **Issue:** The initial docblock comment explained the port by naming the raw-HTML-injection API literally (in backticks, as prose), which made `grep -c "dangerouslySetInnerHTML" src/components/icon.tsx` return `1` instead of the required `0` — a false positive (the API is never *used*, only mentioned in a comment), but it would have failed the plan's literal automated verify.
- **Fix:** Reworded the comment to describe the avoided pattern without naming the exact API string.
- **Files modified:** `src/components/icon.tsx`
- **Verification:** `grep -c "dangerouslySetInnerHTML" src/components/icon.tsx` → 0; `npm run build` green
- **Commit:** `f374c5c`

**Total deviations:** 3 auto-fixed (all Rule 1). **Impact:** All three preserve the plan's actual intent (Radix over Base UI, consistent `cn()` import point, zero raw-HTML-injection icon rendering) against generated-output/verify-string realities that differed from the plan's literal expectations — no scope or requirement changes.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Plan 06-03's variant restyle can now proceed: `Card`, `Badge`, `Input` exist (pre-restyle, Radix-based/Radix-adjacent per the actual generated shape), and `Icon` exists with the `safe`/`caution`/`critical` keys Badge's icon+label+color rule needs.

## Self-Check: PASSED

All created files (`src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/input.tsx`, `src/components/icon.tsx`) confirmed present on disk. Both task commits (`b090daf`, `f374c5c`) confirmed present in `git log --oneline --all`.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-26*
