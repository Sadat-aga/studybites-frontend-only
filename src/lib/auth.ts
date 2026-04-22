"use client";

import { createContext, useContext } from "react";
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

export type AuthActionResult =
  | { ok: true; message?: string; requiresEmailConfirmation?: boolean }
  | { ok: false; message: string };

export type AuthContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  user: AuthUser | null;
  login: (values: LoginFormValues) => Promise<AuthActionResult>;
  signUp: (values: LoginFormValues) => Promise<AuthActionResult>;
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
