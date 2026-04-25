"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useFlashcardsDeck } from "@/lib/study-data";
import type { Flashcard } from "@/types/auth";
import { cn } from "@/lib/utils";

const utilityActions = ["Translate", "Explain", "Mnemonics", "Example"] as const;
type FlashcardAction = "Mastered" | "Still Learning";
type FlashcardSnapshot = {
  pendingInitial: number[];
  reviewQueue: number[];
  completedCount: number;
  revealed: boolean;
  lastResolved: { cardIndex: number; action: FlashcardAction } | null;
  masteredIds: string[];
};

export function StudybitesFlashcardsPage() {
  const router = useRouter();
  const params = useParams<{ fileId: string }>();
  const { user } = useAuth();
  const {
    cards,
    status: deckStatus,
    errorMessage: deckErrorMessage,
  } = useFlashcardsDeck(params?.fileId, user?.id);
  const filePageHref = params?.fileId ? `/library/files/${params.fileId}` : "/library";
  const [pendingInitial, setPendingInitial] = useState<number[]>([]);
  const [reviewQueue, setReviewQueue] = useState<number[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [activeUtility, setActiveUtility] =
    useState<(typeof utilityActions)[number] | null>(null);
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<FlashcardSnapshot[]>([]);
  const [badCards, setBadCards] = useState<string[]>([]);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [lastResolved, setLastResolved] = useState<{
    cardIndex: number;
    action: FlashcardAction;
  } | null>(null);
  const activeCardIndex =
    pendingInitial[0] ?? (pendingInitial.length === 0 ? reviewQueue[0] : undefined) ?? null;
  const deckReady = cards.length > 0;
  const card = activeCardIndex == null ? null : cards[activeCardIndex];
  const previewCardIndex =
    pendingInitial.length > 1
      ? pendingInitial[1]
      : pendingInitial.length === 1
        ? reviewQueue[0] ?? null
        : reviewQueue[1] ?? null;
  const previewCard = previewCardIndex == null ? null : cards[previewCardIndex];
  const hasInitialCards = pendingInitial.length > 0;
  const remainingCount =
    pendingInitial.length + reviewQueue.length - (card == null ? 0 : hasInitialCards ? 1 : 0);
  const queueComplete = card == null;

  useEffect(() => {
    if (!deckReady) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingInitial(cards.map((_, index) => index));
    setReviewQueue([]);
    setCompletedCount(0);
    setRevealed(false);
    setHistory([]);
    setBadCards([]);
    setMasteredIds([]);
    setLastResolved(null);
  }, [cards, deckReady]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  function pushHistorySnapshot() {
    setHistory((current) => [
      ...current,
      {
        pendingInitial,
        reviewQueue,
        completedCount,
        revealed,
        lastResolved,
        masteredIds,
      },
    ]);
  }

  function advanceQueue(action: FlashcardAction) {
    if (card == null || activeCardIndex == null) {
      return;
    }

    if (!revealed) {
      setRevealed(true);
      setNotice("Answer revealed.");
      return;
    }

    pushHistorySnapshot();

    const nextPendingInitial = hasInitialCards ? pendingInitial.slice(1) : pendingInitial;
    const nextReviewQueue = hasInitialCards ? reviewQueue : reviewQueue.slice(1);

    setPendingInitial(nextPendingInitial);
    setReviewQueue(
      action === "Still Learning"
        ? [...nextReviewQueue, activeCardIndex]
        : nextReviewQueue,
    );
    setCompletedCount((current) => current + 1);
    setLastResolved({ cardIndex: activeCardIndex, action });
    setRevealed(false);
    setActiveUtility(null);
    setSourceOpen(false);

    if (action === "Mastered") {
      setMasteredIds((current) =>
        card == null || current.includes(card.id) ? current : [...current, card.id],
      );
      setNotice("Flashcard marked as mastered.");
    } else {
      setNotice("Flashcard kept in your learning queue.");
    }
  }

  function handleUndo() {
    const previous = history.at(-1);
    if (previous == null) {
      setNotice("Nothing to undo yet.");
      return;
    }

    setHistory((current) => current.slice(0, -1));
    setPendingInitial(previous.pendingInitial);
    setReviewQueue(previous.reviewQueue);
    setCompletedCount(previous.completedCount);
    setRevealed(previous.revealed);
    setLastResolved(previous.lastResolved);
    setMasteredIds(previous.masteredIds);
    setSourceOpen(false);
    setActiveUtility(null);
    setNotice("Returned to the previous flashcard.");
  }

  function handleBadFlashcard() {
    if (card == null) {
      return;
    }
    setBadCards((current) =>
      current.includes(card.id) ? current : [...current, card.id],
    );
    setNotice("Flashcard flagged for review.");
  }

  function utilityCopy(action: (typeof utilityActions)[number]) {
    if (action === "Translate") {
      return "Translation options opened for this flashcard.";
    }

    if (action === "Explain") {
      return card?.explanation ?? "Explanation opened for this flashcard.";
    }

    if (action === "Mnemonics") {
      return card?.mnemonic ?? "Mnemonic opened for this flashcard.";
    }

    return card?.example ?? "Example opened for this flashcard.";
  }

  if (deckStatus === "loading") {
    return (
      <FlashcardsStatusScreen
        message="Preparing your flashcards..."
        onBack={() => router.push(filePageHref)}
      />
    );
  }

  if (deckStatus === "error" || deckStatus === "empty") {
    return (
      <FlashcardsStatusScreen
        message={deckErrorMessage ?? "Flashcards are unavailable for this file right now."}
        onBack={() => router.push(filePageHref)}
      />
    );
  }

  if (queueComplete || card == null) {
    return (
      <FlashcardsCompletionScreen
        flaggedCount={badCards.length}
        masteredCount={masteredIds.length}
        reviewedCount={completedCount}
        onBack={() => router.push(filePageHref)}
        onRestart={() => {
          setPendingInitial(cards.map((_, index) => index));
          setReviewQueue([]);
          setCompletedCount(0);
          setRevealed(false);
          setAssistantOpen(false);
          setSourceOpen(false);
          setActiveUtility(null);
          setHistory([]);
          setBadCards([]);
          setMasteredIds([]);
          setLastResolved(null);
          setNotice("Flashcards session restarted.");
        }}
      />
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
              pride-and-prejudice-jane-austen,1
            </h1>
            <p className="mt-1 text-[15px] leading-6 font-bold tracking-[0.01em] text-[#b8bfcb] dark:text-[#8391ad] md:text-[17px]">
              30/{completedCount}
            </p>
          </div>

          <RoundIconButton
            ariaLabel="Assistant"
            onClick={() => setAssistantOpen((current) => !current)}
          >
            <SparkleIcon />
          </RoundIconButton>
        </header>

        <div className="mt-4 grid gap-5 lg:grid-cols-[346px_minmax(0,1fr)] lg:items-start lg:gap-14">
          <aside className="hidden lg:block">
            <AssistantRail
              open={assistantOpen}
              activeUtility={activeUtility}
              revealed={revealed}
              card={card}
            />
          </aside>

          <section className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 px-1 text-[15px] font-semibold text-[#667085] dark:text-[#b5c2d8] md:gap-4">
              {utilityActions.map((action) => (
                <TopUtility
                  key={action}
                  label={action}
                  active={activeUtility === action}
                  onClick={() => {
                    setActiveUtility(action);
                    setSourceOpen(false);
                    setNotice(utilityCopy(action));
                  }}
                />
              ))}
            </div>

            <div className="mx-auto max-w-[760px] pt-5 md:pt-7">
              <div className="space-y-4">
                <div className="relative min-h-[420px] md:min-h-[480px]">
                  {previewCard ? (
                    <div className="pointer-events-none absolute inset-x-3 top-9 rounded-[30px] border border-[#edf1f7] bg-white/72 px-6 py-7 text-left shadow-[0_14px_40px_rgba(103,109,167,0.09)] dark:border-[#2b3952] dark:bg-[#182338]/72 md:inset-x-5">
                      <div className="max-w-[520px] text-[22px] leading-[1.45] font-bold text-[#273142] dark:text-white md:text-[28px]">
                        {previewCard.front}
                      </div>
                      <div className="mt-6 text-sm font-semibold text-[#98a2b3] dark:text-[#98abc8]">
                        Guess the answer then tab the card
                      </div>
                      <div className="mt-5 flex items-center gap-3">
                        <button
                          type="button"
                          tabIndex={-1}
                          className="rounded-[16px] bg-[linear-gradient(90deg,#71d05b_0%,#5db64b_100%)] px-5 py-3 text-sm font-bold text-white opacity-90 shadow-[inset_0_-2px_0_rgba(52,119,37,0.35)]"
                        >
                          Mastered
                        </button>
                        <button
                          type="button"
                          tabIndex={-1}
                          className="rounded-[16px] border border-[#dfe6f3] bg-white px-5 py-3 text-sm font-bold text-[#475467] shadow-[0_12px_28px_rgba(103,109,167,0.12)] dark:border-[#314059] dark:bg-[#162136]/90 dark:text-[#d7def0]"
                        >
                          Still Learning
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setRevealed((current) => !current)}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setRevealed((current) => !current); } }}
                    className={cn(
                      "relative z-10 w-full cursor-pointer rounded-[32px] border px-6 py-7 text-left shadow-[0_20px_60px_rgba(103,109,167,0.16)] transition duration-300 hover:translate-y-[-2px] hover:shadow-[0_26px_66px_rgba(103,109,167,0.18)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.32)] dark:hover:shadow-[0_28px_72px_rgba(0,0,0,0.36)] md:px-8 md:py-8",
                      previewCard ? "min-h-[360px]" : "",
                      revealed
                        ? "border-[#6a64ff] bg-[linear-gradient(180deg,#6a64ff_0%,#584ee7_100%)] text-white"
                        : "border-[#edf1f7] bg-white text-[#273142] dark:border-[#2b3952] dark:bg-[#182338] dark:text-white",
                    )}
                  >
                    {lastResolved?.action === "Still Learning" ? (
                      <div className="inline-flex rounded-full bg-[#fff3d8] px-3 py-1 text-[13px] font-bold text-[#c58815] dark:bg-[#3b2a12] dark:text-[#ffd16c]">
                        Try Again
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div className="max-w-[520px] text-[24px] leading-[1.45] font-bold md:text-[34px]">
                        {revealed ? card.back : card.front}
                      </div>
                      <div className="rounded-full bg-white/16 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/80 dark:bg-white/10">
                        {revealed ? "Answer" : "Prompt"}
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <div className="text-[16px] font-semibold text-[#667085] dark:text-[#cbd6ea]">
                          Guess the answer then tab the card
                        </div>
                        <div className="mt-2 text-sm text-[#98a2b3] dark:text-[#98abc8]">
                          {revealed
                            ? "Now decide whether it feels mastered or should come back later."
                            : `Remaining in session: ${remainingCount}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            advanceQueue("Mastered");
                          }}
                          className="rounded-[16px] bg-[linear-gradient(90deg,#71d05b_0%,#5db64b_100%)] px-5 py-3 text-sm font-bold text-white shadow-[inset_0_-2px_0_rgba(52,119,37,0.35)]"
                        >
                          Mastered
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            advanceQueue("Still Learning");
                          }}
                          className={cn(
                            "rounded-[16px] border px-5 py-3 text-sm font-bold shadow-[0_12px_28px_rgba(103,109,167,0.12)] dark:border-[#314059] dark:bg-[#162136]/90 dark:text-[#d7def0]",
                            revealed
                              ? "border-[#635ef6] bg-[#f5f4ff] text-[#5f62f2] dark:border-[#7d7bff] dark:bg-[#1c235d]"
                              : "border-[#dfe6f3] bg-white text-[#475467]",
                          )}
                        >
                          Still Learning
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div className="flex items-end gap-7">
                  <BottomAction
                    label="Ask Bito!"
                    active={assistantOpen}
                    onClick={() => setAssistantOpen((current) => !current)}
                  >
                    <AskBitoIcon />
                  </BottomAction>
                  <BottomAction
                    label="Source"
                    active={sourceOpen}
                    onClick={() => {
                      setSourceOpen((current) => !current);
                      setNotice("Source insight opened.");
                    }}
                  >
                    <SourceIcon />
                  </BottomAction>
                </div>

                <div className="flex items-end gap-6">
                  <BottomAction label="Undo" onClick={handleUndo}>
                    <UndoIcon />
                  </BottomAction>
                  <BottomAction label="Bad Flashcard" onClick={handleBadFlashcard}>
                    <FlagIcon active={badCards.includes(card.id)} />
                  </BottomAction>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {assistantOpen ? (
        <MobileAssistantSheet
          activeUtility={activeUtility}
          revealed={revealed}
          card={card}
          onClose={() => setAssistantOpen(false)}
        />
      ) : null}

      {sourceOpen ? (
        <OverlayPanel title="Source" onClose={() => setSourceOpen(false)}>
          <p className="text-[16px] leading-7 text-[#475467] dark:text-[#d7def0]">
            {card.source}
          </p>
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

function FlashcardsStatusScreen({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8faff_0%,#eef2fb_48%,#e8eef9_100%)] font-cairo text-[#344054] dark:bg-[radial-gradient(circle_at_top,#10192f_0%,#0d1528_42%,#09111f_100%)] dark:text-[#d7def0]">
      <div className="mx-auto flex min-h-screen max-w-[640px] items-center px-5 py-10">
        <div className="w-full rounded-[30px] border border-[#e2e8f4] bg-white/94 px-7 py-8 text-center shadow-[0_22px_58px_rgba(103,109,167,0.16)] dark:border-[#2a3953] dark:bg-[#182338]/96">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#eef2ff] text-[#6061f0] dark:bg-[#202c43] dark:text-[#b9b8ff]">
            <SparkleIcon />
          </div>
          <h1 className="mt-5 text-[26px] font-bold text-[#273142] dark:text-white">
            Flashcards unavailable
          </h1>
          <p className="mt-3 text-[16px] leading-7 text-[#667085] dark:text-[#b5c2d8]">
            {message}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-[16px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-5 py-3 text-base font-bold text-white shadow-[0_16px_34px_rgba(96,97,240,0.22)]"
          >
            Back to file
          </button>
        </div>
      </div>
    </main>
  );
}

function AssistantRail({
  open,
  activeUtility,
  revealed,
  card,
}: {
  open: boolean;
  activeUtility: (typeof utilityActions)[number] | null;
  revealed: boolean;
  card: Flashcard;
}) {
  return (
    <div className="rounded-[22px] border border-[#edf1f7] bg-white/92 p-4 shadow-[0_16px_42px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338]/92 dark:shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
      <div className="rounded-[18px] bg-[linear-gradient(180deg,#f0efff_0%,#f5f6ff_100%)] px-4 py-4 text-[16px] leading-8 text-[#334155] dark:bg-[linear-gradient(180deg,#122b4e_0%,#15243f_100%)] dark:text-[#edf2ff]">
        {open || activeUtility ? (
          <>
            <div className="font-bold">
              {activeUtility ? `${activeUtility} with Bito` : "Ask Bito!"}
            </div>
            <div className="mt-2 text-[15px] leading-7">
              {activeUtility === "Translate" ?"The flashcard can be translated while keeping the literary meaning intact."
                : activeUtility === "Explain"
                  ? card.explanation
                  : activeUtility === "Mnemonics"
                    ? card.mnemonic
                    : activeUtility === "Example"
                      ? card.example
                      : revealed
                        ? "Nice reveal. You can now decide whether this card feels mastered or still belongs in active review." :"Tap the card first, then I can help you unpack the answer or generate examples."}
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

      <div className="mt-6 border-t border-[#eef2f7] pt-6 dark:border-[#2b3952]">
        <div className="flex items-center gap-3 rounded-[14px] border border-[#dfe6f3] bg-white px-4 py-3 text-[#94a3b8] shadow-[0_10px_22px_rgba(117,130,164,0.08)] dark:border-[#314059] dark:bg-[#111b2f] dark:text-[#8fa3c2] dark:shadow-[0_10px_22px_rgba(0,0,0,0.25)]">
          <AskWandIcon />
          <span className="text-[18px]">Write your question here</span>
        </div>
      </div>
    </div>
  );
}

function TopUtility({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[14px] border px-4 py-2.5 text-[15px] font-semibold transition hover:translate-y-[-1px]",
        active
          ? "border-[#6a64ff] bg-[#f5f4ff] text-[#5f62f2] dark:border-[#7d7bff] dark:bg-[#1c235d] dark:text-[#c8c7ff]"
          : "border-[#edf1f7] bg-white text-[#667085] shadow-[0_10px_24px_rgba(117,130,164,0.1)] dark:border-[#26344e] dark:bg-[#182338] dark:text-[#d7def0] dark:shadow-[0_10px_24px_rgba(0,0,0,0.24)]",
      )}
    >
      {label}
    </button>
  );
}

function MobileAssistantSheet({
  activeUtility,
  revealed,
  card,
  onClose,
}: {
  activeUtility: (typeof utilityActions)[number] | null;
  revealed: boolean;
  card: Flashcard;
  onClose: () => void;
}) {
  return (
    <OverlayPanel title="Ask Bito!" onClose={onClose}>
      <p className="text-[16px] leading-7 text-[#475467] dark:text-[#d7def0]">
        {activeUtility
          ? activeUtility === "Explain"
            ? card.explanation
            : activeUtility === "Mnemonics"
              ? card.mnemonic
              : activeUtility === "Example"
                ? card.example
                : `Bito is focusing on ${activeUtility.toLowerCase()} for this flashcard right now.`
          : revealed
            ? "Now that the answer is revealed, Bito can help explain why the line matters." :"Flip the card first, then ask Bito for a deeper explanation, an example, or a mnemonic."}
      </p>
      <div className="mt-5 flex items-center gap-3 rounded-[14px] border border-[#dfe6f3] bg-[#f8faff] px-4 py-3 text-[#94a3b8] dark:border-[#314059] dark:bg-[#111b2f] dark:text-[#8fa3c2]">
        <AskWandIcon />
        <span className="text-[16px]">Write your question here</span>
      </div>
    </OverlayPanel>
  );
}

function FlashcardsCompletionScreen({
  flaggedCount,
  masteredCount,
  reviewedCount,
  onBack,
  onRestart,
}: {
  flaggedCount: number;
  masteredCount: number;
  reviewedCount: number;
  onBack: () => void;
  onRestart: () => void;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8faff_0%,#eef2fb_48%,#e8eef9_100%)] font-cairo text-[#344054] dark:bg-[radial-gradient(circle_at_top,#10192f_0%,#0d1528_42%,#09111f_100%)] dark:text-[#d7def0]">
      <div className="mx-auto min-h-screen max-w-[1080px] px-4 py-8 md:py-10">
        <div className="rounded-[32px] border border-[#e8edf7] bg-white/92 px-6 py-8 shadow-[0_24px_60px_rgba(96,97,240,0.14)] dark:border-[#243049] dark:bg-[#182338]/92 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#eef2ff] text-[#5f62f2] dark:bg-[#212b58] dark:text-[#c8c7ff]">
              <SparkleIcon />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#8a94a7] dark:text-[#a8b5ca]">
                Flashcards session complete
              </p>
              <h1 className="text-[28px] font-bold text-[#273142] dark:text-white">
                Nice work, your review queue is clear
              </h1>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <SummaryStatCard label="Reviewed" value={String(reviewedCount)} />
            <SummaryStatCard label="Mastered" value={String(masteredCount)} />
            <div className="col-span-2 md:col-span-1">
              <SummaryStatCard label="Flagged" value={String(flaggedCount)} />
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
      </div>
    </main>
  );
}

function SummaryStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#edf1f7] bg-[#f9fbff] px-5 py-5 dark:border-[#26344e] dark:bg-[#111a2f]">
      <div className="text-[14px] font-semibold text-[#8a94a7] dark:text-[#a8b5ca]">{label}</div>
      <div className="mt-2 text-[30px] leading-none font-bold text-[#273142] dark:text-white">
        {value}
      </div>
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
  onClick: () => void;
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

function SparkleIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]">
      <path
        d="m10 2 1.4 3.9L15 7.3l-3.6 1.4L10 12.6 8.6 8.7 5 7.3l3.6-1.4L10 2Z"
        fill="#7B67F7"
      />
      <path d="m15.5 12 0.7 2 1.8 0.7-1.8 0.7-0.7 2-0.7-2-1.8-0.7 1.8-0.7 0.7-2Z" fill="#9ED6FF" />
    </svg>
  );
}

function AskWandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#94a3b8]">
      <path
        d="m14.5 5.5 4 4M7 17l10.5-10.5a1.41 1.41 0 0 0-2-2L5 15m2 2-3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m3 6 1-2 1 2 2 1-2 1-1 2-1-2-2-1z" fill="currentColor" />
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
      <path d="M15.8 6.4 19 5l-1.5 3.3" stroke="#A6D4FF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SourceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7">
      <path d="M6.5 5.5h8a2 2 0 0 1 2 2v11h-8a2 2 0 0 0-2 2v-15Z" fill="#77C66E" />
      <path d="M8.5 8.5h6m-6 3h6m-6 3h4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7">
      <path
        d="M9 7 5 11l4 4m-4-4h9a4 4 0 1 1 0 8h-1"
        fill="none"
        stroke="#6F8FB5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlagIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-7">
      <path
        d="M7 20V5m0 0h8l-1.7 2.7L15 10H7"
        fill="none"
        stroke={active ? "#EF5350" : "#6F8FB5"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
