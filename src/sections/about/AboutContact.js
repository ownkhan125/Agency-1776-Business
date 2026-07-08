"use client";

import Link from "next/link";
import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import CTAButton from "@/components/CTAButton";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

/**
 * Closing block on About — a small CTA row that echoes the site's
 * closing rhythm without duplicating the full Contact form. Sends the
 * reader to `/contact` for the form itself.
 */
export default function AboutContact() {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();

  return (
    <SectionShell
      id="about-contact"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div ref={scrubRef} className="flex flex-col gap-6">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              Next / 06
            </span>
          </MaskedLine>
          <h2 className="max-w-2xl text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
            <ScrubText>Booking Q1 2027 —</ScrubText>{" "}
            <StencilFill className="text-accent">talk soon.</StencilFill>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <CTAButton href="/contact" size="lg">
            Start a project
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
                See the work
                <span className="inline-block h-px w-6 bg-foreground" />
              </MotionLink>
            );
          })()}
        </div>
      </div>
    </SectionShell>
  );
}
