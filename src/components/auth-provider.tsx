"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { AuthContext, upsertAuthUserProfile } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AuthUser, LoginFormValues } from "@/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const refreshUser = useCallback(async () => {
    const {
      data: { session: nextSession },
    } = await supabase.auth.getSession();

    setSession(nextSession);

    if (!nextSession?.user) {
      setUser(null);
      return;
    }

    const nextUser = await upsertAuthUserProfile(supabase, nextSession.user);
    setUser(nextUser);
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        setSession(initialSession);

        if (initialSession?.user) {
          const nextUser = await upsertAuthUserProfile(supabase, initialSession.user);
          if (isMounted) {
            setUser(nextUser);
          }
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      setSession(nextSession);

      if (!nextSession?.user) {
        setUser(null);
        setIsReady(true);
        return;
      }

      void upsertAuthUserProfile(supabase, nextSession.user).then((nextUser) => {
        if (isMounted) {
          setUser(nextUser);
          setIsReady(true);
        }
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = useCallback(
    async (values: LoginFormValues) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (error) {
        return { ok: false as const, message: error.message };
      }

      await refreshUser();
      return { ok: true as const };
    },
    [refreshUser, supabase.auth],
  );

  const signUp = useCallback(
    async (values: LoginFormValues) => {
      const { error } = await supabase.auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        options: {
          data: {
            name: values.email.trim().split("@")[0],
          },
        },
      });

      if (error) {
        return { ok: false as const, message: error.message };
      }

      await refreshUser();
      return { ok: true as const };
    },
    [refreshUser, supabase.auth],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, [supabase.auth]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session?.user && user),
      isReady,
      user,
      login,
      signUp,
      logout,
      refreshUser,
    }),
    [isReady, login, logout, refreshUser, session?.user, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
