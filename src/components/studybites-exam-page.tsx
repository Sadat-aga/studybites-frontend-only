"use client";

import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  cacheMcqSessionSnapshot,
  clearCachedMcqSession,
  consumeMcqPracticeLaunch,
  createSessionQueue,
  flagMcqQuestion,
  readCachedMcqSession,
  recordMcqAttempt,
  startMcqSession,
  syncMcqSessionSnapshot,
  type SessionEntry,
  type SessionAttemptSnapshot,
} from "@/lib/mcq-session";
import { useExamQuestions } from "@/lib/study-data";
import type { ExamQuestion } from "@/types/auth";
import { cn } from "@/lib/utils";

const progressDots = Array.from({ length: 10 }, (_, index) => index);
const translateOptions = [
  "Automatic (File language)",
  "Arabic (AR)",
  "English (EN)",
  "Turkish (TR)",
];
const badFlashcardReasons = [
  { label: "All answers are wrong", icon: "❌" },
  { label: "More than one correct answer", icon: "✅" },
  { label: "Duplicate question", icon: "📑" },
  { label: "External question", icon: "📖️" },
  { label: "Unhelpful question", icon: "⚠️" },
  { label: "Other", icon: "💬" },
] as const;

type AnswerState = "idle" | "correct" | "incorrect";
type AttemptRecord = SessionAttemptSnapshot;
type SessionResumeSnapshot = {
  currentIndex: number;
  currentRound: number;
  questionId: string | null;
  roundSummaryRound: number | null;
  status: "active" | "completed";
};

const ROUND_SIZE = 10;

function createInitialQueue(questions: ExamQuestion[]): SessionEntry[] {
  return createSessionQueue(questions).map((entry) => ({
    questionIndex: entry.questionIndex,
    round: entry.round,
    key: entry.key,
  }));
}

function getQuestionIdAtPosition(
  queue: SessionEntry[],
  questions: ExamQuestion[],
  position: number,
) {
  const entry = queue[position];
  return entry ? questions[entry.questionIndex]?.id ?? null : null;
}

function buildSessionResumeSnapshot({
  activeEntry,
  answerState,
  answeredCount,
  currentPosition,
  currentRoundNumber,
  question,
  questions,
  queue,
  queueCompleted,
  roundSummaryRound,
}: {
  activeEntry: SessionEntry | null;
  answerState: AnswerState;
  answeredCount: number;
  currentPosition: number;
  currentRoundNumber: number;
  question: ExamQuestion | null;
  questions: ExamQuestion[];
  queue: SessionEntry[];
  queueCompleted: boolean;
  roundSummaryRound: number | null;
}): SessionResumeSnapshot {
  if (roundSummaryRound != null) {
    return {
      currentIndex: currentPosition,
      currentRound: roundSummaryRound,
      questionId: question?.id ?? null,
      roundSummaryRound,
      status: "active",
    };
  }

  if (answerState !== "idle") {
    const answeredRound = activeEntry?.round ?? currentRoundNumber;
    if (answeredCount > 0 && answeredCount % ROUND_SIZE === 0) {
      return {
        currentIndex: currentPosition,
        currentRound: answeredRound,
        questionId: question?.id ?? null,
        roundSummaryRound: Math.ceil(answeredCount / ROUND_SIZE),
        status: "active",
      };
    }

    const nextIndex = currentPosition + 1;
    if (nextIndex < queue.length) {
      return {
        currentIndex: nextIndex,
        currentRound: queue[nextIndex]?.round ?? answeredRound,
        questionId: getQuestionIdAtPosition(queue, questions, nextIndex),
        roundSummaryRound: null,
        status: "active",
      };
    }

    return {
      currentIndex: queue.length,
      currentRound: answeredRound,
      questionId: null,
      roundSummaryRound: null,
      status: "completed",
    };
  }

  if (queueCompleted) {
    return {
      currentIndex: queue.length,
      currentRound: activeEntry?.round ?? currentRoundNumber,
      questionId: null,
      roundSummaryRound: null,
      status: "completed",
    };
  }

  return {
    currentIndex: currentPosition,
    currentRound: activeEntry?.round ?? currentRoundNumber,
    questionId: question?.id ?? getQuestionIdAtPosition(queue, questions, currentPosition),
    roundSummaryRound: null,
    status: "active",
  };
}

export function StudybitesExamPage() {
  const router = useRouter();
  const params = useParams<{ fileId: string }>();
  const { user } = useAuth();
  const {
    questions,
    status: questionsStatus,
    errorMessage: questionsErrorMessage,
  } = useExamQuestions(params?.fileId, user?.id);
  const [queue, setQueue] = useState<SessionEntry[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [roundSummaryRound, setRoundSummaryRound] = useState<number | null>(null);
  const [summaryTopicsExpanded, setSummaryTopicsExpanded] = useState(false);
  const [askBitoOpen, setAskBitoOpen] = useState(false);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [badFlashcardOpen, setBadFlashcardOpen] = useState(false);
  const [badFlashcardReason, setBadFlashcardReason] = useState<string>(badFlashcardReasons[0].label);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [translateLanguage, setTranslateLanguage] = useState(translateOptions[0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [sessionStudySetId, setSessionStudySetId] = useState<string | null>(null);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const filePageHref = params?.fileId ? `/library/files/${params.fileId}` : "/library";

  const activeEntry = queue[currentPosition] ?? null;
  const question = activeEntry ? questions[activeEntry.questionIndex] : null;
  const selectedChoice = question?.choices.find((choice) => choice.id === selectedChoiceId) ?? null;
  const answeredCount = attempts.length;
  const queueCompleted =
    questionsStatus === "ready" && questions.length > 0 && (activeEntry == null || question == null);
  const nextRound = activeEntry ? activeEntry.round + 1 : 2;
  const explanationLabel =
    answerState === "correct"
      ? "Explain why this is the correct answer"
      : "Explain why this is the wrong answer";
  const currentRoundNumber =
    roundSummaryRound ??
    (Math.floor(
      Math.max(answeredCount - (answerState !== "idle" ? 1 : 0), 0) / ROUND_SIZE,
    ) +
      1);
  const currentRoundAttempts = attempts.slice((currentRoundNumber - 1) * ROUND_SIZE, answeredCount);
  const currentProgressIndex = Math.min(progressDots.length - 1, currentRoundAttempts.length);
  const isRepeatQuestion = (activeEntry?.round ?? 1) > 1;
  const roundSummaryAttempts =
    roundSummaryRound == null
      ? []
      : attempts.slice((roundSummaryRound - 1) * ROUND_SIZE, roundSummaryRound * ROUND_SIZE);

  const [isNewPracticeLaunch] = useState(() => consumeMcqPracticeLaunch(params?.fileId));

  useEffect(() => {
    if (questionsStatus !== "ready" || questions.length === 0) {
      return;
    }

    if (isNewPracticeLaunch) {
      clearCachedMcqSession(params?.fileId);
    }

    const cachedSession = isNewPracticeLaunch
      ? null
      : readCachedMcqSession(params?.fileId, questions);
    const initialQueue = createInitialQueue(questions);
    const nextQueue = cachedSession?.queue.length ? cachedSession.queue : initialQueue;
    const nextCurrentPosition =
      nextQueue.length === 0
        ? 0
        : Math.max(0, Math.min(cachedSession?.currentIndex ?? 0, nextQueue.length - 1));

    /* eslint-disable react-hooks/set-state-in-effect */
    setSessionHydrated(false);
    setQueue(nextQueue);
    setCurrentPosition(nextCurrentPosition);
    setSelectedChoiceId(null);
    setAnswerState("idle");
    setAttempts(cachedSession?.attempts ?? []);
    setRoundSummaryRound(cachedSession?.roundSummaryRound ?? null);
    setSummaryTopicsExpanded(false);
    setAskBitoOpen(false);
    setExplanationOpen(false);
    setHintOpen(false);
    setSourceOpen(false);
    setTranslateOpen(false);
    setSettingsOpen(false);
    setBadFlashcardOpen(false);
    setBadFlashcardReason(badFlashcardReasons[0].label);
    setFlaggedQuestionIds(cachedSession?.flaggedQuestionIds ?? []);
    setTranslateLanguage(translateOptions[0]);
    setScore(cachedSession?.score ?? 0);
    setXpEarned(cachedSession?.xpEarned ?? 0);
    setBestStreak(cachedSession?.bestStreak ?? 0);
    setCurrentStreak(cachedSession?.currentStreak ?? 0);
    setSessionId(cachedSession?.sessionId ?? null);
    setSessionStudySetId(cachedSession?.studySetId ?? null);
    setSessionHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const userId = user?.id;
    if (!userId || !params?.fileId) {
      return;
    }

    const sessionUserId = userId;
    let cancelled = false;
    async function createSession() {
      try {
        const nextSession = await startMcqSession({
          userId: sessionUserId,
          fileId: params.fileId,
          questions,
          forceNew: isNewPracticeLaunch,
          restoreSessionId: isNewPracticeLaunch ? null : cachedSession?.sessionId ?? null,
        });
        if (!cancelled) {
          setSessionId(nextSession.id);
          setSessionStudySetId(nextSession.studySetId);
        }
      } catch (error) {
        if (!cancelled) {
          setNotice(error instanceof Error ? error.message : "Could not start the MCQ session.");
        }
      }
    }

    void createSession();

    return () => {
      cancelled = true;
    };
  }, [params?.fileId, questions, questionsStatus, user?.id]);

  useEffect(() => {
    if (!sessionHydrated || questionsStatus !== "ready" || !questions.length || !params?.fileId) {
      return;
    }

    const resumeSnapshot = buildSessionResumeSnapshot({
      activeEntry,
      answerState,
      answeredCount: attempts.length,
      currentPosition,
      currentRoundNumber,
      question,
      questions,
      queue,
      queueCompleted,
      roundSummaryRound,
    });

    cacheMcqSessionSnapshot({
      attempts,
      answeredQuestions: attempts.length,
      bestStreak,
      currentIndex: resumeSnapshot.currentIndex,
      currentRound: resumeSnapshot.currentRound,
      currentStreak,
      fileId: params.fileId,
      flaggedCount: flaggedQuestionIds.length,
      flaggedQuestionIds,
      questionId: resumeSnapshot.questionId,
      questions,
      queue,
      roundSummaryRound: resumeSnapshot.roundSummaryRound,
      score,
      sessionId,
      status: resumeSnapshot.status,
      studySetId: sessionStudySetId,
      totalQuestions: questions.length,
      xpEarned,
    });
  }, [
    activeEntry,
    answerState,
    attempts,
    bestStreak,
    currentPosition,
    currentRoundNumber,
    currentStreak,
    flaggedQuestionIds,
    params?.fileId,
    question,
    queue,
    queueCompleted,
    questions,
    roundSummaryRound,
    score,
    sessionId,
    sessionHydrated,
    sessionStudySetId,
    questionsStatus,
    xpEarned,
  ]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    if (
      !sessionHydrated ||
      questionsStatus !== "ready" ||
      !sessionId ||
      !questions.length ||
      !params?.fileId ||
      !user?.id
    ) {
      return;
    }

    const resumeSnapshot = buildSessionResumeSnapshot({
      activeEntry,
      answerState,
      answeredCount: attempts.length,
      currentPosition,
      currentRoundNumber,
      question,
      questions,
      queue,
      queueCompleted,
      roundSummaryRound,
    });

    void syncMcqSessionSnapshot({
      attempts,
      answeredQuestions: attempts.length,
      bestStreak,
      currentIndex: resumeSnapshot.currentIndex,
      currentRound: resumeSnapshot.currentRound,
      currentStreak,
      fileId: params.fileId,
      flaggedCount: flaggedQuestionIds.length,
      flaggedQuestionIds,
      questionId: resumeSnapshot.questionId,
      questions,
      queue,
      roundSummaryRound: resumeSnapshot.roundSummaryRound,
      score,
      sessionId,
      status: resumeSnapshot.status,
      studySetId: sessionStudySetId,
      totalQuestions: questions.length,
      xpEarned,
    }).catch((error) => {
      setNotice(error instanceof Error ? error.message : "Could not sync the MCQ session.");
    });
  }, [
    activeEntry,
    answerState,
    attempts,
    bestStreak,
    currentPosition,
    currentRoundNumber,
    currentStreak,
    flaggedQuestionIds,
    params?.fileId,
    question,
    queue,
    queueCompleted,
    questions,
    roundSummaryRound,
    score,
    sessionHydrated,
    sessionId,
    sessionStudySetId,
    questionsStatus,
    user?.id,
    xpEarned,
  ]);

  function resetQuestionUi({ keepSettingsOpen = false }: { keepSettingsOpen?: boolean } = {}) {
    setSelectedChoiceId(null);
    setAnswerState("idle");
    setExplanationOpen(false);
    setHintOpen(false);
    setSourceOpen(false);
    setTranslateOpen(false);
    setBadFlashcardOpen(false);
    if (!keepSettingsOpen) {
      setSettingsOpen(false);
    }
  }

  function goToNextQuestion(nextAnsweredCount = answeredCount) {
    if (nextAnsweredCount > 0 && nextAnsweredCount % ROUND_SIZE === 0) {
      setRoundSummaryRound(Math.ceil(nextAnsweredCount / ROUND_SIZE));
      setSummaryTopicsExpanded(false);
      resetQuestionUi();
      return;
    }
    setCurrentPosition((current) => current + 1);
    resetQuestionUi();
  }

  const handleKeyboardAdvance = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setSettingsOpen(false);
      setHintOpen(false);
      setSourceOpen(false);
      setTranslateOpen(false);
      setBadFlashcardOpen(false);
      setAskBitoOpen(false);
      setExplanationOpen(false);
      return;
    }

    if (
      event.key === "ArrowRight" &&
      answerState !== "idle" &&
      !badFlashcardOpen &&
      !translateOpen &&
      !sourceOpen &&
      !hintOpen
    ) {
      event.preventDefault();
      goToNextQuestion();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardAdvance);
    return () => window.removeEventListener("keydown", handleKeyboardAdvance);
  }, []);

  function handleChoice(choiceId: string) {
    if (!question || answerState !== "idle") {
      return;
    }

    const nextAnswerState: AnswerState =
      choiceId === question.correctChoiceId ? "correct" : "incorrect";
    const nextQueue =
      nextAnswerState === "correct"
        ? queue
        : [
            ...queue,
            {
              questionIndex: activeEntry?.questionIndex ?? 0,
              round: nextRound,
              key: `${question.id}-round-${nextRound}-${queue.length}`,
            },
          ];
    const nextXpAwarded = nextAnswerState === "correct" ? 10 : 0;
    const nextScore = score + (nextAnswerState === "correct" ? 1 : 0);
    const nextXpEarned = xpEarned + nextXpAwarded;
    const nextCurrentStreak = nextAnswerState === "correct" ? currentStreak + 1 : 0;
    const nextBestStreak = Math.max(bestStreak, nextCurrentStreak);

    setSelectedChoiceId(choiceId);
    setAnswerState(nextAnswerState);
    setAttempts((current) => [
      ...current,
      {
        questionId: question.id,
        topic: question.topic,
        result: nextAnswerState,
        round: activeEntry.round,
      },
    ]);
    setScore(nextScore);
    setXpEarned(nextXpEarned);
    setCurrentStreak(nextCurrentStreak);
    setBestStreak(nextBestStreak);
    setHintOpen(false);
    setSourceOpen(false);
    setTranslateOpen(false);

    if (sessionId && user?.id) {
      void recordMcqAttempt({
        sessionId,
        userId: user.id,
        questionId: question.id,
        selectedChoiceId: choiceId,
        isCorrect: nextAnswerState === "correct",
        roundNumber: activeEntry.round,
        queuePosition: currentPosition,
        xpAwarded: nextXpAwarded,
      }).catch((error) => {
        setNotice(error instanceof Error ? error.message : "Could not save the MCQ attempt.");
      });
    }

    if (nextAnswerState === "correct") {
      setNotice("Correct answer selected.");
    } else {
      setQueue(nextQueue);
      setNotice(`We'll bring this one back in Round ${nextRound}.`);
    }
  }

  function restartSession() {
    clearCachedMcqSession(params?.fileId);
    setSessionHydrated(false);
    setQueue(createInitialQueue(questions));
    setCurrentPosition(0);
    setAttempts([]);
    setRoundSummaryRound(null);
    setSummaryTopicsExpanded(false);
    setAskBitoOpen(false);
    setFlaggedQuestionIds([]);
    setScore(0);
    setXpEarned(0);
    setBestStreak(0);
    setCurrentStreak(0);
    setSessionId(null);
    setSessionStudySetId(null);
    resetQuestionUi();
    setBadFlashcardReason(badFlashcardReasons[0].label);
    setSessionHydrated(true);
    setNotice("Practice session restarted.");

    if (user?.id && params?.fileId) {
      void startMcqSession({
        userId: user.id,
        fileId: params.fileId,
        questions,
        forceNew: true,
      })
        .then((nextSession) => {
          setSessionId(nextSession.id);
          setSessionStudySetId(nextSession.studySetId);
        })
        .catch((error) => {
          setNotice(error instanceof Error ? error.message : "Could not restart the MCQ session.");
        });
    }
  }

  if (questionsStatus === "loading") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8faff_0%,#eef2fb_48%,#e8eef9_100%)] font-cairo text-[#344054] dark:bg-[radial-gradient(circle_at_top,#10192f_0%,#0d1528_42%,#09111f_100%)] dark:text-[#d7def0]">
        <div className="mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center px-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-white/90 text-[#5f62f2] shadow-[0_18px_48px_rgba(103,109,167,0.18)] dark:bg-[#182338] dark:text-[#c8c7ff]">
            <span className="inline-flex size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
          <h1 className="mt-6 text-[30px] font-bold text-[#273142] dark:text-white">
            Preparing your MCQs
          </h1>
          <p className="mt-3 max-w-[560px] text-[16px] leading-8 text-[#667085] dark:text-[#b5c2d8]">
            We&apos;re loading your question set. If this file hasn&apos;t been generated yet, the app will create the MCQs from the extracted document text now.
          </p>
          <button
            type="button"
            onClick={() => router.push(filePageHref)}
            className="mt-8 rounded-full bg-white px-5 py-3 text-[15px] font-bold text-[#475467] shadow-[0_18px_48px_rgba(103,109,167,0.12)] dark:bg-[#182338] dark:text-[#d7def0]"
          >
            Back to file
          </button>
        </div>
      </main>
    );
  }

  if (questionsStatus === "error" || questionsStatus === "empty") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8faff_0%,#eef2fb_48%,#e8eef9_100%)] font-cairo text-[#344054] dark:bg-[radial-gradient(circle_at_top,#10192f_0%,#0d1528_42%,#09111f_100%)] dark:text-[#d7def0]">
        <div className="mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[28px] font-bold text-[#273142] dark:text-white">
            {questionsStatus === "empty" ? "MCQs aren't ready yet" : "MCQ session unavailable"}
          </h1>
          <p className="mt-3 text-[16px] leading-8 text-[#667085] dark:text-[#b5c2d8]">
            {questionsErrorMessage ??
              "We couldn't load this practice session. Please go back to the file page and try again."}
          </p>
          <button
            type="button"
            onClick={() => router.push(filePageHref)}
            className="mt-8 rounded-full bg-white px-5 py-3 text-[15px] font-bold text-[#475467] shadow-[0_18px_48px_rgba(103,109,167,0.12)] dark:bg-[#182338] dark:text-[#d7def0]"
          >
            Back to file
          </button>
        </div>
      </main>
    );
  }

  if (roundSummaryRound != null) {
    const correctInRound = roundSummaryAttempts.filter((item) => item.result === "correct").length;
    const xp = correctInRound * 10;
    const remaining = Math.max(0, (question?.total ?? 40) - answeredCount);
    const topicStats = buildTopicStats(roundSummaryAttempts);
    const hasNextQuestion = currentPosition + 1 < queue.length;

    return (
      <RoundSummaryScreen
        hasNextQuestion={hasNextQuestion}
        remaining={remaining}
        roundNumber={roundSummaryRound}
        score={correctInRound}
        summaryTopicsExpanded={summaryTopicsExpanded}
        topicStats={topicStats}
        totalXp={xp}
        onToggleTopics={() => setSummaryTopicsExpanded((current) => !current)}
        onBack={() => router.push(filePageHref)}
        onContinue={() => {
          setRoundSummaryRound(null);
          if (hasNextQuestion) {
            setCurrentPosition((current) => current + 1);
          } else {
            setCurrentPosition(queue.length);
          }
        }}
        onRestart={restartSession}
      />
    );
  }

  if (queueCompleted) {
    const totalCorrect = attempts.filter((attempt) => attempt.result === "correct").length;
    const totalIncorrect = attempts.length - totalCorrect;
    const totalRounds = Math.max(1, ...attempts.map((attempt) => attempt.round));
    const totalXp = xpEarned;
    const topicStats = buildTopicStats(attempts);

    return (
      <SessionCompletionScreen
        flaggedCount={flaggedQuestionIds.length}
        totalCorrect={totalCorrect}
        totalIncorrect={totalIncorrect}
        totalRounds={totalRounds}
        totalXp={totalXp}
        topicStats={topicStats}
        onRestart={restartSession}
        onBack={() => router.push(filePageHref)}
      />
    );
  }

  if (!question) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8faff_0%,#eef2fb_48%,#e8eef9_100%)] font-cairo text-[#344054] dark:bg-[radial-gradient(circle_at_top,#10192f_0%,#0d1528_42%,#09111f_100%)] dark:text-[#d7def0]">
        <div className="mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[28px] font-bold text-[#273142] dark:text-white">Question set unavailable</h1>
          <p className="mt-3 text-[16px] leading-8 text-[#667085] dark:text-[#b5c2d8]">
            The MCQ queue has not been created yet for this file. Please go back and retry after generation finishes.
          </p>
          <button
            type="button"
            onClick={() => router.push(filePageHref)}
            className="mt-8 rounded-full bg-white px-5 py-3 text-[15px] font-bold text-[#475467] shadow-[0_18px_48px_rgba(103,109,167,0.12)] dark:bg-[#182338] dark:text-[#d7def0]"
          >
            Back to file
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8faff_0%,#eef2fb_48%,#e8eef9_100%)] font-cairo text-[#344054] dark:bg-[radial-gradient(circle_at_top,#10192f_0%,#0d1528_42%,#09111f_100%)] dark:text-[#d7def0]">
      <div className="mx-auto min-h-screen max-w-[1440px] px-3 pt-3 pb-5 md:px-5 md:pt-4">
        <header className="flex items-start justify-between gap-3">
          <RoundIconButton
            ariaLabel="Close"
            onClick={() => router.push(filePageHref)}
          >
            <CloseIcon />
          </RoundIconButton>

          <div className="min-w-0 flex-1 px-1 text-center md:px-3">
            <h1 className="mx-auto max-w-[620px] truncate text-[15px] leading-6 font-bold text-[#273142] dark:text-white md:text-[20px] md:leading-8">
              {question.title}
            </h1>
            <p className="mt-1 text-[15px] leading-6 font-bold tracking-[0.01em] text-[#b8bfcb] dark:text-[#8391ad] md:text-[17px]">
              {answeredCount} / {question.total}
            </p>
          </div>

          <div className="relative">
            <RoundIconButton
              ariaLabel="Settings"
              onClick={() => setSettingsOpen((current) => !current)}
            >
              <SettingsIcon />
            </RoundIconButton>
            {settingsOpen ? (
              <div className="absolute top-[52px] right-0 z-30 min-w-[170px] rounded-[18px] bg-white/98 p-3 shadow-[0_20px_46px_rgba(103,109,167,0.18)] backdrop-blur-xl dark:bg-[#182338]/98 dark:shadow-[0_22px_46px_rgba(0,0,0,0.38)]">
                <MiniMenuButton label="Restart session" onClick={restartSession} />
                <MiniMenuButton
                  label="Reset current question"
                  onClick={() => {
                    resetQuestionUi();
                    setSettingsOpen(false);
                    setNotice("Current question reset.");
                  }}
                />
                <MiniMenuButton
                  label="Back to file"
                  onClick={() => router.push(filePageHref)}
                />
              </div>
            ) : null}
          </div>
        </header>

        <div className="mt-4 flex items-center gap-2 px-[6px] md:mt-5">
            {progressDots.map((dot) => (
              <span
                key={dot}
                className={cn(
                  "rounded-full transition-all duration-300",
                  dot === currentProgressIndex
                    ? "h-[10px] flex-1 bg-[#5b5bf5] shadow-[0_4px_10px_rgba(91,91,245,0.28)]"
                    : currentRoundAttempts[dot]?.result === "correct"
                      ? "h-[10px] flex-1 bg-[#8ec65d] shadow-[0_4px_10px_rgba(142,198,93,0.24)]"
                      : currentRoundAttempts[dot]?.result === "incorrect"
                        ? "h-[10px] flex-1 bg-[#f86363] shadow-[0_4px_10px_rgba(248,99,99,0.2)]"
                        : "h-[10px] flex-1 bg-[#1d283a] dark:bg-[#1d283a]",
                )}
              />
            ))}
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[346px_minmax(0,1fr)] lg:items-start lg:gap-14">
          <aside className="hidden lg:block">
            <AskBitoPanel
              open={askBitoOpen || explanationOpen}
              explanationOpen={explanationOpen}
              answerState={answerState}
              prompt={question.prompt}
              question={question}
              selectedChoiceLabel={selectedChoice?.label ?? null}
              onCloseExplanation={() => setExplanationOpen(false)}
            />
          </aside>

          <section className="min-w-0">
            <div className="flex items-center gap-5 px-1 text-[15px] font-semibold text-[#667085] dark:text-[#b5c2d8] md:gap-6">
              <UtilityAction
                icon={<TranslateIcon />}
                label="Translate"
                active={translateOpen}
                onClick={() => {
                  setTranslateOpen(true);
                  setHintOpen(false);
                  setSourceOpen(false);
                }}
              />
              <UtilityAction
                icon={<HintIcon />}
                label="Hint"
                active={hintOpen}
                onClick={() => {
                  setHintOpen((current) => !current);
                  setSourceOpen(false);
                  setTranslateOpen(false);
                }}
              />
            </div>

            <div className="mx-auto max-w-[744px] pt-5 md:pt-7">
              <h2 className="px-2 pt-5 text-center text-[22px] leading-[1.45] font-bold text-[#273142] dark:text-white md:px-4 md:pt-7 md:text-[22px]">
                {question.prompt}
              </h2>

              <div className="mt-6 flex flex-wrap items-center gap-4 px-1">
                {isRepeatQuestion ? (
                  <div className="inline-flex h-9 items-center gap-2 rounded-full bg-[#fff3d8] px-4 text-[14px] font-bold text-[#c58815] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:bg-[#3b2a12] dark:text-[#ffd16c]">
                    <span className="size-2.5 rounded-full bg-[#f3b53f] dark:bg-[#ffd16c]" />
                    Let&apos;s try again
                  </div>
                ) : (
                  <div className="inline-flex h-8 items-center gap-2 rounded-full bg-[#e8f8dc] px-3 text-[14px] font-semibold text-[#8ab454] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:bg-[#203a21] dark:text-[#a9d77b]">
                    <span className="size-3 rounded-full bg-[#88c44f] dark:bg-[#9ad25b]" />
                    {question.difficulty}
                  </div>
                )}
                <p className="text-[15px] font-semibold text-[#667085] dark:text-[#b5c2d8]">
                  Choose the correct answer:
                </p>
              </div>

              <div className="mt-4 space-y-[9px] md:mt-5 md:space-y-2.5">
                {question.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const isCorrect = choice.id === question.correctChoiceId;
                  const revealCorrect = answerState !== "idle" && isCorrect;
                  const revealIncorrect = isSelected && answerState === "incorrect";

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleChoice(choice.id)}
                      disabled={answerState !== "idle"}
                      className={cn(
                        "flex min-h-[54px] w-full items-center gap-4 rounded-[15px] border px-4 py-[15px] text-left shadow-[0_8px_22px_rgba(117,130,164,0.12)] transition hover:translate-y-[-1px] hover:shadow-[0_12px_26px_rgba(117,130,164,0.16)] disabled:cursor-default disabled:hover:translate-y-0 dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_12px_26px_rgba(0,0,0,0.32)] md:min-h-[56px] md:px-[18px]",
                        revealCorrect
                          ? "border-[#9ad25b] bg-[#f5fbe8] dark:border-[#78b73e] dark:bg-[#1b2b1d]"
                          : revealIncorrect
                            ? "border-[#ef6a6a] bg-[#fff3f3] dark:border-[#d46363] dark:bg-[#341c23]"
                            : "border-[#f0f2fa] bg-white dark:border-[#243049] dark:bg-[#182338]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-[18px] shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition",
                          revealCorrect
                            ? "border-[#88c44f] bg-[#88c44f] text-white"
                            : revealIncorrect
                              ? "border-[#ef6a6a] bg-[#ef6a6a] text-white"
                              : isSelected
                                ? "border-[#6d71ff] bg-[#6d71ff] text-white"
                                : "border-[#6d71ff] bg-white text-transparent dark:bg-[#10192b]",
                        )}
                      >
                        ✓
                      </span>
                      <span className="text-[16px] leading-7 font-semibold text-[#1f2937] dark:text-[#edf2ff] md:text-[17px]">
                        {choice.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {answerState === "idle" ? (
                <div className="mt-6 flex items-end justify-between md:mt-7">
                  <div className="flex items-end gap-7">
                    <BottomAction
                      label="Ask Bito!"
                      active={askBitoOpen}
                      onClick={() => setAskBitoOpen((current) => !current)}
                    >
                      <AskBitoIcon />
                    </BottomAction>
                    <BottomAction
                      label="Source"
                      active={sourceOpen}
                      onClick={() => {
                        setSourceOpen((current) => !current);
                        setHintOpen(false);
                        setTranslateOpen(false);
                      }}
                    >
                      <SourceIcon />
                    </BottomAction>
                  </div>

                    <BottomAction
                      label="Skip"
                      onClick={() => {
                        const nextQueue = [
                          ...queue,
                          {
                            questionIndex: activeEntry.questionIndex,
                            round: nextRound,
                            key: `${question.id}-round-${nextRound}-${queue.length}`,
                          },
                        ];
                        setAttempts((current) => [
                          ...current,
                          {
                          questionId: question.id,
                          topic: question.topic,
                          result: "incorrect",
                            round: activeEntry.round,
                          },
                        ]);
                        setQueue(nextQueue);
                        if (sessionId && user?.id) {
                          void recordMcqAttempt({
                            sessionId,
                            userId: user.id,
                            questionId: question.id,
                            selectedChoiceId: null,
                            isCorrect: false,
                            roundNumber: activeEntry.round,
                            queuePosition: currentPosition,
                            xpAwarded: 0,
                          }).catch((error) => {
                            setNotice(error instanceof Error ? error.message : "Could not save the MCQ attempt.");
                          });
                        }
                        setNotice(`We'll bring this one back in Round ${nextRound}.`);
                        goToNextQuestion(answeredCount + 1);
                      }}
                    >
                    <SkipIcon />
                  </BottomAction>
                </div>
              ) : (
                <>
                  <AnswerOutcomeCard
                    answerState={answerState}
                    flagged={question != null && flaggedQuestionIds.includes(question.id)}
                    nextRound={nextRound}
                    onNext={goToNextQuestion}
                    onBadFlashcard={() => setBadFlashcardOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setExplanationOpen((current) => !current);
                      setAskBitoOpen(true);
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-3 rounded-[18px] border border-[#dce4f3] bg-white px-4 py-3 text-center text-[15px] font-semibold text-[#475467] shadow-[0_12px_28px_rgba(117,130,164,0.1)] transition hover:bg-[#f8faff] dark:border-[#2f3d58] dark:bg-[#182338] dark:text-[#e6ecfb] dark:hover:bg-[#1c2840]"
                  >
                    <AskBitoIcon />
                    <span>{explanationLabel}</span>
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {translateOpen ? (
        <OverlayPanel title="Choose Your Preferred Language" onClose={() => setTranslateOpen(false)}>
          <div className="space-y-3">
            {translateOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTranslateLanguage(option);
                  setTranslateOpen(false);
                  setNotice(`${option} selected for translation.`);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-[16px] border px-4 py-3 text-left text-[15px] font-semibold transition",
                  translateLanguage === option
                    ? "border-[#6a64ff] bg-[#f5f4ff] text-[#5f62f2] dark:border-[#7d7bff] dark:bg-[#1c235d] dark:text-[#c8c7ff]"
                    : "border-[#e5e9f4] bg-white text-[#475467] dark:border-[#334764] dark:bg-[#1a2941] dark:text-[#d7def0]",
                )}
              >
                <span>{option}</span>
                {translateLanguage === option ? <span>✓</span> : null}
              </button>
            ))}
          </div>
        </OverlayPanel>
      ) : null}

      {hintOpen ? (
        <OverlayPanel title="Hint" onClose={() => setHintOpen(false)}>
          <p className="text-[16px] leading-7 text-[#475467] dark:text-[#d7def0]">
            {question.hint}
          </p>
        </OverlayPanel>
      ) : null}

      {sourceOpen ? (
        <OverlayPanel title="Source" onClose={() => setSourceOpen(false)}>
          <div className="space-y-3 text-[16px] leading-7 text-[#475467] dark:text-[#d7def0]">
            <p>{question.source}</p>
            {answerState === "correct" ? (
              <p className="font-semibold text-[#334155] dark:text-white">
                This source reinforces why the correct answer matches the text or idea being tested.
              </p>
            ) : answerState === "incorrect" ? (
              <p className="font-semibold text-[#334155] dark:text-white">
                This is the clue the live app would want you to revisit before the next round.
              </p>
            ) : null}
          </div>
        </OverlayPanel>
      ) : null}

      {askBitoOpen || explanationOpen ? (
        <MobileAskBitoSheet
          explanationOpen={explanationOpen}
          prompt={question.prompt}
          answerState={answerState}
          question={question}
          selectedChoiceLabel={selectedChoice?.label ?? null}
          onClose={() => {
            setAskBitoOpen(false);
            setExplanationOpen(false);
          }}
          onCloseExplanation={() => setExplanationOpen(false)}
        />
      ) : null}

      {badFlashcardOpen ? (
        <OverlayPanel title="Help Us Improve The Content" onClose={() => setBadFlashcardOpen(false)}>
          <div className="rounded-[18px] bg-[linear-gradient(180deg,#fff9db_0%,#fffdf0_100%)] px-4 py-4 text-center dark:bg-[linear-gradient(180deg,#3b3115_0%,#2a2414_100%)]">
            <p className="text-[15px] leading-7 text-[#667085] dark:text-[#f2e7b1]">
              Your feedback contributes to improving the experience and enhancing the content
            </p>
          </div>
          <h3 className="mt-5 text-[16px] font-bold text-[#334155] dark:text-white">
            Identify the problem you encountered:
          </h3>
          <div className="mt-4 space-y-3">
            {badFlashcardReasons.map((reason) => (
              <button
                key={reason.label}
                type="button"
                onClick={() => setBadFlashcardReason(reason.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[16px] border px-4 py-3 text-left text-[15px] font-semibold transition",
                  badFlashcardReason === reason.label
                    ? "border-[#6a64ff] bg-[#f5f4ff] text-[#5f62f2] dark:border-[#7d7bff] dark:bg-[#1c235d] dark:text-[#c8c7ff]"
                    : "border-[#e5e9f4] bg-white text-[#475467] dark:border-[#334764] dark:bg-[#1a2941] dark:text-[#d7def0]",
                )}
              >
                <span className="text-[18px]">{reason.icon}</span>
                <span className="flex-1">{reason.label}</span>
                {badFlashcardReason === reason.label ? <span>✓</span> : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setBadFlashcardOpen(false);
              setFlaggedQuestionIds((current) =>
                question == null || current.includes(question.id) ? current : [...current, question.id],
              );
              if (sessionId && question) {
                void flagMcqQuestion(sessionId, question.id).catch((error) => {
                  setNotice(error instanceof Error ? error.message : "Could not save the report.");
                });
              }
              setNotice(`${badFlashcardReason} reported for review.`);
            }}
            className="mt-5 h-[48px] w-full rounded-[16px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] text-[15px] font-bold text-white shadow-[0_16px_34px_rgba(96,97,240,0.22)]"
          >
            Submit report
          </button>
        </OverlayPanel>
      ) : null}

      {notice ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex justify-center px-4">
          <div className="rounded-full bg-[#1d2741] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(8,13,24,0.32)] dark:bg-[#edf2ff] dark:text-[#111a2e]">
            {notice}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function RoundSummaryScreen({
  hasNextQuestion,
  onBack,
  onContinue,
  onRestart,
  remaining,
  roundNumber,
  score,
  summaryTopicsExpanded,
  topicStats,
  totalXp,
  onToggleTopics,
}: {
  hasNextQuestion: boolean;
  onBack: () => void;
  onContinue: () => void;
  onRestart: () => void;
  remaining: number;
  roundNumber: number;
  score: number;
  summaryTopicsExpanded: boolean;
  topicStats: Array<{ topic: string; seen: number; correct: number }>;
  totalXp: number;
  onToggleTopics: () => void;
}) {
  const visibleTopicStats = summaryTopicsExpanded ? topicStats : topicStats.slice(0, 3);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8faff_0%,#eef2fb_48%,#e8eef9_100%)] font-cairo text-[#344054] dark:bg-[radial-gradient(circle_at_top,#10192f_0%,#0d1528_42%,#09111f_100%)] dark:text-[#d7def0]">
      <div className="mx-auto min-h-screen max-w-[1440px] px-3 pt-3 pb-8 md:px-5 md:pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-[10px] border border-[#e6ebf4] bg-white/90 shadow-[0_4px_14px_rgba(117,130,164,0.12)] dark:border-[#2d3a54] dark:bg-[#182338]/92"
          aria-label="Back to file"
        >
          <CloseIcon />
        </button>

        <section className="mx-auto mt-5 grid max-w-[1180px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-7">
          <div className="rounded-[26px] border border-[#e8edf7] bg-white/92 p-4 shadow-[0_24px_50px_rgba(96,97,240,0.12)] dark:border-[#243049] dark:bg-[#182338]/94">
            <div className="rounded-[22px] bg-[linear-gradient(180deg,#f1efff_0%,#f8f8ff_100%)] px-4 py-4 dark:bg-[linear-gradient(180deg,#11284d_0%,#15243f_100%)]">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-white/80 text-[#5f62f2] shadow-[0_10px_24px_rgba(96,97,240,0.14)] dark:bg-white/10 dark:text-[#c8c7ff]">
                  <AskBitoIcon />
                </span>
                <div>
                  <div className="text-[15px] font-bold text-[#273142] dark:text-white">
                    Hello Try Revive 👋!
                  </div>
                  <p className="mt-1 text-[14px] leading-6 text-[#516074] dark:text-[#dbe4f7]">
                    I&apos;ll answer any question that comes to your mind clearly and quickly, and
                    I&apos;ll help you understand the information better 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#e8edf7] bg-white/94 px-5 py-5 shadow-[0_24px_60px_rgba(96,97,240,0.14)] dark:border-[#243049] dark:bg-[#182338]/94 md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#eef2ff] text-[#5f62f2] dark:bg-[#212b58] dark:text-[#c8c7ff]">
                <TrophyIcon />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#8a94a7] dark:text-[#a8b5ca]">
                  Round {roundNumber} complete
                </p>
                <h1 className="text-[24px] font-bold text-[#273142] dark:text-white md:text-[28px]">
                  Keep going, you&apos;re building momentum
                </h1>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              <RoundStatCard label="Total XP" value={String(totalXp)} />
              <RoundStatCard label="Your Score" value={`${score}/${ROUND_SIZE}`} />
              <div className="col-span-2 md:col-span-1">
                <RoundStatCard label="Remaining" value={String(remaining)} />
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#edf1f7] bg-[#f9fbff] px-5 py-5 dark:border-[#26344e] dark:bg-[#111a2f]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[20px] font-bold text-[#273142] dark:text-white">
                  Mastery by Topic
                </h2>
                <button
                  type="button"
                  onClick={onToggleTopics}
                  className="rounded-full border border-[#dce4f3] bg-white px-4 py-2 text-[13px] font-bold text-[#667085] dark:border-[#314059] dark:bg-[#182338] dark:text-[#d7def0]"
                >
                  {summaryTopicsExpanded ? "Collapse topics" : "Expand topics"}
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {visibleTopicStats.map((item) => (
                  <div
                    key={item.topic}
                    className="rounded-[18px] bg-white px-4 py-3 dark:bg-[#182338]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[15px] font-semibold text-[#334155] dark:text-[#edf2ff]">
                        {item.topic}
                      </span>
                      <span className="text-[14px] font-bold text-[#667085] dark:text-[#b5c2d8]">
                        {item.seen}/{item.correct}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8edf7] dark:bg-[#10192f]">
                      <div
                        className={cn(
                          "h-full rounded-full bg-[linear-gradient(90deg,#8ec65d_0%,#b4df79_100%)]",
                          getMasteryFillClass(item.correct, item.seen),
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              {!hasNextQuestion ? (
                <button
                  type="button"
                  onClick={onRestart}
                  className="rounded-[16px] border border-[#dce4f3] bg-white px-5 py-3 text-[15px] font-bold text-[#475467] dark:border-[#314059] dark:bg-[#182338] dark:text-[#d7def0]"
                >
                  Restart Session
                </button>
              ) : null}
              <button
                type="button"
                onClick={onContinue}
                className="rounded-[16px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-6 py-3 text-[15px] font-bold text-white shadow-[0_16px_34px_rgba(96,97,240,0.22)]"
              >
                {hasNextQuestion ? "Next Round" : "Finish"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function RoundStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#edf1f7] bg-[#f9fbff] px-5 py-5 dark:border-[#26344e] dark:bg-[#111a2f]">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#eef2ff] text-[#5f62f2] dark:bg-[#212b58] dark:text-[#c8c7ff]">
          <TrophyIcon />
        </span>
        <div>
          <div className="text-[14px] font-semibold text-[#8a94a7] dark:text-[#a8b5ca]">
            {label}
          </div>
          <div className="mt-1 text-[28px] leading-none font-bold text-[#273142] dark:text-white">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionCompletionScreen({
  flaggedCount,
  totalCorrect,
  totalIncorrect,
  totalRounds,
  totalXp,
  topicStats,
  onRestart,
  onBack,
}: {
  flaggedCount: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalRounds: number;
  totalXp: number;
  topicStats: Array<{ topic: string; seen: number; correct: number }>;
  onRestart: () => void;
  onBack: () => void;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8faff_0%,#eef2fb_48%,#e8eef9_100%)] font-cairo text-[#344054] dark:bg-[radial-gradient(circle_at_top,#10192f_0%,#0d1528_42%,#09111f_100%)] dark:text-[#d7def0]">
      <div className="mx-auto min-h-screen max-w-[1440px] px-3 pt-3 pb-8 md:px-5 md:pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-[10px] border border-[#e6ebf4] bg-white/90 shadow-[0_4px_14px_rgba(117,130,164,0.12)] dark:border-[#2d3a54] dark:bg-[#182338]/92"
          aria-label="Back to file"
        >
          <CloseIcon />
        </button>

        <section className="mx-auto mt-5 grid max-w-[1180px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-7">
          <div className="rounded-[26px] border border-[#e8edf7] bg-white/92 p-4 shadow-[0_24px_50px_rgba(96,97,240,0.12)] dark:border-[#243049] dark:bg-[#182338]/94">
            <div className="rounded-[22px] bg-[linear-gradient(180deg,#f1efff_0%,#f8f8ff_100%)] px-4 py-4 dark:bg-[linear-gradient(180deg,#11284d_0%,#15243f_100%)]">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-white/80 text-[#5f62f2] shadow-[0_10px_24px_rgba(96,97,240,0.14)] dark:bg-white/10 dark:text-[#c8c7ff]">
                  <TrophyIcon />
                </span>
                  <div>
                    <div className="text-[15px] font-bold text-[#273142] dark:text-white">
                    Session complete
                    </div>
                    <p className="mt-1 text-[14px] leading-6 text-[#516074] dark:text-[#dbe4f7]">
                    You finished all active rounds in this session.
                    </p>
                  </div>
                </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#e8edf7] bg-white/94 px-5 py-5 shadow-[0_24px_60px_rgba(96,97,240,0.14)] dark:border-[#243049] dark:bg-[#182338]/94 md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#eef2ff] text-[#5f62f2] dark:bg-[#212b58] dark:text-[#c8c7ff]">
                <TrophyIcon />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#8a94a7] dark:text-[#a8b5ca]">
                  Final MCQ report
                </p>
                <h1 className="text-[24px] font-bold text-[#273142] dark:text-white md:text-[28px]">
                  Nice work, your practice session is complete
                </h1>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
              <RoundStatCard label="Total XP" value={String(totalXp)} />
              <RoundStatCard label="Correct" value={String(totalCorrect)} />
              <RoundStatCard label="To Review" value={String(totalIncorrect)} />
              <RoundStatCard label="Flagged" value={String(flaggedCount)} />
              <div className="col-span-2 md:col-span-1">
                <RoundStatCard label="Rounds" value={String(totalRounds)} />
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#edf1f7] bg-[#f9fbff] px-5 py-5 dark:border-[#26344e] dark:bg-[#111a2f]">
              <h2 className="text-[20px] font-bold text-[#273142] dark:text-white">
                Mastery by Topic
              </h2>
              <div className="mt-5 space-y-3">
                {topicStats.map((item) => (
                  <div
                    key={item.topic}
                    className="rounded-[18px] bg-white px-4 py-3 dark:bg-[#182338]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[15px] font-semibold text-[#334155] dark:text-[#edf2ff]">
                        {item.topic}
                      </span>
                      <span className="text-[14px] font-bold text-[#667085] dark:text-[#b5c2d8]">
                        {item.seen}/{item.correct}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8edf7] dark:bg-[#10192f]">
                      <div
                        className={cn(
                          "h-full rounded-full bg-[linear-gradient(90deg,#8ec65d_0%,#b4df79_100%)]",
                          getMasteryFillClass(item.correct, item.seen),
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={onBack}
                className="rounded-[16px] border border-[#dce4f3] bg-white px-5 py-3 text-[15px] font-bold text-[#475467] dark:border-[#314059] dark:bg-[#182338] dark:text-[#d7def0]"
              >
                Back to file
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="rounded-[16px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-6 py-3 text-[15px] font-bold text-white shadow-[0_16px_34px_rgba(96,97,240,0.22)]"
              >
                Restart Session
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function buildTopicStats(attempts: AttemptRecord[]) {
  return Array.from(
    attempts.reduce((map, attempt) => {
      const existing = map.get(attempt.topic) ?? { topic: attempt.topic, seen: 0, correct: 0 };
      existing.seen += 1;
      if (attempt.result === "correct") {
        existing.correct += 1;
      }
      map.set(attempt.topic, existing);
      return map;
    }, new Map<string, { topic: string; seen: number; correct: number }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => right.seen - left.seen || left.topic.localeCompare(right.topic));
}

function getMasteryFillClass(correct: number, seen: number) {
  if (seen === 0) {
    return "w-0";
  }

  const ratio = correct / seen;

  if (ratio >= 0.95) {
    return "w-full";
  }
  if (ratio >= 0.8) {
    return "w-5/6";
  }
  if (ratio >= 0.6) {
    return "w-2/3";
  }
  if (ratio >= 0.4) {
    return "w-1/2";
  }
  if (ratio >= 0.2) {
    return "w-1/3";
  }

  return "w-[12%]";
}

function AskBitoPanel({
  open,
  explanationOpen,
  answerState,
  prompt,
  question,
  selectedChoiceLabel,
  onCloseExplanation,
}: {
  open: boolean;
  explanationOpen: boolean;
  answerState: AnswerState;
  prompt: string;
  question: ExamQuestion;
  selectedChoiceLabel: string | null;
  onCloseExplanation: () => void;
}) {
  return (
    <div className="rounded-[22px] border border-[#edf1f7] bg-white/92 p-4 shadow-[0_16px_42px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338]/92 dark:shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
      <div className="flex items-center justify-between">
        <div className="text-[18px] font-bold text-[#273142] dark:text-white">Ask Bito!</div>
        <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-bold text-[#6061f0] dark:bg-[#20295c] dark:text-[#b9b8ff]">
          Live help
        </span>
      </div>

      {explanationOpen ? (
        <BitoExplanation
          answerState={answerState}
          question={question}
          selectedChoiceLabel={selectedChoiceLabel}
          onClose={onCloseExplanation}
        />
      ) : (
        <div className="mt-4 rounded-[18px] bg-[linear-gradient(180deg,#f0efff_0%,#f5f6ff_100%)] px-4 py-4 text-[16px] leading-8 text-[#334155] dark:bg-[linear-gradient(180deg,#122b4e_0%,#15243f_100%)] dark:text-[#edf2ff]">
          {open ? (
            <>
              <div className="font-bold">Let&apos;s reason through it.</div>
              <div className="mt-2 text-[15px] leading-7">
                {answerState === "correct"
                  ? question.correctReflection
                  : answerState === "incorrect"
                    ? `Look for the answer that best fits ${question.assistantTopic}.`
                    : `Start with the tone of the question: "${prompt}" is about ${question.assistantTopic}.`}
              </div>
            </>
          ) : (
            <>
              <div>Hello Try Revive 👋!</div>
              <div>
                I&apos;ll answer any question that comes to your mind clearly and quickly,
                and I&apos;ll help you understand the information better 🚀
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-[#eef2f7] pt-6 dark:border-[#2b3952]">
        <div className="flex items-center gap-3 rounded-[14px] border border-[#dfe6f3] bg-white px-4 py-3 text-[#94a3b8] shadow-[0_10px_22px_rgba(117,130,164,0.08)] dark:border-[#314059] dark:bg-[#111b2f] dark:text-[#8fa3c2] dark:shadow-[0_10px_22px_rgba(0,0,0,0.25)]">
          <AskWandIcon />
          <span className="text-[18px]">Write your question here</span>
        </div>
      </div>
    </div>
  );
}

function MobileAskBitoSheet({
  explanationOpen,
  prompt,
  answerState,
  question,
  selectedChoiceLabel,
  onClose,
  onCloseExplanation,
}: {
  explanationOpen: boolean;
  prompt: string;
  answerState: AnswerState;
  question: ExamQuestion;
  selectedChoiceLabel: string | null;
  onClose: () => void;
  onCloseExplanation: () => void;
}) {
  return (
    <OverlayPanel title="Ask Bito!" onClose={onClose}>
      {explanationOpen ? (
        <BitoExplanation
          answerState={answerState}
          question={question}
          selectedChoiceLabel={selectedChoiceLabel}
          onClose={onCloseExplanation}
        />
      ) : (
        <>
          <p className="text-[16px] leading-7 text-[#475467] dark:text-[#d7def0]">
            {answerState === "correct"
              ? question.correctReflection
              : answerState === "incorrect"
                ? `Try focusing on ${question.assistantTopic}. That's the strongest clue in this question.`
                : `A good first step is to think about what ${prompt.toLowerCase()} is really testing.`}
          </p>
          <div className="mt-5 flex items-center gap-3 rounded-[14px] border border-[#dfe6f3] bg-[#f8faff] px-4 py-3 text-[#94a3b8] dark:border-[#314059] dark:bg-[#111b2f] dark:text-[#8fa3c2]">
            <AskWandIcon />
            <span className="text-[16px]">Write your question here</span>
          </div>
        </>
      )}
    </OverlayPanel>
  );
}

function BitoExplanation({
  answerState,
  question,
  selectedChoiceLabel,
  onClose,
}: {
  answerState: AnswerState;
  question: ExamQuestion;
  selectedChoiceLabel: string | null;
  onClose: () => void;
}) {
  const correctChoice =
    question.choices.find((choice) => choice.id === question.correctChoiceId)?.label ?? "";

  return (
    <>
      <div className="mt-4 flex items-center gap-2 text-[13px] font-bold text-[#67748c] dark:text-[#b9c5db]">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#eef2ff] text-[#6061f0] dark:bg-[#20295c] dark:text-[#b9b8ff]">
          <AskWandIcon />
        </span>
        <span>Information Explanation</span>
      </div>

      <div className="mt-3 rounded-[18px] bg-[linear-gradient(180deg,#f7f8ff_0%,#fbfcff_100%)] px-4 py-4 text-[#334155] dark:bg-[linear-gradient(180deg,#122b4e_0%,#15243f_100%)] dark:text-[#edf2ff]">
        <div className="text-[15px] leading-7">
          {answerState === "correct" ? (
            <>
              <p>
                You got it! The correct answer is indeed <strong>{correctChoice}</strong>.
              </p>
              <p className="mt-3 font-semibold">Here&apos;s why that&apos;s the best fit:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {question.explanationBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p className="mt-3">{question.correctReflection}</p>
            </>
          ) : answerState === "incorrect" ? (
            <>
              <p>
                You&apos;re on the right track thinking about {question.assistantTopic}. The
                correct answer is <strong>{correctChoice}</strong>.
              </p>
              <p className="mt-3 font-semibold">Here&apos;s why:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {question.explanationBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p className="mt-3">
                Your choice, <strong>{selectedChoiceLabel}</strong>, {question.wrongChoiceContrast}
              </p>
            </>
          ) : (
            <p>Choose an answer to unlock a deeper explanation from Bito.</p>
          )}

          <p className="mt-3">
            <strong>Takeaway:</strong> {question.takeaway}
          </p>
          <p className="mt-3">{question.followUpPrompt}</p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <SmallIconButton ariaLabel="Close explanation" onClick={onClose}>
            <CloseIcon />
          </SmallIconButton>
          <SmallIconButton
            ariaLabel="Copy follow up question"
            onClick={() => {
              void navigator.clipboard.writeText(question.followUpPrompt);
            }}
          >
            <CopyMiniIcon />
          </SmallIconButton>
          <SmallIconButton ariaLabel="Dismiss explanation" onClick={onClose}>
            <DotsMiniIcon />
          </SmallIconButton>
        </div>
      </div>
    </>
  );
}

function AnswerOutcomeCard({
  answerState,
  flagged,
  nextRound,
  onNext,
  onBadFlashcard,
}: {
  answerState: Exclude<AnswerState, "idle">;
  flagged: boolean;
  nextRound: number;
  onNext: () => void;
  onBadFlashcard: () => void;
}) {
  const correct = answerState === "correct";

  return (
    <div className="mt-6 rounded-[22px] border border-[#edf1f7] bg-white px-5 py-5 shadow-[0_16px_34px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338] dark:shadow-[0_18px_36px_rgba(0,0,0,0.3)]">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-1 pt-0.5 text-[28px]">
          <span>{correct ? "✨" : "👏"}</span>
          <span>{correct ? "👏" : "😕"}</span>
        </div>
        <div className="min-w-0">
          <h3 className="text-[20px] font-bold text-[#273142] dark:text-white">
            {correct ? "Good Job!" : "We'll ask the question again in the upcoming rounds"}
          </h3>
          <p className="mt-1 text-[15px] font-semibold text-[#667085] dark:text-[#c8d4eb]">
            {correct ? "Correct answer" : "Don't worry!"}
          </p>
          {!correct ? (
            <p className="mt-2 text-[14px] font-semibold text-[#98a2b3] dark:text-[#8ea1bf]">
              Coming back in Round {nextRound}
            </p>
          ) : null}
          {flagged ? (
            <p className="mt-2 text-[13px] font-bold text-[#5f62f2] dark:text-[#c8c7ff]">
              Report received. We&apos;ll keep this one marked for review.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onNext}
          className="rounded-[15px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-5 py-3 text-[15px] font-bold text-white shadow-[0_16px_34px_rgba(96,97,240,0.22)]"
        >
          Next
        </button>
        <button
          type="button"
          onClick={onBadFlashcard}
          className={cn(
            "flex items-center justify-center gap-2 rounded-[15px] border px-4 py-3 text-[15px] font-bold shadow-[0_10px_24px_rgba(103,109,167,0.08)] dark:border-[#314059] dark:bg-[#10192b] dark:text-[#e6ecfb]",
            flagged
              ? "border-[#6a64ff] bg-[#f5f4ff] text-[#5f62f2] dark:border-[#7d7bff] dark:bg-[#1c235d] dark:text-[#c8c7ff]"
              : "border-[#dde5f3] bg-white text-[#475467]",
          )}
        >
          <SourceIcon />
          {flagged ? "Reported" : "Bad Flashcard"}
        </button>
      </div>

      <p className="mt-4 text-[14px] font-semibold text-[#98a2b3] dark:text-[#8ea1bf]">
        Press arrow keys to continue
      </p>
    </div>
  );
}

function OverlayPanel({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[rgba(248,250,255,0.72)] backdrop-blur-[10px] dark:bg-[rgba(4,8,18,0.72)]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[460px] rounded-[24px] bg-white px-5 py-6 shadow-[0_24px_70px_rgba(96,97,240,0.16)] dark:bg-[#152139] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:rounded-[28px] sm:px-8 sm:py-7">
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-[#c0c6d1] dark:text-[#71829f]"
        >
          <CloseIcon />
        </button>
        <h2 className="pr-8 text-[24px] font-bold text-[#0f172a] dark:text-white">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function UtilityAction({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-[11px] bg-white shadow-[0_8px_20px_rgba(117,130,164,0.16)] transition hover:translate-y-[-1px] hover:shadow-[0_10px_22px_rgba(117,130,164,0.2)] dark:bg-[#182338] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_10px_22px_rgba(0,0,0,0.34)]",
          active && "bg-[#f1efff] dark:bg-[#212b58]",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-[15px] font-semibold text-[#667085] dark:text-[#b5c2d8]",
          active && "text-[#5f62f2] dark:text-[#b9b8ff]",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function BottomAction({
  children,
  label,
  active = false,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1 text-center">
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-[11px] bg-white shadow-[0_8px_20px_rgba(117,130,164,0.16)] transition hover:translate-y-[-1px] hover:shadow-[0_10px_22px_rgba(117,130,164,0.2)] dark:bg-[#182338] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_10px_22px_rgba(0,0,0,0.34)]",
          active && "bg-[#f1efff] dark:bg-[#212b58]",
        )}
      >
        {children}
      </span>
      <span
        className={cn(
          "text-[14px] leading-5 font-semibold text-[#667085] dark:text-[#b5c2d8]",
          active && "text-[#5f62f2] dark:text-[#b9b8ff]",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function RoundIconButton({
  children,
  ariaLabel,
  onClick,
}: {
  children: ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-[10px] border border-[#e6ebf4] bg-white/90 shadow-[0_4px_14px_rgba(117,130,164,0.12)] transition hover:translate-y-[-1px] hover:shadow-[0_8px_18px_rgba(117,130,164,0.16)] dark:border-[#2d3a54] dark:bg-[#182338]/92 dark:shadow-[0_4px_14px_rgba(0,0,0,0.24)] dark:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
    >
      {children}
    </button>
  );
}

function MiniMenuButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center rounded-xl px-2 py-2.5 text-left text-[14px] text-[#475467] transition hover:bg-[#f5f7ff] dark:text-[#e1e8f8] dark:hover:bg-[#24314b]"
    >
      {label}
    </button>
  );
}

function SmallIconButton({
  ariaLabel,
  children,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border border-[#dae2f1] bg-white text-[#6b7280] transition hover:bg-[#f8faff] dark:border-[#314059] dark:bg-[#10192b] dark:text-[#d7def0] dark:hover:bg-[#17233a]"
    >
      {children}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]">
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="#A8B0BD"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[17px]">
      <path
        d="M10 3.5a1.5 1.5 0 0 1 1.5 1.5v.2a4.88 4.88 0 0 1 1.06.44l.14-.14a1.5 1.5 0 1 1 2.12 2.12l-.14.14c.19.34.34.7.44 1.06H15a1.5 1.5 0 0 1 0 3h-.2a4.88 4.88 0 0 1-.44 1.06l.14.14a1.5 1.5 0 1 1-2.12 2.12l-.14-.14a4.88 4.88 0 0 1-1.06.44V15a1.5 1.5 0 0 1-3 0v-.2a4.88 4.88 0 0 1-1.06-.44l-.14.14a1.5 1.5 0 1 1-2.12-2.12l.14-.14a4.88 4.88 0 0 1-.44-1.06H5a1.5 1.5 0 0 1 0-3h.2c.1-.37.25-.72.44-1.06l-.14-.14A1.5 1.5 0 1 1 7.62 5.5l.14.14c.34-.19.7-.34 1.06-.44V5A1.5 1.5 0 0 1 10 3.5Zm0 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
        fill="#A8B0BD"
      />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[19px]">
      <path
        d="M5 4h8M9 4c0 4.1-1.6 7.4-4 9M8 10c.8 1.2 1.8 2.2 3 3M12.6 6l3.4 9m-.8-2.2h-4.8"
        stroke="#5E63F5"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HintIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[19px]">
      <path
        d="M10 3.5a5.5 5.5 0 0 0-3.8 9.47c.4.37.8 1 .93 1.53h5.74c.13-.54.53-1.16.93-1.53A5.5 5.5 0 0 0 10 3.5Zm-2 13h4m-3.2 0 .2 1h2l.2-1"
        stroke="#7D66F6"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AskWandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-current">
      <path
        d="m14.5 5.5 4 4M7 17l10.5-10.5a1.41 1.41 0 0 0-2-2L5 15m2 2-3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m3 6 1-2 1 2 2 1-2 1-1 2-1-2-2-1z"
        fill="currentColor"
      />
    </svg>
  );
}

function AskBitoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7">
      <path
        d="M6 16c0-4.4 2.9-8.5 7.4-10l2.6-.9-.8 2.7c-1.2 4.1-4.7 7.4-9 8.2L4 16l2-2.1Z"
        fill="#6C63FF"
      />
      <path
        d="M15.8 6.4 19 5l-1.5 3.3"
        stroke="#A6D4FF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SourceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7">
      <path
        d="M6.5 5.5h8a2 2 0 0 1 2 2v11h-8a2 2 0 0 0-2 2v-15Z"
        fill="#77C66E"
      />
      <path
        d="M8.5 8.5h6m-6 3h6m-6 3h4"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7">
      <path
        d="M7 7v10l7-5-7-5Zm9 0v10"
        fill="none"
        stroke="#6F8FB5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7">
      <path
        d="M8 4h8v3a4 4 0 0 1-8 0V4Zm-2 1H4a2 2 0 0 0 2 2V5Zm14 0h-2v2a2 2 0 0 0 2-2ZM10 14h4v3h2v2H8v-2h2v-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CopyMiniIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4">
      <path
        d="M7 7h7v9H7zM5 13H4V4h7v1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotsMiniIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4">
      <circle cx="4" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}
