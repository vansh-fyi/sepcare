---
phase: "1"
slug: "device-ingest-live-readout"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-12"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (recommended — fast, ESM-native, no DOM/browser environment needed for a route-handler-only backend) |
| **Config file** | none yet — Wave 0 installs and configures |
| **Quick run command** | `vitest run <changed-test-file>` |
| **Full suite command** | `vitest run` |
| **Estimated runtime** | ~10-30 seconds (small integration suite against a live/test Supabase project) |

---

## Sampling Rate

- **After every task commit:** Run `vitest run` scoped to the file touched
- **After every plan wave:** Run full `vitest run` suite
- **Before `/gsd-verify-work`:** Full suite must be green, plus one manual end-to-end check (real or simulated ESP32 POST against the deployed Vercel URL, since D-07's Realtime read path is best confirmed with a live subscriber script)
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 0 | ING-01 | — | Valid POST with correct key + well-formed body returns success and the reading is persisted with all fields intact | integration | `vitest run tests/ingest.route.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | ING-02 | T-1-01 (API key auth) | POST with missing/invalid X-API-Key is rejected 401 before any row is inserted | integration | `vitest run tests/ingest.auth.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | STOR-01 | — | Inserted row has all fields intact (deviceId, timestamp, heartRate, spo2, temperature, activityScore) matching the POST body | integration | `vitest run tests/ingest.route.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | READ-01 | T-1-02 (RLS boundary) | Reading is fetchable as "the latest" for the device via Supabase Realtime subscription, RLS-restricted to the single device | integration/manual | `vitest run tests/realtime.subscribe.test.ts` (or documented manual Supabase Studio / supabase-js script check — no frontend consumer exists in this repo) | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | DEV-01 | T-1-01 (API key auth) | The one provisioned device's credentials work end-to-end; a different/fake device_id+key combination is rejected | integration | `vitest run tests/ingest.auth.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest` — no test framework installed yet (greenfield repo)
- [ ] `tests/ingest.route.test.ts` — covers ING-01, STOR-01
- [ ] `tests/ingest.auth.test.ts` — covers ING-02, DEV-01
- [ ] `tests/realtime.subscribe.test.ts` or a documented manual check script — covers READ-01
- [ ] A disposable/test Supabase setup strategy (second free-tier project for tests, or careful cleanup of test rows in the shared project) — explicit planning decision needed, no local Postgres/mocking layer discussed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Frontend receives the live reading via Realtime with correctly-cased field names | READ-01 | No frontend consumer exists in this repo (built separately on `main`); the only way to fully exercise the Realtime contract end-to-end is a live subscriber | Run a small `supabase-js` script (anon key) subscribing to `postgres_changes` on `readings`, POST a test reading via `/api/ingest`, confirm the received payload has camelCase keys (`heartRate`, not `heartrate`) and only fires for the seeded device |
| Supabase free-tier project has not auto-paused | READ-01, ING-01 | Ops/environment concern, not a code path | Before a demo or after a dormant period, check Supabase dashboard project status is "Active" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
