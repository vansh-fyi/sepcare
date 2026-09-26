# Technology Stack

**Analysis Date:** 2026-09-25

## Languages

**Primary:**
- TypeScript (strict mode) - all application code under `src/`, `tests/`, `scripts/`
  - `tsconfig.json`: `target: ES2017`, `strict: true`, `moduleResolution: bundler`, path alias `@/* -> ./src/*`

**Secondary:**
- SQL - Postgres migrations in `supabase/migrations/*.sql`
- JavaScript (ESM, `.mjs`) - one-off operational scripts: `scripts/seed-device.mjs`, `scripts/check-device-seeded.mjs`

## Runtime

**Environment:**
- Node.js (local dev observed: v25.8.2; no `.nvmrc`/`engines` field pinning a version — untracked)
- Next.js server runtime (Vercel serverless/edge functions), configured via `next.config.ts` (no custom overrides — default config)

**Package Manager:**
- npm (evidenced by `package-lock.json`)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 16.3.5 (App Router) - full backend service; API routes under `src/app/api/*/route.ts`, `package.json`
- React 19.2.8 / React DOM 19.2.8 - Phase 6 (06-01) begins building real UI directly in this repo: `src/app/design-system/*` sample routes, `src/components/ui/*` shadcn components
- Tailwind CSS v4.3.3 (`@tailwindcss/postcss`) - CSS-first `@theme` token pipeline, no `tailwind.config.js`; single token block in `src/app/globals.css` (Phase 6, 06-01)
- shadcn/ui (CLI, dev-only, invoked via `npx`) + Radix primitives (via the unified `radix-ui` meta-package, itself pinned to `@radix-ui/react-slot@1.3.3`) - component scaffolding for `src/components/ui/*` (Phase 6, 06-01); every `add`/`init` invocation targets the Radix base, not the CLI's newer Base UI default
- `class-variance-authority` 0.7.1 - finite, typed CVA variant unions for shadcn components (Phase 6, 06-01)
- `cn` 0.4.0 (github.com/shadcn-ui/cn) - `cn()` className-merge helper, re-exported from `src/lib/utils.ts`; replaces the shadcn-standard `clsx`+`tailwind-merge` combo (Phase 6, 06-01)
- `tw-animate-css` 1.4.0 - animation utility classes, imported directly in `globals.css` (supersedes the deprecated `tailwindcss-animate` config-file plugin)
- `next/font/google` (`Inter`) - active font, replacing the `create-next-app` default `Geist`/`Geist_Mono` pair (Phase 6, 06-01, D-05)

**Testing:**
- Vitest 4.1.11 - `vitest.config.ts`, `environment: "node"`, tests in `tests/*.test.ts`
  - Loads `.env.local`-equivalent vars via `loadEnv("test", ...)` since Vitest doesn't auto-load them like Next.js does
  - Tests run against the **live Supabase project** — no mocking (see `vitest.config.ts` comment)

**Build/Dev:**
- ESLint 9 (flat config) - `eslint.config.mjs`, extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- TypeScript 5.x compiler (`noEmit: true`, type-checking only; Next.js handles the actual build/transpile)

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` ^2.116.0 - sole database/realtime client, used exclusively via a server-only admin wrapper (`src/lib/supabase/admin.ts`)
- `zod` ^4.6.2 - runtime payload validation for all ingest endpoints (`src/lib/validation/ingest-schema.ts`)

**Infrastructure:**
- None beyond Supabase client and Next.js itself — this is an intentionally minimal dependency surface (free-tier constraint per `.claude/CLAUDE.md`)

## Configuration

**Environment:**
- Env vars loaded via `.env.local` (gitignored) for local dev; `.env.example` documents the required shape (no values)
- Required vars (from `.env.example` and `src/lib/supabase/admin.ts`):
  - `SUPABASE_URL` (server-only)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, never imported into client-bundled code — see admin.ts header comment)
  - `NEXT_PUBLIC_SUPABASE_URL` (client-safe)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-safe)
  - `DEVICE_API_KEY` (used by tests only, per `tests/realtime.subscribe.test.ts`)
- `.env`, `.env*`, `.env*.local` are all gitignored (`.gitignore`)

**Build:**
- `next.config.ts` - default Next.js config, no customization
- `tsconfig.json` - strict TypeScript, Next.js plugin enabled, path alias `@/*`
- `eslint.config.mjs` - Next.js flat-config presets

## Platform Requirements

**Development:**
- Node.js + npm
- Supabase CLI (project linked locally — see `supabase/config.toml`, `supabase/.temp/*`) for local Postgres/migrations
- `.env.local` populated with Supabase project credentials to run tests (which hit the live project, not a local emulator, per `vitest.config.ts`)

**Production:**
- Vercel (project linked: `.vercel/project.json`, `projectName: "sepcare"`) — Next.js API routes deployed as serverless functions
- Supabase (hosted Postgres + Realtime) as the sole datastore
- `maxDuration = 60` explicitly set on `src/app/api/ingest/batch/route.ts` to guard against unconfirmed platform timeout defaults on Vercel Fluid Compute

---

*Stack analysis: 2026-09-25*
