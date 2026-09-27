# Textarea — DESIGN.md

`Textarea` is the shadcn `textarea` registry component (`npx shadcn add textarea`, no `-b`/
`--base` flag — `add` has no such option in CLI 4.21.0, verified live via `npx shadcn add --help`),
restyled to this project's semantic token layer. It is the project's multi-line text-entry
primitive — the direct counterpart to `Input` for longer free-text content — always composed
inside the `Field` family (06-09) for label/description/error, never a standalone control with a
hand-rolled error slot.

## Figma fidelity: token-consistent, not node-verified

No dedicated Figma frame exists for `Textarea` — `06-CONTEXT.md`'s D-12 form-field expansion table
lists it only as "Multi-line field," with no node ID, and the overview node `203-9097`'s
surrounding frames (checked per this plan's action, same pass performed for `Select`) surfaced no
multi-line-field example either. This executor's environment has no Figma MCP tool access this
session (see this plan's dispatch note). Rather than guess bespoke values with no source of truth,
`Textarea` reuses `Input`'s exact already-extracted border/radius/focus-ring treatment —
`rounded-input`, `border-border`, `p-3`, `text-body`, `placeholder:text-text-muted`,
`focus:border-border-focus`/`focus:shadow-focus`, `disabled:opacity-50 disabled:cursor-not-allowed`
— the same "token-consistent, not Figma-node-verified" disposition already used for `Select`
(above, this plan), `Field`/`Label` (06-09), `Badge` (06-08), and `Item` (06-07).

**A later plan with direct Figma MCP access should extract a real Textarea frame if one exists and
correct this component if it diverges from the token-consistent defaults below.** This gap is
documented, not hidden.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as every other component this phase.

## Restyle from the shadcn scaffold

| Stock class/import | This project's replacement | Why |
|---|---|---|
| `import { cn } from "cn"` | `import { cn } from "@/lib/utils"` | Project convention (same fix every other `src/components/ui/*.tsx` file uses) |
| `rounded-md border border-input bg-transparent px-3 py-2` | `rounded-input border border-border p-3` | Matches `Input`'s exact radius/border/padding tokens — same visual language for the project's two plain-text field primitives |
| `text-base` / `md:text-sm` | `text-body` | `Input` uses a single fixed `text-body` size regardless of breakpoint — no responsive size step, matching that flat treatment |
| `shadow-xs` | removed | `Input` carries no shadow at rest; kept flat for visual consistency |
| `placeholder:text-muted-foreground` | `placeholder:text-text-muted` | Matches `Input`'s exact placeholder token |
| `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` | `focus:border-border-focus focus:shadow-focus` | Matches `Input`'s own text-field focus convention exactly (plain `focus:`, box-shadow token, not a ring utility or `focus-visible:` — a real `<textarea>` behaves like `<input>` here, not like a button-style trigger) |
| `aria-invalid:border-destructive aria-invalid:ring-destructive/20` | `aria-invalid:border-critical` | No `destructive` token exists in this theme; matches `Input`'s own `aria-invalid:border-critical` treatment exactly |
| `dark:bg-input/30 dark:aria-invalid:ring-destructive/40` | removed | No dark theme exists in this project (same precedent as `toggle-group.DESIGN.md`, `field.DESIGN.md`, `select.DESIGN.md`) |
| `transition-[color,box-shadow]` | `transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-out` | 06-UI-SPEC.md's Motion section requires an explicit duration token on every new interactive component's hover/focus transition, not an untimed transition |

## Correct usage

```tsx
<Field>
  <FieldLabel htmlFor="caregiver-notes">Caregiver notes</FieldLabel>
  <Textarea id="caregiver-notes" placeholder="Add any observations..." />
  <FieldDescription>Visible to other caregivers on this device.</FieldDescription>
</Field>

<Field data-invalid="true">
  <FieldLabel htmlFor="caregiver-notes-2">Caregiver notes</FieldLabel>
  <Textarea id="caregiver-notes-2" aria-invalid />
  <FieldError>Notes cannot be empty.</FieldError>
</Field>
```

## Incorrect usage

```tsx
// ✗ Do not re-invent Input's bespoke inline error-slot pattern for Textarea — Field/FieldError
// is the canonical wrapper for every new field type (see field.DESIGN.md).
function CaregiverNotesField({ hasError }: { hasError: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <Textarea placeholder="Add any observations..." />
      {hasError && <p className="text-caption text-critical-dark">Notes cannot be empty.</p>}
    </div>
  )
}
```

## Disabled / loading (06-UI-SPEC.md UI Considerations)

`disabled:opacity-50 disabled:cursor-not-allowed` — the exact same treatment `Input`/`Select`/
`Field` already use, matching UI-SPEC's "loading" row instruction not to invent a new pattern for
the new form fields.

## Long-text (backstop)

`field-sizing-content` (kept from the shadcn scaffold) lets the textarea grow with its content up
from `min-h-16` rather than staying fixed-height with an internal scrollbar. Not independently
re-verified by this plan's own automated checks.
