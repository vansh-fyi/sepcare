# Phase 2: Automatic Risk Scoring & Status - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-18
**Phase:** 2-Automatic Risk Scoring & Status
**Areas discussed:** Breadth-gating for v1's 3 features, Trend window & cold-start behavior, Risk score storage shape, Scoring trigger mechanism

---

## Breadth-gating for v1's 3 features

### Q1: What should trigger Red status with only 3 feature groups?

| Option | Description | Selected |
|--------|-------------|----------|
| All 3 abnormal+trending → Red | Mirrors doc's ≥half-of-groups spirit (3-of-6 → 3-of-3); keeps "isolated fever stays Amber" guarantee strongest | ✓ |
| 2 of 3 abnormal+trending → Red | Looser gate, closer to original ratio; risks the false-positive breadth-gating was designed to prevent | |
| Weighted score threshold, not a vote count | Numeric per-feature contribution summed to a score band | |

**User's choice:** All 3 abnormal+trending → Red

### Q2: What should Amber mean?

| Option | Description | Selected |
|--------|-------------|----------|
| Any 1 or 2 of 3 abnormal+trending | Clean 3-tier mapping: 0→Green, 1-2→Amber, 3→Red | |
| Only co-occurring pairs count for Amber; isolated single stays Green | Stricter — matches §7.1.1's spirit that isolated single-system perturbation is often "just a fever" | ✓ |

**User's choice:** Only co-occurring pairs count for Amber; a single isolated abnormal feature stays Green

### Q3: Does a feature count as abnormal on a single threshold-cross, or only once confirmed trending?

| Option | Description | Selected |
|--------|-------------|----------|
| Threshold-cross now, trend refines severity | Single reading crossing threshold immediately counts as abnormal for the gate; trend is a separate escalation lever | ✓ |
| Must persist/worsen across window to count as abnormal at all | Stricter, but means a device with only 1-2 readings can never show anything but Green | |

**User's choice:** Threshold-cross now, trend refines severity

### Q4: How should v1 simplify the activity/lethargy feature (no caregiver-interaction data)?

| Option | Description | Selected |
|--------|-------------|----------|
| Declining activityScore trend over the window | Trend-based check, drops comfort-response nuance entirely | ✓ |
| Low absolute activityScore vs. fixed threshold, no trend | Simplest, per-reading only, less true to doc's trend-based design | |

**User's choice:** Declining activityScore trend over the window

---

## Trend window & cold-start behavior

### Q1: What should the rolling window length be for detecting a worsening trend?

| Option | Description | Selected |
|--------|-------------|----------|
| 6 hours | Middle of doc's 4-12h range across features | |
| 2 hours | Tighter, more responsive, more prone to false trend signals | |
| 12 hours | Matches HRV feature's window from the original doc; smoothest signal | ✓ |

**User's choice:** 12 hours

### Q2: What per-baby baseline should HR-temp proportionality and activity trend compare against?

| Option | Description | Selected |
|--------|-------------|----------|
| Rolling personal baseline from device's own reading history | Matches §7.1.1's "vs. rolling personal baseline" language, needs no extra input | ✓ |
| Fixed newborn reference ranges (population norms), no per-device baseline | Simpler, no cold-start gap, less clinically faithful to §7.1.1 | |

**User's choice:** Rolling personal baseline from the device's own reading history

### Q3: What status should show before enough history exists to establish the baseline?

| Option | Description | Selected |
|--------|-------------|----------|
| Green by default until baseline established | Least-alarming default, matches §10's never-falsely-alarm framing | ✓ |
| Amber ("insufficient data") until baseline established | More honest but adds a state the dashboard wasn't spec'd for | |

**User's choice:** Green by default until baseline is established

### Q4: How much history is "enough" to establish the rolling personal baseline?

| Option | Description | Selected |
|--------|-------------|----------|
| First 1 hour of readings | Short enough to be useful quickly, long enough to smooth a noisy reading | ✓ |
| First 6 readings regardless of elapsed time | Count-based instead of time-based | |
| Full window length (12h, matching trend window) | Simplest mental model — baseline = trend window | |

**User's choice:** First 1 hour of readings

---

## Risk score storage shape

### Q1: What should the storage shape be for risk scores?

| Option | Description | Selected |
|--------|-------------|----------|
| New `risk_scores` table, 1:1 linked to readings by FK | Keeps readings pure raw-vitals-in, clean join target for Phase 4 | ✓ |
| Add status columns directly onto readings table | Fewer joins, but conflates device-reported data with computed data | |

**User's choice:** New `risk_scores` table, 1:1 linked to readings by FK

### Q2: Should Realtime be extended to cover risk_scores too?

| Option | Description | Selected |
|--------|-------------|----------|
| Add risk_scores to the Realtime publication | Frontend gets live vitals + live status together, no second polling mechanism | ✓ |
| Don't wire Realtime for risk_scores this phase | Defer live status push to a later phase | |

**User's choice:** Add risk_scores to the Realtime publication too

### Q3: Should risk_scores get the same RLS treatment as readings (D-08)?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, identical RLS pattern to readings | Consistent auth model across tables | ✓ |
| Different policy — no RLS needed | Would require rethinking how frontend reads status at all | |

**User's choice:** Yes, identical RLS pattern to readings

### Q4: How much per-feature detail should be persisted in risk_scores?

| Option | Description | Selected |
|--------|-------------|----------|
| Full jsonb breakdown per feature | Explainable/debuggable, costs nothing extra at this data volume | ✓ |
| Just the final status, no breakdown | Simpler schema, undermines debugging and demo narrative | |

**User's choice:** Full jsonb breakdown per feature

---

## Scoring trigger mechanism

### Q1: Should POST /api/ingest compute the risk score synchronously in the same request?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — synchronous, same request | Simplest, no extra infra, matches RISK-03 directly | ✓ |
| Fire-and-forget async | Faster ingest response, adds Vercel function lifecycle complexity not needed at this scope | |

**User's choice:** Yes — synchronous, same request

### Q2: What should the ingest endpoint return if scoring fails after the reading was already inserted?

| Option | Description | Selected |
|--------|-------------|----------|
| Still 201, log server-side | Reading's job already succeeded; don't tie device retry behavior to scoring bugs | ✓ |
| 500, treat as full ingest failure | Ties two independent concerns together, risks retry storms | |

**User's choice:** Still 201 — log the scoring failure server-side

### Q3: Should risk-computation logic be a standalone importable function for Phase 3 reuse?

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone function from the start | Phase 3's batch sync imports the same logic, avoids drift | ✓ |
| Inline in route now, refactor during Phase 3 | Tighter Phase 2 scope, risks mid-Phase-3 refactor | |

**User's choice:** Standalone function from the start (e.g. `src/lib/risk/compute.ts`)

### Q4: Should the scoring window be relative to the target reading's own timestamp, not insertion order?

| Option | Description | Selected |
|--------|-------------|----------|
| Window relative to target reading's timestamp | Timestamp-correct regardless of insertion order, required for Phase 3 | ✓ |
| Window based on N most-recently-inserted rows | Simpler now, breaks the moment Phase 3 inserts out of order | |

**User's choice:** Window is always relative to the target reading's timestamp

---

## Claude's Discretion

None — all four discussed areas reached explicit user decisions across all questions.

## Deferred Ideas

- Full six-feature composite model (HRV, perfusion index, respiratory irregularity) — RISK-V2-01, v2 requirement.
- Trained ML model — RISK-V2-02, v2 requirement.
- Async/background risk computation — considered and rejected in favor of synchronous computation.
- Amber "insufficient data" cold-start status — considered and rejected in favor of Green-default.
