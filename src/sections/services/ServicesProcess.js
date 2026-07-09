"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

const PROCESS = [
  { step: "01", label: "Diagnose", body: "We identify what your current website is missing: clarity, structure, design, trust, CTAs, or lead flow." },
  { step: "02", label: "Plan", body: "We map the website structure, page flow, service sections, and conversion path." },
  { step: "03", label: "Write", body: "We create clear website copy that explains your business and moves visitors toward action." },
  { step: "04", label: "Design", body: "We design a professional website that supports the message and builds trust." },
  { step: "05", label: "Build", body: "We develop the website across desktop, tablet, and mobile." },
  { step: "06", label: "Launch", body: "We prepare your CTAs, forms, SEO foundation, and final pages so the site is ready to work." },
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
              Our process / 03
            </span>
          </MaskedLine>

          <h2 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
            <ScrubText>Six phases,</ScrubText>{" "}
            <span className="text-foreground/60">
              <ScrubText>every project.</ScrubText>
            </span>{" "}
            <StencilFill className="text-accent">Launch with direction.</StencilFill>
          </h2>

          <p className="max-w-md text-sm leading-relaxed text-foreground/60">
            <MaskedLine block>Your goal is not just to launch a website —</MaskedLine>
            <MaskedLine block>it is to launch with direction. That is why</MaskedLine>
            <MaskedLine block>our work process helps your business win.</MaskedLine>
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
