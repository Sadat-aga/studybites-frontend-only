"use client";

import type { ExamQuestion } from "@/types/auth";


export type SessionEntry = {
  questionIndex: number;
  round: number;
  key: string;
};

export type SessionAttemptSnapshot = {
  questionId: string;
  topic: string;
  result: "correct" | "incorrect";
  round: number;
};

export type CachedMcqSessionProgress = {
  allQuestionsResult: Array<{ id: string; result?: "correct" | "false" }>;
  answeredQuestions: number;
  attempts: SessionAttemptSnapshot[];
  bestStreak: number;
  currentIndex: number;
  currentRound: number;
  currentStreak: number;
  flaggedCount: number;
  flaggedQuestionIds: string[];
  folderId: string;
  isFetchedRound: boolean;
  isFinishedRound: boolean;
  lastRoundResults: Array<{ id: string; result?: "correct" | "false" }>;
  questionId: string | null;
  queue: SessionEntry[];
  roundSummaryRound: number | null;
  score: number;
  sessionId: string | null;
  status: "active" | "completed";
  studySetId: string | null;
  total: number;
  totalRoundXpPoint: number;
  updatedAt: string;
  xpEarned: number;
};

type PendingPracticeLaunches = Record<string, string>;

type StartMcqSessionOptions = {
  userId: string;
  fileId?: string;
  questions: ExamQuestion[];
  forceNew?: boolean;
  restoreSessionId?: string | null;
};

type StartedMcqSession = {
  id: string;
  studySetId: string | null;
};

type CacheMcqSessionSnapshotOptions = {
  attempts: SessionAttemptSnapshot[];
  answeredQuestions: number;
  bestStreak: number;
  currentIndex: number;
  currentRound: number;
  currentStreak: number;
  fileId: string;
  flaggedCount: number;
  flaggedQuestionIds: string[];
  questionId: string | null;
  questions: ExamQuestion[];
  queue: SessionEntry[];
  roundSummaryRound: number | null;
  score: number;
  sessionId: string | null;
  status: "active" | "completed";
  studySetId: string | null;
  totalQuestions: number;
  xpEarned: number;
};

type SyncMcqSessionOptions = CacheMcqSessionSnapshotOptions & {
  sessionId: string;
};

type RecordMcqAttemptOptions = {
  sessionId: string;
  userId: string;
  questionId: string;
  selectedChoiceId: string | null;
  isCorrect: boolean;
  roundNumber: number;
  queuePosition: number;
  xpAwarded: number;
};

const sessionStore = new Map<string, CachedMcqSessionProgress>();
const PENDING_PRACTICE_LAUNCHES_STORAGE_KEY = new Set<string>();

export function createSessionQueue(questions: ExamQuestion[]): SessionEntry[] {
  return questions.map((_, index) => ({
    questionIndex: index,
    round: 1,
    key: `round-1-${index}`,
  }));
}

function buildQuestionResults(questions: ExamQuestion[], attempts: SessionAttemptSnapshot[]) {
  const latestResultByQuestionId = new Map<string, "correct" | "false">();

  for (const attempt of attempts) {
    latestResultByQuestionId.set(attempt.questionId, attempt.result === "correct" ? "correct" : "false");
  }

  return questions.map((question) => {
    const result = latestResultByQuestionId.get(question.id);
    return result ? { id: question.id, result } : { id: question.id };
  });
}

function buildRoundResults(questions: ExamQuestion[], attempts: SessionAttemptSnapshot[], roundNumber: number) {
  const roundStartIndex = Math.max(0, (roundNumber - 1) * 10);
  return buildQuestionResults(questions.slice(roundStartIndex, roundStartIndex + 10), attempts);
}

function buildCachedProgress(options: CacheMcqSessionSnapshotOptions): CachedMcqSessionProgress {
  return {
    allQuestionsResult: buildQuestionResults(options.questions, options.attempts),
    answeredQuestions: options.answeredQuestions,
    attempts: options.attempts,
    bestStreak: options.bestStreak,
    currentIndex: options.currentIndex,
    currentRound: options.currentRound,
    currentStreak: options.currentStreak,
    flaggedCount: options.flaggedCount,
    flaggedQuestionIds: options.flaggedQuestionIds,
    folderId: options.fileId,
    isFetchedRound: true,
    isFinishedRound: options.roundSummaryRound != null,
    lastRoundResults: buildRoundResults(options.questions, options.attempts, options.currentRound),
    questionId: options.questionId,
    queue: options.queue,
    roundSummaryRound: options.roundSummaryRound,
    score: options.score,
    sessionId: options.sessionId,
    status: options.status,
    studySetId: options.studySetId,
    total: options.totalQuestions,
    totalRoundXpPoint: options.attempts.filter((attempt) => attempt.round === options.currentRound && attempt.result === "correct").length * 10,
    updatedAt: new Date().toISOString(),
    xpEarned: options.xpEarned,
  };
}

export function readCachedMcqSession(fileId?: string, _questions: ExamQuestion[] = []) {
  if (!fileId) {
    return null;
  }

  return sessionStore.get(fileId) ?? null;
}

export function cacheMcqSessionSnapshot(options: CacheMcqSessionSnapshotOptions) {
  sessionStore.set(options.fileId, buildCachedProgress(options));
}

export function clearCachedMcqSession(fileId?: string) {
  if (!fileId) {
    return;
  }

  sessionStore.delete(fileId);
}

export function beginMcqPracticeLaunch(fileId?: string) {
  if (!fileId) {
    return;
  }

  clearCachedMcqSession(fileId);
  PENDING_PRACTICE_LAUNCHES_STORAGE_KEY.add(fileId);
}

export function consumeMcqPracticeLaunch(fileId?: string) {
  if (!fileId) {
    return false;
  }

  if (!PENDING_PRACTICE_LAUNCHES_STORAGE_KEY.has(fileId)) {
    return false;
  }

  PENDING_PRACTICE_LAUNCHES_STORAGE_KEY.delete(fileId);
  return true;
}

export async function startMcqSession({ fileId, questions }: StartMcqSessionOptions): Promise<StartedMcqSession> {
  return {
    id: `mock-session-${fileId ?? crypto.randomUUID()}`,
    studySetId: fileId ? `mock-study-set-${fileId}` : null,
  };
}

export async function syncMcqSessionSnapshot(options: SyncMcqSessionOptions) {
  sessionStore.set(options.sessionId, buildCachedProgress(options));
}

export async function recordMcqAttempt(_options: RecordMcqAttemptOptions) {
  return;
}

export async function flagMcqQuestion(_sessionId: string, _questionId: string) {
  return;
}
