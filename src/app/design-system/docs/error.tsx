"use client";

/**
 * Route-level error boundary for /design-system/docs (WR-02 fix).
 *
 * `page.tsx` reads globals.css and every component *.DESIGN.md file
 * synchronously at render time with no try/catch. If any referenced file is
 * ever renamed/moved/deleted, or the @theme block is restructured, the route
 * would otherwise hard-crash with an unhandled exception. This boundary lets
 * the reference page degrade gracefully instead of 500ing the whole app.
 */
export default function DesignSystemDocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-heading font-semibold text-text">
        Design system reference unavailable
      </h1>
      <p className="text-body text-text-secondary">
        This page reads live token and component docs from source files, and
        one of those reads failed — likely a moved or missing file.
      </p>
      <pre className="whitespace-pre-wrap break-words rounded-card-sm bg-surface p-4 text-caption text-text-secondary">
        {error.message}
      </pre>
      <button
        type="button"
        onClick={() => reset()}
        className="self-start rounded-btn border border-border px-5 py-3 text-body font-semibold text-text hover:bg-surface-soft-blue"
      >
        Try again
      </button>
    </div>
  );
}
