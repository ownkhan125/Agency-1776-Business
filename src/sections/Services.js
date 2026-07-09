"use client";

import Link from "next/link";
import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

const SERVICES = [
  {
    slug: "business-website-design",
    n: "01",
    title: "Business Website Design",
    body:
      "Professional websites that make your business look credible, clear, and easy to choose.",
    Icon: (props) => (
      <svg viewBox="0 0 40 40" fill="none" {...props}>
        <rect x="4" y="4" width="32" height="32" stroke="currentColor" />
        <path d="M4 20h32M20 4v32" stroke="currentColor" />
        <circle cx="20" cy="20" r="4" stroke="currentColor" />
      </svg>
    ),
  },
  {
    slug: "conversion-focused-copy",
    n: "02",
    title: "Conversion-Focused Copy",
    body:
      "Website copy that explains your value and moves visitors toward action across every page.",
    Icon: (props) => (
      <svg viewBox="0 0 40 40" fill="none" {...props}>
        <circle cx="20" cy="20" r="16" stroke="currentColor" />
        <path d="M8 26c6-14 18-14 24 0" stroke="currentColor" />
        <path d="M14 14l12 12M26 14L14 26" stroke="currentColor" />
      </svg>
    ),
  },
  {
    slug: "website-development",
    n: "03",
    title: "Website Development",
    body:
      "Responsive, functional websites that work across desktop, tablet, and mobile — built to be found and used.",
    Icon: (props) => (
      <svg viewBox="0 0 40 40" fill="none" {...props}>
        <path d="M14 12L6 20l8 8" stroke="currentColor" />
        <path d="M26 12l8 8-8 8" stroke="currentColor" />
        <path d="M23 8l-6 24" stroke="currentColor" />
      </svg>
    ),
  },
  {
    slug: "lead-generation-pages",
    n: "04",
    title: "Lead Generation Pages",
    body:
      "Focused pages designed for quote requests, bookings, inquiries, campaigns, and sales conversations.",
    Icon: (props) => (
      <svg viewBox="0 0 40 40" fill="none" {...props}>
        <rect x="4" y="8" width="32" height="24" stroke="currentColor" />
        <path d="M16 14l10 6-10 6z" stroke="currentColor" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Services() {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();
  // Column-scrub staggered grid for the 2×2 ServiceCards — cards enter
  // from yPercent 450 as the section crosses the viewport, middle
  // columns lead, outer columns delay.
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="services"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
        <div ref={scrubRef} className="flex flex-col gap-8">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              Services / 004
            </span>
          </MaskedLine>

          <h2 className="text-[clamp(2.25rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
            <ScrubText>A tight surface area</ScrubText>{" "}
            <span className="text-foreground/60">
              <ScrubText>so the work stays deep.</ScrubText>
            </span>
          </h2>

          <p className="max-w-sm text-sm leading-relaxed text-foreground/70">
            <MaskedLine block>
              We take on a handful of engagements each
            </MaskedLine>
            <MaskedLine block>
              quarter. Every project runs with a senior
            </MaskedLine>
            <MaskedLine block>designer and engineer in the room.</MaskedLine>
          </p>
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
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.n} {...s} col={i % 2} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function ServiceCard({ slug, n, title, body, Icon, col = 0 }) {
  // Outer wrapper is the ONLY element GSAP's useStaggeredGrid touches
  // (via data-stagger-item). Its transform is the yPercent/autoAlpha
  // rise-from-below tween. The inner motion.article owns the hover
  // transform independently. The inner Link routes to the service
  // detail page.
  const MotionLink = motion.create(Link);
  return (
    <div data-stagger-item data-col={col} className="h-full">
      <MotionLink
        href={`/services/${slug}`}
        data-cursor="card"
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="group relative flex h-full flex-col gap-6 bg-background p-8 md:p-10"
        style={{ backgroundImage: "var(--card-pinstripe)" }}
      >
        <div className="flex items-start justify-between">
          <Icon
            data-reveal="icon"
            className="h-10 w-10 text-foreground transition-colors group-hover:text-accent"
          />
          <span
            data-reveal="icon"
            className="text-[10px] uppercase tracking-[0.28em] text-foreground/40"
          >
            {n}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <MaskedLine as="h3" className="text-xl font-medium tracking-[-0.01em] text-foreground">
            {title}
          </MaskedLine>
          <p className="max-w-sm text-sm leading-relaxed text-foreground/60">
            <MaskedLine>{body}</MaskedLine>
          </p>
        </div>

        <span className="mt-auto inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-accent">
          Read more
          <span className="inline-block h-px w-6 bg-accent transition-[width] duration-500 group-hover:w-12" />
        </span>
      </MotionLink>
    </div>
  );
}
