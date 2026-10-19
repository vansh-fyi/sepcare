"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { getConnectionState, type ConnectionState } from "@/lib/fixtures/connection-status";
import { cn } from "@/lib/utils";

export interface ConnectionStatusProps {
  lastSyncedAt: number;
  staleAfterMs?: number;
  forceState?: ConnectionState;
  className?: string;
}

export function ConnectionStatus({ lastSyncedAt, staleAfterMs = 60_000, forceState, className }: ConnectionStatusProps) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // Read the browser clock only after the shared server/client hydration render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(interval);
  }, []);

  const state = forceState ?? (now === null ? "checking" : getConnectionState(lastSyncedAt, now, staleAfterMs));
  const minutes = Math.max(0, Math.round(((now ?? lastSyncedAt) - lastSyncedAt) / 60_000));
  const treatment = {
    checking: { icon: "sync", label: "Checking freshness…", color: "text-text-muted" },
    live: { icon: "connected", label: "Live", color: "text-safe" },
    stale: { icon: "sync", label: now === null ? "Last synced — checking time…" : minutes === 0 ? "Last synced just now" : `Last synced ${minutes}m ago`, color: "text-text-muted" },
    reconnecting: { icon: "syncing", label: "Reconnecting…", color: "text-caution-dark" },
  } as const;
  const { icon, label, color } = treatment[state];
  return (
    <span className={cn("inline-flex items-center gap-2 text-caption", color, className)} data-state={state}>
      <Icon name={icon} size={16} />
      <span>{label}</span>
    </span>
  );
}
