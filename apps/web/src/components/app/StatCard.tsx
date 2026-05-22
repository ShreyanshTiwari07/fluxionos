import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: "default" | "success" | "destructive" | "primary";
}) {
  const toneCls = {
    default: "text-foreground/80",
    success: "text-success",
    destructive: "text-destructive",
    primary: "text-primary",
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/15">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", toneCls)} />
      </div>
      <p className={cn("mt-3 text-3xl font-semibold tracking-tight", toneCls)}>{value}</p>
    </div>
  );
}

export function StatSkeleton() {
  return <div className="h-[6.5rem] animate-pulse rounded-2xl border border-border bg-secondary/40" />;
}
