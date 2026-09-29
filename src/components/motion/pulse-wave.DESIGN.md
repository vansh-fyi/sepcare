# Pulse wave

PulseWave is the shared decorative motion asset at `/design-system/docs/motion`. It does not measure a heartbeat or infer health. Pair it with visible status text; the entire subtree is hidden from assistive technology.

- `emoji` defaults to false. True adds a stationary tone-specific shared face; false replaces the face with a smaller tone-colored dot (38% of the wave size). Both modes retain identical rings and dimensions.
- `size` is independent: sm 16px, md 32px (default), lg 52px, xl 80px, from `--spacing-pulse-*`. Emoji visibility never changes dimensions.
- `tone` defaults to safe. Safe uses mood-smile-beam and a smooth 6s pulse; caution uses mood-empty (straight mouth) and brisk 2.5s motion; critical uses mood-sad-squint and faster 1.2s motion; neutral uses the shared moodSleep glyph (closed eyes and a relaxed mouth) and is always still.
- `active` defaults to true. False stops animation. Neutral and reduced motion override active and stop all animation, including opacity.
- `className` supplies placement classes. Center content is owned by the asset; there is no children override.

Only transform and opacity animate. StatusCard uses emoji and lg, fitted inside its content-sized tile; InfantStatusCard uses xl with emoji. Both consume the same rings and rhythm rules. DeviceHeader displays battery text, a divider, then an sm non-emoji pulse beside the connection label. The shared Icon component owns the Tabler glyphs and stroke weight. The preview independently controls size, emoji, tone, and playback and updates copyable code with every choice.
