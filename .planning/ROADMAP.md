# Roadmap: SepCare Backend

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-09-20)
- 🚧 **v1.1 Frontend Rebuild + Design System + Hardware Integration** — Phases 5-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-09-20</summary>

- [x] Phase 1: Device Ingest & Live Readout (4/4 plans) — completed 2026-09-12
- [x] Phase 2: Automatic Risk Scoring & Status (3/3 plans) — completed 2026-09-19
- [x] Phase 3: Offline-Buffered Batch Sync (3/3 plans) — completed 2026-09-19
- [x] Phase 4: Historical Trends API (1/1 plan) — completed 2026-09-19

Full detail archived at [`.planning/milestones/v1.0-ROADMAP.md`](milestones/v1.0-ROADMAP.md).

</details>

### 🚧 v1.1 Frontend Rebuild + Design System + Hardware Integration (In Progress)

**Milestone Goal:** Ship a judge-ready demo — real armband data flowing through a redesigned, consistent caregiver-first (+ abstracted parent) dashboard, ported to Next.js and live on Vercel, in ~2 working days.

**Phase Numbering:**
- Integer phases (5, 6, 7...): Planned milestone work
- Decimal phases (5.1, 5.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 5: Repo Cleanup & Canonicalization** - Archive duplicate/off-topic material so only sepsis-relevant, non-duplicate content remains
- [ ] **Phase 6: Design System (Tailwind v4 Tokens)** - Build and validate a shared caregiver/parent token set before any full-screen build starts
- [ ] **Phase 7: HTML Prototype (Caregiver + Parent)** - Validate the full caregiver view and abstracted parent view against the shared design system
- [ ] **Phase 8: Backend Gap-Fill** - Close every data gap the prototype surfaced before the Next.js port begins
- [ ] **Phase 9: Hardware Integration** - Get the real ESP32-S3-Tiny armband live against the deployed pipeline, with a rehearsed demo fallback
- [ ] **Phase 10: Next.js Port + Deploy** - Port the validated prototype into Next.js, merge with the backend, deploy live, and re-validate hardware post-deploy

## Phase Details

### Phase 5: Repo Cleanup & Canonicalization
**Goal**: The repo has a single canonical source per concern; sepsis-relevant evidence is fully intact; no off-topic or duplicate material can confuse later phases
**Depends on**: Phase 4 (v1.0, complete)
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03
**Success Criteria** (what must be TRUE):
  1. The repo contains exactly one canonical frontend/design-prototype directory — superseded/competing trees (`frontend-design/` root loose files, `xo/`, `sepcare/`, duplicate `frontend-handoff/`) are archived, not deleted, with a pointer note explaining what moved and why
  2. All sepsis-relevant research and clinical evidence (`context/implementation-plans/neonatal-sepsis-armband.md`, `context/web-research/sepsis-vs-common-illness-differentiation.md`, competitor research, `context/sdg/sdg-3-details.md`, `context/research/*`) remains unchanged at its original path
  3. Non-sepsis, off-topic planning material (other SDG brainstorm: heatstroke, diarrheal dehydration) is archived out of the agent's working view, not deleted
**Plans**: TBD

### Phase 6: Design System (Tailwind v4 Tokens)
**Goal**: A validated Tailwind v4 token-based design system exists that can support both the caregiver and parent visual language, proven against real component states before any full screen gets built
**Depends on**: Phase 5
**Requirements**: DSYS-01, DSYS-02, DSYS-03
**Success Criteria** (what must be TRUE):
  1. An `@theme`-directive token set exists (no `tailwind.config.js`-style config) and compiles cleanly in a real `next build`, not just dev mode
  2. The color palette is visibly distinct from the students' original (no baby pink), informed by the Figma reference (Segue 3.0) and salvaged pieces of `frontend-design/design-system/`
  3. At least 3 sample HTML pages exercise real component states (e.g. Green/Amber/Red status, empty/loading, nested component variants) using only the token set, and this validation checkpoint is reviewed before full prototype work starts
  4. The same token set is demonstrably reused across sample pages representing both the caregiver and parent visual language — one shared source, not two
**Plans**: TBD
**UI hint**: yes

### Phase 7: HTML Prototype (Caregiver + Parent)
**Goal**: A validated static HTML prototype demonstrates the full caregiver view and the abstracted parent view sharing one design system, with real backend field names, ready to drive backend gap-fill and the Next.js port
**Depends on**: Phase 6
**Requirements**: CARE-01, CARE-02, CARE-03, CARE-04, CARE-05, CARE-06, PARENT-01, PARENT-02, PARENT-03, PARENT-04, PARENT-05
**Success Criteria** (what must be TRUE):
  1. The caregiver prototype shows a live vitals card, a prominent redundant-coded (color + icon + word) traffic-light status, a chronological risk-status timeline, and a vitals trend graph with a 1h/6h/24h time-range selector — all reachable from a persistent bottom nav that includes a Settings tab
  2. The caregiver prototype shows a device connection/last-synced indicator distinguishing "Live" / "Last synced Xm ago" / "Reconnecting" states, so stale data is never shown as current
  3. The parent home screen shows an abstracted infant-status summary, compact vitals, and simple care instructions, with no persistent bottom nav on the home screen itself
  4. Selecting "See All" on the parent home screen reveals a two-tab (Vitals/Stats) view giving the parent the same underlying data as the caregiver in abstracted presentation, with device/settings reached via a device icon rather than a nav tab — this exact flow finalized collaboratively during the phase's discuss-step
  5. A data-contract diff document lists every field/endpoint gap the prototype build surfaced against the current API
**Plans**: TBD
**UI hint**: yes

### Phase 8: Backend Gap-Fill
**Goal**: Every data gap the prototype surfaced is closed with a deliberate pass, not reactive patches, before the Next.js port begins
**Depends on**: Phase 7
**Requirements**: API-01, API-02
**Success Criteria** (what must be TRUE):
  1. `GET /api/readings/latest` returns the current/latest reading for the device without requiring a bounded time-range query
  2. Every other data gap identified in the Phase 7 data-contract diff has a corresponding backend fix, confirmed available before Next.js port work starts
**Plans**: TBD

### Phase 9: Hardware Integration
**Goal**: The real ESP32-S3-Tiny armband is proven live against the deployed pipeline, with a rehearsed fallback for demo-day risk
**Depends on**: Phase 8
**Requirements**: HW-01, HW-02
**Success Criteria** (what must be TRUE):
  1. The physical armband sends live data that flows through ingest → scoring → Realtime end-to-end against the deployed (not local) Vercel/Supabase pipeline
  2. A full cold-boot demo dry-run has been rehearsed under venue-like conditions, with a working fallback (recording/screenshots) ready if live data doesn't arrive during the judged slot
**Plans**: TBD

### Phase 10: Next.js Port + Deploy
**Goal**: The validated prototype is ported into the Next.js App Router app, merged with the existing backend, deployed live on Vercel, and hardware-validated against the live deployment — not the moving target it was built against
**Depends on**: Phase 9
**Requirements**: PORT-01, PORT-02, PORT-03, PORT-04, HW-03
**Success Criteria** (what must be TRUE):
  1. The caregiver and parent experiences exist as `app/caregiver/*` and `app/parent/*` route segments in the Next.js App Router
  2. Realtime subscriptions are owned by Client Components via a custom hook that reads through the anon-key client, never `supabaseAdmin`, matching the proven pattern in the existing test suite
  3. The merged frontend+backend app is deployed and reachable live on Vercel
  4. shadcn/ui, Radix, Recharts, and Motion are used for the ported UI and interactions rather than custom-built primitives
  5. The Phase 9 hardware validation checklist is re-run verbatim against the live post-deploy app and passes
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 5 → 6 → 7 → 8 → 9 → 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|-----------------|--------|-----------|
| 1. Device Ingest & Live Readout | v1.0 | 4/4 | Complete | 2026-09-12 |
| 2. Automatic Risk Scoring & Status | v1.0 | 3/3 | Complete | 2026-09-19 |
| 3. Offline-Buffered Batch Sync | v1.0 | 3/3 | Complete | 2026-09-19 |
| 4. Historical Trends API | v1.0 | 1/1 | Complete | 2026-09-19 |
| 5. Repo Cleanup & Canonicalization | v1.1 | 0/TBD | Not started | - |
| 6. Design System (Tailwind v4 Tokens) | v1.1 | 0/TBD | Not started | - |
| 7. HTML Prototype (Caregiver + Parent) | v1.1 | 0/TBD | Not started | - |
| 8. Backend Gap-Fill | v1.1 | 0/TBD | Not started | - |
| 9. Hardware Integration | v1.1 | 0/TBD | Not started | - |
| 10. Next.js Port + Deploy | v1.1 | 0/TBD | Not started | - |
