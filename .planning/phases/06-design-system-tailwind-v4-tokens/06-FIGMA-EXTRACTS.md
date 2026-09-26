# Phase 6 — Figma Extraction Notes (D-15 mechanism)

> **Why this file exists:** Executor subagents spawned via the Agent/Task tool do NOT inherit
> the project-scoped Figma MCP server (`mcp__plugin_figma_figma__*`) — only the top-level
> orchestrator session has it. D-15 requires every visual component to be built from
> real Figma-node-extracted values, not approximated by eye. Since executors can't call
> `get_design_context`/`get_metadata`/`get_screenshot` themselves, the orchestrator extracts
> the values here, ONE section per Figma node, and executors read this file instead of
> calling the tools directly. Executors still MUST do the second half of D-15 (screenshot
> the rendered result and visually compare) — that comparison is done by the orchestrator
> after the executor builds, using Chrome browser tools against the running dev server,
> since executors also lack browser/screenshot tools. Treat "not yet screenshot-verified"
> notes below as pending until the orchestrator confirms.

File key for all nodes below: `4J2wGl4C6QG4yyeOnldRwl` (Figma Segue 3.0)

---

## Button-family nodes (06-06 tracer + button reconciliation)

**Important finding:** the 4 node IDs CONTEXT.md D-12 grouped as "4 button treatments" are
NOT 4 variants of one Button component — they are 3 distinct button ARCHETYPES. Do not force
them into a single `variant` axis on the existing `button.tsx` if they don't fit; it's fine
(and correct) to end up with a Button `variant` union for the CTA-pill kind, plus a separate
`IconButton`/IconButton-in-Button-family for the icon-only kinds, per PATTERNS.md's "Card
layout never changes" style precedent (prefer composition over forcing one component to do
everything).

### Node `203:11745` — "Connect Device" (gradient CTA pill, archetype A)
- Shape: pill/rounded, `border-radius: 10px`
- Background: linear-gradient, ~127deg, from `rgb(248,113,113)` (pink-500) at 2.3% to
  `rgb(249,141,141)` (pink-400) at 94.9%
- Shadow: `drop-shadow(0px 2px 2px rgba(218,220,224,1))` (neutral-200 tint)
- Padding: 10px all sides (outer container `px-[10px]`, inner content wrapper `p-[10px]`,
  `gap-[10px]` between icon and label)
- Icon: 20px, "glyphs:signal-bold" (a signal/connectivity icon)
- Text: 12px, **Bold**, font family "Plus Jakarta Sans", color `#f5f5f8` (neutral-100)
- Content: icon + "Connect Device" label, horizontal, centered
- Screenshot: pink gradient rounded pill, white signal icon + "Connect Device" text, NOT yet
  screenshot-verified against a built component (pending — orchestrator will do this after
  the executor builds it)

### Node `203:14032` — "Call Ambulance" (gradient CTA pill, archetype A, critical variant)
- Shape: same pill archetype as above, `border-radius: 10px`
- Background: linear-gradient, ~135deg, from `rgb(239,68,68)` (pink-600/red) at 2.3% to
  `rgb(248,113,113)` (pink-500) at 94.9% — one shade darker/more red than "Connect Device"
- Shadow: same `drop-shadow(0px 2px 2px rgba(218,220,224,1))`
- Padding: identical to above (10px/10px/gap-10px)
- Icon: 20px, "line-md:phone" (phone icon)
- Text: 12px, **SemiBold** (not Bold — one weight lighter than "Connect Device"), same
  font/color
- Content: icon + "Call Ambulance" label
- Semantic read: this is the emergency/critical-action CTA — reinforces D-04 (pink/red
  reserved for critical). The two pill buttons together suggest a single `variant="cta-pill"`
  (or similar name) with the color gradient itself doing double duty as brand-vs-critical
  signal — decide the exact prop shape during implementation, but preserve BOTH distinct
  gradients (don't collapse to one flat color) and the Bold-vs-SemiBold text-weight
  difference, since Figma clearly authored them as slightly different intensities.
- Screenshot: red/pink gradient rounded pill, white phone icon + "Call Ambulance" text —
  NOT yet screenshot-verified against a built component.

### Node `203:11521` — "Button Icon FAB" (bordered icon-only button, archetype B)
- Shape: `border-radius: 10px`, `border: 1px solid #0a0a11` (neutral-900), no fill
- Padding: 16px all sides, icon 24px centered
- **Figma authoring quirk — trust the screenshot over the layer name:** the instance is
  named "Monotone add" (implying a `+` icon) but the actual rendered screenshot shows a
  **left-chevron / back arrow** ("‹"), not a plus sign. Build the chevron/back-arrow glyph
  that's actually visible, not a `+` — the layer name is stale/mislabeled in the source file.
- Screenshot: a black-bordered square-ish rounded button containing a left-pointing chevron.
  NOT yet screenshot-verified against a built component.

### Node `266:9285` — Home-screen header icon button (filled dark icon button, archetype C)
- Shape: `border-radius: 12px` (NOT 10px — different radius from archetypes A/B), filled
  background `#42475e` (neutral-700), size `40px` square
- Icon: 24.326px, "Interface / Sorting Left", rotated -90deg in this specific instance
  (context-specific rotation — the icon asset itself is not inherently rotated; only this
  usage rotates it)
- Screenshot: a dark rounded-square icon button. NOT yet screenshot-verified.
- Context: this is one of the two icon buttons in the Home screen's top header row (next to
  the smartwatch/device icon button) — see `266:9257` (Home screen) for full context, buttons
  sit at `Frame 1191` inside the header.

**Disposition guidance for 06-06/06-07's planner-assigned reconciliation task:** archetype A
(gradient CTA pill) is a new Button variant worth adding to `button.tsx`'s variant union;
archetypes B and C are icon-only buttons — check PATTERNS.md/UI-SPEC.md for whether an
`IconButton` component already exists or is planned (badge/nav-link work in later plans may
already cover icon-button needs) before creating a 3rd new component; if none exists yet,
a small `variant`/`size` axis on the existing Button (or a thin wrapper) is reasonable.

---

## Card-family nodes (06-07 — Card + Item)

**Finding: all 6 nodes are genuinely distinct card types** — none collapse into a shared
generic `Card` variant prop; each has a different content shape. Common ground across all 6:
white (or gradient) bg, `border-radius: 24px`, `padding: 16px`, `gap: 16px` between
icon-tile and text block, drop-shadow soft (`0px 2px 8px`, tint varies).

### Node `266:9323` — Status Hero Card ("Baby is Resting Safely")
- Icon tile: 72px, `rounded-16`, green gradient 135deg `rgb(1,161,142)`→`rgb(39,228,208)`
  (green-700→green-500), centered 50px icon
- Title: 16px Bold "Plus Jakarta Sans", color `#222737` (neutral-800)
- Subtitle: 14px Regular, color `#7b82a0` (a muted blue-gray, close to but not exactly
  `--color-neutral-500` — check against existing tokens, may need a new subtle-muted token)
- Shadow: `0px 2px 8px rgba(208,241,237,0.5)` (green-tinted, not plain neutral)
- Layout: icon left, text block right, single row

### Node `266:9387` — Instruction Row Card ("Continue Regular Feeding")
- Icon tile: 48px, `rounded-16`, flat neutral-100 bg (`#f5f5f8`), 20px icon centered
- Title: 14px Bold, color neutral-800
- Subtitle: 12px Regular, color `#9aa0af` (neutral-400)
- Shadow: `0px 2px 8px rgba(0,0,0,0.05)` (plain neutral, not tinted)

### Node `266:9344` — Vital Stat Card (Pulse/Temp/Activity — matches earlier `HeartWaveform` spot-check)
- Full-bleed gradient background (NOT white card + icon tile — the whole card is the
  gradient), 132.5deg `rgb(37,99,235)`→`rgb(59,130,246)` (blue-500→blue-400) for the Pulse
  variant specifically — other vitals (Temp=red/pink gradient per earlier screenshot,
  Activity=green/teal gradient) follow the same pattern with their respective status hue
- `rounded-24`, `padding: 16px`, content vertically split: label+icon row top, sparkline
  middle (`HeartWaveform`, 76×26px), big number+unit row bottom
- Label: 14px SemiBold, white
- Number: 21px Inter Extra Bold, white; unit: 10px Inter Medium, white
- This IS the vitals/sparkline card the D-14 Home-screen proof needs — sparkline sits at a
  fixed 76×26px slot within it

### Node `203:13605` — Metric Row Card ("Perfusion Index")
- Same row-card shape as `266:9387` (Instruction Row) but icon tile bg is green-100
  (`#d0f1ed`) instead of flat neutral-100 — icon itself is `ph:drop-bold`
- Title: 14px Bold neutral-800, subtitle: 12px Regular neutral-500 (`#808699` — NOT the same
  muted color as the hero card's `#7b82a0`, and NOT neutral-400 either — check against
  `--color-neutral-500` in globals.css, it's an exact match: `#808699`)
- Shadow: `0px 2px 8px rgba(0,0,0,0.05)` (plain, like the instruction row)

### Node `203:13559` — Device Status Card (no progress bar)
- Icon tile: 72px, `rounded-16`, gradient-to-b pink-500→pink-300 (top to bottom, NOT the
  same diagonal-gradient direction as the CTA buttons), 36px icon (`fluent:smartwatch-dot-20-regular`)
- Title: 20px Bold neutral-800 ("Device-SKU-1234")
- Subtitle: 12px Regular neutral-400, with "SKU-1234" portion bold within the same line
- Shadow: `0px 2px 8px var(--neutral-200)` (uses the token directly, not an rgba literal)

### Node `203:11669` — Device Status Card WITH progress bar (also the Progress/Battery-indicator spec, D-16's open question resolved)
- Same shape as `203:13559` plus: an edit-pencil icon (`tabler:edit`, 20px) next to the
  title, and — **this is the battery/progress indicator visual (D-12/D-16):**
  - Track: `height: 6px`, `border-radius: 5px`, bg green-100 (`#d0f1ed`)
  - Fill: same height/radius, bg green-600 (`#08d7bf`), width driven by percentage
    (88.27% width shown for a "90%" label — i.e. the fill bar's rendered width isn't
    literally the percentage number, there's a small track inset; don't hardcode 88.27%,
    compute width from the percentage prop)
  - Label: 10px Bold, green-700 (`#01a18e`), e.g. "90%"
  - **Disposition: this is a generic horizontal progress bar, not a battery-shaped/notched
    icon.** Name the component `progress` (shadcn-aligned, matches D-16's recommendation)
    with a percentage-driven fill; a separate `battery-indicator` component is likely
    unnecessary unless another Figma frame shows an actual battery-glyph treatment — none
    of the 6 card nodes show one. Flag this to the user/planner if a dedicated battery icon
    treatment turns out to be needed elsewhere.

---

## Nav-family nodes (06-10 — NavLink + NavBar)

### Node `279:220`-area — NavLink component (2 states: "Open"/active and "Deselected"/inactive)
- **Active ("Open") state:** pill, `h-44px`, `rounded-10`, `px-10`, gradient background
  116deg `rgb(248,113,113)`→`rgb(249,141,141)` (pink-500→pink-400) — note this is a
  DIFFERENT angle (116deg) from the Button `cta` gradient (127deg) despite using the same
  two color stops; keep them as distinct token values, don't collapse into one shared
  gradient token. Drop-shadow `0px 2px 2px neutral-200`. Content: 20px icon (white) + label
  "Home" 12px Bold white. Below the pill: a `5px`-tall, full-width, `rounded-5` indicator bar,
  gradient-to-top pink-300→pink-500.
- **Inactive ("Deselected") state:** white bg, `1px solid neutral-100` border, same
  `h-44px`/`rounded-10`/`px-10` shape, icon only (no label) in neutral gray. Indicator bar
  below: flat neutral-100, no gradient.
- Confirms **D-17**: active nav state uses the pink/critical gradient family, exactly as the
  user specified — do not change to blue.

### Node `279:320` — NavBar (bottom tab bar)
- Outer container: white bg, `rounded-20`, `px-36`, drop-shadow **upward**
  (`0px -2px 2px neutral-200` — negative Y offset, shadow casts above the bar since it sits
  at the screen bottom), fixed width `375px` (mobile viewport), `py-16` inner row
- Contains exactly 4 `NavLink` instances in a row, evenly spaced (`flex-1` each): Home,
  Vitals, Stats, Settings — exactly ONE is ever in the "Open"/active state at a time, driven
  by current route; the other 3 render "Deselected". Labels are route-specific ("Home",
  "Vitals", "Stats", "Settings") — build `NavBar` to accept a `currentRoute`/`active` prop
  rather than hardcoding which tab is active.

---

*(Additional node extractions will be appended here as later plans in this phase are dispatched.)*
