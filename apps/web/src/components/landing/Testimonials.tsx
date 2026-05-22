"use client";

import { Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

// NOTE: placeholder testimonials — replace with real customer quotes.
const QUOTES = [
  {
    quote:
      "I used to keep a spreadsheet of who hadn't replied. Now FluxionOS just handles it. My reply rate jumped and I stopped dropping balls.",
    name: "Maya Chen",
    role: "Founder, Northwind",
    initials: "MC",
  },
  {
    quote:
      "The AI follow-ups are scarily good — they sound like me. I schedule the send and genuinely forget about it until someone replies.",
    name: "Daniel Rivera",
    role: "Account Executive",
    initials: "DR",
  },
  {
    quote:
      "It's the rare tool that feels invisible. Clean, fast, and it does exactly one thing extremely well.",
    name: "Priya Anand",
    role: "Indie consultant",
    initials: "PA",
  },
];

export function Testimonials() {
  return (
    <Section className="bg-secondary/20">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Loved by closers"
            title="People who hate chasing, love this"
          />
        </Reveal>

        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {QUOTES.map((q) => (
            <StaggerItem key={q.name}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <blockquote className="text-pretty text-[0.95rem] leading-relaxed text-foreground/90">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[hsl(var(--grad-1))] to-[hsl(var(--grad-2))] text-sm font-semibold text-primary-foreground">
                    {q.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{q.name}</span>
                    <span className="block text-xs text-muted-foreground">{q.role}</span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
