import type { PropRow } from "@/components/docs/documentation";
export interface ComponentContent {
  title: string;
  description: string;
  usage: string;
  guidance: string;
  props: PropRow[];
  tokens: string[];
}
export const COMPONENT_CONTENT = {
  "status-summary": {
    title: "Infant status",
    description: "A full-width infant-status card with an extra-large face above its heading and description.",
    usage: 'import { InfantStatusCard } from "@/components/patterns/status-summary-cards";\n\n<InfantStatusCard infant={{ status: "safe", title: "Baby is resting safely", description: "Based on the latest available readings." }} />',
    guidance: "Uses Card and an 80px XL PulseWave. The face sits above the text, with the title matching DeviceHeader: Plus Jakarta Sans, text-xl, bold. The card fills its container at every viewport size. Supply clinical status and copy from application data. For prototype caregiver and parent screens, InfantStatusSection adds a Badge with the literal status word below the card and handles demo-only emergency feedback. The section accepts only infant; the card accepts infant and an optional onCallAmbulance handler.",
    props: [
      { name: "infant", type: "{ status: safe | caution | critical; title: string; description: string }", description: "Required infant state and visible clinical copy. Critical replaces the description with Call ambulance when onCallAmbulance is supplied." },
      { name: "onCallAmbulance", type: "() => void", description: "InfantStatusCard only: optional critical action handler. Renders the shared critical button beneath the heading instead of the description. InfantStatusSection provides demo feedback internally and does not accept this prop." },
    ],
    tokens: ["--color-surface", "--radius-card", "--shadow-card", "--color-text-strong", "--color-text-subtle", "--spacing-pulse-xl", "--color-motion-safe", "--color-caution", "--color-critical", "--color-text-muted"],
  },
  motion: {
    title: "Pulse wave",
    description:
      "Status rings with an optional emoji. Tone controls color and rhythm: calm for safe, brisk for caution, fast for critical, and still for neutral.",
    usage:
      'import { PulseWave } from "@/components/motion/pulse-wave";\n\n<PulseWave emoji size="lg" tone="safe" />\n<PulseWave size="sm" tone="safe" />',
    guidance:
      "PulseWave is decorative: pair it with visible status text. Emoji adds a stationary face inside hollow rings; without emoji the same rings surround a smaller tone-colored center dot. Size is independent: sm 16px, md 32px, lg 52px, xl 80px. Faces follow tone: happy for safe, straight-mouth for caution, unhappy/squinting for critical, and a sleeping face for neutral. Safe cycles over 6 seconds, caution over 2.5 seconds with brisk easing, and critical over 1.2 seconds. Neutral is always still. Only transform and opacity animate. Reduced motion stops all animation. StatusCard and InfantStatusCard share this asset; clinical and device states remain independent.",
    props: [
      {
        name: "emoji",
        type: "boolean",
        default: "false",
        description: "Shows the tone-specific face. False replaces the face with a smaller tone-colored dot; rings and size stay unchanged.",
      },
      {
        name: "tone",
        type: "safe | caution | critical | neutral",
        default: "safe",
        description:
          "Controls ring color and rhythm. Safe is slow, caution faster, critical fastest, and neutral static. It does not calculate a health state.",
      },
      {
        name: "active",
        type: "boolean",
        default: "true",
        description:
          "False displays static rings. Neutral and reduced motion always disable animation.",
      },
      {
        name: "size",
        type: "sm | md | lg | xl",
        default: "md",
        description: "16px, 32px, 52px, or 80px. Independent of emoji, tone, and playback.",
      },
      {
        name: "className",
        type: "string",
        description: "Optional placement classes.",
      },
      {
        name: "DeviceHeader.deviceName",
        type: "string",
        description: "Required device name.",
      },
      {
        name: "DeviceHeader.connected",
        type: "boolean",
        default: "true",
        description:
          "Disconnected shows explicit text, a static neutral pulse, and a neutral last-known battery percentage.",
      },
      {
        name: "DeviceHeader.slowInternet",
        type: "boolean",
        default: "false",
        description: "Shows Slow internet with caution motion while connected. Disconnected takes precedence.",
      },
      {
        name: "DeviceHeader.battery",
        type: "number",
        description:
          "Optional battery percentage followed by a divider, small non-emoji pulse, and connection label. Shares Settings battery thresholds with lighter text on the dark header. Missing or nonfinite values and their divider are omitted; disconnected is last known.",
      },
      {
        name: "DeviceHeader.onReadings / onSettings",
        type: "() => void",
        description: "Required handlers for the two named header actions.",
      },
    ],
    tokens: [
      "--spacing-pulse-sm",
      "--spacing-pulse-md",
      "--spacing-pulse-lg",
      "--spacing-pulse-xl",
      "--duration-pulse-safe",
      "--duration-pulse-caution",
      "--duration-pulse-critical",
      "--ease-pulse-alert",
      "--ease-pulse",
      "--color-motion-safe",
      "--color-status-tile",
      "--color-device-header-surface",
      "--color-device-header-battery-healthy",
      "--color-device-header-battery-medium",
      "--color-device-header-battery-low",
      "--color-device-header-battery-disconnected",
      "--color-device-healthy-surface",
      "--color-device-healthy-icon",
      "--color-device-medium-surface",
      "--color-device-medium-icon",
      "--color-device-low-surface",
      "--color-device-low-icon",
      "--color-device-disconnected-surface",
      "--color-device-disconnected-icon",
      "--color-device-header-action",
      "--color-caution",
      "--color-critical",
      "--color-text-muted",
    ],
  },
  button: {
    title: "Button",
    description:
      "Choose primary, secondary, or tertiary for the action’s emphasis. Color, corners, icons, and text are independent choices.",
    usage:
      'import { Button } from "@/components/ui/button"\nimport { Icon } from "@/components/icon"\n\n<Button variant="primary" tone="neutral" icon={<Icon name="signal" />}>\n  Connect device\n</Button>\n\n<Button variant="secondary" icon={<Icon name="back" />} aria-label="Go back" />',
    guidance:
      "An icon without text automatically gets a square button. Use aria-label to name that action. Change tone for a different semantic color set, radius for corner rounding, and colors to supply individual color tokens. A connection or emergency action uses the same primary variant.",
    props: [
      {
        name: "variant",
        type: "primary | secondary | tertiary",
        default: "primary",
        description:
          "Filled, border-defined surface, or transparent treatment. All are shadowless by default.",
      },
      {
        name: "tone",
        type: "brand | coral | critical | neutral",
        default: "neutral",
        description:
          "The button-specific semantic color set. Applies to every variant.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "Optional visible text. Omit it when using only an icon.",
      },
      {
        name: "icon",
        type: "ReactNode",
        description:
          "Optional icon. With no children, the button becomes square automatically.",
      },
      {
        name: "iconPosition",
        type: "start | end",
        default: "start",
        description: "Places the icon before or after the text.",
      },
      {
        name: "radius",
        type: "sm | default | lg | full",
        default: "default",
        description: "10px, 14px, 16px, or fully rounded corners.",
      },
      {
        name: "size",
        type: "sm | default | lg",
        default: "default",
        description:
          "36, 44, or 48px tall. Icon-only buttons use the same width as height.",
      },
      {
        name: "colors",
        type: "ButtonColors",
        description:
          "CSS token references for fill, fillHover, fillActive, onFill, surface, surfaceHover, text, and border.",
      },
      {
        name: "loading",
        type: "boolean",
        default: "false",
        description:
          "Shows a spinner, preserves the content’s space, and disables the button.",
      },
      {
        name: "asChild",
        type: "boolean",
        default: "false",
        description:
          "Styles a child such as Link. Put icon and text inside that child.",
      },
    ],
    tokens: [
      "--color-button-brand-fill",
      "--color-button-brand-on-fill",
      "--color-button-brand-surface",
      "--color-button-brand-text",
      "--color-button-brand-border",
      "--color-button-coral-fill",
      "--color-button-coral-on-fill",
      "--color-button-coral-surface",
      "--color-button-coral-text",
      "--color-button-coral-border",
      "--color-button-critical-fill",
      "--color-button-critical-on-fill",
      "--color-button-critical-surface",
      "--color-button-critical-text",
      "--color-button-critical-border",
      "--color-button-neutral-fill",
      "--color-button-neutral-on-fill",
      "--color-button-neutral-surface",
      "--color-button-neutral-text",
      "--color-button-neutral-border",
    ],
  },
  input: {
    title: "Input",
    description:
      "Collect a short value such as a device ID or caregiver name. Keep the label visible and explain the expected value before an error occurs.",
    usage:
      'import { Input } from "@/components/ui/input"\nimport { Field, FieldLabel } from "@/components/ui/field"\n\n<Field>\n  <FieldLabel htmlFor="device-id">Device ID</FieldLabel>\n  <Input id="device-id" placeholder="e.g. SKU-1234" />\n</Field>',
    guidance:
      "Compose new forms with Field, FieldLabel, and FieldError. Use aria-describedby to associate helper text with the input. Placeholder text supplements a label; it does not replace it.",
    props: [
      {
        name: "type",
        type: "HTML input type",
        default: "text",
        description:
          "Use the type that matches the value, such as email or number.",
      },
      {
        name: "aria-invalid",
        type: "boolean",
        description:
          "Applies the error border. Pair it with a visible error message.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Prevents editing and dims the control.",
      },
      {
        name: "error / errorMessage",
        type: "boolean / string",
        description:
          "Supports existing inline errors. Prefer FieldError in new forms.",
      },
    ],
    tokens: [
      "--radius-input",
      "--color-border",
      "--color-border-focus",
      "--shadow-focus",
      "--text-body",
    ],
  },
  label: {
    title: "Label",
    description:
      "Name a form control. A label stays visible while someone types and focuses its control when selected.",
    usage:
      'import { Label } from "@/components/ui/label"\nimport { Input } from "@/components/ui/input"\n\n<Label htmlFor="caregiver">Caregiver name</Label>\n<Input id="caregiver" autoComplete="name" />',
    guidance:
      "Match htmlFor to the control's id. Use FieldLabel when the control belongs to a Field so spacing and disabled states stay consistent.",
    props: [
      {
        name: "htmlFor",
        type: "string",
        description: "The id of the associated form control.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "A short, specific name for the value being collected.",
      },
    ],
    tokens: ["--text-label", "--color-text", "--color-text-disabled"],
  },
  field: {
    title: "Field",
    description:
      "Keep a control, its label, and its supporting text together. Field provides the structure for inputs, selections, and validation messages.",
    usage:
      'import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"\nimport { Input } from "@/components/ui/input"\n\n<Field>\n  <FieldLabel htmlFor="device">Device ID</FieldLabel>\n  <Input id="device" aria-describedby="device-help" />\n  <FieldDescription id="device-help">\n    Find this on the back of the band.\n  </FieldDescription>\n</Field>',
    guidance:
      "Use FieldSet and FieldLegend for related options. Use horizontal orientation for a switch, checkbox, or radio beside its label. Put a FieldError beneath an invalid control and connect it with aria-describedby.",
    props: [
      {
        name: "orientation",
        type: "vertical | horizontal | responsive",
        default: "vertical",
        description: "How the label and control share the available width.",
      },
      {
        name: "data-invalid",
        type: "boolean",
        description:
          "Marks the field as invalid. Set aria-invalid on the control too.",
      },
      {
        name: "FieldError.errors",
        type: "{ message?: string }[]",
        description:
          "Optional validation errors. Repeated messages are shown once.",
      },
    ],
    tokens: [
      "--text-label",
      "--text-caption",
      "--color-critical-dark",
      "--color-text-muted",
    ],
  },
  select: {
    title: "Select",
    description:
      "Choose one value from a list. Use Select when the options are known and showing every option would take too much space.",
    usage:
      'import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"\n\n<Select defaultValue="parent">\n  <SelectTrigger aria-label="Caregiver role">\n    <SelectValue placeholder="Select a role" />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectItem value="parent">Parent</SelectItem>\n    <SelectItem value="asha">ASHA worker</SelectItem>\n  </SelectContent>\n</Select>',
    guidance:
      "Provide a visible FieldLabel for form selections. The menu supports arrow keys, type-ahead, Enter, and Escape. Use a radio group when someone needs to compare a short list before choosing.",
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "The selected value in controlled or uncontrolled use.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Runs when the selected option changes.",
      },
      {
        name: "SelectTrigger.size",
        type: "default | sm",
        default: "default",
        description: "The trigger height.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Disables the whole select or an individual item.",
      },
    ],
    tokens: [
      "--radius-input",
      "--color-surface",
      "--color-border-focus",
      "--shadow-floating",
    ],
  },
  textarea: {
    title: "Textarea",
    description:
      "Collect a longer note in a resizable field. Give the reader enough room to review what they have written.",
    usage:
      'import { Textarea } from "@/components/ui/textarea"\n\n<Textarea\n  aria-label="Care notes"\n  placeholder="Add an observation…"\n  rows={4}\n/>',
    guidance:
      "Use FieldLabel and FieldDescription when the note needs context. Set rows for the expected length. Keep validation specific, for example a character limit, and preserve the entered text after an error.",
    props: [
      {
        name: "rows",
        type: "number",
        description: "The initial visible number of text rows.",
      },
      {
        name: "maxLength",
        type: "number",
        description: "The maximum allowed number of characters.",
      },
      {
        name: "aria-invalid",
        type: "boolean",
        description: "Applies the error border.",
      },
      { name: "disabled", type: "boolean", description: "Prevents editing." },
    ],
    tokens: [
      "--radius-input",
      "--color-border",
      "--color-border-focus",
      "--text-body",
    ],
  },
  checkbox: {
    title: "Checkbox",
    description:
      "Select an independent option, or several options from a group. The check mark makes the selected state visible without relying on color.",
    usage:
      'import { Checkbox } from "@/components/ui/checkbox"\nimport { Field, FieldLabel } from "@/components/ui/field"\n\n<Field orientation="horizontal">\n  <Checkbox id="reminders" defaultChecked />\n  <FieldLabel htmlFor="reminders">Enable reminders</FieldLabel>\n</Field>',
    guidance:
      "Write the label so a checked box has a clear meaning. Use a radio group for mutually exclusive choices and a switch for a setting that takes effect immediately.",
    props: [
      {
        name: "checked / defaultChecked",
        type: 'boolean | "indeterminate"',
        description:
          "The selected state. Indeterminate represents a partially selected group.",
      },
      {
        name: "onCheckedChange",
        type: '(checked: boolean | "indeterminate") => void',
        description: "Runs when the selection changes.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Prevents the selection from changing.",
      },
    ],
    tokens: ["--color-brand-fill", "--color-border", "--shadow-focus"],
  },
  "radio-group": {
    title: "Radio group",
    description:
      "Choose exactly one option from a small set. Keep the options visible when comparing them is part of the decision.",
    usage:
      'import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"\nimport { Label } from "@/components/ui/label"\n\n<RadioGroup defaultValue="parent" aria-label="Your role">\n  <div className="flex items-center gap-3">\n    <RadioGroupItem value="parent" id="role-parent" />\n    <Label htmlFor="role-parent">Parent</Label>\n  </div>\n</RadioGroup>',
    guidance:
      "Give the group a name with FieldLegend or aria-label, and each option a visible label. Arrow keys move between options. Use Select when a long list would overwhelm the form.",
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "The selected option.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Runs after an option is selected.",
      },
      {
        name: "orientation",
        type: "horizontal | vertical",
        description: "Controls keyboard navigation direction.",
      },
      {
        name: "RadioGroupItem.value",
        type: "string",
        description: "A unique value within the group.",
      },
    ],
    tokens: ["--color-brand-fill", "--color-border", "--shadow-focus"],
  },
  switch: {
    title: "Switch",
    description:
      "Turn a setting on or off. Use a switch when the change takes effect immediately, without a separate Save button.",
    usage:
      'import { Switch } from "@/components/ui/switch"\nimport { Field, FieldLabel } from "@/components/ui/field"\n\n<Field orientation="horizontal">\n  <Switch id="notifications" defaultChecked />\n  <FieldLabel htmlFor="notifications">Care reminders</FieldLabel>\n</Field>',
    guidance:
      "Keep the label the same in both states. It should name the setting, such as Care reminders, rather than an action such as Enable. Use disabled only when the setting cannot be changed and explain why nearby.",
    props: [
      {
        name: "checked / defaultChecked",
        type: "boolean",
        description: "Whether the setting is on.",
      },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "Runs when the setting changes.",
      },
      {
        name: "size",
        type: "default | sm",
        default: "default",
        description: "The switch's size.",
      },
      { name: "disabled", type: "boolean", description: "Prevents changes." },
    ],
    tokens: ["--color-brand-fill", "--color-border", "--shadow-focus"],
  },
  card: {
    title: "Card",
    description:
      "Group related information on a white surface. Build clinical cards from shared patterns so spacing, corners, and shadows stay consistent across screens.",
    usage:
      'import { DeviceCard } from "@/components/patterns/clinical-cards"\n\n<DeviceCard\n  name="Device-SKU-1234"\n  identifier="Device ID: SKU-1234"\n  battery={90}\n/>',
    guidance:
      "Use CardHeader, CardTitle, CardDescription, CardContent, and CardFooter for a new composition. Reuse StatusCard, DeviceCard, VitalCard, and InstructionCard for existing clinical patterns. Each owns its spacing. Status, device, and instruction tiles are square and follow the adjacent content height through ContentTileRow; avoid adding a second padded wrapper.",
    props: [
      {
        name: "Card.children",
        type: "ReactNode",
        description:
          "The card's content. Card supplies the surface, 24px corners, padding, and shadow.",
      },
      {
        name: "CardAction",
        type: "component",
        description: "An optional action in CardHeader.",
      },
      {
        name: "DeviceCard.battery",
        type: "number",
        description:
          "Battery level from 0 to 100, clamped. Provisional thresholds: above 50 green, 21–50 yellow, 0–20 red. The percentage never wraps; the bar uses the remaining width.",
      },
      {
        name: "DeviceCard.connected",
        type: "boolean",
        default: "true",
        description:
          "False takes precedence over battery, showing a neutral tile and a disconnected label. Any battery value is last known.",
      },
      {
        name: "StatusCard.status",
        type: "safe | caution | critical",
        description:
          "Status titles use 16px type. Safe shows slow hollow rings around a Tabler smiling face on a soft tile. Caution shows a straight-mouth face and critical an unhappy squinting face within faster rings. Supply the actual title and description.",
      },
      {
        name: "VitalCard.metric",
        type: "pulse | temperature | activity",
        description: "Selects the label, icon, and metric gradient.",
      },
    ],
    tokens: [
      "--radius-card",
      "--shadow-card",
      "--shadow-card-device",
      "--color-device-healthy-surface",
      "--color-device-healthy-icon",
      "--color-device-medium-surface",
      "--color-device-medium-icon",
      "--color-device-low-surface",
      "--color-device-low-icon",
      "--color-device-disconnected-surface",
      "--color-device-disconnected-icon",
      "--color-status-tile",
      "--color-motion-safe",
      "--duration-pulse-safe",
      "--color-text-hero-muted",
    ],
  },
  item: {
    title: "Item",
    description:
      "Arrange an icon, a title, supporting text, and an optional action in a row. Use it for instructions, preferences, and device lists.",
    usage:
      'import { InstructionCard } from "@/components/patterns/clinical-cards"\n\n<InstructionCard\n  icon="ankleBand"\n  title="Check the band"\n  description="Follow the fitting instructions supplied with the device."\n/>',
    guidance:
      "Use ItemGroup and ItemSeparator for rows that share a surface. Use InstructionCard for separate cards on the clinical home screen. Its leading tile stays square, with both dimensions matching the title and description height. Keep trailing actions named and keyboard accessible.",
    props: [
      {
        name: "variant",
        type: "default | outline | muted",
        default: "default",
        description: "The row's surface treatment.",
      },
      {
        name: "size",
        type: "default | sm",
        default: "default",
        description: "The row's padding and spacing.",
      },
      {
        name: "asChild",
        type: "boolean",
        description:
          "Applies the row's styling to a single child, such as a link.",
      },
      {
        name: "ItemMedia.variant",
        type: "default | icon | image",
        description: "The leading media treatment.",
      },
    ],
    tokens: [
      "--color-text-strong",
      "--color-text-subtle",
      "--color-icon-tile-neutral",
      "--radius-card",
    ],
  },
  nav: {
    title: "Navigation",
    description:
      "Move between the four main clinical views. Every destination has the same dimensions, with an icon above its label. A dark neutral surface and matching indicator identify the current view; soft shadows define the other buttons.",
    usage:
      'import { NavBar } from "@/components/ui/nav-bar"\n\n<NavBar currentRoute="/vitals" />',
    guidance:
      'Use NavBar at the bottom of a mobile clinical screen. Set currentRoute from the router and provide tabs for your application\'s destinations. Use position="static" inside a contained preview. Every link keeps an accessible label when its text is hidden.',
    props: [
      {
        name: "currentRoute",
        type: "string",
        description: "The href of the selected destination.",
      },
      {
        name: "tabs",
        type: "{ href, label, icon }[]",
        description:
          "Navigation destinations. Defaults to Home, Vitals, Stats, and Settings.",
      },
      {
        name: "position",
        type: "fixed | static",
        default: "fixed",
        description:
          "Fixes the bar to the viewport or keeps it in its container.",
      },
      {
        name: "onTabChange",
        type: "(href: string) => void",
        description:
          "Optional controlled selection. When supplied, selection replaces link navigation.",
      },
      {
        name: "NavLink.state",
        type: "active | inactive",
        description: "The visual state of an individual destination.",
      },
    ],
    tokens: [
      "--color-nav-active",
      "--color-nav-indicator",
      "--radius-nav-bar",
      "--shadow-nav-bar",
    ],
  },
  badge: {
    title: "Badge",
    description:
      "Add a short status label to a card, device, or reading. Clinical statuses pair an icon with text so the meaning survives without color.",
    usage:
      'import { Badge } from "@/components/ui/badge"\n\n<Badge status="safe">Connected</Badge>\n<Badge status="caution">Needs attention</Badge>\n<Badge status="critical">Critical</Badge>',
    guidance:
      "Name the actual status in the label. Use neutral or brand for metadata that does not indicate health. Keep icons visible on clinical statuses and avoid placing several badges beside the same title.",
    props: [
      {
        name: "status",
        type: "safe | caution | critical | neutral | brand",
        default: "safe",
        description: "The label's semantic color and status icon.",
      },
      {
        name: "showIcon",
        type: "boolean",
        default: "true",
        description:
          "Controls the status icon. Keep it enabled for clinical information.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "The visible status text.",
      },
    ],
    tokens: [
      "--color-safe-soft",
      "--color-safe-dark",
      "--color-caution-soft",
      "--color-caution-dark",
      "--color-critical-soft",
      "--color-critical-dark",
    ],
  },
  progress: {
    title: "Progress",
    description:
      "Show a known percentage on a compact track. The same track appears in device cards and the BatteryIndicator component.",
    usage:
      'import { Progress } from "@/components/ui/progress"\nimport { BatteryIndicator } from "@/components/ui/battery-indicator"\n\n<Progress value={72} aria-label="Sync progress" />\n<BatteryIndicator level={72} charging />',
    guidance:
      "Give Progress an accessible name and show a numeric label when the percentage matters. Use BatteryIndicator for a compact battery readout and DeviceCard when the device name and identifier need to accompany it.",
    props: [
      {
        name: "Progress.value",
        type: "number",
        default: "0",
        description: "The percentage of the track to fill.",
      },
      {
        name: "Progress.tone",
        type: "safe | caution | critical | neutral",
        default: "safe",
        description:
          "Semantic track and fill colors; does not derive a device state itself.",
      },
      {
        name: "BatteryIndicator.connected",
        type: "boolean",
        default: "true",
        description:
          "Disconnected uses a neutral readout and labels the value as last known.",
      },
      {
        name: "BatteryIndicator.showIcon",
        type: "boolean",
        default: "true",
        description:
          "Omit the leading battery glyph when embedding the readout in a device card.",
      },
      {
        name: "BatteryIndicator.level",
        type: "number",
        description: "The battery percentage, clamped to 0–100.",
      },
      {
        name: "BatteryIndicator.charging",
        type: "boolean",
        default: "false",
        description: "Shows a charging icon.",
      },
    ],
    tokens: [
      "--color-safe-soft",
      "--color-safe-fill",
      "--color-safe-dark",
      "--color-caution-soft",
      "--color-caution",
      "--color-caution-dark",
      "--color-critical-soft",
      "--color-critical",
      "--color-critical-dark",
      "--color-bg",
      "--color-text-muted",
      "--radius-full",
    ],
  },
  "toggle-group": {
    title: "Toggle group",
    description:
      "Switch between related views or filters in a compact row. Use a single selection for time ranges and multiple selections for independent filters.",
    usage:
      'import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"\n\n<ToggleGroup type="single" defaultValue="day" aria-label="Time range">\n  <ToggleGroupItem value="hour">Hour</ToggleGroupItem>\n  <ToggleGroupItem value="day">Day</ToggleGroupItem>\n  <ToggleGroupItem value="week">Week</ToggleGroupItem>\n</ToggleGroup>',
    guidance:
      "Supply labels that describe the available views. For a required single selection, keep the current value when onValueChange returns an empty string. The white group surface, neutral-100 inactive hover, and dark neutral selection are shared by documentation controls and clinical screens. Use equal fit with small size for a compact time-range row.",
    props: [
      {
        name: "fit",
        type: "content | equal",
        default: "content",
        description:
          "Content-sized options or equal widths that fill the group.",
      },
      {
        name: "spacing",
        type: "number",
        default: "1",
        description: "Gap in quarter-rem increments.",
      },
      {
        name: "type",
        type: "single | multiple",
        description: "Whether one or several options can be selected.",
      },
      {
        name: "variant",
        type: "default | outline | brand",
        default: "default",
        description:
          "Default uses a dark neutral selected fill. Outline adds a boundary stroke; brand is an explicit blue alternative.",
      },
      {
        name: "size",
        type: "default | sm | lg",
        default: "default",
        description: "The size shared by the options.",
      },
      {
        name: "onValueChange",
        type: "(value: string | string[]) => void",
        description:
          "Receives the selection. Its type follows single or multiple mode.",
      },
    ],
    tokens: [
      "--color-bg",
      "--color-surface",
      "--color-toggle-active",
      "--color-toggle-surface",
      "--color-toggle-hover",
      "--color-toggle-text",
      "--color-toggle-active-text",
      "--color-brand-fill",
    ],
  },
  chart: {
    title: "Chart",
    description:
      "The clinical chart card used in Stats combines a metric icon, time range, latest value, and timestamped trend. It uses the same VitalDetailCard and VitalsTrendChart components shown here.",
    usage:
      'import { VitalDetailCard } from "@/components/patterns/vital-detail-card"\n\n<VitalDetailCard\n  title="Thermoregulation"\n  icon="temperature"\n  description="All systems stable"\n  chart={{\n    data: readings,\n    xKey: "time",\n    timeAxis: true,\n    series: [{ key: "value", label: "Thermoregulation", color: "var(--color-safe)", domain: [94, 100], showDots: false }],\n  }}\n/>',
    guidance:
      "VitalDetailCard owns the metric icon, calendar-marked time range, and latest value; its chart prop accepts VitalsTrendChart options. Supply epoch-millisecond timestamps with timeAxis enabled. Every reading contributes a straight line segment. Time labels use evenly spaced 30-minute steps, or a consistent larger interval on narrow charts. The range-start label is omitted. Gridlines align with visible ticks; tooltips retain the individual reading time. Sample data uses variable 1–3-minute intervals, not raw waveforms.",
    props: [
      {
        name: "value / unit",
        type: "string | number / string",
        description:
          "Optional latest-value override and unit. Defaults to the last reading of the first series.",
      },
      {
        name: "rangeLabel",
        type: "string",
        description:
          "Optional time-range text, e.g. Today, 08:00–14:00. Defaults to the date and times in the data.",
      },
      {
        name: "status",
        type: "safe | caution | critical | unavailable",
        description: "Unavailable suppresses values and charts and shows neutral device-support copy. VitalDetailCard: colors the icon, latest value, and chart lines consistently. Explicit status takes precedence over critical.",
      },
      {
        name: "critical",
        type: "boolean",
        default: "false",
        description:
          "Legacy shorthand for critical status when status is omitted. Default icon and value are green; omitted status preserves supplied series colors.",
      },
      {
        name: "title / icon / description",
        type: "string / IconName / string",
        description: "VitalDetailCard heading, icon, and supporting text.",
      },
      {
        name: "chart",
        type: "VitalsTrendChartProps",
        description:
          "Optional chart configuration on VitalDetailCard. Omit for a summary row; empty data retains the chart space. Unavailable status suppresses the chart entirely, even when supplied.",
      },
      {
        name: "timeAxis",
        type: "boolean",
        default: "false",
        description:
          "VitalsTrendChart: numeric epoch-ms axis with 30-minute tick candidates and exact reading tooltips.",
      },
      {
        name: "data",
        type: "Record<string, number | string>[]",
        description: "Readings ordered along the X axis.",
      },
      {
        name: "xKey",
        type: "string",
        description: "The property used for X-axis labels.",
      },
      {
        name: "series",
        type: "VitalsTrendSeries[]",
        description:
          "Each series has a key, label, color, and optional yAxisId, domain, and showDots.",
      },
      {
        name: "height",
        type: "number",
        default: "240",
        description: "Chart height in pixels. Also used for the empty state.",
      },
    ],
    tokens: [
      "--color-safe",
      "--color-brand",
      "--color-text-muted",
      "--color-border-subtle",
      "--shadow-floating",
    ],
  },
  sparkline: {
    title: "Sparkline",
    description:
      "Show the shape of a recent trend in a small space. Pair the line with a named metric and its current value.",
    usage:
      'import { Sparkline } from "@/components/ui/sparkline"\n\n<Sparkline\n  data={[{ value: 118 }, { value: 122 }, { value: 120 }]}\n  color="var(--color-safe)"\n/>',
    guidance:
      "A sparkline has no axes or tooltip. Put the metric label and value beside it, and use Chart when readers need exact values over time. Use the inverse text token on a colored VitalCard.",
    props: [
      {
        name: "data",
        type: "{ value: number }[]",
        description: "Readings ordered from oldest to newest.",
      },
      {
        name: "color",
        type: "string",
        default: "var(--color-safe)",
        description: "A semantic CSS color token.",
      },
      {
        name: "height",
        type: "number",
        default: "26",
        description: "The line's height in pixels.",
      },
    ],
    tokens: ["--color-safe", "--color-text-inverse", "--gradient-metric-pulse"],
  },
} satisfies Record<string, ComponentContent>;
export type ComponentName = keyof typeof COMPONENT_CONTENT;
