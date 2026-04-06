# Studybites Reverse-Engineered Spec

Generated from:
- API/network log: `studybites-api-log.json`
- Live Playwright exploration of authenticated Studybites routes

Date: 2026-04-06

## Confidence + limits

- The captured log is **not a full HAR**. It contains request lines, request headers, statuses, and some failed asset loads.
- It does **not** contain parsed response bodies, and it does **not** show any request bodies in this capture.
- Because of that, endpoint response schemas below are marked as:
  - `Observed` when directly supported by the log
  - `Inferred` when reconstructed from route names, query params, and visible UI behavior
- Auth conclusions are also partly inferred because the exported request headers did not include raw cookie values.

---

## 1. Unique API / data endpoints

### 1.1 Core app/data endpoints

| Method | Exact URL | Observed status | Request body schema | Response schema |
|---|---|---:|---|---|
| `GET` / `HEAD` | `https://app.studybites.ai/_next/data/JzFTAp1ItRJvGh7mXa5rJ/en/library.json` | `200` | None observed | **Inferred** Next.js route-data payload for the authenticated library/dashboard page. Likely contains current user context, study set list, file cards, progress snippets, UI flags. |
| `GET` | `https://app.studybites.ai/api/geoLocation/getGeoLocation` | `200` | None observed | **Inferred** geolocation payload, likely country/region metadata used for locale, compliance, or default settings. |
| `GET` | `https://app.studybites.ai/buildCheck` | `200`, `307`, `FAILED net::ERR_ABORTED` | None observed | **Inferred** health/build/session gate endpoint used during route transitions. The `307` responses suggest it may participate in redirect or gating logic. |
| `GET` | `https://app.studybites.ai/_next/data/JzFTAp1ItRJvGh7mXa5rJ/en/library/files/6260097.json?file-id=6260097` | `307`, `200` | None observed | **Inferred** file-overview route payload. Likely includes file metadata, activity cards, progress percentages, document row, share/progress rail content. The initial `307` corresponds to redirect into the DOB gate. |
| `GET` / `HEAD` | `https://app.studybites.ai/_next/data/JzFTAp1ItRJvGh7mXa5rJ/en/date-of-birth.json` | `200` | None observed | **Inferred** onboarding gate payload for birth-date confirmation/compliance. |
| `GET` | `https://app.studybites.ai/date-of-birth` | `200` | None observed | HTML route for the DOB gate page. |
| `GET` | `https://app.studybites.ai/_next/data/JzFTAp1ItRJvGh7mXa5rJ/en/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/exam.json?isFileView=&id=cd78ee55-9807-46e5-8352-d863a94d92c9&folder-id=6260097` | `200` | None observed | **Inferred** MCQ/exam route payload. Likely includes session header state, question prompt, answer options, progress counters, topic mastery or round metadata, hint/explanation flags. |
| `GET` | `https://app.studybites.ai/_next/data/JzFTAp1ItRJvGh7mXa5rJ/en/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/learn.json?isFileView=&id=cd78ee55-9807-46e5-8352-d863a94d92c9&folder-id=6260097` | `200` | None observed | **Inferred** flashcards route payload. Likely includes deck/session metadata, current card, progress counts, review state, helper actions. |
| `GET` | `https://app.studybites.ai/_next/data/JzFTAp1ItRJvGh7mXa5rJ/en/library/files/6260097/summary.json?file-id=6260097` | `200` | None observed | **Inferred** summary route payload. Likely includes generated summary content, headings, body blocks, formatting state, and CTA metadata. |
| `GET` | `https://app.studybites.ai/_next/data/JzFTAp1ItRJvGh7mXa5rJ/en/library/files/6260097.json?showRating=true&file-id=6260097` | `200` | None observed | **Inferred** file-overview payload variant after visiting summary. `showRating=true` strongly suggests a rating or post-summary feedback state. |

### 1.2 Supporting static/runtime requests observed

These are not backend business APIs, but they do matter for runtime behavior and product feel.

#### Static CSS
- `https://app.studybites.ai/_next/static/css/d22c78812ae11ed3.css`
- `https://app.studybites.ai/_next/static/css/f0fccd64239e24a9.css`
- `https://app.studybites.ai/_next/static/css/9291fda833a21be3.css`
- `https://app.studybites.ai/_next/static/css/637b05fa415fd1b7.css`

#### Static media / icons
- `https://app.studybites.ai/_next/static/media/globe.327c24ce.svg`
- `https://app.studybites.ai/_next/static/media/more.a962d2f0.svg`
- `https://app.studybites.ai/_next/static/media/bito-scream.83ae0ae6.svg`
- `https://app.studybites.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsaudi-flag.7fec1420.png&w=16&q=75`
- `https://app.studybites.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fus-flag.80acb107.png&w=16&q=75`
- `https://app.studybites.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgerman-flag.5b27275f.png&w=16&q=75`
- `https://app.studybites.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fturkey-flag.fb89bdcd.png&w=16&q=75`
- `https://app.studybites.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fspain-flag.c4a59473.png&w=16&q=75`

#### Sound effects used by the learning flows
- `https://app.studybites.ai/assets/sounds/correct.wav`
- `https://app.studybites.ai/assets/sounds/streak.mp3`
- `https://app.studybites.ai/assets/sounds/finished-round.mp3`
- `https://app.studybites.ai/assets/sounds/rolling.wav`
- `https://app.studybites.ai/assets/sounds/post-round.wav`
- `https://app.studybites.ai/assets/sounds/paper.wav`
- `https://app.studybites.ai/assets/sounds/learning-process-1.wav`
- `https://app.studybites.ai/assets/sounds/learning-process-2.wav`
- `https://app.studybites.ai/assets/sounds/learning-process-3.wav`

These sounds strongly imply deliberate game-loop feedback in MCQ and flashcard sessions.

---

## 2. Auth mechanism

### Observed

- No `Authorization: Bearer ...` header was present in this captured log.
- No Supabase-style `apikey` or `Authorization` pair was present.
- No Firebase token headers were present.
- The main route-data requests are same-origin Next.js requests with `x-nextjs-data: 1`.
- Protected routes were accessible only in an already-authenticated browser session.

### Inference

Studybites is most likely using **browser session cookies** for auth, with authenticated page data fetched through same-origin Next.js route-data endpoints.

Why this is the best inference:
- Requests are same-origin and route-data-based.
- No bearer token or public BaaS auth signature appears in headers.
- Navigation behavior matches classic session/cookie-backed web auth.
- The exported log likely omitted raw cookie headers for safety/noise reasons.

### Best current auth conclusion

**Most likely auth pattern:** cookie/session-based auth on `app.studybites.ai`, with server-rendered or route-data-gated Next.js pages.

**Not observed in this capture:**
- Bearer token auth
- Supabase anon/public key auth
- Firebase client auth headers
- Clerk/Auth0 style explicit auth headers

---

## 3. Inferred database schema (SQL)

This schema is inferred from visible routes, UI flows, query parameters, and learning-state behavior. It is **not** a confirmed production schema dump.

```sql
create table users (
  id uuid primary key,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table user_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  display_name text,
  locale text default 'en',
  date_of_birth date,
  onboarding_dob_completed boolean not null default false,
  streak_count integer not null default 0,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now()
);

create table study_sets (
  id uuid primary key,
  owner_user_id uuid not null references users(id) on delete cascade,
  title text not null,
  slug text,
  description text,
  share_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table study_files (
  id bigint primary key,
  study_set_id uuid not null references study_sets(id) on delete cascade,
  source_filename text,
  display_name text not null,
  page_count integer,
  mime_type text,
  storage_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table library_progress (
  user_id uuid not null references users(id) on delete cascade,
  file_id bigint not null references study_files(id) on delete cascade,
  mcq_progress_percent integer not null default 0,
  flashcards_progress_percent integer not null default 0,
  summary_count integer not null default 0,
  primary key (user_id, file_id)
);

create table mcq_questions (
  id uuid primary key,
  study_set_id uuid not null references study_sets(id) on delete cascade,
  file_id bigint not null references study_files(id) on delete cascade,
  topic text,
  difficulty text,
  prompt text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null,
  source_excerpt text,
  created_at timestamptz not null default now()
);

create table mcq_sessions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  study_set_id uuid not null references study_sets(id) on delete cascade,
  file_id bigint not null references study_files(id) on delete cascade,
  total_questions integer not null,
  current_round integer not null default 1,
  current_index integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  streak_count integer not null default 0,
  flagged_count integer not null default 0,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table mcq_attempts (
  id uuid primary key,
  session_id uuid not null references mcq_sessions(id) on delete cascade,
  question_id uuid not null references mcq_questions(id) on delete cascade,
  round_number integer not null,
  presented_order integer not null,
  selected_option text,
  is_correct boolean not null,
  flagged_bad boolean not null default false,
  attempted_at timestamptz not null default now()
);

create table flashcards (
  id uuid primary key,
  study_set_id uuid not null references study_sets(id) on delete cascade,
  file_id bigint not null references study_files(id) on delete cascade,
  topic text,
  front_text text not null,
  back_text text not null,
  sort_order integer not null default 0
);

create table flashcard_sessions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  study_set_id uuid not null references study_sets(id) on delete cascade,
  file_id bigint not null references study_files(id) on delete cascade,
  total_cards integer not null,
  current_index integer not null default 0,
  mastered_count integer not null default 0,
  still_learning_count integer not null default 0,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table flashcard_reviews (
  id uuid primary key,
  session_id uuid not null references flashcard_sessions(id) on delete cascade,
  flashcard_id uuid not null references flashcards(id) on delete cascade,
  result text not null check (result in ('mastered', 'still_learning', 'try_again')),
  reviewed_at timestamptz not null default now()
);

create table summaries (
  id uuid primary key,
  study_set_id uuid not null references study_sets(id) on delete cascade,
  file_id bigint not null references study_files(id) on delete cascade,
  created_by uuid not null references users(id) on delete cascade,
  language text,
  style text,
  status text not null default 'ready',
  title text,
  body_markdown text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table summary_ratings (
  id uuid primary key,
  summary_id uuid not null references summaries(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  rating smallint,
  feedback text,
  created_at timestamptz not null default now()
);

create table share_links (
  id uuid primary key,
  study_set_id uuid not null references study_sets(id) on delete cascade,
  created_by uuid not null references users(id) on delete cascade,
  token text unique not null,
  created_at timestamptz not null default now()
);
```

### Tables likely present but **not strongly evidenced** by this capture

- `subscriptions`
- `usage_quotas`
- `billing_customers`
- `mind_maps`

Those are plausible because the UI contains `Upgrade` and `Mind Maps`, but they were not exposed in this network slice.

---

## 4. Routes visited and functional mapping

| Route | Functional meaning |
|---|---|
| `/en` | Public landing/auth entry area. |
| `/en/library` | Authenticated dashboard/library page. Lists study sets and file cards. |
| `/en/date-of-birth` | Mandatory DOB/onboarding gate shown before deeper study access. |
| `/en/library/files/6260097` | File overview / learning-activities page for one study file. Shows MCQs, Flashcards, Summaries, Mind Maps, progress rail, and share panel. |
| `/en/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/exam?isFileView` | MCQ/exam session for the file. |
| `/en/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/learn?isFileView` | Flashcards session for the same study set/file. |
| `/en/library/files/6260097/summary` | Summary output/editor view for the file. |
| `/en/library/files/6260097?showRating=true` | File page variant shown after summary view; likely prompts rating/feedback for the summary experience. |

### Functional mapping between routes

- `Library` -> open file -> `File overview`
- `File overview` -> `Practice` -> `Exam`
- `Exam` -> completion/round summary -> can switch into `Flashcards`
- `File overview` -> `Memorize` -> `Flashcards`
- `File overview` -> `Recap` -> `Summary`
- `Summary` -> back to file view, sometimes with `showRating=true`

---

## 5. Third-party services detected

### Confirmed from headers/log

#### Sentry
Observed repeatedly in `baggage` and `sentry-trace` headers:

- `sentry-environment=production`
- `sentry-public_key=d5954eeef71145bdb929079c6a53b0bd`
- `sentry-org_id=4503932970467328`

Conclusion:
- Studybites is using **Sentry** for tracing/error monitoring in production.

### Not detected in this capture

- Stripe
- OpenAI
- Anthropic
- Segment
- PostHog
- Mixpanel
- Supabase
- Firebase

That does **not** prove they are absent from the product; only that they were not exposed in this particular network export.

---

## 6. Business rules observed

### 6.1 DOB gate before protected study flow

- Opening the study set/file route initially returned a redirect path into the DOB flow.
- `GET /en/library/files/6260097.json?file-id=6260097` returned `307`.
- The browser then loaded `/en/date-of-birth`.

**Observed rule:** users may need to complete date-of-birth onboarding before accessing deeper study content.

### 6.2 Authenticated study routes are protected

- Library/file/exam/learn/summary routes behaved like authenticated product routes.
- Access relied on an already logged-in browser session.

**Observed rule:** the main learning routes are gated behind auth/session state.

### 6.3 MCQ flow is round-based and gamified

Observed in the live UI:
- Question counter like `x / 40`
- Streak feedback
- Distinct correct-answer feedback
- Exit warning that mentions losing streak
- Round-summary state with:
  - `Total XP`
  - `Your Score`
  - `Remaining`
  - `Mastery by Topic`
  - continuation CTAs

**Observed rule:** MCQs are not a flat quiz. They are a staged, round-based learning session with progress, streak, and post-round review.

### 6.4 Wrong-answer review / remediation exists

Observed in the UI and flow behavior:
- Round summaries mention remaining content and continued rounds.
- The product experience suggests missed content returns later in the session.

**Inferred rule:** incorrectly answered MCQs likely reappear in later rounds or remediation passes.

### 6.5 Flashcards are also session-based

Observed in the live UI:
- Dedicated `learn` route
- Per-card progression
- Review helpers (`Explain`, `Source`, `Undo`, etc.)

**Observed rule:** flashcards are tracked as a session, not just a static card list.

### 6.6 Summaries can trigger a post-summary feedback state

Observed in the network:
- After visiting summary, file data was requested with `showRating=true`

**Inferred rule:** the product likely asks the user to rate or react to generated summary output.

### 6.7 Mind Maps are feature-gated or not yet enabled

Observed in the file overview UI:
- `Mind Maps` surface exists but presents as `Coming Soon`

**Observed rule:** the feature is surfaced in the product but not fully available for this file/account state.

### 6.8 Product relies on audiovisual reinforcement

Observed in assets:
- `correct.wav`
- `streak.mp3`
- `finished-round.mp3`
- learning-process sounds

**Observed rule:** Studybites uses sound feedback as part of the learning loop, especially for MCQ/round progression.

### 6.9 Quotas / free-tier limits

**Not directly observed in this capture.**

No explicit numeric free-tier limit, upload limit, token quota, or subscription-enforcement API was present in the log slice provided.

---

## 7. Request patterns worth preserving in a clone/backend rebuild

### Next.js data fetching

Most important product routes are served through:
- `/_next/data/<build-id>/...json`

And route-data requests consistently carry:
- `x-nextjs-data: 1`

This implies a backend/frontend architecture where:
- UI routes are page-oriented
- route-specific payloads are server-resolved
- auth/gating happens at the page-data layer, not only in client JS

### Route transition health checks

`GET /buildCheck` appears repeatedly after route transitions:
- library
- file
- exam
- learn
- summary

This likely acts as one or more of:
- deployment/build mismatch detection
- session validity check
- global app health/runtime gate

---

## 8. Practical backend implications

If rebuilding this app for production, the technical backend needs at least:

- cookie/session-based auth
- user profile onboarding state, especially DOB completion
- study set + file storage
- per-file learning activity generation
- MCQ session state with rounds, streaks, remediation, and topic mastery
- flashcard session state with review outcomes
- summary generation + rating state
- progress aggregation for library/file overview cards
- observability/tracing integration (Sentry or equivalent)

---

## 9. Short conclusion

From this capture, Studybites appears to be:
- a Next.js app using route-data JSON endpoints
- protected by browser-session auth
- instrumented with Sentry
- structured around study sets and files
- powered by multiple learning modes: MCQs, flashcards, summaries, and future mind maps
- gated by DOB onboarding before deeper study access
- designed around session progression, progress percentages, streak mechanics, and post-study feedback

The biggest unknowns left are:
- exact response bodies for each route-data endpoint
- the true auth/session implementation details
- billing/subscription internals
- the full mutation API surface, which was not captured in this log
