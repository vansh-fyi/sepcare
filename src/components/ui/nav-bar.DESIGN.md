# NavBar — DESIGN.md

`NavBar` is the single fixed-bottom tab-bar container, hand-authored (no shadcn equivalent).
Composes exactly 4 `NavLink` instances.

**Verified against Figma node `279-320` (and its Home-screen instance `279-758` inside
`266-9257`) on 2026-09-27** — per the orchestrator's D-15 extraction handoff
(`.planning/phases/06-design-system-tailwind-v4-tokens/06-FIGMA-EXTRACTS.md`'s "Nav-family nodes"
section; this executor has no Figma MCP/browser tool access, per the D-15 workaround).

## Figma extraction

- **Outer container:** white background (`bg-surface`), `rounded-20` on the top corners only —
  extracted as the new `--radius-nav-bar: 20px` token (NOT assumed equal to `--radius-card`'s
  24px, per UI-SPEC.md's explicit "do not guess this value" instruction — the two are numerically
  close but a distinct decision). Applied via `rounded-t-[var(--radius-nav-bar)]` (top corners
  only — this is a bottom-fixed bar, the bottom corners are never visible against the viewport
  edge).
- **Shadow:** `0px -2px 2px rgba(218,220,224,1)` — a NEGATIVE Y offset (casts upward, since the
  bar sits at the screen bottom) using the same neutral-200 tint as Button's `--shadow-cta`, but
  a distinct direction, so kept as its own token: `--shadow-nav-bar`.
- **Padding:** `px-36` (`px-9`, 36px) horizontal, `py-16` (`py-4`, 16px) inner-row vertical — both
  land exactly on the existing Tailwind spacing ladder, no off-ladder exception needed.
- **Fixed width `375px` in the Figma frame:** this is the frame's own mobile-viewport canvas
  width, not a literal dimension to hardcode on the component — `inset-x-0` (spans the real
  viewport width responsively) is the correct implementation of "fixed-bottom bar spanning the
  screen," consistent with how every other fixed-position element in a mobile-first layout is
  built.
- **Safe-area padding:** the bottom safe-area inset (`env(safe-area-inset-bottom)`) is applied via
  `style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}` — the `max()` guards
  against `env()` evaluating to `0px` on non-notched viewports, which would otherwise collapse
  the bar's bottom padding entirely. Figma's own extraction didn't distinguish a separate
  "safe-area" measurement from the `py-16` inner padding (it's a static design tool, not a real
  device) — this is the standard web implementation of that intent, not a guessed pixel value.
- **Composition:** exactly 4 `NavLink` instances, each `flex-1` (set on `NavLink` itself, not
  here) so they evenly split the bar's width — matches "evenly spaced" in the extraction.

## Icon cross-check (Home / Vitals / Stats / Settings)

The Figma tab set is `Home`, `Vitals`, `Stats`, `Settings` — cross-checked against the existing
`src/components/icon.tsx` key set (per this plan's explicit instruction to check before inventing
any new icon name):

| Figma tab | Existing `icon.tsx` key used | Rationale |
|-----------|------------------------------|-----------|
| Home | `home` | Exact name match |
| Vitals | `monitoring` | Existing "vitals monitoring" glyph (heart-rate waveform in a rounded frame) — no icon literally named `vitals` exists, `monitoring` is the closest semantic match already in the set |
| Stats | `history` | Existing circular-clock/history glyph — closest existing match for a trends-over-time "Stats" tab; no dedicated chart/graph icon exists in the current 40+ set |
| Settings | `settings` | Exact name match |

**No new icon.tsx entry was needed** — all 4 tabs matched an existing key, and no `lucide-react`
import was introduced. `alerts`/`profile` (also named in the plan's candidate list) were not used
for this instance since the real Figma tab set doesn't include those two labels.

## Correct usage

```tsx
<NavBar currentRoute={usePathname()} />
```

`currentRoute` drives which single `NavLink` renders `state="active"` — never hardcode which tab
is active.

## Incorrect usage

```tsx
// ✗ Do not hardcode the active tab — NavBar must derive it from the current
// route so navigating actually updates which tab highlights.
<NavBar currentRoute="/" />  // fine only if genuinely on "/", never a fixed literal in a real app
```

## Overflow / long-text (backstop)

The 4 tab labels are a fixed, known set (`Home`/`Vitals`/`Stats`/`Settings`) for this phase's
scope — not user-generated or localized content requiring a truncation strategy. A
zero/one/many contract for a variable tab count is explicitly deferred to Phase 7 per
06-UI-SPEC.md's "zero-one-many" row for "NavBar tab count."

## Screenshot comparison

Deferred to the orchestrator (D-15 workaround — no Figma MCP/browser tool access in this
executor). A live `NavBar` instance has been mounted on `/design-system/nested` for the
orchestrator's post-dispatch screenshot-diff pass against node `279-320`/`279-758`.
