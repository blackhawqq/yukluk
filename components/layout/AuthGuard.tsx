"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/ui/Spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    // Session'ı API üzerinden kontrol et — client-side Supabase kullanmadan
    const timeout = setTimeout(() => setState("unauthenticated"), 5000);

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ authenticated }) => {
        clearTimeout(timeout);
        setState(authenticated ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        clearTimeout(timeout);
        setState("unauthenticated");
      });

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (state === "unauthenticated") router.replace("/giris");
  }, [state, router]);

  if (state === "loading") return <PageSpinner />;
  if (state === "unauthenticated") return null;
  return <>{children}</>;
}
