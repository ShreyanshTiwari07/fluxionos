"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  CalendarClock,
  FileText,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compose", label: "Compose", icon: PenSquare },
  { href: "/scheduled", label: "Scheduled", icon: CalendarClock },
  { href: "/drafts", label: "Drafts", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Avatar({
  user,
}: {
  user: { picture_url?: string | null; name?: string | null; email: string };
}) {
  return user.picture_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.picture_url}
      alt=""
      className="h-9 w-9 rounded-full"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[hsl(var(--grad-1))] to-[hsl(var(--grad-2))] text-xs font-semibold text-primary-foreground">
      {(user.name?.[0] || user.email[0]).toUpperCase()}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-card/40 p-4 md:flex">
        <div className="px-2 py-2">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                )}
                <item.icon
                  className={cn("h-[1.05rem] w-[1.05rem]", active && "text-primary")}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar user={user} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name || user.email}</p>
                <p className="truncate text-xs capitalize text-muted-foreground">{user.plan} plan</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-5 py-3 backdrop-blur-xl md:hidden">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Avatar user={user} />
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl px-5 py-8 lg:px-8 lg:py-10">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/85 backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
