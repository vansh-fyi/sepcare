-- Defensively remove any pre-existing exact duplicate (deviceId, timestamp)
-- rows before adding the constraint — a no-op if none exist, but required
-- because ALTER TABLE ... ADD CONSTRAINT ... UNIQUE fails immediately if
-- any existing rows violate it (UNIQUE constraints cannot use NOT VALID,
-- unlike foreign-key/check constraints — verification is always immediate).
-- Deterministically keeps the lower-id (earliest-inserted) row (D-33, T-03-02).
delete from public.readings a
using public.readings b
where a.id > b.id
  and a."deviceId" = b."deviceId"
  and a."timestamp" = b."timestamp";

-- D-33: unique constraint backing the onConflict target for both
-- POST /api/ingest and POST /api/ingest/batch's upsert-ignore-duplicates
-- calls (Plans 03-02/03-03). Additive alongside the existing
-- readings_deviceid_timestamp_idx plain index from the risk_scores
-- migration — that index is not dropped here.
alter table public.readings
  add constraint readings_deviceid_timestamp_key unique ("deviceId", "timestamp");
