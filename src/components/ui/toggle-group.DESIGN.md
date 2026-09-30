# Toggle group

ToggleGroup and ToggleGroupItem are shared by component documentation, preview controls, and clinical time-range selection. The default selected treatment is solid dark neutral with inverse text, using `--color-toggle-active`. The coral variant has been removed. The group surface is white (`--color-toggle-surface`); inactive options hover at neutral-100 (`--color-toggle-hover`). Selected options retain their dark fill on hover. Inactive text uses the toggle text role. `outline` and `brand` are explicit alternatives.

Supply arbitrary labels and values. Keep the current controlled value when a required single selection emits an empty value. Radix owns keyboard focus and selection semantics.

`fit="content"` uses intrinsic item widths. `fit="equal"` fills its parent with equal-width items; pair it with `size="sm"` for the seven time ranges on a phone. `spacing` is measured in quarter-rem increments. Group variant and size apply to all items.

Do not restyle selected states inside example pages. Change the shared variants and update the live documentation together.

## Figma provenance

No dedicated Figma frame found for node `203-11938`'s per-value extraction; token-consistent with prior Figma-verified components.
