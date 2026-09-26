# Button — DESIGN.md

`Button` is the single interactive-action primitive for the SepCare design system. D-08's
original "exactly four variants, no size axis" lock is **superseded by D-12**: real Figma
component frames revealed additional button archetypes beyond the original flat-fill set, and
this file's variant table now grows to match what those frames actually show (D-15), not a
guessed 1:1 rename of the old four names. TypeScript's closed union (the exported `ButtonVariant`
type) still rejects anything outside the currently-listed variants at compile time — the surface
stays finite, it just isn't frozen at exactly four anymore.

**Verified against Figma node(s) `203-11745`, `203-14032`, `203-11521`, `266-9285`** — all four
D-12 button-treatment nodes, fully reconciled (see the two "Figma extraction" sections below for
the per-node provenance and disposition trail).

## Figma extraction (D-15, Task 1 of 06-06)

**Verified against Figma node `203-11745` on 2026-09-27** — "Connect Device", the first of four
button-treatment nodes D-12 flagged for reconciliation (file key `4J2wGl4C6QG4yyeOnldRwl`).
Extracted values (via the orchestrator's `get_design_context`/`get_metadata` call, relayed to
this executor per the D-15 Figma-extraction workaround — see
`.planning/phases/06-design-system-tailwind-v4-tokens/06-FIGMA-EXTRACTS.md`):

- Shape: pill, `border-radius: 10px` (not `--radius-btn`'s 14px — a genuinely distinct radius,
  added as new token `--radius-cta`)
- Background: `linear-gradient(127deg, rgb(248,113,113) 2.3%, rgb(249,141,141) 94.9%)` — i.e.
  `pink-500` → `pink-400`, added as new token `--gradient-cta` (referencing only existing pink
  primitives, no new hex introduced)
- Shadow: `drop-shadow(0px 2px 2px rgba(218,220,224,1))` — `rgba(218,220,224,1)` is exactly
  `--color-neutral-200`; implemented as a new semantic token `--shadow-cta` (box-shadow, not a
  `filter: drop-shadow`, for consistency with every other shadow token in this codebase)
- Padding: 10px all sides, `gap-[10px]` between icon and label
- Icon: 20px, "glyphs:signal-bold" (connectivity/signal glyph — `<Icon name="signal" />` is the
  closest existing match in `src/components/icon.tsx`)
- Text: 12px **Bold** (`--text-caption`), color `--color-text-inverse`
- **Reconciliation finding:** this node does NOT map 1:1 onto the existing `primary` variant as
  the plan's own action text speculated it "likely" would — it is pink/gradient, not
  `brand-fill` blue, and uses a 10px radius the existing `primary` variant does not. Per D-12's
  explicit instruction to reconcile against what the frame actually shows rather than assume a
  rename, this is implemented as a new variant, `cta`, leaving `primary`/`secondary`/`tertiary`/
  `critical` untouched.
- **Screenshot comparison:** deferred to the orchestrator. This executor has no Figma MCP or
  browser/screenshot tool access (see the D-15 Figma-extraction workaround note in
  `06-FIGMA-EXTRACTS.md`); the orchestrator will screenshot the rendered `cta` variant (demoed on
  `/design-system/nested`) against the Figma `get_screenshot` output for node `203-11745` after
  this plan's SUMMARY.md lands, and record the comparison result at that time.

## Figma extraction — remaining 3 nodes (D-15, Task 2 of 06-06)

**Important finding, carried from the orchestrator's extraction (`06-FIGMA-EXTRACTS.md`):** the
4 node IDs D-12 grouped as "4 button treatments" are **not** 4 variants of one visual family —
they resolve to **3 distinct archetypes**. Archetype A (gradient CTA pill) covers 2 nodes
(`203-11745`, `203-14032`); archetypes B and C are icon-only, one node each. Per-node
disposition:

- **Node `203-14032` "Call Ambulance"** — same pill shape/padding/radius as `203-11745`
  (archetype A), gradient shifted one shade darker/redder (`linear-gradient(135deg, rgb(239,68,68)
  2.3%, rgb(248,113,113) 94.9%)` = `pink-600`→`pink-500`, new token `--gradient-cta-critical`),
  label weight SemiBold (not Bold). **Disposition: kept as a distinct variant, `cta-critical`**
  — not folded into `cta` (Figma clearly authored two different intensities, both preserved) and
  not a duplicate. Semantic note: this pill archetype uses the pink family for BOTH a
  device/connectivity action (`cta`) and a genuinely critical one (`cta-critical`) — a real
  tension with D-04 ("pink reserved for Critical/Red status only"). Resolved the same way D-17
  resolved the analogous Nav tension: match the Figma screenshot exactly rather than "fixing" it
  to blue — device-connectivity and health-status are treated as different semantic dimensions,
  both allowed to use the pink hue, per the same reasoning D-17 already established for Nav's
  active-tab color.
- **Node `203-11521` "Button Icon FAB"** — bordered, no-fill icon-only button. Layer named
  "Monotone add" but the rendered screenshot shows a left-chevron/back-arrow, not a `+` — the
  layer name is stale in the source file; built the chevron actually visible, not a plus (per
  the extraction doc's explicit correction; `Icon name="back"` already renders exactly this
  glyph in `src/components/icon.tsx`). 10px radius (shared with archetype A's `--radius-cta`),
  `1px solid #0a0a11` border (= `--color-text`, exact match, no new token needed), 16px padding,
  24px icon, no fill. **Disposition: new variant, `icon-outline`** — this is an icon-only
  archetype, structurally unlike the text+icon pill or the flat-fill text variants, so it is not
  a pseudo-state of any existing variant nor a duplicate.
- **Node `266-9285` (Home-screen header icon button)** — filled dark icon-only button, fixed
  40×40px, 12px radius (new token `--radius-icon-btn`, distinct from both `--radius-btn` 14px
  and `--radius-cta` 10px), fill `#42475e` (= `--color-neutral-700`, new semantic alias
  `--color-icon-fill-dark`), 24px icon (rendered instance rotated -90deg, but that rotation is
  specific to this one Home-screen usage, not an inherent property of the button — left to the
  caller, not baked into the variant). **Disposition: new variant, `icon-filled`** — distinct
  fixed-size filled archetype, not a pseudo-state or duplicate of `icon-outline` (different
  shape: outlined/no-fill/auto-sized vs. filled/fixed-40px-square).

No node in this set turned out to be a duplicate of another, and none is folded into an existing
variant's hover/active/disabled pseudo-state — all four resolve to genuinely distinct visual
treatments, now covering 2 archetypes as flat CVA variants each (`cta`/`cta-critical`,
`icon-outline`/`icon-filled`).

## Variants

| Variant | Canonical usage | Visual treatment |
|---------|------------------|-------------------|
| `primary` | The main/default action on a screen (e.g. "Sync Now") — at most one `primary` Button per view/section | Filled `brand-fill` background, inverse text |
| `secondary` | A dismiss or alternate action alongside a `primary` (e.g. "Cancel", "Not Now") | White/soft surface, bordered, default text color |
| `tertiary` | An in-card or in-line text link (e.g. "View Details →") | Text-only, brand-colored, underlines on hover |
| `critical` | An urgent clinical action only (e.g. "Call Clinician") — never a generic destructive/delete action | Filled `critical-fill` background, inverse text |
| `cta` | A device/connectivity CTA rendered as a standalone pill (e.g. "Connect Device") — Figma node `203-11745` | Pink gradient fill (`--gradient-cta`), 10px radius, 12px Bold label, neutral-tinted shadow |
| `cta-critical` | The emergency-action CTA pill (e.g. "Call Ambulance") — Figma node `203-14032` | Darker pink gradient fill (`--gradient-cta-critical`), same pill shape as `cta`, 12px SemiBold label |
| `icon-outline` | A bordered icon-only action (e.g. back/close on a device-pairing flow) — Figma node `203-11521` | No fill, 1px `--color-text` border, 10px radius, 16px padding around a 24px icon |
| `icon-filled` | A filled icon-only action inside a dark header/toolbar (e.g. Home screen header) — Figma node `266-9285` | Fixed 40×40px, `--color-icon-fill-dark` fill, 12px radius, inverse icon color |

There is no separate `size` prop this phase for the flat-fill text variants — `primary`/
`secondary`/`tertiary`/`critical` still render at one fixed size (`px-5 py-3`, `rounded-btn`,
`text-body`/`font-semibold`). `cta`/`cta-critical` intentionally override padding/radius/
text-size per their own Figma spec (10px/10px, `rounded-cta`, `text-caption`); `icon-outline`/
`icon-filled` intentionally render icon-only (no text label expected as a child) at their own
fixed dimensions. None of this is a generic `size` prop — each variant's dimensions are that
specific archetype's locked visual treatment, per its own Figma node.

## Icon-only usage (44×44px touch-target backstop)

`icon-outline` (56×56px via 16px padding + 24px icon) and `icon-filled` (fixed 40×40px) both meet
or exceed the project's 44×44px minimum touch target (`icon-filled`'s 40×40px visual box sits
just under that on its own — treat 40×40px as the *visual* size and ensure any real usage still
gets a 44×44px hit-area, e.g. via a parent wrapper or `min-size-11` on the interactive element,
consistent with 06-UI-SPEC.md's "44×44px minimum touch target" backstop rule for icon-only
controls).

## Loading sub-state

`loading?: boolean` hides the label (space reserved via `opacity-0`, not removed from layout) and
shows a centered spinner overlay. Button height/padding/width never change between loading and
non-loading — this is what makes it safe to toggle mid-interaction without any layout shift.
The spinner respects `prefers-reduced-motion` (`motion-safe:animate-spin`) and its rotation speed
is token-driven (`--duration-slow`), not a hardcoded literal.

## Correct usage

```tsx
<Button variant="primary">Sync Now</Button>
<Button variant="critical">Call Clinician</Button>
<Button variant="primary" loading>Sync Now</Button>
<Button variant="cta">
  <Icon name="signal" className="size-5" />
  Connect Device
</Button>
<Button variant="cta-critical">
  <Icon name="phone" className="size-5" />
  Call Ambulance
</Button>
<Button variant="icon-outline" aria-label="Back">
  <Icon name="back" className="size-6" />
</Button>
<Button variant="icon-filled" aria-label="Sort">
  <Icon name="sort" className="size-6" />
</Button>
```

## Incorrect usage

```tsx
// ✗ Rejected by TypeScript — "outline" is not a member of the locked variant union.
<Button variant="outline">Learn More</Button>

// ✗ icon-outline/icon-filled are icon-only archetypes — do not pass a text
// label as a visible child; use `aria-label` for the accessible name instead.
<Button variant="icon-filled">Sort</Button>
```

`variant` only accepts the finite union exported as `ButtonVariant` from `button.tsx`:
`"primary" | "secondary" | "tertiary" | "critical" | "cta" | "cta-critical" | "icon-outline" |
"icon-filled"`. Any other string literal is a compile-time error, not a runtime fallback — this
is deliberate: it is the mechanism that keeps the variant surface finite.

## Overflow / long-text (backstop)

The label is expected to truncate/ellipsis rather than resize the Button, and to wrap or
truncate long text without breaking the token-driven height/radius. This is asserted by a
held-out long-string render test (UI-SPEC "UI Considerations"), not independently re-verified by
this plan's own automated checks — see the Plan 06-03 Summary's Coverage section for the
human-judgment/backstop framing.
