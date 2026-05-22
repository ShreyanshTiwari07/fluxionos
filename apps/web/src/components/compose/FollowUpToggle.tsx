"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAiFollowUpPreview } from "@/hooks/useEmails";
import { useToast } from "@/components/ui/Toast";

export type FollowUpMode = "manual" | "ai";
export type FollowUpTiming = "relative" | "absolute";

export interface FollowUpUiState {
  mode: FollowUpMode;
  timing: FollowUpTiming;
  delayHours: number;
  /** Local datetime-local string (e.g. "2026-06-01T09:00") for absolute timing. */
  followUpAt: string;
  body: string;
  /** AI mode: regenerate fresh at send time (true when preview untouched/empty). */
  aiRegenerate: boolean;
}

interface FollowUpToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  value: FollowUpUiState;
  onChange: (next: FollowUpUiState) => void;
  /** Original email content, used to generate the AI preview. */
  originalSubject: string;
  originalBody: string;
}

const DELAY_PRESETS = [
  { label: "1 day", hours: 24 },
  { label: "2 days", hours: 48 },
  { label: "3 days", hours: 72 },
  { label: "5 days", hours: 120 },
  { label: "1 week", hours: 168 },
];

function toLocalDatetimeString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

function formatDelay(hours: number): string {
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  const remaining = hours % 24;
  if (remaining === 0) return `${days} day${days > 1 ? "s" : ""}`;
  return `${days}d ${remaining}h`;
}

export function FollowUpToggle({
  enabled,
  onToggle,
  value,
  onChange,
  originalSubject,
  originalBody,
}: FollowUpToggleProps) {
  const { toast } = useToast();
  const aiPreview = useAiFollowUpPreview();

  const [showCustomDelay, setShowCustomDelay] = useState(false);
  const [customDays, setCustomDays] = useState("");
  const [customHours, setCustomHours] = useState("");
  // Last AI-generated text, to detect whether the user edited the preview.
  const [lastAiText, setLastAiText] = useState("");

  const set = (patch: Partial<FollowUpUiState>) => onChange({ ...value, ...patch });

  const isPreset = DELAY_PRESETS.some((p) => p.hours === value.delayHours);

  const applyCustomDelay = () => {
    const total = parseInt(customDays || "0", 10) * 24 + parseInt(customHours || "0", 10);
    if (total >= 1) set({ delayHours: total });
  };

  const handleGenerate = async () => {
    if (!originalSubject.trim() || !originalBody.trim()) {
      toast("Add a subject and message first, then generate the follow-up.");
      return;
    }
    try {
      const res = await aiPreview.mutateAsync({
        subject: originalSubject.trim(),
        body: originalBody.trim(),
      });
      const text = res.data.follow_up_body;
      setLastAiText(text);
      // Generated and untouched -> regenerate fresh at send time.
      set({ body: text, aiRegenerate: true });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to generate follow-up");
    }
  };

  const handleBodyChange = (text: string) => {
    if (value.mode === "ai") {
      // Untouched preview or empty -> regenerate at send; edited -> use as-is.
      const untouched = text.trim() === "" || text === lastAiText;
      set({ body: text, aiRegenerate: untouched });
    } else {
      set({ body: text });
    }
  };

  const selectedAt = value.followUpAt ? new Date(value.followUpAt) : null;

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Auto Follow-up</p>
          <p className="text-xs text-muted-foreground">Send if no reply received</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition",
            enabled ? "bg-primary" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white transition-transform",
              enabled ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-4 pt-2">
          {/* Mode: Manual vs AI */}
          <div>
            <label className="text-sm font-medium">Follow-up content</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(["manual", "ai"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    set({ mode: m, aiRegenerate: m === "ai" ? value.body.trim() === "" : false })
                  }
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition",
                    value.mode === m
                      ? "border-primary bg-primary/5 text-primary"
                      : "text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {m === "manual" ? "Write manually" : "✨ AI-powered"}
                </button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div>
            <label className="text-sm font-medium">Send follow-up</label>

            {/* Relative presets */}
            <div className="mt-1.5 flex flex-wrap gap-2">
              {DELAY_PRESETS.map((preset) => (
                <button
                  key={preset.hours}
                  type="button"
                  onClick={() => {
                    set({ timing: "relative", delayHours: preset.hours });
                    setShowCustomDelay(false);
                  }}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs transition",
                    value.timing === "relative" &&
                      value.delayHours === preset.hours &&
                      !showCustomDelay
                      ? "border-primary bg-primary/5 text-primary"
                      : "text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  set({ timing: "relative" });
                  setShowCustomDelay((s) => !s);
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs transition",
                  value.timing === "relative" && (showCustomDelay || !isPreset)
                    ? "border-primary bg-primary/5 text-primary"
                    : "text-muted-foreground hover:border-primary/50",
                )}
              >
                Custom duration
              </button>
              <button
                type="button"
                onClick={() => set({ timing: "absolute" })}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs transition",
                  value.timing === "absolute"
                    ? "border-primary bg-primary/5 text-primary"
                    : "text-muted-foreground hover:border-primary/50",
                )}
              >
                Exact date & time
              </button>
            </div>

            {/* Custom relative inputs */}
            {value.timing === "relative" && showCustomDelay && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    placeholder="0"
                    className="w-16 rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    placeholder="0"
                    className="w-16 rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-xs text-muted-foreground">hours</span>
                </div>
                <button
                  type="button"
                  onClick={applyCustomDelay}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition"
                >
                  Set
                </button>
              </div>
            )}

            {/* Absolute date/time input */}
            {value.timing === "absolute" && (
              <input
                type="datetime-local"
                value={selectedAt ? toLocalDatetimeString(selectedAt) : ""}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) set({ followUpAt: d.toISOString() });
                }}
                min={toLocalDatetimeString(new Date())}
                className="mt-2 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}

            <p className="mt-1.5 text-xs text-muted-foreground">
              {value.timing === "absolute"
                ? selectedAt
                  ? `Will follow up on ${selectedAt.toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}, if no reply.`
                  : "Pick when to follow up, if no reply is received."
                : `Follow-up will be sent ${formatDelay(
                    value.delayHours,
                  )} after the original email, if no reply is received.`}
            </p>
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Follow-up message</label>
              {value.mode === "ai" && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={aiPreview.isPending}
                  className="rounded-md border border-primary/40 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition disabled:opacity-50"
                >
                  {aiPreview.isPending ? "Generating…" : "✨ Generate with AI"}
                </button>
              )}
            </div>
            <textarea
              value={value.body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder={
                value.mode === "ai"
                  ? "Click 'Generate with AI' to draft a follow-up from your email, or leave blank to auto-generate when it sends."
                  : "Hi, just following up on my previous email..."
              }
              rows={4}
              className="mt-1.5 w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {value.mode === "ai" ? (
                value.aiRegenerate ? (
                  <>AI will write the follow-up automatically when it&apos;s time to send.</>
                ) : (
                  <>Your edited message will be sent as-is.</>
                )
              ) : (
                <>This message will be sent as a reply in the same email thread.</>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
