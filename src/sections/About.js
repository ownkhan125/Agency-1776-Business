"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

const STATS = [
  { value: "48", label: "Products shipped" },
  { value: "12yr", label: "Combined practice" },
  { value: "9", label: "Countries served" },
  { value: "100%", label: "Repeat clients since 2022" },
];

const PRINCIPLES = [
  "Design and engineering share one timeline, one file, one Slack.",
  "Fewer, deeper engagements. No throwaway artifacts.",
  "Every deliverable defends a business decision, not a taste one.",
];

export default function About() {
  // Center-out stagger on the 2×2 stats grid (48 shipped, 12yr practice,
  // 9 countries, 100% repeat) — inner tiles land first, outer follow.
  const revealRef = useSectionReveal();
  // Column-scrub grid: inner stat tiles rise from way below first,
  // outer tiles ripple in after.
  const gridRef = useStaggeredGrid();
  const scrubRef = useScrubReveal();

  return (
    <SectionShell
      id="about"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="grid gap-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-24">
        <div ref={scrubRef} className="flex flex-col gap-10">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              About / 002
            </span>
          </MaskedLine>

          <h2 className="text-[clamp(2.25rem,5.5vw,4rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
            <ScrubText mode="word">
              A small studio built around one belief: that thoughtful software
              is still a competitive advantage.
            </ScrubText>
          </h2>

          <ul className="flex flex-col divide-y divide-muted/50 border-y border-muted/50">
            {PRINCIPLES.map((p, i) => (
              <li
                key={i}
                className="flex items-start gap-6 py-6 text-sm text-foreground/80"
              >
                <span
                  data-reveal="icon"
                  className="mt-1 shrink-0 text-[10px] uppercase tracking-[0.28em] text-foreground/40"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <MaskedLine className="max-w-lg leading-relaxed">
                  {p}
                </MaskedLine>
              </li>
            ))}
          </ul>
        </div>

        <aside className="relative">
          <div
            ref={gridRef}
            className="chamfer chamfer-md grid grid-cols-2 gap-px bg-muted/40"
            style={{
              "--chamfer-border-color":
                "color-mix(in srgb, var(--muted) 40%, transparent)",
              "--chamfer-bg": "color-mix(in srgb, var(--muted) 40%, transparent)",
            }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                data-stagger-item
                data-col={i % 2}
                className="flex flex-col gap-3 bg-background p-6 md:p-8"
                style={{ backgroundImage: "var(--card-pinstripe)" }}
              >
                <span
                  data-reveal="icon"
                  className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl"
                >
                  {s.value}
                </span>
                <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
                  {s.label}
                </MaskedLine>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-foreground/50">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            <MaskedLine>Studio metrics · updated quarterly</MaskedLine>
          </div>
        </aside>
      </div>
    </SectionShell>
  );
}
