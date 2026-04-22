"use client";

import { useState } from "react";
import {
  MOCK_EXAM_QUESTIONS,
  MOCK_FILE_ACTIVITIES,
  MOCK_FILE_PROGRESS,
  MOCK_FLASHCARDS,
  MOCK_LIBRARY_DOCUMENT,
  MOCK_MCQ_CONTENT_ITEMS,
  MOCK_MCQ_CONTENT_STATS,
  MOCK_SUMMARY_RESULT,
} from "@/lib/mock-study-data";
import type {
  DocumentSummary,
  ExamQuestion,
  FileActivity,
  FileProgressMetric,
  Flashcard,
  LibraryDocument,
  McqContentItem,
  McqContentStat,
} from "@/types/auth";

export const DEFAULT_LIBRARY_DOCUMENT: LibraryDocument = MOCK_LIBRARY_DOCUMENT;
export const DEFAULT_FILE_ACTIVITIES: FileActivity[] = MOCK_FILE_ACTIVITIES;
export const DEFAULT_FILE_PROGRESS: FileProgressMetric[] = MOCK_FILE_PROGRESS;
export const DEFAULT_SUMMARY_RESULT: DocumentSummary = MOCK_SUMMARY_RESULT;
export const DEFAULT_MCQ_CONTENT_STATS: McqContentStat[] = MOCK_MCQ_CONTENT_STATS;
export type LoadState = "loading" | "ready" | "empty" | "error";

export function useLibraryDocuments(_userId?: string) {
  return [MOCK_LIBRARY_DOCUMENT];
}

export function useFilePageData(fileId?: string, _userId?: string) {
  const document = {
    ...MOCK_LIBRARY_DOCUMENT,
    id: fileId ?? MOCK_LIBRARY_DOCUMENT.id,
    studySetId: MOCK_LIBRARY_DOCUMENT.studySetId,
  };

  return {
    document,
    activities: MOCK_FILE_ACTIVITIES,
    progress: MOCK_FILE_PROGRESS,
    status: "ready" as LoadState,
    errorMessage: null as string | null,
  };
}

export function useExamQuestions(_fileId?: string, _userId?: string) {
  return {
    questions: MOCK_EXAM_QUESTIONS,
    status: "ready" as LoadState,
    errorMessage: null as string | null,
  };
}

export function useFlashcardsDeck(_fileId?: string, _userId?: string) {
  return {
    cards: MOCK_FLASHCARDS,
    status: "ready" as LoadState,
    errorMessage: null as string | null,
  };
}

export function useSummaryResult(fileId?: string, _userId?: string) {
  const [phase, setPhase] = useState<"generating" | "ready">("ready");
  const summary: DocumentSummary = {
    ...MOCK_SUMMARY_RESULT,
    title: fileId ? MOCK_SUMMARY_RESULT.title : MOCK_SUMMARY_RESULT.title,
  };

  return {
    summary,
    phase,
    setPhase,
  };
}

export function saveMcqContentItem(
  _fileId: string | undefined,
  _userId: string | undefined,
  item: McqContentItem,
) {
  return Promise.resolve(item);
}

export function useMcqContentData(fileId?: string, _userId?: string) {
  const [items, setItems] = useState<McqContentItem[]>(MOCK_MCQ_CONTENT_ITEMS);
  const document = {
    ...MOCK_LIBRARY_DOCUMENT,
    id: fileId ?? MOCK_LIBRARY_DOCUMENT.id,
  };

  return {
    document,
    progress: MOCK_FILE_PROGRESS,
    items,
    stats: MOCK_MCQ_CONTENT_STATS,
    setItems,
    status: "ready" as LoadState,
    errorMessage: null as string | null,
  };
}
