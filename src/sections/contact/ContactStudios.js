"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

const STUDIOS = [
  { city: "New York",    coords: "40.7128°N · 74.0060°W", hours: "09 – 18 EST" },
  { city: "London",      coords: "51.5074°N · 0.1278°W",  hours: "09 – 18 GMT" },
  { city: "Tokyo",       coords: "35.6762°N · 139.6503°E", hours: "09 – 18 JST" },
];

export default function ContactStudios() {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="studios"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="mb-12">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Nodes online / 04
          </span>
        </MaskedLine>
      </div>

      <div
        ref={gridRef}
        className="chamfer chamfer-md grid grid-cols-1 gap-px bg-muted/40 md:grid-cols-3"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
          "--chamfer-bg": "color-mix(in srgb, var(--muted) 40%, transparent)",
        }}
      >
        {STUDIOS.map((s, i) => (
          <div
            key={s.city}
            data-stagger-item
            data-col={i}
            className="flex flex-col gap-3 bg-background p-8 md:p-10"
          >
            <MaskedLine
              as="h3"
              className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl"
            >
              {s.city}
            </MaskedLine>
            <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/40">
              {s.coords}
            </MaskedLine>
            <MaskedLine className="mt-4 text-sm text-accent">
              {s.hours}
            </MaskedLine>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
