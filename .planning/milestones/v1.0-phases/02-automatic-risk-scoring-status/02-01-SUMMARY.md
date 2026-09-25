---
phase: 02-automatic-risk-scoring-status
plan: 01
subsystem: database
tags: [supabase, postgres, rls, realtime, typescript-codegen, migrations]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "devices/readings schema, RLS conventions, linked live Supabase project, proven supabase db push --password flow"
provides:
  - "risk_scores table (reading_id as 1:1 PK/FK-cascade to readings, status text+check, breakdown jsonb) live on Supabase"
  - "readings_deviceid_timestamp_idx composite index closing the rolling-window full-scan gap"
  - "regenerated src/lib/supabase/types.ts with risk_scores Row/Insert/Update types"
affects: [02-02-compute-engine, 02-03-realtime-range-query-proof]

actuals:
  tokens: 651
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "1:1 child table uses the parent's FK as its own primary key (no surrogate id) when the relationship is schema-guaranteed 1:1"
    - "Realtime publication membership is hand-written in migration SQL (not implicit) since Supabase does not auto-add new tables to supabase_realtime"

key-files:
  created:
    - supabase/migrations/20260918102702_risk_scores.sql
  modified:
    - src/lib/supabase/types.ts

key-decisions:
  - "risk_scores.reading_id is itself the primary key referencing readings.id ON DELETE CASCADE, guaranteeing a 1:1 reading<->score relationship at the schema level (D-19)"
  - "risk_scores RLS mirrors readings exactly: identical anon-read-only policy name and 'nb-001' literal scope (D-21), added to supabase_realtime (D-20)"
  - "Added readings_deviceid_timestamp_idx composite index proactively so every Phase 2 rolling-window query avoids a sequential scan (RESEARCH.md Pitfall 1)"

patterns-established:
  - "Schema Push Detection Gate: a plan's first task authors a migration, a second dedicated [BLOCKING] task pushes it live and regenerates types before downstream compute-logic plans start, so build/type checks can't false-positive against a stale local schema"

requirements-completed: [STOR-02]

coverage:
  - id: D1
    description: "risk_scores table with reading_id-as-PK 1:1 FK-cascade to readings, status text+check, breakdown jsonb, RLS anon-read-only policy, and supabase_realtime publication membership, applied live"
    requirement: "STOR-02"
    verification:
      - kind: other
        ref: "supabase migration list --linked (risk_scores migration shows Remote applied)"
        status: pass
      - kind: other
        ref: "grep -c 'on delete cascade' / 'alter publication supabase_realtime add table public.risk_scores' / 'readings_deviceid_timestamp_idx' supabase/migrations/*_risk_scores.sql (all 1)"
        status: pass
    human_judgment: false
  - id: D2
    description: "readings gains a composite (deviceId, timestamp) B-tree index"
    requirement: "STOR-02"
    verification:
      - kind: other
        ref: "grep -c 'readings_deviceid_timestamp_idx' supabase/migrations/*_risk_scores.sql"
        status: pass
    human_judgment: false
  - id: D3
    description: "src/lib/supabase/types.ts regenerated from the live schema with risk_scores Row/Insert/Update types, and npm run build passes with no type drift"
    requirement: "STOR-02"
    verification:
      - kind: other
        ref: "grep -c 'risk_scores' src/lib/supabase/types.ts (3)"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false

duration: 52min
completed: 2026-09-18
status: complete
---

# Phase 2 Plan 01: risk_scores Schema & Live Push Summary

**risk_scores table (reading_id-as-PK FK-cascade, status+check, breakdown jsonb, RLS, Realtime) plus readings composite index, pushed to live Supabase with regenerated types**

## Performance

- **Duration:** 52 min
- **Started:** 2026-09-18T10:27:00Z (approx., Task 1 authoring)
- **Completed:** 2026-09-18T11:19:31Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Authored `risk_scores` migration matching D-19 through D-22: `reading_id` as the primary key (FK-cascade to `readings.id`, no surrogate `id` column), RLS with the identical `"anon read-only single device"` policy shape as `readings`, and `supabase_realtime` publication membership
- Added `readings_deviceid_timestamp_idx` composite index on the existing `readings` table, closing RESEARCH.md's Pitfall 1 gap ahead of Plan 02-02/02-03's rolling-window queries
- Pushed the migration to the live, already-linked Supabase project via `supabase db push --password` and confirmed it as applied ("Remote") via `supabase migration list --linked`
- Regenerated `src/lib/supabase/types.ts` from the live schema, adding `risk_scores` Row/Insert/Update types; `npm run build` passes cleanly with the new types

## Task Commits

Each task was committed atomically:

1. **Task 1: Author the risk_scores migration** - `b3ea0ed` (feat)
2. **Task 2: [BLOCKING] Push schema to live Supabase and regenerate types** - `65a8637` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `supabase/migrations/20260918102702_risk_scores.sql` - New migration: risk_scores table, RLS policy, Realtime publication add, readings composite index
- `src/lib/supabase/types.ts` - Regenerated from live schema; adds risk_scores Row/Insert/Update types

## Decisions Made
- `risk_scores.reading_id` is the primary key itself (not a separate surrogate `id`), enforcing the reading<->score relationship as a schema-level 1:1 guarantee per D-19
- RLS policy on `risk_scores` reuses the exact policy name and `'nb-001'` literal scope from `readings` (D-21), keeping the security posture consistent and easy to audit
- The composite `readings_deviceid_timestamp_idx` index was added now (rather than deferred to Plan 02-02) since every rolling-window query planned for this phase depends on it, and RESEARCH.md flagged it as a known pitfall to close early

## Deviations from Plan

None - plan executed exactly as written.

## Authentication Gates

Task 2 is a `[BLOCKING]` task whose `<precondition>` requires `SUPABASE_DB_PASSWORD` to be set in the environment. At spawn time for this continuation, that precondition was unmet — the environment did not yet have the password exported. Per the executor's precondition protocol, execution paused and surfaced this as a `checkpoint:human-verify` (blocking-human) rather than attempting to proceed or guess the value. The orchestrator obtained the password from the user out-of-band (the same value used in Phase 1's 01-02-PLAN.md live-push flow) and passed it back into this session for export. Once exported, `supabase db push --password "$SUPABASE_DB_PASSWORD"` and `supabase gen types typescript --linked` both succeeded on the first attempt — no retry or SQL Editor fallback was needed. The password value was never written to a tracked file, echoed in command output, or included in any commit message; `git grep` over tracked content confirms it is absent from the repository.

## Issues Encountered
None - both `supabase db push` and `supabase gen types typescript --linked` succeeded on the first attempt once the password was available.

## User Setup Required

None - no new external service configuration required. This task reused the Supabase project link and DB password established in Phase 1 (01-02-PLAN.md).

## Next Phase Readiness
- Plan 02-02 (compute engine) and Plan 02-03 (Realtime/range-query proof) can now build against a live `risk_scores` table and its regenerated TypeScript types — the Schema Push Detection Gate for this phase is satisfied.
- No blockers or concerns carried forward.

---
*Phase: 02-automatic-risk-scoring-status*
*Completed: 2026-09-18*

## Self-Check: PASSED

- FOUND: supabase/migrations/20260918102702_risk_scores.sql
- FOUND: src/lib/supabase/types.ts
- FOUND: .planning/phases/02-automatic-risk-scoring-status/02-01-SUMMARY.md
- FOUND: commit b3ea0ed
- FOUND: commit 65a8637
