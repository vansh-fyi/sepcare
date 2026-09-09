# Parts List — SepCare Band Prototype

Cheap, off-the-shelf components for a first working prototype. Prices are approximate (India, retail, single-unit).

| # | Part | Purpose | Approx. Price (INR) |
|---|------|---------|----------------------|
| 1 | ESP32 Dev Board (e.g. ESP32-WROOM-32 / NodeMCU-32S) | WiFi MCU, core controller | ₹350–450 |
| 2 | MAX30102 Pulse Oximeter & Heart-Rate Sensor Module | Heart rate, HRV, SpO2 (perfusion) | ₹250–350 |
| 3 | MAX30205 or DS18B20 Temperature Sensor | Body temperature | ₹150–250 |
| 4 | MPU6050 Accelerometer + Gyroscope Module | Activity / motion detection | ₹120–180 |
| 5 | 3.7V LiPo Battery (500–1000mAh) | Portable power | ₹200–350 |
| 6 | TP4056 LiPo Charging Module (with protection) | Battery charging/protection | ₹40–60 |
| 7 | Soft elastic/velcro band or wrap (hypoallergenic fabric) | Wearable strap for newborn limb | ₹50–100 |
| 8 | Perfboard / small protoboard | Prototype assembly | ₹30–50 |
| 9 | Jumper wires (M-M, M-F) | Connections | ₹50 |
| 10 | Micro slide switch | Power on/off | ₹20 |
| 11 | Status LED (RGB, common cathode) | Local green/amber/red indicator | ₹15–25 |
| 12 | Resistors (220Ω–1kΩ assorted) | LED current limiting, pull-ups | ₹20 |
| 13 | Heat-shrink tubing / medical-grade silicone sleeve | Insulation, skin safety | ₹50–100 |

**Estimated total: ~₹1,300–2,000 (~$16–24 USD) per prototype unit.**

## Notes
- MAX30102 covers both HR/HRV and perfusion (via SpO2/PPG signal) — one module, two readings.
- MPU6050 is optional for v0 if activity monitoring is deprioritized, but it's cheap enough to include from the start.
- All sensors are I2C — can share the same bus on the ESP32, minimizing wiring.
- Skin contact parts (band, sensor housing) should use hypoallergenic, medical-grade material given newborn skin sensitivity — final version may need certified materials, but standard soft fabric/silicone is fine for prototype testing.
- Battery capacity (500–1000mAh) should support several hours of continuous WiFi + sensor operation; actual runtime needs bench testing.
