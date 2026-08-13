# BEMPU TempWatch: Technical & Architectural Research Report

> **Document Context**: Technical specifications, background, and operational mechanics of the **BEMPU TempWatch**, a wearable continuous hypothermia-monitoring bracelet for newborns.

---

## 1. Executive Summary & Overview

The **BEMPU TempWatch** is an affordable, wearable medical device designed to monitor newborn skin temperature continuously for up to 30 days. Developed by biomedical engineer **Ratul Narain** (Bempu Health, Bangalore), the device addresses **neonatal hypothermia**—a leading preventable cause of newborn death in low-resource settings.

| Parameter | Key Specification / Feature |
| :--- | :--- |
| **Product Name** | BEMPU TempWatch |
| **Developer / Company** | Ratul Narain / Bempu Health (Bangalore, India) |
| **Target Condition** | Neonatal Hypothermia (Skin temperature dropping below 36.5°C / 97.7°F) |
| **Accolades & Support** | TIME Top 25 Inventions of 2017, Gates Foundation, USAID, Grand Challenges Canada |
| **Sensor Mechanism** | Precision thermistor sensor in direct skin-contact metallic cup |
| **Alert Output** | Visual LED (Blue = Normal, Flashing Orange = Hypothermia) + Audio Alarm |
| **Battery / Power** | Built-in non-replaceable battery (1-month continuous usage) or 10x rechargeable version |
| **Weight & Form Factor** | Medical-grade silicone wristband (~8 – 12 grams) |

---

## 2. Synthesis of Repository & Research Context

In the repository's internal research notes ([`research/bipul-research.md`](file:///Users/hp/Desktop/Work/Repositories/Segue%203.0/research/bipul-research.md#L43-L45)), the BEMPU TempWatch is highlighted as an ideal example of frugal, human-centered hardware design:

> *"Components: one thermistor (temperature sensor), a tiny microcontroller, an LED, and a speaker that's the entire device. It's a silicone bracelet worn on a newborn's wrist that continuously monitors temperature for up to a month, flashing a light and sounding an alarm when the temperature drops below 36.5°C, alerting even caregivers with low health literacy. The insight, not the tech: hypothermia is one of the leading preventable causes of newborn death in India, but most hospitals don't monitor it continuously because staff are stretched thin, and most parents don't know to check for it at home."*

---

## 3. How It Is Built: Technical Specifications

```
       +-------------------------------------------------------+
       |               BEMPU TEMPWATCH HARDWARE                |
       |                                                       |
       |  +-------------------------------------------------+  |
       |  |  Medical-Grade Biocompatible Silicone Wristband |  |
       |  +-------------------------------------------------+  |
       |  |  Skin-Contact Metallic Cup with Thermistor     |  |
       |  +-------------------------------------------------+  |
       |  |  Ultra-Low Power Microcontroller Engine         |  |
       |  +-------------------------------------------------+  |
       |  |  Dual-Color Status LED (Blue / Flashing Orange) |  |
       |  +-------------------------------------------------+  |
       |  |  Piezoelectric Audio Speaker / Buzzer           |  |
       |  +-------------------------------------------------+  |
       |  |  30-Day Long-Life Internal Coin Battery         |  |
       |  +-------------------------------------------------+  |
       +-------------------------------------------------------+
```

### 3.1 Sensor & Enclosure Design
* **Thermal Sensor**: Highly accurate negative temperature coefficient (NTC) thermistor housed inside a metal cup that rests directly against the baby's wrist skin.
* **Silicone Strap**: Soft, hypo-allergenic silicone band engineered to fit low-birth-weight neonates (0.8 kg to 5.0 kg).
* **Zero Calibration Required**: Pre-calibrated at the factory; starts tracking immediately upon application.

### 3.2 Alert Logic & Interventions
* **Normal Status (Blue LED)**: Flashes blue every few seconds when skin temperature remains safely at or above **36.5°C**.
* **Hypothermia Alert (Flashing Orange LED + Sounding Alarm)**: Triggers continuously when skin temperature falls below **36.5°C**.
* **Actionable Caregiver Protocol**: Instructs parents and nurses to immediately initiate **Kangaroo Mother Care (KMC)**—skin-to-skin contact—to re-warm the infant.

---

## 4. Operational Versions & Global Impact

1. **Standard Single-Use Version**: Operates 24/7 for **30 continuous days**, matching the critical neonatal period. Requires no charging or maintenance.
2. **Multi-Use Version (TempWatch 10x)**: Features a micro-USB rechargeable battery for clinical reuse across up to 10 infants per year in hospital wards.

---

## 5. References

1. **TIME Magazine**: *Top 25 Inventions of 2017 - BEMPU TempWatch*
2. **Bempu Health Official Site**: [bempu.com](https://www.bempu.com/)
3. **Workspace Notes**: [`research/bipul-research.md`](file:///Users/hp/Desktop/Work/Repositories/Segue%203.0/research/bipul-research.md)
