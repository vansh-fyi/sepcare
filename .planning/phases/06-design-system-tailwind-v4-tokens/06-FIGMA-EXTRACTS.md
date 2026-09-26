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

*(Additional node extractions will be appended here as later plans in this phase are dispatched.)*
