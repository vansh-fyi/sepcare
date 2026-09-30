# Vital detail card

## Consistent example scenarios

The Safe / Caution / Critical preview control applies across Home, Vitals, Stats, and Settings without resetting navigation. Fixtures in src/lib/examples/clinical-scenarios.ts supply per-vital states: safe detail rows and Stats graphs are all green, while Home VitalCards retain their three distinct metric gradients; caution uses yellow thermoregulation and cardiac autonomic, red activity, and three green vitals; critical is all red. Stats graphs, icons, and values use the same per-vital states as Vitals. Infant headings and descriptions follow the overall scenario. These are illustrative combinations, not rules for computing infant risk.

Device fixtures use 90%, 40%, and 15% respectively; caution displays Slow internet. DeviceHeader.slowInternet is an independent boolean, defaults false, and disconnected takes precedence. Device battery stays consistent across header and device cards. Clinical state never computes battery or connectivity in shared components.

VitalDetailCard accepts optional status (safe/caution/critical), which controls the icon, value, and graph lines together. Explicit status overrides legacy critical. If neither is supplied, the header defaults green and series retain supplied colors. VitalCard retains each metric gradient for safe or omitted status. Caution uses yellow and critical uses red. Filled VitalCards always use white labels, icons, sparklines, and values. Activity text uses the same font-heading text-2xl font-bold as numeric readings.

VitalDetailCard also accepts status="unavailable" for signals without device/backend support. It keeps the metric glyph on a neutral-100 tile with muted text, always displays ‘Not yet available — awaiting device support.’, and suppresses numeric values, calendar range, and charts even when supplied. This is not a loading or network-error state. ClinicalStatus remains the three clinical tones. The chart documentation preview includes this explicit option.
