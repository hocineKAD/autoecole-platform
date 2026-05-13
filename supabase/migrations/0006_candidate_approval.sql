-- =====================================================
-- Migration 0006 — Système d'approbation des candidats
-- Idempotente : peut être lancée plusieurs fois sans casser.
-- =====================================================

-- 1. Enum statut candidat
do $$ begin
  create type public.candidate_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- 2. Ajouter la colonne status sur profiles
alter table public.profiles
  add column if not exists status public.candidate_status not null default 'pending';

-- 3. Rétrocompat : tous les comptes existants sont considérés approuvés
update public.profiles set status = 'approved' where status = 'pending';

-- 4. Mettre à jour le trigger de création de profil
--    → les candidats démarrent en "pending", les admins sont auto-approuvés
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role   public.user_role;
  v_status public.candidate_status;
begin
  v_role   := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'candidate');
  v_status := case when v_role = 'candidate' then 'pending'::public.candidate_status
                   else 'approved'::public.candidate_status end;

  insert into public.profiles (id, school_id, role, full_name, phone, status)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'school_id')::uuid,
    v_role,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    v_status
  );
  return new;
end;
$$;

-- 5. Fonctions security-definer pour éviter la récursion RLS sur profiles
create or replace function public.get_my_school_id()
returns uuid language sql security definer stable set search_path = public as $$
  select school_id from profiles where id = auth.uid()
$$;

create or replace function public.get_my_role()
returns public.user_role language sql security definer stable set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

-- 6. RLS — admin peut lire tous les profils de son école
drop policy if exists "profiles select school_admin" on public.profiles;
create policy "profiles select school_admin"
  on public.profiles for select
  using (
    public.get_my_role() = 'school_admin'
    and school_id = public.get_my_school_id()
  );

-- 7. RLS — admin peut mettre à jour les profils de son école (approbation)
drop policy if exists "profiles update school_admin" on public.profiles;
create policy "profiles update school_admin"
  on public.profiles for update
  using (
    public.get_my_role() = 'school_admin'
    and school_id = public.get_my_school_id()
  );
