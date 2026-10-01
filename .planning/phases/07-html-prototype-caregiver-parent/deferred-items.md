# Deferred issues

- 07-07: Full suite: 134 passed, 1 failed (`tests/realtime.subscribe.test.ts` INSERT delivery timed out), 1 existing skipped test. Parent scoped tests 10/10, typecheck, lint, and Webpack production builds pass. This is the already recorded Realtime flake; no backend changes made.

- 07-01: `npm test` reproduced the pre-existing concurrent Realtime delivery flake in `tests/realtime.subscribe.test.ts` and `tests/realtime.risk-scores.test.ts` (null rows after timeout). The same two files passed all four tests with `--maxWorkers=1`. No backend files were modified. Full-suite outcome: 95 passed, 2 failed, 1 skipped. Recorded in WINDOWS.md.
- 07-05: Network-enabled full suite: 120 passed, 2 Realtime INSERT-delivery timeouts, 1 existing skipped test. Serial rerun: 3 passed, risk_scores INSERT still timed out (1 failed). No backend changes made. All 44 scoped prototype/design-system tests, typecheck, scoped lint, and Webpack production build passed. Default Turbopack build was blocked by sandbox worker port binding, including its escalated retry; Webpack was the documented fallback.
