# Switch — DESIGN.md

`Switch` is the shadcn `switch` registry component (`npx shadcn add switch`, no `-b`/`--base`
flag — `add` has no such option in CLI 4.21.0, verified live via `npx shadcn add --help`),
restyled to this project's semantic token layer. It is the project's toggle-field primitive
("Toggle field" per 06-UI-SPEC.md's component table) — always composed inside the `Field`
family (06-09) for label/description/error, never a standalone control with a hand-rolled
error slot. Radix's own `aria-checked`/keyboard-focus state machine is used as-is; this file
only restyles presentational classes, per D-12's explicit "do not hand-roll" directive for
exactly this class of control.

## Figma fidelity: token-consistent, not node-verified

No dedicated Figma frame exists for `Switch` — same D-12 framing and no-MCP-access constraint
documented in `checkbox.DESIGN.md`/`radio-group.DESIGN.md`. `Switch`'s checked-state track
fill reuses the exact `bg-brand-fill` convention established for `Checkbox`/`RadioGroup`
(this plan, Task 1) so all three toggle-family controls share one checked-state color. This
is the same "token-consistent, not Figma-node-verified" disposition already used for
`Field`/`Label` (06-09), `Select`/`Textarea` (06-12), `Badge` (06-08), and `Item` (06-07).

**A later plan with direct Figma MCP access should extract a real Switch frame if one exists
and correct this component if it diverges from the token-consistent defaults below.** This
gap is documented, not hidden.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as every other component this phase.

## Restyle from the shadcn scaffold

| Stock class/import | This project's replacement | Why |
|---|---|---|
| `import { cn } from "cn"` | `import { cn } from "@/lib/utils"` | Project convention (same fix every other `src/components/ui/*.tsx` file uses) |
| `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` | `focus-visible:border-border-focus focus-visible:shadow-focus` | Matches `Item`/`ToggleGroup`/`Toggle`/`Select`/`Checkbox`/`RadioGroup`'s existing button-like-control focus convention (box-shadow token, not a ring utility) — no second focus mechanism invented |
| `data-[state=checked]:bg-primary` (track) | `data-[state=checked]:bg-brand-fill` | No `primary` token exists in this theme; `bg-brand-fill` is the same fill `Checkbox`/`RadioGroup` use for their checked state, keeping the toggle family visually consistent |
| `data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80` (track) | `data-[state=unchecked]:bg-border` | No `input` token exists in this theme; `bg-border` (`--color-neutral-300`) is this project's existing neutral-gray token, giving the unchecked track a visible-but-quiet fill consistent with `Checkbox`/`RadioGroup`'s unchecked `border-border` treatment |
| `bg-background` (thumb) | `bg-surface` | No `background` token exists in this theme; `bg-surface` is this project's opaque-white-control token, already used by `Select`'s trigger/content and matching a physical switch's white/light thumb |
| `dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground` (thumb) | removed | No dark theme exists in this project (same precedent as `toggle-group.DESIGN.md`, `field.DESIGN.md`, `select.DESIGN.md`, `checkbox.DESIGN.md`, `radio-group.DESIGN.md`) |
| `transition-all` (track) | `transition-colors duration-[var(--duration-fast)] ease-out` | 06-UI-SPEC.md's Motion section requires an explicit duration token on every new interactive component's transition; scoped to `colors` since the track itself never scales or translates (only the thumb does) |
| `transition-transform` (thumb, no duration/easing) | `transition-transform duration-[var(--duration-fast)] ease-out` | Same Motion-section duration requirement, applied to the channel that already existed for the checked/unchecked slide |
| (none — stock has no press feedback) | `group-active/switch:scale-[0.96]` (thumb only) | 06-UI-SPEC.md's Motion section lists `Switch` among the components required to have `active:scale-[0.96]`/`150ms ease-out` press feedback — applied to the thumb specifically (not the whole track), matching how a physical switch's moving part animates. The root (`SwitchPrimitive.Root`, marked `group/switch`) is the actual focusable/pressable element, so the thumb reads its `:active` state via Tailwind's `group-active` variant rather than its own (non-interactive) `active:` pseudo-class |

## Correct usage

```tsx
<Field orientation="horizontal">
  <FieldContent>
    <FieldLabel htmlFor="realtime-alerts">Real-time alerts</FieldLabel>
    <FieldDescription>Push a notification the moment risk crosses Amber.</FieldDescription>
  </FieldContent>
  <Switch id="realtime-alerts" />
</Field>

<Field data-invalid="true" orientation="horizontal">
  <FieldContent>
    <FieldLabel htmlFor="offline-sync">Offline sync</FieldLabel>
    <FieldError>Could not save this preference — try again.</FieldError>
  </FieldContent>
  <Switch id="offline-sync" aria-invalid />
</Field>
```

## Incorrect usage

```tsx
// ✗ Do not re-invent Input's bespoke inline error-slot pattern for Switch — Field/FieldError
// is the canonical wrapper for every new field type (see field.DESIGN.md).
function AlertsField({ hasError }: { hasError: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor="s-2">Real-time alerts</label>
        <Switch id="s-2" />
      </div>
      {hasError && <p className="text-caption text-critical-dark">Something went wrong</p>}
    </div>
  )
}

// ✗ Do not hand-roll a div-based toggle with manual tabIndex/aria-* wiring — Radix's
// SwitchPrimitive already solves keyboard focus and aria-checked state (D-12,
// 06-RESEARCH.md Don't Hand-Roll table).
```

## Disabled / loading (06-UI-SPEC.md UI Considerations)

`disabled:opacity-50 disabled:cursor-not-allowed` on the root — the exact same treatment
`Input`/`Select`/`Textarea`/`Checkbox`/`RadioGroup`/`Field` already use, matching UI-SPEC's
"loading" row instruction not to invent a new pattern for the new form fields.
