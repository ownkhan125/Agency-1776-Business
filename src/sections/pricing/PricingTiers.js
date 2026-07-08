"use client";

import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import CTAButton from "@/components/CTAButton";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

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
      "Written recommendation on next step",
      "Files + code you own outright",
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
      "Slack channel with same-day answers",
      "Quarterly review with founders",
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
      "Launch film + press kit",
      "60-day post-launch care",
    ],
    cta: "Talk systems",
  },
];

export default function PricingTiers() {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="tiers"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div
        ref={gridRef}
        className="chamfer chamfer-md grid grid-cols-1 gap-px bg-muted/40 md:grid-cols-3"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
          "--chamfer-bg": "color-mix(in srgb, var(--muted) 40%, transparent)",
        }}
      >
        {TIERS.map((t, i) => (
          <div key={t.id} data-stagger-item data-col={i} className="h-full">
            <motion.article
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className={
                (t.featured ? "bg-surface " : "bg-background ") +
                "relative flex h-full flex-col gap-8 p-8 md:p-10"
              }
              style={{ backgroundImage: "var(--card-pinstripe)" }}
            >
              {t.featured && (
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
                  {t.name}
                </MaskedLine>
                <p className="max-w-xs text-sm leading-relaxed text-foreground/70">
                  <MaskedLine>{t.lede}</MaskedLine>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/40">
                  {t.priceLabel}
                </MaskedLine>
                <MaskedLine
                  innerClassName="font-display text-5xl font-medium tracking-[-0.02em] text-foreground"
                  className="text-5xl leading-[1]"
                >
                  {t.price}
                </MaskedLine>
              </div>

              <ul className="flex flex-col gap-3 border-t border-muted/50 pt-6">
                {t.bullets.map((b, i) => (
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
                variant={t.featured ? "solid" : "primary"}
                className="mt-auto"
              >
                {t.cta}
              </CTAButton>
            </motion.article>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
