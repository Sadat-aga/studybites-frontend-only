// backend-bible/04_api_contracts.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================
// BASE TYPES - copied from src/types/auth.ts
// ============================================================

export type LoginFormValues = {
  email: string;
  password: string;
};

export type SupabaseSessionUser = {
  id: string;
  email: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  locale: string;
  date_of_birth: string | null;
  onboarding_dob_completed: boolean;
  streak_count: number;
  name: string;
  avatarUrl: string | null;
};

export type DashboardStat = {
  label: string;
  value: string;
  trend: string;
};

export type LibraryDocument = {
  id: string;
  studySetId: string;
  name: string;
  slug: string;
  icon: string;
  pageCount: number;
  questionCount: number;
  flashcardCount: number;
  summaryCount: number;
  mcqProgressPercent: number;
  flashcardsProgressPercent: number;
};

export type FileActivity = {
  title: string;
  description: string;
  ctaLabel: string;
  accent?: "gradient" | "default";
  href?: string;
};

export type FileProgressMetric = {
  label: string;
  value: string;
  tone: "indigo" | "blue";
};

export type ExamChoice = {
  id: string;
  label: string;
};

export type ExamQuestion = {
  id: string;
  title: string;
  current: number;
  total: number;
  topic: string;
  difficulty: string;
  prompt: string;
  choices: ExamChoice[];
  hint: string;
  source: string;
  correctChoiceId: string;
  assistantTopic: string;
  explanationBullets: string[];
  wrongChoiceContrast: string;
  correctReflection: string;
  takeaway: string;
  followUpPrompt: string;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  source: string;
  explanation: string;
  mnemonic: string;
  example: string;
};

export type SummarySection = {
  title: string;
  body: string;
};

export type DocumentSummary = {
  title: string;
  readTime: string;
  language: string;
  style: "Quick and concise" | "Detailed and in-depth";
  overview: string;
  keyPoints: string[];
  sections: SummarySection[];
  html: string;
  signedUrl: string | null;
};

export type McqContentStat = {
  label: string;
  value: number;
};

export type McqStatus = "Remaining" | "Still Learning" | "Mastered";

export type McqContentItem = {
  id: string;
  question: string;
  answer: string;
  tag: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: McqStatus;
};

// ============================================================
// SUPABASE TABLE ROW TYPES
// ============================================================

export type UserRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  locale: string;
  date_of_birth: string | null;
  onboarding_dob_completed: boolean;
  streak_count: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StudySetRow = {
  id: string;
  owner_user_id: string;
  title: string;
  description: string | null;
  emoji: string;
  flashcards_progress_percent: number;
  mcq_progress_percent: number;
  summary_count: number;
  total_pages: number;
  slug: string | null;
  source: string;
  status: string;
  visibility: string;
  share_token: string | null;
  last_opened_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FolderRow = {
  id: string;
  owner_user_id: string;
  study_set_id: string;
  title: string;
  page_count: number;
  source_filename: string | null;
  source_url: string | null;
  storage_bucket: string;
  storage_path: string | null;
  mime_type: string | null;
  processing_status: string;
  summary_status: string;
  extracted_text: string | null;
  processed_html: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

export type FlashcardRow = {
  id: string;
  owner_user_id: string;
  study_set_id: string;
  folder_id: string;
  heading: string | null;
  front_text: string;
  back_text: string;
  content: string | null;
  source_excerpt: string | null;
  explanation: string | null;
  difficulty: string | null;
  topic: string | null;
  sort_order: number;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

export type McqQuestionRow = {
  id: string;
  owner_user_id: string;
  study_set_id: string;
  folder_id: string;
  question_text: string | null;
  prompt: string;
  correct_choice_id: string;
  choices: Json;
  source_excerpt: string | null;
  explanation: string | null;
  topic: string | null;
  difficulty: string;
  sort_order: number;
  xp_reward: number;
  created_at: string;
  updated_at: string;
};

export type McqAnswerRow = {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SummaryRow = {
  id: string;
  user_id: string;
  study_set_id: string;
  folder_id: string;
  title: string;
  language: string;
  format: string;
  status: string;
  content_text: string | null;
  content_html: string | null;
  html_storage_path: string | null;
  storage_url: string | null;
  ai_model: string | null;
  created_at: string;
  updated_at: string;
};

export type McqSessionRow = {
  id: string;
  user_id: string;
  study_set_id: string;
  folder_id: string;
  answered_questions: number;
  best_streak: number;
  completed_at: string | null;
  current_index: number;
  current_round: number;
  current_streak: number;
  flagged_count: number;
  queue: Json;
  round_summary: Json;
  score: number;
  status: string;
  total_questions: number;
  xp_earned: number;
  created_at: string;
  updated_at: string;
};

export type McqAttemptRow = {
  id: string;
  user_id: string;
  session_id: string;
  question_id: string;
  selected_choice_id: string | null;
  is_correct: boolean;
  queue_position: number;
  round_number: number;
  xp_awarded: number;
  flagged_bad: boolean;
  attempted_at: string;
  created_at: string;
  updated_at: string;
};

export type FlashcardSessionRow = {
  id: string;
  user_id: string;
  study_set_id: string;
  folder_id: string;
  current_index: number;
  mastered_count: number;
  still_learning_count: number;
  total_cards: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FlashcardAttemptRow = {
  id: string;
  user_id: string;
  session_id: string;
  flashcard_id: string;
  result: string;
  attempt_order: number;
  attempted_at: string;
  created_at: string;
  updated_at: string;
};

export type DbUser = UserRow;
export type DbStudySet = StudySetRow;
export type DbFolder = FolderRow;
export type DbMcqQuestion = McqQuestionRow;
export type DbMcqAnswer = McqAnswerRow;
export type DbFlashcard = FlashcardRow;
export type DbSummary = SummaryRow;

// ============================================================
// EDGE FUNCTION CONTRACTS
// ============================================================

export type ProcessDocumentRequest = {
  file: File;
  existing_folder_id?: string;
  study_set_id?: string;
  title?: string;
};

export type ProcessDocumentResponse = {
  success: boolean;
  data: {
    studySetId: string;
    folderId: string;
    storagePath: string;
    fileName: string;
    publicUrl: string;
    extractedText: string;
  } | null;
  error?: string;
};

export type GenerateFlashcardsRequest = {
  study_set_id: string;
  document_text: string;
};

export type GenerateFlashcardsResponse = {
  success: boolean;
  data: Flashcard[] | null;
  count?: number;
  error?: string;
};

export type GenerateMcqRequest = {
  study_set_id: string;
  document_text: string;
};

export type GenerateMcqResponse = {
  success: boolean;
  data: ExamQuestion[] | null;
  count?: number;
  error?: string;
};

export type GenerateSummaryRequest = {
  study_set_id: string;
  document_text: string;
};

export type GenerateSummaryResponse = {
  success: boolean;
  data: DocumentSummary | null;
  error?: string;
};

export type McqContentUpsertRequest = {
  file_id: string;
  user_id: string;
  item: McqContentItem;
};

export type McqContentUpsertResponse = {
  success: boolean;
  data: McqContentItem | null;
  error?: string;
};

// ============================================================
// DATA TRANSFORM FUNCTIONS
// ============================================================

export declare const userRowToAuthUser: (row: UserRow) => AuthUser;
export declare const studySetRowToLibraryDocument: (row: StudySetRow, folder: FolderRow, counts: {
  questionCount: number;
  flashcardCount: number;
  summaryCount: number;
}) => LibraryDocument;
export declare const folderRowToLibraryDocument: (row: FolderRow, studySet: StudySetRow, counts: {
  questionCount: number;
  flashcardCount: number;
  summaryCount: number;
}) => LibraryDocument;
export declare const flashcardRowToFlashcard: (row: FlashcardRow) => Flashcard;
export declare const mcqQuestionRowToExamQuestion: (
  row: McqQuestionRow,
  answers: McqAnswerRow[],
  current: number,
  total: number,
) => ExamQuestion;
export declare const summaryRowToDocumentSummary: (row: SummaryRow, signedUrl: string | null) => DocumentSummary;
export declare const mcqQuestionRowsToMcqContentItems: (
  questions: McqQuestionRow[],
  attempts: McqAttemptRow[],
) => McqContentItem[];
export declare const flashcardAttemptRowsToSessionTotals: (
  attempts: FlashcardAttemptRow[],
) => {
  masteredCount: number;
  stillLearningCount: number;
};

