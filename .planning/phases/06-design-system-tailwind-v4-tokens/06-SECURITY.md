---
phase: "6"
slug: "design-system-tailwind-v4-tokens"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-09-30"
---

# Phase 6 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry → repo | Every shadcn/ui CLI `add` and manual `npm install` pulls third-party code into the build | Package source code, transitive dependencies |
| Static file reads (docs) | `tokens.ts` and docs pages read `globals.css` / `*.DESIGN.md` via `fs.readFileSync` at build/render time | Repo-local file contents only — no request-derived paths |
| Chart config → CSS injection | `chart.tsx`'s `ChartStyle` builds a `<style>` tag from a `ChartConfig` prop via `dangerouslySetInnerHTML` | Developer-supplied color/key strings — no user input in this phase |

*No auth, no data fetching, no user-submitted content exists in this phase — it is a presentational component library + documentation shell.*

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-06-01 (06-01) | Tampering | `cn` / `shadcn` package legitimacy | high | mitigate | User reviewed npmjs provenance before install; `cn` confirmed as github.com/shadcn-ui/cn | closed |
| T-06-02 (06-01) | Tampering | shadcn CLI Radix-base flag | medium | mitigate | `-b radix` honored; `radix-ui` unified package wired into `button.tsx` | closed |
| T-06-03 (06-01) | Info Disclosure | No auth/data surface | low | accept | Phase is presentational-only; confirmed no auth/data-fetch code | closed |
| T-06-04 (06-02) | Tampering | `icon.tsx` raw-HTML injection | high | mitigate | Icons are real JSX elements; zero `dangerouslySetInnerHTML` in this file | closed |
| T-06-05 (06-02) | Tampering | Card/Badge/Input shadcn install | low | accept | No anomalous files introduced | closed |
| T-06-06 (06-03) | Tampering | Restyle-only change, no new deps | low | accept | No new data flow | closed |
| T-06-07 (06-03) | DoS | Long-string handling (Badge/Card/Button/Input) | low | accept | Adversarial-input testing explicitly deferred; no live data wiring in this phase | closed |
| T-06-08 (06-04) | Tampering | Sample pages, hardcoded content | low | accept | Static/example content only | closed |
| T-06-09 (06-04) | Spoofing | No auth surface | low | accept | No auth code in phase | closed |
| T-06-10 (06-05) | Info Disclosure | `docs/page.tsx` reads globals.css | low | accept | Hardcoded repo-local path, no request-derived input | closed |
| T-06-11 (06-05) | Tampering | Node builtins only, no new package | low | accept | Confirmed | closed |
| T-06-SC (06-06 to 06-13, multiple) | Tampering | shadcn registry installs (Card, Progress/ToggleGroup, Label/Field, Select/Textarea, Checkbox/RadioGroup/Switch, Chart) | high | mitigate | Diff-gate methodology: `git diff --name-only` against declared file list confirmed on each install; files match registry shape | closed |
| T-06-various restyle-only (06-06 to 06-19) | Tampering | Per-component restyle passes | low | accept | Presentational changes only, no new data flow, confirmed per-plan | closed |
| T-06-12 (06-14) | Tampering | `lucide-react` transitive dependency risk | medium | mitigate | Never installed — `--view` dry-run used instead of real `add`; zero `lucide-react` entries in package.json/lock | closed |
| T-06-13 (06-14) | Tampering | `recharts` dependency | low | accept | Actively maintained, high download count | closed |
| T-06-14 (06-15) | Tampering | Sparkline/VitalsTrendChart SVG rendering | low | accept | No `dangerouslySetInnerHTML`/`innerHTML`; data is props-only | closed |
| T-06-15/16/17 (06-16/17/18) | Info Disclosure | Docs reading `.DESIGN.md` files | low | accept | Same hardcoded-path pattern | closed |
| T-06-20 (06-20) | Tampering | Hard prohibition on icon packages — hand-authored SVG only | medium | **accept (retroactive)** | `@tabler/icons-react` added as a direct dependency for 3 mood glyphs (`IconMoodSmileBeam`, `IconMoodEmpty`, `IconMoodSadSquint` in `src/components/icon.tsx`), deviating from the plan's stated "no icon package" mitigation. Reviewed 2026-09-30: Tabler is a reputable, actively-maintained, widely-used package; no dangerous code found in `icon.tsx`. User elected to accept this as a documented risk rather than replace with hand-authored SVG. | closed (accepted) |
| T-06-21 (06-21) | N/A | Phase-gate verification | low | accept | Verification-only, no new surface | closed |

*Status: open · closed · open — below {block_on} threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on (**high**) count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

**Additional finding (non-threat-register, informational):** `chart.tsx:94` uses `dangerouslySetInnerHTML` to inject a `<style>` block built from a `ChartConfig` prop's color/key strings. Not exploitable today — no user input reaches `ChartConfig` anywhere in the current codebase. Flagged for any future phase that lets a user configure chart series names/colors: sanitize/validate color values before they reach this component to prevent CSS injection.

**Documentation gap (non-blocking):** none of the 21 `06-XX-SUMMARY.md` files include a `## Threat Flags` section reconciling against their PLAN's threat model. This register was reconstructed directly from the 21 PLAN files' `<threat_model>` blocks and cross-checked against the implementation.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-06-01 | T-06-20 | `@tabler/icons-react` violates the phase's "hand-authored SVG only" rule for 3 mood glyphs, but is a reputable, low-risk, actively-maintained package with no dangerous code paths found. User declined the code-change option (replacing with hand-authored SVG) and accepted the dependency as-is. | vansh (project owner) | 2026-09-30 |
| AR-06-02 | T-06-07 | Adversarial long-string/DoS handling for Badge/Card/Button/Input is deferred — no live data wiring exists in this phase to exploit; revisit when real data enters these components. | Phase 06-03 plan author | 2026-09-30 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-30 | 36 | 36 | 0 | gsd-verify-work (retroactive register reconstruction, ASVS L1) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-09-30
