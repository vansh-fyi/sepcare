# Requirements: SepCare Backend

**Defined:** 2026-09-07
**Core Value:** Reliably turn a stream of vitals from an ESP32 wearable into an accurate, trustworthy sepsis risk signal (Green/Amber/Red) that reaches a caregiver in time to act — even through WiFi/power outages.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Ingest

- [x] **ING-01**: Device can POST a single vitals reading (device ID, timestamp, HR, SpO2/perfusion, temperature, activity score) to a backend ingest endpoint
- [x] **ING-02**: Backend authenticates each ingest request via a static per-device API key, rejecting requests with a missing/invalid key
- [ ] **ING-03**: Device can POST a batch (array) of buffered offline readings to a dedicated sync endpoint, and each reading is stored with its original device timestamp, not the upload time

### Storage

- [x] **STOR-01**: Vitals readings are persisted in Supabase (Postgres) with device ID, timestamp, and all reading fields
- [ ] **STOR-02**: Computed risk scores and Green/Amber/Red status are persisted alongside (or linked to) their source readings, queryable by time range

### Risk Computation

- [ ] **RISK-01**: Backend computes a sepsis-risk score from incoming readings using a simplified composite of temperature thresholds (fever/hypothermia), HR–temperature proportionality, and activity/lethargy trend
- [ ] **RISK-02**: Backend derives a Green/Amber/Red traffic-light status from the risk score, applying breadth-gating logic (escalation requires multiple concurrent abnormal signals, not a single isolated reading)
- [ ] **RISK-03**: Risk computation runs automatically as new readings (or batches) arrive, without requiring a manual trigger

### Read API

- [x] **READ-01**: A read API (or Supabase realtime subscription) exposes the latest vitals and current risk status for the frontend/dashboard to consume
- [ ] **READ-02**: A read API exposes historical vitals and risk-status trend over a given time range, for the frontend to render a trend view

### Device

- [x] **DEV-01**: System supports a single provisioned device/baby profile end-to-end for v1 (device ID + API key configured manually, no registration UI needed)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Risk Computation

- **RISK-V2-01**: Full six-feature composite risk model (add HRV pattern, perfusion index trend, respiratory irregularity to the v1 subset)
- **RISK-V2-02**: Trained ML model (e.g. gradient-boosted trees) as an alternative/complement to the threshold-and-trend composite logic

### Device

- **DEV-V2-01**: Multi-device / multi-baby support with per-device data isolation
- **DEV-V2-02**: Device registration/provisioning flow (instead of manual API key setup)

### Alerting

- **ALRT-V2-01**: Push/SMS notifications to caregivers or ASHA workers on Red status, beyond dashboard color display

### Access

- **ACC-V2-01**: Caregiver/dashboard user accounts and authentication

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Raspberry Pi base station | Superseded by direct ESP32-to-cloud architecture over WiFi |
| On-device (ESP32) sepsis-risk computation | ESP32 lacks compute headroom for the composite/trend logic; backend does the fusion instead |
| Clinical validation of the risk model on real sepsis cases | Requires IRB-approved clinical partnership; explicitly future work beyond this build |
| Any paid hosting/infrastructure | Free-tier constraint (Vercel + Supabase) for this phase |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ING-01 | Phase 1 | Complete |
| ING-02 | Phase 1 | Complete |
| ING-03 | Phase 3 | Pending |
| STOR-01 | Phase 1 | Complete |
| STOR-02 | Phase 2 | Pending |
| RISK-01 | Phase 2 | Pending |
| RISK-02 | Phase 2 | Pending |
| RISK-03 | Phase 2 | Pending |
| READ-01 | Phase 1 | Complete |
| READ-02 | Phase 4 | Pending |
| DEV-01 | Phase 1 | Complete |

**Coverage:**

- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-07*
*Last updated: 2026-09-07 after roadmap creation (4 phases, 100% coverage)*
