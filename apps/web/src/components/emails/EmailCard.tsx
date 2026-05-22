"use client";

import { StatusBadge } from "./StatusBadge";
import { useCancelEmail } from "@/hooks/useEmails";
import { useToast } from "@/components/ui/Toast";

interface EmailCardProps {
  email: {
    id: string;
    to: string[];
    subject: string;
    scheduled_at: string;
    sent_at: string | null;
    status: string;
    follow_up: {
      id: string;
      mode: "manual" | "ai";
      delay_hours: number | null;
      follow_up_at: string | null;
      status: string;
      check_at: string | null;
    } | null;
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getFollowUpLabel(followUp: EmailCardProps["email"]["follow_up"]): string | null {
  if (!followUp) return null;
  const ai = followUp.mode === "ai" ? "AI " : "";
  if (followUp.status === "pending" && followUp.check_at) {
    return `${ai}Follow-up scheduled for ${formatDate(followUp.check_at)}`;
  }
  if (followUp.status === "sent") return `${ai}Follow-up sent`;
  if (followUp.status === "cancelled") return "Follow-up cancelled (reply received)";
  if (followUp.status === "failed") return "Follow-up failed";
  if (followUp.status === "pending") return `${ai}Follow-up pending`;
  return null;
}

export function EmailCard({ email }: EmailCardProps) {
  const cancelEmail = useCancelEmail();
  const { toast } = useToast();

  const handleCancel = async () => {
    if (confirm("Cancel this scheduled email?")) {
      await cancelEmail.mutateAsync(email.id);
      toast("Email cancelled");
    }
  };

  const followUpLabel = getFollowUpLabel(email.follow_up);

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{email.subject}</p>
          <p className="text-sm text-muted-foreground truncate">
            To: {email.to.join(", ")}
          </p>
        </div>
        <StatusBadge status={email.status} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {email.status === "sent" && email.sent_at
            ? `Sent ${formatDate(email.sent_at)}`
            : `Scheduled for ${formatDate(email.scheduled_at)}`}
        </span>

        {email.status === "scheduled" && (
          <button
            onClick={handleCancel}
            disabled={cancelEmail.isPending}
            className="text-destructive hover:underline disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {followUpLabel && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-muted-foreground">{followUpLabel}</span>
        </div>
      )}
    </div>
  );
}
