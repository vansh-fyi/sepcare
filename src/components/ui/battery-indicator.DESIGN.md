# BatteryIndicator — DESIGN.md

`BatteryIndicator` is a domain composite — no shadcn equivalent exists — that wraps the restyled
`Progress` primitive (`progress.tsx`) with the device-status battery-level presentation
(`06-UI-SPEC.md`'s Domain composites table: "Wraps `Progress` with a battery-shaped track; reuse
the existing `battery`/`charging` `Icon` glyphs for the terminal nub rather than drawing a new
one"). It renders: a leading `battery`/`charging` glyph from `icon.tsx`, a percentage-driven
`Progress` bar, and a numeric percentage label — in that order, matching Figma's own bar+label
layout.

## Verified against Figma nodes `203-11669` and `266-9257`

- **`203-11669`** (Device Status Card WITH progress bar) supplies the actual bar visual spec —
  see `progress.DESIGN.md` for the full per-value extraction (6px track, `bg-safe-soft`/
  `bg-safe-fill`, `rounded-full`, 10px Bold `text-safe` label). This node resolves D-16's open
  question: there is **no dedicated battery-glyph track treatment** anywhere in this phase's 6
  inspected card nodes — the progress bar itself IS the battery-level visual, not a
  notched-battery-shape SVG.
- **`266-9257`** (Home screen) is the composition context, not a second bar-visual extraction —
  `06-UI-SPEC.md`'s Home Screen Proof-of-Concept Layout names the device status header as "likely
  built from the new `smartwatch-dot` icon + `BatteryIndicator`," and this plan's own `key_links`
  confirm "Home-proof's device status header (06-20) composes `BatteryIndicator` directly." No
  independent per-pixel extraction of the header's exact battery-icon placement was performed
  this plan — that composition work belongs to 06-20, which will Figma-verify the header's exact
  icon/bar/label arrangement against `266-9257` directly when it builds the real header.

**Why no new battery-glyph SVG was drawn:** per this plan's own read_first note (06-RESEARCH.md's
Alternatives Considered row) and the D-15 workaround's explicit disposition guidance, a separate
battery-glyph treatment is only warranted if independent evidence shows one is needed. The only
independent evidence found is `06-UI-SPEC.md`'s Domain composites table itself, which directs
`BatteryIndicator` to reuse `icon.tsx`'s existing `battery`/`charging` glyphs (which already
contain a rect + terminal-nub path) for that silhouette — not to hand-draw a second one. The
`Progress` bar stays the plain percentage track; the `Icon` glyph supplies the battery shape.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as `progress.DESIGN.md`/`card.DESIGN.md`.

## Props

| Prop | Type | Notes |
|---|---|---|
| `level` | `number` | Battery charge, 0–100. Out-of-range values are clamped (never renders a negative-width or over-100% bar). |
| `charging` | `boolean` (default `false`) | Swaps the leading glyph from `battery` to `charging` (`icon.tsx`'s existing glyphs) and sets the `Progress` bar's `aria-label` to "Charging". |
| `className` | `string` | Merged onto the outer wrapper `<div>`. |

No `variant` axis — only one visual treatment exists in this phase's Figma data (per
`progress.DESIGN.md`'s "Single treatment, no `variant` axis" note), and `charging` is a boolean
state flag, not a second visual archetype.

## Correct usage

```tsx
<BatteryIndicator level={90} />
<BatteryIndicator level={42} charging />
```

## Incorrect usage

```tsx
// ✗ Do not hand-roll a battery bar with a raw <div> + inline width style —
// BatteryIndicator already wraps Progress's ARIA-complete implementation.
<div className="flex items-center gap-2">
  <div className="h-1.5 w-16 rounded-full bg-safe-soft">
    <div className="h-full rounded-full bg-safe-fill" style={{ width: "90%" }} />
  </div>
  <span>90%</span>
</div>

// ✗ Do not draw a new battery-glyph SVG shape for the track — no Figma node
// in this phase shows one, and icon.tsx's existing battery/charging glyphs
// already provide the rect+terminal-nub silhouette this composite needs.
```

## Overflow / long-text (backstop)

The percentage label is always a 1–3 digit number (`0`–`100`) — no long-text overflow case exists
for this component's label. Not independently re-verified by this plan's own automated checks.
