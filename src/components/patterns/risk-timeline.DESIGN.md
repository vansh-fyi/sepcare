# RiskTimeline

Composes ItemGroup, Item, ItemMedia, Icon, ItemContent, ItemTitle, and ItemDescription. Every row carries a clinical icon, color, status word, and semantic time element. Content can wrap at phone widths.

`entries: RiskTimelineEntry[]` contains epoch-millisecond timestamps and already mapped ClinicalStatus values. The component preserves supplied order. `getRiskHistory` owns newest-first ordering and keeps the last original reading per local calendar hour without mutating input. Callers bridge backend risk colors before rendering. This digest never replaces original chart readings.

Today uses a local 12-hour clock; older rows also show the short month and day. Empty data shows exactly “No status changes recorded yet.” and no list. Fixture render errors belong to the containing route error boundary with retry.

Live docs: `/design-system/docs/risk-timeline`.

Missing risk assessments and null computed ratios use `unscored`, never Safe. VitalDetailCard preserves raw values and charts with neutral text/lines and visible “Not yet assessed.” copy; `unavailable` remains reserved for unsupported signals and suppresses measurements. RiskTimeline accepts `unscored` to retain unassessed history with a neutral icon and label.
