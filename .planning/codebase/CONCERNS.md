# Codebase Concerns

**Analysis Date:** 2026-09-25

## Tech Debt

**Hardcoded single-device model:**
- Issue: `GET /api/readings` hardcodes `DEVICE_ID = "nb-001"` (`src/app/api/readings/route.ts:4`) and rejects any other `deviceId` query param with a 404. There is no multi-baby/multi-device support in the read API even though ingest routes are already deviceId-generic.
- Files: `src/app/api/readings/route.ts`
- Impact: Dashboard cannot be pointed at a second armband without a code change; this will need to be generalized before the second pilot device ships.
- Fix approach: Look up device by `deviceId` against the `devices` table instead of a string constant; add device existence/authorization checks consistent with the ingest routes.

**No device-scoped read authorization:**
- Issue: `src/app/api/readings/route.ts` has no auth check at all — any caller who knows (or guesses) `deviceId=nb-001` can read vitals history. Ingest routes require `x-api-key`; the read route requires nothing.
- Files: `src/app/api/readings/route.ts`
- Impact: Sensitive newborn vitals/risk data exposed to anyone hitting the endpoint; likely fine for an internal prototype dashboard but a real gap before wider access.
- Fix approach: Require a caller credential (API key, session, or Supabase RLS-backed anon key with row-level policy) scoped to the requesting device/caregiver.

**Sequential per-row scoring in ingest paths:**
- Issue: `POST /api/ingest/batch` scores every newly-inserted row one at a time in a `for` loop (`src/app/api/ingest/batch/route.ts:122-129`), then does a second sequential backfill-rescore pass over all affected existing readings (`:143-152`). Each score computation itself does a paginated `fetchWindow` DB round trip.
- Files: `src/app/api/ingest/batch/route.ts`, `src/lib/risk/compute.ts`
- Impact: A large offline-buffered batch sync (e.g., hours of readings after a WiFi outage) could produce O(n) sequential DB round trips and approach the `maxDuration = 60`s route timeout, causing partial processing with no resumption mechanism beyond scoring rows again on the next batch (rows already inserted are not re-attempted for insert, but un-scored rows have no dedicated retry job).
- Fix approach: Batch the trend-window queries (single query per unique window rather than per row) or introduce a background job queue for scoring so ingest response time is decoupled from scoring throughput.

**No pagination/rate limiting on ingest or read routes:**
- Issue: `BatchIngestSchema` (not yet inspected for max array length) and `GET /api/readings` (capped at 15 days but with `PAGE_SIZE = 1000` internal paging, `MAX_RANGE_MS` only) have no enforced request size ceiling visible at the route level beyond schema validation, and there is no rate limiting on any route.
- Files: `src/app/api/ingest/batch/route.ts`, `src/lib/validation/ingest-schema.ts`, `src/app/api/readings/route.ts`
- Impact: A misbehaving or compromised device could submit unbounded batch payloads, or a caller could poll `/api/readings` in a tight loop, consuming Vercel free-tier function time/Supabase free-tier row reads.
- Fix approach: Cap batch array length in the zod schema, add basic per-device rate limiting (e.g., Supabase-backed token bucket) if usage patterns show abuse risk.

## Known Bugs

None identified through static review — no failing tests, no open TODO/FIXME/HACK/XXX markers found anywhere in `src/`.

## Security Considerations

**Device auth relies on a single static per-device API key stored in Postgres:**
- Risk: `x-api-key` is compared via a plain `.eq("api_key", apiKey)` lookup (`src/app/api/ingest/route.ts:41-46`, `src/app/api/ingest/batch/route.ts:50-55`) — no hashing at rest implied by the code (the `devices` table schema is not visible in `src/`, so hashing may or may not exist in Supabase). If keys are stored in plaintext, a database leak directly compromises every device credential.
- Files: `src/app/api/ingest/route.ts`, `src/app/api/ingest/batch/route.ts`, `supabase/` (schema not reviewed in this pass)
- Current mitigation: Auth-before-validate ordering explicitly documented to avoid a payload-shape timing side channel (`src/app/api/ingest/route.ts:9-12`).
- Recommendations: Verify (in `supabase/migrations`) whether `api_key` is hashed; if not, hash device API keys server-side and compare hashes. Confirm Supabase RLS is enabled on `devices`, `readings`, `risk_scores` since `supabaseAdmin` bypasses RLS entirely (`src/lib/supabase/admin.ts:10-12`) — a leaked service-role key would grant full read/write access to all patient data.

**`GET /api/readings` has no authentication (see Tech Debt above) — cross-listed here as a security gap, not just a design gap.**

**Service-role key centralization:**
- Risk: `src/lib/supabase/admin.ts` correctly isolates the service-role client to one module and comments that it must never be imported into client-bundled code — good practice — but there is no automated guard (lint rule, import boundary check) enforcing that constraint; it currently relies on developer discipline/comments only.
- Files: `src/lib/supabase/admin.ts`
- Current mitigation: Doc comment warning at the top of the file.
- Recommendations: Add an ESLint rule (e.g., `eslint-plugin-boundaries` or a custom no-restricted-imports pattern) to prevent `@/lib/supabase/admin` from being imported by any file under a client-component boundary.

## Performance Bottlenecks

**Unbounded backfill rescore window:**
- Problem: `POST /api/ingest/batch` recomputes risk scores for every existing reading whose 12h trend window overlaps the incoming batch's timestamp range (`src/app/api/ingest/batch/route.ts:131-141`, using `fetchWindow` from `src/lib/risk/compute.ts`). Each rescored row itself triggers another paginated window fetch inside `computeAndPersistRiskScore`.
- Files: `src/app/api/ingest/batch/route.ts:137-152`, `src/lib/risk/compute.ts:73-103`
- Cause: This is an N+1-style pattern — one query to find "affected" rows, then one additional paginated query per affected row to compute its own trend window.
- Improvement path: Precompute/cache per-device rolling aggregates (sum, count) incrementally rather than re-querying and re-averaging the full 12h window on every score; or batch-fetch all needed windows once per unique window range.

**`fetchWindow` pagination via repeated `.range()` calls:**
- Problem: `src/lib/risk/compute.ts:73-103` paginates in `WINDOW_PAGE_SIZE = 1000` chunks to work around PostgREST's `max_rows` cap. For a device sampling frequently, a single 12h window could require multiple round trips per score computation, and this happens once per reading scored.
- Files: `src/lib/risk/compute.ts`
- Cause: PostgREST hard cap combined with per-reading (not per-batch) window fetching.
- Improvement path: Documented in-code as intentional and correctness-critical (silent truncation is the alternative failure mode) — acceptable tradeoff for now, but worth revisiting with a materialized rolling-stats table if reading frequency increases materially.

## Fragile Areas

**Risk-scoring thresholds and formula (`src/lib/risk/thresholds.ts`, `src/lib/risk/compute.ts`):**
- Files: `src/lib/risk/thresholds.ts`, `src/lib/risk/compute.ts`
- Why fragile: This is the core clinical-signal logic (composite Green/Amber/Red sepsis risk score) — any change to threshold constants or the abnormal-count-to-status mapping (`abnormalCount >= 3 ? "red" : abnormalCount === 2 ? "amber" : "green"`, `src/lib/risk/compute.ts:190-191`) directly changes patient-facing risk signals with no clinical review gate visible in the codebase itself.
- Safe modification: Any change here should be paired with the referenced `context/implementation-plans/neonatal-sepsis-armband.md` design doc and covered by `tests/risk.compute.test.ts` before merging; treat this file as requiring the highest review bar in the repo.
- Test coverage: `tests/risk.compute.test.ts` exists and appears purpose-built for this module — good coverage signal, though exact assertion depth was not fully audited in this pass.

**Duplicate-detection/upsert semantics across two near-identical route handlers:**
- Files: `src/app/api/ingest/route.ts`, `src/app/api/ingest/batch/route.ts`
- Why fragile: Both routes independently reimplement auth-before-validate, body parsing, and upsert-ignore-duplicates logic (documented in comments as intentionally mirrored, e.g. `src/app/api/ingest/batch/route.ts:18-19` "Mirrors src/app/api/ingest/route.ts's auth-before-validate ordering"). Any future fix to one (e.g., a security fix to the auth check) must be manually ported to the other, with no shared helper enforcing parity.
- Safe modification: Extract the shared auth-and-parse prefix into a common helper (e.g., `src/lib/ingest/authenticate.ts`) so the two routes cannot drift; until then, changes to one route's auth/parsing logic must be cross-checked against the other.
- Test coverage: `tests/ingest.route.test.ts`, `tests/ingest.batch.test.ts`, `tests/ingest.auth.test.ts` all exist, which mitigates regression risk somewhat.

## Scaling Limits

**Supabase/Vercel free tier:**
- Current capacity: Project is explicitly constrained to free-tier Vercel (serverless function execution) and Supabase (Postgres rows/storage, connection limits, PostgREST `max_rows` cap of 1000 encountered directly in `src/lib/risk/compute.ts:57-65`), per `.claude/CLAUDE.md` constraints.
- Limit: Vercel free-tier function execution time (route already sets `maxDuration = 60` defensively in `src/app/api/ingest/batch/route.ts:12`) and Supabase free-tier connection/row-count ceilings will constrain how many concurrent devices and how much reading history this backend can support before requiring a paid tier.
- Scaling path: Move to paid Supabase (removes/raises `max_rows`, increases connection pool) and Vercel Pro (longer function timeouts) when device count or data volume grows; consider moving scoring to a background worker/queue to decouple from HTTP request lifetimes.

## Dependencies at Risk

None identified — dependency list (`package.json`) is small and current: Next.js 16.3.5, React 19.2.8, `@supabase/supabase-js` ^2.116.0, `zod` ^4.6.2, Vitest ^4.1.11. All actively maintained, no obviously deprecated or abandoned packages.

## Missing Critical Features

**No offline-sync conflict/ordering test beyond unit level for backfill correctness under concurrent batches:**
- Problem: The backfill-rescore logic (`src/app/api/ingest/batch/route.ts:131-152`) assumes single-device, sequential batch processing. There is no visible handling for two overlapping batch syncs for the same device arriving concurrently (e.g., two requests racing), which could cause redundant or interleaved rescoring.
- Blocks: Confidence that concurrent batch syncs from the same device (e.g., a flaky connection retrying while a previous request is still processing) produce correct final state.

**No dashboard/API consumer-facing rate limiting or abuse protection**, as noted under Tech Debt and Performance — listed here as a gap rather than duplicated in detail.

## Test Coverage Gaps

**Read API (`/api/readings`) authorization is untested by design** because it currently has no authorization to test — `tests/readings.route.test.ts` exists, but any assertions there necessarily test only query-param validation, not access control, since none exists.
- Files: `src/app/api/readings/route.ts`, `tests/readings.route.test.ts`
- Risk: A future contributor could assume the read route is protected (since ingest routes are) and not notice it is fully open.
- Priority: High — should be resolved before any non-trivial user base has dashboard access.

**Concurrent/racing batch-ingest requests for the same device:**
- What's not tested: Behavior when two batch-sync requests for the same `deviceId` are in flight simultaneously (e.g., overlapping upserts and backfill rescoring racing each other).
- Files: `src/app/api/ingest/batch/route.ts`, `tests/ingest.batch.test.ts`
- Risk: Possible redundant scoring work or, in a worse case, a score computed from a partially-inserted window; low likelihood given upsert-ignore-duplicates design but not verified by a concurrency test.
- Priority: Medium.

**End-to-end deployed test (`tests/e2e-deployed.test.ts`) coverage scope not verified in this pass** — worth confirming it is run in CI (no CI config was found under `.github/` during this scan) rather than only locally.
- Files: `tests/e2e-deployed.test.ts`
- Risk: If not wired into CI, deployed-environment regressions could go undetected between manual runs.
- Priority: Medium.

---

*Concerns audit: 2026-09-25*
