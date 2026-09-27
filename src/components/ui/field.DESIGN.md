# Field — DESIGN.md

`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, and `FieldSet` (plus the
supporting `FieldContent`/`FieldTitle`/`FieldLegend`/`FieldSeparator` shipped by shadcn's registry)
are **the** canonical label+control+help+error wrapper for every new form field added from Wave 3
onward — Select, Textarea, Checkbox, RadioGroup, and Switch all compose their control inside a
`Field`, not a hand-rolled wrapper.

Input's own bespoke `error`/`errorMessage` inline-error-slot pattern (see `input.DESIGN.md`) is a
**grandfathered exception** — it predates `Field`'s existence in this codebase and its contract
(prop names, locked default copy) stays unchanged for backward compatibility with existing Input
usage. It is **not** a pattern to copy. Every field type added after this plan uses `Field` +
`FieldError` instead of re-implementing its own inline error slot a second time.

## Token restyle

The shadcn registry version references stock shadcn semantic CSS variables
(`--primary`, `--destructive`, `--background`, `--muted-foreground`) that this project's
`globals.css` never defines — those classes would silently compile to nothing (the same failure
mode already documented for Tailwind v4's `--duration-*` namespace in Phase 06's STATE.md
decisions). Every occurrence was remapped onto this project's real semantic tokens, and every
`dark:` variant was dropped (no dark-mode theme exists in this project, same precedent as
`toggle-group.DESIGN.md`):

| Stock shadcn class | Restyled to | Component |
|---|---|---|
| `data-[invalid=true]:text-destructive` | `data-[invalid=true]:text-critical-dark` | `Field` (`fieldVariants`) |
| `has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10` | `has-data-[state=checked]:border-border-focus has-data-[state=checked]:bg-brand-soft` | `FieldLabel` |
| `has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border` (undefined border color) | same, + explicit `has-[>[data-slot=field]]:border-border` | `FieldLabel` |
| `text-sm ... text-muted-foreground` | `text-caption ... text-text-muted` | `FieldDescription` |
| `[&>a:hover]:text-primary` | `[&>a:hover]:text-border-focus` | `FieldDescription` |
| `bg-background ... text-muted-foreground` | `bg-surface ... text-text-muted` | `FieldSeparator` |
| `text-sm font-normal text-destructive` | `text-caption font-normal text-critical-dark` | `FieldError` |

`FieldError`'s `text-caption text-critical-dark` treatment is deliberately identical to Input's
own error slot (`<p className="text-caption text-critical-dark">` in `input.tsx`) — visual
consistency between the legacy Input pattern and the new canonical `Field` pattern, even though
the two are structurally independent (Input's error slot is not built on `Field`).

`cn` import normalized to `@/lib/utils`, matching every other file in `src/components/ui/`.

## Correct usage

```tsx
<Field>
  <FieldLabel htmlFor="device-id">Device ID</FieldLabel>
  <Input id="device-id" placeholder="e.g. nb-001" />
  <FieldDescription>The armband's paired device identifier.</FieldDescription>
</Field>

<Field data-invalid="true">
  <FieldLabel htmlFor="caregiver-phone">Caregiver phone</FieldLabel>
  <Input id="caregiver-phone" aria-invalid />
  <FieldError>Enter a valid phone number.</FieldError>
</Field>
```

## Incorrect usage

```tsx
// ✗ Do not re-implement a bespoke inline error slot for a NEW field type — this is exactly the
// pattern Field/FieldError exists to replace. (Input itself is exempt as a grandfathered,
// pre-existing pattern — see input.DESIGN.md — but nothing new should copy it.)
function NewSelectField() {
  return (
    <div className="flex flex-col gap-1">
      <select />
      {hasError && <p className="text-caption text-critical-dark">Something went wrong</p>}
    </div>
  )
}

// ✓ Instead, every new field type wraps its control in Field/FieldError:
function NewSelectField() {
  return (
    <Field data-invalid={hasError}>
      <FieldLabel htmlFor="x">Label</FieldLabel>
      <Select id="x" />
      {hasError && <FieldError>Something went wrong</FieldError>}
    </Field>
  )
}
```

## Figma verification (06-09, 2026-09-27)

No dedicated Figma node exists for the `Field` wrapper family — D-12's own note states the user
"could not articulate exact form-field designs," leaving this component to the executor's
discretion (per this plan's CONTEXT.md). `Field` is restyled against this project's existing
token layer (established by Button/Card/Badge/Input/Label in prior waves) for visual consistency
rather than any Figma extraction — a "token-consistent, not Figma-node-verified" disposition,
matching the same honest disposition already used for Badge (06-08), Item (06-07), and Label
(06-09, above).
