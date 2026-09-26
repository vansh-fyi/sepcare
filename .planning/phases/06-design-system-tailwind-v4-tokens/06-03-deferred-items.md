# Phase 06 Plan 03 — Deferred Items

Out-of-scope discoveries found during Plan 06-03's execution, logged per the executor's scope
boundary rule (pre-existing issues in unrelated files are not auto-fixed, only recorded).

## `CardTitle`, `CardDescription`, `CardAction`, `CardFooter` still reference undefined shadcn stock tokens

- **Found during:** Task 1 (Restyle Button + Card)
- **Issue:** `card.tsx`'s CLI-scaffolded `CardTitle` (`leading-none font-semibold`), `CardDescription`
  (`text-sm text-muted-foreground`), `CardAction`, and `CardFooter` (`px-6 [.border-t]:pt-6`)
  reference shadcn's stock CSS variables (e.g. `--muted-foreground`) which were deliberately never
  declared in this project's `@theme` block (06-01 removed the shadcn default palette entirely in
  favor of the Figma-derived token set). These four sub-components are unused anywhere in `src/`
  today (verified via `grep -rn "CardTitle\|CardDescription\|CardAction\|CardFooter" src/` — zero
  call sites outside `card.tsx` itself), so the gap is currently inert, not visibly broken.
- **Why not fixed here:** Plan 06-03's Task 1 action text explicitly scopes the restyle to exactly
  three elements — `Card`, `CardHeader`, `CardContent` — matching D-08's "Card: single
  surface-container role, no variants" contract. `CardTitle`/`CardDescription`/`CardAction`/
  `CardFooter` are pre-existing from Plan 06-02's CLI install, not introduced by this plan's
  changes, and are out of this task's stated file scope — per the scope-boundary rule, pre-existing
  issues in unrelated/unscoped code are logged, not auto-fixed.
- **Recommended follow-up:** Whichever future phase first actually renders a Card heading/footer
  (likely Phase 7's composite screens) should restyle these four sub-components onto the locked
  token set at that point — e.g. `CardTitle` → `text-heading` (the Typography contract's "Heading
  (Card title)" role, 18px/600/1.3), `CardDescription` → `text-caption text-text-muted`.
- **Status:** acknowledged, deferred — not a stub blocking this plan's own goal (Card's D-08
  contract is fully met via `Card`/`CardHeader`/`CardContent`).
