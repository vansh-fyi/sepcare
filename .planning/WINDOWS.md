---
schema_version: 1
open_count: 8
waived_count: 0
fixed_count: 0
total_count: 8
last_updated: 2026-10-01T11:10:51.574Z
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
  }
]
````
