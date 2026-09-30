# Button

Button owns action styling, padding, focus, loading, and disabled states. Import it from `@/components/ui/button`. Explore its options at `/design-system/docs/button`.

## Variants and independent options

| Variant   | Treatment                                                       |
| --------- | --------------------------------------------------------------- |
| primary   | Filled. Use for the main action in a group.                     |
| secondary | Surface with a 1px border stroke, without a shadow. Use for a supporting action. |
| tertiary  | Transparent. Use for a low-emphasis action.                     |

Choose color separately with `tone`: `brand`, `coral`, `critical`, or `neutral`. Neutral is the default tone, with a neutral-800 primary fill. A connection action is primary with neutral colors; an emergency action is primary with critical colors. Use layout utilities for full-width actions.

Pass an `icon` with optional text as children. Without text, the button becomes square: primary produces an icon-filled button and secondary produces an icon-outline button. Always supply `aria-label` when text is absent. `iconPosition` accepts `start` or `end`.

Sizes are `sm` (36px), `default` (44px), and `lg` (48px). Text buttons have horizontal padding of 14, 20, and 24px. Icon-only buttons have equal width and height at the selected size.

Corners are independent of the variant: `radius="sm"` (10px), `default` (14px), `lg` (16px), or `full` (pill/circle). A pill outline is a secondary button with `radius="full"`.

## Semantic colors

Each tone has eight aliases under `--color-button-{tone}-{role}`: `fill`, `fill-hover`, `fill-active`, `on-fill`, `surface`, `surface-hover`, `text`, and `border`. They reference the existing palette and semantic colors in `globals.css`; the base palette stays unchanged.

Primary uses fill and on-fill roles. Primary and icon buttons have no default shadow. Secondary uses surface, text, and border roles with a 1px stroke and no shadow. Tertiary uses text and surface-hover roles. Override individual roles with `colors={{ fill: "var(--color-safe)", ... }}`. Set hover, active, and foreground roles together when changing the filled treatment.

## Behavior

Loading hides content while preserving its space and shows a centered spinner. The button retains its width and becomes disabled. Use `asChild` for enabled links styled as buttons, with the link's content inside the child; the `icon` prop and loading spinner apply to native button rendering.

The system rules are in `docs/DESIGN-SYSTEM.md`. Padding belongs to Button, not individual documentation pages. Global resets belong in `@layer base` so utility classes retain their intended effect.

## Figma provenance

Verified against Figma node(s) `203-11745`, `203-14032`, `203-11521`, `266-9285`.
