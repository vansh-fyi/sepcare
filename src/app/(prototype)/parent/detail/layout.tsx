"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ParentDetailLayout({ children }: LayoutProps<"/parent/detail">) {
  const activeTab = usePathname().endsWith("/stats") ? "stats" : "vitals";
  return (
    <div className="space-y-6">
      <ToggleGroup type="single" value={activeTab} fit="equal" aria-label="Health details">
        <ToggleGroupItem value="vitals" asChild>
          <Link href="/parent/detail/vitals" aria-current={activeTab === "vitals" ? "page" : undefined}>Vitals</Link>
        </ToggleGroupItem>
        <ToggleGroupItem value="stats" asChild>
          <Link href="/parent/detail/stats" aria-current={activeTab === "stats" ? "page" : undefined}>Stats</Link>
        </ToggleGroupItem>
      </ToggleGroup>
      {children}
    </div>
  );
}
