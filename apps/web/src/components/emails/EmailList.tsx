"use client";

import { useState } from "react";
import { useEmails } from "@/hooks/useEmails";
import { EmailCard } from "./EmailCard";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "All", value: undefined },
  { label: "Scheduled", value: "scheduled" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

export function EmailList() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useEmails({ status, page });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Failed to load emails: {error.message}
      </div>
    );
  }

  const emails = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              status === filter.value
                ? "border-primary bg-primary/5 text-primary"
                : "text-muted-foreground hover:border-primary/50",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Email list */}
      {emails.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>No emails found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      )}

      {/* Pagination */}
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
