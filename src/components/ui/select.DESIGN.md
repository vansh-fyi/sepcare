# Select — DESIGN.md

`Select` (with `SelectTrigger`/`SelectValue`/`SelectContent`/`SelectGroup`/`SelectLabel`/
`SelectItem`/`SelectSeparator`/`SelectScrollUpButton`/`SelectScrollDownButton`) is the shadcn
`select` registry component (`npx shadcn add select`, no `-b`/`--base` flag — `add` has no such
option in CLI 4.21.0, verified live via `npx shadcn add --help`), restyled to this project's
semantic token layer. It is the project's dropdown/single-choice field primitive — always composed
inside the `Field` family (06-09) for label/description/error, never a standalone control with a
hand-rolled error slot.

## Figma fidelity: token-consistent, not node-verified

No dedicated Figma frame exists for `Select` — `06-CONTEXT.md`'s D-12 form-field expansion table
lists it only as "Dropdown field — user explicitly flagged 'doesn't even have different form
fields'," with no node ID, and the overview node `203-9097`'s surrounding frames (checked per this
plan's action) surfaced no dropdown/select example either. This executor's environment has no
Figma MCP tool access this session (see this plan's dispatch note), so no `get_design_context`/
`get_screenshot` extraction was possible even for a nearby frame. Rather than guess bespoke values
with no source of truth, `Select`'s trigger reuses the exact border/radius/focus-ring treatment
already Figma-consistent-by-precedent on `Input` (06-09) — `rounded-input`, `border-border`,
`focus-visible:border-border-focus`/`focus-visible:shadow-focus`, `disabled:opacity-50
disabled:cursor-not-allowed` — the same "token-consistent, not Figma-node-verified" disposition
already used for `Field`/`Label` (06-09), `Badge` (06-08), and `Item` (06-07).

**A later plan with direct Figma MCP access should extract a real Select frame if one exists and
correct this component if it diverges from the token-consistent defaults below.** This gap is
documented, not hidden.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as every other component this phase.

## Restyle from the shadcn scaffold

| Stock class/import | This project's replacement | Why |
|---|---|---|
| `import { cn } from "cn"` | `import { cn } from "@/lib/utils"` | Project convention (same fix every other `src/components/ui/*.tsx` file uses) |
| `import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"` | `import { Icon } from "@/components/icon"` | This project's icon system is a hand-authored, dependency-free `<Icon name="..."/>` (D-09) — not a package. `lucide-react` is not and should not become a project dependency (confirmed absent from `package.json`; `nav-bar.DESIGN.md` already documents this same avoidance for a different component). `chevronDown`/`chevronUp`/`check` were hand-authored into `icon.tsx` as new entries — no equivalent existed in the salvaged `frontend-design/design-system/icons.js` source, matching the "hand-author gaps" precedent D-09 already established |
| `rounded-md border border-input bg-transparent` (trigger) | `rounded-input border border-border bg-surface` | Matches `Input`'s already-extracted radius/border tokens; `bg-surface` makes the trigger an opaque white control instead of transparent, consistent with sitting on the page's `--color-bg` canvas |
| `text-sm` / `shadow-xs` (trigger) | `text-body` / removed | `Input` uses `text-body` with no shadow at rest — matching that flat treatment exactly |
| `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` | `focus-visible:border-border-focus focus-visible:shadow-focus` | Matches `Item`/`ToggleGroup`/`Toggle`'s existing button-like-control focus convention (box-shadow token, not a ring utility) — no second focus mechanism invented |
| `aria-invalid:border-destructive aria-invalid:ring-destructive/20` | `aria-invalid:border-critical` | No `destructive` token exists in this theme; matches `Input`'s own `aria-invalid:border-critical` treatment exactly |
| `data-[placeholder]:text-muted-foreground` | `data-[placeholder]:text-text-muted` | Matches `Input`'s `placeholder:text-text-muted` |
| `dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40` | removed | No dark theme exists in this project (same precedent as `toggle-group.DESIGN.md`, `field.DESIGN.md`) |
| `[&_svg:not([class*='text-'])]:text-muted-foreground` | `[&_svg:not([class*='text-'])]:text-text-muted` | Same muted-foreground → text-muted remap used throughout |
| `transition-[color,box-shadow]` | `transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-out` | 06-UI-SPEC.md's Motion section requires an explicit duration token on every new interactive component's hover/focus transition, not an untimed transition |
| `rounded-md border bg-popover text-popover-foreground shadow-md` (content) | `rounded-input border border-border bg-surface text-text shadow-floating` | No `popover` token exists in this theme; `shadow-floating` (`0 8px 30px rgba(10,10,17,0.10)`) is this project's own elevated-surface shadow for exactly this kind of floating overlay, already declared in `globals.css` |
| `text-xs text-muted-foreground` (label) | `text-caption text-text-muted` | Matches this project's caption-role token instead of an unthemed `text-xs` + undefined muted-foreground |
| `rounded-sm` / `text-sm` (item) | `rounded-card-sm` / `text-body` | Reuses this project's existing corner-radius and body-text tokens instead of Tailwind's unthemed defaults |
| `focus:bg-accent focus:text-accent-foreground` (item hover/focus) | `focus:bg-bg focus:text-text` | shadcn's stock `accent`-prefixed tokens don't exist in this theme; matches `Item`/`ToggleGroup`'s identical `hover:bg-bg`/`hover:bg-accent` remap precedent |
| `[&_svg:not([class*='text-'])]:text-muted-foreground` (item) | `[&_svg:not([class*='text-'])]:text-text-muted` | Same remap as trigger |
| `<ChevronDownIcon asChild>` wrapper pattern | `<SelectPrimitive.Icon>` (no `asChild`) rendering `<Icon />` directly | This project's `Icon` is a plain function component, not wrapped in `React.forwardRef`. Radix's `asChild`/`Slot` pattern expects the child to accept a forwarded ref; dropping `asChild` avoids a ref-forwarding console warning while keeping the exact same rendered glyph (Radix's `Select.Icon` renders a harmless wrapping `<span>` either way) |

## Correct usage

```tsx
<Field>
  <FieldLabel htmlFor="device-region">Device region</FieldLabel>
  <Select>
    <SelectTrigger id="device-region">
      <SelectValue placeholder="Select a region" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="in-south">India — South</SelectItem>
      <SelectItem value="in-north">India — North</SelectItem>
    </SelectContent>
  </Select>
  <FieldDescription>Used to route device-support routing only.</FieldDescription>
</Field>

<Field data-invalid="true">
  <FieldLabel htmlFor="device-region-2">Device region</FieldLabel>
  <Select>
    <SelectTrigger id="device-region-2" aria-invalid>
      <SelectValue placeholder="Select a region" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="in-south">India — South</SelectItem>
    </SelectContent>
  </Select>
  <FieldError>Please select a region.</FieldError>
</Field>
```

## Incorrect usage

```tsx
// ✗ Do not re-invent Input's bespoke inline error-slot pattern for Select — Field/FieldError
// is the canonical wrapper for every new field type (see field.DESIGN.md).
function DeviceRegionField({ hasError }: { hasError: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="in-south">India — South</SelectItem>
        </SelectContent>
      </Select>
      {hasError && <p className="text-caption text-critical-dark">Something went wrong</p>}
    </div>
  )
}
```

## Disabled / loading (06-UI-SPEC.md UI Considerations)

`disabled:opacity-50 disabled:cursor-not-allowed` on `SelectTrigger` — the exact same treatment
`Input`/`Field` already use, matching UI-SPEC's "loading" row instruction not to invent a new
pattern for the new form fields.

## Overflow (backstop)

`SelectValue`'s slot classes carry `line-clamp-1` from the stock scaffold (kept) so a long selected
option label truncates rather than growing the trigger's fixed height. Not independently
re-verified by this plan's own automated checks.
