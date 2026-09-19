---
phase: 03-offline-buffered-batch-sync
verified: 2026-09-19T17:35:00Z
status: human_needed
score: 14/16 must-haves verified
covered_files:
  - ".planning/REQUIREMENTS.md"
  - ".planning/phases/03-offline-buffered-batch-sync/03-01-PLAN.md"
  - ".planning/phases/03-offline-buffered-batch-sync/03-01-SUMMARY.md"
  - ".planning/phases/03-offline-buffered-batch-sync/03-02-PLAN.md"
  - ".planning/phases/03-offline-buffered-batch-sync/03-02-SUMMARY.md"
  - ".planning/phases/03-offline-buffered-batch-sync/03-03-PLAN.md"
  - ".planning/phases/03-offline-buffered-batch-sync/03-03-SUMMARY.md"
  - ".planning/phases/03-offline-buffered-batch-sync/03-REVIEW.md"
  - ".planning/phases/03-offline-buffered-batch-sync/deferred-items.md"
  - "src/app/api/ingest/batch/route.ts"
  - "src/app/api/ingest/route.ts"
  - "src/lib/risk/compute.ts"
  - "src/lib/supabase/types.ts"
  - "src/lib/validation/ingest-schema.ts"
  - "supabase/migrations/20260919105432_readings_unique_device_timestamp.sql"
  - "tests/helpers/cleanup.ts"
  - "tests/ingest.batch.test.ts"
  - "tests/ingest.route.test.ts"
  - "tests/risk.compute.test.ts"
covered_digest: "v1:sha256:d436f993b12d63cf394879ea950d303d683156ae34b56f2c4b0981384866c311"
behavior_unverified: 2
overrides_applied: 0
behavior_unverified_items:
  - truth: "Readings within a single batch are sorted ascending by timestamp before insert, and each newly-inserted row is scored sequentially in that ascending order (D-29)."
    test: "Instrument or spy on computeAndPersistRiskScore invocations for a shuffled-order batch submission and record the sequence of timestamps it is called with."
    expected: "computeAndPersistRiskScore is invoked in strictly ascending-timestamp order, matching the sorted array, not the original (shuffled) submission order."
    why_human: "No existing test asserts call order directly — tests assert final stored rows and final risk_scores values only. The plan's own SUMMARY (03-02-SUMMARY.md, coverage id D4) documents this as human_judgment: true / verification: [] (code-inspection only, not test-backed)."
  - truth: "Scoring order has no effect on the final computed risk status, since the batch is fully inserted before scoring begins and computeAndPersistRiskScore's window query always reads the full final DB state (D-29 correctness backstop)."
    test: "Force two scoring runs of the same batch content in different internal orders (e.g. ascending vs. descending) and assert the resulting risk_scores rows are byte-identical either way."
    expected: "Final status/breakdown is invariant to internal scoring order."
    why_human: "Explicitly declared verification: backstop in 03-02-PLAN.md's must_haves.truths — a non-inferable truth per verification policy; no dedicated test exists (03-02-SUMMARY.md coverage id D10: human_judgment: true, 'not independently tested by a dedicated test'). Code inspection of compute.ts's fetchWindow (reads full DB state at scoring time) supports the claim but does not constitute direct behavioral evidence."
human_verification:
  - test: "Instrument computeAndPersistRiskScore (temporarily, e.g. via a console.log or a spy in a throwaway test) while POSTing a batch with shuffled timestamps, and record invocation order."
    expected: "Calls occur in ascending timestamp order, matching the code's explicit `.sort((a,b) => a.timestamp - b.timestamp)` step."
    why_human: "Ordering invariant with no existing behavioral test; see behavior_unverified_items above."
  - test: "Submit the same 3-item batch twice, forcing a different internal processing order each time (e.g. via a temporary reverse-sort), and diff the resulting risk_scores rows."
    expected: "Identical final risk_scores rows regardless of internal scoring order."
    why_human: "Declared as a `verification: backstop` (non-inferable) truth in 03-02-PLAN.md with no dedicated test; see behavior_unverified_items above."
---

# Phase 3: Offline-Buffered Batch Sync Verification Report

**Phase Goal:** Readings buffered by the device during connectivity gaps arrive later as a batch, are stored with their original timestamps, and are risk-scored like any other reading.
**Verified:** 2026-09-19T17:35:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Device can POST an array of buffered offline readings to a dedicated sync endpoint in a single request (Roadmap SC #1) | ✓ VERIFIED | `src/app/api/ingest/batch/route.ts` exports `POST`, accepts `{deviceId, readings: [...]}`; `tests/ingest.batch.test.ts` posts multi-item arrays and all pass |
| 2 | Each synced reading is stored using its original on-device timestamp, not upload time (Roadmap SC #2) | ✓ VERIFIED | `tests/ingest.batch.test.ts` "stores each reading under its own submitted timestamp..." test asserts stored `timestamp` matches submitted value and is >1h from `Date.now()`; passing |
| 3 | Risk computation runs on synced readings the same way as live readings, correctly reflecting true chronological position (Roadmap SC #3) | ✓ VERIFIED | `compute.ts`'s window is always relative to `target.timestamp` (D-26, unchanged from Phase 2); `tests/ingest.batch.test.ts` backfill test proves an already-scored live reading is correctly recomputed after an older batch lands |
| 4 | Live POST and batch sync readings are indistinguishable in storage/downstream queries — same schema, same risk logic (Roadmap SC #4) | ✓ VERIFIED | Column-set-parity test asserts identical `risk_scores` keys for batch vs. single-route rows; no discriminator column exists in any migration (see Anti-Patterns/Prohibitions below) |
| 5 | `readings` has a unique constraint on `("deviceId","timestamp")` enforced at the DB level (D-33) | ✓ VERIFIED | `supabase/migrations/20260919105432_readings_unique_device_timestamp.sql` contains the `ALTER TABLE ... ADD CONSTRAINT ... UNIQUE`; `supabase migration list --linked` (run live) shows it applied on Remote |
| 6 | Pre-existing exact-duplicate rows removed before the constraint is added | ✓ VERIFIED | Migration file's defensive `DELETE ... USING` statement precedes the `ALTER TABLE`; migration applied successfully live (would have failed immediately on any pre-existing violation) |
| 7 | Backfill rescore of every existing, already-scored reading whose 12h window overlaps the batch's new-data range (D-27/D-28) | ✓ VERIFIED | `fetchWindow(deviceId, batchMin, batchMax+TREND_WINDOW_MS)` call in `route.ts`; dedicated integration test proves an existing reading's status/breakdown changes after a backfilling batch |
| 8 | Readings within a batch are sorted ascending and scored sequentially in that order (D-29) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Code present and wired (`sort()` + sequential `for...of` with `await`), but no test asserts scoring *call order* itself — see behavior_unverified_items |
| 9 | In-batch duplicate timestamps deduped to one row (last occurrence), never averaged (Pitfall 1 / dedup-fidelity prohibition) | ✓ VERIFIED | Dedup test asserts stored `heartRate` is exactly 100 or 150, explicitly not 125 |
| 10 | Empty batch (`readings: []`) rejected with 400 before any insert | ✓ VERIFIED | Empty-array test passes (400) |
| 11 | Batch exceeding 500 readings rejected with 400 before any insert (D-32) | ✓ VERIFIED | 501-item test passes (400, zero rows stored) |
| 12 | A batch with one invalid item is rejected with 400 and none of the batch is stored (D-35 all-or-nothing) | ✓ VERIFIED | All-or-nothing test passes; asserts `readings.2` path in error details and zero rows stored |
| 13 | A batch retried verbatim after a prior successful POST returns 201 with no additional rows created (D-33/D-34) | ✓ VERIFIED | Verbatim-retry test passes; row count unchanged between two POSTs |
| 14 | Scoring order has no effect on the final computed risk status (D-29 correctness backstop) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED (insufficient_spec) | Declared `verification: backstop` in 03-02-PLAN.md; no dedicated test — see behavior_unverified_items |
| 15 | Single-reading route treats a retried duplicate as a safe 201 no-op, no duplicate row, no rescoring for the no-op case (D-33/D-34) | ✓ VERIFIED | `tests/ingest.route.test.ts` duplicate-retry test passes: second POST returns 201, exactly one row exists |
| 16 | A fresh (non-duplicate) POST to `/api/ingest` is unaffected by the upsert change — same 201 contract | ✓ VERIFIED | Existing `tests/ingest.route.test.ts` regression test passes unchanged |

**Score:** 14/16 truths verified (2 present, behavior-unverified)

### Prohibitions (must_haves.prohibitions, Plan 03-02)

| # | Statement | Verification Tier | Disposition | Evidence |
|---|-----------|-------------------|-------------|----------|
| 1 | MUST NOT add a batch/live discriminator column/flag distinguishing batch-synced rows from live rows | test | ✓ Resolved | Phase 3's only schema migration (`20260919105432_...`) contains no `ADD COLUMN`; `risk_scores` column-parity test explicitly enumerates and asserts the exact column set `["reading_id","deviceId","status","breakdown","created_at"]` for both batch- and live-produced rows |
| 2 | MUST NOT synthesize/average/blend two distinct readings' vitals when resolving an in-batch duplicate timestamp | test | ✓ Resolved | Dedup-fidelity test asserts stored `heartRate` is exactly one submitted value (100 or 150), explicitly not the average (125) |

### Additional-Context Verification (Orchestrator-Flagged Post-Plan Gates)

| # | Item | Verification | Result |
|---|------|--------------|--------|
| 1 | Regression gate: `tests/risk.compute.test.ts` identical-timestamp test rewritten (commit `6662954`) because the live unique constraint made the original two-same-timestamp-rows scenario impossible | Read the diff; confirmed the rewritten test now asserts the DB itself rejects a same-device duplicate-timestamp insert (`error.message` contains `readings_deviceid_timestamp_key`); the superseded tie-break-by-`id` branch in `compute.ts` is retained as harmless, genuinely unreachable-for-a-single-device code (constraint scopes uniqueness per `deviceId`) | ✓ Sound |
| 2 | Code review fix (`a2ed305`): backfill retry now excludes rows by scoring **success** (`successfullyScoredIds`), not scoring **attempt** | Read the diff and the surrounding code; confirmed a row whose initial `computeAndPersistRiskScore` call throws is *not* added to `successfullyScoredIds`, so it is not excluded from the backfill loop, and its own timestamp always falls inside `[batchMin, batchMax+TREND_WINDOW_MS]` so it always appears in `affected` — no double-scoring for successes (excluded), no orphaned rows for failures (retried) | ✓ Correct, no new bug found |
| 3 | Full suite (`npm test`) and `npx tsc --noEmit` | Ran both directly in this verification session | `npm test`: 44 passed, 1 skipped, 0 failed. `npx tsc --noEmit`: clean (exit 0). `npm run build`: clean, `/api/ingest/batch` registered as a dynamic route |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260919105432_readings_unique_device_timestamp.sql` | Defensive dedup DELETE + UNIQUE constraint | ✓ VERIFIED | Both statements present, in order; applied live |
| `src/lib/supabase/types.ts` | Regenerated types, no drift | ✓ VERIFIED | `npm run build`/`tsc --noEmit` clean against it |
| `src/lib/validation/ingest-schema.ts` | `BatchItemSchema`/`BatchIngestSchema`/`BatchIngestPayload` | ✓ VERIFIED | Exported exactly as specified; `IngestSchema` unchanged |
| `src/lib/risk/compute.ts` | `fetchWindow`/`WindowRow` exported | ✓ VERIFIED | Visibility-only change confirmed, body unchanged |
| `src/app/api/ingest/batch/route.ts` | Full batch POST handler | ✓ VERIFIED | auth → validate → sort/dedupe → upsert → score → backfill → 201, all present |
| `tests/ingest.batch.test.ts` | 8 tests covering ING-03 matrix | ✓ VERIFIED | 8/8 passing, substantive integration tests against live Supabase |
| `tests/helpers/cleanup.ts` | `deleteReadingsInRange` | ✓ VERIFIED | Present, same shape as existing helper |
| `src/app/api/ingest/route.ts` | Upsert-ignore retrofit | ✓ VERIFIED | `.upsert(...).maybeSingle()` replacing `.insert(...).single()`, scoring guarded by `if (insertedReading)` |
| `tests/ingest.route.test.ts` | Duplicate-retry regression test | ✓ VERIFIED | New test present and passing |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `supabase/migrations/20260919105432_...sql` | Live Supabase Postgres schema | `supabase db push` | ✓ WIRED | Confirmed live via `supabase migration list --linked` (Remote column shows `20260919105432`) |
| `readings("deviceId","timestamp")` unique constraint | `POST /api/ingest` upsert | `onConflict: "deviceId,timestamp", ignoreDuplicates: true` | ✓ WIRED | Present in `route.ts`, exercised by passing duplicate-retry test |
| `readings("deviceId","timestamp")` unique constraint | `POST /api/ingest/batch` upsert | `onConflict: "deviceId,timestamp", ignoreDuplicates: true` | ✓ WIRED | Present in `batch/route.ts`, exercised by passing verbatim-retry test |
| `src/app/api/ingest/batch/route.ts` | `src/lib/risk/compute.ts` | `computeAndPersistRiskScore` (per-row) + `fetchWindow` (backfill) | ✓ WIRED | Both call sites present; exercised end-to-end by passing tests |

### Data-Flow Trace (Level 4)

N/A — this phase is a backend ingest/scoring API with no rendered UI; storage/backfill correctness is covered under Key Link Verification and Behavioral Spot-Checks instead.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full automated suite (incl. all ING-03 tests) | `npm test` | 44 passed, 1 skipped, 0 failed | ✓ PASS |
| Type check | `npx tsc --noEmit` | exit 0, no errors | ✓ PASS |
| Production build | `npm run build` | Compiled successfully; `/api/ingest/batch` route registered | ✓ PASS |
| Live schema state | `supabase migration list --linked` | `20260919105432_readings_unique_device_timestamp` present in Remote column | ✓ PASS |

### Probe Execution

N/A — no `scripts/*/tests/probe-*.sh` probes declared or discovered for this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ING-03 | 03-01, 03-02, 03-03 | Device can POST a batch of buffered offline readings to a dedicated sync endpoint, each stored with its original device timestamp | ✓ SATISFIED (with 2 non-blocking human-verification items on internal scoring-order behavior) | Batch endpoint live and tested end-to-end; original-timestamp storage, backfill rescore, dedup/cap/all-or-nothing/replay edge matrix all covered by passing integration tests; single-route retrofit closes the parallel duplicate-safety gap |

No orphaned requirements: `.planning/REQUIREMENTS.md`'s traceability table maps only ING-03 to Phase 3, and all three plans declare `requirements: [ING-03]` — full match.

### Anti-Patterns Found

None. Scanned all phase-modified files (`route.ts` ×2, `ingest-schema.ts`, `compute.ts`, `ingest.batch.test.ts`, `cleanup.ts`, the migration SQL) for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/stub-return patterns — zero matches.

### Human Verification Required

1. **Batch scoring call order (D-29)**
   **Test:** Temporarily instrument `computeAndPersistRiskScore` (spy/log) and POST a batch with shuffled timestamps.
   **Expected:** Invocations occur in ascending-timestamp order, matching the code's `.sort()` step.
   **Why human:** No existing automated test asserts invocation order directly (only final stored data/state is asserted); the plan's own SUMMARY documents this as `human_judgment: true` with no dedicated test.

2. **Scoring-order correctness backstop (D-29)**
   **Test:** Force two different internal scoring orders for the same batch content and diff the resulting `risk_scores` rows.
   **Expected:** Identical final status/breakdown regardless of internal scoring order.
   **Why human:** Declared `verification: backstop` (non-inferable truth) in 03-02-PLAN.md's must_haves; no dedicated test exists — code-inspection support only (compute.ts's `fetchWindow` reads full DB state at scoring time).

### Gaps Summary

No gaps — no truth, artifact, or key link failed. Every declared must-have from the Roadmap's 4 success criteria, all three plans' `must_haves.truths`, and both `must_haves.prohibitions` entries is either ✓ VERIFIED with passing integration-test evidence or explicitly flagged (not silently passed) as behavior-unverified per the plan's own declared verification tier (`human_judgment: true` / `verification: backstop`). The two flagged items are internal-implementation-detail claims about scoring *order*, not about the phase's externally observable goal (batch readings arrive, land under correct timestamps, and get correctly risk-scored) — that goal is independently and fully proven by the backfill-rescore, column-parity, and original-timestamp tests, none of which depend on scoring order for their assertions. Full test suite (44/44 passing, 1 skipped by design), `tsc --noEmit`, and `npm run build` are all green. The previously-known blocker (`tests/risk.compute.test.ts`'s identical-timestamp test) was resolved at the phase's regression gate (commit `6662954`) and the CR-01 backfill-exclusion bug was fixed at the phase's code-review gate (commit `a2ed305`) — both verified sound by direct code/diff inspection in this session.

---

*Verified: 2026-09-19T17:35:00Z*
*Verifier: Claude (gsd-verifier)*
