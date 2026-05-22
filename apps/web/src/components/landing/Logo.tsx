import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[hsl(var(--grad-1))] to-[hsl(var(--grad-2))] text-primary-foreground shadow-[0_2px_12px_-2px_hsl(var(--primary)/0.6)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span className="text-[1.05rem]">
        Fluxion<span className="text-muted-foreground">OS</span>
      </span>
    </span>
  );
}
