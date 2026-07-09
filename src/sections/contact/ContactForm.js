"use client";

import SectionShell from "@/components/SectionShell";
import CTAButton from "@/components/CTAButton";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";

const FIELDS = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter your full name",
    required: true,
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email address",
    required: true,
    autoComplete: "email",
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "Enter your phone number",
    autoComplete: "tel",
  },
  {
    name: "business",
    label: "Business / Organization Name",
    type: "text",
    placeholder: "Enter your business name",
    autoComplete: "organization",
  },
  {
    name: "website",
    label: "Current Website URL",
    type: "url",
    placeholder: "Enter your current website, if you have one",
    autoComplete: "url",
  },
];

const SELECT_FIELDS = [
  {
    name: "help",
    label: "What Do You Need Help With?",
    required: true,
    options: [
      "New business website",
      "Website redesign",
      "Lead generation page",
      "Brand messaging",
      "SEO foundation",
      "Website strategy",
      "Ongoing website support",
      "Not sure yet",
      "Other",
    ],
  },
  {
    name: "budget",
    label: "Budget Range",
    required: true,
    options: [
      "Starter website plan",
      "Growth website plan",
      "Custom / Not sure",
    ],
  },
  {
    name: "timeline",
    label: "Timeline",
    required: true,
    options: [
      "As soon as possible",
      "Within 30 days",
      "Within 60 days",
      "No fixed timeline yet",
    ],
  },
];

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
            {SELECT_FIELDS.map((f) => (
              <SelectField key={f.name} {...f} />
            ))}
          </div>

          <label className="flex flex-col gap-3">
            <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
              Message
            </MaskedLine>
            <textarea
              name="message"
              rows={5}
              required
              placeholder="Tell us what you are working on and what you need help with."
              className="w-full resize-none border-b border-muted/60 bg-transparent py-3 text-sm text-foreground caret-accent outline-none transition-colors placeholder:text-foreground/30 focus:border-accent"
            />
          </label>

          <CTAButton type="submit" variant="solid" size="lg" className="mt-2">
            Send message
          </CTAButton>
        </form>
      </div>
    </SectionShell>
  );
}

function Field({ name, label, type, placeholder, required, autoComplete }) {
  return (
    <label className="flex flex-col gap-3">
      <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
        {label}
      </MaskedLine>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full border-b border-muted/60 bg-transparent py-3 text-sm text-foreground caret-accent outline-none transition-colors placeholder:text-foreground/30 focus:border-accent"
      />
    </label>
  );
}

function SelectField({ name, label, options, required }) {
  return (
    <label className="flex flex-col gap-3">
      <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
        {label}
      </MaskedLine>
      <div className="relative">
        <select
          name={name}
          required={required}
          defaultValue=""
          className="peer w-full appearance-none border-b border-muted/60 bg-transparent py-3 pr-8 text-sm text-foreground caret-accent outline-none transition-colors invalid:text-foreground/30 focus:border-accent"
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-background text-foreground">
              {opt}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-foreground/40 transition-colors peer-focus:text-accent"
        >
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
      </div>
    </label>
  );
}
