"use client";

import Link from "next/link";
import { DraftList } from "@/components/drafts/DraftList";

export default function DraftsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Drafts</h2>
          <p className="mt-1 text-muted-foreground">Organize and schedule your saved drafts</p>
        </div>
        <Link
          href="/compose"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
        >
          Compose
        </Link>
      </div>
      <div className="mt-6">
        <DraftList />
      </div>
    </div>
  );
}
