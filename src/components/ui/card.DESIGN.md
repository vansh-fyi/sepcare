# Card — DESIGN.md

`Card` is the single surface-container primitive. It has **no variants** — every Card looks the
same (`rounded-card bg-surface shadow-card p-4`), because its job is to be a consistent, boring
container that content states differ *inside*, never a component whose own shape/skin changes
per state.

**Verified against Figma node(s) `266-9387`, `266-9344`** — the two nodes this plan's Task 1
confirmed, file key `4J2wGl4C6QG4yyeOnldRwl`. See "Figma extraction" below for the per-node
provenance and disposition trail.

**Naming correction:** the plan that scoped this task (and the UI-SPEC that preceded it) guessed
node `266-9387` was the "vital stat card" and `266-9344` was the "status hero card." The real
extraction (relayed via `.planning/phases/06-design-system-tailwind-v4-tokens/06-FIGMA-EXTRACTS.md`,
since this executor has no direct Figma MCP access) found the opposite pairing: `266-9387` is the
**Instruction Row Card** and `266-9344` is the **Vital Stat Card**. This is exactly the class of
mistake D-15's mandatory extraction-before-building step exists to catch — the two node IDs below
are inspected as themselves, not as whatever the stale guess called them.

## Composition

| Element | Role | Classes |
|---------|------|---------|
| `Card` | Outer surface | `rounded-card bg-surface shadow-card p-4` |
| `CardHeader` | Optional heading/eyebrow region | `flex flex-col gap-2 mb-4` |
| `CardTitle` | Title text | `text-sm font-bold leading-tight text-text-strong` |
| `CardDescription` | Subtitle/description text | `text-xs leading-normal text-text-subtle` |
| `CardAction` | Header corner slot (icon/button) | `col-start-2 row-span-2 row-start-1 self-start justify-self-end` — layout only, not Figma-verified this pass (no confirmed node shows rendered content here) |
| `CardContent` | Main body — the only region whose children differ between states | `flex flex-col gap-4` |
| `CardFooter` | Optional footer row | `flex items-center [.border-t]:pt-4` |

## Figma extraction (D-15, Task 1 of 06-07)

**Verified against Figma node `266-9387` on 2026-09-27** — Instruction Row Card ("Continue Regular
Feeding"), one of this plan's two confirmed base-verification nodes. Extracted values (relayed via
the orchestrator's `get_design_context`/`get_metadata` call, per the D-15 workaround — see
`06-FIGMA-EXTRACTS.md`'s "Card-family nodes (06-07 — Card + Item)" section):

- Outer card: `border-radius: 24px`, `padding: 16px`
- Icon tile: 48px, `rounded-16`, flat neutral-100 bg (`#f5f5f8`), 20px icon centered
- Title: 14px Bold, color neutral-800 (`#222737`)
- Subtitle: 12px Regular, color `#9aa0af` (neutral-400)
- Shadow: `0px 2px 8px rgba(0,0,0,0.05)` (plain neutral, no color tint)
- Gap between icon tile and text block: 16px

**Verified against Figma node `266-9344` on 2026-09-27** — Vital Stat Card (Pulse/Temp/Activity),
this plan's second confirmed base-verification node. Extracted values:

- Outer card: `border-radius: 24px`, `padding: 16px` — same as `266-9387`, confirming these two
  values are common ground across card types, not one card's local choice
- **Structurally different from `266-9387`:** full-bleed gradient background (the whole card *is*
  the gradient — no separate white surface + icon tile), 132.5deg `rgb(37,99,235)`→`rgb(59,130,246)`
  (blue-500→blue-400, exact match to existing `--color-blue-500`/`--color-blue-400` primitives) for
  the Pulse variant specifically
- Content vertically split: label+icon row top, sparkline middle (76×26px slot), big number+unit
  row bottom
- Label: 14px SemiBold, white; Number: 21px Inter Extra Bold, white; unit: 10px Inter Medium, white

**Reconciliation — what changed in `card.tsx`/`globals.css` as a result:**

1. **`--radius-card` corrected 20px → 24px.** Both confirmed nodes extract to 24px, not the
   previously-guessed 20px. Now numerically identical to `--radius-hero` — kept as a distinct
   semantic name (the hero treatment could diverge again later), not merged into one token.
2. **`Card`'s padding corrected `p-6` (24px) → `p-4` (16px).** Both confirmed nodes extract to 16px
   padding, not 24px.
3. **`--shadow-card` corrected** from a deeper/darker guessed value to the real
   `0 2px 8px rgba(0, 0, 0, 0.05)` extracted from `266-9387`'s plain-neutral shadow (this is the
   *default* card shadow; card types with a color-tinted shadow, e.g. the hero card, override it —
   see the Card Type Map below).
4. **`CardTitle`/`CardDescription` restyled from unstyled/placeholder classes to real Figma
   values.** Neither `--color-text` (neutral-900) nor `--color-text-muted` (neutral-500) matches
   the observed title/subtitle colors (neutral-800, neutral-400) — two small additive semantic
   tokens (`--color-text-strong`, `--color-text-subtle`) were added rather than force-fitting an
   existing token or hardcoding a literal in `card.tsx`.
5. **`CardFooter`'s redundant `px-6` removed (Rule 1 bug fix, not a Figma finding).** The stock
   scaffold had both `Card`'s own `p-6` *and* `CardFooter`'s own `px-6`, double-counting horizontal
   padding whenever `CardFooter` was used inside `Card` (unlike stock shadcn's Card, which has no
   built-in padding of its own and relies entirely on each region's `px-6`). Now that `Card` reliably
   insets every child on all sides, `CardFooter` only needs its own top-border spacing —
   `pt-6` → `pt-4` to match the corrected 16px scale.
6. **Weight-discipline tension resolved by matching Figma exactly.** `06-UI-SPEC.md`'s typography
   section reserves 700-weight bold for three specific roles (Display, page-title Heading,
   Vital-metric) and asks every other component to use 600 + color instead. Both confirmed nodes
   show card titles at **Bold (700)**, not SemiBold — this UI-SPEC rule was authored before any real
   per-node Figma data existed for cards. Per the same precedent already established twice this
   phase (06-06's `cta` pink-for-non-critical resolution, D-17's Nav active-color resolution): when
   real extracted Figma data conflicts with an earlier draft's inference, match Figma, don't force
   the earlier draft's guess. `CardTitle` uses `font-bold`.

**Screenshot comparison:** not yet performed — this executor has no Figma MCP/browser tool access
(per the D-15 workaround). Deferred to the orchestrator's post-dispatch screenshot-diff pass against
`/design-system/nested` or `/design-system/states`, the same deferral pattern `button.DESIGN.md`
already documents for 06-06.

## Card Type Map (D-12, resolved — Task 2 of 06-07)

All 6 D-12 Figma card-type nodes were inspected (via the orchestrator's `06-FIGMA-EXTRACTS.md`
relay, same D-15 workaround as above). **Finding: all 6 are genuinely distinct visual patterns —
none collapse into a shared generic `Card` variant prop.** Common ground across all 6: `24px`
corner radius, `16px` padding, `16px` gap between icon-tile/content — i.e. exactly the base
`Card` primitive Task 1 just corrected. Everything else (background treatment, icon-tile color,
title/subtitle size, shadow tint) is composition, not a base-primitive concern.

| # | Figma node | Working name | Disposition | Composition |
|---|-----------|--------------|-------------|--------------|
| 1 | `266-9323` | **Status Hero Card** ("Baby is Resting Safely") | (b) composition | `Card` + a 72px `rounded-16` icon tile using the new `--gradient-card-hero-icon` token (green-700→green-500, 135deg) + `<CardTitle className="text-base">` override (16px Bold neutral-800, base default is 14px) + `<CardDescription className="text-sm text-text-hero-muted">` override (14px, new `--color-text-hero-muted` token — `#7b82a0` is distinct from `--color-text-muted`'s `#808699`, close but not identical) + a green-tinted shadow override (`shadow-[0px_2px_8px_rgba(208,241,237,0.5)]` at the usage site — this specific tint is a one-off, not promoted to a token, since no other card type shares it) |
| 2 | `266-9387` | **Instruction Row Card** | base primitive (Task 1) | `Card` (default, unmodified) + a 48px `rounded-16` icon tile using the new `--color-icon-tile-neutral` token + default `CardTitle`/`CardDescription` — this is the base-case default the whole primitive was tuned against |
| 3 | `266-9344` | **Vital Stat Card** (Pulse/Temp/Activity) | (b) composition, deliberately *not* promoted to a new component | A plain full-bleed-gradient `<div>` (not `Card` — it has no separate white surface, so `bg-surface` doesn't apply) sharing `Card`'s `rounded-card p-4` shell, using the new `--gradient-metric-pulse` token for the Pulse tone specifically; label+icon row, a sparkline slot (children — the actual `Sparkline` component is a separate UI-SPEC composite, out of this plan's scope), and a number+unit row (`tabular-nums`, per UI-SPEC's Vital-metric typography role). **Temp/Activity tones are not implemented in this plan** — the Figma node only gave an exact gradient for Pulse ("other vitals follow the same pattern with their respective status hue" per `06-FIGMA-EXTRACTS.md`, without exact stops). Considered promoting this to a `CardMetric` export in `card.tsx` (the plan's own example of a legitimate disposition-(a) case), but with only one of three tones' exact values extracted, a formal 3-tone component would either fabricate two gradients or ship an incomplete enum — deferred to whichever later plan builds the real vitals row (Home-proof or its own dedicated plan), which will have fresh Figma access to extract Temp/Activity exactly |
| 4 | `203-13605` | **Metric Row Card** ("Perfusion Index") | (c) duplicate of #2 (Instruction Row Card), with two swapped tokens | Identical shape to `266-9387` — icon tile bg swapped to the new `--color-icon-tile-green` token (green-100) instead of neutral-100, and `<CardDescription className="text-text-muted">` override (12px, existing `--color-text-muted`/neutral-500 — this card's subtitle color is an *exact* match to that existing token, unlike `266-9387`'s, which needed the new `--color-text-subtle`/neutral-400) |
| 5 | `203-13559` | **Device Status Card** (no progress) | (b) composition | `Card` + a 72px `rounded-16` icon tile using the new `--gradient-card-device-icon` token (pink-500→pink-300, 180deg — vertical, not diagonal like the CTA-button gradients) + `<CardTitle className="text-xl">` override (20px Bold) + `<CardDescription>` with an inline `<strong>`/`font-bold` span for the bolded "SKU-1234" segment + the new `--shadow-card-device` token (Figma authored this shadow directly against `--color-neutral-200`, not an rgba literal) |
| 6 | `203-11669` | **Device Status Card** (with progress) | (b) composition, same base as #5 | Same composition as `203-13559` plus an edit-pencil icon (`tabler:edit`, 20px) beside the title, and a percentage-driven horizontal bar slot. **Per `06-FIGMA-EXTRACTS.md`'s explicit disposition guidance, this resolves D-16's open question: name the future component `progress` (a generic horizontal bar), not a battery-shaped indicator** — none of the 6 card nodes show an actual battery glyph. Building that `Progress` primitive itself is **06-08's job, not this plan's** (`item.tsx`/`card.tsx` are this plan's only files) — resolved here means "given a working name and composition shape," not "implemented" |

Every row above has a resolved disposition — none is left open. Each follows the same reasoning already established
twice elsewhere in this phase (06-06's `cta` gradient reconciliation, D-17's Nav active-color call):
match the real extracted Figma value, even when it conflicts with an earlier draft's guess, and
only add a token/component when the value is genuinely new — never fabricate precision (see the
Vital Stat Card's Temp/Activity gap above) and never force a shared token where the extracted
values actually differ (see Metric Row Card's `--color-text-muted` vs Instruction Row's
`--color-text-subtle`).

## The "layout never changes" rule (DESIGN-SYSTEM.md §9)

Card's structural DOM nesting — `Card > CardHeader? > CardContent` — must be identical across
empty, loading, and populated content states. Only the **children passed into `CardContent`**
differ; the Card/CardHeader/CardContent wrapper elements themselves are never added, removed, or
swapped based on a content-state prop. **This rule held throughout the Task 1 restyle** — no new
wrapper, no conditional DOM structure was introduced; only existing elements' classes changed.

## Correct usage

```tsx
// Populated
<Card>
  <CardHeader>
    <CardTitle>Recent Readings</CardTitle>
  </CardHeader>
  <CardContent>{readings.map(r => <ReadingRow key={r.id} {...r} />)}</CardContent>
</Card>

// Empty — same structure, different CardContent children
<Card>
  <CardHeader>
    <CardTitle>Recent Readings</CardTitle>
  </CardHeader>
  <CardContent>
    <p>No readings yet</p>
    <p>Vitals will appear here once the device starts sending data.</p>
  </CardContent>
</Card>
```

## Incorrect usage

```tsx
// ✗ Violates the "layout never changes" rule — the wrapper only appears for
// the loading case, meaning Card's own structure branches on content state.
{isLoading ? (
  <div className="loading-wrapper">
    <Card><CardContent><Skeleton /></CardContent></Card>
  </div>
) : (
  <Card><CardContent>{content}</CardContent></Card>
)}
```

If a loading/empty treatment needs different outer chrome, that is a sign it belongs in a future
composite component built on top of Card — not a reason to make the atomic Card itself branch.

## Overflow / long-text (backstop)

A Card heading is expected to truncate/ellipsis rather than resize the Card. This is asserted by a
held-out long-string render test (UI-SPEC "UI Considerations"), not independently re-verified by
this plan's own automated checks.
