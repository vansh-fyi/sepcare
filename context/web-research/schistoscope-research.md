# Schistoscope: Technical & Architectural Research Report

> **Document Context**: Comprehensive research on the **Schistoscope**, an open-hardware, AI-powered diagnostic digital microscope created at TU Delft for automated detection of Schistosomiasis in low-resource settings.

---

## 1. Executive Summary & Overview

The **Schistoscope** is an automated digital diagnostic microscope developed to tackle **Schistosomiasis** (bilharzia)—a neglected tropical disease affecting over 250 million people, predominantly in sub-Saharan Africa. Created by researchers and students at **Delft University of Technology (TU Delft)** in collaboration with Leiden University Medical Center (LUMC) and field partners in Nigeria and Ghana, the device was named an **International Top 20 Finalist in the James Dyson Award 2019**.

| Parameter | Key Specification / Feature |
| :--- | :--- |
| **Product Name** | Schistoscope |
| **Developing Institution** | Delft University of Technology (TU Delft), Netherlands |
| **Target Disease** | Schistosomiasis (*Schistosoma haematobium* parasitic infection) |
| **Award Recognition** | James Dyson Award 2019 (International Top 20), iF Design Talent Award |
| **Core Architecture** | Open-hardware 3D-printed housing + smartphone/Raspberry Pi optics + Edge AI |
| **Primary Operating Modality** | Off-grid urine sample micro-imaging & automated parasite egg counting |
| **Target Users** | Frontline community health workers in remote rural clinics |

---

## 2. Synthesis of Repository & Research Context

In internal research frameworks ([`research/bipul-research.md`](file:///Users/hp/Desktop/Work/Repositories/Segue%203.0/research/bipul-research.md#L35-L37)), the Schistoscope is cited alongside *JivaScope* as a foundational case study in frugal point-of-care medtech:

> *"Schistoscope (James Dyson Award finalist) — a 3D-printed, phone-based diagnostic device that automates and simplifies detection of a waterborne parasitic disease in remote areas, using a single urine-sample photo and an algorithm to grade infection severity, explicitly built so local healthcare workers with low education can perform the test themselves — same move as JivaScope: pushing lab-grade diagnostic capability down to whoever is actually present, not whoever is credentialed."*

---

## 3. How It Is Built: Hardware & Optical Specifications

The Schistoscope follows an **open-hardware approach**, designed like an open-source recipe that can be manufactured, assembled, and repaired locally using 3D printers and low-cost electronics.

```
       +-------------------------------------------------------+
       |                 SCHISTOSCOPE HARDWARE                 |
       |                                                       |
       |  +-------------------------------------------------+  |
       |  |  3D-Printed Structural Enclosure / Frame        |  |
       |  +-------------------------------------------------+  |
       |  |  Urine Filter / Glass Slide Insertion Tray      |  |
       |  +-------------------------------------------------+  |
       |  |  LED Illumination Matrix & Diffuser             |  |
       |  +-------------------------------------------------+  |
       |  |  High-Magnification Optical Lens Attachment     |  |
       |  +-------------------------------------------------+  |
       |  |  Smartphone / Raspberry Pi Camera Module        |  |
       |  +-------------------------------------------------+  |
       +-------------------------------------------------------+
                                  |
                        Local Digital Image Feed
                                  v
       +-------------------------------------------------------+
       |                EDGE AI RECOGNITION ENGINE             |
       |                                                       |
       |  * Image Preprocessing & Contrast Enhancement         |
       |  * Morphological Segmentation for S. haematobium Eggs |
       |  * Automated Parasite Egg Density Calculation         |
       |  * Infection Severity Grading (Mild / Severe)         |
       +-------------------------------------------------------+
```

### 3.1 Optical & Mechanical Hardware
* **Enclosure**: Modular 3D-printed body engineered to shield ambient light and stabilize the focal distance between the camera lens and sample slide.
* **Illumination**: Low-power LED backlight array with light diffusers to provide uniform contrast for transparent biological samples.
* **Sample Interface**: Slide insertion mechanism accommodating standard microscope slides or filtered urine membrane cartridges.
* **Imaging Module**: Compatible with smartphone camera optics or embedded camera sensors attached to single-board computers (Raspberry Pi).

### 3.2 Edge AI Image Processing & Diagnostics
* **Target Biomarker**: Detects the distinct terminal-spined eggs of *Schistosoma haematobium*.
* **Algorithm**: Runs computer vision and convolutional neural network (CNN) models locally to segment images, identify parasite eggs based on morphology, and count egg density per milliliter of urine.
* **Grading Output**: Automatically grades infection severity into clinical tiers (e.g., light vs. heavy infection) per WHO diagnostic guidelines.

---

## 4. Operational Workflow & Field Impact

1. **Sample Preparation**: A local health worker filters a patient's urine sample through a membrane filter to trap parasite eggs and places the filter slide onto the insertion tray.
2. **Automated Capture**: The device captures high-resolution digital images across the sample surface.
3. **AI Analysis**: Onboard algorithms process the images in seconds without requiring manual microscope counting or internet access.
4. **Diagnostic Display & Action**: Results show egg count and severity grade, allowing immediate administration of anti-parasitic treatment (Praziquantel).

---

## 5. References

1. **James Dyson Award**: *Schistoscope Project Page* ([jamesdysonaward.org](https://www.jamesdysonaward.org/))
2. **TU Delft Research**: Delft Centre for Systems and Control & Faculty of Industrial Design Engineering ([tudelft.nl](https://www.tudelft.nl/))
3. **Workspace Notes**: [`research/bipul-research.md`](file:///Users/hp/Desktop/Work/Repositories/Segue%203.0/research/bipul-research.md)
