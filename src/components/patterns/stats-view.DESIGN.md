# StatsView

Caregiver and parent routes consume this identical component with ascending `ReadingEntry[]`. A neutral small equal-width ToggleGroup selects 1H (default), 6H, or 24H. Empty or unknown callbacks preserve the current required selection; Radix retains keyboard behavior.

The static fixture window ends at the latest supplied original timestamp. This avoids server/client clock drift and stops an unchanged demo snapshot from aging out of its own chart. `getTrendWindow` owns inclusive lower-bound filtering; no readings are sorted, sampled, averaged, or smoothed here. Live wiring must supply refreshed entries.

The six-card grid and status/value mapping match VitalsView through `getVitalMetric`. Only temperature, HR/Temp Ratio, and activity have charts. Original timestamps become flat `{ timestamp, value }` chart rows. Uncomputed null ratios retain their timestamp but omit value, leaving a gap instead of inventing zero or dropping the reading. Chart ratios retain full precision; only the latest header value rounds to one decimal. Empty arrays use the shared chart's fixed-height empty state.

Unsupported signals have neutral unavailable cards with no value or chart. Per-feature abnormal/trending booleans control the value, glyph, and line together, independently of the aggregate status. No illustrative sine-wave chart helper is imported.
