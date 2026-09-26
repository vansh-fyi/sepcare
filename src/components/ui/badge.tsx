import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"

/**
 * Locked D-08 Badge/StatusPill contract: exactly 3 status keys, each always
 * rendering Icon + label + color together (DESIGN-SYSTEM.md §9 multi-modal
 * rule — a Badge must never communicate status via color alone). Because
 * that invariant lives inside the component body (not just the class
 * string), `asChild`/`Slot` composition is intentionally not supported here
 * — a caller substituting the rendered element could otherwise bypass the
 * Icon+label pairing.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full p-1 text-label font-semibold",
  {
    variants: {
      status: {
        "safe": "bg-safe-soft text-safe-dark",
        "caution": "bg-caution-soft text-caution-dark",
        "critical": "bg-critical-soft text-critical-dark",
      },
    },
  }
)

export type BadgeStatus = NonNullable<VariantProps<typeof badgeVariants>["status"]>

interface BadgeProps extends Omit<React.ComponentProps<"span">, "className"> {
  status: BadgeStatus
  className?: string
}

function Badge({ className, status, children, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-status={status}
      className={cn(badgeVariants({ status }), className)}
      {...props}
    >
      <Icon name={status} size={16} />
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
