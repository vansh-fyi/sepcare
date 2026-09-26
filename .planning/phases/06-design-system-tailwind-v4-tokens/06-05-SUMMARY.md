---
phase: 06-design-system-tailwind-v4-tokens
plan: 05
subsystem: ui
tags: [nextjs, tailwind, design-system, app-router, docs]
requires:
  - phase: "06-04"
    provides: "Three real D-10 sample pages (states, empty-loading, nested) and confirmation that exactly one @theme block exists under src/"
provides:
  - "src/app/design-system/docs/page.tsx — a human-readable design-system reference page that live-parses Color Tokens and Typography Scale from src/app/globals.css's single @theme block at build/request time, transcribes the locked Spacing Scale, renders all four component DESIGN.md files (button/card/badge/input) verbatim, and links to the three existing sample pages"
affects: ["07"]
actuals:
  tokens: 3100
  tasks: 2
  commits: 2
  plan_head_before: 890391f70bbc223d98179035fd96a7e7e6c76034
tech-stack:
  added: []
  patterns:
    - "readFileSync calls that read project files at Server Component render time must use a fully static, literal path argument (not a template-literal or dynamic-property-lookup path) — Next.js/Turbopack's build-time file tracer otherwise emits a 'Dynamic filesystem access causes tracing of the whole project' warning and bundles the entire project into deployment output, a real concern on this project's Vercel free-tier hosting."
key-files:
  created:
    - src/app/design-system/docs/page.tsx
  modified: []
key-decisions:
  - "Component DESIGN.md content is rendered raw inside a <pre> element (not converted through a markdown-to-HTML library) since no such dependency is installed and the prose is already locked/reviewed — matches the plan's explicit instruction to avoid adding an unwarranted new dependency."
  - "Rewrote the four DESIGN.md readFileSync calls from a single generic helper taking a dynamic ComponentName parameter to four explicit calls with fully literal path strings, after the first version silently failed one of Task 2's own <verify> greps (the literal '{name}.DESIGN.md' substring never appeared in source when built via template-literal interpolation) and simultaneously tripped Next.js's whole-project dynamic-filesystem-tracing warning — one fix resolved both."
patterns-established:
  - "design-system/docs/page.tsx is the single human-readable reference for the design system's current token + component-doc state — future token or component-doc changes should be verified against this page still reading live, not assumed to auto-update without checking the parse patterns still match."
requirements-completed: []
coverage:
  - id: D1
    description: "Docs page live-parses Color Tokens (grouped surface/border, text, brand, safe, caution, critical) and Typography Scale (heading/body/label/caption with size, hand-authored weight, line-height) from src/app/globals.css's @theme block via readFileSync, plus a locked-transcription Spacing Scale table — no color/typography value is hardcoded or copy-pasted"
    requirement: null
    verification:
      - kind: other
        ref: "npm run build -> exit 0, /design-system/docs prerendered as static content"
        status: pass
      - kind: other
        ref: "grep -c \"oklch(\" src/app/design-system/docs/page.tsx -> 0"
        status: pass
      - kind: other
        ref: "grep -c \"readFileSync\" src/app/design-system/docs/page.tsx -> 7"
        status: pass
    human_judgment: false
  - id: D2
    description: "All four component DESIGN.md files (button/card/badge/input) render verbatim in their own Card section under a Component Reference heading, plus a Sample Pages section linking to the 3 existing D-10 routes; full regression (build + test) green"
    requirement: null
    verification:
      - kind: other
        ref: "npm run build -> exit 0, no Turbopack warnings after the literal-path fix"
        status: pass
      - kind: other
        ref: "npm test -> 59 passed, 1 skipped, 0 failed"
        status: pass
      - kind: other
        ref: "for f in button card badge input; do grep -q \"$f.DESIGN.md\" src/app/design-system/docs/page.tsx; done -> 0"
        status: pass
    human_judgment: true
    rationale: "Task 2's own <verify> block contains a <human-check> covering the genuinely-visual claim — that the Color Tokens table's rendered values visually match /design-system/states' Safe/Caution/Critical colors, that all four DESIGN.md docs render legibly, and that the three Sample Pages links navigate correctly. The automated build/test/grep checks above prove the page compiles, reads the right files, and doesn't regress the suite, but not the visual-correctness/navigation claim itself — that is harvested below for end-of-phase UAT per workflow.human_verify_mode."
duration: 20min
completed: 2026-09-26
status: complete
---

# Phase 6 Plan 05: Design System Docs Page Summary

**Design-system docs page at /design-system/docs live-parses color/typography tokens from globals.css and renders all four component DESIGN.md files verbatim, plus links to the 3 sample pages.**

## Performance

- **Duration:** ~20 min
- **Tasks:** 2
- **Files modified:** 1 (created)

## Accomplishments
- `src/app/design-system/docs/page.tsx` — new App Router route parsing `src/app/globals.css`'s single `@theme` block at build time via `node:fs readFileSync`, rendering live Color Tokens (grouped surface/border, text, brand, safe, caution, critical) and Typography Scale (heading/body/label/caption) tables — zero hardcoded `oklch(...)` values
- Locked-transcription Spacing Scale table (xs–3xl plus the 12px and 44px exceptions) — the one section allowed to be a direct transcription since Tailwind v4's stock `--spacing` primitive is intentionally undeclared in `@theme`
- Component Reference section rendering all four `button.DESIGN.md`/`card.DESIGN.md`/`badge.DESIGN.md`/`input.DESIGN.md` files verbatim inside `<pre>` blocks, read live via fully-static-path `readFileSync` calls
- Sample Pages section linking to the three existing `/design-system/{states,empty-loading,nested}` routes
- Full phase-gate regression green: `npm run build` (all 4 `/design-system/*` routes compile, statically prerendered, no Turbopack warnings) and `npm test` (59 passed, 1 skipped, 0 failed)
- Confirmed no file from Plans 06-01 through 06-04 was modified — only the new `docs/page.tsx` file touched

## Task Commits
1. **Task 1: Build the docs page — live token summary (color, typography, spacing)** - `2400815` (feat)
2. **Task 2: Render the four component DESIGN.md docs, link to the sample pages, run final regression** - `8af2358` (feat)

## Files Created/Modified
- `src/app/design-system/docs/page.tsx` - new, D-05-style human-readable design-system reference: live-parsed Color Tokens + Typography Scale tables, locked Spacing Scale table, all four component DESIGN.md docs rendered verbatim, links to the 3 existing sample pages

## Decisions Made
- Rendered DESIGN.md content raw inside `<pre>` rather than through a markdown-to-HTML library — no such dependency is installed, and none is warranted for already-locked, already-reviewed prose (per plan instruction).
- Replaced a dynamic-property-lookup path helper (`COMPONENT_DESIGN_DOC_PATHS[name]`) with four explicit `readFileSync(join(process.cwd(), "src/components/ui/{name}.DESIGN.md"), "utf-8")` calls using fully literal path strings — this simultaneously (a) satisfied Task 2's own `<verify>` grep requiring the literal `{name}.DESIGN.md` substring per component, and (b) eliminated a Next.js/Turbopack "Dynamic filesystem access causes tracing of the whole project" build warning that would have bundled the entire project into deployment output on this project's Vercel free-tier hosting.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Template-literal DESIGN.md path construction failed the plan's own literal-filename verify grep**
- **Found during:** Task 2 (running `for f in button card badge input; do grep -q "$f.DESIGN.md" ...`)
- **Issue:** The first implementation read each component's DESIGN.md via `readFileSync(join(process.cwd(), \`src/components/ui/${name}.DESIGN.md\`))` inside a generic helper — the literal substring `"button.DESIGN.md"` (etc.) never appeared in the compiled source text since it was built via string interpolation at runtime, so the plan's own `<verify>` grep failed (exit 1) even though the page functionally read the correct files.
- **Fix:** Rewrote the four reads as explicit calls, each with a fully literal path string (`readFileSync(join(process.cwd(), "src/components/ui/button.DESIGN.md"), "utf-8")`, one per component) — no interpolation, no dynamic property lookup.
- **Files modified:** `src/app/design-system/docs/page.tsx`
- **Verification:** `for f in button card badge input; do grep -q "$f.DESIGN.md" ... ; done; echo $?` → `0`; `npm run build` and `npm test` re-confirmed green after the edit
- **Commit:** `8af2358` (fixed before commit, not a separate commit)

**2. [Rule 1 - Bug] Dynamic filesystem access triggered a whole-project file-tracing warning**
- **Found during:** Task 2 (`npm run build` output, before the Rule 1 fix above)
- **Issue:** The same dynamic-property-lookup path construction (`COMPONENT_DESIGN_DOC_PATHS[name]` passed into `join()`) triggered Next.js/Turbopack's static analyzer: "Dynamic filesystem access causes tracing of the whole project" — meaning the entire project (including the public folder) would be traced and bundled into server output, a real deployment-size risk on this project's stated Vercel free-tier hosting constraint (CLAUDE.md).
- **Fix:** The same literal-path rewrite described above (fix #1) resolved this simultaneously — each `readFileSync`/`join()` call now receives a statically-analyzable literal path, so Turbopack scopes the trace to each single target file instead of the whole project.
- **Files modified:** `src/app/design-system/docs/page.tsx`
- **Verification:** `npm run build` output after the fix shows zero warnings (previously: "Turbopack build encountered 1 warning")
- **Commit:** `8af2358` (fixed before commit, not a separate commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1, both resolved by the same single-cause fix). **Impact:** No scope creep — both issues were caught by the plan's own verify commands (the grep check) and a build warning surfaced during Task 2's own regression run, before any commit was made.

## Issues Encountered
None beyond the deviations above.

## User Setup Required
None - no external service configuration required.

## Human Verification Needed

Per `workflow.human_verify_mode: end-of-phase`, Task 2's `<human-check>` is harvested here verbatim for the phase-end UAT rather than acted on as a mid-flight checkpoint:

**Task 2 human-check:**
> Run `npm run dev`, visit http://localhost:3000/design-system/docs, and confirm: the Color Tokens table shows real compiled values matching what's visually rendered on /design-system/states (Safe green / Caution amber / Critical pink), all four component DESIGN.md docs render in full and are legible, and the three Sample Pages links navigate correctly.

## Next Phase Readiness

`src/app/design-system/docs/page.tsx` exists as a real, build-verified App Router route (statically prerendered) presenting the live token set and all four component DESIGN.md docs, with zero risk of silent drift from the compiled system since every color/typography value is parsed live rather than copy-pasted. No file created by Plans 06-01 through 06-04 was modified. This is the last plan in Phase 6 (Design System — Tailwind v4 Tokens); the phase now moves to end-of-phase verification, where this plan's and Plan 06-04's harvested human-check items should be run together in one `npm run dev` session covering `/design-system/{states,empty-loading,nested,docs}`.

## Self-Check: PASSED

Files confirmed present on disk: `src/app/design-system/docs/page.tsx`. Both task commits (`2400815`, `8af2358`) confirmed present in `git log --oneline --all`.

---
*Phase: 06-design-system-tailwind-v4-tokens*
*Completed: 2026-09-26*
