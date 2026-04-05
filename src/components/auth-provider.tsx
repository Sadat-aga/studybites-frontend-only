"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  AUTH_CHANGE_EVENT,
  AUTH_STORAGE_KEY,
  AuthContext,
  validateLogin,
} from "@/lib/mock-auth";
import type { LoginFormValues } from "@/types/auth";

type AuthSnapshot = { email: string; name: string } | null;

let cachedRawSnapshot: string | null | undefined;
let cachedParsedSnapshot: AuthSnapshot = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribeToAuth, getAuthSnapshot, getServerSnapshot);

  const login = useCallback(async (values: LoginFormValues) => {
    const match = validateLogin(values.email, values.password);

    if (!match) {
      return { ok: false as const, message: "Incorrect email or password" };
    }

    const authUser = { email: match.email, name: match.name };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isReady: true,
      user,
      login,
      logout,
    }),
    [login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function subscribeToAuth(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(AUTH_CHANGE_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(AUTH_CHANGE_EVENT, handler);
  };
}

function getAuthSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored === cachedRawSnapshot) {
    return cachedParsedSnapshot;
  }

  if (!stored) {
    cachedRawSnapshot = stored;
    cachedParsedSnapshot = null;
    return null;
  }

  try {
    cachedRawSnapshot = stored;
    cachedParsedSnapshot = JSON.parse(stored) as AuthSnapshot;
    return cachedParsedSnapshot;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    cachedRawSnapshot = null;
    cachedParsedSnapshot = null;
    return null;
  }
}

function getServerSnapshot() {
  return null;
}
