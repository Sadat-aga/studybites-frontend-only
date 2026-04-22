import type { Tables } from "@/types/database";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type DbUser = Tables<"users">;
export type DbStudySet = Tables<"study_sets">;
export type DbFolder = Tables<"folders">;
export type DbMcqQuestion = Tables<"mcq_questions">;
export type DbMcqAnswer = Tables<"mcq_answers">;
export type DbFlashcard = Tables<"flashcards">;
export type DbSummary = Tables<"summaries">;
export type SupabaseSessionUser = {
  id: string;
  email: string | null;
};

export type AuthUser = Pick<
  DbUser,
  "id" | "email" | "locale" | "date_of_birth" | "onboarding_dob_completed" | "streak_count"
> & {
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
  id: DbFlashcard["id"];
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
