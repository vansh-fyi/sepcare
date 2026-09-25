# Phase 5: Repo Cleanup & Canonicalization - Pattern Map

**Mapped:** 2026-09-25
**Files analyzed:** ~25 (moves/salvages/rewrites) + 2 new files (archive/README.md, AGENTS.md note)
**Analogs found:** N/A — this phase has no application-code analogs; "patterns" are structural/textual conventions extracted from the repo's own docs and existing HTML link syntax.

**Scope note:** This phase performs zero application-code work (no controllers/services/components/CRUD). Standard role/data-flow classification from other phases doesn't apply. Instead this document classifies each file by **operation type** (salvage-and-rewire, plain archive, off-topic archive, pointer-note authoring) and gives the exact conventions/strings to copy for each.

## File Classification (by operation type)

| File / Path | Operation | Governing Convention | Destination |
|---|---|---|---|
| `frontend-design/sepcare/parent-vitals.html` | salvage + rewire | `frontend-design/AGENTS.md` structure rules | `frontend-design/parent-vitals.html` |
| `frontend-design/sepcare/parent-notifications.html` | salvage + rewire | same | `frontend-design/parent-notifications.html` |
| `frontend-design/xo/clinical-vitals.html` | salvage + rewire | same | `frontend-design/clinical-vitals.html` |
| `frontend-design/xo/settings.html` | salvage + rewire | same | `frontend-design/settings.html` |
| `frontend-design/xo/device-status.html` | salvage + rewire | same | `frontend-design/device-status.html` |
| `frontend-design/sepcare/profile-selection.html` | salvage (no known inbound refs; verify) | same | `frontend-design/profile-selection.html` |
| `frontend-design/xo/parentrisktimeline.html` | salvage (D-13 discretion) | same | `frontend-design/parentrisktimeline.html` (or `parent-risk-timeline.html` to match hyphenated convention — planner's call) |
| `frontend-design/parent-dashboard.html` | in-place rewrite (rewire only, not moved) | Pattern 1 below | unchanged path |
| `frontend-design/parentsdashboard.html` | in-place rewrite (rewire only, not moved) | Pattern 1 below | unchanged path |
| `frontend-design/clinical-overview.html` | in-place rewrite (2 links only) | Pattern 1 below | unchanged path |
| `frontend-design/xo/parentoverview.html` | plain archive (no salvage) | D-07/D-02 | `archive/frontend-design-xo/parentoverview.html` |
| `frontend-design/sepcare/splash.html` | plain archive (no salvage) | D-07/D-02 | `archive/frontend-design-sepcare/splash.html` |
| `frontend-design/sepcare/preview.html` | plain archive (dev tool, not screen) | D-07/D-02, Pitfall 5 | `archive/frontend-design-sepcare/preview.html` |
| `frontend-handoff/*.md` (4 files) | plain archive (duplicate of `context/frontend-handoff/`) | D-03/D-07, full-path mirror | `archive/frontend-handoff/*.md` |
| `context/sdg/sdg-11-details.md` | off-topic archive | D-04/D-07, full-path mirror | `archive/context/sdg/sdg-11-details.md` |
| `context/sdg/sdg-13-details.md` | off-topic archive | D-04/D-07, full-path mirror | `archive/context/sdg/sdg-13-details.md` |
| `context/implementation-plans/heatstroke-early-warning.md` | off-topic archive | D-09/D-07, full-path mirror | `archive/context/implementation-plans/heatstroke-early-warning.md` |
| `context/implementation-plans/diarrheal-dehydration-screening.md` | off-topic archive | D-09/D-07, full-path mirror | `archive/context/implementation-plans/diarrheal-dehydration-screening.md` |
| `archive/README.md` | new file (pointer index) | D-08 | created |
| `frontend-design/AGENTS.md` | edited (append pointer note) | D-08 | appended, not rewritten |

## Pattern Assignments

### Pattern 1: Move-and-rewire (salvage + fix all inbound/outbound links)

**Analog / source of truth:** `05-RESEARCH.md` §"Pattern 1: Move-and-rewire as one unit" — already contains the exact verified `grep -n` line numbers and before/after strings. Do not re-derive; copy directly.

**Exact rewrite table (copy verbatim into plan tasks):**

Inbound references in `frontend-design/parent-dashboard.html` AND `frontend-design/parentsdashboard.html` (identical lines 225, 300, 396, 1137, 1143 in **both** files — 10 lines total):
```html
<!-- BEFORE -->
<a id="btnNotifications" href="sepcare/parent-notifications.html" onclick="navigateToNotifications(event)" ...>
<a id="seeAllVitalsBtn" href="sepcare/parent-vitals.html" onclick="navigateToVitals(event)" ...>See All</a>
<a href="sepcare/parent-vitals.html" onclick="navigateToVitals(event)" ...>
window.location.href = 'sepcare/parent-vitals.html?state=' + encodeURIComponent(stateParam);
window.location.href = 'sepcare/parent-notifications.html?state=' + encodeURIComponent(stateParam);

<!-- AFTER (strip "sepcare/" prefix) -->
<a id="btnNotifications" href="parent-notifications.html" onclick="navigateToNotifications(event)" ...>
<a id="seeAllVitalsBtn" href="parent-vitals.html" onclick="navigateToVitals(event)" ...>See All</a>
<a href="parent-vitals.html" onclick="navigateToVitals(event)" ...>
window.location.href = 'parent-vitals.html?state=' + encodeURIComponent(stateParam);
window.location.href = 'parent-notifications.html?state=' + encodeURIComponent(stateParam);
```

Outbound (back-links) inside the moved files themselves — `parent-vitals.html:122,460,898` and `parent-notifications.html:130,460,850`:
```html
<!-- BEFORE -->
<a href="../parentsdashboard.html" onclick="returnToDashboard(event)" ...>
window.location.href = '../parentsdashboard.html?state=' + encodeURIComponent(stateParam);

<!-- AFTER (strip "../") -->
<a href="parentsdashboard.html" onclick="returnToDashboard(event)" ...>
window.location.href = 'parentsdashboard.html?state=' + encodeURIComponent(stateParam);
```
Sibling refs between the two moved files (bare `href="parent-vitals.html"` inside `parent-notifications.html` and vice versa) need **no change**.

`xo/` salvage targets — mixed depth, watch the double-dot bug:
```html
<!-- clinical-vitals.html:108,299 (BEFORE, one level up — correct pre-move) -->
<a href="../clinical-overview.html" ...>
<!-- AFTER (flat, strip "../") -->
<a href="clinical-overview.html" ...>

<!-- settings.html:161,197 (BEFORE) -->
<a href="../parent-notifications.html" ...>
<a href="../device-status.html" ...>
<!-- AFTER -->
<a href="parent-notifications.html" ...>
<a href="device-status.html" ...>

<!-- settings.html:101 — PRE-EXISTING BUG: has "../../" not "../" -->
<!-- BEFORE -->
<a href="../../parentsdashboard.html" ...>
<!-- AFTER — strip BOTH "../../" segments, not one -->
<a href="parentsdashboard.html" ...>

<!-- device-status.html:122 (BEFORE) -->
<a href="../parentsdashboard.html" ...>
<!-- AFTER -->
<a href="parentsdashboard.html" ...>
```

`clinical-overview.html` (canonical root, stays in place) — only rewrite the 2 links whose targets are actually being salvaged this phase; leave the other 7 dangling hrefs (`alert-center.html`, `care-handoff.html`, etc.) untouched — those are out of scope (Phase 6/7):
```html
<!-- BEFORE -->
href="clinical-vitals.html?id=..."   <!-- already bare relative, verify it now resolves since clinical-vitals.html lands flat in same dir -->
href="settings.html"                  <!-- already bare relative, verify it now resolves -->
```
Since `clinical-vitals.html` and `settings.html` land in the same flat directory as `clinical-overview.html`, these two hrefs likely need **no textual change** — only verification that the salvage move made the target exist. Do not touch the other 7 unresolved hrefs.

**Verification command per move (from RESEARCH.md Quick run):**
```bash
grep -rn "sepcare/\|frontend-design/xo\|\.\./parentsdashboard\|\.\./\.\./parentsdashboard" frontend-design/*.html
# expect zero hits after all salvage+rewire tasks complete
```

---

### Pattern 2: Plain archive move (git mv, no content edits)

**Convention source:** D-07 (CONTEXT.md) + RESEARCH.md "Recommended Project Structure" — **note the asymmetric naming**: prototype subtrees flatten+hyphenate, everything else mirrors full path.

```bash
# Prototype subtrees (flattened, hyphenated — NOT nested under archive/frontend-design/)
mkdir -p archive/frontend-design-xo archive/frontend-design-sepcare
git mv frontend-design/xo/parentoverview.html      archive/frontend-design-xo/parentoverview.html
git mv frontend-design/sepcare/splash.html         archive/frontend-design-sepcare/splash.html
git mv frontend-design/sepcare/preview.html        archive/frontend-design-sepcare/preview.html

# Everything else (full relative-path mirror)
mkdir -p archive/frontend-handoff archive/context/sdg archive/context/implementation-plans
git mv frontend-handoff/OVERVIEW.md       archive/frontend-handoff/OVERVIEW.md
git mv frontend-handoff/PRD.md            archive/frontend-handoff/PRD.md
git mv frontend-handoff/SCREEN-CONTENT.md archive/frontend-handoff/SCREEN-CONTENT.md
git mv frontend-handoff/USER-FLOWS.md     archive/frontend-handoff/USER-FLOWS.md
git mv context/sdg/sdg-11-details.md archive/context/sdg/sdg-11-details.md
git mv context/sdg/sdg-13-details.md archive/context/sdg/sdg-13-details.md
git mv context/implementation-plans/heatstroke-early-warning.md archive/context/implementation-plans/heatstroke-early-warning.md
git mv context/implementation-plans/diarrheal-dehydration-screening.md archive/context/implementation-plans/diarrheal-dehydration-screening.md
```

**Rule:** `git mv`, never plain `mv` + `git add` (D-11) — all target paths confirmed git-tracked (`git ls-files` output captured this session, see Metadata).

**Order matters:** For `xo/` and `sepcare/`, do NOT `git mv` the whole directory in one shot — salvage the load-bearing files out first (Pattern 1 destinations), then archive whatever remains as individual `git mv` calls (or `git mv` the now-pruned directory itself if empty of salvage targets — `xo/` and `sepcare/` will still have files left after salvage, so continue moving file-by-file, then `git mv` (now-empty parent won't exist automatically; just ensure no leftover empty dirs — git doesn't track empty dirs so this is moot).

---

### Pattern 3: Archive pointer note (`archive/README.md`)

**No prior convention exists in this repo** (no `archive/` directory currently exists — confirmed via `ls archive/` returning nothing). Author fresh, per D-08's required content: original path, one-line reason (superseded snapshot / off-topic / duplicate), moved-from-phase attribution.

**Suggested format** (Claude's discretion per CONTEXT.md, exact wording flexible):
```markdown
# Archive

Items moved here during Phase 5 (Repo Cleanup & Canonicalization) — nothing here
is deleted, only relocated out of the active working view. See
`.planning/phases/05-repo-cleanup-canonicalization/` for the decision record.

| Original Path | Reason |
|---|---|
| `frontend-design/xo/parentoverview.html` | superseded — covered by canonical `frontend-design/parent-dashboard.html` |
| `frontend-design/sepcare/splash.html` | superseded — redundant with canonical root `splash.html` (59 vs 232 lines) |
| `frontend-design/sepcare/preview.html` | dev-only iframe preview harness, not a product screen |
| `frontend-handoff/*.md` | duplicate — canonical copy lives at `context/frontend-handoff/` |
| `context/sdg/sdg-11-details.md` | off-topic — Sustainable Cities brainstorm, unrelated to neonatal sepsis |
| `context/sdg/sdg-13-details.md` | off-topic — Climate Action brainstorm, unrelated to neonatal sepsis |
| `context/implementation-plans/heatstroke-early-warning.md` | off-topic — other-SDG brainstorm (CLEAN-01) |
| `context/implementation-plans/diarrheal-dehydration-screening.md` | off-topic — other-SDG brainstorm (CLEAN-01) |
```

---

### Pattern 4: Live-tree pointer note (append to `frontend-design/AGENTS.md`)

**Analog:** the file itself — append in the same terse, imperative-doc style as its existing "Structure conventions" section (see full text below, already read in full — 18 lines, no existing "history/archive" section to conflict with).

**Existing style reference** (`frontend-design/AGENTS.md` full content, for tone/format matching):
```markdown
## Structure conventions

- **One HTML file per page/screen.** Each screen of the app...
- **Reusable components live in shared files, not copy-pasted markup.** ...
- **CSS is centralized.** ...
- **JavaScript is centralized and external, not inline.** ...

## Adding a new page

1. Create a new `.html` file for the page.
2. Reuse existing component markup/classes from `components.css`...
```

**Suggested append** (new section, matching heading style):
```markdown
## Archived subtrees

`xo/` and `sepcare/` were uncoordinated snapshots built by different teammates
during parallel prototyping. As of Phase 5 (repo cleanup), their unique screens
were salvaged into this directory's flat structure (see git history for
`parent-vitals.html`, `parent-notifications.html`, `clinical-vitals.html`,
`settings.html`, `device-status.html`, `profile-selection.html`,
`parentrisktimeline.html`) and the remaining files were moved to
`archive/frontend-design-xo/` and `archive/frontend-design-sepcare/` — see
`archive/README.md` for the full index. Do not recreate `xo/`/`sepcare/`.
```

## Shared Patterns

### Relative-link syntax convention
**Source:** existing `href`/`window.location.href` usage across `frontend-design/*.html` (verified in RESEARCH.md).
**Apply to:** every salvage/rewire task.
- Same-directory (flat tree) references are always bare filenames: `href="parent-vitals.html"`, never `./parent-vitals.html`.
- Query-string state passing uses `window.location.href = 'file.html?state=' + encodeURIComponent(stateParam);` — preserve this exact call shape when rewriting, only change the path segment.

### Git history preservation
**Source:** D-11, RESEARCH.md "Code Examples" section.
**Apply to:** every single move in this phase, no exceptions.
```bash
git mv <old-path> <new-path>   # never: mv <old> <new> && git add
```

### Verification sweep (run after every wave of moves)
**Source:** RESEARCH.md Validation Architecture, Quick run command.
```bash
grep -rn "sepcare/\|frontend-design/xo\|frontend-design/sepcare" frontend-design/*.html
# Phase gate: also run existing `npm test` once at the end as a no-op regression guard (zero overlap expected)
```

## No Analog Found

No application-code analogs apply — this phase has no precedent elsewhere in the repo for "archive/README.md index" or "pointer note in a live AGENTS.md" since `archive/` does not yet exist. Both are authored fresh per D-08, using the conventions extracted above (existing AGENTS.md tone, D-07's literal path examples).

| File | Role | Reason |
|------|------|--------|
| `archive/README.md` | new doc | no `archive/` directory exists yet anywhere in repo history to copy from |

## Open Items Carried From Research (planner must resolve, not silently decide)

- **A1 / Open Question 1:** `heatstroke-early-warning.md` and `diarrheal-dehydration-screening.md` archiving is confirmed in scope per CONTEXT.md D-09 (added post-research, user confirmed) — already reflected in Pattern 2 above. No longer open.
- **A2 / Open Question 2:** `parent-dashboard.html`/`parentsdashboard.html` duplicate — confirmed in scope per CONTEXT.md D-12 (added post-research, expanded scope): `parent-dashboard.html` is canonical, `parentsdashboard.html` is archived, all 8 inbound references updated. Add `archive/frontend-design/parentsdashboard.html` — full-path mirror since it's a lone in-root file, not a subtree — verify against D-07's literal examples before finalizing this one destination path (not explicitly given in D-07/D-12 text; use full-path-mirror as the default per the general rule).
- **Open Question 3 (`xo/parentrisktimeline.html`):** resolved per CONTEXT.md D-13 — salvage into root, not archive. Reflected in File Classification table above.

## Metadata

**Analog search scope:** `frontend-design/`, `frontend-handoff/`, `context/sdg/`, `context/implementation-plans/`, repo root (for existing `archive/` dir — none found)
**Files scanned:** `frontend-design/AGENTS.md` (full read), `git ls-files` output for all target paths (confirmed tracked), `ls archive/` (confirmed does not exist yet)
**Pattern extraction date:** 2026-09-25
