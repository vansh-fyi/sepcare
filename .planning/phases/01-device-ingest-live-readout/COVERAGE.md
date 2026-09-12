# Phase 1 — Supabase API Coverage Decision Matrix

> Produced per the API Coverage Decision Checkpoint (`workflow.api_coverage_gate=true`).
> Detector confirmed `detected: true` for this phase (Supabase integration). Every capability
> starts as `INTEGRATE` by default; this matrix is the subtraction record — every `OPT-OUT`
> row carries a one-line reason.

| Capability | Decision | Reason |
|---|---|---|
| Project provisioning (dashboard-created project) | INTEGRATE | Required to have a live Postgres instance at all (STOR-01, READ-01). Account/project creation is `user_setup` (Plan 02); everything downstream is CLI-automated. |
| CLI project linking (`supabase link`) | INTEGRATE | Required so `supabase db push`/`gen types` target the right project (Plan 02). |
| Migrations / schema push (`supabase db push`) | INTEGRATE | Applies the `devices`/`readings` schema, RLS, and publication (STOR-01, DEV-01) — the mandatory Schema Push Detection Gate task (Plan 02). |
| `supabase gen types typescript` | INTEGRATE | Generates `src/lib/supabase/types.ts` from the live schema instead of hand-typed row types, avoiding drift (Plan 02). |
| Postgres table CRUD (insert via service-role, select via anon) | INTEGRATE | Core of ING-01/STOR-01 (insert) and READ-01 (select via RLS) (Plan 03). |
| Row Level Security (RLS) policies | INTEGRATE | D-08's anon-scoped read-only policy is the actual security boundary for READ-01 (Plan 01/03). |
| Realtime — Postgres Changes (`postgres_changes` on `readings`) | INTEGRATE | D-07 locks the live-readout read path to direct Realtime subscription, not a REST poll (Plan 01/03/04). |
| Service-role / anon API key model | INTEGRATE | Service-role key does server-side writes; anon key is the RLS-scoped read credential (Plan 01 Pattern 2, Plan 03). |
| Supabase Auth (hosted user/session auth product) | OPT-OUT | v1 device auth is a custom `devices`-table check (D-04), not the Supabase Auth product; caregiver/dashboard accounts are ACC-V2-01, explicitly deferred. |
| Realtime Presence / Broadcast channels | OPT-OUT | Those channels serve multi-client sync features (e.g., shared cursors); this phase only needs Postgres Changes for one device's readings. |
| Storage (file/blob buckets) | OPT-OUT | No file/blob assets exist in this phase's data model — only structured vitals rows. |
| Edge Functions | OPT-OUT | CLAUDE.md locks server logic to Next.js API routes on Vercel (route handlers); Edge Functions would duplicate that responsibility with no phase-1 benefit. |
| Database Webhooks | OPT-OUT | No downstream system needs to react to inserts via a Supabase-managed webhook in Phase 1; Phase 2's risk-scoring trigger point is not decided here. |
| Postgres extensions (pg_cron, pgvector, etc.) | OPT-OUT | No scheduled jobs or vector search are needed for a single-device live-readout pipeline. |
| Branching (Supabase preview branches) | OPT-OUT | A single free-tier project is sufficient for v1; branching is a paid-tier/dev-workflow feature not required here. |
| Vault (secrets management) | OPT-OUT | The two required secrets (service-role key, DB password) already live in `.env.local` / Vercel env vars; Vault would duplicate that for no phase-1 benefit. |
| Backups / PITR configuration | OPT-OUT | Free-tier default backup behavior is accepted as-is; no custom backup configuration is needed for a v1 demo-scoped project. |

**Note on Postgres identifier casing (Pitfall 1):** Not a capability row — it is a schema-authoring decision (quoted camelCase columns, Plan 01) required for the INTEGRATE'd Realtime row to carry the correct wire vocabulary (D-09), not a separate Supabase feature to opt in/out of.
