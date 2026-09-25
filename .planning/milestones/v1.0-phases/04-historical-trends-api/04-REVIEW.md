---
phase: 04-historical-trends-api
reviewed: 2026-09-19T22:19:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - tests/readings.route.test.ts
findings:
  critical: 0
  warning: 0
  info: 1
  total: 1
status: clean
---

# Phase 04: Code Review Report (Incremental Re-Review)

**Reviewed:** 2026-09-19T22:19:00Z
**Depth:** standard
**Files Reviewed:** 1
**Status:** clean

## Summary

This is a narrowed, incremental re-review scoped to the diff between `cb52df5` (prior full review, which raised WR-01) and `276bd8c` (the follow-up fix commit). The diff under review is purely additive: two new `it.each` rows were inserted into `tests/readings.route.test.ts` (lines 107-108) to cover the omitted `from` / `to` query-parameter case.

```
git diff cb52df5..276bd8c --stat
 tests/readings.route.test.ts | 2 ++
 1 file changed, 2 insertions(+)
```

**WR-01 verification — RESOLVED.** The original finding was that the existing `from: ""` / `to: ""` test rows exercised the `not-a-whole-decimal` branch of `parseEpochMilliseconds` (empty-string value fails the `/^\d+$/` regex) rather than the `value === null` / "missing" branch, meaning the omitted-key code path (`from is required` / `to is required`) was never actually asserted.

The two new rows genuinely close this gap:

- New row (`{ params: { deviceId: DEVICE_ID, to: String(FIXTURE_END) } }`) omits the `from` key entirely from the `params` object. `makeRequest` (lines 19-25) only calls `url.searchParams.set` for keys present in the object, so `from` is absent from the URL and `request.nextUrl.searchParams.get("from")` returns `null` in `src/app/api/readings/route.ts:44`, correctly hitting the `"missing"` branch and asserting `error: "from is required"`, `field: "from"`, `reason: "missing"`.
- New row for `to` is symmetric and correctly hits the same branch for the `to` parameter.

I confirmed this empirically by running the validation test suite in isolation (no live Supabase connection required, since these rows short-circuit before any DB call):

```
npx vitest run tests/readings.route.test.ts -t "rejects"
 Test Files  1 passed (1)
      Tests  10 passed | 5 skipped (15)
```

All 10 rows in the `it.each` table pass, including the two new ones, and the verbose reporter confirms both new rows execute (`rejects 'from' validation failures`, `rejects 'to' validation failures`) and produce a genuinely distinct code path from the pre-existing `from: ""` / `to: ""` rows (verified by reading the branch logic in `parseEpochMilliseconds`, `src/app/api/readings/route.ts:40-70` — `value === null` is a structurally different branch from the regex-fails branch, and only the new rows can reach `value === null` given how `makeRequest` builds the URL).

No other changes were introduced by this diff — `git diff --stat` shows only the two inserted lines, so there is no new surface area to review beyond the two rows themselves.

## Info

### IN-01: Duplicate `it.each` test titles reduce output readability (pre-existing pattern, now slightly compounded)

**File:** `tests/readings.route.test.ts:115`
**Issue:** The test title template `"rejects $field validation failures"` (line 115) only interpolates `field`, not `reason`. Several rows share the same `field` value (e.g. `from` appears in the "missing" row added by this diff, the pre-existing `from: ""` row, and the pre-existing `from: "text"` row), so the verbose test reporter prints three separate tests all named `rejects 'from' validation failures` (and two named `rejects 'to' validation failures`). This collision pattern pre-dates this diff (rows for `not-a-whole-decimal` and `not-a-safe-integer` already shared the `from` field name), but the two new rows added here compound it, since the table now contains three `from`-field rows and two `to`-field rows with identical titles. This doesn't affect correctness (Vitest runs and reports both duplicates independently, as shown above), but it makes failures harder to pinpoint from CI output or the reporter alone — a developer has to open the file and correlate by row order.
**Fix:** Interpolate `reason` (or both `field` and `reason`) into the title, e.g.:
```ts
])("rejects $field ($reason) validation failures", async ({ params, error, field, reason }) => {
```

---

_Reviewed: 2026-09-19T22:19:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
