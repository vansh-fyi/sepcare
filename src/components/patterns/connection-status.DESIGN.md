# Connection status

ConnectionStatus communicates reading freshness independently of infant risk and wearable battery. It uses the shared Icon, caption typography, an 8px gap, and existing semantic color roles.

| State | Icon | Label | Color |
| --- | --- | --- | --- |
| live | connected | Live | text-safe |
| stale | sync | Last synced Nm ago (or Last synced just now) | text-text-muted |
| reconnecting | syncing | Reconnecting… | text-caution-dark |

lastSyncedAt is an epoch-millisecond timestamp. staleAfterMs defaults to 60,000; the boundary itself is stale. The local clock refreshes every 15 seconds and the effect clears its interval on unmount. Minutes round to the nearest integer and cannot become negative. Labels always include a state word.

forceState overrides freshness for explicitly controlled states. The fixture prototype has no network retry operation, so it must supply reconnecting explicitly; elapsed time alone never implies a retry. Future live callers can supply their actual retry state through the same prop. No separate loading state or network error panel belongs to this indicator.
