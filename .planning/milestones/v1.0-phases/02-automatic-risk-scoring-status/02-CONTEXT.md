# Phase 2: Automatic Risk Scoring & Status - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Every reading stored via `POST /api/ingest` is automatically scored for sepsis risk the moment it's inserted — no manual trigger. The score uses a v1-scoped subset of the composite logic in `context/implementation-plans/neonatal-sepsis-armband.md` §7.1.1 (3 of the original 6 feature groups: temperature direction, HR–temperature proportionality, activity/lethargy trend), gated by breadth-of-abnormal-features rather than any single threshold. The resulting Green/Amber/Red status is persisted linked to its source reading and exposed via the same read path the frontend already uses (Realtime on Phase 1's table setup). No HRV, perfusion index, or respiratory irregularity features (those are RISK-V2-01, deferred). No batch/offline scoring (Phase 3). No historical trend range queries beyond what's needed to compute a rolling window (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Breadth-gating for v1's 3 features
- **D-12:** Status mapping by count of abnormal+trending features (of 3 total: temp direction, HR-temp proportionality, activity/lethargy trend): **0 or 1 abnormal → Green, 2 abnormal (co-occurring) → Amber, all 3 abnormal → Red.** A single isolated abnormal feature never escalates past Green — mirrors §7.1.1's breadth-gating intent ("a common illness perturbs 1–2 of these systems and resolves; sepsis perturbs 3+ simultaneously"), rescaled from the original ≥3-of-6 threshold to v1's 3-of-3 subset. — **Reversibility:** costly — the frontend will build its status display around Green/Amber/Red semantics; changing what triggers each tier later changes user-facing behavior, not just backend math.
- **D-13:** A feature counts as "abnormal" the moment a single reading crosses its threshold (e.g. `temp ≥ 38.0°C`); this flag is set immediately, not gated on persistence. The trend/window computation (D-14 area) refines severity and confirms worsening, but does not gate whether the abnormal flag is set in the first place.
- **D-14:** The activity/lethargy feature is simplified from §7.1.1's "recovers with comfort vs. stays flat" model to a straightforward **declining `activityScore` trend over the rolling window** — the comfort-response nuance is dropped entirely because the device sends no caregiver-interaction events to support it.

### Trend window & cold-start behavior
- **D-15:** The rolling trend window is **12 hours**, applied uniformly across all 3 v1 features (collapsing §7.1.1's per-feature 4–12h range into one window for v1's simplicity).
- **D-16:** HR–temperature proportionality and activity trend compare against a **rolling personal baseline computed from the device's own reading history** — not fixed population reference ranges. Matches §7.1.1's "vs. rolling personal baseline" language; requires no manual profile/vitals entry beyond what DEV-01 already provisions.
- **D-17:** Before a device has accumulated enough history to establish its personal baseline, status defaults to **Green** ("nothing confirmed abnormal yet" — least-alarming default, consistent with §10's false-negative risk framing that a screening aid should never over-alarm on insufficient data). Note: temperature-threshold gating does *not* need a baseline (it's absolute), so it is active from reading #1 regardless of cold-start state.
- **D-18:** The baseline is considered established after **the first 1 hour of readings** for a device. Short enough to be useful quickly, long enough to smooth a single noisy reading.

### Risk score storage shape
- **D-19:** A new **`risk_scores` table**, 1:1 linked to `readings` by a foreign key (`reading_id`), stores the computed status — not columns added directly to `readings`. Keeps `readings` as pure raw-vitals-in and gives Phase 4's trend query a clean join target.
- **D-20:** `risk_scores` is added to the Supabase Realtime publication alongside `readings` (which Phase 1's D-07 already established for the frontend's live subscription) — the frontend gets live status pushes the same way it gets live vitals, no separate polling mechanism.
- **D-21:** `risk_scores` gets the **same RLS pattern as `readings`** (Phase 1's D-08): anon read-only, scoped to the single provisioned device, no anon write. Only the service-role client (used server-side in the ingest route) writes to it.
- **D-22:** Each `risk_scores` row stores a **full jsonb per-feature breakdown** — raw abnormal/trending booleans plus the driving values (temp value, HR/temp ratio, activityScore delta) for each of the 3 features — not just the final status. Makes the status explainable/debuggable and supports the "we detect breadth, not one bad reading" demo narrative.

### Scoring trigger mechanism
- **D-23:** `POST /api/ingest` (`src/app/api/ingest/route.ts`) computes the risk score **synchronously, in the same request**, immediately after the `readings` insert succeeds — before returning `201`. No background/async job infrastructure for v1; matches PROJECT.md's prior decision that composite math runs in Next.js/TS, and satisfies RISK-03's "no manual trigger" requirement directly.
- **D-24:** If risk-score computation fails after the reading was already successfully inserted, the endpoint still returns **`201`** (reading was saved) and logs the scoring failure server-side — it does not fail the whole request. Keeps the device's retry behavior decoupled from backend scoring bugs.
- **D-25:** Risk-computation logic is built as a **standalone importable function** (e.g. `src/lib/risk/compute.ts`), not inlined in the route handler — even though only `POST /api/ingest` calls it in this phase. Phase 3's batch sync will need to run the identical scoring logic on batch-inserted readings; building it as a shared function now avoids duplicating or re-deriving the logic later.
- **D-26:** The scoring function's window is always **relative to the target reading's own timestamp** (`timestamp <= target AND timestamp >= target - 12h`), never "the N most-recently-inserted rows." This makes it timestamp-correct regardless of insertion order — required for Phase 3's out-of-order batch-synced readings (ING-03's original-timestamp requirement) to score correctly without modification.

### Claude's Discretion
None — all four discussed areas reached explicit user decisions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — core value, constraints (free-tier hosting, Next.js/TS/Supabase stack), and the prior decision that composite risk math runs in the Next.js backend, not Postgres/SQL
- `.planning/REQUIREMENTS.md` — RISK-01, RISK-02, RISK-03, STOR-02 (this phase's requirement set); note v1's explicit narrowing of the composite model to temp thresholds + HR–temp proportionality + activity/lethargy trend (RISK-V2-01 defers HRV/perfusion/respiratory to v2)
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria; Phase 3/4 dependencies this phase must not preclude (batch-sync scoring, historical trend queries)
- `hardware/SEPCARE-HARDWARE-SOT.md` — canonical S3-Tiny sensor/power schema; its periodic four-field summary is the physical source of this phase's score inputs

### Domain / clinical context
- `context/implementation-plans/neonatal-sepsis-armband.md` §7.1.1 — the full six-feature composite suspicion logic and breadth-gating rule this phase rescales to 3 features (D-12 through D-14)
- `context/implementation-plans/neonatal-sepsis-armband.md` §10 — safety framing ("screening triage aid," never over-alarm on insufficient data) informing the Green-default cold-start decision (D-17)
- `context/web-research/sepsis-vs-common-illness-differentiation.md` — background on Liebermeister's rule (HR–temp proportionality band) and hypothermia-equal-to-fever weighting referenced in D-12/D-13

### Prior phase decisions (carried forward)
- `.planning/phases/01-device-ingest-live-readout/01-CONTEXT.md` — D-01/D-02/D-03 (ingest payload shape, epoch-ms timestamp), D-04/D-05/D-06 (device auth), D-07/D-08/D-09 (Realtime read path, RLS, field-name vocabulary) — all directly extended by D-19 through D-26 above

### Existing implementation (Phase 1 output)
- `supabase/migrations/20260912172701_init.sql` — current `devices`/`readings` schema, RLS policies, and Realtime publication this phase extends with `risk_scores`
- `src/app/api/ingest/route.ts` — the ingest route this phase extends with synchronous scoring (D-23/D-24)
- `src/lib/supabase/types.ts` — generated Supabase types to regenerate once `risk_scores` is added
- `src/lib/validation/ingest-schema.ts` — existing zod validation pattern to follow for any new scoring-related validation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase/admin.ts` — service-role Supabase client already used by the ingest route; the scoring function will use the same client to read the reading window and write `risk_scores`.
- `src/app/api/ingest/route.ts` — established pattern for auth-before-validate, zod parsing, and typed Supabase inserts/error handling — the risk-scoring call slots in after the existing `readings` insert, following the same try/error-response conventions.
- `tests/ingest.route.test.ts`, `tests/ingest.auth.test.ts`, `tests/realtime.subscribe.test.ts` — existing Vitest test patterns for the ingest path and Realtime subscription; the new scoring logic and `risk_scores` Realtime wiring should follow the same test structure.

### Established Patterns
- Quoted camelCase column names in Postgres (matching the wire vocabulary exactly, per Phase 1's D-09) — `risk_scores` columns should follow the same convention where they mirror wire/read-API field names.
- RLS policy pattern: enable RLS, explicit `anon` read-only policy scoped to `deviceId = 'nb-001'`, no policy at all for tables that must stay fully server-only (as `devices` does) — `risk_scores` follows the `readings` pattern (D-21), not the `devices` pattern.
- Error-body shape: `{ error: "...", details: [...] }` for validation failures, plain `{ error: "..." }` for auth/storage failures — no new error shape needed for scoring since D-24 keeps scoring failures out of the HTTP response entirely.

### Integration Points
- New migration required: `risk_scores` table + FK to `readings.id` + RLS policies + addition to `supabase_realtime` publication.
- `src/lib/risk/compute.ts` (new) — the standalone scoring function (D-25), taking a reading (or reading id) and returning/persisting the computed status + jsonb breakdown, windowed per D-26.
- Regenerate `src/lib/supabase/types.ts` after the migration lands, same as Phase 1's workflow.

</code_context>

<specifics>
## Specific Ideas

- The user consistently chose the option closest to §7.1.1's original clinical intent when rescaling the 6-feature model to 3 features (unanimous-3-of-3 for Red, pairs-only for Amber, isolated-single stays Green) — this reflects a preference for staying faithful to the source research doc's breadth-gating philosophy even when narrowing scope, not for the loosest/fastest-to-implement interpretation.
- The user prioritized Phase 3 forward-compatibility twice in the "Scoring trigger mechanism" discussion (standalone function, timestamp-relative windowing) — signals a preference for structuring Phase 2's code so Phase 3 doesn't require reworking it, even though Phase 3 execution itself is out of this phase's scope.

</specifics>

<deferred>
## Deferred Ideas

- Full six-feature composite model (HRV pattern, perfusion index trend, respiratory irregularity) — RISK-V2-01, v2 requirement, not this phase.
- Trained ML model as an alternative/complement to the threshold-and-trend composite — RISK-V2-02, v2 requirement.
- Async/background risk computation (e.g. `waitUntil` or queued jobs) — considered and explicitly rejected in favor of synchronous computation (D-23) for v1's scope; revisit only if scoring latency becomes a real problem.
- Amber "insufficient data" cold-start status — considered and explicitly rejected in favor of Green-default (D-17); would add a status value beyond the spec'd Green/Amber/Red if revisited later.

### Reviewed Todos (not folded)
None — no pending todos matched this phase's scope.

</deferred>

---

*Phase: 2-Automatic Risk Scoring & Status*
*Context gathered: 2026-09-18*
