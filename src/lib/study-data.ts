"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  DocumentSummary,
  ExamChoice,
  ExamQuestion,
  FileActivity,
  FileProgressMetric,
  Flashcard,
  LibraryDocument,
  McqContentItem,
  McqContentStat,
  McqStatus,
  SummarySection,
} from "@/types/auth";

const FALLBACK_STUDY_SET_ID = "cd78ee55-9807-46e5-8352-d863a94d92c9";
const FALLBACK_FOLDER_ID = "6260097";

export const DEFAULT_LIBRARY_DOCUMENT: LibraryDocument = {
  id: FALLBACK_FOLDER_ID,
  name: "Pride and Prejudice Literary Analysis",
  slug: "pride-and-prejudice-jane-austen,1",
  icon: "📚",
  pageCount: 515,
  questionCount: 40,
};

export const DEFAULT_FILE_ACTIVITIES: FileActivity[] = [
  {
    title: "MCQs",
    description: "0 Questions",
    ctaLabel: "Practice",
    accent: "gradient",
    href: `/library/study-set/${FALLBACK_STUDY_SET_ID}/folder/${FALLBACK_FOLDER_ID}/exam`,
  },
  {
    title: "Flashcards",
    description: "0 Flashcards",
    ctaLabel: "Memorize",
    href: `/library/study-set/${FALLBACK_STUDY_SET_ID}/folder/${FALLBACK_FOLDER_ID}/learn`,
  },
  {
    title: "Summaries",
    description: "0 Summaries",
    ctaLabel: "Recap",
    href: `/library/files/${FALLBACK_FOLDER_ID}/summary`,
  },
  {
    title: "Mind Maps",
    description: "",
    ctaLabel: "Coming Soon",
  },
];

export const DEFAULT_FILE_PROGRESS: FileProgressMetric[] = [
  { label: "MCQs", value: "0%", tone: "indigo" },
  { label: "Flashcards", value: "0%", tone: "blue" },
];

export const DEFAULT_SUMMARY_RESULT: DocumentSummary = {
  title: DEFAULT_LIBRARY_DOCUMENT.slug,
  readTime: "0 min read",
  language: "English",
  style: "Quick and concise",
  overview: "A generated summary will appear here after the document has been processed.",
  keyPoints: ["Summary content has not been generated yet."],
  sections: [],
};

export const DEFAULT_MCQ_CONTENT_STATS: McqContentStat[] = [
  { label: "Remaining", value: 0 },
  { label: "Still Learning", value: 0 },
  { label: "Mastered", value: 0 },
  { label: "All", value: 0 },
];

type RelatedStudySet = {
  id?: string;
  title?: string | null;
  emoji?: string | null;
  total_pages?: number | null;
  mcq_progress_percent?: number | null;
  flashcards_progress_percent?: number | null;
};

type FolderRow = {
  id: string;
  study_set_id: string;
  owner_user_id?: string;
  title: string;
  source_filename?: string | null;
  page_count?: number | null;
  metadata?: Record<string, unknown> | null;
  study_set?: RelatedStudySet | RelatedStudySet[] | null;
};

type McqQuestionRow = {
  id: string;
  topic?: string | null;
  difficulty?: string | null;
  prompt: string;
  choices?: ExamChoice[] | null;
  correct_choice_id: string;
  source_excerpt?: string | null;
  explanation?: string | null;
};

type FlashcardRow = {
  id: string;
  front_text: string;
  back_text: string;
  source_excerpt?: string | null;
  explanation?: string | null;
  metadata?: Record<string, unknown> | null;
};

type SummaryRow = {
  id: string;
  title: string;
  language?: string | null;
  content_text?: string | null;
  content_html?: string | null;
  format?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type McqAttemptRow = {
  question_id: string;
  is_correct: boolean;
  attempted_at?: string | null;
};

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

async function safeCount(
  table: string,
  column: string,
  value: string,
) {
  const supabase = getSupabaseBrowserClient();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, value);

  return count ?? 0;
}

async function fetchFolderRow(fileId?: string, userId?: string) {
  const supabase = getSupabaseBrowserClient();
  const select =
    "id, study_set_id, owner_user_id, title, source_filename, page_count, metadata, study_set:study_sets(id, title, emoji, total_pages, mcq_progress_percent, flashcards_progress_percent)";

  if (fileId) {
    const direct = await supabase.from("folders").select(select).eq("id", fileId).maybeSingle();
    if (direct.data) {
      return direct.data as unknown as FolderRow;
    }
  }

  if (userId) {
    const fallback = await supabase
      .from("folders")
      .select(select)
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallback.data) {
      return fallback.data as unknown as FolderRow;
    }
  }

  return null;
}

function mapFolderToLibraryDocument(folder: FolderRow, questionCount: number): LibraryDocument {
  const studySet = relationOne(folder.study_set);

  return {
    id: folder.id,
    name: studySet?.title ?? folder.title ?? DEFAULT_LIBRARY_DOCUMENT.name,
    slug: folder.title ?? folder.source_filename ?? DEFAULT_LIBRARY_DOCUMENT.slug,
    icon: studySet?.emoji ?? DEFAULT_LIBRARY_DOCUMENT.icon,
    pageCount: folder.page_count ?? studySet?.total_pages ?? DEFAULT_LIBRARY_DOCUMENT.pageCount,
    questionCount,
  };
}

function normalizeDifficulty(value?: string | null): "Easy" | "Medium" | "Hard" {
  const normalized = (value ?? "easy").toLowerCase();
  if (normalized === "hard") return "Hard";
  if (normalized === "medium") return "Medium";
  return "Easy";
}

function mapQuestionRow(row: McqQuestionRow, index: number, total: number): ExamQuestion {
  const choices = Array.isArray(row.choices) && row.choices.length > 0
    ? row.choices
    : [
        { id: "a", label: "Choice A" },
        { id: "b", label: "Choice B" },
        { id: "c", label: "Choice C" },
        { id: "d", label: "Choice D" },
      ];

  return {
    id: row.id,
    title: DEFAULT_LIBRARY_DOCUMENT.name,
    current: index,
    total,
    topic: row.topic ?? "General",
    difficulty: normalizeDifficulty(row.difficulty),
    prompt: row.prompt,
    choices,
    hint: row.explanation ?? "Review the question carefully and focus on the strongest textual clue.",
    source: row.source_excerpt ?? "No source excerpt saved yet.",
    correctChoiceId: row.correct_choice_id,
    assistantTopic: row.topic ?? "this concept",
    explanationBullets: row.explanation ? [row.explanation] : ["Explanation has not been generated yet."],
    wrongChoiceContrast: row.explanation ?? "This option does not match the saved correct answer.",
    correctReflection: "Correct answer saved in the MCQ table.",
    takeaway: row.explanation ?? "Use the saved explanation to review this concept.",
    followUpPrompt: `How does ${row.topic ?? "this topic"} connect to the rest of the document?`,
  };
}

function mapFlashcardRow(row: FlashcardRow): Flashcard {
  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    front: row.front_text,
    back: row.back_text,
    source: row.source_excerpt ?? "No source excerpt saved yet.",
    explanation:
      typeof metadata.explanation === "string"
        ? metadata.explanation
        : row.explanation ?? "No explanation saved yet.",
    mnemonic:
      typeof metadata.mnemonic === "string"
        ? metadata.mnemonic
        : "No mnemonic saved yet.",
    example:
      typeof metadata.example === "string"
        ? metadata.example
        : "No example saved yet.",
  };
}

function htmlToSections(contentHtml?: string | null, contentText?: string | null): SummarySection[] {
  if (contentText) {
    return contentText
      .split(/\n{2,}/)
      .map((block, index) => ({
        title: index === 0 ? "Overview" : `Section ${index + 1}`,
        body: block.trim(),
      }))
      .filter((section) => section.body.length > 0);
  }

  if (!contentHtml) {
    return [];
  }

  return contentHtml
    .split(/<h2[^>]*>|<h3[^>]*>/i)
    .map((part) => part.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((part, index) => ({
      title: index === 0 ? "Summary" : `Section ${index}`,
      body: part,
    }));
}

function buildSummary(row: SummaryRow | null, folderTitle: string): DocumentSummary {
  if (!row) {
    return {
      ...DEFAULT_SUMMARY_RESULT,
      title: folderTitle,
    };
  }

  const sections = htmlToSections(row.content_html, row.content_text);
  const overview = sections[0]?.body ?? row.content_text ?? DEFAULT_SUMMARY_RESULT.overview;

  return {
    title: folderTitle,
    readTime: `${Math.max(1, Math.ceil((row.content_text ?? "").split(/\s+/).filter(Boolean).length / 180))} min read`,
    language: row.language ?? "English",
    style: "Detailed and in-depth",
    overview,
    keyPoints: sections.slice(0, 5).map((section) => section.title).filter(Boolean),
    sections,
  };
}

function deriveMcqStatus(questionId: string, attempts: McqAttemptRow[]): McqStatus {
  const latestAttempt = attempts
    .filter((attempt) => attempt.question_id === questionId)
    .sort((left, right) => Date.parse(right.attempted_at ?? "") - Date.parse(left.attempted_at ?? ""))[0];

  if (!latestAttempt) return "Remaining";
  return latestAttempt.is_correct ? "Mastered" : "Still Learning";
}

export function useLibraryDocuments(userId?: string) {
  const [documents, setDocuments] = useState<LibraryDocument[]>([DEFAULT_LIBRARY_DOCUMENT]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!userId) {
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("folders")
        .select(
          "id, study_set_id, owner_user_id, title, source_filename, page_count, metadata, study_set:study_sets(id, title, emoji, total_pages)"
        )
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false });

      if (!active || !data || data.length === 0) {
        return;
      }

      const mapped = await Promise.all(
        (data as unknown as FolderRow[]).map(async (folder) => {
          const questionCount = await safeCount("mcq_questions", "folder_id", folder.id);
          return mapFolderToLibraryDocument(folder, questionCount);
        }),
      );

      if (active && mapped.length > 0) {
        setDocuments(mapped);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [userId]);

  return documents;
}

export function useFilePageData(fileId?: string, userId?: string) {
  const [document, setDocument] = useState<LibraryDocument>(DEFAULT_LIBRARY_DOCUMENT);
  const [activities, setActivities] = useState<FileActivity[]>(DEFAULT_FILE_ACTIVITIES);
  const [progress, setProgress] = useState<FileProgressMetric[]>(DEFAULT_FILE_PROGRESS);

  useEffect(() => {
    let active = true;

    async function load() {
      const folder = await fetchFolderRow(fileId, userId);
      if (!folder) {
        return;
      }

      const mcqCount = await safeCount("mcq_questions", "folder_id", folder.id);
      const flashcardCount = await safeCount("flashcards", "folder_id", folder.id);
      const summaryCount = await safeCount("summaries", "folder_id", folder.id);
      const mappedDocument = mapFolderToLibraryDocument(folder, mcqCount);
      const studySetId = folder.study_set_id || FALLBACK_STUDY_SET_ID;
      const folderId = folder.id;

      if (active) {
        setDocument(mappedDocument);
        setActivities([
          {
            title: "MCQs",
            description: `${mcqCount} Questions`,
            ctaLabel: "Practice",
            accent: "gradient",
            href: `/library/study-set/${studySetId}/folder/${folderId}/exam`,
          },
          {
            title: "Flashcards",
            description: `${flashcardCount} Flashcards`,
            ctaLabel: "Memorize",
            href: `/library/study-set/${studySetId}/folder/${folderId}/learn`,
          },
          {
            title: "Summaries",
            description: `${summaryCount} Summary${summaryCount === 1 ? "" : "ies"}`,
            ctaLabel: "Recap",
            href: `/library/files/${folderId}/summary`,
          },
          {
            title: "Mind Maps",
            description: "",
            ctaLabel: "Coming Soon",
          },
        ]);
      }

      if (!userId) {
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const [{ data: mcqSession }, { data: flashcardSession }] = await Promise.all([
        supabase
          .from("mcq_sessions")
          .select("answered_questions, total_questions")
          .eq("user_id", userId)
          .eq("folder_id", folderId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("flashcard_sessions")
          .select("mastered_count, total_cards")
          .eq("user_id", userId)
          .eq("folder_id", folderId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const studySet = relationOne(folder.study_set);
      const mcqPercent = mcqSession?.total_questions
        ? Math.round((mcqSession.answered_questions / mcqSession.total_questions) * 100)
        : studySet?.mcq_progress_percent ?? 0;
      const flashcardPercent = flashcardSession?.total_cards
        ? Math.round((flashcardSession.mastered_count / flashcardSession.total_cards) * 100)
        : studySet?.flashcards_progress_percent ?? 0;

      if (active) {
        setProgress([
          { label: "MCQs", value: `${mcqPercent}%`, tone: "indigo" },
          { label: "Flashcards", value: `${flashcardPercent}%`, tone: "blue" },
        ]);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [fileId, userId]);

  return { document, activities, progress };
}

export function useExamQuestions(fileId?: string) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const folder = await fetchFolderRow(fileId);
      if (!folder) {
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("mcq_questions")
        .select("id, topic, difficulty, prompt, choices, correct_choice_id, source_excerpt, explanation")
        .eq("folder_id", folder.id)
        .order("sort_order", { ascending: true });

      const rows = (data as unknown as McqQuestionRow[] | null) ?? [];
      const nextQuestions = rows.map((row, index) => mapQuestionRow(row, index, rows.length));

      if (active && nextQuestions.length > 0) {
        setQuestions(nextQuestions);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [fileId]);

  return questions;
}

export function useFlashcardsDeck(fileId?: string) {
  const [cards, setCards] = useState<Flashcard[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const folder = await fetchFolderRow(fileId);
      if (!folder) {
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("flashcards")
        .select("id, front_text, back_text, source_excerpt, explanation, metadata")
        .eq("folder_id", folder.id)
        .order("sort_order", { ascending: true });

      const nextCards = ((data as unknown as FlashcardRow[] | null) ?? []).map(mapFlashcardRow);
      if (active && nextCards.length > 0) {
        setCards(nextCards);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [fileId]);

  return cards;
}

export function useSummaryResult(fileId?: string) {
  const [summary, setSummary] = useState<DocumentSummary>(DEFAULT_SUMMARY_RESULT);
  const [phase, setPhase] = useState<"generating" | "ready">("generating");

  useEffect(() => {
    let active = true;

    async function load() {
      const folder = await fetchFolderRow(fileId);
      if (!folder) {
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("summaries")
        .select("id, title, language, content_text, content_html, format, status, created_at")
        .eq("folder_id", folder.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) {
        return;
      }

      const nextSummary = buildSummary((data as unknown as SummaryRow | null) ?? null, folder.title);
      setSummary(nextSummary);
      setPhase(data && (data as SummaryRow).status === "ready" ? "ready" : data ? "ready" : "generating");
    }

    void load();

    return () => {
      active = false;
    };
  }, [fileId]);

  return { summary, phase, setPhase };
}

export async function saveMcqContentItem(
  fileId: string | undefined,
  userId: string | undefined,
  item: McqContentItem,
) {
  if (!userId) {
    return item;
  }

  const folder = await fetchFolderRow(fileId, userId);
  if (!folder) {
    return item;
  }

  const supabase = getSupabaseBrowserClient();
  const payload = {
    id: item.id.startsWith("custom-") ? undefined : item.id,
    study_set_id: folder.study_set_id,
    folder_id: folder.id,
    owner_user_id: userId,
    topic: item.tag,
    difficulty: item.difficulty.toLowerCase(),
    prompt: item.question,
    choices: [
      { id: "a", label: item.answer },
      { id: "b", label: "Alternative 1" },
      { id: "c", label: "Alternative 2" },
      { id: "d", label: "Alternative 3" },
    ],
    correct_choice_id: "a",
    explanation: item.answer,
    source_excerpt: item.answer,
  };

  const { data } = await supabase
    .from("mcq_questions")
    .upsert(payload)
    .select("id, topic, difficulty, prompt, choices, correct_choice_id, source_excerpt, explanation")
    .maybeSingle();

  const row = data as unknown as McqQuestionRow | null;

  if (!row) {
    return item;
  }

  return {
    id: row.id,
    question: row.prompt,
    answer: row.explanation ?? item.answer,
    tag: row.topic ?? item.tag,
    difficulty: normalizeDifficulty(row.difficulty),
    status: item.status,
  };
}

export function useMcqContentData(fileId?: string, userId?: string) {
  const [document, setDocument] = useState<LibraryDocument>(DEFAULT_LIBRARY_DOCUMENT);
  const [progress, setProgress] = useState<FileProgressMetric[]>(DEFAULT_FILE_PROGRESS);
  const [items, setItems] = useState<McqContentItem[]>([]);
  const [stats, setStats] = useState<McqContentStat[]>([
    { label: "Remaining", value: 0 },
    { label: "Still Learning", value: 0 },
    { label: "Mastered", value: 0 },
    { label: "All", value: 0 },
  ]);

  useEffect(() => {
    let active = true;

    async function load() {
      const folder = await fetchFolderRow(fileId, userId);
      if (!folder) {
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const [questionResponse, attemptResponse] = await Promise.all([
        supabase
          .from("mcq_questions")
          .select("id, topic, difficulty, prompt, choices, correct_choice_id, source_excerpt, explanation")
          .eq("folder_id", folder.id)
          .order("sort_order", { ascending: true }),
        userId
          ? supabase
              .from("mcq_attempts")
              .select("question_id, is_correct, attempted_at")
              .eq("user_id", userId)
          : Promise.resolve({ data: [] }),
      ]);

      const rows = (questionResponse.data as unknown as McqQuestionRow[] | null) ?? [];
      const attempts = (attemptResponse.data as unknown as McqAttemptRow[] | null) ?? [];
      const questionCount = rows.length;
      const mappedDocument = mapFolderToLibraryDocument(folder, questionCount);
      const mappedItems = rows.map((row) => ({
        id: row.id,
        question: row.prompt,
        answer: row.explanation ?? relationOne(row.choices)?.label ?? "",
        tag: row.topic ?? "General",
        difficulty: normalizeDifficulty(row.difficulty),
        status: deriveMcqStatus(row.id, attempts),
      }));

      const mastered = mappedItems.filter((item) => item.status === "Mastered").length;
      const stillLearning = mappedItems.filter((item) => item.status === "Still Learning").length;
      const remaining = mappedItems.filter((item) => item.status === "Remaining").length;

      if (active) {
        setDocument(mappedDocument);
        setItems(mappedItems);
        setStats([
          { label: "Remaining", value: remaining },
          { label: "Still Learning", value: stillLearning },
          { label: "Mastered", value: mastered },
          { label: "All", value: mappedItems.length },
        ]);
        setProgress([
          {
            label: "MCQs",
            value: mappedItems.length === 0 ? "0%" : `${Math.round((mastered / mappedItems.length) * 100)}%`,
            tone: "indigo",
          },
          { label: "Flashcards", value: "0%", tone: "blue" },
        ]);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [fileId, userId]);

  return {
    document,
    progress,
    items,
    stats,
    setItems,
  };
}
