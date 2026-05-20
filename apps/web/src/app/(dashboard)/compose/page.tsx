"use client";

import { ComposeForm } from "@/components/compose/ComposeForm";

export default function ComposePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Compose Email</h2>
      <p className="mt-1 text-muted-foreground">Schedule an email to send later</p>
      <div className="mt-6">
        <ComposeForm />
      </div>
    </div>
  );
}
