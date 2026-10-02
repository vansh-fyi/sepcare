---
phase: 07-html-prototype-caregiver-parent
plan: 08
subsystem: documentation
tags: [data-contract, regression, prototype]
requires:
  - phase: 07-06
    provides: Caregiver routes
  - phase: 07-07
    provides: Parent routes
provides:
  - Source-grounded backend gap handoff
  - Full test and production build verification evidence
affects: [08-backend-gap-fill, 09-hardware-integration, 10-live-wiring]
tech-stack:
  added: []
  patterns: []
key-files:
  created: [.planning/phases/07-html-prototype-caregiver-parent/07-DATA-CONTRACT-DIFF.md]
  modified: []
key-decisions:
  - Device registry exists but does not expose display metadata or telemetry.
  - Default Turbopack build failure remains an unmet gate despite passing Webpack build.
requirements-completed: []
actuals:
  tokens: 1701
  tasks: 1
  commits: 1
plan_head_before: 21c0c8cc40c781e4693912e9e20686f3181a71f9
duration: 16h wall including quota and approval interruption
status: blocked
---

# Phase 7 Plan 8: Contract handoff and regression gate

**Source-verified six-vital, latest-reading, and device-telemetry gaps are documented; all 135 active tests pass, but the exact default production-build gate remains blocked by worker port permissions.**

## Accomplishments

- Created `07-DATA-CONTRACT-DIFF.md` with synthetic-data caveat, headline six-vital gap, API-01 latest endpoint, accurate device-registry distinction, closing phases, and additional connection-control and sync-clock gaps.
- No application code, dependency, tests, or backend schema changed.
- Task 1 committed as `73f16b9` (`docs(07-08): record verified frontend backend contract gaps`). Task 2 remains blocked; not marked complete.

## Verification

| Check | Result |
| --- | --- |
| Contract file exists and required table header appears | Pass; two `Frontend needs` headers |
| `npm test` | Exit 0; 24 files passed, 1 skipped; 135 tests passed, 1 skipped. `/tmp/07-08-tests.log` |
| `npm run build` | Exit 1; Turbopack PostCSS worker cannot bind a port (`Operation not permitted`). `/tmp/07-08-build.log` |
| Approved unsandboxed `npm run build` retry | Exit 1; same worker port-binding error. `/tmp/07-08-build-unsandboxed.log` |
| `npm run build -- --webpack` | Pass; production compilation, type checking and route generation completed. `/tmp/07-08-build-webpack.log` |
| Supabase-import guard under `src/app/(prototype)/` | Zero matching files |

Existing `tests/e2e-deployed.test.ts:66` skips without `DEPLOYED_URL`. No test was weakened or newly skipped. Earlier Realtime timeouts did not reproduce in this run, but a single passing run does not establish that their intermittent cause is fixed. No browser/visual verification is claimed.

## Deviations from Plan

1. **[Rule 1 — documentation correctness]** Corrected the plan's false implication that no devices table exists. Checked generated types show the registry contains `device_id`, `api_key`, and `created_at`; missing telemetry fields/endpoint are the actual gap. Documented that secrets must remain server-side.
2. **[Rule 3 — verification environment]** Used Webpack to supplement the blocked default build; this does not satisfy the plan's literal default-build acceptance. Approved unsandboxed retry also failed. No source workaround or package-script change was made to hide the failure.

## Known Stubs and Deferred Issues

No new runtime stubs introduced. The document describes intentional Phase 8/9/10 dependencies without presenting fabricated telemetry as real. WINDOWS entries 11 and 12 record the unresolved build gate and existing deployed smoke skip. The existing Realtime flake remains recorded in prior deferred entries.

## Continuation

Task 1 is complete. Resolve the Turbopack execution environment and rerun `npm run build`, or explicitly accept the Webpack build as a verification substitution. Then finish Task 2, update this summary and plan tracking. Do not advance phase completion from this blocked summary.

## Self-Check: PASSED

- Contract file exists; Task 1 commit `73f16b9` exists.
- Ledger base exists; measured one task commit before this metadata commit.
- No tracked files deleted by Task 1; sentinel and milestone lock preserved.
