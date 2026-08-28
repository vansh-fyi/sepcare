# Neonatal Sepsis Danger-Sign Armband — Implementation Plan

## 1. Overview / Problem

India has the highest reported clinical neonatal sepsis incidence in the world. Sepsis drives roughly half of community-born neonatal deaths, out of ~0.6M total newborn deaths/year in India — and up to 80% of these are considered preventable **if the danger signs are recognized in time**. The core failure mode is not a lack of treatment (oral amoxicillin / referral pathways exist) — it's *delayed recognition*, because:

- A newborn's decline can be silent and fast (hours, not days).
- Rural households and even ASHA workers are not trained to continuously track HR/RR/temperature trends — they check intermittently, if at all.
- Danger signs like "fast breathing" or "reduced activity" are easy to miss without a trained eye and a clock.

**The device**: a lightweight, continuously-worn armband/legband for a newborn (0–28 days, extending usefully into early infancy) that passively tracks physiological danger signs, fuses them into a sepsis-risk trend, and raises simple traffic-light (green/amber/red) alerts to a caregiver or ASHA worker — no clinical interpretation required from the human. Same design philosophy as **BEMPU TempWatch** (simple wearable, single alert output) but with a richer multi-vital sensor fusion behind it, in the spirit of **JivaScope** (edge AI pushing diagnostic capability to whoever is present).

---

## 2. Clinical Basis

### 2.1 WHO IMCI "Possible Serious Bacterial Infection" (PSBI) danger signs

WHO's Integrated Management of Childhood Illness (IMCI) framework for young infants (0–59 days) defines 7 clinical danger signs indicating referral-level risk of serious bacterial infection/sepsis:

| # | Danger sign                                                        | Threshold                      | Sensor-detectable?                                                                                                               |
| - | ------------------------------------------------------------------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Not feeding well / not able to feed                                | Caregiver-observed             | No (needs caregiver input — out of scope for wearable)                                                                          |
| 2 | Convulsions                                                        | Observed seizure activity      | Partially — IMU could flag abnormal jerking motion patterns, but high false-positive risk;**out of scope for v1**         |
| 3 | Severe chest indrawing                                             | Visual/respiratory effort sign | Partially — IMU on chest/abdomen strap could proxy via respiratory effort amplitude; armband placement makes this hard, see §5 |
| 4 | High body temperature                                              | ≥38.0°C                      | **Yes** — skin thermistor                                                                                                 |
| 5 | Low body temperature                                               | <35.5°C                       | **Yes** — skin thermistor                                                                                                 |
| 6 | Movement only when stimulated / no spontaneous movement (lethargy) | Reduced spontaneous activity   | **Yes** — IMU activity-level tracking                                                                                     |
| 7 | Fast breathing                                                     | ≥60 breaths/min               | **Yes (proxy)** — PPG-derived respiration or IMU-derived chest/limb motion periodicity                                    |

Source: WHO IMCI danger-sign literature and pragmatic cohort validation studies (PMC10662722, medRxiv 2023.05.09.23289739). The 2019 WHO PSBI framework further stratifies these into **"critical illness"** (highest mortality risk — includes convulsions, no movement, severe chest indrawing) vs. **"clinical severe infection"** (moderate risk — includes temperature abnormality, fast breathing) vs. isolated fast breathing (lowest risk, outpatient-manageable).

**Design implication**: our device targets signs #4, #5, #6, #7 directly (temperature + activity + breathing-rate proxy), and adds **heart rate / HRV** as a fifth channel not in the original IMCI list but well-validated in NICU literature as an early sepsis indicator (heart rate characteristics — reduced variability + transient decelerations — often precede overt clinical signs by hours). Signs #1–3 remain caregiver/clinician-observed and are explicitly out of scope; the device is a *screening triage aid*, not a full diagnostic replacement.

**Critical refinement — hypothermia is not a secondary case.** In neonates specifically, sepsis presents as hypothermia almost as often as fever (~29% of septic neonates hypothermic in one cohort), and hypothermic sepsis carries roughly 5x the mortality of febrile sepsis. Sign #5 (low temperature) must be weighted **equally** to sign #4 (high temperature) in the device logic, not treated as a rare edge case — a design implication that only became clear after the differentiation research in §2.3 below.

### 2.2 Supporting research for the sensor-fusion approach

- **SepAl** (arXiv:2408.08316, July 2024) — "Sepsis Alerts On Low Power Wearables With Digital Biomarkers and On-Device Tiny Machine Learning." Directly validates our architecture:
  - Sensor stack: **PPG + IMU + body temperature** (same three modalities we're proposing).
  - Model: a lightweight, fully quantized **temporal convolutional network (TCN)** running on-device.
  - Hardware target: **ARM Cortex-M33**-class low-power MCU.
  - Reported performance: **2.68 mJ per inference, 143 ms latency, 0.11 MAC/cycle**, with a **median predicted time-to-sepsis-onset of 9.8 hours** — i.e., meaningful lead time for intervention.
  - This paper is our primary architectural reference — we are essentially building a frugal, neonatal-focused, Indian-rural-deployable version of this idea.
- **PLOS Digital Health, Oct 2024** — "A novel digital health approach to improving global pediatric sepsis care in Bangladesh using wearable technology and machine learning." Wireless wearable + smartphone link, 100 children in a Dhaka ICU, avg. 2.2 days monitoring, **>99% data capture**, high agreement with clinician-measured vitals. Confirms feasibility of continuous wearable vital monitoring in a South Asian low-resource clinical setting — closest real-world precedent to what we're building, though it is ICU-deployed (wired into clinical workflow) rather than a frugal home/community device, which is exactly our gap.
- **Heart rate characteristics in neonatal sepsis** (PMC11798831) — supports HRV/decelerations as an independent, pre-symptomatic signal, reinforcing why PPG-derived HRV (not just raw HR) belongs in the fusion model.
- No identified product takes this research and packages it as a **frugal, offline, community/home-deployable armband for rural low-resource newborns**. The Bangladesh study and SepAl are both research-stage; nothing is productized for this context.

### 2.3 Differentiating sepsis from common fever/viral illness

A reasonable objection: elevated temperature, elevated HR, and reduced activity could just as easily mean a common cold, teething, or an ordinary viral fever — not sepsis. This was researched in depth and written up separately: **[`web-research/sepsis-vs-common-illness-differentiation.md`](../web-research/sepsis-vs-common-illness-differentiation.md)**. The short version, which directly shapes the fusion logic in §7.1:

- No single vital in our sensor set is sepsis-specific in isolation. Specificity comes from **(a) the shape/direction of each signal, not just magnitude** (e.g. hypothermia is as sepsis-relevant as fever; HR-rise disproportionate to temperature-rise, not just HR above a threshold; HRV *pattern* degradation — reduced variability + transient decelerations + reduced entropy — not just "HRV below X," since viral illness also lowers HRV), and **(b) multi-system, multi-hour trend co-occurrence** — ordinary illness perturbs 1–2 systems and self-resolves within a day; sepsis tends to progressively involve 3+ physiologically independent systems (thermoregulation, cardiac autonomic control, respiration, perfusion) simultaneously and does not resolve without treatment. This mirrors the clinical logic behind PEWS and pSOFA.
- The single most sepsis-mechanistic signal available from our existing sensors is **perfusion index** (from the MAX30102's PPG amplitude) — it reflects circulatory/shock physiology directly, which common febrile illness does not produce — though this is validated in adult septic-shock literature, not yet on neonatal wearables, and is flagged as a priority for our own future validation.
- The NICU-validated "HeRO score" (heart rate characteristics monitoring) is the closest real-world precedent for this whole approach: in a 3,003-infant RCT across 9 NICUs, it reduced sepsis-associated mortality from 20% to 12%, but its standalone single-point sensitivity/specificity was modest (~68%/~11%) — meaning it works as a **trend-based suspicion-raiser combined with clinical judgment**, not a binary sepsis test. Our device should be pitched and coded with the same honesty: "elevated, multi-parameter, trending suspicion warranting urgent evaluation," never "sepsis detected."

---

## 3. System Architecture

Two-tier design — the newborn cannot wear a Raspberry Pi. Sensing/inference-light work happens on a tiny low-power armband MCU; heavier fusion, historical trending, and the caregiver-facing UI run on a Raspberry Pi acting as a bedside/ASHA-kit base station.

```
                         (worn continuously by newborn)
        +-----------------------------------------------------+
        |                  ARMBAND / LEGBAND UNIT              |
        |  +-------------------------------------------------+ |
        |  |  MAX30102 PPG (HR, HRV, SpO2, perfusion index)  | |
        |  +-------------------------------------------------+ |
        |  |  MAX30205 Digital Skin Temp Sensor (±0.1°C)     | |
        |  +-------------------------------------------------+ |
        |  |  LSM6DS3 / MPU6050 IMU (activity, resp. proxy)  | |
        |  +-------------------------------------------------+ |
        |  |  nRF52840 MCU (Cortex-M4F, BLE 5.0, ultra-low P)| |
        |  +-------------------------------------------------+ |
        |  |  150-300 mAh LiPo (protected, encapsulated)     | |
        |  +-------------------------------------------------+ |
        +-----------------------------------------------------+
                                  |
                     BLE 5.0 (low-energy advertising,
                       ~1 packet every 1-5 sec)
                                  v
        +-----------------------------------------------------+
        |         RASPBERRY PI BASE STATION (bedside /         |
        |              ASHA worker kit, mains or battery)       |
        |  +-------------------------------------------------+ |
        |  | BLE receiver + signal buffering / denoising      | |
        |  +-------------------------------------------------+ |
        |  | Feature extraction (HRV, resp. rate, temp trend) | |
        |  +-------------------------------------------------+ |
        |  | TFLite / quantized TCN sepsis-risk fusion model  | |
        |  +-------------------------------------------------+ |
        |  | Rolling risk-trend store (local SQLite/CSV)      | |
        |  +-------------------------------------------------+ |
        |  | Icon + color + audio alert UI (Green/Amber/Red)  | |
        |  +-------------------------------------------------+ |
        |  | Store-and-forward sync (when connectivity found) | |
        |  +-------------------------------------------------+ |
        +-----------------------------------------------------+
```

**Why this split**: the on-arm MCU only needs to sample sensors, do light on-device filtering (or even just buffer raw/lightly-processed data), and transmit over BLE — keeping the worn unit small, light, and battery-frugal (target: days of runtime, not hours). The Pi handles the actual ML fusion model, the multi-hour/multi-day trend analysis that raises risk over time (matching SepAl's 9.8-hour lead-time framing), and the human-facing interface, exactly mirroring how JivaScope splits "on-device sensor capture" from "companion app AI report."

---

## 4. Hardware BOM

| Component                            | Purpose                                  | Example Part                                                          | Approx. Cost (per unit)           |
| ------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------- | --------------------------------- |
| PPG sensor                           | HR, HRV, SpO2, perfusion index           | MAX30102 breakout (DFRobot/generic)                                   | ₹250–400 (~$3–5)               |
| Digital temp sensor                  | Skin temperature (±0.1°C accuracy)     | MAX30205                                                              | ₹300–500 (~$4–6)               |
| IMU                                  | Activity level, respiration-effort proxy | LSM6DS3 (lower power) or MPU6050 (cheaper, easier to source in India) | ₹150–350 (~$2–4)               |
| Armband MCU                          | Sensor sampling + BLE transmit           | nRF52840 (e.g. Seeed Xiao nRF52840 Sense — has IMU onboard too)      | ₹700–1,200 (~$9–15)            |
| Battery                              | Power for armband                        | 150–300 mAh LiPo, protected + medical-grade encapsulated             | ₹150–300 (~$2–4)               |
| Enclosure                            | Soft, biocompatible band                 | Medical-grade silicone, custom molded or 3D-printed + silicone sleeve | ₹100–300 (~$1–4) for prototype |
| Base station                         | Runs ML fusion + UI                      | Raspberry Pi 4/5 (existing hardware)                                  | — (already owned)                |
| Base station display/speaker         | Alert UI                                 | Small LCD/OLED + piezo speaker or Pi's own screen/speaker             | ₹300–600 (~$4–8)               |
| BLE dongle (if Pi lacks onboard BLE) | Receive armband data                     | Most Pi 4/5 models have onboard BLE — likely unnecessary             | —                                |

**Estimated total per armband unit (prototype-grade): ~₹1,650–3,050 (~$20–38)** — comparable to JivaScope's ₹3,000 target price point, before accounting for the Pi base station (shared across many armbands in a ward/community setting, so amortized cost per baby is much lower).

---

## 5. Sensor Placement & Mechanical Design

- **Limb choice**: wrist or ankle band, sized for neonatal circumference (~7–11 cm). Ankle is often preferred clinically (less interference with feeding/holding, similar to hospital SpO2 probes which are commonly placed on the foot).
- **PPG placement**: photoplethysmography needs good skin contact and minimal motion artifact — a soft wraparound band with the sensor on the medial/plantar surface (like a pulse-ox foot probe) works better than a rigid wrist casing. Reference existing neonatal SpO2 probe designs (soft foam + adhesive wrap) for mechanical inspiration, adapted to a reusable band instead of single-use adhesive.
- **Temperature sensor placement**: must maintain firm skin contact (per BEMPU TempWatch's metal-cup-against-skin design) — same principle applies here, integrated into the band's inner surface.
- **IMU placement**: anywhere on the band is workable since it's tracking gross limb motion/activity level, not precise biomechanics.
- **Weight & safety**: total worn unit must stay under ~15–20g to avoid discomfort/skin marking on a newborn limb. No hard edges, no small detachable parts (choking hazard), band must not be capable of tightening (strangulation/constriction risk — use a soft stretch fabric or silicone with a fixed, non-cinching closure, following BEMPU's precedent of a fixed-size medical-grade silicone band available in size ranges rather than an adjustable strap that could over-tighten).
- **Biocompatibility**: skin-contact surfaces should use medical-grade silicone (same as BEMPU, Cradle VSA cuffs) — for a prototype, standard silicone bracelet stock + encapsulated electronics is an acceptable stand-in; note this is a *prototype* material choice, not a production-ready biocompatibility claim (see §9).

---

## 6. Firmware / On-Device Processing (Armband MCU)

Given nRF52840's Cortex-M4F headroom (256KB RAM, sensor fusion at 100Hz feasible per hardware research), the armband firmware should:

1. Sample PPG at ~100Hz, IMU at ~50-100Hz, temperature at ~1Hz (temperature changes slowly — no need for high sample rate).
2. Run lightweight on-device signal cleaning: motion-artifact rejection on PPG using IMU as a reference (standard technique — flag/discard PPG windows where IMU shows high motion), basic low-pass filtering.
3. Either (a) transmit lightly-processed raw windows over BLE for the Pi to do all feature extraction/fusion (simpler for a designathon build), or (b) — if time allows — run onboard peak-detection for instantaneous HR before transmission, reducing BLE payload. **Recommendation: start with (a) for the demo, since it's far faster to build and debug**, and mention (b) as the production-path optimization (matching SepAl's fully on-device TCN approach).
4. BLE advertise/notify sensor packets every 1–5 seconds (balances battery life against responsiveness — sepsis risk changes over hours, not seconds, so this cadence is clinically appropriate).
5. Local buffering (a few minutes) in case of momentary BLE disconnection (band moves out of range of base station briefly).

---

## 7. ML Model & Training Data Plan

### 7.1 Model architecture

Follow SepAl's precedent: a **small temporal convolutional network (TCN)**, quantized for edge deployment — but since our heavy compute lives on the **Raspberry Pi base station** (not the armband MCU), we have much more headroom than SepAl's Cortex-M33 target. A reasonable v1 approach:

- **Feature engineering layer**: from the raw/lightly-processed PPG, IMU, and temperature streams, compute rolling-window features every 1–5 min: mean/variance HR, HRV (SDNN or RMSSD), estimated respiratory rate (via PPG respiratory sinus arrhythmia modulation or IMU periodicity), activity-level score (IMU magnitude/variance), temperature (raw + rate of change), **plus the differentiation-driven features in §7.1.1 below** (PPG perfusion index, HR/temp ratio, HRV entropy/decelerations, inter-breath-interval variance).
- **Risk fusion model**: a small **gradient-boosted tree model (e.g. LightGBM/XGBoost)** or a compact 1D-CNN/TCN over the feature time-series, outputting a continuous sepsis-risk score. Gradient-boosted trees are strongly recommended for the designathon timeframe — they train fast on small/synthetic datasets, are easy to interpret/debug (important for a demo where you need to explain *why* an alert fired), and don't require GPU infrastructure.
- **Threshold-and-trend fusion as the primary demo-time logic**: rather than independent WHO IMCI thresholds simply OR'd together (which false-alarms on any common fever), implement the **breadth + trend composite logic in §7.1.1** — this is what actually answers "how is this different from a cold" in front of judges, and gives a working, clinically-grounded demo even if the learned model in the bullet above is still rough. It also serves as a sanity-check baseline against the ML model's output.
- Framework: **TensorFlow Lite** (or scikit-learn/LightGBM running natively in Python) on the Pi — no need for TensorFlow Lite Micro since the model runs on the Pi, not the MCU. Edge Impulse is a good option if the team wants a fast no-code path to train+deploy the on-armband motion/PPG feature extraction specifically.

### 7.1.1 Composite suspicion logic — differentiating sepsis from common illness

Full research and citations: [`web-research/sepsis-vs-common-illness-differentiation.md`](../web-research/sepsis-vs-common-illness-differentiation.md). This is the concrete rule set that replaces flat OR'd thresholds, built entirely from data our existing sensors (MAX30102, MAX30205, IMU) already produce — no new hardware required.

**Six feature groups, each scored for abnormality + worsening trend over a multi-hour rolling window:**

1. **Temperature direction + rhythm** — `temp ≥ 38.0°C` OR `temp < 35.5°C`, weighted **equally** (hypothermia is not a secondary case in neonates — see §2.3). Bonus low-weight feature: variance of temperature rate-of-change over 4–6h; a flattened/erratic curve scores above a normal fever's rise-plateau-fall shape.
2. **HR–temperature proportionality** — compute `Δ HR (bpm) / Δ Temp (°C)` vs. baseline. Expected band for simple fever ≈ 6–14 bpm/°C (Liebermeister's rule, with tolerance). Score risk up if HR deviates from this band in *either* direction (excess tachycardia or relative bradycardia), especially co-occurring with a temperature abnormality — never score this in isolation from the temp signal.
3. **HRV composite pattern (highest-weight feature)** — from PPG-derived RR-intervals over a rolling 6–12h window, compute the HeRO-style triad: (a) reduced HRV (SDNN/RMSSD vs. rolling personal baseline), (b) deceleration frequency/asymmetry, (c) reduced sample entropy (signal becoming pathologically *more regular*). Score risk only when multiple sub-components trend together and persist/worsen — a momentary dip during sleep or feeding must not trigger. Explicitly do not treat "HRV is low right now" as sepsis-specific on its own; viral illness lowers HRV too.
4. **Perfusion index trend** — compute PI (pulsatile/non-pulsatile PPG amplitude ratio, already available from the MAX30102) as a rolling baseline-relative trend, not an absolute value. A **declining PI trend**, especially co-occurring with HR/HRV abnormality, is weighted highly — mechanistically the closest proxy we have to circulatory shock, which common illness does not produce. Flag in the demo/pitch that PI–sepsis linkage is validated in adult septic-shock literature, not neonatal wearables — our most promising but least-validated-for-this-age-group signal.
5. **Respiratory irregularity, not just rate** — from the same IMU periodicity signal used for the RR-proxy, add inter-breath-interval variance / apnea-pause detection. `RR ≥ 60/min AND regular rhythm` scores as illness-consistent; `RR ≥ 60/min AND irregular/apneic pattern` scores substantially higher (sepsis-consistent, per preterm-infant apnea/bradycardia predictive literature).
6. **Activity/lethargy trend** — score low-activity readings against *response to intervention*: does activity rebound after feeding/holding (comfort-responsive, illness-consistent) vs. stay flat/declining regardless of caregiver action (sepsis-consistent)?

**The actual specificity lever — breadth-of-systems gating:** weight the composite score up disproportionately only when **≥3 of the 6 feature groups are simultaneously abnormal and trending in the same worsening direction over a multi-hour window** (mirroring PEWS/pSOFA multi-organ logic). A single abnormal parameter — e.g. isolated fever with a normal HR ratio, normal HRV, stable perfusion, regular breathing, and activity that recovers with comfort — should stay Green/Amber, never Red. This gate is the concrete mechanism that keeps a common cold from tripping a high-suspicion alert, and it is the strongest judge-facing answer to "how do you know this isn't just a fever": *a common illness perturbs 1–2 of these six systems and resolves; sepsis tends to perturb 3+ simultaneously and does not resolve without treatment.*

**Confidence framing (use this in the pitch):** this composite logic is a research-informed hypothesis assembled from validated adult/NICU/ICU literature and pediatric early-warning-score principles — the individual mechanisms are each independently well-evidenced, but their specific combination and weighting on a low-cost limb-worn sensor has not itself been clinically validated and would require a dedicated future study. State this plainly if asked; it demonstrates the team understands the difference between clinically-plausible triage logic and diagnostic-grade proof, which is the correct posture for a *screening triage aid* (§10), not a diagnostic device.

### 7.2 Training/validation data

No hospital NICU access in a designathon timeframe, so:

- **PhysioNet "Preterm Infant Cardio-Respiratory Signals Database"** — real ECG + respiration recordings from 10 preterm infants in a NICU. Usable for validating that respiration/HR feature extraction logic works on real neonatal physiological signal morphology, even though it's not sepsis-labeled.
- **PhysioNet/MIMIC-III/IV waveform databases** — broader ICU vital-sign waveform data (includes some neonatal ICU data) for pressure-testing the feature-extraction pipeline against realistic noisy sensor data.
- **Synthetic data generation for the sepsis-risk model itself**: since no open, sepsis-labeled neonatal wearable dataset exists publicly, the honest approach is to **simulate labeled training data** using WHO IMCI thresholds as ground truth generators — e.g., generate synthetic vital-sign trajectories (healthy baseline + simulated "deteriorating" trajectories with fever/hypothermia onset, HRV decline, reduced activity) and train/demo the fusion model on this simulated set. **Be explicit in the demo/pitch that this is a proof-of-concept trained on simulated + published physiological reference data, not clinically validated on real sepsis cases** — that validation step is explicitly future work requiring IRB-approved clinical partnership (mirrors how JivaScope itself went through 20+ prototype iterations before trusting real deployment).

---

## 8. Companion App / Alert UI (Raspberry Pi base station)

Following BEMPU/JivaScope/Cradle VSA precedent — **no numbers, no jargon, color + icon + audio only**:

- **Green**: all vitals within normal newborn range, steady trend. Slow-pulse green LED / calm icon, no sound.
- **Amber**: one or more vitals borderline, or a concerning trend developing (e.g., temperature drifting, HRV declining) — visual amber icon + gentle recurring chime, message equivalent to "keep watching, check again soon" (icon-based, e.g. an eye/clock icon).
- **Red**: WHO IMCI danger-sign threshold breached or high fused risk score — flashing red + louder alarm + simple "go to health center now" icon (matching Cradle VSA's traffic-light precedent).
- **Voice prompts** in local dialect for the alert meaning (reuse JivaScope's audio-prompt pattern) — critical for low-literacy caregivers/ASHA workers.
- **Offline-first**: all logic runs locally on the Pi; **store-and-forward** sync (matching JivaScope) pushes historical logs to a PHC/telemedicine backend whenever connectivity becomes available, for later clinical review or escalation.

---

## 9. Power & Battery Life Estimate

- nRF52840 in BLE advertising/notify mode at low duty cycle: single-digit µA in sleep, low mA during active radio bursts. With a 150–300 mAh LiPo and sensors sampled at modest rates (not continuous 100Hz always-on), a **multi-day runtime (2–5+ days) is a realistic target** for a well-optimized firmware — comparable in spirit to BEMPU TempWatch's 30-day single-charge target, though BEMPU's much simpler single-thermistor design achieves longer life than our multi-sensor band will. For the designathon prototype, don't over-optimize power — get it working first; note battery-life optimization as a clear post-hackathon engineering task.
- Raspberry Pi base station: mains-powered in a clinic/ward setting; for true field/home use, a battery-backed Pi (power bank) is a reasonable stopgap, matching JivaScope's rechargeable-battery approach for its own companion device.

---

## 10. Safety Considerations (awareness, not a compliance plan)

- **IEC 60601** (medical electrical equipment safety) is the relevant standard family for any device with intended clinical use — flag for future work, not a designathon deliverable.
- **Skin biocompatibility** (ISO 10993) matters for continuous infant skin contact — use silicone/materials with existing biocompatibility track records (as BEMPU does) even in the prototype, rather than arbitrary 3D-print plastics against skin.
- **Choking/strangulation hazard**: fixed-size non-cinching band, no small detachable parts, no cords longer than the band itself.
- **Thermal safety**: electronics must not generate noticeable heat against infant skin — keep duty cycles low, avoid continuous high-power BLE/radio bursts pressed against skin.
- **False-negative risk communication**: explicitly frame the device as a *screening triage aid*, not a diagnostic replacement — an amber/green reading should never be communicated as "definitely fine," consistent with how Cradle VSA and BEMPU frame their own outputs.

---

## 11. Realistic Designathon Build Plan

Assume a short build window (24–48 hours to a few days). Prioritize a **convincing, honest demo** over full production hardware.

**What to actually build:**

1. **Armband prototype**: breadboard or perfboard nRF52840 dev board (e.g. Seeed Xiao nRF52840 Sense, which conveniently has an onboard IMU already) + MAX30102 + MAX30205, wired up and taped/sewn into a soft fabric or silicone band form factor for visual demo purposes — it does not need to be neonatal-safe/production-encapsulated for a hackathon demo, just needs to *look and function* like the armband.
2. **Firmware**: sample sensors, BLE-transmit raw/lightly-filtered data to the Pi. This is the highest-value, most achievable piece in the time available.
3. **Pi base station app**: Python BLE receiver (e.g. `bleak` library) → feature extraction (HR/HRV from PPG peak detection, perfusion index from PPG amplitude, temperature trend, IMU activity score + breathing regularity) → the breadth + trend composite logic from §7.1.1 as the primary demo-time decision layer (fast to build, clinically defensible, easy to explain to judges — "we alert on a sepsis-shaped pattern across multiple independent systems, not one bad reading") → simple GUI (Tkinter/Kivy/web-based on the Pi's own screen) showing the traffic-light output + trend graph.
4. **ML layer as a stretch goal**: if time allows, train the LightGBM/simple-TCN fusion model on simulated data (per §7.2) and show it alongside/instead of the pure threshold logic — even a modest accuracy improvement narrative ("the model catches trend-based risk before a hard threshold would") is a strong pitch point.
5. **Demo script**: since you can't safely test on a real newborn, **simulate the "deteriorating" scenario live** — e.g., have a team member's hand/finger stand in for PPG+temp readings on a healthy baseline, then intentionally induce a controlled deviation (e.g., breathe on the temp sensor to raise it, or replay a pre-recorded "abnormal" data trace) to show the alert escalate from green → amber → red live in front of judges. Be transparent about this being a simulated physiological scenario, not a real infant test. **Strongly consider scripting two contrasting replay traces** — one "common fever" trace (isolated temp rise, HR ratio in-band, stable HRV/PI, regular breathing → stays Amber) and one "sepsis-shaped" trace (temp abnormality + disproportionate HR + degrading HRV + declining PI → escalates to Red) — this live side-by-side contrast is the single most persuasive way to demonstrate the breadth-gating logic from §7.1.1 and preempt the "isn't this just a fever?" question before a judge asks it.

**What to explicitly fake/simplify for the demo (and say so if asked):**

- Sepsis-risk ML model trained on simulated/synthetic + public reference data, not real clinical sepsis cases.
- Prototype enclosure is not medical-grade/biocompatible-certified — a stand-in for the intended silicone design.
- Respiratory rate is a *proxy* (from PPG modulation or IMU), not a direct chest-strap measurement — call this out as a known limitation and a clear v2 research item (a soft chest/abdomen band could measure this more directly, trading off comfort/compliance).

---

## 12. References

1. SepAl: Sepsis Alerts On Low Power Wearables With Digital Biomarkers and On-Device Tiny Machine Learning — [arXiv:2408.08316](https://arxiv.org/abs/2408.08316)
2. A novel digital health approach to improving global pediatric sepsis care in Bangladesh using wearable technology and machine learning — [PLOS Digital Health, Oct 2024](https://journals.plos.org/digitalhealth/article?id=10.1371%2Fjournal.pdig.0000634) / [PMC11524492](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11524492/)
3. World Health Organization Danger Signs to predict bacterial sepsis in young infants: A pragmatic cohort study — [PMC10662722](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10662722/)
4. Mortality risk associated with clinical signs of possible serious bacterial infection (PSBI) in young infants in Africa and Asia — [PMC12198825](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12198825/)
5. Heart rate analysis in neonatal sepsis: a complex equation — [PMC11798831](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11798831/)
6. PhysioNet Preterm Infant Cardio-Respiratory Signals Database / PhysioNet Databases — [physionet.org/about/database](https://www.physionet.org/about/database/)
7. MAX30102 High-Sensitivity Pulse Oximeter and Heart-Rate Sensor — [Analog Devices datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/max30102.pdf)
8. nRF52840 vs ESP32-S3 power/BLE comparison for wearables — [Zbotic](https://zbotic.in/nrf52840-vs-esp32-ble-5-0-module-comparison-for-wearables/), [BLEFYI](https://blefyi.com/compare/nrf52840-vs-esp32-s3/)
9. Internal research: BEMPU TempWatch, Cradle VSA, JivaScope, Neopenda neoGuard — `web-research/` directory in this repository (design-pattern precedents for wearable alert UX and offline architecture).
10. Sepsis vs. common illness differentiation — HeRO score, perfusion index, Liebermeister's rule, PEWS/pSOFA, and the full composite suspicion logic behind §2.3/§7.1.1 — [`web-research/sepsis-vs-common-illness-differentiation.md`](../web-research/sepsis-vs-common-illness-differentiation.md) (37 sources).
