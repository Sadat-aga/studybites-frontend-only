"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemePreference = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

type ThemeContextValue = {
  isReady: boolean;
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (nextTheme: ThemePreference) => void;
};

const THEME_STORAGE_KEY = "studybites-clone-theme";
const THEME_CHANGE_EVENT = "studybites-theme-change";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>(() => readStoredThemePreference());
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    readSystemTheme(),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncStoredTheme = () => {
      setThemePreferenceState(readStoredThemePreference());
    };
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    window.addEventListener("storage", syncStoredTheme);
    window.addEventListener(THEME_CHANGE_EVENT, syncStoredTheme);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("storage", syncStoredTheme);
      window.removeEventListener(THEME_CHANGE_EVENT, syncStoredTheme);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const resolvedTheme =
    themePreference === "system" ? systemTheme : themePreference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setThemePreference = useCallback((nextTheme: ThemePreference) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setThemePreferenceState(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({
      isReady: true,
      themePreference,
      resolvedTheme,
      setThemePreference,
    }),
    [resolvedTheme, setThemePreference, themePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

function readStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (
    storedTheme === "system" ||
    storedTheme === "dark" ||
    storedTheme === "light"
  ) {
    return storedTheme;
  }

  return "system";
}

function readSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
