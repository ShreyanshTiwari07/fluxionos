"use client";

import Link from "next/link";
import { PenSquare } from "lucide-react";
import { DraftList } from "@/components/drafts/DraftList";
import { Button } from "@/components/ui/button";

export default function DraftsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Drafts</h1>
          <p className="mt-1.5 text-muted-foreground">Organize and schedule your saved drafts</p>
        </div>
        <Button asChild size="sm">
          <Link href="/compose">
            <PenSquare className="h-4 w-4" /> Compose
          </Link>
        </Button>
      </div>
      <DraftList />
    </div>
  );
}
