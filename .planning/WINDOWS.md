---
schema_version: 1
open_count: 12
waived_count: 0
fixed_count: 0
total_count: 12
last_updated: 2026-10-02T07:55:12.829Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 06 | deviation | src/components/ui/card.tsx |  | CardTitle/CardDescription/CardAction/CardFooter still reference undefined shadcn stock tokens (--muted-foreground etc.); unused anywhere in src/, deferred to the phase that first renders them | open |  | 2026-09-26T12:55:19.880Z |  |
| 2 | 07 | deviation | tests/realtime.subscribe.test.ts |  | Concurrent full-suite Realtime subscription tests timed out; both files passed serially, matching the pre-existing recorded flake. | open |  | 2026-09-30T18:24:17.391Z |  |
| 3 | 07 | unrun-verify | .planning/phases/07-html-prototype-caregiver-parent/07-02-PLAN.md |  | Full npm test not repeated for Plan 07-02 per orchestrator; phase-level integration regression remains pending after known Realtime concurrency flake. | open |  | 2026-10-01T04:13:16.261Z |  |
| 4 | 07 | unrun-verify | .planning/phases/07-html-prototype-caregiver-parent/07-03-PLAN.md |  | Full npm test deferred to phase close by orchestrator; focused 07-03 tests and production build passed. | open |  | 2026-10-01T04:20:28.454Z |  |
| 5 | 07 | stub | src/components/patterns/device-select-list.tsx |  | Pairing is intentionally unavailable in the unused zero-device state; Pair a device is disabled pending future pairing integration. | open |  | 2026-10-01T04:20:28.565Z |  |
| 6 | 07 | deviation | tests/prototype.parent-home.test.ts |  | TDD evidence format normalization passed after implementation was written, before GREEN commit; raw intentional RED preserved. | open |  | 2026-10-01T04:26:09.029Z |  |
| 7 | 07 | unrun-verify | .planning/phases/07-html-prototype-caregiver-parent/07-04-PLAN.md |  | Full npm test deferred to phase close by orchestrator; parent/caregiver tests and build passed. | open |  | 2026-10-01T04:26:23.850Z |  |
| 8 | 07 | unrun-verify | tests/realtime.subscribe.test.ts |  | Full suite Realtime reading/risk INSERT delivery timed out; shared Vitals and Stats scoped tests pass. | open |  | 2026-10-01T11:10:51.574Z |  |
| 9 | 07 | unrun-verify | .planning/phases/07-html-prototype-caregiver-parent/07-06-PLAN.md |  | Full npm test deferred to phase close by orchestrator; caregiver route scoped tests and production build passed. | open |  | 2026-10-01T16:34:01.535Z |  |
| 10 | 07 | deviation | .planning/phases/07-html-prototype-caregiver-parent/07-07-SUMMARY.md |  | Task 1 RED evidence parser passed only after implementation edits; replay against committed RED snapshot confirmed intended failure before GREEN commit. | open |  | 2026-10-01T16:42:22.610Z |  |
| 11 | 07 | unrun-verify | package.json |  | 07-08 exact npm run build fails in Turbopack PostCSS worker port binding (EPERM), including approved unsandboxed retry; Webpack production build passes. | open |  | 2026-10-02T07:55:12.720Z |  |
| 12 | 07 | skipped-test | tests/e2e-deployed.test.ts | 66 | Existing deployed smoke suite skipped without DEPLOYED_URL; 07-08 full npm test otherwise passes 135 tests. | open |  | 2026-10-02T07:55:12.829Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "06",
    "file": "src/components/ui/card.tsx",
    "line": null,
    "description": "CardTitle/CardDescription/CardAction/CardFooter still reference undefined shadcn stock tokens (--muted-foreground etc.); unused anywhere in src/, deferred to the phase that first renders them",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-26T12:55:19.880Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "07",
    "file": "tests/realtime.subscribe.test.ts",
    "line": null,
    "description": "Concurrent full-suite Realtime subscription tests timed out; both files passed serially, matching the pre-existing recorded flake.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-30T18:24:17.391Z",
    "resolved_at": null
  },
  {
    "id": 3,
    "kind": "unrun-verify",
    "phase": "07",
    "file": ".planning/phases/07-html-prototype-caregiver-parent/07-02-PLAN.md",
    "line": null,
    "description": "Full npm test not repeated for Plan 07-02 per orchestrator; phase-level integration regression remains pending after known Realtime concurrency flake.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T04:13:16.261Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "unrun-verify",
    "phase": "07",
    "file": ".planning/phases/07-html-prototype-caregiver-parent/07-03-PLAN.md",
    "line": null,
    "description": "Full npm test deferred to phase close by orchestrator; focused 07-03 tests and production build passed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T04:20:28.454Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "stub",
    "phase": "07",
    "file": "src/components/patterns/device-select-list.tsx",
    "line": null,
    "description": "Pairing is intentionally unavailable in the unused zero-device state; Pair a device is disabled pending future pairing integration.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T04:20:28.565Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "deviation",
    "phase": "07",
    "file": "tests/prototype.parent-home.test.ts",
    "line": null,
    "description": "TDD evidence format normalization passed after implementation was written, before GREEN commit; raw intentional RED preserved.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T04:26:09.029Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "unrun-verify",
    "phase": "07",
    "file": ".planning/phases/07-html-prototype-caregiver-parent/07-04-PLAN.md",
    "line": null,
    "description": "Full npm test deferred to phase close by orchestrator; parent/caregiver tests and build passed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T04:26:23.850Z",
    "resolved_at": null
  },
  {
    "id": 8,
    "kind": "unrun-verify",
    "phase": "07",
    "file": "tests/realtime.subscribe.test.ts",
    "line": null,
    "description": "Full suite Realtime reading/risk INSERT delivery timed out; shared Vitals and Stats scoped tests pass.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T11:10:51.574Z",
    "resolved_at": null
  },
  {
    "id": 9,
    "kind": "unrun-verify",
    "phase": "07",
    "file": ".planning/phases/07-html-prototype-caregiver-parent/07-06-PLAN.md",
    "line": null,
    "description": "Full npm test deferred to phase close by orchestrator; caregiver route scoped tests and production build passed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T16:34:01.535Z",
    "resolved_at": null
  },
  {
    "id": 10,
    "kind": "deviation",
    "phase": "07",
    "file": ".planning/phases/07-html-prototype-caregiver-parent/07-07-SUMMARY.md",
    "line": null,
    "description": "Task 1 RED evidence parser passed only after implementation edits; replay against committed RED snapshot confirmed intended failure before GREEN commit.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-01T16:42:22.610Z",
    "resolved_at": null
  },
  {
    "id": 11,
    "kind": "unrun-verify",
    "phase": "07",
    "file": "package.json",
    "line": null,
    "description": "07-08 exact npm run build fails in Turbopack PostCSS worker port binding (EPERM), including approved unsandboxed retry; Webpack production build passes.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-02T07:55:12.720Z",
    "resolved_at": null
  },
  {
    "id": 12,
    "kind": "skipped-test",
    "phase": "07",
    "file": "tests/e2e-deployed.test.ts",
    "line": 66,
    "description": "Existing deployed smoke suite skipped without DEPLOYED_URL; 07-08 full npm test otherwise passes 135 tests.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-02T07:55:12.829Z",
    "resolved_at": null
  }
]
````
