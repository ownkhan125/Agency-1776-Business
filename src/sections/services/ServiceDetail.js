"use client";

import Link from "next/link";
import { motion } from "motion/react";
import PageHero from "@/components/PageHero";
import SectionShell from "@/components/SectionShell";
import CTAButton from "@/components/CTAButton";
import ChamferedSwiper from "@/components/ChamferedSwiper";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";
import { SERVICES } from "@/data/services";

export default function ServiceDetail({ service }) {
  return (
    <>
      <PageHero
        eyebrow={`Services / ${service.n}`}
        backdrop="scan"
        heading={{
          lead: service.title,
          tail: service.kicker,
          accent: service.starting,
        }}
        description={service.lede}
      >
        <CTAButton href="/contact" size="lg">
          Book this service
        </CTAButton>
      </PageHero>
      <Deliverables items={service.deliverables} />
      <Process steps={service.process} />
      <Outcomes items={service.outcomes} />
      <NextService currentSlug={service.slug} />
    </>
  );
}

function Deliverables({ items }) {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();
  return (
    <SectionShell
      id="deliverables"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Deliverables / 02
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          What lands in your hands by end of engagement.
        </MaskedLine>
      </div>

      <div
        ref={gridRef}
        className="chamfer chamfer-md grid grid-cols-1 gap-px bg-muted/40 sm:grid-cols-2 lg:grid-cols-3"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
          "--chamfer-bg": "color-mix(in srgb, var(--muted) 40%, transparent)",
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            data-stagger-item
            data-col={i % 3}
            className="flex items-start gap-4 bg-background p-8"
          >
            <span
              data-reveal="icon"
              className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-accent"
            />
            <MaskedLine className="text-sm leading-relaxed text-foreground/80">
              {it}
            </MaskedLine>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function Process({ steps }) {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();
  return (
    <SectionShell
      id="process"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div ref={scrubRef} className="mb-14 flex flex-col gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Process / 03
          </span>
        </MaskedLine>
        <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
          <ScrubText>Four phases,</ScrubText>{" "}
          <StencilFill className="text-accent">predictable.</StencilFill>
        </h2>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          Drag or swipe through the phases below.
        </MaskedLine>
      </div>

      <ChamferedSwiper
        eyebrow="Phases"
        ariaLabel="Process phases"
        slides={steps.map((s) => (
          <article
            key={s.step}
            className="chamfer chamfer-md flex h-full min-h-[360px] flex-col gap-6 p-8 md:p-12"
            style={{
              "--chamfer-border-color":
                "color-mix(in srgb, var(--muted) 45%, transparent)",
              "--chamfer-bg": "var(--surface)",
              backgroundImage: "var(--card-pinstripe)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-5xl font-medium text-accent md:text-6xl">
                {s.step}
              </span>
              <span className="text-[10px] uppercase tracking-[0.32em] text-foreground/40">
                Phase
              </span>
            </div>
            <h3 className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">
              {s.label}
            </h3>
            <p className="mt-auto max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">
              {s.body}
            </p>
          </article>
        ))}
      />
    </SectionShell>
  );
}

function Outcomes({ items }) {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();
  return (
    <SectionShell
      id="outcomes"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="mb-12">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Outcomes / 04
          </span>
        </MaskedLine>
      </div>

      <div ref={gridRef} className="grid gap-8 md:grid-cols-3">
        {items.map((it, i) => (
          <article
            key={i}
            data-stagger-item
            data-col={i}
            className="chamfer chamfer-md flex flex-col gap-6 p-8 md:p-10"
            style={{
              "--chamfer-border-color":
                "color-mix(in srgb, var(--muted) 45%, transparent)",
              "--chamfer-bg": "var(--surface)",
              backgroundImage: "var(--card-pinstripe)",
            }}
          >
            <span
              data-reveal="icon"
              className="font-display text-3xl font-medium text-accent"
            >
              0{i + 1}
            </span>
            <p className="text-sm leading-relaxed text-foreground/80">
              <MaskedLine>{it}</MaskedLine>
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function NextService({ currentSlug }) {
  const revealRef = useSectionReveal();
  const others = SERVICES.filter((s) => s.slug !== currentSlug);
  const MotionLink = motion.create(Link);
  return (
    <SectionShell
      id="related"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            More disciplines / 05
          </span>
        </MaskedLine>
        <CTAButton href="/services">All services</CTAButton>
      </div>

      <ul className="flex flex-col divide-y divide-muted/40 border-y border-muted/40">
        {others.map((s) => (
          <li key={s.slug}>
            <MotionLink
              href={`/services/${s.slug}`}
              data-cursor="link"
              whileHover={{ x: 6 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="group flex items-center justify-between gap-6 py-8"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.28em] text-foreground/40">
                  {s.n} · {s.engagement}
                </span>
                <span className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground md:text-3xl">
                  {s.title}
                </span>
              </div>
              <span
                data-reveal="icon"
                className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-accent"
              >
                Read
                <span className="inline-block h-px w-8 bg-accent transition-[width] duration-500 group-hover:w-16" />
              </span>
            </MotionLink>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
