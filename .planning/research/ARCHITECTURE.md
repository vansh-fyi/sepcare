# Architecture Research

**Domain:** Next.js App Router frontend for a Supabase-backed real-time health monitoring dashboard (two role-based views), ported from a static HTML prototype
**Researched:** 2026-09-25
**Confidence:** HIGH — grounded directly in this repo's existing code (`src/app/api/readings/route.ts`, `src/lib/supabase/admin.ts`, `supabase/migrations/*.sql`, `tests/realtime.subscribe.test.ts`) and the bundled Next.js 16 docs (`node_modules/next/dist/docs/01-app/`), not generic Next.js knowledge.

## Grounding facts (read directly off this repo, not assumed)

These are load-bearing for every recommendation below:

1. **RLS is already scoped and proven for anon reads.** `supabase/migrations/20260912172701_init.sql` and `20260918102702_risk_scores.sql` create `anon` SELECT policies on `readings` and `risk_scores` restricted to `"deviceId" = 'nb-001'`, and `devices` has **no** anon policy at all (correctly locked out). Both tables are already added to the `supabase_realtime` publication.
2. **The anon-key Realtime pattern is already implemented and tested**, not hypothetical: `tests/realtime.subscribe.test.ts` opens `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)` client-side, subscribes to `postgres_changes` on `readings`, and asserts both that same-device INSERTs arrive and that a different device's INSERTs are correctly withheld by RLS. This is the exact mechanism the frontend needs — it does not need to be invented, only wrapped in a hook.
3. **`.env.example` already anticipates a browser-safe anon client**: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist alongside the server-only `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`. No new secrets need to be provisioned.
4. **`src/lib/supabase/admin.ts` has an explicit, narrow contract**: "must NEVER be imported by any file carrying a `use client` directive... the sole place device-credential checks and writes... are allowed to happen." Reads for the frontend were not part of that original contract — see the recommendation below on keeping the admin client's blast radius unchanged.
5. **No "current/latest reading" endpoint exists yet.** `GET /api/readings` (`src/app/api/readings/route.ts`) requires explicit `from`/`to` epoch-ms params, caps the range at 15 days, and is built purely for historical trend queries. A dashboard's "what is baby's status right now" widget has nothing to call yet — this is a real gap, not a design choice to route around.
6. **`next.config.ts` has Cache Components (`cacheComponents: true`) OFF** (default scaffold, untouched). Next.js 16's new caching model is opt-in and not enabled here — do not turn it on for this milestone (see Pitfall below).
7. **No Tailwind, no shadcn/ui, no component library exists on `main` yet.** `src/app/layout.tsx` / `globals.css` are untouched `create-next-app` scaffold. All of PROJECT.md's "New Tailwind v4 token-based design system" work starts from zero on `main`.
8. **There are three divergent, overlapping prototype trees already on disk**: `frontend-design/*.html` (root level), `frontend-design/sepcare/*.html`, `frontend-design/xo/*.html` — plus `frontend-handoff/` (planning docs, Figma "Segue 3.0" references). PROJECT.md's own Active requirements already flag "Repo cleanup — archive duplicate/off-topic material" as the first milestone task. Treat this as load-bearing: porting from an unconsolidated source multiplies risk.
9. **`@supabase/supabase-js` (2.116) is the only Supabase package installed** — no `@supabase/ssr`. That package solves cookie-synced auth sessions across server/client, which this app doesn't need (no user accounts, per PROJECT.md Out of Scope). Do not add it.

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────┐
│                         Browser (Client Components)                    │
│  ┌────────────────────┐   ┌────────────────────┐                      │
│  │ Caregiver dashboard │   │  Parent dashboard   │   role picked once  │
│  │ (bottom nav, detail)│   │  (no nav, abstracted)│  at "/" and routed │
│  └──────────┬──────────┘   └──────────┬──────────┘                    │
│             │  useLatestReading() / useRiskStatus() hooks              │
│             └────────────┬─────────────┘                              │
│                           │ anon-key Realtime channel (postgres_changes)│
├───────────────────────────┼─────────────────────────────────────────────┤
│                    Next.js App Router (Vercel)                         │
│  ┌────────────────────────┴─────────────────────────┐                  │
│  │  Server Components (page.tsx, layout.tsx)         │                  │
│  │  — initial-paint reads via shared query lib        │                  │
│  └───────────────┬────────────────────┬───────────────┘                │
│                  │                    │                                │
│  ┌───────────────▼──────┐   ┌─────────▼───────────────┐                │
│  │ GET /api/readings     │   │ GET /api/readings/latest │  NEW — gap   │
│  │ (existing, historical)│   │ (gap-fill, current state)│  -fill route │
│  └───────────────┬───────┘   └────────────┬─────────────┘              │
│                  │                        │                            │
│  ┌───────────────▼────────────────────────▼─────────────┐              │
│  │  POST /api/ingest, POST /api/ingest/batch (unchanged, │              │
│  │  device-only — frontend never calls these)             │              │
│  └───────────────────────────┬────────────────────────────┘            │
└──────────────────────────────┼──────────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                          Supabase (Postgres)                          │
│  devices (no anon policy)  readings (anon SELECT, deviceId=nb-001)    │
│  risk_scores (anon SELECT, deviceId=nb-001) — both in supabase_realtime│
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `app/page.tsx` (role picker) | Entry point, sets which role view to enter | Server Component; two links/buttons → `/caregiver`, `/parent`; ports `profile-selection.html` |
| `app/caregiver/*` route tree | Full-detail, navigable clinical view | Server Component pages + a `layout.tsx` that renders bottom nav |
| `app/parent/*` route tree | Abstracted, no-nav, reassurance-first view | Server Component pages + a `layout.tsx` with no nav chrome, "See All" links into deeper screens |
| `src/components/vitals/*` | Shared presentational pieces (VitalsCard, RiskBadge, TrendChart, DeviceStatusPill) | Mostly plain React components, consumed by both role trees |
| `src/hooks/use-latest-reading.ts` | Owns the live Realtime subscription + local merge state | Client-only hook (`"use client"`), wraps the proven `postgres_changes` pattern from `tests/realtime.subscribe.test.ts` |
| `src/lib/supabase/browser.ts` | Anon-key Supabase client, browser + Server Component safe | Thin `createClient<Database>()` wrapper, singleton |
| `src/lib/supabase/admin.ts` | Service-role client — device auth + writes only (unchanged contract) | Existing file, untouched |
| `src/lib/supabase/queries.ts` | Shared read functions (latest reading, bounded range) used by both route handlers and Server Components | New — extracted so Server Components don't self-fetch their own API over HTTP |
| `GET /api/readings/latest` | New gap-fill endpoint: current vitals + risk status for a device | Mirrors `/api/readings`'s allow-list/no-store/validation conventions |

## Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # root: html/body, fonts, ThemeProvider — no nav, no data fetching
│   ├── globals.css                # Tailwind v4 @theme tokens (ported verbatim from validated prototype)
│   ├── page.tsx                   # "/" — role picker (splash/profile-selection port)
│   ├── caregiver/
│   │   ├── layout.tsx             # caregiver-only chrome: bottom nav
│   │   ├── page.tsx               # /caregiver — clinical overview (maps to clinical-overview.html)
│   │   ├── vitals/page.tsx        # /caregiver/vitals — full vitals + trend charts
│   │   └── device/page.tsx        # /caregiver/device — device status (maps to device-status.html)
│   ├── parent/
│   │   ├── layout.tsx             # parent-only chrome: no nav
│   │   ├── page.tsx               # /parent — abstracted dashboard (maps to parent-dashboard.html)
│   │   ├── vitals/page.tsx        # /parent/vitals — "See All" target
│   │   └── notifications/page.tsx # /parent/notifications
│   └── api/                       # UNCHANGED except one new route
│       ├── health/route.ts
│       ├── ingest/route.ts
│       ├── ingest/batch/route.ts
│       ├── readings/route.ts
│       └── readings/latest/route.ts   # NEW — gap-fill
├── components/
│   ├── ui/                        # shadcn/ui primitives (button, badge, card, sheet, tabs…)
│   ├── vitals/                    # VitalsCard, RiskBadge, TrendChart (Recharts/Tremor), DeviceStatusPill
│   ├── nav/                       # BottomNav (caregiver-only)
│   └── realtime/                  # thin client wrapper components that call the hooks below
├── hooks/
│   └── use-latest-reading.ts      # "use client" — owns the Realtime subscription
├── lib/
│   ├── risk/                      # existing, unchanged
│   ├── validation/                # existing, unchanged
│   └── supabase/
│       ├── admin.ts               # existing, unchanged — service-role, server-only
│       ├── browser.ts             # NEW — anon-key client, safe in both Server Components and Client Components
│       ├── queries.ts             # NEW — shared read functions (latest, bounded range)
│       └── types.ts               # existing, generated `Database` type — reused everywhere
```

### Structure Rationale

- **`app/caregiver/` and `app/parent/` as plain top-level segments, not route groups.** Route groups (`(name)`) exist specifically to share a layout *without* the name appearing in the URL. Here the opposite is wanted: the role is a real navigational choice (there's a profile-selection screen in the prototype), and distinct, bookmarkable/shareable URLs (`/caregiver`, `/parent`) are actively useful for a judge/demo walkthrough. Use nested `layout.tsx` for the nav/no-nav split — that's what layouts are for regardless of whether the segment is grouped.
- **No single dynamic `/[role]/page.tsx` with `if (role === 'caregiver')` branching.** The two views diverge structurally (nav chrome present vs absent, depth of detail, "See All" vs inline), not just by a few conditional strings. A single route with heavy conditional rendering becomes an unmaintainable branch-fest under 2-day time pressure and makes it harder to give the parent view a genuinely distraction-free layout, since Next layouts (not props) are what control chrome. Two thin route trees sharing the same `src/components/` is less code, not more.
- **`src/components/` sits beside `app/`, not inside it** — matches the existing `src/lib/` convention already established in this repo (flat top-level dirs under `src/`), keeps `app/` purely for routing.
- **One shared `src/lib/supabase/queries.ts`, not duplicated per-route SQL** — the existing `/api/readings/route.ts` already has private helper logic (`fetchHistory`) baked into the route file; extracting the equivalent "latest reading" query (and, time permitting, hoisting `fetchHistory` too) into a shared module lets both the route handler *and* Server Components call the same validated function, avoiding a Server Component fetching its own API over HTTP (an anti-pattern — see below).

## Architectural Patterns

### Pattern 1: Server Component fetches the initial snapshot, Client Component owns the live subscription

**What:** `page.tsx` (a Server Component, `async function`, no `"use client"`) calls a shared query function directly to get the most recent reading + risk status, then passes it as the `initial` prop into a single Client Component that opens the Realtime channel and merges incoming events into local state. Everything below that Client Component (VitalsCard, RiskBadge, etc.) can stay plain, cheap presentational components.

**When to use:** Every "live" widget on both dashboards (current vitals, current risk badge). This is the direct answer to "how should Realtime be wired without fighting the server-first model" — the fight only happens if you try to subscribe from a Server Component (impossible; Realtime needs a persistent WebSocket, which only exists in the browser) or if you fetch everything client-side with no SSR (defeats fast first paint). Splitting fetch (server) from subscribe (client) uses each side for what it's good at.

**Trade-offs:** One extra prop-drilling seam (`initial` → hook) per widget; worth it for instant first paint + no loading flash on every navigation.

**Example:**
```tsx
// src/app/caregiver/page.tsx (Server Component)
import { fetchLatestReading } from "@/lib/supabase/queries";
import { LiveVitalsPanel } from "@/components/vitals/live-vitals-panel";

export const dynamic = "force-dynamic"; // never statically cache live health data

export default async function CaregiverPage() {
  const initial = await fetchLatestReading("nb-001");
  return <LiveVitalsPanel deviceId="nb-001" initial={initial} />;
}
```
```tsx
// src/components/vitals/live-vitals-panel.tsx
"use client";
import { useLatestReading } from "@/hooks/use-latest-reading";
import { VitalsCard, RiskBadge } from "@/components/vitals";

export function LiveVitalsPanel({ deviceId, initial }: Props) {
  const reading = useLatestReading(deviceId, initial);
  return (
    <>
      <RiskBadge status={reading?.risk?.status ?? "unknown"} />
      <VitalsCard vitals={reading?.vitals} />
    </>
  );
}
```
```ts
// src/hooks/use-latest-reading.ts
"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function useLatestReading(deviceId: string, initial: LatestReading | null) {
  const [reading, setReading] = useState(initial);

  useEffect(() => {
    const channel = supabaseBrowser
      .channel(`readings-${deviceId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "readings", filter: `deviceId=eq.${deviceId}` },
        (payload) => setReading((prev) => mergeVitals(prev, payload.new))
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "risk_scores", filter: `deviceId=eq.${deviceId}` },
        (payload) => setReading((prev) => mergeRisk(prev, payload.new))
      )
      .subscribe();

    return () => { supabaseBrowser.removeChannel(channel); };
  }, [deviceId]);

  return reading;
}
```
This is the same `postgres_changes` mechanism `tests/realtime.subscribe.test.ts` already proves works end-to-end against RLS. The one improvement over that test's code: use the Realtime `filter` option (`deviceId=eq.${deviceId}`) for server-side filtering instead of filtering inside the callback — less payload over the wire, same effect. (The test filters client-side for a different reason — test isolation against concurrent inserts from other test files — not because server-side filtering doesn't work.)

### Pattern 2: Reads go through a shared query lib, not ad-hoc queries per component

**What:** All Supabase reads (both from route handlers and Server Components) call functions in `src/lib/supabase/queries.ts`, which uses the anon-key client (see Pattern 3), not `supabaseAdmin`. Route handlers stay the single external contract (validated, allow-listed, rate-limit-ready); Server Components call the same internal functions directly rather than doing `fetch("/api/readings")` against their own deployment.

**When to use:** Any place a Server Component needs data for first paint (dashboard initial state, historical trend chart default range).

**Trade-offs:** Slight duplication of "what a valid device ID is" between the query lib and the route handler's validation — acceptable at this scale; don't over-abstract for a 2-day build.

### Pattern 3: Server Components read through the anon client, not `supabaseAdmin`

**What:** Even though Server Components run entirely server-side and *could* safely import `supabaseAdmin`, don't. Use the same anon-key client (`src/lib/supabase/browser.ts` — the name is about the *key*, not the *runtime*; it's safe to import from Server Components too, since the anon key is public-safe by design) for all frontend reads, whether server-rendered or Realtime-subscribed.

**When to use:** Always, for this milestone.

**Trade-offs / rationale:** `admin.ts`'s own doc comment scopes it narrowly to "device-credential checks and writes" — reads were never part of that contract, and RLS is *already* correctly scoped to the single demo device (`deviceId = 'nb-001'`) on exactly the two tables the frontend needs. Using the anon client everywhere means: one security boundary to reason about instead of two, the service-role key's blast radius stays exactly as documented, and Server Component reads get free defense-in-depth (if a device ID ever became attacker-controlled input to a Server Component, RLS — not application code — is the backstop). The only cost is that Server Components must be careful about `deviceId` inputs the same way `GET /api/readings` already is (allow-list, don't trust arbitrary route params) — which the shared query lib should enforce once, centrally.

## Data Flow

### Initial page load (either role)

```
Browser GET /caregiver
    ↓
Next.js Server Component (page.tsx)
    ↓ calls
fetchLatestReading("nb-001")  [src/lib/supabase/queries.ts, anon client]
    ↓
Supabase Postgres (RLS: anon, deviceId = 'nb-001') → rows
    ↓
Server renders HTML with initial vitals/risk baked in → browser
```

### Live update after mount

```
Browser: useLatestReading() opens Realtime channel (anon key)
    ↓
ESP32 device → POST /api/ingest (unchanged) → supabaseAdmin.insert(readings)
    ↓                                              ↓
computeAndPersistRiskScore() → insert(risk_scores)  Postgres publishes to supabase_realtime
    ↓                                              ↓
                                          Realtime pushes postgres_changes INSERT
                                              ↓ (RLS-filtered to nb-001 at the source)
                                      Browser's open channel receives it
                                              ↓
                                  hook merges into local state → UI re-renders
```

### Historical trend chart

```
Chart mounts with a default range → Server Component calls the shared range-query
function directly (no HTTP hop) for first paint
    ↓
User changes the range picker (client interaction) → Client Component fetch()'s
GET /api/readings?deviceId=nb-001&from=...&to=... directly (genuine client-initiated
action — the existing route's validation/pagination/15-day-cap logic is reused as-is)
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Postgres (reads) | Anon-key client, both server- and client-side, via `src/lib/supabase/queries.ts` and `src/lib/supabase/browser.ts` | RLS already scoped to `nb-001`; no new policies needed for read paths already covered by `readings`/`risk_scores` |
| Supabase Realtime | Client-only `postgres_changes` subscription on `readings` + `risk_scores`, anon key | Already proven pattern (`tests/realtime.subscribe.test.ts`); use the `filter` option for server-side filtering |
| Vercel | Existing deployment target, no change | Frontend routes deploy in the same Next.js app as the existing API routes — one deployment, not two |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Frontend routes (`app/caregiver`, `app/parent`) ↔ existing `GET /api/readings` | HTTP fetch, client-initiated (range picker) or direct shared-fn call (initial SSR paint) | Never call `POST /api/ingest*` from the frontend — device-only |
| Frontend routes ↔ NEW `GET /api/readings/latest` | Same conventions as `/api/readings` (no-store, device allow-list, strict validation) | Gap-fill — build this alongside the prototype, not after, so the prototype validates against real data from day one |
| `src/lib/supabase/admin.ts` ↔ everything else | One-way: only `POST /api/ingest*` and the risk-scoring pipeline import it | Contract unchanged by this milestone — do not add frontend read paths through it |
| `src/components/*` ↔ `app/caregiver/*`, `app/parent/*` | Direct import, both role trees consume the same component set | This is *the* design-system sharing mechanism — no duplication between roles |

## Build Order & Risk Minimization

This directly addresses "what to decide during the prototype phase vs defer to the port phase," ordered for the ~2-day budget.

### Decide during the prototype phase (expensive to change later — lock these first)

1. **Consolidate the three prototype trees first.** `frontend-design/*.html`, `frontend-design/sepcare/*`, `frontend-design/xo/*` currently overlap (multiple `parent-dashboard`/`parentoverview`/`clinical-vitals`/`clinical-overview` variants exist side by side). Porting from an ambiguous source multiplies risk — this is exactly why PROJECT.md's own Active requirements list "Repo cleanup" first. Pick one canonical screen per role, archive the rest, before writing new HTML.
2. **Design tokens** (Tailwind v4 `@theme` — colors incl. green/amber/red risk semantics, spacing, type scale, radii, shadows). There is currently *zero* Tailwind on `main`; today's hand-rolled `components.css`/`parent-screen.css` are not a token system. Lock tokens as their own small artifact validated against ≥3 real states (already the plan) before building full screens — this is the one thing that's genuinely expensive to redo once dozens of screens reference it.
3. **URL/screen map for both roles**, matching the recommended route structure above 1:1 (e.g. `clinical-overview.html` → `/caregiver`, `parent-dashboard.html` → `/parent`). Naming prototype files to match future route segments makes the port close to mechanical.
4. **Real data field names and value vocabularies.** The prototype must use `heartRate`, `spo2`, `temperature`, `activityScore` and `status: 'green' | 'amber' | 'red'` — the exact shapes the backend already returns — not invented field names. This is explicitly the milestone's own stated plan ("checked against what the backend can realistically supply"); skipping it creates a translation layer at port time, exactly when time is tightest.
5. **Shared component inventory and prop contracts** (VitalsCard, RiskBadge, TrendChart, DeviceStatusPill, BottomNav) — decide which pieces are shared vs role-specific now, even while still hand-authoring HTML, so the port phase is "cut along these seams," not "figure out the seams."
6. **The `GET /api/readings/latest` gap-fill endpoint** — build it now, in parallel with the prototype, and have the prototype's JS actually `fetch()` it (plus, ideally, open a real anon-key Realtime subscription in vanilla JS) against the *real deployed* backend. If the prototype already talks to real Supabase data before any React exists, the port becomes "wrap this working fetch/subscribe logic in hooks," not "build data-fetching from scratch."

### Defer to the port phase (cheap to redo, low structural risk)

1. **Actual state management wiring** (`useState`/hooks) — the prototype can fake "live" with a static JSON fixture or a simple `setInterval` stub; don't build a full fake-realtime engine by hand in vanilla JS.
2. **Component decomposition into React files** — prototype can stay as fewer, larger HTML files (per the existing `frontend-design/AGENTS.md` convention of one file per screen); the port is where these get cut into `<VitalsCard />`, `<RiskBadge />`, etc. Keep DOM structure and class names in the prototype recognizable so the cut points are obvious later.
3. **Animation/transition implementation** — approximate with CSS transitions in the prototype; refine with Framer Motion during the port. Don't invest hackathon time hand-rolling JS animation twice.
4. **Exact chart library wiring** (Recharts/Tremor) — the prototype can hand-roll a simple SVG/CSS approximation of the trend chart; the port swaps in the real library once the visual target (chart type, axis, risk-band coloring) is already locked from the prototype.
5. **shadcn/ui component generation** — install and generate primitives during the port, not the prototype; the prototype doesn't need real component library code, just the visual result.

## Anti-Patterns

### Anti-Pattern 1: Single dynamic `/[role]/page.tsx` with branching render logic

**What people do:** One route, `role` as a param or query string, `if (role === 'caregiver') <CaregiverView /> else <ParentView />` inside a shared `page.tsx`/`layout.tsx`.
**Why it's wrong:** Next.js layouts are the mechanism for structural chrome differences (nav present/absent); fighting that with conditional JSX inside one layout produces a component that has to re-derive "is this the caregiver context" everywhere below it, and makes it easy to accidentally leak caregiver-only nav markup into the parent tree.
**Instead:** Two top-level route segments (`app/caregiver/`, `app/parent/`), each with its own thin `layout.tsx`, both importing from the same `src/components/`.

### Anti-Pattern 2: Server Components fetching the app's own API routes over HTTP

**What people do:** `page.tsx` does `await fetch("https://<deployment>/api/readings?...")` to get data for first paint.
**Why it's wrong:** Adds a real network round-trip (and URL-resolution complexity — Vercel deployment URLs aren't `localhost` in production) to get data the Server Component could read directly, and duplicates validation logic instead of sharing it.
**Instead:** Extract the query logic into `src/lib/supabase/queries.ts`; have both the route handler *and* Server Components call it directly. Reserve real `fetch()` calls to `/api/readings` for genuine client-initiated actions (e.g., the range picker) from Client Components.

### Anti-Pattern 3: Routing Realtime-eligible reads through `supabaseAdmin`

**What people do:** Reach for the already-imported service-role client "since it's already there" for a quick frontend read.
**Why it's wrong:** Violates `admin.ts`'s own documented contract (device-credential checks + writes only), silently expands the blast radius of the service-role key, and throws away the defense-in-depth RLS already provides for exactly this data.
**Instead:** Anon-key client for all frontend reads (Pattern 3 above) — it's already correctly scoped by the existing RLS policies.

### Anti-Pattern 4: Polling instead of subscribing

**What people do:** `setInterval(() => fetch('/api/readings/latest'), 5000)` for "live" updates, because it feels simpler than wiring Realtime.
**Why it's wrong:** Supabase Realtime for this exact use case is already implemented, tested, and RLS-scoped in this repo — polling would be strictly more code, more Vercel function invocations against a free-tier budget, and a worse-feeling demo (visible lag vs instant push) for a project whose whole value proposition is "reaches a caregiver in time to act."
**Instead:** Pattern 1 above.

### Anti-Pattern 5: Enabling Next.js 16 Cache Components mid-milestone

**What people do:** Turn on `cacheComponents: true` in `next.config.ts` for "better performance," per the new Next.js 16 docs.
**Why it's wrong:** Cache Components requires every dynamic/uncached read to be explicitly wrapped in `<Suspense>` or given a `use cache` lifetime, or the build fails its prerendering validation. For a live-vitals dashboard, almost nothing should be `use cache`'d (stale health data is the one thing this product must never show), meaning adopting it correctly means wrapping every data-bearing component in `<Suspense>` — a non-trivial restructuring with zero benefit for a 2-day, single-device demo that doesn't need CDN-level caching.
**Instead:** Leave `cacheComponents` off (current default, untouched). Mark pages with live data `export const dynamic = "force-dynamic"` (or rely on the anon client's per-request fetch already being dynamic by nature) and move on.

## Scaling Considerations

Not a meaningful axis for this milestone — v1.1 is explicitly a single-device demo (PROJECT.md: "Multi-device / multi-baby support... deferred"). Noted briefly for completeness:

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 device (current) | Exactly the architecture above; hardcoded `nb-001` allow-list is fine |
| Multiple devices (v2, DEV-V2-01) | RLS policies need a real per-caregiver/device mapping instead of a literal `deviceId = 'nb-001'` comparison — likely via Supabase Auth + a `device_owners` join table; the anon-key Realtime pattern still works, just with dynamic filters instead of a hardcoded one |
| Real user accounts (v2, ACC-V2-01) | This is when `@supabase/ssr` earns its place — cookie-synced sessions become necessary once there's a login |

## Sources

- This repository: `src/app/api/readings/route.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/types.ts`, `supabase/migrations/*.sql`, `tests/realtime.subscribe.test.ts`, `.env.example`, `package.json`, `next.config.ts`, `frontend-design/AGENTS.md`, `frontend-handoff/OVERVIEW.md`, `.planning/PROJECT.md` — HIGH confidence, primary/ground-truth source.
- Bundled Next.js 16 App Router docs (`node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`, `.../03-api-reference/03-file-conventions/route-groups.md`) — HIGH confidence, official source matching the exact installed version (16.3.5).
- Supabase Realtime `postgres_changes` + RLS integration pattern — HIGH confidence, verified against this repo's own passing test, not external docs.

---
*Architecture research for: SepCare v1.1 frontend rebuild (Next.js App Router port of a static HTML prototype)*
*Researched: 2026-09-25*
