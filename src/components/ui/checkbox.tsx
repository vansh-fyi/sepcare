"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

/**
 * Restyled onto the project's semantic token layer. No dedicated Figma frame
 * was found for `Checkbox` — see `checkbox.DESIGN.md`'s "Figma fidelity"
 * note. Checked-state fill (`bg-brand-fill`/`border-brand-fill`) matches the
 * same blue-accent convention already used by `Input`'s focus ring and
 * `Button`'s primary variant. Press feedback (`active:scale-[0.96]`,
 * `150ms ease-out`) follows `06-UI-SPEC.md`'s Motion rule, which explicitly
 * lists `Checkbox` among the components required to have it. Radix owns the
 * actual `aria-checked`/keyboard-focus state machine — this file only
 * restyles the presentational classes, per D-12's "do not hand-roll"
 * directive.
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-border shadow-xs transition-[color,background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-out outline-none active:scale-[0.96] focus-visible:border-border-focus focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-critical data-[state=checked]:border-brand-fill data-[state=checked]:bg-brand-fill data-[state=checked]:text-text-inverse",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <Icon name="check" size={14} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
