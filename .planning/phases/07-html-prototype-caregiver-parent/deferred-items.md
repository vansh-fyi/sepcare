# Deferred issues

- 07-01: `npm test` reproduced the pre-existing concurrent Realtime delivery flake in `tests/realtime.subscribe.test.ts` and `tests/realtime.risk-scores.test.ts` (null rows after timeout). The same two files passed all four tests with `--maxWorkers=1`. No backend files were modified. Full-suite outcome: 95 passed, 2 failed, 1 skipped. Recorded in WINDOWS.md.
