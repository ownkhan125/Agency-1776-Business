"use client";

import Link from "next/link";
import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";
import { PROJECTS } from "@/data/projects";

export default function WorkGrid() {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();
  const MotionLink = motion.create(Link);

  return (
    <SectionShell
      id="work-list"
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
            The book / 02
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          Click through for the case — numbers, stack, and what shipped.
        </MaskedLine>
      </div>

      <div ref={gridRef} className="flex flex-col divide-y divide-muted/40 border-y border-muted/40">
        {PROJECTS.map((p, i) => (
          <div key={p.slug} data-stagger-item data-col={0}>
            <MotionLink
              href={`/work/${p.slug}`}
              data-cursor="card"
              whileHover={{ x: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="group grid grid-cols-1 items-center gap-6 py-10 md:grid-cols-[80px_1fr_auto] md:gap-10 md:py-14"
            >
              <span
                data-reveal="icon"
                className="text-[10px] uppercase tracking-[0.28em] text-foreground/40"
              >
                {p.id} · {p.year}
              </span>
              <div className="flex flex-col gap-3">
                <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-accent">
                  {p.client} · {p.tag}
                </MaskedLine>
                <MaskedLine
                  as="h3"
                  className="font-display text-[clamp(1.5rem,3.6vw,3rem)] font-medium tracking-[-0.02em] text-foreground"
                >
                  {p.title}
                </MaskedLine>
                <p className="max-w-xl text-sm leading-relaxed text-foreground/60">
                  <MaskedLine>{p.lede}</MaskedLine>
                </p>
              </div>
              <span
                data-reveal="icon"
                className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-accent md:self-end"
              >
                Read case
                <span className="inline-block h-px w-8 bg-accent transition-[width] duration-500 group-hover:w-16" />
              </span>
            </MotionLink>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
