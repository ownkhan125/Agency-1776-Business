"use client";

import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import CTAButton from "@/components/CTAButton";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

// Placeholder tiers — copy will change once the client confirms.
const TIERS = [
  {
    id: "sprint",
    name: "Sprint",
    lede: "A focused two-week engagement to unblock a single surface.",
    priceLabel: "Starting at —",
    price: "$18k",
    bullets: [
      "One senior designer + engineer",
      "Two weeks · one deliverable",
      "Async by default, weekly review",
    ],
    cta: "Book a sprint",
  },
  {
    id: "retainer",
    name: "Retainer",
    lede: "Ongoing product partnership for teams shipping to production.",
    priceLabel: "Per month —",
    price: "$28k",
    bullets: [
      "Dedicated designer + engineer",
      "Continuous discovery + delivery",
      "Roadmap, prototypes, code",
    ],
    cta: "Start a retainer",
    featured: true,
  },
  {
    id: "systems",
    name: "Systems",
    lede: "Bespoke brand and product system for a company at inflection.",
    priceLabel: "From —",
    price: "$140k",
    bullets: [
      "Brand + product + engineering",
      "10 – 14 week engagement",
      "Coded design system on delivery",
    ],
    cta: "Talk systems",
  },
];

export default function Pricing() {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();
  // Column-scrub grid: Retainer (middle) rises first from way below,
  // Sprint + Systems flank in as scroll continues.
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="pricing"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="mb-20 flex flex-col gap-10 md:mb-28 md:flex-row md:items-end md:justify-between">
        <div ref={scrubRef} className="flex flex-col gap-6">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              Engagements / 005
            </span>
          </MaskedLine>

          <h2 className="max-w-3xl text-[clamp(2.25rem,5.5vw,4rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
            <ScrubText>Three ways to work together.</ScrubText>
          </h2>
        </div>

        <MaskedLine className="text-sm text-foreground/60">
          Placeholder pricing — final tiers land after scoping.
        </MaskedLine>
      </div>

      <div
        ref={gridRef}
        className="chamfer chamfer-md grid grid-cols-1 gap-px bg-muted/40 lg:grid-cols-3"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
          "--chamfer-bg": "color-mix(in srgb, var(--muted) 40%, transparent)",
        }}
      >
        {TIERS.map((t, i) => (
          <PricingCard key={t.id} tier={t} col={i} />
        ))}
      </div>
    </SectionShell>
  );
}

function PricingCard({ tier, col = 0 }) {
  return (
    // GSAP animates the wrapper; motion animates the inner article.
    // Different DOM elements = different `style.transform` slots =
    // no fight during entrance scrub + hover.
    <div data-stagger-item data-col={col} className="h-full">
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={
        (tier.featured ? "bg-surface " : "bg-background ") +
        "relative flex h-full flex-col gap-8 p-8 md:p-10"
      }
      style={{ backgroundImage: "var(--card-pinstripe)" }}
    >
      {tier.featured && (
        <span
          data-reveal="icon"
          className="chamfer chamfer-xs absolute right-8 top-8 inline-flex items-center gap-2 px-2 py-1 text-[9px] uppercase tracking-[0.28em] text-accent"
          style={{ "--chamfer-border-color": "var(--accent)" }}
        >
          <span className="relative z-10 h-1 w-1 bg-accent" />
          <span className="relative z-10">Most fit</span>
        </span>
      )}

      <div className="flex flex-col gap-3">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-foreground/50">
          {tier.name}
        </MaskedLine>
        <p className="max-w-xs text-sm leading-relaxed text-foreground/70">
          <MaskedLine>{tier.lede}</MaskedLine>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/40">
          {tier.priceLabel}
        </MaskedLine>
        <MaskedLine
          innerClassName="font-display text-5xl font-medium tracking-[-0.02em] text-foreground"
          className="text-5xl leading-[1]"
        >
          {tier.price}
        </MaskedLine>
      </div>

      <ul className="flex flex-col gap-3 border-t border-muted/50 pt-6">
        {tier.bullets.map((b, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-sm text-foreground/80"
          >
            <span
              data-reveal="icon"
              className="mt-2 h-1 w-1 shrink-0 bg-accent"
            />
            <MaskedLine>{b}</MaskedLine>
          </li>
        ))}
      </ul>

      <CTAButton
        href="/contact"
        variant={tier.featured ? "solid" : "primary"}
        className="mt-auto"
      >
        {tier.cta}
      </CTAButton>
    </motion.article>
    </div>
  );
}
