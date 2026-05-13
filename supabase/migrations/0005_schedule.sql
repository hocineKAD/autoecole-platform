-- =====================================================
-- Migration 0005 — Planning des moniteurs + type de véhicule par école
-- Idempotente : peut être lancée plusieurs fois sans casser.
-- =====================================================

-- 1. Ajouter vehicle_type à driving_schools
alter table public.driving_schools
  add column if not exists vehicle_type public.vehicle_type not null default 'auto';

-- 2. Planning hebdomadaire récurrent par école
create table if not exists public.school_weekly_schedules (
  id                uuid primary key default gen_random_uuid(),
  school_id         uuid not null references public.driving_schools(id) on delete cascade,
  day_of_week       smallint not null check (day_of_week between 0 and 6), -- 0=Dim, 1=Lun, …, 6=Sam
  start_hour        smallint not null check (start_hour between 0 and 23),
  end_hour          smallint not null check (end_hour between 1 and 24),
  slot_duration_min smallint not null default 60 check (slot_duration_min in (30, 60, 90)),
  is_active         boolean not null default true,
  updated_at        timestamptz not null default now(),
  constraint uq_school_day_of_week unique (school_id, day_of_week),
  constraint chk_end_after_start check (end_hour > start_hour)
);

drop trigger if exists trg_school_weekly_schedules_updated_at on public.school_weekly_schedules;
create trigger trg_school_weekly_schedules_updated_at
  before update on public.school_weekly_schedules
  for each row execute function public.set_updated_at();

-- 3. Jours exceptionnels (fermetures ponctuelles)
create table if not exists public.schedule_exceptions (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.driving_schools(id) on delete cascade,
  exception_date date not null,
  is_closed      boolean not null default true,
  created_at     timestamptz not null default now(),
  constraint uq_school_exception unique (school_id, exception_date)
);

create index if not exists idx_schedule_exceptions_school_date
  on public.schedule_exceptions(school_id, exception_date);

-- 4. Mettre preferred_slot nullable + ajouter slot_time précis sur bookings
alter table public.bookings alter column preferred_slot drop not null;
alter table public.bookings add column if not exists slot_time time;

-- 5. RLS — school_weekly_schedules
alter table public.school_weekly_schedules enable row level security;

drop policy if exists "weekly_schedule select" on public.school_weekly_schedules;
create policy "weekly_schedule select"
  on public.school_weekly_schedules for select
  using (
    school_id in (
      select school_id from public.profiles where id = auth.uid()
    )
  );

drop policy if exists "weekly_schedule admin" on public.school_weekly_schedules;
create policy "weekly_schedule admin"
  on public.school_weekly_schedules for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'school_admin'
        and school_id = school_weekly_schedules.school_id
    )
  );

-- 6. RLS — schedule_exceptions
alter table public.schedule_exceptions enable row level security;

drop policy if exists "schedule_exceptions select" on public.schedule_exceptions;
create policy "schedule_exceptions select"
  on public.schedule_exceptions for select
  using (
    school_id in (
      select school_id from public.profiles where id = auth.uid()
    )
  );

drop policy if exists "schedule_exceptions admin" on public.schedule_exceptions;
create policy "schedule_exceptions admin"
  on public.schedule_exceptions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'school_admin'
        and school_id = schedule_exceptions.school_id
    )
  );
