"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageSpinner } from "@/components/ui/Spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const supabase = createClient();

    // Timeout — 5 saniyede hâlâ loading ise giriş sayfasına yönlendir
    const timeout = setTimeout(() => {
      setState((s) => (s === "loading" ? "unauthenticated" : s));
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setState(session ? "authenticated" : "unauthenticated");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timeout);
      setState(session ? "authenticated" : "unauthenticated");
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state === "unauthenticated") {
      router.replace("/giris");
    }
  }, [state, router]);

  if (state === "loading") return <PageSpinner />;
  if (state === "unauthenticated") return null;
  return <>{children}</>;
}
