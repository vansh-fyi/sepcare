# Phase 1: Device Ingest & Live Readout - Pattern Map

**Mapped:** 2026-09-12
**Files analyzed:** 6 (new)
**Analogs found:** 0 / 6 (greenfield repo — confirmed, see Metadata)

## Summary

This repository has **no existing application code** to pattern-match against. Verified via `git ls-files` (tracked files only, excluding `.planning/`, `context/`, `docs/`):

```
.gitignore
index.html   (unrelated static file — no framework, no JS logic, not a code pattern source)
hardware/parts-list.md
```

There is no `package.json`, no `next.config.*`, no `src/` directory, no `supabase/` directory, and no prior route handlers, services, or models anywhere in the repo (`backend` branch or otherwise, per RESEARCH.md's Runtime State Inventory, independently reconfirmed here). `index.html` is a standalone static page unrelated to the Next.js/Supabase stack this phase builds and contains no reusable patterns (no framework, no auth, no data access code).

**Conclusion: every file in this phase has no in-repo analog.** The planner must build directly from RESEARCH.md's "Architecture Patterns" section (Pattern 1: Route Handler Auth-Then-Validate, Pattern 2: Service-Role Client Isolation, Pattern 3: RLS) and its "Code Examples" section (full schema + route handler code), which are already concrete and directly copy-pasteable. Do not spend planning time searching for codebase analogs for this phase.

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|-----------------|----------------|
| `src/app/api/ingest/route.ts` | route/controller | request-response | none | no analog |
| `src/lib/supabase/admin.ts` | service/provider | CRUD (client factory) | none | no analog |
| `src/lib/supabase/types.ts` | model/config | — (type defs) | none | no analog |
| `src/lib/validation/ingest-schema.ts` | utility (schema) | transform | none | no analog |
| `supabase/migrations/*.sql` (devices, readings, RLS, publication) | migration | CRUD/event-driven (Realtime) | none | no analog |
| `package.json` / `next.config.*` / project scaffold | config | — | none | no analog |
| `tests/ingest.route.test.ts`, `tests/ingest.auth.test.ts`, `tests/realtime.subscribe.test.ts` | test | request-response / event-driven | none | no analog |

## No Analog Found

All files above have no close (or partial) match in the codebase. Reason is uniform: greenfield repo, no prior Next.js/TypeScript/Supabase code exists in any branch state visible here.

**Planner should use RESEARCH.md directly** for each of these — it already contains concrete, ready-to-copy code:

| File | Source in RESEARCH.md |
|------|------------------------|
| `src/app/api/ingest/route.ts` | "Pattern 1: Route Handler — Auth Then Validate, Fail Closed" (full working example, lines ~176-244) |
| `src/lib/supabase/admin.ts` | "Pattern 2: Service-Role Client Isolation" (full working example, lines ~250-260) |
| `src/lib/validation/ingest-schema.ts` | The `IngestSchema` zod object embedded in Pattern 1's example (extract into its own module per "Recommended Project Structure") |
| `supabase/migrations/*.sql` | "Code Examples → Minimal devices + readings schema" (full DDL: `devices`, `readings`, RLS policy, `alter publication`) + "Pattern 3: RLS" |
| RLS policy specifics | "Pattern 3: RLS — Anon Read-Only, Service-Role Bypass" |
| Realtime enablement | "Code Examples → Enabling Realtime Replication on the readings table" |

## Shared Patterns (from RESEARCH.md, not codebase)

Since there is no existing codebase pattern, the following RESEARCH.md-sourced conventions should be treated as this phase's **first-established** shared patterns, to which Phases 2-4 should conform:

### Auth-before-validate ordering
**Source:** RESEARCH.md Pattern 1 (Anti-Patterns section makes this explicit)
**Apply to:** All future ingest-style endpoints (Phase 3's `/api/ingest/batch`)
- Check `X-API-Key` against `devices` table first, return 401 immediately on failure.
- Only after auth succeeds, parse+validate JSON body with zod, return 400 on failure.
- Both failure paths return before any `INSERT`.

### Service-role client isolation
**Source:** RESEARCH.md Pattern 2
**Apply to:** Any file performing a server-side Supabase write
- Exactly one module, `lib/supabase/admin.ts`, constructs the service-role client using `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix).
- Never imported from a file reachable by a client bundle.

### Quoted camelCase Postgres columns
**Source:** RESEARCH.md Pitfall 1 + Code Examples schema
**Apply to:** All future tables whose rows are consumed via Realtime (per D-09's "one consistent vocabulary" requirement)
- `"deviceId"`, `"heartRate"`, `"spo2"`, `"temperature"`, `"activityScore"`, `"timestamp"` — quoted, camelCase, byte-identical to wire contract.

### Structured 400 error body via zod
**Source:** RESEARCH.md "Don't Hand-Roll" table + Pattern 1
**Apply to:** All future request-body validation (Phase 3 batch ingest, any future write endpoint)
- `zod.safeParse()` + `.error.issues` mapped into `{ error: "Invalid payload", details: [...] }`.

## Metadata

**Analog search scope:** entire git-tracked repository (`git ls-files`), excluding `.planning/`, `context/`, `docs/` per task instructions.
**Files scanned:** 3 tracked non-planning files (`.gitignore`, `index.html`, `hardware/parts-list.md`) — none are code analogs.
**Pattern extraction date:** 2026-09-12
**Verification method:** `git ls-files | grep -v -E '^\.planning/|^context/|^docs/'` — confirms no `package.json`, `src/`, `supabase/`, or any JS/TS source files are tracked in this repo as of this phase's planning.
