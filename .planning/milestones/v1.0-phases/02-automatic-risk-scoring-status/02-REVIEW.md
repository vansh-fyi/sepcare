---
phase: 02-automatic-risk-scoring-status
reviewed: 2026-09-18T11:52:06Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/app/api/ingest/route.ts
  - src/lib/risk/compute.ts
  - src/lib/risk/thresholds.ts
  - src/lib/supabase/types.ts
  - supabase/migrations/20260918102702_risk_scores.sql
  - tests/ingest.route.test.ts
  - tests/realtime.risk-scores.test.ts
  - tests/risk.compute.test.ts
findings:
  critical: 1
  warning: 5
  info: 2
  total: 8
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-09-18T11:52:06Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

The risk-scoring engine's boundary logic (D-12, D-13, D-18, D-26, P1/P2) is well tested and, as written, internally consistent: temperature asymmetry, the Liebermeister HR/temp ratio band, tie-break-by-id ordering, and the count-based green/amber/red gate all match their test assertions and doc comments. Auth ordering (device+key lookup before zod validation) is sound in intent.

However, one finding is a genuine correctness BLOCKER: the rolling-window query in `computeAndPersistRiskScore` has no pagination, and this project's own `supabase/config.toml` caps PostgREST responses at `max_rows = 1000`. For any device sampling faster than roughly once per 43 seconds, a 12-hour window exceeds 1000 rows and the ascending-ordered query silently returns only the *oldest* rows in-window — dropping the readings nearest `target.timestamp` (the ones that should dominate the personal baseline) without any error being raised. This can produce a materially wrong green/amber/red status for exactly the patients generating the most data, which is the opposite of what a screening triage tool should do under load.

Beyond that, I found gaps in input-range validation, a silently-disabled feature under a plausible edge case (zero/negative activity baseline), a JSDoc comment that overstates what happens before the auth check, and no operational visibility when risk scoring itself throws.

## Critical Issues

### CR-01: Rolling-window query is unbounded and silently truncated by PostgREST's default 1000-row cap

**File:** `src/lib/risk/compute.ts:76-85`
**Issue:** The window query has no `.range()`/pagination:

```ts
const { data: window, error } = await supabaseAdmin
  .from("readings")
  .select("id, timestamp, heartRate, temperature, activityScore")
  .eq("deviceId", target.deviceId)
  .lte("timestamp", target.timestamp)
  .gte("timestamp", target.timestamp - TREND_WINDOW_MS)
  .order("timestamp", { ascending: true })
  .order("id", { ascending: true });
```

`supabase/config.toml:18` sets `max_rows = 1000` for this project's PostgREST instance — confirmed in-repo, not speculative. `TREND_WINDOW_MS` is 12 hours (`thresholds.ts:38`). Any device producing more than 1000 readings within a rolling 12h window (i.e. faster than one reading per ~43 seconds — plausible for a continuous vitals wearable) will have this query capped at 1000 rows by PostgREST. Because the query is ordered `timestamp ASC, id ASC` with no offset/pagination, the rows returned are the **oldest** 1000 in-window, not the ones nearest `target.timestamp`. Consequences:

- `prior` (line 99-103, filtered from `rows`) is missing the readings closest to `target`, so `baselineHR`/`baselineTemp`/`baselineActivity` are computed over a stale, older-than-intended slice of history instead of the true rolling baseline.
- In dense-sampling scenarios the target reading's own row can be excluded from `rows` entirely (it has the highest timestamp in the window and gets truncated out), though this specific omission is harmless since `target`'s own values are passed in directly rather than re-read from `rows`.
- No error is thrown or logged — the function returns a normal-looking `{status, breakdown}` and persists it via upsert, so the wrong result is indistinguishable from a correct one downstream.

This directly undermines D-18/D-26's stated correctness guarantees ("the window is always relative to target.timestamp... required for correctness under Phase 3's future out-of-order batch inserts") for any device that samples densely, which is exactly the kind of device this system is built for.

**Fix:** Paginate the window fetch (loop `.range()` calls in descending-recency order and stop once the 1000-row page boundary is exceeded, or fetch DESC and reverse), or push the aggregation into SQL/an RPC so PostgREST's row cap never applies to raw row transfer, e.g.:

```ts
const { data: window, error } = await supabaseAdmin.rpc("risk_score_window", {
  device_id: target.deviceId,
  upper_ts: target.timestamp,
  lower_ts: target.timestamp - TREND_WINDOW_MS,
});
```
or explicitly loop `.range(offset, offset + 999)` until a short page is returned, accumulating all matching rows client-side before computing `mean()`.

## Warnings

### WR-01: No physiological bounds validation on ingest vitals

**File:** `src/lib/validation/ingest-schema.ts:9-18`
**Issue:** `heartRate`, `spo2`, `temperature`, and `activityScore` are validated only as `z.number()` — negative heart rate, `spo2` outside `[0, 100]`, or a temperature of `-40` all pass schema validation and get inserted and scored. A malfunctioning sensor (loose lead, ESP32 ADC glitch) can inject values that are numerically valid but physiologically nonsensical, which then silently pollute a device's own rolling baseline (`mean()` in `compute.ts:53-55`) for up to 12 hours.
**Fix:** Add sane physiological bounds, e.g.:
```ts
vitals: z.object({
  heartRate: z.number().min(0).max(300),
  spo2: z.number().min(0).max(100),
  temperature: z.number().min(20).max(45),
  activityScore: z.number().min(0),
}),
```
(exact bounds should come from the clinical spec, but *some* bound is needed.)

### WR-02: Activity-trend feature is silently disabled whenever the baseline mean is <= 0

**File:** `src/lib/risk/compute.ts:127-132`
**Issue:**
```ts
const baselineActivity = mean(prior.map((row) => row.activityScore));
if (baselineActivity > 0) {
  activityDelta = target.activityScore - baselineActivity;
  activityTrending =
    target.activityScore <= baselineActivity * ACTIVITY_DECLINE_RATIO;
}
```
`thresholds.ts:30-35` explicitly notes `activityScore` "has no documented fixed range." If a device's baseline activity mean is exactly 0 or negative (plausible for a very still newborn, or for noisy/offset sensor data), the entire activity-trend feature goes silently inert for that window — `activityTrending` stays `false` and `activityDelta` stays `null` regardless of how much further activity declines. There's no log line or breakdown flag indicating the feature was skipped versus genuinely evaluated-and-normal, so this is indistinguishable from "activity checked, found normal" in the persisted `breakdown` — which matters because `breakdown` is the explainability record (D-22).
**Fix:** At minimum, distinguish "feature not evaluable" from "feature evaluated as normal" in the breakdown (e.g. `activityTrend: { trending: boolean; delta: number | null; evaluable: boolean }`), so a reviewer reading `risk_scores.breakdown` can tell the two cases apart.

### WR-03: JSDoc overstates what happens before the auth DB check

**File:** `src/app/api/ingest/route.ts:6-13`
**Issue:** The comment states: "the X-API-Key header is checked against the devices table BEFORE the body is parsed or validated." In the actual code, `await request.json()` (line 28) runs and fully parses the body *before* the devices-table lookup (line 41-46) — the devices-table check in fact *depends on* the parsed body (`bodyDeviceId`). Only the more detailed `zod` field-level validation (line 55) is deferred until after auth, which is the part that actually matters for the stated goal (not leaking payload-shape detail to unauthenticated callers). The comment conflates "parsed" and "validated," which could mislead a future maintainer refactoring this ordering into believing raw JSON parsing itself is deferred, when it is not.
**Fix:** Tighten the comment to describe the real guarantee, e.g. "the body is parsed to extract `deviceId` for the auth lookup, but detailed field-level (zod) validation is deferred until after the devices-table check succeeds, so an unauthenticated caller never sees per-field error details."

### WR-04: Risk-scoring failures are swallowed with no alerting/retry path

**File:** `src/app/api/ingest/route.ts:87-95`
**Issue:**
```ts
try {
  await computeAndPersistRiskScore(insertedReading);
} catch (scoringError) {
  console.error("Risk scoring failed for reading", insertedReading.id, scoringError);
}
```
This is documented as intentional (D-23/D-24: never fail the ingest request because of a scoring bug), which is a reasonable API contract. But the only operational signal when scoring fails is a `console.error` in what is very likely a serverless (Vercel) function log — easy to miss, with no retry, dead-letter record, or alert. The system's stated core value is delivering a trustworthy sepsis signal; a reading that silently ends up with no `risk_scores` row (e.g. due to a transient DB error, or the CR-01 truncation bug surfacing as a thrown error in edge cases) currently has no way to be detected or backfilled.
**Fix:** At minimum, record failed-scoring reading IDs somewhere queryable (a `scoring_failures` table, or a structured log field a monitoring rule can key on) so a later batch job (Phase 3's batch-sync path is already planned to reuse `computeAndPersistRiskScore`) can retry them.

### WR-05: API key compared via plain SQL equality, not constant-time

**File:** `src/app/api/ingest/route.ts:41-46`
**Issue:** `.eq("device_id", bodyDeviceId).eq("api_key", apiKey)` performs a standard btree-indexed equality comparison. This is a common pattern and the practical exploitability over a network is low, but it is a textbook non-constant-time secret comparison for a credential value that (per `20260912172701_init.sql:1`) is manually seeded and long-lived, with no rotation mechanism visible in this phase.
**Fix:** Low priority for v1 given the free-tier/single-device constraints, but worth a follow-up note if this API key model persists into multi-device production use (e.g. hash+compare with `crypto.timingSafeEqual`, or move to Supabase's own auth).

## Info

### IN-01: No rate limiting on `POST /api/ingest`

**File:** `src/app/api/ingest/route.ts`
**Issue:** There is no throttling on the ingest endpoint, so an attacker (or a misbehaving device retry loop) can send unlimited requests. Combined with WR-05, this makes brute-forcing a device's API key or simply flooding the `readings`/`risk_scores` tables cheap.
**Fix:** Track for a later phase — e.g. Vercel Edge Config / Upstash rate limiting keyed by `deviceId` or source IP, or a simple per-device request counter in Supabase.

### IN-02: Hardcoded single-device literal in RLS policy

**File:** `supabase/migrations/20260918102702_risk_scores.sql:12-16`
**Issue:** `using ("deviceId" = 'nb-001')` bakes the single supported device id directly into the policy, mirroring the pre-existing pattern on `readings` from Phase 1. Not a new defect, but it's worth flagging here too since this migration reinforces the single-tenant assumption at the DB layer — multi-device support will require a migration (or a config table + policy rewrite) rather than an app-layer change.
**Fix:** No action needed for v1; note as a known migration cost when multi-device support is planned.

---

_Reviewed: 2026-09-18T11:52:06Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
