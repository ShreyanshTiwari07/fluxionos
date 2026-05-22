"use client";

import { CheckCircle2, AlertTriangle, CalendarClock, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEmailStats } from "@/hooks/useEmails";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/app/StatCard";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: statsData } = useEmailStats();
  const stats = statsData?.data;

  if (!user) return null;

  const usagePct = Math.min(100, (user.monthly_send_count / 20) * 100);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1.5 text-muted-foreground">Manage your account and usage</p>
      </header>

      {/* Profile */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          {user.picture_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture_url}
              alt=""
              className="h-14 w-14 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[hsl(var(--grad-1))] to-[hsl(var(--grad-2))] text-lg font-semibold text-primary-foreground">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium">{user.name || "No name"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Plan & usage */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Plan &amp; usage</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="mt-1 text-lg font-semibold capitalize">{user.plan}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-sm text-muted-foreground">Emails this month</p>
            <p className="mt-1 text-lg font-semibold">
              {user.monthly_send_count}
              {user.plan === "free" && (
                <span className="text-sm font-normal text-muted-foreground"> / 20</span>
              )}
            </p>
            {user.plan === "free" && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--grad-1))] to-[hsl(var(--grad-2))] transition-all"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {stats && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard label="Scheduled" value={stats.scheduled} icon={CalendarClock} />
            <StatCard label="Sent" value={stats.sent} icon={CheckCircle2} tone="success" />
            <StatCard label="Failed" value={stats.failed} icon={AlertTriangle} tone="destructive" />
          </div>
        )}

        {user.plan === "free" && (
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/[0.06] p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Upgrade to Pro</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Unlimited scheduling, AI-powered follow-ups, and priority workers.
                </p>
              </div>
            </div>
            <Button size="sm" disabled className="shrink-0">
              Coming soon
            </Button>
          </div>
        )}
      </section>

      {/* Account */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Account</h2>
        <Button onClick={logout} variant="outline" className="mt-4 text-destructive hover:bg-destructive/5 hover:border-destructive/40">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </section>
    </div>
  );
}
