import * as React from "react"
import { cn } from "@/lib/utils"

/** Locked D-08 copy for Input's error slot (06-UI-SPEC.md Copywriting Contract). */
const DEFAULT_ERROR_MESSAGE = "Couldn't load this. Check your connection and try again."

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
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        type={type}
        data-slot="input"
        aria-invalid={ariaInvalid ?? error}
        className={cn(
          "w-full rounded-input border border-border p-3 text-body placeholder:text-text-muted focus:border-border-focus focus:shadow-focus disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-critical",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-caption text-critical-dark">
          {errorMessage ?? DEFAULT_ERROR_MESSAGE}
        </p>
      )}
    </div>
  )
}

export { Input }
