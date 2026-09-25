---
phase: 05-repo-cleanup-canonicalization
plan: 02
subsystem: infra
tags: [docs, git-mv, repo-cleanup, phase-gate]

# Dependency graph
requires:
  - phase: 05-repo-cleanup-canonicalization
    provides: "archive/README.md scaffold and frontend-design/ live-tree rewiring (Plan 01)"
provides:
  - "context/sdg/ reduced to sdg-3-details.md only — sdg-11/sdg-13 (cities/climate SDG brainstorms) archived"
  - "context/implementation-plans/ reduced to neonatal-sepsis-armband.md only — heatstroke-early-warning.md and diarrheal-dehydration-screening.md archived"
  - "archive/README.md fully indexed with all 13 archived items across both plans"
  - "phase-gate verification confirming CLEAN-03 evidence-integrity and Plan 01's reference-cleanliness are both durable"
affects: [06-design-system, 07-html-prototype]

# Actuals (#2632)
actuals:
  tokens: 2100
  tasks: 3
  commits: 3
plan_head_before: 5d42c5593077f800909c4d0f6cb8d198b80d2be7

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "git mv with full-path-mirror destination (archive/context/... mirrors context/...) for single off-topic files, matching Plan 01's D-07 rule"
    - "mkdir -p the archive destination directory before git mv when the parent doesn't yet exist — some git versions' git mv does not auto-create intermediate directories"

key-files:
  created:
    - archive/context/sdg/sdg-11-details.md
    - archive/context/sdg/sdg-13-details.md
    - archive/context/implementation-plans/heatstroke-early-warning.md
    - archive/context/implementation-plans/diarrheal-dehydration-screening.md
  modified:
    - archive/README.md

key-decisions:
  - "Split Task 1's git mv + README update into two commits after a batched `git add` with one nonexistent old-path pathspec failed atomically and silently left archive/README.md unstaged — verified before committing, corrected with a follow-up commit rather than amending"

patterns-established:
  - "Full-path-mirror archiving for single off-topic markdown docs: archive/context/sdg/foo.md mirrors context/sdg/foo.md exactly, unlike Plan 01's flattened archive/frontend-design-{name}/ pattern for whole prototype subtrees"

requirements-completed: [CLEAN-01, CLEAN-03]

coverage:
  - id: D1
    description: "context/sdg/ contains only sdg-3-details.md — sdg-11 and sdg-13 archived via git mv, indexed in archive/README.md"
    requirement: CLEAN-01
    verification:
      - kind: other
        ref: "test -f archive/context/sdg/sdg-11-details.md && test -f archive/context/sdg/sdg-13-details.md && test ! -f context/sdg/sdg-11-details.md && test ! -f context/sdg/sdg-13-details.md && test -f context/sdg/sdg-3-details.md && grep -q sdg-11-details.md archive/README.md && grep -q sdg-13-details.md archive/README.md"
        status: pass
    human_judgment: false
  - id: D2
    description: "context/implementation-plans/ contains only neonatal-sepsis-armband.md — heatstroke-early-warning.md and diarrheal-dehydration-screening.md archived via git mv, indexed in archive/README.md"
    requirement: CLEAN-01
    verification:
      - kind: other
        ref: "test -f archive/context/implementation-plans/heatstroke-early-warning.md && test -f archive/context/implementation-plans/diarrheal-dehydration-screening.md && test ! -f context/implementation-plans/heatstroke-early-warning.md && test ! -f context/implementation-plans/diarrheal-dehydration-screening.md && test -f context/implementation-plans/neonatal-sepsis-armband.md && grep -q heatstroke-early-warning.md archive/README.md && grep -q diarrheal-dehydration-screening.md archive/README.md"
        status: pass
    human_judgment: false
  - id: D3
    description: "CLEAN-03 evidence-integrity guarantee confirmed: git diff --stat across all 6 protected sepsis/health-evidence paths is empty (zero content drift for the whole phase)"
    requirement: CLEAN-03
    verification:
      - kind: other
        ref: "git diff --stat HEAD -- context/implementation-plans/neonatal-sepsis-armband.md context/web-research/ context/sdg/sdg-3-details.md context/research/ context/design-opportunities/ context/mockups/ (empty output)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Plan 01's frontend-design/ salvage-and-rewire work is durable — zero remaining sepcare/, frontend-design/xo, or ../parentsdashboard-style substrings in the live tree"
    requirement: CLEAN-01
    verification:
      - kind: other
        ref: "grep -rn 'sepcare/|frontend-design/xo|frontend-design/sepcare|\\.\\./parentsdashboard|\\.\\./\\.\\./parentsdashboard' frontend-design/*.html (zero hits, exit 1)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Existing regression suite remains green after all Phase 5 file moves (no code-path disturbance from static-doc relocations)"
    verification:
      - kind: other
        ref: "npm test (vitest run) -> 7 files passed, 1 skipped (known flake); 59 tests passed, 1 skipped"
        status: pass
    human_judgment: false

duration: 2min
completed: 2026-09-25
status: complete
---

# Phase 5 Plan 2: Repo Cleanup — Off-Topic Archive + Phase-Gate Verification Summary

**Archived the 4 remaining off-topic SDG/implementation-plan docs (sdg-11, sdg-13, heatstroke-early-warning, diarrheal-dehydration-screening) via git mv into archive/, fully indexed them in archive/README.md, then ran the phase-gate sweep proving CLEAN-03's evidence-integrity guarantee and Plan 01's reference-cleanliness both held for the entire phase.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-09-25T18:03:13Z
- **Completed:** 2026-09-25
- **Tasks:** 3
- **Files modified:** 5 (4 archived via git mv, 1 archive/README.md updated across 2 commits)

## Accomplishments
- `context/sdg/sdg-11-details.md` (Sustainable Cities brainstorm) and `context/sdg/sdg-13-details.md` (Climate Action brainstorm) archived to `archive/context/sdg/`, leaving `context/sdg/` with only the sepsis-relevant `sdg-3-details.md`
- `context/implementation-plans/heatstroke-early-warning.md` and `context/implementation-plans/diarrheal-dehydration-screening.md` archived to `archive/context/implementation-plans/`, leaving `context/implementation-plans/` with only `neonatal-sepsis-armband.md` — this closes the CLEAN-01 literal-wording gap RESEARCH.md flagged (D-09) between the requirement text ("heatstroke, diarrheal dehydration") and Plan 01's original scope
- `archive/README.md` now indexes all 13 archived items across both plans (9 from Plan 01 + 4 from this plan), each with original path, archived-to path, and reason
- Phase-gate verification confirmed: zero dangling `sepcare/`/`xo`/`parentsdashboard`-style references remain anywhere in `frontend-design/*.html`; `git diff --stat` across all 6 CLEAN-03-protected evidence paths (`neonatal-sepsis-armband.md`, `context/web-research/`, `sdg-3-details.md`, `context/research/`, `context/design-opportunities/`, `context/mockups/`) is empty; the existing test suite remains green (59 passed, 1 known-flake skip)

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end off-topic archive — sdg-11 + sdg-13** - `f3df52c` (docs) + `1b07b6e` (docs, staging correction)
2. **Task 2: Off-topic archive — heatstroke + diarrheal-dehydration implementation plans** - `792e51f` (docs)
3. **Task 3: Phase-gate verification — evidence integrity + reference-cleanliness sweep** - read-only, no commit (no files created or modified)

**Plan metadata:** committed via final commit step below.

## Files Created/Modified
- `archive/context/sdg/sdg-11-details.md` - Archived via git mv from `context/sdg/sdg-11-details.md` (off-topic Sustainable Cities brainstorm)
- `archive/context/sdg/sdg-13-details.md` - Archived via git mv from `context/sdg/sdg-13-details.md` (off-topic Climate Action brainstorm)
- `archive/context/implementation-plans/heatstroke-early-warning.md` - Archived via git mv from `context/implementation-plans/heatstroke-early-warning.md` (off-topic, D-09)
- `archive/context/implementation-plans/diarrheal-dehydration-screening.md` - Archived via git mv from `context/implementation-plans/diarrheal-dehydration-screening.md` (off-topic, D-09)
- `archive/README.md` - Appended 4 new rows (2 per task) indexing the newly archived files with original path, archived-to path, and reason

## Decisions Made
- Used full-path-mirror archive destinations (`archive/context/sdg/...`, `archive/context/implementation-plans/...`) rather than flattened names, matching D-07's general rule for lone off-topic files (as opposed to Plan 01's flattened `archive/frontend-design-{name}/` pattern used only for whole salvaged prototype subtrees)
- `mkdir -p` was needed for `archive/context/sdg/` and `archive/context/implementation-plans/` before the first `git mv` into each — this git version's `git mv` does not auto-create intermediate destination directories, unlike Plan 01's moves into already-existing `archive/` subdirectories

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrected a silently-failed batched `git add` in Task 1**
- **Found during:** Task 1 (sdg-11/sdg-13 archive)
- **Issue:** A single `git add` invocation listing the renamed destination paths, the (now-gone) original source paths, and `archive/README.md` failed atomically with `fatal: pathspec ... did not match any files` because two of the listed paths no longer existed post-rename. Git aborted the whole `add` without staging anything — including `archive/README.md`, which was silently left unstaged. The commit that followed therefore only captured the two `git mv` renames, not the README index update.
- **Fix:** Verified with `git status --short` and `git show --stat HEAD` after the first commit, confirmed `archive/README.md`'s content was correct on disk but unstaged, staged it, and committed it in a follow-up commit rather than amending.
- **Files modified:** archive/README.md
- **Verification:** `grep -n "sdg-11\|sdg-13" archive/README.md` confirmed both rows present after the follow-up commit; `git log --oneline` shows both commits.
- **Committed in:** `1b07b6e` (follow-up commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — staging mechanics, no scope change)
**Impact on plan:** No impact on plan content or outcome. Task 2's staging was done correctly in one pass by staging each renamed destination path plus `archive/README.md` individually (avoiding stale source paths), informed by this deviation.

## Issues Encountered
None beyond the staging correction documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 5's full scope is now complete: `frontend-design/` is a single canonical flat prototype tree (Plan 01), and `context/sdg/` + `context/implementation-plans/` contain only sepsis-relevant content (this plan) — both CLEAN-01 and CLEAN-02 satisfied
- CLEAN-03's evidence-integrity guarantee is verified end-to-end: every sepsis-relevant and health-adjacent evidence path (`neonatal-sepsis-armband.md`, `web-research/`, `sdg-3-details.md`, `research/`, `design-opportunities/`, `mockups/`) is byte-identical to its pre-phase state
- `archive/README.md` is the durable, fully-indexed record of all 13 archived items across both plans for any future salvage-decision reference
- No blockers for Phase 6 (design system) or Phase 7 (HTML prototype build)

---
*Phase: 05-repo-cleanup-canonicalization*
*Completed: 2026-09-25*

## Self-Check: PASSED

All 4 archived artifact files confirmed present on disk; all 3 task commits (`f3df52c`, `1b07b6e`, `792e51f`) confirmed present in `git log`.
