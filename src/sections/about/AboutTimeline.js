"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

const MILESTONES = [
  { year: "2024", title: "Studio founded", body: "Two designers and one engineer, one deep engagement per quarter." },
  { year: "2024", title: "First 12-month retainer", body: "A Series B trading desk brings us on as their design + engineering partner." },
  { year: "2025", title: "First launch film ships", body: "The Halo Studios product tour lifts trial conversion 61 % — a proof point we still lean on." },
  { year: "2025", title: "Team of five", body: "Two more full-time engineers join. Every project still ships with a senior IC on it every day." },
  { year: "2026", title: "Q4 booked", body: "Currently interviewing for two engagements starting January 2027." },
];

export default function AboutTimeline() {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="timeline"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Trajectory / 04
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          Two years in. The pace is deliberate.
        </MaskedLine>
      </div>

      <div ref={gridRef} className="relative">
        <span
          aria-hidden
          data-reveal="icon"
          className="pointer-events-none absolute left-6 top-0 h-full w-px bg-muted/40 md:left-1/2"
        />
        <ol className="flex flex-col gap-14">
          {MILESTONES.map((m, i) => (
            <li
              key={i}
              data-stagger-item
              data-col={i % 2}
              className="relative grid grid-cols-[36px_1fr] items-start gap-6 md:grid-cols-[1fr_36px_1fr] md:gap-10"
            >
              <div className={i % 2 === 0 ? "hidden md:block" : "hidden md:block md:pr-8 md:text-right"}>
                {i % 2 === 1 && (
                  <>
                    <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-accent">
                      {m.year}
                    </MaskedLine>
                    <MaskedLine
                      as="h3"
                      className="mt-2 text-lg font-medium tracking-[-0.01em] text-foreground"
                    >
                      {m.title}
                    </MaskedLine>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/60 md:ml-auto">
                      <MaskedLine>{m.body}</MaskedLine>
                    </p>
                  </>
                )}
              </div>
              <div
                aria-hidden
                data-reveal="icon"
                className="mt-2 h-3 w-3 -translate-x-[5px] rounded-full bg-accent md:mx-auto md:-translate-x-[0px]"
              />
              <div className={i % 2 === 0 ? "md:pl-8" : "md:pl-8 md:hidden"}>
                <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-accent">
                  {m.year}
                </MaskedLine>
                <MaskedLine
                  as="h3"
                  className="mt-2 text-lg font-medium tracking-[-0.01em] text-foreground"
                >
                  {m.title}
                </MaskedLine>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/60">
                  <MaskedLine>{m.body}</MaskedLine>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
