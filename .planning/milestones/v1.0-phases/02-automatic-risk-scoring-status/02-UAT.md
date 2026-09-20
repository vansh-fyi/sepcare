---
status: complete
phase: 02-automatic-risk-scoring-status
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md]
started: 2026-09-19T06:23:56Z
updated: 2026-09-19T06:59:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Start it fresh (`npm run dev`). POST a single valid reading to /api/ingest with a fresh timestamp. The response is 201, and a matching risk_scores row exists for it immediately after.
result: pass

### 2. Risk-scoring failure isolation (RISK-03 backstop)
expected: |
  If computeAndPersistRiskScore throws for one reading (e.g. a transient Supabase error), the
  POST /api/ingest request still returns 201 (the reading itself was already stored) and the
  error is only logged server-side — it never surfaces to the device as a failure. A subsequent,
  normal POST for the same device is scored correctly, with no leftover state from the prior
  failure.
result: pass
source: automated
reason: "Was verification:backstop / human_judgment:true (code-inspection only) in 02-02-SUMMARY.md's coverage block. Closed with an executed test during this UAT session: tests/risk.compute.test.ts 'failure isolation across requests' forces a real failure (FK violation on the upsert) and proves a subsequent valid computation is unaffected. Committed 20fecb4."

### 3. risk_scores table (D1-D3, Plan 02-01)
expected: risk_scores table with reading_id-as-PK 1:1 FK-cascade to readings, status text+check, breakdown jsonb, RLS anon-read-only policy, and supabase_realtime publication membership, applied live. readings gains a composite (deviceId, timestamp) B-tree index. src/lib/supabase/types.ts regenerated with risk_scores types, npm run build passes with no type drift.
result: pass
source: automated
coverage_id: D1

### 4. readings composite index (D2, Plan 02-01)
expected: readings gains a composite (deviceId, timestamp) B-tree index.
result: pass
source: automated
coverage_id: D2

### 5. Regenerated Supabase types (D3, Plan 02-01)
expected: src/lib/supabase/types.ts regenerated from the live schema with risk_scores Row/Insert/Update types, and npm run build passes with no type drift.
result: pass
source: automated
coverage_id: D3

### 6. Temperature boundary D-13 (D1, Plan 02-02)
expected: Temperature feature flags abnormal at temp >= 38.0C and temp < 35.5C, but NOT at exactly 35.5C (D-13 asymmetric boundary).
result: pass
source: automated
coverage_id: D1

### 7. Causal window / no future-data leakage (D2, Plan 02-02)
expected: The window query never reads a readings row whose timestamp is after the target's own timestamp (D-26 causal window; prohibition P1).
result: pass
source: automated
coverage_id: D2

### 8. Breadth-gating status derivation (D3, Plan 02-02)
expected: Status is Green at 0-1 abnormal, Amber at exactly 2, Red only at all 3 (D-12), and this holds regardless of any single feature's severity (prohibition P2).
result: pass
source: automated
coverage_id: D3

### 9. HR-temperature proportionality band (D4, Plan 02-02)
expected: HR-temperature proportionality ratio is abnormal only outside the inclusive [6,14] bpm/C band; exactly 6 or 14 is normal.
result: pass
source: automated
coverage_id: D4

### 10. Cold-start baseline gating (D5, Plan 02-02)
expected: Before 1h of prior history (D-18), HR-temp-proportionality and activity-trend never register abnormal/trending; only the absolute temperature threshold can contribute during cold start, so status defaults Green (D-17).
result: pass
source: automated
coverage_id: D5

### 11. First-ever reading scored without error (D6, Plan 02-02)
expected: A device's very first-ever reading (empty prior history) is still scored without erroring — window returns exactly the target row, prior-history stats are empty, status resolves Green.
result: pass
source: automated
coverage_id: D6

### 12. 12h window inclusive boundary + tie-break ordering (D7, Plan 02-02)
expected: The rolling window is inclusive of a reading exactly 12h before the target (D-26's >= boundary) and ordered by timestamp then id, so same-timestamp readings process in a stable, deterministic order.
result: pass
source: automated
coverage_id: D7

### 13. Realtime delivery for risk_scores INSERT (D1, Plan 02-03)
expected: An anon-key Realtime subscriber receives a risk_scores INSERT event the moment POST /api/ingest computes and persists a status for nb-001, with no polling.
result: pass
source: automated
coverage_id: D1

### 14. Realtime RLS cross-device boundary (D2, Plan 02-03)
expected: An anon-key Realtime subscriber does NOT receive a risk_scores event for a different device's reading (RLS boundary, mirrors Phase 1's T-1-02).
result: pass
source: automated
coverage_id: D2

### 15. risk_scores queryable by time range (D3, Plan 02-03)
expected: A risk_scores row is queryable filtered by its linked reading's timestamp range (STOR-02) — a bounded readings-to-risk_scores join returns exactly the expected rows, in timestamp order.
result: pass
source: automated
coverage_id: D3

## Summary

total: 15
passed: 15
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

<!-- none yet -->
