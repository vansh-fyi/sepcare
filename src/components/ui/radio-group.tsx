"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

/**
 * Restyled onto the project's semantic token layer. No dedicated Figma frame
 * was found for `RadioGroup` — see `radio-group.DESIGN.md`'s "Figma
 * fidelity" note. Checked-state fill (`bg-brand-fill`) matches the same
 * blue-accent convention used by `Checkbox` (this plan, Task 1) for visual
 * consistency across the toggle-family controls. Press feedback
 * (`active:scale-[0.96]`, `150ms ease-out`) follows `06-UI-SPEC.md`'s Motion
 * rule. The indicator dot is a plain filled `<span>` rather than a stroked
 * `Icon` glyph — a solid dot, not an outlined icon, is the correct visual
 * for a radio control. Radix owns the actual `aria-checked`/keyboard-focus
 * (arrow-key navigation) state machine — this file only restyles the
 * presentational classes, per D-12's "do not hand-roll" directive.
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-border shadow-xs transition-[color,box-shadow,transform] duration-[var(--duration-fast)] ease-out outline-none active:scale-[0.96] focus-visible:border-border-focus focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-critical data-[state=checked]:border-brand-fill",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-fill" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
