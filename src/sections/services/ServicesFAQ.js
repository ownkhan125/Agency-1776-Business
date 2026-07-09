"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";

const FAQ = [
  {
    q: "What is a Full Website Build?",
    a: "The complete system. We map your strategy, write the copy, design the pages, develop across desktop, tablet, and mobile, and launch with your CTAs, forms, and SEO foundation in place. Right for businesses starting fresh or replacing a site that no longer represents them.",
  },
  {
    q: "What is a Website Redesign?",
    a: "For businesses whose current site looks dated, converts poorly, or no longer reflects the business. We rebuild the visual layer, sharpen the message, and update the structure — without starting from zero.",
  },
  {
    q: "What is a Landing Page Build?",
    a: "A single focused page designed for quote requests, bookings, inquiries, campaigns, or sales conversations. Built to convert one visitor at a time, wherever your traffic is coming from.",
  },
  {
    q: "What is a Copy and Messaging Upgrade?",
    a: "Sometimes the design is fine but the words are not selling. We rewrite the copy across your key pages so your value is clear and your visitor knows exactly what to do next.",
  },
  {
    q: "What is an SEO Foundation Setup?",
    a: "Structural search-visibility work — headings, metadata, page flow, and content hierarchy — so search engines can read and rank your business fairly. The foundation that ongoing SEO work builds on.",
  },
];

export default function ServicesFAQ() {
  const revealRef = useSectionReveal();
  const [open, setOpen] = useState(0);

  return (
    <SectionShell
      id="faq"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1200px] px-6 md:px-16"
    >
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Service paths / 04
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          Fix one piece, or rebuild the whole system — the paths businesses choose most.
        </MaskedLine>
      </div>

      <ul className="flex flex-col divide-y divide-muted/40 border-y border-muted/40">
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className="py-2">
              <button
                type="button"
                data-cursor="link"
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left outline-none"
                aria-expanded={isOpen}
              >
                <MaskedLine
                  as="h3"
                  className="max-w-2xl text-lg font-medium tracking-[-0.01em] text-foreground md:text-xl"
                >
                  {f.q}
                </MaskedLine>
                <span
                  data-reveal="icon"
                  className="chamfer chamfer-xs grid h-9 w-9 shrink-0 place-items-center text-foreground/70 transition-colors group-hover:text-accent"
                  style={{
                    "--chamfer-border-color":
                      "color-mix(in srgb, var(--muted) 50%, transparent)",
                    "--chamfer-bg": "var(--background)",
                  }}
                >
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    className="relative inline-block h-3 w-3"
                  >
                    <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                    <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current" />
                  </motion.span>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-6 pr-14 text-sm leading-relaxed text-foreground/70">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
