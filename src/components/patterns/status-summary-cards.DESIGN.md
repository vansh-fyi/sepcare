# Status summaries

## Stacked infant status

The home example uses InfantStatusCard from `src/components/patterns/status-summary-cards.tsx`. It fills the available width and has no adjacent device-activity card or visible section label. Its centered XL PulseWave (80px) sits above the title and description. The title matches DeviceHeader's device name: font-heading, text-xl, font-bold. Clinical state and copy come from the required `infant` prop. The horizontal StatusCard remains available for other compositions. Device connection remains in DeviceHeader.

Live documentation: /design-system/docs/status-summary.

InfantStatusCard accepts onCallAmbulance. In critical state, supplying this handler replaces the description with a shared critical Call ambulance button beneath the title. The Home example uses demo feedback and does not duplicate this button under Instructions.
