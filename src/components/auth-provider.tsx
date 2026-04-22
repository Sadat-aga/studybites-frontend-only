"use client";

import { useMemo, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "@/lib/auth";

const MOCK_USER = {
  id: "mock-user-001",
  email: "demo@studybites.app",
  name: "Demo User",
  avatarUrl: null,
  locale: "en",
  date_of_birth: null,
  onboarding_dob_completed: false,
  streak_count: 0,
};

const MOCK_VALUE: AuthContextValue = {
  user: MOCK_USER,
  isAuthenticated: true,
  isReady: true,
  login: async () => ({ ok: true as const }),
  signUp: async () => ({ ok: true as const }),
  logout: async () => {},
  refreshUser: async () => {},
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => MOCK_VALUE, []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
