"use client";

import SectionShell from "@/components/SectionShell";
import CTAButton from "@/components/CTAButton";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

const CHANNELS = [
  { label: "Studio", value: "studio@agency1776.com" },
  { label: "New work", value: "new@agency1776.com" },
  { label: "Press", value: "press@agency1776.com" },
];

const FIELDS = [
  { name: "name", label: "Name", type: "text", placeholder: "Your full name" },
  { name: "email", label: "Email", type: "email", placeholder: "you@company.com" },
  { name: "company", label: "Company", type: "text", placeholder: "Where you work" },
];

export default function Contact() {
  const revealRef = useSectionReveal();
  const scrubRef = useScrubReveal();

  return (
    <SectionShell
      id="contact"
      ref={revealRef}
      className="py-32 md:py-48"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
        <div ref={scrubRef} className="flex flex-col gap-10">
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-flex items-center gap-3">
              <span
                data-reveal="icon"
                className="inline-block h-1.5 w-1.5 bg-accent"
              />
              Contact / 006
            </span>
          </MaskedLine>

          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[1] tracking-[-0.02em] text-foreground">
            <ScrubText>Tell us what you're building.</ScrubText>
          </h2>

          <p className="max-w-md text-sm leading-relaxed text-foreground/70">
            <MaskedLine block>We reply to every message within</MaskedLine>
            <MaskedLine block>
              one working day. Short notes welcome.
            </MaskedLine>
          </p>

          <ul className="flex flex-col divide-y divide-muted/50 border-y border-muted/50">
            {CHANNELS.map((c) => (
              <li key={c.label} className="flex items-center justify-between py-4">
                <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
                  {c.label}
                </MaskedLine>
                <MaskedLine className="text-sm text-foreground">
                  {c.value}
                </MaskedLine>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="chamfer chamfer-md flex flex-col gap-8 p-8 md:p-12"
          style={{
            "--chamfer-border-color":
              "color-mix(in srgb, var(--muted) 50%, transparent)",
            "--chamfer-bg": "var(--card-pinstripe), var(--surface)",
          }}
        >
          <div
            data-reveal="icon"
            className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-foreground/50"
          >
            <span className="inline-flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-accent" />
              Project brief
            </span>
            <span>Encrypted in transit</span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {FIELDS.map((f) => (
              <Field key={f.name} {...f} />
            ))}
            <Field
              name="budget"
              label="Budget"
              type="text"
              placeholder="$50k – $250k+"
            />
          </div>

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
