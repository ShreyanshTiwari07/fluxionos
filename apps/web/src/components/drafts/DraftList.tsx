"use client";

import { useState } from "react";
import { useDrafts } from "@/hooks/useDrafts";
import { DraftCard } from "./DraftCard";
import { CategoryFilter } from "./CategoryFilter";

export function DraftList() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useDrafts({ category, page });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border bg-muted/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Failed to load drafts: {error.message}
      </div>
    );
  }

  const drafts = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <CategoryFilter value={category} onChange={(c) => { setCategory(c); setPage(1); }} />

      {drafts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>No drafts yet</p>
          <p className="text-sm mt-1">Save drafts from the compose page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.total_pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.total_pages}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
