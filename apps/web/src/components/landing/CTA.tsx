"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";

export function CTA() {
  return (
    <section className="px-5 py-20 sm:py-28 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-12">
          {/* ambient */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-60" />
          <div className="glow absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 opacity-70" />

          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tightest sm:text-5xl">
            Stop chasing.{" "}
            <span className="text-gradient-accent">Start closing.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Connect your Gmail and schedule your first smart follow-up in under a minute.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="#pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
