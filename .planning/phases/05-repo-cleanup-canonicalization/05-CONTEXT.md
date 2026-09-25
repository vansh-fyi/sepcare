# Phase 5: Repo Cleanup & Canonicalization - Context

**Gathered:** 2026-09-25
**Status:** Ready for planning

<domain>
## Phase Boundary

The repo ends up with a single canonical source per concern (frontend prototype, frontend-handoff docs), sepsis-relevant research/evidence remains fully intact at its original path, and non-sepsis planning brainstorm material is moved out of the working view — archived, never deleted. This phase does not touch design tokens, component styling, or any prototype screen content (that's Phase 6/7); it only reorganizes/archives what already exists.

</domain>

<decisions>
## Implementation Decisions

### Canonical prototype tree
- **D-01:** `frontend-design/` root-level loose HTML files (`index.html`, `details.html`, `design-system.html`, `clinical-overview.html`, `onboarding.html`, `parent-*.html`, `splash.html`) plus `frontend-design/design-system/` are the canonical prototype tree — they match `frontend-design/AGENTS.md`'s own documented convention (one HTML file per screen at top level, shared `components.css`).
- **D-02:** `frontend-design/xo/` and `frontend-design/sepcare/` are separate, uncoordinated snapshots built independently by different teammates (user confirmed: "all of them were made by different team members and they didn't organise it well"). Before archiving, inspect their content screen-by-screen against the root tree — any screen with no equivalent in root (e.g. `xo/settings.html`, `xo/device-status.html`, `sepcare/profile-selection.html`, `sepcare/parent-notifications.html`) must be salvaged (copied into root's flat structure, following root's naming/component conventions) before `xo/` and `sepcare/` are archived. — **Reversibility:** costly — once archived and later phases build on the salvaged root set, restoring content from the archived subdirs after the fact means re-diffing against whatever root has evolved into.

### frontend-handoff duplicate
- **D-03:** `context/frontend-handoff/` is canonical (byte-identical to root `frontend-handoff/` — confirmed via diff). Root `frontend-handoff/` is archived. Rationale: groups it with other `context/` planning/reference docs (`implementation-plans/`, `web-research/`, `sdg/`) rather than treating it as an active top-level working directory.

### Off-topic material scope
- **D-04:** `context/sdg/sdg-11-details.md` (Sustainable Cities) and `context/sdg/sdg-13-details.md` (Climate Action) are archived — confirmed off-domain (cities/climate brainstorm, unrelated to neonatal sepsis). `context/sdg/sdg-3-details.md` (health) stays in place.
- **D-09 (added post-research):** `context/implementation-plans/heatstroke-early-warning.md` and `context/implementation-plans/diarrheal-dehydration-screening.md` are archived alongside sdg-11/sdg-13. Research (`05-RESEARCH.md`) found these are the exact "other SDG brainstorm: heatstroke, diarrheal dehydration" files CLEAN-01's literal requirement text names — a gap the original discussion missed since D-04 only covered `context/sdg/*`. User confirmed archiving both. `context/implementation-plans/neonatal-sepsis-armband.md` in the same directory remains untouched (sepsis-relevant, protected per D-nothing/canonical_refs).
- **D-05:** `context/design-opportunities/*` and `context/research/*` (general newborn/health-adjacent brainstorm: telemedicine, door tags, emergency levers, remote monitoring) stay in place, untouched. User explicitly chose not to archive these — they're broader health ideation, not off-domain noise, and may still inform judge Q&A or future features.
- **D-06:** `context/mockups/*` (hardware physical-form mockups: Isometric/Bottom/Side/Top/Exploded views) were not flagged as off-topic — they're sepsis-armband-relevant and stay in place. No action needed, but explicitly confirm during execution that nothing there needs archiving.

### Archive mechanism
- **D-07:** Archived material moves to a top-level `archive/` directory, mirroring each item's original relative path (e.g. `archive/context/sdg/sdg-11-details.md`, `archive/frontend-design-xo/`, `archive/frontend-handoff/`). — **Reversibility:** reversible — a plain directory move, trivially undoable via `git mv` back to origin.
- **D-08:** Each archived subtree gets a pointer note. Format: an `archive/README.md` listing every archived item, its original path, and a one-line reason it moved (superseded snapshot / off-topic / duplicate). Additionally, where practical, leave a short note at the original location's nearest surviving parent (e.g. a line in `frontend-design/AGENTS.md` noting `xo/` and `sepcare/` moved to `archive/` and why) so someone browsing the live tree isn't confused by the absence.

### Cross-reference integrity (added post-research)
- **D-10:** Research (`05-RESEARCH.md`) found live `href`/`window.location.href` references (verified, file:line cited) from canonical root files (`parent-dashboard.html`, `parentsdashboard.html`) into `sepcare/parent-vitals.html` and `sepcare/parent-notifications.html` — 10 referencing lines total, plus `../parentsdashboard.html` back-links inside the moved files themselves. Before `sepcare/` is archived, `parent-vitals.html` and `parent-notifications.html` (both have no root equivalent) must be salvaged into root and all referencing lines rewritten to the new root-relative paths. This applies generally: any salvage or archive move in this phase must grep the full repo (excluding `node_modules/`, `.git/`, `.next/`) for the moved path string first and update every reference found — not just the files named here. — **Reversibility:** costly — a missed reference silently breaks navigation in what's supposed to be the single canonical tree, and the break may not surface until Phase 7's prototype work touches that screen.
- **D-11:** `git mv` (not plain `mv` + `git add`) is the required mechanism for every archive/salvage move in this phase — confirmed all target paths are git-tracked with real history; `git mv` preserves blame/history, plain `mv` does not.

### Duplicate canonical file (added post-research, expanded scope)
- **D-12:** `parent-dashboard.html` and `parentsdashboard.html` in `frontend-design/` root were found to be byte-identical duplicates (not part of the original discuss-phase scope, but user chose to resolve now rather than defer). `parent-dashboard.html` (hyphenated, matches the `parent-critical.html`/`parent-needs-attention.html` naming convention) is canonical; `parentsdashboard.html` is archived. All 8 files referencing `parentsdashboard.html` must be updated to reference `parent-dashboard.html` instead. — **Reversibility:** costly — same class of risk as D-10; a missed reference among the 8 breaks navigation.

### Claude's Discretion
- Exact salvage-copy process for any unique `xo/`/`sepcare/` screens (D-02) — how closely to adapt naming/markup to match root conventions is left to execution-time judgment, following `frontend-design/AGENTS.md`'s structure rules.
- Exact wording/format of the pointer notes (D-08) beyond the required content (original path + reason).
- **D-13 (Claude's discretion, exercised):** `xo/parentrisktimeline.html` — flagged by research as ambiguous (no root equivalent, not in D-02's original example list) — is salvaged into root rather than archived. Rationale: REQUIREMENTS.md's CARE-03 (risk-status timeline) and PARENT-02 (parent data parity) make a parent-facing risk timeline directly relevant to Phase 7's upcoming work; keeping it accessible now is lower-cost than recovering it from `archive/` later.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Frontend prototype structure
- `frontend-design/AGENTS.md` — documents the canonical prototype's structure conventions (one HTML file per screen, centralized CSS/JS, no inline styles/scripts) that the salvage/canonicalization work in D-01/D-02 must follow.
- `05-RESEARCH.md` (this phase directory) — verified cross-reference map (file:line citations), git-history-preservation confirmation, and screen-by-screen salvage diff. MUST read before planning the actual file moves — see D-09 through D-13.

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — CLEAN-01, CLEAN-02, CLEAN-03 (this phase's requirements).
- `.planning/ROADMAP.md` §Phase 5 — success criteria this phase must satisfy.

### Sepsis-relevant evidence (must remain untouched at original path — see D-04/D-05/D-06)
- `context/implementation-plans/neonatal-sepsis-armband.md`
- `context/web-research/sepsis-vs-common-illness-differentiation.md`
- `context/sdg/sdg-3-details.md`
- `context/research/*`
- `context/design-opportunities/*`
- `context/mockups/*`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend-design/design-system/` (`DESIGN-SYSTEM.md`, `tokens.css`, `components.css`, `components.js`, `chart.js`, `icons.js`, `showcase.css`) — this is the salvage source Phase 6's Tailwind v4 token system will draw from per PROJECT.md; confirm it stays untouched/canonical during this phase's reorg.

### Established Patterns
- `frontend-design/AGENTS.md` conventions (flat one-file-per-screen, centralized CSS/JS) — any salvaged screen from `xo/`/`sepcare/` must conform to these, not bring in inline styles/scripts.

### Integration Points
- None — this phase is pure file reorganization; no code changes to `src/`, API routes, or Supabase schema.

</code_context>

<specifics>
## Specific Ideas

- The disorganized multi-teammate history (root `frontend-design/` vs `xo/` vs `sepcare/`, root `frontend-handoff/` vs `context/frontend-handoff/`) is a known, acknowledged mess from parallel student work — not an accident to investigate further, just something to reconcile carefully so nothing unique gets lost.
- Archive location convention: `archive/` at repo root, paths mirrored, with a `archive/README.md` index — this convention should be followed for any future cleanup too, not just this phase's items.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 5-Repo Cleanup & Canonicalization*
*Context gathered: 2026-09-25*
