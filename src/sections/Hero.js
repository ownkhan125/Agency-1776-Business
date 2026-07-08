"use client";

import Link from "next/link";
import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import CTAButton from "@/components/CTAButton";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import HeroBackdrop from "@/components/HeroBackdrop";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

function BrandMark(props) {
  // 5px chamfer on a 46px outer stroke — matches the site-wide chamfered
  // corner treatment at a small icon scale.
  return (
    <svg
      data-reveal="icon"
      viewBox="0 0 48 48"
      fill="none"
      className="h-9 w-9"
      {...props}
    >
      <polygon
        points="6,1 42,1 47,6 47,42 42,47 6,47 1,42 1,6"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M12 34 24 14 36 34"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M17 34h14" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export default function Hero() {
  const revealRef = useSectionReveal({ start: "top bottom" });
  // Hero is always at the top of the page, so its heading materializes
  // immediately on mount rather than tied to scroll progress. Shorter
  // playDuration keeps the whole heading fully visible within ~0.9 s
  // of page load — no "still animating after load" tail.
  const scrubRef = useScrubReveal({ immediate: true, playDuration: 0.85 });

  return (
    <SectionShell
      as="section"
      id="top"
      ref={revealRef}
      className="min-h-[100svh]"
      innerClassName="mx-auto flex min-h-[100svh] max-w-[1600px] flex-col px-6 pt-28 pb-10 md:px-16 md:pt-32 md:pb-14"
      backdrop={<HeroBackdrop />}
    >
      <div className="flex items-start justify-between gap-8">
        <div className="flex items-center gap-6 text-foreground">
          <BrandMark />
          <div className="flex flex-col gap-1">
            <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-foreground/60">
              Independent design & engineering
            </MaskedLine>
            <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-foreground/40">
              Est. MMXXIV — Global
            </MaskedLine>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span
            data-reveal="icon"
            className="inline-flex h-2 w-2 rounded-full bg-accent"
          />
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-foreground/60">
            Booking Q4 · limited slots
          </MaskedLine>
        </div>
      </div>

      {/*
        Heading + description/CTAs live inside a single flex-1 block so the
        leftover vertical space centers this group as one unit rather than
        splitting into two large gaps above/below the heading. Tight gap-10
        keeps the description hooked to the heading.
      */}
      <div className="flex flex-1 flex-col justify-center gap-10 md:gap-12">
        <div ref={scrubRef} className="max-w-[70rem]">
          <h1 className="font-display text-[clamp(2.75rem,8.5vw,7.5rem)] leading-[0.92] tracking-[-0.02em] text-foreground [word-break:normal]">
            <span className="block">
              <ScrubText>Serious craft</ScrubText>
            </span>
            <span className="block text-foreground/70">
              <ScrubText>for teams that measure</ScrubText>
            </span>
            <span className="block">
              <StencilFill immediate className="text-accent">
                outcomes.
              </StencilFill>
            </span>
          </h1>
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <p className="max-w-md text-sm leading-relaxed text-foreground/70">
          <MaskedLine block>We partner with founders and operators</MaskedLine>
          <MaskedLine block>
            to design, ship, and refine the interfaces
          </MaskedLine>
          <MaskedLine block>their businesses grow on.</MaskedLine>
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <CTAButton href="/services" size="lg">
            View services
          </CTAButton>
          {(() => {
            const MotionLink = motion.create(Link);
            return (
              <MotionLink
                href="/work"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 480, damping: 28 }}
                data-cursor="link"
                className="inline-flex items-center gap-4 px-2 py-4 text-xs uppercase tracking-[0.24em] text-foreground"
              >
                Selected work
                <span className="inline-block h-px w-6 bg-foreground" />
              </MotionLink>
            );
          })()}
        </div>
        </div>
      </div>
    </SectionShell>
  );
}
