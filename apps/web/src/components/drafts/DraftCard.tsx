"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteDraft, useScheduleDraft } from "@/hooks/useDrafts";
import { SchedulePicker } from "../compose/SchedulePicker";
import { useToast } from "@/components/ui/Toast";

interface DraftCardProps {
  draft: {
    id: string;
    to: string[] | null;
    subject: string | null;
    body: string | null;
    category: string;
    updated_at: string;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  cold_outreach: "Cold Outreach",
  reminder: "Reminder",
  personal: "Personal",
  uncategorized: "Uncategorized",
};

export function DraftCard({ draft }: DraftCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const deleteDraft = useDeleteDraft();
  const scheduleDraft = useScheduleDraft();
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const handleDelete = async () => {
    if (confirm("Delete this draft?")) {
      await deleteDraft.mutateAsync(draft.id);
      toast("Draft deleted");
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt) return;
    try {
      await scheduleDraft.mutateAsync({ id: draft.id, scheduled_at: scheduledAt });
      toast("Draft scheduled!");
      router.push("/scheduled");
    } catch {
      // error handled by mutation
    }
  };

  const canSchedule = draft.to && draft.to.length > 0 && draft.subject && draft.body;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{draft.subject || "(No subject)"}</p>
          <p className="text-sm text-muted-foreground truncate">
            {draft.to && draft.to.length > 0 ? `To: ${draft.to.join(", ")}` : "No recipients"}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {CATEGORY_LABELS[draft.category] || draft.category}
        </span>
      </div>

      {draft.body && (
        <p className="text-sm text-muted-foreground line-clamp-2">{draft.body}</p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Updated{" "}
          {new Date(draft.updated_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
        <div className="flex gap-3">
          {canSchedule && (
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="text-primary hover:underline"
            >
              Schedule
            </button>
          )}
          <button onClick={handleDelete} className="text-destructive hover:underline">
            Delete
          </button>
        </div>
      </div>

      {showSchedule && (
        <div className="border-t pt-3 space-y-3">
          <SchedulePicker value={scheduledAt} onChange={setScheduledAt} />
          <button
            onClick={handleSchedule}
            disabled={!scheduledAt || scheduleDraft.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
          >
            {scheduleDraft.isPending ? "Scheduling..." : "Schedule this draft"}
          </button>
        </div>
      )}
    </div>
  );
}
