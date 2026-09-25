# SepCare Hardware Assembly — Soldering UAT

Human-in-the-loop bring-up checklist for assembling the SepCare benchtop prototype. Work in order; do only the current instruction, then report the result before proceeding. Record measurements and photos/labels in Notes where useful. Use ✅ PASS / ❌ FAIL / ⏭️ SKIPPED. A failed or uncertain checkpoint pauses the build until it is understood.

**Safety boundary:** engineering prototype only. Do not attach it to a newborn or use it for clinical decisions. Keep the LiPo disconnected during soldering and continuity checks. Work on a non-flammable surface with ventilation, eye protection, and an adult present. Stop if a cell is swollen, hot, punctured, or damaged. Do not charge and operate the device at the same time.

**Authoritative wiring:** [`SEPCARE-HARDWARE-SOT.md`](SEPCARE-HARDWARE-SOT.md). This UAT follows its corrected v1 design. The older [`SepCare-Soldering-Pinout.md`](SepCare-Soldering-Pinout.md) is superseded where it differs: verify the DS18B20 module's pull-up rather than assuming one is present, and use the explicit staged power and sensor tests below.

## Progress rule

Only perform the next numbered action when instructed. At each checkpoint, stop, report the requested observation/measurement, and wait for the next instruction. If the board labels or part revision do not match this document, stop and report them; do not infer pin identities from wire colors or appearance.

## Step 0 — Parts and board identification (no soldering)

Lay out the parts with the LiPo disconnected and USB unplugged. Identify the ESP32-S3-Tiny and its adapter/breakout that exposes labeled `5V`, `3V3`, `GND`, and GPIO 4/5/6/7 pads. Identify the charger labels `B+`, `B-`, `OUT+`, and `OUT-`, the switch terminals, and each sensor's labeled pads. Note whether the DS18B20 board has a pull-up resistor and whether the charger charge-current setting is documented/verified. Do not connect the battery or solder yet.

| Result | Date | Notes |
|---|---|---|
| ⬜ Pending |  |  |

### Checkpoint A — Build readiness

Proceed with the USB-powered sensor assembly after the exact MCU adapter and sensor labels are identified and the 600 mAh cell is undamaged and disconnected. The ESP32-S3-Tiny FPC board alone is not a conventional through-hole protoboard; do not solder directly to its FPC connector. Verify charger protection/load wiring and charge current before starting the battery stage (target 300 mA for this build); this does not block the separate USB-powered sensor bring-up.

**Charger wiring verification hold:** the reported Robu TP4056 board has `IN+`, `IN-`, `B+`, and `B-`, with no separately labeled `OUT±` pads. This is a charger module; the exact load/protection wiring still needs verification before battery hookup. The labels alone do not establish whether the board includes cell protection or whether its `B±` pads may also supply a load. Do not assume it is incompatible solely because it lacks `OUT±`, and do not assume it is protected solely because it is sold as a TP4056 module. Verify this exact board's protection circuit, permitted load connection, and charge-current setting against the cell specification before battery wiring.

## Step 1 — Confirm the unpowered workspace

Keep LiPo and USB disconnected. Arrange the MCU adapter and sensors in their intended positions on a clean, nonconductive, heat-safe work surface; this build uses insulated point-to-point wires, not perfboard. Keep the MAX30102 close to the MCU and its I²C wires short; keep its sensor and wires away from the Wi-Fi antenna area. Leave access to the USB connector and switch. Confirm the layout physically fits and no exposed pads touch.

| Result | Date | Notes |
|---|---|---|
| ⬜ Pending |  |  |

### Checkpoint B — Layout approval

Confirm component orientation, labels, antenna clearance, and USB access before tacking or soldering any component.

## Step 2 — Solder the MCU adapter headers

With all power disconnected, solder the provided header pins to the S3-Tiny adapter/breakout as its documentation specifies. Do not solder to or heat the S3-Tiny FPC connector. Inspect for bridges, cold joints, and shifted pins.

| Result | Date | Notes |
|---|---|---|
| ⬜ Pending |  |  |

### Checkpoint C — Header inspection

Report whether every joint is separate, mechanically sound, and aligned; include a clear photo if possible. Do not attach the MCU or power until inspection passes.

## Step 3 — Wire sensor power and ground point-to-point

With USB and LiPo disconnected, make insulated point-to-point connections between the MCU adapter's labeled `3V3` and `GND` pads and the corresponding sensor power and ground pads. Join ground connections through insulated splices; do not leave bare wire exposed or allow 3V3 and GND to touch. Do not connect the charger, battery, 5V, or sensor signal wires yet. Build and inspect one connection at a time.

| Result | Date | Notes |
|---|---|---|
| ⬜ Pending |  |  |

### Checkpoint D — Rail continuity and isolation

With a multimeter in continuity/resistance mode and everything unpowered, verify intended continuity along each bus and no continuity/near-zero resistance between 3V3 and GND. Report readings; do not apply power if uncertain or shorted.

## Step 4 — Wire sensor power and ground

Solder MAX30102 `VIN` and `GND`, MPU6050 `VCC` and `GND`, and DS18B20 `VCC/+` and `GND/-` to the correct 3V3/GND buses. Use the silkscreen labels, not assumed pin order. Leave all signal wires disconnected. If the DS18B20 board does not have a confirmed pull-up, stop and report that before wiring its data line.

| Result | Date | Notes |
|---|---|---|
| ⬜ Pending |  |  |

### Checkpoint E — Sensor rail visual check

Check that every sensor power pin goes to 3V3 and every sensor ground goes to GND, with no solder bridges. Report any uncertain labels.

## Step 5 — USB-only sensor rail test

Keep the LiPo and charger disconnected. Connect the MCU adapter by USB only. Measure voltage from each sensor VCC/VIN pad to its GND pad; expect approximately 3.3 V. Disconnect USB after recording readings. Stop if any reading is outside the board's expected 3.3 V rail or anything heats/smells unusual.

| Sensor | Voltage | Result | Date | Notes |
|---|---:|---|---|---|
| MAX30102 |  | ⬜ Pending |  |  |
| MPU6050 |  | ⬜ Pending |  |  |
| DS18B20 |  | ⬜ Pending |  |  |

### Checkpoint F — Sensor supply pass

All three sensors must show the expected 3.3 V supply before signal wiring.

## Step 6 — Solder I²C and 1-Wire signal connections

With USB unplugged and LiPo disconnected, solder the shared I²C lines: MCU GPIO6 to MAX30102 `SDA` and MPU6050 `SDA`; MCU GPIO7 to both sensors' `SCL`. Connect MCU GPIO4 (adapter physical pin 4) to DS18B20 `DQ/DATA`. Add a 4.7 kΩ pull-up from DS18B20 data to 3V3 only if the specific module does not already include one. Leave MAX30102 `INT` disconnected for initial bring-up; it is optional.

| Result | Date | Notes |
|---|---|---|
| ⬜ Pending |  |  |

### Checkpoint G — Signal-net inspection

Verify with continuity mode that GPIO6 reaches only the SDA pins, GPIO7 only the SCL pins, and GPIO4 only the DS18B20 data pin (and its onboard pull-up). Confirm no signal is shorted to GND or 3V3. Report readings before proceeding.

## Step 7 — USB sensor functional test

With the LiPo/charger still disconnected, power by USB and run the project's sensor bring-up firmware. Confirm I²C addresses MAX30102 `0x57` and MPU6050 normally `0x68` (`0x69` if AD0 is configured differently), discover the DS18B20 on 1-Wire, and observe plausible changing measurements when handled/moved. These are engineering checks, not medical validation. Disconnect USB after recording results.

| Sensor | Expected observation | Result | Date | Notes |
|---|---|---|---|---|
| MAX30102 | Address 0x57; PPG responds to finger contact | ⬜ Pending |  |  |
| MPU6050 | Address 0x68/0x69; axes respond to movement | ⬜ Pending |  |  |
| DS18B20 | Found on 1-Wire; plausible temperature response | ⬜ Pending |  |  |

### Checkpoint H — Sensor bring-up

Resolve any missing sensor, implausible value, or unstable reading before assembling the battery circuit.

## Step 8 — Prepare charger and switch wiring (battery disconnected)

Verify the module's protection circuit, permitted load connection, and charge-current setting using documentation for this exact board and compare the current against the LiPo manufacturer's limit. Do not assume a TP4056 module has protection or a safe 300 mA setting. **If the board has only `IN±` and `B±`, stop until documentation confirms whether and how `B±` may feed the load.** With the battery disconnected, wire the switch and MCU input only after identifying the exact verified load terminals. Do not infer that `B±` or `IN±` are safe load terminals.

| Result | Date | Notes |
|---|---|---|
| ⬜ Pending |  |  |

### Checkpoint I — Power-path continuity

Using a multimeter, confirm `OUT+` reaches MCU `5V` only when the switch is ON and is open when OFF; confirm `OUT-` reaches MCU GND. Confirm there is no short between 5V and GND, or between 3V3 and GND. Record charge-current evidence and measurements. Do not attach the LiPo if the current setting, protection, polarity, or continuity is uncertain.

## Step 9 — Connect the battery to the charger

Only after Checkpoint I passes, with USB unplugged and switch OFF, connect the battery's positive and negative leads to charger `B+` and `B-` respectively. Prefer the matching battery connector; insulate exposed leads individually. Never solder directly to a LiPo cell. Do not allow the leads to touch or reverse polarity.

| Result | Date | Notes |
|---|---|---|
| ⬜ Pending |  |  |

### Checkpoint J — Battery polarity

Before switching on, confirm the battery plug polarity matches B+/B- markings and the cell remains cool and undamaged. Stop immediately if the battery warms, swells, or behaves unexpectedly.

## Step 10 — Protected battery boot test

With USB disconnected, turn the switch ON and check that the board starts normally. Check the regulated 3V3 rail, then switch OFF. Do not connect USB for charging while the device is running. Report startup behavior and measured rail voltage.

| Result | Voltage | Date | Notes |
|---|---:|---|---|
| ⬜ Pending |  |  |  |

### Checkpoint K — Battery operation

Proceed only if startup is stable, the 3V3 rail is correct, and nothing heats abnormally. Then test one Wi-Fi transmission and switch-off behavior as directed.

## Step 11 — Final inspection and insulation

After bench tests pass and the device is powered off with the battery disconnected, inspect every joint and insulate exposed conductors with heat-shrink. Ensure the battery cannot be punctured, bent sharply, or trapped by the enclosure/strap; preserve antenna clearance. Do not attach to a person as part of this engineering UAT.

| Result | Date | Notes |
|---|---|---|
| ⬜ Pending |  |  |

## Sign-off

| All applicable steps pass? | Date | Tested by | Notes |
|---|---|---|---|
| ⬜ Pending |  |  |  |
