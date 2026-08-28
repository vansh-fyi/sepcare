# Eko CORE 500™ Digital Stethoscope: Technical & Architectural Research Report

> **Document Context**: Comprehensive technical specifications and architectural overview of the **Eko CORE 500™ Digital Stethoscope**, integrating high-fidelity audio, 3-lead ECG visualization, and FDA-cleared AI disease detection.

---

## 1. Executive Summary & Overview

The **Eko CORE 500™** is an advanced digital stethoscope developed by **Eko Health**. It represents a major leap in point-of-care cardiovascular and pulmonary screening by combining **40x acoustic amplification**, active noise cancellation, a **full-color chestpiece display**, and **3-lead ECG sensing** backed by FDA-cleared artificial intelligence algorithms.

| Parameter | Key Specification / Feature |
| :--- | :--- |
| **Product Name** | Eko CORE 500™ Digital Stethoscope |
| **Manufacturer** | Eko Health, Inc. |
| **Acoustic Amplification** | Up to 40x sound amplification (7 volume levels) |
| **ECG Capability** | Integrated 3-lead ECG (3 chestpiece electrodes) |
| **Display** | On-device full-color display (ECG waveform, heart rate, filter mode, battery) |
| **AI Classifications** | Structural murmurs, Atrial Fibrillation (AFib), Tachycardia, Bradycardia |
| **Battery Life** | Up to 60 hours of continuous clinical use (USB-C rechargeable) |
| **Audio Tech** | TrueSound™ Active Noise Cancellation with 3 audio filter modes |

---

## 2. Technical & Hardware Specifications

```
       +-------------------------------------------------------+
       |               EKO CORE 500 HARDWARE                   |
       |                                                       |
       |  +-------------------------------------------------+  |
       |  |  3 Integrated Electrodes (3-Lead ECG Capture)   |  |
       |  +-------------------------------------------------+  |
       |  |  Piezoelectric Acoustic Sensor Array           |  |
       |  +-------------------------------------------------+  |
       |  |  TrueSound Active Noise Cancellation Module     |  |
       |  +-------------------------------------------------+  |
       |  |  Full-Color OLED/LCD Chestpiece Display         |  |
       |  +-------------------------------------------------+  |
       |  |  In-Ear Speaker Acoustics & Volume Controls     |  |
       |  +-------------------------------------------------+  |
       |  |  Bluetooth Low Energy (BLE) Wireless Transceiver|  |
       |  +-------------------------------------------------+  |
       +-------------------------------------------------------+
                                  |
                        BLE Stream to Eko App
                                  v
       +-------------------------------------------------------+
       |               EKO AI ANALYSIS SUITE                   |
       |                                                       |
       |  * Cardiac Murmur Detection Algorithm                 |
       |  * AFib & Arrhythmia Pattern Classifier              |
       |  * Heart Rate (BPM) Calculation                       |
       |  * Cloud/Local EHR Tele-Consultation Integration      |
       +-------------------------------------------------------+
```

### 2.1 Acoustic & Audio Features
* **40x Amplification**: Amplifies body sounds up to 40 times higher than traditional acoustic stethoscopes.
* **TrueSound™ Technology**: Uses high-fidelity digital signal processing and active noise cancellation to attenuate ambient room sounds and friction artifacts.
* **Selectable Audio Filters**:
  1. *Cardiac Mode*: Optimizes low frequencies (20 Hz – 200 Hz) for heart valves and S1/S2/S3/S4 sounds.
  2. *Pulmonary Mode*: Optimizes mid-to-high frequencies (100 Hz – 2000 Hz) for lung sounds (wheezing, crackles).
  3. *Wide Mode*: Broad spectrum (20 Hz – 2000 Hz) for general assessment.

### 2.2 Integrated 3-Lead ECG & Visual Display
* **3-Lead ECG Sensors**: Embedded stainless-steel electrodes on the chestpiece frame record electrical cardiac activity simultaneously with acoustic auscultation.
* **Color Display Screen**: Located directly on the chestpiece housing, rendering:
  * Real-time ECG waveforms and numerical Heart Rate (BPM).
  * Active filter setting and volume level.
  * Battery status and Bluetooth connection confirmation.

### 2.3 Onboard Power & Build Engineering
* **Battery**: Internal lithium-ion battery supporting up to 60 hours of operation per charge via standard **USB-C**.
* **Ruggedness**: Drop-tested up to 6 feet; splash and shatter-resistant construction weighing approx. 186g (6.6 oz).

---

## 3. Software & AI Capabilities

When paired with the **Eko App**, the system executes FDA-cleared AI algorithms:
* **Structural Murmur Detection**: Classifies presence and timing of cardiac murmurs (systolic vs. diastolic).
* **Arrhythmia Detection**: Identifies Atrial Fibrillation (AFib), Bradycardia (<50 BPM), and Tachycardia (>100 BPM).
* **Telemedicine Sync**: Allows clinicians to record, bookmark, visual-analyze, and securely share audio-ECG clips within EHR systems.

---

## 4. References

1. **Eko Health Official Site**: *Eko CORE 500™ Product Specifications* ([ekohealth.com](https://www.ekohealth.com/))
2. **FDA Clearances**: FDA 510(k) clearances for Eko AI Murmur and Arrhythmia Detection Algorithms.
