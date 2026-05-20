"use client";

import Link from "next/link";
import { EmailList } from "@/components/emails/EmailList";

export default function ScheduledPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Emails</h2>
          <p className="mt-1 text-muted-foreground">Manage your upcoming and sent emails</p>
        </div>
        <Link
          href="/compose"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
        >
          Compose
        </Link>
      </div>
      <div className="mt-6">
        <EmailList />
      </div>
    </div>
  );
}
