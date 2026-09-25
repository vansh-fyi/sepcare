# Phase 5: Repo Cleanup & Canonicalization - Research

**Researched:** 2026-09-25
**Domain:** Filesystem reorganization / git history-preserving moves (no code, no runtime, no external packages)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Canonical prototype tree**
- **D-01:** `frontend-design/` root-level loose HTML files (`index.html`, `details.html`, `design-system.html`, `clinical-overview.html`, `onboarding.html`, `parent-*.html`, `splash.html`) plus `frontend-design/design-system/` are the canonical prototype tree — they match `frontend-design/AGENTS.md`'s own documented convention (one HTML file per screen at top level, shared `components.css`).
- **D-02:** `frontend-design/xo/` and `frontend-design/sepcare/` are separate, uncoordinated snapshots built independently by different teammates (user confirmed: "all of them were made by different team members and they didn't organise it well"). Before archiving, inspect their content screen-by-screen against the root tree — any screen with no equivalent in root (e.g. `xo/settings.html`, `xo/device-status.html`, `sepcare/profile-selection.html`, `sepcare/parent-notifications.html`) must be salvaged (copied into root's flat structure, following root's naming/component conventions) before `xo/` and `sepcare/` are archived. — **Reversibility:** costly — once archived and later phases build on the salvaged root set, restoring content from the archived subdirs after the fact means re-diffing against whatever root has evolved into.

**frontend-handoff duplicate**
- **D-03:** `context/frontend-handoff/` is canonical (byte-identical to root `frontend-handoff/` — confirmed via diff). Root `frontend-handoff/` is archived. Rationale: groups it with other `context/` planning/reference docs (`implementation-plans/`, `web-research/`, `sdg/`) rather than treating it as an active top-level working directory.

**Off-topic material scope**
- **D-04:** `context/sdg/sdg-11-details.md` (Sustainable Cities) and `context/sdg/sdg-13-details.md` (Climate Action) are archived — confirmed off-domain (cities/climate brainstorm, unrelated to neonatal sepsis). `context/sdg/sdg-3-details.md` (health) stays in place.
- **D-05:** `context/design-opportunities/*` and `context/research/*` (general newborn/health-adjacent brainstorm: telemedicine, door tags, emergency levers, remote monitoring) stay in place, untouched. User explicitly chose not to archive these — they're broader health ideation, not off-domain noise, and may still inform judge Q&A or future features.
- **D-06:** `context/mockups/*` (hardware physical-form mockups: Isometric/Bottom/Side/Top/Exploded views) were not flagged as off-topic — they're sepsis-armband-relevant and stay in place. No action needed, but explicitly confirm during execution that nothing there needs archiving.

**Archive mechanism**
- **D-07:** Archived material moves to a top-level `archive/` directory, mirroring each item's original relative path (e.g. `archive/context/sdg/sdg-11-details.md`, `archive/frontend-design-xo/`, `archive/frontend-handoff/`). — **Reversibility:** reversible — a plain directory move, trivially undoable via `git mv` back to origin.
- **D-08:** Each archived subtree gets a pointer note. Format: an `archive/README.md` listing every archived item, its original path, and a one-line reason it moved (superseded snapshot / off-topic / duplicate). Additionally, where practical, leave a short note at the original location's nearest surviving parent (e.g. a line in `frontend-design/AGENTS.md` noting `xo/` and `sepcare/` moved to `archive/` and why) so someone browsing the live tree isn't confused by the absence.

### Claude's Discretion
- Exact salvage-copy process for any unique `xo/`/`sepcare/` screens (D-02) — how closely to adapt naming/markup to match root conventions is left to execution-time judgment, following `frontend-design/AGENTS.md`'s structure rules.
- Exact wording/format of the pointer notes (D-08) beyond the required content (original path + reason).

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLEAN-01 | Non-sepsis, off-topic planning material (other SDG brainstorm: heatstroke, diarrheal dehydration) is archived out of the agent's working view, not deleted | D-04's named files (`context/sdg/sdg-11/13-details.md`) are covered by the archive-mechanism pattern in Architecture Patterns / Code Examples. **Gap found this session:** the requirement's literal wording ("heatstroke, diarrheal dehydration") names a second pair of files never discussed in CONTEXT.md — see Pitfall 3 and Open Question 1; this must be resolved before CLEAN-01 can be considered fully addressed. |
| CLEAN-02 | Duplicate directories (`frontend-handoff/` vs `context/frontend-handoff/`) and superseded/competing prototype trees (`frontend-design/` root loose files, `xo/`, `sepcare/`) are consolidated to a single canonical source or archived | Fully addressed by Pattern 1 (move-and-rewire), the Recommended Project Structure's exact archive paths, and the Common Pitfalls section (1, 2, 4, 5), which enumerate every cross-reference found this session that must be handled for the consolidation to actually work end-to-end rather than just relocate files. |
| CLEAN-03 | Sepsis-relevant research and clinical evidence remains fully intact and untouched | Addressed by the Runtime State Inventory (confirms zero runtime/build coupling to any moved path) and the Validation Architecture's CLEAN-03 test row (`git diff --stat` against the named evidence paths, expecting empty output as the pass condition). |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **GSD workflow enforcement** (`.claude/CLAUDE.md`): file-changing work must go through a GSD entry point (`/gsd-execute-phase` for planned phase work) rather than direct ad-hoc edits — this phase's plan should be executed via `/gsd-execute-phase`, not manual `git mv` outside that flow.
- **`AGENTS.md` Next.js breaking-changes notice**: not applicable to this phase — no Next.js code, config, or `node_modules/next/dist/docs/` lookup is touched; this phase is scoped entirely to `frontend-design/`, `frontend-handoff/`, and `context/`.
- **No project skills registered** (`.claude/skills/`, `.agents/skills/`, etc. — none found), so no additional skill-specific conventions apply beyond `frontend-design/AGENTS.md`'s own documented structure rules (already covered in Architecture Patterns).
- **Hosting/tech-stack constraints** (`.claude/CLAUDE.md` Constraints section: free-tier only, Next.js + Supabase stack) are not implicated by this phase — no infra, no deploy, no code changes.

## Summary

This phase is pure file reorganization: no framework, no library, no runtime dependency. The two things that make it non-trivial are (1) **live cross-references** between the trees being reorganized — several "canonical" root files contain relative `href`/`window.location.href` links into the very subdirectories (`sepcare/`) that are being archived, so archiving without rewriting those links breaks the canonical prototype — and (2) a **requirement-vs-decision gap**: `CLEAN-01`'s own wording ("other SDG brainstorm: heatstroke, diarrheal dehydration") describes two files that exist on disk (`context/implementation-plans/heatstroke-early-warning.md`, `context/implementation-plans/diarrheal-dehydration-screening.md`) but `05-CONTEXT.md`'s locked decisions (D-04/D-05/D-06) never mention them — only `context/sdg/sdg-11-details.md` and `context/sdg/sdg-13-details.md` are named. This is flagged as the top open question below.

All files under discussion are already tracked by git (`git ls-files` confirms `frontend-design/xo/`, `frontend-design/sepcare/`, root `frontend-handoff/`, and `context/sdg/*` are all committed), so `git mv` is available and will preserve blame/history — there is no reason to use a plain `mv` + `git add` for any of this phase's moves.

**Primary recommendation:** Use `git mv` for every move (never plain `mv`), do the two `sepcare/` salvage-and-rewire moves as one atomic pair (move file + rewrite the referencing root files in the same commit/task, since a partial state breaks navigation), and treat the heatstroke/diarrheal-dehydration files as an explicit open question to confirm with the user before archiving — don't silently assume they're in scope, and don't silently assume they're out of scope either.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Canonical prototype tree selection | Filesystem / repo structure | — | Pure directory reorganization, no app tier involved (`frontend-design/` is a static prototype, not the Next.js app) |
| Cross-reference rewiring (href/JS paths) | Static HTML/JS (prototype) | — | The prototype's own relative links are the only "code" this phase touches, and only where a move breaks them |
| Archive mechanism / pointer notes | Filesystem / docs | — | `archive/README.md` and `AGENTS.md` note are plain markdown, no app tier |
| Sepsis-evidence integrity | `context/` docs tier | — | Read-only preservation — no tier owns "not touching a file" beyond confirming its path is unchanged |

*(This phase has no browser/server/API/database tiers in play — it is scoped entirely to the repo's docs and static-prototype directories per `05-CONTEXT.md`'s Phase Boundary: "does not touch design tokens, component styling, or any prototype screen content.")*

## Standard Stack

Not applicable — no libraries, frameworks, or packages are installed or used in this phase. All operations are `git mv`, `mkdir`, and text edits to `.html`/`.md` files already in the repo.

## Package Legitimacy Audit

Not applicable — this phase installs no external packages. Skip the Package Legitimacy Gate.

## Architecture Patterns

### System Architecture Diagram

```
                         BEFORE (current disk state)
┌─────────────────────────────────────────────────────────────────────┐
│ repo root                                                            │
│                                                                       │
│  frontend-design/                                                    │
│  ├── index.html, details.html, onboarding.html, splash.html,        │
│  │   clinical-overview.html, design-system.html,                    │
│  │   parent-dashboard.html ──────┐  parentsdashboard.html (=byte-   │
│  │   parent-critical.html        │  identical dup, see Pitfall 4)   │
│  │   parent-needs-attention.html │                                   │
│  │   design-system/  (tokens.css, components.css, ... — untouched)  │
│  │                                │ href="sepcare/parent-vitals.html"│
│  │                                │ href="sepcare/parent-notif...html"
│  │                                ▼                                  │
│  ├── sepcare/  (uncoordinated snapshot #1)                           │
│  │   ├── parent-vitals.html        ◄── LIVE target of root's link   │
│  │   ├── parent-notifications.html ◄── LIVE target of root's link   │
│  │   ├── profile-selection.html    (no root equivalent)             │
│  │   ├── splash.html               (redundant w/ root splash.html)  │
│  │   └── preview.html              (dev iframe harness, not a screen)│
│  │                                                                    │
│  └── xo/  (uncoordinated snapshot #2)                                │
│      ├── settings.html        (no root equivalent — root has        │
│      │                         dangling href="settings.html")       │
│      ├── device-status.html   (no root equivalent)                  │
│      ├── clinical-vitals.html (no root equivalent — root's          │
│      │                         clinical-overview.html has dangling  │
│      │                         href="clinical-vitals.html?id=...")  │
│      ├── parentoverview.html      (root's parent-dashboard.html     │
│      │                             already covers this)             │
│      └── parentrisktimeline.html  (no root parent-facing equivalent;│
│                                     not in D-02's example list —     │
│                                     flag for execution-time judgment)│
│                                                                       │
│  frontend-handoff/         (root, byte-identical duplicate)          │
│  context/frontend-handoff/ (canonical target)                        │
│  context/sdg/sdg-3-details.md   (sepsis — stays)                     │
│  context/sdg/sdg-11-details.md  (cities — archive per D-04)          │
│  context/sdg/sdg-13-details.md  (climate — archive per D-04)         │
│  context/implementation-plans/neonatal-sepsis-armband.md (stays)     │
│  context/implementation-plans/heatstroke-early-warning.md       ◄──┐ │
│  context/implementation-plans/diarrheal-dehydration-screening.md◄──┤ │
│  └──────────────────── matches CLEAN-01 wording but UNDISCUSSED ───┘ │
└─────────────────────────────────────────────────────────────────────┘

                          AFTER (target disk state)
┌─────────────────────────────────────────────────────────────────────┐
│ frontend-design/  (single canonical flat tree, AGENTS.md-compliant) │
│  ├── ...existing root screens, links rewritten to drop "sepcare/"   │
│  ├── parent-vitals.html         (salvaged from sepcare/, flat)      │
│  ├── parent-notifications.html  (salvaged from sepcare/, flat)      │
│  ├── settings.html              (salvaged from xo/, flat, links fixed)
│  ├── device-status.html         (salvaged from xo/, flat)           │
│  ├── clinical-vitals.html       (salvaged from xo/, flat, links fixed)
│  ├── design-system/             (untouched)                         │
│  └── AGENTS.md                  (+ pointer note re: archived xo/sepcare)
│                                                                       │
│ archive/                                                              │
│  ├── README.md                  (index: path, reason, moved-from)   │
│  ├── frontend-design-xo/        (remaining xo/ files after salvage) │
│  ├── frontend-design-sepcare/   (remaining sepcare/ files, incl.    │
│  │                                profile-selection.html, splash.html│
│  │                                preview.html)                      │
│  ├── frontend-handoff/          (root duplicate)                    │
│  └── context/sdg/sdg-11-details.md, sdg-13-details.md               │
│                                                                       │
│ context/frontend-handoff/        (canonical, unchanged)              │
│ context/sdg/sdg-3-details.md     (unchanged)                         │
│ context/implementation-plans/neonatal-sepsis-armband.md (unchanged) │
└─────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

No new top-level structure beyond what D-07 already specifies. One clarification worth calling out explicitly for the planner: **the archive naming convention is NOT a strict mirror** for the two prototype subtrees — D-07's own examples give `archive/frontend-design-xo/` and (by the same pattern) `archive/frontend-design-sepcare/` for `frontend-design/xo/` and `frontend-design/sepcare/` respectively (hyphenated, flattened, dropped from under `frontend-design/`), while everything else (`context/sdg/*.md`, `frontend-handoff/`) mirrors its full original relative path under `archive/`. Do not let a plan step silently "mirror everything" — verify each destination path against the literal D-07 examples before scripting the moves.

```
archive/
├── README.md                          # index: original path, reason, date
├── frontend-design-xo/                # NOT archive/frontend-design/xo/
│   ├── parentoverview.html
│   ├── parentrisktimeline.html
│   └── (clinical-vitals.html, settings.html, device-status.html
│         removed here IF salvaged — see Pitfall 1)
├── frontend-design-sepcare/            # NOT archive/frontend-design/sepcare/
│   ├── profile-selection.html
│   ├── splash.html
│   ├── preview.html
│   └── (parent-vitals.html, parent-notifications.html
│         removed here IF salvaged — see Pitfall 1)
├── frontend-handoff/                   # mirrors root path exactly
│   ├── OVERVIEW.md
│   ├── PRD.md
│   ├── SCREEN-CONTENT.md
│   └── USER-FLOWS.md
└── context/
    └── sdg/
        ├── sdg-11-details.md
        └── sdg-13-details.md
```

### Pattern 1: Move-and-rewire as one unit

**What:** For any file whose destination changes AND which is referenced by relative path from a file that is *not* moving (or moves to a different relative position), the move and the reference rewrite must land together, not as separate steps/commits.

**When to use:** Specifically the two `sepcare/` salvage targets — `parent-vitals.html` and `parent-notifications.html` are `href`-linked and `window.location.href`-linked from `frontend-design/parent-dashboard.html` and `frontend-design/parentsdashboard.html` via the `sepcare/` prefix (confirmed below, verbatim). Moving the files without rewriting the referencing lines leaves the canonical prototype's own navigation broken.

**Example — exact lines found via `grep -n` this session** [VERIFIED: frontend-design/parent-dashboard.html:225,300,396,1137,1143 and frontend-design/parentsdashboard.html:225,300,396,1137,1143]:
```html
<!-- frontend-design/parent-dashboard.html:225 -->
<a id="btnNotifications" href="sepcare/parent-notifications.html" onclick="navigateToNotifications(event)" ...>

<!-- frontend-design/parent-dashboard.html:300 -->
<a id="seeAllVitalsBtn" href="sepcare/parent-vitals.html" onclick="navigateToVitals(event)" ...>See All</a>

<!-- frontend-design/parent-dashboard.html:396 -->
<a href="sepcare/parent-vitals.html" onclick="navigateToVitals(event)" ...>

<!-- frontend-design/parent-dashboard.html:1137 -->
window.location.href = 'sepcare/parent-vitals.html?state=' + encodeURIComponent(stateParam);

<!-- frontend-design/parent-dashboard.html:1143 -->
window.location.href = 'sepcare/parent-notifications.html?state=' + encodeURIComponent(stateParam);
```
The identical five lines (same line numbers) exist in `parentsdashboard.html` (see Pitfall 4 — these two files are byte-identical). After salvage-move, every one of these 10 lines (5 × 2 files) must have the `sepcare/` prefix stripped so the target reads `href="parent-vitals.html"` / `href="parent-notifications.html"` / `window.location.href = 'parent-vitals.html?state=...'` etc.

**Reverse direction — links *inside* the files being moved, that point back out** [VERIFIED: frontend-design/sepcare/parent-vitals.html:122,460,898 and frontend-design/sepcare/parent-notifications.html:130,460,850]:
```html
<!-- inside sepcare/parent-vitals.html and sepcare/parent-notifications.html -->
<a href="../parentsdashboard.html" onclick="returnToDashboard(event)" ...>
...
window.location.href = '../parentsdashboard.html?state=' + encodeURIComponent(stateParam);
```
These use `../parentsdashboard.html` because the file currently sits one directory below `frontend-design/`. Once moved to flat `frontend-design/parent-vitals.html`, the `../` must be stripped too (target: `href="parentsdashboard.html"`). Sibling references between the two files themselves (e.g. `href="parent-vitals.html"` written *inside* `parent-notifications.html`) are already bare filenames and need **no change** post-move, since both files land in the same flat directory.

**Example 2 — xo/ salvage targets, same pattern, one file has a pre-existing bug:**
```html
<!-- xo/clinical-vitals.html:108,299 — one level up, correct for its current location -->
<a href="../clinical-overview.html" ...>

<!-- xo/settings.html:161,197 — one level up, correct -->
<a href="../parent-notifications.html" ...>
<a href="../device-status.html" ...>

<!-- xo/settings.html:101 — TWO levels up: pre-existing bug (xo/ is only one level
     below frontend-design/, so "../../" escapes the project's frontend-design/ dir
     entirely). Do not mechanically strip one "../" from this line — it needs both
     dots removed, not one, to reach the intended parentsdashboard.html target. -->
<a href="../../parentsdashboard.html" ...>

<!-- xo/device-status.html:122 — one level up, correct -->
<a href="../parentsdashboard.html" ...>
```
[VERIFIED: frontend-design/xo/clinical-vitals.html:108,299; frontend-design/xo/settings.html:101,161,197; frontend-design/xo/device-status.html:122]

**Why this matters:** A naive "salvage = `git mv` the file" step, done as a separate task from "fix links," will produce a canonical tree that looks complete but is broken at runtime (a demo click-through would 404). Plan this as a single task per salvaged file (or a single task covering both moves + all rewrites), verified by opening the moved file's links, not just confirming the file exists at the new path.

### Anti-Patterns to Avoid
- **Archiving `sepcare/` or `xo/` wholesale before checking what's referenced *into* them:** `frontend-design/parent-dashboard.html` (the canonical file per D-01) actively links into `sepcare/`. A wholesale `git mv frontend-design/sepcare archive/frontend-design-sepcare` without first salvaging `parent-vitals.html`/`parent-notifications.html` and rewriting the referencing lines breaks the canonical tree's own navigation immediately.
- **Assuming D-02's "e.g." list is exhaustive:** D-02 names `xo/settings.html`, `xo/device-status.html`, `sepcare/profile-selection.html`, `sepcare/parent-notifications.html` as examples of "no equivalent in root," but this session's screen-by-screen check found the list is illustrative, not complete — `sepcare/parent-vitals.html` and `xo/clinical-vitals.html` also have no root equivalent and are additionally load-bearing (see Pattern 1 and Pitfall 1). Do the actual screen-by-screen check per D-02's instruction rather than treating the example list as the final scope.
- **Fixing all of `clinical-overview.html`'s dangling links as part of this phase:** `clinical-overview.html` (canonical, root) contains nine `href`s to files that don't exist anywhere in the repo (`alert-center.html`, `care-handoff.html`, `clinical-trends.html?id=...`, `patient-list.html`, `patient-overview.html?id=...`, `risk-timeline.html`, `select-device.html`, plus the two that *do* have xo/ matches: `clinical-vitals.html?id=...` and `settings.html`) [VERIFIED: frontend-design/clinical-overview.html — `grep -oE 'href="[a-zA-Z0-9_./-]+\.html[^"]*"'` this session]. Only rewire the two links that map to a screen actually being salvaged this phase (`clinical-vitals.html`, `settings.html`) by dropping the query-string/id mismatch as out of scope (Phase 6/7 territory per `05-CONTEXT.md`'s Phase Boundary). Do not invent `alert-center.html` etc. to "complete" the tree — that's new screen content, explicitly out of this phase's scope.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Preserving file history across a move | A "note the old path in a comment" convention | `git mv` | Git already tracks renames when the move is a single `git mv` (or `mv` + `git add` with a high enough content-similarity for git's rename detection) — `git log --follow` and `git blame` work transparently afterward. Confirmed this session: `git log --oneline -- frontend-design/xo/` and `-- frontend-design/sepcare/` both return commits, proving these paths are tracked, not new/untracked content. |
| Detecting which subtree files are referenced elsewhere | Manual eyeballing of every screen | `grep -rn` for the literal path string across the repo (excluding `node_modules/`, `.git/`, `.next/`) | This session's grep already surfaced every cross-reference that matters (see Sources); re-run it before executing moves in case the working tree has changed since research. |

**Key insight:** This phase has no framework-level "don't hand-roll" concerns (no auth, no data layer, no build tooling) — the only real risk is under-verifying relative-path references before moving files, which a systematic `grep` (already run this session, results embedded above) fully mitigates.

## Common Pitfalls

### Pitfall 1: Silent link breakage from un-rewired `sepcare/` and `xo/` references
**What goes wrong:** Files get moved (salvaged or archived) but the `href`/`window.location.href` strings referencing their old relative path are left untouched, so the "canonical" flat tree silently 404s on click-through.
**Why it happens:** The move itself (`git mv`) succeeds regardless of whether other files reference the old path — there is no build step or type system that would catch a stale relative link in static HTML.
**How to avoid:** Treat every `git mv` in this phase as paired with a `grep -rn` for the old relative path string across `frontend-design/` immediately after, and fix every hit before considering the file "moved." Use the exact line numbers and files enumerated in Pattern 1 above as the starting checklist — 10 lines across `parent-dashboard.html`/`parentsdashboard.html` for the `sepcare/` salvage, plus the `../` and `../../` links inside the salvaged files themselves.
**Warning signs:** Any `href="sepcare/...` or `href="xo/...` or `href="../..."` string still present in `frontend-design/*.html` after the phase's moves are supposedly complete.

### Pitfall 2: Treating the archive path convention as a strict directory mirror
**What goes wrong:** A plan step that does `mkdir -p archive/frontend-design && git mv frontend-design/xo archive/frontend-design/xo` produces `archive/frontend-design/xo/`, which contradicts D-07's own worked example of `archive/frontend-design-xo/` (hyphenated, flattened).
**Why it happens:** "Mirror the original relative path" is the general rule (and correct for `context/sdg/*` and `frontend-handoff/`), but D-07 explicitly special-cases the two prototype subtrees with a flattened, hyphenated name instead of a literal mirror.
**How to avoid:** Use D-07's literal examples (`archive/context/sdg/sdg-11-details.md`, `archive/frontend-design-xo/`, `archive/frontend-handoff/`) as the ground truth for exact destination paths, not the general "mirror original path" prose.
**Warning signs:** A destination path with `archive/frontend-design/` (nested) instead of `archive/frontend-design-xo/` / `archive/frontend-design-sepcare/` (flattened, hyphenated).

### Pitfall 3: CLEAN-01's wording names files that CONTEXT.md's decisions never discuss
**What goes wrong:** The plan checks off CLEAN-01 by archiving only `context/sdg/sdg-11-details.md` and `context/sdg/sdg-13-details.md` (per D-04), while CLEAN-01's own requirement text says "other SDG brainstorm: **heatstroke, diarrheal dehydration**" — and two files matching that exact description exist at `context/implementation-plans/heatstroke-early-warning.md` and `context/implementation-plans/diarrheal-dehydration-screening.md` [VERIFIED: file headers read this session — `# Heatstroke Early-Warning System for Rural Agricultural Workers` and `# Camera-Based Dehydration Severity Screener (Capillary Refill + Skin Turgor AI)`], sitting in the *same directory* as the canonical `neonatal-sepsis-armband.md` that CLEAN-03 requires to stay untouched. `05-CONTEXT.md`'s D-04/D-05/D-06 decisions never mention these two files at all — the discuss-phase session appears to have scoped "off-topic material" to `context/sdg/*` only and missed this second location.
**Why it happens:** `context/sdg/sdg-11-details.md` (Sustainable Cities) and `sdg-13-details.md` (Climate Action) are a *different* pair of off-topic SDG ideas from the heatstroke/diarrheal-dehydration pair CLEAN-01 names — both pairs are "other SDG brainstorm" in a loose sense, but only one pair was actually discussed and locked in CONTEXT.md.
**How to avoid:** Surface this explicitly to the user before finalizing the plan (see Open Questions) rather than either (a) silently archiving the implementation-plans pair on the researcher/planner's own authority, contradicting the principle that CONTEXT.md decisions are locked and the planner shouldn't invent new scope, or (b) silently leaving them in place and shipping a technically-incomplete CLEAN-01.
**Warning signs:** A UAT/verification pass that greps for "heatstroke" or "diarrheal" and finds them still live in `context/implementation-plans/` after Phase 5 is marked complete.

### Pitfall 4: `parent-dashboard.html` and `parentsdashboard.html` are byte-identical duplicates within the "canonical" tree itself
**What goes wrong:** D-01 names both `frontend-design/` root loose files as canonical without flagging that two of them — `parent-dashboard.html` and `parentsdashboard.html` — are byte-identical (confirmed via `diff -q`, no output = no difference) [VERIFIED: `diff -q frontend-design/parent-dashboard.html frontend-design/parentsdashboard.html` this session, zero output]. Both are cross-linked from other root files (`index.html` links to `parent-dashboard.html`; `parent-dashboard.html` itself links to `parentsdashboard.html`; xo/ and sepcare/ files link back to `parentsdashboard.html` specifically), so neither can be silently deleted without also checking every inbound link — but leaving an exact duplicate in the "single canonical source" tree arguably violates the phase's own goal statement ("single canonical source per concern").
**Why it happens:** Likely a typo'd filename (`parentsdashboard` vs `parent-dashboard`) from one of the parallel teammate contributions that was never cleaned up, then organically became a link target for other files.
**How to avoid:** This was not raised in `05-CONTEXT.md`'s discussion (D-01 only discusses xo/sepcare/frontend-handoff duplication, not this in-root duplicate) — flag it as an open question rather than silently deduplicating or silently leaving it, since deduplicating changes more inbound links than the sepcare/xo salvage does (`index.html`, `xo/settings.html`, `xo/device-status.html`, `xo/parentoverview.html`, `xo/parentrisktimeline.html`, `sepcare/parent-vitals.html`, `sepcare/parent-notifications.html`, `sepcare/profile-selection.html` all currently point at `parentsdashboard.html`, not `parent-dashboard.html`).
**Warning signs:** Grep for `parentsdashboard.html` after the phase and find it's still the majority inbound link target, i.e. the "duplicate" is actually the more-referenced file.

### Pitfall 5: `sepcare/preview.html` is dev tooling, not a screen — don't salvage it as one
**What goes wrong:** Treating every `.html` file in `sepcare/`/`xo/` as a "screen" to evaluate for salvage, including `sepcare/preview.html`, which is actually a device-frame iframe harness (`<iframe id="previewIframe" src="../parentsdashboard.html">`) used for local dev preview, not a product screen [VERIFIED: frontend-design/sepcare/preview.html:156 — `<iframe id="previewIframe" src="../parentsdashboard.html" title="SepCare Live Preview"></iframe>`].
**Why it happens:** It has a `<title>` tag (`SepCare — Development Device Preview`) and lives alongside real screens, making it easy to mistake for one during a quick screen-by-screen title scan.
**How to avoid:** Archive it with the rest of `sepcare/` (no salvage needed) — its broken `../parentsdashboard.html` reference post-archive is harmless since the whole harness is inert once archived, but the archive pointer note (D-08) should mention it was a dev-only preview tool, not an omitted screen, so a future reader doesn't wonder why it wasn't salvaged.
**Warning signs:** None functional — this is a documentation-completeness pitfall, not a breakage risk.

## Runtime State Inventory

> Included because this phase is a rename/reorganization/archive operation.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no database, no datastore keys reference any of these paths. This phase touches only `frontend-design/`, `frontend-handoff/`, and `context/` — none of which are read by the Next.js app or Supabase at runtime. | None |
| Live service config | None — no CI config, no Vercel/Supabase dashboard config references these paths. Confirmed via repo-wide grep this session: no hits in `package.json`, `next.config.ts`, `scripts/*.mjs`, or `src/`. | None |
| OS-registered state | None — no launchd/pm2/task-scheduler registrations exist in this project (it is a Next.js/Vercel-deployed web app, not a long-running local daemon). | None |
| Secrets/env vars | None — `.gitignore` confirms `.env*` files are excluded from git and unrelated to this phase's paths; no env var names reference `frontend-design`, `frontend-handoff`, `xo`, `sepcare`, or `sdg`. | None |
| Build artifacts | None currently affected. `frontend-design/` is a static-HTML prototype not included in the Next.js build (`next.config.ts` has no reference to it, and it sits outside `src/`/`public/` — Next.js's build only touches `src/app`, `public/`, and root config files). Archiving it does not require any rebuild or reinstall step. | None |

**Nothing found in any category** — this is a pure documentation/prototype-tree reorganization with zero runtime surface. Confirmed by repo-wide `grep -rn` for each path string this session (see Sources), which returned zero hits outside `.planning/` documentation and the files themselves.

## Code Examples

### Git-history-preserving move (verified pattern for this repo)
```bash
# Source: git ls-files confirms all target paths are tracked — git mv preserves
# blame/history for tracked files. Verified this session:
#   git ls-files frontend-design/xo/      -> non-empty (tracked)
#   git ls-files frontend-design/sepcare/ -> non-empty (tracked)
#   git log --oneline -- frontend-design/xo/      -> 399b9b8 (has history)
#   git log --oneline -- frontend-design/sepcare/ -> d6fe61e (has history)

mkdir -p archive/frontend-design-xo archive/frontend-design-sepcare
git mv frontend-design/xo/parentoverview.html      archive/frontend-design-xo/parentoverview.html
git mv frontend-design/xo/parentrisktimeline.html  archive/frontend-design-xo/parentrisktimeline.html
# ...salvage clinical-vitals.html, settings.html, device-status.html to
# frontend-design/ FIRST (git mv to the flat destination), THEN archive whatever
# remains in xo/ and sepcare/ — do not archive the whole directory in one shot.
```

### Salvage-with-rewire (the load-bearing operation for this phase)
```bash
# 1. Move the two live-referenced sepcare/ screens to flat root:
git mv frontend-design/sepcare/parent-vitals.html frontend-design/parent-vitals.html
git mv frontend-design/sepcare/parent-notifications.html frontend-design/parent-notifications.html

# 2. Rewrite the 10 referencing lines in parent-dashboard.html + parentsdashboard.html
#    (lines 225, 300, 396, 1137, 1143 in EACH file — verified this session):
#    sepcare/parent-notifications.html  ->  parent-notifications.html
#    sepcare/parent-vitals.html         ->  parent-vitals.html

# 3. Rewrite the back-links INSIDE the two moved files (lines 122/460/898 and
#    130/460/850 respectively — verified this session):
#    ../parentsdashboard.html  ->  parentsdashboard.html
#    (sibling refs like href="parent-vitals.html" already bare — no change needed)
```

## State of the Art

Not applicable — no framework/library versioning is involved in this phase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `context/implementation-plans/heatstroke-early-warning.md` and `diarrheal-dehydration-screening.md` should be archived under the same D-07 convention as `context/sdg/sdg-11/13-details.md`, since they match CLEAN-01's literal wording ("heatstroke, diarrheal dehydration") even though CONTEXT.md's D-04 doesn't name them. | Pitfall 3 / Open Questions | If wrong (user intends them to stay, e.g. because they're "implementation plans" not "brainstorm" and might inform judge Q&A the way `context/design-opportunities/*` does per D-05), archiving them would violate the "don't touch anything not explicitly decided" principle and require an un-archive fix later. If left alone without confirming, CLEAN-01 may be graded incomplete. **Must be confirmed with the user before the plan executes the move** — this is not something to silently decide either way. |
| A2 | `parent-dashboard.html` / `parentsdashboard.html` being byte-identical duplicates within the canonical root tree is worth flagging but is NOT this phase's decided scope to deduplicate (D-01 already declared both canonical, and CONTEXT.md's discussion never raised this specific duplicate). | Pitfall 4 | If the planner deduplicates on its own initiative, it must rewrite 8 inbound-link files, which is a substantially larger blast radius than D-01/D-02 anticipated and risks introducing a broken link the researcher didn't fully map. If left alone, the phase's own "single canonical source" success criterion is technically not 100% met for this one pair, but this exact pair was never named in the criterion's examples (`frontend-design/` root loose files, `xo/`, `sepcare/`, duplicate `frontend-handoff/`) — arguably out of this phase's literal scope. |
| A3 | `xo/parentoverview.html` and `xo/parentrisktimeline.html` do not need salvaging because root's `parent-dashboard.html` already covers "parent overview" and no root screen needs a parent-facing risk timeline this phase. | Anti-Patterns / Architecture Patterns | If a future phase (6/7) discovers it needs a parent risk-timeline screen and by then `xo/` has been archived, recovering `parentrisktimeline.html`'s content requires reversing the archive move — D-02 itself flags this exact reversibility cost ("costly — once archived and later phases build on the salvaged root set, restoring content... means re-diffing against whatever root has evolved into"). |

## Open Questions

1. **Are `context/implementation-plans/heatstroke-early-warning.md` and `diarrheal-dehydration-screening.md` in scope for CLEAN-01's archiving, despite not being named in `05-CONTEXT.md`'s locked decisions?**
   - What we know: CLEAN-01's exact wording is "other SDG brainstorm: heatstroke, diarrheal dehydration" — a near-verbatim match to these two files' actual topics. `05-CONTEXT.md` D-04 only discusses `context/sdg/sdg-11-details.md` (cities) and `sdg-13-details.md` (climate) as the off-topic material, and D-05 explicitly keeps `context/design-opportunities/*` and `context/research/*` in place as "broader health ideation... may still inform judge Q&A." The two implementation-plans files were never mentioned in the discuss-phase session at all.
   - What's unclear: Whether the discuss-phase session simply missed these two files (a gap to fix), or whether the user would classify "implementation plans" differently from "SDG brainstorm" and want them kept in place alongside `neonatal-sepsis-armband.md` for the same "may inform judge Q&A" reason given for `design-opportunities/`.
   - Recommendation: The planner should raise this explicitly (e.g., via a `checkpoint:human-verify` task or a direct question before finalizing the plan) rather than resolving it unilaterally in either direction. If the user confirms archiving, use `archive/context/implementation-plans/heatstroke-early-warning.md` and `archive/context/implementation-plans/diarrheal-dehydration-screening.md` (full-path mirror, per the D-07 pattern used for `context/sdg/*`, since these are single files in a `context/` subdirectory, not a whole prototype subtree like `xo/`/`sepcare/`).

2. **Should `parent-dashboard.html` / `parentsdashboard.html` be deduplicated in this phase?**
   - What we know: They are byte-identical. Both are actively linked from multiple other files (see Pitfall 4).
   - What's unclear: Whether deduplicating (keeping one, redirecting/rewriting all 8 inbound references) is in scope for Phase 5's "single canonical source per concern" goal, or whether it's better deferred to Phase 6/7 when the prototype is being actively rebuilt anyway (at which point this duplicate will likely be naturally resolved as part of normal editing).
   - Recommendation: Default to **not touching it** this phase (it's not named in any of D-01 through D-08, and CONTEXT.md's Phase Boundary says this phase "only reorganizes/archives what already exists" — deduplicating in-place canonical content arguably crosses into "touching prototype screen content," which the boundary explicitly reserves for Phase 6/7). Flag it in the plan's notes/summary so Phase 6/7 planning is aware.

3. **Which `xo/`/`sepcare/` screens beyond D-02's example list count as "no equivalent in root"?**
   - What we know: `sepcare/parent-vitals.html` and `xo/clinical-vitals.html` are additional no-root-equivalent screens beyond D-02's four named examples (confirmed this session — see Pattern 1's exact-line verification and the dangling-href match in `clinical-overview.html`). `xo/parentoverview.html` (covered by `parent-dashboard.html`) and `sepcare/splash.html` (redundant with root's richer `splash.html`, 59 lines vs 232) appear genuinely redundant. `xo/parentrisktimeline.html` is ambiguous (Assumption A3).
   - What's unclear: Final salvage/archive disposition for `xo/parentrisktimeline.html` specifically.
   - Recommendation: Plan should include an explicit screen-by-screen checklist task (see Code Examples) rather than treating D-02's four examples as the full list — this research has already done that comparison; the plan should encode its conclusions (salvage: `clinical-vitals.html`, `settings.html`, `device-status.html`, `parent-vitals.html`, `parent-notifications.html`, `profile-selection.html`; archive-as-is: `parentoverview.html`, `parentrisktimeline.html`, `splash.html` (sepcare's), `preview.html`) and flag `parentrisktimeline.html` as the one genuinely ambiguous case for a quick human check.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| git | `git mv` history-preserving moves (all tasks) | Yes | 2.52.0 [VERIFIED: `git --version` this session] | plain `mv` + `git add` (loses guaranteed rename tracking, though git's similarity-based rename detection may still pick it up — not needed here since git is present) |

No other external dependencies — this phase is git + filesystem + text edits only.

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json` [VERIFIED: .planning/config.json — `"nyquist_validation": true`], but this phase has no automated test framework applicability: it produces no application code, no API surface, and no testable business logic. There is no `pytest`/`vitest`/`jest` assertion that can meaningfully verify "a file moved to the right archive path" beyond filesystem existence checks and link-integrity checks, which are structurally closer to a verification/audit script than a unit test.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None applicable — filesystem reorganization phase |
| Config file | none |
| Quick run command | `grep -rn "sepcare/\|frontend-design/xo\|frontend-design/sepcare" frontend-design/*.html` (should return zero hits after moves + rewrites) |
| Full suite command | Existing `npm test` (`vitest run`) — unaffected by this phase, run once at phase end purely as a regression guard that nothing outside scope broke |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLEAN-01 | Off-topic SDG brainstorm archived, not deleted | manual/scripted check | `test -f archive/context/sdg/sdg-11-details.md && test -f archive/context/sdg/sdg-13-details.md && ! test -f context/sdg/sdg-11-details.md` (extend per Open Question 1's resolution) | N/A — no existing test file, this is a filesystem assertion |
| CLEAN-02 | Single canonical prototype tree, duplicates archived | manual/scripted check | `! test -d frontend-design/xo && ! test -d frontend-design/sepcare && ! test -d frontend-handoff && grep -rL "sepcare/" frontend-design/*.html` | N/A |
| CLEAN-03 | Sepsis evidence unchanged at original path | scripted diff check | `git diff --stat HEAD -- context/implementation-plans/neonatal-sepsis-armband.md context/web-research/ context/sdg/sdg-3-details.md context/research/ ` (expect empty output) | N/A |

### Sampling Rate
- **Per task commit:** the targeted `grep` above for whichever paths that task touched
- **Per wave merge:** full `grep -rn` sweep across `frontend-design/*.html` for any remaining `sepcare/`, `xo/`, or bare `../` prototype-tree references
- **Phase gate:** `npm test` (existing suite) green — confirms this phase's file moves didn't accidentally disturb `src/`/`tests/` (should be a no-op given zero overlap, but cheap to confirm)

### Wave 0 Gaps
None — no test infrastructure gap exists because no test infrastructure applies to this phase's deliverable (filesystem state, not code).

## Security Domain

`security_enforcement` is `true` in config [VERIFIED: .planning/config.json — `"security_enforcement": true`], but no ASVS category applies: this phase adds no authentication, session handling, access control, input validation, or cryptography surface. It moves static markup and markdown files within a repository already governed by existing `.gitignore` secret-exclusion rules (`.env*` already excluded, confirmed this session). No new attack surface is introduced.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A — no auth surface touched |
| V3 Session Management | No | N/A |
| V4 Access Control | No | N/A |
| V5 Input Validation | No | N/A — no user input processed |
| V6 Cryptography | No | N/A |

### Known Threat Patterns for {stack}

None applicable — filesystem reorganization of static prototype/docs content carries no injection, auth-bypass, or crypto-misuse surface.

## Sources

### Primary (HIGH confidence)
- `frontend-design/AGENTS.md` — read in full this session; documents the one-file-per-screen, centralized-CSS, no-inline-script convention D-01/D-02 reference.
- `.planning/phases/05-repo-cleanup-canonicalization/05-CONTEXT.md` — locked decisions D-01 through D-08, read in full this session.
- `.planning/REQUIREMENTS.md` — CLEAN-01/02/03 exact wording, read in full this session.
- Direct filesystem inspection this session: `ls -la`, `diff -q`/`diff -rq`, `wc -l`, `grep -rn`/`grep -oE` across `frontend-design/`, `frontend-handoff/`, `context/frontend-handoff/`, `context/sdg/`, `context/implementation-plans/`, and repo root config files (`package.json`, `next.config.ts`, `.gitignore`, `scripts/`, `src/`).
- `git ls-files`, `git log --oneline -- <path>`, `git status --short`, `git --version` — confirmed tracked status, history presence, and clean working tree this session.

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` and `.planning/research/PITFALLS.md` — prior-phase research documents corroborating the three-divergent-trees observation, read this session for cross-confirmation (not independently re-verified beyond what this session's direct filesystem checks already confirmed).

### Tertiary (LOW confidence)
None — every substantive claim in this document was verified directly against the filesystem or git this session.

## Metadata

**Confidence breakdown:**
- Standard stack: N/A — no stack involved
- Architecture: HIGH — every path, link, and duplicate claim was verified via direct tool calls this session (grep/diff/wc/git), not inferred
- Pitfalls: HIGH — all five pitfalls are backed by exact `grep`/`diff` output captured this session, with file:line citations

**Research date:** 2026-09-25
**Valid until:** Until the next filesystem change to `frontend-design/`, `frontend-handoff/`, or `context/` — this research is a point-in-time inventory, not a stable API surface. Re-verify path/link claims if execution is delayed and the working tree may have changed (e.g. `git status --short` showed only `.planning/state.json` modified at research time — re-check before executing moves).
