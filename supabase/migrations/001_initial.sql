create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
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
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.users.display_name),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
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

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  plan_code text not null default 'free',
  plan_name text not null default 'Free',
  status text not null default 'active',
  billing_interval text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  quota_pages integer not null default 20,
  quota_documents_per_day integer not null default 3,
  quota_chat_messages_per_day integer not null default 10,
  quota_explanations_per_day integer not null default 5,
  quota_translations_per_day integer not null default 5,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_sets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  slug text unique,
  description text,
  emoji text not null default '📚',
  status text not null default 'draft',
  visibility text not null default 'private',
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  source text not null default 'manual',
  total_pages integer not null default 0,
  mcq_progress_percent integer not null default 0,
  flashcards_progress_percent integer not null default 0,
  summary_count integer not null default 0,
  last_opened_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  owner_user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  source_filename text,
  storage_bucket text not null default 'documents',
  storage_path text,
  source_url text,
  mime_type text,
  page_count integer not null default 0,
  extracted_text text,
  processed_html text,
  processing_status text not null default 'pending',
  summary_status text not null default 'idle',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id uuid not null references public.folders (id) on delete cascade,
  owner_user_id uuid not null references public.users (id) on delete cascade,
  topic text,
  front_text text not null,
  back_text text not null,
  source_excerpt text,
  explanation text,
  difficulty text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.flashcard_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id uuid not null references public.folders (id) on delete cascade,
  total_cards integer not null default 0,
  current_index integer not null default 0,
  mastered_count integer not null default 0,
  still_learning_count integer not null default 0,
  status text not null default 'active',
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.flashcard_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.flashcard_sessions (id) on delete cascade,
  flashcard_id uuid not null references public.flashcards (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  result text not null check (result in ('mastered', 'still_learning', 'undo')),
  attempt_order integer not null default 0,
  attempted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.mcq_questions (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id uuid not null references public.folders (id) on delete cascade,
  owner_user_id uuid not null references public.users (id) on delete cascade,
  topic text,
  difficulty text not null default 'easy',
  prompt text not null,
  choices jsonb not null default '[]'::jsonb,
  correct_choice_id text not null,
  source_excerpt text,
  explanation text,
  xp_reward integer not null default 10,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.mcq_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id uuid not null references public.folders (id) on delete cascade,
  total_questions integer not null default 0,
  answered_questions integer not null default 0,
  current_round integer not null default 1,
  current_index integer not null default 0,
  score integer not null default 0,
  xp_earned integer not null default 0,
  best_streak integer not null default 0,
  current_streak integer not null default 0,
  flagged_count integer not null default 0,
  status text not null default 'active',
  queue jsonb not null default '[]'::jsonb,
  round_summary jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create table if not exists public.mcq_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mcq_sessions (id) on delete cascade,
  question_id uuid not null references public.mcq_questions (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  round_number integer not null default 1,
  queue_position integer not null default 0,
  selected_choice_id text,
  is_correct boolean not null,
  xp_awarded integer not null default 0,
  flagged_bad boolean not null default false,
  attempted_at timestamptz not null default timezone('utc', now()),
  unique (session_id, question_id, round_number, queue_position)
);

create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  folder_id uuid not null references public.folders (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  status text not null default 'pending',
  language text not null default 'en',
  format text not null default 'html',
  content_text text,
  content_html text,
  storage_url text,
  ai_model text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists users_email_idx on public.users (email);
create index if not exists users_locale_idx on public.users (locale);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create unique index if not exists subscriptions_provider_subscription_id_idx
  on public.subscriptions (provider_subscription_id)
  where provider_subscription_id is not null;

create index if not exists study_sets_owner_user_id_idx on public.study_sets (owner_user_id);
create index if not exists study_sets_slug_idx on public.study_sets (slug);
create index if not exists study_sets_visibility_idx on public.study_sets (visibility);
create index if not exists study_sets_updated_at_idx on public.study_sets (updated_at desc);

create index if not exists folders_study_set_id_idx on public.folders (study_set_id);
create index if not exists folders_owner_user_id_idx on public.folders (owner_user_id);
create index if not exists folders_processing_status_idx on public.folders (processing_status);
create index if not exists folders_summary_status_idx on public.folders (summary_status);

create index if not exists flashcards_study_set_id_idx on public.flashcards (study_set_id);
create index if not exists flashcards_folder_id_idx on public.flashcards (folder_id);
create index if not exists flashcards_owner_user_id_idx on public.flashcards (owner_user_id);
create index if not exists flashcards_sort_order_idx on public.flashcards (sort_order);

create index if not exists flashcard_sessions_user_id_idx on public.flashcard_sessions (user_id);
create index if not exists flashcard_sessions_folder_id_idx on public.flashcard_sessions (folder_id);
create index if not exists flashcard_sessions_status_idx on public.flashcard_sessions (status);

create index if not exists flashcard_attempts_session_id_idx on public.flashcard_attempts (session_id);
create index if not exists flashcard_attempts_flashcard_id_idx on public.flashcard_attempts (flashcard_id);
create index if not exists flashcard_attempts_user_id_idx on public.flashcard_attempts (user_id);

create index if not exists mcq_questions_study_set_id_idx on public.mcq_questions (study_set_id);
create index if not exists mcq_questions_folder_id_idx on public.mcq_questions (folder_id);
create index if not exists mcq_questions_owner_user_id_idx on public.mcq_questions (owner_user_id);
create index if not exists mcq_questions_topic_idx on public.mcq_questions (topic);
create index if not exists mcq_questions_sort_order_idx on public.mcq_questions (sort_order);

create index if not exists mcq_sessions_user_id_idx on public.mcq_sessions (user_id);
create index if not exists mcq_sessions_folder_id_idx on public.mcq_sessions (folder_id);
create index if not exists mcq_sessions_status_idx on public.mcq_sessions (status);

create index if not exists mcq_attempts_session_id_idx on public.mcq_attempts (session_id);
create index if not exists mcq_attempts_question_id_idx on public.mcq_attempts (question_id);
create index if not exists mcq_attempts_user_id_idx on public.mcq_attempts (user_id);
create index if not exists mcq_attempts_round_number_idx on public.mcq_attempts (round_number);
create index if not exists mcq_attempts_is_correct_idx on public.mcq_attempts (is_correct);

create index if not exists summaries_study_set_id_idx on public.summaries (study_set_id);
create index if not exists summaries_folder_id_idx on public.summaries (folder_id);
create index if not exists summaries_user_id_idx on public.summaries (user_id);
create index if not exists summaries_status_idx on public.summaries (status);

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

create trigger study_sets_set_updated_at
before update on public.study_sets
for each row
execute function public.set_updated_at();

create trigger folders_set_updated_at
before update on public.folders
for each row
execute function public.set_updated_at();

create trigger flashcards_set_updated_at
before update on public.flashcards
for each row
execute function public.set_updated_at();

create trigger flashcard_sessions_set_updated_at
before update on public.flashcard_sessions
for each row
execute function public.set_updated_at();

create trigger mcq_questions_set_updated_at
before update on public.mcq_questions
for each row
execute function public.set_updated_at();

create trigger mcq_sessions_set_updated_at
before update on public.mcq_sessions
for each row
execute function public.set_updated_at();

create trigger summaries_set_updated_at
before update on public.summaries
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

create or replace function public.is_study_set_owner(target_study_set_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.study_sets study_set
    where study_set.id = target_study_set_id
      and study_set.owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_folder_owner(target_folder_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.folders folder
    where folder.id = target_folder_id
      and folder.owner_user_id = auth.uid()
  );
$$;

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.study_sets enable row level security;
alter table public.folders enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_sessions enable row level security;
alter table public.flashcard_attempts enable row level security;
alter table public.mcq_questions enable row level security;
alter table public.mcq_sessions enable row level security;
alter table public.mcq_attempts enable row level security;
alter table public.summaries enable row level security;

create policy "users_select_self"
on public.users
for select
using (id = auth.uid());

create policy "users_insert_self"
on public.users
for insert
with check (id = auth.uid());

create policy "users_update_self"
on public.users
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "subscriptions_manage_own"
on public.subscriptions
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "study_sets_manage_own"
on public.study_sets
for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "folders_manage_own"
on public.folders
for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "flashcards_manage_own"
on public.flashcards
for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "flashcard_sessions_manage_own"
on public.flashcard_sessions
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "flashcard_attempts_manage_own"
on public.flashcard_attempts
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "mcq_questions_manage_own"
on public.mcq_questions
for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "mcq_sessions_manage_own"
on public.mcq_sessions
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "mcq_attempts_manage_own"
on public.mcq_attempts
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "summaries_manage_own"
on public.summaries
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
