import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"

/**
 * Locked D-08 Badge/StatusPill contract: exactly 3 status keys, each always
 * rendering Icon + label + color together (DESIGN-SYSTEM.md §9 multi-modal
 * rule — a Badge must never communicate status via color alone). Because
 * that invariant lives inside the component body (not just the class
 * string), the `as-child`/`Slot` composition pattern is intentionally not
 * supported here — a caller substituting the rendered element could
 * otherwise bypass the Icon+label pairing.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-tight border transition-colors select-none",
  {
    variants: {
      status: {
        "safe": "bg-safe-soft text-safe-dark border-border-subtle",
        "caution": "bg-caution-soft text-caution-dark border-border-subtle",
        "critical": "bg-critical-soft text-critical-dark border-border-subtle",
        "neutral": "bg-bg text-text border-border-subtle",
        "brand": "bg-brand-soft text-brand border-border-subtle",
      },
    },
    defaultVariants: {
      status: "safe",
    },
  }
)

export type BadgeStatus = NonNullable<VariantProps<typeof badgeVariants>["status"]>

interface BadgeProps extends Omit<React.ComponentProps<"span">, "className"> {
  status?: BadgeStatus
  variant?: BadgeStatus
  className?: string
  showIcon?: boolean
}

function Badge({ className, status, variant, showIcon = true, children, ...props }: BadgeProps) {
  const resolvedStatus = status ?? variant ?? "safe";
  const hasStatusIcon = resolvedStatus === "safe" || resolvedStatus === "caution" || resolvedStatus === "critical";

  return (
    <span
      data-slot="badge"
      data-status={resolvedStatus}
      className={cn(badgeVariants({ status: resolvedStatus }), className)}
      {...props}
    >
      {showIcon && hasStatusIcon && <Icon name={resolvedStatus} size={14} className="shrink-0" />}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
