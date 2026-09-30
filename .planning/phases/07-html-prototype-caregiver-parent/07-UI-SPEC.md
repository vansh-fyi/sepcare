---
phase: "7"
slug: "html-prototype-caregiver-parent"
status: draft
shadcn_initialized: true
preset: "style=new-york, base=radix, iconLibrary=radix (icons not actually consumed — see Icon library note)"
created: "2026-09-30"
---

# Phase 7 — UI Design Contract

> Visual and interaction contract for the caregiver (persistent-nav) and parent (progressive-disclosure)
> prototype route trees. This phase adds **zero new shadcn primitives and zero new design tokens** for
> the happy path — every screen composes Phase 6's existing `src/components/ui/*` primitives and
> `src/components/patterns/*` compositions (per `AGENTS.md`'s "change the system, then consume it"
> contract and 07-RESEARCH.md's Don't-Hand-Roll table). This document exists to lock: (1) how those
> existing pieces compose into the 12 new routes, (2) the exact spec for the 4 genuinely new
> compositions (RiskTimeline, ConnectionStatus, DeviceSelectList, shared DeviceDetails), and (3) the
> one required shared-component extension (`VitalDetailCard`'s new `unavailable` tone, RESEARCH.md
> Assumption A1). Where 06-CONTEXT.md / AGENTS.md already locked a value (colors, radii, button
> contract, nav sizing, PulseWave, toggle groups), this document references it rather than
> restating it — restating would risk a silent fork between this file and the shipped system.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn (already initialized — `components.json` present) |
| Preset | `style: new-york`, `base: radix`, `tailwindVersion: v4`, `rsc: true` — read live via `npx shadcn info`, unchanged this phase |
| Component library | Radix (via the unified `radix-ui` meta-package, `^1.6.7`) for Select/Toggle/ToggleGroup/Checkbox/RadioGroup/Switch primitives |
| Icon library | **Not** shadcn's configured `iconLibrary: radix` — this project hand-authors every glyph in `src/components/icon.tsx` (dependency-free icon-system precedent, STATE.md Phase 06-12/06-13). All new compositions in this phase MUST use `<Icon name="..." />` from that module, never a Radix icon import or a new SVG. |
| Font | `Inter` (`--font-sans`, body/UI text) + `Plus Jakarta Sans` (`--font-heading`, headings/titles/wordmark) — both already loaded in `src/app/layout.tsx`; unchanged this phase |

---

## Component Inventory

Enumerated by `npx shadcn info` — 17 components — shadcn CLI 4.21.0 (`components.json`, no per-component
version; CLI-generated source files, not an npm package) — 2026-09-30.

`badge, button, card, chart, checkbox, field, input, item, label, progress, radio-group, select, separator, switch, textarea, toggle-group, toggle`

This is the shadcn-origin subset only. The project's actual reusable surface for this phase is wider —
every `src/components/ui/*.tsx` and `src/components/patterns/*.tsx` file, including hand-built,
non-shadcn primitives (`nav-bar`, `nav-link`, `sparkline`, `vitals-trend-chart`, `battery-indicator`)
and clinical compositions. The table below is a non-exhaustive map from **this phase's requirements**
to the components/compositions that satisfy them — checking for something outside this table (e.g. a
prop this table didn't mention) is expected, not an exception.

| Component | Import path | Notes |
|-----------|-------------|-------|
| `Card`, `CardTitle`, `CardDescription` | `@/components/ui/card` | Base surface for every new screen section |
| `Badge` | `@/components/ui/badge` | Status pill — `status="safe"\|"caution"\|"critical"\|"neutral"\|"brand"`; always icon+label+color, never override with a page-local span |
| `Button` | `@/components/ui/button` | Full contract in `AGENTS.md` Button section — reuse `tone`/`size`/`radius`/`icon` axes, never new variants |
| `Item`, `ItemGroup`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemSeparator` | `@/components/ui/item` | Backbone for RiskTimeline rows and DeviceSelectList rows |
| `ToggleGroup`, `ToggleGroupItem` | `@/components/ui/toggle-group` | Time-range selector (1h/6h/24h) and parent's Vitals/Stats two-tab switch — `fit="equal"` `size="sm"` for the 3-option time row, default neutral selected treatment |
| `NavBar`, `NavLink`, `NAV_TABS` | `@/components/ui/nav-bar`, `@/components/ui/nav-link` | Caregiver persistent bottom nav — pass real `href`s (`/caregiver`, `/caregiver/vitals`, …), no `onTabChange` override (07-RESEARCH.md Pattern 4) |
| `VitalsTrendChart` | `@/components/ui/vitals-trend-chart` | CARE-04 trend graph — feed `timeAxis` epoch-ms, real vitals field names |
| `Sparkline` | `@/components/ui/sparkline` | Compact VitalCard trend on Home |
| `BatteryIndicator` | `@/components/ui/battery-indicator` | Device Details battery row |
| `Icon` | `@/components/icon` | All glyphs — see per-composition icon names below |
| `PulseWave` | `@/components/motion/pulse-wave` | InfantStatusCard face — `emoji` boolean, size `xl` for Home hero, `sm` for DeviceHeader |
| `StatusCard`, `DeviceCard`, `VitalCard`, `InstructionCard` | `@/components/patterns/clinical-cards` | Home screen composition — `ClinicalStatus = "safe"\|"caution"\|"critical"` only, bridge via `mapRiskStatus()` first |
| `InfantStatusCard` | `@/components/patterns/status-summary-cards` | Home hero — accepts `onCallAmbulance` (critical-only) |
| `VitalDetailCard`, `VITAL_DETAILS` | `@/components/patterns/vital-detail-card` | Vitals/Stats 6-card grid — **extend with new `unavailable` tone this phase**, see below |
| `DeviceHeader` | `@/components/patterns/device-header` | Caregiver header (wordmark + readings/settings actions + battery + pulse) |
| `DeviceTileRow`, `getDeviceState`, `DEVICE_STATE`, `clampBattery` | `@/components/patterns/device-tile-row`, `@/lib/device-state` | Device icon-tile treatment shared by DeviceCard/DeviceHeader/new DeviceDetails |
| `ContentTileRow` | `@/components/patterns/content-tile-row` | Underlying leading-icon-tile layout used by all of the above |

---

## New Compositions This Phase (not in the shadcn-origin table above)

These four have no existing analog (07-RESEARCH.md's Architecture Patterns / Don't-Hand-Roll table).
Build each as `src/components/patterns/{name}.tsx` + `{name}.DESIGN.md`, per the project's established
pairing convention — composed entirely from the primitives above, no new visual language.

### 1. `RiskTimeline` (CARE-03)

**Composed from:** `ItemGroup` > `Item` (one per history entry) > `ItemMedia` (status dot/icon) + `ItemContent` (`ItemTitle` + `ItemDescription`) + a trailing timestamp.

- One row per fixture entry, **strictly chronological** (newest-first, matching the rest of the app's "latest first" convention — confirm against caregiver Home's own latest-reading framing during planning; do not invert without a reason).
- Each row: a small `Badge` (or `Icon name="safe"/"caution"/"critical"` at 16px in the matching `text-{status}` color, `ItemMedia`-slotted) + the status word ("Safe" / "Caution" / "Critical") + the entry's formatted timestamp (`h:mm a` for same-day, `MMM d, h:mm a` once the list crosses midnight).
- Apply `mapRiskStatus()` (07-RESEARCH.md Pattern 2) before this component ever sees a status string — it must only ever receive `ClinicalStatus`, never raw `"green"|"amber"|"red"`.
- No new color/spacing tokens: row padding follows `Item`'s own default; status color follows `--color-safe`/`--color-caution`/`--color-critical` exactly as `Badge` already does.
- Empty state (no entries in the fixture's bounded window): reuse the trend chart's own empty-state convention — do not invent a new "no history" illustration. Copy: **"No status changes recorded yet."**

### 2. `ConnectionStatus` (CARE-05)

**Composed from:** `Icon` (`sync` / `syncing` / `disconnected`) + a short text label, inline, sized to sit beside `DeviceHeader`'s existing battery/pulse cluster or standalone in Settings/Device Details.

Three states only, driven by `getConnectionState()` (07-RESEARCH.md Code Examples — pure function, already specified):

| State | Icon | Label copy | Text color |
|-------|------|-------------|------------|
| `live` | `connected` | "Live" | `text-safe` |
| `stale` | `sync` | "Last synced {N}m ago" (or "just now" for <1m) | `text-text-muted` |
| `reconnecting` | `syncing` | "Reconnecting…" | `text-caution-dark` |

- Never render a bare percentage/timestamp without one of these three words — CARE-05's own requirement is that stale data must never look current.
- Reuses the icon glyphs already present in `icon.tsx` (`sync`, `syncing`, `connected`, `disconnected` — confirmed available); no new SVG.
- This is a **client component** (needs a live "now" tick to recompute "Xm ago") — mark `"use client"`, matching 07-RESEARCH.md's Architectural Responsibility Map.

### 3. `DeviceSelectList` (D-04, PARENT-04)

**Composed from:** `ItemGroup` > `Item` (one per device) reusing `DeviceCard`'s existing icon-tile/battery/connection treatment inside each row, not a re-derived visual language.

- v1 has exactly one real device: render exactly one `Item` row for it, using its real name/battery/connection state from the fixture.
- Do **not** render additional rows implying more devices exist. If a "future device" affordance is wanted for demo completeness, it must be a clearly-labeled, visually distinct, disabled-looking placeholder (e.g. `text-text-disabled`, no tap affordance, a caption reading "More devices coming soon") — never a second live-looking entry. Default recommendation: **ship only the one real row**; add a placeholder only if product review during planning asks for it.
- Tapping the row navigates to the shared `DeviceDetails` composition (below) — same destination the caregiver Settings tab renders.

### 4. Shared `DeviceDetails` (D-05)

**Composed from:** `DeviceCard`'s icon-tile/battery pattern (via `DeviceTileRow`) scaled up to a full-screen layout, plus `ConnectionStatus` (above), plus `Button` (tone `neutral` for Connect, tone `neutral` for Disconnect per the button contract's "connection and save actions use neutral" rule — **not** `critical`; disconnecting a device is not a destructive/emergency action).

Required content (per D-05 / `archive/USER-FLOWS.md` Flow 4, content-only reference):
- Device name (heading)
- Battery percentage (`BatteryIndicator`)
- Connection state (`ConnectionStatus`)
- Sensor-contact-check indicator — reuse `Badge` with `status="safe"|"caution"|"critical"` for "Good contact" / "Check placement" / "No contact", not a new indicator type
- Connect/Disconnect action (`Button tone="neutral"`)

One component, rendered from two route files (`caregiver/settings/page.tsx` and `parent/device/[deviceId]/page.tsx`) — not two implementations, not one shared URL (07-RESEARCH.md Assumption A2; caregiver keeps its persistent nav chrome around this screen, parent does not).

---

## Required Shared-Component Extension: `VitalDetailCard` "unavailable" tone

**This is a shared-component change, not a page-local workaround** (AGENTS.md's core contract; 07-RESEARCH.md Pitfall 1 / Assumption A1). Extend `src/components/patterns/vital-detail-card.tsx` and its `clinical-cards.tsx` status type family with a fourth tone used **only** for the three ungrounded vitals (Cardiac Autonomic/HRV, Perfusion Index, Respiratory Pattern).

- **Do not** pass these three through with `status` omitted (silently resolves to `"safe"` today — a green "healthy" treatment for data that doesn't exist, directly contradicting D-07's honesty requirement).
- **Type change:** widen the prop accepted by `VitalDetailCard` to `ClinicalStatus | "unavailable"` (keep `ClinicalStatus` itself — the 3-value type consumed elsewhere — untouched; do not add `"unavailable"` into `ClinicalStatus` globally, since `Badge`/`StatusCard`/`InfantStatusCard`/`VitalCard` have no use for it and already special-case exactly 3 values).
- **Visual treatment for `unavailable`:** icon tile `bg-neutral-100 text-text-muted` (reuses existing primitives — no new token), no numeric value, no chart, no sparkline. Icon: reuse the vital's own existing glyph (`pulse`/`perfusion`/`lungs`) rather than inventing a "missing data" icon — the icon identifies *which* vital, the tile treatment communicates *unavailable*.
- **Label/copy:** replace `VITAL_DETAILS`' current placeholder description ("Abrupt HRV pattern changes detected" / "Severe downward trend" / "All systems stable") for these three entries — that copy is itself illustrative placeholder text (07-RESEARCH.md Pitfall 1's own warning-sign). New copy: **"Not yet available — awaiting device support."** (see Copywriting Contract below).
- **No chart section renders at all** for `unavailable` — omit the `chart` prop entirely for these three in fixture-consuming pages, don't pass an empty-array chart (07-RESEARCH.md Pitfall 4 draws this exact line: no fake data, not even an empty-looking chart shell where a real one would go).
- Update `vital-detail-card.DESIGN.md` in the same change, per AGENTS.md's "update documentation in the same change" rule.

---

## Spacing Scale

No new spacing values needed this phase. Declared project scale (unchanged, `AGENTS.md` / Phase 6):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon-to-label gaps inside Badge/Item |
| sm | 8px | NavBar tab gap, compact row spacing |
| md | 16px | Default card padding subdivisions, ItemGroup row gaps |
| lg | 24px | Card padding (`p-5`≈20px is the one Phase-6-established exception below), section padding |
| xl | 32px | Layout gaps between major Home sections |
| 2xl | 48px | Page-level top/bottom breathing room |
| 3xl | 64px | Not used this phase |

**Pre-existing exceptions (out of this phase's spacing-contract scope):** `VitalDetailCard` uses `p-5` (20px) and `InstructionCard`'s inner `Item` uses `p-3.5` (14px). Both were accepted at Phase 6's own sign-off, inside Phase 6's shipped components — they are restated here only so this phase's screens know not to "fix" them to `p-6`/`p-4`/`p-4` when composing around them. Phase 7 is not re-asserting, re-adjudicating, or expanding these values as part of its own spacing scale; it is naming two already-shipped facts about components it reuses unmodified. **Phase 7's own new spacing contribution is zero new spacing values:** every new composition in this phase (`RiskTimeline`, `ConnectionStatus`, `DeviceSelectList`, `DeviceDetails`, the `VitalDetailCard` `unavailable`-tone extension) uses only the eight standard-scale values in the table above (4/8/16/24/32/48/64, plus the two named pre-existing exceptions it inherits by reuse) — it introduces none of its own.

---

## Typography

**Scope note:** the 9-role / 4-weight scale below is Phase 6's own shipped, previously-signed-off
typography system (`globals.css`), reused unmodified. It is restated here for reference only — Phase
7 is not re-asserting, re-adjudicating, or expanding it, and it is out of this phase's own
typography-contract scope. **Phase 7's own new typography contribution is zero new font sizes and
zero new font weights:** every new composition this phase specifies (`RiskTimeline`,
`ConnectionStatus`, `DeviceSelectList`, `DeviceDetails`, the `VitalDetailCard` `unavailable`-tone
extension) maps onto roles already in this inherited scale — see "New-composition-specific mapping"
below, which cites four existing roles and introduces none.

Existing 9-role scale (`globals.css`), inherited from Phase 6, listed for reference only:

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px (`--text-body`) | 400 | 1.5 |
| Label | 13px (`--text-label`) | 500–600 (context-dependent, e.g. Badge is 600/`font-semibold`) | 1.4 |
| Caption | 12px (`--text-caption`) | 400–600 | 1.4 |
| Heading (card) | 18px (`--text-heading`) | 700 (`CardTitle` is bold) | 1.3 |
| Heading — page | 24px (`--text-heading-page`) | 700 | 1.3 |
| Display | 38px (`--text-display`) | 700 | 1.15 |
| Vital metric | 36px (`--text-vital-metric`) | 700 | 1.1 |
| InfantStatusCard title | 20px (`text-xl`, `font-heading font-bold`) | 700 | default |
| Nav label | inherited from `NavLink` (not re-specified here — see `nav-link.DESIGN.md`) | — | — |

New-composition-specific mapping (uses the existing roles above, not new ones):
- `RiskTimeline` row title/status word: `ItemTitle`'s default (label-role, semibold).
- `RiskTimeline` timestamp: `ItemDescription`'s default (caption-role, muted).
- `ConnectionStatus` label: caption-role (12px), matching `DeviceHeader`'s existing battery-text sizing precedent.
- `DeviceDetails` device name: `CardTitle` at page-heading weight (reuse `font-heading text-xl font-bold`, matching `InfantStatusCard`'s and `DeviceHeader`'s established device-name treatment — do not introduce a third size for the "same fact" shown in three places).

---

## Color

Unchanged from Phase 6 — no new palette values. This phase's obligation is correct **application** of the existing 60/30/10 split and the `ClinicalStatus` tones, not new colors.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `--color-bg` (`neutral-100`, `#f5f5f8`) / `--color-page-canvas` (`#f0f1f6`) | Page background behind all cards on every new route |
| Secondary (30%) | `--color-surface` (`#ffffff`) | Card/Item/NavBar/DeviceHeader-card surfaces |
| Accent (10%) | `--color-brand` / `--color-brand-fill` (`blue-600`) | Reserved for: the "See All" link (`--color-link`, blue-400), the parent's device icon button, any non-status interactive affordance. **Never** applied to a health-status signal (D-04's rule, unchanged) |
| Destructive | `--color-critical` / `--color-critical-fill` (pink family) | Reserved for: `critical` `ClinicalStatus` treatments (StatusCard/VitalCard/Badge/VitalDetailCard/RiskTimeline critical rows) and the `InfantStatusCard`'s "Call ambulance" button (`tone="critical"`) only. **Not** used for Disconnect (that's `tone="neutral"`, per Button contract) |

Status-tone mapping every new screen must apply (07-RESEARCH.md Pattern 2 — restated here because it's the single highest-risk mistake this phase can make):

| Backend value | UI `ClinicalStatus` | Color role |
|---|---|---|
| `"green"` | `"safe"` | `--color-safe` (green-700) |
| `"amber"` | `"caution"` | `--color-caution` (yellow-800) |
| `"red"` | `"critical"` | `--color-critical` (pink-700) |
| *(no backend equivalent — HRV/Perfusion/Respiratory)* | `"unavailable"` (new, VitalDetailCard-only) | `--color-text-muted` on `bg-neutral-100` — explicitly **not** green |

Accent reserved for: "See All" link text, parent device-icon button, any `Button tone="brand"` call this phase introduces (expected to be rare/none — most actions here are `neutral` per the button contract's "connection and save actions use neutral" rule).

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (caregiver Home → Vitals) | "See details" *(if a CTA is needed beyond direct nav-tab access — caregiver reaches Vitals via the persistent nav tab itself in most cases, so this applies mainly to any in-card deep link)* |
| Primary CTA (parent Home → detail) | "See All" (locked by D-03/PARENT-03 — do not rename) |
| Primary CTA (Device Details, connected) | "Disconnect" (`Button tone="neutral"`) |
| Primary CTA (Device Details, disconnected) | "Connect" (`Button tone="neutral"`) |
| Primary CTA (InfantStatusCard, critical) | "Call ambulance" (already locked component copy — `tone="critical"`, unchanged) |
| Empty state — RiskTimeline | "No status changes recorded yet." |
| Empty state — VitalsTrendChart / Stats (no readings in selected range) | Reuse `VitalDetailCard`'s existing computed fallback: "No readings for this range" (already implemented, `vital-detail-card.tsx:101` — do not re-word per-screen) |
| Empty state — DeviceSelectList (hypothetical zero-device fixture; not expected in v1 since one real device always exists) | "No devices connected yet." + a `Button` to start pairing — only build this path if planning decides to exercise it; not required by D-04's locked one-real-device scope |
| Unavailable-vital state (HRV, Perfusion Index, Respiratory Pattern) | **"Not yet available — awaiting device support."** (caregiver-facing, generic per 07-RESEARCH.md Open Question 1's own recommendation; sensor-specific detail — RR-intervals, PPG amplitude ratio, IMU periodicity — belongs only in `07-DATA-CONTRACT-DIFF.md`, never in product-facing copy) |
| Error state — fixture/data failure (should not occur with static fixtures, but any render-guard fallback) | "Something went wrong loading this device's data. Try again." + a retry affordance, matching the project's existing honest-over-decorative copy stance (D-08) |
| Destructive confirmation — Disconnect | Not a destructive action per the Button contract (`tone="neutral"`, no confirmation dialog required) — Disconnect is a reversible connection-state toggle, not data loss. No confirmation copy needed. |
| Connection status labels | "Live" / "Last synced {N}m ago" / "Reconnecting…" (locked above, `ConnectionStatus`) |
| Sample-data labeling (AGENTS.md requirement) | Any screen or docs surface presenting this phase's fixture data outside the actual prototype routes themselves must be labeled "Sample data" — the prototype routes themselves are the real UI under test and do not need this label on-screen, but the data-contract diff document must state fixtures are synthetic |

No destructive-action confirmation dialogs are needed in this phase's scope — the only stateful action (Connect/Disconnect) is explicitly non-destructive per the button contract, and no delete/remove affordance exists anywhere in CARE-01..06/PARENT-01..05.

---

## UI Considerations

Applicable state considerations resolved: 7 covered, 2 backstop, 0 unresolved.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | RiskTimeline | ✅ covered | Empty history window renders "No status changes recorded yet." (see Copywriting Contract) |
| empty | VitalsTrendChart / Stats range | ✅ covered | Reuses `VitalDetailCard`'s existing "No readings for this range" fallback — already implemented in shipped code, not new |
| zero-one-many | DeviceSelectList | ✅ covered | Exactly one real device renders one row; D-04 explicitly forbids fabricating additional live-looking rows; a disabled placeholder row is optional, not required |
| partial | VitalDetailCard six-signal grid | ✅ covered | 3 real-formula cards render full chart+value; 3 render the new `unavailable` tone with no chart/value — both states specified above, this is the phase's headline UI-state decision (D-06/D-07) |
| loading | Any prototype route (fixture-backed, no network fetch) | ✅ covered | Fixture data is imported statically into Server Components — no client fetch, no loading spinner state exists to design for in this phase (07-RESEARCH.md Architectural Responsibility Map); Phase 10's live-wiring swap is the point where a loading state becomes real and must be designed then |
| error | Device connection failure / stale data | ✅ covered | `ConnectionStatus`'s `reconnecting` state IS the error/degraded-state treatment for this phase's scope (CARE-05) — no separate error boundary UI needed since there is no live network call to fail yet |
| overflow | Long device name / long instruction copy | 🧪 backstop | `CardTitle`'s `break-words` (already used in `DeviceCard`) and `line-clamp-none` (already used in `InstructionCard`) patterns should carry into `DeviceDetails` and `DeviceSelectList` — verify at build time that a realistically long device name (e.g. "SepCare Armband — NICU Bay 4") doesn't clip or overflow its row |
| long-text | RiskTimeline timestamp + status word at narrow (390px) viewport | 🧪 backstop | `Item`'s existing flex layout should wrap gracefully; verify the timestamp doesn't force horizontal scroll on the narrowest supported viewport during executor build |
| unavailable-vital mistaken-for-safe | VitalDetailCard | ✅ covered | Explicitly prevented by the required `unavailable` tone extension above — this was the phase's single highest-risk default-value trap (07-RESEARCH.md Pitfall 1) |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|--------------|
| shadcn official | badge, button, card, chart, checkbox, field, input, item, label, progress, radio-group, select, separator, switch, textarea, toggle-group, toggle (all already installed pre-Phase-7; no new `shadcn add` calls expected this phase per 07-RESEARCH.md's "no new packages required") | not required |

No third-party registries are declared or needed for this phase. If planning later discovers a genuine gap requiring a new shadcn component (e.g. a dedicated `tabs.tsx` instead of the recommended `ToggleGroup` reuse for the parent's Vitals/Stats switch), run `npx shadcn add {component} -b radix` against the **official** registry only and update this table — do not add a third-party registry without re-running the full vetting gate in `gsd-ui-researcher`'s instructions.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS
- [ ] Dimension 7 Inventory Provenance: PASS

**Approval:** pending
