# Neopenda neoGuard™: Technical & Architectural Research Report

> **Document Context**: Technical specifications, system architecture, and clinical deployment details of **neoGuard™** by Neopenda—a multi-parameter wireless wearable vital signs monitor for low-resource hospital wards.

---

## 1. Executive Summary & Overview

**neoGuard™** is a wireless, wearable continuous vital signs monitoring system created by **Neopenda** (co-founded by **Sona Shah** and **Teresa Cauvel** at Columbia University). Designed specifically for resource-constrained health facilities in low- and middle-income countries (LMICs), the system allows understaffed nursing teams to monitor up to 15 patients simultaneously from a single central tablet.

| Parameter | Key Specification / Feature |
| :--- | :--- |
| **Product Name** | neoGuard™ System |
| **Company / Founders** | Neopenda (Sona Shah & Teresa Cauvel) |
| **Monitored Vitals** | 4 Parameters: Pulse Rate (PR), Respiratory Rate (RR), Blood Oxygen (SpO2), Temperature |
| **Form Factor** | Compact, reusable headband/strap sensor module |
| **Wireless Tech** | Low-power Bluetooth Mesh / Wireless protocol to central dashboard tablet |
| **Target Population** | Neonates, infants, pediatric, and adult patients in low-resource wards |
| **Infrastructure Adaptation** | Built for unstable power grids, offline ward usage, and high patient-to-nurse ratios |

---

## 2. Technical Architecture & System Layout

```
    [ Patient 1 Headband ]  [ Patient 2 Headband ]  ...  [ Patient 15 Headband ]
             |                       |                            |
             +-----------------------+----------------------------+
                                     |
                       Low-Power Bluetooth Mesh
                                     v
       +-------------------------------------------------------+
       |             CENTRAL NURSE TABLET DASHBOARD            |
       |                                                       |
       |  * Simultaneous Real-time 15-Patient Vital Display    |
       |  * Customizable High/Low Threshold Alarm Limits       |
       |  * Visual (Red/Yellow Flash) & Auditory Ward Alerts    |
       |  * Offline Patient Data Storage & Trend Analytics     |
       +-------------------------------------------------------+
```

### 2.1 Wearable Sensor Module Specifications
* **Pulse Oximetry (SpO2 & PR)**: Uses reflectance optical sensor arrays to measure arterial oxygen saturation and pulse rate continuously.
* **Respiration Monitoring (RR)**: Measures breathing rate via impedance or optical motion sensing.
* **Skin Temperature**: Precision thermistor measuring peripheral body temperature.
* **Power & Reusability**: Rechargeable lithium-polymer battery designed for long shifts; sanitized between patients with standard hospital disinfectant wipes.

### 2.2 Central Tablet & Alert System
* **Multi-Patient Dashboard**: Displays live numerical readings and waveforms for up to 15 patients per tablet interface.
* **Intelligent Alarm Management**: Triggers immediate visual and audible alarms if vitals cross dangerous physiological thresholds (e.g., hypoxemia, bradycardia, fever), prioritizing critical patients for overworked nurses.
* **Grid Independence**: Wearable units and tablet operate on internal rechargeable batteries, ensuring uninterrupted monitoring during ward power outages.

---

## 3. Clinical Impact & Deployments

* **Origins**: Developed through human-centered design in Columbia University's biomedical engineering program and refined through field trials in East Africa (Uganda, Kenya).
* **Clinical Need**: Addresses neonatal and pediatric mortality in wards where 1 nurse may be responsible for 20+ critically ill infants without continuous monitoring equipment.

---

## 4. References

1. **Neopenda Official Site**: [neopenda.com](https://www.neopenda.com/)
2. **NIH / PubMed Studies**: Clinical feasibility evaluations of neoGuard™ in East African hospitals.
