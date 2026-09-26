# Phase 6: Design System (Tailwind v4 Tokens) — REWORK Research

**Researched:** 2026-09-27 (rework pass — supersedes the 2026-09-26 narrow-scope research)
**Domain:** Tailwind v4 tokens + shadcn/ui component system rebuild, Recharts chart integration, Figma-verified component fidelity, design-system documentation quality
**Confidence:** MEDIUM-HIGH (stack/CLI facts verified live against the installed tool; visual-quality judgment calls are inherently subjective and flagged as such)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01/D-02:** Tailwind v4 + `@theme` directly in the Next.js app on `main`; sample pages are real App Router routes. Already done.
- **D-03/D-04:** Canonical palette is Figma Segue 3.0; current `src/app/globals.css` primitives are correct — do not re-derive. Pink reserved for Critical/Red only; brand stays blue, safe green, caution amber.
- **D-05:** Font stack Inter, unchanged.
- **D-06:** Strict, agent-legible system — finite typed variants, a `DESIGN.md` per component. Principle unchanged; existing 4 `DESIGN.md`s need a content/quality pass alongside the visual rebuild.
- **D-07:** Component base is shadcn/ui + Radix.
- **D-09:** Icons: salvaged `frontend-design/design-system/icons.js` SVG set reusable; cross-check against Figma icon usage (`fluent:smartwatch-dot-20-regular`, `lucide-lab:bottle-baby`, `hugeicons:baby-02`) — some icons may need sourcing from those icon sets if the existing 40+ set doesn't cover them.
- **D-12 (supersedes D-08):** Component set expands well beyond the original 4 (Button/Card/Badge/Input). Confirmed-required additions, each backed by a specific Figma node (file key `4J2wGl4C6QG4yyeOnldRwl`): expanded Button treatments, 6 Card types, Nav link, Nav bar, expanded form fields (select/dropdown, textarea, checkbox, radio, switch/toggle at minimum), a progress/battery indicator, a time-scale toggle (segmented control), and chart/graph components (inline sparkline + larger analytics chart, using Recharts/Tremor per `.claude/CLAUDE.md`'s "lean on existing libraries" directive — do not hand-roll SVG charting).
- **D-13:** Design-system docs site is first-class — each component needs a live/interactive preview, color+type reference, and usage/implementation notes, at a "shadcn-quality" visual bar. Use `/emil-design-vocabulary`, `/emil-ui-polish`, `/emil-animations` skills during the docs-site build.
- **D-14:** A 4th sample page — a Home dashboard composite screen — matching Figma node `266-9257` and the provided screenshot (device header, "Infant Status" hero card, 3-column vitals row with sparklines, Instructions list, bottom nav) is required, under `src/app/design-system/*`, not a production route.
- **D-15 (LOCKED, mandatory per component):** Before writing any component code: call Figma MCP (`get_design_context`/`get_metadata`/`get_screenshot`) on the actual node for that component and extract exact spacing/radius/shadow/typography values. After building: screenshot the rendered page/component and visually compare against the Figma screenshot before marking "done." This is structural/checkable, not optional.
- **D-16:** Preliminary websearch already done (dual-axis charts convention, color convention confirmed aligned, WCAG 2.1 A/AA relevance for healthcare apps in 2026). Downstream task: deepen the component-checklist cross-reference (this document does that below) without unilaterally expanding scope.

### Claude's Discretion
- Exact `@theme` token naming — follow existing `--color-*`/`--text-*`/`--radius-*` conventions in `globals.css`.
- Exact new-component file naming/placement under `src/components/ui/`.
- Whether some Figma "card types" are compositions of `Card` + other primitives rather than genuinely distinct components — flag during planning if so.
- Chart library choice between Recharts/Tremor — pick based on which better supports sparkline + larger-chart + dual-axis needs. **This research resolves this in favor of Recharts** (see Standard Stack).

### Deferred Ideas (OUT OF SCOPE)
- Formal roadmap restructuring (D-11) — a separate artifact-level ROADMAP.md/REQUIREMENTS.md edit, not this phase's file.
- Full production Home screen (real data wiring, Supabase integration, state management) — D-14's Home screen is a static design-system proof page only.
- Composite domain screens beyond D-12's primitive set (Settings screen, TrendGraph screen) — deferred to the screen-building phase.
- A full WCAG 2.1 AA conformance audit — a lightweight pass on the new components is reasonable, a full audit is not this phase's deliverable.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSYS-01 | Tailwind v4 token-based design system (`@theme`, no `tailwind.config.js`-style config), palette distinct from original (no baby pink as brand), informed by Figma Segue 3.0 | Already satisfied by existing `globals.css` (D-03 confirms correctness) — this rework does not touch token values, only expands the component layer built on top of them. See Standard Stack / Architecture Patterns. |
| DSYS-02 | Design system validated with ≥3 sample pages exercising real component states | Already satisfied structurally by `states/`, `empty-loading/`, `nested/` — this rework adds a 4th (`home-proof`, D-14) and requires all four to actually *look* production-quality, not just exist. See Common Pitfalls (docs/visual quality) and Code Examples. |
| DSYS-03 | Design system supports both caregiver (full detail) and parent (abstracted) visual language from one shared token set | No new token work needed — the same semantic layer (`--color-safe/-caution/-critical`, `--radius-*`, `--text-*`) already serves both; this rework's expanded component set (cards, charts, nav) is what Phase 7 will apply differently per audience. Flagged as already-addressed; nothing new to research here beyond confirming no audience-specific tokens sneak into `@theme`. |
</phase_requirements>

## Summary

This is a rework, not a new phase: the token layer (`globals.css`) is correct and untouched, but the component layer needs a large expansion (4 → ~20 components/patterns) and a visual-quality rebuild, plus a genuinely good docs site and a Home-screen proof-of-concept page. Three concrete, verified findings should directly shape the plan:

1. **The AGENTS.md directive to pass `-b radix` on every `add`/`init` call is factually wrong for `add` in the installed CLI (shadcn `4.21.0`).** Only `init` has a `-b/--base` flag; `add` has no such flag and — verified live via `--dry-run` — already resolves every primitive-backed component (`select`, `checkbox`, `switch`, etc.) to the unified `radix-ui` package, matching the project's D-07 intent with zero flags needed. This matches the existing STATE.md decision log entry from Phase 06-01 execution. The planner should tell the executor: use `npx shadcn add <name>` with no `-b` flag; reserve `-b radix` for any future `npx shadcn init` re-run only, and treat AGENTS.md's blanket claim as partially superseded by this verified finding (still correct for `init`, wrong for `add`).
2. **`npx shadcn add chart` silently overwrites `src/components/ui/card.tsx`** with shadcn's stock, unstyled Card (`bg-card`, `text-card-foreground`, `border`, `text-muted-foreground` — none of which exist in this project's semantic token layer) — verified live via `--diff`. Any plan that installs the chart component must NOT run `add chart` directly against the already-rebuilt `card.tsx`; it must either run it in a scratch location and hand-copy only `chart.tsx`, or run `add chart --diff`/`--view chart.tsx` first and manually apply only the new file, preserving the existing restyled Card.
3. **Recharts, via shadcn's own official `chart` primitive, is the correct chart choice** over Tremor — it is what the `shadcn add chart` command itself installs (verified live), is far more actively maintained/downloaded than `@tremor/react` in its classic npm-installable form, supports the sparkline/larger-chart/dual-axis needs natively via Recharts' composable `<YAxis yAxisId>` API, and integrates directly with this project's CSS-variable token layer (`ChartConfig` colors reference `var(--color-*)`-style tokens the same way the rest of the system already does).

**Primary recommendation:** Keep the token layer frozen; expand the component layer using shadcn's `add` command (no `-b` flag) for every Radix-backed primitive, hand-roll only the genuinely bespoke pieces (Badge-style multi-modal status, the battery/progress indicator, the vitals sparkline wrapper around Recharts), install charts via shadcn's `chart` primitive with the Card-overwrite guarded against, and treat every new component's Figma extraction + screenshot diff (D-15) as a mandatory, separately-verifiable task rather than a one-time discussion step.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Design tokens (`@theme`) | Browser / Client (CSS delivered as static asset) | — | Tailwind v4 compiles `@theme` to real CSS custom properties at build time; no server logic involved. |
| Component primitives (Button/Card/Badge/Input/Select/etc.) | Browser / Client (interactive) + Frontend Server (SSR shell) | — | Most are server-renderable (no `useState`) but a few (Select, Switch, Checkbox, RadioGroup, Toggle, Dialog-adjacent) require Radix's client-side state and must cross the `'use client'` boundary; Card/Badge/Input stay server-renderable. |
| Chart/sparkline components | Browser / Client | — | Recharts renders to SVG using browser measurement (`ResponsiveContainer`) and requires `'use client'`; verified via shadcn's own chart docs. |
| Nav bar / nav link | Frontend Server (SSR) + Browser (active-state highlighting) | — | Structure and links render server-side; "active" highlighting for the current route needs client-side `usePathname()` or is passed as a prop from a Server Component parent — no data fetching involved. |
| Docs site (`/design-system/docs/*`) | Frontend Server (SSR, mostly static content) | Browser (interactive live previews) | Reads `globals.css`/`.DESIGN.md` at request time via `readFileSync` (already the pattern in this repo) — stays a Server Component for the content, with individual live-preview islands as Client Components. |
| Home dashboard proof page | Frontend Server (SSR) + Browser (sparklines/toggle interactivity) | — | Static/mock data composed server-side; only the chart/toggle sub-pieces need `'use client'`. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `recharts` | `3.10.1` current on npm; shadcn's `chart` registry entry currently pins `3.8.0` — both installable, use whichever `add chart` resolves at install time [VERIFIED: npm view] | Chart primitives (Line/Bar/Area/ComposedChart), inline sparklines, dual-axis analytics chart | Officially the library shadcn's own `chart` component wraps; largest ecosystem (~65.8M weekly downloads verified via package-legitimacy check), actively maintained (published within the last 3 months), first-class dual-axis support via composable `YAxis`/`yAxisId` |
| `radix-ui` | `^1.6.7` (already installed) | Underlying primitive behavior for every new interactive component (Select, Checkbox, RadioGroup, Switch, Tabs/Toggle-Group, Tooltip, Dialog if ever needed) | Already the project's chosen primitive layer (D-07); `shadcn add` already resolves to this unified package with zero extra flags — verified live |
| `class-variance-authority` | `^0.7.1` (already installed) | Finite typed CVA variant unions for every new component, matching the existing Button/Badge pattern | Already the project's variant-authoring pattern (D-06); no reason to introduce a second variant library |
| `cn` (github.com/shadcn-ui/cn) | `^0.4.0` (already installed) | className-merge helper | Already installed and human-approved (STATE.md: "approved live at the Task 1 checkpoint after human npmjs.com review"). **Not** `clsx`+`tailwind-merge` — verify current API against `node_modules/cn`'s shipped types before writing new component code that calls `cn()`, per AGENTS.md; do not assume clsx-identical behavior. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | pulled in transitively by `shadcn add chart` [VERIFIED: shadcn CLI `--diff` output] | Declared as a dependency of the chart registry entry | **Not actually imported anywhere inside the generated `chart.tsx` file** (verified by grepping the CLI's rendered output) — it lands in `package.json` as an unused transitive dependency of the chart install, not a replacement for the project's custom icon set (D-09 explicitly rejected `lucide-react` as the icon system in `06-UI-SPEC.md`). Flag as `[SUS]` per the Package Legitimacy Audit below (verdict is a false-positive "too-new" signal from a recent point-release, not real package immaturity — 118M+ weekly downloads) and gate its install behind a `checkpoint:human-verify`, but do not treat it as contradicting D-09 since nothing in the new component imports from it. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | `@tremor/react` (classic npm package, still on npm at `3.18.7`, not deprecated) | Tremor is itself built on top of Recharts and is a higher-level, more opinionated dashboard-widget layer — heavier bundle, less granular control over the exact sparkline-inside-a-stat-card and dual-axis layouts D-12 needs. Tremor's project has been visibly shifting toward "Tremor Raw" (a copy-paste, non-npm-installable pattern similar to shadcn itself) rather than continued investment in the classic installable package — a less certain long-term bet than going directly to the library shadcn's own CLI already wires up. |
| Hand-rolled progress/battery indicator | shadcn's `progress` primitive (Radix `Progress`) as the base, restyled | A raw `<progress>` element or a fully custom SVG ring would duplicate accessibility work (`role="progressbar"`, `aria-valuenow`) Radix's primitive already provides — restyle `progress.tsx`'s CVA classes to match the Figma battery/level visual rather than hand-rolling from a bare div. |
| Hand-rolled segmented control (time-scale toggle) | shadcn's `toggle-group` (single-selection mode, Radix `ToggleGroup`) | `toggle-group` in `type="single"` mode is exactly a segmented control (one active button among siblings) — confirmed via live `--dry-run` (installs both `toggle.tsx` and `toggle-group.tsx`). No need for a bespoke tab-like component. |

**Installation:**
```bash
# Existing components — already installed, do not re-run unless intentionally overwriting:
# button, card, badge (hand-authored, not shadcn-sourced), input

# New primitive-backed components (no -b flag on `add` — verified: add has no --base option
# in shadcn CLI 4.21.0, only `init` does; add already resolves to radix-ui with zero flags):
npx shadcn add select textarea checkbox radio-group switch progress tabs toggle-group separator tooltip

# Chart — DO NOT run this against the live repo without first previewing the Card overwrite:
npx shadcn add chart --diff        # inspect the card.tsx diff first
npx shadcn add chart --view src/components/ui/chart.tsx   # then hand-copy chart.tsx only,
                                                            # OR run `add chart -o` into a scratch
                                                            # dir and merge manually, preserving
                                                            # the existing restyled card.tsx
```

**Version verification:** Verified live against the installed CLI (`npx shadcn --version` → `4.21.0`) and via `npx shadcn add <name> --dry-run` for every component name listed above — all resolved with valid file lists and dependencies as of 2026-09-27. `recharts` version verified via `npm view recharts version` → `3.10.1` (registry latest); shadcn's own `chart` registry entry currently pins `recharts@3.8.0` in its dependency line — either is compatible with React 19 per Recharts' own `peerDependencies` (`^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`, verified via `npm view recharts peerDependencies`).

## Package Legitimacy Audit

| Package | Registry | Age/Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-------------|---------|-------------|
| `recharts` | npm | 65.8M/wk, published within last ~2 months | github.com/recharts/recharts | OK | Approved |
| `@tremor/react` | npm | 456K/wk, not deprecated | github.com/tremorlabs/tremor-npm | OK | Approved as documented alternative only — not the primary recommendation (see Alternatives Considered) |
| `lucide-react` | npm | 119M/wk | github.com/lucide-icons/lucide | SUS (`too-new` heuristic — false positive on a recent point-release of a 5+-year-old, 119M/wk package) | Flagged — transitive-only via `shadcn add chart`, not directly imported; planner should add a `checkpoint:human-verify` before accepting it into `package.json`, or strip it post-install if the executor confirms it's genuinely unused |
| `radix-ui` | npm | 15.6M/wk | github.com/radix-ui/primitives | OK | Approved — already installed |
| `class-variance-authority` | npm | 74.3M/wk | github.com/joe-bell/cva | OK | Approved — already installed |
| `cn` | npm | 5.5M/wk (`too-new` heuristic flagged, but already human-approved per STATE.md Phase 06 decision log) | github.com/shadcn-ui/cn | SUS (heuristic) → treated as pre-approved | Already installed and reviewed live by the user at a Task 1 checkpoint; no new checkpoint needed |
| `tw-animate-css` | npm | 45.1M/wk | github.com/Wombosvideo/tw-animate-css | OK | Approved — already installed |

**Packages removed due to `[SLOP]` verdict:** none.
**Packages flagged as suspicious `[SUS]`:** `lucide-react` (checkpoint recommended before accepting into `package.json`); `cn` (already resolved/approved in a prior phase checkpoint, no new action needed).

## Architecture Patterns

### System Architecture Diagram

```
Figma (Segue 3.0, file 4J2wGl4C6QG4yyeOnldRwl)
   │  get_metadata / get_design_context / get_screenshot  (per-node, per D-15)
   ▼
Executor extracts spacing/radius/shadow/type values ──► src/components/ui/<name>.tsx
   │                                                          │ (CVA variants, `cn()`)
   │                                                          ▼
   │                                                   src/components/ui/<name>.DESIGN.md
   │                                                          │ (usage rules, correct/incorrect)
   ▼                                                          ▼
Screenshot rendered component ──compare──► Figma screenshot   Docs site reads .DESIGN.md +
   (D-15 step 2, per component)                                renders live interactive preview
                                                                       │
                                                                       ▼
                                                    src/app/design-system/docs/<component>/page.tsx
                                                    src/app/design-system/{states,empty-loading,
                                                      nested,home-proof}/page.tsx  (D-14: new 4th page)
                                                                       │
                                                    Home-proof page composes: nav bar + hero card +
                                                    3× vital-stat card (each embeds a Recharts
                                                    sparkline, 'use client' boundary at the chart) +
                                                    instructions list — proving the full component
                                                    set assembles into a real screen before Phase 7.
```

### Recommended Project Structure
```
src/components/ui/
├── button.tsx / button.DESIGN.md          # existing — visual rebuild only, keep variant API
├── card.tsx / card.DESIGN.md              # existing — visual rebuild + reconcile against 6 Figma card types
├── badge.tsx / badge.DESIGN.md            # existing — keep multi-modal (icon+label+color) contract
├── input.tsx / input.DESIGN.md            # existing — visual rebuild only
├── select.tsx / select.DESIGN.md          # new — shadcn `add select`, restyle
├── textarea.tsx / textarea.DESIGN.md      # new — shadcn `add textarea`, restyle
├── checkbox.tsx / checkbox.DESIGN.md      # new — shadcn `add checkbox`, restyle
├── radio-group.tsx / radio-group.DESIGN.md# new — shadcn `add radio-group`, restyle
├── switch.tsx / switch.DESIGN.md          # new — shadcn `add switch`, restyle
├── progress.tsx / progress.DESIGN.md      # new — shadcn `add progress`, restyle as battery/level indicator
├── toggle-group.tsx (+ toggle.tsx) / toggle-group.DESIGN.md  # new — segmented control / time-scale toggle
├── chart.tsx / chart.DESIGN.md            # new — via `add chart`, Card-overwrite guarded (see Pitfalls)
├── sparkline.tsx / sparkline.DESIGN.md    # new — thin wrapper around chart.tsx primitives, no axes/legend chrome, for vitals stat cards
├── nav-link.tsx / nav-link.DESIGN.md      # new — hand-authored (no shadcn equivalent), Figma node 279-220
└── nav-bar.tsx / nav-bar.DESIGN.md        # new — hand-authored, composes nav-link, Figma node 279-320

src/app/design-system/
├── docs/                     # existing — needs D-13 quality rebuild (see Pitfalls: current page is one giant page dumping raw markdown)
├── states/                   # existing — needs visual-quality pass with expanded component set
├── empty-loading/            # existing — same
├── nested/                   # existing — same
└── home-proof/                # new (D-14) — composite Home dashboard screen
```

### Pattern 1: Recharts sparkline inside a stat card, isolated client boundary
**What:** The vitals stat card (Pulse/Temp/Activity) is a Server Component; only the sparkline inside it needs `'use client'`.
**When to use:** Any card embedding a small trend chart with no axes/legend/tooltip chrome.
**Example:**
```tsx
// Source: shadcn chart docs (ui.shadcn.com/docs/components/chart) + Recharts ResponsiveContainer pattern
// src/components/ui/sparkline.tsx
"use client"
import { LineChart, Line, ResponsiveContainer } from "recharts"

export function Sparkline({ data, color = "var(--color-safe)" }: { data: { value: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```
```tsx
// src/components/ui/vital-stat-card.tsx — Server Component, imports the Client Component
import { Sparkline } from "@/components/ui/sparkline"
export function VitalStatCard({ label, value, trend }: { label: string; value: string; trend: { value: number }[] }) {
  return (
    <div className="rounded-card-sm bg-surface p-4">
      <p className="text-label text-text-secondary">{label}</p>
      <p className="text-heading font-semibold text-text">{value}</p>
      <Sparkline data={trend} />
    </div>
  )
}
```

### Pattern 2: Dual-axis analytics chart
**What:** One scale for pulse/temp-like series, a second tighter scale for an O2-sat-like series — per D-16's vitals-dashboard convention finding.
**When to use:** The larger analytics chart component (not the inline sparkline).
**Example:**
```tsx
// Source: Recharts composable YAxis/yAxisId pattern — CITED: recharts.org docs + GitHub issue #2538/#174 community confirmation
"use client"
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

export function DualAxisVitalsChart({ data }: { data: Array<{ time: string; pulse: number; spo2: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
        <XAxis dataKey="time" stroke="var(--color-text-muted)" />
        <YAxis yAxisId="pulse" domain={[60, 180]} stroke="var(--color-brand)" />
        <YAxis yAxisId="spo2" orientation="right" domain={[90, 100]} stroke="var(--color-safe)" />
        <Line yAxisId="pulse" dataKey="pulse" stroke="var(--color-brand)" dot={false} />
        <Line yAxisId="spo2" dataKey="spo2" stroke="var(--color-safe)" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
```
**Important:** once any `YAxis` declares an explicit `yAxisId`, every `Line`/`Bar`/`Area` in the chart must declare a matching `yAxisId` too — Recharts does not fall back to an implicit default axis once IDs are introduced [CITED: recharts.org / community-confirmed via GitHub issues #2538, #174].

### Pattern 3: Segmented control via `toggle-group`
**What:** Time-scale toggle (1D/1W/1M), matching Figma node `203-11938`.
**Example:**
```tsx
// Source: shadcn ui.shadcn.com/docs/components/toggle-group (single-selection mode)
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<ToggleGroup type="single" defaultValue="1d">
  <ToggleGroupItem value="1d">1D</ToggleGroupItem>
  <ToggleGroupItem value="1w">1W</ToggleGroupItem>
  <ToggleGroupItem value="1m">1M</ToggleGroupItem>
</ToggleGroup>
```

### Anti-Patterns to Avoid
- **Running `npx shadcn add chart` directly against the live repo without `--diff` first:** silently overwrites the already-restyled `card.tsx` with shadcn's stock, unstyled Card — verified live (see Common Pitfalls).
- **Hand-rolling SVG chart/sparkline code:** explicitly barred by `.claude/CLAUDE.md`'s "lean on existing libraries" directive and D-12's own text ("do not hand-roll SVG charting").
- **Treating every Figma "card type" node as automatically a new React component:** D-12 explicitly allows some to turn out to be compositions of `Card` + other primitives — verify per-node during planning, don't force 6 new component files if fewer genuinely distinct components are what's actually in the frames.
- **Passing `-b radix` to `shadcn add`:** the flag doesn't exist on `add` in CLI `4.21.0` and the command will error or ignore it — verified live via `--help`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Charts/sparklines | Custom SVG path-drawing from raw vitals arrays | `recharts` via shadcn's `chart` registry component | D-12 explicit directive; Recharts handles responsive sizing, tooltips, dual-axis scaling, accessibility roles that a hand-rolled SVG chart would have to reinvent |
| Select/dropdown, checkbox, radio, switch keyboard/focus behavior | Custom `<div>`-based dropdown or custom checkbox with manual `tabIndex`/`aria-*` wiring | Radix primitives via `shadcn add select/checkbox/radio-group/switch` | Radix already solves focus trapping, `aria-checked`/`aria-selected` state, keyboard nav (arrow keys in radio groups, Escape to close selects) — exactly the class of "deceptively complex" problem the shadcn+Radix pairing exists to remove |
| Progress/battery indicator accessibility | A styled `<div>` with a width percentage and no ARIA | Radix `Progress` via `shadcn add progress`, restyled | Provides `role="progressbar"`/`aria-valuenow`/`aria-valuemin`/`aria-valuemax` for free |
| Segmented control (time-scale toggle) | Custom button-group with manual "active" state management | Radix `ToggleGroup` (`type="single"`) via `shadcn add toggle-group` | Handles roving tabindex and single-selection ARIA semantics; exactly matches the segmented-control UI pattern already |

**Key insight:** every "new" interaction pattern D-12 lists already has a maintained Radix primitive behind a one-line `shadcn add` call — the only genuinely bespoke work this phase requires is the *visual restyling* (CVA classes against the token layer) and the *domain-specific composition* (Badge's multi-modal icon+label+color rule, the sparkline wrapper, nav-bar/nav-link, and the Home-proof composite page) — not new interaction-behavior code.

## Common Pitfalls

### Pitfall 1: `shadcn add chart` overwrites the rebuilt Card
**What goes wrong:** Running `npx shadcn add chart` (or any command re-adding `card`) silently overwrites `src/components/ui/card.tsx` with shadcn's stock New York-style Card (`bg-card`, `text-card-foreground`, `border`, `shadow-sm`, `text-muted-foreground` — tokens that don't exist in this project's `@theme` block), destroying all of D-15's Figma-verified restyling work.
**Why it happens:** shadcn's `chart` registry entry lists `card` as a dependency it also touches (chart examples ship inside `Card`/`CardHeader`/`CardContent` in the upstream docs), so the CLI treats `card.tsx` as a file it owns and will overwrite by default.
**How to avoid:** Always run `npx shadcn add chart --diff` first. If Card is in the diff, either (a) run the add in a scratch/throwaway directory and manually copy only `chart.tsx` into the repo, or (b) accept the overwrite and then immediately re-apply the project's semantic-token classes to the four Card subcomponents from git history — never accept the overwrite silently.
**Warning signs:** After running any `shadcn add`, always `git diff src/components/ui/card.tsx` before committing — if it shows unexpected changes to a component not explicitly targeted, the install touched more files than intended.

### Pitfall 2: AGENTS.md's `-b radix` directive doesn't apply to `add`
**What goes wrong:** An executor following AGENTS.md literally might try `npx shadcn add select -b radix` and get a CLI error (unrecognized option) or simply have the flag silently ignored, wasting a task cycle.
**Why it happens:** AGENTS.md was written from the `init` command's behavior (where `-b/--base` genuinely matters and defaults to `base` — Base UI — as of CLI 4.21.0) and over-generalized it to every shadcn invocation.
**How to avoid:** Only pass `-b radix`/`--base radix` to `npx shadcn init` (if it is ever re-run). For every `npx shadcn add <component>` call, omit the flag entirely — verified live that `add` has no such option and already resolves to `radix-ui` by default in this repo's current `components.json`/lockfile state.
**Warning signs:** A `command not found: -b` / "unknown option" style CLI error, or a flag that appears to have zero effect on the generated file's imports.

### Pitfall 3: Docs site becomes "one giant page dumping raw markdown" again
**What goes wrong:** The rejected `docs/page.tsx` renders all four `.DESIGN.md` files verbatim inside a `<pre>` tag as unrendered plain text (confirmed by reading the current file) — this is very likely the literal thing the user meant by "a single page bunch of crap."
**Why it happens:** `.DESIGN.md` content was piped through `readFileSync` and dropped into `<pre className="whitespace-pre-wrap">` without any markdown rendering, without per-component routing, and without a live-interactive-preview affordance beyond a few static variant renders.
**How to avoid:** Per D-13, each component needs its own dedicated docs route (or clearly delineated section with real navigation, not just anchor links on one page) with: a rendered/styled presentation of the DESIGN.md content (not raw `<pre>` text), a live interactive preview users can actually toggle/interact with (not just a static grid of variant examples), and clear correct/incorrect usage callouts. Model the structure after ui.shadcn.com's own per-component doc pages (title, description, live preview tab, code tab, props/variant table).
**Warning signs:** Any new docs page that pipes a `.DESIGN.md` file straight into a `<pre>` block is repeating the exact rejected pattern.

### Pitfall 4: Figma links alone don't produce fidelity — reiterating D-15 as an execution risk, not just a policy
**What goes wrong:** Per CONTEXT.md's own history, giving Figma links to a downstream agent "did nothing" in previous attempts — components were built without ever actually inspecting the node's real spacing/radius/shadow/type values, producing visually-approximate-by-eye results the user rejected.
**Why it happens:** Without a structural requirement, "check the Figma" is easy to skip or do superficially (glance at the design, not extract exact values).
**How to avoid:** Every component-building task in the plan should have two explicit, separately-checkable steps: (1) a `get_metadata`/`get_design_context`/`get_screenshot` call against the specific node ID before writing code, with the extracted values recorded (even briefly) in the task's notes or the component's DESIGN.md; (2) a screenshot-diff step after building, comparing the rendered output against the Figma screenshot, before the task is marked complete.
**Warning signs:** A component-building task with no Figma-node-ID reference in its own instructions, or a "done" component whose DESIGN.md doesn't mention which Figma node it was built from.

### Pitfall 5: Introducing a second icon system by accident
**What goes wrong:** The Home screen Figma node uses icon names from `fluent:`, `lucide-lab:`, and `hugeicons:` icon sets that don't map 1:1 onto the existing `frontend-design/design-system/icons.js` 40+-icon set — an executor might reach for `lucide-react` (which becomes available transitively once `chart` is added) as a shortcut, silently introducing a second icon system alongside the custom one D-09 already chose.
**Why it happens:** `lucide-react` will already be present in `node_modules`/`package.json` once the chart component is added (see Standard Stack), making it a one-import-away temptation.
**How to avoid:** For any icon referenced by the Figma Home screen that isn't already in `icons.js`, either add a matching custom SVG to `icons.js` (preferred, keeps one icon system) or explicitly flag the gap for the user/planner rather than quietly importing from `lucide-react`.
**Warning signs:** Any new component importing from `"lucide-react"` directly, when `icons.js`'s `<Icon name="..."/>` pattern is the established convention.

## Code Examples

See Architecture Patterns above (Sparkline, Dual-Axis Chart, Toggle-Group) for the primary reusable snippets. Additional reference:

### shadcn ChartContainer + token wiring
```tsx
// Source: ui.shadcn.com/docs/components/chart (fetched 2026-09-27) — ChartConfig colors
// reference CSS custom properties the same way this project's existing components do.
const chartConfig = {
  pulse: { label: "Pulse", color: "var(--color-brand)" },
  spo2: { label: "SpO2", color: "var(--color-safe)" },
} satisfies ChartConfig
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `shadcn-ui` CLI defaulting to Radix primitives | shadcn CLI 4.21.0 defaults `init` to Base UI; `add` has no base-library flag at all and resolves per-project via `components.json`/existing deps | Some point before 4.21.0 (exact version not verified this session) | AGENTS.md's blanket "-b radix on every add/init" guidance is half-correct — right for `init`, inapplicable to `add`. See Pitfall 2. |
| `clsx` + `tailwind-merge` combo | `cn` npm package (github.com/shadcn-ui/cn) | Ownership transferred to shadcn-ui org starting v0.2.0 (per AGENTS.md, Sept 2026) | Already reflected in this repo (`package.json` has `cn` not `clsx`/`tailwind-merge`) — no action needed, just don't assume clsx-identical API when writing new component code. |
| Tremor as the default "shadcn-adjacent" chart library | shadcn ships its own official `chart` component directly on Recharts | Ongoing — Tremor has been shifting toward "Tremor Raw" (copy-paste, non-npm) | Recharts-via-shadcn is now the more integrated, more current choice for this stack. |

**Deprecated/outdated:**
- The original 06-UI-SPEC.md's Component Inventory table (written before Phase 6 first executed) is stale — it predates shadcn even being installed. Do not treat it as current; this RESEARCH.md and the live CLI probes above are the current source of truth for CLI behavior.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The 14 Figma node IDs listed in CONTEXT.md's canonical_refs (card types, button types, nav, graphs, toggle) each represent a genuinely distinct, reusable component rather than a one-off composition — this research did not independently re-verify each node via Figma MCP (no Figma MCP tool was available in this research session; CONTEXT.md's own D-15 spot-check of node `266:9257` is the only live-verified node this pass could rely on) | Standard Stack / Recommended Project Structure | If some nodes turn out to be near-duplicates or compositions, the planner may create more component files than are actually needed — mitigated by D-12's own explicit discretion clause allowing this to be flagged during planning |
| A2 | The icon names quoted in CONTEXT.md (`fluent:smartwatch-dot-20-regular`, `lucide-lab:bottle-baby`, `hugeicons:baby-02`) accurately describe what's actually used in the Figma file — taken from CONTEXT.md verbatim, not independently re-confirmed against Figma this session | Common Pitfalls (Pitfall 5) | If the actual icon names differ, the "gap in icons.js" analysis may target the wrong icons; low risk since the mitigation (add missing icons to icons.js rather than importing lucide-react) is robust to exactly which icons are missing |
| A3 | shadcn's `chart` registry entry's pinned `recharts@3.8.0` (vs. npm's current `3.10.1`) will not introduce a breaking API difference for the dual-axis/sparkline patterns shown in Code Examples | Standard Stack | Low risk — `YAxis`/`yAxisId`/`ResponsiveContainer` are long-stable Recharts APIs; if the registry's pin resolves to an older minor version, the shown patterns still apply |

**If this table is empty:** N/A — see rows above; all other CLI/package claims in this document were verified live this session via `npx shadcn --version`, `--help`, `--dry-run`, `--diff`, `npm view`, and the package-legitimacy seam.

## Open Questions

1. **Which of the 6 Figma "card type" nodes are genuinely distinct components vs. compositions of the existing `Card` + new primitives?**
   - What we know: CONTEXT.md's own spot-check of the Home screen node already identifies at least 3 distinct patterns (status hero card, 3-column vital stat card, instruction-row card) among the 6 listed nodes.
   - What's unclear: Whether the remaining 3 card-type nodes (`203-13605`, `203-13559`, `203-11669`) are additional genuinely distinct types or variations reachable via existing Card composition.
   - Recommendation: The planner should schedule a Figma-inspection task per remaining card node before committing to exactly 6 new Card-family component files; D-12 explicitly permits collapsing this number.

2. **Exact prop/variant names for the new form fields and progress indicator.**
   - What we know: D-12 lists the components (select, textarea, checkbox, radio, switch, progress) but explicitly defers exact naming to Figma-informed discretion, not the user (who couldn't articulate exact names).
   - What's unclear: Whether the battery/progress indicator needs a distinct "battery" visual treatment (segmented/notched, matching a physical battery icon) vs. a generic rounded progress bar/ring — this depends on what the Home screen's battery icon area actually looks like in Figma.
   - Recommendation: Treat as a D-15-covered per-component Figma extraction task; name the component `progress` (shadcn-aligned) with a `variant="battery" | "bar" | "ring"` (or similar) CVA axis if the Figma frame shows more than one visual treatment is actually needed.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| shadcn CLI (via `npx`) | All new component scaffolding | ✓ | `4.21.0` (verified via `npx shadcn --version`) | — |
| `recharts` (npm) | Chart/sparkline components | ✓ (installable, not yet in `package.json`) | `3.10.1` latest / `3.8.0` shadcn-pinned | — |
| Figma MCP tools (`get_design_context`/`get_metadata`/`get_screenshot`) | D-15's per-component fidelity verification | Not available to this research agent's toolset this session — no `mcp__figma__*` tool was exposed to this agent, though CONTEXT.md confirms it was available and spot-checked during the prior discuss-phase session | — | The executor/planner session (which does have Figma MCP tool access per the project's tool configuration) must perform D-15's extraction step; this research could not independently re-verify additional nodes beyond what CONTEXT.md already recorded |
| Node.js / npm | Package installs, CLI dry-runs | ✓ | Node observed working this session | — |

**Missing dependencies with no fallback:** none — Figma MCP unavailability is scoped to this research session's toolset only, not a project-wide gap; the execution environment for planning/building does have it per D-15's own successful spot-check.

**Missing dependencies with fallback:** none beyond the above.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.11 (`vitest.config.ts`, `environment: "node"`) |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- tests/<file>.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSYS-01 | `@theme` token set compiles cleanly in a real `next build` | build/smoke | `npm run build` | ✅ (existing `package.json` script) |
| DSYS-02 | ≥3 (now 4) sample pages render without runtime error and exercise real component states | smoke/visual | `npm run build` (compile check) + manual/visual UAT (component rendering is inherently a visual-quality judgment, not unit-testable) | ❌ Wave 0 — no automated visual-regression tooling exists in this repo; rely on the D-15 screenshot-diff mechanism as the closest available automated-adjacent check |
| DSYS-03 | Same token set demonstrably reused across caregiver + parent visual language | manual/structural review | grep-based check: no new `--color-*`/`--radius-*` token is added outside the existing semantic layer during this phase | ❌ Wave 0 — no existing automated check; add a lightweight `grep -c "^\s*--color-" src/app/globals.css` before/after comparison as a plan verification step if desired |

### Sampling Rate
- **Per task commit:** `npm run build` (Next.js/Turbopack compiles the `@theme` block and every new route/component — this is the primary regression signal available in this repo, matching how Phase 06-01 through 06-05 already verified DSYS-01)
- **Per wave merge:** `npm run build` + manual visual check of the affected `/design-system/*` route
- **Phase gate:** Full `npm run build` green, plus a full manual walkthrough of all 4 sample pages and the docs site before `/gsd-verify-work`, given the phase's deliverable is fundamentally visual/UX quality that automated tests cannot capture

### Wave 0 Gaps
- No visual-regression testing tool exists in this repo (no Playwright/Chromatic/etc.) — the D-15 Figma-screenshot-diff mechanism is the closest available substitute and should be treated as this phase's primary "test" for visual fidelity, performed manually per component.
- No dedicated test file conventions exist for React component rendering (`tests/*.test.ts` currently covers only backend/API logic per `.planning/codebase/TESTING.md`) — introducing component-level Vitest+Testing Library tests is possible but not currently established; recommend NOT introducing a new test framework mid-rework unless the user asks, since the phase's actual risk (visual quality) isn't well-served by DOM-assertion tests anyway.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Design-system phase has no auth surface |
| V3 Session Management | No | N/A |
| V4 Access Control | No | N/A |
| V5 Input Validation | Marginal | New form-field components (select/textarea/checkbox/radio/switch) are presentational primitives only this phase — no submission/validation logic is in scope; any real validation (zod schemas) is Phase 7's job when these fields get wired to real forms |
| V6 Cryptography | No | N/A |

### Known Threat Patterns for this stack
None specific to this phase — it produces no new data-handling surface (no new API routes, no new persisted data). The one general web-hygiene note: Recharts' `ResponsiveContainer`/SVG rendering does not execute arbitrary user-controlled markup in this phase's usage (all chart data is component props from mock/local data, not user input), so no XSS-relevant pattern applies yet.

## Sources

### Primary (HIGH confidence — live-verified this session)
- `npx shadcn --version` / `--help` / `add --help` / `init --help` — CLI 4.21.0 flag surface, verified live
- `npx shadcn add <component> --dry-run` for: select, textarea, checkbox, radio-group, switch, progress, tabs, dropdown-menu, tooltip, dialog, sonner, skeleton, avatar, navigation-menu, separator, toggle, toggle-group, chart — verified live, 2026-09-27
- `npx shadcn add chart --diff` — verified the Card-overwrite finding live, 2026-09-27
- `npx shadcn search @shadcn` — full 471-item registry list, verified live, 2026-09-27
- `npm view recharts version` / `peerDependencies` / `dist.unpackedSize`; `npm view @tremor/react version`; `npm view lucide-react`, `radix-ui`, `class-variance-authority`, `tw-animate-css`, `cn` — verified live via the package-legitimacy seam, 2026-09-27
- `node_modules/next/dist/docs/01-app/02-guides/server-and-client-boundary.md` — read directly this session, current-repo Next.js 16 docs
- Direct reads of `src/app/globals.css`, `src/components/ui/{button,card,badge,input}.tsx`, `button.DESIGN.md`, `src/app/design-system/docs/page.tsx`, `src/components/page-shell.tsx`, `frontend-design/design-system/icons.js` — this session

### Secondary (MEDIUM confidence)
- `ui.shadcn.com/docs/components/chart` (fetched via WebFetch this session) — ChartContainer/ChartConfig API, `'use client'` requirement confirmation
- Recharts community sources (GitHub issues #2538, #174) — `yAxisId` dual-axis pattern confirmation via WebSearch
- CONTEXT.md's own D-16 preliminary websearch citations (aufaitux.com, fuselabcreative.com, eleken.co) — carried forward, not independently re-verified this session

### Tertiary (LOW confidence)
- None retained — all WebSearch-only findings without an authoritative cross-check were either dropped or explicitly logged in the Assumptions Log above.

## Metadata

**Confidence breakdown:**
- Standard stack (shadcn CLI behavior, Recharts choice): HIGH — every claim was verified live against the installed CLI/registry/npm this session, not taken from training data
- Architecture (RSC/client boundary, chart composition patterns): HIGH for the Next.js boundary rules (read directly from the installed `next` package's own docs), MEDIUM for the specific dual-axis code pattern (community-sourced, not an official Recharts doc page — the direct docs URL 404'd)
- Pitfalls (Card overwrite, docs-page quality, `-b radix` scope): HIGH — each is a direct, reproduced finding from this session's own tool calls, not inference
- Figma node inventory / component-boundary judgment calls: LOW-MEDIUM — this research could not call Figma MCP tools directly (not exposed to this agent); relies on CONTEXT.md's own prior spot-check and naming conventions

**Research date:** 2026-09-27
**Valid until:** ~14 days (shadcn CLI and Recharts version pins move quickly; re-verify `npx shadcn --version` and `npm view recharts version` before executing if more than 2 weeks elapse)
