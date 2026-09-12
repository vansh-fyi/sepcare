-- devices: manually seeded (D-06), one row for v1
create table public.devices (
  device_id text primary key,
  api_key text not null,
  created_at timestamptz not null default now()
);
alter table public.devices enable row level security;
-- No anon policy at all on `devices` — this table should NOT be readable
-- by anon; only the service-role client (auth checks) ever queries it.

-- readings: quoted camelCase columns to match D-09's wire vocabulary exactly
create table public.readings (
  id bigint generated always as identity primary key,
  "deviceId" text not null references public.devices(device_id),
  "timestamp" bigint not null,        -- epoch ms, D-02 (see Pitfall 2 for the tradeoff)
  "heartRate" numeric not null,
  "spo2" numeric not null,
  "temperature" numeric not null,
  "activityScore" numeric not null,
  created_at timestamptz not null default now()
);
alter table public.readings enable row level security;

create policy "anon read-only single device"
on public.readings
for select
to anon
using ("deviceId" = 'nb-001');

alter publication supabase_realtime add table public.readings;
