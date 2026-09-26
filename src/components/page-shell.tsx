import type { ReactNode } from "react";

/**
 * Shared page container for /design-system/* routes. Constrains content to a
 * readable width and gives every sample/docs page a consistent title +
 * description header instead of leaving components floating unbounded on the
 * page canvas.
 */
export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          {description}
        </p>
      </header>
      {children}
    </div>
  );
}
