# Phase 6: Design System (Tailwind v4 Tokens) - Context

**Gathered:** 2026-09-26
**Status:** Ready for planning

<domain>
## Phase Boundary

A Tailwind v4 `@theme`-directive token set (no `tailwind.config.js`-style config) that compiles cleanly in a real `next build`, plus a small strict-variant component layer (Button, Card, StatusPill/Badge, Input) built on shadcn/ui + Radix, proven against real component states via ≥3 sample pages — before any full-screen prototype/build work starts. Both the caregiver (full detail) and parent (abstracted) visual language must be demonstrably reusable from this one shared token set.

</domain>

<decisions>
## Implementation Decisions

### Tailwind install location & scope
- **D-01:** Tailwind v4 + the `@theme` token set is installed directly into the existing Next.js app on `main` (the same repo/branch backend already lives in) — not a standalone/separate build. This directly satisfies the roadmap's "compiles cleanly in a real `next build`" success criterion.
- **D-02:** The ≥3 required sample validation pages (DSYS-02) are real Next.js App Router routes (e.g. `app/design-system/*`), not static HTML files — they are styled with the actual compiled tokens and actual shadcn-based components, not a mockup.

### Palette origin — Figma Segue 3.0 + salvaged tokens
- **D-03:** Canonical color/type reference is Figma Segue 3.0: https://www.figma.com/design/4J2wGl4C6QG4yyeOnldRwl/Segue-3.0?node-id=203-9097 — the user loves the colors/fonts used there and wants them "built a little differently" (i.e. re-derived as a proper semantic Tailwind v4 token layer, not copied 1:1 as raw values).
- **D-04:** Pink is deliberately moved away from as the dominant/brand palette, but Figma's pink shades are specifically reused for the **Critical/Red status color only** (danger/urgent-escalation state). Brand/interaction stays blue, Safe stays green, Caution stays amber — this preserves the salvaged `frontend-design/design-system/DESIGN-SYSTEM.md` rule "red/critical reserved for urgent clinical escalation," just swapping the hue source from red to Figma's pink-derived critical shade.
- **D-05:** Font stack: keep what's already used in the current salvaged UI (Inter, per `frontend-design/design-system/tokens.css`) — user explicitly said they love the fonts already in use.

### Component system methodology (strict, agent-legible design system)
- **D-06:** Build a real component layer in Phase 6, not tokens-only — user cited the "define a system" methodology (primitives → semantic tokens; components restricted to a *finite* set of typed variants so an agent can't invent e.g. a `ghost` or `destructive` variant that doesn't exist; a `DESIGN.md`-style doc per component covering when to use it, which variant applies where, and a correct/incorrect usage example).
- **D-07:** Component base is **shadcn/ui + Radix**, not fully custom-built — satisfies PROJECT.md's "lean on existing libraries instead of building from scratch" while still meeting the strict-variant requirement, since shadcn/ui is already CVA-based (variant unions are a natural fit, e.g. `variant: "primary" | "secondary" | "critical"`, `status: "safe" | "caution" | "critical"`).
- **D-08:** Phase 6's required component set is exactly: **Button** (primary/secondary/tertiary/critical), **Card** (surface container), **StatusPill/Badge** (safe/caution/critical, each rendered as icon + label + color per the existing multi-modal status rule), **Input**. Composite/domain components (VitalCard, StatusHeroCard, BottomNav, TrendGraph, etc.) are explicitly deferred to the phase that builds full screens — assembled from this same atomic set and the same tokens, not redesigned from scratch.
- **D-09:** Icons: the salvaged `frontend-design/design-system/icons.js` (40+ SVG icon set, 24px outline, 1.75px stroke) can be reused directly — shadcn/ui doesn't ship its own icon set, so there's no conflict here.

### Sample validation pages (DSYS-02)
- **D-10:** The 3 required sample pages are: (1) Green/Amber/Red StatusPill + Card variants side by side, (2) empty-state and loading-state treatments (skeleton/spinner) for a Card, (3) nested composition — Buttons/Inputs inside a Card inside a page layout, proving tokens cascade correctly through real nesting. All built from the D-08 component set and the D-01 token set, as real Next.js routes.

### Roadmap-restructuring flag (raised during this discussion — not decided here)
- **D-11:** User wants to skip Phase 7's static HTML prototype entirely and build the real Next.js frontend directly instead — making the current Phase 10 "port" essentially a "plug the real frontend into the already-deployed backend" step rather than a from-scratch port of static mockups. This is a **roadmap-level change** (affects Phase 7, 8, and 10's stated goals/success-criteria in ROADMAP.md, and PARENT-05's "finalized during the HTML prototype discuss-phase" language in REQUIREMENTS.md) that this Phase 6 discussion cannot lock in on its own — flagged as the **required next step** before planning Phase 6, so Phase 6 planning proceeds under the corrected assumption. — **Reversibility:** costly — undoing this after Phase 6 is planned means replanning around a static-HTML deliverable instead of live app routes; get the roadmap restructuring done first.
  - **Practical upside already banked:** this does not conflict with D-02 (sample pages as real Next.js routes) or D-07 (shadcn-based components) — those decisions already assume real app code, not throwaway static HTML, so Phase 6's output carries forward cleanly into whatever the restructured Phase 7 becomes.

### Claude's Discretion
- Exact Tailwind `@theme` token naming (e.g. `--color-brand-primary` vs `--color-primary`) — follow Tailwind v4 conventions, informed by the existing `--sc-*` naming in the salvaged `tokens.css`.
- Exact shadcn/ui component installation mechanics (CLI vs manual) and file layout under `src/components/ui/`.
- Whether the static-HTML `frontend-design/` tree's compiled CSS link (originally decided for Phase 7 prototype consumption) is still needed once the roadmap-restructuring (D-11) resolves — likely moot if Phase 7 becomes real Next.js routes instead of static HTML.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design source of truth
- `frontend-design/design-system/tokens.css` — existing salvaged CSS custom properties (colors, type scale, spacing, radius, shadow, transitions); base to re-derive as Tailwind v4 `@theme` semantic tokens
- `frontend-design/design-system/DESIGN-SYSTEM.md` — full existing design system spec (70/20/10 surface rule, tri-state status system, button/alert/form component specs, responsive breakpoints, do's/don'ts) — the strict rules this doc already encodes (e.g. "never communicate status via color alone," "Status Hero Card layout never changes across states") should carry into the new component DESIGN.md docs
- `frontend-design/design-system/icons.js` — 40+ SVG icon set to reuse directly, no shadcn equivalent
- Figma Segue 3.0 (external, not local): https://www.figma.com/design/4J2wGl4C6QG4yyeOnldRwl/Segue-3.0?node-id=203-9097 — canonical color/font reference; move away from pink as brand color, keep pink shades for Critical/danger status only

### Project-level constraints
- `.claude/CLAUDE.md` — free-tier hosting, Next.js/TypeScript/Supabase stack, "lean on existing libraries (shadcn/ui, Radix, Recharts/Tremor, Framer Motion)" directive
- `.planning/PROJECT.md` Key Decisions table — prior architecture decisions (e.g. backend already merged to `main`, no separate frontend repo)
- `.planning/ROADMAP.md` §Phase 6 — success criteria for this phase (all 4 restated in `<domain>` above)
- `.planning/REQUIREMENTS.md` — DSYS-01/02/03 (this phase); note PARENT-05 references "the HTML prototype discuss-phase" — affected by D-11, needs roadmap-level resolution

### Codebase maps (scouted, no frontend-specific patterns yet)
- `.planning/codebase/STACK.md` — confirms no Tailwind currently installed in the Next.js app; Next.js 16.3.5, React 19.2.8, npm, no component library yet
- `.planning/codebase/CONVENTIONS.md` — backend-only conventions today (camelCase, `@/lib/...` path alias, decision-ID comments); no frontend/component conventions exist yet — this phase establishes the first ones

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend-design/design-system/tokens.css` — direct source for deriving `@theme` tokens (colors, 8px spacing scale, radius scale, shadow scale, transition durations)
- `frontend-design/design-system/icons.js` — reusable SVG icon set (`window.renderSepCareIcon('heartRate', 24, 'custom-class')` pattern); will need adapting to a React/Next.js icon component pattern rather than the current global-window helper
- `frontend-design/design-system/components.css` / `components.js` — reference only (not carried forward as classes per D-07/D-08), but documents exact interaction states (hover/active/disabled/loading) worth mirroring in the shadcn component variants

### Established Patterns
- No frontend styling/component conventions exist in the Next.js app yet (`src/app/page.tsx` is still the Next.js default landing page) — this phase is establishing the first ones, not extending existing ones
- Backend conventions (path alias `@/*` → `src/*`, decision-ID-referencing comments, TypeScript strict mode) should extend naturally to new frontend code in the same repo

### Integration Points
- New Tailwind config/tokens live in the existing Next.js app (`main` branch) — likely `src/app/globals.css` (or equivalent) gets the `@theme` block; shadcn/ui components typically land under `src/components/ui/`
- Sample validation pages are new App Router routes, e.g. `src/app/design-system/*`

</code_context>

<specifics>
## Specific Ideas

- User loves the existing colors and fonts (Figma Segue 3.0-derived) — explicitly do NOT redesign these from scratch; re-derive them into a proper token system instead ("we just need to build it a little differently").
- Pink is not banned outright — it's specifically the source for Critical/danger status shades, this is a deliberate choice not an oversight.
- The "define a system" methodology the user referenced (semantic tokens over primitives, finite typed component variants, per-component DESIGN.md with correct/incorrect examples) should shape how the planner and executor structure this phase's deliverables — not just what tokens/components exist, but how they're documented for future agent consumption.

</specifics>

<deferred>
## Deferred Ideas

- **Roadmap restructuring (D-11):** Skip Phase 7's static HTML prototype; build the real Next.js frontend directly; Phase 10 becomes a "plug frontend into deployed backend" step rather than a from-scratch port. Requires updating ROADMAP.md (Phases 7, 8, 10 goals/success-criteria) and REQUIREMENTS.md (PARENT-05's "HTML prototype discuss-phase" wording) — **recommended as the immediate next step, before `/gsd-plan-phase 6`.**
- Composite/domain components (VitalCard, StatusHeroCard, BottomNav, TrendGraph, Settings screen) — explicitly deferred to the phase that builds full screens (currently Phase 7, pending the D-11 restructuring), assembled from this phase's atomic component set.
- Whether `frontend-design/`'s static HTML pages get updated to reference the new compiled tokens, or archived/left as-is — moot pending D-11 resolution; do not spend Phase 6 effort on this.

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 6-Design System (Tailwind v4 Tokens)*
*Context gathered: 2026-09-26*
