---
phase: 01-device-ingest-live-readout
plan: 01
subsystem: infra
tags: [nextjs, supabase, postgres, rls, realtime, zod, vitest, scaffolding]

requires: []
provides:
  - "Greenfield Next.js App Router + TypeScript project scaffold"
  - "supabaseAdmin service-role Supabase client (Pattern 2 isolation)"
  - "IngestSchema zod schema for the nested { deviceId, timestamp, vitals } payload"
  - "GET /api/health deployment smoke-check endpoint"
  - "Locally-authored (not yet pushed) Supabase migration: devices + readings tables, RLS, Realtime publication"
affects: ["01-02", "01-03", "01-04"]

actuals:
  tokens: 45000
  tasks: 2
  commits: 2

tech-stack:
  added: [next@16.3.5, react@19, "@supabase/supabase-js@2.116.0", zod@4.6.2, vitest]
  patterns:
    - "Service-role Supabase client isolated to a single module (src/lib/supabase/admin.ts), never imported client-side"
    - "Quoted camelCase Postgres columns to keep the Realtime wire payload byte-identical to the ingest JSON vocabulary"

key-files:
  created:
    - src/lib/supabase/admin.ts
    - src/lib/validation/ingest-schema.ts
    - src/app/api/health/route.ts
    - supabase/migrations/20260912172701_init.sql
    - supabase/config.toml
  modified:
    - package.json
    - .gitignore

key-decisions:
  - "Migration uses double-quoted camelCase identifiers (\"deviceId\", \"heartRate\", etc.) per D-09/Pitfall 1, so the Realtime broadcast payload matches the ingest wire vocabulary exactly with no translation layer."
  - "devices table has zero RLS policies (not even a restrictive one) — only the service-role client (which bypasses RLS) can ever read it, per D-04."
  - "'nb-001' is the single hardcoded device-id literal, defined once in the RLS policy here and reused verbatim by Plan 02's seed script — avoids the two-place drift RESEARCH.md's Open Question 1 flagged."
  - "'timestamp' column stored as bigint (raw epoch-ms) rather than timestamptz, matching D-02's wire format exactly and deferring range-query ergonomics to Phase 4."

patterns-established:
  - "Task commit convention: feat(01-01): <summary>, one commit per task"
  - "supabase/migrations/*_init.sql as the single source of schema truth for this phase — no db push happens until Plan 02"

requirements-completed: [STOR-01, DEV-01]

coverage:
  - id: D1
    description: "Next.js TypeScript project scaffolds and builds with the researched dependency set"
    requirement: "STOR-01"
    verification:
      - kind: other
        ref: "npm run build (exit 0, Next.js 16.3.5 Turbopack)"
        status: pass
    human_judgment: false
  - id: D2
    description: "supabaseAdmin service-role client and IngestSchema zod schema created matching D-01's nested payload shape"
    requirement: "STOR-01"
    verification:
      - kind: other
        ref: "acceptance_criteria manual grep/read verification during Task 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "Supabase migration authored: devices (RLS, no anon policy) + readings (camelCase RLS + Realtime publication)"
    requirement: "DEV-01"
    verification:
      - kind: other
        ref: "grep -c checks on supabase/migrations/20260912172701_init.sql (deviceId count=2, publication line=1, to anon=1)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Package legitimacy of next/@supabase/supabase-js/zod confirmed by a human before further work built on them"
    requirement: "DEV-01"
    verification: []
    human_judgment: true
    rationale: "Checkpoint gate=\"blocking-human\" requires an actual human to run npm ls and eyeball the resolved packages against their official repos — this is inherently a human-judgment step, not something a test can assert. The user performed this check and confirmed all three resolved correctly with no typosquats."

duration: 21min
completed: 2026-09-12
status: complete
---

# Phase 01 Plan 01: Scaffold + Migration Authoring Summary

**Next.js 16 App Router scaffold with a service-role Supabase client, nested-payload zod schema, and a quoted-camelCase devices/readings migration ready to push**

## Performance

- **Duration:** 21 min
- **Started:** 2026-09-12T22:36:00+05:30
- **Completed:** 2026-09-12T22:57:30+05:30
- **Tasks:** 2 (plus 1 human-verify checkpoint between them)
- **Files modified:** 8 created/modified across scaffold + migration

## Accomplishments

- Scaffolded a buildable Next.js 16.3.5 (App Router, TypeScript, Turbopack) project with the exact researched dependency versions
- Created `src/lib/supabase/admin.ts` (service-role client, isolated per Pattern 2) and `src/lib/validation/ingest-schema.ts` (zod `IngestSchema` for D-01's nested payload)
- Added `GET /api/health` as a deployment smoke-check endpoint for Plan 04
- Authored the full `devices`+`readings` Supabase migration with quoted camelCase columns, the anon read-only RLS policy scoped to `nb-001`, and Realtime publication on `readings` — not yet pushed to a live project

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js project, install dependencies, create core library modules** — `8a74af1` (feat)
2. **Task 2: Author the Supabase migration (devices, readings, RLS, Realtime publication)** — `4bace10` (feat)

## Files Created/Modified

- `src/lib/supabase/admin.ts` - service-role Supabase client, server-only
- `src/lib/validation/ingest-schema.ts` - zod `IngestSchema` matching D-01's nested shape
- `src/app/api/health/route.ts` - `GET` handler returning `{ status: 'ok' }`
- `supabase/config.toml` - Supabase CLI project config from `supabase init`
- `supabase/migrations/20260912172701_init.sql` - devices+readings DDL, RLS policies, Realtime publication
- `package.json` / `package-lock.json` - pinned dependency versions
- `.env.example` - documents the four runtime env var names (renamed from the plan's `.env.local.example` — see deviation below)
- `.gitignore` - excludes `.env*.local`; also ignores the orphaned inaccessible `.env.local.example`

## Decisions Made

- Quoted camelCase Postgres columns chosen over snake_case + translation layer (D-09/Pitfall 1) — accepted the SQL quoting-everywhere cost for a byte-identical wire contract
- `devices` table intentionally has zero RLS policies (not even a deny-all) since only the RLS-bypassing service-role client ever queries it
- `nb-001` hardcoded once in the RLS policy, to be reused verbatim by Plan 02's seed script

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Substituted `.env.example` for the plan-specified `.env.local.example`**
- **Found during:** Task 1
- **Issue:** The sandbox's secret-file guard blocks all tool access (Bash, Read, Write-via-mv) to any path matching `.env.local.example` — its allow-list only exempts `.env.example`/`.sample`/`.template`/`.dist` suffixes. The file could be written once but never staged, read back, renamed, or deleted afterward.
- **Fix:** Created an equivalent `.env.example` (same four placeholder-only env var names, no real secrets) and added the now-orphaned, inaccessible `.env.local.example` to `.gitignore` so it can never be accidentally staged.
- **Files modified:** `.env.example` (new), `.gitignore`
- **Verification:** `git status --short` shows no untracked files after commit; `.env.example` present and staged.
- **Committed in:** `8a74af1` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — sandbox path restriction, not a plan defect)
**Impact on plan:** Purely a filename substitution for an example/documentation file containing no secrets. No functional impact — `.env.local.example`'s content and purpose (documenting the four env var names) are fully preserved in `.env.example`.

## Issues Encountered

None beyond the deviation documented above.

## User Setup Required

None yet from this plan — Plan 02 will require the developer to create a live Supabase project and provide `SUPABASE_ACCESS_TOKEN`/`SUPABASE_DB_PASSWORD` before it can proceed.

## Next Phase Readiness

- Repo is a buildable Next.js TypeScript project with the service-role client, ingest schema, and health route in place
- Migration is authored and correct-by-construction, ready for Plan 02 to link a live Supabase project and push
- No blockers — Plan 02 can proceed once the developer provisions Supabase credentials

---
*Phase: 01-device-ingest-live-readout*
*Completed: 2026-09-12*
