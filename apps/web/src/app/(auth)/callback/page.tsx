"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/landing/Logo";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // After Google OAuth, the API sets cookies and redirects here; go home.
    router.replace("/");
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 opacity-50" />
      </div>
      <div className="flex flex-col items-center gap-5">
        <Logo className="text-lg" />
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Signing you in…
        </div>
      </div>
    </main>
  );
}
