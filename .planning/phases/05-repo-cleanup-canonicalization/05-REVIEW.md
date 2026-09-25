---
phase: 05-repo-cleanup-canonicalization
reviewed: 2026-09-25T00:00:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - archive/README.md
  - archive/context/implementation-plans/diarrheal-dehydration-screening.md
  - archive/context/implementation-plans/heatstroke-early-warning.md
  - archive/context/sdg/sdg-11-details.md
  - archive/context/sdg/sdg-13-details.md
  - archive/frontend-design-sepcare/preview.html
  - archive/frontend-design-sepcare/splash.html
  - archive/frontend-design-xo/parentoverview.html
  - archive/frontend-design/parentsdashboard.html
  - archive/frontend-handoff/OVERVIEW.md
  - archive/frontend-handoff/PRD.md
  - archive/frontend-handoff/SCREEN-CONTENT.md
  - archive/frontend-handoff/USER-FLOWS.md
  - frontend-design/AGENTS.md
  - frontend-design/clinical-vitals.html
  - frontend-design/device-status.html
  - frontend-design/parent-dashboard.html
  - frontend-design/parent-notifications.html
  - frontend-design/parent-risk-timeline.html
  - frontend-design/parent-vitals.html
  - frontend-design/profile-selection.html
  - frontend-design/settings.html
status: issues_found
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
---

# Phase 05: Code Review Report

**Reviewed:** 2026-09-25
**Depth:** standard
**Files Reviewed:** 21 (+ cross-checks against git history for the phase's 4 commits)
**Status:** issues_found

## Summary

This phase is a pure filesystem reorganization: it deduped `parentsdashboard.html`, salvaged unique screens out of the `xo/` and `sepcare/` teammate subtrees into `frontend-design/`'s flat structure, archived the superseded remainder via `git mv`, and indexed everything in `archive/README.md`.

I traced every rewritten `href`/`onclick`/`window.location.href` in the four salvage/dedupe commits (`c58e913`, `6aefcef`) against the files that now exist on disk, and cross-checked `archive/README.md`'s claims (byte-identical duplicates, "8 inbound references retargeted," the `../../parentsdashboard.html` double-dot fix in `settings.html`) against the actual pre/post diffs. **All of the link-rewiring and dedup claims check out** — no leftover `xo/`, `sepcare/`, or `parentsdashboard.html` references remain in any active file, every rewired `href` resolves to a file that exists at the expected flat path, and the "8 references" / "byte-identical" claims in `archive/README.md` are numerically accurate against the diffs.

The issues found are about documentation accuracy and convention drift introduced by the phase, not broken links: `frontend-design/AGENTS.md`'s own structural rules (centralized CSS/JS, no inline `<style>`/`<script>`) are violated by every one of the seven screens this phase just salvaged into the "single flat tree," and the phase's edit to `AGENTS.md` didn't update the doc to acknowledge that.

## Warnings

### WR-01: Salvaged screens violate AGENTS.md's "centralized CSS/JS, no inline styles/scripts" rule

**File:** `frontend-design/clinical-vitals.html:38-56,360-407`, `frontend-design/device-status.html:42-70,310-366`, `frontend-design/parent-vitals.html`, `frontend-design/parent-notifications.html:36-67,530-901`, `frontend-design/parent-risk-timeline.html`, `frontend-design/profile-selection.html`, `frontend-design/settings.html`

**Issue:** `frontend-design/AGENTS.md` states: "CSS is centralized... never inline `<style>` blocks in a page" and "JavaScript is centralized and external, not inline. Do not add `<script>...</script>` blocks with logic directly inside HTML files." Every one of the seven screens this phase salvaged from `xo/` and `sepcare/` into the canonical flat directory violates both rules: each ships its own `<style>` block (duplicated status-bar tap-highlight resets, keyframe animations, etc.) and its own inline `<script>...</script>` block (duplicated `updateClock()`, toast helpers, per-file `onclick="..."` handlers — 2 to 27 `onclick=` attributes per file), and none of them reference the directory's shared `components.css` or `parent-screen.js`. None of the newly-flattened files were brought into conformance with the very convention this phase's canonicalization was meant to enforce ("this directory is a single flat tree... per the Structure conventions above").

This isn't cosmetic: the same clock-updater, toast-notification, and theme-state-switcher logic is now copy-pasted near-verbatim across `parent-dashboard.html`, `parent-notifications.html`, `clinical-vitals.html`, `device-status.html`, `parent-risk-timeline.html`, `profile-selection.html`, and `settings.html` — exactly the "duplicated markup/behavior instead of factored shared files" anti-pattern `AGENTS.md` calls out.

**Fix:** Either (a) explicitly scope this phase's "canonicalization" to file *location* only and file a follow-up phase to migrate the salvaged screens' inline CSS/JS into `components.css` / a shared JS module, or (b) do that migration now, since these are freshly-touched files (lowest-cost time to fix per `AGENTS.md`'s own guidance: "Existing inline scripts... are legacy and should be migrated out into shared JS files as pages are touched").

### WR-02: AGENTS.md's legacy-inline-script disclaimer is now stale/incomplete

**File:** `frontend-design/AGENTS.md:10`

**Issue:** Line 10 reads: "Existing inline scripts in `index.html` and `details.html` are legacy and should be migrated out into shared JS files as pages are touched." This sentence predates the phase and was left untouched by this phase's edit (commit `36b6610`, which only appended the "Archived subtrees" section). It no longer reflects reality: after this phase's salvage operation, seven additional files (`clinical-vitals.html`, `device-status.html`, `parent-vitals.html`, `parent-notifications.html`, `parent-risk-timeline.html`, `profile-selection.html`, `settings.html` — plus pre-existing `parent-dashboard.html`) also carry inline `<style>`/`<script>` blocks, but the doc still names only `index.html`/`details.html` as the known offenders. A future agent reading `AGENTS.md` for guidance on where inline-script debt lives will be misled about the actual scope.

**Fix:** Update the sentence to reflect the true set of files carrying legacy inline CSS/JS (or generalize it, e.g. "Several existing screens — see WR-01 — still carry inline `<style>`/`<script>` blocks and should be migrated out as they're touched").

## Info

### IN-01: Archived preview/overview files contain relative links that no longer resolve

**File:** `archive/frontend-design-sepcare/preview.html:136,156`, `archive/frontend-design-xo/parentoverview.html:114`

**Issue:** `preview.html`'s iframe/`directLink` both point at `../parentsdashboard.html`, and `parentoverview.html`'s back button points at `../parentsdashboard.html` — relative to their new archive locations these resolve to `archive/parentsdashboard.html` and `archive/parentoverview.html`'s parent, neither of which exists (the file actually lives at `archive/frontend-design/parentsdashboard.html`). This predates the move (the reference was already stale once `parentsdashboard.html` was itself deduped) and these are dead/archived files not meant to be served, so this is informational only — no user-facing impact — but worth noting if anyone later tries to open these archived prototypes standalone.

**Fix:** No action required; archived files are historical snapshots, not live artifacts. If ever un-archived, links would need re-targeting.

### IN-02: Pre-existing typo carried over during salvage ("Veiw Trends")

**File:** `frontend-design/clinical-vitals.html:303`

**Issue:** Button label reads "Veiw Trends" instead of "View Trends." This typo predates the phase (present in `xo/clinical-vitals.html` before the `git mv`) and is unrelated to the filesystem reorg, but since the file was touched (content rewritten, not just moved) during this phase's link-rewiring commit, it was a low-cost opportunity to fix in passing.

**Fix:** `Veiw Trends` → `View Trends`.

---

_Reviewed: 2026-09-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
