"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Empty => same-origin (Next.js rewrite proxies /api/* to the backend).
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Reasons the API redirects back here when the OAuth callback fails.
const LOGIN_ERRORS: Record<string, string> = {
  missing_code: "Google didn't return an authorization code. Please try again.",
  invalid_state: "Your sign-in session expired or was blocked. Please try again.",
  server_error: "Something went wrong finishing sign-in. Please try again in a moment.",
};

function LoginError() {
  const error = useSearchParams().get("error");
  if (!error) return null;

  return (
    <div
      role="alert"
      className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {LOGIN_ERRORS[error] ?? "Sign-in failed. Please try again."}
    </div>
  );
}

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-grid-fade" />
        <div className="glow absolute left-1/2 top-[-4rem] h-80 w-[34rem] -translate-x-1/2 opacity-60" />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-5 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-sm">
          <div className="card-surface rounded-2xl p-8 shadow-elevated">
            <div className="flex justify-center">
              <Logo className="text-lg" />
            </div>
            <h1 className="mt-7 text-center text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sign in to schedule emails and automate your follow-ups.
            </p>

            <Suspense fallback={null}>
              <LoginError />
            </Suspense>

            <button
              onClick={handleLogin}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            By continuing you agree to connect your Gmail account. Your tokens are encrypted at
            rest.
          </p>
        </div>
      </div>
    </main>
  );
}
