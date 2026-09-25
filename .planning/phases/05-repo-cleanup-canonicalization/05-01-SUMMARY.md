---
phase: 05-repo-cleanup-canonicalization
plan: 01
subsystem: infra
tags: [static-html, frontend-design, repo-cleanup, git-mv]

# Dependency graph
requires: []
provides:
  - "frontend-design/ as a single flat prototype tree (no xo/, no sepcare/, no parentsdashboard.html duplicate)"
  - "archive/ with README.md indexing every archived item, populated via git mv (history preserved)"
  - "7 salvaged screens (parent-vitals, parent-notifications, profile-selection, clinical-vitals, settings, device-status, parent-risk-timeline) with zero dangling relative-path references"
affects: [06-design-system, 07-html-prototype]

# Actuals (#2632)
actuals:
  tokens: 5905
  tasks: 3
  commits: 3
plan_head_before: 79b68e4761e94ef9a0d4948964459391e50cafe0

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "git mv for all archival moves — never rm — preserving history per D-07"
    - "Guard-checked moves (destination-existence check before git mv) so a re-run after interruption is a no-op"

key-files:
  created:
    - archive/README.md
    - archive/frontend-design/parentsdashboard.html
    - archive/frontend-design-sepcare/splash.html
    - archive/frontend-design-sepcare/preview.html
    - archive/frontend-design-xo/parentoverview.html
    - archive/frontend-handoff/OVERVIEW.md
    - archive/frontend-handoff/PRD.md
    - archive/frontend-handoff/SCREEN-CONTENT.md
    - archive/frontend-handoff/USER-FLOWS.md
  modified:
    - frontend-design/parent-dashboard.html
    - frontend-design/parent-vitals.html
    - frontend-design/parent-notifications.html
    - frontend-design/profile-selection.html
    - frontend-design/clinical-vitals.html
    - frontend-design/settings.html
    - frontend-design/device-status.html
    - frontend-design/parent-risk-timeline.html
    - frontend-design/AGENTS.md

key-decisions:
  - "parentsdashboard.html deduped in favor of parent-dashboard.html (D-12) — 8 inbound references across 5 files retargeted"
  - "xo/parentrisktimeline.html renamed to parent-risk-timeline.html on salvage, matching the root's hyphenated parent-* convention (D-13 discretion)"
  - "settings.html's pre-existing ../../parentsdashboard.html double-dot bug fully fixed (both dot-segments stripped) rather than mechanically stripping one ../"

patterns-established:
  - "Archive subtree naming: whole prototype subtrees (xo/, sepcare/) flatten to archive/frontend-design-{name}/; lone duplicate files (parentsdashboard.html, frontend-handoff/) mirror their original relative path under archive/"

requirements-completed: [CLEAN-02]

coverage:
  - id: D1
    description: "frontend-design/ is a single flat directory — no xo/ or sepcare/ subdirectory remains"
    requirement: CLEAN-02
    verification:
      - kind: other
        ref: "test ! -d frontend-design/xo && test ! -d frontend-design/sepcare"
        status: pass
    human_judgment: false
  - id: D2
    description: "parentsdashboard.html deduped — frontend-design/ contains no parentsdashboard.html, only canonical parent-dashboard.html"
    requirement: CLEAN-02
    verification:
      - kind: other
        ref: "test ! -f frontend-design/parentsdashboard.html && test -f archive/frontend-design/parentsdashboard.html"
        status: pass
    human_judgment: false
  - id: D3
    description: "All 7 salvaged screens exist at frontend-design/ root with zero dangling sepcare/, xo/, or ../parentsdashboard references"
    requirement: CLEAN-02
    verification:
      - kind: other
        ref: "grep -rln 'sepcare/|frontend-design/xo|\\.\\./parentsdashboard|\\.\\./\\.\\./parentsdashboard' frontend-design/*.html (zero output)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Archive populated with every non-salvaged xo/sepcare file, the duplicate frontend-handoff/, and the deduped parentsdashboard.html, each git-mv'd and indexed in archive/README.md"
    requirement: CLEAN-02
    verification:
      - kind: other
        ref: "test -f archive/README.md; git log --follow on each archived path shows preserved history"
        status: pass
    human_judgment: false
  - id: D5
    description: "frontend-design/AGENTS.md documents the archive for future readers via a new Archived subtrees section"
    requirement: CLEAN-02
    verification:
      - kind: other
        ref: "grep -q 'Archived subtrees' frontend-design/AGENTS.md"
        status: pass
    human_judgment: false

duration: 5min
completed: 2026-09-25
status: complete
---

# Phase 5 Plan 1: Repo Cleanup — frontend-design/ Canonicalization Summary

**Canonicalized frontend-design/ into a single flat prototype tree: salvaged 7 unique screens out of xo/ and sepcare/, deduped parentsdashboard.html, rewired every touched relative link, and archived the remainder (5 files + duplicate frontend-handoff/) via git mv with a full archive/README.md index.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-09-25T23:24:53Z (approx, see plan_head_before commit)
- **Completed:** 2026-09-25
- **Tasks:** 3
- **Files modified:** 18 (9 renamed via git mv into frontend-design/ root, 5 archived via git mv, 1 new archive/README.md, 2 doc/link edits: parent-dashboard.html, AGENTS.md, plus 4 more archived frontend-handoff files)

## Accomplishments
- `frontend-design/sepcare/` and `frontend-design/xo/` fully retired — their 7 unique screens (`parent-vitals.html`, `parent-notifications.html`, `profile-selection.html`, `clinical-vitals.html`, `settings.html`, `device-status.html`, `parent-risk-timeline.html`) now live flat at `frontend-design/` root with every relative-path reference rewired to resolve
- `parentsdashboard.html` deduped in favor of the canonical `parent-dashboard.html` — 8 inbound references across `parent-dashboard.html`, `parent-vitals.html`, `parent-notifications.html`, `profile-selection.html`, `device-status.html`, `parent-risk-timeline.html` retargeted, plus `settings.html`'s pre-existing `../../parentsdashboard.html` double-dot bug fixed in the same pass
- Root `frontend-handoff/` (confirmed byte-identical to `context/frontend-handoff/` via `diff -rq` before the move) archived, eliminating the duplicate
- `archive/` created with a `README.md` indexing all 9 archived files (5 screens/duplicates + 4 frontend-handoff files), each moved with `git mv` so history is preserved
- `frontend-design/AGENTS.md` updated with an "Archived subtrees" section pointing future readers at the archive and warning against recreating `xo/`, `sepcare/`, or `parentsdashboard.html`

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end salvage, rewire, and dedupe of the sepcare/ + parentsdashboard.html cluster** - `c58e913` (feat)
2. **Task 2: xo/ salvage, rewire, and archive** - `6aefcef` (feat)
3. **Task 3: Archive duplicate frontend-handoff/, write archive/README.md, append AGENTS.md pointer note** - `36b6610` (docs)

**Plan metadata:** committed via final commit step below.

## Files Created/Modified
- `frontend-design/parent-vitals.html` - Salvaged from sepcare/; `../parentsdashboard.html` refs retargeted to `parent-dashboard.html`
- `frontend-design/parent-notifications.html` - Salvaged from sepcare/; refs + stale doc comment retargeted to `parent-dashboard.html`
- `frontend-design/profile-selection.html` - Salvaged from sepcare/; `window.location.href` + comment retargeted to `parent-dashboard.html`
- `frontend-design/parent-dashboard.html` - `sepcare/`-prefixed hrefs/window.location.href calls stripped to bare paths; self-link to `parentsdashboard.html` fixed to `parent-dashboard.html`
- `frontend-design/clinical-vitals.html` - Salvaged from xo/; `../clinical-overview.html` refs stripped to bare path
- `frontend-design/settings.html` - Salvaged from xo/; `../parent-notifications.html`/`../device-status.html` stripped; pre-existing `../../parentsdashboard.html` double-dot bug fully fixed and retargeted
- `frontend-design/device-status.html` - Salvaged from xo/; `../parentsdashboard.html` retargeted
- `frontend-design/parent-risk-timeline.html` - Salvaged and renamed from `xo/parentrisktimeline.html`; `../parentsdashboard.html` retargeted
- `frontend-design/AGENTS.md` - New "Archived subtrees" section documenting the xo/sepcare/parentsdashboard.html archival
- `archive/README.md` - New file indexing all 9 archived items with original path + reason
- `archive/frontend-design/parentsdashboard.html`, `archive/frontend-design-sepcare/{splash,preview}.html`, `archive/frontend-design-xo/parentoverview.html`, `archive/frontend-handoff/{OVERVIEW,PRD,SCREEN-CONTENT,USER-FLOWS}.md` - Archived via git mv, history preserved

## Decisions Made
- Deduped `parentsdashboard.html` in favor of `parent-dashboard.html` per D-12 rather than the reverse, since `parent-dashboard.html` is the canonical file with the correct hyphenated naming convention
- Renamed `xo/parentrisktimeline.html` to `parent-risk-timeline.html` on salvage to match the root's existing hyphenated `parent-*` convention (`parent-critical.html`, `parent-needs-attention.html`, `parent-dashboard.html`, `parent-vitals.html`, `parent-notifications.html`) — D-13 discretion
- Left `frontend-design/clinical-overview.html`'s 7 other dangling hrefs (`alert-center.html`, `care-handoff.html`, etc.) untouched — inventing those screens is Phase 6/7 scope, not this plan's

## Deviations from Plan

None — plan executed exactly as written. All guard-checked `git mv` operations, link rewrites, and archive/README.md content matched the plan's specified line numbers and target paths (re-verified via fresh `grep` before editing, per the plan's own "working tree may have drifted" caveat — it had not drifted).

One execution-environment note not a plan deviation: `git mv` leaves the now-empty `frontend-design/sepcare/` and `frontend-design/xo/` directories present on disk (git doesn't track directories, and an empty directory isn't automatically removed from the working tree by `git mv` of its last file) — an explicit `rmdir` was needed after each subtree's final `git mv` to satisfy the plan's own `test ! -d` verification. This is implementation mechanics of "confirm directory no longer exists" (Task 1 step 8 / Task 2 step 8), not a scope change.

## Issues Encountered
- `npm test` (plan's verification step 4) showed 2 pre-existing failures in `tests/realtime.subscribe.test.ts` and `tests/realtime.risk-scores.test.ts` — this is the known, already-documented flake (STATE.md / PROJECT.md: "intermittently time out under full-suite runs but pass in isolation"). Confirmed by re-running both files in isolation: both passed (4/4). Unrelated to this plan's scope (static HTML/Markdown file moves only, zero code-path overlap) — not fixed, per the scope-boundary rule against touching pre-existing, unrelated failures.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `frontend-design/` is now the single, duplicate-free source of prototype truth Phase 6 (design system) and Phase 7 (HTML prototype build) need — no dangling links, no `xo/`/`sepcare/` snapshots to accidentally reference
- `archive/README.md` gives a durable index if any archived screen's content needs to be consulted during Phase 6/7 salvage decisions
- No blockers for Plan 05-02

---
*Phase: 05-repo-cleanup-canonicalization*
*Completed: 2026-09-25*

## Self-Check: PASSED

All 16 created/modified artifact files confirmed present on disk; all 3 task commits (`c58e913`, `6aefcef`, `36b6610`) confirmed present in `git log`.
