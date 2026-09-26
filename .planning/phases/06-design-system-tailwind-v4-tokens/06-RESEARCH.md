# Phase 6: Design System (Tailwind v4 Tokens) - Research

**Researched:** 2026-09-26
**Domain:** Tailwind CSS v4 `@theme` token architecture + shadcn/ui (Radix) component layer on Next.js 16 (Turbopack)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Tailwind v4 + the `@theme` token set is installed directly into the existing Next.js app on `main` (the same repo/branch backend already lives in) — not a standalone/separate build. This directly satisfies the roadmap's "compiles cleanly in a real `next build`" success criterion.
- **D-02:** The ≥3 required sample validation pages (DSYS-02) are real Next.js App Router routes (e.g. `app/design-system/*`), not static HTML files — they are styled with the actual compiled tokens and actual shadcn-based components, not a mockup.
- **D-03:** Canonical color/type reference is Figma Segue 3.0 — the user loves the colors/fonts used there and wants them "built a little differently" (i.e. re-derived as a proper semantic Tailwind v4 token layer, not copied 1:1 as raw values).
- **D-04:** Pink is deliberately moved away from as the dominant/brand palette, but Figma's pink shades are specifically reused for the **Critical/Red status color only**. Brand/interaction stays blue, Safe stays green, Caution stays amber.
- **D-05:** Font stack: keep what's already used in the current salvaged UI (Inter, per `frontend-design/design-system/tokens.css`).
- **D-06:** Build a real component layer in Phase 6, not tokens-only — a finite set of typed variants (agent can't invent e.g. a `ghost` variant that doesn't exist), plus a `DESIGN.md`-style doc per component.
- **D-07:** Component base is **shadcn/ui + Radix**, not fully custom-built.
- **D-08:** Phase 6's required component set is exactly: **Button** (primary/secondary/tertiary/critical), **Card** (surface container), **StatusPill/Badge** (safe/caution/critical), **Input**. Composite/domain components are deferred.
- **D-09:** Icons: the salvaged `frontend-design/design-system/icons.js` (40+ SVG icon set, 24px outline, 1.75px stroke) can be reused directly, ported to a React component.
- **D-10:** The 3 required sample pages are: (1) Green/Amber/Red StatusPill + Card variants side by side, (2) empty-state and loading-state treatments for a Card, (3) nested composition — Buttons/Inputs inside a Card inside a page layout.
- **D-11 (roadmap flag, not decided here):** User wants to skip Phase 7's static HTML prototype and build the real Next.js frontend directly. Roadmap-level change, not actioned by this research.

### Claude's Discretion

- Exact Tailwind `@theme` token naming (e.g. `--color-brand-primary` vs `--color-primary`) — follow Tailwind v4 conventions, informed by the existing `--sc-*` naming in the salvaged `tokens.css`.
- Exact shadcn/ui component installation mechanics (CLI vs manual) and file layout under `src/components/ui/`.
- Whether the static-HTML `frontend-design/` tree's compiled CSS link is still needed once D-11 resolves.

### Deferred Ideas (OUT OF SCOPE)

- Roadmap restructuring (D-11) — not this phase's job to action.
- Composite/domain components (VitalCard, StatusHeroCard, BottomNav, TrendGraph, Settings screen) — deferred to the phase that builds full screens.
- Whether `frontend-design/`'s static HTML pages get updated to reference the new compiled tokens — moot pending D-11.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSYS-01 | Tailwind v4 token-based design system (`@theme` directive, no `tailwind.config.js`), distinct palette, informed by Figma + salvaged tokens | Verified current `@theme`/`@import "tailwindcss"`/PostCSS wiring for Next.js 16 + Turbopack (see Architecture Patterns, Code Examples); verified `tailwindcss@4.3.3` shipped `theme.css` namespace syntax directly from the package |
| DSYS-02 | ≥3 sample HTML pages exercising real component states, validated before full prototype | Verified shadcn CLI 4.21.0 `init`/`add` mechanics (see Common Pitfalls #1–#3) so the 4-component set can actually be installed and rendered as real App Router routes |
| DSYS-03 | Same token set reused across caregiver + parent visual language | Architecture Patterns section shows one `@theme` block in `globals.css` consumed by both route trees — no per-audience token duplication mechanism needed or recommended |
</phase_requirements>

## Summary

This phase's mechanics are almost entirely **new-version-vs-training-data traps**, not open design questions — the token values, component scope, and color math are already locked in `06-UI-SPEC.md`. The one load-bearing finding from this research session is that **shadcn CLI 4.21.0 no longer defaults to Radix**. Unpacking the actual installed-version tarball (`npm pack shadcn@4.21.0`) shows the `-b/--base` flag now offers `base` (Base UI, the new default/"Recommended"), `aria` (React Aria), or `radix` — Radix is opt-in only. D-07 ("shadcn/ui + Radix") is only satisfied if every `init`/`add` invocation explicitly passes `-b radix` (or the interactive "Radix UI" choice); the CLI's own defaults, and its `-d/--defaults` shortcut (`--template=next --preset=base-nova`), will silently produce Base UI components otherwise. This is exactly the class of "breaking change vs. training data" the phase brief asked to guard against, and it was caught only by reading the shipped package source, not by web search (which returned confidently wrong information on a related but different question — see Pitfall #4).

The second major finding is mechanical, not stylistic: the CLI has **no `--style` or `--base-color` flag at all** anymore. Style is hardcoded to `new-york` (confirmed — no prompt, no flag). Base color (`slate`, per the locked UI-SPEC) is only settable via an interactive prompt at `init` time, or via the separate non-interactive `shadcn migrate <name> --from <x> --to slate --yes` command run after a plain init, or by hand-authoring `components.json` (which the CLI's `add` command will read without re-prompting, and which is explicitly permitted under this phase's "Claude's Discretion"). The planner should pick one of these three paths rather than assume a `--base-color slate` flag exists.

Everything else — the Tailwind v4 `@theme` directive syntax, the Turbopack/PostCSS wiring for Next.js 16, the `tw-animate-css` vs. deprecated `tailwindcss-animate` swap, the paired `--text-*`/`--text-*--line-height` syntax the UI-SPEC already uses — was verified directly against the shipped `next@16.3.5` docs bundle and the shipped `tailwindcss@4.3.3` package, and all of it matches what's already locked in `06-UI-SPEC.md`. No changes to the UI-SPEC's token values or component contract are recommended; this research is about install/build mechanics, not design.

**Primary recommendation:** Hand-author `components.json` (style: `new-york`, base color: `slate`, css variables: `true`, RSC: `true`, TSX: `true`, `tailwind.config: ""`, `tailwind.css: "src/app/globals.css"`) rather than running interactive `init`, then run `npx shadcn@latest add button card badge input -b radix -y` to pull the Radix-based component files non-interactively — this sidesteps both gaps above (no base-color flag, wrong default primitive library) in one move, and matches the "manual/CLI at your discretion" latitude already granted in CONTEXT.md.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `@theme` design tokens (color/type/radius/shadow/spacing) | CDN / Static | Frontend Server (SSR) | Authored as CSS in `src/app/globals.css`, compiled by Next.js's Turbopack+PostCSS pipeline at build time into a static, code-split CSS asset served to every route — the Next.js server only owns the *authoring* location, not the runtime behavior |
| shadcn/ui component layer (Button/Card/Badge/Input, CVA variants) | Browser / Client | Frontend Server (SSR) | Radix primitives (focus management, ARIA state, pointer events) are inherently client-side; Next.js SSR only produces the initial server-rendered HTML shell before hydration |
| Sample validation pages (`app/design-system/*`) | Frontend Server (SSR) | Browser / Client | These are real App Router routes — Next.js server-renders the page shell; the nested Button/Input primitives inside them hydrate as Client Components |
| Icon system (`icons.js` → React `<Icon>`) | Browser / Client | — | Pure presentational SVG rendering in the DOM, no server responsibility |
| Font loading (Inter via `next/font/google`) | Frontend Server (SSR) | CDN / Static | Next.js self-hosts/subsets the font at build time (server-side concern); the resulting `.woff2` file is then served as a static asset |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `tailwindcss` | 4.3.3 [VERIFIED: npm registry, published 2026-07-16] | Utility CSS engine, `@theme` token compiler | Locked by D-01/DSYS-01; this is the only Tailwind major version with CSS-first `@theme` config |
| `@tailwindcss/postcss` | 4.3.3 [VERIFIED: npm registry, published 2026-07-16] | PostCSS plugin that Turbopack invokes to process Tailwind | Official, required install path per Next.js's own bundled docs — see Architecture Patterns |
| `shadcn` (CLI, dev-only) | 4.21.0 [VERIFIED: npm registry, published 2026-09-04 — matches UI-SPEC's stated version] | Scaffolds Button/Card/Badge/Input source files + `components.json` | Locked by D-07/D-06; not a runtime dependency, only a codegen CLI |
| `class-variance-authority` | 0.7.1 [VERIFIED: npm registry] | Finite, typed CVA variant unions for the 4 components | Already shadcn's own variant mechanism (D-06's "an agent can't invent a variant that doesn't exist" requirement maps directly onto CVA's discriminated variant keys) |
| `clsx` | 2.1.1 [VERIFIED: npm registry] | Conditional className joining | shadcn's generated `lib/utils.ts` `cn()` helper always composes `clsx` + `tailwind-merge` |
| `tailwind-merge` | 3.7.0 [VERIFIED: npm registry, published 2026-09-12] | De-duplicates conflicting Tailwind classes inside `cn()` | Same as above — required by every shadcn-generated component file's `cn()` import |
| `tw-animate-css` | 1.4.0 [VERIFIED: npm registry] | Animation utility classes shadcn now ships against | shadcn's own docs state `tailwindcss-animate` is deprecated in favor of this package for Tailwind v4 projects [CITED: ui.shadcn.com/docs/tailwind-v4] |
| `@radix-ui/react-slot` (+ per-component Radix packages pulled by `shadcn add`) | 1.3.3 [VERIFIED: npm registry] | Unstyled, accessible primitives underneath Button/Card/Badge/Input | Locked by D-07; confirmed to support React 19 via its own `peerDependencies` (`react: '^16.8 \|\| ... \|\| ^19.0'`) [VERIFIED: npm view @radix-ui/react-slot peerDependencies] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/font/google` (built into `next@16.3.5`, no separate install) | n/a | Self-hosts/subsets Inter per D-05 | Already the project's Next.js version; no config file needed, just an import in `layout.tsx` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn's new "Base UI" primitive layer (`-b base`, now the CLI default) | Radix (`-b radix`) | D-07 explicitly locks Radix — Base UI is a real, actively-maintained alternative but changing to it now would silently violate the locked decision and produce components with a different unstyled-primitive API than what D-06/D-08's variant contract assumes |
| Interactive `shadcn init` prompts | Hand-authored `components.json` + `shadcn add -b radix -y` | Interactive prompts can't be scripted deterministically for base color (no CLI flag exists) in an agent-driven, non-interactive execution context; hand-authoring is explicitly permitted under CONTEXT.md's "Claude's Discretion" |
| `tailwindcss-animate` | `tw-animate-css` | The former is shadcn's own documented-deprecated package for Tailwind v4 projects; using it would be building on a path shadcn itself is walking away from |

**Installation (recommended sequence — see Code Examples for exact commands and Pitfall #1–#3 for why):**

```bash
npm install -D tailwindcss @tailwindcss/postcss
npm install class-variance-authority clsx tailwind-merge tw-animate-css
# shadcn CLI itself is invoked via npx, not installed as a project dependency
npx shadcn@latest add button card badge input -b radix -y
```

**Version verification:** All versions above were confirmed live against the npm registry on 2026-09-26 via `npm view <pkg> version`; do not trust training-data version numbers for this fast-moving stack.

## Package Legitimacy Audit

| Package | Registry | Age (this version) | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|---------------------|-----------|--------------|---------|-------------|
| `tailwindcss` | npm | published 2026-07-16 | 122.3M/wk | github.com/tailwindlabs/tailwindcss | OK | Approved |
| `@tailwindcss/postcss` | npm | published 2026-07-16 | 34.8M/wk | github.com/tailwindlabs/tailwindcss | OK | Approved |
| `shadcn` | npm | published 2026-09-04 | 8.8M/wk | github.com/shadcn-ui/ui | **SUS** (`too-new`) | Flagged — see note below |
| `class-variance-authority` | npm | published 2024-11-26 | 62.0M/wk | github.com/joe-bell/cva | OK | Approved |
| `clsx` | npm | published 2024-04-23 | 116.7M/wk | github.com/lukeed/clsx | OK | Approved |
| `tailwind-merge` | npm | published 2026-09-12 | 79.7M/wk | github.com/dcastil/tailwind-merge | **SUS** (`too-new`) | Flagged — see note below |
| `tw-animate-css` | npm | published 2025-09-24 | 37.7M/wk | github.com/Wombosvideo/tw-animate-css | OK | Approved |
| `@radix-ui/react-slot` | npm | published 2026-07-24 | 166.0M/wk | github.com/radix-ui/primitives | OK | Approved |

**Packages removed due to `[SLOP]` verdict:** none.

**Packages flagged as suspicious `[SUS]`:** `shadcn`, `tailwind-merge`. Both trip the legitimacy gate's `too-new` heuristic purely on **publish-date recency of the current version**, not on any structural red flag — both have no `postinstall` script, both resolve to their well-known official GitHub repos, and both carry tens-to-hundreds-of-millions of weekly downloads (inconsistent with a slopsquat/hallucination, consistent with an actively-maintained popular package that happened to ship a new version recently). **The planner must still insert a `checkpoint:human-verify` task before installing either**, per protocol — the automated signal is real even if the most likely explanation is a routine release, not a supply-chain issue.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ src/app/globals.css                                                 │
│   @import "tailwindcss";                                            │
│   @theme { --color-*, --text-*, --radius-*, --shadow-* ... }        │  ← DSYS-01, DSYS-03
│   (one shared token block — no per-audience duplication)            │
└───────────────────────────────┬───────────────────────────────────--┘
                                 │ processed by @tailwindcss/postcss
                                 │ (Turbopack, next build / next dev)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ src/components/ui/{button,card,badge,input}.tsx                     │
│   shadcn-generated, CVA-typed variant unions, Radix primitives       │  ← D-06, D-07, D-08
│   e.g. variant: "primary" | "secondary" | "tertiary" | "critical"    │
└───────────────────────────────┬───────────────────────────────────--┘
                                 │ imported by
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│ src/app/design-system/*  (real App Router routes)                   │  ← DSYS-02
│   page-1: Safe/Caution/Critical StatusPill + Card variants           │
│   page-2: empty-state / loading-state Card treatments                │
│   page-3: nested Button/Input inside Card inside page layout         │
└─────────────────────────────────────────────────────────────────────┘
                                 │ `next build` (Turbopack, production)
                                 ▼
                    Compiled, code-split .css + .js served
                    identically to whatever later consumes it
                    (both caregiver and parent visual language)
```

### Recommended Project Structure

```
src/
├── app/
│   ├── globals.css              # single @theme block — token source of truth
│   ├── layout.tsx                # Inter font import replaces current Geist import
│   └── design-system/            # DSYS-02 sample validation routes (D-02)
│       ├── states/page.tsx       # sample page 1: Safe/Caution/Critical
│       ├── empty-loading/page.tsx# sample page 2: empty + loading Card
│       └── nested/page.tsx       # sample page 3: nested composition
├── components/
│   ├── ui/                       # shadcn-generated (button.tsx, card.tsx, badge.tsx, input.tsx)
│   └── icon.tsx                  # ported React wrapper around icons.js (D-09)
└── lib/
    └── utils.ts                  # shadcn's cn() helper (clsx + tailwind-merge)
```

### Pattern 1: `@theme` token block (Tailwind v4, no `tailwind.config.js`)

**What:** All design tokens declared as CSS custom properties inside an `@theme { ... }` block in the global stylesheet; Tailwind auto-generates matching utility classes (`bg-*`, `text-*`, `rounded-*`, `shadow-*`) from the `--color-*`/`--text-*`/`--radius-*`/`--shadow-*` namespace prefixes.
**When to use:** This is the only supported v4 mechanism — DSYS-01 explicitly requires it and forbids a `tailwind.config.js`-style config.
**Example** (verified directly against the shipped `tailwindcss@4.3.3` package's own `theme.css`, confirming the namespace and paired line-height syntax the UI-SPEC already uses):

```css
/* Source: tailwindcss@4.3.3 package theme.css (verified by unpacking the npm tarball) */
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.69 0.095 252.1);
  --color-critical: oklch(0.626 0.164 352);

  --text-heading: 1.125rem;
  --text-heading--line-height: 1.3;   /* paired suffix syntax, confirmed real */

  --radius-card: 20px;
  --shadow-card: 0 4px 20px rgba(24, 34, 53, 0.05);
}
```

Do **not** redeclare `--spacing-*` as a scale — Tailwind v4 ships a single `--spacing: 0.25rem` primitive [VERIFIED: tailwindcss@4.3.3 theme.css] that already generates every `p-1`…`p-16`/`size-11` utility the UI-SPEC's spacing table needs.

### Pattern 2: PostCSS wiring for Turbopack (Next.js 16 default bundler)

**What:** Next.js 16 uses Turbopack by default for both `next dev` and `next build` [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/08-turbopack.md — "Turbopack becomes the default bundler for Next.js" as of v16.0.0]. Turbopack natively supports PostCSS config files without extra Next.js config.
**When to use:** Always, for this phase — no `experimental.turbopackLocalPostcssConfig` flag is needed since there is only one, root-level `postcss.config.mjs` (that flag only matters for per-directory/monorepo PostCSS configs).
**Example:**

```js
// Source: node_modules/next/dist/docs/01-app/01-getting-started/11-css.md (this repo's installed next@16.3.5)
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### Pattern 3: shadcn CVA component variant (finite, typed — D-06)

**What:** Every generated component exposes a single `cva()` call with a closed variant union; no `ghost`/`destructive`/`link`/`outline` names exist per D-06/UI-SPEC.
**When to use:** All 4 Phase 6 components.
**Example (illustrative shape — executor confirms exact class strings against the locked color tokens during planning):**

```tsx
// Source: shadcn-generated button.tsx shape (D-06/D-08 variant contract)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-btn text-body font-semibold transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-brand-fill text-text-inverse hover:bg-brand-fill-hover",
        secondary: "border border-border text-text",
        tertiary: "text-brand underline-offset-4 hover:underline",
        critical: "bg-critical-fill text-text-inverse hover:bg-critical-fill-hover",
      },
    },
    defaultVariants: { variant: "primary" },
  }
)
```

### Anti-Patterns to Avoid

- **Assuming `-b radix` is the CLI default:** As of shadcn CLI 4.21.0, `base:"base"` (Base UI) is the default when `--base`/`-b` is omitted [VERIFIED: shadcn@4.21.0 package dist/index.js — `function ig(e){return e===void 0?"base":c$2(e).base??"radix"}`]. Every `init`/`add` invocation this phase must pass `-b radix` explicitly.
- **Trusting training-data shadcn `--base-color` flag:** No such flag exists in this CLI version's registered `option(...)` list (confirmed by exhaustively grepping the unpacked package source). Base color is prompt-only, or set via `shadcn migrate <name> --from <x> --to <y> --yes`, or via a hand-authored `components.json`.
- **Leaving the default `create-next-app` dark-mode media query in `globals.css`:** The current `src/app/globals.css` has a `@media (prefers-color-scheme: dark)` block toggling `--background`/`--foreground` [VERIFIED: src/app/globals.css:6-11, quoted: `@media (prefers-color-scheme: dark) { :root { --background: #0a0a0a; --foreground: #ededed; } }`]. The UI-SPEC's locked palette is light-mode only — this block must be removed, not merged with the new `@theme` tokens, or the two systems will silently fight each other.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Conditional/merged Tailwind class strings | A custom `classNames()`-style helper | `clsx` + `tailwind-merge` via shadcn's generated `cn()` in `lib/utils.ts` | Already the exact mechanism every shadcn-generated component file imports; reinventing it breaks drop-in compatibility with future `shadcn add` runs |
| Finite component variant typing | Hand-rolled `switch`/ternary prop branching | `class-variance-authority` (`cva()`) | D-06's entire "agent can't invent a variant" requirement is CVA's discriminated-union design, not a custom pattern |
| Accessible primitive behavior (focus trap, ARIA roles, keyboard nav) for Button/Input | Custom `onKeyDown`/`aria-*` wiring | Radix primitives (`@radix-ui/react-*`, pulled in via `shadcn add ... -b radix`) | This is D-07's entire rationale — Radix already solves the a11y edge cases a 2-day-budget custom build would get wrong |
| SVG icon rendering | Re-implement `icons.js`'s `renderSepCareIcon()` string-templating approach in React | A thin `<Icon name="..." />` React component that maps the same `SepCareIcons` keys to real JSX `<svg>` elements | `icons.js`'s current form returns an HTML *string* [VERIFIED: frontend-design/design-system/icons.js — `function renderSepCareIcon(name, size = 24, className = '') { ... return `<svg ...>${content}</svg>`; }`], which is a `dangerouslySetInnerHTML` shape in React — porting to real JSX avoids that risk entirely for near-zero extra work since the source paths are static |

**Key insight:** Every "don't hand-roll" item above is already the *documented, intended* shape of the shadcn+Radix+CVA stack D-07 locked in — the risk here isn't reinventing wheels, it's an agent's training data being confidently wrong about which wheel shadcn ships by default in this specific CLI version.

## Common Pitfalls

### Pitfall 1: shadcn CLI's default primitive library is no longer Radix
**What goes wrong:** Running `npx shadcn@latest init` or `add` without `-b radix` silently scaffolds Base UI-based components instead of Radix-based ones, violating D-07.
**Why it happens:** shadcn CLI 4.21.0 introduced a 3-way `--base` choice (`base` | `aria` | `radix`) and changed the recommended default to `base` (Base UI) [VERIFIED: shadcn@4.21.0 dist/index.js — choices array `[{title:"Base UI (Recommended)",value:"base"},{title:"React Aria",value:"aria"},{title:"Radix UI",value:"radix"}]`, and default-resolution function returning `"base"` when unset]. This is a genuinely recent change that most LLM training data predates.
**How to avoid:** Every `init`/`add` command in the plan must include `-b radix` (or the interactive "Radix UI" selection). Also verify the resulting `components.json` and generated component files actually import from `@radix-ui/react-*`, not `@base-ui-components/react` or similar, before considering the install step done.
**Warning signs:** Generated component files importing from an unfamiliar primitives package; `package.json` gaining a `@base-ui-components/*` dependency instead of `@radix-ui/*`.

### Pitfall 2: No CLI flag sets base color — the UI-SPEC's "slate" choice needs a different mechanism
**What goes wrong:** A plan step like `npx shadcn init --base-color slate` will fail — that flag does not exist in this CLI version.
**Why it happens:** Confirmed by exhaustively grepping the unpacked `shadcn@4.21.0` package source for every registered `option("--...")` string — no `--base-color` or `--style` flag is present anywhere in the `init`/`add`/`migrate` command definitions.
**How to avoid:** Pick one of three verified working paths: (a) hand-author `components.json` directly (`tailwind.baseColor: "slate"`) then run `shadcn add` (which reads, not re-prompts, the existing config — confirmed by the CLI's own error path: *"No components.json found. Run shadcn init first."*, i.e. `add` requires and trusts an existing file rather than regenerating one); (b) answer the interactive `init` prompt directly (`"Which color would you like to use as the base color?"`, choices include `slate`); (c) run `init` with defaults, then `npx shadcn migrate <name> --from neutral --to slate --yes` [VERIFIED: shadcn@4.21.0 dist/index.js — `migrate` command registers `-f/--from`/`-t/--to <name>`, "the base color or icon library to migrate from/to"].
**Warning signs:** A plan step referencing a `--base-color` or `--style` CLI flag should be treated as a training-data hallucination and rewritten before execution.

### Pitfall 3: `tailwindcss-animate` is a stale/deprecated dependency for this stack
**What goes wrong:** Installing `tailwindcss-animate` (the v3-era shadcn animation plugin) instead of `tw-animate-css`.
**Why it happens:** shadcn's own current docs state it directly: *"We've deprecated `tailwindcss-animate` in favor of `tw-animate-css`"* [CITED: ui.shadcn.com/docs/tailwind-v4] — `tailwindcss-animate` was a `tailwind.config.js` plugin entry, which has no equivalent mechanism in a config-less v4 setup; `tw-animate-css` instead is a plain CSS import.
**How to avoid:** Use `tw-animate-css`, imported directly in `globals.css` (e.g. `@import "tw-animate-css";`), not a plugin array (there is no `tailwind.config.js` to put one in).
**Warning signs:** A `plugins: [require("tailwindcss-animate")]` line anywhere — there's no config file for it to live in.

### Pitfall 4: Generic web search can return confidently wrong details for this exact CLI version
**What goes wrong:** An early WebFetch pass against `ui.shadcn.com/docs/components-json` during this research session returned a fabricated claim that `baseColor` options are `neutral | stone | zinc | mauve | olive | mist | taupe` — explicitly omitting `slate` — which would have wrongly told the planner D-08/UI-SPEC's `slate` choice is invalid.
**Why it happens:** Small-model page summarization can hallucinate specifics, especially for fast-moving CLI tools with recent version churn (this is the exact "shape" the phase brief warned about).
**How to avoid:** For any claim about *current* CLI flag/behavior specifics in this stack, cross-check against the actual installed/installable package source (`npm pack <pkg>@<version>` and grep the unpacked `dist/`) rather than trusting a single web fetch. This research session did exactly that and found `slate` **is** a valid, unchanged base color choice [VERIFIED: shadcn@4.21.0 dist/index.js — choices list includes `"slate","gray","zinc","neutral","stone"` alongside newer additions `"mauve","olive","mist","taupe"`].
**Warning signs:** Any single-source web claim that directly contradicts an already-locked, human-reviewed UI-SPEC decision should trigger a source-of-truth re-check before it's allowed to override the lock.

## Code Examples

### Non-interactive install sequence (recommended — see Primary recommendation)

```bash
# Source: verified against shadcn@4.21.0 package source + Next.js 16 docs, this session
npm install -D tailwindcss @tailwindcss/postcss

cat > postcss.config.mjs << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
EOF

# Hand-author components.json (avoids the missing --base-color flag entirely):
cat > components.json << 'EOF'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
EOF

npx shadcn@latest add button card badge input -b radix -y
```

### `@theme` block skeleton in `globals.css`

```css
/* Source: tailwindcss@4.3.3 theme.css structure, verified this session */
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  /* paste the locked OKLCH values from 06-UI-SPEC.md's Color section here verbatim */
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-------------------|---------------|--------|
| `tailwind.config.js` + `@tailwind base/components/utilities` | `@theme { ... }` block + single `@import "tailwindcss"` | Tailwind v4 (Feb 2025) | This phase's entire DSYS-01 requirement is built on this change — no config file, ever |
| shadcn CLI defaulting to Radix primitives | shadcn CLI 4.x defaulting to "Base UI", Radix now opt-in via `-b radix` | shadcn CLI v4 (2026) | Directly affects D-07 — see Pitfall #1 |
| `tailwindcss-animate` (config-file plugin) | `tw-animate-css` (plain CSS import) | Alongside Tailwind v4 adoption | Affects any motion/skeleton-pulse utility classes the sample pages (D-10) use |
| Webpack as Next.js default bundler | Turbopack as default for both `dev` and `build` | Next.js v16.0.0 | Confirms the phase's "compiles cleanly in a real `next build`" success criterion is being checked against Turbopack, not Webpack |

**Deprecated/outdated:**
- `tailwind.config.js`, `@tailwind` directives, `theme()` CSS function — all superseded by `@theme`/native CSS variables in Tailwind v4.
- `tailwindcss-animate` — superseded by `tw-animate-css` for shadcn + Tailwind v4 projects.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Hand-authoring `components.json` (vs. running interactive `init`) is accepted by `shadcn add` without complaint beyond the confirmed "requires an existing file" error path | Primary recommendation, Code Examples | Low — this was checked against the CLI source's error-message strings, not executed end-to-end in this repo; if wrong, the executor falls back to answering the interactive prompt instead (Pitfall #2, option b) |
| A2 | The illustrative CVA `buttonVariants` code example's exact Tailwind class names (`bg-brand-fill`, etc.) will compile once the full `@theme` block from UI-SPEC is pasted in | Architecture Patterns, Pattern 3 | Low — token *names* are illustrative per the code block's own comment; UI-SPEC's Color section is the actual source of truth for the values, already checker-approved |

**If this table is empty:** N/A — two low-risk assumptions noted above; both are execution-order details, not design or dependency-legitimacy risks.

## Open Questions

1. **(RESOLVED — handled via fallback in 06-01 Task 2) Does `shadcn add -b radix` on a hand-authored `components.json` (no prior `init` run) actually succeed, or does it require an `init`-created marker beyond the file's existence?**
   - What we know: The CLI's error path explicitly checks for `components.json`'s *existence*, not for an `init`-run flag inside it.
   - What's unclear: Whether `add`'s dependency-installation step (Tailwind, CVA, Radix packages) assumes `init` already ran, or performs a full fresh install when it detects those deps are missing from `package.json`.
   - Recommendation: The plan should run this as its first task and check output before committing to the rest of the install sequence in code examples above; if it errors, fall back to interactive `init` with `-b radix` and manually answer the base-color prompt with `slate`.
   - RESOLVED: `06-01-PLAN.md` Task 2's `<action>` already encodes this exact fallback (attempt `shadcn add -b radix`; on an error expecting a prior `init`, run `npx shadcn@4.21.0 init -b radix -y` first, then retry) — execution will not stall on this uncertainty regardless of which path the CLI takes.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|----------|
| Node.js | shadcn CLI (`engines.node >=20.18.1`), Next.js build | ✓ | v25.8.2 [VERIFIED: `node --version`] | — |
| npm | package installs | ✓ | 11.11.1 [VERIFIED: `npm --version`] | — |
| git | commits, `shadcn add` overwrite-safety checks | ✓ | 2.52.0 [VERIFIED: `git --version`] | — |
| Internet access to `registry.npmjs.org` / `ui.shadcn.com` | package installs, shadcn component registry fetches | ✓ (used this session for `npm pack`/`npm view`) | — | — |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:** none — all required tooling already present in this environment.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.11 [VERIFIED: package.json devDependencies] |
| Config file | `vitest.config.ts` — `environment: "node"` [VERIFIED: vitest.config.ts:6-7, quoted: `test: { environment: "node", ... }`], **no jsdom/browser environment or component-testing library (`@testing-library/react`) currently installed** |
| Quick run command | `npm run build` (fastest real signal for DSYS-01's "compiles cleanly in a real `next build`" criterion) |
| Full suite command | `npm test` (existing Vitest backend suite — unaffected by this phase, but must stay green) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|---------------------|--------------|
| DSYS-01 | `@theme` token set compiles cleanly in `next build` (not just dev) | build/smoke | `npm run build` | ✅ (existing `next build` script) |
| DSYS-02 | ≥3 sample pages render real component states | manual-only (visual UAT) + smoke | `next build` (static analysis catches route/type errors); human review of rendered pages is the actual validation checkpoint D-02 specifies | ❌ Wave 0 — sample page files don't exist yet, this phase creates them |
| DSYS-03 | Same token set demonstrably reused across both visual-language sample pages | manual-only (code review) | grep-based check: confirm only one `@theme` block exists in the repo (`grep -r "@theme" src/`) | ❌ Wave 0 — no automated assertion exists; recommend a one-line check script over introducing RTL infra given the project's 2-day time budget (see STATE.md) |

### Sampling Rate

- **Per task commit:** `npm run build` (fast, direct signal for this phase's specific success criteria — a full Vitest run doesn't touch anything this phase changes)
- **Per wave merge:** `npm run build && npm test` (confirm the existing backend suite hasn't regressed from any shared-file touches, e.g. `tsconfig.json`)
- **Phase gate:** `npm run build` green + the D-02 human-reviewed visual validation checkpoint, before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/app/design-system/*` sample page route files — don't exist yet, this phase creates them (not a pre-existing gap, just sequencing)
- [ ] No component-level unit test framework (`@testing-library/react` + jsdom) exists in this repo. **Recommendation: do not add one this phase.** Given the explicit 2-day time budget flagged in STATE.md and this phase's success criteria being about compiled output + human visual review (not component logic), introducing RTL/jsdom infrastructure is scope the phase doesn't need — `next build` + the D-02 human checkpoint already cover what DSYS-01/02/03 actually require.

*(No other gaps: existing Vitest config's `node` environment is sufficient for the "does it build" signal this phase needs; it is not being asked to unit-test component render output.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|--------------------|
| V2 Authentication | no | This phase has no auth surface — Input/Button are presentational shells only, not wired to any submission/auth flow |
| V3 Session Management | no | No session state touched by this phase |
| V4 Access Control | no | No data or routes requiring access control are introduced |
| V5 Input Validation | partial | `Input`'s error-state visual treatment exists this phase, but no actual validation *logic* is wired (per UI-SPEC's own "Copywriting Contract" — no real form submission exists yet); flag for the phase that wires real forms |
| V6 Cryptography | no | Nothing in this phase touches cryptographic material |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| Rendering `icons.js`'s raw SVG-string content via `dangerouslySetInnerHTML` in the ported React `<Icon>` component | Tampering (injection-shaped, even though the source is static/trusted) | Parse the `SepCareIcons` object's path strings into real JSX `<path>`/`<circle>`/`<line>` elements (a small codegen or a one-time manual port) instead of injecting raw HTML strings at runtime — the source is 100% static design-asset data today, but `dangerouslySetInnerHTML` is a pattern worth never establishing as precedent in this codebase, since future icon additions from less-trusted sources would inherit the same (mis)pattern |

## Sources

### Primary (HIGH confidence)

- `node_modules/next/dist/docs/01-app/03-api-reference/08-turbopack.md` (this repo's installed `next@16.3.5`) — Turbopack default-bundler status, PostCSS support
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` (this repo's installed `next@16.3.5`) — official Tailwind v4 install steps for Next.js
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopackLocalPostcssConfig.md` — per-directory PostCSS resolution (confirmed not needed for this phase's single-root config)
- Unpacked `shadcn@4.21.0` npm tarball (`npm pack shadcn@4.21.0`, extracted and grepped `dist/index.js` + `dist/chunk-*.js`) — CLI flag list, `--base` default resolution, base-color choices, `migrate` command, registry style-path resolution
- Unpacked `tailwindcss@4.3.3` npm tarball (`npm pack tailwindcss@4.3.3`, read `theme.css`/`index.css`) — `@theme default { ... }` structure, `--spacing` primitive, paired `--text-*--line-height` syntax, full default color palette including `mauve`/`olive`/`mist`/`taupe`
- `frontend-design/design-system/icons.js` (read directly, lines 1-60 and 64-66, 90-115) — exact `SepCareIcons` object shape, `renderSepCareIcon()` implementation, confirmed `safe`/`caution`/`critical` icon keys exist
- `frontend-design/design-system/DESIGN-SYSTEM.md` (read directly, lines quoted) — "Never communicate status using color alone" and 70/20/10 rules
- `src/app/layout.tsx`, `src/app/globals.css`, `tsconfig.json` (read directly) — current pre-Phase-6 state of the files this phase modifies
- `npm view <pkg> version` / `npm view <pkg> peerDependencies` for all Standard Stack packages — live registry check, 2026-09-26

### Secondary (MEDIUM confidence)

- `ui.shadcn.com/docs/tailwind-v4` (WebFetch) — `tailwindcss-animate` → `tw-animate-css` deprecation, `@theme inline` pattern
- WebSearch results on Tailwind v4 vs v3 deprecated syntax (`@tailwind` directives, important-marker position, `@utility` API) — cross-checked against multiple independent sources, consistent

### Tertiary (LOW confidence)

- `ui.shadcn.com/docs/components-json` (WebFetch) — **partially refuted this session**; its claim that `baseColor` options are `neutral | stone | zinc | mauve | olive | mist | taupe` (omitting `slate`) was contradicted by direct package-source inspection. Retained in Sources only as a documented example of why this phase's research leaned on package-source verification over single-source web fetches (see Pitfall #4).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified live against npm registry this session
- Architecture (Tailwind v4 `@theme` + Turbopack/PostCSS wiring): HIGH — verified against the actually-installed `next@16.3.5`'s own bundled docs and the actual `tailwindcss@4.3.3` package source, not just web search
- shadcn CLI mechanics (`-b` default, missing `--base-color` flag, `migrate` command): HIGH — verified by unpacking and grepping the exact pinned CLI version (4.21.0)'s own source
- Pitfalls: HIGH — each pitfall traces to a direct source-code or source-doc quote, not inference
- Security domain: MEDIUM — mostly "not applicable" reasoning for a presentational-only phase; the one flagged pattern (`dangerouslySetInnerHTML`) is a judgment call, not a verified vulnerability

**Research date:** 2026-09-26
**Valid until:** 7 days (fast-moving stack — shadcn CLI and Tailwind v4 are both under active, frequent-release development; re-verify package versions and CLI flags if planning is delayed beyond this window)
