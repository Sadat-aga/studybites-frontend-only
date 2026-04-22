-- backend-bible/01_schema.sql
begin;

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    display_name,
    avatar_url,
    locale,
    date_of_birth,
    onboarding_dob_completed,
    streak_count,
    last_activity_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    'en',
    null,
    false,
    0,
    null
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(excluded.display_name, public.users.display_name),
      avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
      updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_folder_owner(target_folder_id text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.folders f
    where f.id = target_folder_id
      and f.owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_study_set_owner(target_study_set_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.study_sets s
    where s.id = target_study_set_id
      and s.owner_user_id = auth.uid()
  );
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  locale text not null default 'en',
  date_of_birth date,
  onboarding_dob_completed boolean not null default false,
  streak_count integer not null default 0,
  last_activity_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger touch_users_updated_at
before update on public.users
for each row execute function public.touch_updated_at();

create table if not exists public.study_sets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text,
  emoji text not null default '📚',
  flashcards_progress_percent integer not null default 0,
  mcq_progress_percent integer not null default 0,
  summary_count integer not null default 0,
  total_pages integer not null default 0,
  slug text,
  source text not null default 'upload',
  status text not null default 'active',
  visibility text not null default 'private',
  share_token text unique,
  last_opened_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists study_sets_owner_user_id_idx on public.study_sets (owner_user_id);
create index if not exists study_sets_slug_idx on public.study_sets (slug);
create trigger touch_study_sets_updated_at
before update on public.study_sets
for each row execute function public.touch_updated_at();

create table if not exists public.folders (
  id text primary key,
  owner_user_id uuid not null references public.users (id) on delete cascade,
  study_set_id uuid not null unique references public.study_sets (id) on delete cascade,
  title text not null,
  page_count integer not null default 0,
  source_filename text,
  source_url text,
  storage_bucket text not null default 'documents',
  storage_path text,
  mime_type text,
  processing_status text not null default 'pending',
  summary_status text not null default 'pending',
  extracted_text text,
  processed_html text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists folders_owner_user_id_idx on public.folders (owner_user_id);
create index if not exists folders_study_set_id_idx on public.folders (study_set_id);
create trigger touch_folders_updated_at
before update on public.folders
for each row execute function public.touch_updated_at();

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id text not null references public.folders (id) on delete cascade,
  heading text,
  front_text text not null,
  back_text text not null,
  content text,
  source_excerpt text,
  explanation text,
  difficulty text,
  topic text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists flashcards_owner_user_id_idx on public.flashcards (owner_user_id);
create index if not exists flashcards_folder_id_idx on public.flashcards (folder_id);
create index if not exists flashcards_study_set_id_idx on public.flashcards (study_set_id);
create trigger touch_flashcards_updated_at
before update on public.flashcards
for each row execute function public.touch_updated_at();

create table if not exists public.mcq_questions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id text not null references public.folders (id) on delete cascade,
  question_text text,
  prompt text not null,
  correct_choice_id text not null,
  choices jsonb not null default '[]'::jsonb,
  source_excerpt text,
  explanation text,
  topic text,
  difficulty text not null,
  sort_order integer not null default 0,
  xp_reward integer not null default 10,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists mcq_questions_owner_user_id_idx on public.mcq_questions (owner_user_id);
create index if not exists mcq_questions_folder_id_idx on public.mcq_questions (folder_id);
create index if not exists mcq_questions_study_set_id_idx on public.mcq_questions (study_set_id);
create trigger touch_mcq_questions_updated_at
before update on public.mcq_questions
for each row execute function public.touch_updated_at();

create table if not exists public.mcq_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.mcq_questions (id) on delete cascade,
  text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists mcq_answers_question_id_idx on public.mcq_answers (question_id);
create trigger touch_mcq_answers_updated_at
before update on public.mcq_answers
for each row execute function public.touch_updated_at();

create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id text not null references public.folders (id) on delete cascade,
  title text not null,
  language text not null default 'English',
  format text not null default 'html',
  status text not null default 'generating',
  content_text text,
  content_html text,
  html_storage_path text,
  storage_url text,
  ai_model text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists summaries_user_id_idx on public.summaries (user_id);
create index if not exists summaries_folder_id_idx on public.summaries (folder_id);
create index if not exists summaries_study_set_id_idx on public.summaries (study_set_id);
create trigger touch_summaries_updated_at
before update on public.summaries
for each row execute function public.touch_updated_at();

create table if not exists public.mcq_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id text not null references public.folders (id) on delete cascade,
  answered_questions integer not null default 0,
  best_streak integer not null default 0,
  completed_at timestamptz,
  current_index integer not null default 0,
  current_round integer not null default 1,
  current_streak integer not null default 0,
  flagged_count integer not null default 0,
  queue jsonb not null default '[]'::jsonb,
  round_summary jsonb not null default '[]'::jsonb,
  score integer not null default 0,
  status text not null default 'active',
  total_questions integer not null default 0,
  xp_earned integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists mcq_sessions_user_id_idx on public.mcq_sessions (user_id);
create index if not exists mcq_sessions_folder_id_idx on public.mcq_sessions (folder_id);
create index if not exists mcq_sessions_study_set_id_idx on public.mcq_sessions (study_set_id);
create trigger touch_mcq_sessions_updated_at
before update on public.mcq_sessions
for each row execute function public.touch_updated_at();

create table if not exists public.mcq_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  session_id uuid not null references public.mcq_sessions (id) on delete cascade,
  question_id uuid not null references public.mcq_questions (id) on delete cascade,
  selected_choice_id text,
  is_correct boolean not null,
  queue_position integer not null default 0,
  round_number integer not null default 1,
  xp_awarded integer not null default 0,
  flagged_bad boolean not null default false,
  attempted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists mcq_attempts_user_id_idx on public.mcq_attempts (user_id);
create index if not exists mcq_attempts_session_id_idx on public.mcq_attempts (session_id);
create index if not exists mcq_attempts_question_id_idx on public.mcq_attempts (question_id);
create trigger touch_mcq_attempts_updated_at
before update on public.mcq_attempts
for each row execute function public.touch_updated_at();

create table if not exists public.flashcard_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id text not null references public.folders (id) on delete cascade,
  current_index integer not null default 0,
  mastered_count integer not null default 0,
  still_learning_count integer not null default 0,
  total_cards integer not null default 0,
  status text not null default 'active',
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists flashcard_sessions_user_id_idx on public.flashcard_sessions (user_id);
create index if not exists flashcard_sessions_folder_id_idx on public.flashcard_sessions (folder_id);
create index if not exists flashcard_sessions_study_set_id_idx on public.flashcard_sessions (study_set_id);
create trigger touch_flashcard_sessions_updated_at
before update on public.flashcard_sessions
for each row execute function public.touch_updated_at();

create table if not exists public.flashcard_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  session_id uuid not null references public.flashcard_sessions (id) on delete cascade,
  flashcard_id uuid not null references public.flashcards (id) on delete cascade,
  result text not null,
  attempt_order integer not null default 0,
  attempted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists flashcard_attempts_user_id_idx on public.flashcard_attempts (user_id);
create index if not exists flashcard_attempts_session_id_idx on public.flashcard_attempts (session_id);
create index if not exists flashcard_attempts_flashcard_id_idx on public.flashcard_attempts (flashcard_id);
create trigger touch_flashcard_attempts_updated_at
before update on public.flashcard_attempts
for each row execute function public.touch_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.study_sets enable row level security;
alter table public.folders enable row level security;
alter table public.flashcards enable row level security;
alter table public.mcq_questions enable row level security;
alter table public.mcq_answers enable row level security;
alter table public.summaries enable row level security;
alter table public.mcq_sessions enable row level security;
alter table public.mcq_attempts enable row level security;
alter table public.flashcard_sessions enable row level security;
alter table public.flashcard_attempts enable row level security;

commit;

