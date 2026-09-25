# SepCare — Project Overview (Frontend Handoff)

*Context for whoever picks up the Next.js port on `main`. Written from the `backend` branch after reviewing the current Figma design round.*

## What SepCare Is

SepCare is a wearable ankle/wrist band for newborns (0–28 days) that continuously tracks vitals — heart rate, temperature, activity, and perfusion — and raises an early warning when the pattern looks like neonatal sepsis, one of the leading causes of preventable newborn death in India. The core idea: a caregiver or ASHA (community health) worker doesn't need clinical training to notice danger signs in time, because the band + app do the noticing for them.

This is an SDG 3 (Good Health & Well-being) project. The full clinical research behind it — WHO danger-sign criteria, why hypothermia matters as much as fever, the six-signal composite logic used to tell sepsis apart from an ordinary cold — lives in `context/implementation-plans/neonatal-sepsis-armband.md` and `context/web-research/sepsis-vs-common-illness-differentiation.md`. Worth a skim if you want to understand *why* the app is built the way it is (e.g. why the clinical view lists six specific vital categories instead of raw sensor numbers).

## How the Pieces Fit Together

- **Hardware** (separate track): an ESP32-based band with PPG (heart rate/perfusion), temperature, and IMU (activity) sensors. WiFi-capable, so it talks to the cloud directly — no bridge device needed.
- **Backend** (this branch, `backend`): a Next.js API (hosted free on Vercel) that receives vitals from the device, runs the sepsis-risk scoring, stores everything in Supabase, and exposes a read API for the app to consume. Handles offline gaps too — if the band loses WiFi, it buffers locally and syncs the backlog once connectivity returns.
- **Frontend** (your work, `main`): currently static HTML mockups from the design round; being ported to Next.js. The design (Figma: "Segue 3.0") already reflects two distinct audiences in one app — a plain-language **Home** view for caregivers (no medical jargon, color + icon + one-line guidance, matching the philosophy of existing devices like BEMPU TempWatch) and a more detailed **Clinical View** for anyone trained to read it (named vital categories, trend graphs, multi-hour history).

## What the Backend Gives You

Once Phase 1–4 of the backend roadmap ship, the read API/Supabase will provide, per device:
- The latest vitals reading (pulse, temperature, activity score) and a computed **Green / Amber / Red** risk status
- A short natural-language status line for that risk level (the design already shows examples like "Baby is Resting Safely" / "Keep a Close Eye on Baby" / "TAKE BABY TO HOSPITAL")
- Per-category clinical detail (six signals: Thermoregulation, Cardiac Autonomic, Perfusion Index, HR/Temp Ratio, Respiratory Pattern, Activity Level), each with its own status text
- Historical vitals + risk-status over a selectable time range, for the trend charts

v1 backend scope is a **single device** end-to-end — the design shows a multi-device "Select Device" list (useful for a future multi-baby/ward deployment), but that's out of scope for the current backend build. Treat it as a real future direction, not dead UI.

## Current State (as of this handoff)

- Design round complete for the mobile app (Figma "Segue 3.0", page "UI-Screens-final-draft") — 11 mobile screens covering Home (3 risk states), Clinical View (vitals list + trend graphs), and device pairing/selection.
- No frontend code written yet against this design — HTML mockups referenced elsewhere in `context/mockups/` predate this round.
- Backend: PROJECT.md/REQUIREMENTS.md/ROADMAP.md are set up in `.planning/` on this branch; implementation is starting at Phase 1 (device ingest).
- See `PRD.md`, `USER-FLOWS.md`, and `SCREEN-CONTENT.md` in this same folder for the detailed breakdown of what to build.

## A Note on What's Locked vs. Open

The screens, states, and copy documented here are read directly from the current Figma file — treat them as a strong starting point, not gospel. The team explicitly wants to **improve the UX**, not just reproduce the mockup pixel-for-pixel. Where `PRD.md` flags an open question or an inconsistency in the current design, that's an invitation to make it better, not a bug in this document.
