---
phase: "6"
slug: "design-system-tailwind-v4-tokens"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-27"
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (`npm test` → `vitest run`), plus `next build` as the primary structural/compile gate for this frontend phase |
| **Config file** | `package.json` scripts (`build`, `test`, `lint`) — no separate vitest config needed for this phase's scope |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm test && npm run lint` |
| **Estimated runtime** | ~60-90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm test && npm run lint`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-06-02 | 06 | 1 | DSYS-01/02/03 | — / N/A (no attack surface) | N/A | build+grep | `npm run build` + `grep -c "Verified against Figma node" src/components/ui/button.DESIGN.md` | ✅ | ⬜ pending |
| 06-07-0N | 07 | 2 | DSYS-01/02/03 | — / N/A | N/A | build+grep | `npm run build` + `grep -c "203-14032\|203-11521\|266-9285" src/components/ui/button.DESIGN.md` | ✅ | ⬜ pending |
| 06-09-0N | 09 | 3 | DSYS-01/02 | — / N/A | N/A | build+grep | `npm run build` + `grep -c "Couldn't load this. Check your connection and try again." src/components/ui/input.tsx` | ✅ | ⬜ pending |
| 06-10-0N | 10 | 2 | DSYS-01/02, D-17 | — / N/A | N/A | build+grep | `npm run build` + `grep -c "text-critical-dark" src/components/ui/field.tsx` | ✅ | ⬜ pending |
| 06-08-0N | 08 | 2 | DSYS-01/02 | — / N/A | N/A | build+grep | `npm run build` + `grep -c "lucide-react" src/components/ui/battery-indicator.tsx src/components/ui/progress.tsx` | ✅ | ⬜ pending |
| 06-14-0N | 14 | 3 | DSYS-01/02 | — / N/A | N/A | build+grep (chart-overwrite guard) | `npm run build` + post-install grep guard for stock Card tokens | ✅ | ⬜ pending |
| 06-21-0N | 21 | 7 | DSYS-01/02/03 | — / N/A | N/A | full-phase regression | `npm run build && npm test && npm run lint` | ✅ | ⬜ pending |

*Full per-task rows: see each `06-NN-PLAN.md`'s own `<verify>` blocks — every task across all 16 new plans (06-06 through 06-21) carries at least one `<automated>` command with a paired `<fails_when>`, per the failing-direction contract; the rows above are a representative sample, not the complete set.*

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — Next.js's own `next build` (TypeScript + bundling) and the already-installed `vitest`/`eslint` scripts are sufficient; no new test framework or fixture scaffolding is needed for this phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual/design fidelity vs. Figma (D-15's screenshot-diff step) | DSYS-01, DSYS-02 | Visual comparison against a Figma screenshot is a human-judgment call — no automated pixel-diff tooling is wired into this phase | For each visual-component task, take a screenshot of the rendered page/component and visually compare against the Figma node's screenshot (per that task's acceptance criteria); confirm spacing/radius/shadow/typography match before marking done |
| Overall "beautiful, not just functional" docs-site bar (D-13) | DSYS-02 | Subjective design-quality bar ("shadcn-quality or better") cannot be reduced to an automated assertion | Human review of the rebuilt `/design-system/docs` site at `06-21`'s phase-gate, per the user's explicit rejection criteria from the CONTEXT.md rework discussion |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (confirmed — plan-checker's verify-command-path and failing-direction probes report `severity: "none"` across all 106 checked commands)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (confirmed by plan-checker)
- [x] Wave 0 covers all MISSING references (none — no Wave 0 needed, existing infra sufficient)
- [x] No watch-mode flags
- [ ] Feedback latency < 90s — not yet measured against a real run (plans not yet executed)
- [ ] `nyquist_compliant: true` — deliberately left `false` in frontmatter until Phase 6's actual execution (Waves 1-7) runs green; this file's structural checks pass, but "compliant" is reserved for post-execution confirmation at `06-21`'s phase gate, not planning time

**Approval:** pending — structural validation passed at plan-checker time (2026-09-27); full sign-off deferred to phase-gate execution of `06-21`.
