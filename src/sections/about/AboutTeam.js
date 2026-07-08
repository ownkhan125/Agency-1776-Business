"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import ChamferedSwiper from "@/components/ChamferedSwiper";
import { useSectionReveal } from "@/hooks/useSectionReveal";

const TEAM = [
  { name: "Ada Marchetti",  role: "Founding designer",  bio: "Fifteen years across fintech and enterprise. Ex-Stripe, ex-Linear. Led design on Northwind's trading desk build — the case study that put us on the map.", city: "New York",   pull: "Fifteen years across fintech and enterprise." },
  { name: "Kai Ozawa",       role: "Founding engineer",  bio: "Type-safe React and design-engineering. Ex-Vercel. Wrote most of the studio's shared component library — the reason our marketing sites ship faster than the industry median.", city: "Tokyo",      pull: "Wrote most of the studio's shared component library." },
  { name: "Renata Cole",     role: "Design engineer",    bio: "Interface systems, motion, and design-tokens. Leads the tooling that lets designers and engineers work on the same file without stepping on each other.", city: "London",     pull: "Leads the tooling that unifies designers and engineers." },
  { name: "Ojas Iyer",       role: "Engineer",           bio: "Data-heavy interfaces, WebSockets, and infrastructure. Owns the observability stack that catches perf regressions before staging even sees them.", city: "New York",   pull: "Owns the observability stack that catches perf regressions." },
  { name: "Mireya Salas",    role: "Brand + motion",     bio: "Editorial motion, film, and identity systems. Runs the launch-film practice — the reason Halo Studios' trial conversion moved 61 %.", city: "Mexico City", pull: "Runs the launch-film practice." },
];

export default function AboutTeam() {
  const revealRef = useSectionReveal();

  return (
    <SectionShell
      id="team"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            The bench / 05
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          Five full-time. Drag or swipe to meet each one.
        </MaskedLine>
      </div>

      <ChamferedSwiper
        eyebrow="Team"
        ariaLabel="Team members"
        slides={TEAM.map((t) => <TeamCard key={t.name} member={t} />)}
      />
    </SectionShell>
  );
}

function TeamCard({ member }) {
  return (
    <article
      className="chamfer chamfer-md flex h-full min-h-[420px] flex-col gap-8 p-8 md:p-12"
      style={{
        "--chamfer-border-color":
          "color-mix(in srgb, var(--muted) 45%, transparent)",
        "--chamfer-bg": "var(--surface)",
        backgroundImage: "var(--card-pinstripe)",
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="chamfer chamfer-xs grid h-16 w-16 place-items-center font-display text-xl text-foreground/80"
          style={{
            "--chamfer-border-color":
              "color-mix(in srgb, var(--muted) 60%, transparent)",
            "--chamfer-bg": "color-mix(in srgb, var(--accent) 8%, var(--background))",
          }}
        >
          <span className="relative z-10">
            {member.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </span>
        </span>
        <div className="flex flex-col items-end gap-1 text-[10px] uppercase tracking-[0.32em] text-foreground/40">
          <span>{member.city}</span>
          <span className="inline-block h-1 w-8 bg-accent" />
        </div>
      </div>

      <blockquote className="border-l-2 border-accent/60 pl-4 font-display text-2xl leading-[1.15] tracking-[-0.01em] text-foreground md:text-3xl">
        &ldquo;{member.pull}&rdquo;
      </blockquote>

      <div className="flex flex-col gap-3">
        <h3 className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">
          {member.name}
        </h3>
        <span className="text-[10px] uppercase tracking-[0.32em] text-accent">
          {member.role}
        </span>
      </div>

      <p className="mt-auto text-sm leading-relaxed text-foreground/65">
        {member.bio}
      </p>
    </article>
  );
}
