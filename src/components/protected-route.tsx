"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/authenticate");
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-page">
        <div className="rounded-2xl bg-bg-default px-6 py-4 text-sm font-semibold text-text-secondary shadow-[var(--studybites-shadow)]">
          Loading your workspace...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
