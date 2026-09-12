# PRD: SepCare Mobile App

**Status:** Draft, derived from Figma "Segue 3.0" design round (page: UI-Screens-final-draft) + backend v1 scope.
**Audience:** Frontend team porting the design to Next.js on `main`.

## 1. Problem & Goal

A caregiver or ASHA worker wearing a newborn with a SepCare band needs to know, at a glance and without medical training, whether the baby is fine, needs watching, or needs urgent care — and if trained, needs the ability to see *why* the app is saying that. The app's job is to turn a stream of vitals + a computed risk score into: (a) an instantly-readable status for anyone, and (b) an inspectable clinical trail for anyone qualified to read it.

## 2. Personas

- **Primary caregiver** (parent, family member, or ASHA worker in a home/community setting) — no clinical training assumed. Needs the **Home** view: plain language, color, one clear action if something's wrong.
- **Clinical/trained user** (ASHA worker with training, nurse, PHC staff) — needs the **Clinical View**: named vital signals, current status per signal, and historical trend graphs to judge trajectory, not just a snapshot.

Both personas can be the same physical person at different moments — the app doesn't gate Clinical View behind a login/role in the current design (see Open Questions).

## 3. Scope (v1 — matches current Figma round)

### In scope
- Home dashboard with three risk states (Green/Amber/Red), each with distinct copy, vitals summary, and instructions
- Clinical View: six-signal vital breakdown with per-signal status text, for all three risk states
- Clinical View trend graphs: per-signal line chart, selectable time scale (2H/4H/6H/8H/10H/12H/24H)
- Device pairing/status flow: sensor contact check (pulse/temp/IMU each report Good/attention-needed), connect/disconnect
- Device list ("Select Device") showing multiple paired bands with battery/connection level

### Out of scope for v1 (design shows it, backend doesn't support it yet)
- Actually monitoring more than one device/baby simultaneously — backend v1 is single-device (see `.planning/REQUIREMENTS.md` DEV-01). Build the multi-device list UI if you want, but it should gracefully degrade to "one entry" against the real backend for now.
- Push/SMS alerting — Red status is communicated in-app only for v1, not as a phone notification
- User accounts / login — no auth flow appears in the current design; treat any user-specific data as scoped to "whoever has the app open," not a signed-in identity

## 4. Functional Requirements

### 4.1 Home Dashboard
- **FR-1**: Show the current risk state (Green/Amber/Red) as a full-bleed color treatment with a matching status card: an icon (check / clock / X), a short headline, and a one-sentence plain-language explanation.
- **FR-2**: Show three vitals summary cards — Pulse (BPM, numeric), Temp (°F, numeric), Activity (word state: e.g. "Healthy" / "Tremor" / "Alert" — not numeric). Each card's color reflects whether that individual vital is contributing to the current risk level.
- **FR-3**: Show a contextual instructions list that changes per risk state (see `SCREEN-CONTENT.md` for exact copy per state). Red state replaces the instructions list's first item with a full-width **Call Ambulance** action.
- **FR-4**: "See All" on the Vitals section navigates to Clinical View.
- **FR-5**: Header shows device name/ID, "Monitor Active" and "Wearable Connected" status chips, current date, and quick-access icons (clinical/chart view, device details) — confirm exact icon targets with design since labels aren't in the text layer (see Open Questions).

### 4.2 Emergency / Red State
- **FR-6**: The "Call Ambulance" button dials a configured **primary emergency contact** (per an annotation in the Figma file — not literally a public ambulance dispatch number). This needs a place to configure/store that contact — not present in any screen in this round. Flag to design/product before building.
- **FR-7**: Red state is visually maximally distinct (deep red full-bleed, all three vitals cards flip to red/alert) — this state should be unmissable even glanced at from across a room.

### 4.3 Clinical View
- **FR-8**: List six vital-signal categories — Thermoregulation, Cardiac Autonomic, Perfusion Index, HR/Temp Ratio, Respiratory Pattern, Activity Level — each with an icon and a one-line status string (e.g. "All systems stable", "Hypothermia trend. Dropping over 4h", "HRV pattern changes detected"). This maps directly to the backend's composite risk breakdown (`RISK-01`/`RISK-02` in requirements) — each signal's text should come from the backend, not be hardcoded per app-side risk level.
- **FR-9**: An overall Infant Status card at the top of Clinical View (headline + description) — same pattern as Home but using clinical framing ("All Systems Stable" / "Moderate Suspicion" / "High Suspicion") rather than caregiver framing ("Baby is Resting Safely" / "Keep a Close Eye on Baby" / "TAKE BABY TO HOSPITAL"). **Note the current design has one internal inconsistency**: on the "High Suspicion" clinical screen, the description text still reads "All stats on the infant are normal. Baby is healthy" — that's a leftover/placeholder bug in the mockup, not intended copy. Fix it when implementing: the description should match the risk level.
- **FR-10**: Tapping a vital category (or a bottom "Vitals"/"System" tab switch) leads to the trend view.
- **FR-11**: Trend view: time-scale selector (pill row: 2H/4H/6H/8H/10H/12H/24H) and one line-chart card per vital signal, each showing its own mini status ("Stable") plus a sparkline over the selected window.
- **FR-12**: A "System" tab exists alongside "Vitals" in the bottom nav on Clinical/trend screens — **content not present in this design round**. Likely device/system diagnostics (battery, sensor health, firmware). Needs its own design pass; don't invent content for it.

### 4.4 Device Management
- **FR-13**: Device Details screen: device image, name (editable — pencil icon), Device ID, battery/connection percentage bar, a three-part "Sensor Contact Check" (Pulse/Temp/IMU, each Good or presumably a warning state not shown in this round), a physical-fit guidance card ("Cuff should be firm but not tight"), and Connect/Disconnect actions.
- **FR-14**: Select Device screen: list of paired devices, each showing name/nickname (editable), Device ID, and a battery/connection percentage bar color-coded by level (green ~90%, amber ~50%, red ~10%). One example entry uses a baby's name ("Baby-Aarav") instead of a default device name — nicknaming is a designed feature, not a stray example.
- **FR-15**: For v1 against the real backend, only one device will actually have live data. Design/flag how the UI should behave for additional list entries with no backend-backed data (e.g. disabled state, "demo" placeholder, or simply don't render more than the one real device).

## 5. Non-Functional Notes

- **No medical jargon on Home** — this is a deliberate, research-backed choice (see `context/implementation-plans/neonatal-sepsis-armband.md` §8, mirroring BEMPU/JivaScope/Cradle VSA precedent). Don't leak clinical terms into Home copy during the UX improvement pass.
- **Red state must never be ambiguous or missable** — err toward more visual intensity, not less, if changing the design.
- **Never say "sepsis detected."** Per the clinical research, this is a screening/triage aid, not a diagnosis. Home and Clinical View copy should stay in "suspicion"/"risk" framing (the current design already does this correctly — preserve it through any UX changes).

## 6. Open Questions for the UX Improvement Pass

1. What do the two header icon buttons on Home actually open? (Chart icon → likely Clinical View; second icon → likely Device Details. Confirm before building nav.)
2. Where/how does a user configure the "primary emergency contact" the Call Ambulance button dials?
3. What does the "System" tab show?
4. Is there ever a login/role gate between caregiver-facing Home and clinical-facing views, or is it always both-in-one-app as currently designed?
5. What does a sensor-contact-check *failure* state look like (only "Good" is shown in this round)?
6. How should the Select Device list behave for entries beyond the one real v1 device?

## 7. Definition of Done (v1 handoff)

- Home, Clinical View, Trend, Device Details, and Select Device screens implemented in Next.js against the design system
- All three risk states (Green/Amber/Red) implemented on both Home and Clinical View, driven by real data from the backend read API — not hardcoded per screen
- The FR-9 inconsistency (High Suspicion showing healthy-baby copy) is fixed, not reproduced
- Open questions above are either answered by design or explicitly deferred with a visible TODO
