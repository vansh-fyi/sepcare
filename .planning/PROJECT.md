# SepCare Backend

## What This Is

SepCare is a low-cost wearable armband for newborns (0–28 days) that continuously monitors vitals — heart rate, HRV, temperature, activity, and perfusion — via a **Waveshare ESP32-S3-Tiny** device, and flags early signs of neonatal sepsis using a composite, multi-system risk-scoring model. It alerts caregivers or ASHA workers with a simple green/amber/red signal, no clinical interpretation required. This repo's `backend` branch is the cloud-side pipeline: it ingests periodic device summaries over WiFi, runs the sepsis-risk fusion logic, stores everything in Supabase, handles offline-buffered batch syncs after connectivity gaps, and exposes a read API for the dashboard (currently built by teammates as static HTML, to be ported to Next.js on `main` later).

## Core Value

Reliably turn a stream of vitals from a Waveshare ESP32-S3-Tiny wearable into an accurate, trustworthy sepsis risk signal (Green/Amber/Red) that reaches a caregiver in time to act — even through WiFi/power outages.

## Requirements

### Validated

- ✓ Device can POST a single vitals reading to a backend ingest endpoint — Phase 1
- ✓ Backend authenticates each device request via a static per-device API key — Phase 1
- ✓ Backend computes the composite sepsis-risk score and Green/Amber/Red status from incoming vitals, using a v1-scoped subset (temperature threshold, HR-temperature proportionality, activity/lethargy trend) of the breadth + trend logic in `context/implementation-plans/neonatal-sepsis-armband.md` (§7.1.1) — Phase 2
- ✓ Backend persists vitals, computed risk scores, and traffic-light status in Supabase (Postgres), risk scores queryable by time range through their linked reading — Phase 1 (vitals) + Phase 2 (risk scores/status)
- ✓ Device can POST a batch of buffered offline readings once connectivity returns, and they are stored with their original timestamps — Phase 3
- ✓ A read API (or Supabase realtime) exists for the frontend/dashboard to fetch current vitals, risk status, and history — live vitals + risk status via Realtime (Phase 1 + 2); bounded historical trend range query via `GET /api/readings` (Phase 4)
- ✓ System supports a single device/baby profile end-to-end (v1 demo scope) — device provisioning, ingest, scoring, offline batch sync, and historical trends all shipped — Phase 1–4

### Active

*(none — all v1 backend requirements validated; remaining work is the hardware build track and the Next.js frontend port on `main`)*

### Out of Scope

- Multi-device / multi-baby support — deferred; v1 is a single-device demo
- Raspberry Pi base station — superseded by direct ESP32-to-cloud architecture (ESP32 has native WiFi; no BLE bridge needed)
- On-device (ESP32) sepsis-risk computation — all fusion/trend logic runs in the cloud backend, not on the wearable
- Clinical-grade ML model trained on real sepsis cases — v1 uses the composite threshold/trend logic from the implementation plan; a trained model is future work
- Notifications/paging (SMS, push alerts to ASHA workers) — dashboard color display only for v1
- Caregiver/dashboard user accounts or auth — no user-facing auth in v1; only device-to-backend auth

## Context

- Origin: UN SDG 3 (Good Health & Well-being) team research, documented in `context/` — implementation plans, WHO IMCI danger-sign research, competitor analysis (BEMPU TempWatch, JivaScope, Cradle VSA, Neopenda neoGuard), and a detailed sepsis-vs-common-illness differentiation writeup (`context/web-research/sepsis-vs-common-illness-differentiation.md`).
- The original implementation plan (`context/implementation-plans/neonatal-sepsis-armband.md`) specified a two-tier nRF52840 armband + Raspberry Pi base station architecture over BLE. This has been superseded — the team is now building directly on ESP32 (WiFi-capable), eliminating the Pi bridge entirely.
- Frontend is being built in parallel by teammates as static HTML mockups, to be ported to a Next.js app on `main` later. This repo's `backend` branch is scoped purely to the backend/data pipeline; hardware build is a separate parallel track.
- Sepsis-risk logic is a research-informed composite across six feature groups (temperature direction, HR–temperature proportionality, HRV pattern, perfusion index trend, respiratory irregularity, activity/lethargy trend) with breadth-of-systems gating — score escalates only when ≥3 of 6 groups are simultaneously abnormal and trending together over a multi-hour window. Full detail in the implementation plan (§7.1.1) and the differentiation research doc.
- ESP32 firmware sends pre-computed vitals per interval (HR, SpO2/perfusion, temperature, activity score), not raw sensor waveforms — the device's PPG library already does on-chip beat detection, so the backend works from periodic summaries rather than 100Hz raw streams.
- Hardware prototype parts list (sensors, MCU, battery/charging, purchased links) is tracked in `hardware/parts-list.md`; the schematic/build contract is `hardware/SEPCARE-HARDWARE-SOT.md`.

## Constraints

- **Hosting**: Free-tier only — Vercel for the backend, Supabase for storage/DB/realtime. No paid infrastructure for this phase.
- **Tech stack**: Next.js (API routes / route handlers) for the backend service, TypeScript, Supabase (Postgres) for storage and realtime.
- **Device**: Waveshare ESP32-S3-Tiny (WiFi-capable) — replaces the original nRF52840 + BLE + Raspberry Pi design; the full-size ESP32-WROOM is not part of the build.
- **Hardware source of truth**: [`hardware/SEPCARE-HARDWARE-SOT.md`](../hardware/SEPCARE-HARDWARE-SOT.md) defines the electrical schematic, S3-Tiny GPIO map, sensor buses, safe power path, and bench-build order. [`hardware/parts-list.md`](../hardware/parts-list.md) is the BOM location.
- **Team structure**: parallel hardware-build and backend tracks; frontend built separately by other teammates and merged later.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Drop Raspberry Pi base station, go ESP32-S3-Tiny-direct-to-cloud | The S3-Tiny has native WiFi, removing the need for a BLE-to-cloud bridge device; simplifies hardware to a single worn unit | — Pending (hardware track) |
| Hardware prototype schema | S3-Tiny GPIO 6/7 shared I²C (MAX30102 + MPU6050), GPIO 4 DS18B20 1-Wire, GPIO 5 optional MAX30102 INT, GPIO 38 onboard RGB; 600mAh LiPo → TP4056 protection → switch → S3-Tiny 5V, whose onboard regulator supplies sensors at 3V3 | ✓ Documented — hardware/SEPCARE-HARDWARE-SOT.md |
| Sepsis-risk fusion logic runs in the backend, not on-device | ESP32 lacks the Pi's compute headroom; backend can run the full composite/trend logic in TypeScript with room to iterate | ✓ Validated — Phase 2's `computeAndPersistRiskScore` runs entirely in Next.js/TypeScript |
| Custom Next.js API backend instead of ESP32 → Supabase directly | The composite risk math (HRV entropy, breadth-gating, rolling multi-hour trends) is far easier to write and test as real code than as SQL/Edge Functions | ✓ Validated — Phase 2 shipped the composite scoring logic as tested TypeScript, not SQL/Edge Functions |
| Host backend on Vercel free tier, storage on Supabase free tier | No infrastructure budget — SDG/hackathon project | ✓ Validated — Phase 1 deployed to Vercel + Supabase free tiers; Phase 2 added schema/logic on the same stack with no upgrade needed |
| ESP32 sends pre-computed vitals per interval, not raw waveforms | Reduces payload size and backend complexity; on-chip PPG libraries already do beat detection | — Pending (hardware track) |
| Static per-device API key for device auth | Sufficient for a single-device v1 demo; full auth/accounts deferred | ✓ Validated — Phase 1 |
| v1's composite risk model rescales §7.1.1's 6-feature/≥3-of-6 breadth gate to 3 features (temperature, HR-temp proportionality, activity trend) at 3-of-3 for Red | HRV, perfusion index, and respiratory irregularity need sensor/data streams not yet available from the ESP32 payload (RISK-V2-01); the reduced feature set still needed a gating rule faithful to the "breadth over severity" clinical intent it was built to preserve | ✓ Validated — Phase 2, all boundary/breadth-gating/prohibition cases covered by passing tests |
| `risk_scores` as a separate table (reading_id as PK, FK-cascade to readings) rather than columns on `readings` | Keeps `readings` as pure raw-vitals-in; makes the 1:1 reading↔score relationship a schema-level guarantee; gives Phase 4's historical trend queries a clean join target | ✓ Validated — Phase 2, proven queryable by time range via PostgREST embedded join |
| Batch sync sorts and deduplicates in memory before one upsert, then rescans affected history | Preserves original chronology, avoids duplicate rows on retries, and recomputes scores whose 12-hour windows gain backfilled readings | ✓ Validated — Phase 3 |
| `GET /api/readings` allow-lists `nb-001` and returns a strict-validated, paginated, no-store JSON envelope with an optional embedded `risk_scores` join (`risk: null` when unscored) | Matches the existing device-scoping and safe-failure patterns from Phase 1/2/3; the embedded join gives one round trip instead of a second query per reading | ✓ Validated — Phase 4, 15 passing integration tests + production build |
| `makeRequest`'s test-helper query-param type widened to `Record<string, string \| undefined>` (filtering `undefined` before `.set()`) | A code-review follow-up fix (WR-01) added `it.each` rows that omit a key entirely, producing a union of object shapes `next build`'s `tsc` pass rejected against `Record<string, string>` — caught by phase-goal re-verification, not by `npm test` (which doesn't type-check) | ✓ Validated — Phase 4, `npm run build` green |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-19 after Phase 4*
