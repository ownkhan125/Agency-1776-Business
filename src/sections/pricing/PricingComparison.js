"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

const ROWS = [
  { label: "Senior time",            sprint: "10 d",       retainer: "20 d / mo",   systems: "40 – 60 d" },
  { label: "Deliverables",           sprint: "1 surface",  retainer: "ongoing",     systems: "brand + product + code" },
  { label: "Timeline",               sprint: "2 weeks",    retainer: "rolling",     systems: "10 – 14 weeks" },
  { label: "Ship support",           sprint: "1 week",     retainer: "included",    systems: "60 days" },
  { label: "Owning the code",        sprint: "You do",     retainer: "You do",      systems: "You do" },
  { label: "Owning the brand system",sprint: "N/A",        retainer: "N/A",         systems: "You do" },
  { label: "Post-launch retro",      sprint: "Written",    retainer: "Quarterly",   systems: "In-person" },
];

export default function PricingComparison() {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();

  return (
    <SectionShell
      id="compare"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="mb-12 flex flex-col gap-6" ref={scrubRef}>
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Compare / 03
          </span>
        </MaskedLine>
        <h2 className="max-w-3xl text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
          <ScrubText>Same team.</ScrubText>{" "}
          <StencilFill className="text-accent">Different tempo.</StencilFill>
        </h2>
      </div>

      <div
        data-reveal="icon"
        className="chamfer chamfer-md overflow-hidden"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 45%, transparent)",
          "--chamfer-bg": "var(--surface)",
        }}
      >
        <div className="grid grid-cols-4 border-b border-muted/40 bg-background/40 text-[10px] uppercase tracking-[0.32em]">
          <div className="p-6 text-foreground/40">Metric</div>
          <div className="p-6 text-foreground/70">Sprint</div>
          <div className="p-6 text-accent">Retainer</div>
          <div className="p-6 text-foreground/70">Systems</div>
        </div>
        <ul className="flex flex-col divide-y divide-muted/30">
          {ROWS.map((r) => (
            <li key={r.label} className="grid grid-cols-4 items-center">
              <div className="p-6 text-[11px] uppercase tracking-[0.24em] text-foreground/60">
                <MaskedLine>{r.label}</MaskedLine>
              </div>
              <div className="p-6 text-sm text-foreground/85">
                <MaskedLine>{r.sprint}</MaskedLine>
              </div>
              <div className="p-6 text-sm text-accent">
                <MaskedLine>{r.retainer}</MaskedLine>
              </div>
              <div className="p-6 text-sm text-foreground/85">
                <MaskedLine>{r.systems}</MaskedLine>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
