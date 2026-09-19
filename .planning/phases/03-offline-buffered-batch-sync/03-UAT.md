---
status: testing
phase: 03-offline-buffered-batch-sync
source: [03-VERIFICATION.md]
started: 2026-09-19T17:40:00Z
updated: 2026-09-19T17:40:00Z
---

## Current Test

number: 1
name: Batch scoring call order matches ascending-timestamp sort (D-29)
expected: |
  For a batch submitted with shuffled (non-chronological) timestamps, `computeAndPersistRiskScore`
  is invoked in strictly ascending-timestamp order, matching the code's explicit
  `.sort((a,b) => a.timestamp - b.timestamp)` step — not the original submission order.
awaiting: user response

## Tests

### 1. Batch scoring call order matches ascending-timestamp sort (D-29)
expected: Calls occur in ascending timestamp order, matching the code's explicit sort step. No existing test asserts call order directly (only final stored rows/risk_scores values are asserted) — this is a code-inspection-only claim per 03-02-SUMMARY.md's coverage id D4.
result: [pending]

### 2. Scoring order has no effect on final computed risk status (D-29 backstop)
expected: Submitting the same batch content processed in a different internal order (e.g. ascending vs. descending) produces byte-identical final `risk_scores` rows either way — since scoring only ever reads the full final DB state via `fetchWindow`, order shouldn't matter. This is declared a `verification: backstop` (non-inferable) truth in 03-02-PLAN.md with no dedicated test (03-02-SUMMARY.md coverage id D10).
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
