"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useTheme, type ThemePreference } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { uploadDocumentAndProcess } from "@/lib/documents";
import { DEFAULT_LIBRARY_DOCUMENT, useLibraryDocuments } from "@/lib/study-data";
import { cn } from "@/lib/utils";

export function StudybitesLibraryPage() {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newSubjectOpen, setNewSubjectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [libraryHidden, setLibraryHidden] = useState(false);
  const [notice, setNotice] = useState("");
  const [locale, setLocale] = useState("English");
  const [infoPanel, setInfoPanel] = useState<null | "account" | "idea" | "updates" | "help">(
    null,
  );
  const documents = useLibraryDocuments(user?.id);
  const document = documents[0] ?? DEFAULT_LIBRARY_DOCUMENT;
  const [customSubjectTitle, setCustomSubjectTitle] = useState<string | null>(null);
  const subjectTitle = customSubjectTitle ?? document.name;
  const [draftTitle, setDraftTitle] = useState(document.name);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  function closeTransientUi() {
    setMoreMenuOpen(false);
    setNewMenuOpen(false);
    setRenameOpen(false);
    setNewSubjectOpen(false);
    setDeleteOpen(false);
    setStreakOpen(false);
    setInfoPanel(null);
  }

  function handleRenameSave() {
    const next = draftTitle.trim();
    if (!next) {
      return;
    }
    setCustomSubjectTitle(next);
    setRenameOpen(false);
    showNotice("Subject renamed.");
  }

  function showNotice(nextNotice: string) {
    setNotice(nextNotice);
  }

  async function handleShareDocument() {
    const sharePath = `/library/files/${document.id}`;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${sharePath}`,
      );
      showNotice("Study set link copied.");
    } catch {
      showNotice("Share link ready.");
    }
  }

  async function handleUploadSelection(file?: File | null) {
    if (!file) {
      showNotice("Upload dialog opened.");
      return;
    }

    try {
      const result = await uploadDocumentAndProcess({ userId: user?.id, file });
      setLibraryHidden(false);
      showNotice(`${result.fileName} uploaded. Processing started.`);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff_0%,#f4f6fb_34%,#f6f8fc_100%)] font-cairo text-[#0f172a] dark:bg-[radial-gradient(circle_at_top,#111a32_0%,#0d1528_38%,#09111f_100%)] dark:text-[#edf2ff]">
      <div className="flex min-h-screen w-full">
        <MobileHeader
          locale={locale}
          onMenuClick={() => setSidebarOpen(true)}
          onLocaleChange={(nextLocale) => {
            setLocale(nextLocale);
            showNotice(`Language changed to ${nextLocale}.`);
          }}
        />

        <div
          className={cn(
            "fixed inset-0 z-40 bg-[rgba(240,244,251,0.72)] backdrop-blur-[10px] dark:bg-[rgba(5,10,22,0.72)] lg:hidden",
            sidebarOpen || upgradeOpen || renameOpen || newSubjectOpen
              ? "block"
              : "hidden",
          )}
          onClick={() => {
            setSidebarOpen(false);
            setUpgradeOpen(false);
            setRenameOpen(false);
            setNewSubjectOpen(false);
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
              active
              label="Library"
              icon={<LibraryIcon active />}
              onClick={() => {
                setProfileOpen(false);
                closeTransientUi();
              }}
            />
            <SidebarAction
              label="Profile"
              icon={<ProfileIcon />}
              onClick={() => {
                setProfileOpen((current) => !current);
                closeTransientUi();
              }}
            />

            {profileOpen ? (
              <ProfilePanel
                locale={locale}
                userName={user?.name ?? "Try Revive"}
                onLogout={logout}
                onLocaleChange={(nextLocale) => {
                  setLocale(nextLocale);
                  showNotice(`Language changed to ${nextLocale}.`);
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
                closeTransientUi();
              }}
            />
          </div>

          <div className="mt-6 h-px bg-[#e8edf5] dark:bg-[#253248]" />

          <button
            type="button"
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left text-[16px] text-[#475467] transition hover:bg-[#f5f7ff] dark:text-[#c0cad9] dark:hover:bg-[#161f37]"
            onClick={() => {
              setProfileOpen(false);
              closeTransientUi();
            }}
          >
            <span className="text-[#98a2b3]">
              <ChevronRightIcon />
            </span>
            <span className="text-[18px]">📚</span>
            <span className="truncate">{subjectTitle}</span>
          </button>

          <div className="mt-auto hidden lg:block">
            <div className="relative inline-block">
              {newMenuOpen ? (
                <div className="absolute bottom-14 left-0 z-20 flex min-w-[178px] flex-col gap-3">
                  <MiniAction
                    label="Upload Document"
                    icon={<UploadIcon />}
                    onClick={() => {
                      uploadInputRef.current?.click();
                      setNewMenuOpen(false);
                    }}
                  />
                  <MiniAction
                    label="Subject"
                    icon={<SubjectIcon />}
                    onClick={() => {
                      setNewSubjectOpen(true);
                      setNewMenuOpen(false);
                    }}
                  />
                </div>
              ) : null}

              <button
                type="button"
                className="flex items-center gap-3 rounded-full bg-transparent px-1 py-1 text-[31px] text-[#5d60ef] dark:text-[#7e7bff]"
                onClick={() => {
                  setNewMenuOpen((current) => !current);
                  setMoreMenuOpen(false);
                }}
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
            setMoreMenuOpen(false);
            setStreakOpen(false);
            if (!renameOpen && !newSubjectOpen) {
              setNewMenuOpen(false);
            }
          }}
        >
          <input
            ref={uploadInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              void handleUploadSelection(event.target.files?.[0]);
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

          <div className="px-5 pt-[92px] pb-10 md:px-8 lg:px-[44px] lg:pt-[72px]">
            {libraryHidden ? (
              <div className="mx-auto flex w-full max-w-[312px] flex-col items-center rounded-[28px] border border-[#e7ebf4] bg-white/84 px-6 py-10 text-center shadow-[0_18px_44px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338]/96 dark:shadow-[0_20px_44px_rgba(0,0,0,0.32)]">
                <div className="text-4xl">📚</div>
                <h2 className="mt-4 text-xl font-bold text-[#334155] dark:text-white">
                  No study sets here yet
                </h2>
                <p className="mt-2 text-sm text-[#667085] dark:text-[#b7c5db]">
                  Create a new subject or upload a document to rebuild this library flow.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftTitle(subjectTitle);
                      setNewSubjectOpen(true);
                    }}
                    className="rounded-full bg-[#5f62f2] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    New Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="rounded-full border border-[#d9defb] bg-white px-4 py-2.5 text-sm font-semibold text-[#5f62f2] dark:border-[#334764] dark:bg-[#1a2941] dark:text-[#b9b8ff]"
                  >
                    Upload
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative mx-auto w-fit lg:mx-0">
                <LibraryCard
                  title={subjectTitle}
                  href={`/library/files/${document.id}`}
                  menuOpen={moreMenuOpen}
                  onToggleMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setMoreMenuOpen((current) => !current);
                    setNewMenuOpen(false);
                  }}
                  onEdit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setDraftTitle(subjectTitle);
                    setRenameOpen(true);
                    setMoreMenuOpen(false);
                  }}
                  onShare={async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setMoreMenuOpen(false);
                    await handleShareDocument();
                  }}
                  onDelete={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setDeleteOpen(true);
                    setMoreMenuOpen(false);
                  }}
                />
              </div>
            )}
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
                <UpgradeRow icon="📚" label="Number of pages" base="20" baseMeta="Pages \ Document" plus="200" plusMeta="Pages \ Document" />
                <UpgradeRow icon="📤" label="Daily Limit" base="3" baseMeta="Documents \ Day" plus="50" plusMeta="Documents \ Day" />
                <UpgradeRow icon="🤖" label="Chat" base="10" baseMeta="Messages \ Day" plus="∞" plusMeta="" />
                <UpgradeRow icon="📄" label="Document Size" base="30" baseMeta="MB" plus="50" plusMeta="MB" />
                <UpgradeRow icon="💡" label="Explanations" base="5" baseMeta="Explanations \ Day" plus="∞" plusMeta="" />
                <UpgradeRow icon="🌍" label="Translations" base="5" baseMeta="Translations \ Day" plus="∞" plusMeta="" />
                <UpgradeRow icon="⚡️" label="Fast processing" base="✕" baseMeta="" plus="✓" plusMeta="" />
              </div>
              <button
                type="button"
                onClick={() => {
                  showNotice("Upgrade checkout is mocked in this clone.");
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

      {renameOpen ? (
        <ModalFrame onClose={() => setRenameOpen(false)}>
          <div className="rounded-[28px] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(96,97,240,0.16)] dark:bg-[#152139] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:px-11 sm:py-8">
            <h2 className="text-center text-[24px] font-bold text-[#0f172a] dark:text-white">
              Rename Subject
            </h2>
            <div className="mt-5">
              <label className="text-sm font-semibold text-[#0f172a] dark:text-[#dce5f4]">
                Title
              </label>
              <input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                className="mt-2 h-[44px] w-full rounded-[14px] border border-[#d9defb] bg-white px-4 text-base text-[#1f2937] outline-none focus:border-[#7a7ff5] dark:border-[#334764] dark:bg-[#1a2941] dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleRenameSave}
              className="mt-4 h-[44px] w-full rounded-[14px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-4 text-base font-bold text-white shadow-[inset_0_-2px_0_rgba(67,48,171,0.45)]"
            >
              Save
            </button>
          </div>
        </ModalFrame>
      ) : null}

      {newSubjectOpen ? (
        <ModalFrame onClose={() => setNewSubjectOpen(false)}>
          <div className="rounded-[28px] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(96,97,240,0.16)] dark:bg-[#152139] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:px-11 sm:py-8">
            <h2 className="text-center text-[24px] font-bold text-[#0f172a] dark:text-white">
              New Subject
            </h2>
            <div className="mt-5">
              <label className="text-sm font-semibold text-[#0f172a] dark:text-[#dce5f4]">
                Title
              </label>
              <input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                className="mt-2 h-[44px] w-full rounded-[14px] border border-[#d9defb] bg-white px-4 text-base text-[#1f2937] outline-none focus:border-[#7a7ff5] dark:border-[#334764] dark:bg-[#1a2941] dark:text-white"
              />
            </div>
              <button
                type="button"
                disabled={!draftTitle.trim()}
                onClick={() => {
                  setCustomSubjectTitle(draftTitle.trim());
                  setLibraryHidden(false);
                  setNewSubjectOpen(false);
                  showNotice("New subject created.");
                }}
                className="mt-4 h-[44px] w-full rounded-[14px] bg-[linear-gradient(90deg,#635ef6_0%,#726cf7_100%)] px-4 text-base font-bold text-white shadow-[inset_0_-2px_0_rgba(67,48,171,0.45)] disabled:cursor-not-allowed disabled:bg-[#c8cffc]"
              >
                Create
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
                showNotice(
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

      {deleteOpen ? (
        <ModalFrame onClose={() => setDeleteOpen(false)}>
          <div className="rounded-[28px] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(96,97,240,0.16)] dark:bg-[#152139] dark:shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:px-10">
            <h2 className="text-center text-[24px] font-bold text-[#0f172a] dark:text-white">
              Delete Subject
            </h2>
            <p className="mt-4 text-center text-sm text-[#667085] dark:text-[#b7c5db]">
              Remove <span className="font-semibold">{subjectTitle}</span> from this mock
              library?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="h-[44px] flex-1 rounded-[14px] border border-[#d9defb] bg-white px-4 text-base font-semibold text-[#475467] dark:border-[#334764] dark:bg-[#1a2941] dark:text-[#dce5f4]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLibraryHidden(true);
                  setDeleteOpen(false);
                  showNotice("Subject deleted from library.");
                }}
                className="h-[44px] flex-1 rounded-[14px] bg-[linear-gradient(90deg,#ef5350_0%,#e14a47_100%)] px-4 text-base font-bold text-white shadow-[inset_0_-2px_0_rgba(143,28,28,0.35)]"
              >
                Delete
              </button>
            </div>
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

function MobileHeader({
  locale,
  onMenuClick,
  onLocaleChange,
}: {
  locale: string;
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
      <div className="relative">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setLocaleMenuOpen((current) => !current);
          }}
          className="flex items-center gap-1.5 text-[17px] font-semibold text-[#5d60ef] dark:text-[#96a7ff]"
        >
          <Image
            src="/images/studybites/globe.svg"
            alt="Change locale"
            width={21}
            height={21}
            className="size-[21px]"
          />
          {locale}
        </button>
        {localeMenuOpen ? (
          <div className="absolute top-[42px] right-0 min-w-[150px] rounded-[16px] bg-white px-2 py-2 text-sm font-semibold text-[#475467] shadow-[0_18px_40px_rgba(103,109,167,0.16)] dark:bg-[#1a2640] dark:text-[#d7def0] dark:shadow-[0_20px_42px_rgba(0,0,0,0.35)]">
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
  active = false,
  accent = false,
  label,
  icon,
  onClick,
}: {
  active?: boolean;
  accent?: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-[10px] rounded-xl px-2 py-3 text-left text-[16px] transition",
        active
          ? "bg-[linear-gradient(90deg,#eeecff_0%,#f5f6ff_100%)] dark:bg-[linear-gradient(90deg,#1d1f64_0%,#181d54_100%)]"
          : "hover:bg-[#f6f8ff] dark:hover:bg-[#161f37]",
      )}
    >
      {icon}
      <span
        className={cn(
          "text-[#475467] dark:text-[#e5ebff]",
          active && "font-semibold text-[#6061f0] dark:text-[#9c9bff]",
          accent && "text-[#34c8ff]",
        )}
      >
        {label}
      </span>
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

function LibraryCard({
  title,
  href,
  menuOpen,
  onToggleMenu,
  onShare,
  onEdit,
  onDelete,
}: {
  title: string;
  href: string;
  menuOpen: boolean;
  onToggleMenu: (event: MouseEvent<HTMLButtonElement>) => void;
  onShare: (event: MouseEvent<HTMLButtonElement>) => void;
  onEdit: (event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="relative h-[232px] w-[230px] sm:h-[248px] sm:w-[236px] xl:h-[260px] xl:w-[245px]">
      <div className="absolute top-0 right-4 h-[18px] w-[84px] rounded-t-[12px] bg-[#f0efff] dark:bg-[#1a2550]" />
      <div className="absolute top-[12px] right-0 h-[18px] w-[92px] rounded-t-[12px] bg-[#e9edff] dark:bg-[#1d2b56]" />

      <Link
        href={href}
        className={cn(
          "group relative block h-full rounded-[17px] bg-white p-6 pt-4 text-left no-underline shadow-[0_14px_34px_rgba(103,109,167,0.14)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_38px_rgba(103,109,167,0.16)] dark:bg-[#202b40] dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)]",
          menuOpen && "ring-2 ring-[#82b8ff] ring-offset-0 dark:ring-[#596bff]",
        )}
      >
        <div className="flex items-start justify-between">
          <div className="text-[34px] leading-none">📚</div>
          <div className="relative">
            <button
              type="button"
              aria-label="More options"
              onClick={onToggleMenu}
              className="flex size-7 items-center justify-center rounded-full text-[#6a64ff]"
            >
              <DotsIcon />
            </button>

            {menuOpen ? (
              <div className="absolute top-7 right-0 z-20 min-w-[138px] rounded-[14px] bg-white/98 p-3 shadow-[0_18px_45px_rgba(103,109,167,0.18)] backdrop-blur-xl dark:bg-[#1e2b44]/98 dark:shadow-[0_20px_44px_rgba(0,0,0,0.38)] sm:right-[-18px]">
                <MenuRow label="Share" icon={<ShareTinyIcon />} onClick={onShare} />
                <MenuRow label="Edit" icon={<EditTinyIcon />} onClick={onEdit} />
                <MenuRow
                  label="Delete"
                  icon={<DeleteTinyIcon />}
                  danger
                  onClick={onDelete}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-[112px] text-[17px] leading-[1.45] font-bold text-[#0f172a] sm:mt-[122px] xl:text-[16px] dark:text-white">
          {title}
        </div>
      </Link>
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

function MenuRow({
  label,
  icon,
  danger = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  danger?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-[14px] transition hover:bg-[#f5f7ff]",
        danger
          ? "text-[#ef4444] dark:text-[#ff8b8b]"
          : "text-[#475467] dark:text-[#e1e8f8]",
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#f3f5fb] text-[#94a3b8] dark:bg-[#24314b] dark:text-[#9fb1cf]">
        {icon}
      </span>
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

function LibraryIcon({ active = false }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 20 19" className="size-5">
      <path
        fill={active ? "#6061F0" : "#6B7280"}
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

function DotsIcon() {
  return (
    <svg viewBox="0 0 4 16" className="h-4 w-1 text-[#6a64ff]">
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

function ShareTinyIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4">
      <path
        d="M14.5 7a2.5 2.5 0 1 0-2.3-3.5L7.8 6.1a2.5 2.5 0 1 0 0 7.8l4.4 2.6a2.5 2.5 0 1 0 .8-1.3l-4.3-2.5a2.7 2.7 0 0 0 0-1.4L13 8.8c.42.42.99.67 1.5.67Z"
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
    <svg viewBox="0 0 20 20" className="size-4">
      <path
        d="M4 13.5V16h2.5L15 7.5 12.5 5zm9.8-8.3a1.06 1.06 0 0 1 1.5 1.5L13.9 8.1l-1.5-1.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteTinyIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4">
      <path
        d="M5.5 6.5h9m-7.8 0 .5 8.2a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.5-8.2M8 6.5V5.3c0-.5.4-.8.8-.8h2.4c.5 0 .8.3.8.8v1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
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

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4">
      <path
        d="m6 3 4 5-4 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
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
