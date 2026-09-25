# SepCare Band Prototype — Soldering Pinout

## Final Pin-to-Pin Table

| From | To | Purpose |
|---|---|---|
| **TP4056 OUT+** | One side of **slide switch** | Battery power |
| Other side of **slide switch** | **ESP32-S3-Tiny 5V** | Main board power |
| **TP4056 OUT-** | **ESP32-S3-Tiny GND** | Main ground |
| **ESP32 3V3 OUT** | **MAX30102 VIN** | Sensor power |
| **ESP32 3V3 OUT** | **MPU6050 VCC** | Sensor power |
| **ESP32 3V3 OUT** | **DS18B20 VCC / +** | Sensor power |
| **ESP32 GND** | **MAX30102 GND** | Ground |
| **ESP32 GND** | **MPU6050 GND** | Ground |
| **ESP32 GND** | **DS18B20 GND / -** | Ground |
| **ESP32 GPIO6** | **MAX30102 SDA** | I²C data |
| **ESP32 GPIO6** | **MPU6050 SDA** | Shared I²C data bus |
| **ESP32 GPIO7** | **MAX30102 SCL** | I²C clock |
| **ESP32 GPIO7** | **MPU6050 SCL** | Shared I²C clock bus |
| **ESP32 GPIO4** (adapter physical pin 4) | **DS18B20 DQ / DATA / S** | 1-Wire temperature data |
| **ESP32 GPIO5** | **MAX30102 INT** | Optional interrupt |

---

## Shared 3.3 V Node

```text
ESP32 3V3 OUT
   │
   ├──── MAX30102 VIN
   │
   ├──── MPU6050 VCC
   │
   └──── DS18B20 VCC
```

The ESP32-S3-Tiny's regulated 3.3 V output powers all three sensor modules.

---

## Shared Ground Node

```text
TP4056 OUT-
   │
   └──── ESP32 GND
           │
           ├──── MAX30102 GND
           │
           ├──── MPU6050 GND
           │
           └──── DS18B20 GND
```

All grounds must be electrically common.

---

## Shared I²C SDA Node

```text
ESP32 GPIO6
   │
   ├──── MAX30102 SDA
   │
   └──── MPU6050 SDA
```

GPIO6 is used only as the shared I²C SDA line.

---

## Shared I²C SCL Node

```text
ESP32 GPIO7
   │
   ├──── MAX30102 SCL
   │
   └──── MPU6050 SCL
```

GPIO7 is used only as the shared I²C SCL line.

---

## Individual Signal Lines

### DS18B20

```text
ESP32 GPIO4 ───── DS18B20 DATA / DQ / S
```

The purchased DS18B20 module already includes its pull-up resistor, so no external 4.7 kΩ resistor is required for this prototype.

### MAX30102 Interrupt

```text
ESP32 GPIO5 ───── MAX30102 INT
```

This connection is optional. If firmware polls the MAX30102 over I²C, INT may be left disconnected.

---

## MPU6050 Wiring

```text
MPU6050
──────────────
VCC  → ESP32 3V3
GND  → ESP32 GND
SDA  → ESP32 GPIO6
SCL  → ESP32 GPIO7

XDA  → Leave disconnected
XCL  → Leave disconnected
AD0  → Leave as board default
INT  → Leave disconnected for now
```

---

## DS18B20 Wiring

```text
DS18B20
──────────────
VCC / +       → ESP32 3V3
GND / -       → ESP32 GND
DATA / DQ / S → ESP32 GPIO4 (adapter physical pin 4)
```

---

## MAX30102 Wiring

```text
MAX30102
──────────────
VIN → ESP32 3V3
GND → ESP32 GND
SDA → ESP32 GPIO6
SCL → ESP32 GPIO7
INT → ESP32 GPIO5   [optional]
```

---

## Battery, Charger and Power Switch

```text
600 mAh 1S LiPo
      │
      ▼
┌───────────────┐
│    TP4056     │
│ + protection  │
└───────┬───────┘
        │ OUT+
        ▼
   Slide switch
        │
        ▼
ESP32-S3-Tiny 5V
```

Ground:

```text
TP4056 OUT-
      │
      ▼
ESP32-S3-Tiny GND
```

### Important

**Do not connect TP4056 OUT+ directly to the ESP32 3V3 pin.**

Correct:

```text
TP4056 OUT+
    ↓
slide switch
    ↓
ESP32 5V
    ↓
onboard regulator
    ↓
3.3 V
```

Incorrect:

```text
TP4056 OUT+
    ↓
ESP32 3V3
```

A fully charged 1S LiPo can reach about 4.2 V, which is too high for the ESP32's 3.3 V rail.

---

## Complete Soldering Map

```text
TP4056
================================

OUT+ ── SWITCH ─────────── ESP32 5V
OUT- ───────────────────── ESP32 GND


ESP32-S3-TINY
================================

5V   ← switch ← TP4056 OUT+

GND  ─────┬──── MAX30102 GND
          ├──── MPU6050 GND
          └──── DS18B20 GND

3V3  ─────┬──── MAX30102 VIN
          ├──── MPU6050 VCC
          └──── DS18B20 VCC

GPIO4 ───────── DS18B20 DATA

GPIO5 ───────── MAX30102 INT
                 OPTIONAL

GPIO6 ─────┬──── MAX30102 SDA
           └──── MPU6050 SDA

GPIO7 ─────┬──── MAX30102 SCL
           └──── MPU6050 SCL
```

---

## Pre-Power Sanity Check

Before connecting the LiPo or USB power, verify:

```text
5V       → only main power input to ESP32
3V3      → only sensor VCC / VIN pins
GND      → all grounds common
GPIO6    → only SDA pins
GPIO7    → only SCL pins
GPIO4    → only DS18B20 DATA
GPIO5    → only MAX30102 INT, if used
```

Also verify with a multimeter:

- No short between **3V3 and GND**
- No short between **5V and GND**
- SDA is not connected to GND
- SCL is not connected to GND
- GPIO4 is not connected to GND
- Battery polarity is correct
- TP4056 OUT+ reaches the ESP32 only through the slide switch

---

## Prototype Notes

- MAX30102 and MPU6050 share the same I²C bus.
- DS18B20 uses a separate 1-Wire data line.
- MAX30102 INT is optional.
- MPU6050 XDA, XCL and INT are not needed for the first prototype.
- Use the ESP32-S3-Tiny onboard regulator for this competition prototype.
- No external buck-boost converter is required for this build.
