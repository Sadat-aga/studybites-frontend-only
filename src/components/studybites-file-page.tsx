"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode, type UIEvent } from "react";
import { useTheme, type ThemePreference } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { uploadDocumentAndProcess } from "@/lib/documents";
import { useFilePageData } from "@/lib/study-data";
import { cn } from "@/lib/utils";

export function StudybitesFilePage() {
  const { logout, user } = useAuth();
  const params = useParams<{ fileId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState<null | "MCQs" | "Flashcards" | "Document">(
    null,
  );
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [mobileTopSlide, setMobileTopSlide] = useState<0 | 1>(0);
  const [notice, setNotice] = useState("");
  const [locale, setLocale] = useState("English");
  const [infoPanel, setInfoPanel] = useState<null | "account" | "idea" | "updates" | "help">(
    null,
  );
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const mobileTopDeckRef = useRef<HTMLDivElement | null>(null);
  const { document, activities, progress } = useFilePageData(params?.fileId, user?.id);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  async function handleShare() {
    const sharePath = `/library/files/${document.id}`;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
      setNotice("Link has been copied successfully");
    } catch {
      setNotice("Share link ready");
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff_0%,#f4f6fb_34%,#f6f8fc_100%)] font-cairo text-[#0f172a] dark:bg-[radial-gradient(circle_at_top,#111a32_0%,#0d1528_38%,#09111f_100%)] dark:text-[#edf2ff]">
      <div className="flex min-h-screen w-full">
        <FileMobileHeader
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
            sidebarOpen || upgradeOpen ? "block" : "hidden",
          )}
          onClick={() => {
            setSidebarOpen(false);
            setUpgradeOpen(false);
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
            <SidebarAction
              label="Library"
              icon={<LibraryIcon />}
              onClick={() => {
                setProfileOpen(false);
                setNewMenuOpen(false);
              }}
              href="/library"
            />
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
                onOpenInfo={(nextPanel) => setInfoPanel(nextPanel)}
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
            setFileMenuOpen(false);
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
                className="flex h-[40px] min-w-[72px] items-center justify-center gap-2.5 rounded-2xl border border-[#dfe6f3] bg-white/74 px-3.5 text-[16px] font-semibold text-[#98a2b3] shadow-[0_12px_28px_rgba(95,98,242,0.08)] backdrop-blur-xl transition hover:translate-y-[-1px] hover:shadow-[0_16px_30px_rgba(95,98,242,0.12)] dark:border-[#314059] dark:bg-[#162136]/90 dark:text-[#a7b6cf] dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_16px_30px_rgba(0,0,0,0.34)] lg:h-[44px] lg:min-w-[76px] lg:gap-3 lg:px-4 lg:text-[18px]"
              >
                <StreakIcon />
                <span className="text-[18px] leading-none text-[#98a2b3] dark:text-[#d9e2f0] lg:text-[20px]">
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

          <div className="px-3.5 pt-[86px] pb-10 md:px-8 md:pt-[46px] xl:px-[38px]">
            <div className="mx-auto max-w-[1180px] xl:mx-0 xl:max-w-none">
              <div className="mb-3 flex items-center justify-between lg:mb-4">
                <Link
                  href="/library"
                  className="hidden items-center gap-2 text-[17px] text-[#475467] no-underline dark:text-[#c5d0e2] lg:flex"
                >
                  <BackChevron />
                  Back
                </Link>
              </div>

              <h1 className="hidden text-[28px] leading-tight font-semibold tracking-[-0.02em] text-[#334155] dark:text-white md:text-[52px] md:leading-[1.08] lg:block">
                {document.slug}
              </h1>

              <div className="mt-1 lg:hidden">
                <MobileTopDeck
                  activeSlide={mobileTopSlide}
                  deckRef={mobileTopDeckRef}
                  progress={progress}
                  onShare={handleShare}
                  onScroll={(event) => {
                    const target = event.currentTarget;
                    const slideWidth = target.clientWidth;
                    if (!slideWidth) {
                      return;
                    }
                    const nextSlide = Math.round(target.scrollLeft / slideWidth);
                    setMobileTopSlide(nextSlide === 0 ? 0 : 1);
                  }}
                  onSlideChange={(slide) => {
                    setMobileTopSlide(slide);
                    mobileTopDeckRef.current?.scrollTo({
                      left: mobileTopDeckRef.current.clientWidth * slide,
                      behavior: "smooth",
                    });
                  }}
                />
              </div>

              <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8 xl:gap-[64px]">
                <div className="flex-1">
                  <h2 className="text-[18px] font-semibold text-[#64748b] dark:text-[#b5c2d8]">
                    Learning Activities
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-3.5 md:gap-5">
                    <ActivityCard
                      title="MCQs"
                      description="40 Questions"
                      ctaLabel="Practice"
                      href={activities[0]?.href}
                      editHref="/library/files/6260097/mcq/content"
                      tone="indigo"
                      icon={<McqArtwork />}
                    />
                    <ActivityCard
                      title="Flashcards"
                      description="30 Flashcards"
                      ctaLabel="Memorize"
                      href={activities[1]?.href}
                      tone="blue"
                      onEdit={() => setEditorOpen("Flashcards")}
                      icon={<FlashcardsArtwork />}
                    />
                    <ActivityCard
                      title="Summaries"
                      description="1 Summary"
                      ctaLabel="Recap"
                      tone="pink"
                      href={activities[2]?.href}
                      icon={<SummaryArtwork />}
                    />
                    <ActivityCard
                      title="Mind Maps"
                      description=""
                      ctaLabel="Coming Soon"
                      tone="muted"
                      disabled
                      icon={<MindMapArtwork />}
                    />
                  </div>

                  <div className="mt-6 hidden lg:block">
                    <div className="text-[18px] font-semibold text-[#64748b] dark:text-[#b5c2d8]">
                      Document
                    </div>
                    <DocumentCard
                      document={document}
                      menuOpen={fileMenuOpen}
                      onCopyLink={async () => {
                        setFileMenuOpen(false);
                        await handleShare();
                      }}
                      onEdit={() => {
                        setFileMenuOpen(false);
                        setEditorOpen("Document");
                      }}
                      onToggleMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setFileMenuOpen((current) => !current);
                      }}
                    />
                  </div>

                  <div className="mt-5 lg:hidden">
                    <div>
                      <div className="text-[18px] font-semibold text-[#64748b] dark:text-[#b5c2d8]">
                        Document
                      </div>
                      <DocumentCard
                        document={document}
                        menuOpen={fileMenuOpen}
                        onCopyLink={async () => {
                          setFileMenuOpen(false);
                          await handleShare();
                        }}
                        onEdit={() => {
                          setFileMenuOpen(false);
                          setEditorOpen("Document");
                        }}
                        onToggleMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setFileMenuOpen((current) => !current);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <aside className="hidden w-full lg:block lg:max-w-[258px] xl:max-w-[270px]">
                  <ProgressPanel onShare={handleShare} progress={progress} />
                </aside>
              </div>
            </div>
          </div>
        </section>
      </div>

      {upgradeOpen ? (
        <ModalFrame onClose={() => setUpgradeOpen(false)}>
          <div className="rounded-[30px] bg-white p-5 shadow-[0_25px_80px_rgba(96,97,240,0.18)] dark:bg-[#152139] dark:shadow-[0_25px_80px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="mx-auto rounded-[28px] bg-[linear-gradient(180deg,#dff5ff_0%,#d8f0ff_100%)] px-4 pb-5 pt-7 text-center dark:bg-[linear-gradient(180deg,#0d3856_0%,#102b44_100%)] sm:px-6">
              <div className="mx-auto -mt-14 mb-2 flex size-[72px] items-center justify-center rounded-full bg-white shadow-[0_10px_28px_rgba(96,97,240,0.12)] dark:bg-[#1c2a43] dark:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
                <span className="text-[44px]">💎</span>
              </div>
              <h2 className="text-[42px] leading-none font-bold text-[#17a8ef]">Bites+</h2>
              <p className="mt-2 text-[18px] font-semibold text-[#1f2937] dark:text-white sm:text-[20px]">
                Study Smarter with Bites+
              </p>
              <div className="mt-8 overflow-hidden rounded-[20px] bg-white/70 dark:bg-[#15253a]/80">
                <UpgradeRow icon="📚" label="Number of pages" base="20" baseMeta="Pages \\ Document" plus="200" plusMeta="Pages \\ Document" />
                <UpgradeRow icon="📤" label="Daily Limit" base="3" baseMeta="Documents \\ Day" plus="50" plusMeta="Documents \\ Day" />
                <UpgradeRow icon="🤖" label="Chat" base="10" baseMeta="Messages \\ Day" plus="∞" plusMeta="" />
                <UpgradeRow icon="📄" label="Document Size" base="30" baseMeta="MB" plus="50" plusMeta="MB" />
                <UpgradeRow icon="💡" label="Explanations" base="5" baseMeta="Explanations \\ Day" plus="∞" plusMeta="" />
                <UpgradeRow icon="🌍" label="Translations" base="5" baseMeta="Translations \\ Day" plus="∞" plusMeta="" />
                <UpgradeRow icon="⚡️" label="Fast processing" base="✕" baseMeta="" plus="✓" plusMeta="" />
              </div>
            <button
              type="button"
              onClick={() => {
                setNotice("Upgrade checkout is mocked in this clone.");
                setUpgradeOpen(false);
              }}
              className="mt-6 w-full rounded-[16px] bg-[linear-gradient(180deg,#20b5f5_0%,#169fe4_100%)] px-5 py-3.5 text-base font-bold text-white shadow-[0_18px_34px_rgba(32,181,245,0.22)]"
            >
              Get Bites+
            </button>
              <p className="mt-3 text-sm text-[#667085] dark:text-[#b7c5db]">
                Starting at 16.6 SR / Month • Cancel anytime
              </p>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {editorOpen ? (
        <ModalFrame onClose={() => setEditorOpen(null)}>
          <div className="rounded-[28px] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(96,97,240,0.16)] dark:bg-[#152139] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:px-10">
            <h2 className="text-center text-[24px] font-bold text-[#0f172a] dark:text-white">
              {editorOpen} Editor
            </h2>
            <p className="mt-4 text-center text-sm text-[#667085] dark:text-[#b7c5db]">
              The real app opens a dedicated editing surface here. This clone keeps the flow
              lightweight and confirms the action with a mock editor entry point.
            </p>
            <button
              type="button"
              onClick={() => {
                setNotice(`${editorOpen} editor opened.`);
                setEditorOpen(null);
              }}
              className="mt-6 h-[44px] w-full rounded-[14px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-4 text-base font-bold text-white shadow-[inset_0_-2px_0_rgba(67,48,171,0.45)]"
            >
              Continue
            </button>
          </div>
        </ModalFrame>
      ) : null}

      {infoPanel ? (
        <ModalFrame onClose={() => setInfoPanel(null)}>
          <div className="rounded-[28px] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(96,97,240,0.16)] dark:bg-[#152139] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:px-10">
            <h2 className="text-center text-[24px] font-bold text-[#0f172a] dark:text-white">
              {infoPanel === "account"
                ? "Account Overview"
                : infoPanel === "idea"
                  ? "Suggest an Idea"
                  : infoPanel === "updates"
                    ? "What's New?"
                    : "Help"}
            </h2>
            <p className="mt-4 text-center text-sm leading-7 text-[#667085] dark:text-[#b7c5db]">
              {infoPanel === "account"
                ? "This clone keeps account actions lightweight. In the real app, this area leads into account details, usage, and plan management."
                : infoPanel === "idea"
                  ? "Idea submissions are mocked here. The real Studybites flow sends your suggestion to the product team."
                  : infoPanel === "updates"
                    ? "Release notes and product highlights are presented in this surface in the real app."
                    : "Help center and support shortcuts would open from here in the real app."}
            </p>
            <button
              type="button"
              onClick={() => {
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
              className="mt-6 h-[44px] w-full rounded-[14px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-4 text-base font-bold text-white shadow-[inset_0_-2px_0_rgba(67,48,171,0.45)]"
            >
              Continue
            </button>
          </div>
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

function FileMobileHeader({
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
          aria-label="Open language menu"
          className="flex size-7 items-center justify-center rounded-full text-[#5d60ef] dark:text-[#96a7ff]"
        >
          <MoreVerticalIcon />
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

function ProgressPanel({
  onShare,
  progress,
}: {
  onShare: () => Promise<void>;
  progress: import("@/types/auth").FileProgressMetric[];
}) {
  return (
    <div className="rounded-[28px] border border-[#edf1f7] bg-white px-4 py-4 shadow-[0_18px_44px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338] dark:shadow-[0_20px_46px_rgba(0,0,0,0.3)]">
      <ProgressCard progress={progress} />
      <div className="mt-5">
        <ShareCard onShare={onShare} />
      </div>
    </div>
  );
}

function ProgressCard({ progress }: { progress: import("@/types/auth").FileProgressMetric[] }) {
  return (
    <>
      <div className="mb-3 flex justify-center">
        <ProgressFaces />
      </div>
      <div className="text-center text-[18px] font-bold text-[#334155] dark:text-white">
        Track Your Progress!
      </div>
      <div className="mt-5 space-y-5 rounded-[20px] border border-[#edf1f7] px-4 py-4 dark:border-[#2a3953]">
        {progress.map((metric) => (
          <ProgressRow key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
    </>
  );
}

function ShareCard({ onShare }: { onShare: () => Promise<void> }) {
  return (
    <div className="min-h-[172px] rounded-[28px] border border-[#edf1f7] bg-white px-4 py-4 shadow-[0_18px_44px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338] dark:shadow-[0_20px_46px_rgba(0,0,0,0.3)]">
      <div className="rounded-[20px] border border-[#edf1f7] px-4 py-4 text-center dark:border-[#2a3953]">
        <div className="mb-2 flex justify-center">
          <ShareFaces />
        </div>
        <div className="text-[16px] font-bold text-[#334155] dark:text-white">
          Study Smarter, Together!
        </div>
        <div className="mt-2 text-[14px] text-[#98a2b3] dark:text-[#a8b5ca]">
          Share your set with friends
          <span className="ml-1">📚✨</span>
        </div>
        <button
          type="button"
          onClick={() => {
            void onShare();
          }}
          className="mt-4 flex h-[36px] w-full items-center justify-center gap-2 rounded-[12px] bg-[linear-gradient(90deg,#f0efff_0%,#f6f7ff_100%)] px-4 text-[14px] font-semibold text-[#6a64ff] dark:bg-[linear-gradient(90deg,#1e235d_0%,#20284e_100%)] dark:text-[#b9b8ff]"
        >
          <ShareIcon />
          Share
        </button>
      </div>
    </div>
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
  onClick: () => void;
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
  onOpenInfo: (panel: "account" | "idea" | "updates" | "help") => void;
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
        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300",
            languageOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0">
            <div className="rounded-[18px] bg-[#f6f7ff] px-4 py-4 dark:bg-[#202c43]">
              <div className="space-y-3 text-[15px] text-[#475467] dark:text-[#d7def0]">
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
              </div>
            </div>
          </div>
        </div>
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
        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300",
            appearanceOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0">
            <div className="rounded-[18px] bg-[#f6f7ff] px-4 py-4 dark:bg-[#202c43]">
              <div className="space-y-3 text-[15px] text-[#475467] dark:text-[#d7def0]">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#edf1f7] pt-3 dark:border-[#2a3650]">
        <ProfileRow
          icon={<LightbulbMiniIcon />}
          label="Suggest an Idea"
          onClick={() => onOpenInfo("idea")}
        />
        <ProfileRow
          icon={<SparklesMiniIcon />}
          label="What's New?"
          onClick={() => onOpenInfo("updates")}
        />
        <ProfileRow
          icon={<HelpMiniIcon />}
          label="Help"
          onClick={() => onOpenInfo("help")}
        />
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

function DocumentCard({
  document,
  menuOpen,
  onCopyLink,
  onEdit,
  onToggleMenu,
}: {
  document: import("@/types/auth").LibraryDocument;
  menuOpen: boolean;
  onCopyLink: () => void | Promise<void>;
  onEdit: () => void;
  onToggleMenu: (event: MouseEvent<HTMLButtonElement>) => void;
}) {

  return (
    <a
      href="https://bites0production0storage.blob.core.windows.net/bites-production-blob-container/input/7a3523da-0360-4e88-90af-4cf8401b59bb.pdf"
      target="_blank"
      rel="noreferrer"
      className="relative mt-3 flex items-center justify-between rounded-[18px] border border-[#edf1f7] bg-white px-4 py-3 shadow-[0_14px_32px_rgba(103,109,167,0.12)] no-underline transition hover:translate-y-[-1px] hover:shadow-[0_18px_36px_rgba(103,109,167,0.16)] dark:border-[#26344e] dark:bg-[#182338] dark:shadow-[0_16px_34px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_18px_40px_rgba(0,0,0,0.34)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-[13px] bg-[#f8fafc] text-[#667085] shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)] dark:bg-[#202d44] dark:text-[#c6d2e7] dark:shadow-[inset_0_0_0_1px_rgba(58,72,99,0.9)]">
          <DocumentIcon />
        </div>
        <div>
          <div className="text-[16px] font-semibold text-[#475467] dark:text-white">
            {document.slug}
          </div>
          <div className="text-sm text-[#98a2b3] dark:text-[#9fb1cf]">
            {document.pageCount} Pages
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="More options"
        onClick={onToggleMenu}
        className="flex size-8 items-center justify-center rounded-full text-[#6a64ff] transition hover:bg-[#f3f4ff] dark:hover:bg-[#232f49]"
      >
        <DotsIcon />
      </button>
      {menuOpen ? (
        <div className="absolute right-4 top-[calc(100%+8px)] z-20 min-w-[162px] rounded-[14px] bg-white/98 p-3 shadow-[0_18px_45px_rgba(103,109,167,0.18)] backdrop-blur-xl dark:bg-[#1e2b44]/98 dark:shadow-[0_20px_44px_rgba(0,0,0,0.38)]">
          <MiniMenuRow
            label="Copy Link"
            icon={<ShareTinyIcon />}
            onClick={() => {
              void onCopyLink();
            }}
          />
          <MiniMenuRow
            label="Edit"
            icon={<EditTinyIcon />}
            onClick={onEdit}
          />
        </div>
      ) : null}
    </a>
  );
}

function MobileTopDeck({
  activeSlide,
  deckRef,
  progress,
  onShare,
  onScroll,
  onSlideChange,
}: {
  activeSlide: 0 | 1;
  deckRef: React.RefObject<HTMLDivElement | null>;
  progress: import("@/types/auth").FileProgressMetric[];
  onShare: () => Promise<void>;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  onSlideChange: (slide: 0 | 1) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div
        ref={deckRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="min-w-full snap-center pr-1">
          <div className="min-h-[172px] rounded-[28px] border border-[#edf1f7] bg-white px-4 py-4 shadow-[0_18px_44px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338] dark:shadow-[0_20px_46px_rgba(0,0,0,0.3)]">
            <ProgressCard progress={progress} />
          </div>
        </div>
        <div className="min-w-full snap-center pl-1">
          <ShareCard onShare={onShare} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[0, 1].map((slide) => (
          <button
            key={slide}
            type="button"
            aria-label={`Go to section ${slide + 1}`}
            onClick={() => onSlideChange(slide as 0 | 1)}
            className={cn(
              "size-2.5 rounded-full transition-all",
              activeSlide === slide
                ? "bg-[#6061f0] dark:bg-[#8c8bff]"
                : "bg-[#4a5470] dark:bg-[#42516d]",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityCard({
  title,
  description,
  ctaLabel,
  href,
  editHref,
  onClick,
  onEdit,
  tone,
  disabled = false,
  icon,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  href?: string;
  editHref?: string;
  onClick?: () => void;
  onEdit?: () => void;
  tone: "indigo" | "blue" | "pink" | "muted";
  disabled?: boolean;
  icon: ReactNode;
}) {
  const barClass =
    tone === "indigo"
      ? "bg-[linear-gradient(180deg,#655af0_0%,#5647e9_100%)] text-white shadow-[inset_0_-3px_0_rgba(67,48,171,0.5)]"
      : tone === "blue"
        ? "bg-[linear-gradient(180deg,#3792f3_0%,#2e7fe0_100%)] text-white shadow-[inset_0_-3px_0_rgba(33,96,181,0.45)]"
        : tone === "pink"
          ? "bg-[linear-gradient(180deg,#df5ea3_0%,#c74290_100%)] text-white shadow-[inset_0_-3px_0_rgba(158,35,103,0.42)]"
          : "bg-[linear-gradient(180deg,#edf2f8_0%,#e6edf6_100%)] text-[#94a3b8]";

  return (
    <article className="relative h-[152px] rounded-[24px] border border-[#eef2f8] bg-white px-3 py-3.5 shadow-[0_16px_36px_rgba(103,109,167,0.12)] dark:border-[#273750] dark:bg-[#182338] dark:shadow-[0_16px_36px_rgba(0,0,0,0.28)] md:h-[156px] md:px-4 md:py-4">
      <div className="absolute top-3.5 right-3.5 scale-[0.82] opacity-90 md:top-4 md:right-4 md:scale-[0.94]">{icon}</div>
      <div className="text-[16px] font-semibold text-[#334155] dark:text-white md:text-[17px]">{title}</div>
      {description ? (
        <div className="mt-1 text-[13px] text-[#94a3b8] dark:text-[#9fb1cf] md:text-[14px]">{description}</div>
      ) : null}

      <div className="absolute right-3 bottom-3.5 left-3 flex items-center gap-1.5 md:right-4 md:bottom-4 md:left-4 md:gap-2">
        {href && !disabled ? (
          <Link
            href={href}
            className={cn(
              "flex h-[34px] flex-1 items-center justify-center rounded-[12px] px-3 text-center text-[13px] font-bold no-underline md:h-[44px] md:rounded-[14px] md:px-4 md:text-[15px]",
              barClass,
            )}
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
              "flex h-[34px] flex-1 items-center justify-center rounded-[12px] px-3 text-center text-[13px] font-bold md:h-[44px] md:rounded-[14px] md:px-4 md:text-[15px]",
              barClass,
              disabled && "cursor-not-allowed",
            )}
          >
            {ctaLabel}
          </button>
        )}
        {disabled ? null : (
          editHref ? (
            <Link
              href={editHref}
              aria-label="Edit"
              className={cn(
                "flex size-[34px] items-center justify-center rounded-[11px] md:size-[40px] md:rounded-[14px]",
                tone === "indigo"
                  ? "bg-[#665bf1] text-white shadow-[inset_0_-3px_0_rgba(67,48,171,0.5)]"
                  : tone === "blue"
                    ? "bg-[#368ef2] text-white shadow-[inset_0_-3px_0_rgba(33,96,181,0.45)]"
                    : "bg-[#d9519f] text-white shadow-[inset_0_-3px_0_rgba(158,35,103,0.42)]",
              )}
            >
              <EditIcon />
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Edit"
              onClick={onEdit}
              className={cn(
                "flex size-[34px] items-center justify-center rounded-[11px] md:size-[40px] md:rounded-[14px]",
                tone === "indigo"
                  ? "bg-[#665bf1] text-white shadow-[inset_0_-3px_0_rgba(67,48,171,0.5)]"
                  : tone === "blue"
                    ? "bg-[#368ef2] text-white shadow-[inset_0_-3px_0_rgba(33,96,181,0.45)]"
                    : "bg-[#d9519f] text-white shadow-[inset_0_-3px_0_rgba(158,35,103,0.42)]",
              )}
            >
              <EditIcon />
            </button>
          )
        )}
      </div>
    </article>
  );
}

function MiniMenuRow({
  icon,
  label,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center rounded-xl px-2 py-2.5 text-left text-[14px] text-[#475467] transition hover:bg-[#f5f7ff] dark:text-[#e1e8f8] dark:hover:bg-[#24314b]"
    >
      {icon ? (
        <span className="mr-3 flex size-8 items-center justify-center rounded-[10px] bg-[#f3f5fb] text-[#94a3b8] dark:bg-[#24314b] dark:text-[#9fb1cf]">
          {icon}
        </span>
      ) : null}
      {label}
    </button>
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

function BackChevron() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 text-[#64748b]">
      <path
        d="M8.5 1.5 4 6l4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 18" className="h-[18px] w-6">
      <path
        fill="currentColor"
        d="M2 17h20v-2H2zm0-7.5h20v-2H2zM2 2v2h20V2z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5">
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-[#98a2b3]">
      <path
        d="m4 6 4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 4 16" className="h-4 w-1 text-[#6a64ff]">
      <circle cx="2" cy="2" r="1.25" fill="currentColor" />
      <circle cx="2" cy="8" r="1.25" fill="currentColor" />
      <circle cx="2" cy="14" r="1.25" fill="currentColor" />
    </svg>
  );
}

function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 4 16" className="h-4 w-1 text-current">
      <circle cx="2" cy="2" r="1.25" fill="currentColor" />
      <circle cx="2" cy="8" r="1.25" fill="currentColor" />
      <circle cx="2" cy="14" r="1.25" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5">
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#5d60ef]">
      <path
        d="M12 15V6m0 0-3 3m3-3 3 3M5 17.5h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubjectIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#5d60ef]">
      <path
        d="M7 5.5h9.5A2.5 2.5 0 0 1 19 8v10.5H9.5A2.5 2.5 0 0 0 7 21.5zm0 0A2.5 2.5 0 0 0 4.5 8v10.5H7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 text-[#98a2b3]">
      <path
        d="m8 5 5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 text-[#ef6a6a]">
      <path
        d="M8 4.5H5.8A1.8 1.8 0 0 0 4 6.3v7.4a1.8 1.8 0 0 0 1.8 1.8H8m4-8 3 2.5-3 2.5M15 10H8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UpgradeRow({
  icon,
  label,
  base,
  baseMeta,
  plus,
  plusMeta,
}: {
  icon: string;
  label: string;
  base: string;
  baseMeta: string;
  plus: string;
  plusMeta: string;
}) {
  return (
    <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] items-center border-b border-[#d7ecfa] px-6 py-4 last:border-b-0 dark:border-[#2b4761]">
      <div className="flex items-center gap-3 text-left text-[#64748b] dark:text-[#c6d2e7]">
        <span>{icon}</span>
        <span className="font-semibold">{label}</span>
      </div>
      <div className="text-center">
        <div className="text-[18px] font-bold text-[#0f172a] dark:text-white">{base}</div>
        <div className="text-[13px] text-[#64748b] dark:text-[#c6d2e7]">{baseMeta}</div>
      </div>
      <div className="rounded-[18px] border border-[#d7ecfa] bg-white px-3 py-3 text-center dark:border-[#2b4761] dark:bg-[#15233a]">
        <div className="text-[18px] font-bold text-[#16a8ef]">{plus}</div>
        <div className="text-[13px] text-[#64748b] dark:text-[#c6d2e7]">{plusMeta}</div>
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
  if (themePreference === "dark") {
    return "(Dark)";
  }

  if (themePreference === "light") {
    return "(Light)";
  }

  return "(System Preference)";
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

function ShareTinyIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4">
      <path
        d="M9.75 3.25 14 7.5m0 0-4.25 4.25M14 7.5H4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditTinyIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4">
      <path
        d="m12.9 2.6 2.5 2.5M3.5 14.5l2.8-.4 8-8a1 1 0 0 0 0-1.4l-1.8-1.8a1 1 0 0 0-1.4 0l-8 8-.4 2.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseMiniIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5">
      <path
        d="M5 5l10 10M15 5 5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5">
      <path
        d="M4 13.5V16h2.5L15 7.5 12.5 5zm9.8-8.3a1.06 1.06 0 0 1 1.5 1.5L13.9 8.1l-1.5-1.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6">
      <path
        d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5Zm7 0V8h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h6M9 16h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function McqMiniIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4">
      <path
        d="M3 4h2m2.5 0H13M3 8h2m2.5 0H13M3 12h2m2.5 0H13M1.5 4h0M1.5 8h0M1.5 12h0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardMiniIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4">
      <rect
        x="2.2"
        y="3"
        width="8.8"
        height="10"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.5 5.8h3.3M5.5 8.2h2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function McqArtwork() {
  return (
    <svg viewBox="0 0 110 86" className="h-[78px] w-[96px] text-[#b7b2ff]">
      <rect x="42" y="9" width="42" height="54" rx="12" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="22" y="21" width="42" height="54" rx="12" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="M44 45c0-5 4.1-9 9.3-9 5.4 0 9.4 3.4 9.4 8.6 0 6.5-6.7 7.5-6.7 11" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="56" cy="62" r="3" fill="currentColor" />
    </svg>
  );
}

function FlashcardsArtwork() {
  return (
    <svg viewBox="0 0 110 86" className="h-[78px] w-[96px] text-[#9fcbff]">
      <rect x="42" y="9" width="42" height="54" rx="12" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="22" y="21" width="42" height="54" rx="12" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="m57 33-9 15h8l-3 14 11-18h-8l3-11Z" fill="currentColor" />
    </svg>
  );
}

function SummaryArtwork() {
  return (
    <svg viewBox="0 0 110 86" className="h-[78px] w-[96px] text-[#f0b4d7]">
      <rect x="36" y="15" width="32" height="48" rx="10" fill="none" stroke="currentColor" strokeWidth="6" transform="rotate(8 36 15)" />
      <rect x="18" y="23" width="32" height="48" rx="10" fill="none" stroke="currentColor" strokeWidth="6" transform="rotate(-4 18 23)" />
      <path d="M45 35h15M43 44h17M48 53h9" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function MindMapArtwork() {
  return (
    <svg viewBox="0 0 110 86" className="h-[78px] w-[96px] text-[#e2e8f0]">
      <circle cx="44" cy="48" r="8" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="78" cy="33" r="8" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="78" cy="62" r="8" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="M51 44 70 35M51 52l19 8M78 41v13" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function ProgressFaces() {
  return (
    <div className="relative flex items-center justify-center gap-[-8px]">
      <FaceBubble size="small" emoji="◕‿◕" />
      <FaceBubble size="large" emoji="⌐■_■" />
      <FaceBubble size="small" emoji="◡‿◡" />
      <span className="absolute -top-1 -right-1 text-[#6a64ff]">✦</span>
      <span className="absolute top-2 -left-1 text-[#6a64ff]">✦</span>
      <span className="absolute -top-3 text-[#111827]">🎓</span>
    </div>
  );
}

function ShareFaces() {
  return (
    <div className="flex items-center justify-center">
      <AvatarBubble tone="rose" emoji="🧑🏻" />
      <AvatarBubble tone="amber" emoji="👩🏽" overlap />
      <AvatarBubble tone="slate" emoji="🧔🏻" overlap />
    </div>
  );
}

function FaceBubble({
  size,
  emoji,
}: {
  size: "small" | "large";
  emoji: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full border-[3px] border-[#e8e3ff] bg-white text-[#111827] shadow-[0_8px_18px_rgba(96,97,240,0.12)]",
        size === "large" ? "size-[58px] text-[22px]" : "size-[40px] text-[16px]",
      )}
    >
      {emoji}
    </span>
  );
}

function AvatarBubble({
  tone,
  emoji,
  overlap = false,
}: {
  tone: "rose" | "amber" | "slate";
  emoji: string;
  overlap?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex size-[38px] items-center justify-center rounded-full border-[3px] border-white text-[18px] shadow-[0_6px_14px_rgba(103,109,167,0.14)]",
        overlap && "-ml-2",
        tone === "rose" && "bg-[#ffe4ea]",
        tone === "amber" && "bg-[#ffe7cc]",
        tone === "slate" && "bg-[#ecf2ff]",
      )}
    >
      {emoji}
    </span>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4">
      <path
        d="M14.5 7a2.5 2.5 0 1 0-2.3-3.5L7.8 6.1a2.5 2.5 0 1 0 0 7.8l4.4 2.6a2.5 2.5 0 1 0 .8-1.3l-4.3-2.5a2.7 2.7 0 0 0 0-1.4L13 8.8c.42.42.99.67 1.5.67Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
