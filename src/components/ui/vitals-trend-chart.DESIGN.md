# VitalsTrendChart

The shared chart renderer accepts data, xKey, series, height (default 240), and timeAxis (default false). VitalDetailCard composes it with Card and Icon; the chart documentation renders that same card used by Stats. Card charts default to 180px height. Empty data preserves the configured height.

With timeAxis enabled, supply numeric epoch-millisecond timestamps. Every supplied reading contributes to the line, using straight segments rather than smoothing. Time labels use 30-minute steps at adequate widths and uniform larger steps when needed. Steps align to local clock boundaries. Omit the range-start label (08:30 is the first half-hour tick after 08:00). Gridlines synchronize with visible ticks on both axes, without extra boundary lines. Y axes size to their labels instead of reserving a fixed 60px gutter. Tooltips show the selected reading's time and value. Use showDots false for dense series; tooltip interaction remains available.

Each series supplies key, label, and a semantic color reference, with optional domain, yAxisId, and showDots. A right axis appears only when requested; multiple series show a legend. Reduced-motion preferences disable line entrance animation.

Planning D-46 requires retaining original readings and timestamps. It does not set a firmware cadence. The shared illustrative fixture uses variable 1–3-minute intervals based on the user's clarification. It represents periodic summaries, not raw sensor waveforms. Sample generation belongs outside the component.

Chart cards show the time range beneath the metric title, with a calendar icon, and the latest numeric value at the right instead of a status badge. The value and metric icon are green by default; critical mode colors the value, icon, and chart lines red. Optional `value`, `unit`, and `rangeLabel` props customize the header. The plot fills the available card content width, reserving only the space needed for axis labels.

## Consistent example scenarios

The Safe / Caution / Critical preview control applies across Home, Vitals, Stats, and Settings without resetting navigation. Fixtures in src/lib/examples/clinical-scenarios.ts supply per-vital states: safe detail rows and Stats graphs are all green, while Home VitalCards retain their three distinct metric gradients; caution uses yellow thermoregulation and cardiac autonomic, red activity, and three green vitals; critical is all red. Stats graphs, icons, and values use the same per-vital states as Vitals. Infant headings and descriptions follow the overall scenario. These are illustrative combinations, not rules for computing infant risk.

Device fixtures use 90%, 40%, and 15% respectively; caution displays Slow internet. DeviceHeader.slowInternet is an independent boolean, defaults false, and disconnected takes precedence. Device battery stays consistent across header and device cards. Clinical state never computes battery or connectivity in shared components.

VitalDetailCard accepts optional status (safe/caution/critical), which controls the icon, value, and graph lines together. Explicit status overrides legacy critical. If neither is supplied, the header defaults green and series retain supplied colors. VitalCard retains each metric gradient for safe or omitted status. Caution uses yellow and critical uses red. Filled VitalCards always use white labels, icons, sparklines, and values. Activity text uses the same font-heading text-2xl font-bold as numeric readings.

## Figma provenance

Verified against Figma node `203-13216` ("Perfusion Index" analytics chart card).
