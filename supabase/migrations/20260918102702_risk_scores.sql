-- risk_scores: 1:1 with readings via reading_id as PK (D-19), quoted camelCase
-- "deviceId" denormalized so the RLS policy mirrors readings' literal comparison (D-21)
create table public.risk_scores (
  reading_id bigint primary key references public.readings(id) on delete cascade,
  "deviceId" text not null references public.devices(device_id),
  status text not null check (status in ('green', 'amber', 'red')),
  breakdown jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.risk_scores enable row level security;

create policy "anon read-only single device"
on public.risk_scores
for select
to anon
using ("deviceId" = 'nb-001');

alter publication supabase_realtime add table public.risk_scores;

-- Addresses RESEARCH.md Pitfall 1 — composite index on the existing readings
-- table, needed by every rolling-window query Plan 02-02/02-03 introduces:
create index readings_deviceid_timestamp_idx
on public.readings ("deviceId", "timestamp");
