"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

// NOTE: representative placeholder figures — swap with real metrics later.
const STATS = [
  { value: "37%", label: "More replies with timely follow-ups" },
  { value: "10k+", label: "Follow-ups sent on autopilot" },
  { value: "0", label: "Threads forgotten" },
  { value: "<2s", label: "To schedule and walk away" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Stagger className="grid grid-cols-2 gap-y-10 sm:gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label} className="text-center">
              <div className="text-4xl font-semibold tracking-tightest text-gradient-accent sm:text-5xl">
                {s.value}
              </div>
              <p className="mx-auto mt-2 max-w-[12rem] text-sm text-muted-foreground">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.1}>
          <p className="mt-10 text-center text-xs text-muted-foreground/70">
            Figures shown are illustrative.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
