"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { apiFetch } from "@/lib/api";

interface MeResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    name: string | null;
    picture_url: string | null;
    plan: string;
    monthly_send_count: number;
  };
}

export function useAuth({ redirectTo = "/login" }: { redirectTo?: string } = {}) {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const res = await apiFetch<MeResponse>("/api/auth/me");
        if (mounted && res.success && res.data) {
          setUser(res.data);
        }
      } catch {
        // Try refreshing the token
        try {
          await apiFetch("/api/auth/refresh", { method: "POST" });
          const res = await apiFetch<MeResponse>("/api/auth/me");
          if (mounted && res.success && res.data) {
            setUser(res.data);
            return;
          }
        } catch {
          // Not authenticated
        }

        if (mounted) {
          setUser(null);
          if (redirectTo) {
            router.replace(redirectTo);
          }
        }
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, [redirectTo, router, setUser, setLoading]);

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    router.replace("/login");
  };

  return { user, isLoading, logout };
}
