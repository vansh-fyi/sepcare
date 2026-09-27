# Label — DESIGN.md

`Label` is the shadcn `radix-ui` `Label.Root` wrapper, restyled onto the project's token layer.
It is not a standalone display component — its role is to pair with a field control via
`htmlFor`/`id`, and going forward it is primarily consumed through `FieldLabel` inside the new
`Field` wrapper family (`@/components/ui/field`) rather than used bare in new field compositions.

## Treatment

- Typography: `text-label font-semibold` (13px/600 semibold, the project's `--text-label` token) —
  replaces the stock shadcn `text-sm leading-none font-medium` classes.
- Disabled-group and peer-disabled opacity/cursor behavior is unchanged from the shadcn default
  (`group-data-[disabled=true]:opacity-50`, `peer-disabled:cursor-not-allowed peer-disabled:opacity-50`).
- `cn` import normalized to `@/lib/utils` (the re-export used by every other component in this
  directory — Badge, Input, Button, Card, Item, Progress, Toggle, ToggleGroup, Separator) instead
  of the raw `cn` package import shadcn's CLI generates by default, for import-path consistency
  across `src/components/ui/`.

## Correct usage

```tsx
<Label htmlFor="device-id">Device ID</Label>
<Input id="device-id" placeholder="e.g. nb-001" />
```

Preferred going forward — via `Field`/`FieldLabel` (see `field.DESIGN.md`):

```tsx
<Field>
  <FieldLabel htmlFor="device-id">Device ID</FieldLabel>
  <Input id="device-id" placeholder="e.g. nb-001" />
</Field>
```

## Incorrect usage

```tsx
// ✗ Do not hand-roll a <label> with ad hoc text classes — this is exactly the pattern
// `nested/page.tsx` used before Label existed; new fields should use Label (directly or via
// FieldLabel), not a bespoke <label className="...">.
<label className="text-xs font-bold">Device ID</label>
```

## Figma verification (06-09, 2026-09-27)

No dedicated Figma node exists for Label — D-12's own component table lists Label as new-but-
unspecified ("paired with every form field," no node ID). The visual reference actually used is
the hand-rolled `<label className="text-label font-semibold text-text">` already present in
`src/app/design-system/nested/page.tsx` (predates this plan), which itself derives from the
`--text-label` token shared with Badge. This is the same "token-consistent, not Figma-node-
verified" disposition already used for Badge (06-08) and Item (06-07) — an honest disposition, not
a guess dressed up as verified.
