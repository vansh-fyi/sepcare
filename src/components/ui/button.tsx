import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/**
 * Locked D-08 Button contract: exactly 4 variants, no separate size axis.
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
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>

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
      <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
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
