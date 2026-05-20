"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FollowUpToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  delayHours: number;
  onDelayChange: (hours: number) => void;
  body: string;
  onBodyChange: (body: string) => void;
}

const DELAY_PRESETS = [
  { label: "1 day", hours: 24 },
  { label: "2 days", hours: 48 },
  { label: "3 days", hours: 72 },
  { label: "5 days", hours: 120 },
  { label: "1 week", hours: 168 },
];

export function FollowUpToggle({
  enabled,
  onToggle,
  delayHours,
  onDelayChange,
  body,
  onBodyChange,
}: FollowUpToggleProps) {
  const [showCustomDelay, setShowCustomDelay] = useState(false);
  const [customDays, setCustomDays] = useState("");
  const [customHours, setCustomHours] = useState("");

  const isPreset = DELAY_PRESETS.some((p) => p.hours === delayHours);

  const handleCustomApply = () => {
    const days = parseInt(customDays || "0", 10);
    const hours = parseInt(customHours || "0", 10);
    const totalHours = days * 24 + hours;
    if (totalHours >= 1) {
      onDelayChange(totalHours);
    }
  };

  const formatDelay = (hours: number): string => {
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days} day${days > 1 ? "s" : ""}`;
    return `${days}d ${remainingHours}h`;
  };

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
        <div className="space-y-3 pt-2">
          {/* Delay selection */}
          <div>
            <label className="text-sm font-medium">Send follow-up after</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {DELAY_PRESETS.map((preset) => (
                <button
                  key={preset.hours}
                  type="button"
                  onClick={() => {
                    onDelayChange(preset.hours);
                    setShowCustomDelay(false);
                  }}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs transition",
                    delayHours === preset.hours && !showCustomDelay
                      ? "border-primary bg-primary/5 text-primary"
                      : "text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustomDelay(!showCustomDelay)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs transition",
                  showCustomDelay || !isPreset
                    ? "border-primary bg-primary/5 text-primary"
                    : "text-muted-foreground hover:border-primary/50",
                )}
              >
                Custom
              </button>
            </div>

            {/* Custom delay inputs */}
            {showCustomDelay && (
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
                  onClick={handleCustomApply}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition"
                >
                  Set
                </button>
              </div>
            )}

            {/* Current delay display */}
            <p className="mt-1.5 text-xs text-muted-foreground">
              Follow-up will be sent <strong>{formatDelay(delayHours)}</strong> after the original
              email, if no reply is received.
            </p>
          </div>

          {/* Follow-up message */}
          <div>
            <label className="text-sm font-medium">Follow-up message</label>
            <textarea
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder="Hi, just following up on my previous email..."
              rows={4}
              className="mt-1.5 w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This message will be sent as a reply in the same email thread.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
