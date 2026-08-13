# JivaScope: Comprehensive Technical & Architectural Research Report

> **Document Context**: This research report aggregates findings on **JivaScope**, an AI-powered pocket-sized point-of-care diagnostic device. It incorporates insights from internal research notes (`research/bipul-research.md`), James Dyson Award submission records, technical specifications, and official company incorporation filings.

---

## 1. Executive Summary & Overview

**JivaScope** is an innovative, pocket-sized, AI-driven diagnostic device engineered specifically for self-screening and frontline triage of heart and lung conditions in rural and low-resource environments. Developed by **Tunir Sahoo** (IIM Kashipur), the project earned national acclaim as the **James Dyson Award (India National Winner 2025)** and led to the incorporation of **JIVASCOPE PRIVATE LIMITED** in March 2026.

| Parameter | Key Specification / Feature |
| :--- | :--- |
| **Product Name** | JivaScope |
| **Inventor / Lead Founder** | Tunir Sahoo (IIM Kashipur) |
| **Corporate Entity** | JIVASCOPE PRIVATE LIMITED (Inc. March 20, 2026; Midnapore, West Bengal, India) |
| **Primary Target Price** | Approx. ₹3,000 INR (~$36 USD) |
| **Core Award Recognition** | James Dyson Award 2025 (India National Winner) |
| **Primary Operating Modality** | Offline, off-grid point-of-care acoustic screening (No internet, electricity grid, or doctor required) |
| **Primary Target Users** | ASHA workers (Accredited Social Health Activists), frontline community health workers, low-literacy individuals |

---

## 2. Synthesis of Bipul's Research Notes

In the repository's internal research framework ([`research/bipul-research.md`](file:///Users/hp/Desktop/Work/Repositories/Segue%203.0/research/bipul-research.md#L27-L37)), **JivaScope** is highlighted under *Diagnostics, Screening, And Point-Of-Care Devices* alongside iconic frugal innovations (e.g., *Schistoscope*, *OncoALERT*, *Ayu Devices*, *SanketLife ECG*, *BEMPU TempWatch*).

### Key Insights from Bipul's Notes:
1. **Core Problem Solved**:
   > *"A pocket sized AI device for self screening heart and lung disease without needing a doctor, internet, or electricity, designed specifically to bring clinical-grade diagnostics to rural and low resource settings in India, with UI adapted for low literacy users."*
2. **Strategic Paradigm (Pushing Diagnostics Downstream)**:
   - Bipul's notes compare JivaScope's design thesis directly to the **Schistoscope**: *"pushing lab-grade diagnostic capability down to whoever is actually present, not whoever is credentialed."*
   - In rural India, access to a cardiologist or pulmonologist often requires long travel, high costs, and multi-day waiting periods. JivaScope compresses this chain into a immediate on-site acoustic screening, decoupling the physical gathering of diagnostic data from specialist credentials.

---

## 3. How JivaScope Is Built: Technical & Hardware Specifications

JivaScope was developed through more than **20 iterative prototypes** to refine both acoustics and physical ergonomics for rugged field usage.

```
       +-------------------------------------------------------+
       |                  JIVASCOPE HARDWARE                   |
       |                                                       |
       |  +-------------------------------------------------+  |
       |  |  MEMS Acoustic Sensors (20 Hz - 2000 Hz)       |  |
       |  +-------------------------------------------------+  |
       |  |  Infrared (IR) Position & Surface Sensors       |  |
       |  +-------------------------------------------------+  |
       |  |  Haptic Actuators / Vibration Feedback          |  |
       |  +-------------------------------------------------+  |
       |  |  ARM Cortex-M Microcontroller (Onboard AI Engine)|  |
       |  +-------------------------------------------------+  |
       |  |  Real-time Hardware/Algorithmic Noise Canceler  |  |
       |  +-------------------------------------------------+  |
       |  |  Bluetooth 5.2 Low Energy (BLE) Module           |  |
       |  +-------------------------------------------------+  |
       +-------------------------------------------------------+
                                  |
                      Bluetooth 5.2 BLE Connection
                                  v
       +-------------------------------------------------------+
       |             COMPANION MOBILE APPLICATION              |
       |                                                       |
       |  * 4-Zone Chest Placement Visual Guide                |
       |  * Low-Literacy Icon-Based & Audio UI                 |
       |  * Local Offline AI Diagnostic Report Generation       |
       |  * Store-and-Forward Telemedicine Data Logging        |
       +-------------------------------------------------------+
```

### 3.1 Sensor Array & Acoustic Hardware
* **MEMS Acoustic Transducers**: High-sensitivity Micro-Electro-Mechanical Systems (MEMS) acoustic sensors capture mechanical sound waves generated by heart valve closures and pulmonary airflow.
* **Frequency Spectrum**: Operates across **20 Hz to 2000 Hz**, effectively capturing:
  * Low-frequency cardiac signals: S1/S2 heart sounds, third/fourth heart sounds (S3/S4), and low-pitch diastolic/systolic murmurs (20 Hz – 500 Hz).
  * Mid-to-high frequency respiratory signals: Bronchial sounds, wheezes (COPD/asthma), crackles/rales (pneumonia/pulmonary edema) up to 2000 Hz.
* **Real-Time Noise Cancellation**: Features hardware acoustic shielding combined with digital noise cancellation algorithms to isolate physiological body sounds from ambient noise (e.g., cattle, voices, wind).

### 3.2 Microcontroller & Onboard Processing
* **Processor Architecture**: Embedded **ARM Cortex-M** low-power series microcontroller.
* **Edge AI Engine**: Executes quantized machine learning / deep neural network models directly on-chip. The models were trained on thousands of annotated clinical auscultation recordings.
* **Zero Grid/Cloud Dependence**: The AI inference engine executes entirely offline on the microcontroller and connected mobile device, requiring no active cloud servers or internet connections.

### 3.3 Guidance & Haptic Electronics
* **Infrared (IR) Guidance**: Integrated IR sensors verify firm, perpendicular contact with skin and assist in validating device positioning.
* **Haptic Actuators**: Provides tactile vibration feedback to notify the operator when proper placement and contact pressure are achieved for recording.

### 3.4 Wireless Connectivity & Power Supply
* **Bluetooth 5.2 (BLE)**: Low Energy wireless pairing transfers compressed acoustic data and diagnostic logs to smartphones or tablets.
* **Battery & Power System**: Operates on an internal rechargeable lithium-ion battery, engineered for low power draw to support days of field screening on a single charge.

---

## 4. How JivaScope Tracks Its Stuff & Conducts Diagnostics

### 4.1 4-Zone Chest Placement Protocol
To standardize auscultation without professional medical training, JivaScope uses a structured **4-Zone Chest Protocol**:
1. **Cardiac Quadrants**: Standardized positions corresponding to aortic, pulmonic, tricuspid, and mitral cardiac valves.
2. **Pulmonary Quadrants**: Upper and lower lung lobes on both left and right thoracic sides.

### 4.2 Guidance & Feedback Mechanism
During a screening, the device and companion app work in tandem:
1. **Visual Positioning**: The app displays graphical, non-text indicators pointing to one of the 4 chest zones.
2. **IR Contact Check**: IR sensors verify proximity and proper contact with the patient's chest.
3. **Haptic Confirmation**: The device vibrates once optimal placement is detected, signaling the user to hold still while recording.
4. **Automated Acoustic Capture**: Sound data is recorded for a fixed interval per zone while noise cancellation filters out external interference.

### 4.3 AI Signal Classification & Abnormalities Detected
The onboard/local AI evaluates acoustic signatures against clinical baseline patterns:

```
                          [ Acoustic Waveform Input ]
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
         [ Cardiac Acoustics ]                   [ Pulmonary Acoustics ]
                   |                                       |
        +----------+----------+                 +----------+----------+
        |                     |                 |                     |
        v                     v                 v                     v
   [ Murmurs /           [ Arrhythmias /     [ Wheezes /           [ Crackles /
  Valvular Defects ]    Gallop Rhythms ]    Asthma / COPD ]      Pneumonia / Edema ]
```

* **Cardiac Abnormalities**: Detects heart murmurs (systolic/diastolic), gallop rhythms, irregular heartbeats (arrhythmias), and structural valve abnormalities.
* **Pulmonary Abnormalities**: Identifies high-pitched continuous wheezing (asthma, COPD), discontinuous explosive crackles/rales (pneumonia, pulmonary edema, lung fibrosis), and abnormal breath sound suppression.

### 4.4 Low-Literacy UI & Patient Data Tracking
* **Visual & Icon-Driven Interface**: Designed specifically for low-literacy users and community health workers (e.g., ASHA workers):
  * **Color-Coded Statuses**: Green (Normal/Healthy), Yellow (Borderline/Monitor), Red (Abnormal/Immediate Referral).
  * **Audio Prompts**: Voice-guided step-by-step instructions in local dialects.
* **Zone-Wise Health Report**: Produces a standardized visual matrix mapping diagnostic findings across the 4 chest zones.
* **Offline Data Storage & Store-and-Forward Telemedicine**:
  * Diagnostic records, acoustic audio files, and zone reports are indexed with patient IDs and saved locally in offline encrypted storage.
  * When a frontline worker enters an area with mobile connectivity (cellular data/Wi-Fi), the app automatically syncs the logs to central electronic health record (EHR) platforms or forwards abnormal reports to Primary Health Centre (PHC) medical officers for formal tele-consultation and treatment planning.

---

## 5. Summary Matrix & Feature Breakdown

| Domain | Feature / Specification | Purpose & Benefit |
| :--- | :--- | :--- |
| **Acoustics** | 20 Hz – 2000 Hz MEMS Sensors | Captures low-freq heart sounds (S1/S2/murmurs) & high-freq lung sounds (wheezes/crackles) |
| **Compute** | Onboard ARM Cortex-M Microcontroller | Runs lightweight edge AI models without needing cloud or high-performance PCs |
| **Guidance** | Infrared (IR) + Haptic Vibration Feedback | Ensures non-credentialed users place the device accurately on 4 chest zones |
| **Noise Control**| Hardware Shielding + Real-time Noise Filtering | Allows clear sound capture in noisy rural field environments |
| **UI/UX** | Icon-Based, Color-Coded, Audio-Guided UI | Tailored for low-literacy users and ASHA workers |
| **Connectivity**| Bluetooth 5.2 BLE | Low-power pairing with basic Android/iOS smartphones |
| **Data Sync** | Local Storage + Store-and-Forward Cloud Sync | Enables offline diagnostic tracking and remote doctor tele-referrals |
| **Economy** | Target price of ~₹3,000 (~$36 USD) | Affordable point-of-care screening for public healthcare networks |

---

## 6. References & Data Sources

1. **Workspace Research**: [`research/bipul-research.md`](file:///Users/hp/Desktop/Work/Repositories/Segue%203.0/research/bipul-research.md)
2. **James Dyson Award**: *JivaScope - India National Winner 2025* ([jamesdysonaward.org](https://www.jamesdysonaward.org/))
3. **Corporate Registration**: *JIVASCOPE PRIVATE LIMITED* (Incorporated March 20, 2026; Ministry of Corporate Affairs, India)
4. **Media Coverage & Technical Publications**: *India Today*, *The Hindu*, *Hindustan Times*, *Digital Health News*, *Medical Buyer India*.
