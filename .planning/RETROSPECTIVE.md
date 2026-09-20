# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-09-20
**Phases:** 4 | **Plans:** 11 | **Tasks:** 21

### What Was Built
- Device ingest (`POST /api/ingest`) with API-key auth, deployed live to Vercel against a live Supabase project
- Automatic composite sepsis-risk scoring (temperature threshold, HR–temp proportionality, activity/lethargy trend) with breadth-gated Green/Amber/Red status, computed synchronously on every ingest
- Offline-buffered batch sync (`POST /api/ingest/batch`) preserving original device timestamps, with backfill rescoring of affected historical windows
- Historical trends read API (`GET /api/readings`) joining vitals + risk status over a caller-specified time range

### What Worked
- Building each phase's tracer task as production-quality (not throwaway) against the plan's exact algorithm spec paid off — Phase 2's breadth-gating/window logic needed zero changes during hardening.
- Reusing the same `computeAndPersistRiskScore` function for both the live-ingest and batch-sync paths (rather than duplicating scoring logic) kept Phase 3 correctness proofs cheap and meant the integration audit found zero scoring-logic divergence.
- Every phase deployed against a live Supabase project and, from Phase 1 onward, a live Vercel URL — catching real integration issues (RLS boundaries, Realtime timing) instead of deferring them to a "final integration phase" that never comes.

### What Was Inefficient
- Two phases (Phase 1 and Phase 4) needed a re-verification pass after their first verification surfaced a gap — a flaky Realtime test filter in Phase 1, and a `npm run build` TypeScript break introduced by a Phase 4 code-review follow-up that `npm test` alone didn't catch. Both were caught by phase-goal re-verification, not the original review/test pass.
- `npm run build`'s type-check is not run as part of the default code-review gate (`vitest` only) — this let one `it.each`-table param-type mismatch slip through review and only surfaced at verification.

### Patterns Established
- `npm test` alone is not a sufficient pre-verify gate for this project — `npm run build` must be re-run after any test-file edit that changes an `it.each` table's object shape (see PROJECT.md Key Decisions).
- Batch/sync endpoints that share scoring or storage logic with their live-path counterpart should reuse the exact same function, not a parallel implementation — this was the single biggest factor in Phase 3's clean cross-phase integration audit.

### Key Lessons
1. When a later phase modifies a file that an earlier phase's `VERIFICATION.md` already fingerprinted, the earlier phase's digest goes stale even though the current code is fully re-verified under the later phase's own report — this is expected under per-phase fingerprinting for shared files, not a regression. Cross-check with a milestone-level integration audit before treating "stale" as a real gap.
2. `GET /api/readings` shipping with no auth gate (protected only by a hardcoded single-device allow-list) was an acceptable v1 scope call, but should be an explicit, tracked decision at milestone close — not something that's only surfaced by an integration checker's WARNING.
3. Nyquist validation (`/gsd-validate-phase`) was never invoked across any of the 4 phases (`VALIDATION.md` stayed `status: draft` throughout). Whether to make it part of each phase's default gate — rather than an optional discovery-only check at milestone close — is worth deciding before v1.1.

### Cost Observations
- Sessions: 1 (this milestone's execution spanned Phases 1–4 across sessions dated 2026-09-12 through 2026-09-20)
- Notable: All 4 phases needed at least one re-verification round-trip; none needed a full re-plan.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 1 | 4 | First milestone — established the tracer-first, live-deploy-from-Phase-1 pattern |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 44 (1 skipped by design) | Not separately measured | — |

### Top Lessons (Verified Across Milestones)

1. Reuse shared logic (e.g. scoring functions) across live and batch/sync code paths rather than duplicating it — verified in v1.0's Phase 3 integration audit.
