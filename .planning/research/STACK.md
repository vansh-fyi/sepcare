# Stack Research

**Domain:** Frontend rebuild for a Next.js 16 / React 19 / Supabase healthcare wearable dashboard (hackathon timeline, ~2 days)
**Researched:** 2026-09-25
**Confidence:** HIGH (versions verified directly against the npm registry) / MEDIUM (integration guidance from web search, cross-checked across multiple sources)

## Existing Foundation (already in `package.json` — do not re-add)

| Technology | Installed Version | Notes |
|------------|--------------------|-------|
| next | 16.3.5 | App Router, React Server Components |
| react / react-dom | 19.2.8 | React 19 — matters for peer-dep checks below |
| @supabase/supabase-js | ^2.116.0 | Already used server-side for ingest/scoring; same client works for Realtime in the browser |
| zod | ^4.6.2 | Validation, already in use |
| typescript | ^5 | |

All version recommendations below were checked against React 19.2.8 and this Tailwind/Next combination specifically — not generic "latest" advice.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `tailwindcss` | **4.3.3** | Utility CSS engine | v4 is CSS-first: config lives in your CSS file via `@theme` instead of `tailwind.config.js`. No `tailwind.config.ts` to maintain, content paths are auto-detected, and the Oxide (Rust) engine gives ~8x faster full builds / ~40x faster incremental rebuilds than v3 — directly relevant to a 2-day iteration loop. |
| `@tailwindcss/postcss` | **4.3.3** | Next.js integration for Tailwind v4 | Next.js App Router uses the PostCSS pipeline (not Vite), so this is the correct v4 plugin — not `@tailwindcss/vite`. Must match the `tailwindcss` version exactly (both resolve to 4.3.3 as of this research; they're released in lockstep). |
| `shadcn` | **4.21.0** | Component scaffolding CLI (generates Radix-based components into your repo, not an installed UI library) | The old `shadcn-ui` npm package is **deprecated** (frozen at 0.9.5) — the project renamed to plain `shadcn`. Current `shadcn@latest` now generates Tailwind v4 + React 19 output **by default**; the `shadcn@canary` flag that older tutorials mention is no longer required for new projects (canary was the v4/React 19 track before it was promoted to stable). Components are copied into your codebase as editable `.tsx` files, not pulled in as an opaque dependency — good for a fast, judge-facing prototype where you'll want to hand-tune things. |
| `motion` | **13.4.3** | Animation ("Framer Motion" renamed) | Framer Motion became an independent project and renamed its npm package to `motion` in 2025; import path is `motion/react` (or `motion/react-client` when a component needs to cross a Server Component boundary in the App Router). The old `framer-motion` package still publishes the same version (13.4.3, same repo) purely as a compatibility alias — **use `motion` directly**, don't install both. Peer deps (`react ^18 \|\| ^19`) are satisfied by React 19.2.8. |
| `recharts` | **3.10.1** | Vitals trend charts (HR, temp, activity/SpO2 over time) | SVG-based, declarative, composable React chart API — lowest setup friction of the three real candidates for a 2-day build. Peer deps explicitly list `react ^19.0.0`, `react-dom ^19.0.0`, `react-is ^19.0.0` — confirmed React 19 compatible. ~150kB. See "Charting library decision" below for why this beats Tremor/Nivo here. |

### Supporting Libraries (shadcn's utility trio + icons + animation-keyframe shim)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `tailwind-merge` | 3.7.0 | Resolves conflicting Tailwind classes when composing `className` props | Used inside the generated `cn()` helper in `lib/utils.ts` — required by every shadcn component. |
| `class-variance-authority` | 0.7.1 | Defines component style variants (`variant="default" \| "destructive"`, etc.) | Used by shadcn components with multiple visual states (Button, Badge, Alert) — you'll want this for the risk-status Badge (green/amber/red). |
| `clsx` | 2.1.1 | Conditional class name composition | Dependency of `cn()`; also handy directly for conditional nav/view state classes (caregiver vs parent view). |
| `lucide-react` | 1.48.0 | Icon set | shadcn's default icon library; consistent stroke-width icon set, tree-shakeable. |
| `tw-animate-css` | 1.4.0 | Tailwind v4-compatible animation utility classes (`animate-in`, `animate-out`, etc.) | **Required, not optional**, if you use any shadcn component with enter/exit animation (Dialog, Sheet/bottom-nav drawer, Dropdown, Toast). The old `tailwindcss-animate` package is a v3 plugin that reads `tailwind.config.js` — it does **not** work under v4's CSS-first config. `tw-animate-css` is the v4-native drop-in replacement; import it once in your global CSS (`@import "tw-animate-css";`) alongside `@import "tailwindcss";`. |
| `next-themes` | 0.4.6 | Light/dark mode (or caregiver/parent theme variant) toggle | Optional — only add if the design system needs a runtime-switchable theme (e.g. toggling caregiver-detail vs parent-abstracted density via a data attribute). Peer deps cover React 16–19+RC, confirmed compatible. |
| Radix primitives (`@radix-ui/react-*`, e.g. `react-slot` 1.3.3) | latest per-component | Unstyled, accessible primitives underneath shadcn components | **Do not install these directly.** The `shadcn add <component>` CLI installs the exact Radix primitive each component needs as a transitive dependency. Installing Radix packages manually risks version drift from what the generated component code expects. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `shadcn` CLI (`npx shadcn@latest init`, `npx shadcn@latest add <component>`) | Scaffolds `components.json`, `lib/utils.ts`, and individual component files | Run `init` once per app; it will detect Tailwind v4 automatically from `tailwindcss` in `package.json` and skip generating a `tailwind.config.ts`. If `init` fails to validate the Tailwind install (a known transient issue right after upgrading an existing project to v4), it's a detection bug, not a real incompatibility — worst case, manually create `components.json` from the docs and run `add` directly. |

## Installation

```bash
# Core styling + component foundation
npm install tailwindcss @tailwindcss/postcss tw-animate-css
npx shadcn@latest init
# (init will prompt for base color / css variables — pick CSS variables mode so
#  your Figma-derived @theme tokens map cleanly to shadcn's --background/--primary/etc.)

# Then, per component you actually need:
npx shadcn@latest add button badge card sheet tabs dialog tooltip skeleton
# shadcn pulls in the correct @radix-ui/react-* primitive for each automatically

# Animation
npm install motion

# Charts
npm install recharts

# Optional: only if a runtime theme/density toggle is needed
npm install next-themes
```

No `tailwind.config.js`/`.ts` file to create — v4 config lives in `app/globals.css` (or wherever your global stylesheet is) via `@import "tailwindcss";` + `@theme { ... }`.

## Charting Libraryenter Decision: Recharts (not Tremor, not Nivo)

| Library | Bundle | React 19 | Fit for this project |
|---------|--------|----------|----------------------|
| **Recharts 3.10.1** (recommended) | ~150kB | Confirmed via peerDependencies | Lowest setup friction, most examples/community answers for "line chart with time axis + threshold band," which is exactly the pulse/temp/activity trend + risk-threshold visualization this project needs. Composable API (`<LineChart><Line/><ReferenceArea/></LineChart>`) makes it straightforward to overlay green/amber/red threshold bands on a vitals trend. |
| Tremor | ~200kB | Not independently verified this research pass | Pre-styled to look like shadcn/Tailwind dashboards out of the box — tempting, but it's a bigger opinionated dependency to learn under a 2-day deadline, and its chart primitives are less composable for custom threshold-band overlays than Recharts. Consider only if the team is already fluent in it. |
| Nivo | 500kB+ | Not independently verified this research pass | Best visual/accessibility polish, used in healthcare/government dashboards per current write-ups — but heavier bundle and steeper API for the time budget available. Overkill for a 2-day hackathon build. |

**Recommendation: Recharts.** It directly satisfies "low setup friction" from the question, has explicit React 19 peer-dep support, and its `ResponsiveContainer` + declarative components compose well with data streamed in from a Supabase Realtime hook (see pattern below) without needing imperative chart-instance management.

## Framer Motion → Motion: what changed and what to actually import

- npm package: install **`motion`**, not `framer-motion` (the latter is now a same-version alias pointing at the same repo — functionally fine but the project's own docs and new features ship under `motion` first).
- Import paths:
  - `import { motion } from "motion/react"` — for any Client Component (`"use client"` at top of file). This is what you'll use for risk-status transitions, bottom-nav interactions, card enter/exit.
  - `import { motion } from "motion/react-client"` — only needed if you must reference `motion.div` etc. from a file that is *not itself* marked `"use client"` but is rendered inside a client boundary (rare in an App Router dashboard where animated elements are typically already inside a client component).
- Peer deps (`react ^18 || ^19`) — satisfied by React 19.2.8, no compatibility flag needed.
- `AnimatePresence` for the caregiver bottom-nav sheet / parent "See All" transitions works unchanged from the old `framer-motion` API — the rename is packaging only, not an API break.

## Tailwind v4 `@theme` Pattern for This Project

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  /* Map Figma (Segue 3.0) tokens + salvaged frontend-design/tokens.css values here */
  --color-risk-green: oklch(...);
  --color-risk-amber: oklch(...);
  --color-risk-red: oklch(...);
  --font-display: "...", sans-serif;
  /* shadcn expects these CSS-variable names when initialized in "CSS variables" mode: */
  --color-background: ...;
  --color-primary: ...;
  /* etc. */
}
```

- No `content: [...]` array needed — v4 scans your project automatically.
- If any legacy plain-CSS/`tailwind.config.js` fragments survive in `frontend-design/`, they must be **translated into `@theme` tokens**, not imported as-is — v3-style config files are inert under v4 (the compatibility shim exists for gradual `@config` migration, but starting fresh here, skip it entirely per the "no legacy plain CSS" requirement in PROJECT.md).
- Use the `color` skill's OKLCH guidance when converting the Figma palette into `--color-*` tokens — keeps contrast (WCAG/APCA) correct for the green/amber/red risk indicators, which is safety-relevant here, not cosmetic.

## Supabase Realtime in Client Components: Recommended Pattern

```tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // browser client, anon key

export function useLatestReading(deviceId: string) {
  const [reading, setReading] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`readings:${deviceId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "readings", filter: `device_id=eq.${deviceId}` },
        (payload) => setReading(payload.new)
      )
      .subscribe();

    // IMPORTANT: removeChannel, not just channel.unsubscribe() — Supabase's own
    // docs/discussions recommend removeChannel(channel) as the complete cleanup;
    // unsubscribe() alone can leave the channel registered against the client.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId]);

  return reading;
}
```

- **One custom hook per concern** (`useLatestReading`, `useRiskStatus`) rather than one giant subscription component — keeps the caregiver view (full detail) and parent view (condensed) both consumable from the same hooks without duplicating subscription logic.
- Always pass a stable dependency (`deviceId`) to `useEffect` and re-subscribe on change — don't try to reuse one channel across different filters.
- Cleanup on unmount is not optional: leaving channels open degrades Realtime performance for the whole project (documented Supabase behavior), which matters if the demo runs for hours at a hackathon booth.
- The browser Supabase client (anon key, RLS-scoped) is a **different client instance** from whatever service-role client the existing `/api/ingest` routes use server-side — make sure the new client-side code path in `lib/supabase/client.ts` doesn't accidentally reuse a service-role key in a "use client" file (it would ship to the browser).

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Tailwind v4 (`tailwindcss` 4.3.3) | Tailwind v3 (`3.4.19`, tagged `v3-lts`) | Only if a hard dependency in the salvaged `frontend-design/tokens.css` or a required plugin has no v4 equivalent yet — not the case here per PROJECT.md's explicit v4 mandate. |
| `shadcn` CLI + Radix | Headless UI, Ark UI, or hand-rolled components | If the team already has a large hand-built component library — not true here; PROJECT.md explicitly says lean on shadcn/Radix instead of building from scratch. |
| Recharts | Tremor | If speed-to-shadcn-matching-aesthetic matters more than chart flexibility and the team already knows Tremor's API. |
| Recharts | Nivo | If chart visual polish/accessibility is the top priority and there's slack in the 2-day budget for a heavier API — not the case under this timeline. |
| `motion` | React Spring, GSAP | If physics-accurate spring choreography beyond Motion's spring presets is needed, or GSAP timeline sequencing for complex multi-element sequences — overkill for dashboard/card transitions here. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| `tailwindcss-animate` | v3-only plugin; reads `tailwind.config.js`, which doesn't exist/isn't read under Tailwind v4's CSS-first config — it will silently do nothing. | `tw-animate-css` (v4-native drop-in, same utility class names). |
| `shadcn-ui` (the npm package) | Deprecated, frozen at 0.9.5, predates the v4/React 19 rewrite. | `shadcn` (current package name, 4.21.0+). |
| `npx shadcn@canary init` | Was needed during the v4/React 19 transition period; that track has since been promoted to `@latest`. Using `@canary` now risks pulling in genuinely unstable in-progress work instead of the stable v4 support. | `npx shadcn@latest init`. |
| `framer-motion` (continuing to install this name going forward) | Not broken today (same version, same repo as `motion`), but it's the legacy alias — new features and docs are written against `motion` first. | `motion`, imported as `motion/react`. |
| Installing `@radix-ui/react-*` packages by hand before running `shadcn add` | Risks a version mismatch against what the generated component `.tsx` code expects, causing prop/type errors that eat debugging time you don't have. | Let `shadcn add <component>` install the matching Radix primitive as a transitive dependency. |
| A `tailwind.config.ts` file "just in case" | Tailwind v4 doesn't read it by default (needs an explicit `@config` directive to opt into the compat shim) — leaving a stale, silently-ignored config file around is a common source of "why isn't my color working" confusion. | Configure entirely via `@theme` in your global CSS. |

## Stack Patterns by Variant

**If the caregiver view needs a persistent bottom nav with animated active-state:**
- Use shadcn's unstyled primitives (`Tabs` or a custom nav built on Radix `NavigationMenu`) + `motion`'s `layoutId` for the active-indicator slide animation.
- Because `layoutId` gives a smooth shared-element transition between nav items with minimal custom code — good ROI for the 2-day budget.

**If the parent (abstracted) view needs condensed "See All" cards linking into caregiver detail:**
- Reuse the same shadcn `Card` + Recharts sparkline-mode chart (small, axis-less `LineChart`) rather than building a second chart component.
- Because one design system, two densities, was an explicit project requirement (PROJECT.md) — component reuse across views is the point, not a nice-to-have.

**If real Supabase Realtime WebSocket delivery is flaky during the live hackathon demo (known risk — see project's existing intermittent Realtime test flake):**
- Fall back to short-interval polling of `GET /api/readings` (already shipped, Phase 4) behind the same custom-hook interface (`useLatestReading`), so components don't need to know which transport is active.
- Because a demo-day WiFi hiccup silently breaking the "live" indicator is a worse failure mode than a 3–5s polling delay judges won't notice.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `next@16.3.5` | `@tailwindcss/postcss@4.3.3` | App Router uses the PostCSS pipeline; confirm `postcss.config.mjs` includes `"@tailwindcss/postcss": {}` per Tailwind v4's Next.js docs. |
| `react@19.2.8` | `recharts@3.10.1` | Peer dep explicitly allows `^19.0.0` for react/react-dom/react-is. |
| `react@19.2.8` | `motion@13.4.3` | Peer dep allows `^18.0.0 \|\| ^19.0.0`. |
| `react@19.2.8` | `next-themes@0.4.6` | Peer dep allows `^19 \|\| ^19.0.0-rc`. |
| `tailwindcss@4.3.3` | `shadcn@4.21.0` | Stable as of this research; `init` auto-detects v4, no `--canary` flag required for new setups. |
| `tailwindcss@4.3.3` | `tw-animate-css@1.4.0` | Explicitly built as the v4-compatible replacement for `tailwindcss-animate`. |

## Sources

- [Tailwind CSS v4.0 official blog post](https://tailwindcss.com/blog/tailwindcss-v4) — HIGH, official docs, CSS-first config / `@theme` / Oxide engine performance claims
- [shadcn/ui — Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — MEDIUM, official-adjacent docs site, canary→stable transition
- [shadcn-ui/ui GitHub Discussion #6714 — Tailwind v4 and React 19](https://github.com/shadcn-ui/ui/discussions/6714) — MEDIUM, maintainer discussion
- npm registry (`npm view <pkg> version / peerDependencies / dist-tags`) for `tailwindcss`, `@tailwindcss/postcss`, `shadcn`, `shadcn-ui`, `tw-animate-css`, `recharts`, `motion`, `framer-motion`, `next-themes`, `tailwind-merge`, `class-variance-authority`, `clsx`, `lucide-react`, `zod` — HIGH, authoritative registry data, verified directly this session (2026-09-25)
- [motion npm package](https://www.npmjs.com/package/motion) / [motiondivision/motion GitHub](https://github.com/motiondivision/motion) — MEDIUM, official package + repo, confirms rename and `motion/react` import path
- [Supabase Docs — Using Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — MEDIUM, official docs, `useEffect` subscribe/cleanup pattern
- [Supabase GitHub Discussion #34457 — unsubscribe vs removeChannel](https://github.com/orgs/supabase/discussions/34457) — MEDIUM, maintainer/community discussion, confirms `removeChannel` as the complete cleanup call
- [LogRocket — Best React chart libraries in 2026](https://blog.logrocket.com/best-react-chart-libraries-2026/) and [PkgPulse — Recharts v3 vs Tremor vs Nivo](https://www.pkgpulse.com/guides/recharts-v3-vs-tremor-vs-nivo-react-charting-2026) — MEDIUM/LOW, third-party comparison pieces, cross-checked against each other and against npm peerDependencies data for the React 19 claim specifically

---
*Stack research for: SepCare v1.1 frontend rebuild (design system + dashboard) on Next.js 16 / React 19 / Supabase*
*Researched: 2026-09-25*
