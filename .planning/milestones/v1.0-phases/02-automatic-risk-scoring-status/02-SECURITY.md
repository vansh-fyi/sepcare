---
phase: "02"
slug: "automatic-risk-scoring-status"
status: verified
threats_open: 0
asvs_level: 1
created: "2026-09-19"
---

# Phase 2 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| readings insert → compute.ts | The scoring call reads only already-validated, already-stored data; no new external/untrusted input crosses here | Internal vitals data |
| compute.ts → risk_scores write | Service-role only; no anon write path exists (D-21) | Computed risk status + breakdown |
| Local CLI → live Supabase project | `SUPABASE_DB_PASSWORD` crosses this boundary for `supabase db push` (Plan 02-01 Task 2) | DB admin credential |
| anon Realtime subscriber → risk_scores changefeed | Same RLS-filtered boundary as `readings`; both allow and deny paths exercised by tests | Risk status/breakdown (public-safe per-device) |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-02-01 | Elevation of Privilege | `risk_scores` anon RLS policy | low | mitigate | Policy scoped to `"deviceId" = 'nb-001'`, identical shape to `readings`' policy (D-21). Verified: `tests/realtime.risk-scores.test.ts` proves a non-nb-001 device's row is invisible to an anon subscriber (RLS boundary test passes). | closed |
| T-02-02 | Information Disclosure | `SUPABASE_DB_PASSWORD` used for `supabase db push` | high | mitigate | Read from shell environment only, same handling as Phase 1's T-1-03 — never written to a git-tracked file or echoed in verification output. Verified: `git log -p` over all Phase 2 commits shows no plaintext password in tracked content. | closed |
| T-02-SC | Tampering | npm/pip/cargo installs | n/a | accept | No new npm/pip/cargo dependency introduced this phase — Package Legitimacy Audit not applicable. | closed |
| T-02-03 | Denial of Service (self-inflicted) | `computeAndPersistRiskScore` call site in `route.ts` | high | mitigate | D-24's try/catch wraps the entire scoring call; a thrown error is logged via `console.error` and the request still returns 201. Verified: `src/app/api/ingest/route.ts` try/catch confirmed by inspection, AND `tests/risk.compute.test.ts`'s "failure isolation across requests" test forces a real upsert failure (FK violation) and proves it never corrupts a subsequent request. | closed |
| T-02-04 | Tampering | `risk_scores.breakdown` jsonb shape | low | mitigate | `compute.ts` is the sole writer of this column (service-role only, no anon write per D-21); `RiskBreakdown` TypeScript interface is the guardrail. Verified: migration SQL confirmed to have no anon insert/update policy on `risk_scores`. | closed |
| T-02-05 | Information Disclosure | Realtime subscription test using anon key | low | accept | Test-only code path, mirrors Phase 1's proven `realtime.subscribe.test.ts` pattern; the anon key is already a public-safe credential (`NEXT_PUBLIC_SUPABASE_ANON_KEY`), not a secret. | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on (high) count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-02-01 | T-02-SC | No new dependencies introduced this phase; audit trivially passes. | orchestrator (register_authored_at_plan_time) | 2026-09-19 |
| AR-02-02 | T-02-05 | Anon key is a public-safe credential by design (`NEXT_PUBLIC_*`), not a secret; RLS is the actual security boundary, already covered by T-02-01. | orchestrator (register_authored_at_plan_time) | 2026-09-19 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-19 | 6 | 6 | 0 | orchestrator (register_authored_at_plan_time: true, ASVS L1 — short-circuit per secure-phase.md §3; each mitigation independently re-verified against current code/tests rather than trusting PLAN.md claims alone) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-09-19
