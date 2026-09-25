# Phase 5: Repo Cleanup & Canonicalization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-25
**Phase:** 5-Repo Cleanup & Canonicalization
**Areas discussed:** Canonical prototype tree, frontend-handoff duplicate, Off-topic material scope, Archive mechanism

---

## Canonical prototype tree

| Option | Description | Selected |
|--------|-------------|----------|
| Root is canonical, archive xo/ and sepcare/ | Root files follow the documented AGENTS.md convention and are the most complete/recent set | |
| Need to inspect content first | Diff/skim xo/ and sepcare/ against root before deciding | |
| Merge unique screens into root, then archive the rest | Copy any unique screens (settings, profile-selection, etc.) into root before archiving subdirs | (initial framing) |

**User's choice (round 1, free text):** "all of them were made by different team members and they didn't organise it well ..."

**Follow-up question:** Inspect xo/ and sepcare/ content first to check for unique screens worth salvaging, or archive both wholesale trusting root has everything?

| Option | Description | Selected |
|--------|-------------|----------|
| Inspect first, salvage unique screens, then archive | Review xo/settings.html, sepcare/profile-selection.html, etc. against root; copy anything not already covered before archiving | ✓ |
| Archive both wholesale, root is good enough | Skip reconciliation | |

**User's choice:** Inspect first, salvage unique screens, then archive.
**Notes:** Confirmed disorganized multi-teammate history — not a mistake to dig into further, just something to reconcile carefully.

---

## frontend-handoff duplicate

| Option | Description | Selected |
|--------|-------------|----------|
| Keep context/frontend-handoff/, archive root copy | Groups with other context/ planning docs | ✓ |
| Keep root frontend-handoff/, archive context/ copy | Keeps it a top-level active directory | |

**User's choice:** Keep `context/frontend-handoff/`, archive root copy.
**Notes:** None.

---

## Off-topic material scope

| Option | Description | Selected |
|--------|-------------|----------|
| Archive only sdg-11/sdg-13; keep design-opportunities & research as-is | Those two SDG files are unambiguously off-domain; broader health brainstorm docs stay | ✓ |
| Archive sdg-11/sdg-13 AND design-opportunities/research | Stricter reading of CLEAN-01 | |

**User's choice:** Archive only sdg-11/sdg-13; keep design-opportunities & research as-is.
**Notes:** None.

---

## Archive mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Top-level archive/ dir, mirroring original paths + README | Each archived subtree gets a pointer note; archive/README.md indexes everything | ✓ |
| Git branch/tag, delete from working tree | Move to a dedicated git ref, remove from main's working tree | |

**User's choice:** Top-level `archive/` dir, mirroring original paths + README.
**Notes:** None.

---

## Claude's Discretion

- Exact salvage-copy process for unique xo/sepcare screens (naming/markup adaptation to match root conventions).
- Exact wording/format of pointer notes beyond required content (original path + reason).

## Deferred Ideas

None — discussion stayed within phase scope.
