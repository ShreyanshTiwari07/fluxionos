"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SchedulePicker } from "./SchedulePicker";
import { FollowUpToggle, type FollowUpUiState } from "./FollowUpToggle";
import { Send, Save } from "lucide-react";
import { useScheduleEmail } from "@/hooks/useEmails";
import { useCreateDraft } from "@/hooks/useDrafts";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";

export function ComposeForm() {
  const router = useRouter();
  const { toast } = useToast();
  const scheduleEmail = useScheduleEmail();
  const createDraft = useCreateDraft();

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  // Follow-up state
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [followUp, setFollowUp] = useState<FollowUpUiState>({
    mode: "manual",
    timing: "relative",
    delayHours: 48,
    followUpAt: "",
    body: "",
    aiRegenerate: false,
  });

  // Draft category
  const [draftCategory, setDraftCategory] = useState("uncategorized");

  const [error, setError] = useState("");

  const parseEmails = (input: string): string[] =>
    input
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const toEmails = parseEmails(to);
    if (toEmails.length === 0) {
      setError("At least one recipient is required");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!body.trim()) {
      setError("Email body is required");
      return;
    }
    if (!scheduledAt) {
      setError("Please select a schedule time");
      return;
    }
    if (followUpEnabled) {
      if (followUp.mode === "manual" && !followUp.body.trim()) {
        setError("Follow-up message is required for a manual follow-up");
        return;
      }
      if (followUp.timing === "absolute") {
        if (!followUp.followUpAt) {
          setError("Please pick a date & time for the follow-up");
          return;
        }
        if (new Date(followUp.followUpAt).getTime() <= new Date(scheduledAt).getTime()) {
          setError("Follow-up time must be after the email's scheduled time");
          return;
        }
      }
    }

    try {
      const ccEmails = parseEmails(cc);
      await scheduleEmail.mutateAsync({
        to: toEmails,
        cc: ccEmails.length > 0 ? ccEmails : undefined,
        subject: subject.trim(),
        body: body.trim(),
        scheduled_at: scheduledAt,
        follow_up: followUpEnabled
          ? {
              mode: followUp.mode,
              ...(followUp.timing === "absolute"
                ? { follow_up_at: followUp.followUpAt }
                : { delay_hours: followUp.delayHours }),
              follow_up_body: followUp.body.trim() || undefined,
              ai_regenerate: followUp.mode === "ai" ? followUp.aiRegenerate : undefined,
            }
          : undefined,
      });

      toast("Email scheduled successfully!");
      router.push("/scheduled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule email");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
      {/* To */}
      <div>
        <label className="text-sm font-medium">To</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="email@example.com (comma-separated for multiple)"
          className="mt-1.5 field"
        />
      </div>

      {/* CC */}
      <div>
        <label className="text-sm font-medium">CC (optional)</label>
        <input
          type="text"
          value={cc}
          onChange={(e) => setCc(e.target.value)}
          placeholder="cc@example.com"
          className="mt-1.5 field"
        />
      </div>

      {/* Subject */}
      <div>
        <label className="text-sm font-medium">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          className="mt-1.5 field"
        />
      </div>

      {/* Body */}
      <div>
        <label className="text-sm font-medium">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email here..."
          rows={8}
          className="mt-1.5 field resize-none"
        />
      </div>

      </div>

      {/* Schedule Picker */}
      <SchedulePicker value={scheduledAt} onChange={setScheduledAt} />

      {/* Follow-up Toggle */}
      <FollowUpToggle
        enabled={followUpEnabled}
        onToggle={setFollowUpEnabled}
        value={followUp}
        onChange={setFollowUp}
        originalSubject={subject}
        originalBody={body}
      />

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={scheduleEmail.isPending}>
          <Send className="h-4 w-4" />
          {scheduleEmail.isPending ? "Scheduling…" : "Schedule email"}
        </Button>

        <div className="flex items-center gap-2">
          <select
            value={draftCategory}
            onChange={(e) => setDraftCategory(e.target.value)}
            className="field h-10 w-auto py-0 text-muted-foreground"
          >
            <option value="uncategorized">Uncategorized</option>
            <option value="cold_outreach">Cold Outreach</option>
            <option value="reminder">Reminder</option>
            <option value="personal">Personal</option>
          </select>
          <Button
            type="button"
            variant="outline"
            disabled={createDraft.isPending}
            onClick={async () => {
              setError("");
              try {
                const toEmails = parseEmails(to);
                await createDraft.mutateAsync({
                  to: toEmails.length > 0 ? toEmails : undefined,
                  subject: subject.trim() || undefined,
                  body: body.trim() || undefined,
                  category: draftCategory,
                });
                toast("Draft saved!");
                router.push("/drafts");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to save draft");
              }
            }}
          >
            <Save className="h-4 w-4" />
            {createDraft.isPending ? "Saving…" : "Save draft"}
          </Button>
        </div>
      </div>
    </form>
  );
}
