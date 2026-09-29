<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# shadcn/ui and cn are also newer than your training data

This project's design system (Phase 6) uses the shadcn/ui CLI, both of which have changed meaningfully since typical training cutoffs — do not pattern-match to older versions or adjacent tools.

The `shadcn` CLI's defaults and flags shift across versions — this project discovered mid-session that CLI 4.21.0 no longer defaults to a Radix base, it now defaults to Base UI, so `-b radix` must be passed explicitly on every `add`/`init` invocation; before running any `shadcn` CLI command, or writing code against a shadcn-generated component, check the current docs at ui.shadcn.com and/or the installed CLI's own `--help` output rather than assuming past behavior.

Before writing code against any dependency installed or upgraded recently in this project (check `package.json`'s git history if unsure), verify current usage against the package's own shipped types/docs/README rather than relying on potentially-stale training data — the same principle the Next.js block above establishes, generalized to this project's newly-adopted packages.

# Design system: required implementation and maintenance rules

These rules capture the user's design decisions and corrections from this session. Apply them to product screens, examples, component documentation, and future design changes. Read `docs/DESIGN-SYSTEM.md` and the relevant component's `*.DESIGN.md` before changing its design. A later explicit user instruction can revise these decisions; update the shared implementation and its documentation together when that happens.

## Core contract: change the system, then consume it

**A screenshot or design correction is a request to improve the shared design system and its consumers.** Do not reproduce the requested appearance only in an example or route. Examples must demonstrate what the system actually produces.

- Start with the existing tokens, component API, shared compositions, and all relevant consumers. Follow imports to the implementation; matching component names alone do not establish visual consistency.
- Fix a shared component when the correction concerns its padding, colors, shadows, radius, icon weight, selected state, or behavior. Fix a shared composition when it concerns a recurring arrangement of components.
- Page code supplies content, data, application state, and page layout. It must not duplicate component internals or override their visual contract to make one screenshot look right.
- Layout classes for placement, grids, width, or spacing between components are appropriate in consumers. Repeated internal geometry or visual treatments belong in a shared component or pattern.
- Add an independent option when a genuine independent choice is needed. Do not multiply named variants for every combination of color, icon, shape, and use case.
- Migrate affected consumers in the same change. Leaving docs on the old treatment while examples use the new treatment is incomplete work.
- If code, a source note, and the latest user decision disagree, reconcile the implementation and documentation with the latest decision. Do not preserve an abandoned experiment as a design requirement.

## Sources and ownership

| Concern | Source / implementation |
| --- | --- |
| Overall design contract | `docs/DESIGN-SYSTEM.md` |
| Palette, semantic roles, typography, radii, shadows, motion | `src/app/globals.css` |
| Shared controls | `src/components/ui/` |
| Shared icon rendering and glyphs | `src/components/icon.tsx` |
| Clinical compositions | `src/components/patterns/clinical-cards.tsx`, `src/components/patterns/vital-detail-card.tsx` |
| Class merging | `src/lib/utils.ts` |
| Shared documentation presentation | `src/components/docs/` and `src/components/docs/docs.css` |
| Documentation navigation and search entries | `src/app/design-system/docs/_lib/categories.ts` |
| Component descriptions, usage, API, token references | `src/app/design-system/docs/_lib/component-content.ts` |
| Live component examples | `src/app/design-system/docs/_lib/component-examples.tsx`, `button-examples.tsx` |
| Token extraction and grouping | `src/app/design-system/docs/_lib/tokens.ts` |
| Screen-preview presentation | `src/components/docs/example-browser.tsx` |
| Individual example articles | `src/app/design-system/docs/examples/` |
| Illustrative chart data | `src/lib/examples/vital-readings.ts` |
| Current visual references | Current shared implementation, live examples, and newly supplied user images |

`archive/` and `References/` contain obsolete early iterations and are ignored by Git. Do not use them as design references or implementation guidance. Follow the current shared design system, its documentation, live examples, and latest user decisions.

The typography and palette are direct user choices. Preserve Inter, Plus Jakarta Sans, and the chosen color ramps unless the user explicitly changes them. References guide hierarchy, spacing, surface treatment, and composition; they do not authorize substituting another palette or generic starter styles.

## Required workflow for a new screen or design update

1. **Inspect the request and references.** Open supplied images. Identify the changed visual rules, content, interaction, and responsive behavior. Review the relevant planning decisions when timing, data, or product behavior matters; distinguish confirmed requirements from research suggestions.
2. **Map the change to its owner.** Locate the tokens, primitive, composition, docs entry, example, and other consumers. Decide whether to amend an existing API or introduce a reusable pattern.
3. **Implement the shared rule first.** Add semantic aliases when a component needs its own color roles. Keep primitive palette values intact. Build recurring compositions from existing controls such as Card, Badge, Icon, Button, and the chart renderer.
4. **Update consumers.** Product screens and examples import those shared implementations. Remove obsolete local styling, duplicated markup, or redundant variants rather than layering a second implementation over them.
5. **Update documentation in the same change.** Revise the live preview, generated example code, usage snippet, prop/default descriptions, token list, and relevant source design notes. Update `docs/DESIGN-SYSTEM.md` when a system rule changes. Add navigation/search entries for new documented surfaces.
6. **Review parity.** Check that defaults and explicitly selected variants agree between docs and consumers; compare the complete composition, not just the underlying primitive. Check the intended phone, tablet, and desktop behavior when visual verification is available and authorized. Follow session instructions about running tests; do not claim verification that was not performed.
7. **Report accurately.** State what shared rule changed, which consumers were migrated, what was actually checked, and any remaining limitation. Source inspection, formatting, compilation, automated tests, and rendered browser comparison are different kinds of evidence.

Do not require a separate approval step for routine shared-component fixes already authorized by the user's design request. Ask only when a material ambiguity cannot be resolved from the references and recorded decisions.

## Tokens, surfaces, and CSS

- Use semantic roles rather than scattered raw color values. Component roles should alias the existing semantic palette so changing a button or toggle does not require changing the base brand colors.
- Buttons use `--color-button-{tone}-{role}`. Toggle roles include `--color-toggle-surface`, `--color-toggle-text`, `--color-toggle-active-text`, and `--color-toggle-active`. Document added roles in the token catalog.
- Preserve `@theme static` so tokens needed by runtime charts and swatches are emitted. Keep global resets in `@layer base` and documentation styles in `@layer components`. An unlayered padding reset previously defeated button utility classes; do not reintroduce it.
- Use the shared `cn` helper from `src/lib/utils.ts` (`clsx` plus configured `tailwind-merge`). Register new custom text-size or shadow utility names where necessary. A text-color override must not remove the text-size class.
- Primary and icon buttons have no default shadow. Secondary buttons use a 1px stroke through their tone-specific border role. Inactive navigation retains `--shadow-control`. Do not stack a border, ring, and shadow indiscriminately.
- Clinical surfaces use white cards on a soft canvas, the established card radii, restrained shadows, and purposeful clinical gradients. Use Card and the shared patterns rather than recreating their surfaces inside a page.

## Button contract

- Exactly three emphasis variants: `primary` (filled), `secondary` (surface defined by a border stroke), and `tertiary` (transparent).
- `tone` is independent: `brand`, `coral`, `critical`, or `neutral`. Neutral is the default tone, with neutral-800 fill. Connection and save actions use neutral; emergency actions retain critical. They are not separate variants.
- `size` is independent: `sm`, `default`, `lg` (36, 44, 48px heights). Text buttons retain horizontal padding of 14, 20, and 24px respectively.
- `radius` is independent: `sm`, `default`, `lg`, `full` (10, 14, 16px, fully rounded). A pill is a radius choice, not another variant.
- Text is optional. Pass icons through `icon`, with `iconPosition="start"` or `"end"`. Icon without text automatically becomes square at the chosen size and requires an accessible name.
- “Icon filled” means primary with an icon and no text. “Icon outline” is the secondary icon-only treatment, defined by a border stroke. Icon buttons have no default shadow.
- `colors` injects semantic CSS values for `fill`, `fillHover`, `fillActive`, `onFill`, `surface`, `surfaceHover`, `text`, and `border`. The border role defines the secondary button stroke.
- Loading preserves dimensions and disables the native button. For `asChild`, place icon/text inside the child; do not document native-button-only icon/spinner behavior as supported on slotted links.

## Navigation and icons

- Current decision: every clinical navigation item has equal width and a 56px button height, with an icon above an always-visible label. Selection changes appearance, not dimensions. The earlier expanding-active-item / hugging-inactive-items experiment was rejected.
- Selected navigation uses a solid dark neutral fill and matching indicator. Keep the indicator below the active tab. Inactive items use the shared control shadow. Keep an 8px gap and accessible destination names/current-page state.
- Vitals uses `heart`; Stats uses `monitoring`. Home and Settings retain their corresponding icons.
- Use the shared Icon component. Outline stroke weight comes from `--icon-stroke-width` (currently 2.25 at a 24px viewBox). Do not adjust the entire icon family with isolated per-screen overrides. Add missing glyphs to the shared icon system.
- Preview navigation updates the contained example through its controlled handler; it must not send readers to missing product routes or out of the docs shell.

## Toggle groups

- Use the shared ToggleGroup and ToggleGroupItem in both documentation controls and screens. The group background is white, inactive options hover at neutral-100, and the default selected treatment is dark neutral with inverse text. The coral selection variant has been removed.
- Use the same neutral default in documentation and screen consumers. Usage snippets must reproduce the actual preview.
- `outline` and `brand` are explicit alternatives, not silent substitutions for the default. Labels and values are supplied by consumers.
- `fit="content"` uses content widths; `fit="equal"` gives equal widths within the available space. Use equal fit and small size for the seven-option time-scale row on a phone. Do not wrap its final option onto a second row accidentally.
- `spacing` is in quarter-rem increments. Preserve Radix keyboard and selection behavior. For a required single selection, retain the current value when the callback emits an empty string.

## Clinical cards, charts, and data

- Use StatusCard, DeviceCard, VitalCard, InstructionCard, and VitalDetailCard for their established roles. A locally styled status span is not a replacement for the shared Badge.
- Vitals shows six summaries: Thermoregulation, Cardiac Autonomic, Perfusion Index, HR / Temp Ratio, Respiratory Pattern, and Activity Level. Stats shows these categories as trend cards with a time-scale selector.
- VitalDetailCard composes Card, Icon, and VitalsTrendChart. Both the chart documentation's primary preview and Stats must render that same composition. A separate hand-built chart heading in the docs would conceal what the screen actually uses.
- Reusable components accept data; illustrative data belongs outside them. Label examples as sample data. Status descriptions must agree with their headings: “High Suspicion” must not be paired with “Baby is healthy.”
- VitalsTrendChart accepts `data`, `xKey`, `series`, `height`, and `timeAxis`. VitalDetailCard accepts these through `chart`; omitting `chart` renders a summary. An empty array preserves chart height and shows the empty state.
- For `timeAxis`, provide numeric Unix epoch-millisecond timestamps. Plot every reading at its actual timestamp with linear segments so short-lived changes remain visible. Do not smooth or replace the data with 30-minute aggregates.
- Reading cadence and axis-label cadence are independent. Time labels use uniform 30-minute intervals, switching to a consistent larger interval when width requires it. Omit the range-start label and align gridlines with visible ticks; retain every reading. Tooltips retain the individual reading timestamp and value. Dense series can use `showDots: false` without losing interaction.
- Dummy readings currently use variable 1–3-minute spacing based on the user's clarification. This is not a confirmed firmware interval: `.planning/milestones/v1.0-phases/03-offline-buffered-batch-sync/03-CONTEXT.md` D-28 says “every few minutes.” Phase 4 `04-CONTEXT.md` D-46 requires every original reading in chronological order. The 5-minute suggestion in hardware notes is a battery-design starting point, not a locked contract.
- These are periodic computed vitals, not raw ECG/PPG waveforms. Do not invent dozens of measurements within a two-minute interval to create a denser-looking line.
- Series colors reference semantic tokens. Only render a right axis for a series that requests it; retain reduced-motion behavior and the shared tooltip/legend implementation.

## Documentation and screen examples

- Component pages use the shared DocPage, DocSection, Preview, CodeBlock, and PropsTable. Start with what the component does, then show a working preview, usage, relevant variations, API, and tokens.
- Preview controls must update both the rendered state and its copyable code. Keep documented defaults, exported props, and actual component behavior aligned. Explain primitive versus composition APIs explicitly.
- Keep rendered copy concise and specific. Do not surface planning phase numbers, agent notes, extraction history, or unsupported claims of Figma/pixel verification in product documentation.
- The top header and left/right navigation remain stationary; the middle article scrolls. Sidebars may scroll internally when necessary to keep links reachable.
- Screen examples stay inside the documentation shell. Each gets an individual left-nav entry, its own route under `src/app/design-system/docs/examples/`, its actual title (e.g. “Clinical dashboard”), and a short description. Do not group them under a generic “Screen previews” entry or add a second example selector above the preview.
- Hide the right page outline for screen examples so the article can use the width. Place Phone / Tablet / Desktop controls beside the article title.
- ExampleBrowser owns real iframe viewports of 390 / 768 / 1280px with a fixed 720px height. Scale the whole preview uniformly to fit the available stage width and height. Do not make the user scroll the article merely to find the bottom of an oversized preview, or change the iframe's logical width instead of exercising the responsive layout.
- Preserve internal screen state during viewport changes. Clinical content scrolls between the contained screen header and navigation. Tablet/desktop compositions should respond to the actual viewport, not just enlarge a phone screenshot.
- Safe / Caution / Critical controls and sample-data labels belong outside the product preview. Status messages between the parent and iframe must check both origin and source; status changes should not reload the screen.

## Common failure patterns to prevent

- Fixing a screenshot with page-local button padding, colors, shadows, or icon strokes.
- Documenting one selected treatment while shipping a different default.
- Showing the same chart primitive inside two different, undocumented card implementations.
- Leaving stale API tables, code snippets, token references, or design notes after simplifying variants.
- Hardcoding sample readings inside reusable chart components.
- Reverting equal navigation sizing to the rejected expanding selection behavior.
- Moving example controls into the product screen or navigating outside the docs to view an example.
- Claiming a rendered visual match based only on source inspection or formatting.

Chart cards show the time range beneath the metric title, with a calendar icon, and the latest numeric value at the right instead of a status badge. The value and metric icon are green by default; critical mode colors the value, icon, and chart lines red. Optional `value`, `unit`, and `rangeLabel` props customize the header. The plot fills the available card content width, reserving only the space needed for axis labels.

## Content-sized icon tiles and wordmark

StatusCard, DeviceCard, InstructionCard, and DeviceHeader use ContentTileRow. The leading tile is always square and both dimensions match the adjacent content height; no fixed minimum tile height forces a short card taller. Glyphs and resting motion scale inside the tile. DeviceCard and DeviceHeader share device-state tiles: healthy uses green-100 and a darker green glyph, medium uses yellow, low battery uses red, and disconnected uses neutral. The shared Wordmark renders SepCare with the same Plus Jakarta Sans typography in docs and clinical headers.

## Pulse wave

PulseWave appearance uses an `emoji` boolean, not connection/resting variants. False (default) shows hollow rings with a small tone-colored center dot; true adds a stationary tone-specific face. The dot is smaller than the face; there is no children override. Independent sizes are sm 16px, md 32px (default), lg 52px, and xl 80px. Safe is happy, caution straight-mouth, critical unhappy/squinting, and neutral sleeping. Tone controls color and rhythm: safe 6s smooth, caution 2.5s brisk, critical 1.2s faster, neutral static. `active={false}` and reduced motion disable animation. Keep docs, copyable examples, and status/device consumers on this shared API.

## Stacked infant status

The home example uses InfantStatusCard from `src/components/patterns/status-summary-cards.tsx`. It fills the available width and has no adjacent device-activity card or visible section label. Its centered XL PulseWave (80px) sits above the title and description. The title matches DeviceHeader's device name: font-heading, text-xl, font-bold. Clinical state and copy come from the required `infant` prop. The horizontal StatusCard remains available for other compositions. Device connection remains in DeviceHeader.

Live documentation: /design-system/docs/status-summary.

DeviceHeader shows a battery percentage followed by a thin divider and an sm non-emoji PulseWave beside the connection label. Use the same battery value and state thresholds as Settings, with the semantic --color-device-header-battery-* lighter text roles on the dark header. Omit missing/nonfinite battery and its divider; disconnected values are last known and the pulse is static.

Web app headers start with the wordmark and app actions. Do not render a simulated operating-system status bar (time, cellular signal, or phone battery). The wearable battery percentage remains part of DeviceHeader.

## Consistent example scenarios

The Safe / Caution / Critical preview control applies across Home, Vitals, Stats, and Settings without resetting navigation. Fixtures in src/lib/examples/clinical-scenarios.ts supply per-vital states: safe detail rows and Stats graphs are all green, while Home VitalCards retain their three distinct metric gradients; caution uses yellow thermoregulation and cardiac autonomic, red activity, and three green vitals; critical is all red. Stats graphs, icons, and values use the same per-vital states as Vitals. Infant headings and descriptions follow the overall scenario. These are illustrative combinations, not rules for computing infant risk.

Device fixtures use 90%, 40%, and 15% respectively; caution displays Slow internet. DeviceHeader.slowInternet is an independent boolean, defaults false, and disconnected takes precedence. Device battery stays consistent across header and device cards. Clinical state never computes battery or connectivity in shared components.

VitalDetailCard accepts optional status (safe/caution/critical), which controls the icon, value, and graph lines together. Explicit status overrides legacy critical. If neither is supplied, the header defaults green and series retain supplied colors. VitalCard retains each metric gradient for safe or omitted status. Caution uses yellow and critical uses red. Filled VitalCards always use white labels, icons, sparklines, and values. Activity text uses the same font-heading text-2xl font-bold as numeric readings.

InfantStatusCard accepts onCallAmbulance. In critical state, supplying this handler replaces the description with a shared critical Call ambulance button beneath the title. The Home example uses demo feedback and does not duplicate this button under Instructions.
