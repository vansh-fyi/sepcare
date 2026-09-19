# SepCare — Coded UI Design System Specification
**Version:** 1.0.0 · **Status:** Production-Ready · **Domain:** Neonatal Sepsis Healthcare Monitoring

---

## 1. Product Context & Design Philosophy

**SepCare** is a dedicated neonatal healthcare monitoring application designed for newborn infants (0–28 days) who wear a continuous physiological ankle-band sensor. The platform serves two primary contexts:
1. **Parents & Caregivers:** Requires radical calm, emotional reassurance, zero jargon overload, clear scannable status, and immediate emergency action clarity.
2. **Healthcare Professionals (e.g., ASHA/ANM workers, NICU/Ward nurses):** Requires higher data density, physiological correlation, multi-baby ward triage, and 72-hour clinical trend corridors.

Both contexts share the exact same underlying design tokens, components, and status rules.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CORE DESIGN ETHOS                               │
│                                                                             │
│   “THE INTERFACE SHOULD STAY CALM. COLOUR SHOULD APPEAR ONLY WHEN           │
│                    INFORMATION REQUIRES ATTENTION.”                         │
│                                                                             │
│   NEUTRAL SURFACES (70%)  ──►  SOFT PASTELS (20%)  ──►  INTERACTION (10%)    │
│   (White & #F7F9FC)            (Soft Blue & Lavender)   (Blue & Status Hues)│
└─────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Clinical Distinction:** SepCare is a clinical monitoring and early sepsis triage platform, **NOT** a generic baby tracker, fitness tracker, or decorative lifestyle dashboard. It strictly avoids playful cartoon illustrations, emojis in UI, saturated rainbow palettes, and heavy 3D skeuomorphism.

---

## 2. Directory & Asset Architecture

All coded design system foundations live within this directory:

```
frontend-design/
├── design-system.html         # Master interactive visual showcase website
└── design-system/             # Coded system assets
    ├── tokens.css             # Foundation CSS custom properties (colors, type, grid, radius, shadows)
    ├── components.css         # Reusable CSS classes for all components
    ├── icons.js               # 40+ standardized 24px outline SVG icons & render helpers
    ├── components.js          # Interactive showcase logic (status toggling, time filters, size switcher)
    ├── showcase.css           # Showcase presentation layout styles
    └── DESIGN-SYSTEM.md       # Complete design system reference & engineering guide (this file)
```

---

## 3. Color Tokens & Semantic Architecture

### 3.1 The 70 / 20 / 10 Balance Rule
- **70% Neutral Surfaces:** Crisp white cards (`#FFFFFF`) floating over soft off-white canvas (`#F7F9FC`). High contrast dark navy typography (`#182235`).
- **20% Soft Atmospheric Pastels:** Pale blue (`#EEF5FC`), soft lavender (`#F3F0FA`), soft peach (`#FCF4EA`), subtle blush (`#FBF1F2`).
- **10% Interactive & Semantic:** Primary blue for interactions (`#6F9FD5`), semantic status (Safe, Caution, Critical).

### 3.2 Master Color Token Map

```css
:root {
  /* Surfaces & Canvas */
  --sc-color-bg-primary: #F7F9FC;
  --sc-color-surface-white: #FFFFFF;
  --sc-color-surface-soft-blue: #EEF5FC;
  --sc-color-surface-soft-lavender: #F3F0FA;
  --sc-color-surface-soft-blush: #FBF1F2;
  --sc-color-surface-soft-peach: #FCF4EA;
  --sc-color-border-default: #E6EAF0;
  --sc-color-border-subtle: #EDF1F7;

  /* Typography / Text Palette */
  --sc-color-text-primary: #182235;
  --sc-color-text-secondary: #5F6B7A;
  --sc-color-text-muted: #8D97A5;
  --sc-color-text-disabled: #B8BEC7;

  /* Interaction Blue (Strictly Non-Health Status) */
  --sc-color-brand-primary: #6F9FD5;
  --sc-color-brand-hover: #5B8EC5;
  --sc-color-brand-soft: #E8F1FA;

  /* Tri-State Semantic Status: SAFE */
  --sc-color-status-safe-primary: #4FAF78;
  --sc-color-status-safe-soft: #EAF6EF;
  --sc-color-status-safe-dark: #27734B;

  /* Tri-State Semantic Status: CAUTION */
  --sc-color-status-caution-primary: #D9A52E;
  --sc-color-status-caution-soft: #FFF6DF;
  --sc-color-status-caution-dark: #89691A;

  /* Tri-State Semantic Status: CRITICAL */
  --sc-color-status-critical-primary: #D95757;
  --sc-color-status-critical-soft: #FCECEC;
  --sc-color-status-critical-dark: #963737;
}
```

> [!CAUTION]
> **Strict Semantic Boundary:** Blue (`#6F9FD5`) is the primary interaction accent. It signifies buttons, selection, pairing, and filters. **Blue must NEVER be used to denote baby health or physiological stability.**

---

## 4. Typography System

The primary typeface is **Inter** (fallback: **SF Pro Display / Text**, **Manrope**, **DM Sans**). Numbers must use tabular lining figures (`font-feature-settings: "tnum" 1`) for clean vertical scanning of vital signs.

| Token | Mobile Size | Tablet Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.sc-display` | 38px | 46px | Bold (700) | 1.15 | Hero greetings, top-level status headlines |
| `.sc-heading-page` | 24px | 32px | Bold (700) | 1.30 | Primary screen title, modal headers |
| `.sc-heading-section` | 18px | 22px | Semi (600) | 1.35 | Grouping headers, card section titles |
| `.sc-heading-card` | 16px | 18px | Semi (600) | 1.40 | Component header, vital card label |
| `.sc-body` | 15px | 16px | Regular (400) | 1.50 | Clinical guidance copy, explanations |
| `.sc-secondary` | 13px | 14px | Regular (400) | 1.45 | Timestamps, sensor telemetry sub-labels |
| `.sc-caption` | 12px | 13px | Regular (400) | 1.40 | Metric units (`bpm`, `°C`), micro-badges |
| `.sc-vital-metric` | 36px | 44px | Bold (700) | 1.10 | Dominant physiological readings (tabular) |

### Physiological Metric Display Pattern
```html
<div class="sc-vital-card">
  <span class="sc-vital-card__label">Heart rate</span>
  <div class="sc-vital-card__measurement-row">
    <span class="sc-vital-metric">98</span>
    <span class="sc-vital-card__unit">bpm</span>
  </div>
  <span class="sc-status-pill sc-status-pill--safe"><span class="sc-status-dot"></span> Stable</span>
</div>
```

---

## 5. Spacing, Geometry & Corner Radius

Built on an **8-pixel geometric grid** with 4px micro-steps:

- `4px`: Badge inner padding, micro gap
- `8px`: Component internal tight gaps, list row spacing
- `12px`: Input vertical padding, compact card separation
- `16px`: Standard card element gap, button padding
- `24px`: Default card internal padding, major component margin
- `32px`: Section-to-section spacing
- `48px`: Major viewport section divisions
- `64px`: Page-level top/bottom padding

### Corner Radius Hierarchy
- `8px` (`--sc-radius-8`): Status chips, tooltips, micro badges
- `12px` (`--sc-radius-12`): Text inputs, search bars, selects
- `14px` (`--sc-radius-14`): Buttons, segmented controls
- `16px` (`--sc-radius-16`): Compact cards, secondary stat widgets
- `20px` (`--sc-radius-20`): Standard cards (Vitals, Device, Insights)
- `24px` (`--sc-radius-24`): Status hero card, major alert banners
- `28px` (`--sc-radius-28`): Modal dialogs, bottom sheets, tablet panels

---

## 6. Elevation & Shadows

Elevation relies on surface contrast, hairline borders, and soft diffuse ambient shadows:

```css
--sc-shadow-card: 0 4px 20px rgba(24, 34, 53, 0.05);
--sc-shadow-floating: 0 8px 30px rgba(24, 34, 53, 0.08);
--sc-shadow-critical: 0 10px 32px rgba(217, 87, 87, 0.12);
--sc-shadow-focus: 0 0 0 3px rgba(111, 159, 213, 0.25);
```

---

## 7. Iconography System (`icons.js`)

All icons use a uniform **1.75px outline stroke**, 24×24px viewBox, rounded terminals, and zero skeuomorphic fills.

### Icon Catalog by Category

```
  NAVIGATION (11)
  home · monitoring · history · alerts · profile · settings · menu · back · forward · close · more

  BABY & CLINICAL CARE (8)
  baby · babyProfile · caregiver · parent · healthcareProfessional · hospital · doctor · medicalRecord

  VITALS & TELEMETRY (8)
  heart · heartRate · temperature · movement · breathing · pulse · activity · sleep

  DEVICE & WEARABLE (10)
  ankleBand · wearable · connected · disconnected · sync · syncing · battery · charging · signal · bluetooth

  HEALTH STATUS (7)
  safe · caution · critical · information · success · warning · error

  ACTIONS & UTILITIES (16)
  search · filter · sort · add · edit · delete · download · share · refresh · calendar · clock · expand · collapse · view · hide · insight
```

### Rendering Helper Usage
```javascript
// Render an icon SVG at any size (16, 20, 24, 32px)
const iconHtml = window.renderSepCareIcon('heartRate', 24, 'custom-class');
```

---

## 8. Button Component System

| Variant | Class | Background | Text / Border | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `.sc-btn--primary` | `#6F9FD5` | White, no border | Primary action (Sync, Save, Filter) |
| **Secondary** | `.sc-btn--secondary` | `#FFFFFF` | `#182235`, border `#E6EAF0` | Secondary option, dismiss, trend view |
| **Tertiary** | `.sc-btn--tertiary` | Transparent | `#6F9FD5`, no border | In-card text actions, "View Details →" |
| **Critical** | `.sc-btn--critical` | `#D95757` | White, no border | **Urgent medical event only** ("Call Clinician") |
| **Icon** | `.sc-btn--icon` | `#FFFFFF` | 44×44px square, border `#E6EAF0` | Toolbar controls, settings, close |

### Button States
- **Hover:** Subtle tint / darkening
- **Active:** Slight `translateY(1px)` tactile depress
- **Disabled:** Class `.sc-btn--disabled` or `[disabled]`: `#F1F4F9` background, `#B8BEC7` text
- **Loading:** Class `.sc-btn--loading`: text hides, centered rotating CSS spinner appears

---

## 9. Health-Status System & The Hero Card

The tri-state status system is the most critical element of SepCare.

### The Unified Status Card Principle
The structural layout of the Status Hero Card **NEVER changes** across Safe, Caution, and Critical states. Only the pill, descriptive guidance, metric values, and contextual actions change.

```
┌─────────────────────────────────────────────────────────────┐
│ CURRENT STATUS                                              │
│                                                             │
│ ● SAFE                               Updated 2 min ago      │
│                                                             │
│ Monitoring readings are currently within the expected       │
│ neonatal baseline range.                                    │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ Heart rate          Temperature           Movement          │
│ 132 bpm             36.7 °C               Stable            │
│                                                             │
│ [ Secondary Action: View 24h Trend ]                        │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Modal Requirement
> [!IMPORTANT]
> Never communicate status using color alone. Every status element MUST include **ICON + LABEL + COLOR + EXPLANATION** simultaneously (e.g., `● SAFE`, `▲ CAUTION`, `✕ CRITICAL`).

---

## 10. Vital Telemetry Cards & Data Visualization

### Vital Card Structure
Each card displays:
1. Category Title & 36px rounded icon badge
2. Dominant Tabular Numerical Measurement (36px Bold) + Unit (14px)
3. 48px high inline SVG sparkline in `#6F9FD5` with subtle gradient fill
4. Status indicator chip (`● Stable`) and target reference corridor

### Continuous 24h Clinical Chart
- **Line stroke:** 2.5px smooth spline in `#6F9FD5`
- **Target Safe Corridor:** Shaded horizontal band (`rgba(79, 175, 120, 0.08)`) showing healthy parameters (e.g. 110–160 bpm)
- **Time Filters:** Interactive segmented buttons for `6h`, `12h`, `24h`, and `7d`

### Monitoring Insight Card
- Subtle lavender background (`#F3F0FA`), border `rgba(88, 70, 135, 0.12)`.
- Explicitly separates algorithmically inferred early-warning patterns from raw sensor telemetry.

---

## 11. Ankle-Band Sensor & Baby Profile Components

### Wearable Connection State Machine
- **Connected:** Green badge (`#EAF6EF` bg, `#27734B` text: `● Connected`)
- **Syncing:** Blue badge (`#E8F1FA` bg, `#265588` text: `↻ Syncing`)
- **Connection Warning:** Yellow badge (`#FFF6DF` bg, `#89691A` text: `▲ Weak Contact`)
- **Disconnected:** Red badge (`#FCECEC` bg, `#963737` text: `✕ Disconnected`)

### Dual Profile Architecture
- **Parent Mode:** Baby name, age in days, weight, simple connection pill.
- **Professional Ward Mode:** Baby ID (`NEO-4410`), Cot assignment, NICU level, and assigned clinician.

---

## 12. Alert System & Form Elements

### Alert Banners
- **Informational (`.sc-alert--info`):** `#E8F1FA` bg, `#2A5485` text (Sensor calibrated, sync done)
- **Caution (`.sc-alert--caution`):** `#FFF6DF` bg, `#89691A` text (Temperature trending low)
- **Critical (`.sc-alert--critical`):** `#FCECEC` bg, `#963737` text (Immediate sepsis triage flag)
- **Success (`.sc-alert--success`):** `#EAF6EF` bg, `#27734B` text (Observation complete, stable)

### Forms & Controls
- `.sc-input`: Clean 12px radius input, border `#E6EAF0`, focus glow `#6F9FD5`
- `.sc-search-input`: Search bar with embedded 18px magnifying glass icon
- `.sc-select`: Custom styled dropdown select
- `.sc-toggle`: 44×24px accessible toggle switch
- `.sc-segmented-control`: Tabbed switcher for ranges and view filters

---

## 13. Responsive Architecture & Viewports

| Viewport | Max Width | Navigation Pattern | Layout Adaptation |
| :--- | :--- | :--- | :--- |
| **Mobile** | 375–430px | Fixed bottom nav (5 tabs) | 1-column stacked cards, compact sparklines |
| **Tablet** | 768–1024px | Left sidebar (240px) | 2-column vital grid, full 24h baseline chart |
| **Desktop Showcase** | 1200px+ | Sticky top bar | 3-column tri-state comparison, multi-patient ward view |

---

## 14. Governance: Do's & Don'ts Checklist

| DO (Prescribed Best Practices) | DO NOT (Strictly Forbidden) |
| :--- | :--- |
| **DO** maintain 70% neutral, 20% soft pastel, 10% interaction balance. | **DO NOT** use neon colors, dark terminal aesthetics, or heavy gradients. |
| **DO** reserve Primary Blue (`#6F9FD5`) solely for user interaction. | **DO NOT** use Blue to denote baby physiological health. |
| **DO** communicate status via **ICON + TEXT + COLOR** every time. | **DO NOT** rely on color alone as a status indicator. |
| **DO** format measurements in large tabular numbers (`98 bpm`). | **DO NOT** bury physiological data in conversational prose paragraphs. |
| **DO** keep the Status Hero Card layout identical across all 3 states. | **DO NOT** change component structure or card shape between states. |
| **DO** reserve red (`#D95757`) strictly for urgent clinical escalation. | **DO NOT** use red for ordinary secondary buttons or generic warnings. |

---

## 15. How to View & Run the Design System

1. **Local Dev Server:**
   ```bash
   node server.js
   ```
   Open **`http://localhost:3000/design-system`** in your browser.

2. **Direct Browser Opening:**
   Open `frontend-design/design-system.html` directly in any web browser.

3. **Prototype Access:**
   Open `frontend-design/index.html` and click the floating **✦ Design System** button in the bottom-right corner.

---
*End of SepCare Coded UI Design System Specification.*
