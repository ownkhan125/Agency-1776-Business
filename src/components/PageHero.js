"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import PageHeroBackdrop from "@/components/PageHeroBackdrop";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

/**
 * Shared premium hero used by every non-home page.
 *
 * Structure mirrors the home Hero closely — same eyebrow chip, same
 * ScrubText heading with an optional stencil-filled accent word, same
 * masked-line description — so the visual language is one design system
 * from `/` outward. Individual pages pass strings + a colour hint;
 * layout, animation, and easing are all locked in this component.
 *
 * Animations:
 *   • useScrubReveal(immediate)      → per-char dust materialization
 *                                       on mount (Hero-style, since
 *                                       every page's hero is at the top)
 *   • useSectionReveal               → orchestrated timeline for the
 *                                       eyebrow chip, description lines,
 *                                       and section particles + border
 *   • StencilFill (immediate)        → per-letter mask sweep on the red
 *                                       word inside the heading, matching
 *                                       "outcomes." on `/`
 */
export default function PageHero({
  eyebrow,
  index,          // "004" style
  heading,        // { lead: "…", tail: "…", accent: "" } — accent word gets StencilFill
  description,    // string OR array of strings (each line masked)
  children,       // optional CTAs / meta below the description
  backdrop = "beams", // PageHeroBackdrop variant ("beams" | "scan" | "pulse" | "sweep" | "directional")
}) {
  const revealRef = useSectionReveal({ start: "top bottom" });
  const scrubRef = useScrubReveal({ immediate: true, playDuration: 0.85 });

  const descLines = Array.isArray(description) ? description : [description];

  return (
    <SectionShell
      as="section"
      ref={revealRef}
      className="pt-40 pb-16 md:pt-48 md:pb-24"
      innerClassName="mx-auto flex max-w-[1600px] flex-col gap-14 px-6 md:px-16"
      backdrop={backdrop ? <PageHeroBackdrop variant={backdrop} /> : null}
    >
      <div className="flex items-center justify-between gap-8">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            {eyebrow}
            {index && (
              <>
                {" "}
                / <span>{index}</span>
              </>
            )}
          </span>
        </MaskedLine>
        <MaskedLine className="hidden text-[10px] uppercase tracking-[0.32em] text-foreground/45 md:block">
          Agency 1776 — Studio
        </MaskedLine>
      </div>

      <div ref={scrubRef} className="max-w-[70rem]">
        <h1 className="font-display text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[0.94] tracking-[-0.01em] text-foreground [word-break:normal]">
          {heading.lead && (
            <span className="block">
              <ScrubText>{heading.lead}</ScrubText>
            </span>
          )}
          {heading.tail && (
            <span className="block text-foreground/70">
              <ScrubText>{heading.tail}</ScrubText>
            </span>
          )}
          {heading.accent && (
            <span className="block">
              <StencilFill immediate className="text-accent">
                {heading.accent}
              </StencilFill>
            </span>
          )}
        </h1>
      </div>

      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <p className="max-w-md text-sm leading-relaxed text-foreground/70">
          {descLines.map((line, i) => (
            <MaskedLine key={i} block>
              {line}
            </MaskedLine>
          ))}
        </p>
        {children && (
          <div className="flex flex-wrap items-center gap-4">{children}</div>
        )}
      </div>
    </SectionShell>
  );
}
