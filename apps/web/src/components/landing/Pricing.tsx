"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Everything you need to stop forgetting follow-ups.",
    cta: "Start free",
    featured: false,
    features: [
      "20 scheduled emails / month",
      "Manual auto follow-ups",
      "Reply detection",
      "Draft pipeline",
      "Gmail integration",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "/ month",
    blurb: "For people who live in their inbox and never want to miss a beat.",
    cta: "Upgrade to Pro",
    featured: true,
    features: [
      "Unlimited scheduled emails",
      "AI-powered follow-ups (Gemini)",
      "Custom send & follow-up times",
      "Priority background workers",
      "Everything in Free",
    ],
  },
];

export function Pricing() {
  return (
    <Section id="pricing">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing, no surprises"
            subtitle="Start free. Upgrade when you want AI and unlimited sends. Cancel anytime."
          />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-2">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-7",
                  plan.featured
                    ? "border-primary/40 bg-card shadow-glow"
                    : "border-border bg-card",
                )}
              >
                {plan.featured && (
                  <span className="absolute right-6 top-7 rounded-full bg-primary/15 px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-primary">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-tightest">{plan.price}</span>
                  <span className="pb-1 text-sm text-muted-foreground">{plan.cadence}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{plan.blurb}</p>

                <Button
                  asChild
                  variant={plan.featured ? "primary" : "outline"}
                  className="mt-6 w-full"
                >
                  <Link href="/login">{plan.cta}</Link>
                </Button>

                <ul className="mt-7 space-y-3 border-t border-border pt-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          plan.featured ? "text-primary" : "text-success",
                        )}
                      />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
