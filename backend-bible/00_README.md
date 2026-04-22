<!-- backend-bible/00_README.md -->
# StudyBites Backend Bible

## What this is
This folder is the backend build spec for StudyBites. It translates the current mocked Next.js frontend into a Supabase-backed system that Replit Agent can implement without rereading the frontend source.

## Current frontend state
- Mock data source: `src/lib/mock-study-data.ts`
- All hooks in `src/lib/study-data.ts` return mock data synchronously
- Auth is mocked in `src/components/auth-provider.tsx`
- No Supabase imports anywhere in `src/`

## Implementation order
1. Slice 1 - Auth
2. Slice 2 - Upload
3. Slice 3 - Generation
4. Slice 4 - Progress
5. Slice 5 - Integration

## Environment variables needed
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Edge functions use `Deno.env` automatically.

## Supabase project
Project ref: `ywbqltvtgtukizumvnzv`

Link command:
`npx supabase link --project-ref ywbqltvtgtukizumvnzv`

## Deploy edge functions
`npx supabase functions deploy process-document`
`npx supabase functions deploy generate-flashcards`
`npx supabase functions deploy generate-mcq`
`npx supabase functions deploy generate-summary`

## Run migrations
`npx supabase db push`

## Key mapping: mock data -> real data
| Mock constant | Real source |
|---|---|
| `MOCK_LIBRARY_DOCUMENT` | `folders` row joined to `study_sets` |
| `MOCK_FILE_ACTIVITIES` | derived from `study_sets` counts |
| `MOCK_EXAM_QUESTIONS` | `mcq_questions` + `mcq_answers` |
| `MOCK_FLASHCARDS` | `flashcards` table |
| `MOCK_SUMMARY_RESULT` | `summaries` table |
| `MOCK_MCQ_CONTENT_ITEMS` | `mcq_questions` plus session state |
| `FALLBACK_FOLDER_ID` | real `folders.id` after upload |
| `FALLBACK_STUDY_SET_ID` | real `study_sets.id` after upload |

