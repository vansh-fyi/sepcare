# Walking Skeleton — SepCare Backend

**Phase:** 1
**Generated:** 2026-09-12

## Capability Proven End-to-End

> One sentence: the smallest user-visible capability that exercises the full stack.

An ESP32-shaped device POST (authenticated by a static per-device API key) is validated, stored
in Supabase Postgres with byte-identical fields, and delivered live to an anon-key Realtime
subscriber with the correct camelCase wire vocabulary — the full device -> auth -> storage -> live
read pipeline, for one provisioned device, deployed on Vercel's free tier.

**Adaptation note (backend-only repo):** this repository (`backend` branch) has no UI — the actual
frontend is a separate Next.js app built by teammates on `main`. The Walking Skeleton template's
usual "one real UI interaction" element is substituted with **one real external-consumer
interaction**: an automated `supabase-js` anon-key Realtime subscriber test (`tests/realtime.subscribe.test.ts`,
Plan 03; re-run against the deployed URL in `tests/e2e-deployed.test.ts`, Plan 04) that proves an
external consumer actually receives a correctly-cased live reading after a device POST. This is
the closest equivalent this repo can produce to "a user can see something happen."

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | Locked by CLAUDE.md/PROJECT.md; App Router Route Handlers are current best practice for a 2026 greenfield API-only backend (RESEARCH.md State of the Art). |
| Data layer | Supabase (Postgres) — quoted camelCase columns on `readings` | D-04/D-09; quoted identifiers make the Postgres row shape byte-identical to the Realtime wire contract (RESEARCH.md Pitfall 1), avoiding a translation layer the frontend would otherwise have to own. |
| Device auth | Static per-device API key checked against a `devices` table via the service-role client (D-04, D-05, D-06) | Table-based (not env-var) so multi-device (DEV-V2-01) needs no future migration; header-based (`X-API-Key`) keeps `Authorization` free for a later bearer/JWT scheme. |
| Live read path | Direct Supabase Realtime (Postgres Changes) subscription, RLS-scoped to the single device (D-07, D-08) | Avoids polling and Vercel cold-starts; deliberate, discussed decision — not re-litigated (CONTEXT.md `<specifics>`). |
| Deployment target | Vercel (Hobby/free tier) | Free-tier hosting constraint (CLAUDE.md); zero-config Next.js detection, no `vercel.json` needed (RESEARCH.md Open Question 2). |
| Directory layout | `src/app/api/*/route.ts` (route handlers), `src/lib/supabase/*` (clients + generated types), `src/lib/validation/*` (zod schemas), `supabase/migrations/*.sql` (schema), `tests/*.test.ts` (vitest) | RESEARCH.md "Recommended Project Structure" — the only concrete structure available since this repo has zero prior code (01-PATTERNS.md). |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js App Router + TypeScript, ESLint, vitest) — Plan 01
- [x] Routing — `POST /api/ingest` (real path), `GET /api/health` (smoke-check) — Plan 01 (health), Plan 03 (ingest)
- [x] Database — real write (`INSERT INTO readings` on ingest) AND real read (RLS-scoped `SELECT`/Realtime subscription) — Plan 02 (provision+push+seed), Plan 03 (wire+verify)
- [x] External-consumer interaction (substitutes "UI interaction" — see Adaptation note above) — anon Realtime subscriber test — Plan 03, re-verified in Plan 04
- [x] Deployment — Vercel production deployment with wired env vars, verified via `/api/health` and a deployed end-to-end smoke test — Plan 04

## Out of Scope (Deferred to Later Slices)

- Sepsis-risk scoring / Green-Amber-Red status (Phase 2, RISK-01/02/03, STOR-02)
- Offline-buffered batch sync endpoint (Phase 3, ING-03)
- Historical trend range queries (Phase 4, READ-02)
- Device registration/provisioning UI (DEV-V2-02) — device pairing stays a one-time seed script (D-06)
- Multi-device support beyond the single-row `devices` table shape (DEV-V2-01)
- API key rotation/hashing policy (deferred per CONTEXT.md `<deferred>`)
- Caregiver/dashboard user accounts (ACC-V2-01)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its
architectural decisions:

- Phase 2: Automatic Risk Scoring & Status — score every stored reading, persist + expose Green/Amber/Red via the same read API established here.
- Phase 3: Offline-Buffered Batch Sync — accept buffered readings with original timestamps at a new `/api/ingest/batch` endpoint (D-03), reusing this phase's auth/validate/store pattern.
- Phase 4: Historical Trends API — a caller-specified time-range read endpoint, reusing this phase's schema and vocabulary.
