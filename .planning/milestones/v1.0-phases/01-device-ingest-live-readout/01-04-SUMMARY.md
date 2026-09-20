---
phase: 01-device-ingest-live-readout
plan: 04
subsystem: infra
tags: [vercel, deployment, e2e, supabase, realtime]

requires:
  - phase: 01-device-ingest-live-readout (plan 03)
    provides: "POST /api/ingest route handler, tests/helpers/cleanup.ts"
provides:
  - "Live Vercel production deployment at https://sepcare.vercel.app"
  - "Deployed-environment end-to-end smoke test proving the full pipeline against the public URL"
affects: []

actuals:
  tokens: 34000
  tasks: 2
  commits: 2

tech-stack:
  added: [vercel-cli]
  patterns:
    - "Deployed-only tests use describe.skipIf(!process.env.DEPLOYED_URL) so they never run in the regular local suite"

key-files:
  created:
    - tests/e2e-deployed.test.ts
  modified:
    - .gitignore

key-decisions:
  - "Deployed to team scope vansh-grovers-projects-90c5b0f4 (user's choice among 3 available Vercel teams)."
  - "GitHub auto-connect during vercel link failed non-fatally — CLI-driven deployment (vercel --prod --yes) doesn't require a connected GitHub repo, so this was not blocking."

patterns-established:
  - "Production URL: https://sepcare.vercel.app (aliased from the per-deploy URL)"

requirements-completed: [ING-01, ING-02, STOR-01, READ-01, DEV-01]

coverage:
  - id: D1
    description: "Backend deployed to Vercel free tier with all four Supabase env vars wired for production and preview"
    requirement: "READ-01"
    verification:
      - kind: other
        ref: "vercel env ls production / preview (4/4 vars present in both); deployed GET /api/health returns 200 {status:'ok'}"
        status: pass
    human_judgment: false
  - id: D2
    description: "Full device POST -> auth -> validate -> store -> Realtime-read pipeline works against the real deployed URL"
    requirement: "ING-01, ING-02, STOR-01, READ-01, DEV-01"
    verification:
      - kind: e2e
        ref: "tests/e2e-deployed.test.ts (1 test, pass) — real HTTP POST to https://sepcare.vercel.app/api/ingest returns 201, anon Realtime subscriber receives the event with correct camelCase keys"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-09-12
status: complete
---

# Phase 01 Plan 04: Deployment + Deployed E2E Summary

**Backend deployed to Vercel production at sepcare.vercel.app — the full ingest-to-Realtime pipeline confirmed working against the real public URL, not just local dev**

## Performance

- **Duration:** 8 min
- **Started:** 2026-09-12T23:30:00+05:30
- **Completed:** 2026-09-12T23:36:32+05:30
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- Linked and deployed the Next.js backend to Vercel's free tier (team `vansh-grovers-projects-90c5b0f4`, project `sepcare`), production URL `https://sepcare.vercel.app`
- Wired all four Supabase runtime env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) to both production and preview scopes
- Confirmed the deployed `/api/health` returns 200 `{"status":"ok"}`
- Wrote and ran `tests/e2e-deployed.test.ts`: a real HTTP POST to the live deployed `/api/ingest` returns 201, and the anon Realtime subscriber receives the event with correctly-cased camelCase fields — proving the phase's full success criteria against production, not just local dev

## Task Commits

Each task was committed atomically:

1. **Task 1: Deploy to Vercel and wire the Supabase runtime env vars** - `336803f` (feat)
2. **Task 2: Deployed end-to-end smoke test against the production URL** - `91103fa` (feat)

## Files Created/Modified

- `tests/e2e-deployed.test.ts` - deployed-only smoke test (skips unless `DEPLOYED_URL` is set)
- `.gitignore` - Vercel CLI auto-appended `.env*` during linking (belt-and-suspenders on existing rules)

## Decisions Made

- Asked the user which of 3 available Vercel teams to deploy under; they chose `vansh-grovers-projects-90c5b0f4`.
- GitHub auto-connect failed during `vercel link` (non-fatal) — deployment proceeded via direct CLI push (`vercel --prod --yes`), which doesn't require a connected repo.

## Deviations from Plan

None - plan executed exactly as written. The GitHub-connect failure during linking was surfaced by the CLI itself as non-fatal and didn't require any deviation handling — deployment succeeded via the CLI-push path regardless.

## Issues Encountered

Vercel required an explicit `--scope` on first run since the account belongs to multiple teams (non-interactive mode has no default). Resolved by asking the user to pick a scope, then re-ran `vercel link --scope <chosen>`.

## User Setup Required

None further — Vercel CLI was already authenticated (`vansh-9278`) from a prior session; no new auth gate was hit.

## Next Phase Readiness

- Phase 1 is fully complete: a single vitals reading flows from a real device POST, through API-key authentication, into Supabase storage, and is fetchable via Realtime — proven end-to-end against both local dev (Plan 03) and the live production URL (this plan)
- All 5 phase requirements (ING-01, ING-02, STOR-01, READ-01, DEV-01) are now satisfied by at least one passing plan
- **Operational note (RESEARCH.md Pitfall 3):** Supabase free-tier projects auto-pause after 7 days of inactivity. Whoever owns the Supabase project should check its dashboard status before a demo if there's been a week-plus gap since the last ingest POST or Realtime subscription. Not blocking — no code change needed, just an ops reminder.
- Ready for Phase 2 (Automatic Risk Scoring & Status)

---
*Phase: 01-device-ingest-live-readout*
*Completed: 2026-09-12*
