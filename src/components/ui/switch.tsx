"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "radix-ui"

/**
 * Restyled onto the project's semantic token layer. No dedicated Figma frame
 * was found for `Switch` — see `switch.DESIGN.md`'s "Figma fidelity" note.
 * Checked-state fill (`bg-brand-fill`) matches the same blue-accent
 * convention established for `Checkbox`/`RadioGroup` (this plan, Task 1) so
 * all three toggle-family controls read as visually identical. Press
 * feedback (`active:scale-[0.96]`, `150ms ease-out`) is applied to the thumb
 * only, not the whole track, matching how a physical switch's moving part
 * animates — the thumb reads the root's `:active` state via `group-active/
 * switch` since the root (not the thumb) is the focusable/pressable element.
 * Radix owns the actual `aria-checked`/keyboard-focus state machine — this
 * file only restyles the presentational classes, per D-12's "do not
 * hand-roll" directive.
 */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-colors duration-[var(--duration-fast)] ease-out outline-none focus-visible:border-border-focus focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-brand-fill data-[state=unchecked]:bg-border",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-surface ring-0 transition-transform duration-[var(--duration-fast)] ease-out group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 group-active/switch:scale-[0.96]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
