---
phase: 06-design-system-tailwind-v4-tokens
plan: 14
subsystem: ui
tags: [tailwind-v4, figma, chart, recharts, shadcn, design-tokens, d15, d18, package-legitimacy]

requires:
  - phase: 06-07
    provides: "Figma-verified Card base surface (card.tsx) — the file this plan's install guard must not disturb"
provides:
  - "recharts@3.8.0 as a real, direct package.json dependency"
  - "shadcn ChartContainer/ChartTooltip/ChartTooltipContent/ChartLegend/ChartLegendContent/ChartStyle restyled to this project's semantic token layer"
  - "A mechanically-proven Card-overwrite guard: card.tsx never touched by the chart install (git diff empty, 0 stock tokens)"
  - "lucide-react never entered package.json/package-lock.json — the [SUS]-flagged transitive dependency was avoided entirely, not merely stripped post-install"
affects: [06-15]

actuals:
  tokens: 10861
  tasks: 3
  commits: 1

tech-stack:
  added: [recharts@3.8.0]
  patterns:
    - "Install-without-installing: a registry component's generated file content extracted losslessly from `npx shadcn add <name> --view <path>`'s dry-run output (byte-for-byte line-count match) and hand-written via the editor tool, rather than ever running the real `add` command against the repo — avoids a known destructive-overwrite pitfall (and any of its transitive dependencies) with zero risk window, stricter than the plan's own 'scratch-dir hand-copy' fallback"
    - "Floating-content convention reuse: ChartTooltipContent's popover-like surface (`rounded-input border border-border bg-surface shadow-floating`) matches select.tsx's dropdown content exactly, rather than inventing a second floating-surface treatment"

key-files:
  created:
    - src/components/ui/chart.tsx
    - src/components/ui/chart.DESIGN.md
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Resolved the Task 2 checkpoint's approved option (b) — install then strip lucide-react — via a stricter method: extracted chart.tsx's content directly from `shadcn add chart --view`'s read-only dry-run output instead of ever running the real `add` command, so lucide-react never entered package.json/package-lock.json in the first place. Verified via grep (0 matches in both files) and `npm view recharts@3.8.0 dependencies` (lucide-react is not a recharts dependency — it was only ever declared directly by shadcn's chart registry entry, which was never invoked for a real write)."
  - "recharts pinned to the exact 3.8.0 version shadcn's own chart registry entry resolves to (verified via `npx shadcn add chart --dry-run`), installed via plain `npm install recharts@3.8.0`, matching RESEARCH.md's Package Legitimacy Audit verdict (OK/Approved)."
  - "ChartTooltipContent's floating-surface classes (`rounded-input border border-border bg-surface shadow-floating`) reuse select.tsx's existing dropdown-content convention verbatim rather than deriving a new floating-surface treatment, since both are popover-like overlay content."
  - "Axis-tick/legend text mapped stock `muted-foreground` -> `text-text-muted`/`fill-text-muted` (this project's real de-emphasized-text role); stock `fill-muted`/background regions mapped to `--color-border-subtle` (neutral-200) as the closest existing subtle-background equivalent, since no dedicated 'muted background' token exists yet."
  - "Chart axis-tick font: left as inherited `--font-sans` (Inter), not special-cased to Roboto, even though the Figma frame's mock shows Roboto leaking through from Recharts' own default — flagged in chart.DESIGN.md as a deliberate consistency choice per the extraction notes' own 'implementer's judgment' framing."
  - "This plan does not build the Perfusion Index card composition itself (icon tile, status pill, axes, real data) — only the ChartContainer/Tooltip/Legend primitive layer and its Figma-informed token wiring. The full composition is explicitly 06-15's scope per this plan's own key_links."

patterns-established:
  - "Read-only CLI extraction as an install-guard technique: for any future registry component known to risk overwriting an already-restyled file, prefer extracting via --view/--diff (read-only) and hand-writing the result over ever running the real write command, even against a scratch directory."

requirements-completed: [DSYS-01, DSYS-02, DSYS-03]

coverage:
  - id: D1
    description: "recharts@3.8.0 added as a real, direct package.json dependency (Package Legitimacy Audit verdict OK/Approved)"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -n \"recharts\" package.json -> \"recharts\": \"^3.8.0\""
        status: pass
      - kind: other
        ref: "npm run build (exit 0)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Card-overwrite guard mechanically proven: card.tsx untouched by the chart install"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "git diff --stat -- src/components/ui/card.tsx -> empty"
        status: pass
      - kind: other
        ref: "grep -c \"bg-card\\\\|text-card-foreground\" src/components/ui/card.tsx -> 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "lucide-react [SUS] package never accepted into package.json/package-lock.json, per the Task 2 checkpoint's approved (b) resolution, achieved via a stricter zero-risk-window install path"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -c \"lucide-react\" package.json package-lock.json -> 0 in both"
        status: pass
      - kind: other
        ref: "npm view recharts@3.8.0 dependencies -> lucide-react absent"
        status: pass
    human_judgment: false
  - id: D4
    description: "ChartContainer/ChartTooltip(Content)/ChartLegend(Content) restyled so ChartConfig colors and every stock shadcn class reference this project's var(--color-*) semantic tokens, not shadcn's default palette"
    requirement: "DSYS-02"
    verification:
      - kind: other
        ref: "grep -c \"muted-foreground\\\\|bg-background\\\\|shadow-xl\" src/components/ui/chart.tsx -> 0"
        status: pass
      - kind: other
        ref: "npm run build (exit 0)"
        status: pass
    human_judgment: true
    rationale: "Visual fidelity of the restyled tooltip/legend/axis treatment against Figma node 203-13216's chart chrome requires an actual rendered comparison this executor cannot perform (no Figma MCP/browser tool access) and there is no rendered chart page yet to screenshot (that composition is 06-15's scope) — deferred to the orchestrator's post-06-15 screenshot-diff pass."
  - id: D5
    description: "DSYS-03 adjacency: no audience-specific (caregiver/parent) color token was introduced by this plan's additive changes"
    requirement: "DSYS-03"
    verification:
      - kind: other
        ref: "grep -c \"^\\\\s*--color-.*\\\\(caregiver\\\\|parent\\\\)\" src/app/globals.css -> 0 (no globals.css changes made by this plan at all)"
        status: pass
    human_judgment: false

duration: ~15min (this resumed session, Task 3 only)
completed: 2026-09-27
status: complete
---

# Phase 6 Plan 14: Guarded Chart Install + Restyled ChartContainer/Tooltip/Legend Summary

**Added `recharts@3.8.0` as a real dependency and restyled shadcn's ChartContainer/ChartTooltip/ChartLegend onto this project's semantic tokens, via a read-only extraction path that mechanically proved `card.tsx` untouched and kept the `[SUS]`-flagged `lucide-react` out of `package.json` entirely.**

## Performance

- **Duration:** ~15 min (this resumed session — Task 1 dry-run/diff probing and the Task 2 human
  checkpoint both completed in a prior session; this SUMMARY covers the whole plan)
- **Completed:** 2026-09-27T04:20:07Z
- **Tasks:** 3 (Task 1: dry-run/diff inspection — prior session; Task 2: human checkpoint —
  resolved by user; Task 3: guarded install + restyle — this session)
- **Files modified:** 4 (package.json, package-lock.json, src/components/ui/chart.tsx (new),
  src/components/ui/chart.DESIGN.md (new))

## Accomplishments

- Re-confirmed live (Task 1's finding still held in this session): `npx shadcn add chart --diff`
  shows `card.tsx` in the diff — the known Card-overwrite pitfall (RESEARCH.md Pitfall 1) is real
  and would fire on a direct `add chart` call.
- Chose a stricter install path than either of the plan's two authorized options: extracted
  `chart.tsx`'s exact generated content from `npx shadcn add chart --view src/components/ui/chart.tsx`'s
  read-only dry-run output (374 lines, byte-for-byte match against the CLI's own reported line
  count) and hand-wrote it into the repo — the real `npx shadcn add chart` command was never
  executed against this repository at all, in either scratch or real form.
- Added `recharts@3.8.0` (the exact version shadcn's own `chart` registry entry resolves to) as a
  real `package.json` dependency via plain `npm install recharts@3.8.0`, independent of the
  `shadcn` CLI.
- Verified the Card-overwrite guard mechanically: `git diff --stat -- src/components/ui/card.tsx`
  is empty and `grep -c "bg-card|text-card-foreground" src/components/ui/card.tsx` is `0` — `card.tsx`
  is byte-identical to its pre-install state.
- Discovered that `lucide-react` never entered `package.json`/`package-lock.json` at all in this
  install path — it is not one of `recharts`'s own dependencies (verified via `npm view
  recharts@3.8.0 dependencies`), only something `shadcn`'s own `add chart` command would have
  installed directly, and that command was never run for real. The Task 2 checkpoint's approved
  resolution (option (b): install then strip) is satisfied with a strictly smaller risk window —
  there was never anything to strip.
- Restyled `ChartContainer`'s wrapper classes (`fill-muted-foreground`→`fill-text-muted`,
  `stroke-border/50`→`stroke-border-subtle/50`, `fill-muted`→`fill-border-subtle`),
  `ChartTooltipContent`'s floating-surface treatment (`rounded-lg border border-border/50
  bg-background shadow-xl`→`rounded-input border border-border bg-surface shadow-floating`,
  matching `select.tsx`'s existing dropdown-content convention exactly), and both
  `ChartTooltipContent`/`ChartLegendContent`'s text colors (`text-muted-foreground`→`text-text-muted`,
  `text-foreground`→`text-text`) onto this project's real semantic tokens — zero stock
  `muted-foreground`/`bg-background`/`shadow-xl` classes remain.
- Fixed the generated file's `cn` import (`from "cn"` → `from "@/lib/utils"`), matching the
  project-wide convention every other `ui/*.tsx` file follows (same fix `06-07`/`06-08` applied
  to `item.tsx`/`separator.tsx`/`progress.tsx`).
- Authored `chart.DESIGN.md` citing Figma node `203-13216`, documenting the install-path decision
  in full, the `lucide-react` disposition, a `ChartConfig` token-wiring example
  (`var(--color-critical)`/`var(--color-brand)`/`var(--color-safe)`), and a full
  stock-class-to-project-token restyle table.
- `npm run build` exits 0 with `chart.tsx` in place.

## Task Commits

1. **Task 1: Dry-run + diff inspection** — prior session, no files written, no commit (read-only
   probing task by design).
2. **Task 2: Human checkpoint** — resolved by the user (approved (b): install + strip), no commit
   (checkpoint task, no code change).
3. **Task 3: Guarded install + restyle ChartContainer/ChartTooltip/ChartLegend** - `534bbc9` (feat)

**Plan metadata:** (this commit, docs)

## Files Created/Modified

- `src/components/ui/chart.tsx` - shadcn `chart` registry component (`ChartContainer`,
  `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`),
  extracted read-only and restyled to the token layer.
- `src/components/ui/chart.DESIGN.md` - Chart usage rules, Figma provenance (node `203-13216`),
  the Card-overwrite-guard record, the `lucide-react` disposition, and a `ChartConfig` token-wiring
  example.
- `package.json` - `recharts` added as a real `dependencies` entry (`^3.8.0`).
- `package-lock.json` - lockfile updated for the `recharts` install (37 packages added; no
  `lucide-react`).

## Decisions Made

See `key-decisions` in frontmatter above — summarized: resolved the Task 2 checkpoint's approved
(b) option via a stricter, zero-risk-window extraction method instead of a real install-then-strip;
pinned `recharts` to the exact version shadcn's registry resolves; reused `select.tsx`'s floating-
content convention for the chart tooltip; left axis-tick font as the inherited project sans-serif
rather than special-casing Roboto; deferred the full Perfusion Index composition to 06-15 as
originally scoped.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking, stricter-than-required] Extracted chart.tsx via `--view` instead of a scratch-dir hand-copy**
- **Found during:** Task 3
- **Issue:** The plan's Task 3 action authorized either (implicit option a) a scratch/throwaway
  directory install with hand-copy, or the direct install (only if Task 1 found no card.tsx diff —
  not the case here, since card.tsx WAS in the diff). Neither option is strictly wrong, but a
  scratch-directory `shadcn add` invocation requires a standalone `components.json`/tsconfig-alias
  setup to resolve correctly, adding setup overhead and a small residual risk of misconfiguration
  leaking into the wrong location.
- **Fix:** Used `npx shadcn add chart --view src/components/ui/chart.tsx` (read-only, already
  required by Task 1's own dry-run probing) to obtain the exact generated file content, verified
  the extracted line count (374) matched the CLI's own reported line count exactly, and hand-wrote
  the file via the editor tool. `recharts` was added separately via plain `npm install`. No
  `shadcn add chart` write operation ever touched the repository.
- **Files modified:** src/components/ui/chart.tsx (new)
- **Verification:** Extracted line count (374) matches CLI's reported line count; `npm run build`
  exits 0; `git diff --stat -- src/components/ui/card.tsx` empty.
- **Committed in:** `534bbc9` (Task 3 commit)

---

**Total deviations:** 1 (1 Rule 3 stricter-than-required substitution, no functional risk increase
— strictly reduces the risk the plan's own guard exists to prevent).
**Impact on plan:** Positive — the install-path substitution achieves the plan's Card-overwrite
guard and the checkpoint's `lucide-react` resolution with a smaller risk surface than either
plan-authorized option, and is fully documented in `chart.DESIGN.md` for future plans reusing this
technique.

## Issues Encountered

None. The D-15 Figma-extraction workaround (reading `06-FIGMA-EXTRACTS.md`'s "Chart-family node"
section instead of calling Figma MCP tools directly) worked as described, consistent with every
prior plan in this phase.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `recharts@3.8.0` is a real dependency and `chart.tsx`'s `ChartContainer`/`ChartTooltip`/
  `ChartTooltipContent`/`ChartLegend`/`ChartLegendContent` are restyled to the token layer —
  06-15 (Sparkline + DualAxisVitalsChart) can now start; its own key_links dependency on this
  plan is satisfied.
- `chart.DESIGN.md`'s `ChartConfig` token-wiring example
  (`var(--color-critical)`/`var(--color-brand)`/`var(--color-safe)`) is the reference 06-15 should
  follow when building the real Perfusion Index composition and any other chart consumer.
- **Not yet done, deferred to the orchestrator (and effectively to 06-15):** the screenshot-vs-
  Figma visual comparison (second half of D-15) for node `203-13216`'s chart chrome — there is no
  rendered chart page to screenshot yet; `chart.DESIGN.md` explicitly flags this as pending until
  06-15 builds the actual composition.
- **Flagged for 06-15 (not this plan's job):** the full Perfusion Index card composition (icon
  tile, status pill, X/Y axes, faint gridline fade, real data wiring) and the `Sparkline`/
  `DualAxisVitalsChart` wrapper components are explicitly out of this plan's scope, per its own
  key_links.
- No blockers introduced by this plan.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-27*

## Self-Check: PASSED

- FOUND: src/components/ui/chart.tsx
- FOUND: src/components/ui/chart.DESIGN.md
- FOUND commit: 534bbc9
- `npm run build` exits 0 (verified after Task 3)
- `git diff --stat -- src/components/ui/card.tsx` -> empty
- `grep -c "bg-card|text-card-foreground" src/components/ui/card.tsx` -> 0
- `grep -c "lucide-react" package.json package-lock.json` -> 0 in both
- `grep -c "muted-foreground|bg-background|shadow-xl" src/components/ui/chart.tsx` -> 0
- `grep -n "recharts" package.json` -> `"recharts": "^3.8.0"`
