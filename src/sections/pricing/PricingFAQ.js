"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";

const FAQ = [
  { q: "What does a Sprint actually deliver?",
    a: "One tangible surface — a landing page, an onboarding flow, a pricing page — designed, engineered, and shipped in two weeks, with a written recommendation for what to do next." },
  { q: "How does the Retainer end?",
    a: "30 days written notice, either side. Everything you paid for is yours to keep — files, code, brand assets." },
  { q: "What if we already have engineering in-house?",
    a: "Fine. We adjust the fee down and coordinate directly with your engineering lead on a shared main branch. The Sprint and Systems tiers both accommodate this." },
  { q: "Do you take equity?",
    a: "Occasionally, only at pre-seed / seed, and only in place of a fee cut. Never on top of a cash fee." },
  { q: "Is travel included?",
    a: "Domestic kickoff and one on-site review per month are included in Retainer. Systems tier includes two on-sites total. Extra travel billed at cost." },
];

export default function PricingFAQ() {
  const revealRef = useSectionReveal();
  const [open, setOpen] = useState(0);

  return (
    <SectionShell
      id="pricing-faq"
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
            Questions / 04
          </span>
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
