"use client";

import Link from "next/link";
import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";
import { SERVICES } from "@/data/services";

export default function ServicesGrid() {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="services-list"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            The four / 02
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          Each discipline has its own page — deliverables, process, engagement window.
        </MaskedLine>
      </div>

      <div
        ref={gridRef}
        className="chamfer chamfer-md grid grid-cols-1 gap-px bg-muted/40 md:grid-cols-2"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
          "--chamfer-bg": "color-mix(in srgb, var(--muted) 40%, transparent)",
        }}
      >
        {SERVICES.map((s, i) => {
          const MotionLink = motion.create(Link);
          return (
            <div key={s.slug} data-stagger-item data-col={i % 2} className="h-full">
              <MotionLink
                href={`/services/${s.slug}`}
                data-cursor="card"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="group relative flex h-full flex-col gap-8 bg-background p-8 md:p-12"
                style={{ backgroundImage: "var(--card-pinstripe)" }}
              >
                <div className="flex items-start justify-between">
                  <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
                    {s.kicker}
                  </MaskedLine>
                  <span
                    data-reveal="icon"
                    className="text-[10px] uppercase tracking-[0.28em] text-foreground/40"
                  >
                    {s.n}
                  </span>
                </div>

                <MaskedLine
                  as="h3"
                  className="font-display text-[clamp(1.75rem,3vw,3rem)] font-medium tracking-[-0.02em] text-foreground"
                >
                  {s.title}
                </MaskedLine>
                <p className="max-w-lg text-sm leading-relaxed text-foreground/60">
                  <MaskedLine>{s.lede}</MaskedLine>
                </p>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-accent">
                    Read more
                    <span className="inline-block h-px w-6 bg-accent transition-[width] duration-500 group-hover:w-16" />
                  </div>
                  <span
                    data-reveal="icon"
                    className="text-[10px] uppercase tracking-[0.28em] text-foreground/40"
                  >
                    {s.engagement}
                  </span>
                </div>
              </MotionLink>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
