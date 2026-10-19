# Trend time scale

TrendTimeScale is a controlled selector shared by StatsView and the clinical-dashboard example. Required value is a string hour count and onValueChange receives a nonempty selection. It composes small, equal-fit shared ToggleGroup items with the title Select Time Scale. Choices are 2H, 4H, 6H, 8H, 10H, 12H, and 24H. Consumers default to 4H and validate values at their data boundary. Empty callbacks preserve required selection.

The seven options stay on one row on phone. Use ToggleGroup directly for unrelated filters. This composition owns selector spacing and option labels, not data sampling or clinical status. StatsView windows original readings relative to its last reading; illustrative examples use their own chart fixtures.
