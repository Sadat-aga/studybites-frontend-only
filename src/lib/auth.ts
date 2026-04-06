"use client";

import { createContext, useContext } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AuthUser, LoginFormValues } from "@/types/auth";

export function validateLoginForm(values: LoginFormValues) {
  const errors: Partial<Record<keyof LoginFormValues, string>> = {};

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

export type AuthContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  user: AuthUser | null;
  login: (values: LoginFormValues) => Promise<{ ok: true } | { ok: false; message: string }>;
  signUp: (values: LoginFormValues) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export type UserRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url?: string | null;
  locale?: string | null;
  date_of_birth?: string | null;
  onboarding_dob_completed?: boolean | null;
  streak_count?: number | null;
};

export function mapSupabaseUser(user: User, profile?: UserRow | null): AuthUser {
  const email = profile?.email ?? user.email ?? "";
  const fallbackName =
    typeof user.user_metadata.name === "string"
      ? user.user_metadata.name
      : typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : email.split("@")[0] || "Learner";

  return {
    id: user.id,
    email,
    name: profile?.display_name ?? fallbackName,
    avatarUrl: profile?.avatar_url ?? null,
    locale: profile?.locale ?? "en",
    dateOfBirth: profile?.date_of_birth ?? null,
    onboardingDobCompleted: profile?.onboarding_dob_completed ?? false,
    streakCount: profile?.streak_count ?? 0,
  };
}

export async function upsertAuthUserProfile(supabase: SupabaseClient, user: User) {
  const payload = {
    id: user.id,
    email: user.email ?? "",
    display_name:
      typeof user.user_metadata.name === "string"
        ? user.user_metadata.name
        : typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : (user.email ?? "").split("@")[0] || "Learner",
    avatar_url: typeof user.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : null,
    locale: typeof user.user_metadata.locale === "string" ? user.user_metadata.locale : "en",
  };

  const { data, error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select("id, email, display_name, avatar_url, locale, date_of_birth, onboarding_dob_completed, streak_count")
    .maybeSingle();

  if (error) {
    return mapSupabaseUser(user, null);
  }

  return mapSupabaseUser(user, data);
}
