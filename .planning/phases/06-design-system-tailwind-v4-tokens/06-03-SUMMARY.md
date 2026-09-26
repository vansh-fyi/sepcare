---
phase: 06-design-system-tailwind-v4-tokens
plan: 03
subsystem: ui
tags: [tailwind, shadcn, cva, design-system]
requires:
  - phase: "06-02"
    provides: "Radix-based Card/Badge/Input primitives (pre-restyle) + the Icon component"
provides:
  - "Restyled Button — closed CVA variant union `ButtonVariant = \"primary\" | \"secondary\" | \"tertiary\" | \"critical\"`, no size axis, layout-invariant `loading` sub-state"
  - "Restyled Card — token-driven radius/shadow/padding on Card/CardHeader/CardContent, structurally invariant across content states"
  - "Restyled Badge/StatusPill — closed CVA status union `BadgeStatus = \"safe\" | \"caution\" | \"critical\"`, always renders Icon+label+color together"
  - "Restyled Input — token-driven radius/padding/border, error-message slot with locked copy, disabled/locked treatment"
  - "Four DESIGN.md docs (one per component) documenting the locked variant/status contract with correct/incorrect usage examples"
affects: ["06-04", "06-05", "07"]
actuals:
  tokens: 5717
  tasks: 2
  commits: 2
  plan_head_before: 6e2d842ee5e652812336c4b0064a8c966eccaa33
tech-stack:
  added: []
  patterns:
    - "Tailwind v4 has no `--duration-*` theme namespace for utility generation — named classes like `duration-normal` compile to nothing even though the `--duration-*` custom properties exist in `@theme`. Token-driven durations must use arbitrary-value syntax referencing the CSS variable directly (`duration-[var(--duration-normal)]`, `[animation-duration:var(--duration-slow)]`), verified via a direct `@tailwindcss/postcss` compile probe before writing any component code."
    - "Quoted CVA variant keys (`\"primary\": \"...\"` instead of `primary: \"...\"`) are a deliberate authoring convention this plan's own `<verify>` grep instruments depend on — future components in this finite-variant system should keep quoting variant/status keys so the same grep-based lock-verification pattern keeps working."
    - "Badge intentionally drops shadcn's stock `asChild`/`Slot` composition — Badge's icon+label+color invariant lives in the component body, not just its class string, so allowing a caller to substitute the rendered element would let an agent bypass the multi-modal safety rule."
key-files:
  created:
    - src/components/ui/button.DESIGN.md
    - src/components/ui/card.DESIGN.md
    - src/components/ui/badge.DESIGN.md
    - src/components/ui/input.DESIGN.md
  modified:
    - src/components/ui/button.tsx
    - src/components/ui/card.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/input.tsx
key-decisions:
  - "Fixed a Tailwind v4 duration-token bug discovered while implementing Button's base transition classes: named `duration-normal`/`duration-slow` utility classes silently compile to nothing (no `--duration-*` theme namespace exists in Tailwind v4 core, confirmed via direct postcss probe and via the actual `next build` CSS output) — switched every duration reference to arbitrary-value syntax against the same `--duration-*` custom properties, keeping the intent token-driven while making it actually render."
  - "Added `px-5 py-3` to Button's base classes and `w-full` to Input's — both omitted from the plan's literal verbatim class strings but essential for a usable button/full-width form input (Rule 2), matching the components.css interaction-state reference (`padding: 12px 20px`, `.sc-input { width: 100% }`)."
  - "Left CardTitle/CardDescription/CardAction/CardFooter untouched (still referencing shadcn's undefined stock tokens) — out of this task's explicit file scope, unused anywhere in src/, logged to 06-03-deferred-items.md and the WINDOWS ledger rather than fixed."
patterns-established:
  - "Every restyled atomic component (Button/Card/Badge/Input) now consumes only the Figma-derived `@theme` tokens from `src/app/globals.css` — zero shadcn-stock-palette class names remain in any of the four files."
requirements-completed: [DSYS-01, DSYS-03]
coverage:
  - id: D1
    description: "Button restyled to exactly 4 CVA variants (primary/secondary/tertiary/critical, no size axis) with a layout-invariant loading sub-state; Card restyled to token-driven radius/shadow/padding, structurally invariant across content states; both documented in their own DESIGN.md"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -oE '\"[a-zA-Z]+\":' src/components/ui/button.tsx | sort -u | tr -d '\\n' -> exactly \"critical\":\"primary\":\"secondary\":\"tertiary\":"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: other
        ref: "test -f src/components/ui/button.DESIGN.md && test -f src/components/ui/card.DESIGN.md"
        status: pass
    human_judgment: false
  - id: D2
    description: "Badge restyled to exactly 3 status keys (safe/caution/critical), each always rendering Icon+label+color together; Input restyled to token-driven radius/padding/border with an error-message slot (locked copy) and disabled/locked treatment; both documented in their own DESIGN.md"
    requirement: "DSYS-01"
    verification:
      - kind: other
        ref: "grep -oE '\"[a-zA-Z]+\":' src/components/ui/badge.tsx | sort -u | tr -d '\\n' -> exactly \"caution\":\"critical\":\"safe\":"
        status: pass
      - kind: other
        ref: "grep -c Icon src/components/ui/badge.tsx -> 4 (>0)"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: other
        ref: "test -f src/components/ui/badge.DESIGN.md && test -f src/components/ui/input.DESIGN.md"
        status: pass
    human_judgment: false
  - id: D3
    description: "Overflow/long-text held-out render tests for Button label, Badge/StatusPill label, Card heading, and Input label/value — truncate/ellipsis and wrap-without-breaking-shape behavior"
    verification: []
    human_judgment: true
    rationale: "Both truths are explicitly marked `verification: backstop` in the plan's own must_haves block — no automated render test exercises actual long-string content against these components in this plan (no sample page renders them with adversarial-length strings yet). Each component's DESIGN.md notes this explicitly rather than silently claiming the backstop truths are proven. Deferred to whichever phase first renders these components against real/adversarial content (likely Phase 7)."
duration: 35min
completed: 2026-09-26
status: complete
---

# Phase 6 Plan 03: Component Restyle + Design Docs Summary

**Button/Card/Badge/Input restyled to exact D-08 locked variant contracts with per-component DESIGN.md docs; Badge always renders Icon+label+color; discovered and fixed a Tailwind v4 duration-token bug along the way.**

## Performance
- **Duration:** ~35min
- **Tasks:** 2
- **Files modified:** 8 (4 restyled components + 4 new DESIGN.md docs)

## Accomplishments
- Button: closed 4-variant CVA union (`primary`/`secondary`/`tertiary`/`critical`), CLI `size` axis fully removed, new `loading` sub-state (label hidden via `opacity-0` so layout space is reserved, centered spinner overlay, height/padding/width invariant, `prefers-reduced-motion`-respecting)
- Card: `Card`/`CardHeader`/`CardContent` restyled to token-driven radius/shadow/padding/gap; structural nesting unchanged across empty/loading/populated states (no conditional wrapper elements)
- Badge: closed 3-status CVA union (`safe`/`caution`/`critical`), prop renamed `variant`→`status`, every render pairs `<Icon name={status} />` with the label and status color — never color alone; `asChild`/`Slot` composition intentionally dropped since it could let a caller bypass that guarantee
- Input: token-driven radius/padding/border, `aria-invalid:border-critical` + inline error-message slot (locked default copy: "Couldn't load this. Check your connection and try again."), disabled/locked treatment covering the in-flight-operation case
- Discovered mid-Task-1 that Tailwind v4 has no `--duration-*` theme namespace — named classes like `duration-normal` silently compile to zero CSS even though the tokens exist in `@theme`; verified via a direct `@tailwindcss/postcss` compile probe, then fixed every duration reference to use arbitrary-value syntax (`duration-[var(--duration-normal)]`, `[animation-duration:var(--duration-slow)]`) and re-verified the fix compiles in the actual `next build` output
- Authored all 4 `DESIGN.md` docs: variant/status usage tables, one correct + one incorrect (TypeScript-rejected) usage example each, and an explicit note on the 2 backstop-tier overflow/long-text truths not yet independently verified
- `npm run build` green after both tasks; `npm test` — 57 passed / 2 failed (both the pre-documented `tests/realtime.subscribe.test.ts`/`tests/realtime.risk-scores.test.ts` flake, unrelated to this plan's UI-only changes) / 1 skipped

## Task Commits
1. **Task 1: Restyle Button + Card, author their DESIGN.md docs** - `c6e938b` (feat)
2. **Task 2: Restyle Badge + Input, author their DESIGN.md docs** - `1ebb661` (feat)

## Files Created/Modified
- `src/components/ui/button.tsx` - closed 4-variant CVA union, no size axis, `loading` sub-state, duration-token fix applied
- `src/components/ui/card.tsx` - `Card`/`CardHeader`/`CardContent` restyled to locked tokens; `CardTitle`/`CardDescription`/`CardAction`/`CardFooter` left untouched (see Deviations)
- `src/components/ui/badge.tsx` - closed 3-status CVA union, `variant`→`status` rename, Icon+label+color enforced in the component body, `asChild` dropped
- `src/components/ui/input.tsx` - token-driven styling, error-message slot + locked copy, disabled/locked treatment, wrapped in a container div to host the error slot
- `src/components/ui/button.DESIGN.md` - new, variant-usage table + correct/incorrect examples
- `src/components/ui/card.DESIGN.md` - new, composition table + "layout never changes" rule explanation
- `src/components/ui/badge.DESIGN.md` - new, status-usage table + multi-modal-rule explanation
- `src/components/ui/input.DESIGN.md` - new, state table + error-copy contract
- `.planning/phases/06-design-system-tailwind-v4-tokens/06-03-deferred-items.md` - new, logs the out-of-scope CardTitle/CardDescription/CardAction/CardFooter discovery
- `.planning/WINDOWS.md` - appended one `deviation`-kind entry for the same discovery

## Decisions Made
- Switched every `duration-fast`/`duration-normal`/`duration-slow` reference to arbitrary-value syntax (`duration-[var(--duration-normal)]`, `[animation-duration:var(--duration-slow)]`) after confirming via a direct `@tailwindcss/postcss` compile probe that Tailwind v4 has no `--duration-*` theme namespace for utility generation — the named classes the plan's action text specified would have silently produced zero CSS.
- Added `px-5 py-3` to Button's base classes and `w-full` to Input's — both were absent from the plan's literal verbatim class strings but are essential for a usable component; sourced from the `components.css` interaction-state reference file.
- Dropped Badge's `asChild`/`Slot` composition entirely (present in the pre-restyle CLI scaffold) since the multi-modal Icon+label+color guarantee lives in the component body, not the class string, and `asChild` would let a caller substitute the rendered element and bypass it.
- Wrote each component's error/loading state description into its own DESIGN.md rather than a shared doc, matching D-06's "per-component doc" methodology and keeping each doc scoped to what that component's own contract needs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Tailwind v4 has no `--duration-*` theme namespace — named `duration-normal`/`duration-slow` classes compile to nothing**
- **Found during:** Task 1 (implementing Button's base transition classes and loading spinner)
- **Issue:** The plan's action text (and `06-UI-SPEC.md`'s own Surface Tokens section) specified base classes including the literal string `duration-normal`, and a spinner "animated via a CSS class using the `--duration-slow` token." Tailwind v4's `--duration-*` custom properties in `@theme` do NOT register a utility-generating theme namespace (confirmed via `grep -o "duration-[A-Za-z-]*" node_modules/tailwindcss/dist/lib.js` — only a static `duration-initial` keyword exists, plus numeric/arbitrary matching) — a class like `duration-normal` is simply an unrecognized candidate that produces zero CSS, silently breaking the intended transition timing rather than erroring.
- **Fix:** Verified the failure and the fix empirically via a direct `postcss([tailwindcssPostcss(...)])` compile probe (in the scratchpad, not committed) before writing any component code: confirmed `duration-normal` alone produces no `.duration-normal` rule, while `duration-[var(--duration-normal)]` and `[animation-duration:var(--duration-slow)]` both compile correctly and resolve to the intended token value. Applied the arbitrary-value form throughout `button.tsx`, then re-confirmed via the real `next build` output (`.next/static/chunks/*.css`) that both compiled rules are present.
- **Files modified:** `src/components/ui/button.tsx`
- **Verification:** `grep -o "[^}]*duration-normal[^{]*{[^}]*}" .next/static/chunks/*.css` shows the `.theme` block and the compiled `.duration-\[var\(--duration-normal\)\]{...}` rule; `grep -o "animation-duration\:var\(--duration-slow\)\][^}]*{[^}]*}" .next/static/chunks/*.css` shows the compiled `animation-duration:var(--duration-slow)` rule; `npm run build` green
- **Commit:** `c6e938b`

**2. [Rule 2 - Missing critical functionality] Button had no padding/height in the plan's verbatim base classes; Input had no `w-full`**
- **Found during:** Task 1 (Button) and Task 2 (Input)
- **Issue:** The plan's literal base-class string for Button (`inline-flex items-center justify-center rounded-btn text-body font-semibold transition-colors duration-normal disabled:opacity-50 disabled:pointer-events-none`) omits any padding or height utility, which would render a Button with no internal spacing around its label. Similarly, Input's literal class string omits `w-full`, which would size the input to its content rather than its container.
- **Fix:** Added `px-5 py-3` to Button's base classes (matching `components.css`'s `.sc-btn { padding: 12px 20px; }` reference, i.e. `py-3 px-5`) and `w-full` to Input's wrapper input element (matching `.sc-input { width: 100%; }`).
- **Files modified:** `src/components/ui/button.tsx`, `src/components/ui/input.tsx`
- **Verification:** `npm run build` green; compiled CSS confirms `.px-5`/`.py-3`/`.w-full` utilities present
- **Commit:** `c6e938b` (Button), `1ebb661` (Input)

**3. [Rule 1 - Bug / design-invariant enforcement] Badge's inherited `asChild`/`Slot` composition could bypass the multi-modal rule**
- **Found during:** Task 2 (restyling Badge)
- **Issue:** The pre-restyle CLI-scaffolded `badge.tsx` supported `asChild` (via `Slot.Root`), letting a caller replace the rendered `<span>` with an arbitrary element. Since D-08's "Icon+label+color together, never color alone" invariant is enforced inside the Badge component body (it always renders `<Icon name={status} />` before `children`), keeping `asChild` would let a future caller substitute the rendered element and silently drop that guarantee — undermining the exact rule this restyle exists to lock in.
- **Fix:** Removed `asChild`/`Slot` support entirely from `badge.tsx`; Badge is now always a fixed `<span>` wrapping `Icon` + `children`.
- **Files modified:** `src/components/ui/badge.tsx`
- **Verification:** `npm run build` green; `grep -c Icon src/components/ui/badge.tsx` → 4 (import + JSX usage); manual read confirms no `Slot`/`asChild` remnants
- **Commit:** `1ebb661`

---

**Total deviations:** 3 auto-fixed (2 Rule 1, 1 Rule 2). **Impact:** All three preserve or strengthen the plan's actual intent (a functioning token-driven transition/animation system, a genuinely usable Button/Input, and an unbypassable Badge multi-modal guarantee) against either a Tailwind v4 tooling reality that diverged from the plan's literal class strings, or an inherited scaffold behavior that would have contradicted D-08's own stated rule. No scope or requirement changes.

## Issues Encountered
`npm test` showed 2 failures in `tests/realtime.subscribe.test.ts` and `tests/realtime.risk-scores.test.ts` — both are the pre-documented, non-blocking Realtime-delivery-timing flake already tracked in `PROJECT.md`'s "Known tech debt carried into v1.1 planning" section (intermittent under full-suite runs, pass in isolation). Unrelated to this plan's UI-only changes (no backend/Realtime code touched); no action taken.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Plan 06-04/06-05 (and Phase 7's composite screens) can now build on a fully token-driven, finite-variant Button/Card/Badge/Input set with per-component DESIGN.md docs. Deferred: `CardTitle`/`CardDescription`/`CardAction`/`CardFooter` still reference undefined shadcn stock tokens (unused anywhere in `src/` today) — tracked in `06-03-deferred-items.md` and the WINDOWS ledger for whichever phase first renders them. The 2 backstop-tier overflow/long-text truths (Button/Badge/Card/Input long-string render behavior) remain unverified by an automated test; each component's DESIGN.md flags this explicitly.

## Self-Check: PASSED

All created files (`src/components/ui/button.DESIGN.md`, `card.DESIGN.md`, `badge.DESIGN.md`, `input.DESIGN.md`, `.planning/phases/06-design-system-tailwind-v4-tokens/06-03-deferred-items.md`) confirmed present on disk. Both task commits (`c6e938b`, `1ebb661`) confirmed present in `git log --oneline --all`.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-26*
