# Phase 3: Offline-Buffered Batch Sync - Context

**Gathered:** 2026-09-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Readings buffered by an ESP32 device during a connectivity gap arrive later as a single batch POST, are stored with their original on-device timestamps (not the upload time), and are risk-scored exactly like live readings — including retroactively correcting any already-scored live readings whose 12h trend window is affected by the newly-backfilled data. Live and batch-synced readings must be indistinguishable in storage and downstream queries (same schema, same `computeAndPersistRiskScore` logic). No historical trend range query endpoint (Phase 4). No multi-device batch routing (out of scope per PROJECT.md).

</domain>

<decisions>
## Implementation Decisions

### Backfill rescoring
- **D-27:** When a batch inserts readings older than the current time, any *already-scored* existing reading whose 12h trend window (`[timestamp - 12h, timestamp]`) now overlaps one or more of the newly-inserted batch timestamps MUST be rescored — its stored `risk_scores` row may have been computed against an incomplete baseline before the gap was backfilled. This directly serves the roadmap's "indistinguishable from live" success criterion (#4) — a risk status must reflect the true chronological history, not just insertion order. — **Reversibility:** costly — once shipped, the frontend/demo will show risk statuses that reflect this correction; reverting to score-batch-only-in-isolation would make older backfills silently stale again.
- **D-28:** The rescoring scope is **uncapped** — after inserting a batch spanning `[batch_min, batch_max]`, query all of the device's existing readings with `timestamp` in `[batch_min, batch_max + 12h]` and rescore every one via `computeAndPersistRiskScore`. No row-count cap. Chosen deliberately for correctness over defensive throttling — at v1's single-device demo scale (readings every few minutes, gaps measured in hours), this range is at most a few hundred rows. Revisit only if a real deployment shows pathological batch sizes (e.g. weeks-long outages).
- **D-29:** Within a single batch, readings are sorted by `timestamp` ascending before insert, and each is inserted then scored sequentially in that order — mirroring how they'd have been scored had they arrived live, one at a time, oldest first.

### Batch endpoint & payload shape
- **D-30:** New endpoint `POST /api/ingest/batch`. Payload: `{ deviceId: string, readings: [{ timestamp: number, vitals: { heartRate, spo2, temperature, activityScore } } , ...] }` — `deviceId` hoisted to the top level once for the whole batch (device auth is per-device, not per-reading), each array entry reuses the same nested-vitals shape as Phase 1's single-reading `IngestSchema` (D-01), just without a repeated `deviceId`/full envelope per item.
- **D-31:** Auth is identical to `POST /api/ingest` (D-05) — the `X-API-Key` header is validated once against the top-level `deviceId` for the whole batch, before any body/array validation. No new auth mechanism.
- **D-32:** The batch is capped at **500 readings per request**; a request exceeding this returns `400` before any processing. At ~5 min intervals this covers ~41 hours of buffered offline time — comfortably beyond a realistic WiFi/power gap for this demo — and protects against unbounded payload size/execution time on Vercel's serverless functions.

### Duplicate / replay handling
- **D-33:** A new **unique constraint on `readings("deviceId", "timestamp")`** is added via migration. Both `POST /api/ingest` (single) and `POST /api/ingest/batch` insert using **upsert with on-conflict-do-nothing** against this constraint — a retried request (device timeout, but the original insert actually succeeded) becomes a safe no-op instead of creating duplicate rows. — **Reversibility:** costly — removing the constraint later means already-relying-on-it code (both ingest paths) would need to go back to plain inserts, and any duplicate rows created in the interim would need manual cleanup.
- **D-34:** When an upsert-ignore hits an existing duplicate (no new row actually inserted), **risk scoring is skipped for that specific reading** — its `risk_scores` row (if any) is already correct since nothing changed. Only newly-inserted rows (and D-27's backfill-affected rows) get scored/rescored.

### Partial-batch failure handling
- **D-35:** Batch validation is **all-or-nothing**: every item in the `readings` array is validated against the per-item schema *before* anything is inserted. If any single item fails validation, the whole request is rejected with `400` and a field-level error body (matching D-11's `{ error, details: [...] }` shape, indexed by array position) — nothing from the batch is stored. Chosen because an all-or-nothing contract is simpler for device firmware to reason about on retry (just resend the identical batch) than tracking per-item partial success.
- **D-36:** The (deduplicated, validated) batch is inserted via a **single bulk upsert call**, not a loop of per-row inserts — atomic at the DB level, one round-trip, no partial-insert state to reason about if the DB itself rejects the write.
- **D-37:** Scoring failures during batch processing (whether for a newly-inserted reading or a D-27 backfill-triggered rescore) follow the same rule as Phase 2's D-24: **log server-side and continue** — a scoring exception never turns an otherwise-successful batch storage into a failed HTTP response.

### Claude's Discretion
None — all four discussed areas reached explicit user decisions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — core value, constraints (free-tier hosting, Next.js/TS/Supabase stack), single-device v1 demo scope
- `.planning/REQUIREMENTS.md` — ING-03 (this phase's sole requirement)
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria; Phase 4 dependency (historical trend queries must interleave live + batch data correctly, which D-27's backfill rescoring directly supports)
- `hardware/SEPCARE-HARDWARE-SOT.md` — canonical S3-Tiny hardware/schema, including deep-sleep periodic sampling and the requirement to retain original timestamps while WiFi is unavailable

### Prior phase decisions (carried forward, directly extended by this phase)
- `.planning/phases/01-device-ingest-live-readout/01-CONTEXT.md` — D-01 (nested `vitals` payload shape), D-02 (epoch-ms timestamp), D-05 (`X-API-Key` header auth), D-09 (field-name vocabulary), D-11 (error body shape) — all reused verbatim by D-30/D-31/D-35 above
- `.planning/phases/02-automatic-risk-scoring-status/02-CONTEXT.md` — D-24 (scoring failures never fail the HTTP response), D-25 (standalone `computeAndPersistRiskScore` function, built specifically anticipating this phase), D-26 (window computed relative to each target reading's own timestamp, not insertion order — the property that makes D-27's backfill rescoring correct without changing `compute.ts`'s core logic)

### Existing implementation (Phase 1+2 output, extended by this phase)
- `src/app/api/ingest/route.ts` — the single-reading route this phase's batch endpoint mirrors for auth-before-validate ordering and error shapes; also needs D-33's upsert-ignore treatment applied to it
- `src/lib/validation/ingest-schema.ts` — existing `IngestSchema` (per-item shape) to reuse/wrap for the batch payload's `readings` array items
- `src/lib/risk/compute.ts` — `computeAndPersistRiskScore`, the standalone scoring function this phase calls both for newly-inserted batch readings and for D-27's backfill-affected rescores; `TargetReading` interface and `fetchWindow`'s pagination-safe window query already support out-of-order timestamps with no changes needed
- `supabase/migrations/20260912172701_init.sql` — current `readings` schema; this phase adds the unique constraint on `("deviceId", "timestamp")` (D-33)
- `supabase/migrations/20260918102702_risk_scores.sql` — current `risk_scores` schema; unaffected by this phase's decisions (D-27 calls the same upsert path `compute.ts` already uses)
- `src/lib/supabase/types.ts` — regenerate after the new migration lands, same workflow as Phases 1/2

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/risk/compute.ts`'s `computeAndPersistRiskScore` — callable as-is for both newly-inserted batch readings and D-27's rescore pass; no modification needed since it already reads from the DB (not in-memory state) and windows relative to the target's own timestamp.
- `src/lib/supabase/admin.ts` — service-role client, reused identically for the batch route's inserts/upserts and the rescore query.
- `src/lib/validation/ingest-schema.ts`'s `IngestSchema` (or its `vitals` sub-shape) — reusable as the per-item validator inside a new batch array schema.
- `src/app/api/ingest/route.ts` — established auth-before-validate, zod-parse, typed-insert, try/error-response conventions to mirror in the new batch route.

### Established Patterns
- Quoted camelCase column names in Postgres (D-09) — the new unique constraint should target `"deviceId"`/`"timestamp"` with the same quoting.
- Error-body shape `{ error, details: [...] }` for validation failures (D-11) — extend with array-index context for batch-level field errors.
- Scoring-failure isolation (D-24): try/catch around `computeAndPersistRiskScore` calls, log and continue, never fail the HTTP response for a scoring error alone.

### Integration Points
- New migration required: unique constraint on `readings("deviceId", "timestamp")`.
- New route: `src/app/api/ingest/batch/route.ts`.
- New validation schema: batch array wrapper around the existing per-item `IngestSchema` vitals shape.
- Modify `src/app/api/ingest/route.ts`: switch its `readings` insert from plain `.insert()` to `.upsert()` with on-conflict-do-nothing (D-33), matching the batch route's dedup behavior.
- New backfill-rescore query: `readings` lookup by `deviceId` + timestamp range `[batch_min, batch_max + 12h]`, feeding each result's id/fields into `computeAndPersistRiskScore` after the batch insert commits.

</code_context>

<specifics>
## Specific Ideas

- The user asked for a concrete walkthrough scenario (device buffers 2h during an outage, live readings resume before the batch uploads) before committing to the backfill-rescoring decision — treat D-27/D-28/D-29 as deliberate, scenario-grounded decisions, not default-picked.
- The user consistently chose the "match Phase 1/2's existing pattern" option across every question in this discussion (dedup constraint, error shapes, auth mechanism, scoring-failure isolation) — a strong signal to keep Phase 3 as an extension of established conventions rather than introducing new patterns.

</specifics>

<deferred>
## Deferred Ideas

- Capping the backfill-rescore query to bound worst-case cost (e.g. max 200 rows) — considered and explicitly rejected in favor of an uncapped rescan (D-28) for v1's demo scale; revisit if a real deployment shows pathological batch/gap sizes.
- Partial-success (207-style) batch responses — considered and explicitly rejected in favor of all-or-nothing validation (D-35); revisit only if a real device firmware needs finer-grained retry semantics.

### Reviewed Todos (not folded)
None — no pending todos matched this phase's scope.

</deferred>

---

*Phase: 3-Offline-Buffered Batch Sync*
*Context gathered: 2026-09-19*
