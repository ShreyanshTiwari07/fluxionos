"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";

const FAQS = [
  {
    q: "How do follow-ups know when to stop?",
    a: "After your email sends, FluxionOS monitors the Gmail thread. The moment a reply arrives, the scheduled follow-up is automatically cancelled — so you never nudge someone who already responded.",
  },
  {
    q: "What does the AI follow-up actually do?",
    a: "In AI mode, Gemini reads your original email's subject and body and drafts a concise, on-tone follow-up. You can preview and edit it while composing, or let it generate fresh right before sending.",
  },
  {
    q: "Does it work with my Gmail?",
    a: "Yes. You connect your Google account, and emails send through your own Gmail with proper threading. Your tokens are encrypted at rest.",
  },
  {
    q: "Can I pick an exact follow-up date and time?",
    a: "Absolutely. Choose a preset, a relative delay (e.g. 2 days after sending), or an exact calendar date and time — whatever fits the conversation.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — the Free plan includes 20 scheduled emails a month with manual follow-ups and reply detection. Upgrade to Pro for AI follow-ups and unlimited sends.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-12 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[0.95rem] font-medium">{item.q}</span>
                    <Plus
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                        isOpen && "rotate-45 text-primary",
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
