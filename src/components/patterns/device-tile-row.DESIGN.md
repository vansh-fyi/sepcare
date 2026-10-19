# Device tile row

DeviceTileRow composes ContentTileRow and the shared wearable Icon. DeviceCard consumes it. The square follows adjacent content height; color reflects device state independently of infant health.

`connected` defaults to true; `battery` is optional. Provisional presentation thresholds in `src/lib/device-state.ts`: above 50% healthy, 21–50% medium, 0–20% low. Disconnected takes precedence. Missing or nonfinite battery does not assert low battery: a connected device stays green and DeviceCard omits invalid numeric readings.

Each state has surface/icon aliases in globals.css: healthy dark-green gradient/white, medium yellow-100/dark-neutral, low pink-100/pink-800, disconnected neutral-200/neutral-800. The card preview offers all four states and updates the copyable code with its selected inputs.

## Connection and safe signifiers

DeviceCard and DeviceDetails share DeviceConnectionLabel: an sm non-emoji PulseWave beside Connected, or a static neutral pulse beside Disconnected. Connectivity is independent of battery and infant risk. Healthy device tiles and safe VitalDetailCard icon tiles (Vitals and Stats) use --gradient-signifier-safe with --color-signifier-safe-fill and white --color-signifier-safe-on-fill. The gradient runs from a green-700/800 blend through green-800 to green-900. Chart lines and values keep their existing semantic colors. Clinical badges use lighter 100–200 tonal gradients with dark text, retaining their borderless 8px radius and independent showIcon option; Vitals badges remain text-only. Other tile states retain their established caution, critical, and neutral treatments.
