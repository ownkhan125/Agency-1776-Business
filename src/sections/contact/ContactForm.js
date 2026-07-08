"use client";

import SectionShell from "@/components/SectionShell";
import CTAButton from "@/components/CTAButton";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

const FIELDS = [
  { name: "name", label: "Name", type: "text", placeholder: "Your full name" },
  { name: "email", label: "Email", type: "email", placeholder: "you@company.com" },
  { name: "company", label: "Company", type: "text", placeholder: "Where you work" },
  { name: "budget", label: "Budget", type: "text", placeholder: "$50k – $250k+" },
];

const ENGAGEMENT_OPTIONS = ["Sprint", "Retainer", "Systems", "Not sure yet"];

export default function ContactForm() {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();

  return (
    <SectionShell
      id="brief"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1400px] px-6 md:px-16"
    >
      <div className="grid gap-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-24">
        <div ref={scrubRef} className="flex flex-col gap-8">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              Project brief / 02
            </span>
          </MaskedLine>

          <ul className="flex flex-col gap-6 border-y border-muted/40 py-8">
            {[
              "One senior gets back to you personally.",
              "No sales team, no discovery-call funnel.",
              "First reply usually within a working day.",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-4 text-sm text-foreground/80">
                <span
                  data-reveal="icon"
                  className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-accent"
                />
                <MaskedLine>{line}</MaskedLine>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="chamfer chamfer-md flex flex-col gap-10 p-8 md:p-12"
          style={{
            "--chamfer-border-color":
              "color-mix(in srgb, var(--muted) 50%, transparent)",
            "--chamfer-bg": "var(--surface)",
          }}
        >
          <div
            data-reveal="icon"
            className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-foreground/50"
          >
            <span className="inline-flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-accent" />
              New project brief
            </span>
            <span>Encrypted in transit</span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {FIELDS.map((f) => (
              <Field key={f.name} {...f} />
            ))}
          </div>

          <label className="flex flex-col gap-3">
            <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
              Engagement type
            </MaskedLine>
            <div className="flex flex-wrap gap-3">
              {ENGAGEMENT_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="chamfer chamfer-xs cursor-pointer px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-foreground/70 has-[:checked]:text-accent"
                  style={{
                    "--chamfer-border-color":
                      "color-mix(in srgb, var(--muted) 50%, transparent)",
                    "--chamfer-bg": "var(--background)",
                  }}
                >
                  <input
                    type="radio"
                    name="engagement"
                    value={opt}
                    className="peer sr-only"
                  />
                  <span className="relative z-10">{opt}</span>
                </label>
              ))}
            </div>
          </label>

          <label className="flex flex-col gap-3">
            <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
              What are you working on?
            </MaskedLine>
            <textarea
              rows={5}
              placeholder="A sentence or two is plenty."
              className="w-full resize-none border-b border-muted/60 bg-transparent py-3 text-sm text-foreground caret-accent outline-none transition-colors placeholder:text-foreground/30 focus:border-accent"
            />
          </label>

          <CTAButton type="submit" variant="solid" size="lg" className="mt-2">
            Send brief
          </CTAButton>
        </form>
      </div>
    </SectionShell>
  );
}

function Field({ name, label, type, placeholder }) {
  return (
    <label className="flex flex-col gap-3">
      <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
        {label}
      </MaskedLine>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full border-b border-muted/60 bg-transparent py-3 text-sm text-foreground caret-accent outline-none transition-colors placeholder:text-foreground/30 focus:border-accent"
      />
    </label>
  );
}
