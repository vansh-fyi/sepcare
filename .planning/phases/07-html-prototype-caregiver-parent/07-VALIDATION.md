---
phase: "07"
slug: "html-prototype-caregiver-parent"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-30"
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.11 |
| **Config file** | `vitest.config.ts` — `environment: "node"`, `@` alias to `src/` |
| **Quick run command** | `npx vitest run tests/<file>.test.ts` |
| **Full suite command** | `npm test` (→ `vitest run`) |
| **Estimated runtime** | ~30 seconds (per STATE.md's Phase 6 close-out baseline) |

No `jsdom` or `@testing-library/*` is installed. Component tests use `renderToStaticMarkup(createElement(Component, props))` from `react-dom/server`, asserting on the resulting markup string (`data-slot`/`data-state`/`data-icon` attributes, class fragments, text content) — per the existing convention in `tests/design-system.test.ts`. New component tests for this phase follow the identical pattern.

---

## Sampling Rate

- **After every task commit:** Run the relevant single test file (`npx vitest run tests/<file>.test.ts`)
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-02 | 01 | 1 | CARE-01 | — | N/A | unit (renderToStaticMarkup) | `npx vitest run tests/prototype.caregiver-home.test.ts` | ❌ pre-exec | ⬜ pending |
| 07-01-02 | 01 | 1 | CARE-02 | — | N/A | unit (markup assertion) | `npx vitest run tests/prototype.status.test.ts` | ❌ pre-exec | ⬜ pending |
| 07-03-01 | 03 | 2 | CARE-03 | — | N/A | unit (pure function) | `npx vitest run tests/prototype.timeline.test.ts` | ❌ pre-exec | ⬜ pending |
| 07-05-01 | 05 | 3 | CARE-04 | — | N/A | unit (pure function) | `npx vitest run tests/prototype.trend-window.test.ts` | ❌ pre-exec | ⬜ pending |
| 07-02-02 | 02 | 1 | CARE-05 | — | N/A | unit (pure function) | `npx vitest run tests/prototype.connection-status.test.ts` | ❌ pre-exec | ⬜ pending |
| 07-01-01 | 01 | 1 | CARE-06 | — | N/A | unit (markup assertion) | `npx vitest run tests/prototype.caregiver-nav.test.ts` | ❌ pre-exec | ⬜ pending |
| 07-04-02 | 04 | 2 | PARENT-01 | — | N/A | unit (markup assertion) | `npx vitest run tests/prototype.parent-home.test.ts` | ❌ pre-exec | ⬜ pending |
| 07-07-03 | 07 | 4 | PARENT-02/03 | — | N/A | unit (markup assertion, byte-identical parity test) | `npx vitest run tests/prototype.parent-detail.test.ts` | ❌ pre-exec | ⬜ pending |
| 07-03-02 | 03 | 2 | PARENT-04 | — | N/A | unit (markup assertion) | `npx vitest run tests/prototype.device-select-list.test.ts` | ❌ pre-exec | ⬜ pending |
| 07-07-01 | 07 | 4 | PARENT-05 | — | N/A | manual-only (UAT) | `/gsd-verify-work 7` conversational UAT | n/a | ⬜ pending |
| 07-08-02 | 08 | 5 | (cross-cutting) | T-07-03 | Prevent accidental live-Supabase import in prototype routes | unit + grep guard | `grep -rl "@/lib/supabase" src/app/(prototype)/ \| wc -l \| tr -d ' '` | ❌ pre-exec | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. Task ID/Plan/Wave/Threat Ref columns finalized 2026-09-30 against the 8 committed PLAN.md files (07-01..07-08); `File Exists: ❌ pre-exec` reflects that Wave 1 hasn't executed yet, not a planning gap — re-check after `/gsd-execute-phase 7`.*

---

## Wave 0 Requirements

No separate Wave 0 — the planner folded fixture/test scaffolding directly into Wave 1 (07-01, 07-02), each with its own automated `<verify>`. Scaffolding is planned, not yet executed:

- [ ] `src/lib/fixtures/readings.ts` — 07-01 Task 1
- [ ] `src/lib/fixtures/risk-status.ts` — `mapRiskStatus()` helper — 07-01 Task 1
- [ ] `src/lib/fixtures/device.ts` — 07-01 Task 1
- [ ] `src/lib/fixtures/connection-status.ts` — `getConnectionState()` helper — 07-02 Task 2
- [ ] `tests/prototype.*.test.ts` files listed above — created alongside their respective plan/task, not pre-created separately
- [ ] Framework install: none — Vitest is already configured project-wide

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Exact parent navigation flow matches the collaboratively-finalized D-03/D-04 decisions | PARENT-05 | Flow correctness is a product/UX judgment, not a unit-testable assertion beyond markup presence checks already covered above | `/gsd-verify-work 7` — walk through Home → See All → Vitals/Stats tabs, and Home → device icon → Select Device → Device Details, confirming against 07-CONTEXT.md D-03/D-04 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
