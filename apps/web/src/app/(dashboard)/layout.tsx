"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/compose", label: "Compose" },
  { href: "/scheduled", label: "Scheduled" },
  { href: "/drafts", label: "Drafts" },
  { href: "/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-card p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold">
            Fluxion<span className="text-primary">OS</span>
          </h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="mt-auto border-t pt-4">
          <div className="flex items-center gap-3">
            {user.picture_url ? (
              <img
                src={user.picture_url}
                alt=""
                className="h-8 w-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {user.name?.[0] || user.email[0]}
              </div>
            )}
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user.name || user.email}</p>
              <p className="truncate text-xs text-muted-foreground">{user.plan} plan</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <h1 className="text-lg font-bold">
            Fluxion<span className="text-primary">OS</span>
          </h1>
          <div className="flex items-center gap-2">
            {user.picture_url ? (
              <img
                src={user.picture_url}
                alt=""
                className="h-7 w-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {user.name?.[0] || user.email[0]}
              </div>
            )}
          </div>
        </header>

        <div className="container max-w-4xl py-6 px-4">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t bg-card md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
