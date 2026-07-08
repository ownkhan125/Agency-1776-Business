"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

const CHANNELS = [
  { label: "New work",  value: "new@agency1776.com",  meta: "First reply < 1 day" },
  { label: "Studio",    value: "studio@agency1776.com", meta: "General inquiries" },
  { label: "Press",     value: "press@agency1776.com", meta: "Bio + assets on request" },
  { label: "Careers",   value: "careers@agency1776.com", meta: "Senior IC only" },
];

export default function ContactChannels() {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="channels"
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
            Direct / 03
          </span>
        </MaskedLine>
      </div>

      <div
        ref={gridRef}
        className="chamfer chamfer-md grid grid-cols-1 gap-px bg-muted/40 sm:grid-cols-2"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
          "--chamfer-bg": "color-mix(in srgb, var(--muted) 40%, transparent)",
        }}
      >
        {CHANNELS.map((c, i) => (
          <a
            key={c.label}
            href={`mailto:${c.value}`}
            data-cursor="link"
            data-stagger-item
            data-col={i % 2}
            className="group flex flex-col gap-3 bg-background p-8 md:p-10"
            style={{ backgroundImage: "var(--card-pinstripe)" }}
          >
            <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
              {c.label}
            </MaskedLine>
            <MaskedLine
              as="span"
              className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground group-hover:text-accent md:text-3xl"
            >
              {c.value}
            </MaskedLine>
            <span
              data-reveal="icon"
              className="text-[10px] uppercase tracking-[0.28em] text-foreground/40"
            >
              {c.meta}
            </span>
          </a>
        ))}
      </div>
    </SectionShell>
  );
}
