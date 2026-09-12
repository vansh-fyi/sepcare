# Parts List — SepCare Band Prototype

Cheap, off-the-shelf components for a first working prototype. Prices are approximate (India, retail, single-unit).

| #  | Part                                                     | Purpose                           | Approx. Price (INR) |
| -- | -------------------------------------------------------- | --------------------------------- | ------------------- |
| 1  | ESP32 Dev Board (e.g. ESP32-WROOM-32 / NodeMCU-32S)      | WiFi MCU, core controller         | ₹350–450          |
| 2  | MAX30102 Pulse Oximeter & Heart-Rate Sensor Module       | Heart rate, HRV, SpO2 (perfusion) | ₹250–350          |
| 3  | MAX30205 or DS18B20 Temperature Sensor                   | Body temperature                  | ₹150–250          |
| 4  | MPU6050 Accelerometer + Gyroscope Module                 | Activity / motion detection       | ₹120–180          |
| 5  | 3.7V LiPo Battery (500–1000mAh)                         | Portable power                    | ₹200–350          |
| 6  | TP4056 LiPo Charging Module (with protection)            | Battery charging/protection       | ₹40–60            |
| 7  | Soft elastic/velcro band or wrap (hypoallergenic fabric) | Wearable strap for newborn limb   | ₹50–100           |
| 8  | Perfboard / small protoboard                             | Prototype assembly                | ₹30–50            |
| 9  | Jumper wires (M-M, M-F)                                  | Connections                       | ₹50                |
| 10 | Micro slide switch                                       | Power on/off                      | ₹20                |
| 11 | Status LED (RGB, common cathode)                         | Local green/amber/red indicator   | ₹15–25            |
| 12 | Resistors (220Ω–1kΩ assorted)                         | LED current limiting, pull-ups    | ₹20                |
| 13 | Heat-shrink tubing / medical-grade silicone sleeve       | Insulation, skin safety           | ₹50–100           |

**Estimated total: ~₹1,300–2,000 (~$16–24 USD) per prototype unit.**

## Notes

- MAX30102 covers both HR/HRV and perfusion (via SpO2/PPG signal) — one module, two readings.
- MPU6050 is optional for v0 if activity monitoring is deprioritized, but it's cheap enough to include from the start.
- All sensors are I2C — can share the same bus on the ESP32, minimizing wiring.
- Skin contact parts (band, sensor housing) should use hypoallergenic, medical-grade material given newborn skin sensitivity — final version may need certified materials, but standard soft fabric/silicone is fine for prototype testing.
- Battery capacity (500–1000mAh) should support several hours of continuous WiFi + sensor operation; actual runtime needs bench testing.

## Purchased (Actual Parts — Ordered from Robu.in)

| Part | Notes | Link |
|------|-------|------|
| ESP32 Dev Board (38-pin, CP2102, Type-C USB) | WROOM-32 module, dual-core, 520KB SRAM, 4MB flash | https://robu.in/product/38pin-cp2102-esp-32-wifibluetooth-development-board-with-type-c-usb-interface/ |
| MAX30102 Pulse Oximeter & Heart-Rate Sensor Module | HR, HRV, SpO2/perfusion | https://robu.in/product/max30102-heart-rate-and-pulse-oximeter-sensor-module-black/ |
| MPU6050 Accelerometer + Gyroscope Module | Activity/motion | https://robu.in/product/mpu-6050-gyro-sensor-2-accelerometer/ |
| DS18B20 Temperature Sensor Module | Body temperature; pull-up resistor built onto module | https://robu.in/product/ds18b20-temperature-sensor-module/ |
| Nova 603450 1100mAh 3.7V Micro LiPo Battery | Power source | https://robu.in/product/nova-603450-1100mah-3-7v-micro-lipo-battery-pack/ |
| TP4056 3.7V Lithium Charging Module (1A, USB Type-C, PH2.0 terminal) | Charging/protection; PH2.0 connector matches battery plug | https://robu.in/product/tp4056-3-7v-lithium-battery-charging-module-1a-usb-type-c-port-ph2-0-terminal/ |

## Board Plan

- **Dev stage**: using the full-size ESP32-WROOM-32 (CP2102, Type-C) board for setup, wiring, and firmware bring-up.
- **Final stage**: swapping to the Waveshare ESP32-S3-Tiny (dual-core, 512KB SRAM, 2MB PSRAM, 4MB flash, FPC connector + adapter board) once it arrives, for the actual wearable form factor.

## Firmware Note — Deep Sleep Required for Battery Target

Target: ~1 week of runtime on the 1100mAh battery. Continuous active operation (WiFi connected + sensors on) draws ~100-150mA, giving only ~7-8 hours — not sufficient on its own.

To hit the 1-week target, firmware must duty-cycle using ESP32 deep sleep (~10-150µA idle) instead of running an always-on loop:

- Wake → sample sensors (~1-2s) → connect WiFi + transmit (~2-5s) → deep sleep. Repeat every few minutes.
- A ~5s active window every 5 minutes (~1.7% duty cycle) brings average current down to ~2.5-3mA, giving 2-3+ weeks of runtime.
- This aligns with the backend's existing design: ESP32 sends pre-computed periodic vitals, not continuous raw streams, and the sepsis-risk fusion logic evaluates multi-hour trends — so sampling every few minutes doesn't hurt detection quality.

Flag for whoever writes the ESP32 firmware: build around wake/sleep cycles from the start rather than retrofitting deep sleep later.
