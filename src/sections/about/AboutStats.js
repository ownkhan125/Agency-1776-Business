"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

const STATS = [
  { value: "48", label: "Products shipped" },
  { value: "12yr", label: "Combined practice" },
  { value: "9", label: "Countries served" },
  { value: "100%", label: "Repeat clients since 2022" },
  { value: "5", label: "Full-time IC" },
  { value: "4", label: "Time zones covered" },
];

export default function AboutStats() {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="stats"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            The numbers / 02
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          Updated quarterly. Nothing rounded, nothing softened.
        </MaskedLine>
      </div>

      <div
        ref={gridRef}
        className="chamfer chamfer-md grid grid-cols-2 gap-px bg-muted/40 md:grid-cols-3"
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
            data-col={i % 3}
            className="flex flex-col gap-3 bg-background p-6 md:p-10"
          >
            <span
              data-reveal="icon"
              className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-5xl"
            >
              {s.value}
            </span>
            <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
              {s.label}
            </MaskedLine>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
