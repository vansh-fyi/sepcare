# Input — DESIGN.md

`Input` is the single text-entry primitive. There is no variant axis this phase — every Input
looks the same (`rounded-input border border-border p-3 text-body`); only its **state** (empty,
focused, error, disabled/locked) changes its treatment.

## States

| State | Trigger | Treatment |
|-------|---------|-----------|
| Empty | No value | Native `placeholder` text in `text-text-muted` — no separate empty-state markup needed |
| Focus | `:focus` | `border-border-focus` + `shadow-focus` ring |
| Error | `error` prop `true` | `aria-invalid:border-critical` border + inline `<p className="text-caption text-critical-dark">` message below the input |
| Disabled / locked | `disabled` prop | `disabled:opacity-50 disabled:cursor-not-allowed` — this same treatment covers "locked during an in-flight operation"; no separate loading-spinner-in-field pattern exists at this phase's atomic scope |

## Error copy

`error` defaults the inline message to the locked copy: **"Couldn't load this. Check your
connection and try again."** (06-UI-SPEC.md Copywriting Contract). Pass `errorMessage` to override
with field-specific copy (e.g. a required-field message) — the default only applies when
`errorMessage` is omitted.

## Correct usage

```tsx
<Input placeholder="Device ID" />
<Input placeholder="Device ID" disabled />
<Input placeholder="Device ID" error />
<Input placeholder="Device ID" error errorMessage="Device ID is required." />
```

## Incorrect usage

```tsx
// ✗ Do not hand-roll a separate error-text element next to Input — the error slot is built in
// and already wired to the locked copy/color; a hand-rolled one will drift from the contract.
<Input placeholder="Device ID" aria-invalid />
<p className="text-red-500 text-xs">Something went wrong</p>
```

There is no `variant`/`size` prop to invent here — `search`/`select`-specific behavior is a
separate future component, not an `Input` prop.

## Long-text (backstop)

Input's label/value is expected to wrap or truncate unexpectedly long text without breaking the
token-driven height/radius. This is asserted by a held-out long-string render test (UI-SPEC "UI
Considerations"), not independently re-verified by this plan's own automated checks.
