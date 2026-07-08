"use client";

import Link from "next/link";
import { motion } from "motion/react";
import PageHero from "@/components/PageHero";
import SectionShell from "@/components/SectionShell";
import CTAButton from "@/components/CTAButton";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";
import { PROJECTS } from "@/data/projects";

export default function ProjectDetail({ project }) {
  return (
    <>
      <PageHero
        eyebrow={`Case ${project.id}`}
        index={project.year}
        backdrop="sweep"
        heading={{
          lead: project.client,
          tail: project.title,
          accent: project.tag,
        }}
        description={project.lede}
      >
        <CTAButton href="/contact" size="lg">
          Discuss a similar project
        </CTAButton>
      </PageHero>
      <Overview project={project} />
      <ProblemApproach project={project} />
      <Metrics project={project} />
      <StackAndScope project={project} />
      <NextProject currentSlug={project.slug} />
    </>
  );
}

function Overview({ project }) {
  const revealRef = useSectionReveal();
  return (
    <SectionShell
      id="overview"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="grid gap-8 md:grid-cols-4">
        <Meta label="Client" value={project.client} />
        <Meta label="Role" value={project.role} />
        <Meta label="Year" value={project.year} />
        <Meta label="Scope" value={project.scope} />
      </div>
    </SectionShell>
  );
}

function Meta({ label, value }) {
  return (
    <div className="flex flex-col gap-2 border-l border-muted/40 pl-4">
      <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-accent">
        {label}
      </MaskedLine>
      <MaskedLine className="text-sm text-foreground/85">{value}</MaskedLine>
    </div>
  );
}

function ProblemApproach({ project }) {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();

  return (
    <SectionShell
      id="story"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="grid gap-16 md:grid-cols-2 md:gap-24">
        <div ref={scrubRef} className="flex flex-col gap-6 md:sticky md:top-40 md:self-start">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              The story / 03
            </span>
          </MaskedLine>
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
            <ScrubText>Problem in.</ScrubText>{" "}
            <StencilFill className="text-accent">Number out.</StencilFill>
          </h2>
        </div>

        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-4">
            <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
              Problem
            </MaskedLine>
            <p className="text-lg leading-relaxed text-foreground/85 md:text-xl">
              <MaskedLine>{project.problem}</MaskedLine>
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
              Approach
            </MaskedLine>
            <p className="text-lg leading-relaxed text-foreground/85 md:text-xl">
              <MaskedLine>{project.approach}</MaskedLine>
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function Metrics({ project }) {
  const revealRef = useSectionReveal();
  const gridRef = useStaggeredGrid();
  return (
    <SectionShell
      id="metrics"
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
            The numbers / 04
          </span>
        </MaskedLine>
      </div>

      <div
        ref={gridRef}
        className="chamfer chamfer-md grid grid-cols-2 gap-px bg-muted/40 md:grid-cols-4"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
          "--chamfer-bg": "color-mix(in srgb, var(--muted) 40%, transparent)",
        }}
      >
        {project.metrics.map((m, i) => (
          <div
            key={m.label}
            data-stagger-item
            data-col={i % 4}
            className="flex flex-col gap-3 bg-background p-6 md:p-10"
          >
            <span
              data-reveal="icon"
              className="font-display text-3xl font-medium tracking-[-0.02em] text-accent md:text-5xl"
            >
              {m.value}
            </span>
            <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/60">
              {m.label}
            </MaskedLine>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function StackAndScope({ project }) {
  const revealRef = useSectionReveal();
  return (
    <SectionShell
      id="stack"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="grid gap-12 md:grid-cols-2 md:gap-24">
        <div className="flex flex-col gap-6">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              Stack / 05
            </span>
          </MaskedLine>
          <ul className="flex flex-wrap gap-3">
            {project.stack.map((s) => (
              <li
                key={s}
                data-reveal="icon"
                className="chamfer chamfer-xs px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-foreground/70"
                style={{
                  "--chamfer-border-color":
                    "color-mix(in srgb, var(--muted) 50%, transparent)",
                  "--chamfer-bg": "var(--background)",
                }}
              >
                <span className="relative z-10">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              Scope
            </span>
          </MaskedLine>
          <p className="text-lg leading-relaxed text-foreground/80">
            <MaskedLine>{project.scope}</MaskedLine>
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function NextProject({ currentSlug }) {
  const revealRef = useSectionReveal();
  const idx = PROJECTS.findIndex((p) => p.slug === currentSlug);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  const MotionLink = motion.create(Link);
  return (
    <SectionShell
      id="next"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Next case
          </span>
        </MaskedLine>
        <CTAButton href="/work">All work</CTAButton>
      </div>

      <MotionLink
        href={`/work/${next.slug}`}
        data-cursor="card"
        whileHover={{ x: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="group grid grid-cols-1 items-center gap-6 border-y border-muted/40 py-10 md:grid-cols-[80px_1fr_auto] md:gap-10 md:py-14"
      >
        <span
          data-reveal="icon"
          className="text-[10px] uppercase tracking-[0.28em] text-foreground/40"
        >
          {next.id} · {next.year}
        </span>
        <div className="flex flex-col gap-3">
          <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-accent">
            {next.client} · {next.tag}
          </MaskedLine>
          <MaskedLine
            as="h3"
            className="font-display text-[clamp(1.5rem,3.6vw,3rem)] font-medium tracking-[-0.02em] text-foreground"
          >
            {next.title}
          </MaskedLine>
        </div>
        <span
          data-reveal="icon"
          className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-accent md:self-end"
        >
          Read case
          <span className="inline-block h-px w-8 bg-accent transition-[width] duration-500 group-hover:w-16" />
        </span>
      </MotionLink>
    </SectionShell>
  );
}
