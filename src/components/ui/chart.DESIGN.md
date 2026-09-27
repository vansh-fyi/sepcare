# Chart — DESIGN.md

`ChartContainer` / `ChartTooltip` / `ChartTooltipContent` / `ChartLegend` / `ChartLegendContent` /
`ChartStyle` are shadcn's `chart` registry primitives (the `add chart` component, no `-b`/`--base`
flag — `add` has no such option in CLI `4.21.0`), restyled to this project's semantic token layer.
They wrap [Recharts](https://recharts.org) (`recharts@3.8.0`, the version shadcn's own registry
entry pins), per D-12's explicit "lean on existing libraries, do not hand-roll SVG charting"
directive.

This plan (06-14) installs and restyles only the primitive layer. It does **not** build the
Perfusion Index analytics-chart composition itself — that composition, plus the inline `Sparkline`
wrapper and `DualAxisVitalsChart`, is 06-15's job (see `key_links` in 06-14-PLAN.md's frontmatter).

## Verified against Figma node `203-13216`

"Perfusion Index" analytics chart card — relayed via the orchestrator's `get_design_context` call,
per the D-15 workaround (this executor has no direct Figma MCP access; see
`.planning/phases/06-design-system-tailwind-v4-tokens/06-FIGMA-EXTRACTS.md`'s "Chart-family node"
section). Extracted values that inform this primitive's restyle (the surrounding card shell and
line/tooltip color wiring; the full card composition — icon tile, status pill, axes — is 06-15's
scope, not rebuilt here):

- The chart lives inside a normal `Card` (white, `rounded-24`, `shadow: 0px 2px 8px
  rgba(0,0,0,0.05)`) — it is not a custom card shape of its own, confirming `ChartContainer`
  itself should carry no competing surface/shadow styling; it is a plain content region a `Card`
  wraps, not a card replacement.
- Single-series line chart with a pink/red line and dot markers (matches the critical/warning
  framing of that specific card) — confirms `ChartConfig`'s `color` field should reference this
  project's `--color-critical`/pink-family tokens for a warning-toned series, and
  `--color-brand`/`--color-safe` for neutral/positive series, never a hardcoded hex.
- Faint vertical gridlines (`opacity-10`, neutral-100→pink-200 fade) — a stylistic "ambient" grid,
  not a hard axis grid line; confirms the `stroke-border-subtle/50` treatment applied to
  `.recharts-cartesian-grid` below is the right register (subtle, not a strong border).
- X/Y-axis tick labels: 10px, neutral-900/neutral-500 — confirms axis tick text should use
  `--color-text`/`--color-text-muted`, not shadcn's stock `muted-foreground`.
- Font note: the Figma frame's axis ticks render in Roboto (Recharts' own default leaking through
  the mock), not this project's Plus Jakarta Sans/Inter stack — flagged by 06-FIGMA-EXTRACTS.md as
  the implementer's judgment call. **Disposition:** not special-cased here; `ChartContainer` sets
  no `font-family` override, so axis ticks inherit the project's global `--font-sans` (Inter) like
  every other UI text, consistent with the rest of the system rather than introducing a
  third font family for one chart's ticks.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as every other `*.DESIGN.md` in this phase. There is no
rendered chart page yet to screenshot against (that page is 06-15's Perfusion Index composition);
this plan's own verification is limited to the primitive's token wiring and a green `npm run build`.

## Card-overwrite guard (T-06-SC, RESEARCH.md Pitfall 1)

`npx shadcn add chart --diff` was run first (Task 1, this plan) and confirmed `src/components/ui/card.tsx`
appears in the diff — shadcn's `chart` registry entry lists `card` as a dependency it also
overwrites with its own stock, unstyled Card (`bg-card`, `text-card-foreground`, `border`,
`shadow-sm`) by default.

**Install path used:** rather than writing into a disposable scratch directory, `chart.tsx`'s
generated content was extracted directly and losslessly from `npx shadcn add chart --view
src/components/ui/chart.tsx`'s dry-run output (374 lines, byte-for-byte match against the reported
line count) and hand-written into `src/components/ui/chart.tsx` via the editor tool — the real
`npx shadcn add chart` command (the one that would overwrite `card.tsx`) was **never executed
against this repository at all**, in either scratch or real form. This is a stricter version of the
plan's "(a) scratch-dir hand-copy" option: it achieves the same "card.tsx never touched" guarantee
with zero risk window, since no `shadcn` write operation against `src/components/ui/` ever ran.
`recharts@3.8.0` (the exact version the CLI's dry-run resolved) was then added as a real dependency
via plain `npm install recharts@3.8.0`, independent of the `shadcn` CLI.

**Guard verification (Task 3, mechanical, re-run after the install):**
- `git diff --stat -- src/components/ui/card.tsx` → empty.
- `grep -c "bg-card\|text-card-foreground" src/components/ui/card.tsx` → `0`.

Both hold. `card.tsx` is byte-identical to its pre-install state.

## `lucide-react` disposition (T-06-12, Task 2 checkpoint)

The Task 2 blocking human-verify checkpoint was resolved: **approve the recharts + chart install,
then strip the unused transitive `lucide-react` dependency from `package.json` afterward and
confirm `chart.tsx` still builds without it** (checkpoint option (b)).

**Actual outcome:** because the install path above never ran the real `npx shadcn add chart`
against the repo (only `--dry-run`/`--diff`/`--view`, all read-only, plus a plain `npm install
recharts@3.8.0`), `lucide-react` was **never added to `package.json` or `package-lock.json` in the
first place** — there was nothing to strip. Verified:
- `grep -n "lucide-react" package.json package-lock.json` → no matches.
- `recharts@3.8.0`'s own `dependencies` (`npm view recharts@3.8.0 dependencies`) do not include
  `lucide-react` either — it was only ever a dependency the `shadcn` CLI's `chart` registry entry
  declares and installs directly, not a transitive dependency of `recharts` itself.
- `npm run build` exits 0 with `chart.tsx` in place and no `lucide-react` anywhere in
  `node_modules` reachable from this project's own dependency tree.

This satisfies the checkpoint's intended end-state (recharts present, `lucide-react` absent,
build green) via a path that carries strictly less risk than "install then strip," per D-18's
confirmation that this resolution is unaffected by the separate `@tabler/icons-react` icon-strategy
amendment — `lucide-react`'s disposition here was never about D-09's icon system, only about an
unused transitive dependency that, in this specific install path, never arrived at all.

## `ChartConfig` token wiring

`ChartConfig`'s `color` field is a plain string — reference this project's semantic CSS custom
properties directly, never a hardcoded hex or shadcn's stock `--chart-1`..`--chart-5` palette
(which this project's `@theme` block does not define):

```tsx
import type { ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  perfusion: { label: "Perfusion Index", color: "var(--color-critical)" },
  pulse: { label: "Pulse", color: "var(--color-brand)" },
  spo2: { label: "SpO2", color: "var(--color-safe)" },
} satisfies ChartConfig
```

`ChartStyle` (internal, rendered automatically by `ChartContainer`) emits a scoped `<style>` block
that sets `--color-{key}: {color};` per `data-chart` id — a `Line`/`Bar`/`Area`'s own `stroke`/`fill`
prop should reference `var(--color-{key})` (e.g. `stroke="var(--color-perfusion)"`) rather than
repeating the token string, so the color has exactly one source of truth (the `chartConfig` object).

## Restyle from the shadcn scaffold

| Stock class | This project's replacement | Why |
|---|---|---|
| `import { cn } from "cn"` | `import { cn } from "@/lib/utils"` | Every other `ui/*.tsx` file imports `cn` via the `@/lib/utils` re-export, not the `"cn"` package directly — same consistency fix `06-07`/`06-08` applied to `item.tsx`/`separator.tsx`/`progress.tsx` |
| `fill-muted-foreground` (axis tick text) | `fill-text-muted` | `--color-text-muted` is this project's real "de-emphasized text" role; shadcn's `muted-foreground` token doesn't exist in this project's `@theme` block |
| `stroke-border/50` (cartesian grid line) | `stroke-border-subtle/50` | `--color-border-subtle` (neutral-200) is the project's real subtle-divider token, matching the Figma frame's faint ambient gridline treatment |
| `stroke-border` (tooltip cursor, polar grid, reference line) | `stroke-border` | `--color-border` (neutral-300) already exists as the project's default border role — direct match, no change to the class name itself |
| `fill-muted` (radial-bar background, rectangle tooltip cursor) | `fill-border-subtle` | No stock "muted background fill" role exists in this project; `--color-border-subtle`'s neutral-200 value is the closest existing subtle-background equivalent |
| `rounded-lg border border-border/50 bg-background ... shadow-xl` (tooltip content) | `rounded-input border border-border bg-surface ... shadow-floating` | Matches `select.tsx`'s existing floating-content treatment exactly (`rounded-input border border-border bg-surface text-text shadow-floating`) — both are floating popover-like surfaces, so they share one convention rather than inventing a second |
| `text-muted-foreground` (item label, legend icon/svg color) | `text-text-muted` | Same de-emphasized-text mapping as the axis-tick fix above |
| `text-foreground` (tooltip value) | `text-text` | `--color-text` (neutral-900) is this project's real default-text role |
| `border-(--color-border) bg-(--color-bg)` (per-item indicator dot, dynamically colored via inline `style`) | unchanged | These reference a **locally-scoped** CSS custom property set by the same element's own inline `style` (`indicatorColor`), not this project's global `--color-border`/`--color-bg` tokens — the name collision is cosmetic; the cascade correctly resolves to the local override regardless of the project also using those same names globally |

## Correct usage

```tsx
"use client"
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  perfusion: { label: "Perfusion Index", color: "var(--color-critical)" },
} satisfies ChartConfig

export function PerfusionChart({ data }: { data: Array<{ time: string; perfusion: number }> }) {
  return (
    <ChartContainer config={chartConfig} className="h-[180px] w-full">
      <LineChart data={data}>
        <CartesianGrid vertical strokeDasharray="3 3" />
        <XAxis dataKey="time" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="perfusion"
          stroke="var(--color-perfusion)"
          strokeWidth={2}
          dot
        />
      </LineChart>
    </ChartContainer>
  )
}
```

## Incorrect usage

```tsx
// ✗ Do not hardcode a hex/rgb color on a Line/Bar/Area — always route through
// ChartConfig so the color has one source of truth and can be re-toned later.
<Line dataKey="perfusion" stroke="#EF0C0C" />

// ✗ Do not import lucide-react for chart legend/tooltip icons — it is not a
// project dependency (see the "lucide-react disposition" section above) and
// was deliberately kept out of package.json; use this project's existing
// Icon component (src/components/icon.tsx) or an itemConfig.icon function
// component instead.
import { Activity } from "lucide-react"
```

## Overflow / no-data backstop

Not exercised by this plan (no composition consumes `ChartContainer` yet). `06-UI-SPEC.md`/06-15's
composition should define an explicit empty-state (no data points) and long-time-range tick-label
truncation behavior when it builds the real Perfusion Index chart and `Sparkline`/`DualAxisVitalsChart`
components — flagged here so that plan doesn't have to rediscover the gap.
