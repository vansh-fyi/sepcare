# Codebase Structure

**Analysis Date:** 2026-09-25

## Directory Layout

```
sepcare/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/
│   │   │   ├── health/route.ts   # GET /api/health — deployment smoke check
│   │   │   ├── ingest/
│   │   │   │   ├── route.ts      # POST /api/ingest — single live reading
│   │   │   │   └── batch/route.ts # POST /api/ingest/batch — offline batch sync
│   │   │   └── readings/route.ts # GET /api/readings — dashboard read API
│   │   ├── layout.tsx            # Root layout (Next.js scaffold)
│   │   ├── page.tsx              # Root page (Next.js scaffold, not built out)
│   │   ├── page.module.css
│   │   └── globals.css
│   └── lib/
│       ├── risk/
│       │   ├── compute.ts        # Sepsis risk-scoring engine
│       │   └── thresholds.ts     # Named clinical/statistical constants
│       ├── supabase/
│       │   ├── admin.ts          # Service-role Supabase client (server-only)
│       │   └── types.ts          # Generated Supabase Database types
│       └── validation/
│           └── ingest-schema.ts  # Zod schemas for ingest payloads
├── supabase/
│   ├── config.toml               # Local Supabase CLI config (api.max_rows, etc.)
│   └── migrations/                # Timestamped SQL migrations (source of truth for schema)
│       ├── 20260912172701_init.sql
│       ├── 20260918102702_risk_scores.sql
│       └── 20260919105432_readings_unique_device_timestamp.sql
├── tests/                        # Vitest test suite (flat, not co-located)
│   ├── e2e-deployed.test.ts
│   ├── ingest.auth.test.ts
│   ├── ingest.batch.test.ts
│   ├── ingest.route.test.ts
│   ├── readings.route.test.ts
│   ├── realtime.risk-scores.test.ts
│   ├── realtime.subscribe.test.ts
│   ├── risk.compute.test.ts
│   └── helpers/cleanup.ts
├── scripts/                      # One-off/operational Node scripts
│   ├── check-device-seeded.mjs
│   └── seed-device.mjs
├── context/                      # Product/design/research reference docs (not code)
│   ├── implementation-plans/
│   ├── design-opportunities/
│   ├── frontend-handoff/
│   ├── mockups/
│   ├── research/, web-research/, sdg/
├── frontend-design/               # Static HTML/CSS/JS prototype dashboard (teammate-built,
│                                   # to be ported to Next.js on `main` later)
├── hardware/                      # ESP32 hardware docs (SOT, pinout, soldering UAT, parts list)
├── docs/system.html
├── public/                       # Static assets (Next.js default SVGs)
├── .planning/                    # GSD planning artifacts (PROJECT.md, ROADMAP.md, phases, etc.)
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.mjs
└── package.json
```

## Directory Purposes

**`src/app/api/`:**
- Purpose: All backend HTTP surface. One subdirectory per URL segment, each containing a `route.ts` with exported HTTP method handlers.
- Contains: Route Handlers only — no page UI is built out under `app/` yet beyond the scaffold root page.
- Key files: `src/app/api/ingest/route.ts`, `src/app/api/ingest/batch/route.ts`, `src/app/api/readings/route.ts`, `src/app/api/health/route.ts`

**`src/lib/risk/`:**
- Purpose: Sepsis risk-scoring domain logic, isolated from the HTTP layer so both ingest routes share identical scoring behavior.
- Contains: `compute.ts` (engine + window fetching), `thresholds.ts` (named constants, each citing a CONTEXT.md decision ID).

**`src/lib/supabase/`:**
- Purpose: All Supabase client construction and generated types live here — the single choke point for DB access.
- Contains: `admin.ts` (service-role client, server-only), `types.ts` (generated `Database` type from Supabase CLI).

**`src/lib/validation/`:**
- Purpose: Zod schemas defining and validating wire payload shapes for write endpoints.
- Contains: `ingest-schema.ts` (`IngestSchema`, `BatchIngestSchema`).

**`supabase/migrations/`:**
- Purpose: Source-of-truth, timestamped SQL schema history applied via Supabase CLI. Never edit an already-applied migration — add a new one.
- Naming: `YYYYMMDDHHMMSS_description.sql`.

**`tests/`:**
- Purpose: Vitest test suite, flat top-level directory (not co-located with source).
- Contains: one file per route/concern (`ingest.route.test.ts`, `ingest.batch.test.ts`, `ingest.auth.test.ts`, `readings.route.test.ts`, `risk.compute.test.ts`), realtime-specific tests, an end-to-end deployed-environment test, and `helpers/cleanup.ts` for teardown between test runs.

**`scripts/`:**
- Purpose: Operational Node scripts run outside the request lifecycle (e.g. seeding a test device, verifying seed state before running tests).

**`context/`:**
- Purpose: Product/design/hardware research and planning reference material — not application code. Includes implementation plans (e.g. `context/implementation-plans/neonatal-sepsis-armband.md`, cited directly in code comments as the source of the "screening triage, not diagnosis" framing).

**`frontend-design/`:**
- Purpose: Static HTML/CSS/JS dashboard prototype built by teammates, outside the Next.js app. Intended to be ported into `src/app/` on `main` in a future phase. Has its own `AGENTS.md` with prototype-specific conventions.

**`hardware/`:**
- Purpose: ESP32 hardware documentation (source-of-truth spec, pinout, soldering UAT checklist, parts list) — reference only, not code.

**`.planning/`:**
- Purpose: GSD workflow state — `PROJECT.md`, `ROADMAP.md`, `STATE.md`, phase plans, and this `codebase/` directory of mapping docs.

## Key File Locations

**Entry Points:**
- `src/app/api/ingest/route.ts`: live single-reading ingest from ESP32
- `src/app/api/ingest/batch/route.ts`: offline-buffered batch ingest from ESP32
- `src/app/api/readings/route.ts`: dashboard read API
- `src/app/api/health/route.ts`: deployment smoke check

**Configuration:**
- `next.config.ts`: Next.js build config
- `tsconfig.json`: TypeScript config, `@/*` path alias mapped to `src/*`
- `vitest.config.ts`: test runner config
- `eslint.config.mjs`: lint rules (flat config)
- `supabase/config.toml`: local Supabase CLI project config (includes `api.max_rows` PostgREST cap, relevant to pagination logic in `src/lib/risk/compute.ts` and `src/app/api/readings/route.ts`)
- `.env.local` / `.env.example`: environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) — never read contents, existence only

**Core Logic:**
- `src/lib/risk/compute.ts`: risk-scoring engine (`computeAndPersistRiskScore`, `fetchWindow`)
- `src/lib/risk/thresholds.ts`: clinical/statistical constants
- `src/lib/validation/ingest-schema.ts`: payload validation schemas
- `src/lib/supabase/admin.ts`: service-role DB client

**Testing:**
- `tests/*.test.ts`: Vitest specs, one file per route/concern
- `tests/helpers/cleanup.ts`: shared test teardown helper
- `scripts/check-device-seeded.mjs`, `scripts/seed-device.mjs`: test-data seeding scripts run outside Vitest

## Naming Conventions

**Files:**
- Route Handlers: always `route.ts` inside a directory named for the URL segment (Next.js App Router convention) — e.g. `src/app/api/ingest/batch/route.ts` → `POST /api/ingest/batch`.
- Library modules: lowercase-kebab or single-word `.ts` files grouped by domain subdirectory (`risk/compute.ts`, `validation/ingest-schema.ts`).
- Tests: `<concern>.<scope>.test.ts` (e.g. `ingest.batch.test.ts`, `realtime.risk-scores.test.ts`) — dot-separated concern then scope.
- Migrations: `<UTC timestamp>_<snake_case description>.sql`.

**Directories:**
- `src/app/api/<segment>/`: one directory per API URL path segment, nested to match the URL (`ingest/batch/` → `/api/ingest/batch`).
- `src/lib/<domain>/`: one directory per logical domain (`risk`, `supabase`, `validation`) — not per technical layer.

## Where to Add New Code

**New API endpoint:**
- Create `src/app/api/<segment>/route.ts` exporting `GET`/`POST`/etc. Follow the auth-before-validate pattern from `src/app/api/ingest/route.ts` for any device-authenticated write endpoint.
- Add a matching test file in `tests/` named `<segment>.route.test.ts`.

**New risk-scoring feature/threshold:**
- Add the named constant to `src/lib/risk/thresholds.ts` with a comment citing its source decision.
- Extend the computation and `RiskBreakdown` shape in `src/lib/risk/compute.ts`.
- Add/extend `tests/risk.compute.test.ts`.

**New payload validation:**
- Add or extend a Zod schema in `src/lib/validation/ingest-schema.ts`, exporting both the schema and its inferred type.

**New DB table/column:**
- Add a new timestamped file in `supabase/migrations/`. Regenerate `src/lib/supabase/types.ts` from the Supabase CLI afterward rather than hand-editing it.

**Shared utilities:**
- Place under `src/lib/<new-domain>/` following the existing domain-grouped pattern (not a generic `utils/` dump).

**Frontend/dashboard code:**
- Not yet ported into `src/app/`. Until that migration happens, dashboard prototyping lives in `frontend-design/` (static HTML/CSS/JS, has its own `AGENTS.md`).

## Special Directories

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No

**`supabase/.temp/`:**
- Purpose: Supabase CLI local state (linked project ref, version pins)
- Generated: Yes
- Committed: No (gitignored via `supabase/.gitignore`)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No

**`.vercel/`:**
- Purpose: Vercel CLI project link metadata
- Generated: Yes
- Committed: No (contains only `README.txt`/`project.json`, no secrets checked in)

**`.planning/`:**
- Purpose: GSD workflow planning artifacts and codebase maps
- Generated: Partially (mapper agents write into `.planning/codebase/`)
- Committed: Yes

---

*Structure analysis: 2026-09-25*
