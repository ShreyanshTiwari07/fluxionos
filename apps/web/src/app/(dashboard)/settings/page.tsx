"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEmailStats } from "@/hooks/useEmails";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: statsData } = useEmailStats();
  const stats = statsData?.data;

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-muted-foreground">Manage your account</p>
      </div>

      {/* Profile */}
      <section className="rounded-lg border p-5 space-y-4">
        <h3 className="font-semibold">Profile</h3>
        <div className="flex items-center gap-4">
          {user.picture_url ? (
            <img
              src={user.picture_url}
              alt=""
              className="h-14 w-14 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
              {user.name?.[0] || user.email[0]}
            </div>
          )}
          <div>
            <p className="font-medium">{user.name || "No name"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Plan & Quota */}
      <section className="rounded-lg border p-5 space-y-4">
        <h3 className="font-semibold">Plan & Usage</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="mt-1 text-lg font-semibold capitalize">{user.plan}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Emails This Month</p>
            <p className="mt-1 text-lg font-semibold">
              {user.monthly_send_count}
              {user.plan === "free" && <span className="text-sm font-normal text-muted-foreground"> / 20</span>}
            </p>
            {user.plan === "free" && (
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (user.monthly_send_count / 20) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {stats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="mt-1 text-2xl font-bold">{stats.scheduled}</p>
            </div>
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Sent</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>
        )}

        {user.plan === "free" && (
          <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium">Upgrade to Pro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Get unlimited scheduling, advanced follow-ups, and workflows for just &#8377;300-500/month.
            </p>
            <button className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
              Coming Soon
            </button>
          </div>
        )}
      </section>

      {/* Account Actions */}
      <section className="rounded-lg border p-5 space-y-4">
        <h3 className="font-semibold">Account</h3>
        <button
          onClick={logout}
          className="rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 transition"
        >
          Sign Out
        </button>
      </section>
    </div>
  );
}
