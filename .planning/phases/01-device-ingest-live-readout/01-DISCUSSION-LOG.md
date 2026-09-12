# Phase 1: Device Ingest & Live Readout - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-12
**Phase:** 1-Device Ingest & Live Readout
**Areas discussed:** Ingest payload shape, Device auth mechanism, Read API shape, Error handling & responses

---

## Ingest payload shape

| Option | Description | Selected |
|--------|-------------|----------|
| Flat JSON, camelCase | `{ deviceId, timestamp, heartRate, spo2, temperature, activityScore }` | |
| Flat JSON, snake_case | `{ device_id, timestamp, heart_rate, spo2, temperature, activity_score }` | |
| Nested JSON (vitals sub-object) | `{ deviceId, timestamp, vitals: { heartRate, spo2, temperature, activityScore } }` | ✓ |

**User's choice:** Nested JSON (vitals sub-object)

| Option | Description | Selected |
|--------|-------------|----------|
| Unix epoch ms | Integer milliseconds since epoch | ✓ |
| ISO 8601 string | e.g. "2026-09-12T14:30:00Z" | |

**User's choice:** Unix epoch ms

| Option | Description | Selected |
|--------|-------------|----------|
| POST /api/ingest | Action-named endpoint, leaves room for /api/ingest/batch in Phase 3 | ✓ |
| POST /api/vitals | Resource-named endpoint | |

**User's choice:** POST /api/ingest

---

## Device auth mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Env var | Single API key stored as a Vercel env var | |
| Devices table in Supabase | `devices` table with `device_id` + `api_key` columns | ✓ |

**User's choice:** Devices table in Supabase
**Notes:** Chosen even for a single device so multi-device support (DEV-V2-01) doesn't need a schema migration later.

| Option | Description | Selected |
|--------|-------------|----------|
| X-API-Key | Simple API-key convention | ✓ |
| Authorization: Bearer <key> | Standard HTTP auth header, implies a token scheme | |

**User's choice:** X-API-Key

**Notes:** Mid-discussion, the user asked how device pairing actually works. Answered: v1 pairing is fully manual per DEV-01 — a `devices` row is inserted directly (dashboard/SQL/seed script), and the same `device_id`/`api_key` are hardcoded into ESP32 firmware at flash time. No registration flow exists for v1; that's DEV-V2-02, deferred.

---

## Read API shape

| Option | Description | Selected |
|--------|-------------|----------|
| REST endpoint | `GET /api/vitals/latest` returning JSON | |
| Supabase realtime subscription | Frontend subscribes directly via Supabase client SDK | ✓ |

**User's choice:** Supabase Realtime subscription
**Notes:** User asked two clarifying questions before deciding: (1) whether Realtime is free and better than REST, (2) which is faster/more efficient. Claude's answers: Realtime is included on Supabase's free tier (no added cost) and, for a continuously-updating "live readout" screen, avoids polling and Vercel cold-starts, delivering near-instant push updates instead. The earlier concern about duplicating risk-formatting logic across layers was resolved by noting Phase 2 already persists the computed Green/Amber/Red status at write time (STOR-02), so the frontend reads an already-computed value either way. Final decision was made with this full reasoning in view — do not silently revert to REST during planning without surfacing that reasoning to the user again.

| Option | Description | Selected |
|--------|-------------|----------|
| Match ingest field names | Reuse heartRate, temperature, activityScore, spo2 from ingest payload | ✓ |
| Frontend-friendly display names | Return pulse, temp, activity directly | |

**User's choice:** Match ingest field names

---

## Error handling & responses

| Option | Description | Selected |
|--------|-------------|----------|
| 401 + JSON error body | `{ error: "Invalid or missing API key" }` | ✓ |
| 403 + JSON error body | Treats it as "forbidden" rather than "unauthenticated" | |

**User's choice:** 401 + JSON error body
**Notes:** Mid-discussion, the user asked about device pairing again in context of auth errors — same answer as above (manual devices-table row + hardcoded firmware credentials) applies; no new decision here beyond confirming understanding.

| Option | Description | Selected |
|--------|-------------|----------|
| 400 + field-level error | `{ error: "Invalid payload", details: [...] }` naming failed fields | ✓ |
| 400 + generic error only | `{ error: "Invalid payload" }` with no detail | |

**User's choice:** 400 + field-level error

---

## Claude's Discretion

None — all four areas reached explicit user decisions with no "you decide" deferrals.

## Deferred Ideas

- Device registration/provisioning UI (DEV-V2-02) — out of scope for Phase 1's manual pairing approach.
- Multi-device support (DEV-V2-01) — the `devices` table shape anticipates it but building it out is not in scope.
- API key rotation/hashing policy — not raised as blocking; noted for a future auth-hardening pass.
