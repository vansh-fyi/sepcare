import * as React from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/components/icon"

/**
 * NavLink — hand-authored bottom-tab-bar link (no shadcn equivalent),
 * Figma-verified against node `279-220` (both the "Open"/active and
 * "Deselected"/inactive states — see nav-link.DESIGN.md for the full
 * extraction). Composed by `nav-bar.tsx`.
 *
 * Follows Badge's multi-modal rule (badge.tsx lines 6-13): active/inactive
 * differ across background fill, border, icon color, label presence, AND
 * the indicator bar below the pill — never a color-only swap. No
 * `asChild`/`Slot` support, for the same invariant-protection reason Badge
 * omits it — a caller substituting the rendered element could bypass the
 * icon+label+color pairing this component guarantees for its active state.
 *
 * D-17 (locked, 06-CONTEXT.md): the active state's pink/gradient fill
 * intentionally reuses the critical/pink hue for a DIFFERENT semantic
 * dimension (navigation-selected-state, not health-status). This is not a
 * bug and must not be "fixed" to blue — see nav-link.DESIGN.md.
 */
const navLinkVariants = cva(
  "relative inline-flex min-h-11 min-w-11 flex-1 flex-col items-center transition-colors duration-[var(--duration-fast)] ease-out active:scale-[0.96]",
  {
    variants: {
      state: {
        active: "",
        inactive: "",
      },
    },
    defaultVariants: { state: "inactive" },
  }
)

/**
 * The pill itself. Figma node `279-220`: `h-44px` (`h-11`), `rounded-10`
 * (`rounded-cta` — shares the existing 10px token with Button's `cta`
 * archetype rather than duplicating it), `px-10` (`px-[10px]`).
 */
const pillVariants = cva(
  "inline-flex h-11 items-center justify-center gap-1 rounded-cta px-[10px]",
  {
    variants: {
      state: {
        /**
         * Gradient fill + drop shadow extracted from node `279-220`'s "Open"
         * state. `--shadow-cta` is reused as-is (its value, `0px 2px 2px
         * var(--color-neutral-200)`, is an exact match to this pill's own
         * drop shadow — no new shadow token needed).
         */
        active: "bg-[image:var(--gradient-nav-active)] text-text-inverse shadow-cta",
        /**
         * `border-bg` reuses the existing `--color-bg` semantic token
         * (neutral-100) — the Figma node's inactive border color is exactly
         * neutral-100, so this is a direct reuse rather than a new token
         * (see nav-link.DESIGN.md for the reasoning).
         */
        inactive: "border border-bg bg-surface text-text-muted",
      },
    },
    defaultVariants: { state: "inactive" },
  }
)

/**
 * The 5px indicator bar below the pill. Active: gradient-to-top pink-300 ->
 * pink-500 (`--gradient-nav-indicator`). Inactive: flat neutral-100 — reuses
 * `bg-bg` (same `--color-bg` token as the pill's inactive border) rather
 * than a new color token. `rounded-full` is visually indistinguishable from
 * the Figma-specified `rounded-5` on a 5px-tall bar (same reasoning as the
 * BatteryIndicator track precedent in globals.css), so no new radius token
 * was added for it either.
 */
const indicatorVariants = cva("mt-1 h-[5px] w-full rounded-full", {
  variants: {
    state: {
      active: "bg-[image:var(--gradient-nav-indicator)]",
      inactive: "bg-bg",
    },
  },
  defaultVariants: { state: "inactive" },
})

export type NavLinkState = NonNullable<VariantProps<typeof navLinkVariants>["state"]>

interface NavLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "className"> {
  /** Icon key from `src/components/icon.tsx`. Always rendered, in both states. */
  icon: IconName
  /** Route label. Only rendered (alongside the icon) when `state="active"`, per the Figma node — inactive shows icon only. */
  label: string
  state: NavLinkState
  className?: string
}

function NavLink({ icon, label, state, className, ...props }: NavLinkProps) {
  return (
    <Link
      data-slot="nav-link"
      data-state={state}
      aria-current={state === "active" ? "page" : undefined}
      className={cn(navLinkVariants({ state }), className)}
      {...props}
    >
      <span className={cn(pillVariants({ state }))}>
        <Icon name={icon} size={20} />
        {state === "active" && (
          <span className="whitespace-nowrap text-caption font-bold">
            {label}
          </span>
        )}
      </span>
      <span className={cn(indicatorVariants({ state }))} />
    </Link>
  )
}

export { NavLink, navLinkVariants }
