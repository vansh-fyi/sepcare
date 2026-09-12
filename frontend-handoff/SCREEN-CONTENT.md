# Screen Content Reference: SepCare Mobile App

Exact copy pulled from the Figma "Segue 3.0" file (page: `UI-Screens-final-draft`), read directly from text layers. Screen names below are the Figma frame names, kept as-is for traceability back to the source file. Where the design shows the same logical screen in more than one risk state, all observed variants are listed together.

---

## Home Dashboard

*Figma frames: "Screen 11" (Green), "Screen 2" (Amber), "Screen 3" (Red)*

**Header (all states):**
- Time: `9:41` (status bar placeholder, ignore)
- Date: `Sun, 16 Aug 2026`
- Device badge: `Device-SKU-1234`
- Status chips: `Monitor Active` · `Wearable Connected`

**Section header:** `Infant Status`

| State | Headline | Description |
|---|---|---|
| Green | Baby is Resting Safely | Based on the data, baby's health status is above average. |
| Amber | Keep a Close Eye on Baby | Based on the data, baby needs to be monitored. |
| Red | TAKE BABY TO HOSPITAL | *(replaced by Call Ambulance button, no description line)* |

**Section header:** `Vitals` · action link `See All`

| Field | Green | Amber | Red |
|---|---|---|---|
| Pulse (BPM) | 78.2 | 78.2 | 55.2 |
| Temp (°F) | 98.6 | 99.6 | 96.5 |
| Activity | Healthy | Tremor | Alert |

**Section header:** `Instructions`

- Green:
  - **Continue Regular Feeding** — Continue as advised
  - **Keep Baby Warm & Covered** — Keep Baby warm around a soft cloth
  - **Keep Ankle Band On** — Ensure that the ankle band stays on
- Amber:
  - **Check Temperature** — Use a clean rectal thermometer.
  - **Try Feeding Now** — Baby might be hungry
  - **Keep Ankle Band On** — Ensure that the ankle band stays on
- Red (instructions list is replaced entirely):
  - Button: `Press here to CALL AMBULANCE`
  - Card: **Call Ambulance or a nurse now !** — Press the button above to call emergency services
  - Primary action label: `Call Ambulance` (button also present directly under Infant Status card)

---

## Clinical View — Vitals List

*Figma frames: "Screen 1" (Green/stable), "Screen 4" (Amber/moderate), "Screen 5" (Red/high)*

**Top nav:** back arrow · `Clinical View`

**Device card:** `Device-SKU-1234` · `Device ID: SKU-1234`

**Section header:** `Infant Status`

| State | Headline | Description |
|---|---|---|
| Green | All Systems Stable | All stats on the infant are normal. Baby is healthy |
| Amber | Moderate Suspicion | Based on the data, baby needs to be monitored. |
| Red | High Suspicion | *(mockup bug — currently shows the Green description "All stats on the infant are normal. Baby is healthy"; should describe the high-suspicion state instead — fix during implementation, do not reproduce)* |

**Section header:** `Vitals`

Six signal rows, each with a status line that changes per state:

| Signal | Green | Amber | Red |
|---|---|---|---|
| Thermoregulation | All systems stable | Hypothermia trend. Dropping over 4h | Hypothermia trend. Severe Dropping over 4h |
| Cardiac Autonomic | All systems stable | HRV pattern changes detected | Abrupt HRV pattern changes detected |
| Perfusion Index | All systems stable | All systems stable | Fatal downward trend |
| HR / Temp Ratio | All systems stable | All systems stable | All systems stable |
| Respiratory Pattern | All systems stable | All systems stable | All systems stable |
| Activity Level | All systems stable | All systems stable | All systems stable |

**Bottom tab bar:** `Vitals` (active) · `System` (content not present in this design round)

---

## Clinical View — Trend Graphs

*Figma frames: "Screen 6", "Screen 7", "Screen 8" (appear to be the same trend-view template; only Screen 6 has fully populated chart data in this export)*

**Top nav:** back arrow · `Clinical View`

**Device card:** `Device-SKU-1234` · `Device ID: SKU-1234`

**Section header:** `Select Time Scale` — pill options: `2H` `4H` `6H` `8H` `10H` `12H` `24H`

**Section header:** `Vitals`

One chart card per signal (same six as the Vitals List: Thermoregulation, Cardiac Autonomic, Perfusion Index, HR/Temp Ratio, Respiratory Pattern, Activity Level), each showing:
- Signal name + mini status label (observed: `Stable`)
- Line/sparkline graph, x-axis hourly labels (observed range `8:00`–`14:00`), y-axis value gridlines (observed: `94`, `96`, `99`, `100` — units not labeled in the text layer, confirm with design)

**Bottom tab bar:** `Vitals` · `System` (same as Vitals List screen)

---

## Device Details

*Figma frame: "Screen 9"*

**Top nav:** back arrow · `Device Details` · action link `Device List`

**Device card:** `Device-SKU-1234` (editable, pencil icon) · `Device ID: SKU-1234` · battery/connection bar: `90%`

**Section header:** `Sensor Contact Check`

| Sensor | Status |
|---|---|
| Pulse | Good |
| Temp | Good |
| IMU | Good |

**Guidance card:** **Cuff should be firm but not tight.** — Ensure the cuff is snug around the ankle without cinching tight.

**Actions:** `Connect Device` (primary) · `Disconnect Device` (secondary)

---

## Select Device

*Figma frame: "Screen 10"*

**Top nav:** back arrow · `Select Device`

List of paired devices, each row: name (editable, pencil icon), Device ID, battery/connection bar:

| Name | Device ID | Level |
|---|---|---|
| Device-SKU-1234 | SKU-1234 | 90% |
| Device-SKU-4564 | SKU-4564 | 50% |
| Device-SKU-3345 | SKU-3345 | 90% |
| Device-SKU-2333 | SKU-2333 | 90% |
| Device-SKU-3434 | SKU-3434 | 90% |
| Baby-Aarav | SKU-2345 | 10% |

Note: `Baby-Aarav` uses a custom nickname instead of the default `Device-SKU-####` pattern — confirms nicknaming is an intended feature, not a placeholder artifact.

---

## Unresolved / Not in This Design Round

- **System tab** content (appears in bottom nav on Clinical View and Trend screens, no populated content found)
- **Sensor Contact Check failure state** (only "Good" observed — no warning/error visual or copy)
- **Primary emergency contact setup** — a design annotation on the Red-state screen notes the Call Ambulance button should "dial primary emergency contact," but no screen in this round lets a user set that contact
- **Header icon destinations on Home** — two icon buttons appear in the top-right of the Home header (chart-style icon, device/cup-style icon); their exact tap targets aren't labeled in the text layer. Likely Clinical View and Device Details respectively, based on icon shape and app structure, but not confirmed.
