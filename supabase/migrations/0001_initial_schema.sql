-- =====================================================
-- Auto-école Platform — Schéma initial
-- Multi-tenant ready dès J1 (clé school_id partout).
-- À exécuter dans Supabase > SQL Editor.
-- =====================================================

-- Extension pour générer des UUID
create extension if not exists "pgcrypto";

-- =====================================================
-- 1. driving_schools — les auto-écoles (1 ligne en V1)
-- =====================================================
create table public.driving_schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  slug text unique not null,
  phone text,
  whatsapp text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- 2. profiles — profils utilisateurs (lié à auth.users)
-- =====================================================
create type public.user_role as enum ('candidate', 'instructor', 'school_admin', 'super_admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.driving_schools(id) on delete set null,
  role public.user_role not null default 'candidate',
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_school on public.profiles(school_id);

-- =====================================================
-- 3. questions — banque de QCM
-- Pour l'instant globales (school_id null = visible par toutes les écoles).
-- Plus tard on pourra ajouter des questions custom par école.
-- =====================================================
create type public.question_category as enum (
  'panneaux',
  'priorites',
  'signalisation',
  'conduite',
  'mecanique',
  'secourisme',
  'reglementation',
  'autres'
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.driving_schools(id) on delete cascade, -- null = globale
  category public.question_category not null,
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  text text not null,
  image_url text,
  explanation text,
  created_at timestamptz not null default now()
);

create index idx_questions_category on public.questions(category);
create index idx_questions_school on public.questions(school_id);

-- =====================================================
-- 4. answer_options — options de réponse pour chaque question
-- =====================================================
create table public.answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  text text not null,
  is_correct boolean not null default false,
  position smallint not null default 0
);

create index idx_answer_options_question on public.answer_options(question_id);

-- =====================================================
-- 5. quiz_attempts — sessions de QCM passées par les candidats
-- =====================================================
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid references public.driving_schools(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score smallint, -- nombre de bonnes réponses
  total_questions smallint not null,
  category public.question_category, -- null = mix
  created_at timestamptz not null default now()
);

create index idx_quiz_attempts_candidate on public.quiz_attempts(candidate_id);

-- =====================================================
-- 6. quiz_answers — réponses individuelles dans une session
-- =====================================================
create table public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option_id uuid references public.answer_options(id) on delete set null,
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);

create index idx_quiz_answers_attempt on public.quiz_answers(attempt_id);

-- =====================================================
-- TRIGGERS — auto-update updated_at
-- =====================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_driving_schools_updated_at
  before update on public.driving_schools
  for each row execute function public.set_updated_at();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =====================================================
-- TRIGGER — création automatique du profile à l'inscription
-- =====================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, school_id, role, full_name, phone)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'school_id')::uuid,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'candidate'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- driving_schools : lecture publique (vitrine), écriture admin
alter table public.driving_schools enable row level security;

create policy "driving_schools readable by all"
  on public.driving_schools for select
  using (true);

-- profiles : un user voit son profil et celui des autres de sa school
alter table public.profiles enable row level security;

create policy "profiles select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id);

-- questions : lecture pour tous les users authentifiés
alter table public.questions enable row level security;

create policy "questions readable by authenticated"
  on public.questions for select
  to authenticated
  using (true);

-- answer_options : idem
alter table public.answer_options enable row level security;

create policy "answer_options readable by authenticated"
  on public.answer_options for select
  to authenticated
  using (true);

-- quiz_attempts : un candidat ne voit que ses tentatives
alter table public.quiz_attempts enable row level security;

create policy "quiz_attempts select own"
  on public.quiz_attempts for select
  using (auth.uid() = candidate_id);

create policy "quiz_attempts insert own"
  on public.quiz_attempts for insert
  with check (auth.uid() = candidate_id);

create policy "quiz_attempts update own"
  on public.quiz_attempts for update
  using (auth.uid() = candidate_id);

-- quiz_answers : un candidat ne voit que ses réponses
alter table public.quiz_answers enable row level security;

create policy "quiz_answers select own"
  on public.quiz_answers for select
  using (
    exists (
      select 1 from public.quiz_attempts qa
      where qa.id = attempt_id and qa.candidate_id = auth.uid()
    )
  );

create policy "quiz_answers insert own"
  on public.quiz_answers for insert
  with check (
    exists (
      select 1 from public.quiz_attempts qa
      where qa.id = attempt_id and qa.candidate_id = auth.uid()
    )
  );

-- =====================================================
-- SEED — Auto-école Larbi (à adapter)
-- =====================================================
insert into public.driving_schools (name, city, slug, phone, whatsapp, email, address)
values (
  'Auto-école Larbi',
  'Alger',
  'larbi-alger',
  '+213 555 00 00 00',
  '+213555000000',
  'contact@autoecole-larbi.dz',
  'Alger Centre, Algérie'
)
on conflict (slug) do nothing;

-- Affichage de l'ID pour le mettre dans .env.local
select id as school_id, name from public.driving_schools where slug = 'larbi-alger';
