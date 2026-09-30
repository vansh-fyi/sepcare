# Infant status section

## Composition

`InfantStatusSection` composes the existing full-width `InfantStatusCard` with a centered Badge below the card. The Badge always pairs a shared icon, semantic tone, and the literal Safe / Caution / Critical word. Its spacing belongs to this shared composition; consumers only place the section.

The required `infant` prop supplies `{ status, title, description }`. The underlying card keeps its XL PulseWave and existing typography. No palette, motion, radius, or component internals are overridden.

## Prototype action

Critical status replaces the description with the card's shared critical Call ambulance button. Clicking it displays `Example only. No call was placed.` in a `role="status"` message. The component never initiates a call. Safe and caution preserve the supplied description.

## Consumers and documentation

Caregiver and parent prototype Home screens share this composition unchanged. It accepts clinical data rather than fetching readings. The containing prototype shell must identify static sample data. The lower-level `InfantStatusCard` remains available for other compositions and applications that supply a real action handler.

Live preview, copyable example, and API distinctions: `/design-system/docs/status-summary`.
