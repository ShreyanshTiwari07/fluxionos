"use client";

import { PenLine, Radar, Send } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

const STEPS = [
  {
    icon: PenLine,
    step: "01",
    title: "Compose & schedule",
    desc: "Write your email, pick when it should send, and toggle on an auto follow-up — manual or AI.",
  },
  {
    icon: Radar,
    step: "02",
    title: "We watch the thread",
    desc: "After it sends, FluxionOS quietly monitors the conversation for a reply on your behalf.",
  },
  {
    icon: Send,
    step: "03",
    title: "Follow up — or stand down",
    desc: "No reply by your deadline? A perfectly-timed follow-up goes out. They replied? We stay out of the way.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Set it once. It runs itself."
            subtitle="Three steps from send to closed loop — no spreadsheets, no reminders, no mental overhead."
          />
        </Reveal>

        <Stagger className="relative mt-16 grid gap-6 md:grid-cols-3">
          {/* connector line */}
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {STEPS.map((s) => (
            <StaggerItem key={s.step}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary/60 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground/50">{s.step}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
