---
phase: "4"
slug: "historical-trends-api"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-19"
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.11, Node environment |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run tests/readings.route.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/readings.route.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** `npm test` and `npm run build` must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | READ-02 | T-04-01 | Reject arbitrary device IDs and malformed/broad ranges before service-role access; return safe errors | handler/integration | `npx vitest run tests/readings.route.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | READ-02 | T-04-02 | Return every ordered original reading with optional risk data and no stale cache response | integration | `npx vitest run tests/readings.route.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/readings.route.test.ts` — route-handler tests for READ-02, seven-day/three-day continuity, range failures, `risk: null`, `no-store`, and safe server errors.

*Existing Vitest infrastructure and Supabase cleanup helpers cover all other requirements.*

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
