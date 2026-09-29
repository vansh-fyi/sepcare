# Clinical card patterns

These patterns connect shared controls to the current clinical compositions. The same exports render in the component documentation and the home example.

StatusCard accepts a status, title, description, and optional action. It owns the icon treatment, row spacing, and 16px status title. Safe status uses a content-sized square soft rounded tile with the shared six-second PulseWave around a stationary Tabler smiling face, with no filled center circle. Caution uses a straight-mouth face and critical an unhappy squinting face inside faster rings (2.5s and 1.2s). All three consume PulseWave with emoji enabled, lg size fitted to the tile, and tone set from status. DeviceCard accepts a name, identifier, battery level, and optional trailing action. It composes BatteryIndicator, with a non-wrapping percentage and flexible Progress bar. `connected` defaults to true; false takes precedence and labels battery as last known. DeviceTileRow shares colors with DeviceHeader.

VitalCard accepts a metric, value, unit, optional trend data, and optional clinical status. The metric selects the existing gradient and icon. Safe retains the metric gradient; caution overrides it with yellow and critical with red. Filled cards keep white foreground content. Keep the numeric value visible; the sparkline is supporting context.

InstructionCard composes Card and Item. The icon sits in a rounded square neutral tile with both dimensions matching the title and description height. ContentTileRow owns this rule across StatusCard, DeviceCard, and InstructionCard. No minimum height forces a short card taller; the glyph scales with the tile. The icon, title, and description share one spacing rule. It can be stacked without a second card wrapper or another layer of padding.

The patterns do not calculate health status or invent clinical advice. Callers supply the clinical copy and readings. Documentation labels its values as sample data.

## Consistent example scenarios

The Safe / Caution / Critical preview control applies across Home, Vitals, Stats, and Settings without resetting navigation. Fixtures in src/lib/examples/clinical-scenarios.ts supply per-vital states: safe detail rows and Stats graphs are all green, while Home VitalCards retain their three distinct metric gradients; caution uses yellow thermoregulation and cardiac autonomic, red activity, and three green vitals; critical is all red. Stats graphs, icons, and values use the same per-vital states as Vitals. Infant headings and descriptions follow the overall scenario. These are illustrative combinations, not rules for computing infant risk.

Device fixtures use 90%, 40%, and 15% respectively; caution displays Slow internet. DeviceHeader.slowInternet is an independent boolean, defaults false, and disconnected takes precedence. Device battery stays consistent across header and device cards. Clinical state never computes battery or connectivity in shared components.

VitalDetailCard accepts optional status (safe/caution/critical), which controls the icon, value, and graph lines together. Explicit status overrides legacy critical. If neither is supplied, the header defaults green and series retain supplied colors. VitalCard retains each metric gradient for safe or omitted status. Caution uses yellow and critical uses red. Filled VitalCards always use white labels, icons, sparklines, and values. Activity text uses the same font-heading text-2xl font-bold as numeric readings.
