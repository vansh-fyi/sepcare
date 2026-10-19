import type { ReactNode } from "react";

/** Shared viewport geometry for product routes and contained screen examples. */
export function ClinicalScreen({ header, navigation, notice, children }: {
  header: ReactNode;
  navigation?: ReactNode;
  notice?: ReactNode;
  children: ReactNode;
}) {
  return <div className="flex h-dvh flex-col overflow-hidden bg-page-canvas">
    {header}
    {notice && <div className="shrink-0 px-4 py-2 text-center text-xs text-text-secondary">{notice}</div>}
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
    </main>
    {navigation}
  </div>;
}

export function ClinicalMetricGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
