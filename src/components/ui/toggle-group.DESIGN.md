# ToggleGroup — DESIGN.md

`ToggleGroup` (with its `ToggleGroupItem` children, and the underlying `Toggle` primitive it
composes) is the shadcn `toggle-group` registry component (`npx shadcn add toggle-group`, no
`-b`/`--base` flag — `add` has no such option in CLI 4.21.0, verified live in `06-RESEARCH.md`;
this install also pulls in `toggle.tsx` as a dependency, confirmed via the same live `--dry-run`
check), restyled to this project's semantic token layer. In `type="single"` mode it is exactly a
**generic segmented control** — one active option among labeled siblings — which is the primitive
behind the time-scale toggle (Figma node `203-11938`).

## Figma fidelity: token-consistent, not node-verified

No dedicated per-value Figma extraction (exact padding, corner radius, active-segment fill,
inactive-segment treatment) was performed for node `203-11938` or any dedicated `ToggleGroup`
frame this plan — no such node/frame was included in the orchestrator's D-15 extraction handoff
(`06-FIGMA-EXTRACTS.md`), unlike `Button`/`Card`/`Item`/`Progress`, each of which had a concrete
per-node section to extract from. `06-RESEARCH.md`'s Pattern 3 confirms the node's existence and
role (a segmented control for chart time ranges, `type="single"` mode) but does not carry per-pixel
values.

Rather than guess bespoke values with no source of truth, this restyle reuses the exact
radius/color/typography tokens already established by prior Figma-verified components:

| Token | Value | Reused from |
|---|---|---|
| `--radius-btn` (14px) | container + item corner radius | `Button` |
| `--color-brand-fill` (blue-600) | active (`data-[state=on]`) segment fill | `Button`'s `primary` variant — a generic control's active state is not a health-status signal, so brand blue (not the pink/critical family D-04 reserves) is the correct hue, unlike `NavLink`'s D-17 exception which is location-state, not a generic control |
| `--color-text-inverse` | active segment text | Same as `Button` |
| `text-label` (13px) | item label typography | `Badge` |
| `--color-bg` / `--color-text` | hover state | `Item`'s hover convention |
| `--color-border-focus` / `--shadow-focus` | focus-visible state | `Input`/`Item`'s existing focus convention — no ring-utility mechanism invented |

**A later plan with direct Figma MCP access should extract `203-11938`'s exact per-pixel values
and correct this component if they diverge from the token-consistent defaults above.** This note
exists precisely so that correction isn't silently skipped — the gap is documented, not hidden.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as every other component this phase.

## Restyle from the shadcn scaffold

| Stock class | This project's replacement | Why |
|---|---|---|
| `import { cn } from "cn"` | `import { cn } from "@/lib/utils"` | Project convention (same fix `06-07` applied to `item.tsx`/`separator.tsx`) |
| `text-sm` | `text-label` | This project's own 13px label-typography token, matching `Badge`'s usage |
| `hover:bg-muted hover:text-muted-foreground` | `hover:bg-bg hover:text-text` | shadcn's stock `muted`-prefixed tokens don't exist in this project's `@theme` block |
| `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` | `focus-visible:border-border-focus focus-visible:shadow-focus` | Matches `Input`/`Item`'s existing focus convention (box-shadow token) exactly — no second focus mechanism invented |
| `aria-invalid:border-destructive aria-invalid:ring-destructive/20` (+ `dark:` variant) | removed | No `destructive` token exists in this theme, and no destructive/invalid state applies to a segmented control per the Copywriting Contract ("no delete/remove action exists anywhere in this phase's scope") |
| `data-[state=on]:bg-accent data-[state=on]:text-accent-foreground` | `data-[state=on]:bg-brand-fill data-[state=on]:text-text-inverse` | shadcn's stock `accent`-prefixed tokens don't exist in this theme; brand blue is the correct active-segment hue for a generic (non-health-status) control |
| `border-input` (outline variant) | `border-border` | Real existing token |
| `hover:bg-accent hover:text-accent-foreground` (outline variant) | `hover:bg-bg hover:text-text` | Same reasoning as the base hover fix |
| `rounded-md` / `rounded-l-md` / `rounded-r-md` (container + item corners) | `rounded-btn` / `rounded-l-btn` / `rounded-r-btn` | Reuses `Button`'s corner radius instead of Tailwind's unthemed default `rounded-md` (0.375rem) |
| `transition-[color,box-shadow]` | `transition-[color,background-color,box-shadow,transform]` + `active:scale-[0.96]` | `06-UI-SPEC.md`'s Motion rule explicitly requires press feedback on "ToggleGroup items" |

## Reuse contract (Copywriting Contract, 06-UI-SPEC.md)

`ToggleGroup`/`ToggleGroupItem` accept arbitrary `value`/children per item — the component itself
contains **zero** hardcoded range-label strings. The 1D/1W/1M set below is a *consumer* example,
not a default baked into the component:

### Correct usage

```tsx
// This phase's time-scale toggle (Figma node 203-11938) — consumer supplies the labels
<ToggleGroup type="single" defaultValue="1d">
  <ToggleGroupItem value="1d">1D</ToggleGroupItem>
  <ToggleGroupItem value="1w">1W</ToggleGroupItem>
  <ToggleGroupItem value="1m">1M</ToggleGroupItem>
</ToggleGroup>

// Phase 7's caregiver trend graph — same primitive, a completely different labeled set
// (REQUIREMENTS.md CARE-04) — this is exactly why the range semantics must never live
// inside the component itself.
<ToggleGroup type="single" defaultValue="6h">
  <ToggleGroupItem value="1h">1h</ToggleGroupItem>
  <ToggleGroupItem value="6h">6h</ToggleGroupItem>
  <ToggleGroupItem value="24h">24h</ToggleGroupItem>
</ToggleGroup>
```

### Incorrect usage

```tsx
// ✗ Do not bake range semantics into the component itself (e.g. a hardcoded
// TimeScaleToggle wrapper with a fixed 1D/1W/1M union prop) — that would block
// Phase 7's reuse with a different labeled set on the exact same primitive.
function TimeScaleToggle({ value }: { value: "1D" | "1W" | "1M" }) {
  return (
    <ToggleGroup type="single" defaultValue={value}>
      <ToggleGroupItem value="1D">1D</ToggleGroupItem>
      <ToggleGroupItem value="1W">1W</ToggleGroupItem>
      <ToggleGroupItem value="1M">1M</ToggleGroupItem>
    </ToggleGroup>
  )
}
```

## Overflow / long-text (backstop)

Segmented-control labels are expected to stay short (`1D`/`1h`/single words) — no long-text
overflow handling was added, since no consumer usage in this phase's scope requires it. Not
independently re-verified by this plan's own automated checks.
