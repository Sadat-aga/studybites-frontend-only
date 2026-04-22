<!-- backend-bible/03_edge_functions.md -->
# Supabase Edge Functions

## Function: process-document

### Trigger
POST /functions/v1/process-document

### Auth
Requires Bearer JWT. Return 401 if missing.

### Request body
```json
{
  "file": "(multipart file upload)",
  "existing_folder_id": "optional-text-folder-id",
  "study_set_id": "optional-uuid",
  "title": "optional-title"
}
```

### Step by step
1. Validate JWT
2. Read the uploaded PDF file from the request
3. Extract text and page count using the Deno runtime helper
4. Create or update `study_sets` and `folders`
5. Store the extracted text and file metadata in `folders`
6. Return the created IDs and extracted payload

### Groq response shape expected
None. This function does not call Groq.

### Error cases
401 - missing auth
403 - folder or study set not owned by user
422 - file extraction failed or unsupported file
500 - DB error

### Response
```json
{
  "success": true,
  "data": {
    "studySetId": "uuid",
    "folderId": "text",
    "storagePath": "string",
    "fileName": "string",
    "publicUrl": "string",
    "extractedText": "string"
  },
  "error": null
}
```

## Function: generate-flashcards

### Trigger
POST /functions/v1/generate-flashcards

### Auth
Requires Bearer JWT. Return 401 if missing.

### Request body
```json
{
  "study_set_id": "uuid",
  "document_text": "string"
}
```

### Step by step
1. Validate JWT
2. Verify `study_set` belongs to user
3. Call Groq API:
   Model: llama-3.3-70b-versatile
   System prompt: "You are generating high-quality study flashcards for StudyBites. Return JSON only with a top-level object named flashcards. Each flashcard must include front, back, source, explanation, mnemonic, and example. Use concise, factual wording. Create exactly 6 flashcards unless the input is too short, in which case create the maximum number of distinct high-signal flashcards available. Do not include markdown, commentary, or code fences. Keep the language consistent with the source document."
4. Parse and validate response
5. Delete existing flashcards for this `study_set_id`
6. Insert new flashcards
7. Return `{ success: true, count: number }`

### Groq response shape expected
```json
{
  "flashcards": [
    {
      "front": "string",
      "back": "string",
      "source": "string",
      "explanation": "string",
      "mnemonic": "string",
      "example": "string"
    }
  ]
}
```

### Error cases
401 - missing auth
403 - `study_set` not owned by user
422 - Groq response unparseable
500 - DB error

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "front": "string",
      "back": "string",
      "source": "string",
      "explanation": "string",
      "mnemonic": "string",
      "example": "string"
    }
  ],
  "error": null
}
```

## Function: generate-mcq

### Trigger
POST /functions/v1/generate-mcq

### Auth
Requires Bearer JWT. Return 401 if missing.

### Request body
```json
{
  "study_set_id": "uuid",
  "document_text": "string"
}
```

### Step by step
1. Validate JWT
2. Verify `study_set` belongs to user
3. Call Groq API:
   Model: llama-3.3-70b-versatile
   System prompt: "You are generating MCQ exam content for StudyBites. Return JSON only with a top-level object named questions. Generate exactly 10 questions unless the document is too short. Each question must include id, title, current, total, topic, difficulty, prompt, choices, hint, source, correctChoiceId, assistantTopic, explanationBullets, wrongChoiceContrast, correctReflection, takeaway, and followUpPrompt. Choices must always contain exactly four objects with ids a, b, c, d and short labels. Make current zero-based and total equal to the total question count. Use difficulty values Easy, Medium, or Hard. Do not include markdown, commentary, or code fences. The JSON must be directly insertable into the database after mapping choices to mcq_answers."
4. Parse and validate response
5. Delete existing `mcq_answers` and `mcq_questions` for this `study_set_id`
6. Insert new questions and answer rows
7. Return `{ success: true, count: number }`

### Groq response shape expected
```json
{
  "questions": [
    {
      "id": "string",
      "title": "string",
      "current": 0,
      "total": 10,
      "topic": "string",
      "difficulty": "Easy",
      "prompt": "string",
      "choices": [
        { "id": "a", "label": "string" },
        { "id": "b", "label": "string" },
        { "id": "c", "label": "string" },
        { "id": "d", "label": "string" }
      ],
      "hint": "string",
      "source": "string",
      "correctChoiceId": "a",
      "assistantTopic": "string",
      "explanationBullets": ["string"],
      "wrongChoiceContrast": "string",
      "correctReflection": "string",
      "takeaway": "string",
      "followUpPrompt": "string"
    }
  ]
}
```

### Error cases
401 - missing auth
403 - `study_set` not owned by user
422 - Groq response unparseable
500 - DB error

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "current": 0,
      "total": 10,
      "topic": "string",
      "difficulty": "Easy",
      "prompt": "string",
      "choices": [
        { "id": "a", "label": "string" },
        { "id": "b", "label": "string" },
        { "id": "c", "label": "string" },
        { "id": "d", "label": "string" }
      ],
      "hint": "string",
      "source": "string",
      "correctChoiceId": "a",
      "assistantTopic": "string",
      "explanationBullets": ["string"],
      "wrongChoiceContrast": "string",
      "correctReflection": "string",
      "takeaway": "string",
      "followUpPrompt": "string"
    }
  ],
  "error": null
}
```

## Function: generate-summary

### Trigger
POST /functions/v1/generate-summary

### Auth
Requires Bearer JWT. Return 401 if missing.

### Request body
```json
{
  "study_set_id": "uuid",
  "document_text": "string"
}
```

### Step by step
1. Validate JWT
2. Verify `study_set` belongs to user
3. Call Groq API:
   Model: llama-3.3-70b-versatile
   System prompt: "You are generating a study summary for StudyBites. Return JSON only with a top-level object named summary. Include title, readTime, language, style, overview, keyPoints, sections, and html. style must be either Quick and concise or Detailed and in-depth. keyPoints must be a string array. sections must be an array of objects with title and body. html must be valid, clean HTML suitable for rendering inside an article tag. Do not include markdown, commentary, or code fences. Keep the summary faithful to the source document and concise enough for a study app."
4. Parse and validate response
5. Delete existing summaries for this `study_set_id`
6. Insert the new summary row
7. Upload the HTML to Supabase Storage and store the signed URL path

### Groq response shape expected
```json
{
  "summary": {
    "title": "string",
    "readTime": "string",
    "language": "string",
    "style": "Quick and concise",
    "overview": "string",
    "keyPoints": ["string"],
    "sections": [
      { "title": "string", "body": "string" }
    ],
    "html": "<h2>...</h2>"
  }
}
```

### Error cases
401 - missing auth
403 - `study_set` not owned by user
422 - Groq response unparseable
500 - DB error

### Response
```json
{
  "success": true,
  "data": {
    "title": "string",
    "readTime": "string",
    "language": "string",
    "style": "Detailed and in-depth",
    "overview": "string",
    "keyPoints": ["string"],
    "sections": [
      { "title": "string", "body": "string" }
    ],
    "html": "<h2>...</h2>",
    "signedUrl": "string"
  },
  "error": null
}
```

