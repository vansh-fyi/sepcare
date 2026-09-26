---
phase: 06-design-system-tailwind-v4-tokens
fixed_at: 2026-09-26T00:00:00Z
review_path: .planning/phases/06-design-system-tailwind-v4-tokens/06-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 06: Code Review Fix Report

**Fixed at:** 2026-09-26
**Source review:** .planning/phases/06-design-system-tailwind-v4-tokens/06-REVIEW.md
**Iteration:** 1

**Scope note:** `workflow.use_worktrees` is `false` in `.planning/config.json`, so all fixes were
applied and committed directly on `main` in the primary checkout (no isolated worktree was
created, per the documented opt-out).

**Summary:**
- Findings in scope: 5 (fix_scope: critical_warning — CR-* and WR-* only; IN-* findings excluded)
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: `Button`'s `asChild` prop throws at render — Slot composition is completely broken

**Files modified:** `src/components/ui/button.tsx`
**Commit:** 8798a75
**Applied fix:** Split `Button`'s render into two branches. When `asChild` is true, it now renders
`<Slot.Root>` with `children` passed straight through (a single element, satisfying
`@radix-ui/react-slot`'s `React.Children.count(children) === 1` requirement). The loading
wrapper `<span>` and spinner `<span>` — the two elements that previously produced a 2-element
children array — now only render in the plain `<button>` branch, since `loading` is a
button-specific affordance that doesn't conceptually apply to arbitrary `asChild` targets.
Verified with `tsc --noEmit` (no errors in the file).

### CR-02: Hardcoded `body` font-family silently overrides the Inter/`--font-sans` token

**Files modified:** `src/app/globals.css`
**Commit:** af5dcdc
**Applied fix:** Removed the un-layered `font-family: Arial, Helvetica, sans-serif;` declaration
from the `body` rule. Tailwind's `@layer base` preflight now resolves `body`'s font-family from
the `--font-sans` theme token (which chains to `--font-inter`) with no competing unlayered rule to
beat it under CSS Cascade Layers precedence.

### WR-01: `CardDescription` references a color token that doesn't exist in this theme

**Files modified:** `src/components/ui/card.tsx`
**Commit:** 852cab4
**Applied fix:** Changed `CardDescription`'s className from `"text-sm text-muted-foreground"` to
`"text-body text-text-secondary"`, restyling it onto this project's locked token set (there is no
`--color-muted-foreground` token in `@theme`, so the original utility silently compiled to
nothing). `CardTitle` and `CardFooter` were checked and do not reference any non-existent color
tokens, so no change was needed there.

### WR-02: Design-system docs page has no error handling around file reads

**Files modified:** `src/app/design-system/docs/error.tsx` (new file)
**Commit:** ae5874e
**Applied fix:** Added a route-level `error.tsx` boundary for `/design-system/docs`. Since
`readThemeBlock()` and `readComponentDocs()` perform multiple synchronous, unguarded file reads
directly in the server component's render path (four separate call sites), a route-level boundary
was chosen over wrapping each call in try/catch, per the Fix section's second option — it degrades
the whole page gracefully with one component rather than threading per-field fallback UI through
every table/section.

### WR-03: Scaffold-default metadata still shipped in production `<head>`

**Files modified:** `src/app/layout.tsx`
**Commit:** 2fb3ba2
**Applied fix:** Replaced `metadata.title`/`metadata.description` (still the `create-next-app`
defaults) with `"SepCare"` / `"Neonatal sepsis risk monitoring for ASHA workers and caregivers."`.

## Skipped Issues

None — all in-scope findings were fixed.

---

_Fixed: 2026-09-26_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
