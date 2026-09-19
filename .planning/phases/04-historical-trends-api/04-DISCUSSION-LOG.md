# Phase 4: Historical Trends API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-19
**Phase:** 4-Historical Trends API
**Areas discussed:** Endpoint contract, Time-range rules, Trend entry shape, Read access and incomplete data

---

## Endpoint contract

| Option | Description | Selected |
|---|---|---|
| `GET /api/readings` | Resource route with range query parameters | ✓ |
| `GET /api/readings/trends` | Trend-specific nested route | |
| `GET /api/trends` | Purpose-specific route | |

**User's choice:** `GET /api/readings` with required `deviceId`, `from`, and `to`.
**Notes:** Public, no user/device API-key requirement for the v1 dashboard. Unsupported device IDs get `404 { error: "Device not found" }`. ESP32 provisioning stays manual per Phase 1.

---

## Time-range rules

| Option | Description | Selected |
|---|---|---|
| Explicit bounds | Caller supplies both epoch-ms bounds | ✓ |
| Default end time | Server defaults `to` to now | |
| Default window | Server chooses a range | |

**User's choice:** Explicit bounds, a 15-day maximum, and `200` with an empty entries list for a valid empty range.
**Notes:** Invalid inputs receive clear `400` errors with development diagnostics and tests. Prove seven continuous days of history in tests, including a three-day continuous scenario.

---

## Trend entry shape

| Option | Description | Selected |
|---|---|---|
| Nested paired entry | Timestamp, nested vitals, nested risk | ✓ |
| Flat record | All fields at the top level | |
| Parallel arrays | Separate readings and scores arrays | |

**User's choice:** Metadata envelope plus nested entries containing full risk breakdowns; return every original reading.
**Notes:** No server-side aggregation or sampling; frontend handles visual presentation.

---

## Read access and incomplete data

| Option | Description | Selected |
|---|---|---|
| Preserve with `risk: null` | Keep the vitals record if scoring is missing | ✓ |
| Omit entry | Hide incomplete record | |
| Fail whole request | Treat any gap as an endpoint error | |

**User's choice:** Preserve `risk: null`, prevent cached history, and return a safe server error with private diagnostics.
**Notes:** Agent discretion selected `Cache-Control: no-store` for the requested automatic-update experience; existing Realtime subscriptions can trigger frontend refetches without manual refresh.

---

## Claude's Discretion

- Exact safe query/join and internal pagination implementation.
- `Cache-Control: no-store` to prioritize backfill freshness.

## Deferred Ideas

- Programmatic device provisioning and multi-device history/access.
- Frontend chart implementation and Realtime refetch wiring.
- Server-side history aggregation or ranges beyond 15 days.
