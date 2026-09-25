# External Integrations

**Analysis Date:** 2026-09-25

## APIs & External Services

**Device ingestion (inbound, custom):**
- ESP32 wearable devices push vitals directly to this backend over HTTP/WiFi — this repo does not call out to the device, it only receives from it
  - `POST /api/ingest` (`src/app/api/ingest/route.ts`) - single-reading ingest
  - `POST /api/ingest/batch` (`src/app/api/ingest/batch/route.ts`) - offline-buffered batch sync (up to 500 readings/batch, Zod-capped in `src/lib/validation/ingest-schema.ts`)
  - Auth: custom `X-API-Key` header checked against the `devices` table (`device_id` + `api_key` columns) BEFORE body parsing/validation (deliberate auth-before-validate ordering to avoid a timing side-channel — see route comments)
  - No third-party SDK involved; this is a bespoke REST contract, not an external API call

**Dashboard read API (outbound consumer, external to this repo):**
- `GET /api/readings` (`src/app/api/readings/route.ts`) - paginated vitals + risk-score history for a single hardcoded device (`nb-001`), consumed by a separately-built dashboard (static HTML today, planned Next.js port per `.claude/CLAUDE.md`)
- `GET /api/health` (`src/app/api/health/route.ts`) - deployment smoke-check endpoint, no auth

## Data Storage

**Databases:**
- Supabase-hosted Postgres - sole datastore for this service
  - Connection: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only client, `src/lib/supabase/admin.ts`)
  - Client: `@supabase/supabase-js` (`createClient`, `persistSession: false`)
  - Schema/migrations: `supabase/migrations/*.sql`
    - `devices` table (device_id PK, api_key, RLS enabled, no anon policy — only service-role can query)
    - `readings` table (quoted camelCase columns: `deviceId`, `timestamp` epoch-ms, `heartRate`, `spo2`, `temperature`, `activityScore`; unique constraint on `(deviceId, timestamp)` added in `20260919105432_readings_unique_device_timestamp.sql`; composite index `readings_deviceid_timestamp_idx`)
    - `risk_scores` table (1:1 with `readings` via `reading_id` PK, `status` check constraint in `('green','amber','red')`, `breakdown` jsonb)
  - Local dev: Supabase CLI project linked (`supabase/config.toml`, project_id `agent-a06b6a6aaa57d516d`); local API port 54321

**File Storage:**
- None detected — no Supabase Storage or other blob storage usage found

**Caching:**
- None — `src/app/api/readings/route.ts` explicitly sets `Cache-Control: no-store` on all responses

## Authentication & Identity

**Auth Provider:**
- Custom, not a third-party identity provider
  - Device-to-backend: per-device `X-API-Key` header checked against `devices.api_key` in Postgres (service-role client bypasses RLS to do this lookup)
  - Backend-to-dashboard: no auth on `GET /api/readings` or `GET /api/health`; read access instead scoped by Supabase Row Level Security (`anon` role restricted to `deviceId = 'nb-001'` on `readings` and `risk_scores` tables) if the dashboard queries Supabase directly with the anon key, or via the unauthenticated `/api/readings` route
  - Device provisioning is manual/offline: `scripts/seed-device.mjs` generates a random 32-byte hex API key and inserts one `devices` row (v1 is single-device only, hardcoded as `nb-001` in `src/app/api/readings/route.ts`)

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry/error-tracking SDK detected

**Logs:**
- `console.error` / `console.warn` calls inline in route handlers (e.g. scoring failures, invalid queries) — no structured logging or log aggregation service configured

## CI/CD & Deployment

**Hosting:**
- Vercel - project linked via `.vercel/project.json` (`projectName: "sepcare"`, org `team_1IJYkjIrTaH9se14OZp6hN4H`)
- Free-tier constraint stated in `.claude/CLAUDE.md`: Vercel for backend, Supabase for storage/DB/realtime, no paid infrastructure

**CI Pipeline:**
- None detected — no `.github/workflows/` or other CI config found in the repo root

## Environment Configuration

**Required env vars:**
- `SUPABASE_URL` - server-only
- `SUPABASE_SERVICE_ROLE_KEY` - server-only, bypasses RLS (must never reach client bundles — enforced by convention, see `src/lib/supabase/admin.ts` header comment)
- `NEXT_PUBLIC_SUPABASE_URL` - client-safe
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - client-safe
- `DEVICE_API_KEY` - test-only, used by `tests/*.test.ts` to authenticate as the seeded `nb-001` device

**Secrets location:**
- `.env.local` (gitignored) for local dev; no `.env.local` committed
- `.env.example` documents required var names only, no values
- Vercel project environment variables (not inspectable from this repo)

## Webhooks & Callbacks

**Incoming:**
- None in the webhook sense — `/api/ingest` and `/api/ingest/batch` function as device-push endpoints but are custom REST, not third-party webhook receivers

**Outgoing:**
- Supabase Realtime: `readings` and `risk_scores` tables are added to the `supabase_realtime` publication (migrations), enabling Postgres change-stream subscriptions (`postgres_changes`) for realtime dashboard updates — confirmed by `tests/realtime.subscribe.test.ts` and `tests/realtime.risk-scores.test.ts`, which subscribe via `@supabase/supabase-js` using the anon client

---

*Integration audit: 2026-09-25*
