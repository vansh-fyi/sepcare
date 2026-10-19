# Home vitals

HomeVitals composes three shared VitalCards in a responsive grid: Pulse spans both rows on the left, with Temperature above Activity on the right. Columns use a 1.5:1 ratio and a 12px gap. Both columns can shrink without overflowing; text and units may wrap. Below 768px, Pulse spans two rows in the bento layout. From 768px, all three cards have equal widths and share one row; Pulse no longer spans rows.

The required pulse, temperature, and activity props supply value and optional unit, data, and clinical status. The component owns geometry and the featured Pulse sparkline height (88px). Consumers supply original readings and units; no sample data is embedded here. Home summaries use temperature and activity values without trends, while detailed history remains in Vitals and Stats.

VitalCard places its value above any supplied trend and accepts independent trendHeight (26px default). Safe metric gradients retain white foregrounds. Caution uses yellow-600 and critical uses pink-300; both use dark-neutral foregrounds through shared vital-card roles. Activity without data shows the shared state icon and label.

Consumers: the clinical dashboard example, caregiver Home, parent Home, and the Card documentation's Home vitals preview. Live documentation: /design-system/docs/card.


## Shared surface depth

All three clinical states have gradient fills through VitalCard. Caution spans yellow-400 to yellow-600; critical spans pink-200 to pink-300. Geometry and data remain owned by this composition.
