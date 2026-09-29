# Device tile row

DeviceTileRow composes ContentTileRow and the shared wearable Icon. DeviceCard and DeviceHeader both consume it. The square follows adjacent content height; color reflects device state independently of infant health.

`connected` defaults to true; `battery` is optional. Provisional presentation thresholds in `src/lib/device-state.ts`: above 50% healthy, 21–50% medium, 0–20% low. Disconnected takes precedence. Missing or nonfinite battery does not assert low battery: a connected device stays green and DeviceCard omits invalid numeric readings.

Each state has surface/icon aliases in globals.css: healthy green-100/green-800, medium yellow-100/yellow-800, low pink-100/pink-800, disconnected neutral-200/neutral-800. The card preview offers all four states and updates the copyable code with its selected inputs.
