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
  modified: [package.json, docs/BUILD.md]
key-decisions:
  - Device registry exists but does not expose display metadata or telemetry.
  - Select the documented Webpack production builder; retain build:turbo for diagnosing the environment port failure.
requirements-completed: [CARE-01, CARE-02, CARE-04]
actuals:
  tokens: 2036
  tasks: 2
  commits: 3
plan_head_before: 21c0c8cc40c781e4693912e9e20686f3181a71f9
duration: 16h wall including quota and approval interruption
completed: 2026-10-02
status: complete
---

# Phase 7 Plan 8: Contract handoff and regression gate

**Source-verified six-vital, latest-reading, and device-telemetry gaps are documented; all 135 active tests and the production build pass using the supported Webpack builder.**

## Accomplishments

- Created `07-DATA-CONTRACT-DIFF.md` with synthetic-data caveat, headline six-vital gap, API-01 latest endpoint, accurate device-registry distinction, closing phases, and additional connection-control and sync-clock gaps.
- Selected `next build --webpack` as the production command, retained `build:turbo` for diagnosis, and documented both in `docs/BUILD.md`. No application code, dependency, tests, or backend schema changed.
- Task 1 committed as `73f16b9` (`docs(07-08): record verified frontend backend contract gaps`). Task 2 completed with `79a2462` (`fix(07-08): select supported webpack production builder`). Interim blocker evidence remains in `ae45a63`.

## Verification

| Check | Result |
| --- | --- |
| Contract file exists and required table header appears | Pass; two `Frontend needs` headers |
| `npm test` | Exit 0; 24 files passed, 1 skipped; 135 tests passed, 1 skipped. `/tmp/07-08-tests.log` |
| Original `npm run build` | Exit 1; Turbopack PostCSS worker cannot bind a port (`Operation not permitted`). `/tmp/07-08-build.log` |
| Approved unsandboxed `npm run build` retry | Exit 1; same worker port-binding error. `/tmp/07-08-build-unsandboxed.log` |
| `npm run build -- --webpack` | Pass; production compilation, type checking and route generation completed. `/tmp/07-08-build-webpack.log` |
| Final exact `npm run build` | Exit 0 after selecting Webpack; production compilation, type checking and route generation completed. `/tmp/07-08-build-final.log` |
| Supabase-import guard under `src/app/(prototype)/` | Zero matching files |

Existing `tests/e2e-deployed.test.ts:66` skips without `DEPLOYED_URL`. No test was weakened or newly skipped. Earlier Realtime timeouts did not reproduce in this run, but a single passing run does not establish that their intermittent cause is fixed. No browser/visual verification is claimed.

## Deviations from Plan

1. **[Rule 1 — documentation correctness]** Corrected the plan's false implication that no devices table exists. Checked generated types show the registry contains `device_id`, `api_key`, and `created_at`; missing telemetry fields/endpoint are the actual gap. Documented that secrets must remain server-side.
2. **[Rule 3 — verification environment]** The initial Webpack diagnostic did not satisfy the literal default-command gate, so this plan initially stopped as blocked. On continuation, selected the Next.js 16.3.5 documented `--webpack` production builder in `package.json`, retaining an explicit `build:turbo` diagnostic command. Added `docs/BUILD.md` explaining the environment limitation. Exact `npm run build` now passes without disabling compilation, TypeScript, or route generation. Commit: `79a2462`. Turbopack itself has not been repaired. The previous full-suite evidence remains applicable because this continuation changed only build scripts and documentation.

## Known Stubs and Deferred Issues

No new runtime stubs introduced. The document describes intentional Phase 8/9/10 dependencies without presenting fabricated telemetry as real. WINDOWS entry 11 is fixed by the passing supported production command; entries 3, 4, 7, 8, and 9 are fixed by the completed full-suite run. Entry 12 still records the existing deployed smoke skip. The existing Realtime flake remains recorded in entry 2; a passing run does not prove its intermittent cause fixed.

## Continuation

Both tasks are complete. All eight phase plans are implemented; phase review and verification gates remain pending. This summary does not mark the phase verified or complete.

## Self-Check: PASSED

- Contract and build documentation exist; task commits `73f16b9` and `79a2462` exist.
- Ledger base exists; measured three commits (including the interim blocked metadata commit) before this final metadata commit. Actual tokens use 8,141 diff characters / 4, rounded up, across the contract, package scripts, and build documentation.
- No tracked files deleted by either task; sentinel and milestone lock preserved.
