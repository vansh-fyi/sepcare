# Phase 4: Historical Trends API - Context

**Gathered:** 2026-09-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Expose a public historical read endpoint for the one provisioned v1 device. It returns every stored vitals reading and its paired Green/Amber/Red risk data in original timestamp order for an explicit caller-selected range of up to 15 days. The endpoint must support the frontend's trend charts and reflect later offline-batch backfills without a manual refresh. This phase does not add device registration, user authentication, multi-device access, frontend chart UI, new risk logic, or data-retention/deletion behavior.

</domain>

<decisions>
## Implementation Decisions

### Endpoint contract
- **D-38:** Provide `GET /api/readings?deviceId=nb-001&from=<epoch-ms>&to=<epoch-ms>`. `deviceId`, `from`, and `to` are all required query parameters. The endpoint is publicly readable for the v1 dashboard with no API key or user login, consistent with the existing anonymous read-only dashboard model. — **Reversibility:** costly — frontend integrations will be written against this published URL and parameter contract.
- **D-39:** An unsupported device ID returns `404` with `{ "error": "Device not found" }`; do not return an empty successful result or reveal device details.

### Range rules and validation
- **D-40:** Bounds use the existing Unix epoch-millisecond vocabulary and must form a chronological range (`from < to`). A request may span at most **15 days**.
- **D-41:** Missing, non-numeric, reversed, or over-limit bounds return a clear field-specific `400` JSON error. Development diagnostics must make these failures visible in the console/server logs, and automated tests must cover every invalid-range path.
- **D-42:** A valid range containing no readings returns `200` with an empty `entries` list.
- **D-43:** Test coverage must prove at least seven continuous days of stored history, including a contiguous three-day scenario. The product goal is to track at least three days of data continuously.

### Response shape and ordering
- **D-44:** Return a metadata envelope: `{ deviceId, from, to, entries }`.
- **D-45:** Each `entries` item is a self-contained nested record: `{ timestamp, vitals: { heartRate, spo2, temperature, activityScore }, risk: { status, breakdown } }`. Return the full existing per-feature risk breakdown with every entry, not status alone. — **Reversibility:** costly — frontend trend and explanation views will consume this response shape.
- **D-46:** Return every original reading in chronological order; do not aggregate or sample server-side. Any chart presentation/downsampling is a frontend concern. This preserves a short-lived change in vitals or risk status.

### Freshness, gaps, and failures
- **D-47:** If a stored reading has no associated `risk_scores` row, retain the reading in the response with `risk: null`; do not omit it or fail the entire request.
- **D-48:** Favor freshness over endpoint caching. Send `Cache-Control: no-store` so browsers and proxies do not show stale history after an offline batch backfill or rescore. The existing `readings` and `risk_scores` Supabase Realtime subscriptions enable a frontend to re-fetch this endpoint automatically without a user-initiated refresh.
- **D-49:** On an unexpected database/server failure, return a safe `{ "error": "Unable to load reading history" }` response and log full diagnostic details only server-side; never expose database errors publicly.

### Claude's Discretion
- Exact server-side query implementation, including safe use of existing Supabase clients and internal pagination needed to retrieve the full 15-day range despite PostgREST page limits, provided it honors the public single-device contract and all decisions above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and inherited decisions
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria: caller-specified historical range, original timestamp order, and a vitals+risk pairing per entry.
- `.planning/PROJECT.md` — v1 constraints: single-device demo, no user-facing auth, free-tier Next.js/Supabase stack, and `risk_scores` as a clean historical-query join target.
- `.planning/REQUIREMENTS.md` — READ-02 requirement and v1 scope boundaries.
- `.planning/phases/01-device-ingest-live-readout/01-CONTEXT.md` — D-02 epoch-ms timestamps, D-07 direct Realtime read path, D-08 anonymous read-only RLS, and D-09 canonical wire field names.
- `.planning/phases/02-automatic-risk-scoring-status/02-CONTEXT.md` — `risk_scores` one-to-one relationship, risk breakdown shape, and timestamp-relative history semantics.
- `.planning/phases/03-offline-buffered-batch-sync/03-CONTEXT.md` — original-timestamp batch handling and historical risk-score backfill/rescoring behavior that this endpoint must show correctly.

### Frontend trend-consumption contract
- `context/frontend-handoff/PRD.md` §4.3 (FR-11) — trend charts use selectable 2H/4H/6H/8H/10H/12H/24H ranges and per-signal line cards.
- `context/frontend-handoff/SCREEN-CONTENT.md` §Clinical View — Trend Graphs — chart layout uses chronological multi-hour sparklines.
- `context/frontend-handoff/USER-FLOWS.md` §Flow 1, §Flow 2 — trends are used to inspect real multi-hour trajectory; a chart should update from real data rather than hardcoded states.
- `context/frontend-handoff/OVERVIEW.md` — backend/frontend division of responsibility and the historical-vitals-plus-risk contract.

### Existing implementation
- `supabase/migrations/20260912172701_init.sql` — `readings` schema, epoch-ms `timestamp`, anonymous single-device RLS, and Realtime publication.
- `supabase/migrations/20260918102702_risk_scores.sql` — `risk_scores` schema, 1:1 FK, RLS, Realtime publication, and the composite `(deviceId, timestamp)` index.
- `supabase/migrations/20260919105432_readings_unique_device_timestamp.sql` — original-timestamp uniqueness guarantee used to interleave live and batch readings.
- `src/lib/risk/compute.ts` — established paginated timestamp-window query pattern and risk-breakdown definition.
- `src/lib/supabase/admin.ts` — existing server-side Supabase client; use safely without weakening the v1 single-device access boundary.
- `src/lib/supabase/types.ts` — generated table types for typed reads/embedded joins.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase/admin.ts` — established server-side Supabase client for data access.
- `src/lib/risk/compute.ts` `fetchWindow` — paginates ordered timestamp queries past PostgREST's 1,000-row response limit; the historical endpoint needs the same full-history discipline for long ranges.
- `src/lib/supabase/types.ts` — typed `readings` and `risk_scores` shapes plus their one-to-one relationship.
- `tests/ingest.route.test.ts`, `tests/ingest.batch.test.ts`, and `tests/risk.compute.test.ts` — existing Vitest patterns and fixture/cleanup conventions for timestamped readings and rescoring behavior.

### Established Patterns
- Readings use quoted camelCase database columns and epoch-ms timestamps; response vitals retain this same vocabulary, with display formatting left to the frontend.
- Risk status is stored separately in `risk_scores` with a JSONB `breakdown`, linked by `reading_id`; history reads must preserve the pair rather than reconstruct scoring.
- Batch sync can insert original historical timestamps and then rescore later readings. A range query must order on the original `timestamp`, never insertion time.
- Existing anonymous RLS is scoped to the one v1 device; the public route must validate the explicit device parameter so server-side access never expands the v1 scope.

### Integration Points
- New App Router route handler under `src/app/api/readings/route.ts` follows the existing Next.js API handler conventions.
- The handler queries `readings` and their linked `risk_scores`, returning the chosen nested API contract and safe validation/server error responses.
- Existing Supabase Realtime publications for both tables remain the frontend's automatic-update signal; no separate polling/notification system belongs in this phase.

</code_context>

<specifics>
## Specific Ideas

- The user asked whether the ESP32 would receive its device ID programmatically. Preserve Phase 1's v1 decision: firmware is manually flashed with `nb-001` and its API key. The new query parameter identifies data for the dashboard; it is not an ESP32 provisioning flow.
- The user emphasized an experience where updates appear without a manual refresh. This is why the endpoint has no HTTP cache and remains compatible with the existing Realtime-triggered refetch flow.
- The user wants continuous history for at least three days; seven-day fixture coverage provides extra confidence, while the API permits up to 15 days per request.

</specifics>

<deferred>
## Deferred Ideas

- Programmatic ESP32 provisioning, registration UI, and credentials rotation — DEV-V2-02, outside this single-device v1 phase.
- Multi-device historical access and user/device authorization — DEV-V2-01 and ACC-V2-01, outside v1.
- Frontend trend-chart UI, time-scale controls, and Realtime refetch wiring — owned by the parallel frontend work; this phase exposes the data contract it consumes.
- Server-side rollups/downsampling or a longer-than-15-day history view — defer until actual usage demonstrates a need; v1 returns raw readings.

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 4-Historical Trends API*
*Context gathered: 2026-09-19*
