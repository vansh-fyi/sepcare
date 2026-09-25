---
phase: "3"
slug: "offline-buffered-batch-sync"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-19"
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.11 [VERIFIED: package.json:26] |
| **Config file** | `vitest.config.ts` (loads `.env.local` via `loadEnv`, aliases `@/` to `src/`) |
| **Quick run command** | `npx vitest run tests/ingest.batch.test.ts` |
| **Full suite command** | `npm test` (= `vitest run`) |
| **Estimated runtime** | ~30-60 seconds (live Supabase integration tests) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/ingest.batch.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-TBD | 01 | 1 | ING-03 | T-03-01 | Migration adds unique constraint on `("deviceId","timestamp")`; pushed to live Supabase | integration | `supabase migration list --linked` | ❌ W0 | ⬜ pending |
| 03-02-TBD | 02 | 2 | ING-03 | T-03-02 | Batch POST stores each reading under its original timestamp, not upload time | integration | `npx vitest run tests/ingest.batch.test.ts -t "original timestamp"` | ❌ W0 | ⬜ pending |
| 03-02-TBD | 02 | 2 | ING-03 | T-03-02 | Batch capped at 500 — 501st item rejected with 400 before any insert | integration | `npx vitest run tests/ingest.batch.test.ts -t "500"` | ❌ W0 | ⬜ pending |
| 03-02-TBD | 02 | 2 | ING-03 | T-03-02 | All-or-nothing: one invalid item rejects the whole batch, nothing stored (D-35) | integration | `npx vitest run tests/ingest.batch.test.ts -t "all-or-nothing"` | ❌ W0 | ⬜ pending |
| 03-02-TBD | 02 | 2 | ING-03 | T-03-03 | Retried batch (duplicate deviceId+timestamp) is a safe no-op, no duplicate rows, no rescoring of unaffected duplicates (D-33/D-34) | integration | `npx vitest run tests/ingest.batch.test.ts -t "duplicate"` | ❌ W0 | ⬜ pending |
| 03-02-TBD | 02 | 2 | ING-03 | T-03-04 | Backfill rescore: inserting older readings updates an already-scored existing reading's status (D-27/D-28) | integration | `npx vitest run tests/ingest.batch.test.ts -t "backfill"` | ❌ W0 | ⬜ pending |
| 03-02-TBD | 02 | 2 | ING-03 | — | Batch and single-route readings are indistinguishable in storage/downstream queries (success criterion #4) | integration | `npx vitest run tests/ingest.batch.test.ts -t "indistinguishable"` | ❌ W0 | ⬜ pending |
| 03-01-TBD | 01 | 1 | ING-03 | T-03-05 | `/api/ingest` (single) retry after D-33 migration returns 201 no-op, not 500 (Pitfall 2) | integration | `npx vitest run tests/ingest.route.test.ts -t "duplicate"` | ❌ W0 (extend existing file) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs are placeholders (`TBD`) until the planner assigns real plan/task numbers — the planner must reconcile this map with actual task IDs.*

---

## Wave 0 Requirements

- [ ] `tests/ingest.batch.test.ts` — new file, covers ING-03 batch behaviors above
- [ ] `tests/helpers/cleanup.ts` — extend with a range-delete helper (e.g. `deleteReadingsInRange(deviceId, fromTs, toTs)`) since batch tests insert many timestamps at once and the existing single-row delete helper doesn't scale to 500-row test cases
- [ ] `tests/ingest.route.test.ts` — extend with a duplicate-retry case exercising the D-33 upsert change on the single-reading route (Pitfall 2)
- [ ] Migration must land (and `src/lib/supabase/types.ts` regenerate) before any batch test can run, since the unique constraint is required for `onConflict` to have a target

---

## Manual-Only Verifications

*None — all phase behaviors have automated verification via live-Supabase integration tests, matching Phase 1/2's existing pattern.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
