"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-grid-fade" />
        <div className="glow absolute left-1/2 top-[-6rem] h-[28rem] w-[40rem] -translate-x-1/2 opacity-70" />
        <div className="glow absolute right-[-8rem] top-40 h-72 w-72 opacity-40" />
      </div>

      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="flex justify-center"
          >
            <Link
              href="#features"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 py-1 pl-1.5 pr-3 text-sm text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> New
              </span>
              AI-powered follow-ups
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.05 }}
            className="mt-7 text-balance text-5xl font-semibold leading-[1.05] tracking-tightest sm:text-6xl md:text-7xl"
          >
            Send it. Forget it.
            <br />
            <span className="text-gradient-accent">We&apos;ll follow up.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.12 }}
            className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            FluxionOS schedules your emails, watches for replies, and sends the perfect follow-up —
            written by you or by AI. Never chase a thread again.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.18 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="#how">See how it works</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-5 text-sm text-muted-foreground"
          >
            Free to start · Connect Gmail in seconds · No credit card
          </motion.p>
        </div>

        {/* Floating product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="glow absolute -inset-x-10 -top-10 bottom-0 -z-10 opacity-50" />
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-destructive/70" />
        <span className="h-3 w-3 rounded-full bg-[hsl(40_90%_55%)]/70" />
        <span className="h-3 w-3 rounded-full bg-success/70" />
        <span className="ml-3 text-xs text-muted-foreground">New message — FluxionOS</span>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-[1fr_240px]">
        {/* Compose */}
        <div className="space-y-4 bg-card p-5 sm:p-6">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">To</div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              alex@acme.com
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Subject</div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium">
              Quick question about the proposal
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-sm leading-relaxed text-muted-foreground">
            Hey Alex — following up to see if you had a chance to review the deck. Happy to hop on a
            quick call this week…
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" /> Tomorrow, 9:00 AM
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
              Schedule
            </div>
          </div>
        </div>

        {/* Follow-up rail */}
        <div className="space-y-3 bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Auto follow-up</div>
          <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              If no reply in 2 days, AI sends a friendly nudge in the same thread.
            </p>
          </div>
          {[
            { t: "Scheduled", c: "text-muted-foreground" },
            { t: "Reply detected → paused", c: "text-success" },
          ].map((s) => (
            <div key={s.t} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className={`h-4 w-4 ${s.c}`} />
              <span className="text-muted-foreground">{s.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
