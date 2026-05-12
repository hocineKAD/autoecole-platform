-- =====================================================
-- Migration 0003 — Ajouts pour module QCM (Session 2)
-- À exécuter dans Supabase > SQL Editor APRÈS 0001 et 0002.
-- Idempotente : peut être lancée plusieurs fois sans casser.
-- =====================================================

-- 1. Type enum pour le mode QCM
do $$ begin
  create type public.quiz_mode as enum ('learning', 'training', 'exam');
exception
  when duplicate_object then null;
end $$;

-- 2. Colonnes additionnelles sur quiz_attempts
alter table public.quiz_attempts
  add column if not exists mode public.quiz_mode not null default 'learning';

alter table public.quiz_attempts
  add column if not exists time_limit_sec integer; -- null = pas de chrono

alter table public.quiz_attempts
  add column if not exists question_ids uuid[] not null default '{}'; -- ordre des questions

-- 3. Contrainte unique sur (attempt_id, question_id) dans quiz_answers
-- pour permettre les UPSERTS (un candidat peut changer sa réponse avant fin)
do $$ begin
  alter table public.quiz_answers
    add constraint quiz_answers_attempt_question_unique
    unique (attempt_id, question_id);
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

-- 4. Index pour requêtes d'historique (par candidat, ordonné par date)
create index if not exists idx_quiz_attempts_candidate_started
  on public.quiz_attempts(candidate_id, started_at desc);

-- 5. Index pour stats par catégorie
create index if not exists idx_quiz_attempts_candidate_category
  on public.quiz_attempts(candidate_id, category)
  where finished_at is not null;

-- ✅ Migration appliquée. Vérifier les colonnes :
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'quiz_attempts'
order by ordinal_position;
