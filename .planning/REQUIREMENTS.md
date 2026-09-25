# Requirements: SepCare Backend — v1.1

**Defined:** 2026-09-25
**Core Value:** Reliably turn a stream of vitals from a Waveshare ESP32-S3-Tiny wearable into an accurate, trustworthy sepsis risk signal (Green/Amber/Red) that reaches a caregiver in time to act — even through WiFi/power outages.

## v1.1 Requirements

Requirements for this milestone (judge-ready demo, ~2 dedicated days). Each maps to roadmap phases.

### Cleanup

- [ ] **CLEAN-01**: Non-sepsis, off-topic planning material (other SDG brainstorm: heatstroke, diarrheal dehydration) is archived out of the agent's working view, not deleted
- [ ] **CLEAN-02**: Duplicate directories (`frontend-handoff/` vs `context/frontend-handoff/`) and superseded/competing prototype trees (`frontend-design/` root loose files, `xo/`, `sepcare/`) are consolidated to a single canonical source or archived
- [ ] **CLEAN-03**: Sepsis-relevant research and clinical evidence (`context/implementation-plans/neonatal-sepsis-armband.md`, `context/web-research/sepsis-vs-common-illness-differentiation.md`, competitor research, `context/sdg/sdg-3-details.md`, `context/research/*`) remains fully intact and untouched — these are the judge-facing evidence base, not planning noise

### Design System

- [ ] **DSYS-01**: A Tailwind v4 token-based design system exists (`@theme` directive, no `tailwind.config.js`-style config), with a color palette distinct from the students' original (no baby pink), informed by the Figma reference (Segue 3.0) and salvaged pieces of the students' `frontend-design/design-system/`
- [ ] **DSYS-02**: The design system is validated with at least 3 sample HTML pages exercising real component states (e.g. Green/Amber/Red status, empty/loading, nested component variants) before the full prototype is built
- [ ] **DSYS-03**: The design system supports both the caregiver (full detail) and parent (abstracted) visual language from one shared token set

### Caregiver Dashboard

- [ ] **CARE-01**: Live vitals card (pulse, temperature, activity/perfusion) is visible on load, sourced from the existing Realtime feed
- [ ] **CARE-02**: Traffic-light (Green/Amber/Red) status is shown prominently, redundant-coded with color + icon + word (not color alone)
- [ ] **CARE-03**: A risk-status timeline shows chronological Green/Amber/Red history
- [ ] **CARE-04**: A vitals trend graph with a time-range selector (e.g. 1h/6h/24h) is sourced from the existing bounded `GET /api/readings` query
- [ ] **CARE-05**: A device connection/last-synced indicator distinguishes "Live" / "Last synced Xm ago" / "Reconnecting" states, so stale data is never shown as current
- [ ] **CARE-06**: Persistent bottom navigation exposes the caregiver's full view set, including a Settings tab

### Parent View

- [ ] **PARENT-01**: Parent home screen shows an abstracted infant-status summary, compact vitals, and simple care instructions — no persistent bottom nav on the home screen itself
- [ ] **PARENT-02**: Parent has full data parity with the caregiver view (same underlying vitals/risk/history data) reached via progressive disclosure ("See All"), not restricted data
- [ ] **PARENT-03**: Selecting "See All" reveals a two-tab navigation (Vitals / Stats) for the parent to browse the same detail the caregiver sees, in an abstracted presentation
- [ ] **PARENT-04**: Parent's device/settings equivalent is reached via a device icon on the home screen, not a nav tab
- [ ] **PARENT-05**: Exact parent navigation flow is finalized collaboratively during the HTML prototype discuss-phase, not fully locked here

### Backend Gap-Fill

- [ ] **API-01**: A "current/latest reading" endpoint (e.g. `GET /api/readings/latest`) exists so the dashboard doesn't need a bounded-range query just to show the live card
- [ ] **API-02**: Any other data gap surfaced by the prototype's build (tracked as an explicit data-contract diff) is filled before the Next.js port begins

### Hardware Integration

- [ ] **HW-01**: The real ESP32-S3-Tiny armband is wired into the deployed pipeline and confirmed sending live data through ingest → scoring → Realtime
- [ ] **HW-02**: A full cold-boot demo dry-run is rehearsed under venue-like conditions before the judged slot, with a fallback plan (recording/screenshots) if live data doesn't arrive
- [ ] **HW-03**: The hardware validation checklist is re-run verbatim after the Next.js port/redeploy, not just before it

### Next.js Port + Deploy

- [ ] **PORT-01**: The validated HTML prototype is ported into the Next.js App Router app as `app/caregiver/*` and `app/parent/*` route segments
- [ ] **PORT-02**: Supabase Realtime subscriptions are owned by Client Components via a custom hook, with reads going through the anon-key client (never `supabaseAdmin`) per the proven pattern in the existing test suite
- [ ] **PORT-03**: The ported frontend is merged with the existing backend and redeployed to Vercel
- [ ] **PORT-04**: Existing component/animation libraries (shadcn/ui, Radix, Recharts, Motion) are used in the port rather than custom-built primitives

## v1.1 Stretch (P2 — only if time remains)

- **STRETCH-01**: Threshold bands overlaid on the vitals trend graph, tied to the backend's actual risk-scoring thresholds
- **STRETCH-02**: Care-instruction copy varies by driving vital, not just by color
- **STRETCH-03**: Settings tab content beyond a placeholder (device info/rename, about)

## Out of Scope

Explicitly excluded for v1.1. Documented to prevent scope creep under the 2-day budget.

| Feature | Reason |
|---------|--------|
| Multi-device / multi-baby views | No backend data isolation yet (DEV-V2-01, deferred); single hardcoded `nb-001` device only |
| Historical data export (CSV/PDF) | No demo value, real build cost |
| Configurable alert thresholds | Would let a demo user invalidate the tuned risk model; no accounts to scope it to |
| Push/SMS alerting | Explicitly deferred (ALRT-V2-01); dashboard color display is the alert surface for this milestone |
| Caregiver/parent login, accounts, role-based access | Explicitly deferred (ACC-V2-01); role is chosen by navigation, not authentication |
| Smart/ML-driven alert filtering | Depends on the deferred 6-feature model and trained ML model (RISK-V2-01/02) |
| Real-time waveform/ECG-style plotting | ESP32 sends pre-computed per-interval vitals, not raw waveforms — no data exists to plot |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLEAN-01 | TBD | Pending |
| CLEAN-02 | TBD | Pending |
| CLEAN-03 | TBD | Pending |
| DSYS-01 | TBD | Pending |
| DSYS-02 | TBD | Pending |
| DSYS-03 | TBD | Pending |
| CARE-01 | TBD | Pending |
| CARE-02 | TBD | Pending |
| CARE-03 | TBD | Pending |
| CARE-04 | TBD | Pending |
| CARE-05 | TBD | Pending |
| CARE-06 | TBD | Pending |
| PARENT-01 | TBD | Pending |
| PARENT-02 | TBD | Pending |
| PARENT-03 | TBD | Pending |
| PARENT-04 | TBD | Pending |
| PARENT-05 | TBD | Pending |
| API-01 | TBD | Pending |
| API-02 | TBD | Pending |
| HW-01 | TBD | Pending |
| HW-02 | TBD | Pending |
| HW-03 | TBD | Pending |
| PORT-01 | TBD | Pending |
| PORT-02 | TBD | Pending |
| PORT-03 | TBD | Pending |
| PORT-04 | TBD | Pending |

**Coverage:**
- v1.1 requirements: 26 total
- Mapped to phases: 0 (pending roadmap creation)
- Unmapped: 26 ⚠️ (expected — roadmapper fills this in)

---
*Requirements defined: 2026-09-25*
*Last updated: 2026-09-25 after initial v1.1 definition*
