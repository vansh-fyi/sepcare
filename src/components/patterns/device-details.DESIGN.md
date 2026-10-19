# DeviceDetails

One shared composition for caregiver Settings and parent Device Details. Both route consumers render this component unmodified. Required `device: DeviceProfile` supplies identity, battery, physical connection, last-sync timestamp, and sensor contact independently.

Card contains DeviceTileRow with a wrapping Plus Jakarta Sans text-xl bold heading, BatteryIndicator, ConnectionStatus, a sensor-contact Badge, and a neutral Connect/Disconnect Button. Contact maps safe/caution/critical to Good contact/Check placement/No contact. Disconnected battery is explicitly last known; disconnected freshness cannot say Live even for a recent reading.

Optional `onConnectionChange: () => void` lets route consumers supply demo feedback or a real action. Without a handler, the button is disabled rather than silently doing nothing. No destructive confirmation is involved. The component never mutates fixture state. Errors belong to the containing route boundary and its retry affordance.

Live docs: `/design-system/docs/device-details`.

DeviceConnectionLabel appears below the identifier: Connected with an animated sm non-emoji PulseWave, or Disconnected with a static neutral pulse. Healthy wearable tiles use --gradient-signifier-safe and white glyphs. Sensor-contact badges use light tonal gradients with dark text. Reading freshness remains separate from physical connection.
