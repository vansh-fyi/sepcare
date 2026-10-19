# StatsView

Caregiver and parent routes consume this identical component with ascending `ReadingEntry[]`. The shared TrendTimeScale selects 2H, 4H (default), 6H, 8H, 10H, 12H, or 24H using neutral small equal-width ToggleGroup items. Empty or unknown callbacks preserve the current required selection; Radix retains keyboard behavior.

The static fixture window ends at the latest supplied original timestamp. This avoids server/client clock drift and stops an unchanged demo snapshot from aging out of its own chart. `getTrendWindow` owns inclusive lower-bound filtering; no readings are sorted, sampled, averaged, or smoothed here. Live wiring must supply refreshed entries.

ClinicalMetricGrid supplies the same six-card geometry as VitalsView and the live example; status/value mapping matches VitalsView through `getVitalMetric`. Only temperature, HR/Temp Ratio, and activity have charts. Original timestamps become flat `{ timestamp, value }` chart rows. Uncomputed null ratios retain their timestamp but omit value, leaving a gap instead of inventing zero or dropping the reading. Chart ratios retain full precision; only the latest header value rounds to one decimal. Empty arrays use the shared chart's fixed-height empty state.

Unsupported signals have neutral unavailable cards with no value or chart. Per-feature abnormal/trending booleans control the value, glyph, and line together, independently of the aggregate status. No illustrative sine-wave chart helper is imported.

Missing risk assessments and null computed ratios use `unscored`, never Safe. VitalDetailCard preserves raw values and charts with neutral text/lines and visible “Not yet assessed.” copy; `unavailable` remains reserved for unsupported signals and suppresses measurements. RiskTimeline accepts `unscored` to retain unassessed history with a neutral icon and label.
