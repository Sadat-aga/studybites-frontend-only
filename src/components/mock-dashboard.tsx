"use client";

import { useAuth } from "@/lib/mock-auth";
import type { DashboardStat } from "@/types/auth";

const stats: DashboardStat[] = [
  { label: "Learning Streak", value: "12 days", trend: "+3 from last week" },
  { label: "Cards Reviewed", value: "148", trend: "24 completed today" },
  { label: "Summaries Ready", value: "8", trend: "2 fresh uploads processed" },
];

export function MockDashboard() {
  const { logout, user } = useAuth();

  return (
    <main className="min-h-screen bg-bg-page px-4 py-8 font-cairo sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-[28px] bg-[linear-gradient(135deg,#6061f0_0%,#7a7cf7_52%,#a6d9ff_100%)] p-6 text-white shadow-[var(--studybites-shadow)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white/75">Mock authenticated view</p>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
              <p className="max-w-2xl text-sm leading-6 text-white/85">
                This dashboard is a stand-in for the protected Studybites application flow until
                you provide screenshots or URLs for the real authenticated pages.
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-[24px] bg-bg-default p-5 shadow-[var(--studybites-shadow)]"
            >
              <p className="text-sm font-semibold text-text-secondary">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold text-text-default">{stat.value}</p>
              <p className="mt-2 text-xs font-semibold text-primary">{stat.trend}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <article className="rounded-[28px] bg-bg-default p-6 shadow-[var(--studybites-shadow)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-secondary">Recent subjects</p>
                <h2 className="mt-1 text-2xl font-bold text-text-default">
                  Your personalized study queue
                </h2>
              </div>
              <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
                Demo data
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                ["Biology Chapter 5", "Flashcards, MCQs, summary ready"],
                ["Organic Chemistry Notes", "Summary processing in progress"],
                ["European History Review", "Practice mode recommended"],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="flex items-center justify-between rounded-2xl bg-bg-page px-4 py-4"
                >
                  <div>
                    <p className="font-bold text-text-default">{title}</p>
                    <p className="mt-1 text-sm text-text-secondary">{description}</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm">
                    Open
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] bg-bg-default p-6 shadow-[var(--studybites-shadow)]">
            <p className="text-sm font-semibold text-text-secondary">Next cloning step</p>
            <h2 className="mt-1 text-2xl font-bold text-text-default">Authenticated pages</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Share a screenshot or live URL for the real dashboard, profile, or settings page and
              I&apos;ll replace this mock surface with a route-by-route clone and matching specs.
            </p>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-text-default">
              <li className="rounded-2xl bg-bg-page px-4 py-3">1. Capture the page at desktop and mobile</li>
              <li className="rounded-2xl bg-bg-page px-4 py-3">2. Send the screenshot or URL here</li>
              <li className="rounded-2xl bg-bg-page px-4 py-3">3. I’ll extract components and build the clone</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
