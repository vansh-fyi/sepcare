import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/**
 * D-08's original "exactly 4 variants" lock is SUPERSEDED by D-12 — the variant
 * union now also carries the gradient CTA-pill archetype (`cta`/`cta-critical`)
 * and two icon-only archetypes (`icon-outline`/`icon-filled`) that D-12's four
 * button-treatment Figma nodes actually show. Full per-node reconciliation
 * trail (which node maps to which variant, and why) lives in button.DESIGN.md
 * per D-15 — this is not a guessed 1:1 rename of the old four names.
 *
 * `duration-[var(--duration-normal)]` (not the named `duration-normal` class) —
 * Tailwind v4 has no `--duration-*` theme namespace for utility generation
 * (only numeric/arbitrary `duration-*` values compile), so the token must be
 * referenced via an arbitrary value to actually take effect.
 *
 * Press feedback (all variants, 06-UI-SPEC.md Motion section): `active:scale-[0.96]`
 * with a `150ms ease-out` transition on `transform`, combined with the existing
 * color/background hover transition into one `transition-[...]` list (never
 * `transition-all`) so both share one `transition-property` declaration.
 */
const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-btn px-5 py-3 text-body font-semibold transition-[color,background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-out active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        "primary":
          "bg-brand-fill text-text-inverse hover:bg-brand-fill-hover active:bg-brand-fill-active",
        "secondary":
          "border border-border text-text hover:bg-surface-soft-blue",
        "tertiary": "bg-transparent text-brand underline-offset-4 hover:underline",
        "critical":
          "bg-critical-fill text-text-inverse hover:bg-critical-fill-hover active:bg-critical-fill-active",
        /**
         * Archetype A (D-12) — gradient CTA pill. Figma node `203-11745`
         * "Connect Device": 127deg pink-500->pink-400 gradient, 10px radius,
         * 10px/10px padding, 12px Bold label, neutral-200-tinted drop shadow.
         * Extracted exactly (no by-eye approximation) — see button.DESIGN.md.
         */
        "cta":
          "rounded-cta bg-[image:var(--gradient-cta)] px-[10px] py-[10px] text-caption font-bold text-text-inverse shadow-cta hover:brightness-105 active:brightness-95",
        /**
         * Archetype A, critical intensity. Figma node `203-14032` "Call
         * Ambulance": same pill shape/padding as `cta`, one shade
         * darker/more-red gradient (135deg pink-600->pink-500) and
         * SemiBold (not Bold) label — Figma authored these as deliberately
         * distinct intensities, not a duplicate of `cta`.
         */
        "cta-critical":
          "rounded-cta bg-[image:var(--gradient-cta-critical)] px-[10px] py-[10px] text-caption font-semibold text-text-inverse shadow-cta hover:brightness-105 active:brightness-95",
        /**
         * Archetype B (D-12) — bordered icon-only button, no fill. Figma node
         * `203-11521` ("Button Icon FAB" — layer name says "Monotone add" but
         * the rendered screenshot shows a left-chevron/back-arrow, not a `+`;
         * trust the screenshot, per the extraction note). 10px radius (shares
         * `--radius-cta` with archetype A), 1px solid border in `--color-text`
         * (exactly Figma's `#0a0a11`), 16px padding, no background.
         */
        "icon-outline":
          "rounded-cta border border-text bg-transparent p-4 text-text hover:bg-border-subtle",
        /**
         * Archetype C (D-12) — filled dark icon button. Figma node `266-9285`
         * (Home-screen header icon button): fixed 40x40 square, 12px radius,
         * `--color-icon-fill-dark` (neutral-700) fill, inverse icon color. The
         * -90deg icon rotation in Figma's specific instance is a caller-level
         * concern (rotate the icon element itself), not baked into this variant.
         */
        "icon-filled":
          "size-10 shrink-0 rounded-icon-btn bg-icon-fill-dark p-0 text-text-inverse hover:brightness-110 active:brightness-95",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>

/**
 * Per-variant override for the icon+label gap inside the content span. Default
 * (unlisted) variants keep the original `gap-2` (8px); the gradient CTA-pill
 * archetype's Figma frame specifies an exact 10px gap between icon and label.
 * The icon-only archetypes render a single child, so gap is moot for them.
 */
const CONTENT_GAP: Partial<Record<ButtonVariant, string>> = {
  cta: "gap-[10px]",
  "cta-critical": "gap-[10px]",
}

function Button({
  className,
  variant = "primary",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Hides the label (space reserved) and shows a centered spinner. Height/padding/width never change. */
    loading?: boolean
  }) {
  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        data-variant={variant}
        className={cn(buttonVariants({ variant, className }))}
        {...props}
      >
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, className }))}
      disabled={disabled || loading}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center",
          CONTENT_GAP[variant ?? "primary"] ?? "gap-2",
          loading && "opacity-0"
        )}
      >
        {children}
      </span>
      {loading && (
        <span
          aria-hidden="true"
          className="absolute inline-flex size-4 items-center justify-center rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin [animation-duration:var(--duration-slow)]"
        />
      )}
    </button>
  )
}

export { Button, buttonVariants }
