"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

const PRINCIPLES = [
  {
    n: "01",
    title: "Design and engineering share one timeline.",
    body:
      "No handoff, no throwaway artifacts. The person who drew it is the person who ships it. That collapses the calendar and the misinterpretation gap by roughly half.",
  },
  {
    n: "02",
    title: "Fewer, deeper engagements.",
    body:
      "We take on four to six engagements per year. That is a business decision, not a marketing one — it is the only way we can commit senior time to every day of every project.",
  },
  {
    n: "03",
    title: "Every deliverable defends a business decision.",
    body:
      "Taste is a tool. Every screen, film, and system we ship is scored against the metric the client is trying to move — retention, activation, deal velocity, whatever it is. We report that number in month two, six, and twelve.",
  },
  {
    n: "04",
    title: "Motion is meaning, not decoration.",
    body:
      "If a movement doesn't tell the user something they didn't know before it started, we cut it. That is why our launch films read as intent and our product tours reduce sales objections.",
  },
];

export default function AboutPrinciples() {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();

  return (
    <SectionShell
      id="principles"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="grid gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-24">
        <div ref={scrubRef} className="flex flex-col gap-8 md:sticky md:top-40 md:self-start">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              Principles / 03
            </span>
          </MaskedLine>

          <h2 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
            <ScrubText>Four decisions we make</ScrubText>{" "}
            <span className="text-foreground/60">
              <ScrubText>on every project.</ScrubText>
            </span>
            <br />
            <StencilFill className="text-accent">Non-negotiable.</StencilFill>
          </h2>

          <p className="max-w-md text-sm leading-relaxed text-foreground/60">
            <MaskedLine block>These aren't beliefs we picked to sound principled.</MaskedLine>
            <MaskedLine block>They are the four things we've watched fail every time</MaskedLine>
            <MaskedLine block>we've compromised on them. So we stopped compromising.</MaskedLine>
          </p>
        </div>

        <ol className="flex flex-col divide-y divide-muted/40 border-y border-muted/40">
          {PRINCIPLES.map((p) => (
            <li key={p.n} className="flex flex-col gap-4 py-8 md:flex-row md:gap-8 md:py-10">
              <span
                data-reveal="icon"
                className="shrink-0 text-[10px] uppercase tracking-[0.32em] text-accent md:pt-1"
              >
                {p.n}
              </span>
              <div className="flex flex-col gap-3">
                <MaskedLine
                  as="h3"
                  className="text-xl font-medium tracking-[-0.01em] text-foreground md:text-2xl"
                >
                  {p.title}
                </MaskedLine>
                <p className="max-w-lg text-sm leading-relaxed text-foreground/60">
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
