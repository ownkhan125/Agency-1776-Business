"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

const CLIENTS = [
  "Northwind", "Lumen", "Halo", "Circumfix", "Argent", "Kettle",
  "Meridian", "Ostara", "Polymath", "Rassle", "Serac", "Tandem",
];

export default function WorkClients() {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="clients"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Under NDA / 03
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          A dozen more we can't publish. Ask on a call.
        </MaskedLine>
      </div>

      <div
        ref={gridRef}
        className="chamfer chamfer-md grid grid-cols-3 gap-px bg-muted/40 sm:grid-cols-4 md:grid-cols-6"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
          "--chamfer-bg": "color-mix(in srgb, var(--muted) 40%, transparent)",
        }}
      >
        {CLIENTS.map((c, i) => (
          <div
            key={c}
            data-stagger-item
            data-col={i % 6}
            className="flex aspect-[3/2] items-center justify-center bg-background p-4"
          >
            <span
              data-reveal="icon"
              className="font-display text-lg tracking-[-0.02em] text-foreground/60 md:text-xl"
            >
              {c}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
