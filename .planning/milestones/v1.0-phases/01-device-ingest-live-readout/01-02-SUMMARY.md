---
phase: 01-device-ingest-live-readout
plan: 02
subsystem: infra
tags: [supabase, cli, postgres, migrations, seed, security]

requires:
  - phase: 01-device-ingest-live-readout (plan 01)
    provides: "supabaseAdmin service-role client, locally-authored devices/readings migration"
provides:
  - "Live Supabase project linked, migration pushed to the remote schema"
  - "Generated TypeScript Database types sourced from the live schema"
  - "Single v1 device (nb-001) seeded with a securely-generated API key"
affects: ["01-03", "01-04"]

actuals:
  tokens: 30000
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "supabase gen types typescript --linked as the source of truth for row types (never hand-typed)"
    - "Device credentials generated via crypto.randomBytes(32), printed once, never committed"

key-files:
  created:
    - src/lib/supabase/types.ts
    - scripts/seed-device.mjs
    - scripts/check-device-seeded.mjs
  modified:
    - .env.local (gitignored, not tracked)

key-decisions:
  - "devices table uses snake_case columns (device_id, api_key) per Plan 01's migration — seed/check scripts use snake_case keys, not the camelCase used for readings, since D-09's camelCase requirement applies only to the Realtime wire vocabulary (readings), not the service-role-only devices table."
  - "Task 1's link state (project ref, session) lives entirely in gitignored files (.env.local, supabase/.temp/) — committed as an empty marker commit since no git-tracked file changes from linking alone."

patterns-established:
  - "Device provisioning is a one-time manual/scripted operation (D-06), never a runtime code path — scripts/seed-device.mjs is the audit trail for how nb-001's key was generated."

requirements-completed: [DEV-01]

coverage:
  - id: D1
    description: "Plan 01's migration is applied to the live Supabase project"
    requirement: "DEV-01"
    verification:
      - kind: other
        ref: "supabase migration list --linked (Local/Remote columns both show 20260912172701)"
        status: pass
    human_judgment: false
  - id: D2
    description: "TypeScript Database types generated from the live schema, not hand-typed"
    requirement: "DEV-01"
    verification:
      - kind: other
        ref: "src/lib/supabase/types.ts contains devices/readings table types (grep confirmed)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Single v1 device (nb-001) seeded with a securely-generated 256-bit API key"
    requirement: "DEV-01"
    verification:
      - kind: other
        ref: "node scripts/check-device-seeded.mjs (prints 'nb-001', exit 0)"
        status: pass
    human_judgment: false
  - id: D4
    description: "No generated secret (device api_key, DB password, service-role key) ever committed to a git-tracked file"
    requirement: "DEV-01"
    verification:
      - kind: other
        ref: "git grep for the generated API key across tracked files returns no match; git status confirms .env.local untracked"
        status: pass
    human_judgment: false

duration: 19min
completed: 2026-09-12
status: complete
---

# Phase 01 Plan 02: Live Supabase Provisioning Summary

**Migration pushed to a live Supabase project, types generated from the real schema, and the v1 device seeded with a 256-bit random API key**

## Performance

- **Duration:** 19 min
- **Started:** 2026-09-12T23:02:00+05:30
- **Completed:** 2026-09-12T23:21:13+05:30
- **Tasks:** 2
- **Files modified:** 3 created (types.ts, seed-device.mjs, check-device-seeded.mjs), plus .env.local (gitignored)

## Accomplishments

- Linked the local Supabase CLI to the live `sepcare` project (ref `oiegbyrjipsjmnnihnjt`) and captured runtime keys into `.env.local`
- Pushed Plan 01's `devices`/`readings` migration to the live remote schema via `supabase db push` — confirmed applied via `supabase migration list --linked`
- Generated `src/lib/supabase/types.ts` directly from the live schema (`supabase gen types typescript --linked`)
- Seeded the single v1 device (`device_id = 'nb-001'`) with a `crypto.randomBytes(32)`-generated API key, printed once and appended to `.env.local`

## Task Commits

Each task was committed atomically:

1. **Task 1: Link the local Supabase CLI to the live project and capture runtime keys** - `a1cf822` (feat, empty commit — link state lives entirely in gitignored files)
2. **Task 2: [BLOCKING] Push schema, generate types, seed the v1 device** - `de58d93` (feat)

## Files Created/Modified

- `src/lib/supabase/types.ts` - generated `Database` row types for `devices`/`readings`
- `scripts/seed-device.mjs` - one-time seed script, generates and inserts the v1 device's API key
- `scripts/check-device-seeded.mjs` - verification script confirming the seeded device exists
- `.env.local` (gitignored, not tracked) - runtime secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DEVICE_API_KEY`

## Decisions Made

- Seed/check scripts use snake_case column names (`device_id`, `api_key`) matching the `devices` table's actual DDL from Plan 01 — only `readings` uses the D-09 camelCase convention, since that table alone crosses the Realtime wire boundary.
- Task 1 committed as an empty marker commit since linking a Supabase project produces no git-tracked file changes (link state is gitignored by design in `supabase/.temp/`).

## Deviations from Plan

None - plan executed exactly as written, aside from the snake_case/camelCase column-naming clarification noted above (which follows directly from Plan 01's already-committed migration, not a new decision).

## Issues Encountered

None. `supabase db push` succeeded on the first attempt — no fallback to the Dashboard SQL Editor was needed.

## User Setup Required

None further — the user already completed the required setup (creating the Supabase project, providing `SUPABASE_ACCESS_TOKEN` and the DB password) before this plan executed.

## Next Phase Readiness

- Live Supabase project has the full schema applied, RLS policies active, and Realtime publication enabled on `readings`
- The single v1 device (`nb-001`) is seeded and ready for Plan 03's `POST /api/ingest` route handler to authenticate against
- No blockers for Plan 03

---
*Phase: 01-device-ingest-live-readout*
*Completed: 2026-09-12*
