# RadioGroup — DESIGN.md

`RadioGroup` (with `RadioGroupItem`) is the shadcn `radio-group` registry component
(`npx shadcn add radio-group`, no `-b`/`--base` flag — `add` has no such option in CLI 4.21.0,
verified live via `npx shadcn add --help`), restyled to this project's semantic token layer.
It is the project's single-choice-from-a-set field primitive — always composed inside the
`Field` family (06-09) for label/description/error, never a standalone control with a
hand-rolled error slot. Radix's own `aria-checked`/keyboard-focus state machine (including
arrow-key navigation between options) is used as-is; this file only restyles presentational
classes, per D-12's explicit "do not hand-roll" directive for exactly this class of control.

## Figma fidelity: token-consistent, not node-verified

No dedicated Figma frame exists for `RadioGroup` — same D-12 framing and no-MCP-access
constraint documented in `checkbox.DESIGN.md`. `RadioGroupItem`'s checked-state fill reuses
the exact `bg-brand-fill`/`border-brand-fill` convention established for `Checkbox` (this
plan, Task 1) so the two toggle-family controls read as visually identical, and its border/
shadow/disabled treatment matches `Input`'s own `border-border`/`disabled:opacity-50
disabled:cursor-not-allowed`. This is the same "token-consistent, not Figma-node-verified"
disposition already used for `Field`/`Label` (06-09), `Select`/`Textarea` (06-12), `Badge`
(06-08), and `Item` (06-07).

**A later plan with direct Figma MCP access should extract a real RadioGroup frame if one
exists and correct this component if it diverges from the token-consistent defaults below.**
This gap is documented, not hidden.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as every other component this phase.

## Restyle from the shadcn scaffold

| Stock class/import | This project's replacement | Why |
|---|---|---|
| `import { cn } from "cn"` | `import { cn } from "@/lib/utils"` | Project convention (same fix every other `src/components/ui/*.tsx` file uses) |
| `import { CircleIcon } from "lucide-react"` | removed — plain filled `<span>` | The stock indicator is a solid filled dot, not an outlined stroke icon — this project's `Icon` system is stroke-based (`stroke="currentColor" fill="none"`, D-09), so a plain `<span className="rounded-full bg-brand-fill" />` renders the correct solid-dot visual without adding `lucide-react` or a mismatched stroked glyph |
| `border border-input` | `border border-border` | Matches `Input`'s already-extracted border token; no `input` token exists in this theme |
| `text-primary` (root, unused after indicator rework) | removed | Was only present to color the old `fill-primary` Lucide icon via `currentColor`; the new filled `<span>` sets its own `bg-brand-fill` directly, making the inherited text color unnecessary |
| `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` | `focus-visible:border-border-focus focus-visible:shadow-focus` | Matches `Item`/`ToggleGroup`/`Toggle`/`Select`/`Checkbox`'s existing button-like-control focus convention (box-shadow token, not a ring utility) — no second focus mechanism invented |
| `aria-invalid:border-destructive aria-invalid:ring-destructive/20` | `aria-invalid:border-critical` | No `destructive` token exists in this theme; matches `Input`'s own `aria-invalid:border-critical` treatment exactly |
| `fill-primary` (indicator icon) | `bg-brand-fill` (indicator span) | No `primary` token exists in this theme; `bg-brand-fill` is the same fill this plan's `Checkbox` uses for its checked state, keeping the toggle family visually consistent |
| `transition-[color,box-shadow]` | `transition-[color,box-shadow,transform] duration-[var(--duration-fast)] ease-out` | 06-UI-SPEC.md's Motion section requires an explicit duration token on every new interactive component's transition, and the added `transform` channel carries the press-feedback scale below |
| (none — stock has no press feedback) | `active:scale-[0.96]` | 06-UI-SPEC.md's Motion section explicitly lists press feedback as required across the toggle family (`Button`/`NavLink`/`ToggleGroup`/`Switch`/`Checkbox`); applied identically to `RadioGroupItem` for consistency |
| `dark:bg-input/30 dark:aria-invalid:ring-destructive/40` | removed | No dark theme exists in this project (same precedent as `toggle-group.DESIGN.md`, `field.DESIGN.md`, `select.DESIGN.md`, `checkbox.DESIGN.md`) |

## Correct usage

```tsx
<FieldSet>
  <FieldLegend>Alert sensitivity</FieldLegend>
  <FieldDescription>Choose how quickly caregivers are notified.</FieldDescription>
  <RadioGroup defaultValue="balanced">
    <Field orientation="horizontal">
      <RadioGroupItem value="conservative" id="sensitivity-conservative" />
      <FieldLabel htmlFor="sensitivity-conservative">Conservative</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <RadioGroupItem value="balanced" id="sensitivity-balanced" />
      <FieldLabel htmlFor="sensitivity-balanced">Balanced</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <RadioGroupItem value="aggressive" id="sensitivity-aggressive" />
      <FieldLabel htmlFor="sensitivity-aggressive">Aggressive</FieldLabel>
    </Field>
  </RadioGroup>
</FieldSet>

<Field data-invalid="true">
  <RadioGroup aria-invalid>
    <Field orientation="horizontal">
      <RadioGroupItem value="a" id="choice-a" aria-invalid />
      <FieldLabel htmlFor="choice-a">Option A</FieldLabel>
    </Field>
  </RadioGroup>
  <FieldError>Please select one option.</FieldError>
</Field>
```

## Incorrect usage

```tsx
// ✗ Do not re-invent Input's bespoke inline error-slot pattern for RadioGroup — Field/FieldError
// is the canonical wrapper for every new field type (see field.DESIGN.md).
function SensitivityField({ hasError }: { hasError: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <RadioGroup>
        <RadioGroupItem value="balanced" id="s-2" />
      </RadioGroup>
      {hasError && <p className="text-caption text-critical-dark">Something went wrong</p>}
    </div>
  )
}

// ✗ Do not hand-roll a div-based radio group with manual tabIndex/arrow-key wiring — Radix's
// RadioGroupPrimitive already solves keyboard navigation and aria-checked state (D-12,
// 06-RESEARCH.md Don't Hand-Roll table).
```

## Disabled / loading (06-UI-SPEC.md UI Considerations)

`disabled:opacity-50 disabled:cursor-not-allowed` on each item — the exact same treatment
`Input`/`Select`/`Textarea`/`Checkbox`/`Field` already use, matching UI-SPEC's "loading" row
instruction not to invent a new pattern for the new form fields.
