---
phase: "6"
slug: "design-system-tailwind-v4-tokens"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-26"
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.11 (existing backend suite — unaffected by this phase's frontend/tokens work) |
| **Config file** | `vitest.config.ts` — `environment: "node"`; no jsdom/browser environment or `@testing-library/react` currently installed |
| **Quick run command** | `npm run build` (fastest real signal for DSYS-01's "compiles cleanly in a real `next build`" criterion) |
| **Full suite command** | `npm run build && npm test` |
| **Estimated runtime** | ~30-60s build + existing Vitest suite runtime |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm test`
- **Before `/gsd-verify-work`:** Full suite must be green, plus the D-02 human-reviewed visual validation checkpoint (3 sample pages)
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | DSYS-01 | — | N/A (presentational phase) | build/smoke | `npm run build` | ✅ existing `next build` script | ⬜ pending |
| 06-01-02 | 01 | 1 | DSYS-03 | — | N/A | smoke | `grep -rc "@theme" src/ \| grep -v ":0" \| wc -l` (expect exactly 1 file) | ❌ W0 — no `@theme` block exists yet, this phase creates it | ⬜ pending |
| 06-02-01 | 02 | — | DSYS-02 | — | N/A | manual-only (visual UAT) + smoke | `npm run build` (route/type-error catch) + human review | ❌ W0 — sample page files don't exist yet | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*(Exact task IDs above are illustrative pending the planner's actual wave/task breakdown — the planner should reconcile IDs against the real PLAN.md files once written, per RESEARCH.md's Phase Requirements → Test Map.)*

---

## Wave 0 Requirements

- [ ] `src/app/design-system/*` sample page route files — don't exist yet, this phase creates them (sequencing gap, not a pre-existing infra gap)
- [ ] `@theme` token block — doesn't exist yet in `src/app/globals.css` (or equivalent), this phase creates it

*No test-framework install needed — Vitest's existing `node` environment is sufficient for the "does it build" signal this phase requires; it is not being asked to unit-test component render output. Per RESEARCH.md's explicit recommendation: do NOT add `@testing-library/react` + jsdom this phase — the 2-day project time budget (STATE.md) and this phase's success criteria (compiled output + human visual review, not component logic) don't need it.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ≥3 sample pages exercise real component states (Green/Amber/Red, empty/loading, nested variants) | DSYS-02 | Visual correctness (does it *look* right, match Figma Segue 3.0 intent, hold the "layout never changes across states" rule) is not a build-time or unit-test assertion | Run `npm run dev`, navigate to each `src/app/design-system/*` sample route, visually confirm all 3 states render distinctly and correctly per `06-UI-SPEC.md`; this is the D-02 human-reviewed validation checkpoint the roadmap requires before Phase 7 work starts |
| Same token set demonstrably reused across caregiver + parent visual language (DSYS-03) | DSYS-03 | "Demonstrably reused" is a code-review judgment (one `@theme` source, not two divergent ones), not a runtime assertion | Code review: confirm all sample pages import from the same token source; the `grep "@theme"` smoke check (above) is a supporting automated signal, not a substitute for this review |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
