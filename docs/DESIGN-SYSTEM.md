# SepCare design system

The source of truth is `src/app/globals.css`, the components in `src/components/ui`, and the compositions in `src/components/patterns`. Documentation uses the same components as the app.

## Direction

Use the current shared implementation, live examples, and latest user decisions as the design reference. `archive/` and `References/` contain obsolete early iterations; do not use them as implementation guidance. Documentation uses clear navigation, readable article width, large previews, nearby code, and a compact page outline. Clinical screens use white cards on a soft canvas, 24px card corners, restrained shadows, dark neutral navigation, and distinct vital colors.

Inter and Plus Jakarta Sans, the five color ramps, and the existing clinical gradients are user choices. Changes should improve how they are applied.

## Layers

- Tokens: `globals.css`. Reference semantic roles in components. Keep resets in `@layer base`, so utilities can override them. Emit all tokens with `@theme static` for swatches and runtime chart colors.
- Controls: `src/components/ui`. Button owns padding, focus, size, and loading behavior. NavLink owns its active pill and indicator. Consumers supply content and state.
- Clinical compositions: `src/components/patterns/clinical-cards.tsx`. StatusCard, DeviceCard, VitalCard, and InstructionCard keep card geometry and type consistent across examples and app screens.
- Documentation: `src/components/docs`. DocPage, DocSection, Preview, CodeBlock, and PropsTable own the presentation. Route files supply content and examples.

## Documentation layout

White page, solid header, 216px navigation, a central article up to 760px, and a 176px page outline on wide screens. The shell fills the viewport: the header and both sidebars stay in place while the article scrolls. Sidebars scroll independently when their links exceed the available height. On small screens, navigation opens in a dialog. Keep the article usable at 320px without horizontal page scrolling.

Use Plus Jakarta Sans for titles and Inter for text and controls. Page titles are 32px; section titles are 21px; body copy is 15px with a 1.7 line height. These are documentation roles, separate from clinical metric sizes.

Preview surfaces use the page-canvas token to show white clinical cards and their shadows. Documentation panels use a subtle border. Do not stack a border, ring, and shadow on every container.

## Component rules

Buttons have three variants: primary (filled), secondary (border-defined surface), and tertiary (transparent). Color, size, corner radius, icon, and text are independent choices. An `icon` without text produces a square button; supply an accessible name. Text buttons keep horizontal padding at every size. Button color roles live under `--color-button-{tone}-{role}`, alias the existing palette, and can be overridden through the `colors` prop. Use these component roles to change buttons without changing the base palette. Loading preserves the button's width. Navigation has a label even when only its icon is visible. The active indicator is the width of its pill.

Use the clinical gradients only for their defined role: vital metrics. Connection and save buttons use primary with the default neutral tone (neutral-800). Emergency buttons retain critical. Primary and icon buttons are shadowless; secondary uses a 1px border stroke. Clinical status always includes text and an icon. A metric's color alone does not describe risk.

Use Card for the surface and the shared clinical compositions for recurring content. Do not copy a card's layout into a documentation page. NavBar accepts custom destinations so previews never send readers to missing product routes.

The class merger must know custom text-size and shadow names. A color override must not remove a font size.

Outline icons use `--icon-stroke-width` (2.25 at a 24px viewBox). Adjust this shared token to change their weight throughout the interface. Secondary buttons use their tone-specific border stroke, without a shadow. Inactive navigation retains the soft control shadow. Selected navigation uses a solid neutral-800 fill and matching indicator; the indicator remains visible below the active tab. Navigation items share equal widths and 56px button heights. Each icon sits above a persistent label; selection changes appearance without changing dimensions.

## Writing

Start each component page with what it does and when to use it. Follow with a working example, usage, relevant variations, and the public API. Document a constraint where someone will encounter it.

Keep internal phase numbers, planning decisions, extraction history, and agent notes out of rendered docs. Keep provenance in source notes when useful. Never claim a screenshot was verified when only its source was inspected. Label invented readings as sample data.

## Extending the system

Add a shared token or component when a new role or repeated pattern is needed. Update its docs and example together. Each preview must show the code for the state currently rendered. Copy buttons report success only after the clipboard write succeeds.

## Screen previews

Each example has its own route under `/design-system/docs/examples` and its own left-nav entry. `ExampleBrowser` owns the compact article heading, viewport controls, external home-status controls, and preview stage. Example articles omit the right outline. Real 390px, 768px, and 1280px iframe viewports retain a fixed 720px height and scale uniformly to fit the stage's available width and height. Resizing preserves the screen's internal state. Home-status changes use same-origin messages without reloading the preview. The clinical screen scrolls its content between a stationary header and navigation.

Vitals uses the heart icon and six summary rows. Stats uses the monitoring icon and the same six categories as trend cards, with a selectable time window. `VitalDetailCard` shares the icon tile, heading, description, and optional chart across these views. Tablet and desktop layouts arrange these cards in two and three columns. Data is illustrative. Status descriptions must agree with their headings.

## Shared chart and selection contracts

ToggleGroup has a white surface, neutral-100 hover for inactive options, and a solid dark neutral selected treatment everywhere, including preview controls. VitalDetailCard composes Card, Icon, and VitalsTrendChart; both the chart documentation and Stats render that same composition. Sample readings live in `src/lib/examples/vital-readings.ts`, outside reusable components.

Timestamped charts use epoch milliseconds and preserve every supplied reading with linear segments. Time labels start strictly after the range start and use uniform 30-minute steps, or larger uniform steps on narrow charts. Gridlines align with visible ticks on both axes. Axis-label spacing is independent of reading cadence; every reading is retained. Example readings vary between one and three minutes. Planning specifies periodic summaries and original timestamps, but does not fix the firmware interval.

Chart cards show the time range beneath the metric title, with a calendar icon, and the latest numeric value at the right instead of a status badge. The value and metric icon are green by default; critical mode colors the value, icon, and chart lines red. Optional `value`, `unit`, and `rangeLabel` props customize the header. The plot fills the available card content width, reserving only the space needed for axis labels.

## Motion and animation

Shared motion assets live in `src/components/motion` and are documented under `/design-system/docs/motion`. PulseWave uses an `emoji` boolean (default false) for appearance: true shows a tone-specific face inside hollow rings; false replaces the face with a smaller tone-colored dot and preserves the rings. Size is independent: sm 16px, md 32px (default), lg 52px, xl 80px. Tone determines rhythm independently of appearance: safe is smooth at 6s, caution is brisk at 2.5s, critical is faster at 1.2s, and neutral is static. Reduced motion disables animation. This rhythm is decorative, never a measured heartbeat. StatusCard uses tone-specific shared faces inside hollow rings on a soft tile: happy for safe, straight-mouth for caution, unhappy/squinting for critical. Neutral uses a sleeping face. Emoji mode has no filled circle behind the face; non-emoji mode has a small colored center dot.

DeviceHeader owns the shared Plus Jakarta Sans SepCare wordmark, device identity, shared action buttons, and battery percentage beside the connection label. Header battery text uses lighter green/yellow/red/neutral shades on its dark surface, with the same state thresholds and value as Settings; a thin divider separates the percentage from an sm non-emoji pulse and the connection label. Missing battery also omits the divider. Connection state is independent of baby health. StatusCard, DeviceCard, InstructionCard, and DeviceHeader use ContentTileRow: each leading tile is square, with both dimensions following the adjacent content height. Short text produces a smaller tile, and wrapping or battery content grows it. DeviceCard and DeviceHeader share stateful device tiles (green, yellow, red, disconnected neutral). New Tabler glyphs are imported through the shared Icon component and use the shared stroke token.

Device state thresholds are provisional presentation defaults: above 50% healthy (green-100 tile/dark green icon), 21–50% medium (yellow), and 0–20% low (red). Disconnected overrides battery and uses neutral. Missing battery retains connected green without inventing a percentage. These are device states, independent of baby health. The shared BatteryIndicator reserves one unbroken percentage label and gives remaining width to the bar.

StatusCard titles use 16px type. The shared Wordmark retains 19px in the docs header and uses its 21px large size in DeviceHeader.

## Stacked infant status

The home example uses InfantStatusCard from `src/components/patterns/status-summary-cards.tsx`. It fills the available width and has no adjacent device-activity card or visible section label. Its centered XL PulseWave (80px) sits above the title and description. The title matches DeviceHeader's device name: font-heading, text-xl, font-bold. Clinical state and copy come from the required `infant` prop. The horizontal StatusCard remains available for other compositions. Device connection remains in DeviceHeader.

Live documentation: /design-system/docs/status-summary.

Prototype caregiver and parent screens use `InfantStatusSection`, which composes InfantStatusCard with a Badge below the card so every status has a literal word, icon, and color. Its emergency action displays demo feedback only. It accepts the same required `infant` data; real call behavior remains the lower-level card's handler contract. Containing prototype shells label static sample data explicitly.

Web app headers start with the wordmark and app actions. Do not render a simulated operating-system status bar (time, cellular signal, or phone battery). The wearable battery percentage remains part of DeviceHeader.

## Consistent example scenarios

The Safe / Caution / Critical preview control applies across Home, Vitals, Stats, and Settings without resetting navigation. Fixtures in src/lib/examples/clinical-scenarios.ts supply per-vital states: safe detail rows and Stats graphs are all green, while Home VitalCards retain their three distinct metric gradients; caution uses yellow thermoregulation and cardiac autonomic, red activity, and three green vitals; critical is all red. Stats graphs, icons, and values use the same per-vital states as Vitals. Infant headings and descriptions follow the overall scenario. These are illustrative combinations, not rules for computing infant risk.

Device fixtures use 90%, 40%, and 15% respectively; caution displays Slow internet. DeviceHeader.slowInternet is an independent boolean, defaults false, and disconnected takes precedence. Device battery stays consistent across header and device cards. Clinical state never computes battery or connectivity in shared components.

VitalDetailCard accepts optional status (safe/caution/critical), which controls the icon, value, and graph lines together. Explicit status overrides legacy critical. If neither is supplied, the header defaults green and series retain supplied colors. VitalCard retains each metric gradient for safe or omitted status. Caution uses yellow and critical uses red. Filled VitalCards always use white labels, icons, sparklines, and values. Activity text uses the same font-heading text-2xl font-bold as numeric readings.

InfantStatusCard accepts onCallAmbulance. In critical state, supplying this handler replaces the description with a shared critical Call ambulance button beneath the title. The Home example uses demo feedback and does not duplicate this button under Instructions.
