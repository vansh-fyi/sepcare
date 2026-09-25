# Project Research Summary

**Project:** SepCare v1.1 — frontend rebuild (caregiver + parent dashboards)
**Domain:** Neonatal vitals/sepsis-risk monitoring dashboard, dual audience, real-time wearable data, Next.js/Supabase
**Researched:** 2026-09-25
**Confidence:** MEDIUM-HIGH

## Executive Summary

SepCare v1.1 is a dual-audience clinical-adjacent monitoring dashboard: a full-detail caregiver view and an abstracted, no-nav parent view, both driven by the same live vitals/risk-score data already flowing through a working backend (Realtime-proven, RLS-scoped to a single hardcoded device `nb-001`). Experts build this class of product with a visual-first traffic-light status as the primary signal, redundant color+icon+text coding for accessibility, live-vitals-first layouts, and genuinely distinct information density between clinical and lay audiences rather than one UI with toggled visibility. Research strongly confirms the milestone's existing plan (caregiver full detail + parent condensed "See All") is the correct pattern, not a corner cut.

The recommended approach: Tailwind v4 (CSS-first `@theme` tokens) + shadcn/ui (Radix-based) + Motion (renamed Framer Motion) + Recharts, layered onto the existing Next.js 16/React 19/Supabase stack. Server Components fetch initial data through a shared anon-key query lib (never `supabaseAdmin` for reads); Client Components own Realtime subscriptions via custom hooks — this exact pattern is already proven in the repo's own test suite. Two top-level route segments (`/caregiver`, `/parent`), not one branching route, keep the two experiences structurally honest.

The dominant risk is time-management under the 2-day/6-phase build order: a static HTML prototype quietly becoming a second app instead of a step toward the Next.js port, Tailwind v4's silent failure to apply v3-style salvaged tokens, Realtime subscriptions leaking or going silently stale, and hardware/demo-day environment failures unrelated to code quality. Mitigation is procedural: timebox the prototype hard, validate tokens against a real production build, build a visible connection-status indicator as a first-class UI element, and rehearse the full cold-boot demo on venue-like conditions before the judged slot.

## Key Findings

### Recommended Stack

Layer Tailwind v4 (`tailwindcss@4.3.3` + `@tailwindcss/postcss@4.3.3`), `shadcn` CLI (4.21.0, not deprecated `shadcn-ui`), `motion` (13.4.3, `motion/react`), and `recharts` (3.10.1) onto the existing foundation (`next@16.3.5`, `react@19.2.8`, `@supabase/supabase-js@2.116`, `zod@4.6.2`). Versions verified directly against npm registry with React 19 peer-dep compatibility confirmed.

**Core technologies:**
- `tailwindcss` v4 — CSS-first `@theme` config, ~8x faster builds
- `shadcn` CLI — generates editable Radix-based components into the repo
- `motion` — `motion/react` import, used for risk-status transitions and nav active-state
- `recharts` — lowest-setup-friction charting with React 19 support, composable threshold-band overlays
- `tw-animate-css` — required v4-native replacement for `tailwindcss-animate`

### Expected Features

Comparable products (Neopenda, Owlet, Nanit) and clinical/consumer UX literature validate the milestone's planned scope.

**Must have (table stakes):**
- Live vitals readout (HR, temp, activity/perfusion) always visible on load
- Prominent Green/Amber/Red status, coded via color + icon + word
- Vitals trend graph with time-range selector (backed by existing `GET /api/readings`)
- Risk-status timeline/history
- Device connection/last-synced indicator (maps to backend's offline-buffered-sync)
- Simplified, plain-language parent view, structurally distinct from caregiver dashboard

**Should have (competitive):**
- Care-instruction copy tied to current status/driving vital
- Shared design-token system at two densities
- Threshold-band shading on trend graphs tied to actual backend risk thresholds

**Defer (v2+):**
- Multi-device/multi-baby views, historical export, push/SMS alerting, accounts/auth/roles, ML-driven alert filtering, real-time waveform plotting (no raw waveform data exists)

### Architecture Approach

The backend already proves the hard integration point: RLS-scoped anon-key Realtime (`postgres_changes`, filtered to `deviceId = 'nb-001'`) is implemented and tested. The frontend wraps this in a `useLatestReading` hook, with Server Components fetching the initial snapshot through a shared `src/lib/supabase/queries.ts` (anon-key client, never `supabaseAdmin`), and Client Components owning the live subscription. One real gap: no "current reading" endpoint yet — `GET /api/readings/latest` needs gap-filling.

**Major components:**
1. `app/caregiver/*` and `app/parent/*` — two top-level route segments with distinct layout chrome (nav vs no-nav)
2. `src/components/vitals/*` — shared presentational components (VitalsCard, RiskBadge, TrendChart, DeviceStatusPill)
3. `src/hooks/use-latest-reading.ts` — client-only hook owning Realtime subscription lifecycle
4. `src/lib/supabase/{browser,queries}.ts` (new) — anon-key client and shared read functions, keeping `admin.ts`'s narrow contract untouched

### Critical Pitfalls

1. **Static HTML prototype becomes a second app** — timebox explicitly, mock-data markup with same component boundaries as the React port, fixed port start date.
2. **Tailwind v4 `@theme` tokens silently fail to apply** if v3-style config/`@apply` is copy-pasted from the salvaged design system — validate against a real `next build`, not just dev mode.
3. **Realtime subscriptions leak or silently go stale** — every subscription needs `useEffect` cleanup (`removeChannel`) and a visible status-driven "live/reconnecting" indicator, tested by actually toggling WiFi.
4. **Hydration mismatches from ported static HTML** — audit for `window`/`document`/`Date.now()`/`Math.random()`; isolate into `'use client'` leaves or precompute server-side.
5. **Hardware validated against a moving frontend/backend target** — re-run the phase-5 hardware checklist after the phase-6 port/redeploy before calling the milestone done.

## Implications for Roadmap

Suggested phase structure, matching the milestone description and strongly corroborated by architecture/pitfalls research:

### Phase 1: Repo Cleanup & Canonicalization
**Rationale:** Three divergent prototype trees plus stale hardware docs exist; later phases risk citing the wrong source if unresolved first.
**Delivers:** Single canonical folder per concern, everything else archived with a pointer note.
**Addresses:** N/A (hygiene)
**Avoids:** Pitfall — under-archived cleanup confusing later phases

### Phase 2: Design System (Tailwind v4 Tokens)
**Rationale:** Zero Tailwind exists on `main`; tokens are expensive to redo once screens reference them.
**Delivers:** `@theme` token set (risk green/amber/red, spacing, type, radii) validated against a real `next build`.
**Uses:** `tailwindcss@4.3.3`, `@tailwindcss/postcss`, `tw-animate-css`, `shadcn` init
**Avoids:** Silent `@theme` token failures, broken `@apply` salvage

### Phase 3: Static HTML Prototype (Caregiver + Parent)
**Rationale:** Validates layout/component states/both role flows cheaply before committing to React structure; must be timeboxed.
**Delivers:** One canonical HTML screen per role/view, real backend field names, consolidated data-contract diff against the existing API.
**Addresses:** Live vitals, traffic-light status, trend graph, risk timeline, device status, parent condensed view (P1 features)
**Avoids:** Prototype/port blur via hard timebox; reactive gap-fill via the data-contract output

### Phase 4: Backend Gap-Fill
**Rationale:** One deliberate pass against the phase-3 data-contract diff, not reactive patches.
**Delivers:** `GET /api/readings/latest` plus any fields the diff surfaced.
**Uses:** Existing `admin.ts` contract and route-handler validation conventions
**Avoids:** Piecemeal gap-fill

### Phase 5: Hardware Integration
**Rationale:** ESP32 validated against the real API surface; where demo-day environment risk must be addressed early.
**Delivers:** Device posting end-to-end to deployed Vercel/Supabase; documented hardware checklist; one dry run under demo-like network conditions.
**Addresses:** "Reaches a caregiver in time to act, even through WiFi/power outages" core value
**Avoids:** Hardware validated against a moving target (checklist reused in phase 6); demo-day environment failure

### Phase 6: Next.js Port + Deploy
**Rationale:** Ports a locked design system, validated prototype with known data contract, complete backend, and real hardware — minimizing rework; concentrates the highest-risk engineering (Realtime, Server/Client boundaries, shadcn/Radix composition).
**Delivers:** Two route trees sharing `src/components/`, wired to real Realtime + shared query lib, deployed to Vercel; hardware checklist re-run; hydration-clean pages.
**Uses:** Full stack (shadcn, Motion, Recharts) inside the researched component/hook architecture
**Implements:** Server-fetch + Client-subscribe pattern; shared query lib; anon-client-for-all-reads pattern
**Avoids:** Realtime leaks, hydration mismatches, Radix/Motion composition bugs, hardware-moving-target, demo-day failure

### Phase Ordering Rationale

- Cleanup precedes design-system work because canonical-source selection is a prerequisite for token salvage.
- Tokens precede the prototype because tokens are expensive to change once referenced widely; the prototype is cheap to redo.
- The prototype must produce a data-contract diff before gap-fill, or gap-fill degrades into reactive patches that can surface dangerously late.
- Hardware integration happens before the final port but its checklist is explicitly re-run after — the port is last so none of the other four artifacts (tokens, prototype, backend, hardware) are still moving underneath it.
- The port is last and heaviest because most researched pitfalls concentrate there (Realtime lifecycle, hydration, Radix/Motion composition), so it needs the most schedule slack.

### Research Flags

Needs research during planning:
- **Phase 6 (Next.js Port):** Realtime subscription lifecycle in App Router, shadcn/Radix + Motion exit-animation composition (`forceMount`), Server/Client data-flow boundaries — subtle, version-specific gotchas surfaced by this research.
- **Phase 3 (Prototype):** Tailwind v4 token validation against a production build, since dev-mode success is documented as misleading here.

Standard patterns (skip research-phase):
- **Phase 1 (Cleanup):** Straightforward archival, no technical research needed.
- **Phase 4 (Gap-Fill):** Mirrors an existing working route handler's conventions closely.
- **Phase 5 (Hardware):** Checklist-driven validation against an already-implemented ingest pipeline; risk is process discipline, not technical unknowns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified directly against npm registry; React 19 peer-dep compatibility confirmed this session |
| Features | MEDIUM | Web-sourced UX patterns; 3+ independent sources converged on core patterns (traffic-light redundant coding, threshold bands, offline indicators, dual-audience density split) |
| Architecture | HIGH | Grounded directly in this repo's existing code and passing tests, plus bundled Next.js 16 docs matching the exact installed version |
| Pitfalls | MEDIUM | Framework-specific pitfalls cross-checked across multiple sources; hackathon/demo-day and hardware pitfalls are thinner in the literature, more pattern-matched |

**Overall confidence:** HIGH for what to build and how the backend integration works; MEDIUM for exact UX-pattern specifics and demo-day risk framing.

### Gaps to Address

- **No "current reading" endpoint exists yet** — confirmed gap; `GET /api/readings/latest` must be built during Phase 4, not assumed available during prototyping.
- **Exact visual specifics of Neopenda-style screens** are single-sourced — treat as illustrative inspiration, not a spec to copy exactly.
- **Venue demo-day WiFi behavior** is unknowable in advance — Phase 5/6 planning should explicitly budget a dry-run and a non-live fallback (recording/screenshots).
- **Bundle-size impact of the full stack on Vercel free-tier** was not independently measured — worth a quick `next build` size check during Phase 6.

## Sources

### Primary (HIGH confidence)
- This repository: `src/app/api/readings/route.ts`, `src/lib/supabase/admin.ts`, `supabase/migrations/*.sql`, `tests/realtime.subscribe.test.ts`, `.env.example`, `next.config.ts`
- npm registry direct version/peer-dependency checks (2026-09-25)
- Bundled Next.js 16 App Router docs matching installed version 16.3.5
- [Tailwind CSS v4.0 official blog post](https://tailwindcss.com/blog/tailwindcss-v4)
- [Migrating: App Router — official Next.js docs](https://nextjs.org/docs/app/guides/migrating/app-router-migration)

### Secondary (MEDIUM confidence)
- [shadcn/ui — Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4); [shadcn-ui/ui Discussion #6714](https://github.com/shadcn-ui/ui/discussions/6714)
- [Supabase Docs — Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs); [Supabase Discussion #34457](https://github.com/orgs/supabase/discussions/34457); [Supabase Discussion #5312](https://github.com/orgs/supabase/discussions/5312)
- [Neopenda NICU Dashboard Case Study — Michelle Wang](https://www.michellewang.design/neopenda)
- [Healthcare UX Design — Momentum](https://www.themomentum.ai/blog/healthcare-ux-design-principles-patient-provider-apps)
- [Tailwind v3→v4 migration write-ups](https://github.com/tailwindlabs/tailwindcss/discussions/16517)
- [shadcn-ui/ui Issue #8930 — hydration failure with Button](https://github.com/shadcn-ui/ui/issues/8930)

### Tertiary (LOW confidence)
- Consumer app comparison coverage (Owlet/Nanit review sites)
- [Gautier DI FOLCO — How to fail a hackathon](https://gautier.difolco.dev/2026-07/hackathon)
- [10 IoT Mistakes Even Smart Teams Keep Making](https://www.iotforall.com/common-iot-mistakes)

---
*Research completed: 2026-09-25*
*Ready for roadmap: yes*
