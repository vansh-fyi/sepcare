import { Icon } from "@/components/icon";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { STATUS_LABEL } from "@/lib/fixtures/risk-status";
import type { ClinicalStatus } from "./clinical-cards";

export interface RiskTimelineEntry { timestamp: number; status: ClinicalStatus | "unscored" }
const COLORS = { unscored: "text-text-muted", safe: "text-safe", caution: "text-caution", critical: "text-critical" };

export function RiskTimeline({ entries }: { entries: RiskTimelineEntry[] }) {
  const today = new Date().toDateString();
  if (entries.length === 0) return <p className="text-sm text-text-muted">No status changes recorded yet.</p>;
  return <ItemGroup>{entries.map(entry => {
    const date = new Date(entry.timestamp);
    const label = date.toLocaleString("en-US", {
      ...(date.toDateString() === today ? {} : { month: "short", day: "numeric" }),
      hour: "numeric", minute: "2-digit", hour12: true,
    });
    return <Item key={entry.timestamp} role="listitem" className="flex-nowrap">
      <ItemMedia><Icon name={entry.status === "unscored" ? "sync" : entry.status} size={16} className={COLORS[entry.status]} /></ItemMedia>
      <ItemContent className="min-w-0 break-words">
        <ItemTitle>{entry.status === "unscored" ? "Not yet assessed" : STATUS_LABEL[entry.status]}</ItemTitle>
        <ItemDescription className="line-clamp-none"><time dateTime={date.toISOString()}>{label}</time></ItemDescription>
      </ItemContent>
    </Item>;
  })}</ItemGroup>;
}
