# **Figma UI/UX Design Specification: SepsisGuard Companion App**

**Project:** Neonatal Sepsis Detection System (SDG 3.2 Innovation)  
**Target Device:** 7”/10” Base Station Touch Display & Mobile Companion (Android/Tablet)  
**Primary Users:** Rural Caregivers, ASHA Workers, Auxiliary Nurse Midwives (ANMs), & PHC Medical Officers  
**Design Lead Document Version:** 1.0 (Ready for Figma Wireframing & Component Specs)

## **1\. Design Philosophy & Core Principles**

> 1. **Dual-Tier Usability Paradigm:**  
   * **Tier 1 (Caregiver/ASHA View):** Zero jargon, zero numbers, pure universal visual metaphors (Color \+ Icon \+ Action). Optimized for high-stress and low-literacy contexts.  
   * **Tier 2 (Professional/Clinical View):** Data-dense, multi-parameter trend lines, rate-of-change indicators, and manual spot-check entry for clinicians.  
> 2. **Accessible Under Extreme Conditions:** High-contrast tokens (WCAG AAA compliant) designed for low-cost, low-brightness LCD displays and direct sunlight in rural health sub-centers.  
> 3. **Audio-First Feedback:** Every critical state includes a prominent, touch-friendly Voice Prompt Pill (🔊 Tap to Listen) supporting localized audio playback (Hindi, Marathi, Bengali, Tamil, Telugu, etc.).  
> 4. **Action-Oriented Triage:** Never leave the user guessing "What next?". Every state clearly communicates the exact immediate step (e.g., *Check warmth*, *Feed baby*, *Go to PHC immediately*).

## **2\. Design System Foundations & Design Tokens**

### **2.1 Semantic Color Palette**

| Token Name | Hex Code | Usage Context | Accessibility Rule |
| :---- | :---- | :---- | :---- |
| color-state-green-bg | \#064E3B | State A (Normal) Screen Background | High-contrast dark emerald background |
| color-state-green-card | \#022C22 | State A Content Card Fill | Deep dark teal fill |
| color-state-green-accent | \#34D399 | Checkmarks, positive indicators | Crisp mint text & icons |
| color-state-amber-bg | \#78350F | State B (Caution) Screen Background | Deep warm amber background |
| color-state-amber-card | \#451A03 | State B Content Card Fill | Dark chocolate amber card fill |
| color-state-amber-accent | \#FBBF24 | Caution borders, warning badges | Bright amber icon & focal text |
| color-state-red-bg | \#881337 | State C (Critical) Screen Background | Pulsing deep rose/red background |
| color-state-red-card | \#4C0519 | State C Content Card Fill | Dark maroon card fill |
| color-state-red-accent | \#FB7185 | Emergency icons, alert buttons | High-visibility coral red |
| color-neutral-dark | \#0F172A | Clinical View Page Background | Dark slate canvas for data charts |
| color-neutral-card | \#1E293B | Clinical View Cards & Panels | Elevated slate card fill |
| color-text-primary | \#F8FAFC | Primary Headlines & Metrics | 100% Crisp off-white |
| color-text-secondary | \#94A3B8 | Subtitles, labels, chart axes | Neutral cool gray |

### **2.2 Typography Scale**

> * **Primary Font Family:** Plus Jakarta Sans or Inter (Fallback: System Sans-Serif)  
> * **Regional Language Font Family:** Noto Sans (Supports Devanagari, Tamil, Telugu, Bengali scripts)

| Style Token | Size / Line Height | Weight | Usage |
| :---- | :---- | :---- | :---- |
| Display-Hero | 44px / 52px | 800 (ExtraBold) | Hero State Headlines (e.g., *SEEK MEDICAL CARE*) |
| Heading-1 | 28px / 36px | 700 (Bold) | Card Headers, Section Titles |
| Heading-2 | 20px / 28px | 600 (SemiBold) | Metric Values, Sub-headers |
| Body-Large | 16px / 24px | 500 (Medium) | Caregiver Instructions, Primary Buttons |
| Body-Small | 14px / 20px | 400 (Regular) | Secondary Labels, Timestamps |
| Caption | 12px / 16px | 600 (SemiBold) | Chart Legend Labels, Sensor Status Badges |

### **2.3 Layout Grid & Spacing Units**

> * **Base Unit:** 8pt Grid System (8px, 16px, 24px, 32px, 48px, 64px)  
> * **Touch Target Size:** Minimum 48px × 48px for all clickable items; **64px height minimum** for primary emergency actions.  
> * **Border Radius System:**  
  * Base Cards: 16px (rounded-2xl)  
  * Buttons & Pills: 12px (rounded-xl) or Full (rounded-full)  
  * Badges & Tags: 8px (rounded-lg)

## **3\. Screen-by-Screen Figma Frame Specifications**

                     \+----------------------------------+  
                     |    FRAME 1: HOME / OVERVIEW      |  
                     |  (Green / Amber / Red Component) |  
                     \+----------------------------------+  
                                      |  
                     \+----------------+----------------+  
                     |                                 |  
                     v                                 v  
        \+-------------------------+       \+-------------------------+  
        | FRAME 2: CLINICAL DATA  |       | FRAME 3: HARDWARE SETUP |  
        |  & TRENDS PANEL         |       |   & CALIBRATION MODAL   |  
        \+-------------------------+       \+-------------------------+

### **Frame 1: Home / Overview Screen (Component Variants for Green, Amber, Red)**

**Figma Frame Size:** 1280px × 800px (Landscape Tablet/Base Station) or 390px × 844px (Mobile Responsive Variant)

#### **1\. Global Persistent Header Bar (Top 80px)**

> * **Left Group:**  
  * Logo Icon: Soft square pill with baby icon (40px × 40px, Mint Green background).  
  * App Name: SepsisGuard (Heading-2, Off-white).  
  * Tagline: SDG 3.2 Neonatal Triage (Caption, Muted Gray).  
> * **Center Group:**  
  * Hardware Status Badge: Container with color-neutral-card, displaying a glowing green dot \+ text Flexi-Cuff Connected | Battery 85% | BLE: Strong.  
> * **Right Group:**  
  * Voice Prompt Pill (Hero Action): Floating pill button (color-state-accent border, filled background) with 🔊 Tap for Voice Advice (हिंदी / Regional).  
  * Settings Gear Icon: Opens Device Setup Modal (48px × 48px touch target).

#### **2\. Frame 1 Variant A: Green State Frame (Normal / Healthy)**

> * **Canvas Background:** color-state-green-bg (\#064E3B)  
> * **Hero Status Card (Center Stage, 60% Width):**  
  * Fill: color-state-green-card (\#022C22), Border: 2px solid \#059669.  
  * Hero Graphic: Shield with a checkmark icon (80px × 80px, Mint Green \#34D399).  
  * Headline: **"Baby is Resting Safely"** (Display-Hero, White).  
  * Subtitle: *"All monitored signs (Temperature, Pulse, Breathing) are within normal range."*  
> * **Caregiver Action Box (Bottom Row):**  
  * Icon Card 1: 🍼 Continue Regular Feeding  
  * Icon Card 2: 🌡️ Keep Baby Warm & Covered  
  * Icon Card 3: 🦶 Keep Ankle Band On  
> * **Professional Toggle Button (Bottom Right):**  
  * Button: \[ 📊 Open Clinical View \] (Body-Large, Glassmorphism dark pill button).

#### **3\. Frame 1 Variant B: Amber State Frame (Caution / Watchful Waiting)**

> * **Canvas Background:** color-state-amber-bg (\#78350F)  
> * **Hero Status Card:**  
  * Fill: color-state-amber-card (\#451A03), Border: 2px solid \#D97706 with subtle pulsing glow.  
  * Hero Graphic: Warning Triangle with Eye Icon (80px × 80px, Bright Amber \#FBBF24).  
  * Headline: **"Keep a Close Eye on Baby"** (Display-Hero, White).  
  * Subtitle: *"A slight deviation was detected in temperature or breathing pattern."*  
> * **Caregiver Action Checklist (Center Row):**  
  * Checklist Card 1: \[ \! \] Check if baby is too cold or warm. Adjust blanket.  
  * Checklist Card 2: \[ \! \] Try to feed the baby now.  
  * Checklist Card 3: \[ ⏱️ \] Re-check this screen in 30 minutes.  
> * **Secondary Action Button:**  
  * Large Button: \[ 🔊 Replay Voice Guidance \]

#### **4\. Frame 1 Variant C: Red State Frame (CRITICAL ALERT)**

> * **Canvas Background:** color-state-red-bg (\#881337), Frame includes a **pulsing outer border animation** (1.5s infinite loop).  
> * **Hero Status Card:**  
  * Fill: color-state-red-card (\#4C0519), Border: 3px solid \#F43F5E.  
  * Hero Graphic: Flashing Siren / Emergency Health Center Icon (96px × 96px, Bright Coral \#FB7185).  
  * Headline: **"TAKE BABY TO HOSPITAL NOW"** (Display-Hero, White, High Impact).  
  * Subtitle: *"Multiple physiological signs show a pattern of serious infection / sepsis."*  
> * **Emergency Action Banner (Full Width, Height 80px):**  
  * Background: Solid Bright Red (\#E11D48).  
  * Text: **"Go to nearest Primary Health Center (PHC) immediately. Do not wait."**  
> * **Quick Contact Action Row:**  
  * Primary Button: \[ 📞 Call ASHA Worker / Ambulance \] (Height: 64px, Emerald Fill).  
  * Secondary Button: \[ 📊 Open Clinical Diagnostic Panel \] (Height: 64px, Muted Outlined).

### **Frame 2: Clinical Details & Manual Tracking Page (Professional View)**

**Target User:** Nurses, ANMs, Doctors  
**Layout Structure:** 2-Column Dashboard Grid (Left Column: 350px Sidebar, Right Column: Main Data Stream)  
\+-----------------------------------------------------------------------------+  
| Top Bar: \[ ← Back to Overview \] | Infant: 12 Days | Weight Band: \<3.0kg     |  
\+-----------------------------------+-----------------------------------------+  
| SIDEBAR: SUSPICION SCORE          | MAIN COLUMN: 4-CHANNEL VITAL TRENDS     |  
| \- Overall Status: HIGH SUSPICION  |                                         |  
| \- 6-System Derangement Checklist  | \[ Chart 1: Temperature (°C) Trend \]     |  
|   \[x\] Thermoregulation            |                                         |  
|   \[x\] Cardiac Autonomic (HRV)     | \[ Chart 2: HR (BPM) & HRV Triad \]       |  
|   \[x\] Perfusion Index (PI)        |                                         |  
|   \[ \] HR/Temp Proportionality     | \[ Chart 3: Perfusion Index (PI %) \]     |  
|   \[ \] Respiratory Pattern         |                                         |  
|   \[ \] Spontaneous Activity        | \[ Chart 4: Respiration & Apnea Log \]    |  
|                                   |                                         |  
| MANUAL SPOT-CHECK INPUT FORM      | ACTIONS: \[ Export CSV \] \[ Sync Server \] |  
\+-----------------------------------+-----------------------------------------+

#### **Detailed Element Specifications for Frame 2:**

> 1. **Left Sidebar Panel (350px Width, Dark Slate Background \#1E293B):**  
   * **Header Box:** Risk Assessment Summary  
     * Status Pill: RED / HIGH SUSPICION (3 / 6 Systems Deranged).  
     * Clinical Logic Note: *"Breadth-of-systems gate triggered: ![][image1] independent channels abnormal over rolling 4h window."*  
   * **6-System Interactive Checklist:**  
     * \[✖ Red\] **Thermoregulation:** Hypothermia trend (![][image2], dropping over 4h).  
     * \[✖ Red\] **Cardiac Autonomic:** HRV Triad active (Sample Entropy collapse \+ decelerations).  
     * \[✖ Red\] **Perfusion Index:** Downward slope (PI drop from 2.1% to 0.6%).  
     * \[✓ Green\] **HR/Temp Ratio:** Proportionate (![][image3]).  
     * \[✓ Green\] **Respiratory Pattern:** Regular rate (![][image4], no apnea).  
     * \[✓ Green\] **Activity Level:** Normal movement logged.  
   * **Manual Spot-Check Entry Form (Card Container):**  
     * Text Input 1: Manual Thermometer Temp (°C) \+ \[ Save \] button.  
     * Text Input 2: Capillary Refill Time (CRT in seconds).  
     * Dropdown: Feeding Ability \[ Normal / Reduced / Refusing \].  
> 2. **Right Main Column (Vital Trends & Charts):**  
   * **Time Horizon Selector:** Pill Buttons \[ 2 Hours \] | \[ 6 Hours \] | \[ 12 Hours (Active) \] | \[ 24 Hours \].  
   * **Chart Card 1: Skin Temperature Curve (![][image5]):**  
     * Y-Axis: ![][image6] to ![][image7].  
     * Shaded Target Zone: ![][image8] to ![][image9] (Green opacity band).  
     * Reference Thresholds: Dashed Red Lines at ![][image10] (Hypothermia) and ![][image11] (Fever).  
   * **Chart Card 2: Heart Rate (BPM) & HRV Triad:**  
     * Dual Line Display: HR Trend Line \+ Overlay bars showing transient HR decelerations.  
     * Sub-Badge: SDG HRV Score: Low Variability / Reduced Entropy.  
   * **Chart Card 3: Peripheral Perfusion Index (PI %):**  
     * Trend Line: Shows transition from healthy perfusion (![][image12]) down to vasoconstriction (![][image13]).  
     * Tooltip Marker: *"Microvascular compromise indicator."*  
   * **Chart Card 4: Respiration & Apnea Event Log:**  
     * Area Chart: Respiration Rate Proxy (![][image14]).  
     * Event Pins: Red vertical markers indicating Apnea Pauses (![][image15] duration).

### **Frame 3: Device Setup, Pairing, & Calibration Modal**

**Type:** Overlay Modal (600px Width, Centered, Dark Backdrop Blur)

#### **Modal Content Hierarchy:**

> * **Modal Header:** Flexi-Cuff Device Manager \+ Close \[ ✖ \] Button.  
> * **Section 1: Hardware Connection & Signal Quality**  
  * Hardware ID: FC-8842-IN | Status: Connected via BLE 5.0.  
  * Signal Strength Indicator: 4 Green Bars (-58 dBm).  
  * Battery Level: Progress Bar showing 85% (\~42 Hours Remaining).  
> * **Section 2: Live Sensor Contact Diagnostics**  
  * **Optical PPG Contact:** \[ Perfect / Medial Plantar Placement \] (Green Check).  
  * **Skin Temp Sensor:** \[ Flush Contact / 36.2°C Reading \] (Green Check).  
  * **IMU Motion Baseline:** \[ Resting / Low Noise \] (Green Check).  
> * **Section 3: Caregiver Guidance & Maintenance Notes**  
  * Card Note 1: *"Ensure the cuff is snug around the ankle but not tight. You should be able to slip a finger under the strap."*  
  * Card Note 2: *"Rotate the cuff to the opposite ankle every 24 hours to prevent skin irritation."*  
> * **Action Footer:**  
  * Button 1: \[ 🔄 Recalibrate Sensors \] (Outline).  
  * Button 2: \[ 🔍 Pair Different Cuff \] (Primary Fill).

## **4\. Figma Component Architecture & Variants Table**

To keep the Figma file organized, create the following core components in your Design System / Master Components page:

| Component Name | Variants / States | Description / Properties |
| :---- | :---- | :---- |
| Comp / Status-Hero-Card | State=Green, State=Amber, State=Red | The main hero state card on Frame 1\. Automatically adjusts fill, border, and hero graphic. |
| Comp / Voice-Prompt-Pill | State=Idle, State=Playing, State=Hover | Audio button in header. Features pulsing soundwave icon when active. |
| Comp / Check-Item | Status=Normal (Green), Status=Deranged (Red) | Checklist row used in the Clinical Sidebar for system tracking. |
| Comp / Vital-Chart-Card | Type=Temp, Type=HR, Type=PI, Type=Resp | Container for trends. Has slots for title, current value pill, and line chart area. |
| Comp / Action-Button | Variant=Primary, Variant=Secondary, Variant=Emergency | Universal touch button with explicit min-height specs (48px or 64px). |
| Comp / Sensor-Status-Badge | Status=Connected, Status=Weak-Contact, Status=Disconnected | Top bar badge showing live cuff hardware health. |

## **5\. Design Handoff Checklist for Figma Designers**

When building these screens in Figma, please verify:

> * \[ \] **Auto Layout Everything:** All cards, screens, and lists must use Figma Auto Layout (Shift \+ A) for responsiveness across 7”, 10” displays, and mobile frames.  
> * \[ \] **Color Styles Applied:** Use the exact Hex tokens defined in Section 2.1; do not use raw hex values on frames.  
> * \[ \] **Touch Target Padding:** Ensure all clickable buttons have at least 12px top/bottom padding to guarantee a ≥48px physical touch area.  
> * \[ \] **Contrast Check:** Run the Stark plugin to verify all text elements pass WCAG AAA standards against their respective background fills.  
> * \[ \] **Voice Prompt Prominence:** Ensure the Voice Prompt Pill remains fixed in the top right header across all states so low-literacy users can always tap for audio help.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAYAAACbU/80AAABFUlEQVR4XmNgGAWjgHZAH4jfAvF/ID4BxAKo0qjAlQGiMAtdgkyQAcSTkPhLGCDmGyGJYQXWDBCF3egSJAKQGSBMSAwnUAXin0C8DF2CSPCEAdMykhwAAyJA/B6ID6FLkAiqGCCWe6FLEAs4gPg+EF8DYmY0OUIggAFi+UR0CVKBGBB/AOId6BJ4QA8Qrwbiv0DsjCZHNFAH4l9AvBBdggQgzQAJhS3oEviAHQNEUxu6BJmA6EQYyUB5mQAK8tloYjAH2KCJw0EuA0SBH7oEiSCYAbtvYWJYE3EDAxGlFAkAZBE7El8PKrYNSYymQAiI/zFALH0DpaeiqBhsAJRNvInEFlA9VAWgItecSKwJ1TMKRgFVAACQPj7zS9oyhAAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAYCAYAAACmwZ5SAAACSElEQVR4Xu2WzatNYRTGl89bGLjiGuhOlEi6ysQARUwYiRT/gTJBDHzUHaAMGFyiMJBIycCtKzcDcwOl+AuUIl+lfEU+nqe133PWfu4+++59St3B+6unu99nrXedd+27zz7LLJPJzBDmQKPQDWhH8OdBS8O6J+uhj9Bf6Cm0uBy2I9A9aG2xXgPdgQ53MurZDH2wbv3Z5bDNgr5CD6B3EovMN69BXYe2QHuK9TD0B1rXye7BQehSWLMRFtgQvLOFF/U8xOu4DF0N62/m+1cG71O4Jm9lTUbM9z3TQEGqO23DqYE6b9T8ptyCTps/Uk1hnY0VXqx/PlwTPk2K7lF4pkYNv7aphbQ4m9wW1k1ZaFNrEfXeh2vyWdaT5vn7xVcaNaycNN+4K3inrL+GyRlok3ja8FzoB3QR+hL8hOb34q61bHi3eeEx8U9A54rYzeLvtVJGO7ifL5imNG24FReg+9BvaLvEjkKPxeMB+N9rywvzvQs0UMN/aTixwrz4Qw0I/RyCLy/uWaaBaejns1qhH8DfSYVPQptDDJrnD2igAb/M9y7SgHAIGlJT4cE5sURSwxwY0pqDSURvSh0cNDT3tqzr2Gm+f0IDwis1lL1WffDkpd9bXh/vhjue7tsHLRePVL2gqrw63ph/HqetKjhWvlSzChaJj1maaB4Fj1NM/N5tNc9ZHTw+9lU34WfwVW1JM8Mq8fkCbFxvifnd5oY0714pZThp1k6Ko2FiHDoW1ukFWKXvIa8NB6z7nU4380kpI5PJZDKZmc8/XDCrRwpQkAgAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAAYCAYAAADu3kOXAAADlklEQVR4Xu2YWahNURjHP/OYoQxJESkZCi9milLmFzx682CIkDzIg5IHQxSlZEiZMpbIAy9EUgp5IOLBGBmLjBm+/11rOd/937XvWee457on+1f/7l7/b+21117fPWutvURycqqES6pzqp+qLhTLqTA9zPUecw3OU7lq6aYaxGYT5FfGNUjp/zRxSdyoamH8Lea6JFapFrHpGa96La6j11TNa4frMEZcXegKxZoaGLwzpnzIXIOjVLbsFveOd1RLVMNUJ1WXVbN8LJkjqm9SGLjFtcM17FDtNOVP4ur2N14W1ZCMw6p25GFw8Z/+RtWPYoFn4t5vIAeUUVIY07LISgZ8NM5eyoOqIRkp78FsEHffRA4YHkh5bdcQS0YH73OjMS9GU09GH9UmNhNIeX9sCorVySSWDLBeNY68lM4A1LmqaqZaqTohbl61zFOtUe335eGqzaptoYIHbSzwMUydAGvTQXFrWmCCuHl/rfGyuMtGAtPFvddDDkRIGaMoWcmIgbrYgxcD9b6IGzCAAX0sbi4OrFZ9lEKbWPjALu+N9eXWqq3euyeuDWwk2nrvrOqFqq+v/9b79fGDjQRui2v3AAcaEjwAO4JihM6050AE1HvKpjjf7ufnes9uC8EH71tQZu+09wYYL+zospipms9mAo/EtRt+nRUBD1jKJhF2Cd05kAHqovMMD+hsKgcmifMxPQX4XoDtJ3sjIp7lMxuJ7BXX7kXyGxQ8YBmbhq7i6rThQD1kJQPTgx2oGVQOtBTnnzJeLBmYBtkb6r2sb6LnbCTSWVy7KcnkPiWDG5ez6cELccMpc2ZWMnhAs5KBxRg+1ooA3wvQF/YGey+WDGwYeCNRCrE+MFgf7T9RSaDxFWx6Yot1zGPqS4ZdS7KSgXMh+FikA7GBiP0yhniP1yHAdUslzBI3OWDALjL27KLgDAmNx85S7Bc6qxiog6Thpx3A1zzfG5Jht4u9vHfMeCD27JA0y2Tv9SQfU98F8sphpLj2b3BA2a5ax2YxjqteifsvfeL/vhSXANBb6iYgKGXODL8efDOE++4Xwn8IycBH5ld/DU01dTqJ6yv6CeEaA/teCv3H1hbfF+gbjivgYW14JwVw/NHRlP+GVuKO2kN/w1HRFFup2sA2Ey/RGDTWc6qWOdI4g4Spr5zjj/+Ghapb4pKxT9zxSKW4zkZObXDWgyOP0eLOmLDwVorvbOT8O7AhycnJqQp+A+apDorXTQpkAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIkAAAAYCAYAAADOHt4vAAAE00lEQVR4Xu2ZaahuUxjHH7OMmcvQOaFQbjIViSvXUKbQ5Ysi7oebIkNIwi0+mD4QIiXzB2PyhULuvYhQhkRCyjzPZB6en7XW2c/7f9d+z+l9zzm9l/2rf2ev/1p7vWut/ey11l7HrKOjo6Nj1WMHNToSm7t2UXNM2di1h5qzxALXaWquqky4/lbT2dT1saW8dy0N6CD2tVQWPSN548YGrr8stfVHyZstPlFjRGjr2WrOF+XBRta2FCCF1SyV2T14bYxbkDyiRmAug+R7NUbgWEtt/Vkz5oPHXD9Zf5B8K2nY1fWnmhXGLUi0b5G5CpJTXYvUHJHt1ZgPtnU97PrS+geStK6nu2V/OsYpSFa3wW2eqyBhKftPUAavFiTfZO+J4DG77B/SbXDfs5aWqHNcD1gKsMgJrotcd+U0b96ZTfYUJ7s+dd3uWrc3yw5y3eP60HWH5MFWrj8stefwrEN7SvQGyQGu+1ynNNlTbOi619Le7HzX3b3Zfbwq6eNcF7huzel1LO0vlrnWKoUs1U2ZHYMHtOlyS2NZaKvzOkvbhZF50LVdvq4FyRrZKyJAjuwp0Q7lf7FmIAmW911fTZVIg8HDoSwByUBxfWcow9J2U77mgZNfBo/gIc0SCCfmNLNjgQAlePC5RqeHfChBQtuYdQhEvNdCGeqMe4FNrH+8IjykrcU71/WRpft4uGdknwePN+Fanr2ds3d0TsO12Ysz1HR1rpnTQ7GZ68mQrgUJ0FH8otd7s1uhLG+3gn9LSB+VPWYVeMhS24A3UdsUPTbQXK/XZP+bZuaIHJ/9NkrfIizB0bvf9U5Iw3eSjmh9BQKcPGakCJ4uT3hfVzwtN6hOXsSh0U7UguQwa96ehdYMpk6jNSj3nprW/0COkHQE/21LM0jRsuzX4K353frzhwkSBjx6jAXpX12XWZpJ2uCYoCyhyqSleibEx7ux4mm7SGuQTGa/VucV4s2Ymy1NZ5FakGgaWDJqvkKZWpCwfMT7pwsSpvyDKyow3VLuLddSa849IsMECcukeldnr+iN3uwpVlpaqmuwbHHvluLjXVXxtA2kNUgG1XmleDPmUdfTotIgrlkOBg0s/j5qCpSpBYl2fLogqS1ZhRcslYkbtLJJjSwW77lwDdomYCaIXjxEZN/C5pb8A4Nf0Loi21jK55AygqcPtNYu0hokg+rUwBsJbVBZ72u0+RHKtAVJfPBshNvq+8HqeU/lv+Qxs0ViP8oG+JjgAZvkiPYddCZZbv0vxm+uC8Xby3WeeJFJS/Xyb4sInj7QWrtIa5BMZr9WJ7PfrNHWoEvFI/2KeDVKZ+IbyJqrv7Eke7XpuXxdMX0XeGsez9c6YDtZsyfhU7C8mexV8PbLaT2xrPWdA8borbD6fVuI95mklT0t3af/18LTT/hau7TPMKjO28QbipcsnUF8kMX1iyGfHTw/9mb+yxs2E0pHrrGms+wbInwi878Nfpfj/7YDreetqeP64PNZzb0l76zs02ZdUi6xptz62dvI9YU1feeagOJTn9mujAdnOStce1vauJZ6Flk/bX0A+ks/S3+p6wZrxp/fpO0cS3wePPaLtItPdD53UTkNn2mdHWPCSa5D1OzoiOj5TEdHHy+r0dERudjSYV9HRysL1ejo6Oj4f/MPwkmlWP09oe4AAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAYAAAAPtVbGAAABB0lEQVR4XmNgGAV0AsxAXA/Es4HYBUmcFYhFkPhkATYg/g/Fs4DYFoiDoHxZIP4HxDpw1WQAPQaIYWfQJaDgGwNEniJLYD7ABUBBSJEl2xkgBkSgS6ABgpbkAPFuIE5AEwcBQr6AgWUMOCzhYoBEmBSUr88AMZARroJ4S3ACkAXoABS+n5D4FFtyH10ACn4isSm25Aa6ABSAkiQM/GaAWMKDJIYNZAOxGLogCOBy4S8kticDRN1mJDFs4CG6AAwIAfEPIOaG8oUZIAaC4gUZPIeKg3I9NgAqUi6jC6KDLgZI/LShSyCBJwwQi1TRxEEpFFeIkAUiGRBxBApSEL0XRcUoGAXDBwAAyMY5+85i7BwAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAYCAYAAACmwZ5SAAACVklEQVR4Xu2WzatOURTGl+98DMSNATJSBkImUq7JNWHkO5LMpEwMjEyUkQED6g7cayg3SYgoxcREkYm/QBT5KoVEPtZj7XXf9T53b+9+1a072L96es961tr7nPWec/bZIo1GY4owQ3VKNaraGvxZqoEQF1mn+qD6rXqsWtidnsBKsdpa5qvui415oprWnf4bf1HdUL2lXGS22BzQiGpQtSvFK1S/VGvGqwscVV0I8WWxCTYEj/GT1rBMrHZuihenePp4hcjHcAzeUAzWio17yonEV7F8z4ZzF5/zHNwp3I1SnkHtVfJw0d9CfCYcA64H/7omgMe8quFXMnGi0uTLVbdU7yWfz4G6feSdTL7zLhyDTxTfE6vfTz5T1TDjF7OdE9K5yNqGt4jVbSb/cPIXpXim2B0/p/rsRYHSDWCuSJ8N7xCb+DwnlOtiCwOobfi4WB2vB3uTv5H8ErUN98VZ1TXVT9UQ5bDQPAxxbcOnxeqw4ER2Jv8g+SUmpWHHV9U7weOT1TZ8RKxuPfl7ks9/bIlJbRjEE1xUrQ45UNuwv8ObyD+UfPy5NfwQq1/ACeKYagmbDB5h7Fgi3jAWG6yQj0iex/GlNCbHHLG6Xqt0L7aJ1d/mBPGCDWa35B8X9/Bty5EbA7AYLSUPdXFjA+4mvx9ei43BbisHtpXP2cyBSXAnHN/R4KJK5BrG9jDn5+4mYmwJ+8X3DKvIn5f8KvAtxB4UA/zdHO6q6PBMbNv3MgnH2Bs7N1UnQuyMib06+MX8+Fz9Lwek805/T78PuioajUaj0Zj6/AE0h6zyFwuMpwAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAYCAYAAACmwZ5SAAACB0lEQVR4Xu2Wv0uVYRTHT1qK1pSiQ4qT0CARLSGoSy2OhoYh0dbS0uDUEji1tLT1Y04cRCUwCHJxVFr6C0QhsQiEijD6cb4859Xjt9fuub13uMPzgS/3Od/nnOfe8/547iOSyWSahFbVQ9Vz1XXnn1F1uzjEgOo3m8pZ1RtJcxuqU8en/0mtWsRfVUuqPZrztElaA3qmGlXdsLhf9Us1dJgdpFjQc8G8Dou7LG45zDiZSO1nNwa7FINLkuo2ecL4Jmm+roZxF3CluWF4C+Thi7+TV0ak9pEbA84HZTfCg8e8rob7VCuqT/L3wohvkvfA/FpEaj+6Mdin+LWk/GnymboaLn4ANzxm8YjzwB3zz5PvidaelnTHH6u+FEkO5EYu7ksJNrwo6aUH3PB9i684D0yZf5V8T5VaT7ThENhE1lzMDc9ZjE3DM2H+DPmeKrWehjbMC3HDdy2+7Dwwaf418j1Vaj0Na/ip6iJ53HDxHg47D9w2H387J1Gl1vNDUv45niDuqXrY9GD3WycVVxPjF6p2i2vttGVUqfWMS8p/xRPEFhsRyh4fxE/IWzXfg82ol7xobS0+SKrBaasMHCvfsxmhrOGyO4IYx7oCHA//tzbKjqTaQfI7za+Ld5KOdNsmjHHuLZhX/bRPLI6/HGZZNcumxGqj3JKjd/rAPt8ey8hkMplMpvn5A1CDrO5iR8oNAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAYCAYAAACmwZ5SAAACaElEQVR4Xu2WS+gOYRTGj1xzKcllISnlmihloShig41IsbNUUoiFS0mIBQtigYXkUrIg1yxYW8glWxZKyK2UW+Rynu+cd753Hu98MyOL/+L91dM35zln3nfONN/MEclkMn2E/qrdqlOqJZE/UDU6iiuZrXqv+q26pxpZTheMUD0Tq3tAuSo2qy6qZng8TXVOtamoEOmn+qy6rHoT+cwgsb2hk6oFqpUeT1D9Us0sqitYrzoaxbgYLDAn8sA693EXAe7wxyJbzT7pXmTQw1KFyAeKX1MMZomde58TzhexfG3D4SJ6eWM8HhJ5XFMFbgxu6BnVLrHHkTlIMZ4Ipm4/rNuo4Rfy90K8OMdgKMVVoMlFbBJvKeYn55bY/mvIZxo1zOwQO3FZ5CF+4sfzxP7LTdkp9Q0PUH1THVZ9ohxI3fAUF6RlwyvEFj4SedPdO696rBqmOuZeE7ar9ovVn/bfE6WKepo23IpDqkuqn6rFkb9W0hvijfiVvBRbVLfJw1p7yetFav//xnixxa97vNzjl0WFcdf9f6FtA23rWxNvMNGPz3bTHa66P5d8Bt9YBk9RmwZ+iNUP5wSxQTWWTQabY2KJCQ3Pj2L+VNxwfwr5DGow1LDXpuGlYvXXOEE8Z4NZJenNgxe+mTh+2k13eOR+zGrVOPJQsy3h8bl1vBI7B9NWCgxE4UvSEywyOIrDRHMz8vCq5wtEvCeK8eimGsEEhMElsFCsZmrkNSXMDJPJx0zA+1YySuyNixPe+e/xUoWxUSwXZukD5XSHK6qtbEp3Tg+aVE63Al+N8J/+7r93ShWZTCaTyfR9/gBuDq3MdpEuXgAAAABJRU5ErkJggg==>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAYCAYAAACmwZ5SAAACQklEQVR4Xu2WP2gVQRDGR/wHYiGipgiCSCQSgwFLiRBJGq1EEU2RzkKwUUkKjZBCBYtYJGChKUQIglgoJCgprLVQROzsAkKCRkVQCYn/vmF2k70ve/duBSHF/uDj3nwzO7f73h1vRDKZzCphLTQEjUE9gb8e2hbEpXRAn6A/0AtoSzEtb5x/DuqDeqHT0CmnKi5AD6A2F++FxqHzSxUia6Dv0CPoQ+AzG8T2qLoDHYKOu3gn9BtqX6ou4Sw0GsS6GW1wIPD8TWL6EtTFuCYr17wuVIh8pniWYmW/2NqXnHD8EMs3PLDfRJWnn/Xb3Ae1QLudeF2MIbEv9B50RexxZG5QrE8Ew3titG+tA7+XlY24+avgs+e51GgudsjDbBIfKf5K8VOx/ehrVEWtAzOXxRYe5UTAQeghmyUMSuMDr4PmoZvQN8op/AOUcV8SD3xMrPEIJ4g6N/dcgq6LrbnrrrcLFY2pe+AkhsV+tV9QN+VC9F1U1eUiNEWebv4qeVX8lwN7msWaT3LCobldbCaSeoDU+mTKbnBG4n4V+h/L6FOU0mdRrH4zJwidE3awyejNdWIJ8QfuJP+d81PQeh1q2Evpc0SsfoITxDQbzAmJ39x7/J8Zqw05CTWRp/UDEa+qT4wZsTU6bcXQsfItmzG0ycYg9hPNk8DzVG1UH91YXieg7UHcJVbTGnh18TPDHvI3Ob8WW8VmUF0w5663ChXLaO4nmwGPoX42ZXlO99Ip7V/ROd6/0wvu+qxQkclkMpnM6ucvs5ag8zUBeTsAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAAYCAYAAACC2BGSAAACmElEQVR4Xu2Xy6tPURTHl1coz6sMPEYGKI8ycCdiIOURKUaKmRLxByhlQNwyQSSPETNRJCMD8kgSpVCeEQPlOfAoz+/3rnPcddZv/+7Z55xfN2l/6tvvt9d3rX3W73f2OWcfkUQikfgvWQYdh3qgISa+z3wfUOZC76Df0E1oXNHu5SO0HhoPjYXWQh8KGe2Jqd0KPYbeQqucZzkm2ucDaIto72egq9DKzBtwNkEHzPiUaCPzTIww5jWlkNEeX+drp0EzzXgRNNqMc16L1k73BuiWvrk7ygofCBA6cLvYHugwtNh5ZZTV7vUB0ZNr2S06z0IXtzyR1r5rcxT6Ds3wRoBX0nrgdn9iXcpq2eckM54FdZkxCfXkmSjlOaVcgj6JTlaX7aKNLHfxJs3F1O6CrkC3oG3OYy+c46mLh4g5VgtDRW+yL6CRzqvKatEm9ntDNP4Iug/dgH6IHjuGJrXknugcJ73RlDHQG+g2NNh5deDW4DT0U8L3Lf6I4WZ8MYvF0KSWcIEw/6A36jIZ+gyd90aH4Pxs+II3HLyPMW+HNyKoWntCNP+yi9eGDfByOOKNDsKG/UqxG1rC1c+chy4eokkt4d6S+V+9EcD33S/5ijznjYrw8uUG1pL/iQuycb51GPE3Q2RUFrtmYiGa1FpCJ9YzCDrrgzGwIW5C+VTjJFVYI+Hm8li+gl6KnjDLUtGcdS7Op7ulSm1/8G2HNXe9YeBDy6/6SrCYB3guxbNeBhuzN/05WYw3/5yp0rq9+Catlxdf5Vi72cRia2OYLzr/HW+IvnXt9MEm8BJ/D03wRgBuan+JNsf3Vn4eKmQoG0S9/NXretHuZTb0zAclrjaWYdL3dKe+ZJ9LbFIn2egDiUQikUgkEv8WfwAgwrt3CbdD4AAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAAYCAYAAACC2BGSAAAC8klEQVR4Xu2Yy+tNURTHF/LKWzJgoiSPPIpCEUUGiH7lUYZiIOIP8Kg7QMQEGWEgMhEmkpLyTgZeeZRnioEi78dPXuvbOvveddbd+5x978/vDrQ/9e2e9V1777PPvufcvc4lSiQSif+S+ayDrJ2sbsrfrY5byiTWW9Yf1nXWwHy6SoWkzS/W5nyqlC2sj6yvrFUmB9azHrPesBabnOYAyRwesNaRzP0E6zJrUZYrZR5Jw7U20SRrWHtVfJRk/MnKA+dZc1S8ifVBxUXggs+p+B7rqopHssaqeDarn4odr0jmNtommGkkuahFdMwg6bDLJhrEd2LrdWW9VrEDbYZb09Cf6scH8Nwdv0MnMvDlaraR9JllfM0T8p+rlFGsdtYxm4jkJdWf2C5im4kd8EZY03Cbwn3xmwbGsIap3HjWYBUDOycfQ6m8TSFDWO9Yl2yiQTaSTGSB8vpkHoRHD4zL4jJCF2/9rayLrBusDcoHmAvaPjW+D9+5GqYX6znJ75DetWJwd9wem2BOUe3Cb7I+59NB7GI5Qr6PuyRtj9hEZ4Lb+j3rrE0UgNLgOMnOO9fkHNgQ3MVDE/JpL6HFCvk+XpC03WcTnQF2rR+swzbRANgoMOHTxv/CWpYdP6LaIvSttvATWqyQ7+MQSdsLxv+nYMfCSbbbRJPYC0TZc0XFYCZJm/vGt9ixHCHfxwCStt9swkPsmFVWkHTqSM2IxxcFrMZdIBbKxW5D0aCALpv0J/K3gffQmgXELHoX1klrhkB1jwGLKvsYlpB/cs5zGxOOl9bSVVaT1GYa7O6a5VQ/PoA3xZoFDCLpc8smFNcocjOtUP3bREfAxHqqeGLmnVFe0UL0UDFKLHj2yYCni2e8IPjGK2MqST9UBxa8dVWs2SpQ1P4mmRzeW/G5P9dCWEmSQ2nzMztGbarBbv3MeKA3SXvUgHdY30kevWboTvIFYzwI7+L4xOtwopWgBFkYqelZn4QBjxD+sYiR/mckkUgkEokcfwG/DMy/cVptxgAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAYCAYAAACldpB6AAACVElEQVR4Xu2Xz4tNYRjHHzNMpqZhMZqRbGwMsjQWIqMksVIWyB9gJkKkaaZmgR012VloIoUUNkLZTFlJTVNSYoxiI6EsLPz+PvOe997n/Xbu+XHvzej2furTPe/zPO+55zznx32vSCTSCvTCDRwklnCglXgKb8Bj8DPlPJ3wDwcXglPwCAczOAFvwfXJuB9eh8crFSIrJTy5x/ArfAH3wN3wTVKz1dT9U/QKfRd3EOpQmM7knFTneaeDCpGbSdyzCe5NtheLuwPU15WKAgxwoImUbcI4vASvwjHYHqbneS5hE7TmrBkrv2icSwd8C5/ARWGqYco2QU98kIPEGQmbsBPuMmNtYt2PQRucgXPibqdmULYJo5LfhGUSNsG+GLvgKzNuiAfiXjZ9nChJ2SaMwPPi5k0mn5eDCsc++EPcBTts4r/NdtPQA/kJN3KiIHoSwxzM4CR8RDHdBz/zaWiztpixb+ZBE2sIv8NtnMhB5xzlYEl0H/b2T6MbvjTj+/Bhsn0Hrja5utGrqQdygBM56Bxd0BQl7cWsb/q8JnCex7UWVIXwv9s7OFEQnWsXOnlo/aeUGJ+UZRJuNmNtJNfzuBBXxL141nGiJPrlugpMY7+49b9F60+nxGqdxHJx6waG63mciT5HX+AKTtRBj7gvv8AJqV4tPrhvEn73dnE1a03MwvM9HM99HPSAnsFZuJRy9XAbfoTv4bvk84O4pbTlnrj/Fow+Dr5B6powXeGa1P7VuijuP4hyF64yuVR02Zz2QvrfmeIAMSFu3XCIE5FIJBKJZPMXSU+D7HwboTUAAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAYCAYAAACldpB6AAACbUlEQVR4Xu2XS6hOURiGP7cQIYokJRkol6Qk14kkMSF3yQQTJYNT6gyPDJWMMBETpNyKJBMjOoekpFwiAwMTopRyfd/WWues/dpr73V2f0ed9lNv//7e9e1/r3+vvb79/WYtLcOBGdACNYUxagwneqFL0BHok4wFxkN/1BxKJkD3zE2iDxpRHE7yDHoEHYb2QbuhXdBOLzLTij/uPvQVegFtgjZCb33OmihvSJllbgJcCTLNxyP7M9IwL6XPPueyjwPLoM3+eLS561Jv+jM6DO90Hd+gK+I9hr6LV0ZYPe71edBcr/hHP5d4FHQ8iskviTvCOegHNF8HSuAEd4jX7f06nqgBHkILo/iYFb9rPbQhik9bh7cB99sXaLoOJFhrboKrxd/v/ani17ESuireZCvehLgwToReR3FjuK9YZN7bwL7O5ai5CS4Vf7v3l4tfR+rp2WruyXxnroAGfkfHjZgEfTS3f3OKWBk95ia+WPwt3t8rfhUXvHI5C62K4hPmrrkn8pKwmrOY3dKBBhwyd+El4m/z/jrxq2D+HDUTcAFfRvFt6K4/vgbNjsZKYbH7CZ3RgQaEmrBCfD6y9HnDczhg6a1QhuZqnGqo/iE8ETd1YBCMNTeBpm+HwCvLzz9vxVrDxkzP1bgWVtgP5lrT3E4vhhfkayrmjvdjWCzZ/5fBXM0vY4q5vkHRczXOhk3IU3MVeJyMVVG26oxZ0QNhtTQvUDUWk8pRP3s7VMEtwi9iC5wD/9ywa+MnJ8RXp3ID6lLTw3NYp6q4CC1S03PSBrrW65Zfi7I4qMZ/5IEawilzfcNgXsstLS0tLS3gL4Z7i2TEOkAYAAAAAElFTkSuQmCC>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAYCAYAAABz00ofAAADKklEQVR4Xu2Yy+tNURTHF4rExHMijzIiJBORDPgHECaSSCYmDD2TiYGonyQzKYUomVAeZUAKkWIi+ZU3eeb9tr6tte5Zd93zuOceM/tTq7P3d6199j7rnrPPuocokUgkEv8Dw9jOsf1hu842oN1dix0k5/nFtrXd1aKX+d6QxJu9Zfvh+oez0BZP2b5RFvOd7RXbe6ftaUULd9m+qg92o93dgV/TByq+5g7GkQwaqv1R2h/Yiuiei2wLXH8LyUV6msw3hiT2cnSQ6L+jqFhiIsNJ9GfRQaK/0GMRQ9g2ksScDL5KPrEdDxp+ZfzqdUDisNAIFoVkG03ms8RfiA5mN4lvf3RQceLBZxLflKBDm6bHxcFnnNVjT4nHoOVB26x6HRZR/hhok0K/1/ks8eejg9lE4vsYHVSe+Hskvr6gWzyO2NLyeKnH2omfTzJoXtBXqT4y6GVg37YLnKzaVO0bTecrSzw0+OKPCmxdeZgv744Hx1zbM5dthrbhr5X4DSSDZgV9meqzg17FKcou5CZ13n1N5ytK/AHVdwbdKEr8WBK9Pzooi8cWivZB5wP+3VU78VgoBtkvZ2BPg74i6N1wh7ILhU13vqbzWeJx0dfYblFW2eCJK8LW8lrtndOwzeVhibe274MTrg1frcSvIxk0M+hLVV/IdqULM/DixN0LbO+EoXoA3cxXRtEdf1X1EUE38hJXhY9fo/2J2t/ONihz10+87blzgr5SdV+NVHGEOss87OU4D2pj0HS+osQD6HFrM5om3voPXNtTO/GoQzEovpC6rTI8iLeXqmcbZedqOl9ZOVmW3DJfETH+vmp4evHkemonHmDQvqCdUb0OiMeWEVlLsmijyXyW+EtBB2XJLfMVEeMnqIa6P9JT4vPuNvSXBK0K3MXxPADaYNdvMh9KPsTejg7KkmsVk5/DfPZvuQqrdtYHHVp/0FACQ897Cis5SvJtBUecBGVfL6wmGY+99qe2R7dFCL3Mh28zT9gesT0m+fNyyPlR1eCTAc53mm0v2xe25yTxGIdvN/ETRuQhyScEm8fHoyob7/p5a9rl/IlEIpFIJBKJxL/mL6vQPFIJ+3pWAAAAAElFTkSuQmCC>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAYCAYAAAC4CK7hAAABuklEQVR4Xu2Wuy9EQRSHj0c8EiISEgU9hZKoRCj4AzQk9AghEYVEhSiodaKRCHp0q0ClUSARr3gUovBIxDPhd3bmMnOya/beXdlmvuTL5pzf3Mfcu3fuJfJ4PNlmFPbJpuYB9sByWAY74b01Isssw3f4pe234x+C3LTaGhGSRtnIIK6JzMB52CaySBTAC7gNc+wobVwT+Rdy4T48h8Uii0q6EymFK/AMjsElO3azAZ9glQxC4prIMTyAu/AT5hs5Py8vRs2LQiqTT8giqQPUyyBF+MADsqnhrNCo13UvYA2eGDXzKOrQTJM6SLMMHPA2g7KZhFpS4yd03a7rNzhJ6o6kDV9V3mmXDBzwNkOyqckTNT+jPP7I6M3qXuChkYViitQOWmWQIrztsGyS+stwVmT0SnSPV0+GX5IBPMlVUnmL0XeyAD9gnQxCwgcekU1wCZ9Fr4PU+G5dx2DTbxyHX7TjopeQTVKfCZUyiEAFqRObkwGogaei90r2KrUlaob3l/Tc+CW4R2rH5q2OCq82d/AaXunfW1JX06SX1Ind6N8dO45PpIHUwx48I39+AfAnSqbf6B6Px+NJyjckOmoJs8LnHwAAAABJRU5ErkJggg==>