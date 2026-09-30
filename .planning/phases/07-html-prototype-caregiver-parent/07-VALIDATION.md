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
| 07-TBD | TBD | TBD | CARE-01 | TBD | N/A | unit (renderToStaticMarkup) | `npx vitest run tests/prototype.caregiver-home.test.ts` | ❌ W0 | ⬜ pending |
| 07-TBD | TBD | TBD | CARE-02 | TBD | N/A | unit (markup assertion) | `npx vitest run tests/prototype.status.test.ts` | ❌ W0 | ⬜ pending |
| 07-TBD | TBD | TBD | CARE-03 | TBD | N/A | unit (pure function) | `npx vitest run tests/prototype.timeline.test.ts` | ❌ W0 | ⬜ pending |
| 07-TBD | TBD | TBD | CARE-04 | TBD | N/A | unit (pure function) | `npx vitest run tests/prototype.trend-window.test.ts` | ❌ W0 | ⬜ pending |
| 07-TBD | TBD | TBD | CARE-05 | TBD | N/A | unit (pure function) | `npx vitest run tests/prototype.connection-status.test.ts` | ❌ W0 | ⬜ pending |
| 07-TBD | TBD | TBD | CARE-06 | TBD | N/A | unit (markup assertion) | `npx vitest run tests/prototype.caregiver-nav.test.ts` | ❌ W0 | ⬜ pending |
| 07-TBD | TBD | TBD | PARENT-01 | TBD | N/A | unit (markup assertion) | `npx vitest run tests/prototype.parent-home.test.ts` | ❌ W0 | ⬜ pending |
| 07-TBD | TBD | TBD | PARENT-02/03 | TBD | N/A | unit (markup assertion) | `npx vitest run tests/prototype.parent-detail.test.ts` | ❌ W0 | ⬜ pending |
| 07-TBD | TBD | TBD | PARENT-04 | TBD | N/A | unit (markup assertion, same file as PARENT-01) | `npx vitest run tests/prototype.parent-home.test.ts` | ❌ W0 | ⬜ pending |
| 07-TBD | TBD | TBD | PARENT-05 | TBD | N/A | manual-only (UAT) | `/gsd-verify-work 7` conversational UAT | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. `Task ID`/`Plan`/`Wave`/`Threat Ref` columns are finalized by the planner once PLAN.md files exist — this row set is RESEARCH.md's requirement→test map carried forward.*

---

## Wave 0 Requirements

- [ ] `src/lib/fixtures/readings.ts` — the fixture module every render/unit test depends on must exist before any test can import it
- [ ] `src/lib/fixtures/risk-status.ts` — `mapRiskStatus()` helper (bridges backend `green|amber|red` to design-system `safe|caution|critical`)
- [ ] `src/lib/fixtures/connection-status.ts` — `getConnectionState()` helper (Live/Last synced Xm ago/Reconnecting)
- [ ] `tests/prototype.*.test.ts` files listed above — none exist yet
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
