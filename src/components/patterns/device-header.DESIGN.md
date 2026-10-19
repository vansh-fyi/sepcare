# App header

DeviceHeader renders the shared SepCare wordmark at 21px and accessible shared Button actions: View readings and Device settings. Each action appears only when its optional onReadings/onSettings handler or readingsHref/settingsHref is provided. A supplied href renders a real Next.js Link with the same shared icon-button geometry and semantic colors; handlers support controlled contained previews. If both are supplied, the href remains the navigation destination and the handler receives the click.

The header is flat white with dark text and soft neutral action fills. It has no device tile, SKU, battery, connection label, pulse, border, blur, or shadow. Device identity and connectivity remain in DeviceCard and DeviceDetails. Surface, text, action, and hover colors use --color-device-header-* roles.

The clinical example, caregiver shell, and parent shell use this same composition. Parent supplies only settingsHref="/parent/device", retaining its single device entry point and no persistent Home navigation. Its documentation demonstration updates local feedback instead of navigating outside the docs.
