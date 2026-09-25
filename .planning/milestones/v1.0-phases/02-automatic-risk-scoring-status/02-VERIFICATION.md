---
phase: 02-automatic-risk-scoring-status
verified: 2026-09-19T12:05:00Z
status: passed
score: 6/6 must-haves verified
covered_files:
  - ".planning/REQUIREMENTS.md"
  - ".planning/phases/02-automatic-risk-scoring-status/02-01-PLAN.md"
  - ".planning/phases/02-automatic-risk-scoring-status/02-01-SUMMARY.md"
  - ".planning/phases/02-automatic-risk-scoring-status/02-02-PLAN.md"
  - ".planning/phases/02-automatic-risk-scoring-status/02-02-SUMMARY.md"
  - ".planning/phases/02-automatic-risk-scoring-status/02-03-PLAN.md"
  - ".planning/phases/02-automatic-risk-scoring-status/02-03-SUMMARY.md"
  - ".planning/phases/02-automatic-risk-scoring-status/02-REVIEW.md"
  - ".planning/phases/02-automatic-risk-scoring-status/02-SECURITY.md"
  - ".planning/phases/02-automatic-risk-scoring-status/02-UAT.md"
  - "src/app/api/ingest/route.ts"
  - "src/lib/risk/compute.ts"
  - "src/lib/risk/thresholds.ts"
  - "src/lib/supabase/types.ts"
  - "supabase/migrations/20260918102702_risk_scores.sql"
  - "tests/ingest.route.test.ts"
  - "tests/realtime.risk-scores.test.ts"
  - "tests/risk.compute.test.ts"
covered_digest: "v1:sha256:fcf2c37794aac98c7ab269b46e4e3103fa1b136f3691f008e3056ad27c9b6dd0"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 5/6
  gaps_closed:
    - "A risk-scoring failure for one reading does not block or corrupt scoring for the next reading (RISK-03, plan-tagged verification: backstop) — closed by an executed forced-failure test (commit 20fecb4)"
  gaps_remaining: []
  regressions: []
---

# Phase 2: Automatic Risk Scoring & Status Verification Report

**Phase Goal:** Every ingested reading is automatically scored for sepsis risk, producing a Green/Amber/Red status that's persisted and exposed via the same read API established in Phase 1.
**Verified:** 2026-09-19T12:05:00Z
**Status:** passed
**Re-verification:** Yes — refresh against current HEAD (commits `20fecb4` failure-isolation test, `0bc22a4` security review), after prior run's `human_needed` (5/6) with one remaining backstop-tagged item.

## Re-Verification Scope

The prior run (`2026-09-19T11:51:00Z`, `status: human_needed`, score 5/6) had closed the CR-01
pagination gap and left exactly one item routed to human verification: RISK-03's cross-request
failure-isolation truth (plan-tagged `verification: backstop`), previously proven only by code
inspection (`compute.ts` holds no module-level mutable state), not by an executed test.

Since that run, two commits landed:
- `20fecb4` — adds `tests/risk.compute.test.ts` "failure isolation across requests (RISK-03,
  D-24)", a forced-failure test.
- `0bc22a4` — adds `02-SECURITY.md`, a security threat register (6/6 closed).

This run independently re-inspects the new test (not trusting the commit message), re-derives
whether it genuinely proves the invariant, re-runs it standalone plus the full suite once, and
re-checks the full must-haves set against current HEAD.

### Independent re-inspection of the new failure-isolation test

`tests/risk.compute.test.ts:527-576` ("a forced failure for one target does not corrupt a
subsequent, valid computation"):

- **The forced failure is real, not mocked.** `bogusTarget.id = 999999999` is never inserted into
  `readings`. `risk_scores.reading_id` is declared `bigint primary key references
  public.readings(id) on delete cascade` (`supabase/migrations/20260918102702_risk_scores.sql`) —
  independently confirmed by direct read of the migration. Calling
  `computeAndPersistRiskScore(bogusTarget)` runs the full computation (window fetch on `nb-001`
  finds nothing in range, since `bogusTarget.timestamp` is `now + 300d`, isolating it from other
  fixture data) and then attempts `supabaseAdmin.from("risk_scores").upsert({ reading_id:
  999999999, ... })` — this upsert genuinely violates the FK constraint, so
  `computeAndPersistRiskScore` throws (`compute.ts:195`, `if (upsertError) throw upsertError`).
  The test asserts `await expect(computeAndPersistRiskScore(bogusTarget)).rejects.toBeTruthy()`
  — a real, executed failure, not a stubbed one.
- **No readings-table pollution.** Because the bogus target's `id` is fictional and the FK
  violation happens at the `risk_scores` upsert (not at a `readings` insert), no bogus row is
  ever written anywhere — there is nothing left over for the next call's window query to
  accidentally pick up, and no cleanup is needed for it (confirmed: `afterEach` only tracks the
  one legitimately-inserted reading).
- **The subsequent call is a real, independent request.** A genuine reading is inserted via
  `insertReading()` at `timestamp = now + 301d` (outside the bogus target's window by design, and
  isolated from other fixtures), then `computeAndPersistRiskScore(target)` is called and asserted
  to return `status: "green"` — correct for its inputs (HR 130, temp 36.9, no prior baseline, so
  breadth-gate stays at 0 abnormal features). The persisted `risk_scores` row is independently
  re-queried and asserted to match. This proves the failed call left no corrupting state (e.g. no
  stale closures, no shared mutable window/breakdown state) that could have leaked into or
  affected the second, independent computation.
- **Combined with the unconditional route-level catch.** `src/app/api/ingest/route.ts:87-95`
  wraps the scoring call in `try { await computeAndPersistRiskScore(...) } catch (scoringError) {
  console.error(...) }`, with the `return NextResponse.json({ status: "ok" }, { status: 201 })`
  statement unconditionally following the try/catch block (not inside either branch) — this is a
  deterministic synchronous control-flow guarantee, re-confirmed unchanged by direct read this
  run, that a scoring throw can never prevent the 201 response. Together with the newly-executed
  corruption-isolation proof, both halves of the truth ("does not block" and "does not corrupt")
  now have direct evidence rather than inspection-only claims for the harder, genuinely
  runtime-dependent half.

**Conclusion: this is a genuine, executed proof of RISK-03's failure-isolation invariant**, not a
coincidentally-passing or narrowly-scoped test. Independently re-run in isolation this run:

```
npx vitest run tests/risk.compute.test.ts -t "failure isolation across requests"
→ 1 passed | 22 skipped (23)
```

### Full-suite re-run (once, per Step 7b constraint)

```
npm test
→ Test Files  1 failed | 4 passed | 1 skipped (6)
→ Tests  1 failed | 34 passed | 1 skipped (36)
```

The single failure is `tests/realtime.subscribe.test.ts` ("delivers an nb-001 INSERT with
correctly-cased camelCase keys") — a Realtime-timing race (`expect(row).not.toBeNull()`), the
same pre-existing flake class already documented in the prior verification run, in a **Phase 1**
test this phase's commits never touch. Re-run in isolation immediately after:

```
npx vitest run tests/realtime.subscribe.test.ts
→ Test Files  1 passed (1)
→ Tests  2 passed (2)
```

Passes cleanly on isolated retry, confirming the flake, not a regression. `npx tsc --noEmit` also
re-run clean, no errors. `git status` confirms the working tree has no uncommitted changes to any
covered source/test file — HEAD is `0bc22a4`.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A risk score is computed automatically the moment a new reading is stored, with no manual trigger required (Roadmap SC1 / RISK-03) | ✓ VERIFIED | `src/app/api/ingest/route.ts:88` calls `await computeAndPersistRiskScore(insertedReading)` synchronously inside the POST handler. `tests/ingest.route.test.ts` "returns 201 and persists all fields exactly on a valid POST" asserts a `risk_scores` row exists immediately after. Unchanged this run. |
| 2 | The risk score derives Green/Amber/Red via breadth-gating; an isolated abnormal vital alone does not escalate to Red (Roadmap SC2 / RISK-02) | ✓ VERIFIED | `compute.ts:182-186` counts abnormal booleans (`>=3 -> red`, `===2 -> amber`, else `green`). Breadth-gate matrix and P2-prohibition tests re-run, pass. Unchanged this run. |
| 3 | Computed risk scores and status are persisted in Supabase, linked to their source reading, and queryable by time range (Roadmap SC3 / STOR-02) | ✓ VERIFIED | `risk_scores.reading_id bigint primary key references public.readings(id) on delete cascade` (migration, re-read this run). Time-range join test in `tests/risk.compute.test.ts` re-run, passes. |
| 4 | The read API returns the current risk status alongside the latest vitals reading (Roadmap SC4) | ✓ VERIFIED | `tests/realtime.risk-scores.test.ts` proves a live anon subscriber receives a `risk_scores` INSERT the moment a POST completes, and is RLS-blocked for a non-nb-001 device. Re-run this run as part of the full-suite pass (34 passed). |
| 5 | The rolling-window query used for baseline computation reliably includes all readings within the 12-hour causal window regardless of device sampling rate — no silent truncation (derived from RISK-01's composite-correctness requirement) | ✓ VERIFIED | `fetchWindow()` (`compute.ts:73-103`) pages via `.range()` in 1000-row chunks until a short page returns. The 1005-row regression test re-run standalone this run, passes. Closed in the prior verification run (CR-01), unchanged since. |
| 6 | A risk-scoring failure for one reading does not block or corrupt scoring for the next reading (RISK-03, plan-tagged `verification: backstop`) | ✓ VERIFIED | **Gap closed this run.** `tests/risk.compute.test.ts:537-576` forces a genuine FK-violation failure (bogus `reading_id`) and proves an immediately-following, independent `computeAndPersistRiskScore` call computes and persists correctly (`status: "green"`, re-queried and matched). Independently re-inspected (not trusted from commit message — see Re-Verification Scope above) and re-run standalone: 1 passed. Combined with `route.ts`'s unconditional post-try/catch `return` (deterministic control flow, re-confirmed by direct read), both the "does not block" and "does not corrupt" halves of the truth now have direct evidence. |

**Score:** 6/6 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260918102702_risk_scores.sql` | `risk_scores` table (reading_id-as-PK/FK-cascade), RLS, Realtime publication, `readings` composite index | ✓ VERIFIED | Unchanged since prior run; re-confirmed by direct read this run (FK constraint independently exercised by the new test). |
| `src/lib/supabase/types.ts` | Regenerated `risk_scores` Row/Insert/Update types | ✓ VERIFIED | Unchanged; `npx tsc --noEmit` passes clean this run. |
| `src/lib/risk/thresholds.ts` | Named D-referenced threshold/window constants | ✓ VERIFIED | Unchanged; not touched since prior run. |
| `src/lib/risk/compute.ts` | `computeAndPersistRiskScore(target)` + `TargetReading`/`RiskBreakdown` types, paginated window fetch | ✓ VERIFIED | Re-read in full this run (198 lines). No debt markers (`TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`) found. Not touched by this run's commits (20fecb4/0bc22a4), confirmed unchanged. |
| `src/app/api/ingest/route.ts` | Synchronous post-insert scoring call wrapped in try/catch | ✓ VERIFIED | Re-read in full this run; unconditional 201 return after try/catch re-confirmed. Not touched by this run's commits. |
| `tests/risk.compute.test.ts` | Automated coverage of RISK-01/RISK-02/RISK-03 boundary, precision, breadth-gating, pagination, and failure-isolation truths | ✓ VERIFIED | Extended with the new failure-isolation test (commit `20fecb4`). No debt markers. Full file re-run standalone this run, passes. |
| `tests/realtime.risk-scores.test.ts` | Automated proof of D-20/D-21 live-delivery + RLS-boundary wiring for `risk_scores` | ✓ VERIFIED | Unchanged; re-run this run as part of the full-suite pass, passes. |
| `02-SECURITY.md` | Per-phase threat register, all threats dispositioned | ✓ VERIFIED | New this run (commit `0bc22a4`). `threats_open: 0`, 6/6 threats closed, each with a concrete verification claim independently spot-checked (T-02-01 RLS policy, T-02-03 try/catch + new failure-isolation test) against current code. No debt markers. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/app/api/ingest/route.ts` | `src/lib/risk/compute.ts` | `await computeAndPersistRiskScore(insertedReading)` inside try/catch after the `readings` insert | ✓ WIRED | Unchanged; re-confirmed by direct read this run. |
| `src/lib/risk/compute.ts` | `risk_scores` table | `supabaseAdmin.from("risk_scores").upsert({ reading_id, deviceId, status, breakdown })` | ✓ WIRED | Unchanged; line 188-193. This upsert's FK enforcement is the exact mechanism the new failure-isolation test exercises. |
| `src/lib/risk/compute.ts` (`fetchWindow`) | `readings` table | `supabaseAdmin.from("readings").select(...).range(from, to)` looped until a short page | ✓ WIRED | Unchanged since prior run; exercised end-to-end by the passing 1005-row regression test. |
| `risk_scores` table (Plan 02-01, `supabase_realtime` publication) | anon Realtime subscriber | `postgres_changes` INSERT event, RLS-filtered | ✓ WIRED | Unchanged; re-run this run as part of the full suite, passes. |
| `readings.timestamp` | `risk_scores` (via `reading_id` FK) | PostgREST embedded-resource join | ✓ WIRED | Unchanged; re-run this run, passes. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|--------------|--------|----------|
| STOR-02 | 02-01, 02-02, 02-03 | Computed risk scores + Green/Amber/Red status persisted, linked to source reading, queryable by time range | ✓ SATISFIED | REQUIREMENTS.md marks `[x]` and "Complete" for Phase 2. Schema, upsert, time-range join, and window-integrity fix all verified. |
| RISK-01 | 02-02 | Composite score from temp thresholds, HR-temp proportionality, activity/lethargy trend | ✓ SATISFIED | Boundary/precision logic and the production-scale window-pagination correctness (CR-01) verified in the prior run, unchanged since. |
| RISK-02 | 02-02, 02-03 | Green/Amber/Red derived with breadth-gating (no single-signal escalation) | ✓ SATISFIED | D-12 count-based gate and P2 prohibition test pass, unchanged. |
| RISK-03 | 02-02 | Risk computation runs automatically, no manual trigger | ✓ SATISFIED | **Fully closed this run.** Both the "computes and persists automatically" half and the "one failure doesn't block/corrupt the next request" half now have direct, executed evidence — see truth #6 above. |

REQUIREMENTS.md's Traceability table maps exactly STOR-02, RISK-01, RISK-02, RISK-03 to "Phase 2
— Complete", matching all three plans' combined `requirements:` frontmatter
(`02-01: [STOR-02]`, `02-02: [RISK-01, RISK-02, RISK-03, STOR-02]`, `02-03: [RISK-02, STOR-02]`).
No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/risk/compute.ts` | ~169-173 | Activity-trend feature silently goes inert when baseline activity mean is <= 0 | ⚠️ Warning | Carried forward unchanged from prior run (WR-02 in `02-REVIEW.md`). Not a goal-backward blocker; D-12's breadth gate still requires 2+ features to escalate. |
| `src/app/api/ingest/route.ts` | 87-95 | Scoring failures logged via `console.error` only, no retry/dead-letter/alert path | ⚠️ Warning | Carried forward unchanged (WR-04 in `02-REVIEW.md`), intentional per D-23/D-24. Now backed by an executed test proving this design's core safety property (no cross-request corruption) actually holds. |
| `src/lib/validation/ingest-schema.ts` | 9-18 | No physiological bounds validation on ingest vitals | ⚠️ Warning | Carried forward unchanged, pre-existing from Phase 1 (WR-01 in `02-REVIEW.md`), out of this phase's declared scope. |

No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found in any file modified since the
prior verification run (`tests/risk.compute.test.ts`, `.planning/.../02-SECURITY.md`).

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| New failure-isolation test genuinely forces a real DB-level failure and proves isolation | `npx vitest run tests/risk.compute.test.ts -t "failure isolation across requests"` | 1 passed \| 22 skipped | ✓ PASS |
| Full workspace suite (once) | `npm test` | 34 passed, 1 failed (Realtime timing, pre-existing flake class, Phase-1-only test) | ⚠️ 1 flaky, isolated re-run below |
| Flaky Realtime test re-run in isolation | `npx vitest run tests/realtime.subscribe.test.ts` | 2 passed | ✓ PASS |
| TypeScript compiles clean | `npx tsc --noEmit` | No errors | ✓ PASS |
| Fix/tests/security doc are committed, not working-tree-only | `git status` | Clean working tree for all covered files (HEAD `0bc22a4`) | ✓ PASS |
| `risk_scores.reading_id` FK is real (test's forced-failure mechanism is genuine) | Direct read of `supabase/migrations/20260918102702_risk_scores.sql` | `reading_id bigint primary key references public.readings(id) on delete cascade` | ✓ PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` probes exist in this repository and none are declared in any Phase
2 PLAN/SUMMARY. Step 7c: SKIPPED (no probes declared or discovered).

### Human Verification Required

None. All must-haves have direct, executed evidence — no items remain routed to human
verification.

## Gaps Summary

**No gaps remain.** The single item carried forward from the prior verification run — RISK-03's
cross-request failure-isolation truth, previously tagged `PRESENT_BEHAVIOR_UNVERIFIED` and routed
to human verification because it was proven only by code inspection — is now closed by an
independently re-inspected, genuinely executed test (`tests/risk.compute.test.ts` "a forced
failure for one target does not corrupt a subsequent, valid computation", commit `20fecb4`). This
run confirmed the test forces a real database-level failure (an actual foreign-key constraint
violation on the `risk_scores.reading_id -> readings.id` reference, not a mock), and that the
immediately-following independent computation succeeds correctly with its result re-verified
against the persisted row. Combined with the route handler's already-verified unconditional
post-try/catch 201 response, both halves of the truth now have direct evidence.

The security review (`02-SECURITY.md`, commit `0bc22a4`) closes 6/6 threats, each independently
spot-checked this run against current code rather than trusted from its own claims.

All four of the ROADMAP's literal success criteria, the previously-closed production-scale
correctness gap (CR-01), and the previously-open failure-isolation backstop item are now all
genuinely wired, tested, and passing. Phase 2's goal — every ingested reading automatically scored
for sepsis risk, producing a persisted, queryable, API-exposed Green/Amber/Red status — is
achieved.

---

*Verified: 2026-09-19T12:05:00Z*
*Verifier: Claude (gsd-verifier)*
