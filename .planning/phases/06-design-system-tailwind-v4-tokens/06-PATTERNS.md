# Phase 6: Design System (Tailwind v4 Tokens) — REWORK — Pattern Map

**Mapped:** 2026-09-27
**Files analyzed:** ~30 (4 restyle-in-place, ~13 new `ui/*.tsx`+`*.DESIGN.md` pairs, 1 icon-file edit, 4 docs-site route files + N per-component doc routes, 1 Home-proof route, package.json)
**Analogs found:** all — every new file has a same-repo analog; there is no "no analog" bucket this pass (the repo already contains the exact skeletons D-12 expands on)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/ui/button.tsx` (restyle+expand variants) | component | request-response (client-interactive) | itself (existing file, git history) | exact — same file, visual/variant rework only |
| `src/components/ui/card.tsx` (restyle, keep structure) | component | CRUD-display | itself | exact |
| `src/components/ui/badge.tsx` | component | CRUD-display | itself | exact (contract unchanged) |
| `src/components/ui/input.tsx` | component | request-response (form) | itself | exact |
| `src/components/ui/label.tsx` (new, shadcn `add label`) | component | display | `src/components/ui/input.tsx` (nearest hand-styled form primitive) | role-match |
| `src/components/ui/field.tsx` (new, shadcn `add field`) | component | request-response (form wrapper) | `src/components/ui/input.tsx` (error-slot/state pattern to retire in favor of Field) | role-match |
| `src/components/ui/select.tsx` (new, shadcn `add select`) | component | request-response (form) | `src/components/ui/input.tsx` | role-match |
| `src/components/ui/textarea.tsx` (new) | component | request-response (form) | `src/components/ui/input.tsx` | role-match |
| `src/components/ui/checkbox.tsx` (new) | component | event-driven (toggle) | `src/components/ui/input.tsx` (state/disabled treatment) | partial |
| `src/components/ui/radio-group.tsx` (new) | component | event-driven | `src/components/ui/input.tsx` | partial |
| `src/components/ui/switch.tsx` (new) | component | event-driven | `src/components/ui/input.tsx` | partial |
| `src/components/ui/progress.tsx` (new, restyled as battery/level) | component | streaming/display | `src/components/ui/badge.tsx` (CVA + `data-slot` pattern) | role-match |
| `src/components/ui/toggle-group.tsx` + `toggle.tsx` (new) | component | event-driven | `src/components/ui/button.tsx` (press-state, CVA variant pattern) | role-match |
| `src/components/ui/chart.tsx` (new, via `add chart`, Card-overwrite guarded) | component | streaming/transform | `src/components/ui/card.tsx` (surface/container conventions) + Recharts upstream | partial — genuinely new capability, styling conventions borrowed from Card |
| `src/components/ui/sparkline.tsx` (new, hand-authored, thin Recharts wrapper) | component | streaming/transform | Pattern 1 in RESEARCH.md (already concrete code) + `chart.tsx` once installed | partial |
| `src/components/ui/item.tsx` (new, shadcn `add item`) | component | CRUD-display (list row) | `src/components/ui/card.tsx` (CardHeader/CardContent composition style) | role-match |
| `src/components/ui/nav-link.tsx` (new, hand-authored) | component | event-driven (route state) | `src/components/ui/badge.tsx` (multi-modal icon+label+color rule, CVA `data-slot`/`data-status` pattern) | role-match |
| `src/components/ui/nav-bar.tsx` (new, hand-authored) | component | event-driven | `src/components/ui/card.tsx` (fixed-container primitive) + composes `nav-link.tsx` | role-match |
| `src/components/ui/battery-indicator.tsx` (new, hand-authored, wraps Progress) | component | display | `src/components/ui/badge.tsx` (Icon-pairing convention) + `progress.tsx` | role-match |
| Every new `*.DESIGN.md` (label, field, select, textarea, checkbox, radio-group, switch, progress, toggle-group, chart, sparkline, item, nav-link, nav-bar, battery-indicator) | doc | static content | `src/components/ui/button.DESIGN.md` (structure: Variants table → Correct usage → Incorrect usage → Overflow/backstop) | exact — this is the mandated pairing pattern (D-06) |
| `src/components/icon.tsx` (add `smartwatch-dot`, `bottle-baby`, `baby-02`, sort-direction entries) | utility | transform | itself (existing file, same 24px/1.75px-stroke convention) | exact |
| `src/app/design-system/docs/page.tsx` → split into a docs shell + per-component routes | route/component | request-response (SSR) | itself (existing file) — **but flagged as the anti-pattern to abandon**, see below | exact-file-to-replace |
| `src/app/design-system/docs/layout.tsx` (new — sidebar shell) | route | request-response (SSR) | `src/components/page-shell.tsx` (existing shared shell pattern) | role-match |
| `src/app/design-system/docs/[component]/page.tsx` (new, one route per component or static per-folder pages) | route | request-response (SSR + client islands) | `src/app/design-system/states/page.tsx` (PageShell usage, live-rendered real components, not static screenshots) | role-match |
| `src/app/design-system/states/page.tsx` (visual-quality pass w/ expanded set) | route | request-response (SSR) | itself | exact |
| `src/app/design-system/empty-loading/page.tsx` (visual-quality pass) | route | request-response (SSR) | `src/app/design-system/states/page.tsx` (same PageShell + grid pattern) | exact-sibling |
| `src/app/design-system/nested/page.tsx` (visual-quality pass) | route | request-response (SSR) | `src/app/design-system/states/page.tsx` | exact-sibling |
| `src/app/design-system/home-proof/page.tsx` (new, D-14) | route | request-response (SSR) + client islands (Sparkline, ToggleGroup) | `src/app/design-system/states/page.tsx` (PageShell wrapper, composes real `ui/*` components, no mock-data-fetching layer) | role-match |
| `src/components/page-shell.tsx` (likely unchanged, maybe extended for docs sidebar variant) | component | display | itself | exact |
| `package.json` (add `recharts`; optionally strip transitive unused `lucide-react`) | config | batch (install) | itself (existing dependency block, e.g. how `cn`/`radix-ui`/`class-variance-authority` are declared) | exact |

## Pattern Assignments

### `src/components/ui/*.tsx` — the component + DESIGN.md pairing (applies to every new component)

**Analog:** `src/components/ui/button.tsx` + `src/components/ui/button.DESIGN.md` (best exemplar: CVA variant union, `data-slot`/`data-variant`, exported `type XVariant`, and a paired DESIGN.md with Variants table → Correct usage → Incorrect usage → Overflow/backstop section).

**Imports pattern** (button.tsx lines 1-4):
```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"
```
`cn` is imported from the project's own `@/lib/utils` wrapper (`src/lib/utils.ts`: `import { cn } from "cn"; export { cn }`) — never import `cn` (or a hand-rolled clsx/tailwind-merge combo) directly in a component file; always go through `@/lib/utils`.

**CVA variant-union pattern** (button.tsx lines 15-32):
```tsx
const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-btn px-5 py-3 text-body font-semibold transition-colors duration-[var(--duration-normal)] disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        "primary": "bg-brand-fill text-text-inverse hover:bg-brand-fill-hover active:bg-brand-fill-active",
        ...
      },
    },
    defaultVariants: { variant: "primary" },
  }
)
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>
```
Copy this exact shape for every new component with a variant axis (Button expansion, Progress `variant="battery"|"bar"|"ring"`, NavLink `state="active"|"inactive"`). Always export the derived `type XVariant` — this is what makes the variant surface a compile-time-closed union (per D-06), not a runtime string.

**`data-slot` + optional `Slot.Root`/`asChild` pattern** (button.tsx lines 34-59): every primitive sets `data-slot="<name>"` on its root element (also `data-variant`/`data-status`/`data-loading` where relevant) for CSS/test hookability. Only add `asChild`/`Slot.Root` support where composability doesn't undermine an enforced multi-modal rule — Badge explicitly **omits** `asChild` (see badge.tsx's own doc-comment, lines 6-12) because it must guarantee Icon+label+color together; the same reasoning applies to `nav-link.tsx` (must guarantee icon+label+color for the active state) — do not add `asChild` there either.

**Multi-modal color rule (icon + label + color, never color alone)** — `src/components/ui/badge.tsx` lines 8-13 (doc comment) and 30-46 (implementation): this exact pattern must be replicated by `nav-link.tsx`'s active/inactive state per UI-SPEC's explicit instruction ("Must follow Badge's multi-modal rule").
```tsx
function Badge({ className, status, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" data-status={status} className={cn(badgeVariants({ status }), className)} {...props}>
      <Icon name={status} size={16} />
      {children}
    </span>
  )
}
```

**Icon usage pattern** — `import { Icon } from "@/components/icon"` (badge.tsx line 4); every new hand-authored icon need (smartwatch-dot, bottle-baby, baby-02, sort-direction) gets added as a new entry inside `src/components/icon.tsx`'s `icons` object (see `src/components/icon.tsx` lines 17-60 for the exact `<path>`/`<circle>` entry shape and the file's own doc-comment on preserving `viewBox="0 0 24 24"`, `strokeWidth={1.75}` conventions) — never `import ... from "lucide-react"` even though it becomes transitively available after `shadcn add chart` (RESEARCH.md Pitfall 5).

**Card composition — "layout never changes" rule** — `src/components/ui/card.tsx` (full file) + `card.DESIGN.md` "The layout never changes rule" section: every new Card *type* (vital stat card, status hero card, instruction-row card) must be a **composition** of the existing `Card`/`CardHeader`/`CardContent` primitives (do not add a new outer wrapper that appears only in some content states). Only add new named subcomponents (e.g. a `CardMetric` for the Vital-metric number) if Figma extraction proves the visual can't be expressed via the existing four; do not add a `variant` prop to `Card` itself — `card.DESIGN.md` states "Card is the single surface-container primitive... no variants."

**DESIGN.md structure to replicate exactly** — `src/components/ui/button.DESIGN.md` (full file, 4 sections: table of variants/values, a named sub-state section like "Loading sub-state", "Correct usage" fenced code block, "Incorrect usage" fenced code block showing what TypeScript rejects, and a closing "Overflow / long-text (backstop)" paragraph referencing the UI-SPEC's held-out render test). Every new component's DESIGN.md must record **which Figma node it was verified against** (per D-15/Pitfall 4) — none of the existing 4 DESIGN.md files currently do this (they predate D-15); the rebuilt ones should add a line like "Verified against Figma node `203-11745` on 2026-09-27" near the top.

---

### `src/components/ui/nav-link.tsx` / `nav-bar.tsx` (new, hand-authored)

**Analog:** `src/components/ui/badge.tsx` (multi-modal icon+label+color, CVA `data-status`-style variant keyed by state) for NavLink; `src/components/ui/card.tsx` (fixed-surface container, `rounded-*`/`shadow-*` token usage) for NavBar's outer shell.

**Pattern to follow for NavLink's active/inactive CVA axis** (mirrors badge.tsx lines 19-28):
```tsx
const navLinkVariants = cva(
  "inline-flex flex-col items-center gap-1 min-h-11 min-w-11 justify-center transition-colors duration-[var(--duration-fast)] active:scale-[0.96]",
  {
    variants: {
      state: {
        active: "text-critical", // per D-17: nav active state intentionally reuses critical/pink hue
        inactive: "text-text-muted",
      },
    },
    defaultVariants: { state: "inactive" },
  }
)
```
Note the `min-h-11 min-w-11` (44px) touch-target floor — UI-SPEC's Spacing Scale section calls this out explicitly for every NavLink row. `aria-current="page"` (or equivalent) should be set on the active link per the UI-SPEC's accessibility row (`aria-current` on active NavLink).

**D-17 color resolution:** unlike a normal "flag before implementing" tension, D-17 (CONTEXT.md) has already resolved the red/pink-vs-brand tension from UI-SPEC's "Flagged tension" section in the user's favor of matching the screenshot exactly — implement `active: "text-critical"` (or the closest fill-equivalent token) directly, do not re-flag this as unresolved during planning.

---

### `src/components/ui/sparkline.tsx` / `chart.tsx` (new)

**Analog:** RESEARCH.md's own Pattern 1 (Recharts sparkline) and Pattern 2 (dual-axis chart) code blocks — already concrete, ready to copy verbatim as a starting point — plus `src/components/ui/card.tsx` for the surrounding stat-card composition style once `VitalStatCard` wraps `Sparkline`.

**Client-boundary pattern** (RESEARCH.md lines 184-211): `sparkline.tsx` needs `"use client"` at the top (Recharts' `ResponsiveContainer` requires DOM measurement); the composing card component itself (e.g. a Home-proof vital-stat card) stays a Server Component and only imports the client `Sparkline`. Mirror this "client leaf, server wrapper" split for `chart.tsx`/`DualAxisVitalsChart` too.

**Mandatory install-order guard** (RESEARCH.md Pitfall 1, Common Pitfalls section): before running `npx shadcn add chart`, run `npx shadcn add chart --diff` first and confirm whether `card.tsx` is in the diff; if so, install into a scratch dir and hand-copy only `chart.tsx`, preserving the already-restyled `src/components/ui/card.tsx`. Do not skip this — it is the single highest-risk install step in the whole file list.

---

### `src/app/design-system/docs/page.tsx` — the anti-pattern to abandon, and its replacement shape

**What's wrong, concretely (not just described):** `src/app/design-system/docs/page.tsx` lines 1-19 (doc comment) confirm the current page reads `globals.css` via `readFileSync` and (per RESEARCH.md Pitfall 3, independently confirmed) renders `.DESIGN.md` content through a `<pre>` block rather than any markdown rendering — this is the literal "single page bunch of crap" the user rejected. The file also mixes token-parsing logic (`readThemeBlock`/`parseThemeTokens`/`parsePrimitiveRamps`, lines 21-80) directly into the page component — a 537-line single file with no per-component routing.

**What's reusable from it:** the `readThemeBlock`/`parseThemeTokens`/`parsePrimitiveRamps` helper functions (lines 21-80) are legitimately reusable for the new docs site's "Color and type reference" pages (D-13 requirement #2) — keep this parsing logic, move it to a shared `src/app/design-system/docs/_lib/tokens.ts`-style module, and feed its output into real styled swatch/type-sample components instead of raw text.

**Replacement structure (per D-13 + RESEARCH.md Architecture diagram):** a persistent sidebar shell (`docs/layout.tsx`, new — pattern-borrow from `src/components/page-shell.tsx`'s consistent-header approach, but add a left nav rail) wrapping one route per component (or grouped folder), each rendering: a live interactive preview (import the real `ui/*.tsx` component and a client-side variant picker, not a static grid), the parsed color/type tokens via the reused helpers above rendered as real swatches, and the component's `.DESIGN.md` "Correct/Incorrect usage" sections rendered through a markdown-to-JSX pass (e.g. a minimal markdown renderer or manually mapped sections) — never through `<pre>{rawMarkdownString}</pre>`.

**Analog for the per-component page's PageShell/composition style:** `src/app/design-system/states/page.tsx` (full file) — note it imports and renders the *real* `Badge`/`Card` components live, wrapped in the shared `PageShell`, exactly the "live, interactive preview" pattern D-13 wants generalized to every component's own docs route.

---

### `src/app/design-system/home-proof/page.tsx` (new, D-14)

**Analog:** `src/app/design-system/states/page.tsx` — same `PageShell` wrapper + real-component-composition pattern, scaled up to a full composite screen. Copy the file's top-of-file doc-comment convention (explaining which decision/plan the page satisfies) and its default-export-function shape:
```tsx
import { PageShell } from "@/components/page-shell";
export default function StatesDesignSystemPage() {
  return (
    <PageShell title="..." description="...">
      {/* real components, no mock-fetching layer */}
    </PageShell>
  );
}
```
For Home-proof specifically: header + status-hero Card + 3-column vitals row (each a Card composing `Sparkline`) + Instructions list (`Card` + `Item`/`ItemContent`/`ItemTitle`) + fixed `NavBar` — each of these is a real, already-classified component from the table above; this page is pure composition, introduces no new primitive of its own.

---

## Shared Patterns

### `cn()` className merge
**Source:** `src/lib/utils.ts` (2-line re-export of the `cn` npm package)
**Apply to:** every new component file — always `import { cn } from "@/lib/utils"`, never import `cn` directly from the `cn` package or reintroduce `clsx`/`tailwind-merge`.

### CVA variant-union + exported type
**Source:** `src/components/ui/button.tsx` lines 15-32
**Apply to:** every component with a variant/state axis (expanded Button, Progress, ToggleGroup items, NavLink, Card-type discrimination if any turns out to need a prop rather than pure composition).

### `data-slot` (+ `data-variant`/`data-status`/`data-state`) attribute convention
**Source:** `src/components/ui/button.tsx` line 36, `src/components/ui/badge.tsx` line 33
**Apply to:** every new component's root element, for consistent hookability/testability across the whole set.

### Icon pairing (never color alone)
**Source:** `src/components/ui/badge.tsx` lines 30-46, doc-comment lines 6-12
**Apply to:** `nav-link.tsx` (active/inactive), `battery-indicator.tsx` (battery/charging glyph), any new status-adjacent component.

### Token-only styling — no raw hex/px in component classes
**Source:** every existing component file (button/card/badge/input) exclusively references `bg-brand-fill`, `text-critical-dark`, `rounded-card`, `--duration-normal`, etc. — never a literal hex or px value inline.
**Apply to:** all new components; any not-yet-declared token (`--radius-nav-bar`, additional card-tint colors) must be added to `src/app/globals.css`'s `@theme` block following the exact naming convention already used (`--radius-*`, `--color-*-soft`/`-dark`/`-fill`) before being consumed, never hardcoded as an arbitrary Tailwind value in the component itself except as a documented, explicit exception (the project already tolerates one such exception: `duration-[var(--duration-normal)]`, per button.tsx's own doc-comment on Tailwind v4's `--duration-*` utility-generation gap).

### Shared page shell for every `/design-system/*` route
**Source:** `src/components/page-shell.tsx` (full file)
**Apply to:** `states`, `empty-loading`, `nested`, `home-proof`, and (with a sidebar-extended variant) the rebuilt `docs` site.

### Press/hover/focus micro-interaction rules (UI-SPEC, not yet in any existing file — net-new shared rule this pass)
**Source:** `06-UI-SPEC.md` "Surface tokens (Radius, Shadow, Motion)" section — `active:scale-[0.96]` + `150ms ease-out`, hover only transitions `color`/`background-color`/`box-shadow` (never `transition-all`), no font-weight change to signal state.
**Apply to:** every new interactive component (Button variants, NavLink, ToggleGroup items, Switch, Checkbox) — none of the 4 existing components currently apply `active:scale-[0.96]` (spot-checked: button.tsx has no such class), so this is a **new** convention to introduce consistently across the whole expanded set, not one to copy from an existing file.

## No Analog Found

None — every file in the expanded D-12/D-13/D-14 scope has at least a role-match analog already in the repo (the four existing components, their DESIGN.md pairing, the `page-shell.tsx` + `design-system/*` route pattern, and RESEARCH.md's own already-concrete Recharts code blocks for the genuinely new charting capability).

## Metadata

**Analog search scope:** `src/components/ui/`, `src/components/`, `src/app/design-system/`, `src/app/globals.css`, `package.json`, `src/lib/utils.ts`
**Files scanned:** button.tsx/.DESIGN.md, card.tsx/.DESIGN.md, badge.tsx/.DESIGN.md, input.tsx/.DESIGN.md, icon.tsx, utils.ts, page-shell.tsx, design-system/docs/page.tsx (partial, first ~80 of 537 lines + doc-comment), design-system/states/page.tsx (full), globals.css (`@theme` block), package.json
**Pattern extraction date:** 2026-09-27
