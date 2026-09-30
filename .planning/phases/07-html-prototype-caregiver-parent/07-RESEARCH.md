# Phase 7: HTML Prototype (Caregiver + Parent) - Research

**Researched:** 2026-09-30
**Domain:** Next.js App Router prototype routes wired to backend-shaped fixture data, reusing an existing Tailwind v4 + Radix design system
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Prototype format (resolves Phase 6's D-11 flag, formally)**
- **D-01:** Phase 7 is built as real Next.js routes/components in the existing app (e.g. `src/app/(prototype)/caregiver/*`, `src/app/(prototype)/parent/*` — exact route grouping is planner's call), directly importing and composing Phase 6's `src/components/ui/*` primitives and `src/components/patterns/*` compositions. There is **no separate static-HTML file tree** — the archived `frontend-design/` approach and the "port to Next.js in Phase 10" framing are both superseded. "Prototype" means wired to realistic static fixture data, not live Supabase/Realtime — not "built outside Next.js." — **Reversibility:** one-way — this changes what Phase 10 actually does (swap fixtures for live wiring, not a full markup port); reverting would mean re-doing Phase 7's screens as detached HTML after the fact.
- **D-02:** This also formally resolves Phase 6's 06-CONTEXT.md D-11 (which flagged this exact tension but left it unresolved) and supersedes ROADMAP.md's current "static HTML prototype" wording for Phase 7 and "port the validated prototype into Next.js" wording for Phase 10 — both should be read as "swap fixtures for live backend wiring," not a markup port, until ROADMAP.md text is updated.

**Parent navigation flow (resolves PARENT-05)**
- **D-03:** Parent home screen's "See All" reveals a two-tab view: **Vitals** (the same six-summary abstracted vitals as the caregiver's Vitals tab) and **Stats** (trend cards with the time-scale selector, same as caregiver's Stats tab) — matches PARENT-03 and reuses the caregiver's own Vitals/Stats screens/components, just reached without a persistent bottom nav.
- **D-04:** The parent's device icon opens a **Select Device list → Device Details** flow (per the archived teammates' Flow 4: `archive/USER-FLOWS.md`), not a direct single Device Details screen. Since v1 has exactly one real device, the list shows that one real entry; how to visually distinguish it from future/placeholder entries (if any are shown at all) is Claude's discretion during planning — don't pretend multiple devices are live (per `archive/USER-FLOWS.md`'s own FR-15 note).
- **D-05:** The caregiver's **Settings tab reuses the same Device Details screen** as the parent's device-icon destination (name, battery %, connection state, sensor-contact-check, Connect/Disconnect) — one shared component/screen serving both entry points, not two separate device-management UIs.

**Six-signal data gap — real formulas, full UI, no compromise (locked, high-signal decision)**
- **D-06:** The backend's real vitals fields are only `heartRate`, `spo2`, `temperature`, `activityScore` (`src/lib/validation/ingest-schema.ts`) plus a computed risk score. Of the six vital summaries Phase 6 built (Thermoregulation, Cardiac Autonomic, Perfusion Index, HR/Temp Ratio, Respiratory Pattern, Activity Level), only **3 can be genuinely computed from real fields using the research's actual formulas** (`context/implementation-plans/neonatal-sepsis-armband.md` §7.1.1): Thermoregulation (feature #1, from `temperature`), HR/Temp Ratio (feature #2, `ΔHR/ΔTemp` from `heartRate`+`temperature`), and Activity Level (feature #6, from `activityScore`). The other 3 (Cardiac Autonomic/HRV, Perfusion Index, Respiratory Pattern) need raw PPG RR-intervals, raw PPG amplitude ratio, and IMU periodicity data respectively — none of which the ESP32 firmware currently extracts or sends (confirmed: the sensors — MAX30102, MPU6050 — are physically capable per `hardware/SEPCARE-HARDWARE-SOT.md`, this is a firmware/data-pipeline scope gap, not a missing part; already flagged as `RISK-V2-01` in `PROJECT.md`).
- **D-07:** **User's explicit direction: do not drop or compromise on the six-signal UI.** Build fixture data shaped exactly like the real `GET /api/readings` response for the 3 real-formula signals (computed correctly per §7.1.1's actual math, not fabricated numbers), and render the other 3 signals with an explicit "not yet available — awaiting firmware/backend support" state in the UI (not fake numbers, not silently hidden). This gap becomes the **headline finding of the data-contract diff** (D-09) and is explicitly Phase 8's (backend) and Phase 9's (hardware/firmware) job to close — not negotiable away in Phase 7. — **Reversibility:** reversible — purely a rendering/fixture decision, easy to swap once real data exists.
- **D-08 [context, not a phase-7 task]:** User stated this project is no longer a hackathon/competition entry — it is being built as a serious product. This raises the bar on honesty in the UI (no fudged data, explicit gap states) over demo-friendly shortcuts. Downstream agents (researcher, planner, executor) should weight correctness/honesty over demo polish when the two conflict.

**Data-contract diff deliverable (resolves success criterion #5)**
- **D-09:** The diff is a **dedicated markdown document** in this phase's directory (e.g. `07-DATA-CONTRACT-DIFF.md` — exact filename is planner's call, following the `{padded_phase}-*` convention). For each gap (HRV, Perfusion Index, Respiratory Pattern, `GET /api/readings/latest` per Phase 8's ROADMAP success criteria, and any other gap surfaced during building), record: what the frontend needs, what the backend currently returns/lacks, and which phase closes it (mostly Phase 8; hardware/firmware-dependent gaps explicitly flagged for Phase 9). This document is Phase 8's primary planning input.

### Claude's Discretion
- Exact Next.js route grouping/naming for the caregiver and parent prototype routes.
- Exact fixture-data file location/format, as long as its shape matches the real `GET /api/readings` response envelope.
- How to visually represent the Select Device list when only one device is real (D-04) — a single real entry, a single entry plus clearly-labeled placeholders, or something else; must not misrepresent unreal devices as live.
- Exact filename/structure of the data-contract diff document (D-09), as long as it's a dedicated markdown file covering the fields above.
- Exact copy/wording for the "awaiting firmware/backend support" state on the 3 ungrounded vital summaries (D-07).

### Deferred Ideas (OUT OF SCOPE)
- Actually closing the HRV/Perfusion Index/Respiratory Pattern data gap (firmware feature-extraction changes, backend schema additions) — explicitly Phase 8 (backend/schema) and Phase 9 (hardware/firmware) work, not this phase's.
- `GET /api/readings/latest` (no bounded time-range requirement) — already a named Phase 8 success criterion; Phase 7's data-contract diff should reference it, not attempt to build it.
- Updating ROADMAP.md's Phase 7/10 wording from "static HTML prototype"/"port to Next.js" to reflect D-01/D-02 — recommended as a quick follow-up edit, not a blocking part of this discussion.
- Richer caregiver-only Settings controls beyond device management (notification preferences, unit toggles) — user chose the reuse-only option (D-05); anything beyond Device Details for Settings is out of scope for this phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| CARE-01 | Live vitals card (pulse, temperature, activity/perfusion) visible on load, sourced from the existing Realtime feed | Pattern 1 (fixture mirrors `GET /api/readings` envelope) + Pitfall 3 (no "latest" endpoint yet — fixture must simulate "newest entry in a bounded window"; headline data-contract-diff item) |
| CARE-02 | Traffic-light (Green/Amber/Red) status shown prominently, redundant-coded with color + icon + word | Existing `Badge`/`StatusCard`/`InfantStatusCard` already enforce this invariant (Don't Hand-Roll table); Pattern 2 bridges backend `green/amber/red` to UI `safe/caution/critical` |
| CARE-03 | Risk-status timeline shows chronological Green/Amber/Red history | No existing component — new `risk-timeline.tsx` composed from `Item`/`ItemGroup`/`Badge` (Recommended Project Structure); Validation Architecture maps chronological-order assertion to a pure-function unit test |
| CARE-04 | Vitals trend graph with time-range selector (1h/6h/24h), sourced from bounded `GET /api/readings` | `VitalsTrendChart` reused as-is (Don't Hand-Roll); `ToggleGroup` reused for the range selector (existing Stats pattern); Pattern 1 for fixture shape |
| CARE-05 | Device connection/last-synced indicator: Live / Last synced Xm ago / Reconnecting | No existing 3-state component — new `connection-status.tsx`; reuses existing `sync`/`syncing`/`connected`/`disconnected` `Icon` glyphs (Don't Hand-Roll); pure-function `getConnectionState()` (Code Examples) |
| CARE-06 | Persistent bottom navigation exposes full caregiver view set incl. Settings tab | `NavBar`/`NavLink` reused with real `next/link` navigation, not the docs-iframe client-router pattern (Pattern 4); Settings renders shared Device Details (D-05) |
| PARENT-01 | Parent home: abstracted infant-status summary, compact vitals, simple care instructions, no persistent bottom nav on home | Caregiver-equivalent components reused (`InfantStatusCard`, `VitalCard`, `InstructionCard`); `parent/layout.tsx` deliberately omits `NavBar` (Recommended Project Structure) |
| PARENT-02 | Parent has full data parity with caregiver (same underlying data), reached via progressive disclosure | Same fixture module (Pattern 1) feeds both caregiver and parent trees — no data subsetting |
| PARENT-03 | "See All" reveals two-tab (Vitals/Stats) navigation | `ToggleGroup`-driven two-tab switch reusing caregiver's own Vitals/Stats screens/components (D-03, Recommended Project Structure) |
| PARENT-04 | Parent's device/settings equivalent reached via a device icon, not a nav tab | `parent/device/page.tsx` (Select Device list, D-04) + shared Device Details component (D-05), no nav-tab entry point |
| PARENT-05 | Exact parent navigation flow finalized collaboratively during discuss-phase | Resolved by D-03/D-04 in CONTEXT.md; this research operationalizes it into concrete routes/components (Recommended Project Structure) |
</phase_requirements>

## Summary

This phase's "domain" is almost entirely internal: the design system, backend contract, and product-flow content it must compose all already exist in this repository, verified by direct file reads rather than external research. The only genuinely external question — current Next.js App Router routing/typing conventions for this project's pinned `next@16.3.5` — was answered directly from the version's own shipped docs (`node_modules/next/dist/docs/`), per this project's own AGENTS.md warning not to trust training data here.

The critical finding is a **naming/type mismatch** between the backend and the UI that every fixture and every new component must bridge deliberately: the risk-scoring engine persists and returns `status: "green" | "amber" | "red"` (`src/lib/risk/compute.ts`), while every existing design-system component speaks `ClinicalStatus = "safe" | "caution" | "critical"` (`src/components/patterns/clinical-cards.tsx`). A single small mapper function must sit between fixture data and every component call. A second critical finding is a **type gap with an honesty consequence**: `VitalDetailCard`'s only status values are `safe | caution | critical`, and omitting `status` silently defaults to `"safe"` — which is exactly wrong for the three ungrounded vital summaries (HRV, Perfusion Index, Respiratory Pattern) that D-07 requires to show an explicit "not yet available" state, never a green/safe treatment. Fixing this is in scope for this phase under the project's "change the system, then consume it" design-system contract, not a page-local workaround.

A third finding de-risks the fixture-shaping task: the real `GET /api/readings` response already embeds `risk.breakdown` (temperature, hrTempProportionality, activityTrend) alongside raw vitals per timestamped entry — the exact three fields needed for Thermoregulation, HR/Temp Ratio, and Activity Level. Fixtures do not need a separate "vital summary" computation layer; they need entries shaped exactly like the real route's output, with `breakdown` computed by literally reusing (or bit-for-bit reimplementing) `src/lib/risk/compute.ts`'s formulas over synthetic vitals.

**Primary recommendation:** Build `src/app/(prototype)/caregiver/*` and `src/app/(prototype)/parent/*` as real nested App Router segments (not a client-side fake router), backed by a single `src/lib/fixtures/readings.ts` module shaped exactly like `GET /api/readings`'s envelope, with a small `mapRiskStatus()` bridging function and a `VitalDetailCard` status-tone extension for the "unavailable" case — reusing every other Phase 6 primitive/pattern as-is.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Caregiver/parent route structure & navigation | Frontend Server (SSR, App Router) | Browser/Client (NavLink is a real `next/link`) | Route segments and layouts are server-rendered by default in the App Router; interactive nav state (active tab) is client-side via `usePathname()` |
| Fixture data (readings + risk) | Frontend Server (build-time/render-time import) | — | Static module imported directly into Server Components, mirroring the real `GET /api/readings` shape so Phase 10 swaps the import for a `fetch()` with no shape change |
| Live vitals card, trend chart, timeline rendering | Browser/Client | Frontend Server (initial data via props) | `VitalsTrendChart`/`Sparkline` are `"use client"` (Recharts + `ResizeObserver`); data is passed down from a Server Component parent |
| Time-range selector (1h/6h/24h), tab switching | Browser/Client | — | `ToggleGroup` (Radix) requires client-side interactivity; matches the existing Stats time-scale pattern |
| Device connection/last-synced indicator | Browser/Client | — | Needs to react to a "now" clock tick to compute "Xm ago" / staleness; must be a client component even though its data is static in this phase |
| Data-contract diff document | Documentation (not runtime) | — | A markdown artifact, not a rendered capability; consumed by Phase 8 planning, not by the app |
| Backend field/endpoint gaps (HRV, Perfusion, Respiratory, `/latest`) | API/Backend (Phase 8) + Hardware/Firmware (Phase 9) | — | Explicitly out of this phase's tier — Phase 7 only documents and visually flags the gap, per D-06/D-07/D-09 |

## Standard Stack

### Core

No new packages are required for this phase — every capability composes from what Phase 6 already installed and verified.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.3.5 | App Router routes/layouts for caregiver + parent prototype trees | Already pinned `[VERIFIED: package.json]` |
| react / react-dom | 19.2.8 | Component runtime | Already pinned `[VERIFIED: package.json]` |
| recharts | 3.8.0 | `VitalsTrendChart`'s trend graph (CARE-04) | Already pinned and Figma-verified in Phase 6 `[VERIFIED: package.json]`; STATE.md records it was "pinned to the exact 3.8.0 version shadcn's own chart registry entry resolves to" |
| radix-ui | 1.6.7 | `ToggleGroup` (time-range selector, parent Vitals/Stats tabs), `Select` | Already pinned `[VERIFIED: package.json]` |
| zod | 4.6.2 | Optional: a `ReadingsResponseSchema` to assert fixtures match the real API envelope in a test | Already pinned; used elsewhere for `IngestSchema` `[VERIFIED: package.json, src/lib/validation/ingest-schema.ts]` |
| class-variance-authority, tailwind-merge, cn | 0.7.1 / 3.7.0 / 0.4.0 | Styling variant/merge utilities for any new component | Already pinned `[VERIFIED: package.json]` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | ^4.1.11 | Fixture-shape and markup assertions (see Validation Architecture) | Already the project's only test runner `[VERIFIED: package.json, vitest.config.ts]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Reusing `ToggleGroup` for the parent's Vitals/Stats two-tab switch | A dedicated shadcn `Tabs` primitive | No `tabs.tsx` exists in `src/components/ui/` today `[VERIFIED: ls output]`; adding one contradicts "reuse before adding" and duplicates `ToggleGroup`'s already-established segmented-control visual language (used for the Stats time-scale row) |
| A client-side fake router (home-proof's `useState`-driven `route` + manual title-swap pattern) | Real nested App Router segments | D-01 explicitly supersedes the fake-router/static-HTML approach; `home-proof/page.tsx`'s pattern exists only to run inside a sandboxed docs iframe (see Pitfall 3) |

**Installation:**
```bash
# No new installs required for this phase.
```

**Version verification:** All versions above were read directly from this repo's `package.json` (not re-queried against the npm registry, since nothing new is being installed) `[VERIFIED: package.json]`.

## Package Legitimacy Audit

**Not applicable — this phase installs no new external packages.** Every capability (routing, charts, toggles, icons) is composed from dependencies Phase 6 already installed, audited, and — per STATE.md — passed a security review (`06-SECURITY.md`, "threats_open: 0"). If the planner later decides a genuinely new primitive is needed (e.g., a date-relative-time formatter), run the full Package Legitimacy Gate protocol at that time; do not skip it retroactively.

## Architecture Patterns

### System Architecture Diagram

```
                     ┌─────────────────────────────────────────┐
                     │  src/lib/fixtures/readings.ts (NEW)      │
                     │  entries[]: { timestamp, vitals, risk }  │
                     │  shaped exactly like GET /api/readings   │
                     │  risk.breakdown computed via the same    │
                     │  §7.1.1 math as src/lib/risk/compute.ts  │
                     └───────────────────┬───────────────────────┘
                                          │ imported directly (no fetch)
                                          ▼
        ┌───────────────────────────────────────────────────────────┐
        │  src/app/(prototype)/{caregiver,parent}/**/page.tsx        │
        │  Server Components: read fixtures, map risk status         │
        │  (green/amber/red → safe/caution/critical), pass props     │
        └───────────────┬──────────────────────────┬─────────────────┘
                         │                          │
                         ▼                          ▼
        ┌────────────────────────────┐   ┌───────────────────────────┐
        │ Client composites           │   │ Client composites          │
        │ (existing, reused as-is):   │   │ (NEW, this phase):         │
        │ InfantStatusCard,           │   │ RiskTimeline (CARE-03)     │
        │ VitalCard, StatusCard,      │   │ ConnectionStatus           │
        │ VitalDetailCard,            │   │   (Live/Last synced Xm/    │
        │ VitalsTrendChart,           │   │    Reconnecting — CARE-05) │
        │ DeviceHeader, DeviceCard,   │   │ DeviceSelectList (D-04)    │
        │ NavBar/NavLink (real Link)  │   │ shared DeviceDetails       │
        └────────────────────────────┘   │   (caregiver Settings tab  │
                                          │    AND parent device icon  │
                                          │    both render it — D-05)  │
                                          └───────────────────────────┘
                         │
                         ▼
        ┌───────────────────────────────────────────────────────────┐
        │  Real user navigation via next/link hrefs (not client      │
        │  state) — usePathname() drives NavBar's active-tab state   │
        └───────────────────────────────────────────────────────────┘

        (Deferred to Phase 10: swap the fixtures import above for a
         fetch()/Supabase Realtime call against the same shape.)
```

### Recommended Project Structure

```
src/app/(prototype)/
├── caregiver/
│   ├── layout.tsx        # DeviceHeader + persistent NavBar (Home/Vitals/Stats/Settings)
│   ├── page.tsx           # Home: InfantStatusCard, compact VitalCards, InstructionCards (CARE-01/02)
│   ├── vitals/page.tsx    # 6× VitalDetailCard summaries — 3 real, 3 "unavailable" (CARE-02, D-06/D-07)
│   │   └── history/       # or a section within vitals/ — RiskTimeline (CARE-03)
│   ├── stats/page.tsx     # 6× VitalDetailCard with chart + ToggleGroup 1h/6h/24h (CARE-04)
│   └── settings/
│       └── page.tsx       # renders the shared DeviceDetails component (D-05)
├── parent/
│   ├── layout.tsx         # NO persistent NavBar; device icon in header only (PARENT-01/04)
│   ├── page.tsx           # abstracted status summary, compact vitals, instructions, "See All" CTA
│   ├── detail/
│   │   ├── layout.tsx     # ToggleGroup-driven Vitals/Stats two-tab switch (D-03/PARENT-03)
│   │   ├── vitals/page.tsx  # reuses caregiver's vitals composition/components
│   │   └── stats/page.tsx   # reuses caregiver's stats composition/components
│   └── device/
│       ├── page.tsx       # Select Device list (D-04) — new DeviceSelectList component
│       └── [deviceId]/page.tsx  # renders the same shared DeviceDetails component as caregiver Settings
src/components/patterns/
├── risk-timeline.tsx (+ .DESIGN.md)       # NEW — CARE-03, no existing analog
├── connection-status.tsx (+ .DESIGN.md)   # NEW — CARE-05, no existing analog
├── device-select-list.tsx (+ .DESIGN.md)  # NEW — D-04, no existing analog
└── device-details.tsx (+ .DESIGN.md)      # NEW — shared by caregiver Settings + parent device icon (D-05)
src/lib/fixtures/
├── readings.ts             # entries[] shaped exactly like GET /api/readings
└── risk-status.ts          # mapRiskStatus(): "green"|"amber"|"red" -> ClinicalStatus
```

### Pattern 1: Fixture data mirrors the real API envelope exactly

**What:** A single fixture module produces the exact same shape `GET /api/readings` returns, so Phase 10 only swaps the data source, never the consuming component's props.

**When to use:** For every screen that would eventually read live data (CARE-01, CARE-03, CARE-04, and their parent equivalents).

**Verified real shape** (`src/app/api/readings/route.ts:131-150`):
```typescript
// Source: src/app/api/readings/route.ts (this repo)
const entries = rows.map((row) => {
  const riskScore = Array.isArray(row.risk_scores)
    ? row.risk_scores[0] ?? null
    : row.risk_scores;

  return {
    timestamp: row.timestamp,
    vitals: {
      heartRate: row.heartRate,
      spo2: row.spo2,
      temperature: row.temperature,
      activityScore: row.activityScore,
    },
    risk: riskScore
      ? { status: riskScore.status, breakdown: riskScore.breakdown }
      : null,
  };
});
return json({ deviceId: DEVICE_ID, from, to, entries });
```

Fixture module should produce `{ deviceId, from, to, entries }` with this exact key set — `entries[].risk.status` is `"green" | "amber" | "red"` (see Pattern 2), and `entries[].risk.breakdown` is the `RiskBreakdown` shape below.

### Pattern 2: Bridge the backend's green/amber/red to the design system's safe/caution/critical

**What:** A one-line mapper function, applied at the fixture-or-page boundary, never inline in a component.

**Verified backend values** (`src/lib/risk/compute.ts:190-191`):
```typescript
// Source: src/lib/risk/compute.ts (this repo)
const status: "green" | "amber" | "red" =
  abnormalCount >= 3 ? "red" : abnormalCount === 2 ? "amber" : "green";
```

**Verified UI type** (`src/components/patterns/clinical-cards.tsx:18`):
```typescript
// Source: src/components/patterns/clinical-cards.tsx (this repo)
export type ClinicalStatus = "safe" | "caution" | "critical";
```

**Recommended bridge:**
```typescript
// New file: src/lib/fixtures/risk-status.ts
import type { ClinicalStatus } from "@/components/patterns/clinical-cards";

const RISK_STATUS_MAP = { green: "safe", amber: "caution", red: "critical" } as const;

export function mapRiskStatus(status: "green" | "amber" | "red"): ClinicalStatus {
  return RISK_STATUS_MAP[status];
}
```

### Pattern 3: The three real vital summaries reuse `RiskBreakdown`'s own fields — no separate computation layer needed

**Verified breakdown shape** (`src/lib/risk/compute.ts:34-40`):
```typescript
// Source: src/lib/risk/compute.ts (this repo)
export interface RiskBreakdown {
  temperature: { abnormal: boolean; value: number };
  hrTempProportionality: { abnormal: boolean; ratio: number | null };
  activityTrend: { trending: boolean; delta: number | null };
}
```

This maps 1:1 onto three of the six `VITAL_DETAILS` entries (`src/components/patterns/vital-detail-card.tsx:12-47`, verified — the array's exact order is Thermoregulation(0), Cardiac Autonomic(1), Perfusion Index(2), HR/Temp Ratio(3), Respiratory Pattern(4), Activity Level(5)):

- **Thermoregulation** (index 0) ← `breakdown.temperature.value` / `.abnormal`, over raw `vitals.temperature` time series
- **HR/Temp Ratio** (index 3) ← `breakdown.hrTempProportionality.ratio` / `.abnormal`
- **Activity Level** (index 5) ← `breakdown.activityTrend.delta` / `.trending`, over raw `vitals.activityScore`

The other three (indices 1, 2, 4 — Cardiac Autonomic/HRV, Perfusion Index, Respiratory Pattern) have **no corresponding field anywhere in the backend** — confirmed absent from both `IngestSchema` (`src/lib/validation/ingest-schema.ts:9-17`, fields are exactly `deviceId, timestamp, heartRate, spo2, temperature, activityScore`) and `RiskBreakdown` above. Fixture generation for the real three must reuse `compute.ts`'s exact threshold constants (`src/lib/risk/thresholds.ts`: `TEMP_FEVER_C=38.0`, `TEMP_HYPOTHERMIA_C=35.5`, `HR_TEMP_RATIO_MIN=6`, `HR_TEMP_RATIO_MAX=14`, `ACTIVITY_DECLINE_RATIO=0.7`) rather than inventing new numbers, so the demo math is defensibly identical to what production code would compute.

### Pattern 4: Real App Router navigation, not the docs-iframe client-router pattern

`home-proof/page.tsx` (the closest existing analog per CONTEXT.md) drives navigation with `useState<string>("route")` and passes `onTabChange` into `NavBar`, which then calls `event.preventDefault()` inside `NavLink` (verified `src/components/ui/nav-bar.tsx:51-58`). This exists **only** because `home-proof` is designed to run inside `ExampleBrowser`'s sandboxed `<iframe>` for the docs site (verified via AGENTS.md: "Preview navigation ... must not send readers to missing product routes or out of the docs shell"), not because `NavBar`/`NavLink` need it.

`NavLink` already renders a real `next/link` `Link` (`src/components/ui/nav-link.tsx:1-4,35`, verified) and accepts any `href`. For Phase 7's real routes:

```typescript
// Recommended usage — real routes, no onTabChange override
"use client";
import { usePathname } from "next/navigation";
import { NavBar, NAV_TABS } from "@/components/ui/nav-bar";

export function CaregiverNav() {
  const pathname = usePathname();
  return <NavBar currentRoute={pathname} tabs={NAV_TABS} />;
}
```

`NAV_TABS`'s default hrefs (`/`, `/vitals`, `/stats`, `/settings`, verified `src/components/ui/nav-bar.tsx:10-15`) are relative to wherever `NavBar` is mounted — under `(prototype)/caregiver`, pass explicit `tabs` with `/caregiver`, `/caregiver/vitals`, etc. as hrefs, since `(prototype)` is a route group and drops out of the URL but `caregiver`/`parent` do not.

### Pattern 5: Typed route props (Next.js 16 convention — do not hand-write `params` types)

This project's root layout already uses the generated helper (`src/app/layout.tsx:23`, verified): `export default function RootLayout({ children }: LayoutProps<"/">)`. Per the installed version's own docs (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`, `page.md`, `dynamic-routes.md`): `LayoutProps<'/route'>`, `PageProps<'/route'>`, and `RouteContext<'/route'>` are **globally available after type generation, no import needed** — use these for any new `layout.tsx`/`page.tsx`/`route.ts` under `(prototype)/`, e.g. `PageProps<'/parent/device/[deviceId]'>` for the Device Details dynamic segment, rather than hand-writing `{ params }: { params: { deviceId: string } }`.

### Pattern 6: Route groups do not affect the URL

Confirmed against this exact installed version's docs (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`):
> "A route group can be created by wrapping a folder's name in parenthesis: `(folderName)`. This convention indicates the folder is for organizational purposes and should **not be included** in the route's URL path."

So `src/app/(prototype)/caregiver/page.tsx` serves `/caregiver`, not `/prototype/caregiver` — matches D-01's own example path.

### Anti-Patterns to Avoid

- **Reusing `home-proof`'s client-state router verbatim for real routes:** produces fake pages that never leave one component tree — contradicts D-01's explicit "real Next.js routes" requirement (see Pattern 4).
- **Letting a missing `status` prop silently default to `"safe"` on `VitalDetailCard`:** directly produces a green/healthy-looking card for data that doesn't exist yet — see Pitfall 1.
- **Treating `"green"/"amber"/"red"` and `"safe"/"caution"/"critical"` as interchangeable strings:** they are not the same enum; every fixture-to-component boundary needs `mapRiskStatus()` (Pattern 2).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Vitals/Stats two-tab switch (parent "See All", PARENT-03) | A new `Tabs` primitive | `ToggleGroup`/`ToggleGroupItem` (`src/components/ui/toggle-group.tsx`) | No `tabs.tsx` exists yet `[VERIFIED: ls src/components/ui]`; `ToggleGroup` already renders this exact segmented-control shape for the Stats time-scale row |
| Trend graph (CARE-04) | A hand-rolled SVG/Canvas chart | `VitalsTrendChart` (`src/components/ui/vitals-trend-chart.tsx`) | Already supports a generic `Record<string, number|string>` row shape, `timeAxis`, per-series color/domain — built specifically so "Phase 7 can feed real vitals field names" per its own doc comment (verified line 41) |
| Redundant-coded status (CARE-02: color + icon + word) | A page-local colored `<span>` | `Badge` (`src/components/ui/badge.tsx`) or `StatusCard`/`InfantStatusCard` | `Badge`'s own comment states this exact invariant is enforced in the component body specifically so a caller cannot bypass it (verified lines 6-15) |
| Battery/connection iconography for CARE-05 | New SVGs | Existing `Icon` glyphs: `sync`, `syncing`, `connected`, `disconnected`, `signal` (`src/components/icon.tsx`, verified names present) | These glyphs already exist and are unused outside `DeviceHeader`'s own connected/disconnected state — reuse before adding |
| Route param typing | Hand-written `{ params: {...} }` interfaces | `PageProps<'/route'>` / `LayoutProps<'/route'>` (Next.js 16 generated helpers) | Training-data-stale convention risk flagged by this project's own AGENTS.md; verified current via installed docs (Pattern 5) |

**Key insight:** every UI primitive this phase needs already exists except a timeline list, a connection-status indicator, and a device-select list — all three are compositions of existing primitives (`Item`/`ItemGroup`/`Badge`/`Icon`/`Card`), not new visual languages.

## Runtime State Inventory

Not applicable — this is a greenfield addition of new routes/components/fixtures, not a rename, refactor, or migration phase.

## Common Pitfalls

### Pitfall 1: `VitalDetailCard`'s status defaults to "safe" when omitted — wrong for the "unavailable" vitals

**What goes wrong:** Rendering the three ungrounded vitals (HRV, Perfusion Index, Respiratory Pattern) without an explicit `status` prop renders them with a green/safe treatment, directly contradicting D-07's "not yet available — no fudged data" directive.

**Why it happens:** `vital-detail-card.tsx:70` (verified):
```typescript
const tone = status ?? (critical ? "critical" : "safe");
```
`ClinicalStatus` (`clinical-cards.tsx:18`, verified) is only `"safe" | "caution" | "critical"` — there is no neutral/pending/unavailable value to pass instead.

**How to avoid:** Extend `VitalDetailCard`'s status handling with a fourth, neutral "unavailable" tone (icon-tile in a muted/neutral treatment, no numeric value, no chart) rather than reusing `"safe"`. This is a shared-component change, not a page-local one, per this project's "change the system, then consume it" contract (AGENTS.md). `Badge` already has a precedent `"neutral"` status key (`badge.tsx`, verified) to model the new tone's color role on.

**Warning signs:** Any ungrounded vital card rendering a green icon tile, a numeric-looking value, or the word "Stable"/"All systems stable" (the current placeholder copy in `VITAL_DETAILS`, verified lines 35, 40 — this copy is itself illustrative placeholder text that must be replaced for the ungrounded three).

### Pitfall 2: Backend `green/amber/red` vs. UI `safe/caution/critical` are not the same enum

**What goes wrong:** Fixture data or a new component silently compares `entry.risk.status === "safe"`, which is always false — the real value is `"green"`.

**Why it happens:** These are two independently-designed enums (Pattern 2) that happen to describe the same three-level severity, with no shared literal.

**How to avoid:** Apply `mapRiskStatus()` at exactly one boundary (fixture generation or the page reading the fixture) and pass only `ClinicalStatus` values into every component from that point on.

**Warning signs:** A `switch`/lookup keyed on `"safe"|"caution"|"critical"` that silently falls through to a default case for real fixture data.

### Pitfall 3: The bounded `from`/`to` contract has no "latest reading" shortcut yet

**What goes wrong:** Assuming CARE-01's "live vitals card ... sourced from the existing Realtime feed" can be satisfied by literally calling `GET /api/readings` for "the current reading" once Phase 10 swaps in the real endpoint.

**Why it happens:** `route.ts` requires both `from` and `to` as epoch-ms query params and 400s if either is missing (verified `src/app/api/readings/route.ts:96-119`); there is no "latest" mode. `REQUIREMENTS.md` names this exact gap as `API-01` ("A 'current/latest reading' endpoint ... so the dashboard doesn't need a bounded-range query just to show the live card"), assigned to Phase 8, still `Pending`.

**How to avoid:** Build the live-vitals-card fixture as "the newest entry in a fetched bounded window," which is honestly how it will have to work until Phase 8 ships `API-01` — and record this explicitly as the data-contract diff's headline gap alongside the three-of-six vitals gap (D-09).

**Warning signs:** A Phase 10 task that assumes an unqualified live-reading fetch exists today.

### Pitfall 4: `sampleVitalReadings()`'s sine-wave data is illustrative-only, not §7.1.1-computed

**What goes wrong:** Reusing `src/lib/examples/vital-readings.ts`'s existing `sampleVitalReadings()` helper as-is for the three real-formula vitals would ship arbitrary sine-wave numbers labeled as if they were computed via the real thresholds, contradicting D-07.

**Why it happens:** That helper's own doc comment already says "Illustrative 1–3-minute readings; firmware cadence is not fixed in planning" (verified line 1) — it was built for Phase 6's visual-only design-system proofs, before real formulas were locked.

**How to avoid:** Write new fixture-generation code for Phase 7 that runs synthetic-but-plausible `heartRate`/`temperature`/`activityScore` sequences through the literal constants in `src/lib/risk/thresholds.ts`, producing genuine `abnormal`/`trending` breakdown values — not a copy-paste of the old sine-wave generator relabeled.

**Warning signs:** A new fixture file that imports or duplicates `sampleVitalReadings()` for anything other than the three genuinely-ungrounded vitals' "no chart" placeholder state (where illustrative-adjacent data would be honest, since there's nothing real to visualize anyway — though even there D-07 wants no chart at all, not fake data, per Pitfall 1).

## Code Examples

### Live-window fixture generation reusing the real thresholds

```typescript
// Source: pattern derived from src/lib/risk/compute.ts + thresholds.ts (this repo)
import {
  TEMP_FEVER_C, TEMP_HYPOTHERMIA_C, HR_TEMP_RATIO_MIN, HR_TEMP_RATIO_MAX,
  ACTIVITY_DECLINE_RATIO,
} from "@/lib/risk/thresholds";

function computeBreakdown(target: SyntheticReading, baseline: SyntheticReading[]) {
  const temperatureAbnormal =
    target.temperature >= TEMP_FEVER_C || target.temperature < TEMP_HYPOTHERMIA_C;
  // ...mirror compute.ts's mean()/ratio/decline logic over `baseline` here...
}
```

### Connection-status pure function (new — CARE-05)

```typescript
// New file: src/lib/fixtures/connection-status.ts
export type ConnectionState = "live" | "stale" | "reconnecting";

export function getConnectionState(lastSyncedAt: number, now: number, staleAfterMs = 60_000): ConnectionState {
  if (now - lastSyncedAt < staleAfterMs) return "live";
  return "stale"; // "reconnecting" is a distinct transient state the caller sets explicitly during a retry, not derived from elapsed time alone
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Hand-written `{ params }: { params: {...} }` route typing | `PageProps<'/route'>` / `LayoutProps<'/route'>` generated helpers | Current in this project's pinned `next@16.3.5` (verified in shipped docs) | New route files under `(prototype)/` should use the generated helpers from the start |
| `frontend-design/` static HTML prototype tree | Real Next.js routes under `src/app/(prototype)/` | This phase (D-01, 2026-09-30) | Phase 10 becomes "swap fixtures for live wiring," not a markup port |

**Deprecated/outdated:** The "static HTML prototype" framing in `ROADMAP.md`'s Phase 7/10 text is explicitly superseded by D-01/D-02 (CONTEXT.md) — treat any reference to it as stale.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | `VitalDetailCard` should be extended with a new neutral/"unavailable" status tone rather than kept at three values with a page-local workaround | Pitfall 1, Pattern 3 | If the user instead wants a page-local-only treatment (contra the design-system's own "change the system, then consume it" rule), the plan would need a different task shape; low likelihood given AGENTS.md's explicit contract, but the exact tone's tokens/copy are still Claude's Discretion per CONTEXT.md |
| A2 | Device Details should be a **shared component** rendered from two different route files (caregiver `settings/page.tsx` and parent `device/[deviceId]/page.tsx`), not one shared URL both navigate to | Recommended Project Structure, Pattern 4 | If the user actually wants a single shared URL (breaking caregiver's persistent-nav vs. parent's no-nav distinction on that screen), routes would need restructuring; D-05 only specifies "one shared component/screen," not URL structure |
| A3 | `(prototype)` is a reasonable route-group name for both caregiver/parent trees | Recommended Project Structure | CONTEXT.md already marks this as Claude's Discretion — low risk, purely cosmetic if renamed later since route groups don't affect the URL (Pattern 6) |

**If this table is empty:** N/A — see above; all other technical claims in this research are `[VERIFIED]` against files read this session or `[CITED]` against canonical project docs, not assumed.

## Open Questions

1. **Exact copy for the "not yet available" state on the three ungrounded vitals (HRV, Perfusion Index, Respiratory Pattern)**
   - What we know: D-07 requires an explicit "not yet available — awaiting firmware/backend support" framing, and CONTEXT.md marks the exact wording as Claude's Discretion.
   - What's unclear: Whether the copy should name the specific missing sensor data (RR-intervals, PPG amplitude ratio, IMU periodicity) or stay generic for a caregiver-facing audience.
   - Recommendation: Keep caregiver-facing copy generic ("Not yet available — awaiting device support"); put the sensor-specific detail only in the data-contract diff document (D-09), which is a developer-facing artifact.

2. **Whether the parent's Vitals/Stats detail screens render the exact same components as the caregiver's (just without NavBar) or a separate "abstracted" component variant**
   - What we know: D-03 says the parent reuses "the caregiver's own Vitals/Stats screens/components" and PARENT-02 requires full data parity, "in an abstracted presentation."
   - What's unclear: Whether "abstracted presentation" means identical components at a different route, or the same components with a prop toggling verbosity (e.g., hiding raw numeric values, showing only the status tone).
   - Recommendation: Start with identical components at a different route (simplest, satisfies literal D-03 wording); treat any additional abstraction (hiding numbers) as a follow-up refinement only if explicitly requested during planning/discussion, since CONTEXT.md doesn't lock this further.

## Environment Availability

Skipped — this phase adds no new external tool, service, or runtime dependency. Every capability composes from `next`, `react`, `recharts`, `radix-ui`, and `vitest`, all already installed and verified present in `package.json` this session.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.11 `[VERIFIED: package.json]` |
| Config file | `vitest.config.ts` — `environment: "node"`, `@` alias to `src/` `[VERIFIED: vitest.config.ts]` |
| Quick run command | `npx vitest run tests/<file>.test.ts` |
| Full suite command | `npm test` (→ `vitest run`) |

No `jsdom` or `@testing-library/*` is installed `[VERIFIED: package.json — absent]`. The existing convention for testing React components is `renderToStaticMarkup(createElement(Component, props))` from `react-dom/server`, with assertions on the resulting markup string (data-slot/data-state/data-icon attributes, class fragments, text content) — verified in `tests/design-system.test.ts:1-40`, e.g. its `PulseWave` test asserts `data-icon`, `data-size`, and `data-active` all in one markup string. New component tests for this phase should follow the identical pattern; no new test framework or DOM library needs installing.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CARE-01 | Live vitals card visible on load, latest fixture entry rendered | unit (renderToStaticMarkup) | `npx vitest run tests/prototype.caregiver-home.test.ts` | ❌ Wave 0 |
| CARE-02 | Traffic-light status is color + icon + word together | unit (markup assertion, mirrors existing `Badge`/`PulseWave` pattern) | `npx vitest run tests/prototype.status.test.ts` | ❌ Wave 0 |
| CARE-03 | Risk-status timeline is chronological | unit (pure function: fixture entries sorted ascending, statuses mapped) | `npx vitest run tests/prototype.timeline.test.ts` | ❌ Wave 0 |
| CARE-04 | Trend graph responds to 1h/6h/24h selection with bounded data | unit (fixture windowing function returns correct subset per range) | `npx vitest run tests/prototype.trend-window.test.ts` | ❌ Wave 0 |
| CARE-05 | Connection indicator distinguishes Live/Last synced Xm ago/Reconnecting | unit (pure function `getConnectionState` across boundary values) | `npx vitest run tests/prototype.connection-status.test.ts` | ❌ Wave 0 |
| CARE-06 | Persistent bottom nav includes Settings, present on every caregiver route | unit (markup assertion: 4 `NavLink` hrefs present incl. `/caregiver/settings`) | `npx vitest run tests/prototype.caregiver-nav.test.ts` | ❌ Wave 0 |
| PARENT-01 | Parent home has no persistent bottom nav | unit (markup assertion: no `data-slot="nav-bar"` on parent home markup) | `npx vitest run tests/prototype.parent-home.test.ts` | ❌ Wave 0 |
| PARENT-02/03 | "See All" reveals Vitals/Stats tabs with full data parity | unit (markup assertion: both tabs render, same fixture-derived values as caregiver) | `npx vitest run tests/prototype.parent-detail.test.ts` | ❌ Wave 0 |
| PARENT-04 | Device/settings reached via device icon, not a nav tab | unit (markup assertion: device icon present, no 4th nav tab on parent home) | `npx vitest run tests/prototype.parent-home.test.ts` | ❌ Wave 0 (same file as PARENT-01) |
| PARENT-05 | Exact flow matches D-03/D-04 as finalized | manual-only (UAT) — flow is a product decision, not a unit-testable assertion beyond the above | `/gsd-verify-work 7` conversational UAT | n/a |

### Sampling Rate

- **Per task commit:** the relevant single test file above (`npx vitest run tests/<file>.test.ts`)
- **Per wave merge:** `npm test` (full suite, currently green per STATE.md's Phase 6 close-out)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/lib/fixtures/readings.ts` — the fixture module every render/unit test above depends on must exist before any test can import it
- [ ] `src/lib/fixtures/risk-status.ts` — `mapRiskStatus()` helper
- [ ] `src/lib/fixtures/connection-status.ts` — `getConnectionState()` helper
- [ ] `tests/prototype.*.test.ts` files listed above — none exist yet
- [ ] Framework install: none — Vitest is already configured project-wide

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | Out of scope for v1.1 — `REQUIREMENTS.md`'s Out of Scope table explicitly defers "Caregiver/parent login, accounts, role-based access" (`ACC-V2-01`); role is chosen by navigating to `/caregiver` vs `/parent`, not by auth, and this phase does not change that |
| V3 Session Management | No | No sessions introduced this phase |
| V4 Access Control | No (documented, accepted gap) | Both `/caregiver` and `/parent` URLs are equally reachable by anyone; this is an already-accepted product decision for this milestone, not a new gap this phase introduces — do not attempt to add ad-hoc access control as an unrequested addition |
| V5 Input Validation | Yes (narrow) | Any interactive control this phase adds (`ToggleGroup` time-range, `Switch` toggles) is client-only UI state, not persisted or sent to a server — no new server-side input surface exists this phase. Recommended: a `zod` schema (`zod@4.6.2`, already installed) asserting the fixture module's shape matches `GET /api/readings`'s real envelope, run as a Vitest assertion — this doubles as an automated drift-guard for D-01's "fixtures must mirror the real response" requirement |
| V6 Cryptography | No | No cryptographic operations in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| XSS via fixture/instruction copy rendered into JSX | Tampering | React's default JSX escaping (no `dangerouslySetInnerHTML` anywhere in this phase's new code) |
| A demo visitor manually navigating to `/caregiver` sees caregiver-detail data intended for a different audience | Information Disclosure | Already an accepted, documented risk for this milestone (no accounts yet, `ACC-V2-01` deferred) — do not silently "fix" this with unrequested route guards; flag it in the data-contract diff only if it surfaces as a genuinely new concern during build, per D-09's "any other gap surfaced" clause |
| A future live-wiring regression accidentally imports `supabaseAdmin` into a `"use client"` file | Elevation of Privilege / Information Disclosure | Not applicable to this phase's code at all (fixtures only, no Supabase import anywhere) — flagged here only so the plan's own verification step can assert **zero** `@/lib/supabase/*` imports anywhere under `src/app/(prototype)/` this phase, guarding against scope creep into live wiring |

## Sources

### Primary (HIGH confidence — verified by reading this session)

- `src/lib/validation/ingest-schema.ts` — real ingest field names
- `src/app/api/readings/route.ts` — real `GET /api/readings` response envelope
- `src/lib/supabase/types.ts` — DB schema (`readings`, `risk_scores`, `devices` tables)
- `src/lib/risk/compute.ts`, `src/lib/risk/thresholds.ts` — real risk-scoring algorithm, breakdown shape, status enum, threshold constants
- `src/lib/device-state.ts` — device connection/battery state model
- `src/components/patterns/clinical-cards.tsx`, `vital-detail-card.tsx`, `status-summary-cards.tsx`, `device-header.tsx`, `device-tile-row.tsx` — full clinical composition set
- `src/components/ui/nav-bar.tsx`, `nav-link.tsx`, `vitals-trend-chart.tsx`, `battery-indicator.tsx`, `badge.tsx`, `item.tsx`, `card.tsx` — primitives
- `src/app/design-system/home-proof/page.tsx`, `src/app/design-system/docs/examples/clinical-dashboard/page.tsx`, `src/components/docs/example-browser.tsx` — existing composite/proof pattern and why its client-router exists
- `src/lib/examples/clinical-scenarios.ts`, `src/lib/examples/vital-readings.ts` — existing illustrative fixture patterns (and their explicit "illustrative only" disclaimers)
- `package.json`, `vitest.config.ts`, `tests/design-system.test.ts` — installed stack versions and test conventions
- `src/app/layout.tsx`, `src/app/page.tsx` — current root layout/route state (no existing route groups)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`, `layout.md`, `page.md`, `dynamic-routes.md` — this exact installed Next.js version's routing/typing conventions
- `context/implementation-plans/neonatal-sepsis-armband.md` §7.1.1 — the six-feature composite suspicion logic formulas
- `hardware/SEPCARE-HARDWARE-SOT.md` — confirms MAX30102/MPU6050/DS18B20 sensor capability vs. current firmware output

### Secondary (MEDIUM confidence)

- `archive/USER-FLOWS.md` Flow 4 — device management flow content (superseded format, canonical content per CONTEXT.md's own instruction to treat it as still-authoritative for flow content)
- `.planning/phases/07-html-prototype-caregiver-parent/07-CONTEXT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md` — locked decisions and requirement text (project-internal, authoritative for this project but not independently re-verified against external sources)

### Tertiary (LOW confidence)

- None — no external web search was needed this session; every finding was grounded in files read directly from this repository or its installed dependencies.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; every version read directly from `package.json`
- Architecture: HIGH — route/typing conventions read from the exact installed Next.js version's own docs; component APIs read directly from source
- Pitfalls: HIGH — both critical pitfalls (status-enum mismatch, `VitalDetailCard` default-to-safe) are directly demonstrated by quoted source lines, not inferred

**Research date:** 2026-09-30
**Valid until:** Next `next`/`react`/`recharts` version bump, or Phase 8/9 backend/firmware changes that add new vitals fields (whichever comes first) — re-check Pattern 3's "no corresponding field" claim at that point
