# Feature Research

**Domain:** Neonatal vitals/sepsis-risk monitoring dashboard — dual audience (caregiver/nurse vs parent), real-time wearable data
**Researched:** 2026-09-25
**Confidence:** MEDIUM (web-sourced patterns, cross-corroborated across multiple independent sources; no single HIGH-confidence primary source — treat specifics as directional, not gospel)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any vitals-monitoring dashboard. Missing these makes the product feel incomplete or unsafe for a clinical-adjacent context.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Live vitals readout (HR, temp, SpO2/perfusion, activity) always visible on load | Clinical dashboards load vitals first — "no one can dig through tabs with a patient waiting in front of them" (aufaitux, fuselabcreative). NICU dashboards (neopenda) put HR/SpO2/temp/resp front-and-center. | LOW | Backend already exposes live vitals via Realtime — just needs a persistent "now" card, not a chart-first view. |
| Prominent traffic-light (Green/Amber/Red) status | RAG/traffic-light is the dominant pattern for at-a-glance severity across clinical and project dashboards alike (Wikipedia RAG, bernardmarr.com, mastt.com). Neopenda replaced audible NICU alarms with color-coded visual indicators as the *primary* alert mechanism. | LOW | Backend already computes Green/Amber/Red — this is a rendering/placement decision, not new logic. |
| Redundant coding beyond color alone (shape/icon/text label, not color-only) | Accessibility convention across RAG-status UIs: "letters R, A and G are used in addition to swatches of colour, so the system can be used by colour-blind readers"; shape differentiation (ball/triangle/diamond) is common (usabilitygeek.com, Wikipedia). | LOW | Directly actionable: pair color with an icon + word ("Green — Stable", not just a colored dot). |
| Vitals trend graph with time-range selection | "Graph controls allow users to select a time period of interest" is standard across clinical trend UIs (SigmaMD Vitals Trends view, Caregility). | MEDIUM | Backend's bounded `GET /api/readings` historical query (Phase 4) already supports this; frontend needs a range picker (e.g., 1h/6h/24h/all). |
| Threshold/normal-range bands on trend graphs | Clinical vitals charts shade the "normal range" as a band so a value's position relative to danger is visible without reading axis labels (VitalPatch/vitalconnect docs). | MEDIUM | Bands should reflect the same thresholds the backend risk-scoring logic uses, so the graph visually explains *why* a status changed. |
| Device connection / last-synced status indicator | Standard offline-state pattern: "an offline indicator... helps users identify some functionality may not be available," shown as a small icon with a text label, updated to a synced/checkmark state on reconnect (Google Design, web.dev, Android Wear guides). | LOW | Maps directly to backend's offline-buffered-batch-sync feature (Phase 3) — dashboard should show "Live" / "Last synced Xm ago" / "Reconnecting," not silently show stale data as if current. |
| Risk-status timeline/history (not just current state) | Trend/history views are standard alongside live values in every clinical monitoring pattern surveyed (SigmaMD, Caregility, neopenda's "Trends" screen). | MEDIUM | Backend already persists risk scores per reading — a simple chronological list/strip of past Green/Amber/Red periods satisfies this without new backend work. |
| Simplified, plain-language view for non-clinical family members | Explicit finding: "patient-facing views require 6th-to-8th-grade reading level and low-friction interaction... a screen that tries to serve two [audiences] usually serves neither" (Momentum healthcare UX). Owlet's consumer app leads with vitals but keeps interaction shallow; Nanit leads with summarized nightly scores, not raw charts. | MEDIUM | Validates the PROJECT.md plan directly: parent view must be a distinct, condensed screen, not the caregiver dashboard with fewer buttons. |

### Differentiators (Competitive Advantage)

Features that set this product apart from generic vitals apps or generic project dashboards. Not required for a working demo, but valuable where time allows.

| Feature | Value Proposition | Complexity | Notes |
|---------|--------------------|------------|-------|
| Care-instruction copy tied to current status (not just a color) | Consumer baby-vitals apps (Owlet) stop at "here's the number"; a plain-language "what to do now" line for the parent view is what separates a monitoring toy from a caregiving tool and is explicitly in PROJECT.md scope. | LOW–MEDIUM | Can be static copy keyed off Green/Amber/Red + which vitals are driving it — no ML needed for hackathon scope. |
| Unified design system shared across both audiences (same tokens, different density) | Momentum's research frames this as the hard part most teams skip — "built on the same data model consistently underinvest in how differently the two audiences need it presented." Nailing shared visual language while varying information density is a genuine differentiator versus two disconnected UIs. | MEDIUM | Matches PROJECT.md's Tailwind v4 token-system plan — this is the natural place for that investment to pay off visibly to judges. |
| "See All" compact-to-detailed drill pattern for parent view | Neopenda differentiates *doctor* (full trend analysis) vs *nurse* (streamlined, critical-only) via information architecture, not two separate products — same underlying pattern as caregiver-dashboard vs parent-"See All"-link. | LOW | Already scoped in PROJECT.md; research confirms it's the correct pattern (progressive disclosure), not a corner cut. |
| Threshold-band graph tied live to the actual risk-scoring logic | Most trend-graph examples show generic "normal range" shading; tying the shaded band to the *same* breadth-gated thresholds the backend uses for scoring (rather than generic vitals norms) is a differentiator — it makes the graph explain the score instead of just plotting numbers. | MEDIUM | Requires only exposing threshold constants already defined server-side (Phase 2 scoring logic) to the frontend. |

### Anti-Features (Commonly Requested, Often Problematic — especially at hackathon scope)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|----------------|------------------|-------------|
| Multi-patient / multi-baby grid view (like neopenda's 20-patient tablet layout) | "Real NICU monitors show a ward, not one baby" — feels more clinically credible | PROJECT.md explicitly scopes v1.1 to a single device/baby; backend has no multi-device isolation yet (deferred to DEV-V2-01). Building a patient-list UI for data that doesn't exist wastes the ~2-day budget on scaffolding with nothing to render. | Single hard-coded device/baby profile throughout; leave a `patientId`-shaped prop/route so multi-baby is a straightforward v2 extension, but build zero multi-patient UI now. |
| Historical data export (CSV/PDF reports) | Clinical dashboards often have "export for records" as a checkbox feature | No requirement in PROJECT.md; adds file-generation, formatting, and testing surface with zero demo value — judges see the live dashboard, not an exported file. | Skip entirely for v1.1; if judges ask "can this be exported," answer is roadmap, not demo. |
| Deep settings/configuration screens (custom threshold tuning, notification preferences, multi-user roles) | "Real apps have a settings page" instinct, and PROJECT.md's nav mentions a Settings tab | Configurable thresholds would let a demo user silently invalidate the sepsis-risk model's carefully-tuned breadth-gating logic; deep settings also has no backend support (no auth/accounts in v1 per PROJECT.md's explicit Out of Scope). | Settings tab exists in nav (matches the caregiver IA) but holds only non-critical, low-risk items: device info/rename, about/help, maybe display units — not threshold or alerting config. |
| Push/SMS notifications or alerting pipeline | Natural feature to want once you have a Red status — "shouldn't this page someone?" | PROJECT.md explicitly defers this (ALRT-V2-01); requires a notification service/queue with no free-tier path scoped and zero time to build reliably in 2 days. | Color display only, exactly as PROJECT.md states; the dashboard *is* the alert surface for the demo. |
| Caregiver/parent login & accounts, role-based access | "Dual audience" research keeps surfacing user-role differentiation, tempting a login-gated role switcher | PROJECT.md explicitly excludes dashboard auth for v1.1 (ACC-V2-01 deferred); building even a minimal auth flow eats meaningful hackathon time for a judge-facing demo with one device and one audience pair. | Two separate routes/views (`/caregiver`, `/parent` or similar) selected by navigation, not login — matches "abstracted parent view" language in PROJECT.md already. |
| Full alarm-fatigue-reduction ML / patient-specific smart alerts | Surfaced in research as a real clinical pattern ("ML can deliver smart clinical alerts... to reduce alarm fatigue") | Out of scope twice over — PROJECT.md defers both the 6-feature risk model and any trained ML model to v2 (RISK-V2-01/02); this is a multi-week research problem, not a UI feature. | Ship the existing 3-feature composite threshold/trend score as-is; no dashboard-side "smart" filtering. |
| Real-time waveform/ECG-style live plotting | NICU professional monitors show continuous waveforms; feels "more real" | ESP32 firmware sends pre-computed per-interval vitals, not raw waveforms (PROJECT.md: "device's PPG library already does on-chip beat detection... backend works from periodic summaries rather than 100Hz raw streams") — there is no waveform data to plot. | Sparkline/banded trend of the periodic summary values only; this is not a corner cut, it's literally the only data that exists. |

## Feature Dependencies

```
Live vitals readout (existing Realtime feed)
    └──requires──> Device connection/last-synced indicator
                       (readout must visibly distinguish "live" vs "stale after outage")

Risk-status timeline
    └──requires──> Bounded historical readings query (Phase 4, already shipped)

Vitals trend graph w/ time-range selector
    └──requires──> Bounded historical readings query (Phase 4, already shipped)
    └──enhances──> Threshold bands on trend graph
                       (bands need the same threshold constants the backend scoring logic uses)

Traffic-light status display
    └──requires──> Composite risk score + status (Phase 2, already shipped)

Parent "See All" compact view
    └──requires──> Caregiver full vitals/graph view
                       (condensed view reuses the same components/tokens at lower density,
                        not a separate build)

Care-instruction copy (differentiator)
    └──requires──> Traffic-light status display
                       (copy is keyed off current Green/Amber/Red + driving vital)

Shared design system/tokens
    └──enhances──> ALL of the above
                       (built once, consumed by both caregiver and parent views)
```

### Dependency Notes

- **Trend graph and risk timeline both require Phase 4's bounded historical query:** this already exists and is validated (15 passing integration tests per PROJECT.md), so this is a frontend-only build, not a backend blocker — good news for the 2-day budget.
- **Device connection indicator requires the live feed to distinguish "live" from "stale":** without this, an outage (which the backend already handles via offline-buffered batch sync, Phase 3) would silently render old data as current — a genuine safety-relevant gap for a sepsis-risk tool, not just polish.
- **Threshold bands enhance but don't require the trend graph:** ship the graph first with a simple line/area, add bands once the display works, since bands depend on exposing constants the backend already has server-side.
- **Parent view depends on (reuses) caregiver view, not the reverse:** build caregiver-full first, then derive the condensed parent view from the same components — this order matches PROJECT.md's stated build sequence and avoids building two independent UIs.
- **Care-instruction copy depends on status display existing first:** trivial to add once traffic-light rendering works; can be dropped entirely under time pressure without breaking anything else (it's presentation-layer only).

## MVP Definition

### Launch With (v1.1 — hackathon demo, ~2 days)

- [ ] Persistent bottom nav (caregiver): Live vitals / Risk & Timeline / Device / Settings — matches PROJECT.md's stated IA
- [ ] Live vitals card (pulse, temperature, activity/perfusion) sourced from existing Realtime feed — essential, this is the core value prop
- [ ] Traffic-light (Green/Amber/Red) status, color + icon + word, shown prominently on every caregiver screen — essential, non-negotiable per every source surveyed
- [ ] Risk-status timeline (chronological Green/Amber/Red history) — essential, demonstrates the "trend over time" story judges will care about
- [ ] Vitals trend graph with a basic time-range selector (e.g., 1h/6h/24h), sourced from existing bounded `GET /api/readings` — essential, table-stakes for any vitals dashboard
- [ ] Device connection/last-synced status — essential given the backend's offline-sync story is a headline feature; skipping this hides one of the project's best technical differentiators
- [ ] Parent view: home status summary + compact vitals ("See All" link, no inline graphs) + simple care instructions, no persistent nav — essential, explicitly the milestone's second deliverable
- [ ] Shared Tailwind v4 design system/tokens across both views — essential, this is what makes "one system, two audiences" read as intentional rather than inconsistent

### Add After Validation (v1.1 stretch, if time remains within the 2 days)

- [ ] Threshold bands overlaid on the trend graph — adds clarity but graph works without it
- [ ] Care-instruction copy variants per driving vital (not just per color) — nice narrative polish, low cost, easy to cut
- [ ] Settings tab content beyond a placeholder (device info/rename, about) — nav slot should exist, but depth can be minimal

### Future Consideration (v2+, explicitly out of scope now)

- [ ] Multi-device/multi-baby views — no backend isolation yet (DEV-V2-01)
- [ ] Historical export (CSV/PDF) — no demo value, real cost
- [ ] Configurable alert thresholds — would undermine the tuned risk model; no accounts to scope it to anyway
- [ ] Push/SMS alerting — explicitly deferred (ALRT-V2-01)
- [ ] Caregiver/parent login, accounts, role-based access — explicitly deferred (ACC-V2-01)
- [ ] Smart/ML-driven alert filtering — depends on the deferred 6-feature model and trained model (RISK-V2-01/02)
- [ ] Real-time waveform plotting — no raw waveform data exists on this architecture at all

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|----------------------|----------|
| Live vitals card | HIGH | LOW | P1 |
| Traffic-light status (redundant-coded) | HIGH | LOW | P1 |
| Risk-status timeline | HIGH | MEDIUM | P1 |
| Vitals trend graph + range selector | HIGH | MEDIUM | P1 |
| Device connection/last-synced indicator | HIGH | LOW | P1 |
| Parent condensed view + care instructions | HIGH | MEDIUM | P1 |
| Shared design token system | HIGH | MEDIUM | P1 |
| Threshold bands on graph | MEDIUM | MEDIUM | P2 |
| Status-driving-vital-aware care copy | MEDIUM | LOW | P2 |
| Settings tab depth | LOW | LOW | P2 |
| Multi-patient grid view | LOW (for this demo) | HIGH | P3 |
| Export / reporting | LOW | MEDIUM | P3 |
| Alerting/notifications pipeline | MEDIUM (but out of scope) | HIGH | P3 |
| Accounts/auth/role switching | LOW (for this demo) | HIGH | P3 |

**Priority key:**
- P1: Must have for the hackathon demo
- P2: Should have if the 2-day budget allows
- P3: Explicitly deferred to v2, do not build now

## Competitor / Reference Feature Analysis

| Feature | Neopenda (NICU, multi-patient) | Owlet (consumer, single infant) | Nanit (consumer, single infant) | SepCare's Approach |
|---------|-------------------------------|----------------------------------|-----------------------------------|---------------------|
| Primary alert mechanism | Color-coded visual, replacing audible alarms | Push notification + in-app color/number | Sleep score + nightly summary | Traffic-light color + icon + word, matches Neopenda's visual-first model but for a single baby |
| Vitals shown | HR, SpO2, temp, respiratory rate, per-patient tiles | HR, SpO2 front and center | Breathing motion (camera-derived), sleep-focused | HR, temp, activity/perfusion — matches backend's actual payload, not a superset |
| History/trends | Separate "Trends" modal, doctor-only depth | Basic history, secondary to live view | Nightly summary is the primary history view | Risk-status timeline + vitals trend graph, available to caregiver; condensed to "See All" link for parent |
| Audience differentiation | Doctor (full trend analysis) vs nurse (critical-only, streamlined) via IA | Single consumer audience | Single consumer audience | Caregiver (full detail, persistent nav) vs parent (condensed, no nav) — closer to Neopenda's doctor/nurse split than to either consumer app's single-audience design |
| Device status | "Locate Baby" + device management screen (multi-device) | Base station connection status on home screen | Camera connection status | Single-device connection/last-synced indicator, no locate/multi-device management needed |

## Sources

- [Healthcare Dashboard Design | UI UX Best Practices](https://www.aufaitux.com/blog/healthcare-dashboard-ui-ux-design-best-practices/) — MEDIUM/LOW confidence (web search, corroborated)
- [Healthcare Dashboard Design: Best Practices + Examples](https://fuselabcreative.com/healthcare-dashboard-design-best-practices/) — LOW confidence, corroborating
- [Development of an Interactive Dashboard to Analyse Physiological Signals in the NICU (PubMed)](https://pubmed.ncbi.nlm.nih.gov/38082857/) — MEDIUM confidence (peer-reviewed source, summary only accessed)
- [Neopenda NICU Dashboard Case Study — Michelle Wang](https://www.michellewang.design/neopenda) — MEDIUM confidence (design case study, directly relevant, PROJECT.md-named competitor), fetched in full
- [Traffic light rating system — Wikipedia](https://en.wikipedia.org/wiki/Traffic_light_rating_system) — MEDIUM confidence (reference source)
- [The Traffic Lights Of UX: Staying Smart With Color — Usability Geek](https://usabilitygeek.com/traffic-lights-ux-smart-color/) — LOW confidence, corroborating
- [Healthcare UX Design: Patient and Provider App Principles — Momentum](https://www.themomentum.ai/blog/healthcare-ux-design-principles-patient-provider-apps) — LOW/MEDIUM confidence, directly relevant to dual-audience question
- [Onboarding and Connecting Smart Devices — NN/g](https://www.nngroup.com/articles/smart-device-onboarding/) — MEDIUM confidence (Nielsen Norman Group, established UX authority)
- [10 UX design best practices for healthcare wearable app development — Star](https://star.global/posts/healthcare-ux-design-for-wearables/) — LOW confidence, corroborating
- [Disconnection indicators — Android Developers (Wear)](https://developer.android.com/design/ui/wear/guides/m2-5/behaviors-and-patterns/disconnect) — MEDIUM confidence (platform vendor documentation)
- [Offline UX design guidelines — web.dev (Google)](https://web.dev/articles/offline-ux-design-guidelines) — MEDIUM confidence (platform vendor documentation)
- [Using the Vitals Trends View — SigmaMD Clinician Help Center](https://clinician-help.sigmamd.com/article/559-using-the-vitals-trends-view) — LOW/MEDIUM confidence, product documentation for a real clinical vitals tool
- [Selecting a VitalPatch for Historical Data — VitalConnect docs](https://vitalconnect.com/docs/mkt180/revW/sec18_historical.html) — MEDIUM confidence (medical device vendor documentation, threshold-band pattern)
- Owlet/Nanit comparison coverage (Fathercraft, The Quality Edit, BabyRadar) — LOW confidence, consumer review sites, used only to confirm general IA patterns (live-vitals-first vs sleep-summary-first), not as authoritative

**Note on confidence:** All findings came through general web search (no docs/library-lookup providers applicable to this UX-pattern question), which this project's confidence classifier scores as LOW individually. Confidence is upgraded to MEDIUM overall where 3+ independent sources converged on the same pattern (traffic-light redundant coding, threshold-band shading, offline/connection indicators, dual-audience information-density split) — these are treated as reliable. Single-source claims (e.g., specific Neopenda screen names) are flagged LOW and should be treated as illustrative, not prescriptive.

---
*Feature research for: neonatal vitals/sepsis-risk monitoring dashboard, dual audience (caregiver + parent)*
*Researched: 2026-09-25*
