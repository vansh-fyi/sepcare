# Camera-Based Dehydration Severity Screener (Capillary Refill + Skin Turgor AI)

> **Form factor**: handheld Raspberry Pi + camera device. No wearable. Point-of-care, single-interaction device used by an ASHA worker/caregiver during a home visit or clinic check for a child with diarrhea.

---

## 1. Overview / Problem

Diarrheal disease kills roughly **115,000 children under 5 in India every year** (WHO), and the deciding clinical question at the point of care is almost always the same: *how dehydrated is this child, right now, and does it need referral?* WHO's Integrated Management of Childhood Illness (IMCI) protocol answers this with a manual bedside exam — but the single best individual predictor in that exam, **capillary refill time (CRT)**, is normally eyeballed with a stopwatch or mental count by whoever is present. That's a measurement with known observer subjectivity (a systematic review found real inter-observer disagreement in manual CRT timing), and in a rural home visit the "whoever is present" is often an ASHA worker without clinical training in timing a sub-3-second physiological event precisely.

The insight (same shape as JivaScope/Schistoscope): the *test* already exists and is already the WHO-recommended standard — nothing new needs to be invented clinically. What's missing is a cheap way to make the *measurement* objective, repeatable, and interpretable by someone with no clinical background. A camera can time a color-return curve far more precisely than a human eye+stopwatch, and can do it consistently regardless of who's holding the device.

---

## 2. Clinical Basis

### 2.1 Capillary Refill Time (CRT) — primary signal

- **Protocol**: press the fingertip/nail bed (or sole of foot in infants) until it visibly blanches (typically 5 seconds of pressure), release, and time how long it takes for normal color to return.
- **Clinical thresholds** (WHO IMCI / pediatric emergency literature):
  - **< 2 s** — normal perfusion
  - **2–3 s** — borderline / watch
  - **≥ 3 s** — abnormal; WHO IMCI treats CRT ≥ 3s as a red-flag sign of shock/serious illness requiring urgent action
- CRT has been shown in a systematic review and meta-analysis to be **the best individual clinical predictor of acute dehydration in children** (Fleming et al., *PLOS ONE*, 2015 — [journals.plos.org/plosone/article?id=10.1371/journal.pone.0138155](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0138155); summary also at [Oxford PHC](https://www.phc.ox.ac.uk/news/capillary-refill-time-an-important-red-flag-in-children)).
- Important caveat surfaced in the literature: a *normal* CRT does not rule out serious illness — it's a strong positive predictor, weaker negative predictor. The device's messaging must reflect this (a "green" result should read as "no danger sign detected," not "child is fine").

### 2.2 WHO IMCI full dehydration classification (context for what CRT sits inside)

IMCI classifies a child with diarrhea into **severe / some / no dehydration**:

| Classification               | Criteria (≥2 of the following)                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Severe dehydration** | Lethargic/unconscious, sunken eyes, unable to drink or drinking poorly, skin pinch goes back*very slowly* (≥2s) |
| **Some dehydration**   | Restless/irritable, sunken eyes, thirsty/drinks eagerly, skin pinch goes back*slowly*                            |
| **No dehydration**     | Fewer than 2 of the above signs present                                                                            |

(Source: WHO Pocket Book of Hospital Care for Children, [&#34;Diarrhoea&#34; chapter, NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK154434/); classification summary via [Don&#39;t Forget the Bubbles](https://dontforgetthebubbles.com/high-and-dry-assessing-dehydration/) and [LITFL](https://litfl.com/paediatric-dehydration-assessment/).)

CRT is not formally one of the four canonical IMCI skin-pinch-based signs in the oldest IMCI charts, but it has since been strongly validated as a superior predictor and is increasingly recommended for inclusion in routine IMCI practice — this project's core contribution is exactly that: **operationalizing CRT into something an ASHA worker can execute at IMCI-comparable rigor without clinical training.**

**Skin turgor (skin pinch) caveat**: literature explicitly notes skin pinch is *confounded by malnutrition* — a malnourished-but-hydrated child can show a false "slow" skin pinch. This is a real limitation to disclose, not paper over, if skin turgor is added as a secondary signal.

### 2.3 Camera-assessed IMCI signs — what's realistic

| IMCI sign                | Camera-assessable?                                                                                                                                                                                                                                            | Notes                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Capillary refill time    | **Yes — primary target**                                                                                                                                                                                                                               | Well-suited to PPG-style color-curve analysis                                                                                              |
| Skin pinch/turgor        | **Partially, stretch goal**                                                                                                                                                                                                                             | Needs video of a pinch-and-release on back-of-hand/abdomen; fold-retraction speed via optical flow. Confounded by malnutrition (see above) |
| Sunken eyes              | Theoretically (facial landmark/eye-socket depth via image), but subjective even for clinicians and highest fairness/complexity risk —**out of scope for this build**                                                                                   |                                                                                                                                            |
| Lethargy / able to drink | Not sensor-assessable; requires human judgment — device should explicitly prompt the operator to also answer these as a manual checklist item (icon-based yes/no), fusing them with the camera-measured CRT score rather than pretending they're automatable |                                                                                                                                            |

---

## 3. Camera-Based CRT Measurement — Prior Art

This is *not* a novel measurement principle — the novelty is packaging it into a frugal offline rural point-of-care device, since no such device is on the market:

- **"Cap App"** (academic prototype): uses the phone's flash+camera as a photoplethysmography (PPG) sensor. The patient/operator presses a finger directly over the combined flash+camera. Blood is pressed out of the fingertip (mechanically blanching it), then released; the PPG amplitude and color brightness signal is tracked as blood returns, and the app times the return to a stable brightness plateau. It uses the phone's **accelerometer to detect the press/release motion event** so the timer starts and stops automatically instead of relying on a human pressing a stopwatch button in sync. ([Welltory summary of PPG-via-camera principle](https://help.welltory.com/en/articles/4412277-taking-measurements-with-your-smartphone-camera), [PubMed on smartphone HRV/PPG camera validation](https://pubmed.ncbi.nlm.nih.gov/26737985/))
- **MDPI 2025 paper, "Smartphone-Based Quantitative Measurement of Capillary Refill Time"** ([mdpi.com/2410-390X/10/1/15](https://www.mdpi.com/2410-390X/10/1/15)) — describes a quantitative smartphone CRT measurement system; full text was not directly accessible during this research pass (403 on fetch) but the abstract/indexing confirms this exact problem — camera-based, quantitative, automated CRT — is an active but still research-stage (not productized) area.
- **CRTApp** — a separate prospective clinical validation study (registered on ClinicalTrials.gov, [NCT07473869](https://clinicaltrials.gov/study/NCT07473869)) validating a smartphone app that "automatically measures capillary refill time from a video of standardized finger compression."
- **Ongoing NCT05472116 trial** ("Capillary Refill Time Measurement Utilizing Mobile Application in Children") — protocol has the child's hand positioned above heart level, a tripod-mounted camera, and a fixed 5-second manual compression before release, filmed for later CRT extraction. This is a good reference protocol to mirror for our own device's guided-capture step.

**Conclusion: no dominant commercial product.** Everything found is either an academic prototype, a registered-but-unpublished clinical trial, or a research paper — none are shipping consumer/clinical devices, and none are targeted at frugal/offline rural deployment. This confirms the space is open for the frugal-device angle specifically.

---

## 4. System Architecture

```
                    +--------------------------------------------------+
                    |         HANDHELD DEHYDRATION SCREENER              |
                    |                                                    |
                    |  +----------------------------------------------+  |
                    |  |  Pi Camera Module (macro-capable) + LED ring |  |
                    |  +----------------------------------------------+  |
                    |  |  Finger cradle / positioning guide           |  |
                    |  +----------------------------------------------+  |
                    |  |  Raspberry Pi Zero 2 W / Pi 4                |  |
                    |  +----------------------------------------------+  |
                    |  |  Small LCD/touchscreen OR audio-only + LEDs  |  |
                    |  +----------------------------------------------+  |
                    |  |  Power bank (USB-C, 5-10k mAh)               |  |
                    |  +----------------------------------------------+  |
                    +--------------------------------------------------+
                                       |
                          On-device Python CV pipeline
                                       v
                    +--------------------------------------------------+
                    |     CRT + (stretch) SKIN TURGOR ANALYSIS ENGINE  |
                    |                                                    |
                    |  * ROI tracking on nail bed / skin fold           |
                    |  * Color curve extraction (HSV/LAB)               |
                    |  * Blanch + refill event detection                |
                    |  * Refill-time-to-baseline calculation            |
                    |  * IMCI manual-checklist fusion (lethargy, thirst)|
                    |  * Traffic-light severity output                  |
                    +--------------------------------------------------+
```

No BLE/hub split is needed here (unlike the sepsis armband or heatstroke wearable) — this is a single self-contained handheld unit used for one-off spot checks, not continuous monitoring, so full Pi-class compute can sit directly in the device.

---

## 5. Hardware BOM

| Component                             | Recommendation                                                                                                              | Approx. Cost (INR / USD)                                    | Notes                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compute                               | **Raspberry Pi Zero 2 W** (preferred for cost/size) or Pi 4 (if more CV headroom needed for live demo responsiveness) | ₹1,500–1,800 / $18–22 (Zero 2 W); ₹5,000+ / $60+ (Pi 4) | Zero 2 W's quad-core A53 is enough for classical CV (no heavy deep model needed for CRT)                                                                                                                                                                                                                                         |
| Camera                                | **Raspberry Pi Camera Module 3** (autofocus, macro mode)                                                              | ₹2,200–2,800 / $25–35                                    | Standard module: 10cm min focus;**Camera Module 3 Wide**: 5cm min focus — prefer the Wide variant or add a clip-on macro lens for finger-bed framing ([Waveshare wiki](https://www.waveshare.com/wiki/Raspberry_Pi_Camera_Module_3), [Arducam deep-dive](https://blog.arducam.com/official-camera-module-3-a-closer-look/)) |
| Macro lens (if using standard module) | Clip-on macro lens add-on (~10-20mm working distance)                                                                       | ₹300–600 / $4–8                                          | Only needed if not using the Wide variant                                                                                                                                                                                                                                                                                        |
| Lighting                              | **Ring light LED module** (e.g. a small 5V addressable/fixed white LED ring around the lens)                          | ₹200–500 / $3–6                                          | **Critical**: color-based measurement must not depend on ambient light — a fixed, diffused, consistent light source removes a major source of measurement error and is non-negotiable for reliability                                                                                                                     |
| Finger cradle                         | 3D-printed or laser-cut small enclosure with a finger slot at fixed focal distance, light-shielding from ambient            | Printing cost only                                          | Standardizes hand position (mirrors the "hand above heart, tripod" protocol used in NCT05472116) so every reading is geometrically consistent                                                                                                                                                                                    |
| Display                               | Small**2.8"–3.5" Pi touchscreen or SPI LCD**, OR audio+3-LED (green/amber/red) output only, no screen                | ₹800–2,500 / $10–30 (screen) or near-zero (LED-only)     | For low-literacy use, LED traffic-light + audio prompts (Hindi/local-language) may be*more* appropriate than a screen — see JivaScope precedent                                                                                                                                                                               |
| Speaker                               | Small I2S/USB audio module or piezo buzzer + small speaker                                                                  | ₹150–400 / $2–5                                          | For voice-guided steps and audio result                                                                                                                                                                                                                                                                                          |
| Power                                 | USB-C power bank, 5,000–10,000 mAh                                                                                         | ₹700–1,200 / $9–15                                       | Multi-hour field use between charges                                                                                                                                                                                                                                                                                             |
| Enclosure                             | 3D-printed handheld case                                                                                                    | Printing cost only                                          | Should be rugged, wipeable (contact device — hygiene matters between patients)                                                                                                                                                                                                                                                  |
| **Total estimated BOM**         |                                                                                                                             | **≈ ₹6,000–10,000 (~$70–120)**                    | Comparable order of magnitude to JivaScope's target price point                                                                                                                                                                                                                                                                  |

---

## 6. Mechanical Design

- **Finger positioning guide**: a molded slot that the child's (or caregiver-assisted) finger slides into, fixing both the distance-to-lens (matching the macro lens's fixed focal range) and lateral position (keeping the nail bed centered in frame) — removes the two biggest sources of operator error (wrong distance = out of focus; wrong framing = ROI detection failure).
- **Ambient light shielding**: the cradle should partially enclose the fingertip so the ring light dominates the illumination and outdoor sun/indoor bulb variation doesn't skew color readings.
- **Press mechanism**: two viable approaches —
  1. **Operator-performed press** (simpler build): the ASHA worker presses the fingertip against a fixed clear window/lens cover for ~5 seconds (mirrors the clinical protocol and the "Cap App" approach of pressing against the phone itself) using an audio-guided "press... hold... now release" countdown; the accelerometer-equivalent on Pi (a cheap IMU add-on, or simply detecting the sudden blanch-color-drop in the video stream itself) marks the release event.
  2. **Mechanical press-plate** (higher-fidelity, more build effort): a small spring-loaded plate that the operator pushes down over a fixed time window, giving a hardware-timed, perfectly standardized press-release cycle. Recommended as a **stretch goal** — the software-only approach (1) is sufficient for a designathon MVP and is what the "Cap App" precedent already validates as workable.
- **Cleanability**: since fingertips from multiple children will contact the device, the finger-cradle surface should be a wipeable, non-porous material (e.g., a small acrylic/glass window) — a real deployment consideration worth mentioning in the pitch even if not deeply engineered for the demo.

---

## 7. Computer Vision / ML Pipeline

1. **Guided capture start**: audio/icon prompt tells operator to insert finger and press against the window; live video capture begins at the highest frame rate the camera module comfortably supports at low resolution (e.g., 60–90fps at a small cropped resolution is preferable to 30fps at full resolution — temporal resolution matters far more than spatial resolution here).
2. **ROI lock**: since the finger cradle fixes the finger position, the nail-bed/fingertip region of interest (ROI) can be a **fixed pixel region** defined by the cradle geometry — this avoids needing a fingertip-detection model at all for the MVP (a real engineering simplification: hardware constrains the problem so software doesn't have to solve open-world finger detection).
3. **Color signal extraction**: convert each frame's ROI to **HSV or LAB color space** (LAB's L-channel — perceptual lightness — is generally more robust to skin-tone hue variation than raw RGB brightness, since it separates lightness from color/hue information). Extract mean L (or V) value per frame → produces a brightness-over-time curve.
4. **Event detection**:
   - **Blanch phase**: while the operator is pressing, the curve should show the ROI blanched (elevated lightness — blood pushed out, skin appears paler) and roughly flat.
   - **Release event**: detected as the sharp drop in brightness (blood rushing back darkens/reddens the tissue) immediately after the flat blanched plateau — this transition point is timestamp T0.
   - **Refill/recovery**: track the brightness curve decaying back toward a **pre-press baseline** (captured in the first ~1 second of video before pressing, or immediately after release begins) — refill time = time from T0 until the signal returns to within a defined tolerance (e.g., 90–95%) of baseline.
5. **Skin-tone robustness — deliberate design choice**: **never use an absolute color/brightness threshold.** All detection must be **relative to each individual's own baseline reading**, captured fresh at the start of every test (pre-press frame(s) = that child's baseline "normal" color). This sidesteps the fairness/accuracy trap of calibrating on one skin tone and failing on others, since the algorithm only ever asks "how long until *this* signal returns to *its own* starting point," not "is this pixel value above some fixed number." This should be stated explicitly in any demo/pitch as the key fairness safeguard.
6. **Threshold-based severity output** (MVP — no ML model needed to start):
   - CRT < 2.0s → **Green** (normal)
   - CRT 2.0–3.0s → **Amber** (borderline, monitor / recheck)
   - CRT ≥ 3.0s → **Red** (abnormal, refer urgently)
   - This directly implements the WHO-cited clinical threshold, so classical signal processing (no trained classifier) is legitimately sufficient and defensible for the core MVP — a strength to state plainly in the pitch ("we're not using AI where a validated clinical rule already exists; the *AI/CV* value-add is making a subjective human-timed measurement objective and repeatable").
7. **Optional lightweight classifier upgrade (stretch goal)**: if time allows, a small model (e.g., gradient-boosted trees or 1D-CNN over the brightness-time curve) trained on team-collected reference curves could improve robustness against noisy curves (motion artifacts, imperfect press technique) beyond a hand-tuned threshold detector — but this is explicitly optional, not required for a working demo.
8. **IMCI checklist fusion**: alongside the CRT reading, present the operator with a simple icon-based Yes/No prompt for the other IMCI signs that can't be sensed (lethargy, drinking ability, thirst) — the final severity output combines the objective CRT reading with these manual inputs into an overall dehydration classification (no/some/severe), mirroring the real IMCI decision logic rather than reducing everything to CRT alone.

---

## 8. Data & Validation Plan (honest scoping)

- **Confirmed: no open, downloadable raw-video CRT dataset exists publicly.** What *does* exist is a Figshare dataset backing a systematic-review meta-analysis ([plos.figshare.com](https://plos.figshare.com/articles/dataset/_The_Diagnostic_Value_of_Capillary_Refill_Time_for_Detecting_Serious_Illness_in_Children_A_Systematic_Review_and_Meta_Analysis_/1545650)) — this is aggregated study-level data, not raw video/image data usable for CV training.
- **Designathon-realistic data plan**:
  1. **Self-collected pipeline validation**: team members record their own finger blanch/refill videos using the actual rig — sufficient to prove the CV pipeline correctly detects the press-release event and extracts a plausible refill-time number. This validates the *engineering*, not clinical accuracy.
  2. **Synthetic curve testing**: generate synthetic brightness-over-time curves (flat blanch → exponential-decay-style recovery at varied simulated "refill times") to unit-test the event-detection and timing logic independently of camera noise — useful for demonstrating the algorithm handles the 2s/3s threshold boundary correctly.
  3. **Skin-tone testing**: explicitly test the self-collected pipeline across as many different skin tones as the team can access (team members, volunteers) to demonstrate the baseline-relative (not absolute-threshold) design choice actually holds up — even a small n here is a meaningful, honest demo point.
  4. **Explicitly out of scope / future work**: any claim of clinical-grade accuracy, validation against real dehydrated pediatric patients, or comparison against a clinician's manual CRT reading on actual sick children. State this directly in the pitch: *"the core clinical rule (CRT ≥3s) is already WHO-validated; what we've prototyped is the measurement instrument, and clinical validation of our specific instrument against trained clinicians is the necessary next step, not something a designathon timeline permits."*

---

## 9. Companion UI (low-literacy, ASHA-worker-facing)

- **Step-by-step audio + icon flow** (local language voice prompts), same design language as JivaScope's icon-based, color-coded, audio-guided interface:
  1. Icon: "insert child's finger into the slot" (animated/illustrated cradle graphic)
  2. Audio: "press down now" → countdown beep/tone for ~5 seconds
  3. Audio: "let go" → screen/LED shows a live progress spinner while measuring
  4. Manual checklist icons (tap Yes/No): is the child unusually sleepy/hard to wake? Is the child drinking normally?
  5. **Traffic-light result**: Green/Amber/Red with a simple icon (droplet icon, e.g. full droplet = hydrated, cracked/empty droplet = severe) + audio readout of recommended action ("give ORS and monitor" / "refer to PHC now")
  6. Optional: log entry saved locally (child ID/visit) for store-and-forward sync when connectivity is available later — same store-and-forward pattern used by JivaScope and Khushi Baby.
- **Stretch goal — skin turgor**: if the CRT MVP is working well ahead of time, add a second guided step (pinch skin on back of hand, release, camera times fold-retraction via simple optical-flow tracking on the skin-fold edge) and fuse both signals into the final severity score. Treat this as bonus scope, not core deliverable — the CRT-only MVP is already a complete, demonstrable, clinically-grounded product on its own.

---

## 10. Power & Portability

- Fully battery-powered (power bank), no mains/internet dependency, matching the "no internet, electricity, or doctor required" thesis shared across all reference devices in this space.
- Estimated runtime: several hours of intermittent use per charge on a Pi Zero 2 W (much lower draw than continuous video streaming — this device only runs the camera pipeline in short bursts per test, not continuously).
- Fully offline: entire CV pipeline runs on-device in Python (OpenCV + numpy is sufficient for the MVP; no cloud inference, no internet dependency).

---

## 11. Realistic Designathon Build Plan (~24–48 hrs, extendable to a few days)

| Phase                               | Time                  | Deliverable                                                                                                                                                                                 |
| ----------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hour 0–4**                 | Setup                 | Pi + camera module wired and streaming; basic OpenCV frame-grab loop running; fixed-ROI cropping tested                                                                                     |
| **Hour 4–10**                | Core CV               | HSV/LAB color-curve extraction from live video; manual "press finger, release" test with a team member's finger, confirm a visible blanch/recovery signal in the extracted brightness curve |
| **Hour 10–16**               | Event detection       | Implement blanch-plateau detection + release-event detection + baseline-relative refill-time calculation; validate against a stopwatch-timed manual test as a sanity check                  |
| **Hour 16–22**               | Enclosure + lighting  | 3D-print or hand-build the finger cradle + mount the ring light; re-test pipeline under the new fixed-lighting conditions (this often changes calibration — budget real time for it)       |
| **Hour 22–30**               | Thresholds + UI       | Wire up green/amber/red LED or screen output using the WHO 2s/3s thresholds; add audio prompts for the guided capture flow                                                                  |
| **Hour 30–36**               | IMCI checklist fusion | Add the manual Yes/No icon prompts (lethargy, drinking) and combine into final severity output                                                                                              |
| **Hour 36–44**               | Testing & polish      | Test across multiple team members' fingers/skin tones; tune the baseline-relative tolerance; polish enclosure and audio wording                                                             |
| **Hour 44+** (if time allows) | Stretch goals         | Skin-turgor second signal; lightweight classifier upgrade; store-and-forward local logging                                                                                                  |

**What to demo live**: the full guided flow — finger insertion → press/release prompt → live CRT measurement → traffic-light result — on a team member's own hand, in real time, is a strong, honest, fully-functional live demo (no data or model needs to be faked; the core CV pipeline is genuinely running).

**What to be upfront about in the pitch**: no clinical validation against real dehydrated children has been performed (impossible/unethical within a designathon), and the skin-turgor/sunken-eyes/lethargy signals beyond CRT are either manual-checklist inputs or stretch goals, not automated in the MVP.

---

## 12. References

1. Fleming, S. et al. "The Diagnostic Value of Capillary Refill Time for Detecting Serious Illness in Children: A Systematic Review and Meta-Analysis." *PLOS ONE*, 2015. [journals.plos.org/plosone/article?id=10.1371/journal.pone.0138155](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0138155)
2. Oxford Nuffield Dept. of Primary Care Health Sciences — "Capillary refill time - an important red flag in children." [phc.ox.ac.uk](https://www.phc.ox.ac.uk/news/capillary-refill-time-an-important-red-flag-in-children)
3. WHO — "Diarrhoea," *Pocket Book of Hospital Care for Children*, NCBI Bookshelf. [ncbi.nlm.nih.gov/books/NBK154434](https://www.ncbi.nlm.nih.gov/books/NBK154434/)
4. "Assessing Dehydration" — Don't Forget the Bubbles (pediatric emergency medicine reference). [dontforgetthebubbles.com](https://dontforgetthebubbles.com/high-and-dry-assessing-dehydration/)
5. "Paediatric Dehydration Assessment" — LITFL. [litfl.com/paediatric-dehydration-assessment](https://litfl.com/paediatric-dehydration-assessment/)
6. "Smartphone-Based Quantitative Measurement of Capillary Refill Time." *Diagnostics* (MDPI), 2025. [mdpi.com/2410-390X/10/1/15](https://www.mdpi.com/2410-390X/10/1/15)
7. "Taking measurements with your smartphone camera" (PPG-via-camera principle explainer) — Welltory. [help.welltory.com](https://help.welltory.com/en/articles/4412277-taking-measurements-with-your-smartphone-camera)
8. "Real time heart rate variability assessment from Android smartphone camera photoplethysmography." *PubMed*, 2016. [pubmed.ncbi.nlm.nih.gov/26737985](https://pubmed.ncbi.nlm.nih.gov/26737985/)
9. "Smartphone Application for Automated Measurement of Capillary Refill Time (CRT)" — registered clinical trial NCT07473869. [clinicaltrials.gov/study/NCT07473869](https://clinicaltrials.gov/study/NCT07473869)
10. "Capillary Refill Time Measurement Utilizing Mobile Application in Children" — clinical trial protocol NCT05472116. [cdn.clinicaltrials.gov PDF](https://cdn.clinicaltrials.gov/large-docs/16/NCT05472116/Prot_SAP_000.pdf)
11. Raspberry Pi Camera Module 3 specifications — Waveshare Wiki. [waveshare.com/wiki/Raspberry_Pi_Camera_Module_3](https://www.waveshare.com/wiki/Raspberry_Pi_Camera_Module_3)
12. "Raspberry Pi Camera Module 3: An In-Depth Look" — Arducam Blog. [blog.arducam.com](https://blog.arducam.com/official-camera-module-3-a-closer-look/)
13. Figshare dataset (meta-analysis level data, not raw video) — [plos.figshare.com](https://plos.figshare.com/articles/dataset/_The_Diagnostic_Value_of_Capillary_Refill_Time_for_Detecting_Serious_Illness_in_Children_A_Systematic_Review_and_Meta_Analysis_/1545650)
