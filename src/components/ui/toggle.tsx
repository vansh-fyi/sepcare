"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Toggle as TogglePrimitive } from "radix-ui"

/**
 * Restyled onto the project's semantic token layer. No dedicated Figma node
 * was extracted for the bare `Toggle` primitive itself — only `ToggleGroup`'s
 * segmented-control composition (node `203-11938`, the time-scale toggle) has
 * a Figma reference, and even that node's exact padding/radius/fill values
 * were not independently extracted this plan (see `toggle-group.DESIGN.md`'s
 * "Figma fidelity" note). This file's classes are therefore **token-consistent,
 * not node-verified** — built from the radius/color/typography tokens already
 * established by `Button`/`Card`/`Item`, per the same reasoning those
 * components' own restyles used, rather than guessed bespoke pixel values.
 *
 * Press feedback (`active:scale-[0.96]`, `150ms ease-out`) follows
 * `06-UI-SPEC.md`'s Motion rule, which explicitly lists "ToggleGroup items"
 * among the components required to have it.
 */
const toggleVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-btn text-label font-semibold whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-out outline-none active:scale-[0.96] hover:bg-bg hover:text-text focus-visible:border-border-focus focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-brand-fill data-[state=on]:text-text-inverse [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-border bg-transparent shadow-xs hover:bg-bg hover:text-text",
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
