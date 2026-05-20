"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(() => {
        // User is authenticated, redirect to dashboard
        router.replace("/dashboard");
      })
      .catch(() => {
        // Not authenticated, show landing page
        setChecking(false);
      });
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Fluxion<span className="text-primary">OS</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
          Never forget to follow up. Send emails at the right time. Automate your communication like
          a pro.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
          >
            Get Started with Google
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Schedule Emails</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Compose and send later at the perfect time.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Smart Follow-ups</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Auto follow-up if no reply received.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Draft Pipeline</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize and categorize your email drafts.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
