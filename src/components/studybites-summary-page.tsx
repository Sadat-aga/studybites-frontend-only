"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useSummaryResult } from "@/lib/study-data";

export function StudybitesSummaryPage() {
  const router = useRouter();
  const params = useParams<{ fileId: string }>();
  const { user } = useAuth();
  const { summary, phase, setPhase } = useSummaryResult(params?.fileId, user?.id);
  const filePageHref = params?.fileId ? `/library/files/${params.fileId}` : "/library";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff_0%,#f4f6fb_34%,#f6f8fc_100%)] font-cairo text-[#0f172a] dark:bg-[radial-gradient(circle_at_top,#111a32_0%,#0d1528_38%,#09111f_100%)] dark:text-[#edf2ff]">
      <div className="mx-auto max-w-[1120px] px-4 pt-4 pb-10 md:px-6 md:pt-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={filePageHref}
            className="inline-flex items-center gap-2 text-[17px] text-[#475467] no-underline dark:text-[#c5d0e2]"
          >
            <BackChevron />
            Back
          </Link>

          <button
            type="button"
            onClick={() => router.push(filePageHref)}
            className="flex size-10 items-center justify-center rounded-[10px] border border-[#e6ebf4] bg-white/90 shadow-[0_4px_14px_rgba(117,130,164,0.12)] dark:border-[#2d3a54] dark:bg-[#182338]/92"
            aria-label="Close summary"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-6">
          <div className="text-[15px] font-semibold text-[#94a3b8] dark:text-[#9fb0c9]">
            {summary.title}
          </div>
          <h1 className="mt-2 text-[28px] leading-tight font-semibold tracking-[-0.02em] text-[#334155] dark:text-white md:text-[48px] md:leading-[1.06]">
            Summary
          </h1>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#e7ebf4] bg-white/96 px-4 py-3 shadow-[0_18px_40px_rgba(103,109,167,0.18)] backdrop-blur-xl dark:border-[#2a3953] dark:bg-[#182338]/96 dark:shadow-[0_20px_42px_rgba(0,0,0,0.38)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#f0efff] text-[#6061f0] dark:bg-[#20295c] dark:text-[#b9b8ff]">
              <SpinnerIcon spinning={phase === "generating"} />
            </div>
            <p className="flex-1 text-sm font-semibold text-[#334155] dark:text-white">
              {phase === "generating"
                ? "We're summarizing your document... It will be ready in a few minutes"
                : "Your summary is ready to review."}
            </p>
            {phase === "ready" ? (
              <button
                type="button"
                onClick={() => setPhase("generating")}
                className="rounded-full bg-[#f5f4ff] px-4 py-2 text-[13px] font-bold text-[#5f62f2] dark:bg-[#1c235d] dark:text-[#c8c7ff]"
              >
                Regenerate
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="order-2 space-y-6 lg:order-1">
            <div className="rounded-[28px] border border-[#edf1f7] bg-white p-6 shadow-[0_18px_48px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338]">
              <div className="flex flex-wrap items-center gap-2.5">
                <MetaChip>{summary.readTime}</MetaChip>
                <MetaChip>{summary.language}</MetaChip>
                <MetaChip>{summary.style}</MetaChip>
              </div>
              <p className="mt-5 text-[17px] leading-8 text-[#475467] dark:text-[#d7def0]">
                {summary.overview}
              </p>
            </div>

            <article className="rounded-[28px] border border-[#edf1f7] bg-white p-6 shadow-[0_18px_48px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338]">
              <div
                className="studybites-summary-html prose prose-slate max-w-none text-[#475467] dark:prose-invert dark:text-[#d7def0] [&_h2]:mt-8 [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:text-[#334155] dark:[&_h2]:text-white [&_li]:leading-7 [&_p]:text-[16px] [&_p]:leading-8 [&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[#dbe4f0] [&_td]:p-3 dark:[&_td]:border-[#314059] [&_th]:border [&_th]:border-[#dbe4f0] [&_th]:bg-[#f8faff] [&_th]:p-3 [&_th]:text-left dark:[&_th]:border-[#314059] dark:[&_th]:bg-[#111a2f] [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: summary.html }}
              />
            </article>
          </section>

          <aside className="order-1 space-y-6 lg:order-2">
            <div className="rounded-[28px] border border-[#edf1f7] bg-white p-6 shadow-[0_18px_48px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338]">
              <h2 className="text-[22px] font-bold text-[#334155] dark:text-white">Summary source</h2>
              <p className="mt-4 text-[15px] leading-7 text-[#475467] dark:text-[#d7def0]">
                This view renders the stored HTML summary from Supabase Storage using a signed URL.
              </p>
              {summary.signedUrl ? (
                <a
                  href={summary.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full bg-[#f5f4ff] px-4 py-2 text-[13px] font-bold text-[#5f62f2] dark:bg-[#1c235d] dark:text-[#c8c7ff]"
                >
                  Open raw summary
                </a>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-[#edf1f7] bg-white p-6 shadow-[0_18px_48px_rgba(103,109,167,0.12)] dark:border-[#26344e] dark:bg-[#182338]">
              <div className="text-[14px] font-semibold text-[#8a94a7] dark:text-[#a8b5ca]">
                Summary actions
              </div>
              <div className="mt-4 space-y-3">
                <ActionButton label="Back to File" onClick={() => router.push(filePageHref)} />
                <ActionButton label="Back to Library" onClick={() => router.push("/library")} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MetaChip({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-[#f5f4ff] px-3.5 py-2 text-[12px] font-bold text-[#5f62f2] dark:bg-[#1c235d] dark:text-[#c8c7ff] md:px-4 md:text-[13px]">
      {children}
    </span>
  );
}

function ActionButton({
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
      className="w-full rounded-[16px] border border-[#dce4f3] bg-white px-5 py-3 text-[15px] font-bold text-[#475467] dark:border-[#314059] dark:bg-[#182338] dark:text-[#d7def0]"
    >
      {label}
    </button>
  );
}

function SpinnerIcon({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-5 ${spinning ? "animate-spin" : ""}`}
      fill="none"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeOpacity="0.24" strokeWidth="2" />
      <path d="M20 12a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BackChevron() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]">
      <path
        d="M11.5 4.5 6 10l5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
