---
phase: 06-design-system-tailwind-v4-tokens
plan: 01
subsystem: ui
tags: [tailwind, shadcn, radix, cn, design-system]
requires: []
provides:
  - Tailwind v4 `@theme` token pipeline (no `tailwind.config.js`), single source of truth in `src/app/globals.css`
  - Full locked color/typography/radius/shadow/motion token set from `06-UI-SPEC.md`
  - Hand-authored `components.json` (style new-york, baseColor slate, tailwind.config: "")
  - Radix-based shadcn `Button` component (`src/components/ui/button.tsx`) via the modern unified `radix-ui` package
  - `cn()` className-merge helper re-exported from the official `cn` npm package (`src/lib/utils.ts`)
  - Inter as the active font (`next/font/google`, replacing Geist/Geist_Mono)
  - Sample page 3 seed proving a compiled token renders through a real Button on a real route
  - AGENTS.md documentation on verifying shadcn/cn against live docs, not training data
affects: ["06-02", "06-03", "06-04", "06-05"]
actuals:
  tokens: 2900
  tasks: 4
  commits: 3
  plan_head_before: 675fe6e012b4b1f455cff6084a0b24a02989cb1d
tech-stack:
  added: [tailwindcss, "@tailwindcss/postcss", shadcn, class-variance-authority, cn, tw-animate-css, radix-ui]
  patterns:
    - "Single `@theme` block in `src/app/globals.css` is the sole design-token source (DSYS-03) — every color/typography/radius/shadow/motion token declared once, no per-audience duplication"
    - "`components.json` hand-authored (not interactive `init`) to sidestep the shadcn CLI 4.21.0's missing `--base-color` flag; `shadcn add` reads it without re-prompting"
    - "shadcn CLI 4.21.0's `add` command ships Radix via the unified `radix-ui` meta-package (`import { Slot } from \"radix-ui\"`), which itself depends on `@radix-ui/react-slot@1.3.3` — not a direct `@radix-ui/react-slot` import and not the CLI's newer Base UI default"
    - "`cn()` re-export pattern: `src/lib/utils.ts` imports `cn` from the `cn` npm package and re-exports it; components import from `@/lib/utils`, never `cn` directly, keeping one point of indirection for future swaps"
key-files:
  created:
    - postcss.config.mjs
    - components.json
    - src/components/ui/button.tsx
    - src/lib/utils.ts
    - src/app/design-system/nested/page.tsx
  modified:
    - package.json
    - package-lock.json
    - src/app/globals.css
    - src/app/layout.tsx
    - AGENTS.md
key-decisions:
  - "Swapped clsx+tailwind-merge for the official shadcn-ui `cn` package, decided live at the Task 1 checkpoint — `cn` is newer (ownership transferred to shadcn-ui org Sept 2026) but has a real track record (~4.6M weekly downloads) and eliminates one of the two originally-audited SUS packages entirely"
  - "Added AGENTS.md documentation on checking live docs for shadcn/cn before writing code against them, requested live by the user during this plan's execution"
  - "shadcn CLI 4.21.0's `add` subcommand has no `-b`/`--base` flag (that flag only exists on `init`); `add` already resolves Button to Radix via the unified `radix-ui` package rather than the CLI's newer Base UI default — verified via `--dry-run`/`--view` before installing, and confirmed `@radix-ui/react-slot@1.3.3` is the resolved transitive dependency, satisfying D-07's actual intent even though the plan's literal `@radix-ui/react-slot` grep string doesn't appear in the generated file"
  - "CLI 4.21.0 generated `button.tsx` importing `cn` directly from the `cn` package instead of emitting `src/lib/utils.ts`; hand-authored `utils.ts` as the canonical re-export and repointed `button.tsx`'s import to `@/lib/utils` to match the project's established alias convention for future components"
patterns-established:
  - "Tailwind v4 @theme token authoring: every future component/page consumes tokens by name (`bg-brand-fill`, `text-body`, `rounded-btn`, etc.), never a raw hex/oklch literal"
  - "shadcn installs always verified post-install (grep for the resolved primitive package + package-lock.json check) rather than trusting a CLI flag alone, since this CLI version's flag surface differs from what research predicted"
requirements-completed: [DSYS-01, DSYS-03]
coverage:
  - id: D1
    description: "one real token compiles through Tailwind + a real Radix Button renders on a real route, proven by green next build"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D2
    description: "full locked token set from 06-UI-SPEC.md is the sole token source, Inter font active"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D3
    description: "compiled palette is visibly distinct from the pre-existing baby-pink palette"
    requirement: "DSYS-01"
    verification: []
    human_judgment: true
    rationale: "Subjective visual-distinctness claim — deferred to Plan 06-04's human-reviewed checkpoint per this plan's own flagged_assumptions block"
  - id: D4
    description: "AGENTS.md documents that shadcn/ui and cn are newer-than-training-data systems requiring live doc verification, appended after the auto-generated Next.js block without disturbing it"
    verification:
      - kind: other
        ref: "Task 4's grep/sed verify commands (heading count, BEGIN/END block line count, ordering check) + a byte-for-byte diff of the original 9-line block against HEAD"
        status: pass
    human_judgment: false
duration: 45min
completed: 2026-09-26
status: complete
---

# Phase 6 Plan 01: Tailwind v4 Foundation + Tracer Summary

**Tailwind v4 `@theme` pipeline live via shadcn+Radix, `cn` package replacing clsx+tailwind-merge, Figma-derived palette compiled, Inter active, AGENTS.md documents newer-than-training-data packages.**

## Performance
- **Duration:** ~45min (Tasks 2-4; Task 1 checkpoint wait excluded)
- **Tasks:** 4
- **Files modified:** 10 (including package-lock.json)

## Accomplishments
- Installed Tailwind v4.3.3 + `@tailwindcss/postcss` with zero `tailwind.config.js`-style config file
- Hand-authored `components.json` (style: new-york, baseColor: slate) to sidestep the shadcn CLI's missing `--base-color` flag
- Installed a real, Radix-based `Button` via `shadcn add` — discovered and verified (via `--dry-run`/`--view`) that CLI 4.21.0 ships Radix through the unified `radix-ui` meta-package rather than a direct `@radix-ui/react-slot` import, and confirmed no Base UI (`@base-ui-components/react`) package was pulled in
- Installed and adopted the `cn` package (approved at the Task 1 checkpoint), re-exported from `src/lib/utils.ts`, and repointed `button.tsx`'s import to `@/lib/utils`
- Seeded `src/app/design-system/nested/page.tsx` — a real App Router route rendering a `Button` styled with the compiled `--color-brand-fill` token, proving the whole pipeline end-to-end via a green `next build`
- Expanded the tracer's single token into the full locked token set from `06-UI-SPEC.md`: all color (surface/border/text/brand/safe/caution/critical), paired typography, radius, shadow, and motion-duration tokens
- Removed the `create-next-app` dark-mode scaffold (`:root` background/foreground + both `prefers-color-scheme` media queries); repointed `body`'s color/background to the new `--color-text`/`--color-bg` tokens
- Swapped `Geist`/`Geist_Mono` for `Inter` in `src/app/layout.tsx` (D-05)
- Appended a new AGENTS.md section (after the untouched, byte-identical 9-line auto-generated Next.js block) documenting the shadcn/cn "check live docs, not training data" convention
- Updated `.planning/codebase/STACK.md`'s Frameworks/Key Dependencies sections to reflect the new frontend stack

## Task Commits
1. **Task 1: Package-legitimacy pre-check** - checkpoint, approved by user ("approved"), no code commit
2. **Task 2: End-to-end tracer** - `379d683` (feat)
3. **Task 3: Full token set + Inter swap** - `79aaca8` (feat)
4. **Task 4: AGENTS.md documentation** - `fcef3fd` (docs)

## Files Created/Modified
- `postcss.config.mjs` - Turbopack/PostCSS wiring for `@tailwindcss/postcss`
- `components.json` - hand-authored shadcn config (style new-york, baseColor slate, no tailwind.config)
- `src/app/globals.css` - the single `@theme` block; full token set; dark-mode scaffold removed
- `src/app/layout.tsx` - Inter font import replacing Geist/Geist_Mono
- `src/components/ui/button.tsx` - shadcn-generated, Radix-based (via `radix-ui`) Button primitive
- `src/lib/utils.ts` - `cn()` re-export from the `cn` npm package
- `src/app/design-system/nested/page.tsx` - tracer/sample-page-3 seed
- `AGENTS.md` - new shadcn/cn live-docs-verification section
- `package.json` / `package-lock.json` - new dependencies (tailwindcss, @tailwindcss/postcss, class-variance-authority, cn, tw-animate-css, radix-ui)
- `.planning/codebase/STACK.md` - Frameworks/Key Dependencies updated for the new frontend stack

## Decisions Made
- Adopted `cn` (github.com/shadcn-ui/cn) over `clsx`+`tailwind-merge`, approved by the user at the Task 1 checkpoint after reviewing npmjs.com provenance for both `shadcn` and `cn`.
- Added a new AGENTS.md section on verifying shadcn/cn against live docs rather than training data, requested live by the user mid-execution and folded into this plan as a new Task 4.
- Verified (rather than assumed) that shadcn CLI 4.21.0's `add` subcommand ships Radix through the unified `radix-ui` package; adjusted the underlying verification to check for `radix-ui`/`@radix-ui/react-slot@1.3.3` presence instead of the plan's literal `@radix-ui/react-slot` import-string grep, since the CLI's actual generated output differs from what the plan assumed while still satisfying D-07's Radix-not-Base-UI intent.
- Hand-authored `src/lib/utils.ts` and repointed `button.tsx`'s `cn` import to `@/lib/utils`, since this CLI version imports `cn` directly from the `cn` package in generated components rather than emitting a `utils.ts` file itself.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Verification adjustment] shadcn CLI 4.21.0's `add` has no `-b`/`--base` flag; actual Radix delivery mechanism differs from the plan's assumed `@radix-ui/react-slot` import**
- **Found during:** Task 2
- **Issue:** The plan's action text and verify command assumed every `shadcn add`/`init` invocation needed `-b radix` and that the generated `button.tsx` would literally import `@radix-ui/react-slot`. Running `npx shadcn@4.21.0 add button -b radix -y` failed with `error: unknown option '-b'` — `--help` confirmed `-b`/`--base` only exists on the `init` subcommand, not `add`. Running `add` without any base flag (over the hand-authored `components.json`) produced `button.tsx` importing `Slot` from the unified `radix-ui` meta-package instead.
- **Fix:** Verified via `--dry-run`/`--view` before installing that this was genuinely Radix, not the CLI's newer Base UI default: confirmed `radix-ui`'s own `npm view` dependency listing pins `@radix-ui/react-slot@1.3.3` (the exact version RESEARCH.md verified), and confirmed `package-lock.json` contains no `@base-ui-components/*` entries anywhere. Ran `npx shadcn@4.21.0 add button -y` (no `-b` flag, since it's not accepted by `add`) and adjusted my own verification to grep for `from "radix-ui"` and `@radix-ui/react-slot": "1.3.3"` in `package-lock.json` instead of the plan's literal `@radix-ui/react-slot` import-string check.
- **Files modified:** `src/components/ui/button.tsx`, `package.json`, `package-lock.json`
- **Verification:** `grep -c 'from "radix-ui"' src/components/ui/button.tsx` → 1; `grep -c '@base-ui' src/components/ui/button.tsx` → 0; `grep -c '"@radix-ui/react-slot": "1.3.3"' package-lock.json` → 8
- **Commit:** `379d683`

**2. [Rule 2 - Missing critical functionality] `src/lib/utils.ts` was not generated by the CLI this run**
- **Found during:** Task 2
- **Issue:** This CLI version's `add` output imports `cn` directly from the `cn` npm package inside `button.tsx` rather than emitting a `src/lib/utils.ts` file with a `cn()` helper (the plan's action assumed the CLI would generate a clsx+tailwind-merge-based `utils.ts` that then needed replacing). `components.json`'s `aliases.utils` already points at `@/lib/utils`, and future components/plans (06-02+) need a stable, single-indirection `cn()` export to import from.
- **Fix:** Hand-authored `src/lib/utils.ts` with the plan's specified two-line re-export (`import { cn } from "cn"; export { cn };`) and repointed `button.tsx`'s import from `"cn"` to `"@/lib/utils"`.
- **Files modified:** `src/lib/utils.ts` (created), `src/components/ui/button.tsx`
- **Verification:** `grep -c 'from "cn"' src/lib/utils.ts` → 1; `npm run build` green
- **Commit:** `379d683`

**3. [Rule 1 - Bug] `body`'s `color`/`background` referenced deleted custom properties after dark-mode scaffold removal**
- **Found during:** Task 3
- **Issue:** The plan's action instructed deleting the `:root { --background; --foreground }` block and both `prefers-color-scheme` media queries, while keeping the generic reset rules (`html`, `body`, `*`, `a`) "untouched." Literally leaving `body { color: var(--foreground); background: var(--background); }` in place after deleting those custom properties would reference undefined variables (invalid CSS, silent fallback to browser defaults) rather than actually applying the new token system.
- **Fix:** Repointed `body`'s `color`/`background` to the new `--color-text`/`--color-bg` tokens, which are the direct semantic replacements the new `@theme` block defines for exactly this purpose.
- **Files modified:** `src/app/globals.css`
- **Verification:** `npm run build` green; visual token now resolves (`--color-text`/`--color-bg` both declared in the single `@theme` block)
- **Commit:** `79aaca8`

**Total deviations:** 3 auto-fixed (2 Rule 1, 1 Rule 2). **Impact:** All three preserve the plan's actual architectural intent (Radix-based components, a stable `cn()` re-export point, a functioning light-mode token system) against a CLI/tooling reality that diverged from the plan's specific mechanics — no scope or requirement changes.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Plan 06-02 (Card/Badge/Input install) depends on this plan's `components.json`, `src/app/globals.css`'s full token set, `src/components/ui/button.tsx`'s established Radix-via-`radix-ui` pattern, and `src/lib/utils.ts`'s `cn()` re-export — all present and build-verified. Plan 06-04's human-reviewed visual checkpoint remains the closing verification for D3 (palette visibly distinct from baby-pink) per this plan's own flagged assumption.

## Self-Check: PASSED

All created files (`postcss.config.mjs`, `components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts`, `src/app/design-system/nested/page.tsx`, modified `AGENTS.md`) confirmed present on disk. All three task commits (`379d683`, `79aaca8`, `fcef3fd`) confirmed present in `git log --oneline --all`.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-26*
