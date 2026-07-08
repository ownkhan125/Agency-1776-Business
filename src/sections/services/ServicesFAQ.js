"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";

const FAQ = [
  {
    q: "How many engagements do you take at once?",
    a: "One or two. That is the largest number we can sustain while committing senior time to every day of every project. It is also why lead times are 60 – 120 days.",
  },
  {
    q: "Do you subcontract or offshore?",
    a: "No. Every deliverable that ships to a client is drawn or written by a full-time employee of the studio. Five people, all senior, all in one Slack.",
  },
  {
    q: "Do you sign design contracts without engineering?",
    a: "Rarely. Product design and engineering share one timeline; separating them is the shortest path to a beautiful mock that never ships. If you have engineering in-house we adapt — otherwise both come as one line item.",
  },
  {
    q: "Do you retain a percentage of a company?",
    a: "Occasionally, for pre-seed and seed engagements where cash is genuinely tight. We take equity in place of a fee-cut, not on top of one, and only when the founders raise it first.",
  },
  {
    q: "What is your rate?",
    a: "Fees start at $18k for a two-week Sprint and $28k / month for the Retainer. The Systems engagement runs $85k – $180k depending on scope. All numbers ex-tax and travel.",
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
            FAQ / 04
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          Five answers we give on every intro call.
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
