import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"

/** Clinical badges pair a status glyph with supplied text; metadata uses neutral or brand. */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-badge bg-[image:var(--gradient-status-sheen)] px-3 py-1 text-xs font-semibold tracking-tight transition-colors select-none",
  {
    variants: {
      status: {
        "safe": "bg-safe-soft bg-[image:var(--gradient-badge-safe)] text-safe-dark",
        "caution": "bg-caution-soft bg-[image:var(--gradient-badge-caution)] text-caution-dark",
        "critical": "bg-critical-soft bg-[image:var(--gradient-badge-critical)] text-critical-dark",
        "neutral": "bg-bg text-text",
        "brand": "bg-brand-soft text-brand",
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
  /** Independent appearance option: true shows the clinical glyph; false is text-only. */
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
