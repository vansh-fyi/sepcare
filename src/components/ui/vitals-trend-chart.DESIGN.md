# VitalsTrendChart — DESIGN.md

`VitalsTrendChart` is the larger analytics chart — a `ComposedChart` composing `chart.tsx`'s
`ChartContainer`/`ChartTooltip`/`ChartLegend` chrome, the fully-labeled use case that primitive
exists for (unlike the chromeless `Sparkline`). It accepts a generic `data`/`series` shape — not
hardcoded to `pulse`/`spo2` field names — so Phase 7 can feed real vitals field names without a
rewrite.

## Figma verification (D-15 mechanism)

Per the D-15 Figma-extraction workaround (this executor has no direct Figma MCP access — see
`.planning/phases/06-design-system-tailwind-v4-tokens/06-FIGMA-EXTRACTS.md`'s "Chart-family node"
section), **Verified against Figma node** `203-13216` ("Perfusion Index" analytics chart card) for
the dual-axis-specific layout values this plan calls out beyond 06-14's base primitive extraction:

- **The real Figma frame is single-axis, not dual-axis.** It shows one pink/red line with dot
  markers, hourly X-axis labels (8:00–14:00), and one numeric Y-axis (100/99/96/94) —
  `06-CONTEXT.md`'s D-16 "dual-axis" framing was a general web-research finding about vitals
  dashboards broadly, not a literal Figma frame in this file. This component is built generically
  enough to support a genuine two-axis layout (see below) but does **not** force a second axis
  onto this specific single-series frame just because the component name says "dual-axis."
- Faint vertical gridlines with a top-to-bottom fade (`opacity-10`, neutral-100→pink-200) — an
  ambient decorative treatment, not a hard axis grid line. `chart.tsx`'s own `ChartContainer`
  already restyles Recharts' default `.recharts-cartesian-grid` stroke to
  `stroke-border-subtle/50` (06-14), so a plain `<CartesianGrid vertical strokeDasharray="3 3" />`
  with no explicit `stroke` prop inherits the correct subtle register automatically — no extra
  gradient-fade implementation was added here, matching `chart.DESIGN.md`'s own "Correct usage"
  example.
- X/Y-axis tick labels: 10px, neutral-900/neutral-500 (already restyled by `ChartContainer` to
  `text-text`/`text-text-muted` in 06-14) — inherited without any per-component override.
- Font note carried forward unchanged from `chart.DESIGN.md`: axis ticks inherit the project's
  `--font-sans` (Inter), not the Roboto leaking through Recharts' own default in the Figma mock —
  a deliberate consistency choice, not special-cased here either.
- **Comparison outcome:** not yet screenshot-verified against a rendered build — deferred to the
  orchestrator's post-dispatch screenshot-diff pass (this executor has no browser/screenshot tool
  access), same deferral pattern as every prior `*.DESIGN.md` in this phase. There is no
  consuming Perfusion Index card composition yet to screenshot against (that full composition —
  icon tile, status pill — is a later plan's job per this plan's own `key_links`); this plan's own
  verification is limited to the dual-axis-support grep check and a green `npm run build`.

## Dual-axis support (genuinely two-axis when the data calls for it)

Per `06-RESEARCH.md`'s Pattern 2 and its "Important" note: once any `YAxis` declares an explicit
`yAxisId`, every `Line`/`Bar`/`Area` in the chart must declare a matching `yAxisId` too — Recharts
does not fall back to an implicit default axis once IDs are introduced. `VitalsTrendChart`
implements this via a `series` config array:

- Every series defaults to `yAxisId: "left"`.
- The right `YAxis` is only rendered at all when at least one series explicitly sets
  `yAxisId: "right"` — a single-series consumer (matching this plan's real Figma frame) renders
  exactly one axis, never a decorative unused second axis.
- Every `Line` receives `yAxisId={series.yAxisId ?? "left"}`, so it always matches a rendered axis
  — the Recharts constraint above is satisfied unconditionally, not just in the two-axis case.
- The legend (`ChartLegend`/`ChartLegendContent`) only renders when `series.length > 1` — a
  single-series chart (the Perfusion Index case) shows no legend, matching that Figma frame,
  while a genuine multi-series/dual-axis consumer gets one automatically.

## Props

| Prop | Default | Notes |
|------|---------|-------|
| `data` | required | `Array<Record<string, number \| string>>` — generic row shape, any field names. |
| `series` | required | `{ key, label, color, yAxisId?, domain?, showDots? }[]`. `color` must reference a `var(--color-*)` token, never a hardcoded hex — wired into `ChartConfig` so `Line`'s `stroke` can reference `var(--color-{key})` with one source of truth (matches `chart.DESIGN.md`'s token-wiring example). |
| `xKey` | required | Data key used for the X-axis. |
| `height` | `240` | Matches `06-RESEARCH.md`'s Pattern 2 example height. Identical between empty and populated states — no reflow. |
| `className` | — | Merged via `cn`; overrides `ChartContainer`'s default `aspect-video` with `aspect-auto` so the explicit `height` controls sizing instead. |

## Empty state

Renders `"No data for this range yet."` (`06-UI-SPEC.md`'s Copywriting Contract) at the same
`height` as the populated chart — no layout shift when real data arrives.

## Motion

Recharts' own line-draw entrance animation is JS-driven (`react-smooth`), not a CSS transition —
Tailwind's `motion-reduce:` variant cannot intercept it. `VitalsTrendChart` detects
`prefers-reduced-motion` via `window.matchMedia` client-side and passes the result to every
`Line`'s `isAnimationActive` prop, disabling the draw-in animation outright when the user has
that preference set.

## Correct usage — single-axis (matches the real Figma frame, node `203-13216`)

```tsx
import { VitalsTrendChart } from "@/components/ui/vitals-trend-chart"

<VitalsTrendChart
  xKey="time"
  data={[
    { time: "8:00", perfusion: 100 },
    { time: "10:00", perfusion: 99 },
    { time: "12:00", perfusion: 96 },
    { time: "14:00", perfusion: 94 },
  ]}
  series={[
    { key: "perfusion", label: "Perfusion Index", color: "var(--color-critical)" },
  ]}
/>
```

## Correct usage — genuine dual-axis (a future consumer with two differently-scaled series)

```tsx
<VitalsTrendChart
  xKey="time"
  data={[{ time: "8:00", pulse: 128, spo2: 97 }, /* … */]}
  series={[
    { key: "pulse", label: "Pulse", color: "var(--color-brand)", domain: [60, 180] },
    {
      key: "spo2",
      label: "SpO2",
      color: "var(--color-safe)",
      yAxisId: "right",
      domain: [90, 100],
    },
  ]}
/>
```

## Incorrect usage

```tsx
// ✗ Do not declare a YAxis with an explicit yAxisId without giving every
// Line/Bar/Area in the chart a matching yAxisId — Recharts drops the series
// silently once IDs are introduced instead of falling back to a default axis.
<ComposedChart data={data}>
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <Line dataKey="pulse" /> {/* ✗ missing yAxisId="left" */}
</ComposedChart>

// ✗ Do not hardcode a hex/rgb color on a series — always route through the
// `series[].color` -> ChartConfig -> `var(--color-{key})` chain.
{ key: "pulse", label: "Pulse", color: "#2563EB" }
```
