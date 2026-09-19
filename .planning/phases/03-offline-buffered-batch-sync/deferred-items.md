# Phase 3 — Deferred / Out-of-Scope Items

Items discovered during plan execution that are out of the current plan's
file scope per the executor's SCOPE BOUNDARY rule (only auto-fix issues
directly caused by the current task's own changes).

## From Plan 03-02 (batch sync endpoint)

### `tests/risk.compute.test.ts` — pre-existing failure caused by Plan 03-01's live migration

**Status: RESOLVED at the phase's regression gate (2026-09-19).** The test was rewritten to assert
the actual current invariant — that the DB itself now rejects a same-device duplicate-timestamp
insert with the `readings_deviceid_timestamp_key` violation — rather than trying to reconstruct the
now-impossible two-rows-same-timestamp scenario. The tie-break-by-`id` branch in `compute.ts`
(`row.timestamp === target.timestamp && row.id < target.id`) is retained as harmless, now-unreachable
defensive code; removing it was judged out of scope for this fix (a Phase 2 algorithm change, not a
test-coverage reconciliation). Full suite passes (44 passed, 1 skipped, 0 failed).


- **Test:** `computeAndPersistRiskScore — 12h window adjacency (D-26 inclusive >=, Task 2) >
  readings sharing an identical timestamp are ordered deterministically by id, and the target
  excludes only itself from its own baseline (not an earlier same-timestamp row)`
- **Symptom:** `Unknown Error: duplicate key value violates unique constraint
  "readings_deviceid_timestamp_key"` — thrown by the test's own `insertReading()` helper (a
  plain `.insert()`, not going through any route) when it deliberately inserts a second row
  sharing the same `(deviceId, timestamp)` pair as an existing row, to exercise D-26's
  same-timestamp tie-break-by-`id` logic.
- **Root cause:** Plan 03-01 added a live unique constraint on
  `readings("deviceId","timestamp")`. This test's scenario — two distinct rows for the same
  device at the exact same timestamp — is now structurally impossible to construct via any
  insert path (route or direct `supabaseAdmin` insert). The test's premise predates Plan
  03-01's schema change and was not updated as part of that plan's blast radius.
- **Verified NOT caused by Plan 03-02:** Reproduced identically on the commit immediately prior
  to Plan 03-02's Task 1 commit (`c34b500`, before any 03-02 file changes), confirming this is
  inherited from Plan 03-01's live migration, not a regression from `src/lib/risk/compute.ts`'s
  visibility-only export change or any other 03-02 file.
- **Why not fixed here:** `tests/risk.compute.test.ts` is not in Plan 03-02's declared
  `files_modified` scope, and fixing it requires deciding how to preserve (or retire) D-26's
  same-timestamp tie-break test coverage now that the scenario it exercises can no longer occur
  in the live schema — a decision belonging to whichever plan owns Phase 2/3's test suite
  reconciliation, not a mechanical one-line fix.
- **Action needed:** A follow-up plan/task should either (a) rewrite this test to construct the
  same-timestamp scenario without violating the unique constraint (if possible), or (b) retire
  the test and its underlying `compute.ts` tie-break branch if the scenario is now provably
  unreachable given D-33, documenting the design tension between D-26 and D-33 explicitly.
