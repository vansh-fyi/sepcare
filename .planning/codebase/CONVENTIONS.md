# Coding Conventions

**Analysis Date:** 2026-09-25

## Naming Patterns

**Files:**
- Route handlers: `src/app/api/<resource>/route.ts` (Next.js App Router convention), nested resources use subdirectories, e.g. `src/app/api/ingest/batch/route.ts`.
- Library modules: kebab/lowercase directory names grouped by domain — `src/lib/risk/compute.ts`, `src/lib/risk/thresholds.ts`, `src/lib/supabase/admin.ts`, `src/lib/validation/ingest-schema.ts`.
- Test files: `tests/<feature>.<aspect>.test.ts`, e.g. `tests/ingest.route.test.ts`, `tests/ingest.auth.test.ts`, `tests/ingest.batch.test.ts`, `tests/risk.compute.test.ts`, `tests/readings.route.test.ts`, `tests/realtime.risk-scores.test.ts`.
- Test helpers live in `tests/helpers/`, e.g. `tests/helpers/cleanup.ts`.

**Functions:**
- camelCase throughout: `computeAndPersistRiskScore`, `fetchWindow`, `fetchHistory`, `parseEpochMilliseconds`, `deleteReadingByTimestamp`.
- Route handlers are named exports matching the HTTP verb: `export async function POST(...)`, `export async function GET(...)` in `src/app/api/*/route.ts`.
- Small private helper functions (not exported) sit above the exported handler in the same file, e.g. `json()`, `invalidQuery()`, `parseEpochMilliseconds()` in `src/app/api/readings/route.ts`.

**Variables:**
- camelCase for local variables and destructured DB fields (`deviceId`, `insertedReading`, `abnormalCount`).
- Database columns are also camelCase in the `readings` table (`deviceId`, `heartRate`, `activityScore`) — this is a deliberate Postgres/Supabase choice, not JS convention leaking in; queries select/filter using the same camelCase field names (`src/lib/risk/compute.ts:85-90`).
- SCREAMING_SNAKE_CASE for module-level constants, especially thresholds: `TEMP_FEVER_C`, `HR_TEMP_RATIO_MIN`, `TREND_WINDOW_MS`, `BASELINE_MIN_MS` (`src/lib/risk/thresholds.ts`); also `PAGE_SIZE`, `MAX_RANGE_MS`, `WINDOW_PAGE_SIZE` in route/lib files.

**Types:**
- PascalCase interfaces and type aliases: `TargetReading`, `RiskBreakdown`, `WindowRow` (`src/lib/risk/compute.ts`), `HistoryRisk`, `HistoryRow`, `ParsedEpoch` (`src/app/api/readings/route.ts`).
- Zod-inferred types use `z.infer<typeof X>` and are exported alongside the schema: `export type IngestPayload = z.infer<typeof IngestSchema>` (`src/lib/validation/ingest-schema.ts`).
- Discriminated-union-style result types for structured error returns, e.g. `type ParsedEpoch = { value: number } | { error: NextResponse }` with a `"error" in result` narrowing check at call sites.

## Code Style

**Formatting:**
- No `.prettierrc` present — relies on `eslint-config-next` defaults (`eslint.config.mjs`). 2-space indentation, double quotes, semicolons used throughout observed source.

**Linting:**
- ESLint flat config (`eslint.config.mjs`) extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.
- Run via `npm run lint` → `eslint`.
- TypeScript strict mode is enabled (`tsconfig.json`: `"strict": true`), so avoid `any`; the codebase favors `unknown` with explicit narrowing (e.g. `raw: unknown` in `src/app/api/ingest/route.ts:26`, cast via `as Record<string, unknown>`).

## Import Organization

**Order:**
1. Framework imports first (`next/server`: `NextRequest`, `NextResponse`).
2. Internal `@/lib/...` imports next, grouped by concern (supabase client, validation schema, risk logic).
3. Relative imports (test helpers, e.g. `./helpers/cleanup`) last, primarily in test files.

**Path Aliases:**
- `@/*` maps to `src/*` (`tsconfig.json` `paths`, mirrored in `vitest.config.ts` via `resolve.alias`). Always import internal modules as `@/lib/...`, `@/app/...` — never deep relative paths like `../../lib/...` outside test files.

## Error Handling

**Patterns:**
- API routes never let internal exceptions propagate as unhandled 500s. `request.json()` parse failures are caught explicitly and mapped to `400` (`src/app/api/ingest/route.ts:27-34`).
- Auth check happens **before** body validation ("auth-before-validate ordering") to avoid leaking payload-shape information to unauthenticated callers — documented inline as a deliberate decision (`src/app/api/ingest/route.ts:9-13`).
- Zod's `safeParse` (never `parse`) is used for all payload validation, returning `{ error: "Invalid payload", details: parsed.error.issues }` with `400` on failure (`src/lib/validation/ingest-schema.ts`, `src/app/api/ingest/route.ts:55-61`).
- Non-critical failures are isolated with local try/catch so they don't fail the overall request: risk scoring runs synchronously after a reading insert, but a scoring exception is caught, logged via `console.error`, and the request still returns `201` (`src/app/api/ingest/route.ts:97-107`) — comment marks this as decision D-23/D-24.
- DB errors from Supabase calls are checked explicitly (`const { data, error } = await supabaseAdmin...; if (error) throw error;`) rather than relying on thrown exceptions from the client (`src/lib/risk/compute.ts:93`, `src/app/api/readings/route.ts:82`).
- Route-level try/catch wraps DB-dependent work and converts failures to a `500` JSON body with a stable `error` message, logging full context via `console.error` first (`src/app/api/readings/route.ts:135-140`).
- Idempotency over errors: duplicate inserts are handled via `upsert(..., { ignoreDuplicates: true })` against a unique constraint rather than catching a constraint-violation error, so retried device POSTs are safe no-ops (`src/app/api/ingest/route.ts:65-84`, decision D-33/D-34).
- Query-parameter validation returns field-specific error helpers (`invalidQuery(field, reason, error)`) that both build the JSON response and emit a dev-only `console.warn` (suppressed in production) (`src/app/api/readings/route.ts:31-38`).

## Logging

**Framework:** Plain `console.error` / `console.warn` — no logging library.

**Patterns:**
- `console.error` used for unexpected failures that are caught and converted to error responses, always with structured context objects (not string concatenation): `console.error("Reading history query failed", { deviceId, from, to, error })`.
- `console.warn` used for expected-but-invalid client input, gated behind `process.env.NODE_ENV !== "production"` to avoid noisy production logs for routine bad requests (`src/app/api/readings/route.ts:31-33`).

## Comments

**When to Comment:**
- Heavy use of block comments above functions/constants that cite specific design decision IDs from planning docs (e.g. `D-05`, `D-10`, `D-33`, `STOR-01`, `RISK-03`) and named "pitfalls" — this codebase treats decision provenance as part of the code, not just commit history. New code in this repo should follow the same practice: reference the relevant decision/requirement ID when a non-obvious choice is made.
- Comments explain *why*, not *what* — e.g. explaining why `.maybeSingle()` is used instead of `.single()`, why pagination is required despite Supabase's `max_rows` cap, why pagination page size matters (`src/lib/risk/compute.ts:57-65`).
- No JSDoc/TSDoc tags (`@param`, `@returns`) are used; comments are prose-style block comments (`/** ... */`) directly above exported functions/types/constants.

## Function Design

**Size:** Route handlers are kept to a single linear flow of guard clauses (auth check → parse → validate → DB write → response), each early-returning on failure. Helper logic (parsing, formatting) is factored into small top-level functions above the handler rather than inlined.

**Parameters:** Functions take primitive/plain-object parameters directly rather than a generic options bag when there are 2-3 args (e.g. `fetchWindow(deviceId, fromTimestamp, toTimestamp)`, `parseEpochMilliseconds(value, field)`); prefer explicit typed interfaces for larger inputs (`TargetReading`, `HistoryRow`).

**Return Values:** Prefer typed union "result" objects to signal success/error state to callers within the same module (`ParsedEpoch = { value } | { error }`), narrowed via `if ("error" in parsed) return parsed.error;`. Async DB-touching functions return typed plain objects/arrays, never raw Supabase response shapes.

## Module Design

**Exports:** Each `src/lib/**` file exports named functions/constants/types only — no default exports observed. Route files export only the HTTP-verb-named handler functions (`POST`, `GET`).

**Barrel Files:** None present — every import references the specific module file directly (e.g. `@/lib/risk/compute`, `@/lib/risk/thresholds`), not an aggregating `index.ts`.

**Security boundary as a module convention:** `src/lib/supabase/admin.ts` is documented as the *sole* place a service-role Supabase client is constructed, and is explicitly forbidden from being imported by any `"use client"` file — treat this as an enforced architectural rule, not just a comment, when adding new client-facing code.

---

*Convention analysis: 2026-09-25*
