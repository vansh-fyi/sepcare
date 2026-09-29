import type { ReactNode } from "react";

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
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-14">
      <header className="mb-10">
        <h1 className="font-heading text-heading-page font-bold text-text">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      </header>
      {children}
    </div>
  );
}
