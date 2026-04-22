<!-- backend-bible/05_slice_plan.md -->
# Implementation Slices

## Slice 1: Auth + Profiles

### What to build
- Supabase auth sign in and sign up
- `users` profile row creation on first auth signup
- Session restore on app load
- Protected route gating for `/library` and study routes
- Login form backed by Supabase Auth

### DB tables needed
- `users`

### Files to create
- `supabase/migrations/0001_auth_profiles.sql`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`

### Files to modify in frontend
- `src/lib/auth.ts` - replace mock login helpers with Supabase auth calls
- `src/components/auth-provider.tsx` - hydrate auth state from Supabase session
- `src/components/protected-route.tsx` - redirect anonymous users to `/authenticate`
- `src/components/login-form.tsx` - wire login/signup to real auth responses
- `src/app/authenticate/page.tsx` - preserve current route but use real session state
- `src/app/layout.tsx` - initialize Supabase providers if needed

### How to test
1. Run the auth/profile migration.
2. Create a new user in the app.
3. Confirm a matching row appears in `public.users`.
4. Refresh the page and confirm the session persists.
5. Sign out and confirm protected routes redirect to `/authenticate`.

### Replit Agent prompt
Build the Supabase auth foundation first. Use `backend-bible/01_schema.sql` and `backend-bible/02_rls_policies.sql` as the database contract. Replace the mocked auth layer in `src/lib/auth.ts` and `src/components/auth-provider.tsx` with real Supabase Auth session handling. Keep the existing UI intact, but make `/library` and all study routes redirect when unauthenticated. Create the profile row on signup so `AuthUser` fields are available immediately.

## Slice 2: Document Upload + Folder/Study Set Creation

### What to build
- PDF upload flow
- text extraction for uploaded PDFs
- creation of `study_sets` and `folders`
- storage path management for uploaded documents
- library list loading from real data

### DB tables needed
- `study_sets`
- `folders`
- `users`

### Files to create
- `supabase/migrations/0002_documents_and_storage.sql`
- `supabase/functions/process-document/index.ts`
- `src/lib/supabase/storage.ts`

### Files to modify in frontend
- `src/lib/study-data.ts` - replace mock library document source
- `src/components/studybites-library-page.tsx` - wire upload to `process-document`
- `src/components/studybites-file-page.tsx` - load document by real IDs
- `src/components/studybites-mcq-content-page.tsx` - resolve real study set and folder IDs

### How to test
1. Upload a PDF from `/library`.
2. Confirm a `study_sets` row and matching `folders` row are created.
3. Confirm extracted text is stored in `folders.extracted_text`.
4. Open the library and verify the uploaded document appears.
5. Open the file page and confirm the activity links use the new IDs.

### Replit Agent prompt
Implement the upload and document creation pipeline using `backend-bible/01_schema.sql` and `backend-bible/03_edge_functions.md`. Build the `process-document` edge function, connect it to PDF upload from the library UI, store extracted text in `folders`, and create the matching `study_sets` row. The frontend should stop using fallback IDs and load the actual folder and study set returned by Supabase.

## Slice 3: AI Generation

### What to build
- `generate-flashcards`
- `generate-mcq`
- `generate-summary`
- storage upload for generated summary HTML
- replace mock generation with Groq-backed output

### DB tables needed
- `flashcards`
- `mcq_questions`
- `mcq_answers`
- `summaries`
- `folders`
- `study_sets`

### Files to create
- `supabase/functions/generate-flashcards/index.ts`
- `supabase/functions/generate-mcq/index.ts`
- `supabase/functions/generate-summary/index.ts`
- `supabase/storage/summary-html/.gitkeep`

### Files to modify in frontend
- `src/lib/study-data.ts` - fetch generated content instead of mocks
- `src/components/studybites-file-page.tsx` - call generation functions from recap
- `src/components/studybites-summary-page.tsx` - render real summary state
- `src/components/studybites-flashcards-page.tsx` - load stored flashcards
- `src/components/studybites-exam-page.tsx` - load stored MCQs

### How to test
1. Use a processed document.
2. Trigger each generation function.
3. Confirm rows are inserted into the correct tables.
4. Confirm old generated rows are replaced on regeneration.
5. Open the file, exam, flashcards, and summary pages to verify they render real content.

### Replit Agent prompt
Implement the three Groq-powered generation edge functions using `backend-bible/03_edge_functions.md` as the contract. Make sure the generated JSON matches the frontend mock shapes exactly, then persist the results into `flashcards`, `mcq_questions` plus `mcq_answers`, and `summaries`. The summary function must upload HTML to storage and save the returned URL data so the summary page can render the stored article.

## Slice 4: Study Sessions + Progress Tracking

### What to build
- persisted MCQ session creation and attempt tracking
- persisted flashcard session creation and attempt tracking
- progress counts for files and study sets
- resume session support
- ownership-safe updates to session rows

### DB tables needed
- `mcq_sessions`
- `mcq_attempts`
- `flashcard_sessions`
- `flashcard_attempts`
- `mcq_questions`
- `flashcards`
- `folders`
- `study_sets`

### Files to create
- `supabase/migrations/0004_sessions_and_progress.sql`
- `src/lib/supabase/sessions.ts`

### Files to modify in frontend
- `src/lib/mcq-session.ts` - replace the in-memory cache with Supabase session persistence
- `src/lib/study-data.ts` - source counts and status from the database
- `src/components/studybites-exam-page.tsx` - sync question attempts to the backend
- `src/components/studybites-flashcards-page.tsx` - persist flashcard review actions

### How to test
1. Start an MCQ session and answer several questions.
2. Refresh the page and confirm the session resumes.
3. Start a flashcard session and mark cards mastered/still learning.
4. Confirm attempt rows and session totals update in the database.
5. Verify file-level progress values update on the file page.

### Replit Agent prompt
Build the persistence layer for study sessions. Use the schemas in `backend-bible/01_schema.sql` and the frontend session behavior in `src/lib/mcq-session.ts` plus the flashcard page to mirror the existing local state machine in Supabase. Record each answer attempt, keep the session resumable, and derive progress counts for the library and file pages from the database instead of from mock arrays.

## Slice 5: Integration Pass

### What to build
- replace all synchronous mock hooks with real Supabase queries
- remove mock data fallbacks from study-data hooks
- ensure every route works end-to-end with real data
- add loading and empty states where needed

### DB tables needed
- all tables from `backend-bible/01_schema.sql`

### Files to create
- `src/lib/supabase/queries.ts`
- `src/lib/supabase/types.ts`

### Files to modify in frontend
- `src/lib/study-data.ts`
- `src/lib/auth.ts`
- `src/lib/mcq-session.ts`
- `src/components/auth-provider.tsx`
- `src/components/studybites-library-page.tsx`
- `src/components/studybites-file-page.tsx`
- `src/components/studybites-exam-page.tsx`
- `src/components/studybites-flashcards-page.tsx`
- `src/components/studybites-summary-page.tsx`
- `src/components/studybites-mcq-content-page.tsx`

### How to test
1. Sign in as a real user.
2. Upload a document.
3. Generate MCQs, flashcards, and a summary.
4. Open each route in the app flow from `/library` through the study screens.
5. Confirm the app still works after a hard refresh with no mock data.

### Replit Agent prompt
Finish the migration from mocks to Supabase. Replace every hook in `src/lib/study-data.ts` with real database queries and update every page component to handle loading, empty, and error states from Supabase. Use the contracts in `backend-bible/04_api_contracts.ts` so the UI and backend stay aligned while the app moves fully off `src/lib/mock-study-data.ts`.

