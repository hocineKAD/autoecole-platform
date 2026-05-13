-- =====================================================
-- Migration 0008 — Étapes de formation (code / stationnement / conduite)
-- Idempotente.
-- =====================================================

-- 1. Enum des étapes
do $$ begin
  create type public.training_stage as enum ('code', 'stationnement', 'conduite');
exception when duplicate_object then null; end $$;

-- 2. Étape courante sur les profils candidats
alter table public.profiles
  add column if not exists current_stage public.training_stage;

-- 3. Rétrocompat : les candidats approuvés existants démarrent à l'étape "code"
update public.profiles
  set current_stage = 'code'
  where role = 'candidate'
    and status = 'approved'
    and current_stage is null;

-- 4. Étape sur les réservations (nullable pour rétrocompat)
alter table public.bookings
  add column if not exists stage public.training_stage;
