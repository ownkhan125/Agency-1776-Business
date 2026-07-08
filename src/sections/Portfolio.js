"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import SectionShell from "@/components/SectionShell";
import { MaskedLine } from "@/components/MaskedLine";
import ProjectModal from "@/components/ProjectModal";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { useScrubReveal } from "@/hooks/useScrubReveal";
import { gsap, registerGsap } from "@/animations/register";
import { SNAP } from "@/animations/config";

/**
 * Selected work / 003 — 3D Fibonacci-sphere gallery.
 *
 * Architecture (adapted from the react-thanos-snap-adjacent CodeSandbox
 * reference, but rewritten for the studio's GSAP + ScrollSmoother stack):
 *
 *   - Section is tall (240vh) to give scroll room for the pin + rotation.
 *   - The inner viewport is PINNED via ScrollTrigger `pin: true` — NOT
 *     via CSS `position: sticky`. Sticky misbehaves inside the transformed
 *     `#smooth-content` that ScrollSmoother creates; ScrollTrigger's pin
 *     is the GSAP-native equivalent and works transparently.
 *   - Cards are laid out on a Fibonacci sphere so they distribute evenly
 *     over the surface; each card is `translate3d`'d into 3D space and
 *     rotated so its face points outward.
 *   - A single scrub tween rotates the sphere as the user scrolls the
 *     tall wrapper. Its `onUpdate` swaps the side text panel and toggles
 *     focused-card visuals.
 *   - useSectionReveal still fires the eyebrow's icon + MaskedLine on
 *     section entrance — a second, independent ScrollTrigger. No pin
 *     conflict because they target different elements with different
 *     start/end points.
 */

const PROJECTS = [
  {
    id: "01",
    slug: "northwind-systems",
    client: "Northwind Systems",
    role: "Product design · Web engineering",
    year: "2026",
    title: "A trading interface built for calm.",
    tag: "Financial infra",
  },
  {
    id: "02",
    slug: "lumen-health",
    client: "Lumen Health",
    role: "Brand · Marketing site",
    year: "2025",
    title: "A patient-first system, expressed in code.",
    tag: "Healthcare",
  },
  {
    id: "03",
    slug: "halo-studios",
    client: "Halo Studios",
    role: "Motion · Product tour",
    year: "2025",
    title: "One scroll from problem to conviction.",
    tag: "Creative tooling",
  },
];

const SPHERE_CARD_COUNT = 18;
// Three responsive tiers so the sphere never overflows its column.
// Layout is side-by-side at lg+ (≥1024), stacked below.
const TIERS = {
  desktop: { R: 300, w: 138, h: 190 }, // ≥1024
  tablet: { R: 220, w: 116, h: 158 },  // 768–1023 (stacked)
  mobile: { R: 150, w: 92, h: 126 },   // <768
};

// Pre-computed Fibonacci sphere positions (unit sphere; scale by radius
// at position-application time). Deterministic so SSR/CSR match.
const FIBO = Array.from({ length: SPHERE_CARD_COUNT }, (_, i) => {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / SPHERE_CARD_COUNT);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  const ux = Math.cos(theta) * Math.sin(phi);
  const uy = Math.sin(theta) * Math.sin(phi);
  const uz = Math.cos(phi);
  const rotY = Math.atan2(ux, uz) * (180 / Math.PI);
  const rotX = Math.asin(-uy) * (180 / Math.PI);
  return { ux, uy, uz, rotY, rotX };
});

export default function Portfolio() {
  const revealRef = useSectionReveal({ start: "top 92%" });
  // Body-text dust materialization. Uses the SAME useScrubReveal hook
  // that drives every other section heading — but at the word level
  // (each [data-scrub="word"] element animates as a whole unit) so the
  // per-project `textContent` swap doesn't destroy any pre-computed
  // char spans. Scrub is already tuned to complete well before the pin
  // activates and to only reverse after the pin unpins, so there's no
  // conflict window with the project-swap fade tween.
  const scrubRef = useScrubReveal();

  const outerRef = useRef(null);
  const pinRef = useRef(null);
  const sphereRef = useRef(null);
  const cardsRef = useRef([]);

  const eyebrowNumRef = useRef(null);
  const titleRef = useRef(null);
  const clientRef = useRef(null);
  const yearRef = useRef(null);
  const roleRef = useRef(null);
  const tagRef = useRef(null);

  const currentIndexRef = useRef(0);

  // Which sphere card, if any, is currently in the modal. `null` = closed.
  // Stored as { index, project } so the modal keeps rendering during the
  // close animation without needing the current sphere state.
  const [openCard, setOpenCard] = useState(null);
  const handleCloseModal = useCallback(() => setOpenCard(null), []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    registerGsap();

    const outer = outerRef.current;
    const pin = pinRef.current;
    const sphere = sphereRef.current;
    if (!outer || !pin || !sphere) return;

    // Only run the 3D sphere geometry + pin ScrollTrigger at lg+ —
    // below that we render the ProjectCarousel instead (see JSX).
    // Gating with matchMedia prevents ScrollTrigger from pinning a
    // display:none element and misfiring on tablet/mobile.
    const lgQuery = window.matchMedia("(min-width: 1024px)");
    if (!lgQuery.matches) return;

    const mmDesktop = window.matchMedia("(min-width: 1280px)");
    const mmTablet = lgQuery;

    const pickTier = () =>
      mmDesktop.matches ? TIERS.desktop : mmTablet.matches ? TIERS.tablet : TIERS.mobile;

    const applyGeometry = () => {
      const { R, w, h } = pickTier();
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const p = FIBO[i];
        const x = p.ux * R;
        const y = p.uy * R;
        const z = p.uz * R;
        card.style.width = `${w}px`;
        card.style.height = `${h}px`;
        card.style.marginLeft = `${-w / 2}px`;
        card.style.marginTop = `${-h / 2}px`;
        // Keep the outward-facing rotation part unchanged — those only
        // depend on the unit sphere, not on the radius.
        card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${p.rotY}deg) rotateX(${p.rotX}deg)`;
      });
    };

    applyGeometry();
    mmDesktop.addEventListener?.("change", applyGeometry);
    mmTablet.addEventListener?.("change", applyGeometry);

    const ctx = gsap.context(() => {
      // Dust materialization for the project swap — same visual language
      // as useScrubReveal (SNAP amplitudes + smooth-noise-clustered
      // directional bias) but replayed on demand rather than scroll-tied.
      // Outgoing text dissolves into dust, textContent is swapped, then
      // the incoming text arrives from a NEW dust cloud and converges.
      const smoothNoise = (i, phase) =>
        Math.sin(i * 0.42 + phase) * 0.6 +
        Math.sin(i * 0.13 + phase * 2.3) * 0.4;
      const xBias = SNAP.xBias ?? 0;
      const yBias = SNAP.yBias ?? 0;
      const rand = gsap.utils.random;
      const dustVector = (i, phaseSeed) => {
        const cx = smoothNoise(i, 1.1 + phaseSeed);
        const cy = smoothNoise(i, 2.7 + phaseSeed);
        const cr = smoothNoise(i, 3.9 + phaseSeed);
        const jx = (rand(0, 1) - 0.5) * 0.5;
        const jy = (rand(0, 1) - 0.5) * 0.5;
        return {
          x: (cx + jx) * SNAP.x + xBias,
          y: (cy + jy) * SNAP.y + yBias,
          rotation: cr * SNAP.rotation,
        };
      };

      const swapText = (nextIndex) => {
        const project = PROJECTS[nextIndex];
        const targets = [
          titleRef.current,
          clientRef.current,
          yearRef.current,
          roleRef.current,
          tagRef.current,
        ].filter(Boolean);

        // Fresh dust vectors per swap so the cloud direction feels
        // organic and never mechanically identical between swaps.
        const exitVectors = targets.map((_, i) => dustVector(i, nextIndex * 7));
        const enterVectors = targets.map((_, i) =>
          dustVector(i, nextIndex * 7 + 4.3)
        );

        // Exit — dissolve current text into dust cloud.
        gsap.to(targets, {
          x: (i) => exitVectors[i].x,
          y: (i) => exitVectors[i].y,
          rotation: (i) => exitVectors[i].rotation,
          opacity: SNAP.fromOpacity ?? 0,
          filter: `blur(${SNAP.blur}px)`,
          duration: 0.35,
          ease: "power2.in",
          stagger: { each: 0.025, from: "random" },
          overwrite: "auto",
          onComplete: () => {
            if (titleRef.current) titleRef.current.textContent = project.title;
            if (clientRef.current) clientRef.current.textContent = project.client;
            if (yearRef.current) yearRef.current.textContent = project.year;
            if (roleRef.current) roleRef.current.textContent = project.role;
            if (tagRef.current) tagRef.current.textContent = project.tag;

            // Enter — new dust cloud arrives and converges to identity.
            gsap.fromTo(
              targets,
              {
                x: (i) => enterVectors[i].x,
                y: (i) => enterVectors[i].y,
                rotation: (i) => enterVectors[i].rotation,
                opacity: SNAP.fromOpacity ?? 0,
                filter: `blur(${SNAP.blur}px)`,
              },
              {
                x: 0,
                y: 0,
                rotation: 0,
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.5,
                ease: "power3.out",
                stagger: { each: 0.035, from: "random" },
                overwrite: "auto",
              }
            );
          },
        });
      };

      gsap.to(sphere, {
        rotateY: 540,
        rotateX: 22,
        ease: "none",
        scrollTrigger: {
          trigger: outer,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin,
          pinSpacing: false,
          onUpdate: (self) => {
            const p = self.progress;
            const projectIndex = Math.min(
              PROJECTS.length - 1,
              Math.floor(p * PROJECTS.length * 0.999)
            );
            if (currentIndexRef.current !== projectIndex) {
              currentIndexRef.current = projectIndex;
              swapText(projectIndex);
            }

            // Rolling focus band across sphere cards — same idea as the
            // reference's `focusIndex = floor(progress * count)` with a
            // small neighbourhood highlighted.
            const focusIdx = Math.floor(p * SPHERE_CARD_COUNT) % SPHERE_CARD_COUNT;
            for (let i = 0; i < cardsRef.current.length; i++) {
              const card = cardsRef.current[i];
              if (!card) continue;
              const diff = Math.min(
                Math.abs(i - focusIdx),
                Math.abs(i - focusIdx - SPHERE_CARD_COUNT),
                Math.abs(i - focusIdx + SPHERE_CARD_COUNT)
              );
              const focused = diff <= 1;
              card.style.opacity = focused ? "1" : "0.42";
              card.style.filter = focused ? "none" : "grayscale(65%)";
            }
          },
        },
      });
    }, outer);

    return () => {
      mmDesktop.removeEventListener?.("change", applyGeometry);
      mmTablet.removeEventListener?.("change", applyGeometry);
      ctx.revert();
    };
  }, []);

  const first = PROJECTS[0];

  return (
    <SectionShell
      id="work"
      ref={revealRef}
      particles={false}
      showBorder={false}
      className="relative"
      innerClassName="relative mx-auto max-w-[1600px] px-6 md:px-16"
    >
      {/* <lg — bespoke chamfered carousel. Skips the 200vh pin
          entirely so tablet/mobile users don't sit in a long virtual
          scroll, and swaps the clipped 3D sphere for a scroll-snap
          Swiper made from the same SphereCard face. */}
      <div className="lg:hidden">
        <ProjectCarousel
          projects={PROJECTS}
          count={SPHERE_CARD_COUNT}
          onOpen={setOpenCard}
        />
      </div>

      {/* lg+ — original 3D Fibonacci sphere with pin. Hidden below lg
          so its DOM isn't measured by ScrollTrigger there. */}
      <div ref={outerRef} className="relative hidden min-h-[200vh] lg:block">
        <div
          ref={pinRef}
          className="relative flex h-screen w-full flex-col overflow-hidden lg:flex-row"
        >
          {/* Side panel — eyebrow + rotating project detail */}
          <div className="relative z-10 flex w-full flex-col justify-center pt-24 pb-8 lg:w-2/5 lg:py-0 lg:pr-8">
            <div
              ref={scrubRef}
              className="mx-auto flex w-full max-w-md flex-col gap-6 lg:mx-0"
            >
              <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
                <span className="inline-flex items-center gap-3">
                  <span
                    data-reveal="icon"
                    className="inline-block h-1.5 w-1.5 bg-accent"
                  />
                  Selected work / <span ref={eyebrowNumRef}>003</span>
                </span>
              </MaskedLine>

              <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] text-foreground/50">
                <span
                  ref={clientRef}
                  data-scrub="word"
                  className="min-w-0 truncate"
                >
                  {first.client}
                </span>
                <span className="h-px w-8 shrink-0 bg-muted" />
                <span ref={yearRef} data-scrub="word" className="shrink-0">
                  {first.year}
                </span>
              </div>

              <h3
                ref={titleRef}
                data-scrub="word"
                className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground"
              >
                {first.title}
              </h3>

              <p
                ref={roleRef}
                data-scrub="word"
                className="text-sm leading-relaxed text-foreground/60"
              >
                {first.role}
              </p>

              <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-foreground/50">
                <span className="inline-block h-1 w-1 bg-accent" />
                <span ref={tagRef} data-scrub="word">
                  {first.tag}
                </span>
              </div>

              {(() => {
                const MotionLink = motion.create(Link);
                return (
                  <MotionLink
                    href="/work"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    data-cursor="link"
                    data-scrub="word"
                    className="mt-4 inline-flex items-center gap-3 self-start text-xs uppercase tracking-[0.24em] text-accent"
                  >
                    View all cases
                    <span className="inline-block h-px w-8 bg-accent" />
                  </MotionLink>
                );
              })()}
            </div>
          </div>

          {/* 3D sphere well */}
          <div
            className="relative flex w-full flex-1 items-center justify-center overflow-hidden pb-16 lg:w-3/5 lg:pb-0"
            style={{ perspective: "1200px" }}
          >
            {/* Subtle radial vignette to sink the sphere into the section */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at center, transparent 30%, var(--background) 82%)",
              }}
            />

            <div
              ref={sphereRef}
              className="relative"
              style={{
                width: 0,
                height: 0,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {FIBO.map((_, i) => {
                const project = PROJECTS[i % PROJECTS.length];
                // The card wrapper carries the 3D transform (set
                // imperatively in applyGeometry). We add a role +
                // click/key handler here rather than on <SphereCard>
                // so the whole visible card face is the hit target,
                // and so the wrapper carries the accessibility metadata
                // that the sphere rotation logic already owns.
                const openModal = () =>
                  setOpenCard({ index: i, project });
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      cardsRef.current[i] = el;
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open case: ${project.title}`}
                    data-cursor="card"
                    onClick={openModal}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openModal();
                      }
                    }}
                    className="absolute left-1/2 top-1/2 cursor-pointer outline-none"
                    style={{
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "visible",
                      transition: "opacity 0.4s ease, filter 0.4s ease",
                      willChange: "transform, opacity, filter",
                    }}
                  >
                    <SphereCard index={i} project={project} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ProjectModal
        open={openCard !== null}
        project={openCard?.project ?? null}
        index={openCard?.index ?? 0}
        onClose={handleCloseModal}
      />
    </SectionShell>
  );
}

/* ---------- Sphere card face ---------- */

function SphereCard({ index, project }) {
  return (
    <div
      className="chamfer chamfer-sm relative h-full w-full"
      style={{
        "--chamfer-border-color":
          "color-mix(in srgb, var(--muted) 45%, transparent)",
        "--chamfer-bg": "var(--card-pinstripe), var(--surface)",
      }}
    >
      {/* Inner chamfered ring — echoes the ServiceCard/Portfolio placeholder
          treatment used elsewhere on the site. */}
      <div
        aria-hidden
        className="chamfer chamfer-xs pointer-events-none absolute inset-[6px]"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 35%, transparent)",
          "--chamfer-bg": "transparent",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-3">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-foreground/40">
            {String(index + 1).padStart(2, "0")} / {String(SPHERE_CARD_COUNT).padStart(2, "0")}
          </span>
          <span className="inline-block h-1 w-1 bg-accent opacity-80" />
        </div>

        {/* Abstract "product screen" mock — three horizontal bars of
            varying widths hinting at UI content. */}
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
          <span
            className="block h-[2px] w-2/3 bg-foreground/45"
            style={{ transform: `translateX(${((index * 3) % 7) - 3}px)` }}
          />
          <span
            className="block h-[2px] w-1/2 bg-foreground/30"
            style={{ transform: `translateX(${((index * 5) % 9) - 4}px)` }}
          />
          <span
            className="block h-[2px] w-[70%] bg-foreground/35"
            style={{ transform: `translateX(${((index * 7) % 5) - 2}px)` }}
          />
        </div>

        <div className="text-center font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/50">
          {project.tag}
        </div>
      </div>
    </div>
  );
}

/* ---------- Tablet / mobile carousel ---------- */

/**
 * ProjectCarousel — chamfered scroll-snap Swiper shown below lg.
 *
 * Same card face + design language as SphereCard (chamfered outer +
 * inset ring, "NN / 18" mark, accent dot, product-screen mock, tag
 * label), just at a much larger scale so the user can actually read
 * the project. `snap-mandatory` snaps to the nearest card on release;
 * `scroll-behavior: smooth` respects the pagination and prev/next
 * clicks; and an `IntersectionObserver` tracks which card is centered
 * so the pagination indicator + eyebrow "NN / TOTAL" stay in sync
 * with the scroll position without polling.
 */
function ProjectCarousel({ projects, count, onOpen }) {
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the highest intersection ratio → that's
        // the one snapped to center.
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const idx = cards.indexOf(best.target);
        if (idx >= 0) setActive(idx);
      },
      {
        root: scroller,
        threshold: [0.5, 0.75, 1],
      }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const scrollToCard = (idx) => {
    const clamped = Math.max(0, Math.min(count - 1, idx));
    const card = cardRefs.current[clamped];
    card?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const active_project = projects[active % projects.length];

  return (
    <div className="flex flex-col gap-10 py-16 sm:py-20">
      {/* Eyebrow — matches the desktop side-panel language. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
          <span className="inline-flex items-center gap-3">
            <span
              data-reveal="icon"
              className="inline-block h-1.5 w-1.5 bg-accent"
            />
            Selected work / {String(active + 1).padStart(2, "0")}
            <span className="text-foreground/40">
              {" "}/ {String(count).padStart(2, "0")}
            </span>
          </span>
        </MaskedLine>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-foreground/50">
          <span className="hidden sm:inline">{active_project.client}</span>
          <span className="hidden h-px w-6 bg-muted sm:inline-block" />
          <span>{active_project.year}</span>
        </div>
      </div>

      {/* Heading + brief — updates as the user scrolls between cards. */}
      <div className="flex flex-col gap-4">
        <motion.h3
          key={`title-${active}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(1.75rem,5vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground"
        >
          {active_project.title}
        </motion.h3>
        <motion.p
          key={`role-${active}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="text-sm leading-relaxed text-foreground/60"
        >
          {active_project.role}
        </motion.p>
      </div>

      {/* Scroll-snap track. `px-[calc(...)]` gives the first and last
          card a "peek" gutter so the snapped card visually sits at the
          section's edge padding rather than butting against it. */}
      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[max(1.5rem,calc(50vw-140px))] py-4 md:-mx-16 md:gap-6 md:px-[max(4rem,calc(50vw-160px))]"
        style={{ scrollbarWidth: "none" }}
      >
        {Array.from({ length: count }).map((_, i) => {
          const project = projects[i % projects.length];
          const openModal = () => onOpen({ index: i, project });
          return (
            <div
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              role="button"
              tabIndex={0}
              aria-label={`Open case: ${project.title}`}
              data-cursor="card"
              onClick={openModal}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openModal();
                }
              }}
              className="w-[260px] shrink-0 snap-center outline-none sm:w-[280px] md:w-[320px]"
              style={{
                aspectRatio: "138 / 190",
                opacity: i === active ? 1 : 0.42,
                filter: i === active ? "none" : "grayscale(65%)",
                transition: "opacity 0.35s ease, filter 0.35s ease",
              }}
            >
              <SphereCard index={i} project={project} />
            </div>
          );
        })}
      </div>

      {/* Prev / next + pagination row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => scrollToCard(active - 1)}
            disabled={active <= 0}
            data-cursor="button"
            className="chamfer chamfer-xs inline-flex h-10 w-10 items-center justify-center text-foreground outline-none transition-opacity disabled:opacity-40"
            style={{
              "--chamfer-border-color":
                "color-mix(in srgb, var(--muted) 55%, transparent)",
              "--chamfer-bg": "var(--background)",
            }}
          >
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
              <path d="M5 1L1 5L5 9M1 5H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => scrollToCard(active + 1)}
            disabled={active >= count - 1}
            data-cursor="button"
            className="chamfer chamfer-xs inline-flex h-10 w-10 items-center justify-center text-foreground outline-none transition-opacity disabled:opacity-40"
            style={{
              "--chamfer-border-color":
                "color-mix(in srgb, var(--muted) 55%, transparent)",
              "--chamfer-bg": "var(--background)",
            }}
          >
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
              <path d="M7 1L11 5L7 9M11 5H0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        {/* Compact tag pill echoing the sphere card face. */}
        <div className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 bg-accent" />
            {active_project.tag}
          </span>
        </div>
      </div>

      {/* Pagination dots — one per card, active dot expands into a bar. */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to project ${i + 1}`}
            onClick={() => scrollToCard(i)}
            data-cursor="button"
            className="h-1 outline-none transition-all"
            style={{
              width: i === active ? 18 : 6,
              backgroundColor:
                i === active ? "var(--accent)" : "color-mix(in srgb, var(--muted) 60%, transparent)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

