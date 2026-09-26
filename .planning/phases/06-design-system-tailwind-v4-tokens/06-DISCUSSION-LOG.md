# Phase 6: Design System (Tailwind v4 Tokens) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-26
**Phase:** 6-Design System (Tailwind v4 Tokens)
**Areas discussed:** Tailwind install location & scope, Palette origin (salvage vs Figma), Component/icon reuse vs shadcn, Sample validation pages

---

## Tailwind install location & scope

| Option | Description | Selected |
|--------|-------------|----------|
| In this Next.js app now | Install Tailwind v4 directly into the main-branch app; sample pages become real Next.js routes | ✓ |
| Standalone Tailwind build, ported in Phase 10 | Separate lightweight build outputting static CSS for frontend-design/'s static HTML | |

**User's choice:** In this Next.js app now.
**Notes:** Directly satisfies "compiles cleanly in a real `next build`" success criterion.

| Option | Description | Selected |
|--------|-------------|----------|
| Serve compiled CSS as a static asset | Phase 7 static HTML links the Next.js-compiled CSS directly | ✓ |
| Duplicate the @theme tokens into a standalone CSS file | Phase 7 stays fully decoupled from the Next.js dev server | |

**User's choice:** Serve compiled CSS as a static asset.
**Notes:** Became largely moot later in the discussion once the user raised skipping Phase 7's static HTML prototype entirely (see Deferred Ideas).

---

## Palette origin — salvage vs Figma

**Question:** Do you have the Figma Segue 3.0 reference accessible for me to align tokens against?

**User's answer (free text):** "I have but I want to move away from pink a little: https://www.figma.com/design/4J2wGl4C6QG4yyeOnldRwl/Segue-3.0?node-id=203-9097 but pink shades have good danger shades and i love the colours and fonts i have used in the UI, we just need to build it a little differently."

**Notes:** Figma Segue 3.0 is the canonical color/font reference. User loves the existing colors/fonts — re-derive them as a proper token system rather than redesigning from scratch.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — pink powers Critical status only | Critical/danger shades use Figma's pink; brand/interaction stays blue, Safe green, Caution amber | ✓ |
| Something more specific | User describes exact pink placement | |

**User's choice:** Yes — pink powers Critical status only.

---

## Component/icon reuse vs shadcn

| Option | Description | Selected (round 1) |
|--------|-------------|----------|
| Tokens only in Phase 6; shadcn wraps them in Phase 7 | Phase 6 ships only tokens + validation pages; components built in Phase 7 | ✓ (superseded) |
| Carry the hand-rolled component classes forward too | Port components.css classes into @theme/@layer now | |

**User's choice (round 1):** Tokens only in Phase 6 — **later revised** when the user clarified they want real components built in Phase 6 (see below), citing an agent-legible design-system methodology (semantic tokens over primitives, finite typed component variants, per-component DESIGN.md docs with correct/incorrect usage examples).

| Option | Description | Selected (round 2) |
|--------|-------------|----------|
| shadcn/ui primitives + strict variant unions | Use shadcn/ui + Radix (CVA-based) restricted to closed variant sets matching semantic tokens | ✓ |
| Fully custom component layer | Hand-build a small strict component set from scratch, no shadcn | |

**User's choice (round 2):** shadcn/ui primitives + strict variant unions.

| Option | Description | Selected |
|--------|-------------|----------|
| Button, Card, StatusPill/Badge, Input | Atomic building blocks only; composites deferred to Phase 7 | ✓ |
| Also include VitalCard + StatusHeroCard now | Same atomic set plus two domain-specific composites | |

**User's choice:** Button, Card, StatusPill/Badge, Input.

---

## Sample validation pages

| Option | Description | Selected |
|--------|-------------|----------|
| Status states, empty/loading, nested variants | 3 pages: status/card variants, empty/loading states, nested composition | ✓ |
| Caregiver vs Parent side-by-side comparison | 3 pages proving DSYS-03 visual-language reuse instead | |

**User's choice:** Status states, empty/loading, nested variants.

---

## Claude's Discretion

- Exact Tailwind `@theme` token naming conventions
- Exact shadcn/ui installation mechanics and file layout
- Whether the static-HTML prototype's compiled-CSS link is still needed once the roadmap-restructuring idea (below) resolves

## Deferred Ideas

- **Roadmap restructuring:** User wants to skip Phase 7's static HTML prototype entirely and build the real Next.js frontend directly, making Phase 10's "port" a "plug frontend into deployed backend" step. This is a roadmap-level change (affects Phase 7/8/10 in ROADMAP.md, PARENT-05 in REQUIREMENTS.md) that can't be locked in during a Phase 6 discussion. Flagged as the recommended immediate next step before `/gsd-plan-phase 6`.
- Composite/domain components (VitalCard, StatusHeroCard, BottomNav, TrendGraph) — deferred to the phase that builds full screens.
- Whether `frontend-design/`'s static HTML gets updated or archived — moot pending the roadmap-restructuring decision.

---

## Rework session — 2026-09-27

**Trigger:** All 5 Phase 6 plans executed, but the user rejected the result as low quality across the board.

**Question:** Is Phase 6 verified/done, or is this a rework?

**User's answer (free text):** "Phase 6 is not verified at all. In fact, the execution was so horrible that I am re-running this phase right now... it just sucks, like sucks badly... we need to make it to a very beautiful and proper design system right now."

| Option | Description | Selected |
|--------|-------------|----------|
| Iterate on current base | Keep token architecture + file structure, fix visual/quality issues on top | ✓ |
| Scrap and rebuild from zero | Start the component/token layer over completely | |

**User's choice:** Iterate on current base.

**Question:** What specifically makes it suck?

**User's answer:** All four offered categories selected (doesn't match Figma vision, cheap look/feel, wrong/incomplete components, bad docs pages), plus free text: "Basically everything looks so so fucking horrible... The only thing that is correct is the colours... it's a shit show... I wanted a very beautiful fancy design system documentation and I got a single page bunch of crap... I am scared because I gave Figma nodes so many times but nothing happened out of it."

**Question:** Does Figma Segue 3.0 have real component frames, or just palette swatches?

**User's answer:** Has real component frames.

**Locked mechanism (D-15):** Extract exact values from the actual Figma node via MCP before writing code, then screenshot-diff the built result against Figma before calling any component done. User agreed to lock this in as mandatory.

**User then provided 14 specific Figma node links** (Home screen, nav link, nav bar, 6 card types, 4 button types, a "components with graphs" node, a time-scale toggle node) plus a screenshot of the target Home dashboard screen, and asked for a websearch on what components a healthcare/general app typically needs, and for the `/emil-design-vocabulary`, `/emil-ui-polish`, `/emil-animations` skills to be used to make the docs site "awesome, functional, insightful."

**Verification performed during this discussion:** `get_metadata` called on Home screen node `266:9257` — resolved successfully, confirming the mechanism works and the node IDs are real, valid Figma nodes (not broken links). Full extraction of every node is left to the researcher/planner/executor, per normal phase-op boundaries.

**Websearch performed:** healthcare dashboard/vitals-monitoring UI component conventions — findings folded into CONTEXT.md D-16 (dual-axis vitals charts, existing color convention already industry-aligned, WCAG 2.1 AA relevance).

**Result:** CONTEXT.md rewritten with D-12 (expanded component set) through D-16 (research findings), superseding the original D-08's 4-component boundary. D-11 (roadmap restructuring) remains formally unresolved but is now being acted on in practice via D-14 (Home screen proof-of-concept).
