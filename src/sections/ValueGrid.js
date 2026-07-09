"use client";

import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

/**
 * ValueGrid — the 4-step playbook. Four cards laid out as a full-width
 * horizontal filmstrip at xl (2×2 at md-lg, stacked at sm), each a
 * distinct chamfered cell with a display-face numeral, a bespoke line
 * glyph with a subtle CSS-only idle loop, and a step footer.
 *
 * Assembly effect matches vengenceui's staggered-grid center-out
 * cascade — cards with `data-col={i}` route through `useStaggeredGrid`
 * (columns delayed by |col − middle| × step on a single ScrollTrigger),
 * so inner cards land first and outer cards ripple out. Same maths as
 * the reference (`Math.abs(columnIndex - middleColumnIndex) * 0.2`),
 * running on the studio's shared GSAP context — no new controllers.
 *
 * The H2 rides the studio's particle heading materialisation
 * (`ScrubText mode="word"` + `useScrubReveal`) so the entrance matches
 * every other section on the site.
 */

const CARDS = [
  {
    n: "01",
    title: "Attract the Right Visitors",
    body:
      "Your website helps you bring people who are actually looking for your services. Build it right.",
    Icon: AttractGlyph,
  },
  {
    n: "02",
    title: "Build Instant Trust",
    body:
      "A professional website shows your credibility and sets you apart from competitors.",
    Icon: TrustGlyph,
  },
  {
    n: "03",
    title: "Explain Your Offer Clearly",
    body:
      "Clear messaging, strong CTAs, and smart structure guide people to take action.",
    Icon: ExplainGlyph,
  },
  {
    n: "04",
    title: "Help Your Business Grow",
    body:
      "More leads, more inquiries, and more opportunities to win new business.",
    Icon: GrowGlyph,
  },
];

export default function ValueGrid() {
  const revealRef = useSectionReveal({ staggerFrom: "center" });
  const scrubRef = useScrubReveal();
  const gridRef = useStaggeredGrid();

  return (
    <SectionShell
      id="playbook"
      ref={revealRef}
      className="py-28 md:py-40"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
    >
      <div ref={scrubRef} className="flex max-w-[68rem] flex-col items-start gap-8">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            The playbook / 002
          </span>
        </MaskedLine>

        <h2 className="text-[clamp(2rem,4.75vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
          <ScrubText mode="word">
            Help your business grow every day with a website that works like a sales asset.
          </ScrubText>
        </h2>
      </div>

      <div className="mt-14 flex items-center gap-4 md:mt-20">
        <span
          data-reveal="icon"
          className="h-px w-16 bg-muted/60 md:w-24"
        />
        <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/45">
          Four outcomes · one system
        </MaskedLine>
        <span
          data-reveal="icon"
          aria-hidden
          className="h-px flex-1 bg-muted/40"
        />
      </div>

      <div
        ref={gridRef}
        className="chamfer chamfer-md mt-8 grid grid-cols-1 gap-px bg-muted/40 md:mt-10 md:grid-cols-2 xl:grid-cols-4"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
          "--chamfer-bg":
            "color-mix(in srgb, var(--muted) 40%, transparent)",
        }}
      >
        {CARDS.map((c, i) => (
          <ValueCard key={c.n} {...c} col={i} />
        ))}
      </div>
    </SectionShell>
  );
}

function ValueCard({ n, title, body, Icon, col }) {
  return (
    <article
      data-stagger-item
      data-col={col}
      className="group relative flex h-full flex-col gap-8 bg-background p-8 md:p-10"
      style={{ backgroundImage: "var(--card-pinstripe)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          data-reveal="icon"
          className="font-display text-4xl font-medium leading-none tracking-[-0.02em] text-foreground/85 md:text-5xl"
        >
          {n}
        </span>
        <Icon
          data-reveal="icon"
          className="h-10 w-10 shrink-0 text-foreground/70 transition-colors duration-500 group-hover:text-accent"
        />
      </div>

      <div className="flex flex-col gap-4">
        <MaskedLine
          as="h3"
          className="text-[13px] font-medium uppercase leading-[1.35] tracking-[0.18em] text-foreground md:text-sm"
        >
          {title}
        </MaskedLine>
        <p className="text-sm leading-relaxed text-foreground/60">
          <MaskedLine>{body}</MaskedLine>
        </p>
      </div>

      <div className="mt-auto flex items-center gap-3 pt-2 text-[10px] uppercase tracking-[0.28em] text-foreground/40">
        <span
          data-reveal="icon"
          className="inline-block h-px w-6 bg-foreground/30 transition-all duration-500 group-hover:w-12 group-hover:bg-accent"
        />
        Step {n}
      </div>
    </article>
  );
}

function AttractGlyph(props) {
  // Target rings + crosshairs; center dot pulses via `.glyph-pulse`.
  return (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1" />
      <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1" />
      <path
        d="M20 1v5M20 39v-5M1 20h5M39 20h-5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle
        cx="20"
        cy="20"
        r="2"
        fill="currentColor"
        className="glyph-pulse"
      />
    </svg>
  );
}

function TrustGlyph(props) {
  // Shield outline; interior check-mark traces on a loop via `.glyph-trace`.
  return (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <path
        d="M20 3L34 8v13c0 8-6 13-14 16-8-3-14-8-14-16V8L20 3z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M13 21l5 5 10-11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        className="glyph-trace"
      />
    </svg>
  );
}

function ExplainGlyph(props) {
  // Speech bubble with two aligned lines; corner dot blinks via `.glyph-blink`.
  return (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <path
        d="M6 8h28v18H22l-6 6-6-6H6z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M11 14h18M11 20h12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle
        cx="33"
        cy="32"
        r="2"
        fill="currentColor"
        className="glyph-blink"
      />
    </svg>
  );
}

function GrowGlyph(props) {
  // Ascending bars + trend line; arrow head rises subtly via `.glyph-rise`.
  return (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <path d="M6 34h29" stroke="currentColor" strokeWidth="1" />
      <rect x="8" y="27" width="4" height="7" stroke="currentColor" strokeWidth="1" />
      <rect x="16" y="22" width="4" height="12" stroke="currentColor" strokeWidth="1" />
      <rect x="24" y="16" width="4" height="18" stroke="currentColor" strokeWidth="1" />
      <rect x="32" y="10" width="4" height="24" stroke="currentColor" strokeWidth="1" />
      <path
        d="M5 26l7-6 6 4 8-8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 12l6-4M28 8v6M28 8h-6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="glyph-rise"
      />
    </svg>
  );
}
