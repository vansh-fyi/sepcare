# Phase 7: HTML Prototype (Caregiver + Parent) - Context

**Gathered:** 2026-09-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full caregiver view (persistent bottom nav: Home/Vitals/Stats/Settings) and the abstracted parent view (no persistent nav on home; "See All" → Vitals/Stats tabs; device icon → device management), sharing Phase 6's design system, wired to fixture data shaped exactly like the real backend's API response — not illustrative-only sample data. Produce a data-contract diff document listing every field/endpoint gap this surfaces. This phase does **not** wait for backend changes — closing the gaps it surfaces is Phase 8's job.

**Naming note:** despite the roadmap's current "HTML Prototype" phase title, this phase builds real Next.js routes (see D-01) — the title is a holdover from before D-11/this discussion resolved the format question. Recommend updating ROADMAP.md's Phase 7 title/wording to match when convenient (not blocking planning).

</domain>

<decisions>
## Implementation Decisions

### Prototype format (resolves Phase 6's D-11 flag, formally)
- **D-01:** Phase 7 is built as real Next.js routes/components in the existing app (e.g. `src/app/(prototype)/caregiver/*`, `src/app/(prototype)/parent/*` — exact route grouping is planner's call), directly importing and composing Phase 6's `src/components/ui/*` primitives and `src/components/patterns/*` compositions. There is **no separate static-HTML file tree** — the archived `frontend-design/` approach and the "port to Next.js in Phase 10" framing are both superseded. "Prototype" means wired to realistic static fixture data, not live Supabase/Realtime — not "built outside Next.js." — **Reversibility:** one-way — this changes what Phase 10 actually does (swap fixtures for live wiring, not a full markup port); reverting would mean re-doing Phase 7's screens as detached HTML after the fact.
- **D-02:** This also formally resolves Phase 6's 06-CONTEXT.md D-11 (which flagged this exact tension but left it unresolved) and supersedes ROADMAP.md's current "static HTML prototype" wording for Phase 7 and "port the validated prototype into Next.js" wording for Phase 10 — both should be read as "swap fixtures for live backend wiring," not a markup port, until ROADMAP.md text is updated.

### Parent navigation flow (resolves PARENT-05)
- **D-03:** Parent home screen's "See All" reveals a two-tab view: **Vitals** (the same six-summary abstracted vitals as the caregiver's Vitals tab) and **Stats** (trend cards with the time-scale selector, same as caregiver's Stats tab) — matches PARENT-03 and reuses the caregiver's own Vitals/Stats screens/components, just reached without a persistent bottom nav.
- **D-04:** The parent's device icon opens a **Select Device list → Device Details** flow (per the archived teammates' Flow 4: `archive/USER-FLOWS.md`), not a direct single Device Details screen. Since v1 has exactly one real device, the list shows that one real entry; how to visually distinguish it from future/placeholder entries (if any are shown at all) is Claude's discretion during planning — don't pretend multiple devices are live (per `archive/USER-FLOWS.md`'s own FR-15 note).
- **D-05:** The caregiver's **Settings tab reuses the same Device Details screen** as the parent's device-icon destination (name, battery %, connection state, sensor-contact-check, Connect/Disconnect) — one shared component/screen serving both entry points, not two separate device-management UIs.

### Six-signal data gap — real formulas, full UI, no compromise (locked, high-signal decision)
- **D-06:** The backend's real vitals fields are only `heartRate`, `spo2`, `temperature`, `activityScore` (`src/lib/validation/ingest-schema.ts`) plus a computed risk score. Of the six vital summaries Phase 6 built (Thermoregulation, Cardiac Autonomic, Perfusion Index, HR/Temp Ratio, Respiratory Pattern, Activity Level), only **3 can be genuinely computed from real fields using the research's actual formulas** (`context/implementation-plans/neonatal-sepsis-armband.md` §7.1.1): Thermoregulation (feature #1, from `temperature`), HR/Temp Ratio (feature #2, `ΔHR/ΔTemp` from `heartRate`+`temperature`), and Activity Level (feature #6, from `activityScore`). The other 3 (Cardiac Autonomic/HRV, Perfusion Index, Respiratory Pattern) need raw PPG RR-intervals, raw PPG amplitude ratio, and IMU periodicity data respectively — none of which the ESP32 firmware currently extracts or sends (confirmed: the sensors — MAX30102, MPU6050 — are physically capable per `hardware/SEPCARE-HARDWARE-SOT.md`, this is a firmware/data-pipeline scope gap, not a missing part; already flagged as `RISK-V2-01` in `PROJECT.md`).
- **D-07:** **User's explicit direction: do not drop or compromise on the six-signal UI.** Build fixture data shaped exactly like the real `GET /api/readings` response for the 3 real-formula signals (computed correctly per §7.1.1's actual math, not fabricated numbers), and render the other 3 signals with an explicit "not yet available — awaiting firmware/backend support" state in the UI (not fake numbers, not silently hidden). This gap becomes the **headline finding of the data-contract diff** (D-09) and is explicitly Phase 8's (backend) and Phase 9's (hardware/firmware) job to close — not negotiable away in Phase 7. — **Reversibility:** reversible — purely a rendering/fixture decision, easy to swap once real data exists.
- **D-08 [context, not a phase-7 task]:** User stated this project is no longer a hackathon/competition entry — it is being built as a serious product. This raises the bar on honesty in the UI (no fudged data, explicit gap states) over demo-friendly shortcuts. Downstream agents (researcher, planner, executor) should weight correctness/honesty over demo polish when the two conflict.

### Data-contract diff deliverable (resolves success criterion #5)
- **D-09:** The diff is a **dedicated markdown document** in this phase's directory (e.g. `07-DATA-CONTRACT-DIFF.md` — exact filename is planner's call, following the `{padded_phase}-*` convention). For each gap (HRV, Perfusion Index, Respiratory Pattern, `GET /api/readings/latest` per Phase 8's ROADMAP success criteria, and any other gap surfaced during building), record: what the frontend needs, what the backend currently returns/lacks, and which phase closes it (mostly Phase 8; hardware/firmware-dependent gaps explicitly flagged for Phase 9). This document is Phase 8's primary planning input.

### Claude's Discretion
- Exact Next.js route grouping/naming for the caregiver and parent prototype routes.
- Exact fixture-data file location/format, as long as its shape matches the real `GET /api/readings` response envelope.
- How to visually represent the Select Device list when only one device is real (D-04) — a single real entry, a single entry plus clearly-labeled placeholders, or something else; must not misrepresent unreal devices as live.
- Exact filename/structure of the data-contract diff document (D-09), as long as it's a dedicated markdown file covering the fields above.
- Exact copy/wording for the "awaiting firmware/backend support" state on the 3 ungrounded vital summaries (D-07).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — CARE-01..06, PARENT-01..05 (full requirement text); PARENT-05 explicitly deferred its exact flow to this discussion (resolved by D-03/D-04 above)
- `.planning/ROADMAP.md` §Phase 7 — success criteria (floor, not ceiling); §Phase 8/9/10 — downstream phases this phase's decisions reshape (D-01/D-02)
- `.planning/PROJECT.md` Key Decisions table — `RISK-V2-01` (HRV/perfusion/respiratory descoped to v2), ESP32 payload-shape decisions

### Design system (Phase 6 output — the shared source for both views)
- `src/components/ui/*` + matching `*.DESIGN.md` files — primitives to compose from, do not rebuild
- `src/components/patterns/clinical-cards.tsx`, `src/components/patterns/vital-detail-card.tsx`, `src/components/patterns/status-summary-cards.tsx` — clinical compositions (InfantStatusCard, VitalDetailCard, StatusCard, DeviceCard, etc.)
- `src/app/design-system/home-proof/` — the existing Home/Vitals/Stats/Settings composite proof page; the closest existing analog to what this phase formalizes into real routes
- `src/app/design-system/docs/examples/clinical-dashboard/page.tsx` — wraps `home-proof` for docs preview; a reference for what "Home, Vitals, Stats, Settings with sample readings" already looks like
- `src/lib/examples/clinical-scenarios.ts` — Safe/Caution/Critical fixture pattern Phase 6 established; Phase 7's real-formula fixtures should follow the same per-vital-state structure where applicable
- `AGENTS.md` (root) — Design System section: full component contract (Button, ToggleGroup, PulseWave, navigation, chart cards, etc.) and the "change the system, then consume it" workflow — applies to any page-level work in this phase

### Backend contract (what's real today)
- `src/lib/validation/ingest-schema.ts` — the actual, real field names: `deviceId`, `timestamp`, `heartRate`, `spo2`, `temperature`, `activityScore` (D-06's grounding)
- `src/app/api/readings/route.ts` — the real `GET /api/readings` response envelope/shape fixture data must match
- `src/lib/supabase/types.ts` — DB schema types

### Research (formulas for the six vital summaries)
- `context/implementation-plans/neonatal-sepsis-armband.md` §7.1.1 "Composite suspicion logic" — the six feature-group formulas (temperature direction, HR/temp proportionality, HRV composite, perfusion index trend, respiratory irregularity, activity/lethargy trend) and the ≥3-of-6 breadth-gating rule; §7.1.1's citation trail continues into:
- `context/web-research/sepsis-vs-common-illness-differentiation.md` — full research/citations backing §7.1.1's formulas
- `hardware/SEPCARE-HARDWARE-SOT.md` — confirms sensor capability (MAX30102, MPU6050, DS18B20) vs. current firmware output; grounds D-06's "firmware gap, not hardware gap" finding

### Legacy flow reference (superseded format, still useful for flow content)
- `archive/USER-FLOWS.md` — original teammates' Flow 1-4 (Everyday/Early Warning/Emergency/Device management); Flow 4 specifically backs D-04/D-05's device-management flow content (format is superseded by D-01, content is not)
- `archive/SCREEN-CONTENT.md` — exact copy referenced by `archive/USER-FLOWS.md`
- `context/frontend-handoff/PRD.md`, `context/frontend-handoff/OVERVIEW.md` — original product requirements from the teammates' handoff, still canonical for product intent

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/design-system/home-proof/` — existing Home/Vitals/Stats/Settings composite; Phase 7 formalizes this pattern into real routes with real-shaped fixture data (D-01)
- `src/components/ui/*` (Button, Card, Badge, ToggleGroup, NavBar, NavLink, Progress/BatteryIndicator, VitalsTrendChart, Sparkline, etc.) — full Phase 6 component set, ready to compose
- `src/components/patterns/*` — InfantStatusCard, VitalDetailCard, StatusCard, DeviceCard, DeviceHeader — the clinical compositions this phase's screens are built from, not re-implemented
- `src/lib/examples/clinical-scenarios.ts` and `src/lib/examples/vital-readings.ts` — existing sample-data patterns to extend into "real-shaped" fixtures (D-06/D-07)

### Established Patterns
- `src/components/ui/*.tsx` + `*.DESIGN.md` pairing — continue for any new primitive this phase needs (unlikely, but possible for a device-list-specific pattern per D-04)
- `src/app/design-system/*` route-per-concern pattern — this phase's routes are a new top-level area (e.g. `src/app/(prototype)/*` or similar), not nested under `design-system`

### Integration Points
- New prototype routes live outside `src/app/design-system/*` (which remains the docs/proof-page area) — exact grouping is planner's call (D-01 Claude's Discretion)
- Fixture data for the 3 real-formula signals must be computed with the actual §7.1.1 math against realistic `heartRate`/`temperature`/`activityScore` values, not hand-waved numbers
- `GET /api/readings` response shape (`src/app/api/readings/route.ts`) is the contract fixture data must mirror exactly, since Phase 10 later swaps fixtures for this same live endpoint

</code_context>

<specifics>
## Specific Ideas

- User: "We are scrapping the idea of using HTML. We are making it directly in [Next].js and testing it out and then updating backend into it." — direct instruction behind D-01/D-02.
- User: "we can't compromise or drop anything... We are not participating in any competition anymore and we are building this product very seriously." — direct instruction behind D-07/D-08; downstream agents should not quietly simplify the six-signal UI down to three for expedience.
- The six-feature research (§7.1.1) is explicitly a research-informed hypothesis, not clinically validated for this exact sensor combination (its own text says so) — this framing should carry into any UI copy/labels for the 3 real-formula signals, consistent with the existing design system's "sample data" labeling conventions (AGENTS.md: "Label examples as sample data").

</specifics>

<deferred>
## Deferred Ideas

- Actually closing the HRV/Perfusion Index/Respiratory Pattern data gap (firmware feature-extraction changes, backend schema additions) — explicitly Phase 8 (backend/schema) and Phase 9 (hardware/firmware) work, not this phase's.
- `GET /api/readings/latest` (no bounded time-range requirement) — already a named Phase 8 success criterion; Phase 7's data-contract diff should reference it, not attempt to build it.
- Updating ROADMAP.md's Phase 7/10 wording from "static HTML prototype"/"port to Next.js" to reflect D-01/D-02 — recommended as a quick follow-up edit, not a blocking part of this discussion.
- Richer caregiver-only Settings controls beyond device management (notification preferences, unit toggles) — user chose the reuse-only option (D-05); anything beyond Device Details for Settings is out of scope for this phase.

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 7-HTML Prototype (Caregiver + Parent)*
*Context gathered: 2026-09-30*
