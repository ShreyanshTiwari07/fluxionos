import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  scheduled: { label: "Scheduled", className: "bg-primary/10 text-primary", dot: "bg-primary" },
  sending: {
    label: "Sending",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  sent: { label: "Sent", className: "bg-success/10 text-success", dot: "bg-success" },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  pending: { label: "Pending", className: "bg-primary/10 text-primary", dot: "bg-primary" },
  checking: {
    label: "Checking",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
