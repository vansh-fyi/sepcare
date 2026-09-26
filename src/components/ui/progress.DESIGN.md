# Progress — DESIGN.md

`Progress` is the shadcn `progress` registry component (`npx shadcn add progress`, no `-b`/`--base`
flag — `add` has no such option in CLI 4.21.0, verified live in `06-RESEARCH.md`), restyled to this
project's semantic token layer. It is a generic, percentage-driven horizontal bar backed by Radix's
`Progress` primitive (`role="progressbar"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax` provided
for free) — **not** a battery-shaped component itself. `BatteryIndicator` (`battery-indicator.tsx`)
wraps this primitive for the device-status battery-level use case.

## Verified against Figma node `203-11669`

Device Status Card WITH progress bar — relayed via the orchestrator's `get_design_context` call,
per the D-15 workaround (this executor has no direct Figma MCP access; see
`.planning/phases/06-design-system-tailwind-v4-tokens/06-FIGMA-EXTRACTS.md`'s Card-family section).
This node resolves D-16's open question: it is a **generic percentage-driven horizontal bar**, not
a battery-shaped/notched icon — none of the 6 inspected card nodes show an actual battery-glyph
track treatment.

Extracted values applied:

- Track: `height: 6px` (`h-1.5`), `bg-safe-soft` (green-100, `--color-safe-soft` — already an
  existing semantic alias, no new token needed for the track).
- Fill/indicator: same height, `bg-safe-fill` (green-600) — no existing semantic alias matched this
  exact value, so one small additive token (`--color-safe-fill`) was added in `globals.css`.
- Radius: `rounded-full` (`--radius-full`) rather than the literal 5px Figma value — a radius only
  needs to exceed half the track height to render fully rounded, so 5px on a 6px track is visually
  indistinguishable from full-round, and `06-UI-SPEC.md`'s Radius table already assigns
  `--radius-full` to "BatteryIndicator track" for this exact usage. No near-duplicate 5px token was
  added.
- Label: 10px Bold, `text-safe` (green-700, `--color-safe` — already an exact existing alias for
  this hex). The label is **not** built into `Progress` itself — Figma's percentage text sits
  beside the bar, not inside it, so it is a consumer-composed element (see `BatteryIndicator` for
  the composed usage, or compose it directly: `<span className="text-[10px] font-bold text-safe">90%</span>`
  next to `<Progress value={90} />`).
- Fill width is percentage-driven via the `value` prop (Radix's own transform-based indicator) —
  Figma's rendered 88.27%-of-track width for a "90%" label reflects a small track inset in that
  specific frame's authoring, not a formula to hardcode; this component computes width directly
  from `value`, as the plan's own extraction note requires.

**Single treatment, no `variant` axis:** only one visual treatment has been extracted anywhere in
this phase's Figma data for `Progress`. A `variant` prop was intentionally not added — adding one
now would mean guessing at a second treatment that doesn't exist in any inspected node.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as `card.DESIGN.md`/`item.DESIGN.md`/`button.DESIGN.md`.

## Restyle from the shadcn scaffold

| Stock class | This project's replacement | Why |
|---|---|---|
| `import { cn } from "cn"` | `import { cn } from "@/lib/utils"` | Every other `ui/*.tsx` file in this project imports `cn` via the `@/lib/utils` re-export, not the `"cn"` package directly — same consistency fix `06-07` applied to `item.tsx`/`separator.tsx` |
| `bg-primary/20` (track) | `bg-safe-soft` | shadcn's stock `primary` token role does not exist in this project's `@theme` block; `--color-safe-soft` is the real Figma-extracted track color |
| `bg-primary` (indicator) | `bg-safe-fill` | Same reasoning — `--color-safe-fill` is the real Figma-extracted fill color, additive-only (no existing token value changed) |
| `h-2` | `h-1.5` | Figma's exact 6px track height (`h-2` is 8px, the shadcn default, not this component's real value) |
| `transition-all` | `transition-[transform]` | Project convention (see `button.tsx`) never uses `transition-all`; only `transform` actually animates here |

## Correct usage

```tsx
// Bare progress bar — consumer composes its own label if one is needed
<Progress value={72} />

// With a percentage label, matching Figma's exact layout (label beside, not inside, the bar)
<div className="flex items-center gap-2">
  <Progress value={90} className="w-24" />
  <span className="text-[10px] font-bold text-safe">90%</span>
</div>
```

## Incorrect usage

```tsx
// ✗ Do not hand-roll a percentage bar with a raw <div> — Progress already
// provides the ARIA role/attributes (role="progressbar", aria-valuenow, etc.)
// that a bare <div style={{ width: "72%" }} /> would have to re-implement.
<div className="h-1.5 w-full rounded-full bg-safe-soft">
  <div className="h-full rounded-full bg-safe-fill" style={{ width: "72%" }} />
</div>

// ✗ Do not inline the percentage label inside Progress's own markup — Figma's
// label is a sibling, not a child; BatteryIndicator composes it correctly.
```

## Loading / indeterminate state (backstop)

`06-UI-SPEC.md`'s UI Considerations table flags an indeterminate track state (pulse animation,
`--duration-slow`) for when the real percentage is unknown, distinct from this determinate 0–100%
fill. Not implemented in this plan's scope — no consumer of `Progress` needs an indeterminate state
yet; flagged here so a later plan doesn't have to re-derive the requirement from scratch.
