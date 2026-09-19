# Phase 4: Historical Trends API - Research

**Researched:** 2026-09-19
**Domain:** Public historical-vitals API over Next.js 16 and Supabase/PostgREST
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-38:** Provide `GET /api/readings?deviceId=nb-001&from=<epoch-ms>&to=<epoch-ms>`. `deviceId`, `from`, and `to` are all required query parameters. The endpoint is publicly readable for the v1 dashboard with no API key or user login, consistent with the existing anonymous read-only dashboard model. — **Reversibility:** costly — frontend integrations will be written against this published URL and parameter contract.
- **D-39:** An unsupported device ID returns `404` with `{ "error": "Device not found" }`; do not return an empty successful result or reveal device details.
- **D-40:** Bounds use the existing Unix epoch-millisecond vocabulary and must form a chronological range (`from < to`). A request may span at most **15 days**.
- **D-41:** Missing, non-numeric, reversed, or over-limit bounds return a clear field-specific `400` JSON error. Development diagnostics must make these failures visible in the console/server logs, and automated tests must cover every invalid-range path.
- **D-42:** A valid range containing no readings returns `200` with an empty `entries` list.
- **D-43:** Test coverage must prove at least seven continuous days of stored history, including a contiguous three-day scenario. The product goal is to track at least three days of data continuously.
- **D-44:** Return a metadata envelope: `{ deviceId, from, to, entries }`.
- **D-45:** Each `entries` item is a self-contained nested record: `{ timestamp, vitals: { heartRate, spo2, temperature, activityScore }, risk: { status, breakdown } }`. Return the full existing per-feature risk breakdown with every entry, not status alone. — **Reversibility:** costly — frontend trend and explanation views will consume this response shape.
- **D-46:** Return every original reading in chronological order; do not aggregate or sample server-side. Any chart presentation/downsampling is a frontend concern. This preserves a short-lived change in vitals or risk status.
- **D-47:** If a stored reading has no associated `risk_scores` row, retain the reading in the response with `risk: null`; do not omit it or fail the entire request.
- **D-48:** Favor freshness over endpoint caching. Send `Cache-Control: no-store` so browsers and proxies do not show stale history after an offline batch backfill or rescore. The existing `readings` and `risk_scores` Supabase Realtime subscriptions enable a frontend to re-fetch this endpoint automatically without a user-initiated refresh.
- **D-49:** On an unexpected database/server failure, return a safe `{ "error": "Unable to load reading history" }` response and log full diagnostic details only server-side; never expose database errors publicly.

### Claude's Discretion

- Exact server-side query implementation, including safe use of existing Supabase clients and internal pagination needed to retrieve the full 15-day range despite PostgREST page limits, provided it honors the public single-device contract and all decisions above.

### Deferred Ideas (OUT OF SCOPE)

- Programmatic ESP32 provisioning, registration UI, and credentials rotation — DEV-V2-02, outside this single-device v1 phase.
- Multi-device historical access and user/device authorization — DEV-V2-01 and ACC-V2-01, outside v1.
- Frontend trend-chart UI, time-scale controls, and Realtime refetch wiring — owned by the parallel frontend work; this phase exposes the data contract it consumes.
- Server-side rollups/downsampling or a longer-than-15-day history view — defer until actual usage demonstrates a need; v1 returns raw readings.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| READ-02 | A read API exposes historical vitals and risk-status trend over a given time range, for the frontend to render a trend view | Validated Route Handler, paginated embedded relationship query, DTO mapper, and integration test matrix. |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- Read relevant Next.js documentation under `node_modules/next/dist/docs/` before writing code; that Route Handler documentation was read for this research. [VERIFIED: AGENTS.md:3-7]
- Preserve the Next.js agent-rule block because `next dev` regenerates it. [VERIFIED: AGENTS.md:8-10]

## Summary

Create `src/app/api/readings/route.ts`, a Next.js App Router GET handler. Route handlers live in `app/**/route.ts`, use `NextRequest.nextUrl.searchParams` for query values, and a GET that reads request data runs at request time. [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md:1-7,45-69] Explicitly send `Cache-Control: no-store` on all responses to meet D-48, even though this Next version does not cache GET route handlers by default. [VERIFIED: node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md:45-70]

Validate every public parameter before touching `supabaseAdmin`, which intentionally bypasses RLS. Then query `readings` as the parent and embed the optional one-to-one `risk_scores(status, breakdown)` relationship. `risk_scores.reading_id` is both primary key and FK to `readings.id`, and generated types mark it one-to-one. [VERIFIED: supabase/migrations/20260918102702_risk_scores.sql:1-9 — `reading_id bigint primary key references public.readings(id) on delete cascade`; src/lib/supabase/types.ts:101-138 — `isOneToOne: true`] Do not use an inner join: that would suppress a stored reading without a score, violating D-47. Existing integration coverage proves the embedded select, timestamp filter, and ascending order pattern. [VERIFIED: tests/risk.compute.test.ts:642-678]

**Primary recommendation:** implement a small local query parser plus a paginated `fetchHistory` helper in the route. Reuse the existing `1000`-row `.range()` pattern—one unpaged select can silently truncate a frequent device’s 15-day history. [VERIFIED: src/lib/risk/compute.ts:57-103] Add one live Supabase integration test file; no dependency, schema, RLS, Realtime, or frontend change is needed.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Parse `deviceId`, `from`, `to` | API / Backend | — | Public input must be validated before privileged access. |
| Retrieve / paginate original records | Database / Storage | API / Backend | Postgres remains source of truth; API only issues bounded query. |
| Pair vitals with risk | Database / Storage | API / Backend | FK embedded relationship preserves persisted score and gaps. |
| DTO, safe errors, no-store header | API / Backend | Browser / Client | Route owns the public HTTP contract; frontend owns charts/refetch. |
| Realtime update signal | Database / Storage | Browser / Client | Existing publication/subscription is unchanged and out of scope. |

## Standard Stack

No new package is required.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | `16.3.5` | Route Handler and `NextRequest`/`NextResponse` | Existing framework. [VERIFIED: package.json:12-17] |
| `@supabase/supabase-js` | `^2.116.0` | Existing typed data access, relationship select, filters, ordering, range pagination | Existing server data layer. [VERIFIED: package.json:12-17] |
| Vitest | `^4.1.11` | Handler integration tests | Existing runner. [VERIFIED: package.json:19-27] |

**Installation:** none.

## Package Legitimacy Audit

Not applicable: Phase 4 installs no external package.

## Architecture Patterns

### System Architecture Diagram

```text
Dashboard / Realtime-triggered refetch
  -> GET /api/readings?deviceId=nb-001&from=<epoch-ms>&to=<epoch-ms>
  -> Next.js handler
       -> validate required exact device + safe integer epoch-ms range
          -> 400 diagnostic error | 404 device error
       -> ordered, paginated readings + optional risk_scores relationship
       -> map only { timestamp, vitals, risk | null }
       -> 200 { deviceId, from, to, entries } + Cache-Control: no-store

readings --(risk_scores.reading_id FK/PK)--> risk_scores
  \---- existing Supabase Realtime publications ----> frontend subscription
```

### Recommended Project Structure

```text
src/app/api/readings/route.ts  # NEW public GET endpoint
src/lib/risk/compute.ts        # Existing pagination reference; normally unchanged
tests/readings.route.test.ts   # NEW direct route-handler integration tests
tests/helpers/cleanup.ts       # Existing cleanup helper, extend only if necessary
```

### Pattern 1: Validate before privileged access

Require all three parameters. Permit only `nb-001`; missing device ID is a field-specific 400 and a different present ID returns exactly `{ "error": "Device not found" }` with 404. For each timestamp, accept a whole decimal string that becomes a finite safe integer; do not use permissive `parseInt` or bare `Number` (`Number("") === 0`). Then require `from < to` and `to - from <= 15 * 24 * 60 * 60 * 1000`. For every 400, in non-production only, emit `console.warn("Invalid reading-history query", { field, reason })`; never log an API key or expose internals.

### Pattern 2: Optional embedded relationship with per-page order

Use inclusive bounds (`gte(from)`, `lte(to)`), matching the established timestamp-window helper. [VERIFIED: src/lib/risk/compute.ts:73-102] Every page must select only public fields, order by `timestamp` ascending, and page with `.range()`:

```typescript
const { data: page, error } = await supabaseAdmin
  .from("readings")
  .select("timestamp, heartRate, spo2, temperature, activityScore, risk_scores(status, breakdown)")
  .eq("deviceId", "nb-001")
  .gte("timestamp", from)
  .lte("timestamp", to)
  .order("timestamp", { ascending: true })
  .range(offset, offset + 999);
```

The fields are real generated values: `readings` includes `activityScore`, `heartRate`, `spo2`, `temperature`, `timestamp`; `risk_scores` includes `breakdown` and `status`. [VERIFIED: src/lib/supabase/types.ts:60-108 — `activityScore`, `heartRate`, `spo2`, `temperature`, `timestamp`, `breakdown`, `status`] Supabase documents select/filter/order/range pagination and a default maximum of 1,000 rows. [CITED: https://supabase.com/docs/reference/javascript/select; https://supabase.com/docs/reference/javascript/using-modifiers-order]

### Pattern 3: Explicit public DTO

Map database rows rather than spreading them, so IDs and `created_at` never leak. Map absent `risk_scores` to `risk: null`, as existing tests already cast/handle the nested relationship. [VERIFIED: tests/risk.compute.test.ts:674-677]

```typescript
const entries = rows.map((row) => ({
  timestamp: row.timestamp,
  vitals: { heartRate: row.heartRate, spo2: row.spo2,
    temperature: row.temperature, activityScore: row.activityScore },
  risk: row.risk_scores
    ? { status: row.risk_scores.status, breakdown: row.risk_scores.breakdown }
    : null,
}));
return NextResponse.json({ deviceId, from, to, entries }, {
  headers: { "Cache-Control": "no-store" },
});
```

`NextResponse.json` supports JSON payload plus response init, including status and headers. [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-response.md:73-92]

### Anti-Patterns to Avoid

- `risk_scores!inner(...)`: hides unscored readings.
- Unpaged select: drops records above PostgREST’s response cap.
- `created_at` ordering: breaks chronological interleaving after batch backfill.
- Passing arbitrary device IDs to `supabaseAdmin`: it broadens service-role access beyond v1.
- Raw database errors, server aggregation, or cached responses: violate D-46, D-48, or D-49.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Relationship join | Two independent queries and in-memory key join | Embedded `risk_scores(...)` select | Existing FK and type relationship encode the pairing. |
| Large-result protocol | Cursor API | `.range()` pagination used by `fetchWindow` | Existing proven method avoids the 1,000-row cap. |
| New authorization/persistence | Migration, device lookup, registration flow | Exact v1 allow-list before existing server-only client | Contract is deliberately single-device/public. |
| Chart rollups | Buckets/downsampling | Original ordered entries | D-46 delegates visualization to frontend. |

## Common Pitfalls

1. **Permissive parsing:** malformed bounds become unexpected numbers. Use strict whole-decimal safe-integer parsing; test missing, text, decimal, reversed, and over-15-day cases.
2. **Silent truncation:** PostgREST can return only 1,000 rows; keep the existing `fetchWindow` page-loop shape. [VERIFIED: src/lib/risk/compute.ts:57-103]
3. **Missing-risk loss:** no inner join; preserve parent reading as `risk: null`.
4. **Service-role exposure:** exact `nb-001` guard must run before the query. Existing anon RLS uses the same literal for both tables. [VERIFIED: supabase/migrations/20260912172701_init.sql:22-30 — `using ("deviceId" = 'nb-001')`; supabase/migrations/20260918102702_risk_scores.sql:10-18 — `using ("deviceId" = 'nb-001')`]
5. **Fixture pollution:** tests hit live Supabase and must delete the entire isolated timestamp range; deleting readings cascades to scores. [VERIFIED: vitest.config.ts:5-18; tests/helpers/cleanup.ts:13-28; supabase/migrations/20260918102702_risk_scores.sql:3-8]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A worst-case unsampled 15-day response completes within deployment time limits. | Architecture | Future high-frequency production usage may require a separately-approved response/cursor design. |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | build/tests | ✓ | `v25.8.2` | — |
| npm | scripts | ✓ | `11.11.1` | — |
| Next.js | handler | ✓ | `16.3.5` | — |
| Vitest | tests | ✓ | `4.1.11` | — |
| Supabase CLI | optional inspection | ✓ | `2.105.0` | not needed for code-only change |

## Validation Architecture

| Property | Value |
|----------|-------|
| Framework | Vitest `^4.1.11`, Node environment [VERIFIED: package.json:19-27; vitest.config.ts:5-13] |
| Config | `vitest.config.ts` |
| Quick | `npx vitest run tests/readings.route.test.ts` |
| Full | `npm test` |

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| READ-02 | Metadata, original vitals, paired full risk breakdown, timestamp ASC | integration | `npx vitest run tests/readings.route.test.ts` | ❌ Wave 0 |
| READ-02 | 8 daily samples spanning seven continuous days, including any contiguous 3-day slice, are all returned unsampled | integration | same | ❌ Wave 0 |
| READ-02 | Empty valid range returns 200/empty entries; directly stored unscored row maps to `risk: null` | integration | same | ❌ Wave 0 |
| READ-02 | Missing, malformed, reversed, and over-limit ranges are field-specific 400; unknown device is exact D-39 404 | handler | same | ❌ Wave 0 |
| READ-02 | `no-store` exists and a forced DB error produces only the D-49 500 body | handler with controlled mock/seam | same | ❌ Wave 0 |

- **Per task commit:** `npx vitest run tests/readings.route.test.ts`
- **Per wave merge and phase gate:** `npm test` and `npm run build`

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No, locked public v1 route | No dashboard secret/client API key. |
| V3 Session Management | No | No user/session layer in scope. |
| V4 Access Control | Yes | Exact supported-device allow-list before service-role query. |
| V5 Input Validation | Yes | Required parameters, strict epoch-ms parsing, chronology and 15-day cap. |
| V6 Cryptography | No | No new cryptographic operation. |

| Threat | STRIDE | Mitigation |
|--------|--------|------------|
| Arbitrary device ID passed to admin client | Information disclosure | Validate literal `nb-001` before querying. |
| Very broad/malformed range | Denial of service | Strict parser, duration cap, fixed page size. |
| DB error details to caller | Information disclosure | Server-only `console.error`, fixed public 500 JSON. |
| Stale backfill/rescore | Tampering/stale representation | `Cache-Control: no-store`. |

## Sources

### Primary (HIGH confidence)

- Local Next.js 16 Route Handler, NextRequest, and NextResponse docs read under `node_modules/next/dist/docs/`.
- [Supabase JavaScript select documentation](https://supabase.com/docs/reference/javascript/select) and [order documentation](https://supabase.com/docs/reference/javascript/using-modifiers-order).
- Current migrations, generated database types, risk paging implementation, and existing tests cited inline.

## Metadata

- Standard stack: HIGH — all tools are installed and already used.
- Architecture: HIGH — derived from source-of-truth schema/types and existing pagination/test patterns.
- Pitfalls: HIGH — derived from code’s explicit 1,000-row guard and Phase 3 data semantics.

**Research date:** 2026-09-19
**Valid until:** 2026-10-19
