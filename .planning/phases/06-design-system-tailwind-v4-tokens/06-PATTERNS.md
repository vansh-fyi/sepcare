# Phase 6: Design System (Tailwind v4 Tokens) - Pattern Map

**Mapped:** 2026-09-26
**Files analyzed:** 13 (new/modified)
**Analogs found:** 9 / 13 (4 have no in-repo analog — new-to-this-repo shadcn-generated files; RESEARCH.md Code Examples serve as their pattern source instead)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|----------------|
| `src/app/globals.css` | config (styles) | transform (CSS token authoring → compiled utilities) | `src/app/globals.css` (itself — modified in place) | exact (same file, modified) |
| `postcss.config.mjs` | config | transform | *(none — new file, no PostCSS config exists yet)* | no analog — use RESEARCH.md Code Examples verbatim |
| `components.json` | config | transform | *(none — shadcn not yet installed)* | no analog — hand-author per RESEARCH.md primary recommendation |
| `src/app/layout.tsx` | provider/root-layout | request-response (SSR shell) | `src/app/layout.tsx` (itself — modified in place) | exact (same file, modified) |
| `src/components/ui/button.tsx` | component | request-response (client interaction) | `frontend-design/design-system/components.css`/`components.js` (interaction-state reference only, not carried as classes per D-07/D-08) | role-match (cross-format: CSS/JS reference → shadcn CVA/TSX target) |
| `src/components/ui/card.tsx` | component | request-response | `frontend-design/design-system/components.css` (Card surface rules) | role-match |
| `src/components/ui/badge.tsx` | component | request-response | `frontend-design/design-system/components.css` (StatusPill/Badge rules) + `frontend-design/design-system/icons.js` (icon+label+color multi-modal rule) | role-match |
| `src/components/ui/input.tsx` | component | request-response | `frontend-design/design-system/components.css` (form/Input rules) | role-match |
| `src/lib/utils.ts` | utility | transform | `src/lib/risk/compute.ts` (existing `src/lib/` utility-module convention: named export, no default export, pure function) | role-match (different domain, same module-shape convention) |
| `src/components/icon.tsx` | component (presentational) | transform (data → JSX) | `frontend-design/design-system/icons.js` (`SepCareIcons` object + `renderSepCareIcon()`) | exact (direct 1:1 port target) |
| `src/app/design-system/states/page.tsx` | route (page) | request-response (SSR page) | `src/app/page.tsx` (only existing App Router page; also `src/app/api/health/route.ts` for the project's route-file header-comment convention) | role-match |
| `src/app/design-system/empty-loading/page.tsx` | route (page) | request-response | `src/app/page.tsx` | role-match |
| `src/app/design-system/nested/page.tsx` | route (page) | request-response | `src/app/page.tsx` | role-match |

## Pattern Assignments

### `src/app/globals.css` (config, modified in place)

**Analog:** itself (current state below) — this is a rewrite, not an extension.

**Current full content** (`src/app/globals.css` lines 1-49):
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

html { height: 100%; }
html, body { max-width: 100vw; overflow-x: hidden; }
body {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
* { box-sizing: border-box; padding: 0; margin: 0; }
a { color: inherit; text-decoration: none; }
@media (prefers-color-scheme: dark) { html { color-scheme: dark; } }
```

**Required changes (per RESEARCH.md Anti-Patterns + UI-SPEC Color/Surface Tokens sections):**
1. Add `@import "tailwindcss";` and `@import "tw-animate-css";` at the top (RESEARCH.md Pattern 1 + Code Examples).
2. **Delete** the entire `@media (prefers-color-scheme: dark) { ... }` blocks (both of them) — RESEARCH.md's Anti-Patterns section explicitly flags this as fighting the new `@theme` tokens; UI-SPEC's palette is light-mode only.
3. Add a single `@theme { ... }` block containing every token from `06-UI-SPEC.md`'s Color, Typography, Surface Tokens (Radius/Shadow/Motion) sections — copy the OKLCH values verbatim from UI-SPEC lines 150-188 (Color) and 94-104 (Typography `--text-*` pairs) and 192-229 (Radius/Shadow/Motion tables, converted to `--radius-*`/`--shadow-*`/`--duration-*` custom properties).
4. Do **not** declare a custom `--spacing-*` scale (UI-SPEC Spacing Scale section + RESEARCH.md Pattern 1 explicitly warn against this — Tailwind v4's stock `--spacing: 0.25rem` primitive already covers the full 4/8/12/16/24/32/48/64px ladder).
5. Keep the existing generic reset rules (`html`, `body`, `*`, `a`) — those are layout mechanics, not tokens; only the `:root` color-scheme variables and dark-mode media queries are being replaced by `@theme`.

**Source of the token values to paste in** — `06-UI-SPEC.md` lines 150-188 (Color, verbatim OKLCH block) and lines 94-104, 198-229 (Typography/Radius/Shadow/Motion tables).

---

### `postcss.config.mjs` (config, new file)

**No in-repo analog** — no PostCSS config exists yet in this repo.

**Pattern source:** RESEARCH.md Pattern 2 / Code Examples (verified against this repo's installed `next@16.3.5` docs bundle):
```js
// Source: node_modules/next/dist/docs/01-app/01-getting-started/11-css.md
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

---

### `components.json` (config, new file)

**No in-repo analog** — shadcn not yet installed (`shadcn_initialized: false` per UI-SPEC frontmatter).

**Pattern source:** RESEARCH.md "Primary recommendation" + Code Examples — hand-author rather than run interactive `init` (sidesteps the missing `--base-color` CLI flag, RESEARCH.md Pitfall #2):
```json
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
```
Then: `npx shadcn@latest add button card badge input -b radix -y` — **must** pass `-b radix` explicitly (RESEARCH.md Pitfall #1: CLI 4.21.0 defaults to Base UI, not Radix, when `-b` is omitted; this would silently violate D-07).

---

### `src/app/layout.tsx` (provider/root-layout, modified in place)

**Analog:** itself (current state) — swap font import only, per D-05.

**Current content** (`src/app/layout.tsx`, full file, 27 lines):
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

**Required change:** Replace `Geist`/`Geist_Mono` imports and variables with a single `Inter` import (`next/font/google`, `variable` mode) per D-05/UI-SPEC "Font" row:
```tsx
import { Inter } from "next/font/google";
const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
// ... className={inter.variable}
```
Keep the `LayoutProps<"/">` typed-props convention and the overall structure — only the font import/variable and `className` binding change. Update `metadata` title/description if in scope (not required by DSYS-01/02/03, discretionary).

---

### `src/components/ui/{button,card,badge,input}.tsx` (component, new files via shadcn CLI)

**No in-repo analog** (first shadcn install in this repo). Two pattern sources instead:

1. **Structural/CVA shape** — RESEARCH.md Pattern 3 (illustrative, executor confirms exact class strings against UI-SPEC's locked tokens):
```tsx
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
2. **Exact variant contract (finite, no invented variants — D-06/D-08):** `06-UI-SPEC.md` Component Inventory table (lines 41-46) — Button: `variant: "primary" | "secondary" | "tertiary" | "critical"` only; Badge: `status: "safe" | "caution" | "critical"` only, each rendering icon+label+color together (never color alone); Card: structural layout must not change across content states (empty/loading/populated); Input: paired with `Label` + helper/error text slot, no search/select variants.
3. **Interaction-state reference (do NOT carry forward as classes, D-07/D-08 — reference only for what states to reproduce):** `frontend-design/design-system/components.css` and `components.js` document exact hover/active/disabled/loading state behavior for the pre-shadcn version of these same components — read these before finalizing each shadcn component's `hover:`/`disabled:`/`data-[state=loading]` variants so no documented interaction state gets dropped in the port.
4. **Error-state and loading-state specifics** — UI-SPEC "UI Considerations" table (lines 253-271): Input error = critical-colored border + inline message (copy: "Couldn't load this. Check your connection and try again."); Button/Card loading = skeleton/spinner per D-10 sample page 2; Button `loading` sub-state hides label, shows centered spinner, no size/weight change.

---

### `src/lib/utils.ts` (utility, new file — `cn()` helper)

**Analog:** `src/lib/risk/compute.ts` — establishes this repo's `src/lib/` module convention (named export, no default export, pure function, no side effects).

**Convention to follow** (module shape, not domain logic):
```ts
// src/lib/risk/compute.ts convention: named exports, pure functions, typed params/return
export function computeRiskScore(/* ... */): /* ... */ { /* ... */ }
```

**Actual content re-exports the `cn` npm package** (per a checkpoint-time user decision recorded in `06-01-PLAN.md` Task 2, made before any install ran — supersedes the shadcn-standard clsx+tailwind-merge combo originally documented in RESEARCH.md's Don't-Hand-Roll table):
```ts
import { cn } from "cn"

export { cn }
```
`cn` (github.com/shadcn-ui/cn) ships a `cn` export confirmed via its shipped type declarations to be a drop-in replacement for `twMerge(clsx(...))`, alongside `clsx`/`twMerge`/`twJoin` re-exports for compatibility. The shadcn CLI still generates `src/lib/utils.ts` in its default clsx+tailwind-merge form regardless of which packages are installed — do not hand-roll a custom `classNames()` helper, and do not leave that CLI-generated file's original imports in place; replace them immediately after generation, per `06-01-PLAN.md` Task 2.

---

### `src/components/icon.tsx` (component, new file — port of `icons.js`)

**Analog:** `frontend-design/design-system/icons.js` (direct 1:1 port target, full file read — 120 lines).

**Source pattern** (`icons.js` lines 7-91, 100-103):
- `SepCareIcons` object: icon-name key → raw inner-SVG path/circle/line markup string (40+ entries across Navigation/Baby-Care/Vitals/Device/Status/Actions categories).
- `renderSepCareIcon(name, size=24, className='')` (lines 100-103): builds a full `<svg>` string with `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`, falling back to `SepCareIcons.information` for unknown names.

**Required port shape (per RESEARCH.md "Don't Hand-Roll" + Security Domain sections — do NOT use `dangerouslySetInnerHTML`):**
```tsx
// Port each SepCareIcons[name] string into real JSX children, not raw HTML injection
export function Icon({ name, size = 24, className = "" }: { name: keyof typeof icons; size?: number; className?: string }) {
  const content = icons[name] ?? icons.information;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true" className={className}>
      {content /* real JSX <path>/<circle>/<line> elements, not a string */}
    </svg>
  );
}
```
Preserve the exact `viewBox`/`stroke-width`/`stroke-linecap`/`stroke-linejoin` attribute values from `renderSepCareIcon` — only the fallback-to-string-templating mechanism changes, not the visual output. The `safe`/`caution`/`critical` icon keys (lines 64-66) map directly onto Badge/StatusPill's 3 status variants.

---

### `src/app/design-system/{states,empty-loading,nested}/page.tsx` (route/page, new files)

**Analog:** `src/app/page.tsx` (only existing App Router page — establishes this repo's default-export page-component shape) + `src/app/api/health/route.ts` (establishes this repo's file-header-comment convention referencing which plan/phase a file belongs to).

**Page shape convention** (`src/app/page.tsx` lines 1-6, structural pattern only — content is the default Next.js scaffold and will be fully replaced):
```tsx
export default function Home() {
  return (
    <div /* ... */>
      {/* page content */}
    </div>
  );
}
```

**Header-comment convention** (`src/app/api/health/route.ts` lines 1-6):
```ts
/**
 * Deployment smoke-check endpoint. Used by Plan 04 to confirm the Vercel
 * deployment is live and serving traffic before wiring the real ingest path.
 */
```
Apply the same "what this file is for + which plan/decision it satisfies" comment style to each `design-system/*/page.tsx`, e.g. referencing D-10's sample-page assignment (states=safe/caution/critical, empty-loading=Card states, nested=composition).

**Content contract per page (D-10, UI-SPEC "Component Inventory" + "UI Considerations"):**
- `states/page.tsx` — render Safe/Caution/Critical `Badge` + `Card` variants side by side, using `Icon` for the multi-modal icon+label+color rule.
- `empty-loading/page.tsx` — one `Card` in empty-state (copy: "No readings yet" / "Vitals will appear here once the device starts sending data.") and one in loading-state (skeleton/spinner, respecting `prefers-reduced-motion`).
- `nested/page.tsx` — `Button`s and `Input`s nested inside a `Card` inside the page layout, proving token cascade through real nesting (DSYS-03 validation).

---

## Shared Patterns

### Token compilation (Tailwind v4 `@theme`, no config file)
**Source:** `06-UI-SPEC.md` Color/Typography/Surface Tokens sections + `06-RESEARCH.md` Pattern 1
**Apply to:** `src/app/globals.css` only — single source of truth, consumed by every component and page (DSYS-03's "one shared token set" requirement is satisfied by having exactly one `@theme` block in the repo).

### Radix-explicit shadcn installs
**Source:** `06-RESEARCH.md` Pitfall #1 + Code Examples
**Apply to:** every `shadcn add`/`init` invocation — always pass `-b radix`; verify post-install that generated files import from `@radix-ui/react-*`, not `@base-ui-components/react`.

### Finite CVA variant unions (no invented variants)
**Source:** `06-RESEARCH.md` Pattern 3 + `06-UI-SPEC.md` Component Inventory (D-06/D-08)
**Apply to:** `button.tsx` (`variant: "primary"|"secondary"|"tertiary"|"critical"`), `badge.tsx` (`status: "safe"|"caution"|"critical"`) — no `ghost`/`destructive`/`link`/`outline` names anywhere.

### Multi-modal status rule (icon + label + color, never color alone)
**Source:** `frontend-design/design-system/DESIGN-SYSTEM.md` (§9, cited in CONTEXT.md D-08) + `frontend-design/design-system/icons.js` `safe`/`caution`/`critical` icon keys
**Apply to:** `badge.tsx` — every status render must pair the `Icon` component with the text label and the status color; this also applies to any Card treatment that surfaces a status.

### `cn()` className merging
**Source:** the `cn` npm package (github.com/shadcn-ui/cn), re-exported from `src/lib/utils.ts` per a checkpoint-time user decision (`06-01-PLAN.md` Task 2) — originally shadcn-standard clsx+tailwind-merge per `06-RESEARCH.md`'s Don't-Hand-Roll table, now superseded.
**Apply to:** all 4 component files — every conditional className composition goes through `src/lib/utils.ts`'s `cn()`, never a hand-rolled `classNames()`.

### No raw HTML string injection for icons
**Source:** `06-RESEARCH.md` Security Domain ("Known Threat Patterns") + `frontend-design/design-system/icons.js`'s current string-templating shape
**Apply to:** `src/components/icon.tsx` — port `SepCareIcons` path data into real JSX elements, never `dangerouslySetInnerHTML`.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `postcss.config.mjs` | config | transform | No PostCSS config exists yet in this repo (Tailwind not yet installed) — use RESEARCH.md Code Examples verbatim (verified against installed `next@16.3.5` docs) |
| `components.json` | config | transform | shadcn not yet installed — hand-author per RESEARCH.md's Primary Recommendation (avoids the CLI's missing `--base-color` flag, Pitfall #2) |
| `src/components/ui/{button,card,badge,input}.tsx` | component | request-response | First shadcn/Radix install in this repo — no prior shadcn-generated component exists to copy structurally; use RESEARCH.md Pattern 3 (CVA shape) + UI-SPEC Component Inventory (exact variant contract) + `frontend-design/design-system/components.css`/`components.js` (interaction-state reference only) |

## Metadata

**Analog search scope:** `src/` (entire tree, 13 files — small enough for exhaustive read), `frontend-design/design-system/` (tokens.css, icons.js, DESIGN-SYSTEM.md, components.css, components.js), root config files (`tsconfig.json`, `package.json`, no existing `postcss.config.*` or `components.json`)
**Files scanned:** 13 in `src/`, 8 in `frontend-design/design-system/`, plus `package.json`/`tsconfig.json`
**Pattern extraction date:** 2026-09-26
**Tracked-source verification:** all analog paths above (`src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/api/health/route.ts`, `src/lib/risk/compute.ts`, `frontend-design/design-system/tokens.css`, `frontend-design/design-system/icons.js`, `frontend-design/design-system/DESIGN-SYSTEM.md`) confirmed via `git ls-files` — all git-tracked source, no gitignored mirrors.
