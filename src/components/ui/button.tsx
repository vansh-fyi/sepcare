import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/**
 * D-08's original "exactly 4 variants" lock is SUPERSEDED by D-12 — the variant
 * union now also carries the gradient CTA-pill archetype Figma actually shows
 * (node `203-11745` "Connect Device", reconciled Task 1 of 06-06; node
 * `203-14032` "Call Ambulance" + the icon-only archetypes reconciled Task 2).
 * See button.DESIGN.md for the full per-node provenance trail (D-15).
 *
 * `duration-[var(--duration-normal)]` (not the named `duration-normal` class) —
 * Tailwind v4 has no `--duration-*` theme namespace for utility generation
 * (only numeric/arbitrary `duration-*` values compile), so the token must be
 * referenced via an arbitrary value to actually take effect.
 */
const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-btn px-5 py-3 text-body font-semibold transition-colors duration-[var(--duration-normal)] disabled:opacity-50 disabled:pointer-events-none",
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
 */
const CONTENT_GAP: Partial<Record<ButtonVariant, string>> = {
  cta: "gap-[10px]",
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
