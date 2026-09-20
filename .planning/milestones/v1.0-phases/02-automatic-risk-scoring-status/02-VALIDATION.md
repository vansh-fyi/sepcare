---
phase: "2"
slug: "automatic-risk-scoring-status"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-18"
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `^4.1.11` |
| **Config file** | `vitest.config.ts` — tests run against the **live** Supabase project, no mocking |
| **Quick run command** | `npx vitest run tests/risk.compute.test.ts` |
| **Full suite command** | `npm test` (→ `vitest run`) |
| **Estimated runtime** | ~10-20 seconds (live Supabase round-trips) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/risk.compute.test.ts` (or the specific file touched)
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd-verify-work`:** Full suite must be green, plus a manual check that Realtime delivers `risk_scores` INSERT events (extending `tests/realtime.subscribe.test.ts`'s pattern)
- **Max feedback latency:** ~20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-TBD | TBD | TBD | RISK-01 | — | `computeAndPersistRiskScore` correctly flags each of the 3 features per D-13/D-14 | integration | `npx vitest run tests/risk.compute.test.ts` | ❌ W0 | ⬜ pending |
| 02-TBD | TBD | TBD | RISK-02 | — | D-12's exact count mapping (0/1→green, 2→amber, 3→red), incl. "common fever" vs. "sepsis-shaped" traces | integration | `npx vitest run tests/risk.compute.test.ts` | ❌ W0 | ⬜ pending |
| 02-TBD | TBD | TBD | RISK-03 | — | POST /api/ingest results in a `risk_scores` row with no manual trigger | integration | `npx vitest run tests/ingest.route.test.ts` | extends existing | ⬜ pending |
| 02-TBD | TBD | TBD | STOR-02 | — | `risk_scores` row FK-linked to `readings`, queryable by time range | integration | `npx vitest run tests/risk.compute.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. Task IDs, Plan, and Wave columns are placeholders — the planner fills these in once actual PLAN.md task IDs exist.*

---

## Wave 0 Requirements

- [ ] `tests/risk.compute.test.ts` — new file, covers RISK-01, RISK-02, STOR-02
- [ ] Confirm `tests/helpers/cleanup.ts` still passes unmodified after the migration lands (expected: yes, if `ON DELETE CASCADE` is used per Pitfall 3 — but must be confirmed, not assumed)
- [ ] Extend `tests/ingest.route.test.ts` — one new assertion block confirming a `risk_scores` row exists after a successful POST (RISK-03)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Realtime delivers `risk_scores` INSERT events to an anon subscriber | STOR-02 / RISK-02 (frontend consumption, out of scope this repo but wiring must be proven) | Realtime publication membership is not exercised by a unit/integration assertion on the write path alone — needs a live subscriber, same class of check Phase 1 did for `readings` | Extend or mirror `tests/realtime.subscribe.test.ts`: subscribe with the anon key, insert a reading via `/api/ingest`, assert a `risk_scores` INSERT event arrives on the channel |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
