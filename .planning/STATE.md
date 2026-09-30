---
gsd_state_version: "1.0"
milestone: v1.1
milestone_name: Frontend Rebuild + Design System + Hardware Integration
current_phase: 07
current_phase_name: HTML Prototype (Caregiver + Parent)
status: executing
stopped_at: Completed 07-01-PLAN.md
last_updated: "2026-09-30T18:25:42.949Z"
last_activity: 2026-09-30
last_activity_desc: Phase 07 execution started
state_head: a581dd6366066b07cd8141c284130e25be49099f
progress:
  total_phases: 6
  completed_phases: 0
  total_plans: 26
  completed_plans: 19
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-25)

**Core value:** Reliably turn a stream of vitals from a Waveshare ESP32-S3-Tiny wearable into an accurate, trustworthy sepsis risk signal (Green/Amber/Red) that reaches a caregiver in time to act — even through WiFi/power outages.
**Current focus:** Phase 07 — HTML Prototype (Caregiver + Parent)

## Current Position

Phase: 07 (HTML Prototype (Caregiver + Parent)) — EXECUTING
Plan: 2 of 8
Status: Ready to execute
Last activity: 2026-09-30 — Phase 07 execution started

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 34
- Average duration: - min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 4 | - | - |
| 2 | 3 | - | - |
| 3 | 3 | - | - |
| 04 | 1 | - | - |
| 05 | 2 | - | - |
| 6 | 21 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 02 P01 | 52min | 2 tasks | 2 files |
| Phase 02 P02 | 33min | 2 tasks | 5 files |
| Phase 02 P03 | 15min | 2 tasks | 2 files |
| Phase 03 P01 | 15min | 2 tasks | 2 files |
| Phase 03 P02 | 35min | 2 tasks | 6 files |
| Phase 03 P03 | 12min | 1 tasks | 2 files |
| Phase 05 P01 | 5min | 3 tasks | 18 files |
| Phase 05 P02 | 2min | 3 tasks | 5 files |
| Phase 06 P01 | 45min | 4 tasks | 10 files |
| Phase 06 P02 | 20min | 2 tasks | 4 files |
| Phase 06 P03 | 35min | 2 tasks | 8 files |
| Phase 06 P04 | 25min | 2 tasks | 3 files |
| Phase 06 P05 | 20min | 2 tasks | 1 files |
| Phase 06 P06 | 25min | 2 tasks | 5 files |
| Phase 06 P07 | 25min | 3 tasks | 6 files |
| Phase 06 P08 | 20min | 3 tasks | 10 files |
| Phase 06 P09 | 20min | 3 tasks | 6 files |
| Phase 06 P10 | 22 min | 2 tasks | 6 files |
| Phase 06 P11 | 20 min | 3 tasks | 7 files |
| Phase 06 P12 | 9min | 2 tasks | 5 files |
| Phase 06 P13 | 13min | 3 tasks | 6 files |
| Phase 06 P14 | 15min | 3 tasks | 4 files |
| Phase 06 P17 | 35min | 2 tasks | 6 files |
| Phase 06 P15 | 25min | 2 tasks | 4 files |
| Phase 06 P16 | 30 min | 3 tasks | 16 files |
| Phase 06 P19 | 10min | 2 tasks | 3 files |
| Phase 06 P18 | 45min | 3 tasks | 10 files |
| Phase 06 P20 | 20min | 3 tasks | 3 files |
| Phase 06 P21 | 15min | 1 tasks | 0 files |
| Phase 07 discuss | - | - | 2 files |
| Phase 07 P01 | 9min | 2 tasks | 16 files |

## Accumulated Context

### Decisions

Full decision log lives in PROJECT.md's Key Decisions table. v1.1-relevant framing captured there at milestone start (2026-09-25): ESP32-S3-Tiny hardware source of truth, recommended stack (Tailwind v4 `@theme`, shadcn/ui, Motion, Recharts) from research/SUMMARY.md.

- [Phase 05]: Deduped parentsdashboard.html in favor of parent-dashboard.html (D-12); archived xo/ and sepcare/ subtrees into archive/ with full README index
- [Phase 05]: Phase 05: Archived sdg-11/sdg-13 (SDG brainstorms) and heatstroke/diarrheal-dehydration implementation plans (D-09) via git mv, closing CLEAN-01's literal-wording gap; phase-gate verification confirmed CLEAN-03 evidence-integrity and Plan 01 reference-cleanliness both hold
- [Phase 06]: Swapped clsx+tailwind-merge for the official shadcn-ui cn package, approved live at the Task 1 checkpoint after human npmjs.com review of both shadcn and cn provenance.
- [Phase 06]: Added AGENTS.md documentation instructing agents to verify shadcn CLI flags and the cn package's API against live docs rather than training data, requested live by the user mid-execution as a new Task 4.
- [Phase 06]: shadcn CLI 4.21.0's add subcommand has no -b/--base flag (only init does); it already resolves Button to Radix via the unified radix-ui meta-package (pinned to @radix-ui/react-slot@1.3.3) rather than Base UI, verified via --dry-run/--view before installing.
- [Phase 6]: shadcn CLI 4.21.0's add generates Card/Input with no primitive-library import at all (plain wrappers); only Badge imports Radix's unified radix-ui package for asChild — D-07's Radix-not-Base-UI intent verified via zero @base-ui-components/* in package-lock.json, not a per-file Radix-import requirement.
- [Phase 6]: Phase 06: Tailwind v4 has no --duration-* theme namespace for utility generation — named duration-normal/duration-slow classes silently compile to nothing; use arbitrary-value syntax (duration-[var(--duration-normal)]) to reference the same tokens.
- [Phase 6]: Phase 06: Badge intentionally drops shadcn asChild/Slot composition — its Icon+label+color multi-modal invariant lives in the component body, and asChild would let a caller bypass it.
- [Phase 6]: Phase 06-04: Replaced Plan 06-01's tracer-era manual bg-brand-fill/text-white Button override with variant="primary" now that Button carries its own restyled CVA contract
- [Phase 6]: Phase 06-04: Used plain <h2> with text-heading/text-text tokens for Card headings in sample pages instead of the still-unstyled shadcn-stock CardTitle (deferred in 06-03)
- [Phase 6]: Phase 06-04: Sample-page header comments must avoid the literal string "@theme" in prose — the plan's own grep-based verify instrument matches any occurrence, not just an actual @theme block
- [Phase 6]: [Phase 06-05]: readFileSync calls at Server Component render time must use fully static literal path arguments (not template-literal/dynamic-property paths) to avoid Next.js/Turbopack's whole-project file-tracing warning, a real deployment-size risk on Vercel free-tier hosting
- [Phase 06]: Phase 06-06: The 4 D-12 "Button treatment" Figma nodes are not 4 variants of one family — they resolve to 3 distinct archetypes (gradient CTA pill x2, bordered icon-only, filled icon-only), all added as new CVA variants (cta/cta-critical/icon-outline/icon-filled) rather than folded/renamed.
- [Phase 06]: Phase 06-06: Resolved the cta/cta-critical pink-for-non-critical tension with D-04 by matching the Figma screenshot exactly (same reasoning D-17 already established for Nav) — device-connectivity and health-status treated as separate semantic dimensions, both allowed the pink hue.
- [Phase 06]: Phase 06-06: New Figma-revealed radius/gradient/shadow/color values were promoted into 6 small additive semantic tokens in globals.css (no existing token value changed) rather than hardcoded literals in button.tsx, per the codebase's primitive/semantic layering convention.
- [Phase 06]: Phase 06-07: Corrected the plan's own guessed node-to-label pairing -- 266-9387 is the Instruction Row Card (not vital stat card), 266-9344 is the Vital Stat Card (not status hero card) -- trusted real Figma extraction over the stale guess.
- [Phase 06]: Phase 06-07: Corrected --radius-card (20px->24px) and --shadow-card, and Card's own padding (p-6->p-4), to real Figma-extracted values shared by both confirmed card nodes.
- [Phase 06]: Phase 06-07: Deferred the Vital Stat Card's promotion to a new CardMetric component -- only its Pulse gradient was exactly extracted, documented as a composition instead pending full 3-tone data.
- [Phase 06]: Phase 06-07: Resolved D-16's progress-vs-battery-indicator question -- node 203-11669 is a generic percentage-driven horizontal bar named progress, not a battery glyph; the primitive itself is 06-08's job.
- [Phase 06]: Phase 06-08: Badge's Figma-check found no dedicated frame across the 3 inspected card nodes -- recorded honestly rather than inventing a deviation; 3-value icon+label+color contract unchanged.
- [Phase 06]: Phase 06-08: Progress restyled to a single treatment against real Figma node 203-11669 values (green-100/green-600 track/fill, rounded-full); BatteryIndicator built as a thin wrapper reusing icon.tsx's battery/charging glyphs, justified by UI-SPEC.md's own Domain composites table requirement.
- [Phase 06]: Phase 06-08: ToggleGroup/Toggle restyled through tokens already established by Button/Card/Item (no per-value Figma extraction exists for node 203-11938) and documented explicitly as token-consistent-not-node-verified; active-segment fill uses brand blue, not pink/critical, since a generic control's active state is not a health-status signal.
- [Phase 06]: Phase 06-09: Field/Label restyled onto real semantic tokens, remapping every stock shadcn class (destructive/primary/background/muted-foreground, absent from globals.css) and dropping dark: variants; FieldError matches Input's own text-caption text-critical-dark treatment
- [Phase 06]: Phase 06-09: Added git.allow_default_branch_commits:true to config.json, matching this project's established branching_strategy:none convention already used by 8 prior 06-* plans committing directly to main
- [Phase 06]: NavLink built with its real Figma-extracted gradient pill design (D-17 active-state color, conditional label, indicator bar), not the earlier illustrative text-color-only sketch
- [Phase 06]: Extracted the radius-nav-bar token as 20px, kept distinct from radius-card's 24px per UI-SPEC's do-not-guess instruction
- [Phase 06]: Phase 06-11: Added --text-display/--text-heading-page/--text-vital-metric to globals.css (Rule 2) since UI-SPEC's 9-role Typography table needed them and no prior plan had declared them
- [Phase 06]: Phase 06-12: Dropped asChild on SelectPrimitive.Icon to avoid a ref-forwarding warning against the project's non-forwardRef Icon component; no visual change.
- [Phase 06]: Phase 06-12: Select uses focus-visible: (button-like-control convention) while Textarea uses focus: (Input's real-text-field convention) rather than forcing one identical focus mechanism onto both new fields.
- [Phase 06]: Phase 06-12: Hand-authored chevronDown/chevronUp/check into icon.tsx instead of adding lucide-react as a dependency for Select's stock icons, per D-09's dependency-free icon-system precedent.
- [Phase 06]: Phase 06-13: Checkbox/RadioGroup/Switch restyled onto bg-brand-fill checked-state token and active:scale-[0.96] press feedback, matching the toggle-family convention established across all three controls.
- [Phase 06]: Phase 06-13: RadioGroup's stock lucide-react CircleIcon replaced with a plain filled span rather than a stroked Icon glyph -- a solid dot is visually correct for a radio control, unlike this project's stroke-based Icon system.
- [Phase 06]: Phase 06-13: Switch's press feedback applied to the thumb only via group-active/switch (not active: on the thumb itself), since SwitchPrimitive.Root is the actual focusable/pressable element.
- [Phase 06]: Phase 06-14: Resolved the Task 2 checkpoint's approved lucide-react install-then-strip via a stricter zero-risk-window method -- extracted chart.tsx from shadcn's --view dry-run output instead of ever running the real add command, so lucide-react never entered package.json/package-lock.json at all.
- [Phase 06]: Phase 06-14: recharts pinned to the exact 3.8.0 version shadcn's own chart registry entry resolves to, installed via plain npm install independent of the shadcn CLI.
- [Phase 06]: Phase 06-14: ChartTooltipContent's floating-surface treatment reuses select.tsx's existing dropdown-content convention (rounded-input border border-border bg-surface shadow-floating) verbatim rather than inventing a second floating-surface treatment.
- [Phase 06]: Phase 06-17: Card Type Map row 2 rendered as the bare Card primitive (matching card.DESIGN.md's own disposition), not a Card+Item composition -- docs page cross-links to the still-open composition question instead.
- [Phase 06]: Phase 06-17: Restructured docs/_lib/categories.ts's category list to carry per-category sidebar links (Cards, Navigation populated), closing the gap 06-11 explicitly deferred to Wave 5 -- the three new docs routes would otherwise be unreachable from the shell.
- [Phase 06]: Phase 06-17: NavLink/NavBar live docs previews intercept clicks via onClick+preventDefault+local state rather than modifying either component, so real app-route hrefs never navigate away from the docs page.
- [Phase 06]: Phase 06-15: VitalsTrendChart genuinely supports two Y-axes via Recharts' yAxisId pattern, but the right axis/legend only render when a series opts in - node 203-13216's real Figma frame is single-axis, D-16's dual-axis framing was a general research finding, not a literal frame in this file.
- [Phase 06]: Phase 06-15: Sparkline's default color stays var(--color-safe) matching 06-RESEARCH.md's pattern, but sparkline.DESIGN.md documents that the real Vital Stat Card usage (266-9344) needs an explicit color="var(--color-text-inverse)" override since the card background is itself the status gradient.
- [Phase 06]: Phase 06-16: Split each interactive Actions/Forms docs page into a Server Component (reads live globals.css tokens via node:fs) plus a small Client 'playground' subcomponent only where a useState-driven picker/toggle was required (Button, Input, Field); Select/Textarea/Checkbox/RadioGroup/Switch stayed pure Server Components since Radix's own uncontrolled state makes them genuinely interactive without any extra client wrapper.
- [Phase 06]: Phase 06-16: Added shared docs/_lib/token-swatch.tsx (TokenSwatch/TokenSwatchGrid) and docs/_lib/code-block.tsx (CodeBlock) plus tokens.ts's getExactToken helper, reused across all 9 new Actions/Forms docs routes instead of duplicating swatch/code-rendering logic 9 times.
- [Phase 06]: Phase 06-19: Widened states/page.tsx's tri-state demo to a second component family (Progress) via a scoped data-slot attribute-selector override, without modifying progress.tsx or adding new tokens. — Progress has no built-in status variant (single Figma-verified green treatment); the override's compound selector reliably beats the primitive's own single-class utility regardless of stylesheet order.
- [Phase 06]: Phase 06-19: empty-loading/page.tsx's loading example is now a genuinely advancing Progress bar (useState/setInterval), not an indeterminate/pulse treatment, since progress.tsx has no built-in indeterminate CSS (single treatment, no variant axis). — A real advancing value is a more honest demonstration of a real component's loading state than fabricating a new animation onto the primitive from outside the file.
- [Phase 06]: Phase 06-19: Removed nested/page.tsx's leftover 06-06/06-10 screenshot-scaffolding (Button archetypes card, NavLink states card, fixed NavBar) after confirming /design-system/docs/button and /design-system/docs/nav now exist as the canonical live-preview destinations. — Consolidation was directed by this plan's own <context>; confirmed redundant, not a coverage loss, before removing.
- [Phase 06]: Phase 06-18: ToggleGroup's docs page needed no client playground file — Radix already manages type="single" state uncontrolled client-side, so two independent live instances render from a pure Server Component.
- [Phase 06]: Phase 06-18: Progress/BatteryIndicator share one docs route since they share one primitive; a native range slider (no dedicated Slider component in this project's scope) drives both live simultaneously.
- [Phase 06]: Phase 06-18: Applied /emil-ui-polish's tabular-nums principle post-hoc to Progress playground's live percentage readouts after the D-13-mandated skill-compliance pass.
- [Phase 06]: Phase 06-20: Reused existing icon.tsx entries (wearable/sort/check/baby/ankleBand) for 5 of 6 Home-screen icon needs; hand-authored only bottleBaby as the genuine gap. — Cross-checked the full Home screen icon inventory against the existing 40+ set before adding anything, per D-09's reuse-first precedent.
- [Phase 06]: Phase 06-20: Followed the shipped 36px text-vital-metric convention (not card.DESIGN.md's older 21px screenshot note) for Vital Stat Card numbers, and used the real Figma-extracted 98.6°F Temp value over PLAN.md's illustrative 36.8°C example. — The 36px token is the actively-maintained, multiply-referenced convention (typography docs, sparkline.DESIGN.md); the Temp value is a locked extraction, not an illustrative example.
- [Phase 06]: Phase 06-20: Resolved the Card-vs-Item Instructions-row composition tension (open since 06-17) for the Home-proof page: Card as outer row container, Item's sub-parts for inner content, not the outer Item root. — Matches this plan's own explicit task instruction and avoids double-counting padding against Card's own p-4.
- [Phase 06]: Phase 06-21: Task 1 (full-phase regression + D-15 audit) re-confirmed green; skipped roadmap.update-plan-progress/requirements.mark-complete deliberately since a SUMMARY file's existence alone would check off the 06-21 plan checkbox regardless of its halted status, misrepresenting the phase gate before Task 2's human visual sign-off.
- [Phase 06]: 2026-09-30: Task 2 (human visual sign-off) resolved — project owner (professional designer) gave explicit, unambiguous approval of the full rebuilt design system during `/gsd-verify-work 6`; DSYS-01/02/03 marked Complete.
- [Phase 06]: 2026-09-30: Re-verification (post-UAT) found and fixed two real regressions introduced after the 09-27 sign-off: a broken `next build` (missing `color` field in a Nyquist test fixture) and 9/20 `DESIGN.md` files that silently lost their Figma-provenance line during the homepage-rewrite commit (`fb25dbe`). Both fixed and committed (`c433e53`); clean build re-confirmed.
- [Phase 06]: 2026-09-30: Security review accepted one deviation as documented risk rather than a code change — `@tabler/icons-react` was added for 3 mood glyphs despite the phase's own "hand-authored SVG only" rule (T-06-20, `06-SECURITY.md`); reputable package, no dangerous code paths, user declined to replace it.
- [Phase 07]: 2026-09-30: Resolved Phase 6's D-11 flag — Phase 7 builds real Next.js routes reusing the design system directly, not detached static HTML; ROADMAP.md's "static HTML prototype"/"port to Next.js" wording is superseded (rename recommended, not yet done).
- [Phase 07]: 2026-09-30: Of the six vital summaries Phase 6 built, only 3 (Thermoregulation, HR/Temp Ratio, Activity Level) can be computed from real backend fields using the actual §7.1.1 research formulas; the other 3 (HRV, Perfusion Index, Respiratory Pattern) need firmware/backend work not yet done (`RISK-V2-01`). User directive: keep the full six-signal UI, flag the ungrounded 3 explicitly as pending rather than dropping or faking them — project is no longer being built as a competition/hackathon entry.
- [Phase 07]: 2026-09-30: Parent "See All" → Vitals/Stats tabs (reusing caregiver's own screens); parent device icon and caregiver Settings tab both open the same shared Select-Device-list → Device-Details flow.
- [Phase 07]: Phase 07-01: Missing or unscored readings show explicit absence instead of default Safe; prototype shell labels static data and reserves fixed-nav clearance.

### Pending Todos

None yet.

### Blockers/Concerns

None currently for v1.1 planning. Carried forward from v1.0 (non-blocking): `GET /api/readings` has no API-key/auth gate — protected only by the hardcoded `nb-001` allow-list; fine for the single-device demo, flagged for post-v1.1 revisit. Known flake (non-blocking): `tests/realtime.subscribe.test.ts` / `tests/realtime.risk-scores.test.ts` intermittently time out under full-suite runs but pass in isolation.

Time-budget risk flagged by research (research/SUMMARY.md): static HTML prototype (Phase 7) must stay timeboxed and not become a second app; Tailwind v4 tokens (Phase 6) must be validated against a real `next build`, not just dev mode; hardware checklist (Phase 9) must be re-run verbatim after the Phase 10 port/redeploy.

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| deferred_items | 03/deferred-items.md: `tests/risk.compute.test.ts` — pre-existing failure caused by Plan 03-01's live migration (resolved at Phase 3's regression gate, commit `6662954`) | acknowledged | 2026-09-20 | v1.0 |

## Session Continuity

Last session: 2026-09-30T18:25:42.919Z
Stopped at: Completed 07-01-PLAN.md
Resume file: None

## Operator Next Steps

- Phase 6 (Design System) shipped — UAT (4/4 pass), Nyquist validation (33/33 tests, nyquist_compliant: true), security review (threats_open: 0), and human design sign-off are all complete; VERIFICATION.md status: passed
- Phase 7 context gathered (`07-CONTEXT.md`) — key decisions: real Next.js routes (not static HTML), parent nav flow resolved, six-vital-signal data gap handled honestly (3 real, 3 flagged pending), shared device/settings screen, dedicated data-contract diff doc
- Plan Phase 7 with `/gsd-plan-phase 7`
