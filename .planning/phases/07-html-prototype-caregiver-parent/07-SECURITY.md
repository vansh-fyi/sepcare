---
phase: "07"
slug: html-prototype-caregiver-parent
status: verified
threats_open: 0
asvs_level: 1
created: "2026-10-02"
---

# Phase 7 — Security

## Trust Boundaries

Prototype routes expose synthetic local fixtures to unauthenticated browsers. Rendered text crosses the JSX boundary; device identifiers cross the route boundary. Live Supabase access is outside this phase.

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation / evidence | Status |
|---|---|---|---|---|---|---|
| T-07-01 | Tampering | Rendered fixture text | low | mitigate | JSX escaping in connection-status, device-details, infant-status-section, risk-timeline and clinical cards; no dangerouslySetInnerHTML in prototype routes, patterns or fixtures | closed |
| T-07-02 | Information Disclosure | Unauthenticated caregiver/parent routes | medium | accept | AR-07-01; synthetic fixtures only | closed (accepted) |
| T-07-03 | Elevation of Privilege / Information Disclosure | Live/admin data access | high | mitigate | Zero @/lib/supabase imports under src/app/(prototype); inspected routes import presentation and local fixtures | closed |
| T-07-04 | Denial of Service | Connection timer lifecycle | low | mitigate | connection-status.tsx pairs interval creation with clearInterval cleanup | closed |
| T-07-05 | Information Disclosure | Device fleet and arbitrary identifiers | medium / low | mitigate | parent/device supplies exactly [DEVICE]; [deviceId] checks DEVICE.id before rendering and returns a generic error otherwise | closed |

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---|---|---|---|---|
| AR-07-01 | T-07-02 | Account/role authentication is deferred under ACC-V2-01; this phase uses synthetic data. Existing authorization is recorded in REQUIREMENTS.md and all eight PLAN threat models. This report records that decision, not a new waiver. | Existing project requirements and approved phase scope | 2026-10-02 (recorded) |

## Security Audit Trail

| Audit Date | Unique Threats | Closed | Open | Run By |
|---|---|---|---|---|
| 2026-10-02 | 5 (T-07-05 has two vectors) | 5 | 0 | gsd-security-auditor; report persisted by orchestrator |

Source inspection at ASVS level 1 verified the declared mitigations. No unregistered flags were identified. Summaries lack a formal Threat Flags section; their incidental security notes map to this register. This is not a penetration test or authentication sign-off for live clinical data.

## Sign-Off

- [x] All threats have a disposition.
- [x] Existing accepted risk recorded.
- [x] threats_open: 0.
- [x] status: verified.

**Approval:** verified 2026-10-02 against declared phase scope.
