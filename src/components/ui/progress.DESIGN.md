# Progress

Progress is a Radix-backed progress bar with a 6px track and full rounding. Supply an accessible name and a numeric label where needed. `value` clamps to 0–max; invalid values resolve to zero and invalid max values to 100. Radix exposes the resolved range and value to assistive technology.

`tone` defaults to safe; safe, caution, critical, and neutral choose semantic track/fill colors. Tone does not compute status. BatteryIndicator derives device state and supplies this prop. Transform transitions are disabled with reduced motion.

The label is outside this primitive. Use BatteryIndicator to keep the percentage unbroken while the bar adjusts to the remaining width. Live examples are in `/design-system/docs/progress`.

## Figma provenance

Verified against Figma node `203-11669`.
