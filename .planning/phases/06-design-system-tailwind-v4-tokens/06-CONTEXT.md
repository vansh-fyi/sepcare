# Phase 6: Design System (Tailwind v4 Tokens) - Context

**Gathered:** 2026-09-26
**Updated:** 2026-09-27 — rework pass, scope expanded significantly (see D-12 onward)
**Status:** Ready for re-planning (this is a REBUILD of an already-executed-but-rejected Phase 6, not a fresh phase)

<domain>
## Phase Boundary

**Original boundary (still holds):** A Tailwind v4 `@theme`-directive token set (no `tailwind.config.js`-style config) that compiles cleanly in a real `next build`, plus a strict-variant component layer built on shadcn/ui + Radix, proven against real component states — before any full-screen prototype/build work starts.

**Rework addendum (2026-09-27):** All 5 plans for Phase 6 executed and the result was rejected by the user as low-quality across the board — colors were the only thing salvaged correctly; everything else (component visual polish, docs experience, component coverage) needs a rebuild. This is **iteration on the existing base** (keep `src/app/globals.css` token architecture, `src/components/ui/*` file layout, `src/app/design-system/*` route structure) — not a from-scratch restart. The component *set* and the docs *experience* both grow substantially in this pass (see Decisions below). The user also wants a proof-of-concept composite screen (Home dashboard) built from the expanded set, explicitly to reduce what Phase 7 has to figure out from scratch.

</domain>

<decisions>
## Implementation Decisions

### Tailwind install location & scope (unchanged from original discussion)
- **D-01** `[informational]`: Tailwind v4 + `@theme` token set installed directly into the existing Next.js app on `main`. *(Already done — `src/app/globals.css` exists — no new task needed, nothing in this rework touches install location.)*
- **D-02** `[informational]`: Sample validation pages are real Next.js App Router routes, not static HTML. *(Already done — `src/app/design-system/*` — no new task needed, the rework extends these routes, doesn't relocate them.)*

### Palette origin — Figma Segue 3.0 + salvaged tokens (unchanged, confirmed correct)
- **D-03:** Canonical color/type reference is Figma Segue 3.0. User confirmed the current token extraction (`src/app/globals.css` primitives) is the **one thing that came out right** — do not re-derive colors from scratch, keep `--color-pink/green/blue/neutral/yellow-*` as-is.
- **D-04:** Pink reserved for Critical/Red status only; brand stays blue, safe stays green, caution stays amber. *(Unchanged, confirmed still correct.)*
- **D-05** `[informational]`: Font stack: Inter, per existing config. *(Unchanged — no new task needed, nothing in this rework touches font selection.)*

### Component system methodology (unchanged principle, D-08 superseded by D-12)
- **D-06:** Strict, agent-legible system — finite typed variants, a `DESIGN.md` per component. *(Principle unchanged; existing `button.DESIGN.md` / `card.DESIGN.md` / `badge.DESIGN.md` / `input.DESIGN.md` exist but need a content/quality pass alongside the visual rebuild.)*
- **D-07:** Component base is shadcn/ui + Radix. *(Unchanged.)*
- **D-09:** Icons: salvaged `frontend-design/design-system/icons.js` SVG set reusable. *(Unchanged — but cross-check against Figma icon usage, e.g. `fluent:smartwatch-dot-20-regular`, `lucide-lab:bottle-baby`, `hugeicons:baby-02` used in the Home screen node — some icons may need to come from those icon sets instead if the existing 40+ set doesn't cover them.)*

### D-12: Component set is expanded — Phase 6 no longer stops at 4 components
**Supersedes D-08.** The original set (Button/Card/StatusPill/Input) is necessary but not sufficient. The user provided real Figma component frames (not just palette swatches) for a much larger set, and wants near-full coverage before Phase 7 starts. Confirmed-required additions, each backed by a specific Figma node (file key `4J2wGl4C6QG4yyeOnldRwl`):

| Component | Figma node(s) | Notes |
|---|---|---|
| Button (expand variants) | `203-11745`, `203-14032`, `203-11521`, `266-9285` | 4 distinct button treatments beyond current primary/secondary/tertiary/critical — reconcile against what's actually in these frames, don't assume 1:1 with existing variant names |
| Card (expand types) | `266-9323`, `266-9387`, `266-9344`, `203-13605`, `203-13559`, `203-11669` | 6 card types — likely stat/vital card, status hero card, instruction-row card, list-item card, etc. (spot-checked `266-9257` home screen confirms at least: status hero card, 3-column vital stat card, instruction row card as distinct patterns) |
| Nav link | `279-220` | Single nav item state (active/inactive) |
| Nav bar | `279-320` | Bottom tab bar — confirmed present as an instance (`279:758`) in the Home screen node |
| Badge/StatusPill | *(existing, carries forward)* | Keep safe/caution/critical icon+label+color rule |
| Input + additional form fields | *(existing `input.tsx` + net-new)* | Current set only has one text input — user explicitly flagged "doesn't even have different form fields." Add: select/dropdown, textarea, checkbox, radio, switch/toggle at minimum — exact set to be finalized during research against Figma + the healthcare-app component checklist below |
| Progress/battery indicator | *(implied by Home screen battery icon + general ask)* | Battery-level style indicator, likely a generalizable progress-bar/ring component |
| Time-scale toggle | `203-11938` | Segmented control (e.g. 1D/1W/1M) for chart time ranges |
| Chart/graph components | `203-13216` (components with graphs), `266-9350`/`266-9363` (`HeartWaveform` sparkline instances in the Home screen) | At least two chart forms: inline sparkline (vitals cards) and a larger analytics chart component. Use Recharts/Tremor per `.claude/CLAUDE.md`'s "lean on existing libraries" directive — do not hand-roll SVG charting |

- **Claude's discretion:** exact prop/variant names for all of the above — informed by Figma frame content, not guessed. If a Figma frame doesn't cleanly map to a single reusable component (e.g. it's really a composition of existing primitives), say so during planning rather than forcing a new component to exist.

### D-13: Design-system docs site is a first-class deliverable, not a byproduct
The current docs (`src/app/design-system/docs/page.tsx`, `states/`, `nested/`, `empty-loading/`) were rejected as "a single page bunch of crap." Locked requirements for the rebuild:
- Each component gets a real documentation entry: **live, interactive preview** (view + interact with actual variants/states, not static screenshots), **color and type reference** pages, and **usage + implementation notes** (when to use it, which variant applies where, correct/incorrect example) — this was already implied by D-06 but the *execution quality* is what's being locked in now.
- Visual bar: "shadcn-quality" (explicitly referenced in the most recent commit message) or better — beautiful, not merely functional.
- Use the `/emil-design-vocabulary`, `/emil-ui-polish`, and `/emil-animations` skills during the docs-site build for terminology precision, polish-pass discipline, and tasteful micro-interactions (hover/press/transition states) respectively.
- This is downstream-agent guidance for the **researcher and planner**, not a request to build the docs site during this discussion.

### D-14: Home screen composite is a required proof-of-concept page
A 4th sample/validation page (beyond D-10's original 3) is required: a **Home dashboard screen**, matching the provided screenshot and Figma node `266-9257` — device status header, "Infant Status" hero card, 3-column vitals row (Pulse/Temp/Activity, each with sparkline), Instructions list, bottom nav bar. Purpose: prove the expanded component set (D-12) actually assembles into a real, shippable-looking screen, explicitly so **Phase 7 has less left to figure out from scratch.**
- This is a design-system proof page, not the start of the real app screen build-out — it lives under `src/app/design-system/*` alongside the other sample pages, not as a production route.
- **Relationship to D-11 (below):** this decision is effectively already acting on D-11's direction (skip a throwaway static prototype, go straight to real Next.js proof) even though D-11's formal roadmap update hasn't happened yet.

### D-15: Figma-fidelity verification mechanism (LOCKED, mandatory for every component)
Per-user direction — giving Figma links alone did not work last time. Required mechanism for the rebuild, applies to every component/page in D-12/D-13/D-14:
1. Before writing any component code, call Figma MCP (`get_design_context` / `get_metadata` / `get_screenshot`, per the `figma-design-to-code` skill) on the **actual node** for that component — not a nearby node, not the palette page. Extract exact spacing, radius, shadow, and typography values rather than approximating by eye.
2. After building, take a screenshot of the rendered Next.js page/component and visually compare it against the Figma screenshot before marking the component "done."
3. Feasibility already spot-checked during this discussion: `get_metadata` on node `266:9257` (Home screen) resolved correctly and returned real structure (header, status card, 3 vital cards with `HeartWaveform` sparklines, instruction rows, nav bar instance) — the mechanism works, the node IDs below are valid.
- This is a structural/checkable requirement for the executor, not a suggestion — a component isn't complete without both steps.

### D-16: Research pass — general app component coverage gap
User flagged the current set is missing obvious things ("doesn't even have different form fields") and asked for a websearch on what components a healthcare/general app typically needs. Preliminary findings (2026-09-27, via WebSearch):
- Vitals dashboards conventionally plot heart rate/BP on one axis and O2 sat on a second (dual-axis charts) — relevant to the chart component in D-12.
- Color convention already matches D-04/D-03: blue = clinical trust/brand, green = normal/safe, red = genuine urgency only — no change needed, just confirms the existing direction is industry-aligned.
- 2026 HHS accessibility rules require WCAG 2.1 A/AA for healthcare apps (screen readers, keyboard nav, contrast) — worth a lightweight accessibility pass on the new component set, though a full audit is not this phase's job.
- Sources: [Healthcare Dashboard UI/UX Design: Best Practices 2026](https://www.aufaitux.com/blog/healthcare-dashboard-ui-ux-design-best-practices/), [Healthcare App UI/UX Design: Best Practices for 2026](https://fuselabcreative.com/healthcare-app-ui-ux-design-best-practices/), [Healthcare UI Design 2026: Best Practices + Examples](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications)
- **Downstream task:** the researcher should do a deeper pass on standard component-library checklists (e.g. shadcn/ui's own full component list, common health-app patterns) to sanity-check nothing obvious is still missing beyond what D-12 already lists — not to expand scope further without checking back with the user first.

### D-17: Nav active-state color — matches screenshot red exactly (resolves the D-04 tension flagged by research)
Both the fresh RESEARCH.md and UI-SPEC.md independently flagged a tension: the Home-screen screenshot shows the bottom nav's active "Home" tab in red/pink, while D-04 reserves pink/red exclusively for Critical/danger status. User's explicit call: **match the screenshot exactly** — the nav's active-indicator uses the same red/pink as Critical status. This is a deliberate choice, not an oversight: navigation-selected-state and critical-health-status are treated as two different semantic dimensions (location vs. health), both allowed to use the same hue. Downstream agents should NOT "fix" this to blue — implement it exactly as shown in the screenshot and Figma nav bar node (`279-320`).

### Roadmap-restructuring flag (raised in original discussion — still not formally resolved)
- **D-11** `[informational]`: **Not a Phase 6 implementation decision — cross-phase roadmap flag, intentionally uncovered by any Phase 6 plan.** User wants to skip a separate static-HTML prototype phase and build the real Next.js frontend directly; Phase 10 becomes a "plug frontend into deployed backend" step. This is a **roadmap-level change** (ROADMAP.md Phases 7/8/10, REQUIREMENTS.md PARENT-05 wording) that a discuss-phase session cannot lock on its own.
  - **Status update:** D-14 (Home screen proof-of-concept) is already operating under this assumption. Recommend resolving D-11 formally (roadmap edit) before or immediately after this Phase 6 rework lands, so Phase 7's actual scope reflects reality.

### Claude's Discretion
- Exact Tailwind `@theme` token naming — unchanged from original, follow existing `--color-*`/`--text-*`/`--radius-*` conventions already in `globals.css`.
- Exact new-component file naming/placement under `src/components/ui/`.
- Whether some Figma "card types" turn out to be compositions of Card + other primitives rather than genuinely distinct components — flag during planning if so.
- Exact chart library choice between Recharts/Tremor (both pre-approved per CLAUDE.md) — pick based on which better supports the sparkline + larger-chart + dual-axis needs.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design source of truth
- `frontend-design/design-system/tokens.css` — original salvaged CSS custom properties (superseded by `src/app/globals.css` for the actual build, kept as historical reference)
- `frontend-design/design-system/DESIGN-SYSTEM.md` — tri-state status system, do's/don'ts — still the strict-rule source of truth
- `frontend-design/design-system/icons.js` — 40+ SVG icon set; cross-check against Figma-referenced icon names (`fluent:smartwatch-dot-20-regular`, `lucide-lab:bottle-baby`, `hugeicons:baby-02`, `Interface / Sorting Left`) — some may not be covered and need sourcing from Lucide/Fluent/Hugeicons equivalents
- Figma Segue 3.0 file key: `4J2wGl4C6QG4yyeOnldRwl` — **use `get_design_context`/`get_metadata`/`get_screenshot` directly on the specific node IDs below, per D-15. Do not just eyeball the overview link.**
  - Overview/palette: node `203-9097`
  - Home screen (proof-of-concept target, D-14): node `266-9257` — spot-checked, valid, contains status hero card + 3 vital cards + instruction rows + nav bar instance
  - Nav link: node `279-220`
  - Nav bar: node `279-320` (instance `279-758` inside the Home screen)
  - Card type 1: node `266-9323`
  - Card type 2: node `266-9387`
  - Card type 3: node `266-9344`
  - Card type 4: node `203-13605`
  - Card type 5: node `203-13559`
  - Card type 6: node `203-11669`
  - Button types: nodes `203-11745`, `203-14032`, `203-11521`, `266-9285`
  - Components with graphs: node `203-13216`
  - Time-scale toggle: node `203-11938`
  - Sparkline instances (inside Home screen): `266-9350` (Pulse), `266-9363` (Temp)
  - (All URLs share the base `https://www.figma.com/design/4J2wGl4C6QG4yyeOnldRwl/Segue-3.0?node-id=<id>`)

### Project-level constraints
- `.claude/CLAUDE.md` — free-tier hosting, Next.js/TypeScript/Supabase stack, "lean on existing libraries (shadcn/ui, Radix, Recharts/Tremor, Framer Motion)" directive — directly relevant now that charts (D-12) are in scope
- `.planning/PROJECT.md` Key Decisions table
- `.planning/ROADMAP.md` §Phase 6 — original success criteria (still the floor, not the ceiling, given D-12/D-13/D-14 expansion)
- `.planning/REQUIREMENTS.md` — DSYS-01/02/03; PARENT-05 references the HTML-prototype discuss-phase — affected by D-11

### Skills to invoke during planning/execution
- `/emil-design-vocabulary`, `/emil-ui-polish`, `/emil-animations` — per D-13, for the docs-site build and component polish pass
- `figma-design-to-code` skill (already loaded/used during this discussion) — mandatory before any `get_design_context` call, per D-15

### Codebase state (current, post-rejected-execution)
- `src/app/globals.css` — token layer, kept (D-03 confirms colors are correct)
- `src/components/ui/{button,card,badge,input}.tsx` + matching `.DESIGN.md` files — exist, need visual rebuild per D-12/D-15, not deletion
- `src/app/design-system/{docs,empty-loading,nested,states}/*` — exist, need the D-13 quality/interactivity rebuild
- `.planning/codebase/STACK.md` / `CONVENTIONS.md` — from before Tailwind existed; now stale on the frontend-conventions front given 5 plans have since executed — re-scout during research, don't trust these blindly

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Current token layer (`src/app/globals.css`) — keep, it's correct (D-03)
- Existing 4 shadcn-based components — keep as file/variant-API skeletons, rebuild visual treatment against real Figma node specs (D-15)
- `frontend-design/design-system/icons.js` — reusable where icon names match; gaps filled from icon sets actually used in Figma (Fluent/Lucide/Hugeicons per node inspection)

### Established Patterns
- `src/components/ui/*.tsx` + `*.DESIGN.md` pairing pattern is sound — continue it for every new component in D-12
- `src/app/design-system/*` route-per-concern pattern (docs/states/nested/empty-loading) is sound — add a new route for the Home screen proof-of-concept (D-14)

### Integration Points
- New components land under `src/components/ui/`, same as existing ones
- Home screen proof-of-concept page: new route under `src/app/design-system/*` (e.g. `src/app/design-system/home-proof/page.tsx` or similar — exact name is planner's call)
- Charts: new dependency (Recharts or Tremor) needs adding — not yet a project dependency, check `package.json` during research

</code_context>

<specifics>
## Specific Ideas

- User provided a real screenshot of the target Home dashboard screen (device header, "Baby is Resting Safely" hero card, 3-column Pulse/Temp/Activity vitals row with sparklines, Instructions list, red-accented bottom nav) — this is the literal target for D-14, not a vague reference.
- User is emotionally invested and previously frustrated: multiple past attempts to hand over Figma links "did nothing." The verification mechanism (D-15) exists specifically to break that pattern — downstream agents should treat it as non-negotiable, not a nice-to-have.
- "So many different types of visually rich components that need to be made and documented so well" — the user does not have exact names for many of these (progress indicator, graphs, toggles) and is trusting Claude/downstream agents to figure out sensible names and boundaries from the Figma frames themselves, not to ask the user to invent names for things they can't articulate.
- Explicit goal: reduce what Phase 7 has to do — this phase's output should be substantially "build-ready" for real screens, not just a token/primitive demo.

</specifics>

<deferred>
## Deferred Ideas

- **Roadmap restructuring (D-11):** formal ROADMAP.md/REQUIREMENTS.md update for skipping the static-HTML prototype — still not done as an artifact, even though D-14 is already acting on it. **Recommended: resolve this formally right after (or alongside) planning this rework**, so Phase 7's stated scope stops contradicting what's actually happening.
- Full production Home screen (with real data wiring, Supabase integration, state management) — out of scope; D-14's Home screen is a static design-system proof page only.
- Composite domain components beyond what D-12 lists (e.g. a full Settings screen, TrendGraph screen) — still deferred to the screen-building phase, now informed by a much richer primitive set.
- Deep accessibility audit (full WCAG 2.1 AA conformance pass) — noted as relevant (D-16) but not this phase's deliverable; a lightweight pass on the new components is reasonable, a full audit is not.

### Folded Todos
None — no pending todos matched this phase.

### Reviewed Todos (not folded)
None.

</deferred>

---

*Phase: 6-Design System (Tailwind v4 Tokens)*
*Context gathered: 2026-09-26*
*Context updated (rework): 2026-09-27*
