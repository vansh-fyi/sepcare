import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-input border border-border p-3 text-body placeholder:text-text-muted transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-out outline-none focus:border-border-focus focus:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-critical",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
