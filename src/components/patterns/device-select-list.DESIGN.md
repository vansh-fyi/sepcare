# DeviceSelectList

`devices: DeviceProfile[]` and `hrefFor: (device) => string` supply data and destinations. Each Item wraps a Next Link and the actual shared DeviceCard; no device-tile or battery geometry is duplicated. Long names use DeviceCard's wrapping treatment in a width-constrained row.

The current application supplies exactly `[DEVICE]`. Never fabricate another live-looking device. The reusable list does not promote the single-device backend model.

Zero devices shows “No devices connected yet.” and a disabled “Pair a device” button. Pairing is not implemented; disabling the unwired affordance honestly communicates this. The zero-device state is not used by current routes. Fixture render failures are handled by the containing route error boundary with retry.

Live docs: `/design-system/docs/device-select-list`.
