-- =====================================================
-- Migration 0007 — Pause déjeuner sur le planning hebdomadaire
-- Idempotente.
-- =====================================================

alter table public.school_weekly_schedules
  add column if not exists lunch_break_start smallint
    check (lunch_break_start is null or lunch_break_start between 0 and 23),
  add column if not exists lunch_break_end smallint
    check (lunch_break_end is null or lunch_break_end between 1 and 24);
