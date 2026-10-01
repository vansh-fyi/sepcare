import Link from "next/link";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

export default function ParentLayout({ children }: LayoutProps<"/parent">) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page-canvas">
      <header className="flex shrink-0 items-center justify-between px-4 py-3 md:px-6">
        <Wordmark size="lg" />
        <Button asChild radius="lg" data-icon-only="true" aria-label="Device">
          <Link href="/parent/device"><Icon name="wearable" size={22} /></Link>
        </Button>
      </header>
      <p className="shrink-0 px-4 py-2 text-center text-xs text-text-secondary">Prototype · Static sample data · No live monitoring</p>
      <main className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
