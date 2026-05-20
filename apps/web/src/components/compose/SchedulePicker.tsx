"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SchedulePickerProps {
  value: string;
  onChange: (isoString: string) => void;
}

function getPresets(): { label: string; value: Date }[] {
  const now = new Date();
  const presets: { label: string; value: Date }[] = [];

  // In 1 hour
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  presets.push({ label: "In 1 hour", value: inOneHour });

  // In 3 hours
  const inThreeHours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  presets.push({ label: "In 3 hours", value: inThreeHours });

  // Tomorrow 9 AM
  const tomorrow9 = new Date(now);
  tomorrow9.setDate(tomorrow9.getDate() + 1);
  tomorrow9.setHours(9, 0, 0, 0);
  presets.push({ label: "Tomorrow 9 AM", value: tomorrow9 });

  // Next Monday 9 AM
  const nextMonday = new Date(now);
  const daysUntilMonday = ((1 - now.getDay() + 7) % 7) || 7;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0);
  presets.push({ label: "Monday 9 AM", value: nextMonday });

  return presets;
}

function toLocalDatetimeString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const presets = getPresets();

  const handlePreset = (date: Date) => {
    onChange(date.toISOString());
    setShowCustom(false);
  };

  const handleCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onChange(date.toISOString());
    }
  };

  const selectedDate = value ? new Date(value) : null;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Schedule for</label>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePreset(preset.value)}
            className={cn(
              "rounded-md border px-3 py-2 text-sm transition hover:border-primary/50",
              selectedDate &&
                Math.abs(selectedDate.getTime() - preset.value.getTime()) < 60000
                ? "border-primary bg-primary/5 text-primary"
                : "text-muted-foreground",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowCustom(!showCustom)}
        className="text-sm text-primary hover:underline"
      >
        {showCustom ? "Hide custom picker" : "Pick custom date & time"}
      </button>

      {showCustom && (
        <input
          type="datetime-local"
          value={selectedDate ? toLocalDatetimeString(selectedDate) : ""}
          onChange={handleCustom}
          min={toLocalDatetimeString(new Date())}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      )}

      {selectedDate && (
        <p className="text-xs text-muted-foreground">
          Will send on{" "}
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          at{" "}
          {selectedDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
