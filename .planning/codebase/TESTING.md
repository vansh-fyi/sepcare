# Testing Patterns

**Analysis Date:** 2026-09-25

## Test Framework

**Runner:**
- Vitest 4 (`vitest.config.ts`), Node environment (`test.environment: "node"`).
- No React Testing Library / DOM testing setup — this is a backend-only test suite covering API route handlers and lib functions directly.

**Assertion Library:**
- Vitest's built-in `expect` (Jest-compatible API): `toBe`, `toEqual`, `toHaveLength`, `toBeNull`, `toBeNaN`, `not.toBeNull`, etc.

**Run Commands:**
```bash
npm test              # vitest run (single run, all tests)
```
No separate watch/coverage script is defined in `package.json` — only `"test": "vitest run"`.

## Test File Organization

**Location:**
- All tests live in a top-level `tests/` directory (not co-located with source), separate from `src/`.
- Shared test utilities live in `tests/helpers/`.

**Naming:**
- `<feature>.<aspect>.test.ts`, e.g. `tests/ingest.route.test.ts` (happy-path storage), `tests/ingest.auth.test.ts` (auth-specific cases), `tests/ingest.batch.test.ts` (batch endpoint), `tests/readings.route.test.ts` (GET history endpoint), `tests/risk.compute.test.ts` (risk engine unit-level behavior), `tests/realtime.risk-scores.test.ts` / `tests/realtime.subscribe.test.ts` (Supabase realtime), `tests/e2e-deployed.test.ts` (deployed-environment smoke test).
- Splitting one route's tests across multiple files by concern (route/auth/batch) is the established pattern — follow it for new routes rather than growing one giant file.

**Structure:**
```
tests/
├── helpers/
│   └── cleanup.ts          # shared DB cleanup utilities
├── ingest.route.test.ts
├── ingest.auth.test.ts
├── ingest.batch.test.ts
├── readings.route.test.ts
├── risk.compute.test.ts
├── realtime.risk-scores.test.ts
├── realtime.subscribe.test.ts
└── e2e-deployed.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe("POST /api/ingest — valid submissions and storage integrity", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
  });

  it("returns 201 and persists all fields exactly on a valid POST (ING-01, STOR-01)", async () => {
    // ... arrange payload, act via POST(), assert on response + DB state
  });
});
```
(`tests/ingest.route.test.ts:18-138`)

**Patterns:**
- `describe` titles name both the endpoint/function under test and the specific concern being verified, often citing a requirement/decision ID in parentheses (e.g. `(ING-01, STOR-01)`, `(D-33/D-34)`) — mirrors the decision-ID convention used in source comments.
- `it` titles are full sentences describing expected behavior and outcome, not just "works" — e.g. `"returns 201 (not 500) on a retried duplicate deviceId+timestamp POST, storing exactly one row (D-33/D-34)"`.
- Setup: unique timestamps derived from `Date.now() + <offset>` per test case to avoid collisions between tests and across parallel/repeated runs.
- Teardown: an array of inserted timestamps is tracked per `describe` block and drained in `afterEach` via helper delete functions — every test that inserts data is responsible for registering its timestamp for cleanup.

## Mocking

**Framework:** None. **No mocking library is used anywhere in the suite.**

**Patterns:**
- Tests exercise route handlers directly as plain async functions (`POST(request)`, not via HTTP) using real `NextRequest` objects constructed in-test via a local `makeRequest(body, headers)` helper repeated in each test file (`tests/ingest.route.test.ts:10-16`, `tests/ingest.auth.test.ts:9-15`, `tests/risk.compute.test.ts:13-19`).
- Tests hit the **live Supabase project** directly through `supabaseAdmin` — this is explicit and intentional, documented in `vitest.config.ts`:
  > "Vitest does not auto-load .env.local into process.env like Next.js does — tests exercise the live Supabase project (no mocking), so SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DEVICE_API_KEY etc. must be present in process.env before the test files import route.ts."
- `vitest.config.ts` loads env vars via `loadEnv("test", process.cwd(), "")` from Vite's env loader before any test file imports route modules (so `supabaseAdmin` in `src/lib/supabase/admin.ts` is constructed with real credentials at import time).

**What to Mock:**
- Nothing by convention — this project deliberately favors integration-style tests against the real database over mocked unit tests, for both route handlers and lib functions (`computeAndPersistRiskScore` is tested by inserting real rows and reading real persisted `risk_scores`).

**What NOT to Mock:**
- Do not introduce mocking for `supabaseAdmin` or Next.js request/response objects — this breaks the established pattern of validating real DB round-trips (duplicate-handling, upserts, cascading deletes, `risk_scores` auto-creation) which are central to this project's correctness guarantees.

## Fixtures and Factories

**Test Data:**
```typescript
// tests/risk.compute.test.ts:35-59
async function insertReading(row: {
  timestamp: number;
  heartRate: number;
  temperature: number;
  activityScore: number;
  deviceId?: string;
}): Promise<InsertedReadingRow> {
  const { data, error } = await supabaseAdmin
    .from("readings")
    .insert({ deviceId: row.deviceId ?? DEVICE_ID, ...row, spo2: 98 })
    .select("id, deviceId, timestamp, heartRate, temperature, activityScore")
    .single();

  if (error || !data) throw error ?? new Error("insertReading: no data returned");
  return data as InsertedReadingRow;
}
```
- Small locally-defined factory functions per test file (`insertReading`, `makeRequest`, `validPayload`) rather than a shared global fixtures module — each test file owns its own minimal builders tailored to what it needs.
- A fixed test device id constant `const DEVICE_ID = "nb-001"` is reused across test files, implying a seeded `devices` row must exist in the target Supabase project (via `supabase/` migrations/seed) for tests to authenticate.

**Location:**
- No dedicated fixtures directory. Only `tests/helpers/cleanup.ts` is shared; everything else is defined per test file.

## Coverage

**Requirements:** None enforced — no coverage tooling/config or threshold present in `package.json` or `vitest.config.ts`.

**View Coverage:**
Not configured. To add coverage, install `@vitest/coverage-v8` and add a `test:coverage` script running `vitest run --coverage`.

## Test Types

**Unit Tests:**
- `tests/risk.compute.test.ts` tests `computeAndPersistRiskScore` and `fetchWindow` directly against real inserted rows — closer to integration tests in practice since they hit the DB, but scoped to a single lib function's behavior (baseline establishment, abnormal-feature counting, green/amber/red thresholds).

**Integration Tests:**
- Route-level tests (`tests/ingest.route.test.ts`, `tests/ingest.auth.test.ts`, `tests/ingest.batch.test.ts`, `tests/readings.route.test.ts`) call exported route handlers with constructed `NextRequest` objects and assert on both the HTTP response and resulting Supabase row state — this is the dominant test style in the repo.
- `tests/realtime.risk-scores.test.ts` and `tests/realtime.subscribe.test.ts` test Supabase realtime subscription behavior.

**E2E Tests:**
- `tests/e2e-deployed.test.ts` — smoke test intended to run against an already-deployed Vercel environment (per `src/app/api/health/route.ts`'s comment: "Used by Plan 04 to confirm the Vercel deployment is live"). Read this file before assuming all tests run against localhost — some are meant to hit a deployed URL.

## Common Patterns

**Async Testing:**
```typescript
const res = await POST(makeRequest(payload, { "x-api-key": VALID_KEY }));
expect(res.status).toBe(201);
const json = await res.json();
expect(json).toEqual({ status: "ok" });
```
Standard pattern: `await` the handler call directly (no supertest/HTTP layer), then `await res.json()` to inspect the body.

**Error Testing:**
```typescript
// tests/ingest.route.test.ts:106-128
const res = await POST(makeRequest(payload, { "x-api-key": VALID_KEY }));
expect(res.status).toBe(400);
const json = await res.json();
expect(json.error).toBe("Invalid payload");
expect(Array.isArray(json.details)).toBe(true);
const paths = json.details.map((d: { path: unknown[] }) => d.path.join("."));
expect(paths.some((p: string) => p.includes("heartRate"))).toBe(true);

// Also assert the invalid request had no side effects:
const { data } = await supabaseAdmin.from("readings").select("timestamp").eq("timestamp", timestamp).maybeSingle();
expect(data).toBeNull();
```
Error-path tests consistently assert both the error response shape (status + `error` field + `details` where applicable) AND that no unintended DB write occurred — a "no side effects on failure" check is standard practice to add to any new error-path test.

---

*Testing analysis: 2026-09-25*
