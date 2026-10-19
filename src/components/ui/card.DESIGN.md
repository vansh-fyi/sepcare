# Card

Card supplies a white surface, 24px corners, 16px padding, a 1px semantic stroke, and a crisp two-layer shadow. It does not decide what the content means.

## Composition

Use CardHeader, CardTitle, CardDescription, CardContent, and CardFooter to build a new card. CardAction occupies the header's trailing column. Content and footer do not repeat the card's outer padding.

Reuse the clinical patterns in `src/components/patterns/clinical-cards.tsx`:

| Pattern | Content |
| --- | --- |
| StatusCard | Status icon, title, description, and an optional action. |
| DeviceCard | Device icon, name, identifier, and battery percentage. |
| VitalCard | A metric label, icon, trend or status, and current value. |
| InstructionCard | An icon and a short instruction on its own card surface. |

Status, device, and instruction icon tiles use ContentTileRow. StatusCard supplies a stable 64px square centered beside wrapping text; device and instruction tiles match both dimensions to adjacent content height.

These patterns are used by the documentation and the home example. Change a pattern to update both. Do not copy its layout into a route.

VitalCard uses the metric gradients directly because the whole surface carries the metric color. A critical status switches filled vital surfaces to --color-vital-critical-fill (pink-300); caution uses --color-vital-caution-fill (yellow-600). Both use --color-vital-alert-text for readable dark-neutral content. Metric colors alone are not risk indicators.

## Tokens and source

The surface uses `--color-surface`, `--radius-card`, `--color-card-border`, and `--shadow-card`. Filled vital cards use `--color-vital-card-border` with the same shadow. Device-card elevation aliases the shared card shadow so all cards have consistent definition on white. Device cards use `--shadow-card-device`; their square icon tile uses the shared `--color-device-{healthy|medium|low|disconnected}-{surface|icon}` roles. Safe status uses the soft status-tile alias and shared PulseWave with a Tabler smiling face. Vital surfaces use their named gradients in `globals.css`.

Use the current shared compositions and newly supplied user references; archived screenshots are not implementation guidance.

See `docs/DESIGN-SYSTEM.md` for the shared design rules and `/design-system/docs/card` for working examples.

## Stacked infant status

The home example uses InfantStatusCard from `src/components/patterns/status-summary-cards.tsx`. It fills the available width and has no adjacent device-activity card or visible section label. Its centered XL PulseWave (80px) sits above the title and description. The title uses the typography system’s page-heading role: font-heading, text-heading-page (24px with 1.3 line height), font-bold. Clinical state and copy come from the required `infant` prop. The horizontal StatusCard remains available for other compositions. The summary has a transparent background with no card surface, border, or shadow. Device connection is available in device details.

Live documentation: /design-system/docs/status-summary.

## Figma provenance

Verified against Figma node(s) `266-9387`, `266-9344` (file key `4J2wGl4C6QG4yyeOnldRwl`).


## Shared surface depth

Card uses --gradient-surface over its white base: a restrained white-to-neutral-100 gradient. Existing 1px strokes and crisp shadows remain. The gradient is component-owned and therefore applies to clinical compositions and documentation alike.
