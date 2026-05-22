"use client";

import { CalendarClock, Sparkles, MailCheck, Layers, ShieldCheck, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

type Card = {
  icon: React.ElementType;
  title: string;
  desc: string;
  className: string;
  accent?: boolean;
};

const CARDS: Card[] = [
  {
    icon: CalendarClock,
    title: "Schedule with intent",
    desc: "Pick a preset, a relative delay, or an exact date and time. Your email lands in their inbox at the perfect moment.",
    className: "md:col-span-2",
  },
  {
    icon: Sparkles,
    title: "AI writes the follow-up",
    desc: "Let Gemini draft a contextual nudge from your original email — or write your own. You're always in control.",
    className: "md:col-span-1",
    accent: true,
  },
  {
    icon: MailCheck,
    title: "Knows when to stop",
    desc: "FluxionOS watches the thread. The moment someone replies, the follow-up is automatically cancelled.",
    className: "md:col-span-1",
  },
  {
    icon: Layers,
    title: "A tidy draft pipeline",
    desc: "Save, categorize, and revisit drafts — cold outreach, reminders, personal — without the inbox clutter.",
    className: "md:col-span-2",
  },
  {
    icon: ShieldCheck,
    title: "Gmail-native & secure",
    desc: "Sends through your own Gmail with proper threading. Tokens are encrypted at rest.",
    className: "md:col-span-1",
  },
  {
    icon: Gauge,
    title: "Always-on workers",
    desc: "A reliable background engine fires every send and reply-check on time, even while you sleep.",
    className: "md:col-span-2",
  },
];

export function Bento() {
  return (
    <Section id="features">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Everything you need"
            title="One workspace to close every loop"
            subtitle="From the first send to the final reply, FluxionOS handles the parts you keep forgetting."
          />
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((card) => (
            <StaggerItem key={card.title} className={card.className}>
              <BentoCard {...card} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

function BentoCard({ icon: Icon, title, desc, accent }: Card) {
  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-elevated",
        accent && "border-primary/30",
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      )}
      <div
        className={cn(
          "mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border",
          accent
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-secondary/60 text-foreground/80",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
