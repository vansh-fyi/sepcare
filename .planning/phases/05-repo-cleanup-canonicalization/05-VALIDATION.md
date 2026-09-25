---
phase: "5"
slug: "repo-cleanup-canonicalization"
status: draft
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-25"
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None applicable — pure filesystem reorganization phase, no application code or test-worthy business logic produced |
| **Config file** | none — Wave 0 not needed, no framework gap exists |
| **Quick run command** | `grep -rn "sepcare/\|frontend-design/xo\|frontend-design/sepcare" frontend-design/*.html` (should return zero hits after moves + reference rewrites) |
| **Full suite command** | Existing `npm test` (`vitest run`) — unaffected by this phase's scope, run once at phase end as a regression guard confirming no accidental overlap with `src/`/`tests/` |
| **Estimated runtime** | ~1 second (grep) / existing suite runtime for the full-suite regression guard |

---

## Sampling Rate

- **After every task commit:** Run the targeted `grep` for whichever path(s) that task moved/archived
- **After every plan wave:** Full `grep -rn` sweep across `frontend-design/*.html` for any remaining `sepcare/`, `xo/`, or bare prototype-tree references
- **Before `/gsd-verify-work`:** Existing `npm test` suite must be green (confirms zero disturbance to `src/`/`tests/`)
- **Max feedback latency:** ~5 seconds (grep-based checks are near-instant)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-* | 01 | 1 | CLEAN-02 | — / — | N/A | filesystem assertion | `! test -d frontend-design/xo && ! test -d frontend-design/sepcare && ! test -d frontend-handoff` | N/A — no test file, filesystem check | ⬜ pending |
| 05-01-* | 01 | 1 | CLEAN-02 | — / — | N/A | link-integrity grep | `grep -rL "sepcare/" frontend-design/*.html` (expect all files listed = zero matches) | N/A | ⬜ pending |
| 05-02-* | 02 | 1 | CLEAN-01 | — / — | N/A | filesystem assertion | `test -f archive/context/sdg/sdg-11-details.md && test -f archive/context/sdg/sdg-13-details.md && ! test -f context/sdg/sdg-11-details.md` | N/A | ⬜ pending |
| 05-03-* | 03 | 1 | CLEAN-03 | — / — | N/A | scripted diff check | `git diff --stat HEAD -- context/implementation-plans/neonatal-sepsis-armband.md context/web-research/ context/sdg/sdg-3-details.md context/research/` (expect empty output) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Exact task IDs are assigned by the planner; the rows above bind by requirement, not by final task numbering.*

---

## Wave 0 Requirements

*None: "Existing infrastructure covers all phase requirements." — no test framework applies to this phase's deliverable (filesystem state, not code), so there is no framework gap to seed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pointer note explains what moved and why | CLEAN-02 | Content quality (is the explanation clear/accurate) isn't a scriptable assertion | Read `archive/README.md` and any in-place pointer notes (e.g. `frontend-design/AGENTS.md`); confirm each archived item has an original-path + reason entry |
| Salvaged screens (xo/sepcare → root) conform to `frontend-design/AGENTS.md` conventions | CLEAN-02 | Style/structure conformance (centralized CSS, no inline scripts) needs human eyeball confirmation, not just a grep | Open each salvaged HTML file, confirm no `<style>`/inline `<script>` blocks, confirm it links `components.css` and shared JS |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies — confirmed via deterministic probe: 6/6 automated commands across both plans
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (N/A — no Wave 0 needed)
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-25 (gsd-plan-checker: VERIFICATION PASSED, 0 blockers)
