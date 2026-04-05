export type LoginFormValues = {
  email: string;
  password: string;
};

export type AuthUser = {
  email: string;
  name: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  trend: string;
};

export type LibraryDocument = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  pageCount: number;
  questionCount: number;
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
