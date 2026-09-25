---
phase: 01-device-ingest-live-readout
reviewed: 2026-09-12T00:00:00Z
depth: standard
files_reviewed: 32
files_reviewed_list:
  - .gitignore
  - .env.example
  - AGENTS.md
  - CLAUDE.md
  - eslint.config.mjs
  - next.config.ts
  - package.json
  - public/file.svg
  - public/globe.svg
  - public/next.svg
  - public/vercel.svg
  - public/window.svg
  - scripts/check-device-seeded.mjs
  - scripts/seed-device.mjs
  - src/app/api/health/route.ts
  - src/app/api/ingest/route.ts
  - src/app/favicon.ico
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.module.css
  - src/app/page.tsx
  - src/lib/supabase/admin.ts
  - src/lib/supabase/types.ts
  - src/lib/validation/ingest-schema.ts
  - supabase/.gitignore
  - supabase/config.toml
  - supabase/migrations/20260912172701_init.sql
  - tests/e2e-deployed.test.ts
  - tests/helpers/cleanup.ts
  - tests/ingest.auth.test.ts
  - tests/ingest.route.test.ts
  - tests/realtime.subscribe.test.ts
  - tsconfig.json
  - vitest.config.ts
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-09-12T00:00:00Z
**Depth:** standard
**Files Reviewed:** 32
**Status:** issues_found

## Summary

Reviewed the Phase 1 device-ingest pipeline: `POST /api/ingest` (auth-before-validate ordering, zod schema, Supabase insert), the service-role Supabase client, the devices/readings migration + RLS policy, seed/check scripts, and the four test files, plus the unmodified `create-next-app` scaffold files (light scrutiny per scope).

The core security posture is sound: the service-role key is isolated to a server-only module with a clear "never import from a client component" contract, the API-key check happens before body validation (and is combined with `deviceId` in a single query rather than two sequential lookups, avoiding a device-enumeration oracle), RLS locks `devices` down to zero anon access and `readings` down to a single hardcoded `deviceId`, and the seed script uses a 256-bit `crypto.randomBytes` key. No SQL/command injection, no hardcoded secrets, no `eval`/`innerHTML` patterns were found. No critical/blocker findings.

However, there are several correctness/robustness gaps worth fixing before this pipeline is trusted with real device traffic: the auth query silently swallows Supabase errors and misreports outages as "invalid API key" (WR-01); vitals fields and the timestamp accept unbounded/non-finite values that can reach — or fail silently at — the database (WR-02); there is no idempotency protection against duplicate readings on ESP32 retry-after-timeout, which this project's own stated design goal (surviving WiFi/power outages with offline-buffered batch syncs) makes a real scenario (WR-03); and insert failures are returned to the caller but never logged server-side, so operational failures are invisible (WR-04).

## Warnings

### WR-01: Supabase auth-lookup errors are silently treated as "invalid API key"

**File:** `src/app/api/ingest/route.ts:40-52`
**Issue:** The device/API-key lookup destructures only `data`, discarding `error`:
```ts
const { data: device } = await supabaseAdmin
  .from("devices")
  .select("device_id")
  .eq("device_id", bodyDeviceId)
  .eq("api_key", apiKey)
  .maybeSingle();

if (!device) {
  return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
}
```
If this query fails for any reason other than "no matching row" (network blip, Supabase outage, RLS/permission misconfig, malformed query), `data` will also be `null` and the request is misclassified as an authentication failure (401) instead of a server error. During a real Supabase incident, every legitimate device would receive 401s instead of 5xx/503s — an ESP32's retry/backoff logic keyed off status code could behave very differently (or not retry at all) for a "your key is wrong" response versus "try again later." The failure is also invisible server-side since the error is never logged.
**Fix:**
```ts
const { data: device, error: authError } = await supabaseAdmin
  .from("devices")
  .select("device_id")
  .eq("device_id", bodyDeviceId)
  .eq("api_key", apiKey)
  .maybeSingle();

if (authError) {
  console.error("devices lookup failed:", authError);
  return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
}

if (!device) {
  return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
}
```

### WR-02: No domain bounds on vitals or timestamp — non-finite/nonsensical values pass validation

**File:** `src/lib/validation/ingest-schema.ts:9-18`
**Issue:** `z.number()` only rejects `NaN` and non-numeric types; it does **not** reject `Infinity`/`-Infinity`, negative values, or out-of-physiological-range values. As written, a payload like `{ heartRate: Infinity, spo2: -50, temperature: 1e300, activityScore: -1 }` passes `IngestSchema.safeParse`. `Infinity`/very large floats are also not representable in a Postgres `numeric` column the same way as finite values and can cause the insert to fail (surfacing as a generic "Failed to store reading" 500 with no indication of which field was bad), while merely-out-of-range-but-finite values (negative `spo2`, negative `heartRate`) will insert successfully and silently corrupt the vitals stream that the (future) sepsis-risk scoring will consume. `timestamp: z.number().int()` similarly accepts negative or arbitrarily-far-future epoch values.
**Fix:**
```ts
export const IngestSchema = z.object({
  deviceId: z.string().min(1),
  timestamp: z.number().int().positive(),
  vitals: z.object({
    heartRate: z.number().finite().min(0).max(300),
    spo2: z.number().finite().min(0).max(100),
    temperature: z.number().finite().min(20).max(45),
    activityScore: z.number().finite().min(0),
  }),
});
```
(Tune the actual bounds to the device's sensor spec — the point is to reject non-finite and physiologically-impossible values at the edge rather than let them reach the database.)

### WR-03: No idempotency protection — duplicate readings on device retry

**File:** `supabase/migrations/20260912172701_init.sql:12-21`, `src/app/api/ingest/route.ts:64-71`
**Issue:** `readings` has no unique constraint on `("deviceId", "timestamp")` (or any other natural key), and the ingest route does a plain `insert` (not an upsert with `onConflict`). The project's own stated purpose (per `.claude/CLAUDE.md`) is to "handle offline-buffered batch syncs after connectivity gaps" — i.e., the ESP32 is expected to retry sends after a dropped ACK or a reconnect. If a POST succeeds server-side but the response is lost before the device sees it (a very common failure mode over flaky WiFi), the device's retry logic will resend the same reading and it will be inserted a second time with a new `id`. There is nothing distinguishing this from two genuinely-distinct readings, so downstream consumers (Realtime subscribers, and later the risk-scoring pipeline) will see duplicated vitals, which can double-count in any aggregation/rolling-window logic.
**Fix:** Add a unique constraint and upsert on it:
```sql
alter table public.readings
  add constraint readings_device_timestamp_uniq unique ("deviceId", "timestamp");
```
```ts
const { error: insertError } = await supabaseAdmin
  .from("readings")
  .upsert(
    { deviceId, timestamp, heartRate: vitals.heartRate, spo2: vitals.spo2,
      temperature: vitals.temperature, activityScore: vitals.activityScore },
    { onConflict: "deviceId,timestamp", ignoreDuplicates: true }
  );
```

### WR-04: Insert failures are never logged server-side

**File:** `src/app/api/ingest/route.ts:73-78`
**Issue:**
```ts
if (insertError) {
  return NextResponse.json({ error: "Failed to store reading" }, { status: 500 });
}
```
`insertError` (which contains the Postgres error code/message/detail) is discarded. In production, any insert failure — FK violation, RLS misconfiguration, connection exhaustion, the WR-02 non-finite-value case — surfaces to the caller only as an opaque 500 with no trace on the server side to diagnose it from. For a health-monitoring pipeline where dropped readings could mean a missed sepsis alert, silent failure is a real operational risk.
**Fix:**
```ts
if (insertError) {
  console.error("readings insert failed:", insertError, { deviceId, timestamp });
  return NextResponse.json({ error: "Failed to store reading" }, { status: 500 });
}
```

## Info

### IN-01: `.env.example` omits `DEVICE_API_KEY` and `DEPLOYED_URL`, which the test suite requires

**File:** `.env.example:1-8`
**Issue:** `tests/ingest.route.test.ts`, `tests/ingest.auth.test.ts`, `tests/realtime.subscribe.test.ts`, and `tests/e2e-deployed.test.ts` all read `process.env.DEVICE_API_KEY!` (non-null assertion — will throw a confusing `undefined` type error rather than a clear message if unset), and `e2e-deployed.test.ts` also reads `process.env.DEPLOYED_URL`. Neither variable is documented in `.env.example`, so a new contributor following the example file to set up `.env.local` will have the test suite fail with an unhelpful runtime error rather than a clear "missing env var" message.
**Fix:** Add both to `.env.example` with a comment (e.g. `DEVICE_API_KEY=` — printed by `scripts/seed-device.mjs`; `DEPLOYED_URL=` — set only when running the deployed e2e smoke test).

### IN-02: Hardcoded `'nb-001'` device id embedded directly in the RLS policy SQL

**File:** `supabase/migrations/20260912172701_init.sql:24-28`
**Issue:** The anon read policy hardcodes the single allowed device id as a SQL literal:
```sql
create policy "anon read-only single device"
on public.readings
for select
to anon
using ("deviceId" = 'nb-001');
```
This is a reasonable, explicitly-documented v1 shortcut for a single-device deployment, but it means adding a second device requires a new migration to edit the policy (rather than, e.g., a config table or a broader "any registered device" predicate). Flagging for awareness only — no change requested for Phase 1 given the documented single-device scope.

### IN-03: Realtime test channels may leak on assertion failure

**File:** `tests/realtime.subscribe.test.ts:76-114`, `tests/e2e-deployed.test.ts:70-106`
**Issue:** `sub.close()` is called inline after the awaited assertions, not in a `finally`/`afterEach`. If any `expect(...)` before `sub.close()` throws, the realtime channel is never unsubscribed, leaking an open WebSocket subscription for the rest of the test run (and, in CI, potentially preventing clean process exit / causing cross-test interference on subsequent runs against the same live project).
**Fix:** Wrap in `try { ... } finally { sub.close(); }`, or track open subs in an array and close them all in `afterEach`.

### IN-04: Default `create-next-app` homepage/metadata still deployed

**File:** `src/app/page.tsx:1-69`, `src/app/layout.tsx:15-18`
**Issue:** The scaffold's default landing page (Next.js/Vercel marketing links, "Create Next App" title/description) is unmodified and is part of what ships to the production Vercel deployment referenced by `tests/e2e-deployed.test.ts`. Not a defect in the ingest pipeline itself, but worth a placeholder note since this becomes visible at the deployed root URL.
**Fix:** Replace with either a minimal status page or a redirect once the dashboard/API surface is defined; no action required for Phase 1 scope.

---

_Reviewed: 2026-09-12T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
