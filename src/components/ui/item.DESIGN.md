# Item — DESIGN.md

`Item` (with `ItemMedia`/`ItemContent`/`ItemTitle`/`ItemDescription`/`ItemActions`/`ItemGroup`,
`ItemHeader`/`ItemFooter`/`ItemSeparator`) is the shadcn `item` registry component (`npx shadcn add
item`, no `-b`/`--base` flag — `add` has no such option in CLI 4.21.0, verified live in
`06-RESEARCH.md`), restyled to this project's semantic token layer. **It is the canonical
row/list-item primitive** — every "instruction row," "list-item card," or settings-style row
pattern composes from `Item`, never from a hand-rolled `<div>` row.

## Verified against Figma node `266-9257`

The Home screen node's instruction-list region — relayed via the orchestrator's
`get_design_context` call, per the D-15 workaround (this executor has no direct Figma MCP access;
see `.planning/phases/06-design-system-tailwind-v4-tokens/06-FIGMA-EXTRACTS.md`'s Card-family
section, which covers the same node's card `266-9387` — "Continue Regular Feeding" — that this
row's typography was extracted from). Extracted values applied to `Item`'s icon+title+description
layout:

- Icon tile (`ItemMedia variant="icon"`): 48px, `rounded-16`, flat neutral-100 fill — the exact
  same icon-tile pattern `card.DESIGN.md`'s Instruction Row Card uses, so `ItemMedia`'s `icon`
  variant reuses the same `--color-icon-tile-neutral` token rather than re-deriving a second value
  for what is visually the same tile.
- `ItemTitle`: 14px Bold, `--color-text-strong` (neutral-800) — identical to `CardTitle`'s
  Task 1 restyle, since both primitives render the same "Continue Regular Feeding"-style content
  depending on which composition (Card-per-row vs. Card+many-Items) a later plan picks.
- `ItemDescription`: 12px Regular, `--color-text-subtle` (neutral-400) — identical to
  `CardDescription`'s Task 1 restyle, same reasoning.
- Gap between icon tile and content: 16px (`Item`'s `size="default"` already ships `gap-4`/`p-4` —
  no change needed, it already matched before this restyle).

**Structural note on composition (see `card.DESIGN.md`'s Card Type Map, row 2):** the real
extraction found Figma node `266-9387` is itself a **self-contained instruction-row card** — its
own shadow/radius/padding, not a bare row inside one shared outer container. This means the actual
Home screen instruction list may end up composed as a vertical stack of individually-carded rows
(`Card` per instruction), not literally "one `Card` wrapping many `Item` rows," which is a
correction to the earlier `06-UI-SPEC.md` draft's speculative framing (written before any real
per-node extraction existed). Regardless of which composition a later plan picks, `Item`'s own
typography stays Figma-grounded against the same real values, so it is ready for either shape.

**Screenshot comparison:** not yet performed — deferred to the orchestrator's post-dispatch
screenshot-diff pass, same deferral pattern as `card.DESIGN.md`/`button.DESIGN.md`.

## Restyle from the shadcn scaffold

The generated `item.tsx` used several of shadcn's own default semantic token names
(a `bg`-prefixed muted-surface role, an `accent`-prefixed hover role, a `ring`-prefixed
focus-ring pair, and a muted-foreground text role) that this project's `@theme` block does not
declare — this project has its own bespoke semantic layer instead. Every one was replaced:

| Stock class | This project's replacement | Why |
|---|---|---|
| a muted-surface fill role (`variant="muted"`, `ItemMedia variant="icon"`'s fill) | `bg-bg` / `bg-icon-tile-neutral` | `--color-bg` (neutral-100) is this project's subtle-surface token; the icon-tile fill reuses the exact token `card.DESIGN.md`'s Instruction Row Card icon tile uses |
| an accent-tinted link-hover role | `hover:bg-bg` | Same subtle-surface token, consistent hover treatment |
| a ring-color + ring-width focus pair | `focus-visible:border-border-focus focus-visible:shadow-focus` | Matches `Input`'s existing focus convention exactly (box-shadow token, not a ring utility) — no second focus mechanism invented |
| a muted-foreground text role | `text-text-subtle` (via `ItemDescription`) | Same token `CardDescription` uses — cross-component consistency for the same visual role |
| a primary-color link-hover role | `text-brand` | Matches the project's "interactive elements use brand blue" rule |

`separator.tsx` (installed as `Item`'s dependency) needed no token fix — its one color class,
`bg-border`, is an exact existing match in this project's theme.

## Correct usage

```tsx
// Instructions list — one Item per instruction, grouped for consistent spacing
<ItemGroup>
  <Item>
    <ItemMedia variant="icon">
      <Icon name="feeding" />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Continue Regular Feeding</ItemTitle>
      <ItemDescription>Keep baby&rsquo;s room between 26&ndash;28&deg;C.</ItemDescription>
    </ItemContent>
  </Item>
  <Item>
    <ItemMedia variant="icon">
      <Icon name="baby" />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Monitor Skin Contact</ItemTitle>
      <ItemDescription>Skin-to-skin contact helps regulate temperature.</ItemDescription>
    </ItemContent>
  </Item>
</ItemGroup>
```

## Incorrect usage

```tsx
// ✗ Do not hand-roll a new row component for instruction/list-row content —
// Item already exists precisely so this pattern is never re-invented per page.
<div className="flex items-center gap-4 p-4">
  <div className="size-12 rounded-2xl bg-neutral-100" />
  <div>
    <p className="font-bold">Continue Regular Feeding</p>
    <p className="text-neutral-400">Keep baby&rsquo;s room between 26&ndash;28&deg;C.</p>
  </div>
</div>
```

## Overflow / long-text (backstop)

`ItemDescription` ships `line-clamp-2` from the shadcn scaffold (kept — a long-string render test
is expected to confirm it clamps rather than pushing the row's height, per the same
"layout never changes"-family backstop `card.DESIGN.md`/`badge.DESIGN.md` document). `ItemTitle`
has no clamp of its own; a long title is expected to wrap within the row's token-driven spacing
without breaking `ItemContent`'s `flex-1` sizing. Neither is independently re-verified by this
plan's own automated checks.
