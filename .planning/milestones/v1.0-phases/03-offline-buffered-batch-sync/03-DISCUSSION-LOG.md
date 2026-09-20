# Phase 3: Offline-Buffered Batch Sync - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-19
**Phase:** 3-Offline-Buffered Batch Sync
**Areas discussed:** Backfill rescoring, Batch endpoint & payload shape, Duplicate/replay handling, Partial-batch failure handling

---

## Backfill rescoring

| Option | Description | Selected |
|--------|-------------|----------|
| Rescore affected readings | Find every existing reading whose window could include newly-inserted timestamps and re-run `computeAndPersistRiskScore` on each | ✓ |
| Score only the batch itself | Batch readings scored using history at insert time; pre-existing scored readings left as-is | |
| Rescore only readings within the batch's own span | Narrower rescan, only between batch min/max timestamps | |

**User's choice:** Rescore affected readings.
**Notes:** User asked for a concrete walkthrough scenario (2h connectivity outage, live readings resume before the buffered batch uploads) before deciding on rescan scope.

**Follow-up: rescan scope**

| Option | Description | Selected |
|--------|-------------|----------|
| Full overlap window | Query `[batch_min, batch_max + 12h]`, rescore every row, no cap | ✓ |
| Cap the rescan to N most-affected readings | Same query, capped at e.g. 50 rows | |

**User's choice:** Full overlap window, uncapped — correctness over defensive throttling at v1's demo scale.

**Follow-up: batch-internal ordering**

| Option | Description | Selected |
|--------|-------------|----------|
| Sort by timestamp ascending, insert+score sequentially | Mirrors how live readings would have arrived one at a time | ✓ |
| Insert all rows first, then score all in a second pass | Bulk-insert then loop-score sorted by timestamp | |

**User's choice:** Sort ascending, insert+score sequentially.

---

## Batch endpoint & payload shape

| Option | Description | Selected |
|--------|-------------|----------|
| `POST /api/ingest/batch`, `{deviceId, readings: [{timestamp, vitals}]}` | deviceId hoisted to top level, per-item nested vitals shape reused from Phase 1 | ✓ |
| Bare array of full single-reading objects | Each item repeats full `{deviceId, timestamp, vitals}` | |

**User's choice:** `{deviceId, readings: [...]}` wrapper shape.

**Auth:** Same `X-API-Key` header validated once for the whole batch — presented as the sole approach (no genuine alternative), not re-litigated as a choice.

**Follow-up: batch size cap**

| Option | Description | Selected |
|--------|-------------|----------|
| Cap at 500 readings, reject oversized with 400 | Covers ~41h of buffered offline time at 5min intervals | ✓ |
| No cap for v1 | Trust firmware to send reasonable sizes | |

**User's choice:** Cap at 500.

---

## Duplicate / replay handling

| Option | Description | Selected |
|--------|-------------|----------|
| Add unique constraint on (deviceId, timestamp), upsert-ignore duplicates | Migration + upsert with on-conflict-do-nothing | ✓ |
| No dedup for v1 | Accept possible duplicate rows | |

**User's choice:** Add unique constraint, upsert-ignore.

**Follow-up: should the single-reading route get the same treatment?**

| Option | Description | Selected |
|--------|-------------|----------|
| Apply same upsert-ignore to POST /api/ingest too | Keeps live and batch paths consistent on the shared table | ✓ |
| Leave POST /api/ingest as plain insert | Minimal diff, but constraint would still reject live-path duplicates with an unhandled DB error | |

**User's choice:** Apply to both routes.

**Follow-up: scoring on a duplicate no-op**

| Option | Description | Selected |
|--------|-------------|----------|
| Skip rescoring on a duplicate no-op | Nothing changed, existing risk_scores row is still correct | ✓ |
| Always rescore, even on a duplicate hit | Simpler code path, wastes compute | |

**User's choice:** Skip rescoring on duplicate no-op.

---

## Partial-batch failure handling

| Option | Description | Selected |
|--------|-------------|----------|
| Reject whole batch with 400 on any validation failure | All-or-nothing, simpler retry semantics for firmware | ✓ |
| Insert valid items, report invalid ones (partial success) | More firmware complexity, no data loss from one bad item | |

**User's choice:** All-or-nothing rejection.

**Follow-up: insert atomicity**

| Option | Description | Selected |
|--------|-------------|----------|
| Single bulk insert/upsert call, atomic at DB level | One round-trip, no partial-insert state | ✓ |
| Loop of per-row inserts | Isolates DB-level failures per row, risks partial batch state | |

**User's choice:** Single bulk upsert call.

**Scoring failures during batch processing:** Follow D-24 (log and continue, still return success) — presented as the sole approach (no genuine alternative), not re-litigated as a choice.

---

## Claude's Discretion

None — all four discussed areas reached explicit user decisions on every sub-question.

## Deferred Ideas

- Capping the backfill-rescore query (e.g. max 200 rows) to bound worst-case cost — rejected in favor of an uncapped rescan at v1's demo scale.
- Partial-success (207-style) batch responses — rejected in favor of all-or-nothing validation.
