"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH_CHANGE_EVENT, AUTH_STORAGE_KEY } from "@/lib/mock-auth";

const defaultAuthUser = {
  email: "tryrevivestore@gmail.com",
  name: "Try Revive",
};

export default function DevLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const nextTarget = searchParams.get("to") || "/library";
    const nextTheme = searchParams.get("theme");

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAuthUser));
    if (
      nextTheme === "dark" ||
      nextTheme === "light" ||
      nextTheme === "system"
    ) {
      window.localStorage.setItem("studybites-clone-theme", nextTheme);
      window.dispatchEvent(new Event("studybites-theme-change"));
    }

    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    router.replace(nextTarget);
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-page px-6">
      <div className="w-full max-w-md rounded-[28px] bg-bg-default p-8 text-center shadow-[var(--studybites-shadow)]">
        <h1 className="text-2xl font-bold text-text-default">Preparing demo session...</h1>
        <p className="mt-3 text-sm text-text-secondary">
          If you are not redirected automatically, use one of the quick links below.
        </p>
        <div className="mt-6 flex flex-col gap-3 text-sm font-semibold">
          <Link className="rounded-xl bg-primary px-4 py-3 text-white" href="/library">
            Open Library
          </Link>
          <Link
            className="rounded-xl bg-primary px-4 py-3 text-white"
            href="/library/files/6260097"
          >
            Open File Page
          </Link>
          <Link
            className="rounded-xl bg-primary px-4 py-3 text-white"
            href="/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/exam"
          >
            Open Exam Page
          </Link>
        </div>
      </div>
    </main>
  );
}
