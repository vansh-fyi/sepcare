# Roadmap: SepCare Backend

## Overview

SepCare's backend ships as four sequential vertical slices, each a fully working device-to-read-API pipeline that gets richer with every phase. Phase 1 proves the wire end-to-end for one live reading — POST, authenticate, store, read back. Phase 2 turns that pipeline into the actual product by attaching automatic sepsis-risk scoring and Green/Amber/Red status to every stored reading. Phase 3 makes the pipeline resilient to the real-world WiFi/power gaps the device will hit in the field, accepting buffered batch syncs with correct historical timestamps. Phase 4 completes the v1 read surface with a historical trend endpoint so risk status can be reviewed over time, not just as a snapshot. By the end of Phase 4, every v1 requirement is delivered and the backend can support the single-device v1 demo end-to-end.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Device Ingest & Live Readout** - A single live reading flows from device POST through auth and storage to being fetchable via a read API
- [ ] **Phase 2: Automatic Risk Scoring & Status** - Every stored reading is automatically scored for sepsis risk and surfaced as Green/Amber/Red
- [ ] **Phase 3: Offline-Buffered Batch Sync** - Readings buffered during connectivity gaps arrive as a batch, stored with correct original timestamps, and risk-scored like any other reading
- [ ] **Phase 4: Historical Trends API** - Historical vitals and risk-status data over a time range is available via the read API

## Phase Details

### Phase 1: Device Ingest & Live Readout
**Goal**: A single vitals reading flows from a real device POST, through API-key authentication, into Supabase storage, and is fetchable via a read API — the full pipeline works end-to-end for one reading.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: ING-01, ING-02, STOR-01, READ-01, DEV-01
**Success Criteria** (what must be TRUE):
  1. Device can POST a single vitals reading (device ID, timestamp, HR, SpO2/perfusion, temperature, activity score) to the ingest endpoint and receive a success response
  2. Requests with a missing or invalid device API key are rejected before any data is stored
  3. Each submitted reading is persisted in Supabase with device ID, timestamp, and all reading fields intact
  4. A read API returns the latest stored vitals reading for the single provisioned device
**Plans**: TBD

### Phase 2: Automatic Risk Scoring & Status
**Goal**: Every ingested reading is automatically scored for sepsis risk, producing a Green/Amber/Red status that's persisted and exposed via the same read API established in Phase 1.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: RISK-01, RISK-02, RISK-03, STOR-02
**Success Criteria** (what must be TRUE):
  1. A risk score is computed automatically the moment a new reading is stored, with no manual trigger required
  2. The risk score derives a Green/Amber/Red status using breadth-gating — an isolated abnormal vital alone does not escalate the status to Red
  3. Computed risk scores and status are persisted in Supabase, linked to their source reading and queryable by time range
  4. The read API returns the current risk status alongside the latest vitals reading
**Plans**: TBD

### Phase 3: Offline-Buffered Batch Sync
**Goal**: Readings buffered by the device during connectivity gaps arrive later as a batch, are stored with their original timestamps, and are risk-scored like any other reading.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2
**Requirements**: ING-03
**Success Criteria** (what must be TRUE):
  1. Device can POST an array of buffered offline readings to a dedicated sync endpoint in a single request
  2. Each synced reading is stored using its original on-device timestamp, not the time of upload
  3. Risk computation runs on synced readings the same way it does on live readings, correctly reflecting their true chronological position
  4. Readings ingested via live POST and via batch sync are indistinguishable in storage and downstream queries — same schema, same risk logic applied
**Plans**: TBD

### Phase 4: Historical Trends API
**Goal**: Historical vitals and risk-status data over a caller-specified time range is available via the read API, completing the v1 read surface.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2
**Requirements**: READ-02
**Success Criteria** (what must be TRUE):
  1. The read API returns historical vitals and risk-status entries for a caller-specified time range
  2. Returned entries are ordered by original reading timestamp, correctly interleaving live and batch-synced data
  3. The response shape pairs vitals and risk status per reading, in order, sufficient to render a trend over time
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Device Ingest & Live Readout | 0/TBD | Not started | - |
| 2. Automatic Risk Scoring & Status | 0/TBD | Not started | - |
| 3. Offline-Buffered Batch Sync | 0/TBD | Not started | - |
| 4. Historical Trends API | 0/TBD | Not started | - |
