"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ExamQuestion } from "@/types/auth";

export type SessionEntry = {
  questionIndex: number;
  round: number;
  key: string;
};

type StartMcqSessionOptions = {
  userId: string;
  fileId?: string;
  questions: ExamQuestion[];
  forceNew?: boolean;
};

type SyncMcqSessionOptions = {
  sessionId: string;
  queue: SessionEntry[];
  currentIndex: number;
  currentRound: number;
  answeredQuestions: number;
  totalQuestions: number;
  score: number;
  xpEarned: number;
  bestStreak: number;
  currentStreak: number;
  flaggedCount: number;
  status: "active" | "completed";
};

type RecordMcqAttemptOptions = {
  sessionId: string;
  userId: string;
  questionId: string;
  selectedChoiceId: string;
  isCorrect: boolean;
  roundNumber: number;
  queuePosition: number;
  xpAwarded: number;
};

export function createSessionQueue(questions: ExamQuestion[]): SessionEntry[] {
  return questions.map((_, index) => ({
    questionIndex: index,
    round: 1,
    key: `round-1-${index}`,
  }));
}

async function resolveFolder(fileId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("folders")
    .select("id, study_set_id")
    .eq("id", fileId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not resolve the MCQ folder.");
  }

  return data;
}

export async function startMcqSession({
  userId,
  fileId,
  questions,
  forceNew = false,
}: StartMcqSessionOptions) {
  if (!fileId) {
    throw new Error("A file id is required to start an MCQ session.");
  }

  const supabase = getSupabaseBrowserClient();
  const folder = await resolveFolder(fileId);
  const initialQueue = createSessionQueue(questions);

  if (!forceNew) {
    const { data: existingSession } = await supabase
      .from("mcq_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("folder_id", folder.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSession) {
      return existingSession;
    }
  }

  const { data, error } = await supabase
    .from("mcq_sessions")
    .insert({
      user_id: userId,
      study_set_id: folder.study_set_id,
      folder_id: folder.id,
      total_questions: questions.length,
      answered_questions: 0,
      current_round: 1,
      current_index: 0,
      score: 0,
      xp_earned: 0,
      best_streak: 0,
      current_streak: 0,
      flagged_count: 0,
      status: "active",
      queue: initialQueue,
      round_summary: [],
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not start the MCQ session.");
  }

  return data;
}

export async function syncMcqSessionSnapshot({
  sessionId,
  queue,
  currentIndex,
  currentRound,
  answeredQuestions,
  totalQuestions,
  score,
  xpEarned,
  bestStreak,
  currentStreak,
  flaggedCount,
  status,
}: SyncMcqSessionOptions) {
  const supabase = getSupabaseBrowserClient();
  const payload: Record<string, unknown> = {
    queue,
    current_index: currentIndex,
    current_round: currentRound,
    answered_questions: answeredQuestions,
    total_questions: totalQuestions,
    score,
    xp_earned: xpEarned,
    best_streak: bestStreak,
    current_streak: currentStreak,
    flagged_count: flaggedCount,
    status,
  };

  if (status === "completed") {
    payload.completed_at = new Date().toISOString();
  }

  const { error } = await supabase.from("mcq_sessions").update(payload).eq("id", sessionId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function recordMcqAttempt({
  sessionId,
  userId,
  questionId,
  selectedChoiceId,
  isCorrect,
  roundNumber,
  queuePosition,
  xpAwarded,
}: RecordMcqAttemptOptions) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("mcq_attempts").insert({
    session_id: sessionId,
    question_id: questionId,
    user_id: userId,
    round_number: roundNumber,
    queue_position: queuePosition,
    selected_choice_id: selectedChoiceId,
    is_correct: isCorrect,
    xp_awarded: xpAwarded,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function flagMcqQuestion(sessionId: string, questionId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data: latestAttempt, error: lookupError } = await supabase
    .from("mcq_attempts")
    .select("id")
    .eq("session_id", sessionId)
    .eq("question_id", questionId)
    .order("attempted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (!latestAttempt) {
    return;
  }

  const { error } = await supabase
    .from("mcq_attempts")
    .update({ flagged_bad: true })
    .eq("id", latestAttempt.id);

  if (error) {
    throw new Error(error.message);
  }
}
