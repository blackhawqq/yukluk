"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/types";

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const { authenticated, email, userId, profile } = await res.json();
      setState({ user: authenticated ? { id: userId, email } : null, profile: profile || null, loading: false });
    } catch {
      setState({ user: null, profile: null, loading: false });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setState(s => s.loading ? { ...s, loading: false } : s), 5000);
    fetchSession().finally(() => clearTimeout(timeout));
    return () => clearTimeout(timeout);
  }, []);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, profile: null, loading: false });
    window.location.href = "/";
  };

  const signInWithGoogle = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const refreshProfile = async () => {
    await fetchSession();
  };

  return { ...state, signOut, signInWithGoogle, refreshProfile };
}
