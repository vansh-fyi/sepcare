# User Flows: SepCare Mobile App

Derived from the Figma "Segue 3.0" design round. Each flow lists the screens involved (see `SCREEN-CONTENT.md` for exact copy) and the state that drives what's shown.

## Flow 1 — Everyday Monitoring (Green State)

**Goal:** Caregiver glances at the app and confirms the baby is fine.

1. App opens to **Home**. Header shows device name, "Monitor Active" + "Wearable Connected" chips, today's date.
2. Infant Status card reads "Baby is Resting Safely" with a green checkmark icon and reassuring one-liner.
3. Vitals row shows Pulse/Temp/Activity all in their calm color treatment, Activity reads "Healthy".
4. Instructions list shows routine care reminders: Continue Regular Feeding, Keep Baby Warm & Covered, Keep Ankle Band On.
5. (Optional) Caregiver taps **See All** → navigates to **Clinical View**, which mirrors the same "all stable" state with clinical framing ("All Systems Stable") and six individually-listed vital signals, all "All systems stable."
6. (Optional) From Clinical View, caregiver taps a time-scale pill or the vitals list → **Trend view**, sees flat/stable sparklines for all six signals.

**No action required at any point in this flow** — it's a confirmation loop, not a task.

## Flow 2 — Early Warning (Amber State)

**Goal:** Caregiver notices something needs attention and takes a concrete, low-stakes action.

1. Home shows a warmer/more urgent (but not full-red) treatment. Infant Status: "Keep a Close Eye on Baby" — "Based on the data, baby needs to be monitored."
2. Vitals row: one or more cards shift state — e.g. Activity reads "Tremor" instead of "Healthy"; Temp ticks up (99.6°F in the observed example).
3. Instructions list changes to state-specific actions: **Check Temperature** ("Use a clean rectal thermometer"), **Try Feeding Now** ("Baby might be hungry"), **Keep Ankle Band On**.
4. Caregiver can drill into **Clinical View** → Infant Status reads "Moderate Suspicion," and the six-signal list shows the specific signals driving it flagged with descriptive text (e.g. "Thermoregulation: Hypothermia trend. Dropping over 4h", "Cardiac Autonomic: HRV pattern changes detected") while unaffected signals still read "All systems stable."
5. From there, tapping into **Trend view** for the flagged signal(s) shows the actual multi-hour trend line that justifies the "dropping over 4h" language — this is the moment where a trained user validates the alert against real data before acting further.

**This flow is the one most worth polishing in the UX pass** — it's the "not an emergency yet, but don't ignore it" moment, and the instructions need to feel actionable, not alarming.

## Flow 3 — Emergency (Red State)

**Goal:** Get the baby to care immediately, with zero ambiguity and minimum taps.

1. Home flips to a deep, unmistakable red treatment. Infant Status: "TAKE BABY TO HOSPITAL" with an X icon.
2. All three vitals cards flip to red/alert (Pulse 55.2 BPM, Temp 96.5°F in the observed severe-hypothermia example, Activity: "Alert").
3. A full-width **Call Ambulance** button sits directly under Infant Status — no scrolling required to find it.
4. The Instructions section is replaced by a second, even more prominent **"Press here to CALL AMBULANCE"** button plus a card explaining "Call Ambulance or a nurse now! Press the button above to call emergency services."
5. Per a design annotation on this screen, tapping Call Ambulance dials a **pre-configured primary emergency contact** — this needs a setup surface somewhere (see PRD Open Questions; not present in this design round).
6. Clinical View for this state shows "High Suspicion" (note: the current mockup's description text is a copy bug — see PRD §4.3/FR-9 — fix during implementation) with severe per-signal flags: "Hypothermia trend. Severe Dropping over 4h", "Abrupt HRV pattern changes detected", "Fatal downward trend" (Perfusion Index).

**Design principle carried over from the clinical research:** this state should never be reached from a single bad reading — it only fires when multiple independent vital systems are abnormal and trending together (backend `RISK-02`). The UI's job here is just to make an already-validated emergency impossible to miss or second-guess, not to add its own interpretation.

## Flow 4 — Pairing / Managing a Device

**Goal:** Connect a new band, or check on / switch between already-paired bands.

1. From Home (or Clinical View), caregiver taps into device management (exact entry point is one of the header icons — see PRD Open Questions) → **Select Device**.
2. Select Device lists all paired bands: name/nickname, Device ID, and a battery/connection level bar (color-coded). Caregiver can rename a device (pencil icon) — e.g. the observed "Baby-Aarav" entry shows this is meant to support naming a band after the baby wearing it.
3. Tapping a device → **Device Details**. Shows the device image, editable name, ID, battery %, and a live **Sensor Contact Check**: three cards (Pulse/Temp/IMU) each reporting fit/contact quality ("Good" in the only state observed — a failure state isn't in this design round, see PRD Open Questions).
4. A guidance card reminds the caregiver how the band should physically fit: "Cuff should be firm but not tight... snug around the ankle without cinching tight."
5. Caregiver taps **Connect Device** to pair, or **Disconnect Device** to stop monitoring on that band.

**v1 backend reality check:** only one device will have real data behind it (`.planning/REQUIREMENTS.md` DEV-01). This flow's list-of-many-devices UI is a legitimate future direction (useful for a ward/multi-baby deployment) but the frontend should decide how to gracefully show "1 real device, rest are future/demo" rather than pretending all six list entries are live (see PRD FR-15).

## Flow Map (Summary)

```
Home (Green/Amber/Red)
  ├─ See All ─────────────► Clinical View (Vitals tab)
  │                              ├─ tap signal / time pill ──► Trend view (per-signal graphs, 2H–24H)
  │                              └─ bottom tab ───────────────► System (content TBD, not in this round)
  ├─ Call Ambulance (Red only) ─► dials primary emergency contact (setup surface TBD)
  └─ device icon ─────────────► Select Device
                                     └─ tap a device ─────────► Device Details
                                                                    ├─ Connect Device
                                                                    └─ Disconnect Device
```
