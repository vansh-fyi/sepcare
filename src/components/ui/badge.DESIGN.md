# Badge (StatusPill) — DESIGN.md

`Badge` renders a single traffic-light status — safe, caution, or critical — and always pairs the
status color with an icon and a text label. It is the component-level enforcement of
DESIGN-SYSTEM.md §9's multi-modal rule: **a status is never communicated by color alone**. This is
not just a styling convention — it is built into the component body, not just its class strings —
so `asChild`/`Slot` composition is intentionally not supported here (a caller substituting the
rendered element could bypass the Icon+label pairing the whole component exists to guarantee).

## Status values

| Status | Canonical meaning | Visual treatment |
|--------|---------------------|--------------------|
| `safe` | Green — vitals within normal range | `bg-safe-soft text-safe-dark` + `<Icon name="safe" />` |
| `caution` | Amber — one or more vitals trending abnormal, not yet urgent | `bg-caution-soft text-caution-dark` + `<Icon name="caution" />` |
| `critical` | Pink/rose — urgent, composite risk score has escalated | `bg-critical-soft text-critical-dark` + `<Icon name="critical" />` |

`status` is a **required** prop — there is no default/unscored rendering in this phase's atomic
scope (an unscored/pending state, if ever needed, is a future composite-screen concern).

## Correct usage

```tsx
<Badge status="safe">Safe</Badge>
<Badge status="caution">Caution</Badge>
<Badge status="critical">Critical</Badge>
```

Every render always shows the icon (from `src/components/icon.tsx`, ported from `icons.js`'s
`safe`/`caution`/`critical` keys) immediately before the label — this happens automatically inside
`Badge`, callers never pass the icon themselves.

## Incorrect usage

```tsx
// ✗ Violates the multi-modal rule — a bare colored <span> communicates status via color alone,
// with no icon and no text label a screen reader or colorblind user can rely on.
<span className="bg-critical-soft" />

// ✗ Rejected by TypeScript — "danger" is not a member of the locked status union.
<Badge status="danger">Danger</Badge>
```

`status` only accepts `"safe" | "caution" | "critical"` (the `BadgeStatus` type exported from
`badge.tsx`). Any other string literal is a compile-time error.

## Overflow / long-text (backstop)

The label is expected to truncate/ellipsis rather than resize the Badge, and to wrap or truncate
long text without breaking the token-driven pill shape. This is asserted by a held-out long-string
render test (UI-SPEC "UI Considerations"), not independently re-verified by this plan's own
automated checks.
