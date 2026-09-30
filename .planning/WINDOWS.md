---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-09-30T18:24:17.391Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 06 | deviation | src/components/ui/card.tsx |  | CardTitle/CardDescription/CardAction/CardFooter still reference undefined shadcn stock tokens (--muted-foreground etc.); unused anywhere in src/, deferred to the phase that first renders them | open |  | 2026-09-26T12:55:19.880Z |  |
| 2 | 07 | deviation | tests/realtime.subscribe.test.ts |  | Concurrent full-suite Realtime subscription tests timed out; both files passed serially, matching the pre-existing recorded flake. | open |  | 2026-09-30T18:24:17.391Z |  |

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
  }
]
````
