"use client";

import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "All", value: undefined },
  { label: "Cold Outreach", value: "cold_outreach" },
  { label: "Reminder", value: "reminder" },
  { label: "Personal", value: "personal" },
  { label: "Uncategorized", value: "uncategorized" },
];

interface CategoryFilterProps {
  value: string | undefined;
  onChange: (category: string | undefined) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          onClick={() => onChange(cat.value)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition",
            value === cat.value
              ? "border-primary bg-primary/5 text-primary"
              : "text-muted-foreground hover:border-primary/50",
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
