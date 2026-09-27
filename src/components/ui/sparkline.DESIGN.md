# Sparkline — DESIGN.md

`Sparkline` is a hand-authored, chromeless Recharts wrapper — `ResponsiveContainer` +
`LineChart` + a single `Line`, nothing else. No `XAxis`/`YAxis`/`CartesianGrid`/`Tooltip`/`Legend`.
It exists purely as a compact inline trend glyph for the 76×26px sparkline slot inside a
vital-stat card, and is **deliberately distinct** from the `Chart` primitive
(`@/components/ui/chart`, 06-14), which exists for the opposite, fully-labeled use case. Per
`06-UI-SPEC.md`'s own Sparkline row: "do not reuse `ChartContainer`'s chrome here." This
component must never grow axes, a tooltip, a legend, or a grid — if a future need calls for
that chrome, use `Chart`/`VitalsTrendChart` instead, not an expanded `Sparkline`.

## Figma verification (D-15 mechanism)

Per the D-15 Figma-extraction workaround (this executor has no direct Figma MCP access — see
`.planning/phases/06-design-system-tailwind-v4-tokens/06-FIGMA-EXTRACTS.md`), verified against
the relayed extraction notes for both Home-screen sparkline instances:

- **`266-9350` (Pulse sparkline)** and **`266-9363` (Temp sparkline)** — both live inside the
  full-bleed gradient **Vital Stat Card** (node `266-9344`), at a fixed **76×26px slot**
  (`HeartWaveform`), positioned between the label+icon row and the big number+unit row. The
  card's whole background is a status-colored gradient (e.g. blue-500→blue-400 for Pulse), not
  a white card + icon tile — so the sparkline line itself renders **white**
  (`var(--color-text-inverse)`) against that gradient, not a status-hued line. This is a more
  specific finding than this plan's own speculative "Pulse/Temp likely map to status tokens"
  framing — the relayed extraction is authoritative and is what this component's real Vital
  Stat Card usage should follow (pass `color="var(--color-text-inverse)"` explicitly at that
  call site).
- No axes, grid, tooltip, or legend are visible in either instance — confirmed chromeless,
  matching `06-UI-SPEC.md`'s explicit instruction.
- **Comparison outcome:** not yet screenshot-verified against a rendered build — deferred to the
  orchestrator's post-dispatch screenshot-diff pass (this executor has no browser/screenshot
  tool access), same deferral pattern every prior `*.DESIGN.md` in this phase records. There is
  no consuming Vital Stat Card composition yet to screenshot against (that composition is
  06-18/06-20's job per this plan's own `key_links`) — this plan's own verification is limited to
  the chromeless-render grep check and a green `npm run build`.

## Props

| Prop | Default | Notes |
|------|---------|-------|
| `data` | required | `{ value: number }[]`. Empty array renders the empty state. |
| `color` | `"var(--color-safe)"` | Matches `06-RESEARCH.md`'s Pattern 1 default. Override per call site — see the white-on-gradient note above for the real Vital Stat Card usage. |
| `height` | `26` | Matches the Figma-extracted sparkline slot height exactly. |
| `className` | — | Merged via `cn` (tailwind-merge-parity conflict resolution). |

## Empty state

Renders `"No data for this range yet."` (`06-UI-SPEC.md`'s Copywriting Contract), at the same
`height` as the populated state — no layout shift when trend data arrives. Text is 10px,
`overflow-hidden truncate` so it never breaks the tiny 76×26px slot's layout even though the
full copy is long relative to the available width.

## Motion

Recharts' own line-draw entrance animation is JS-driven (`react-smooth`), not a CSS transition —
Tailwind's `motion-reduce:` variant cannot intercept it. `Sparkline` detects
`prefers-reduced-motion` via `window.matchMedia` client-side and passes the result to `Line`'s
`isAnimationActive` prop, disabling the draw-in animation outright when the user has that
preference set.

## Accessibility

Marked `aria-hidden="true"` on both branches — the sparkline is a decorative trend glyph; the
adjacent Vital Stat Card content (label + big number + unit, e.g. "Pulse 128 bpm") already
carries the informative value in text a screen reader announces. This matches `06-UI-SPEC.md`'s
own framing of chart accessibility as a lightweight, not-yet-fully-resolved pass (⚠ marked) —
an uninformative `role="img"`/`aria-label` on a decorative sparkline would be worse than marking
it hidden.

## Correct usage

```tsx
// Server Component — only the Sparkline leaf itself is a Client Component.
import { Sparkline } from "@/components/ui/sparkline"

export function PulseVitalCard({ trend }: { trend: { value: number }[] }) {
  return (
    <div className="rounded-card bg-gradient-to-br from-blue-500 to-blue-400 p-4">
      <p className="text-label font-semibold text-text-inverse">Pulse</p>
      <Sparkline data={trend} color="var(--color-text-inverse)" />
      <p className="text-vital-metric text-text-inverse">128 bpm</p>
    </div>
  )
}
```

## Incorrect usage

```tsx
// ✗ Do not add axes/tooltip/legend/grid — that turns Sparkline into a
// second, redundant Chart primitive. Use VitalsTrendChart instead.
<LineChart data={data}>
  <XAxis dataKey="time" />
  <Tooltip />
  <Line dataKey="value" />
</LineChart>

// ✗ Do not reuse ChartContainer's chrome classes/wrapper for this component —
// it exists specifically for the fully-labeled use case, not the chromeless one.
```
