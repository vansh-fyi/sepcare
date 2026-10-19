import { PulseWave } from "@/components/motion/pulse-wave";
import { cn } from "@/lib/utils";

export function DeviceConnectionLabel({ connected = true, className }: { connected?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-caption text-text-muted", className)}>
      <PulseWave size="sm" tone={connected ? "safe" : "neutral"} active={connected} />
      <span>{connected ? "Connected" : "Disconnected"}</span>
    </span>
  );
}
