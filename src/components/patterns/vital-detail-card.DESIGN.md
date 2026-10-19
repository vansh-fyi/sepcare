# Vital detail card

An explicit `value` and optional `unit` also render in summary mode, without a chart. Omit `value` for a text-only summary. Unavailable always suppresses the value. The same header and typography serve summaries and trends; this stateless composition is usable from server and client components.

## Consistent example scenarios

The Safe / Caution / Critical preview control applies across Home, Vitals, Stats, and Settings without resetting navigation. Fixtures in src/lib/examples/clinical-scenarios.ts supply per-vital states: safe detail rows and Stats graphs are all green, while Home VitalCards retain their three distinct metric gradients; caution uses yellow thermoregulation and cardiac autonomic, critical activity, and three safe vitals; critical marks every vital critical, using pink fills on Home. Stats graphs, icons, and values use the same per-vital states as Vitals. Infant headings and descriptions follow the overall scenario. These are illustrative combinations, not rules for computing infant risk.

Device fixtures retain 90%, 40%, and 15% for device-detail examples. Device identity, battery, and connection labels are omitted from the app header. Clinical state never computes battery or connectivity in shared components.

VitalDetailCard accepts optional status (safe/caution/critical), which controls the icon, value, and graph lines together. Explicit status overrides legacy critical. If neither is supplied, the header defaults green and series retain supplied colors. VitalCard retains each metric gradient for safe or omitted status. Caution uses yellow and critical filled VitalCards use pink. Safe VitalCards use white foregrounds on their metric gradients. Caution uses yellow-600 fill and critical uses pink-300 fill; both use --color-vital-alert-text for dark-neutral labels, icons, sparklines, and values. Activity text uses the same font-heading text-2xl font-bold as numeric readings.

VitalDetailCard also accepts status="unavailable" for signals without device/backend support. It keeps the metric glyph on a neutral-100 tile with muted text, always displays ‘Not yet available — awaiting device support.’, and suppresses numeric values, calendar range, and charts even when supplied. This is not a loading or network-error state. ClinicalStatus remains the three clinical tones. The chart documentation preview includes this explicit option.

Missing risk assessments and null computed ratios use `unscored`, never Safe. VitalDetailCard preserves raw values and charts with neutral text/lines and visible “Not yet assessed.” copy; `unavailable` remains reserved for unsupported signals and suppresses measurements. RiskTimeline accepts `unscored` to retain unassessed history with a neutral icon and label.


## Summary header badges

Without chart configuration, VitalDetailCard places a shared text-only Badge (showIcon={false}) at the far right of the header, beside the title and above any explicit value. Safe shows Stable, caution shows Caution, and critical shows Critical. Unscored and Unavailable use neutral badges; they never show Stable. Labels and colors follow the existing resolved status, including explicit status overriding legacy critical. Metric titles and supporting text wrap in the remaining space. Chart cards keep the established numeric-value header without a badge. Badge owns its borderless rounded rectangle and semantic fills.


## Shared surface depth

The Card primitive supplies --gradient-surface and safe metric tiles use --gradient-signifier-safe with white glyphs; other metric tiles use --gradient-status-sheen. Clinical tone affects the tile and data, while the card remains an almost-white surface. The chart plotting area is transparent, allowing the Card gradient to continue beneath the chart without a separate inset surface.

## Connection and safe signifiers

DeviceCard and DeviceDetails share DeviceConnectionLabel: an sm non-emoji PulseWave beside Connected, or a static neutral pulse beside Disconnected. Connectivity is independent of battery and infant risk. Healthy device tiles and safe VitalDetailCard icon tiles (Vitals and Stats) use --gradient-signifier-safe with --color-signifier-safe-fill and white --color-signifier-safe-on-fill. The gradient runs from a green-700/800 blend through green-800 to green-900. Chart lines and values keep their existing semantic colors. Clinical badges use lighter 100–200 tonal gradients with dark text, retaining their borderless 8px radius and independent showIcon option; Vitals badges remain text-only. Other tile states retain their established caution, critical, and neutral treatments.
