"use client";

import { useState } from "react";
import { Preview } from "@/components/docs/documentation";
import { ConnectionStatus } from "@/components/patterns/connection-status";
import type { ConnectionState } from "@/lib/fixtures/connection-status";

export function ConnectionStatusExample() {
  const [state, setState] = useState<ConnectionState>("reconnecting");
  const [lastSyncedAt] = useState(() => Date.now() - 120_000);
  return (
    <Preview
      code={`<ConnectionStatus lastSyncedAt={${lastSyncedAt}} forceState="${state}" />`}
      caption="Sample connection state. Remove forceState to derive freshness from the timestamp."
      controls={<label>State <select value={state} onChange={(event) => setState(event.target.value as ConnectionState)}><option value="live">Live</option><option value="stale">Stale</option><option value="reconnecting">Reconnecting</option></select></label>}
    >
      <ConnectionStatus lastSyncedAt={lastSyncedAt} forceState={state} />
    </Preview>
  );
}
