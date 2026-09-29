# Battery indicator

BatteryIndicator composes Progress with an optional shared battery/charging Icon and a numeric percentage. The label has `shrink-0 whitespace-nowrap`; the bar has `min-w-0 flex-1`. The wrapper defaults to 128px and accepts layout width classes; DeviceCard uses full width. The percentage and percent sign always stay together.

Props: `level` (required number, clamped 0–100), `charging` (default false), `connected` (default true), `showIcon` (default true), and standard div props. `showIcon={false}` supplies the embedded device-card readout. Nonfinite standalone levels normalize to zero; DeviceCard omits nonfinite readings.

Colors use the same device-state thresholds as DeviceTileRow: above 50 green, 21–50 yellow, 0–20 red. These are provisional presentation defaults. Disconnected is neutral and the progress label identifies the percentage as last known. The Progress primitive receives a semantic tone and retains Radix accessibility behavior. A caller-supplied aria-label also labels the progress bar.
