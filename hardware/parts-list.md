# Parts List — SepCare Band Prototype

Cheap, off-the-shelf components for a first working prototype. Prices are approximate (India, retail, single-unit).

| #  | Part                                                     | Purpose                           | Approx. Price (INR) |
| -- | -------------------------------------------------------- | --------------------------------- | ------------------- |
| 1  | Waveshare ESP32-S3-Tiny (ESP32-S3FH4R2)                  | WiFi MCU, core controller         | ₹350–450          |
| 2  | MAX30102 Pulse Oximeter & Heart-Rate Sensor Module       | Heart rate, HRV, SpO2 (perfusion) | ₹250–350          |
| 3  | MAX30205 or DS18B20 Temperature Sensor                   | Body temperature                  | ₹150–250          |
| 4  | MPU6050 Accelerometer + Gyroscope Module                 | Activity / motion detection       | ₹120–180          |
| 5  | 3.7V LiPo Battery (500–1000mAh)                         | Portable power                    | ₹200–350          |
| 6  | TP4056 LiPo Charging Module (with protection)            | Battery charging/protection; set for cell-safe current | ₹40–60            |
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
- MAX30102 and MPU6050 share I2C. DS18B20 uses a separate 1-Wire data pin (and needs a 4.7kΩ pull-up unless its module includes one).
- Skin contact parts (band, sensor housing) should use hypoallergenic, medical-grade material given newborn skin sensitivity — final version may need certified materials, but standard soft fabric/silicone is fine for prototype testing.
- Battery capacity (500–1000mAh) should support several hours of continuous WiFi + sensor operation; actual runtime needs bench testing.

## Purchased (Actual Parts — Ordered from Robu.in)

| Part | Notes | Link |
|------|-------|------|
| ESP32 Dev Board (38-pin, CP2102, Type-C USB) | Spare / not used in the S3-Tiny build | https://robu.in/product/38pin-cp2102-esp-32-wifibluetooth-development-board-with-type-c-usb-interface/ |
| MAX30102 Pulse Oximeter & Heart-Rate Sensor Module | HR, HRV, SpO2/perfusion | https://robu.in/product/max30102-heart-rate-and-pulse-oximeter-sensor-module-black/ |
| MPU6050 Accelerometer + Gyroscope Module | Activity/motion | https://robu.in/product/mpu-6050-gyro-sensor-2-accelerometer/ |
| DS18B20 Temperature Sensor Module | Body temperature; pull-up resistor built onto module | https://robu.in/product/ds18b20-temperature-sensor-module/ |
| 3.7V 600mAh LiPo Battery (actual cell) | Power source; capacity corrected from the earlier 1100mAh placeholder | Verify the cell label/datasheet before charging |
| TP4056 3.7V Lithium Charging Module (USB Type-C, PH2.0 terminal) | Charging/protection; PH2.0 connector matches battery plug; reconfigure/verify RPROG for 300mA preferred with the 600mAh cell | https://robu.in/product/tp4056-3-7v-lithium-battery-charging-module-1a-usb-type-c-port-ph2-0-terminal/ |
| Waveshare ESP32-S3-Tiny Mini Dev Board | Final-stage MCU; dual-core LX7, 512KB SRAM, 2MB PSRAM, 4MB flash, FPC connector (needs adapter board for breadboard use) | https://robu.in/product/waveshare-esp32-s3-mini-development-board-based-on-esp32-s3fh4r2-dual-core-processor-240mhz-running-frequency-usb-port-adapter-board-optional/ |

## Board Plan

- **Build stage**: use the Waveshare ESP32-S3-Tiny (dual-core, 512KB SRAM, 2MB PSRAM, 4MB flash, FPC connector + adapter board) for both wiring and firmware bring-up. The full-size ESP32-WROOM board is **not used**.
- Rejected ESP32-C3 Super Mini for the final stage — documented antenna/thermal reliability issues under continuous WiFi transmission (some units brownout-reset from overheating). S3-Tiny doesn't share this known issue.
- Rejected CMOS/coin-cell battery (e.g. CR2032) as a power source — not rechargeable, can't supply the current an active WiFi MCU needs, and wrong voltage (3V vs the 3.7V LiPo the charging circuit is built around).

## Firmware Note — Deep Sleep Required for Battery Target

Target: ~1 week of runtime on the actual 600mAh battery. Continuous active operation (WiFi connected + sensors on) draws ~100-150mA, giving only ~4-6 hours — not sufficient on its own.

To hit the 1-week target, firmware must duty-cycle using ESP32 deep sleep (~10-150µA idle) instead of running an always-on loop:

- Wake → sample sensors (~1-2s) → connect WiFi + transmit (~2-5s) → deep sleep. Repeat every few minutes.
- A ~5s active window every 5 minutes (~1.7% duty cycle) is the starting point. Measure the actual sleep current on the S3-Tiny: development-board regulators, LEDs, and sensors can dominate the sleep budget. Do not promise a runtime until that measurement is made.
- This aligns with the backend's existing design: ESP32 sends pre-computed periodic vitals, not continuous raw streams, and the sepsis-risk fusion logic evaluates multi-hour trends — so sampling every few minutes doesn't hurt detection quality.

Flag for whoever writes the ESP32 firmware: build around wake/sleep cycles from the start rather than retrofitting deep sleep later.
