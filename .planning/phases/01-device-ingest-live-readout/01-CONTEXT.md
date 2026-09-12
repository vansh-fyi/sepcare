# Phase 1: Device Ingest & Live Readout - Context

**Gathered:** 2026-09-12
**Status:** Ready for planning

<domain>
## Phase Boundary

A single vitals reading flows from a real ESP32 device POST, through API-key authentication, into Supabase storage, and is fetchable as the live "latest reading" — the full pipeline works end-to-end for one reading, for one provisioned device. No risk scoring (Phase 2), no batch/offline sync (Phase 3), no historical trend range queries (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Ingest payload shape
- **D-01:** Request body is nested JSON with a `vitals` sub-object: `{ deviceId, timestamp, vitals: { heartRate, spo2, temperature, activityScore } }`.
- **D-02:** Timestamp is Unix epoch milliseconds (integer), not an ISO 8601 string — cheapest for ESP32 firmware to produce and unambiguous for Phase 3's original-timestamp requirement. — **Reversibility:** costly — changing the wire format later requires updating already-flashed firmware in the field, not just backend code.
- **D-03:** Endpoint is `POST /api/ingest` (single reading). Batch sync in Phase 3 will live at a related path (e.g. `/api/ingest/batch`), not decided here.

### Device auth mechanism
- **D-04:** API key is validated against a `devices` table in Supabase (`device_id`, `api_key` columns), not an env var — chosen specifically so multi-device support (DEV-V2-01) doesn't require a schema migration later, even though v1 only has one row. — **Reversibility:** reversible — a single-row table costs nothing extra now and is a superset of the env-var approach.
- **D-05:** The API key is sent in an `X-API-Key` header (not `Authorization: Bearer`), keeping `Authorization` free for a possible future bearer/JWT scheme.
- **D-06:** Device pairing for v1 is fully manual, per DEV-01: a `devices` row is inserted directly (Supabase dashboard/SQL/seed script) with a generated `device_id` + `api_key`; the same pair is hardcoded into ESP32 firmware at flash time. No registration endpoint or UI — that's DEV-V2-02, explicitly deferred.

### Read API shape
- **D-07:** The frontend reads the latest vitals reading via a **Supabase Realtime subscription** directly on the readings table, not a REST endpoint. Rationale surfaced during discussion: Realtime avoids polling and Vercel function cold-starts, matches this phase's "live readout" framing, and Phase 2 will pre-compute the Green/Amber/Red status server-side at write time (STOR-02) — so no formatting logic needs to live on the frontend regardless of read mechanism. — **Reversibility:** costly — the frontend's data-fetching layer would need to be rewritten (subscription → fetch/polling) if this is reversed after the frontend is built against it.
- **D-08:** Phase 1 must configure Row Level Security so the frontend's anon key can `SELECT` (read-only) rows for the single device, with no write access.
- **D-09:** Field names in the readings table/Realtime payload match the ingest vocabulary (`heartRate`, `temperature`, `activityScore`, `spo2`, `deviceId`, `timestamp`) rather than frontend-display names (`pulse`, `temp`, `activity`) — one consistent vocabulary end-to-end; the frontend does its own display formatting (BPM label, °F, word-state mapping for activity).

### Error handling & responses
- **D-10:** Missing/invalid API key → `401` with JSON body `{ error: "Invalid or missing API key" }`.
- **D-11:** Malformed/missing-field ingest payload → `400` with a field-level error body (e.g. `{ error: "Invalid payload", details: [...] }` naming which field(s) failed) — chosen over a generic-only message specifically to make field-level ESP32 firmware bugs debuggable from server logs/responses.

### Claude's Discretion
None — all four discussed areas reached explicit user decisions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — core value, constraints (free-tier hosting, Next.js/TS/Supabase stack, ESP32 device), and prior key decisions (static per-device API key, backend-side fusion logic)
- `.planning/REQUIREMENTS.md` — ING-01, ING-02, STOR-01, READ-01, DEV-01 (this phase's requirement set)
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria; downstream Phase 2/3/4 dependencies this phase must not preclude

### Domain / clinical context
- `context/implementation-plans/neonatal-sepsis-armband.md` §7.1.1 — composite risk-scoring logic (informs what vitals fields must be captured now, even though scoring itself is Phase 2)
- `context/web-research/sepsis-vs-common-illness-differentiation.md` — background on why hypothermia is weighted equally to fever (relevant to future `temperature` field usage, not v1 ingest logic itself)

### Frontend consumption contract
- `context/frontend-handoff/PRD.md` — FR-1/FR-2 describe exactly what the frontend expects from the read side (pulse/temp/activity display, Green/Amber/Red framing)
- `context/frontend-handoff/OVERVIEW.md` — confirms backend (this branch) is the sole source of vitals + risk status for the frontend being built on `main`

No ADRs exist yet for this project — the decisions above are the first ADR-equivalent record for the ingest/auth/read wire format.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
None — this is a greenfield backend. No Next.js app, API routes, or Supabase schema exist in this repo yet. Phase 1 planning must include initial project scaffolding (Next.js app router setup, Supabase client wiring, `devices` and readings tables).

### Established Patterns
None yet — Phase 1 sets the first patterns (payload shape, auth header, error body format) that Phases 2–4 will follow for consistency.

### Integration Points
- Supabase project must be created/configured (tables: `devices`, readings) with RLS policies for the anon key (read-only) vs a service-role key (used server-side by the ingest route to write).
- Frontend (built separately on `main`) will consume the Realtime subscription directly — Phase 1's Supabase schema and RLS setup is a hard dependency for frontend work, not just this backend.

</code_context>

<specifics>
## Specific Ideas

- The user asked directly about device pairing mechanics mid-discussion; this is now captured as D-06 (manual `devices` table row + hardcoded firmware credentials, no registration flow for v1).
- The user probed the REST-vs-Realtime tradeoff on cost and speed before deciding — final reasoning (D-07) should be treated as deliberate, not default-picked, and should not be re-litigated by research/planning without new information.

</specifics>

<deferred>
## Deferred Ideas

- Device registration/provisioning UI — belongs to DEV-V2-02 (v2 requirement), not this phase.
- Multi-device support beyond the single-row `devices` table shape chosen in D-04 — belongs to DEV-V2-01.
- API key rotation/hashing policy — not raised as blocking for v1's single static key; worth revisiting if DEV-V2-02 is built.

### Reviewed Todos (not folded)
None — no pending todos matched this phase's scope.

</deferred>

---

*Phase: 1-Device Ingest & Live Readout*
*Context gathered: 2026-09-12*
