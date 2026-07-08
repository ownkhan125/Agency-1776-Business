"use client";

import Link from "next/link";
import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useStaggeredGrid } from "@/hooks/useStaggeredGrid";

/**
 * Footer laid out as a section of a mechanical keyboard, top-down.
 *
 * Two rows of keycaps carry the studio metadata as "primary + legend"
 * labels; a wide spacebar-row carries the agency mark; a slim function
 * strip above and status strip below mimic the row profile shifts of a
 * real board (F-row → number row → spacebar → status LEDs).
 *
 * Every keycap gets data-reveal="icon" so it participates in the shared
 * section icon phase (settle-in translate+scale); legends use MaskedLine
 * so they ride the text-line phase. One ScrollTrigger, no extra
 * timelines.
 */

const FN_ROW = [
  { label: "Esc", meta: "back·top", href: "/" },
  { label: "Studio", meta: "F1", href: "/" },
  { label: "Services", meta: "F2", href: "/services" },
  { label: "About", meta: "F3", href: "/about" },
  { label: "Work", meta: "F4", href: "/work" },
  { label: "Pricing", meta: "F5", href: "/pricing" },
  { label: "Contact", meta: "F6", href: "/contact" },
];

const KEYCAPS = [
  {
    row: "R1",
    primary: "New York",
    legend: "40.7128°N · 74.0060°W",
    sub: "Studio",
    href: "/contact",
  },
  {
    row: "R1",
    primary: "09—18",
    legend: "M — F · EST",
    sub: "Hours",
    href: "/contact",
  },
  {
    row: "R1",
    primary: "hello@1776.studio",
    legend: "Direct — same-day reply",
    sub: "Direct",
    href: "mailto:hello@1776.studio",
  },
  {
    row: "R1",
    primary: "NYC · LDN · TYO",
    legend: "3 nodes online",
    sub: "Zones",
    href: "/about",
  },
  {
    row: "R2",
    primary: "Booking Q4",
    legend: "2 slots open",
    sub: "Inquiry",
    href: "/contact",
  },
  {
    row: "R2",
    primary: "Product · Brand · Motion",
    legend: "004 services",
    sub: "Scope",
    href: "/services",
  },
  {
    row: "R2",
    primary: "Craft over volume",
    legend: "manifesto",
    sub: "Charter",
    href: "/about",
  },
  {
    row: "R2",
    primary: "Senior IC only",
    legend: "hello@1776.studio · careers",
    sub: "Careers",
    href: "mailto:hello@1776.studio?subject=Careers",
  },
];

export default function Footer() {
  // Footer sits at the bottom of the page — fire the reveal the moment
  // the section top touches the viewport bottom so the keycaps animate
  // as the board is first appearing, not after the user has already
  // scrolled it into full view.
  //
  // `staggerFrom: "center"` extends the shadcn staggered-grid pattern to
  // the keyboard — the two centre keycaps of each row (Services/About
  // in the function row, Hours/Direct in R1, Scope/Charter in R2) land
  // first, then Esc/Contact and the corner keys ripple outward. Reads
  // as the board *assembling* from the middle instead of a linear
  // sweep, matching the shadcn reference's "middle-first" philosophy.
  // `toggleActions: "play none none none"` on the section reveal makes
  // it fire once — the section text/icons/border animate in the first
  // time the Footer crosses viewport, and NEVER revert. Combined with
  // `once: true` on the two staggered grids, the Footer is guaranteed
  // to stay visible after its first appearance — no matter what
  // PageTransition or scroll-up does to ScrollTrigger.refresh().
  const revealRef = useSectionReveal({
    start: "top bottom",
    toggleActions: "play none none none",
  });
  const fnGridRef = useStaggeredGrid({ once: true });
  const matrixGridRef = useStaggeredGrid({ once: true });

  return (
    <SectionShell
      as="footer"
      id="footer"
      ref={revealRef}
      className="py-24 md:py-32"
      innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
      particleColor="var(--accent)"
    >
      {/* Header strip — like a spec/legend row above the board */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-muted/30 pb-6">
        <div className="flex items-center gap-3">
          <span
            data-reveal="icon"
            className="inline-block h-1.5 w-1.5 bg-accent"
          />
          <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
            Board / END
          </MaskedLine>
        </div>
        <MaskedLine className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/40">
          Agency 1776 — mmxxiv — layout: ansi
        </MaskedLine>
      </div>

      {/* Function row: slim keys mirroring an F-row profile */}
      <div ref={fnGridRef} className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {FN_ROW.map((k, i) => (
          <FnKey key={k.label} {...k} col={i} />
        ))}
      </div>

      {/* Main matrix: 2 rows × 4 keys of R1/R2 profile keycaps */}
      <div ref={matrixGridRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KEYCAPS.map((k, i) => (
          <Keycap key={i} {...k} index={i} col={i % 4} />
        ))}
      </div>

      {/* Spacebar row: agency mark as a wide sculpted key. Stacks at
          mobile so the fixed-width ReturnKey (132px) doesn't push the
          row past a 375-425px viewport. */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <Spacebar />
        <ReturnKey />
      </div>

      {/* Status strip: LED-legend row below the board */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-muted/30 pt-6">
        <div className="flex items-center gap-4">
          <StatusLed label="Sys" />
          <StatusLed label="Uptime" />
          <StatusLed label="Cache" muted />
        </div>
        <MaskedLine className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/40">
          © 2026 Agency 1776 · built in-house · next · gsap
        </MaskedLine>
      </div>
    </SectionShell>
  );
}

/* ---------- Keycap primitives ---------- */

function KeyBevel({ children, className = "" }) {
  // Two nested chamfered rings simulate the tri-plane MX keycap.
  //   outer chamfer  = 1px muted edge + sculpted top-face gradient (via ::before)
  //   inner chamfer  = 3px inset, faint white-line detail
  // The gradient rides on --chamfer-bg so it paints inside the pseudo-
  // element, leaving the 1px chamfered border visible on all sides
  // including the diagonal cuts.
  return (
    <div
      className={`group chamfer relative ${className}`}
      style={{
        "--chamfer-size": "6px",
        "--chamfer-border-color":
          "color-mix(in srgb, var(--muted) 40%, transparent)",
        "--chamfer-bg":
          "var(--card-pinstripe), linear-gradient(to bottom, var(--surface), color-mix(in srgb, var(--surface) 86%, black))",
      }}
    >
      {/* Highlight top-face gradient — a second, softer white sheen
          layered above the base gradient. */}
      <div
        aria-hidden
        className="chamfer-shape pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent"
        style={{ "--chamfer-size": "6px" }}
      />
      {/* Inner hairline — sits inside the top face for the MX plate cue. */}
      <div
        aria-hidden
        className="chamfer chamfer-xs pointer-events-none absolute inset-[3px]"
        style={{
          "--chamfer-border-color": "rgba(255,255,255,0.03)",
          "--chamfer-bg": "transparent",
        }}
      />
      {children}
    </div>
  );
}

function Keycap({ row, primary, legend, sub, href, index, col = 0 }) {
  // Keycaps carry the studio metadata; each one now routes somewhere
  // meaningful (contact form, about page, mailto). Internal routes use
  // Next Link so PageTransition intercepts them cleanly; mailto uses
  // plain `<a>` because router.push would 404 on it.
  const isMail = href?.startsWith("mailto:");
  const Wrapper = isMail ? motion.a : motion.create(Link);
  return (
    <div data-stagger-item data-col={col} className="min-h-[132px]">
      <Wrapper
        href={href}
        data-cursor="card"
        whileHover={{ y: 2 }}
        transition={{ type: "spring", stiffness: 480, damping: 30 }}
        className="group block h-full will-change-transform outline-none"
      >
        <KeyBevel className="h-full">
          <div className="relative z-10 flex h-full flex-col justify-between p-4">
            <div className="flex items-start justify-between">
              <MaskedLine className="font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/40">
                {sub}
              </MaskedLine>
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/25">
                {row}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <MaskedLine as="h4" className="text-[15px] font-medium tracking-[-0.01em] text-foreground group-hover:text-accent">
                {primary}
              </MaskedLine>
              <MaskedLine className="font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/45">
                {legend}
              </MaskedLine>
            </div>

            <span
              aria-hidden
              className="absolute right-3 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent opacity-0 transition-opacity duration-500 group-hover:opacity-80"
            />
          </div>
        </KeyBevel>
      </Wrapper>
    </div>
  );
}

function FnKey({ label, meta, href, col = 0 }) {
  const MotionLink = motion.create(Link);
  return (
    <div data-stagger-item data-col={col} className="block">
      <MotionLink
        href={href}
        data-cursor="link"
        whileHover={{ y: 2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 520, damping: 30 }}
        className="group block"
      >
        <KeyBevel className="h-11">
          <div className="relative z-10 flex h-full items-center justify-between px-3">
            <span className="text-[11px] font-medium tracking-[-0.01em] text-foreground/85 group-hover:text-foreground">
              {label}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-foreground/30">
              {meta}
            </span>
          </div>
        </KeyBevel>
      </MotionLink>
    </div>
  );
}

function Spacebar() {
  return (
    <motion.div
      data-reveal="icon"
      whileHover={{ y: 2 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="min-h-[76px]"
    >
      <KeyBevel className="h-full">
        <div className="relative z-10 flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="inline-block h-1.5 w-1.5 bg-accent" />
            <MaskedLine className="text-[13px] font-medium tracking-[0.18em] text-foreground uppercase">
              Agency 1776
            </MaskedLine>
          </div>
          <MaskedLine className="hidden font-mono text-[10px] uppercase tracking-[0.32em] text-foreground/50 md:block">
            Infrastructure for serious business · MMXXIV
          </MaskedLine>
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/25">
            R5 · 6.25u
          </span>
        </div>
      </KeyBevel>
    </motion.div>
  );
}

function ReturnKey() {
  const MotionLink = motion.create(Link);
  return (
    <MotionLink
      href="/"
      data-reveal="icon"
      data-cursor="link"
      whileHover={{ y: 2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 480, damping: 28 }}
      className="block w-full sm:w-[132px]"
    >
      <KeyBevel className="h-[76px]">
        <div className="relative z-10 flex h-full flex-col items-end justify-between p-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/40">
            Enter
          </span>
          <div className="flex items-center gap-2 self-start">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-foreground/70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M20 6v6a3 3 0 0 1-3 3H6" strokeLinecap="round" />
              <path d="M9 12l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-medium tracking-[-0.01em] text-foreground">
              Back to top
            </span>
          </div>
        </div>
      </KeyBevel>
    </MotionLink>
  );
}

function StatusLed({ label, muted }) {
  return (
    <div className="flex items-center gap-2">
      <span
        data-reveal="icon"
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          muted ? "bg-foreground/25" : "bg-accent"
        }`}
      />
      <MaskedLine className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/50">
        {label}
      </MaskedLine>
    </div>
  );
}
