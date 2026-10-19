# Toggle group

ToggleGroup and ToggleGroupItem are shared by component documentation, preview controls, and clinical time-range selection. The default selected treatment is dark neutral with the shared subtle highlight and inverse text, using `--color-toggle-active`. The coral variant has been removed. The group surface uses the lightest neutral, neutral-100 (`--color-toggle-surface`), with a 1px neutral-200 stroke (`--color-toggle-border`); inactive options hover at neutral-200 (`--color-toggle-hover`). Selected options retain their dark fill on hover. Inactive text uses the toggle text role. `outline` and `brand` are explicit alternatives.

Supply arbitrary labels and values. Keep the current controlled value when a required single selection emits an empty value. Radix owns keyboard focus and selection semantics.

`fit="content"` uses intrinsic item widths. `fit="equal"` fills its parent with equal-width items; pair it with `size="sm"` for the seven time ranges on a phone. `spacing` is measured in quarter-rem increments. Group variant and size apply to all items.

Do not restyle selected states inside example pages. Change the shared variants and update the live documentation together.

## Figma provenance

No dedicated Figma frame found for node `203-11938`'s per-value extraction; token-consistent with prior Figma-verified components.


## Shared surface depth

The neutral-100 group surface and selected options use --gradient-control-sheen for restrained depth. Neutral-200 stroke/hover, fit, spacing, and keyboard behavior remain unchanged.
