# Phase 7: HTML Prototype (Caregiver + Parent) - Pattern Map

**Mapped:** 2026-09-30
**Files analyzed:** 24
**Analogs found:** 20 / 24

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/(prototype)/caregiver/layout.tsx` | route (layout) | request-response | `src/app/design-system/home-proof/page.tsx` (content shape) + `src/components/patterns/device-header.tsx` (header) + `src/components/ui/nav-bar.tsx` (nav) | role-match (composition, not 1:1 file) |
| `src/app/(prototype)/caregiver/page.tsx` (Home) | route (page) | request-response | `src/app/design-system/home-proof/page.tsx` | exact (content), needs real-routing rewrite (Pattern 4 in RESEARCH) |
| `src/app/(prototype)/caregiver/vitals/page.tsx` | route (page) | request-response | `src/app/design-system/home-proof/page.tsx` Vitals section | exact (content) |
| `src/app/(prototype)/caregiver/stats/page.tsx` | route (page) | request-response | `src/app/design-system/home-proof/page.tsx` Stats section | exact (content) |
| `src/app/(prototype)/caregiver/settings/page.tsx` | route (page) | request-response | new `DeviceDetails` composition (below) | role-match |
| `src/app/(prototype)/parent/layout.tsx` | route (layout) | request-response | `caregiver/layout.tsx` (sibling, minus NavBar) | role-match |
| `src/app/(prototype)/parent/page.tsx` | route (page) | request-response | `src/components/patterns/status-summary-cards.tsx` (`InfantStatusCard`) + Home section of `home-proof` | role-match |
| `src/app/(prototype)/parent/detail/layout.tsx` | route (layout) | request-response | `src/components/ui/toggle-group.tsx` (Stats time-scale row pattern) | role-match |
| `src/app/(prototype)/parent/detail/vitals/page.tsx` | route (page) | request-response | caregiver `vitals/page.tsx` (reused, same components) | exact |
| `src/app/(prototype)/parent/detail/stats/page.tsx` | route (page) | request-response | caregiver `stats/page.tsx` (reused, same components) | exact |
| `src/app/(prototype)/parent/device/page.tsx` | route (page) | request-response | new `DeviceSelectList` composition (below) | role-match |
| `src/app/(prototype)/parent/device/[deviceId]/page.tsx` | route (page) | request-response | new `DeviceDetails` composition (below), Next 16 `PageProps<'/route'>` typing | role-match |
| `src/components/patterns/risk-timeline.tsx` | component (pattern) | transform (fixture → chronological list) | `src/components/ui/item.tsx` (`Item`/`ItemGroup`/`ItemContent`/`ItemTitle`/`ItemDescription`) + `src/components/patterns/clinical-cards.tsx` `InstructionCard` (Item-based row composition) | role-match (no direct analog, composed) |
| `src/components/patterns/connection-status.tsx` | component (pattern), client | event-driven (clock-tick derived state) | `src/components/patterns/device-header.tsx` (battery/connection text cluster) + `src/lib/device-state.ts` (pure state-derivation function pattern) | role-match |
| `src/components/patterns/device-select-list.tsx` | component (pattern) | CRUD (read-only list) | `src/components/patterns/clinical-cards.tsx` `DeviceCard` + `src/components/ui/item.tsx` (`ItemGroup`) | role-match |
| `src/components/patterns/device-details.tsx` | component (pattern) | CRUD (read + connect/disconnect action) | `src/components/patterns/device-header.tsx` (tile/battery layout) + `src/components/patterns/clinical-cards.tsx` `DeviceCard` | role-match |
| `src/components/patterns/vital-detail-card.tsx` (MODIFIED — add `unavailable` tone) | component (pattern) | transform | itself (extend existing file) | exact |
| `src/components/patterns/clinical-cards.tsx` (status type import site — unchanged, referenced not modified) | component (pattern) | transform | itself | exact |
| `src/lib/fixtures/readings.ts` | utility/fixture | batch (static data generation shaped as API envelope) | `src/app/api/readings/route.ts` (envelope shape) + `src/lib/risk/compute.ts` (formulas to reuse) | exact (shape), role-match (no existing fixture-generator like this) |
| `src/lib/fixtures/risk-status.ts` (`mapRiskStatus`) | utility | transform | `src/lib/device-state.ts` (`getDeviceState`/`clampBattery` — small pure mapping-function precedent) | role-match |
| `src/lib/fixtures/connection-status.ts` (`getConnectionState`) | utility | transform | `src/lib/device-state.ts` (`getDeviceState`) | exact (same shape: pure function, deterministic state buckets) |
| `07-DATA-CONTRACT-DIFF.md` | doc | n/a | none (new deliverable) | no analog |
| `tests/prototype.*.test.ts` (6 files) | test | request-response / transform | `tests/design-system.test.ts` (`renderToStaticMarkup` + markup-attribute assertions) | exact |
| `src/components/patterns/risk-timeline.DESIGN.md`, `connection-status.DESIGN.md`, `device-select-list.DESIGN.md`, `device-details.DESIGN.md` | docs (design notes) | n/a | `src/components/patterns/vital-detail-card.DESIGN.md` (pairing convention) | exact (convention), content is new |

## Pattern Assignments

### `src/lib/fixtures/readings.ts` (fixture/utility, batch)

**Analog:** `src/app/api/readings/route.ts` (envelope shape) + `src/lib/risk/compute.ts` + `src/lib/risk/thresholds.ts` (formulas)

**Envelope shape to mirror exactly** (`src/app/api/readings/route.ts:131-150` region, and `:1-38` for types):
```typescript
type HistoryRow = {
  timestamp: number;
  heartRate: number;
  spo2: number;
  temperature: number;
  activityScore: number;
  risk_scores: HistoryRisk | HistoryRisk[] | null;
};

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
Fixture module must export `{ deviceId, from, to, entries }` with this exact key set.

**Formula/threshold pattern to reuse** (`src/lib/risk/compute.ts:150-191`, `src/lib/risk/thresholds.ts:1-45`):
```typescript
export const TEMP_FEVER_C = 38.0;
export const TEMP_HYPOTHERMIA_C = 35.5;
export const HR_TEMP_RATIO_MIN = 6;
export const HR_TEMP_RATIO_MAX = 14;
export const MIN_DELTA_TEMP_C = 0.1;
export const ACTIVITY_DECLINE_RATIO = 0.7;

const temperatureAbnormal =
  target.temperature >= TEMP_FEVER_C || target.temperature < TEMP_HYPOTHERMIA_C;
// ... deltaTemp/deltaHR baseline logic, hrTempRatio, activityDelta ...
const status: "green" | "amber" | "red" =
  abnormalCount >= 3 ? "red" : abnormalCount === 2 ? "amber" : "green";
```
Import these named constants directly from `@/lib/risk/thresholds` rather than hardcoding numbers in the fixture (RESEARCH.md Pattern 3 — "defensibly identical math"). Do NOT reuse `src/lib/examples/vital-readings.ts`'s `sampleVitalReadings()` sine-wave generator for the 3 real-formula vitals (Pitfall 4) — that helper is illustrative-only per its own doc comment.

**Error handling pattern:** None needed — this is a static synchronous module, no try/catch (no I/O). If a `zod` shape-assertion is added (RESEARCH.md V5), model it on `src/lib/validation/ingest-schema.ts`'s schema style.

---

### `src/lib/fixtures/risk-status.ts` (`mapRiskStatus`) (utility, transform)

**Analog:** `src/lib/device-state.ts` — pure small mapping function file, no class, just exported functions + a lookup const.

**Pattern to copy** (`src/lib/device-state.ts:1-16`):
```typescript
export type DeviceState = "healthy" | "medium" | "low" | "disconnected";
export function getDeviceState(connected = true, battery?: number): DeviceState {
  if (!connected) return "disconnected";
  if (battery === undefined || !Number.isFinite(battery)) return "healthy";
  const level = clampBattery(battery);
  return level <= 20 ? "low" : level <= 50 ? "medium" : "healthy";
}
```
Apply the same shape to `mapRiskStatus`:
```typescript
import type { ClinicalStatus } from "@/components/patterns/clinical-cards";
const RISK_STATUS_MAP = { green: "safe", amber: "caution", red: "critical" } as const;
export function mapRiskStatus(status: "green" | "amber" | "red"): ClinicalStatus {
  return RISK_STATUS_MAP[status];
}
```

---

### `src/lib/fixtures/connection-status.ts` (`getConnectionState`) (utility, transform)

**Analog:** `src/lib/device-state.ts` (`getDeviceState`) — identical "pure function returning a small union of state labels from numeric thresholds" shape.

```typescript
// Source: src/lib/device-state.ts (this repo) — copy this exact shape
export function getDeviceState(connected = true, battery?: number): DeviceState {
  if (!connected) return "disconnected";
  if (battery === undefined || !Number.isFinite(battery)) return "healthy";
  const level = clampBattery(battery);
  return level <= 20 ? "low" : level <= 50 ? "medium" : "healthy";
}
```
New function follows the same branch-early, no-throw, deterministic-bucket style:
```typescript
export type ConnectionState = "live" | "stale" | "reconnecting";
export function getConnectionState(lastSyncedAt: number, now: number, staleAfterMs = 60_000): ConnectionState {
  if (now - lastSyncedAt < staleAfterMs) return "live";
  return "stale"; // "reconnecting" is set explicitly by the caller during a retry
}
```

---

### `src/components/patterns/risk-timeline.tsx` (component, transform)

**Analog:** `src/components/ui/item.tsx` primitives + `src/components/patterns/clinical-cards.tsx`'s `InstructionCard` (closest existing Item-based row composition).

**Imports pattern** (`clinical-cards.tsx:1-16`):
```typescript
import { Icon, type IconName } from "@/components/icon";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Item, ItemContent, ItemTitle, ItemDescription,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
```

**Core row pattern** (`clinical-cards.tsx:165-193`, `InstructionCard`):
```typescript
export function InstructionCard({ icon, title, description, className }: {...}) {
  return (
    <Card className={cn("p-0", className)}>
      <Item className="flex-nowrap gap-3.5 p-3.5">
        <ContentTileRow
          tileClassName="bg-icon-tile-neutral text-text-subtle"
          tile={<Icon name={icon} size={24} />}
        >
          <ItemContent>
            <ItemTitle className="text-sm leading-snug">{title}</ItemTitle>
            <ItemDescription className="line-clamp-none text-xs">{description}</ItemDescription>
          </ItemContent>
        </ContentTileRow>
      </Item>
    </Card>
  );
}
```
`RiskTimeline` wraps N of these-shaped rows in `ItemGroup` (`src/components/ui/item.tsx:8-17`):
```typescript
function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="list" data-slot="item-group" className={cn("group/item-group flex flex-col", className)} {...props} />;
}
```
Use `Badge` (see below) or a raw status-colored `Icon` for each row's status indicator — never a page-local colored span.

**Status bridging (mandatory):** apply `mapRiskStatus()` before any entry reaches this component; it must only receive `ClinicalStatus`, never raw `"green"|"amber"|"red"` (UI-SPEC.md §RiskTimeline).

---

### `src/components/patterns/connection-status.tsx` ("use client", event-driven)

**Analog:** `src/components/patterns/device-header.tsx`'s battery/connection text cluster (closest existing "icon + short label, tone-colored" inline composition).

**Pattern to copy** (`device-header.tsx:61-89`):
```typescript
<span className="inline-flex min-w-0 items-center gap-2">
  <PulseWave
    size="sm"
    emoji={false}
    tone={!connected ? "neutral" : slowInternet ? "caution" : DEVICE_STATE[getDeviceState(connected, battery)].tone}
    active={connected}
  />
  <span>{!connected ? "Wearable Disconnected" : slowInternet ? "Slow internet" : "Wearable Connected"}</span>
</span>
```
`ConnectionStatus` follows this exact "conditional icon + conditional label text, single inline-flex span" shape, but swaps `PulseWave` for `Icon name="connected"|"sync"|"syncing"` per UI-SPEC.md's three-state table, and needs `"use client"` (device-header.tsx itself is not a client component — this is the one place ConnectionStatus's client-only requirement diverges from its analog, because of the live "now" tick).

**Icon names to reuse** (`src/components/icon.tsx` — confirmed present): `sync`, `syncing`, `connected`, `disconnected`.

---

### `src/components/patterns/device-select-list.tsx` / `device-details.tsx` (component, CRUD)

**Analog:** `src/components/patterns/clinical-cards.tsx`'s `DeviceCard` (`:58-99`) — the existing icon-tile/battery/connection-label composition to reuse, not re-derive.

```typescript
export function DeviceCard({ name, identifier, battery, connected = true, action, className }: {...}) {
  const state = getDeviceState(connected, battery);
  return (
    <Card className={cn("shadow-card-device", className)}>
      <DeviceTileRow connected={connected} battery={battery}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="break-words text-sm">{name}</CardTitle>
          {action}
        </div>
        <CardDescription className="mt-1">{identifier}</CardDescription>
        {state !== "healthy" && (
          <CardDescription className="mt-1">{DEVICE_STATE[state].label}</CardDescription>
        )}
        {battery !== undefined && Number.isFinite(battery) && (
          <BatteryIndicator level={battery} connected={connected} showIcon={false} className="mt-3 w-full" aria-label={...} />
        )}
      </DeviceTileRow>
    </Card>
  );
}
```

**`DeviceHeader`'s full-screen-scale device-tile layout** (`device-header.tsx:39-93`) is the closer analog for `DeviceDetails` specifically (full-width header-style layout vs. `DeviceCard`'s compact card):
```typescript
<DeviceTileRow className="mt-5" connected={connected} battery={battery}>
  <div className="min-w-0">
    <p className="break-words font-heading text-xl font-bold">{deviceName}</p>
    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
      {/* battery percentage + divider + connection label — see ConnectionStatus above */}
    </p>
  </div>
</DeviceTileRow>
```
`DeviceDetails` composes: this device-name/tile block + `BatteryIndicator` + `ConnectionStatus` + a `Badge status="safe"|"caution"|"critical"` sensor-contact row (reuse `Badge`, do not build a new indicator) + `Button tone="neutral"` for Connect/Disconnect (Button contract — NOT `tone="critical"`).

**Device state helper reused as-is** (`src/lib/device-state.ts:1-39`, full file) — `getDeviceState`, `clampBattery`, `DEVICE_STATE` lookup — import directly, do not reimplement.

---

### `src/components/patterns/vital-detail-card.tsx` (MODIFY — add `unavailable` tone)

**Analog:** itself — this is a direct extension of the existing file, not a new analog search.

**Current status-resolution logic to extend** (`vital-detail-card.tsx:70-105`):
```typescript
const tone = status ?? (critical ? "critical" : "safe");
const treatment = {
  safe: { tile: "bg-safe-soft text-safe", text: "text-safe", label: "Stable" },
  caution: { tile: "bg-caution-soft text-caution-dark", text: "text-caution-dark", label: "Needs attention" },
  critical: { tile: "bg-critical-soft text-critical", text: "text-critical", label: "Critical" },
}[tone];
...
const series = chart?.series.map((item) => ({
  ...item,
  color: status || critical ? `var(--color-${tone})` : item.color,
}));
```
**Required change (per UI-SPEC.md):** widen the prop type to `ClinicalStatus | "unavailable"` (component-local widening — do NOT touch the exported `ClinicalStatus` type in `clinical-cards.tsx:18`, which stays exactly `"safe" | "caution" | "critical"` since `Badge`/`StatusCard`/`InfantStatusCard`/`VitalCard` all consume that type unchanged). Add a fourth `treatment` entry:
```typescript
unavailable: { tile: "bg-neutral-100 text-text-muted", text: "text-text-muted", label: "Unavailable" },
```
For `tone === "unavailable"`: skip the `chart` render branch entirely (no `<VitalsTrendChart>`, no value, no sparkline) — omit the `chart` prop for these three vitals at the call site (`vitals/page.tsx`), don't pass an empty-array chart.

Also update `VITAL_DETAILS`' placeholder `description` text for indices 1 ("Cardiac Autonomic"), 2 ("Perfusion Index"), 4 ("Respiratory Pattern") — `vital-detail-card.tsx:22-31,37-41` — replace with `"Not yet available — awaiting device support."` per the Copywriting Contract.

**Companion doc:** update `vital-detail-card.DESIGN.md` in the same change (AGENTS.md's "update documentation in the same change" rule) — read that file before editing to preserve its existing structure.

---

### Route/navigation files (`caregiver/layout.tsx`, `parent/layout.tsx`, and NavBar/NavLink usage)

**Analog:** `src/components/ui/nav-bar.tsx` + `src/components/ui/nav-link.tsx` (used correctly, real `next/link`) — NOT `src/app/design-system/home-proof/page.tsx`'s client-state router, which exists only for the sandboxed docs iframe.

**Imports/core pattern** (`nav-bar.tsx:1-15`, `22-63`):
```typescript
import { NavLink } from "@/components/ui/nav-link";
export const NAV_TABS: NavBarTab[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/vitals", label: "Vitals", icon: "heart" },
  { href: "/stats", label: "Stats", icon: "monitoring" },
  { href: "/settings", label: "Settings", icon: "settings" },
];
export function NavBar({ currentRoute, tabs = NAV_TABS, position = "fixed", onTabChange, ... }: NavBarProps) {
  return (
    <nav data-slot="nav-bar" aria-label="Main navigation" className={...}>
      {tabs.map((tab) => (
        <NavLink key={tab.href} {...tab} state={currentRoute === tab.href ? "active" : "inactive"}
          onClick={onTabChange ? (e) => { e.preventDefault(); onTabChange(tab.href); } : undefined} />
      ))}
    </nav>
  );
}
```
**Real-routing usage (RESEARCH.md Pattern 4, verified against `nav-link.tsx:1-4,35`'s real `next/link` `Link`):**
```typescript
"use client";
import { usePathname } from "next/navigation";
import { NavBar } from "@/components/ui/nav-bar";

export function CaregiverNav() {
  const pathname = usePathname();
  const tabs = [
    { href: "/caregiver", label: "Home", icon: "home" },
    { href: "/caregiver/vitals", label: "Vitals", icon: "heart" },
    { href: "/caregiver/stats", label: "Stats", icon: "monitoring" },
    { href: "/caregiver/settings", label: "Settings", icon: "settings" },
  ];
  return <NavBar currentRoute={pathname} tabs={tabs} />;
}
```
Do NOT pass `onTabChange` for real routes — omitting it lets `NavLink`'s underlying `Link` navigate normally (no `preventDefault`).

**Header pattern for both layouts** (`device-header.tsx`, full file) — reuse as-is for caregiver; parent's header should compose `Wordmark` + a device-icon `Button` per PARENT-04 without the persistent-NavBar wrapper (`parent/layout.tsx` deliberately omits `<NavBar>`).

---

### `src/components/patterns/status-summary-cards.tsx` (`InfantStatusCard`) — reused as-is for both Home screens

**Pattern** (full file, `:1-27`):
```typescript
export function InfantStatusCard({ infant, onCallAmbulance }: InfantStatusCardProps) {
  return (
    <Card role="group" aria-label="Infant status" className="flex w-full min-w-0 flex-col items-center gap-4 py-6 text-center">
      <PulseWave emoji tone={infant.status} size="xl" />
      <div className="flex flex-col gap-2">
        <CardTitle className="font-heading text-xl font-bold">{infant.title}</CardTitle>
        {infant.status === "critical" && onCallAmbulance ? (
          <Button tone="critical" onClick={onCallAmbulance} icon={<Icon name="phone" size={18} />}>Call ambulance</Button>
        ) : <CardDescription>{infant.description}</CardDescription>}
      </div>
    </Card>
  );
}
```
`infant.status` must be `ClinicalStatus` (post-`mapRiskStatus()`), never raw backend `"green"/"amber"/"red"`.

---

### `tests/prototype.*.test.ts` (test, request-response/transform)

**Analog:** `tests/design-system.test.ts` — `renderToStaticMarkup` + attribute-string assertions, no jsdom/@testing-library.

```typescript
// Source: tests/design-system.test.ts (this repo) — pattern to copy
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
// assert on data-slot / data-status / data-state attributes and text content
// present in the rendered markup string, e.g.:
// expect(markup).toContain('data-icon="' + expectedIcon + '"');
```
Apply identically for the 6 new prototype test files listed in RESEARCH.md's Phase Requirements → Test Map (`prototype.status.test.ts`, `prototype.timeline.test.ts`, `prototype.trend-window.test.ts`, `prototype.connection-status.test.ts`, `prototype.caregiver-nav.test.ts`, `prototype.parent-home.test.ts`, `prototype.parent-detail.test.ts`).

---

## Shared Patterns

### Status enum bridge (green/amber/red → safe/caution/critical)
**Source:** `src/lib/risk/compute.ts:190-191` (backend enum) + `src/components/patterns/clinical-cards.tsx:18` (UI enum)
**Apply to:** every fixture-to-component boundary — `readings.ts` consumers, `RiskTimeline`, `VitalCard`, `StatusCard`, `InfantStatusCard`, `VitalDetailCard`.
```typescript
const status: "green" | "amber" | "red" = abnormalCount >= 3 ? "red" : abnormalCount === 2 ? "amber" : "green";
export type ClinicalStatus = "safe" | "caution" | "critical";
```
Never compare a fixture's `entry.risk.status` directly against `"safe"|"caution"|"critical"` — always pass through `mapRiskStatus()` first.

### Icon usage — hand-authored glyph system, not a Radix icon import
**Source:** `src/components/icon.tsx` (per UI-SPEC.md's explicit warning — this project's `iconLibrary: radix` shadcn config is NOT actually consumed)
**Apply to:** every new composition (`RiskTimeline`, `ConnectionStatus`, `DeviceSelectList`, `DeviceDetails`) — always `<Icon name="..." />` from `@/components/icon`, confirmed glyph names available: `sync`, `syncing`, `connected`, `disconnected`, `safe`, `caution`, `critical`, `heartRate`, `temperature`, `activity`, `pulse`, `perfusion`, `lungs`, `ratio`, `calendar`, `phone`, `home`, `heart`, `monitoring`, `settings`, `wearable`.

### Redundant-coded status (color + icon + word) via `Badge`
**Source:** `src/components/ui/badge.tsx:6-57`
```typescript
const hasStatusIcon = resolvedStatus === "safe" || resolvedStatus === "caution" || resolvedStatus === "critical";
return (
  <span data-slot="badge" data-status={resolvedStatus} className={cn(badgeVariants({ status: resolvedStatus }), className)} {...props}>
    {showIcon && hasStatusIcon && <Icon name={resolvedStatus} size={14} className="shrink-0" />}
    {children}
  </span>
);
```
Note: `Badge`'s `status` union does not include `"unavailable"` — for `RiskTimeline`/`VitalDetailCard`'s unavailable state, use `Badge status="neutral"` (existing precedent key) or the component-local `unavailable` tile treatment directly, never extend `Badge`'s own type for this phase (`Badge` has no use case for it — UI-SPEC.md is explicit that `ClinicalStatus` itself stays untouched).

### Pure derived-state function shape
**Source:** `src/lib/device-state.ts:1-16` (`getDeviceState`)
**Apply to:** `mapRiskStatus()`, `getConnectionState()` — small, synchronous, no I/O, deterministic bucket-return functions, exported alongside a co-located lookup const (`DEVICE_STATE` pattern) when the caller also needs label/tone/icon metadata per bucket.

### `cn()` class merging
**Source:** `src/lib/utils.ts` (referenced throughout every component above)
**Apply to:** every new `.tsx` file — `className={cn("base classes", conditional && "extra", className)}`.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `07-DATA-CONTRACT-DIFF.md` | doc | n/a | New deliverable type for this project — no prior data-contract-diff document exists; structure is fully specified by CONTEXT.md D-09 (per-gap: frontend need / backend current state / closing phase), not a code pattern |
| `risk-timeline.DESIGN.md`, `connection-status.DESIGN.md`, `device-select-list.DESIGN.md`, `device-details.DESIGN.md` | docs | n/a | Content is new; only the *pairing convention* (`{component}.tsx` + `{component}.DESIGN.md`) has an analog — model structure on `vital-detail-card.DESIGN.md`'s existing sections, not code excerpts |

## Metadata

**Analog search scope:** `src/components/ui/`, `src/components/patterns/`, `src/lib/`, `src/app/api/readings/`, `src/app/design-system/`, `tests/`
**Files scanned:** 15 read in full this session (`vital-detail-card.tsx`, `clinical-cards.tsx`, `status-summary-cards.tsx`, `item.tsx`, `nav-bar.tsx`, `nav-link.tsx`, `device-header.tsx`, `device-state.ts`, `badge.tsx`, `risk/compute.ts`, `risk/thresholds.ts`, `api/readings/route.ts` [partial], plus CONTEXT.md/RESEARCH.md/UI-SPEC.md which themselves already cite verified line numbers for `sparkline.tsx`, `battery-indicator.tsx`, `vitals-trend-chart.tsx`, `toggle-group.tsx`, `tests/design-system.test.ts`, `ingest-schema.ts` — not re-read here since RESEARCH.md already extracted their relevant excerpts and this pass would duplicate that work)
**Pattern extraction date:** 2026-09-30
