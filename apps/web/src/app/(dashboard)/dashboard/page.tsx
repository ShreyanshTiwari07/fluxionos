"use client";

import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  PenSquare,
  FileText,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useEmailStats } from "@/hooks/useEmails";
import { StatCard, StatSkeleton } from "@/components/app/StatCard";

const QUICK_ACTIONS: { href: string; title: string; desc: string; icon: LucideIcon }[] = [
  { href: "/compose", title: "Compose", desc: "Write and schedule a new email", icon: PenSquare },
  {
    href: "/scheduled",
    title: "Scheduled",
    desc: "View upcoming and sent emails",
    icon: CalendarClock,
  },
  { href: "/drafts", title: "Drafts", desc: "Manage your saved drafts", icon: FileText },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: statsData, isLoading } = useEmailStats();
  const stats = statsData?.data;
  const remaining = Math.max(0, 20 - (user?.monthly_send_count || 0));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          {user?.plan === "free"
            ? `${remaining} scheduled email${remaining === 1 ? "" : "s"} remaining this month`
            : "Unlimited scheduling — you're on Pro"}
        </p>
      </header>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !stats ? (
          [0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Scheduled" value={stats.scheduled} icon={CalendarClock} />
            <StatCard label="Sent" value={stats.sent} icon={CheckCircle2} tone="success" />
            <StatCard
              label="Failed"
              value={stats.failed}
              icon={AlertTriangle}
              tone="destructive"
            />
            <StatCard
              label="Quota left"
              value={stats.remaining_quota === -1 ? "∞" : stats.remaining_quota}
              icon={Gauge}
              tone="primary"
            />
          </>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-foreground/15 hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary/60 text-primary">
                  <a.icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-4 font-semibold">{a.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
