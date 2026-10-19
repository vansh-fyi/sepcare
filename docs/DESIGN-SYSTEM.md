# SepCare design system

ConnectionStatus is the shared reading-freshness indicator: Live (green connected icon), Last synced Nm ago (muted sync icon), or Reconnecting… (caution syncing icon). It updates its clock every 15 seconds, uses a strict 60-second freshness threshold by default, and clears the timer on unmount. Retry state comes from the caller, never elapsed time. Its API and controlled preview live at /design-system/docs/connection-status.

The source of truth is `src/app/globals.css`, the components in `src/components/ui`, and the compositions in `src/components/patterns`. Documentation uses the same components as the app.

## Page background contract

All application pages, screen-example contents, iframe documents, and component preview canvases use pure white (#ffffff) through --color-page-canvas, which aliases --color-surface. The global body uses this token so examples inheriting the body background are also white. Page and example shells must not substitute --color-bg, neutral fills, or clinical-risk tints for the page background. This applies to Clinical dashboard, Forms, Sensor states, and Empty and loading examples, at every viewport and clinical scenario.

Neutral fills remain component roles: ToggleGroup uses neutral-100, inactive hover uses neutral-200, and neutral badges or icon tiles may use their documented tints. Colored vital cards and status indicators retain their semantic fills. Define component boundaries with the shared strokes and shadows rather than tinting the canvas. New examples must inherit or explicitly consume the white page-canvas token. The outer screen-preview stage is a separate presentation surface: it uses --color-preview-stage (neutral-900) around a black device frame. This does not change the white background inside the iframe.

## Direction

Use the current shared implementation, live examples, and latest user decisions as the design reference. `archive/` and `References/` contain obsolete early iterations; do not use them as implementation guidance. Documentation uses clear navigation, readable article width, large previews, nearby code, and a compact page outline. Clinical screens use a pure white canvas, 24px card corners, restrained shadows, dark neutral navigation, and distinct vital colors.

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

Use saturated metric gradients only for vital metrics; other components use the subtle shared surface and highlight gradients. Connection and save buttons use primary with the default neutral tone (neutral-800). Emergency buttons retain critical. Primary and icon buttons are shadowless; secondary uses a 1px border stroke. Clinical status always includes text and an icon. A metric's color alone does not describe risk.

Use Card for the surface and the shared clinical compositions for recurring content. Do not copy a card's layout into a documentation page. NavBar accepts custom destinations so previews never send readers to missing product routes.

The class merger must know custom text-size and shadow names. A color override must not remove a font size.

Outline icons use `--icon-stroke-width` (2.25 at a 24px viewBox). Adjust this shared token to change their weight throughout the interface. Secondary buttons use their tone-specific border stroke, without a shadow. Inactive navigation retains the soft control shadow. Selected navigation uses a solid neutral-800 fill and matching indicator; the indicator remains visible below the active tab. Navigation items share equal widths and 56px button heights. Each icon sits above a persistent label; selection changes appearance without changing dimensions.

## Writing

Start each component page with what it does and when to use it. Follow with a working example, usage, relevant variations, and the public API. Document a constraint where someone will encounter it.

Keep internal phase numbers, planning decisions, extraction history, and agent notes out of rendered docs. Keep provenance in source notes when useful. Never claim a screenshot was verified when only its source was inspected. Label invented readings as sample data.

## Extending the system

Add a shared token or component when a new role or repeated pattern is needed. Update its docs and example together. Each preview must show the code for the state currently rendered. Copy buttons report success only after the clipboard write succeeds.

## Screen previews

Each example has its own route under `/design-system/docs/examples` and its own left-nav entry. `ExampleBrowser` owns the compact article heading, viewport controls, external home-status controls, and preview stage. Example articles omit the right outline. Real 390px, 768px, and 1280px iframe viewports retain a fixed 720px height and scale uniformly to fit the stage's available width and height. The stage uses neutral-900, the darkest neutral shade. A shared 8px black bezel surrounds the iframe, with an outer radius derived from its 24px screen radius plus the bezel. The entire device frame scales uniformly; fit calculations include the bezel, while iframe viewports remain 390 / 768 / 1280 × 720px. Preview surface roles are --color-preview-stage, --color-preview-device-frame, and --color-preview-device-edge. Resizing preserves the screen's internal state. Vitals and Stats omit redundant visible page titles and device-summary cards. Vitals also omits infant status; Settings shows shared DeviceDetails with identity, connection pulse, battery, freshness, contact, and the disabled connection action until a real handler exists, without a redundant page title; the shared header contains only the wordmark and app actions. Home-status changes use same-origin messages without reloading the preview. The clinical screen scrolls its content between a stationary header and navigation.

Vitals uses the heart icon and six summary rows. Stats uses the monitoring icon and the same six categories as trend cards, with a selectable time window. `VitalDetailCard` shares the icon tile, heading, description, and optional chart across these views. Tablet and desktop layouts arrange these cards in two and three columns. Data is illustrative. Status descriptions must agree with their headings.

## Shared chart and selection contracts

RiskTimeline composes Item rows with a clinical icon, word, color, and local timestamp. It preserves input order; getRiskHistory owns newest-first hourly selection without changing the original chart readings. DeviceSelectList renders supplied DeviceCards as links and never fabricates device peers. DeviceDetails is the single identity, battery, connection freshness, sensor-contact, and neutral connection-action composition used by device screens. Unwired actions are disabled; DeviceDetails accepts an optional onConnectionChange handler. Their live docs are `/design-system/docs/risk-timeline`, `/design-system/docs/device-select-list`, and `/design-system/docs/device-details`.

ToggleGroup has a neutral-100 surface with a neutral-200 stroke, neutral-200 hover for inactive options, and a dark neutral selected treatment with the shared subtle highlight everywhere, including preview controls. VitalDetailCard composes Card, Icon, and VitalsTrendChart; both the chart documentation and Stats render that same composition. Sample readings live in `src/lib/examples/vital-readings.ts`, outside reusable components.

Timestamped charts use epoch milliseconds and preserve every supplied reading with linear segments. Time labels start strictly after the range start and use uniform 30-minute steps, or larger uniform steps on narrow charts. Gridlines align with visible ticks on both axes. Axis-label spacing is independent of reading cadence; every reading is retained. Example readings vary between one and three minutes. Planning specifies periodic summaries and original timestamps, but does not fix the firmware interval.

Chart cards show the time range beneath the metric title, with a calendar icon, and the latest numeric value at the right instead of a status badge. The value and metric icon are green by default; critical mode colors the value, icon, and chart lines red. Optional `value`, `unit`, and `rangeLabel` props customize the header. The plot fills the available card content width, reserving only the space needed for axis labels.

VitalDetailCard also renders an explicit value/unit in summary mode without a chart. VitalsView and StatsView share the original-reading metric mapping: temperature, computed HR/Temp Ratio, and activity are supported; the other three signals use unavailable. A null computed ratio stays missing. Feature abnormal/trending booleans map to safe or critical only when an assessment exists, independently of the aggregate three-tier status.

## Motion and animation

Shared motion assets live in `src/components/motion` and are documented under `/design-system/docs/motion`. PulseWave uses an `emoji` boolean (default false) for appearance: true shows a tone-specific face inside hollow rings; false replaces the face with a smaller tone-colored dot and preserves the rings. Size is independent: sm 16px, md 32px (default), lg 52px, xl 80px. Tone determines rhythm independently of appearance: safe is smooth at 6s, caution is brisk at 2.5s, critical is faster at 1.2s, and neutral is static. Reduced motion disables animation. This rhythm is decorative, never a measured heartbeat. StatusCard uses tone-specific shared faces inside hollow rings on a soft tile: happy for safe, straight-mouth for caution, unhappy/squinting for critical. Neutral uses a sleeping face. Emoji mode has no filled circle behind the face; non-emoji mode has a small colored center dot.

DeviceHeader owns the shared Plus Jakarta Sans SepCare wordmark and supplied app actions on a flat white surface with dark text. It has no device SKU, tile, battery, connection label, pulse, or shadow. Device details remain available through Settings. StatusCard, DeviceCard, and InstructionCard use ContentTileRow: StatusCard uses a stable 64px tile centered beside wrapping text; device and instruction tiles follow content height. New Tabler glyphs use the shared Icon component and stroke token.

Device state thresholds are provisional presentation defaults: above 50% healthy (dark green gradient tile/white icon), 21–50% medium (yellow), and 0–20% low (red). Disconnected overrides battery and uses neutral. Missing battery retains connected green without inventing a percentage. These are device states, independent of baby health. The shared BatteryIndicator reserves one unbroken percentage label and gives remaining width to the bar.

StatusCard titles use 16px type. The shared Wordmark retains 19px in the docs header and uses its 21px large size in DeviceHeader.

## Stacked infant status

The home example uses InfantStatusCard from `src/components/patterns/status-summary-cards.tsx`. It fills the available width and has no adjacent device-activity card or visible section label. Its centered XL PulseWave (80px) sits above the title and description. The title uses the typography system’s page-heading role: font-heading, text-heading-page (24px with 1.3 line height), font-bold. Clinical state and copy come from the required `infant` prop. The horizontal StatusCard remains available for other compositions. The summary has a transparent background with no card surface, border, or shadow. Device connection is available in device details.

Live documentation: /design-system/docs/status-summary.

Prototype caregiver and parent screens use `InfantStatusSection`, which composes InfantStatusCard with a Badge below the card so every status has a literal word, icon, and color. Its emergency action displays demo feedback only. It accepts the same required `infant` data; real call behavior remains the lower-level card's handler contract. Containing prototype shells label static sample data explicitly.

Web app headers start with the wordmark and app actions. Do not render a simulated operating-system status bar (time, cellular signal, or phone battery). Wearable battery and connection details belong in the device-details screen.

## Consistent example scenarios

The Safe / Caution / Critical preview control applies across Home, Vitals, Stats, and Settings without resetting navigation. Fixtures in src/lib/examples/clinical-scenarios.ts supply per-vital states: safe detail rows and Stats graphs are all green, while Home VitalCards retain their three distinct metric gradients; caution uses yellow thermoregulation and cardiac autonomic, critical activity, and three safe vitals; critical marks every vital critical, using pink fills on Home. Stats graphs, icons, and values use the same per-vital states as Vitals. Infant headings and descriptions follow the overall scenario. These are illustrative combinations, not rules for computing infant risk.

Device fixtures retain 90%, 40%, and 15% for device-detail examples. Device identity, battery, and connection labels are omitted from the app header. Clinical state never computes battery or connectivity in shared components.

VitalDetailCard accepts optional status (safe/caution/critical), which controls the icon, value, and graph lines together. Explicit status overrides legacy critical. If neither is supplied, the header defaults green and series retain supplied colors. VitalCard retains each metric gradient for safe or omitted status. Caution uses yellow and critical filled VitalCards use pink. Safe VitalCards use white foregrounds on their metric gradients. Caution uses a yellow-400–600 gradient over its yellow-600 base and critical uses a pink-200–300 gradient over its pink-300 base; both use --color-vital-alert-text for dark-neutral labels, icons, sparklines, and values. Activity text uses the same font-heading text-2xl font-bold as numeric readings.

InfantStatusCard accepts onCallAmbulance. In critical state, supplying this handler replaces the description with a shared critical Call ambulance button beneath the title. The Home example uses demo feedback and does not duplicate this button under Instructions.

VitalDetailCard also accepts status="unavailable" for signals without device/backend support. It keeps the metric glyph on a neutral-100 tile with muted text, always displays ‘Not yet available — awaiting device support.’, and suppresses numeric values, calendar range, and charts even when supplied. This is not a loading or network-error state. ClinicalStatus remains the three clinical tones. The chart documentation preview includes this explicit option.

Missing risk assessments and null computed ratios use `unscored`, never Safe. VitalDetailCard preserves raw values and charts with neutral text/lines and visible “Not yet assessed.” copy; `unavailable` remains reserved for unsupported signals and suppresses measurements. RiskTimeline accepts `unscored` to retain unassessed history with a neutral icon and label.


## Home vitals layout

HomeVitals is the shared bento composition for clinical example, caregiver, and parent Home screens: below 768px, a large Pulse card spans two rows on the left with Temperature and Activity stacked on the right; from 768px, the three cards form one equal-width row. Values appear above optional sparklines; the featured Pulse trend is 88px tall. All readings and units come from consumers. The Card docs demonstrate this same composition. The clinical canvas stays pure white in every scenario; infant risk changes status copy and metric tones, not the page background.


## Definition on white

Card surfaces use a 1px neutral-200 stroke through --color-card-border and a crisp two-layer --shadow-card. Filled vital cards use the translucent --color-vital-card-border and the same elevation. Device-card shadows alias the card shadow. Inactive navigation uses the card stroke with --shadow-control; the navigation bar uses a top stroke and a restrained upward shadow. Keep the app header flat and the infant summary transparent and shadowless. ToggleGroup is a recessed neutral-100 surface with a neutral-200 stroke and hover, with dark neutral selection unchanged.


## Badge geometry and vital summaries

The shared Badge uses --radius-badge (8px), soft semantic fills, and no stroke, ring, or shadow. Badge offers independent icon-plus-text (showIcon={true}, default) and text-only (showIcon={false}) appearances. Both retain explicit status text and semantic color. Vitals summaries always use the text-only appearance. VitalDetailCard summary headers place this component at the far right, with Stable / Caution / Critical matching the resolved clinical state; Unscored / Unavailable use neutral. Any numeric summary value sits beneath the badge. Trend-card headers retain their latest value without a badge. Page code supplies status and data, never local badge markup or visual overrides.


## Caution and critical vital colors

Caution color roles use only yellow-100 through yellow-600. Soft surfaces use yellow-100; filled accents, motion rings, progress fills, and trend colors use yellow-600. Text and meaningful glyphs use the dark-neutral --color-caution-dark role for contrast, including medium-battery icons. Do not reintroduce brown yellow-700/800/900 aliases in caution roles; the primitive ramps remain intact.

VitalCard owns independent --color-vital-caution-fill (yellow-600), --color-vital-critical-fill (pink-300), and --color-vital-alert-text (dark neutral) aliases. Critical vital summaries are pink rather than vivid red. Sparkline uses currentColor so labels, icons, values, and lines share the appropriate foreground. These component roles do not change emergency-button or detailed-chart color contracts.


## Subtle component gradients

Component backgrounds use a consistent lighting direction and semantic gradient roles. --gradient-surface adds a restrained white-to-neutral-100 transition to Card, navigation surfaces, and form fields through --gradient-input-surface. --gradient-control-sheen adds a low-opacity highlight that fades into the base fill to primary/secondary buttons, toggle groups and selected options, progress tracks/fills, and selected navigation. --gradient-status-sheen highlights soft status, instruction, and non-safe metric tiles. Healthy device and safe metric icon tiles use --gradient-signifier-safe with white glyphs. Clinical badges use light --gradient-badge-safe/caution/critical tonal ramps; metadata badges retain the shared sheen. Hover, active, focus, and status colors remain independent underlying roles.

Caution VitalCards use --gradient-vital-caution (yellow-400 through yellow-600); critical uses --gradient-vital-critical (pink-200 through pink-300). Both keep dark-neutral text, icons, values, and sparkline. Safe VitalCards retain their three established metric gradients. Shared strokes and crisp shadows remain for edge definition.

Gradients belong to components, never page-local CSS. The page canvas stays pure white; chart plotting areas remain transparent so the parent card gradient continues beneath the data; the infant summary remains transparent, tertiary buttons remain transparent, and the app header remains white. The documentation preview stage and black device frame keep their dedicated presentation colors. These are static gradients without decorative animation.

## Connection and safe signifiers

DeviceCard and DeviceDetails share DeviceConnectionLabel: an sm non-emoji PulseWave beside Connected, or a static neutral pulse beside Disconnected. Connectivity is independent of battery and infant risk. Healthy device tiles and safe VitalDetailCard icon tiles (Vitals and Stats) use --gradient-signifier-safe with --color-signifier-safe-fill and white --color-signifier-safe-on-fill. The gradient runs from a green-700/800 blend through green-800 to green-900. Chart lines and values keep their existing semantic colors. Clinical badges use lighter 100–200 tonal gradients with dark text, retaining their borderless 8px radius and independent showIcon option; Vitals badges remain text-only. Other tile states retain their established caution, critical, and neutral treatments.

## Frontend and example parity

The existing frontend lives at /caregiver and /parent. ClinicalScreen owns full-viewport layout and stationary header/navigation; ClinicalMetricGrid owns six-card grid spacing. Caregiver NavBar uses static flex placement, matching the contained example, without compensating page-local bottom padding. Parent uses DeviceHeader with only settingsHref="/parent/device" and no Home navigation bar.

HomeOverview composes InfantStatusSection, HomeVitals, the supplied See all action, and state-specific Instructions in both frontend Home routes and the clinical example. All preserve the literal status Badge and demo-only emergency feedback. TrendTimeScale supplies 2/4/6/8/10/12/24-hour choices with a 4H default in StatsView and the example. DeviceDetails is the shared Settings/device-detail composition for caregiver, parent, and the example; do not replace it with a visually separate settings implementation or an unwired preference.

Visual parity does not authorize replacing real-formula fixture mappings with illustrative scenarios. Frontend routes preserve Celsius, measured activity scores, nullable risk, all original timestamps, unsupported signals, and risk history. The clinical example deliberately uses sample values and tone combinations to demonstrate appearances. Parent progressive disclosure, single-device selection, and the static-data notice remain required by the product context.
