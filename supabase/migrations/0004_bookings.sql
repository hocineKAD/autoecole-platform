-- =====================================================
-- Migration 0004 — Module réservations (Session 3)
-- Idempotente : peut être lancée plusieurs fois sans casser.
-- =====================================================

-- 1. Enums
do $$ begin
  create type public.vehicle_type as enum ('auto', 'moto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum ('pending', 'approved', 'refused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.preferred_slot as enum ('morning', 'afternoon', 'evening');
exception when duplicate_object then null; end $$;

-- 2. Table bookings
create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.driving_schools(id) on delete cascade,
  candidate_id   uuid not null references public.profiles(id) on delete cascade,
  vehicle_type   public.vehicle_type not null,
  preferred_date date not null,
  preferred_slot public.preferred_slot not null,
  candidate_note text,
  status         public.booking_status not null default 'pending',
  admin_note     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 3. Index
create index if not exists idx_bookings_candidate
  on public.bookings(candidate_id, created_at desc);

create index if not exists idx_bookings_school_date
  on public.bookings(school_id, preferred_date asc);

-- 4. Trigger updated_at (réutilise la fonction définie dans 0001)
drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- 5. RLS
alter table public.bookings enable row level security;

drop policy if exists "bookings select candidate" on public.bookings;
create policy "bookings select candidate"
  on public.bookings for select
  using (auth.uid() = candidate_id);

drop policy if exists "bookings insert candidate" on public.bookings;
create policy "bookings insert candidate"
  on public.bookings for insert
  with check (auth.uid() = candidate_id);

drop policy if exists "bookings select admin" on public.bookings;
create policy "bookings select admin"
  on public.bookings for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'school_admin'
        and p.school_id = bookings.school_id
    )
  );

drop policy if exists "bookings update admin" on public.bookings;
create policy "bookings update admin"
  on public.bookings for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'school_admin'
        and p.school_id = bookings.school_id
    )
  );

-- ✅ Vérification : liste les colonnes de la table bookings
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'bookings'
order by ordinal_position;
