# Checkbox — DESIGN.md

`Checkbox` is the shadcn `checkbox` registry component (`npx shadcn add checkbox`, no
`-b`/`--base` flag — `add` has no such option in CLI 4.21.0, verified live via
`npx shadcn add --help`, matching the precedent already established by 06-07/06-08/06-12),
restyled to this project's semantic token layer. It is the project's single-toggle boolean
field primitive — always composed inside the `Field` family (06-09) for label/description/
error, never a standalone control with a hand-rolled error slot. Radix's own `aria-checked`/
keyboard-focus state machine is used as-is; this file only restyles presentational classes,
per D-12's explicit "do not hand-roll" directive for exactly this class of control.

## Figma fidelity: token-consistent, not node-verified

No dedicated Figma frame exists for `Checkbox` — `06-CONTEXT.md`'s D-12 form-field expansion
table lists checkbox/radio/switch only as "expanded form fields... at minimum," with no
assigned node ID, and this executor's environment has no Figma MCP tool access this session
(same constraint documented in `select.DESIGN.md`/`textarea.DESIGN.md`). Rather than guess
bespoke values with no source of truth, `Checkbox`'s checked-state fill reuses the exact
`bg-brand-fill`/`border-brand-fill` blue-accent convention already used by `Input`'s focus
ring and `Button`'s primary variant, and its border/shadow/disabled treatment matches
`Input`'s own `border-border`/`disabled:opacity-50 disabled:cursor-not-allowed`. This is the
same "token-consistent, not Figma-node-verified" disposition already used for `Field`/`Label`
(06-09), `Select`/`Textarea` (06-12), `Badge` (06-08), and `Item` (06-07).

**A later plan with direct Figma MCP access should extract a real Checkbox frame if one
exists and correct this component if it diverges from the token-consistent defaults below.**
This gap is documented, not hidden.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as every other component this phase.

## Restyle from the shadcn scaffold

| Stock class/import | This project's replacement | Why |
|---|---|---|
| `import { cn } from "cn"` | `import { cn } from "@/lib/utils"` | Project convention (same fix every other `src/components/ui/*.tsx` file uses) |
| `import { CheckIcon } from "lucide-react"` | `import { Icon } from "@/components/icon"` | This project's icon system is a hand-authored, dependency-free `<Icon name="..."/>` (D-09) — not a package. `lucide-react` is not and should not become a project dependency. Reuses the existing `check` glyph already hand-authored into `icon.tsx` for `Select` (06-12) — no new icon entry needed |
| `border border-input` | `border border-border` | Matches `Input`'s already-extracted border token; no `input` token exists in this theme |
| `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` | `focus-visible:border-border-focus focus-visible:shadow-focus` | Matches `Item`/`ToggleGroup`/`Toggle`/`Select`'s existing button-like-control focus convention (box-shadow token, not a ring utility) — no second focus mechanism invented |
| `aria-invalid:border-destructive aria-invalid:ring-destructive/20` | `aria-invalid:border-critical` | No `destructive` token exists in this theme; matches `Input`'s own `aria-invalid:border-critical` treatment exactly |
| `data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground` | `data-[state=checked]:border-brand-fill data-[state=checked]:bg-brand-fill data-[state=checked]:text-text-inverse` | No `primary`/`primary-foreground` tokens exist in this theme; `bg-brand-fill`/`text-text-inverse` is the exact pairing `Button`'s `default` variant already uses for a filled control |
| `transition-shadow` | `transition-[color,background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-out` | 06-UI-SPEC.md's Motion section requires an explicit duration token on every new interactive component's transition, and the added `transform` channel carries the press-feedback scale below |
| (none — stock has no press feedback) | `active:scale-[0.96]` | 06-UI-SPEC.md's Motion section explicitly lists `Checkbox` among the components required to have `active:scale-[0.96]`/`150ms ease-out` press feedback, matching `Button`/`NavLink`/`ToggleGroup`/`Switch` |
| `dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary` | removed | No dark theme exists in this project (same precedent as `toggle-group.DESIGN.md`, `field.DESIGN.md`, `select.DESIGN.md`) |

## Correct usage

```tsx
<Field orientation="horizontal">
  <Checkbox id="notify-caregiver" />
  <FieldContent>
    <FieldLabel htmlFor="notify-caregiver">Notify caregiver on Amber+</FieldLabel>
    <FieldDescription>Sends a push alert when the risk signal reaches Amber or Red.</FieldDescription>
  </FieldContent>
</Field>

<Field data-invalid="true" orientation="horizontal">
  <Checkbox id="consent" aria-invalid />
  <FieldContent>
    <FieldLabel htmlFor="consent">I consent to data storage</FieldLabel>
    <FieldError>You must accept before continuing.</FieldError>
  </FieldContent>
</Field>
```

## Incorrect usage

```tsx
// ✗ Do not re-invent Input's bespoke inline error-slot pattern for Checkbox — Field/FieldError
// is the canonical wrapper for every new field type (see field.DESIGN.md).
function ConsentField({ hasError }: { hasError: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Checkbox id="consent-2" />
        <label htmlFor="consent-2">I consent to data storage</label>
      </div>
      {hasError && <p className="text-caption text-critical-dark">Something went wrong</p>}
    </div>
  )
}

// ✗ Do not hand-roll a div-based checkbox with manual tabIndex/aria-* wiring — Radix's
// CheckboxPrimitive already solves keyboard focus and aria-checked state (D-12, 06-RESEARCH.md
// Don't Hand-Roll table).
```

## Disabled / loading (06-UI-SPEC.md UI Considerations)

`disabled:opacity-50 disabled:cursor-not-allowed` on the root — the exact same treatment
`Input`/`Select`/`Textarea`/`Field` already use, matching UI-SPEC's "loading" row instruction
not to invent a new pattern for the new form fields.
