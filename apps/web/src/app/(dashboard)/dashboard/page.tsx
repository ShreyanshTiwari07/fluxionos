"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useEmailStats } from "@/hooks/useEmails";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: statsData, isLoading } = useEmailStats();
  const stats = statsData?.data;

  return (
    <div>
      <h2 className="text-2xl font-bold">
        Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
      </h2>
      <p className="mt-1 text-muted-foreground">
        {user?.plan === "free"
          ? `${Math.max(0, 20 - (user?.monthly_send_count || 0))} scheduled emails remaining this month`
          : "Unlimited scheduling"}
      </p>

      {/* Stats */}
      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border bg-muted/50" />
          ))}
        </div>
      ) : stats ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="mt-1 text-2xl font-bold">{stats.scheduled}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Sent</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.sent}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Quota Left</p>
            <p className="mt-1 text-2xl font-bold">
              {stats.remaining_quota === -1 ? "\u221E" : stats.remaining_quota}
            </p>
          </div>
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/compose"
          className="rounded-lg border p-5 hover:border-primary/50 hover:shadow-sm transition"
        >
          <h3 className="font-semibold">Compose</h3>
          <p className="mt-1 text-sm text-muted-foreground">Write and schedule a new email</p>
        </Link>
        <Link
          href="/scheduled"
          className="rounded-lg border p-5 hover:border-primary/50 hover:shadow-sm transition"
        >
          <h3 className="font-semibold">Scheduled</h3>
          <p className="mt-1 text-sm text-muted-foreground">View your upcoming emails</p>
        </Link>
        <Link
          href="/drafts"
          className="rounded-lg border p-5 hover:border-primary/50 hover:shadow-sm transition"
        >
          <h3 className="font-semibold">Drafts</h3>
          <p className="mt-1 text-sm text-muted-foreground">Manage your saved drafts</p>
        </Link>
      </div>
    </div>
  );
}
