# Card — DESIGN.md

`Card` is the single surface-container primitive. It has **no variants** — every Card looks the
same (`rounded-card bg-surface shadow-card p-6`), because its job is to be a consistent, boring
container that content states differ *inside*, never a component whose own shape/skin changes
per state.

## Composition

| Element | Role | Classes |
|---------|------|---------|
| `Card` | Outer surface | `rounded-card bg-surface shadow-card p-6` |
| `CardHeader` | Optional heading/eyebrow region | `flex flex-col gap-2 mb-4` |
| `CardContent` | Main body — the only region whose children differ between states | `flex flex-col gap-4` |

`CardTitle`, `CardDescription`, `CardAction`, `CardFooter` are also exported by `card.tsx` (carried
over from the shadcn scaffold) but are out of this plan's restyle scope — not yet exercised by any
page. Do not assume they already carry the locked token styling; that is deferred, tracked as a
deferred item, not silently assumed correct.

## The "layout never changes" rule (DESIGN-SYSTEM.md §9)

Card's structural DOM nesting — `Card > CardHeader? > CardContent` — must be identical across
empty, loading, and populated content states. Only the **children passed into `CardContent`**
differ; the Card/CardHeader/CardContent wrapper elements themselves are never added, removed, or
swapped based on a content-state prop.

## Correct usage

```tsx
// Populated
<Card>
  <CardHeader>Recent Readings</CardHeader>
  <CardContent>{readings.map(r => <ReadingRow key={r.id} {...r} />)}</CardContent>
</Card>

// Empty — same structure, different CardContent children
<Card>
  <CardHeader>Recent Readings</CardHeader>
  <CardContent>
    <p>No readings yet</p>
    <p>Vitals will appear here once the device starts sending data.</p>
  </CardContent>
</Card>
```

## Incorrect usage

```tsx
// ✗ Violates the "layout never changes" rule — the wrapper only appears for
// the loading case, meaning Card's own structure branches on content state.
{isLoading ? (
  <div className="loading-wrapper">
    <Card><CardContent><Skeleton /></CardContent></Card>
  </div>
) : (
  <Card><CardContent>{content}</CardContent></Card>
)}
```

If a loading/empty treatment needs different outer chrome, that is a sign it belongs in a future
composite component built on top of Card — not a reason to make the atomic Card itself branch.

## Overflow / long-text (backstop)

A Card heading is expected to truncate/ellipsis rather than resize the Card. This is asserted by a
held-out long-string render test (UI-SPEC "UI Considerations"), not independently re-verified by
this plan's own automated checks.
