# NavLink — DESIGN.md

`NavLink` is the single bottom-tab-bar link primitive, hand-authored (no shadcn equivalent
exists for this archetype). Composed exclusively by `nav-bar.tsx`.

**Verified against Figma node `279-220` on 2026-09-27** — both states ("Open"/active and
"Deselected"/inactive) of the nav-link component, per the orchestrator's D-15 extraction handoff
(`.planning/phases/06-design-system-tailwind-v4-tokens/06-FIGMA-EXTRACTS.md`'s "Nav-family nodes"
section; this executor has no Figma MCP/browser tool access, per the D-15 workaround).

## Figma extraction

- **Shape (both states):** pill, `height: 44px` (`h-11`), `border-radius: 10px` — shares the
  existing `--radius-cta` token (Button's `cta` archetype is also 10px) rather than a duplicate,
  `padding: 10px` (`px-[10px]`).
- **Active ("Open") state:** background `linear-gradient(116deg, rgb(248,113,113) ->
  rgb(249,141,141))` = `pink-500` -> `pink-400`. This is the SAME two color stops as Button's
  `cta` gradient but a DIFFERENT angle (116deg vs. 127deg) — per the extraction's explicit
  instruction, kept as its own token, `--gradient-nav-active`, not collapsed into
  `--gradient-cta`. Drop shadow `0px 2px 2px rgba(218,220,224,1)` = exactly `--color-neutral-200`
  — this is numerically identical to the existing `--shadow-cta` token, so `shadow-cta` is reused
  directly rather than adding a duplicate-valued token. Content: 20px icon (white,
  `text-inverse`) + label "Home" 12px Bold (`text-caption font-bold`), white. Below the pill: a
  5px-tall, full-width indicator bar, gradient-to-top `pink-300` -> `pink-500`
  (`--gradient-nav-indicator`, a distinct stop pair from the pill's own fill).
- **Inactive ("Deselected") state:** white background (`bg-surface`), `1px solid` border in
  `neutral-100` — this is exactly the value of the existing `--color-bg` semantic token (page
  background), so the border reuses `border-bg` directly rather than adding a new
  `--color-border-*` token purely for this one hairline. Icon only (no label), neutral gray
  (`text-text-muted`, neutral-500 — closest existing muted-text alias, exact shade wasn't
  distinguishable further in the extraction). Indicator bar below: flat neutral-100, reusing the
  same `bg-bg` token as the border (not a gradient).
- **Indicator bar radius:** Figma specifies `rounded-5` on a 5px-tall bar. `rounded-full` renders
  visually identically at that aspect ratio (border-radius caps at half the element's own
  height/width) — same reasoning already applied to the BatteryIndicator track in `globals.css`
  (06-08 precedent) — so no new radius token was added for it.
- **Icon-to-label gap:** the extraction didn't record an exact pixel value for this gap; `gap-1`
  (4px, the existing spacing ladder's `xs` step) was used as a reasonable default. Flag for the
  orchestrator's deferred screenshot-diff pass to confirm/correct if visually off.
- **Percentage stops:** neither gradient's extraction included exact color-stop percentages
  (unlike `--gradient-cta`'s 2.3%/94.9%) — both default to a plain 0%/100% two-stop gradient.
  Flagged for the same deferred screenshot-diff pass.

## D-17 color resolution

The active state's pill fill intentionally reuses the critical/pink hue family — this is **not**
re-flagged as an open tension. D-17 (06-CONTEXT.md, locked) already resolved the "red-accented
bottom nav vs. D-04" tension UI-SPEC originally raised: navigation-selected-state and
critical-health-status are treated as two different semantic dimensions (location vs. health),
both explicitly permitted to use the same pink hue. Implemented directly per the user's own
resolution, exactly as the Figma node shows, matching the same reasoning Button's `cta`/
`cta-critical` pink-for-non-critical tension was resolved with (button.DESIGN.md, 06-06).

**Screenshot comparison:** deferred to the orchestrator (D-15 workaround — no Figma MCP/browser
tool access in this executor). A live demo of both states has been added to
`/design-system/nested` for the orchestrator's post-dispatch screenshot-diff pass.

## Multi-modal rule (Badge precedent)

Active vs. inactive never differs by color alone — background fill, border, icon color, label
presence (label only renders when active), and the indicator bar all change together. This
exceeds badge.tsx's own multi-modal bar (icon+label+color together), since the inactive state
additionally omits the label entirely rather than just recoloring it — a real Figma-authored
content difference, not an implementation shortcut.

## Correct usage

```tsx
<NavLink href="/" icon="home" label="Home" state="active" />
<NavLink href="/vitals" icon="monitoring" label="Vitals" state="inactive" />
```

`icon` and `label` are always passed for every route (NavBar drives which single instance
renders `state="active"` from the current route) — `label` is simply not rendered visually when
`state="inactive"`, matching the Figma extraction exactly.

## Incorrect usage

```tsx
// ✗ NavLink has no asChild/Slot support — this invariant (icon+label+color
// pairing on the active state) must not be bypassable by substituting the
// rendered element.
<NavLink asChild icon="home" label="Home" state="active" />

// ✗ `state` only accepts the finite union exported as NavLinkState from
// nav-link.tsx: "active" | "inactive". Any other string is a compile-time
// error.
<NavLink href="/" icon="home" label="Home" state="selected" />
```

## Touch target / accessibility

`min-h-11 min-w-11` (44x44px) enforces the project's touch-target floor per 06-UI-SPEC.md's
Spacing Scale exception for every `NavLink` row — the pill itself is only 44px tall by shape, but
`min-w-11` guards the width floor too (in practice `flex-1` inside `NavBar` already stretches
each `NavLink` well past 44px wide). `aria-current="page"` is set on the active link's root
anchor per the UI-SPEC's accessibility row.

## Overflow / long-text (backstop)

The label uses `whitespace-nowrap` — long route labels are expected to be short, fixed strings
(4 fixed tab names in this phase's scope, per `06-FIGMA-EXTRACTS.md`'s NavBar node), not
user-generated content requiring a truncation strategy. Not independently re-verified by a
held-out render test this plan (unlike Card/Button's number/heading overflow backstop) — flagged
if a future phase introduces dynamic/localized tab labels.
