"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SchedulePicker } from "./SchedulePicker";
import { FollowUpToggle } from "./FollowUpToggle";
import { useScheduleEmail } from "@/hooks/useEmails";
import { useCreateDraft } from "@/hooks/useDrafts";
import { useToast } from "@/components/ui/Toast";

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
  const [followUpDelay, setFollowUpDelay] = useState(48);
  const [followUpBody, setFollowUpBody] = useState("");

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
    if (followUpEnabled && !followUpBody.trim()) {
      setError("Follow-up message is required when follow-up is enabled");
      return;
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
              delay_hours: followUpDelay,
              follow_up_body: followUpBody.trim(),
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

      {/* To */}
      <div>
        <label className="text-sm font-medium">To</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="email@example.com (comma-separated for multiple)"
          className="mt-1.5 w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
          className="mt-1.5 w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
          className="mt-1.5 w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
          className="mt-1.5 w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {/* Schedule Picker */}
      <SchedulePicker value={scheduledAt} onChange={setScheduledAt} />

      {/* Follow-up Toggle */}
      <FollowUpToggle
        enabled={followUpEnabled}
        onToggle={setFollowUpEnabled}
        delayHours={followUpDelay}
        onDelayChange={setFollowUpDelay}
        body={followUpBody}
        onBodyChange={setFollowUpBody}
      />

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={scheduleEmail.isPending}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {scheduleEmail.isPending ? "Scheduling..." : "Schedule Email"}
        </button>

        <div className="flex items-center gap-2">
          <select
            value={draftCategory}
            onChange={(e) => setDraftCategory(e.target.value)}
            className="rounded-md border px-2 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="uncategorized">Uncategorized</option>
            <option value="cold_outreach">Cold Outreach</option>
            <option value="reminder">Reminder</option>
            <option value="personal">Personal</option>
          </select>
          <button
            type="button"
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
            className="rounded-lg border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition disabled:opacity-50"
          >
            {createDraft.isPending ? "Saving..." : "Save as Draft"}
          </button>
        </div>
      </div>
    </form>
  );
}
