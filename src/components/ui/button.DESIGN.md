# Button — DESIGN.md

`Button` is the single interactive-action primitive for the SepCare design system. It exposes
exactly **four** locked variants and no separate size axis — an agent cannot invent a `ghost`,
`destructive`, `link`, or `outline` variant; TypeScript's closed union rejects anything outside
the four names below at compile time.

## Variants

| Variant | Canonical usage | Visual treatment |
|---------|------------------|-------------------|
| `primary` | The main/default action on a screen (e.g. "Sync Now") — at most one `primary` Button per view/section | Filled `brand-fill` background, inverse text |
| `secondary` | A dismiss or alternate action alongside a `primary` (e.g. "Cancel", "Not Now") | White/soft surface, bordered, default text color |
| `tertiary` | An in-card or in-line text link (e.g. "View Details →") | Text-only, brand-colored, underlines on hover |
| `critical` | An urgent clinical action only (e.g. "Call Clinician") — never a generic destructive/delete action | Filled `critical-fill` background, inverse text |

There is no separate `size` prop this phase — every Button renders at one fixed size
(`px-5 py-3`, `rounded-btn`, `text-body`/`font-semibold`). A future phase that genuinely needs a
compact/icon-only size must extend this contract deliberately, not have an agent invent one ad hoc.

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
```

## Incorrect usage

```tsx
// ✗ Rejected by TypeScript — "outline" is not a member of the locked variant union.
<Button variant="outline">Learn More</Button>
```

`variant` only accepts `"primary" | "secondary" | "tertiary" | "critical"` (the `ButtonVariant`
type exported from `button.tsx`). Any other string literal is a compile-time error, not a runtime
fallback — this is deliberate: it is the mechanism that keeps the variant surface finite.

## Overflow / long-text (backstop)

The label is expected to truncate/ellipsis rather than resize the Button, and to wrap or
truncate long text without breaking the token-driven height/radius. This is asserted by a
held-out long-string render test (UI-SPEC "UI Considerations"), not independently re-verified by
this plan's own automated checks — see the Plan 06-03 Summary's Coverage section for the
human-judgment/backstop framing.
