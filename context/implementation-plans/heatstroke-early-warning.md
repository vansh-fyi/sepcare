# Heatstroke Early-Warning System for Rural Agricultural Workers

> **Working name**: *Taap-Rakshak* (heat guardian) — placeholder, rename freely.
> **Form factor**: wrist-worn sensor band + optional field-supervisor hub (Raspberry Pi "foreman's dashboard").

---

## 1. Overview / Problem

Outdoor agricultural and construction labor is one of the most heat-exposed occupations in India, and almost entirely unmonitored at the individual level.

- Indian farm workers lost an average of **648 hours (54 full working days) to heat stress in 2024** — the third-worst-hit country globally. ([Down To Earth](https://www.downtoearth.org.in/amp/story/climate-change/extreme-heat-cost-indias-farm-workers-54-days-of-labour-in-the-hottest-year-on-record))
- The Lancet Countdown estimates India lost **247 billion labour hours** and **~$194 billion** in 2024 alone, concentrated in agriculture and construction.
- Official heatstroke death counts are wildly inconsistent and almost certainly a severe undercount: **159 deaths / ~48,000 cases** reported for 2024 by one government tally, but a media cross-check for the same March–June 2024 window found **733 deaths across 17 states**. In 2025, NCDC recorded 7,192 suspected cases but only 14 confirmed deaths, while independent media tracking found at least 84 suspected deaths in the same period. Historical 2015–2022 government data ranges from 3,436 to 8,171 deaths/year depending on the source. ([Deccan Herald](https://www.deccanherald.com/india/india-recorded-over-7000-suspected-heatstroke-cases-14-deaths-in-march-june-period-rti-3650589), [The Quint](https://www.thequint.com/climate-change/india-heatwave-heatstroke-deaths-mortality-data), [Wikipedia — 2024 Indian heat wave](https://en.wikipedia.org/wiki/2024_Indian_heat_wave))
- India's only current public tool, **SHRAM / Extreme Heat Index (EHI-N)**, is a **district-level ambient dashboard** — it can tell a whole taluka "today is dangerous," but it cannot tell a specific worker mid-shift that *their own body* is trending toward heat injury. There is no personal, physiological, frugal early-warning wearable for Indian outdoor labor.
- Existing physiological wearables (EVALAN ARMOR, Bodytrak, the Florida NIH farmworker biopatch study) solve the *sensing* problem well but are built for **military/enterprise budgets** (EVALAN ARMOR is deployed to the Dutch military and fire brigades, using the US Army's patented ECTemp algorithm streamed to a supervisor tablet — a good architectural template, but not an open or affordable product) and are not available or adapted for a ₹500–1500 rural laborer budget. ([EVALAN](https://evalan.com/products/armor/))

**The gap we're filling**: a frugal, offline, individually-worn device that estimates a worker's *personal* heat-strain trajectory in real time — not just regional weather — and escalates a green/amber/red alert before collapse, cheap enough to equip an entire field crew.

---

## 2. Clinical / Physiological Basis

Heatstroke is preceded by a **rising core body temperature trend**, not a single instantaneous reading — by the time skin feels hot to the touch or the person collapses, intervention is already late. Direct core temperature measurement requires an ingestible pill or rectal probe, which is invasive and unusable in the field. Instead, we use a **validated non-invasive proxy stack**:

1. **Heart-rate-derived core temperature estimation.** Multiple validated algorithms (Kalman-filter and Particle-filter based) estimate core body temperature trajectory from heart rate alone, achieving accuracy comparable to esophageal/rectal probes (one validated algorithm: bias 0.02°C, RMSE 0.21°C). This is the same principle behind the US Army's patented **ECTemp** algorithm, licensed commercially by EVALAN for their ARMOR product. ([ScienceDirect — real-time core body temp from wearable HR](https://www.sciencedirect.com/science/article/pii/S0360132326001745), [USARIEM CBT algorithm](https://usariem.health.mil/index.cfm/research/products/cbt_algorithm), [Frontiers — HR-based core temp in athletes](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9256956/))
2. **HRV anomaly detection.** As heat strain builds, heart rate rises but heart-rate-variability (HRV) drops — a well-documented autonomic stress signature. A published heat-illness detection method uses HRV anomaly detection specifically for this purpose. ([ScienceDirect — heat illness detection via HRV anomaly detection](https://www.sciencedirect.com/science/article/pii/S1746809423009539))
3. **Skin temperature** as a secondary, faster-responding (but less specific) signal.
4. **Ambient WBGT-style heat index** (temperature + humidity, ideally + radiant/wind but we approximate). NIOSH's Recommended Alert Limits (for unacclimatized workers) and Recommended Exposure Limits (for acclimatized workers) are both defined as WBGT thresholds scaled by workload/metabolic rate. Where WBGT sensing isn't feasible, a **Heat Index screening threshold of 85°F (29.4°C)** is validated by CDC/NIOSH research as a reasonable proxy trigger. ([OSHA/NIOSH heat resources](https://www.osha.gov/heat-exposure/resources), [CDC/AIHA — 85°F HI screening threshold](https://synergist.aiha.org/201808-cdc-heat-related-illness))
5. **Activity/exertion level via IMU**, because heart rate must be interpreted *relative to* how hard the person is working — a resting elevated HR means something very different from an HR elevated during active hoeing. This exertion-adjustment is exactly what ARMOR's "Physical Strain Index" does for the supervising officer's tablet.

**Fusion logic (our device)**: exertion-adjusted HR trend + HRV drop + skin temp rise + ambient heat index crossing threshold → composite heat-strain score → 3-tier alert, grounded in NIOSH RAL/REL bands rather than an arbitrary score.

---

## 3. System Architecture

```
                     ┌─────────────────────────────┐
                     │   WRIST/ARM WEARABLE UNIT    │
                     │  (per worker, standalone)     │
                     │                               │
                     │  MAX30102 (PPG: HR + HRV)     │
                     │  Skin thermistor / MAX30205   │
                     │  MPU6050 / LSM6DS3 (IMU)      │
                     │  ESP32-C3/S3 (edge compute)   │
                     │  Vibration motor + LED         │
                     │  LiPo battery + solar trickle  │
                     └───────────────┬───────────────┘
                                     │ BLE (local alert fires
                                     │ on-device even if BLE drops)
                                     ▼
                     ┌─────────────────────────────┐
                     │  RASPBERRY PI FIELD HUB       │
                     │  ("Foreman's Dashboard")      │
                     │                               │
                     │  Receives BLE from up to      │
                     │  ~10-15 worker bands           │
                     │  Ambient SHT31 (temp+RH) →     │
                     │  computes field-wide heat index│
                     │  Runs fused risk model,        │
                     │  shows color-coded grid of      │
                     │  all workers (like Neopenda's   │
                     │  multi-patient tablet)          │
                     │  Offline SD logging + optional  │
                     │  store-and-forward sync         │
                     └─────────────────────────────┘
```

**Why this split (not "just a Pi on the wrist")**: a Raspberry Pi is too large, power-hungry, and expensive to put on every worker's wrist. The proven pattern (mirrors EVALAN ARMOR and Neopenda neoGuard) is a **cheap low-power MCU per wearable + one shared Pi/tablet hub per field crew**. This also produces a stronger demo: a supervisor watching a live grid of 5+ simulated workers shift from green→amber→red is a much more compelling designathon pitch than a single isolated band, and it mirrors a real adoption model (one hub purchased per labor contractor/crew, cheap bands per worker).

Each wristband still fires its **own local alert (vibration + LED)** even if BLE to the hub is lost — the worker must never depend on connectivity to get warned.

---

## 4. Hardware BOM

| Component | Purpose | Example part | Approx. cost |
|---|---|---|---|
| PPG sensor | HR + HRV + perfusion | MAX30102 breakout (DFRobot/generic) | ₹250–400 |
| IMU | motion artifact correction + exertion level | MPU6050 (cheapest) or LSM6DS3 (better) | ₹80–200 |
| Skin temp sensor | secondary heat signal | Digital thermistor / MAX30205 IC | ₹150–300 |
| Wearable MCU | on-band edge compute + BLE | ESP32-C3 or ESP32-S3 dev module | ₹250–450 |
| Vibration motor + LED | local escalating alert | generic coin vibration motor + RGB LED | ₹50 |
| Battery | full workday power | 500–1000mAh LiPo | ₹150–250 |
| Wristband housing | comfort, sweat/dust resistance | 3D-printed or silicone strap, IP-rated enclosure | ₹100–200 (3D print) |
| **Per-wearable total** | | | **≈ ₹1000–1500** |
| Ambient sensor | field-wide heat index | SHT31 (weatherproof) or DHT22 (budget) | ₹300–600 |
| Hub compute | multi-worker dashboard | Raspberry Pi 4/5 (team likely already owns one) | — |
| Hub display | foreman UI | 7" touchscreen or existing laptop/monitor | — |
| Hub power | field use | power bank / small solar panel | ₹500–1000 |

Small IP67 solar-ready enclosures exist off-the-shelf for the hub (e.g. Kiwi Electronics' solar-ready ASA enclosure; ESP32-C3-based "SN1 Solar Node" is a good reference design for a fully solar wearable). For the wristband itself, full solar isn't very practical (too small a panel area) — plan for battery swap or a docking/charging station at day's end instead. ([Kiwi Electronics solar enclosure](https://www.kiwi-electronics.com/en/small-solar-ready-enclosure-10918), [SN1 Solar Node](https://www.cnx-software.com/2026/04/07/sn1-solar-node-an-esp32-c3-based-board-with-ip67-enclosure-solar-charging-esphome-firmware/))

---

## 5. Mechanical / Wearable Design

- **Attachment point: wrist**, not upper arm — wrist is where PPG wearables are best validated (consistent with every commercial reference device: ARMOR, Bodytrak-style, consumer smartwatches), easier to don/doff during a workday, and doesn't interfere with tool use the way an armband would.
- Enclosure must be **sweat- and dust-resistant** (aim for informal IP65+ even if not certified) — cheap silicone/3D-printed shell with a sealed seam, conformal-coated PCB.
- **Motion artifact is the #1 practical risk** for the PPG signal, because farm labor involves continuous hand/arm movement (hoeing, harvesting) — far worse than a resting patient. Mitigate with:
  - IMU-based adaptive noise cancellation (subtract motion-correlated component from the PPG signal) — well documented in the literature for exactly this problem. ([Motion Artifact Reduction in Wearable PPG, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7085621/), [Time-varying spectral filtering for PPG during intense activity, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4732043/))
  - Confidence-gate the HR reading: if IMU shows high-amplitude motion and PPG signal quality drops below a threshold, widen the confidence interval / fall back to the last stable trend rather than emitting a noisy spot reading.
  - Firm-but-comfortable strap tension (loose = worse motion artifact) — this is a mechanical, not just algorithmic, fix.
- **Skin tone consideration**: PPG accuracy can vary with skin pigmentation and perfusion — use the MAX30102's dual-wavelength (red+IR) capability and don't rely on single-wavelength thresholds; validate on multiple skin tones during testing, not just team members.
- Weight target: under 30g including battery, so it's tolerable for 8+ continuous hours.

---

## 6. Firmware / On-Device Processing (wearable ESP32)

1. Sample PPG at ~100Hz, IMU at ~50Hz, skin temp at ~1Hz.
2. Run motion-artifact-corrected HR + HRV extraction on-device (lightweight peak-detection + adaptive filter — no need for a deep model at this stage).
3. Maintain a rolling exertion level from IMU activity magnitude (rest / light / moderate / heavy — roughly analogous to NIOSH's metabolic-rate categories used to scale WBGT limits).
4. Feed [HR trend, HRV, skin temp, exertion level] into the on-device fusion logic (Section 7) every ~30–60 seconds.
5. Fire local alert (LED + vibration, escalating pattern for amber vs red) **immediately and locally** — do not wait for hub round-trip.
6. Broadcast the current tier + raw features to the hub over BLE whenever in range; buffer locally (small ring buffer) if hub is briefly out of range.

---

## 7. Alert Logic & Thresholds

Ground the composite score in **real occupational thresholds** rather than an invented number, so the pitch can cite NIOSH:

- Compute an **effective heat index** from ambient temp+humidity (SHT31 on the hub; a simpler onboard estimate on the wearable itself if isolated). Flag when it crosses **85°F / 29.4°C** (CDC/NIOSH screening threshold), and use standard heat-index-to-risk bands (Caution / Extreme Caution / Danger / Extreme Danger) as the ambient-risk backbone. ([CDC 85°F screening threshold](https://synergist.aiha.org/201808-cdc-heat-related-illness))
- Adjust the *personal* alert level up or down from the ambient baseline using:
  - Sustained elevated HR **relative to the worker's own resting/task baseline** (not an absolute number — this handles individual variation and partial acclimatization).
  - HRV drop trend over the last 10–15 minutes.
  - Skin temp rising and not plateauing.
  - Exertion level from IMU — a NIOSH-consistent "high metabolic workload lowers the safe WBGT ceiling" rule.
- **Three-tier output** (same visual language as Cradle VSA / BEMPU TempWatch, deliberately reused for user familiarity across the whole device family):
  - 🟢 **Green** — normal, continue work.
  - 🟡 **Amber** — rising strain: on-device message/vibration pattern = "take water + shade break now."
  - 🔴 **Red** — sustained multi-signal escalation: strong alert to worker AND push to hub/supervisor for direct intervention.
- Escalation should require **persistence** (e.g., signal sustained for 2–3 consecutive readings), not a single noisy spike — motion artifact false positives would otherwise erode trust in the device quickly.

---

## 8. ML Model & Training / Calibration Data Plan

For a designathon timeframe, favor a **transparent, tunable rule/threshold-fusion model** over a black-box classifier — it's faster to build, easier to demo and explain to judges, and matches how BEMPU/Cradle VSA-style frugal devices actually work in the field (simple, explainable logic beats an opaque model for trust in low-literacy deployment).

- **Calibration reference data**: use the [PhysioNet "Wearable Device Dataset from Induced Stress and Structured Exercise Sessions"](https://physionet.org/content/wearable-device-dataset/1.0.0/Wearable_Dataset/STRESS/) (Empatica E4: HR, HRV, skin temp, accelerometry, EDA from 36 subjects under exercise/stress) to sanity-check HR/HRV/skin-temp trend shapes and tune threshold sensitivity offline before the live demo.
- If time allows, layer a very lightweight anomaly-detection step (e.g., a simple z-score/Isolation Forest on the HRV trend) inspired by the published heat-illness HRV anomaly detection approach, rather than a full deep model — this is realistic to implement and validate within a hackathon window. ([ScienceDirect — HRV anomaly detection for heat illness](https://www.sciencedirect.com/science/article/pii/S1746809423009539))
- **Be explicit with judges**: real heatstroke ground-truth labels don't exist in any open dataset (inducing heatstroke in subjects is unethical and dangerous), so the model is *threshold-driven and physiologically grounded in NIOSH/published algorithms*, not trained end-to-end on labeled heatstroke outcomes. This is honest and is also how every real device in this space (ARMOR/ECTemp included) actually works — they estimate core temp trajectory and alert on trend, not on a supervised "heatstroke/no heatstroke" label.

---

## 9. Companion App / Alert UI

- **On the wearable**: no screen — LED color + vibration pattern only, readable by anyone regardless of literacy (same design philosophy as BEMPU TempWatch).
- **On the hub (Raspberry Pi + touchscreen)**: a grid of worker tiles (like Neopenda's multi-patient view), each colored green/amber/red, with icon-based (not text-heavy) status, plus a big audio alert when any worker goes red — so a supervisor doesn't need to be staring at the screen continuously.
- Offline-first: hub logs everything locally to SD card; if/when connectivity is available, store-and-forward sync to a central dashboard for the labor contractor or PHC (same pattern as JivaScope's telemedicine sync).

---

## 10. Power & Battery Life

- Wearable: ESP32 in BLE-advertise + periodic-sample duty cycle (not continuous full-power sampling) should comfortably reach an 8–10 hour workday on a 500–1000mAh LiPo; validate with real current-draw measurement early since sensor duty-cycling assumptions often slip in practice.
- Charging model: **swap-and-charge at day's end**, not solar-on-band (band is too small for meaningful solar harvest). Provide a simple multi-bay charging dock at the hub for the whole crew's bands overnight.
- Hub: Raspberry Pi + small solar panel/power bank is realistic for daytime field use; the [Kiwi Electronics solar-ready enclosure](https://www.kiwi-electronics.com/en/small-solar-ready-enclosure-10918) pattern or a simple 10–20W panel + power bank is sufficient for a Pi 4/5 running BLE + a lightweight dashboard.

---

## 11. Safety Considerations

- **Do not attempt to actually heat-stress a demo subject** for testing or the live pitch — this is a genuine medical risk. Validate/demo using:
  - Exercise-induced HR/HRV elevation (a brisk walk, stair climbs, or light calisthenics right before the demo) to show the exertion-adjustment and rising-strain trend live, while keeping ambient conditions safe.
  - Pre-recorded or PhysioNet-derived data replay for the "red alert" escalation scenario, clearly labeled as simulated during the pitch.
- Enclosure must have no sharp edges, no choking-hazard small parts, and be secured with a breakaway or easily-removable strap (avoid ligature risk in a work environment with machinery).
- Skin-contact materials should be biocompatible/hypoallergenic (medical-grade silicone), and the sensor should not be a comfort/heat-trapping unit itself — thin, breathable strap only.
- The device supplements, never replaces, standard heat-safety practice (shade, water, rest breaks, work-rest scheduling per NIOSH RAL/REL) — frame it explicitly in the pitch as an early-warning aid, not a diagnostic or medical device.

---

## 12. Realistic Designathon Build Plan (24–48h+ window)

**Phase 1 (first few hours) — bring-up**
- Wire MAX30102 + MPU6050 + thermistor to one ESP32; get raw HR/IMU/temp streaming over serial. This is a well-documented, low-risk integration (many open reference builds exist).

**Phase 2 — core logic**
- Implement exertion-adjusted HR baseline tracking + simple motion-artifact gating.
- Implement 3-tier threshold fusion logic (Section 7) — keep it rule-based, testable, and explainable.
- Add local LED/vibration alert output.

**Phase 3 — hub + multi-worker demo**
- Raspberry Pi BLE receiver script; simple dashboard (even a Python/Flask or Pygame grid UI is enough) showing 2–3 live real bands + a few simulated/replayed worker feeds to make the "crew view" demo look like 8–10 workers without needing that many physical prototypes.
- SHT31/DHT22 on the hub for ambient heat index.

**Phase 4 — polish + pitch**
- Physical enclosure (3D print or simple casing) for at least one wearable to show as a tangible artifact.
- Rehearse the live demo: walk/exercise to show green→amber transition live; use a replayed/simulated trace for the red-alert supervisor-notification moment.
- Prepare the NIOSH/ECTemp/HRV-anomaly citations as backing slides — judges will likely ask "how do you know this actually predicts heatstroke," and having the published core-temp-from-HR algorithm lineage (US Army ECTemp → EVALAN ARMOR → our frugal adaptation) is a strong, credible answer.

**What to explicitly demo live vs. simulate**:
- ✅ Live: raw HR/HRV/skin-temp/IMU sensing, motion-artifact handling, exertion-adjusted green→amber transition via real physical exertion.
- ⚠️ Simulated/replayed: the full red-alert / near-heatstroke trajectory (for safety), and the "10-worker crew" dashboard view (pad real 2-3 units with replayed traces).

---

## 13. References

- [Down To Earth — Extreme Heat Cost India's Farm Workers 54 Days of Labour in 2024](https://www.downtoearth.org.in/amp/story/climate-change/extreme-heat-cost-indias-farm-workers-54-days-of-labour-in-the-hottest-year-on-record)
- [Deccan Herald — India recorded over 7,000 suspected heatstroke cases, 14 deaths (2025)](https://www.deccanherald.com/india/india-recorded-over-7000-suspected-heatstroke-cases-14-deaths-in-march-june-period-rti-3650589)
- [The Quint — Heatwave Alert: We still don't know how many are dying in India](https://www.thequint.com/climate-change/india-heatwave-heatstroke-deaths-mortality-data)
- [Wikipedia — 2024 Indian heat wave](https://en.wikipedia.org/wiki/2024_Indian_heat_wave)
- [EVALAN ARMOR — Heat Stress Monitoring Wearable](https://evalan.com/products/armor/)
- [EVALAN — 3,400 Body Core Temperature Monitors supplied to Dutch Military](https://evalan.com/evalan-supplies-3400-body-core-temperature-monitor-systems-to-the-dutch-military/)
- [USARIEM — Core Body Temperature Estimation From Heart Rate (ECTemp)](https://usariem.health.mil/index.cfm/research/products/cbt_algorithm)
- [ScienceDirect — Real-time estimation of core body temperature for heat stress monitoring using wearable HR sensors](https://www.sciencedirect.com/science/article/pii/S0360132326001745)
- [Frontiers — HR-Based Algorithm to Estimate Core Temperature in Elite Athletes](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9256956/)
- [ScienceDirect — Heat illness detection with HRV analysis and anomaly detection](https://www.sciencedirect.com/science/article/pii/S1746809423009539)
- [OSHA/NIOSH — Heat Exposure Resources](https://www.osha.gov/heat-exposure/resources)
- [AIHA Synergist — CDC 85°F Heat Index screening threshold](https://synergist.aiha.org/201808-cdc-heat-related-illness)
- [PMC — Motion Artifact Reduction in Wearable PPG (multi-wavelength)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7085621/)
- [PMC — Time-Varying Spectral Filtering for PPG During Intense Physical Activity](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4732043/)
- [PhysioNet — Wearable Device Dataset from Induced Stress and Structured Exercise Sessions](https://physionet.org/content/wearable-device-dataset/1.0.0/Wearable_Dataset/STRESS/)
- [Kiwi Electronics — Small Solar Ready IP67 Enclosure](https://www.kiwi-electronics.com/en/small-solar-ready-enclosure-10918)
- [CNX Software — SN1 Solar Node, ESP32-C3 IP67 solar-charging reference design](https://www.cnx-software.com/2026/04/07/sn1-solar-node-an-esp32-c3-based-board-with-ip67-enclosure-solar-charging-esphome-firmware/)
