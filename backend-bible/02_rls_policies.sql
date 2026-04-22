-- backend-bible/02_rls_policies.sql

-- TABLE: users
-- POLICY: select own users row
create policy "users can select own user row"
on public.users for select
using (auth.uid() = id);

-- POLICY: insert own users row
create policy "users can insert own user row"
on public.users for insert
with check (auth.uid() = id);

-- POLICY: update own users row
create policy "users can update own user row"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- POLICY: delete own users row
create policy "users can delete own user row"
on public.users for delete
using (auth.uid() = id);

-- TABLE: study_sets
-- POLICY: select own study sets
create policy "users can select own study sets"
on public.study_sets for select
using (auth.uid() = owner_user_id);

-- POLICY: insert own study sets
create policy "users can insert own study sets"
on public.study_sets for insert
with check (auth.uid() = owner_user_id);

-- POLICY: update own study sets
create policy "users can update own study sets"
on public.study_sets for update
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

-- POLICY: delete own study sets
create policy "users can delete own study sets"
on public.study_sets for delete
using (auth.uid() = owner_user_id);

-- TABLE: folders
-- POLICY: select own folders
create policy "users can select own folders"
on public.folders for select
using (auth.uid() = owner_user_id);

-- POLICY: insert own folders
create policy "users can insert own folders"
on public.folders for insert
with check (auth.uid() = owner_user_id);

-- POLICY: update own folders
create policy "users can update own folders"
on public.folders for update
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

-- POLICY: delete own folders
create policy "users can delete own folders"
on public.folders for delete
using (auth.uid() = owner_user_id);

-- TABLE: flashcards
-- POLICY: select own flashcards
create policy "users can select own flashcards"
on public.flashcards for select
using (auth.uid() = owner_user_id);

-- POLICY: insert own flashcards
create policy "users can insert own flashcards"
on public.flashcards for insert
with check (auth.uid() = owner_user_id);

-- POLICY: update own flashcards
create policy "users can update own flashcards"
on public.flashcards for update
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

-- POLICY: delete own flashcards
create policy "users can delete own flashcards"
on public.flashcards for delete
using (auth.uid() = owner_user_id);

-- TABLE: mcq_questions
-- POLICY: select own mcq questions
create policy "users can select own mcq questions"
on public.mcq_questions for select
using (auth.uid() = owner_user_id);

-- POLICY: insert own mcq questions
create policy "users can insert own mcq questions"
on public.mcq_questions for insert
with check (auth.uid() = owner_user_id);

-- POLICY: update own mcq questions
create policy "users can update own mcq questions"
on public.mcq_questions for update
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

-- POLICY: delete own mcq questions
create policy "users can delete own mcq questions"
on public.mcq_questions for delete
using (auth.uid() = owner_user_id);

-- TABLE: mcq_answers
-- POLICY: select answers for own questions
create policy "users can select own mcq answers"
on public.mcq_answers for select
using (
  exists (
    select 1
    from public.mcq_questions q
    where q.id = mcq_answers.question_id
      and q.owner_user_id = auth.uid()
  )
);

-- POLICY: insert answers for own questions
create policy "users can insert own mcq answers"
on public.mcq_answers for insert
with check (
  exists (
    select 1
    from public.mcq_questions q
    where q.id = mcq_answers.question_id
      and q.owner_user_id = auth.uid()
  )
);

-- POLICY: update answers for own questions
create policy "users can update own mcq answers"
on public.mcq_answers for update
using (
  exists (
    select 1
    from public.mcq_questions q
    where q.id = mcq_answers.question_id
      and q.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.mcq_questions q
    where q.id = mcq_answers.question_id
      and q.owner_user_id = auth.uid()
  )
);

-- POLICY: delete answers for own questions
create policy "users can delete own mcq answers"
on public.mcq_answers for delete
using (
  exists (
    select 1
    from public.mcq_questions q
    where q.id = mcq_answers.question_id
      and q.owner_user_id = auth.uid()
  )
);

-- TABLE: summaries
-- POLICY: select own summaries
create policy "users can select own summaries"
on public.summaries for select
using (auth.uid() = user_id);

-- POLICY: insert own summaries
create policy "users can insert own summaries"
on public.summaries for insert
with check (auth.uid() = user_id);

-- POLICY: update own summaries
create policy "users can update own summaries"
on public.summaries for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- POLICY: delete own summaries
create policy "users can delete own summaries"
on public.summaries for delete
using (auth.uid() = user_id);

-- TABLE: mcq_sessions
-- POLICY: select own mcq sessions
create policy "users can select own mcq sessions"
on public.mcq_sessions for select
using (auth.uid() = user_id);

-- POLICY: insert own mcq sessions
create policy "users can insert own mcq sessions"
on public.mcq_sessions for insert
with check (auth.uid() = user_id);

-- POLICY: update own mcq sessions
create policy "users can update own mcq sessions"
on public.mcq_sessions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- POLICY: delete own mcq sessions
create policy "users can delete own mcq sessions"
on public.mcq_sessions for delete
using (auth.uid() = user_id);

-- TABLE: mcq_attempts
-- POLICY: select own mcq attempts
create policy "users can select own mcq attempts"
on public.mcq_attempts for select
using (auth.uid() = user_id);

-- POLICY: insert own mcq attempts
create policy "users can insert own mcq attempts"
on public.mcq_attempts for insert
with check (auth.uid() = user_id);

-- POLICY: update own mcq attempts
create policy "users can update own mcq attempts"
on public.mcq_attempts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- POLICY: delete own mcq attempts
create policy "users can delete own mcq attempts"
on public.mcq_attempts for delete
using (auth.uid() = user_id);

-- TABLE: flashcard_sessions
-- POLICY: select own flashcard sessions
create policy "users can select own flashcard sessions"
on public.flashcard_sessions for select
using (auth.uid() = user_id);

-- POLICY: insert own flashcard sessions
create policy "users can insert own flashcard sessions"
on public.flashcard_sessions for insert
with check (auth.uid() = user_id);

-- POLICY: update own flashcard sessions
create policy "users can update own flashcard sessions"
on public.flashcard_sessions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- POLICY: delete own flashcard sessions
create policy "users can delete own flashcard sessions"
on public.flashcard_sessions for delete
using (auth.uid() = user_id);

-- TABLE: flashcard_attempts
-- POLICY: select own flashcard attempts
create policy "users can select own flashcard attempts"
on public.flashcard_attempts for select
using (auth.uid() = user_id);

-- POLICY: insert own flashcard attempts
create policy "users can insert own flashcard attempts"
on public.flashcard_attempts for insert
with check (auth.uid() = user_id);

-- POLICY: update own flashcard attempts
create policy "users can update own flashcard attempts"
on public.flashcard_attempts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- POLICY: delete own flashcard attempts
create policy "users can delete own flashcard attempts"
on public.flashcard_attempts for delete
using (auth.uid() = user_id);

