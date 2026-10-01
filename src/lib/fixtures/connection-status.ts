export type ConnectionState = "live" | "stale" | "reconnecting";

/** Retry state comes from the caller, never from elapsed time alone. */
export function getConnectionState(
  lastSyncedAt: number,
  now: number,
  staleAfterMs = 60_000,
): ConnectionState {
  return now - lastSyncedAt < staleAfterMs ? "live" : "stale";
}
