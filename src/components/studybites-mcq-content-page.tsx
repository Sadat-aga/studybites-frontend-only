"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTheme, type ThemePreference } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { uploadDocumentAndProcess } from "@/lib/documents";
import { saveMcqContentItem, useMcqContentData } from "@/lib/study-data";
import type { McqContentItem, McqStatus } from "@/types/auth";
import { cn } from "@/lib/utils";

type InfoPanel = "account" | "idea" | "updates" | "help";

export function StudybitesMcqContentPage() {
  const { logout, user } = useAuth();
  const params = useParams<{ fileId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [locale, setLocale] = useState("English");
  const [infoPanel, setInfoPanel] = useState<InfoPanel | null>(null);
  const [activeStat, setActiveStat] = useState("Remaining");
  const [search, setSearch] = useState("");
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<McqContentItem | null>(null);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [draftTag, setDraftTag] = useState("");
  const [draftDifficulty, setDraftDifficulty] = useState<McqContentItem["difficulty"]>("Easy");
  const [draftStatus, setDraftStatus] = useState<McqStatus>("Remaining");
  const [mobileInfoSlide, setMobileInfoSlide] = useState<0 | 1>(0);
  const [notice, setNotice] = useState("");
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const { document, progress, items, stats, setItems } = useMcqContentData(params?.fileId, user?.id);
  const [questions, setQuestions] = useState<McqContentItem[]>(items);

  useEffect(() => {
    setQuestions(items);
  }, [items]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  async function handleShare() {
    const sharePath = `/library/files/${document.id}/mcq/content`;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
      setNotice("MCQ content link copied.");
    } catch {
      setNotice("Share link ready.");
    }
  }

  const filteredQuestions = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return questions.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.question.toLowerCase().includes(normalized) ||
        item.answer.toLowerCase().includes(normalized) ||
        item.tag.toLowerCase().includes(normalized);

      if (!matchesSearch) return false;
      if (activeStat === "All") return true;
      return item.status === activeStat;
    });
  }, [activeStat, questions, search]);

  async function createQuestion() {
    if (!draftQuestion.trim() || !draftAnswer.trim()) return;

    const saved = await saveMcqContentItem(params?.fileId, user?.id, {
      id: `custom-${draftQuestion.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "question"}`,
      question: draftQuestion.trim(),
      answer: draftAnswer.trim(),
      tag: draftTag.trim() || "Custom Question",
      difficulty: draftDifficulty,
      status: draftStatus,
    });

    setQuestions((current) => [saved, ...current]);
    setItems((current) => [saved, ...current]);
    resetEditorState();
    setAddQuestionOpen(false);
    setNotice("Question added to the study set.");
  }

  async function saveEditedQuestion() {
    if (!editingQuestion || !draftQuestion.trim() || !draftAnswer.trim()) return;

    const saved = await saveMcqContentItem(params?.fileId, user?.id, {
      ...editingQuestion,
      question: draftQuestion.trim(),
      answer: draftAnswer.trim(),
      tag: draftTag.trim() || "Custom Question",
      difficulty: draftDifficulty,
      status: draftStatus,
    });

    setQuestions((current) => current.map((item) => (item.id === editingQuestion.id ? saved : item)));
    setItems((current) => current.map((item) => (item.id === editingQuestion.id ? saved : item)));
    setEditingQuestion(null);
    resetEditorState();
    setNotice("Question updated.");
  }

  function openEditQuestion(item: McqContentItem) {
    setEditingQuestion(item);
    setDraftQuestion(item.question);
    setDraftAnswer(item.answer);
    setDraftTag(item.tag);
    setDraftDifficulty(item.difficulty);
    setDraftStatus(item.status);
  }

  function resetEditorState() {
    setDraftQuestion("");
    setDraftAnswer("");
    setDraftTag("");
    setDraftDifficulty("Easy");
    setDraftStatus("Remaining");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff_0%,#f4f6fb_34%,#f6f8fc_100%)] font-cairo text-[#0f172a] dark:bg-[radial-gradient(circle_at_top,#111a32_0%,#0d1528_38%,#09111f_100%)] dark:text-[#edf2ff]">
      <div className="flex min-h-screen w-full">
        <McqMobileHeader
          locale={locale}
          title={document.slug}
          onMenuClick={() => setSidebarOpen(true)}
          onLocaleChange={(nextLocale) => {
            setLocale(nextLocale);
            setNotice(`Language changed to ${nextLocale}.`);
          }}
        />

        <div
          className={cn(
            "fixed inset-0 z-40 bg-[rgba(240,244,251,0.72)] backdrop-blur-[10px] dark:bg-[rgba(5,10,22,0.72)] lg:hidden",
            sidebarOpen || upgradeOpen || addQuestionOpen || editingQuestion ? "block" : "hidden",
          )}
          onClick={() => {
            setSidebarOpen(false);
            setUpgradeOpen(false);
            setAddQuestionOpen(false);
            setEditingQuestion(null);
            resetEditorState();
          }}
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-[342px] shrink-0 flex-col border-r border-[#eef1f8] bg-white/48 px-4 pt-[44px] pb-5 backdrop-blur-[24px] transition-transform duration-300 dark:border-[#22304a] dark:bg-[#0a1222]/74 lg:relative lg:w-[340px] lg:max-w-none lg:translate-x-0 lg:px-4 xl:w-[372px]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex items-center justify-between px-1">
            <Image
              src="/images/studybites/bito-sm.svg"
              alt="bito logo"
              width={54}
              height={34}
              className="h-[34px] w-auto -rotate-[8deg]"
            />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="rounded-xl p-2 text-[#6061f0] dark:text-[#7f7cff] lg:hidden"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mt-10 space-y-2">
            <SidebarAction label="Library" icon={<LibraryIcon />} href="/library" />
            <SidebarAction
              label="Profile"
              icon={<ProfileIcon />}
              onClick={() => {
                setProfileOpen((current) => !current);
                setNewMenuOpen(false);
              }}
            />
            {profileOpen ? (
              <ProfilePanel
                locale={locale}
                userName={user?.name ?? "Try Revive"}
                onLogout={logout}
                onLocaleChange={(nextLocale) => {
                  setLocale(nextLocale);
                  setNotice(`Language changed to ${nextLocale}.`);
                }}
                onOpenInfo={(panel) => setInfoPanel(panel)}
              />
            ) : null}
            <SidebarAction
              accent
              label="Upgrade"
              icon={<UpgradeIcon />}
              onClick={() => {
                setUpgradeOpen(true);
                setNewMenuOpen(false);
              }}
            />
          </div>

          <div className="mt-6 h-px bg-[#e8edf5] dark:bg-[#253248]" />

          <button
            type="button"
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left text-[16px] text-[#6061f0] transition hover:bg-[#f5f7ff] dark:text-[#9d9eff] dark:hover:bg-[#161f37]"
          >
            <span className="text-[#98a2b3]">
              <ChevronDownIcon />
            </span>
            <span className="text-[18px]">📚</span>
            <span className="truncate">{document.name}</span>
          </button>

          <div className="mt-2 rounded-xl bg-[linear-gradient(90deg,#eeecff_0%,#f5f6ff_100%)] px-4 py-3 text-[16px] text-[#6061f0] shadow-[0_10px_24px_rgba(96,97,240,0.06)] dark:bg-[linear-gradient(90deg,#1d1f64_0%,#181d54_100%)] dark:text-[#b7b5ff] dark:shadow-[0_14px_30px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-[#6a64ff]" />
              <span className="truncate">{document.slug}</span>
            </div>
          </div>

          <div className="mt-auto hidden lg:block">
            <div className="relative inline-block">
              {newMenuOpen ? (
                <div className="absolute bottom-14 left-0 z-20 flex min-w-[178px] flex-col gap-3">
                  <MiniAction
                    label="Upload Document"
                    icon={<UploadIcon />}
                    onClick={() => {
                      setNewMenuOpen(false);
                      uploadInputRef.current?.click();
                    }}
                  />
                  <MiniAction
                    label="Subject"
                    icon={<SubjectIcon />}
                    onClick={() => {
                      setNewMenuOpen(false);
                      setNotice("Create a new subject from the library page.");
                    }}
                  />
                </div>
              ) : null}
              <button
                type="button"
                className="flex items-center gap-3 rounded-full bg-transparent px-1 py-1 text-[31px] text-[#5d60ef] dark:text-[#7e7bff]"
                onClick={() => setNewMenuOpen((current) => !current)}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-white shadow-[0_10px_24px_rgba(95,98,242,0.28)]",
                    newMenuOpen ? "bg-[#6a64ff]" : "bg-[#5f62f2]",
                  )}
                >
                  {newMenuOpen ? <CloseMiniIcon /> : <PlusIcon />}
                </span>
                <span className="text-[31px] leading-none text-[#667085] dark:text-[#d5dcee]">
                  {newMenuOpen ? "" : "New"}
                </span>
              </button>
            </div>
          </div>
        </aside>

        <section
          className="relative min-h-screen flex-1 overflow-hidden"
          onClick={() => {
            setNewMenuOpen(false);
            setStreakOpen(false);
          }}
        >
          <input
            ref={uploadInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                setNotice("Upload dialog opened.");
                event.currentTarget.value = "";
                return;
              }

              void uploadDocumentAndProcess({
                userId: user?.id,
                file,
                existingFolderId: params?.fileId,
              })
                .then((result) => setNotice(`${result.fileName} uploaded. Processing started.`))
                .catch((error: unknown) =>
                  setNotice(error instanceof Error ? error.message : "Upload failed."),
                );
              event.currentTarget.value = "";
            }}
          />

          <div className="absolute top-[58px] right-4 z-20 lg:top-6 lg:right-6">
            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setStreakOpen((current) => !current);
                }}
                className="flex h-[44px] min-w-[76px] items-center justify-center gap-3 rounded-2xl border border-[#dfe6f3] bg-white/74 px-4 text-[18px] font-semibold text-[#98a2b3] shadow-[0_12px_28px_rgba(95,98,242,0.08)] backdrop-blur-xl transition hover:translate-y-[-1px] hover:shadow-[0_16px_30px_rgba(95,98,242,0.12)] dark:border-[#314059] dark:bg-[#162136]/90 dark:text-[#a7b6cf] dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_16px_30px_rgba(0,0,0,0.34)]"
              >
                <StreakIcon />
                <span className="text-[20px] leading-none text-[#98a2b3] dark:text-[#d9e2f0]">
                  0
                </span>
              </button>
              {streakOpen ? (
                <div className="absolute top-[54px] right-0 rounded-[16px] bg-white px-4 py-3 text-sm font-semibold text-[#475467] shadow-[0_18px_40px_rgba(103,109,167,0.16)] dark:bg-[#1a2640] dark:text-[#d7def0] dark:shadow-[0_20px_42px_rgba(0,0,0,0.35)]">
                  Let&apos;s start your streak!
                </div>
              ) : null}
            </div>
          </div>

          <div className="px-4 pt-[92px] pb-10 md:px-8 md:pt-[46px] xl:px-[38px]">
            <div className="mx-auto max-w-[980px] xl:mx-0 xl:max-w-none">
              <div className="mb-4 flex items-center justify-between">
                <Link
                  href="/library/files/6260097"
                  className="flex items-center gap-2 text-[17px] text-[#475467] no-underline dark:text-[#c5d0e2]"
                >
                  <BackChevron />
                  Back
                </Link>
              </div>

              <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-[#334155] dark:text-white md:text-[52px] md:leading-[1.08]">
                {document.slug}
              </h1>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {stats.map((stat) => (
                  <button
                    key={stat.label}
                    type="button"
                    onClick={() => setActiveStat(stat.label)}
                    className={cn(
                      "rounded-[16px] px-4 py-2.5 text-sm font-bold transition",
                      activeStat === stat.label
                        ? "bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] text-white shadow-[0_12px_28px_rgba(96,97,240,0.18)]"
                        : "border border-[#dfe6f3] bg-white text-[#667085] dark:border-[#314059] dark:bg-[#182338] dark:text-[#d7def0]",
                    )}
                  >
                    {stat.value} {stat.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-[#edf1f7] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(103,109,167,0.08)] dark:border-[#26344e] dark:bg-[#182338] dark:shadow-[0_12px_26px_rgba(0,0,0,0.24)]">
                <SearchIcon />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent text-[15px] text-[#475467] outline-none placeholder:text-[#98a2b3] dark:text-[#e6ecfb] dark:placeholder:text-[#8ea1bf]"
                />
              </div>

              <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-[64px]">
                <div className="flex-1">
                  <div className="space-y-4">
                    {filteredQuestions.map((item) => (
                      <McqQuestionCard
                        key={item.id}
                        item={item}
                        onEdit={() => openEditQuestion(item)}
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <Link
                      href="/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/exam"
                      className="rounded-[16px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-5 py-3.5 text-base font-bold text-white no-underline shadow-[0_16px_34px_rgba(96,97,240,0.22)]"
                    >
                      Start Learning
                    </Link>
                    <button
                      type="button"
                      onClick={() => setAddQuestionOpen(true)}
                      className="flex items-center gap-2 rounded-[16px] border border-[#dfe6f3] bg-white px-4 py-3.5 text-base font-bold text-[#475467] shadow-[0_12px_28px_rgba(103,109,167,0.12)] dark:border-[#314059] dark:bg-[#182338] dark:text-[#d7def0]"
                    >
                      <PlusSmallIcon />
                      Added question
                    </button>
                  </div>

                  <div className="mt-6 xl:hidden">
                    <MobileInfoDeck
                      activeSlide={mobileInfoSlide}
                      progress={progress}
                      onShare={handleShare}
                      onSlideChange={setMobileInfoSlide}
                    />
                  </div>
                </div>

                <aside className="hidden w-full xl:block xl:max-w-[270px]">
                  <ProgressPanel onShare={handleShare} progress={progress} />
                </aside>
              </div>
            </div>
          </div>
        </section>
      </div>

      {upgradeOpen ? (
        <ModalFrame onClose={() => setUpgradeOpen(false)}>
          <InfoModal
            title="Bites+"
            description="Upgrade checkout is mocked in this clone."
            actionLabel="Continue"
            onAction={() => {
              setNotice("Upgrade checkout is mocked in this clone.");
              setUpgradeOpen(false);
            }}
          />
        </ModalFrame>
      ) : null}

      {addQuestionOpen ? (
        <ModalFrame onClose={() => setAddQuestionOpen(false)}>
          <div className="rounded-[28px] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(96,97,240,0.16)] dark:bg-[#152139] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:px-10">
            <h2 className="text-center text-[24px] font-bold text-[#0f172a] dark:text-white">
              Added question
            </h2>
            <div className="mt-5 space-y-4">
              <EditorField label="Question" value={draftQuestion} onChange={setDraftQuestion} />
              <EditorField label="Answer" value={draftAnswer} onChange={setDraftAnswer} />
              <EditorField label="Tag" value={draftTag} onChange={setDraftTag} />
              <EditorSelect
                label="Difficulty"
                value={draftDifficulty}
                onChange={(value) => setDraftDifficulty(value as McqContentItem["difficulty"])}
                options={["Easy", "Medium", "Hard"]}
              />
              <EditorSelect
                label="Status"
                value={draftStatus}
                onChange={(value) => setDraftStatus(value as McqStatus)}
                options={["Remaining", "Still Learning", "Mastered"]}
              />
            </div>
            <button
              type="button"
              onClick={createQuestion}
              className="mt-6 h-[44px] w-full rounded-[14px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-4 text-base font-bold text-white shadow-[inset_0_-2px_0_rgba(67,48,171,0.45)]"
            >
              Save question
            </button>
          </div>
        </ModalFrame>
      ) : null}

      {editingQuestion ? (
        <ModalFrame
          onClose={() => {
            setEditingQuestion(null);
            resetEditorState();
          }}
        >
          <div className="rounded-[28px] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(96,97,240,0.16)] dark:bg-[#152139] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:px-10">
            <h2 className="text-center text-[24px] font-bold text-[#0f172a] dark:text-white">
              Edit question
            </h2>
            <div className="mt-5 space-y-4">
              <EditorField label="Question" value={draftQuestion} onChange={setDraftQuestion} />
              <EditorField label="Answer" value={draftAnswer} onChange={setDraftAnswer} />
              <EditorField label="Tag" value={draftTag} onChange={setDraftTag} />
              <EditorSelect
                label="Difficulty"
                value={draftDifficulty}
                onChange={(value) => setDraftDifficulty(value as McqContentItem["difficulty"])}
                options={["Easy", "Medium", "Hard"]}
              />
              <EditorSelect
                label="Status"
                value={draftStatus}
                onChange={(value) => setDraftStatus(value as McqStatus)}
                options={["Remaining", "Still Learning", "Mastered"]}
              />
            </div>
            <button
              type="button"
              onClick={saveEditedQuestion}
              className="mt-6 h-[44px] w-full rounded-[14px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-4 text-base font-bold text-white shadow-[inset_0_-2px_0_rgba(67,48,171,0.45)]"
            >
              Save changes
            </button>
          </div>
        </ModalFrame>
      ) : null}

      {infoPanel ? (
        <ModalFrame onClose={() => setInfoPanel(null)}>
          <InfoModal
            title={
              infoPanel === "account"
                ? "Account Overview"
                : infoPanel === "idea"
                  ? "Suggest an Idea"
                  : infoPanel === "updates"
                    ? "What's New?"
                    : "Help"
            }
            description={
              infoPanel === "account"
                ? "This clone keeps account actions lightweight. In the real app, this area leads into account details, usage, and plan management."
                : infoPanel === "idea"
                  ? "Idea submissions are mocked here. The real Studybites flow sends your suggestion to the product team."
                  : infoPanel === "updates"
                    ? "Release notes and product highlights are presented in this surface in the real app."
                    : "Help center and support shortcuts would open from here in the real app."
            }
            actionLabel="Continue"
            onAction={() => {
              setNotice(
                infoPanel === "idea"
                  ? "Suggestion flow opened."
                  : infoPanel === "updates"
                    ? "Release notes opened."
                    : infoPanel === "help"
                      ? "Help center opened."
                      : "Account overview opened.",
              );
              setInfoPanel(null);
            }}
          />
        </ModalFrame>
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

function McqMobileHeader({
  locale,
  title,
  onMenuClick,
  onLocaleChange,
}: {
  locale: string;
  title: string;
  onMenuClick: () => void;
  onLocaleChange: (locale: string) => void;
}) {
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-[52px] items-center justify-between border-b border-[#eef1f7] bg-white/82 px-5 backdrop-blur-2xl dark:border-[#22304a] dark:bg-[#0a1222]/88 lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="text-[#5d60ef] dark:text-[#7f7cff]"
      >
        <HamburgerIcon />
      </button>
      <div className="max-w-[230px] truncate text-[15px] font-semibold text-[#334155] dark:text-white">
        {title}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setLocaleMenuOpen((current) => !current);
          }}
          className="flex items-center gap-1.5 text-[14px] font-semibold text-[#5d60ef] dark:text-[#96a7ff]"
        >
          <Image
            src="/images/studybites/globe.svg"
            alt="Change locale"
            width={18}
            height={18}
            className="size-[18px]"
          />
          {locale}
        </button>
        {localeMenuOpen ? (
          <div className="absolute top-[40px] right-0 min-w-[150px] rounded-[16px] bg-white px-2 py-2 text-sm font-semibold text-[#475467] shadow-[0_18px_40px_rgba(103,109,167,0.16)] dark:bg-[#1a2640] dark:text-[#d7def0] dark:shadow-[0_20px_42px_rgba(0,0,0,0.35)]">
            {["English", "Arabic", "Turkish"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onLocaleChange(option);
                  setLocaleMenuOpen(false);
                }}
                className={cn(
                  "flex w-full rounded-xl px-3 py-2 text-left transition hover:bg-[#f5f7ff] dark:hover:bg-[#24314b]",
                  locale === option && "text-[#5d60ef] dark:text-[#9d9eff]",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function SidebarAction({
  label,
  icon,
  accent = false,
  onClick,
  href,
}: {
  label: string;
  icon: ReactNode;
  accent?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const className = cn(
    "flex w-full items-center gap-[10px] rounded-xl px-2 py-3 text-left text-[16px] transition hover:bg-[#f6f8ff] dark:hover:bg-[#161f37]",
    accent ? "text-[#34c8ff]" : "text-[#475467] dark:text-[#e5ebff]",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function McqQuestionCard({
  item,
  onEdit,
}: {
  item: McqContentItem;
  onEdit: () => void;
}) {
  return (
    <article className="rounded-[22px] border border-[#edf1f7] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338] dark:shadow-[0_16px_34px_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[18px] leading-8 font-bold text-[#1f2937] dark:text-white">
            {item.question}
          </h3>
          <p className="mt-2 text-[17px] leading-8 font-semibold text-[#475467] dark:text-[#d9e2f0]">
            {item.answer}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[#f5f7ff] text-[#6061f0] transition hover:bg-[#ecefff] dark:bg-[#202c43] dark:text-[#b9b8ff] dark:hover:bg-[#27344e]"
        >
          <EditIcon />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#667085] dark:text-[#b6c4dc]">
        <span className="flex items-center gap-2">
          <span>🏷️</span>
          {item.tag}
        </span>
        <span className="flex items-center gap-2">
          <span>🟢</span>
          {item.difficulty}
        </span>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[12px]",
            item.status === "Mastered"
              ? "bg-[#eaf8dc] text-[#6c9c30] dark:bg-[#1c3522] dark:text-[#a7d76a]"
              : item.status === "Still Learning"
                ? "bg-[#fff4d8] text-[#c68200] dark:bg-[#3a2c15] dark:text-[#f6c15c]"
                : "bg-[#eef2ff] text-[#6061f0] dark:bg-[#212b58] dark:text-[#b9b8ff]",
          )}
        >
          {item.status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          href="/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/exam"
          className="text-sm font-bold text-[#6061f0] no-underline dark:text-[#b9b8ff]"
        >
          Practice this question
        </Link>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-[#dfe6f3] px-3 py-1.5 text-xs font-bold text-[#475467] dark:border-[#314059] dark:text-[#d7def0]"
        >
          Edit details
        </button>
      </div>
    </article>
  );
}

function EditorSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#475467] dark:text-[#d7def0]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[44px] w-full rounded-[14px] border border-[#dfe6f3] bg-white px-4 text-[15px] text-[#334155] outline-none dark:border-[#334764] dark:bg-[#1a2941] dark:text-[#edf2ff]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MobileInfoDeck({
  activeSlide,
  progress,
  onShare,
  onSlideChange,
}: {
  activeSlide: 0 | 1;
  progress: import("@/types/auth").FileProgressMetric[];
  onShare: () => Promise<void>;
  onSlideChange: (slide: 0 | 1) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px]">
        <div
          className={cn(
            "flex transition-transform duration-300",
            activeSlide === 0 ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="w-full shrink-0">
            <ProgressPanel onShare={onShare} progress={progress} />
          </div>
          <div className="w-full shrink-0">
            <ShareCard onShare={onShare} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[0, 1].map((slide) => (
          <button
            key={slide}
            type="button"
            aria-label={`Go to slide ${slide + 1}`}
            onClick={() => onSlideChange(slide as 0 | 1)}
            className={cn(
              "h-2.5 rounded-full transition-all",
              activeSlide === slide
                ? "w-6 bg-[#6061f0] dark:bg-[#8c8bff]"
                : "w-2.5 bg-[#d3d9e9] dark:bg-[#394863]",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ProgressPanel({
  onShare,
  progress,
}: {
  onShare: () => Promise<void>;
  progress: import("@/types/auth").FileProgressMetric[];
}) {
  return (
    <div className="rounded-[28px] border border-[#edf1f7] bg-white px-4 py-4 shadow-[0_18px_44px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338] dark:shadow-[0_20px_46px_rgba(0,0,0,0.3)]">
      <div className="mb-3 flex justify-center">
        <ProgressFaces />
      </div>
      <div className="text-center text-[18px] font-bold text-[#334155] dark:text-white">
        Track Your Progress!
      </div>
      <div className="mt-6 space-y-5 rounded-[20px] border border-[#edf1f7] px-4 py-4 dark:border-[#2a3953]">
        {progress.map((metric) => (
          <ProgressRow key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
      <div className="mt-5">
        <ShareCard onShare={onShare} />
      </div>
    </div>
  );
}

function ShareCard({ onShare }: { onShare: () => Promise<void> }) {
  return (
    <div className="rounded-[22px] border border-[#edf1f7] bg-white px-4 py-4 text-center dark:border-[#2a3953] dark:bg-[#152139]">
      <div className="mb-2 flex justify-center">
        <ShareFaces />
      </div>
      <div className="text-[16px] font-bold text-[#334155] dark:text-white">
        Study Smarter, Together!
      </div>
      <div className="mt-2 text-sm text-[#98a2b3] dark:text-[#a8b5ca]">
        Share your set with friends
        <span className="ml-1">📚✨</span>
      </div>
      <button
        type="button"
        onClick={() => {
          void onShare();
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(90deg,#f0efff_0%,#f6f7ff_100%)] px-4 py-3 text-[15px] font-semibold text-[#6a64ff] dark:bg-[linear-gradient(90deg,#1e235d_0%,#20284e_100%)] dark:text-[#b9b8ff]"
      >
        <ShareIcon />
        Share
      </button>
    </div>
  );
}

function ProfilePanel({
  locale,
  userName,
  onLogout,
  onLocaleChange,
  onOpenInfo,
}: {
  locale: string;
  userName: string;
  onLogout: () => void;
  onLocaleChange: (locale: string) => void;
  onOpenInfo: (panel: InfoPanel) => void;
}) {
  const { themePreference, setThemePreference } = useTheme();
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  return (
    <div className="space-y-0 overflow-hidden rounded-[24px] bg-white px-4 py-4 shadow-[0_18px_40px_rgba(103,109,167,0.14)] transition-all duration-300 dark:bg-[#182338] dark:shadow-[0_22px_46px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={() => onOpenInfo("account")}
        className="flex w-full items-center justify-between rounded-[18px] bg-[linear-gradient(180deg,#efefff_0%,#f7f6ff_100%)] px-4 py-4 text-left dark:bg-[linear-gradient(180deg,#0d6689_0%,#0a5779_100%)]"
      >
        <div>
          <div className="text-[15px] text-[#475467] dark:text-white">{userName}</div>
          <div className="mt-0.5 text-[16px] text-[#475467] dark:text-white">
            <span className="font-bold">Daily Limit:</span> 0/3 document
          </div>
        </div>
        <ArrowRightIcon />
      </button>

      <div className="mt-3 space-y-0">
        <ProfileRow
          icon={<GlobeMiniIcon />}
          label="language"
          meta={`(${locale})`}
          active={languageOpen}
          onClick={() => {
            setLanguageOpen((current) => !current);
            setAppearanceOpen(false);
          }}
        />
        <Disclosure open={languageOpen}>
          {["English", "Arabic", "Turkish"].map((option) => (
            <ThemeOption
              key={option}
              label={option}
              active={locale === option}
              onClick={() => {
                onLocaleChange(option);
                setLanguageOpen(false);
              }}
            />
          ))}
        </Disclosure>

        <ProfileRow
          icon={<MoonMiniIcon />}
          label="Appearance"
          meta={themeLabel(themePreference)}
          active={appearanceOpen}
          onClick={() => {
            setAppearanceOpen((current) => !current);
            setLanguageOpen(false);
          }}
        />
        <Disclosure open={appearanceOpen}>
          <ThemeOption
            label="System Preference"
            active={themePreference === "system"}
            onClick={() => {
              setThemePreference("system");
              setAppearanceOpen(false);
            }}
          />
          <ThemeOption
            label="Dark"
            active={themePreference === "dark"}
            onClick={() => {
              setThemePreference("dark");
              setAppearanceOpen(false);
            }}
          />
          <ThemeOption
            label="Light"
            active={themePreference === "light"}
            onClick={() => {
              setThemePreference("light");
              setAppearanceOpen(false);
            }}
          />
        </Disclosure>
      </div>

      <div className="mt-3 border-t border-[#edf1f7] pt-3 dark:border-[#2a3650]">
        <ProfileRow icon={<LightbulbMiniIcon />} label="Suggest an Idea" onClick={() => onOpenInfo("idea")} />
        <ProfileRow icon={<SparklesMiniIcon />} label="What's New?" onClick={() => onOpenInfo("updates")} />
        <ProfileRow icon={<HelpMiniIcon />} label="Help" onClick={() => onOpenInfo("help")} />
      </div>

      <div className="mt-3 border-t border-[#edf1f7] pt-3 dark:border-[#2a3650]">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left text-[15px] text-[#475467] dark:text-[#d7def0]"
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </div>
  );
}

function Disclosure({
  children,
  open,
}: {
  children: ReactNode;
  open: boolean;
}) {
  return (
    <div
      className={cn(
        "grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300",
        open ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0">
        <div className="space-y-3 rounded-[18px] bg-[#f6f7ff] px-4 py-4 text-[15px] text-[#475467] dark:bg-[#202c43] dark:text-[#d7def0]">
          {children}
        </div>
      </div>
    </div>
  );
}

function EditorField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#0f172a] dark:text-[#dce5f4]">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-[44px] w-full rounded-[14px] border border-[#d9defb] bg-white px-4 text-base text-[#1f2937] outline-none focus:border-[#7a7ff5] dark:border-[#334764] dark:bg-[#1a2941] dark:text-white"
      />
    </div>
  );
}

function InfoModal({
  actionLabel,
  description,
  onAction,
  title,
}: {
  actionLabel: string;
  description: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className="rounded-[28px] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(96,97,240,0.16)] dark:bg-[#152139] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:px-10">
      <h2 className="text-center text-[24px] font-bold text-[#0f172a] dark:text-white">
        {title}
      </h2>
      <p className="mt-4 text-center text-sm leading-7 text-[#667085] dark:text-[#b7c5db]">
        {description}
      </p>
      <button
        type="button"
        onClick={onAction}
        className="mt-6 h-[44px] w-full rounded-[14px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-4 text-base font-bold text-white shadow-[inset_0_-2px_0_rgba(67,48,171,0.45)]"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[15px] text-[#64748b] dark:text-[#c6d2e7]">
        <div className="flex items-center gap-2">
          <span className="text-[#94a3b8] dark:text-[#9fb1cf]">
            {label === "MCQs" ? <McqMiniIcon /> : <CardMiniIcon />}
          </span>
          {label}
        </div>
        <span className="font-semibold text-[#94a3b8] dark:text-[#9fb1cf]">{value}</span>
      </div>
      <div className="h-[7px] rounded-full bg-[#eeecff] dark:bg-[#2a3550]">
        <div
          className={cn(
            "h-[7px] rounded-full bg-[#9ad25b] dark:bg-[#92cf60]",
            label === "MCQs" ? "w-[23%]" : "w-[40%]",
          )}
        />
      </div>
    </div>
  );
}

function MiniAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-full bg-white/98 px-4 py-3 text-left text-[15px] text-[#64748b] shadow-[0_14px_30px_rgba(103,109,167,0.14)] transition hover:bg-white dark:bg-[#1d2940] dark:text-[#d5def0] dark:shadow-[0_14px_30px_rgba(0,0,0,0.34)]"
    >
      {icon}
      {label}
    </button>
  );
}

function ModalFrame({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div
        className="absolute inset-0 bg-[rgba(248,250,255,0.72)] backdrop-blur-[10px] dark:bg-[rgba(4,8,18,0.72)]"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center px-4 py-4 sm:items-center sm:py-8">
        <div className="relative z-10 w-full max-w-[520px] max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-h-[calc(100vh-4rem)]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 rounded-xl p-1.5 text-[#c0c6d1] dark:text-[#71829f]"
          >
            <CloseIcon />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  meta,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-1 py-2 text-left text-[15px] text-[#475467] dark:text-[#d7def0]",
        active && "text-[#5d60ef] dark:text-[#9d9eff]",
      )}
    >
      <span className="flex items-center gap-3">
        <span className="text-[15px]">{icon}</span>
        <span>{label}</span>
      </span>
      <span className="flex items-center gap-2 text-sm text-[#667085] dark:text-[#b2c0d7]">
        {meta ? <span>{meta}</span> : null}
        <ArrowRightIcon />
      </span>
    </button>
  );
}

function ThemeOption({
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
        "block text-left transition",
        active && "text-[#5d60ef] dark:text-[#9d9eff]",
      )}
    >
      {label}
    </button>
  );
}

function themeLabel(themePreference: ThemePreference) {
  if (themePreference === "dark") return "(Dark)";
  if (themePreference === "light") return "(Light)";
  return "(System Preference)";
}

function LibraryIcon() {
  return (
    <svg viewBox="0 0 20 19" className="size-5">
      <path
        fill="#6B7280"
        d="M.36 16.078c0 1.243.608 1.866 1.853 1.866h10.514q1.854 0 1.852-1.866V3.073c0-1.244-.615-1.871-1.852-1.871h-1.571c-1.238 0-1.854.627-1.854 1.871v2.978a2.3 2.3 0 0 0-.49-.057H5.64c-.187 0-.35.024-.5.057v-.853c0-1.243-.609-1.872-1.847-1.872h-1.08c-1.245 0-1.854.63-1.854 1.872zm1.412-.184V5.376c0-.413.217-.637.65-.637h.663c.432 0 .643.224.643.637V16.53H2.42c-.432 0-.649-.225-.649-.637m3.368.637V8.043c0-.413.218-.636.65-.636h2.87c.431 0 .642.223.642.636v8.488zm5.575 0V3.251c0-.413.217-.637.65-.637h1.153c.437 0 .648.224.648.637v12.643c0 .412-.21.637-.648.637zm-4.947-7.71a.48.48 0 0 0 .493.487h1.953a.48.48 0 0 0 .486-.487.48.48 0 0 0-.486-.483H6.26a.477.477 0 0 0-.493.483m0 6.297c0 .275.205.488.493.488h1.953a.48.48 0 0 0 .486-.488.48.48 0 0 0-.486-.484H6.26a.48.48 0 0 0-.493.484m9.229 1.2c.144 1.229.81 1.807 2.045 1.65l.904-.11c1.236-.156 1.763-.822 1.631-2.051L18.355 4.803c-.137-1.229-.81-1.813-2.046-1.65l-.903.11c-1.243.162-1.776.82-1.638 2.051zm1.383-.338L15.195 5.343c-.047-.412.141-.644.573-.704l.487-.06c.432-.059.67.148.718.555l1.185 10.637c.047.417-.143.645-.569.704l-.499.066c-.421.06-.663-.141-.71-.56"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 17 18" className="size-5">
      <g fill="none" stroke="#667085" strokeWidth="1.619">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.66 11.025c-1.003.597-3.63 1.815-2.03 3.34.782.745 1.652 1.277 2.747 1.277h6.246c1.095 0 1.966-.532 2.747-1.277 1.6-1.525-1.027-2.743-2.03-3.34a7.55 7.55 0 0 0-7.68 0"
        />
        <path d="M11.688 4.663a3.188 3.188 0 1 1-6.376 0 3.188 3.188 0 0 1 6.376 0Z" />
      </g>
    </svg>
  );
}

function UpgradeIcon() {
  return (
    <svg viewBox="0 0 21 23" className="size-5">
      <path
        fill="#3BC8FF"
        d="M6.101 3.197c.459-.354.688-.53.953-.644a2.4 2.4 0 0 1 .373-.125c.283-.069.583-.069 1.182-.069h3.793c.599 0 .899 0 1.181.07q.193.045.373.124c.265.114.495.29.954.644 1.52 1.17 2.28 1.755 2.54 2.513.117.337.16.692.128 1.044-.07.792-.67 1.517-1.871 2.967l-2.829 3.416c-1.089 1.315-1.633 1.972-2.373 1.972s-1.284-.657-2.373-1.972L5.304 9.72c-1.2-1.45-1.8-2.175-1.872-2.967A2.5 2.5 0 0 1 3.56 5.71c.26-.758 1.02-1.343 2.541-2.513"
      />
    </svg>
  );
}

function StreakIcon() {
  return (
    <svg viewBox="0 0 15 21" className="size-[18px]">
      <path
        fill="#C8CDD6"
        d="M9.875 10.507c1.004-.376 1.256-1.723 1.322-3.041 6.398 8.988.887 13.793-4.07 13.452-9.941-.684-5.61-10.057-3.365-12.53C5.431 6.55 5.178 2.192 5.178 2.192c1.818-.215 6.507 6.699 4.697 8.315"
      />
      <path
        fill="#E0E5EC"
        d="M6.181 13.943c-.435-.163-.545-.748-.574-1.32-2.778 3.903-.385 5.99 1.768 5.842 4.318-.297 2.437-4.368 1.461-5.442-.724-.798-.615-2.69-.615-2.69-.79-.094-2.826 2.908-2.04 3.61"
      />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 18" className="h-[18px] w-6">
      <path fill="currentColor" d="M2 17h20v-2H2zm0-7.5h20v-2H2zM2 2v2h20V2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5">
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-[#98a2b3]">
      <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackChevron() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 text-[#64748b]">
      <path d="M8.5 1.5 4 6l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 text-[#98a2b3]">
      <path d="m8 5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5 text-[#98a2b3]">
      <path d="m14.5 14.5 3 3M8.75 15a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4">
      <path d="m12.9 2.6 2.5 2.5M3.5 14.5l2.8-.4 8-8a1 1 0 0 0 0-1.4l-1.8-1.8a1 1 0 0 0-1.4 0l-8 8-.4 2.8Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function PlusSmallIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#5d60ef]">
      <path d="M12 15V6m0 0-3 3m3-3 3 3M5 17.5h14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubjectIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#5d60ef]">
      <path d="M7 5.5h9.5A2.5 2.5 0 0 1 19 8v10.5H9.5A2.5 2.5 0 0 0 7 21.5zm0 0A2.5 2.5 0 0 0 4.5 8v10.5H7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4">
      <path d="M9.75 3.25 14 7.5m0 0-4.25 4.25M14 7.5H4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function McqMiniIcon() {
  return <span>❓</span>;
}

function CardMiniIcon() {
  return <span>🗂️</span>;
}

function GlobeMiniIcon() {
  return <span>🌐</span>;
}

function MoonMiniIcon() {
  return <span>🌙</span>;
}

function LightbulbMiniIcon() {
  return <span>💡</span>;
}

function SparklesMiniIcon() {
  return <span>✨</span>;
}

function HelpMiniIcon() {
  return <span>🛟</span>;
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 text-[#ef6a6a]">
      <path d="M8 4.5H5.8A1.8 1.8 0 0 0 4 6.3v7.4a1.8 1.8 0 0 0 1.8 1.8H8m4-8 3 2.5-3 2.5M15 10H8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProgressFaces() {
  return (
    <div className="flex -space-x-2">
      <span className="flex size-10 items-center justify-center rounded-full bg-[#ffd966] text-lg">😊</span>
      <span className="flex size-10 items-center justify-center rounded-full bg-[#9fd7ff] text-lg">🤓</span>
      <span className="flex size-10 items-center justify-center rounded-full bg-[#ffe7ba] text-lg">✨</span>
    </div>
  );
}

function ShareFaces() {
  return (
    <div className="flex -space-x-3">
      <span className="flex size-10 items-center justify-center rounded-full bg-[#ffe0c4] text-base">🙂</span>
      <span className="flex size-10 items-center justify-center rounded-full bg-[#c9f0ff] text-base">😄</span>
      <span className="flex size-10 items-center justify-center rounded-full bg-[#d9ccff] text-base">🤝</span>
    </div>
  );
}

function CloseMiniIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5">
      <path d="M5 5l10 10M15 5 5 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
