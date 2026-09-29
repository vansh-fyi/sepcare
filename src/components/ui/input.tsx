import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"

const DEFAULT_ERROR_MESSAGE = "Check this value and try again."

export interface InputProps extends React.ComponentProps<"input"> {
  /** Renders the critical-colored border and the inline error-message slot below the input. */
  error?: boolean
  /** Custom error copy. Falls back to the locked default copy when `error` is true. */
  errorMessage?: string
}

function Input({
  className,
  type,
  error = false,
  errorMessage,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const generatedId = React.useId()
  const errorId = `${props.id ?? generatedId}-error`
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <input
        type={type}
        data-slot="input"
        aria-invalid={ariaInvalid ?? error}
        aria-describedby={[ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(" ") || undefined}
        className={cn(
          "w-full rounded-input border border-border bg-surface px-3.5 py-2.5 text-body text-text placeholder:text-text-muted transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)] ease-out outline-none focus:border-border-focus focus:shadow-focus hover:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-critical aria-invalid:focus:border-critical aria-invalid:focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]",
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-caption font-medium text-critical-dark flex items-center gap-1.5">
          <Icon name="caution" size={14} />
          <span>{errorMessage ?? DEFAULT_ERROR_MESSAGE}</span>
        </p>
      )}
    </div>
  )
}

export { Input }
