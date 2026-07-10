"use client";

import Link from "next/link";
import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";

/**
 * Minimal, premium footer. A single quiet section that reads as the
 * natural close of the page — brand mark + tagline on the left, three
 * short link columns on the right, one meta strip below. Every text
 * line rides the shared useSectionReveal timeline (MaskedLine → text
 * slide-up; small dots → icon settle) so the footer feels intentional
 * on entry without competing with the section above it. No custom GSAP
 * timelines; the same premium reveal every other section uses.
 */

const PRIMARY_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

const CONTACT_LINKS = [
  { label: "hello@1776.studio", href: "mailto:hello@1776.studio" },
  { label: "Book an intro", href: "/contact" },
];

const MotionLink = motion.create(Link);

export default function Footer() {
  const revealRef = useSectionReveal({
    start: "top bottom",
    toggleActions: "play none none none",
  });

  return (
    <SectionShell
      as="footer"
      id="footer"
      ref={revealRef}
      className="py-20 md:py-24"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
      particleColor="var(--accent)"
      particleCount={18}
    >
      <div className="grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
        {/* Left column: brand + tagline */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <span
              data-reveal="icon"
              aria-hidden
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
              Agency 1776
            </MaskedLine>
          </div>

          <MaskedLine
            as="h2"
            className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1] tracking-[-0.01em] text-foreground"
          >
            Let&rsquo;s build something worth visiting.
          </MaskedLine>

          <span className="inline-block overflow-hidden [line-height:1.4]">
            <motion.a
              href="mailto:hello@1776.studio"
              data-cursor="link"
              data-reveal="text-line"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 480, damping: 30 }}
              className="inline-flex items-center gap-3 text-sm tracking-[-0.005em] text-foreground/70 will-change-transform [transform:translate3d(0,0,0)] hover:text-foreground"
            >
              hello@1776.studio
              <span aria-hidden className="inline-block h-px w-6 bg-current" />
            </motion.a>
          </span>
        </div>

        {/* Right column: navigation + contact */}
        <div className="grid grid-cols-2 gap-10">
          <nav aria-label="Sitemap" className="flex flex-col gap-4">
            <MaskedLine className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/40">
              Navigate
            </MaskedLine>
            <ul className="flex flex-col gap-3">
              {PRIMARY_LINKS.map((link) => (
                <li key={link.href} className="overflow-hidden">
                  <MotionLink
                    href={link.href}
                    data-cursor="link"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 480, damping: 30 }}
                    className="inline-block text-[13px] tracking-[-0.005em] text-foreground/75 hover:text-foreground"
                    data-reveal="text-line"
                  >
                    {link.label}
                  </MotionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-4">
            <MaskedLine className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/40">
              Direct
            </MaskedLine>
            <ul className="flex flex-col gap-3">
              {CONTACT_LINKS.map((link) => {
                const isMail = link.href.startsWith("mailto:");
                const Wrapper = isMail ? motion.a : MotionLink;
                return (
                  <li key={link.href} className="overflow-hidden">
                    <Wrapper
                      href={link.href}
                      data-cursor="link"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 480, damping: 30 }}
                      className="inline-block text-[13px] tracking-[-0.005em] text-foreground/75 hover:text-foreground"
                      data-reveal="text-line"
                    >
                      {link.label}
                    </Wrapper>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Meta strip — separator + copyright + credits */}
      <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-muted/25 pt-6 md:mt-20 md:flex-row md:items-center">
        <MaskedLine className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/40">
          &copy; 2026 Agency 1776 &middot; New York
        </MaskedLine>
        <div className="flex items-center gap-6">
          <MaskedLine className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/40">
            Booking Q4
          </MaskedLine>
          <span className="flex items-center gap-2">
            <span
              data-reveal="icon"
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
            />
            <MaskedLine className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/40">
              Live
            </MaskedLine>
          </span>
        </div>
      </div>
    </SectionShell>
  );
}
