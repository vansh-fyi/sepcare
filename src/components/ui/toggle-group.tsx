"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { toggleVariants } from "@/components/ui/toggle"

/**
 * Generic segmented control. Figma-verified against node `203-11938` (the
 * time-scale toggle) only insofar as that node's existence and role were
 * confirmed during research (`06-RESEARCH.md` Pattern 3) — no dedicated
 * per-value extraction (exact padding/corner-radius/active-fill pixel
 * values) was performed for `203-11938` or a dedicated `ToggleGroup` frame
 * this plan (no such node/frame was included in the orchestrator's D-15
 * extraction handoff). This component's visual treatment is therefore
 * **token-consistent, not node-verified** — restyled through the same
 * radius/color/typography tokens already established by `Button`/`Card`/
 * `Item` (`--radius-btn`, `--color-brand-fill`, `text-label`), rather than
 * guessed bespoke values. A later plan with direct Figma access should
 * extract `203-11938`'s exact values and correct this note if they diverge.
 *
 * **Reuse contract (Copywriting Contract, 06-UI-SPEC.md):** this component
 * accepts arbitrary labeled options — it does not hardcode any day/week/month
 * range-specific label strings. Phase 7's caregiver trend graph reuses this
 * exact primitive with a different labeled set (hour-based, per
 * `REQUIREMENTS.md` CARE-04) — see `toggle-group.DESIGN.md` for the
 * correct/incorrect usage pair that demonstrates this.
 */
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-btn data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-btn data-[spacing=0]:last:rounded-r-btn data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
