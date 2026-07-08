"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

const PROCESS = [
  { step: "01", label: "Frame", body: "Two-week discovery. Audits, interviews, and a written point of view." },
  { step: "02", label: "Systemize", body: "Foundations and the first 20 screens together. Nothing bespoke that could be systematic." },
  { step: "03", label: "Shape", body: "High-fidelity, motion, and prototypes we can prove with real users." },
  { step: "04", label: "Ship", body: "Engineering-ready handoff plus a week of ship support, then a 30-day retro." },
];

export default function ServicesProcess() {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();

  return (
    <SectionShell
      id="process"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="grid gap-16 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-24">
        <div ref={scrubRef} className="flex flex-col gap-8 md:sticky md:top-40 md:self-start">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              Process / 03
            </span>
          </MaskedLine>

          <h2 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
            <ScrubText>Four phases,</ScrubText>{" "}
            <span className="text-foreground/60">
              <ScrubText>every engagement.</ScrubText>
            </span>{" "}
            <StencilFill className="text-accent">No mystery.</StencilFill>
          </h2>

          <p className="max-w-md text-sm leading-relaxed text-foreground/60">
            <MaskedLine block>The same four steps whether the engagement is</MaskedLine>
            <MaskedLine block>a Sprint or a 14-week Systems build.</MaskedLine>
          </p>
        </div>

        <ol className="flex flex-col divide-y divide-muted/40 border-y border-muted/40">
          {PROCESS.map((p) => (
            <li key={p.step} className="flex flex-col gap-4 py-10 md:flex-row md:gap-10">
              <span
                data-reveal="icon"
                className="font-display text-4xl font-medium text-accent md:text-5xl"
              >
                {p.step}
              </span>
              <div className="flex flex-col gap-3">
                <MaskedLine
                  as="h3"
                  className="text-xl font-medium tracking-[-0.01em] text-foreground md:text-2xl"
                >
                  {p.label}
                </MaskedLine>
                <p className="max-w-md text-sm leading-relaxed text-foreground/60">
                  <MaskedLine>{p.body}</MaskedLine>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
