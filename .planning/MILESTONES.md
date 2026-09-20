# Milestones

## v1.0 MVP (Shipped: 2026-09-20)

**Phases completed:** 4 phases, 11 plans, 21 tasks

**Key accomplishments:**

- Next.js 16 App Router scaffold with a service-role Supabase client, nested-payload zod schema, and a quoted-camelCase devices/readings migration ready to push
- Migration pushed to a live Supabase project, types generated from the real schema, and the v1 device seeded with a 256-bit random API key
- POST /api/ingest wired end-to-end against the live Supabase project — 10 tests pass with zero mocking, including a real anon-key Realtime subscriber proving the RLS boundary and camelCase wire contract
- Backend deployed to Vercel production at sepcare.vercel.app — the full ingest-to-Realtime pipeline confirmed working against the real public URL, not just local dev
- risk_scores table (reading_id-as-PK FK-cascade, status+check, breakdown jsonb, RLS, Realtime) plus readings composite index, pushed to live Supabase with regenerated types
- Composite risk-scoring engine (D-13 temperature threshold + Liebermeister HR-temp proportionality + D-14 activity-decline trend) computed via a timestamp-relative causal window and wired synchronously into POST /api/ingest, proven against the full D-12 breadth-gating matrix plus structural prohibitions P1/P2
- Live risk_scores Realtime delivery + RLS cross-device boundary + time-range join query, all automated
- Unique constraint on `readings("deviceId","timestamp")` authored, pushed live to Supabase, and confirmed with a clean type regeneration and passing build.
- POST /api/ingest/batch with sort+JS-dedupe, single bulk upsert-ignore-duplicates, sequential scoring, and D-27/D-28 backfill rescore over `[batch_min, batch_max+12h]` — full ING-03 edge/prohibition matrix covered by 8 passing integration tests.
- Single-reading POST /api/ingest now upsert-ignores duplicate deviceId+timestamp retries via `.upsert(..., {onConflict, ignoreDuplicates:true}).maybeSingle()`, matching the batch route's D-33/D-34 replay-safety contract
- Public no-cache historical readings endpoint delivers every bounded nb-001 vital in timestamp order with its stored risk explanation or an explicit risk gap.

---
