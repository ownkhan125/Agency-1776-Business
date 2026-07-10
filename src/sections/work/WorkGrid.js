"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { MaskedLine } from "@/components/MaskedLine";
import ProjectMock, { MOCK_VARIANT_KEYS, getMockVariant } from "@/components/ProjectMock";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { gsap, registerGsap } from "@/animations/register";
import { PROJECTS } from "@/data/projects";

/**
 * Portfolio showcase — dual-row right-to-left marquee, full-bleed.
 *
 * This section intentionally SKIPS SectionShell so it feels open and
 * cinematic against the framed sections above and below it. Instead
 * of a chamfered border ring it uses:
 *   - subtle top + bottom accent hairlines to anchor it as its own
 *     "stage" without adopting the standard bordered container
 *   - a soft radial vignette that sinks the marquee into the page
 *   - a masked left+right edge fade so cards enter/exit gracefully
 *
 * Two rows scroll right → left at different speeds (2.4× ratio) so the
 * showcase reads as layered depth rather than a flat conveyor. Each
 * row is a doubled strip of tiles that GSAP tweens by `x: -50%` at
 * a linear ease with `repeat: -1` — the -50% translate lines the
 * duplicated half up against the first, so the loop is seamless.
 *
 * Hover on any card:
 *   - slows its row's marquee to 0.15× via a target `timeScale` tween
 *   - lifts the card + adds a soft accent glow
 *   - other cards keep moving; the hovered card's motion decelerates
 *     with its row rather than pausing hard, so the effect never jars
 *
 * Real projects (Northwind / Lumen / Halo) route to their case pages.
 * Confidential slots use the "under NDA" copy line already in the
 * PageHero — they're presented as premium, unclickable placeholders.
 */

// Confidential tiles are still fully clickable — they route to the
// contact page with the intent of discussing similar (NDA'd) work.
// Everything on the portfolio page acts as a "view / inquire" card so
// there's never a hover-and-nothing-happens dead zone.
const CONFIDENTIAL = [
  { key: "ledger", client: "Ledger Republic", tag: "Fintech", year: "2025" },
  { key: "kestrel", client: "Kestrel Field", tag: "Logistics", year: "2024" },
  { key: "arcane", client: "Arcane & Co.", tag: "Editorial", year: "2024" },
];

// Compose the marquee tile deck — real cases first, confidential fillers
// after, then the whole deck is repeated once inside the strip so the
// -50% translate produces a seamless loop.
function buildDeck() {
  const real = PROJECTS.map((p) => ({
    kind: "real",
    variant: p.mock,
    client: p.client,
    tag: p.tag,
    year: p.year,
    href: `/work/${p.slug}`,
    title: p.title,
  }));
  const filler = CONFIDENTIAL.map((c) => ({
    kind: "nda",
    variant: c.key,
    client: c.client,
    tag: c.tag,
    year: c.year,
    href: "/contact",
    title: "Under NDA",
  }));
  return [...real, ...filler];
}

const DECK = buildDeck();

export default function WorkGrid() {
  const sectionRef = useSectionReveal();
  const rowARef = useRef(null);
  const rowBRef = useRef(null);
  const stripARef = useRef(null);
  const stripBRef = useRef(null);
  const tweenARef = useRef(null);
  const tweenBRef = useRef(null);

  useLayoutEffect(() => {
    registerGsap();
    const stripA = stripARef.current;
    const stripB = stripBRef.current;
    if (!stripA || !stripB) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Top row — travels LEFT → RIGHT. The strip renders its tile
      // deck doubled ([...DECK, ...DECK]). Starting at xPercent -50
      // puts the second half aligned with the viewport left edge, and
      // tweening to 0 slides the first half into view. Because the two
      // halves are pixel-identical, the moment the tween loops back to
      // -50 the render is bit-identical — the seam is invisible.
      tweenARef.current = gsap.fromTo(
        stripA,
        { xPercent: -50 },
        {
          xPercent: 0,
          duration: 60, // slower, foreground layer
          ease: "none",
          repeat: -1,
        }
      );

      // Bottom row — travels RIGHT → LEFT, slightly faster cadence.
      // The mismatched speeds + opposing directions read as two
      // independent planes drifting past each other, giving the
      // showcase the layered depth the brief calls for.
      tweenBRef.current = gsap.fromTo(
        stripB,
        { xPercent: 0 },
        {
          xPercent: -50,
          duration: 44, // slightly faster background layer
          ease: "none",
          repeat: -1,
        }
      );

      if (reduced) {
        // Motion opt-out — freeze both strips at their starting frame
        // so tiles stay readable but nothing moves.
        tweenARef.current.pause(0);
        tweenBRef.current.pause(0);
      }
    });

    // Global pause when the tab is hidden — keeps GSAP from burning
    // CPU under a backgrounded tab and matches the studio's motion
    // hygiene on other scroll-tied sections.
    const onVis = () => {
      const paused = document.visibilityState !== "visible";
      tweenARef.current?.paused(paused);
      tweenBRef.current?.paused(paused);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      ctx.revert();
    };
  }, []);

  // Per-row hover pause. Each row pauses independently — hovering the
  // top row leaves the bottom row moving, and vice versa. Uses GSAP's
  // native tween.pause() / .play() so the tween resumes at the exact
  // sub-second offset it was paused at — no jump, no re-sync.
  const pauseRow = (which) => {
    (which === "a" ? tweenARef.current : tweenBRef.current)?.pause();
  };
  const resumeRow = (which) => {
    (which === "a" ? tweenARef.current : tweenBRef.current)?.play();
  };

  return (
    <section
      ref={sectionRef}
      id="work-list"
      className="relative isolate overflow-hidden py-24 md:py-32"
    >
      {/* Radial vignette — sinks the marquee stage into the page without
          drawing a hard-edged container. Matches the sphere well's
          treatment for continuity of design language. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 70%)",
        }}
      />
      {/* Faint accent hairlines top + bottom — stand-in for a bordered
          container that keeps the section anchored to the site language. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-6 h-px md:inset-x-16"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 60%, transparent) 30%, color-mix(in srgb, var(--accent) 60%, transparent) 70%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-6 h-px md:inset-x-16"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--muted) 90%, transparent) 30%, color-mix(in srgb, var(--muted) 90%, transparent) 70%, transparent)",
        }}
      />

      {/* Eyebrow + intro copy — preserves the design language used by
          every other section header on the site. */}
      <div className="relative mx-auto mb-14 flex max-w-[1600px] flex-wrap items-end justify-between gap-6 px-6 md:mb-16 md:px-16">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            The book / 02
          </span>
        </MaskedLine>
        <MaskedLine className="max-w-md text-sm leading-relaxed text-foreground/60">
          Selected engagements + confidential builds — click a real
          case for the numbers.
        </MaskedLine>
      </div>

      {/* Marquee stage — left+right edge mask so tiles enter and exit
          against a soft feather rather than a hard cut. */}
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        {/* Row A — foreground layer, LEFT → RIGHT drift.
            Pause-on-hover fires at the ROW level so hovering ANY tile
            in the row pauses the row's tween without slowing the other
            row. onFocusCapture / onBlurCapture mirror this for
            keyboard users tabbing through tile links. */}
        <div
          ref={rowARef}
          role="region"
          aria-label="Portfolio marquee, top row"
          onMouseEnter={() => pauseRow("a")}
          onMouseLeave={() => resumeRow("a")}
          onFocusCapture={() => pauseRow("a")}
          onBlurCapture={() => resumeRow("a")}
          className="relative overflow-hidden py-4"
        >
          <div
            ref={stripARef}
            className="flex w-max gap-6 pl-6 will-change-transform md:gap-8 md:pl-16"
          >
            {[...DECK, ...DECK].map((tile, i) => (
              <MarqueeTile
                key={`a-${i}`}
                tile={tile}
                size="lg"
                isDuplicate={i >= DECK.length}
              />
            ))}
          </div>
        </div>

        {/* Row B — background layer, RIGHT → LEFT drift, faster. */}
        <div
          ref={rowBRef}
          role="region"
          aria-label="Portfolio marquee, bottom row"
          onMouseEnter={() => pauseRow("b")}
          onMouseLeave={() => resumeRow("b")}
          onFocusCapture={() => pauseRow("b")}
          onBlurCapture={() => resumeRow("b")}
          className="relative mt-6 overflow-hidden py-4 md:mt-8"
        >
          <div
            ref={stripBRef}
            className="flex w-max gap-5 pl-24 will-change-transform md:gap-7 md:pl-40"
          >
            {(() => {
              const rotated = [...DECK.slice(2), ...DECK.slice(0, 2)];
              const doubled = [...rotated, ...rotated];
              return doubled.map((tile, i) => (
                <MarqueeTile
                  key={`b-${i}`}
                  tile={tile}
                  size="sm"
                  isDuplicate={i >= rotated.length}
                />
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Footer strip — count + CTA, preserves eyebrow language */}
      <div className="relative mx-auto mt-14 flex max-w-[1600px] flex-wrap items-center justify-between gap-6 px-6 md:mt-16 md:px-16">
        <MaskedLine className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            {PROJECTS.length.toString().padStart(2, "0")} cases published
            <span className="text-foreground/30">
              &middot; +{CONFIDENTIAL.length} under NDA
            </span>
          </span>
        </MaskedLine>
        <ViewAllLink />
      </div>
    </section>
  );
}

/* ---------- Marquee tile ---------- */

function MarqueeTile({ tile, size, isDuplicate = false }) {
  const isReal = tile.kind === "real";
  const dims =
    size === "lg"
      ? "w-[300px] sm:w-[360px] md:w-[420px]"
      : "w-[240px] sm:w-[280px] md:w-[340px]";

  // `view` cursor on every card — the whole tile signals "click to
  // view this project" (or "click to discuss similar NDA work" for
  // confidential slots — same eye affordance, different destination).
  const inner = (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      data-cursor="view"
      className={`group relative block shrink-0 ${dims}`}
    >
      {/* Card frame — chamfered, filled with the SVG mock. */}
      <div
        className="chamfer chamfer-sm relative aspect-[16/10] overflow-hidden"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 55%, transparent)",
          "--chamfer-bg": "var(--surface)",
        }}
      >
        <div className="absolute inset-[1px] overflow-hidden">
          <ProjectMock variant={tile.variant} showCaption={false} />
        </div>
        {/* Bottom gradient for meta legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)",
          }}
        />
        {/* Hover glow ring — accent halo on card hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow:
              "inset 0 0 0 1px color-mix(in srgb, var(--accent) 70%, transparent), 0 24px 60px -24px color-mix(in srgb, var(--accent) 55%, transparent)",
          }}
        />

        {/* NDA veil */}
        {!isReal && (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                "linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 100%)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
            }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-foreground/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
              &mdash; NDA &mdash;
            </span>
          </div>
        )}

        {/* Meta strip inside the frame */}
        <div className="relative z-10 flex h-full flex-col justify-between p-4 md:p-5">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
              {tile.client}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/60 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
              {tile.year}
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
              <span className="inline-block h-1 w-1 translate-y-[-1px] bg-accent align-middle" />{" "}
              {tile.tag}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/85 opacity-0 transition-opacity duration-500 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] group-hover:opacity-100">
              {isReal ? "Read case →" : "Inquire →"}
            </span>
          </div>
        </div>
      </div>

      {/* Title beneath the frame — reads on hover for the "premium
          reveal" the brief asks for, without cluttering the tile face. */}
      <div className="mt-4 px-1">
        <p className="text-sm leading-snug tracking-[-0.005em] text-foreground/80">
          {tile.title}
        </p>
      </div>
    </motion.div>
  );

  // Every tile wraps in a Link — real cases route to their case detail
  // page, NDA tiles route to /contact with an "inquire about similar
  // work" intent. Whole-tile click target, no dead zones. Duplicate
  // tiles (the second copy that makes the -50% loop seamless) are
  // taken out of the tab order and hidden from screen readers so the
  // portfolio isn't announced twice.
  return (
    <Link
      href={tile.href}
      aria-label={
        isDuplicate
          ? undefined
          : isReal
            ? `View case: ${tile.client} — ${tile.title}`
            : `Inquire about confidential work like ${tile.client}`
      }
      aria-hidden={isDuplicate || undefined}
      tabIndex={isDuplicate ? -1 : 0}
      className="outline-none"
    >
      {inner}
    </Link>
  );
}

function ViewAllLink() {
  const MotionLink = motion.create(Link);
  return (
    <MotionLink
      href="/contact"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      data-cursor="link"
      className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-accent"
    >
      Discuss a project
      <span className="inline-block h-px w-8 bg-accent" />
    </MotionLink>
  );
}
