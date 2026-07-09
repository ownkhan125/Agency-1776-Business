"use client";

import { useLayoutEffect, useRef } from "react";
import SectionShell from "@/components/SectionShell";
import SolarSystem from "@/components/SolarSystem";
import { MaskedLine } from "@/components/MaskedLine";
import { ScrubText } from "@/components/ScrubText";
import { StencilFill } from "@/components/StencilFill";
import { useScrubReveal } from "@/hooks/useScrubReveal";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { gsap, registerGsap } from "@/animations/register";

/**
 * Audience — center-origin organic dissolve reveal.
 *
 * The reference (vengenceui `scroll-dissolve-reveal`) is a WebGL shader
 * that combines: a radial distance field, FBM noise perturbation of
 * that field, a smoothstep threshold driven by scroll progress, and
 * Sobel edge glow. This section recreates the same visual language
 * WITHOUT three.js / R3F, using an SVG filter + mask pipeline that
 * happens to be the closest native analogue.
 *
 * Shape language:
 *   The tear grows as a 6-point **chamfered irregular triangle** rather
 *   than a circle — echoing the site-wide chamfered corner treatment on
 *   every card, button, and section border, and giving the reveal a
 *   distinctly angular / geometric read instead of a soft oval hole.
 *   The vertices are pre-perturbed for asymmetry; the tear filter's
 *   feTurbulence + feDisplacementMap then adds live organic wobble along
 *   the edge as it grows.
 *
 * Depth:
 *   A crimson radial-gradient glow overlay lives BEHIND the masked
 *   surface. As the tear opens, it becomes visible through the hole —
 *   `mix-blend-mode: screen` makes it brighten the SolarSystem beyond,
 *   so the reveal reads with a soft red halo instead of a flat cut.
 *   Everything else — depth, shadow, light falloff — is composed from
 *   layered CSS gradients and one 3-D rotateX tilt on the masked
 *   wrapper. No CSS drop-shadow, no CSS blur, no whole-content warp
 *   filter (those were the perf bottleneck; scroll-scrub is now smooth).
 * That torn hole then erases the section's entire surface (border,
 * background, text, and chips are all inside the masked wrapper), and
 * the SolarSystem — which has been sitting behind the surface the
 * whole time — is exposed through the tear.
 *
 * Layout stack (desktop, lg+):
 *   sceneRef        (220 vh runway)
 *     └ pinRef      (sticky h-screen, overflow-hidden)
 *         ├ SolarSystem       ← z-0, opacity 0 → 1 as the tear grows
 *         └ maskedRef         ← z-10, mask: url(#audience-tear-mask)
 *             ├ chamfered bg-background hole
 *             ├ chamfered muted border
 *             └ FrontContent (heading + para + 9-chip grid)
 *
 * Scrub timeline (single ScrollTrigger with pin, driven by `sceneRef`):
 *   0.00 → 0.14  Static hold — section reads as a normal section
 *   0.14 → 0.82  Dissolve — circle radius grows 0 → 0.85 (bbox units)
 *                 - Displacement scale peaks at 0.14 mid-dissolve, tapers off
 *                 - Content wrapper drifts grayscale + subtle blur for depth
 *                 - SolarSystem fades in (opacity, blur, scale) from 0.30
 *   0.82 → 1.00  Fully torn — content gone, SolarSystem at rest
 *
 * GSAP hygiene:
 *   • `gsap.matchMedia` gates the ScrollTrigger + attribute tweens to
 *     (min-width: 1024px). Below lg the desktop scene isn't in the DOM,
 *     and the mobile fallback renders the same content as a normal
 *     stacked SectionShell.
 *   • `useSectionReveal` on the mobile SectionShell — border stroke-in
 *     + particle converge run there like every other home section.
 *   • The heading scrub materialization is set up manually inside the
 *     matchMedia (identical to sibling sections), triggered by the
 *     runway `sceneRef` so measurements aren't confused by the pinned
 *     child.
 */

const AUDIENCE = [
  { id: "services",     label: "Service-based businesses" },
  { id: "local",        label: "Local businesses" },
  { id: "consultants",  label: "Consultants" },
  { id: "contractors",  label: "Contractors" },
  { id: "professional", label: "Professional service providers" },
  { id: "coaches",      label: "Coaches and experts" },
  { id: "startups",     label: "Startups" },
  { id: "growth",       label: "Growing companies" },
  { id: "upgrade",      label: "Organizations ready to upgrade their website" },
];

/**
 * FrontContent — the visible "section surface" content: eyebrow, heading
 * with per-char dust materialization, supporting paragraph, and the
 * 9-item audience chip grid. Rendered once; the surrounding wrapper
 * carries the SVG mask that dissolves the whole subtree as the user
 * scrolls.
 */
function FrontContent() {
  return (
    <div className="flex flex-col gap-8">
      <div
        data-audience-eyebrow
        className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-accent"
      >
        <span className="inline-block h-1.5 w-1.5 bg-accent" />
        <span>Who we serve / 005</span>
      </div>

      <h2 className="max-w-5xl text-[clamp(2.25rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
        <ScrubText>We support business owners</ScrubText>{" "}
        <span className="text-foreground/70">
          <ScrubText>who need results,</ScrubText>
        </span>{" "}
        <StencilFill className="text-accent">not noise.</StencilFill>
      </h2>

      <p className="max-w-md text-sm leading-relaxed text-foreground/70">
        Nine kinds of teams keep hiring us for the same reason —
        a senior in the room, every day, and work that moves a number.
      </p>

      <ul className="mt-4 grid grid-cols-3 gap-2">
        {AUDIENCE.map((a) => (
          <li key={a.id}>
            <span
              className="chamfer chamfer-xs relative flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-foreground/85"
              style={{
                "--chamfer-border-color":
                  "color-mix(in srgb, var(--muted) 45%, transparent)",
                "--chamfer-bg": "var(--surface)",
                backgroundImage: "var(--card-pinstripe)",
              }}
            >
              <span className="inline-block h-1.5 w-1.5 shrink-0 bg-accent" />
              <span className="leading-tight">{a.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 6-point chamfered irregular triangle. Coordinates are in "unit space"
// centred on (0,0); at render time each point is multiplied by the
// wrapper's shorter dimension × 0.5 × progress, so the polygon stays
// geometrically identical regardless of viewport aspect and grows out
// from the exact centre. Slight asymmetric offsets on each vertex break
// the perfect-triangle symmetry so the shape reads as hand-torn rather
// than mathematically drawn.
const TEAR_POLYGON = [
  [ 0.16, -0.87],  // top-right chamfer of apex
  [ 0.85,  0.42],  // top of right corner
  [ 0.71,  0.66],  // bottom of right corner
  [-0.72,  0.62],  // right of left corner
  [-0.86,  0.44],  // top of left corner
  [-0.14, -0.89],  // top-left chamfer of apex
];

export default function Audience() {
  const sceneRef = useRef(null);
  const pinRef = useRef(null);
  const maskedRef = useRef(null);
  const systemRef = useRef(null);
  const glowRef = useRef(null);
  const polygonRef = useRef(null);
  const dispRef = useRef(null);
  const dimsRef = useRef({ w: 1440, h: 900 });
  const mobileScrubRef = useScrubReveal({ start: "top 85%" });
  const mobileSectionRef = useSectionReveal();

  useLayoutEffect(() => {
    if (!sceneRef.current || !pinRef.current) return;
    registerGsap();

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const masked = maskedRef.current;
      const system = systemRef.current;
      const glow = glowRef.current;
      const polygon = polygonRef.current;
      const disp = dispRef.current;
      const scene = sceneRef.current;
      if (!masked || !system || !polygon || !disp) return;

      // ----------------------------------------------------------------
      // DIMENSION TRACKING — used purely to compute the aspect-corrected
      // polygon points in bbox-normalised space. The mask uses
      // `objectBoundingBox` units, so numeric values are all in the
      // [0..1] range relative to the wrapper's own bounding rect. To
      // keep the polygon visually circular in screen space regardless
      // of the wrapper's aspect ratio, we scale each vertex's X by the
      // inverse aspect ratio (h / w).
      // ----------------------------------------------------------------
      const syncDims = () => {
        const w = masked.clientWidth || window.innerWidth;
        const h = masked.clientHeight || window.innerHeight;
        dimsRef.current = { w, h, aspect: w / h };
      };
      syncDims();
      const ro = new ResizeObserver(syncDims);
      ro.observe(masked);

      // Precomputed polygon-update — 6 vertices, arithmetic-only.
      // At progress = 0 the polygon collapses to a degenerate zero-area
      // point which — when filtered by feDisplacementMap — flood-fills
      // black across the entire mask (browser-dependent, but reliable
      // in Chromium). To avoid that, we PARK the polygon far outside
      // the mask's [0..1] × [0..1] canvas (e.g. at (-10, -10)) until
      // progress crosses a small threshold. That way the mask reads as
      // pure white during the pre-dissolve hold; nothing rendered
      // outside the mask's own canvas can hide the target.
      const updatePolygon = (progress) => {
        if (progress < 0.008) {
          polygon.setAttribute("points", "-10,-10 -10.1,-10 -10.1,-10.1");
          return;
        }
        // Scale factor in bbox-normalised units. TEAR_POLYGON vertices
        // reach ±0.9 in each axis; multiplying by 0.55 keeps the fully-
        // grown polygon (progress = 1) covering roughly ±0.5 = the full
        // bbox. `progress` overshoots to 2.6 by end-of-scrub so the
        // polygon fully consumes the corners.
        const p = dimsRef.current;
        const scale = 0.55 * progress;
        const invAspect = 1 / p.aspect; // squash x for non-square boxes
        let out = "";
        for (let i = 0; i < TEAR_POLYGON.length; i++) {
          const [px, py] = TEAR_POLYGON[i];
          out +=
            (i ? " " : "") +
            (0.5 + px * scale * invAspect).toFixed(4) +
            "," +
            (0.5 + py * scale).toFixed(4);
        }
        polygon.setAttribute("points", out);
      };
      updatePolygon(0);

      // ----------------------------------------------------------------
      // Heading dust materialisation — one manual tween that targets
      // BOTH the eyebrow chars and the heading chars in the desktop
      // scene. Trigger element is the outer runway so ScrollTrigger's
      // measurements aren't confused by the pin.
      // ----------------------------------------------------------------
      const chars = scene.querySelectorAll("[data-scrub='char']");
      if (chars.length) {
        const smoothNoise = (i, phase) =>
          Math.sin(i * 0.42 + phase) * 0.6 +
          Math.sin(i * 0.13 + phase * 2.3) * 0.4;
        const rand = gsap.utils.random;
        chars.forEach((el, i) => {
          const cx = smoothNoise(i, 1.1);
          const cy = smoothNoise(i, 2.7);
          const cr = smoothNoise(i, 3.9);
          const jitterX = (rand(0, 1) - 0.5) * 0.5;
          const jitterY = (rand(0, 1) - 0.5) * 0.5;
          el._dust = {
            x: (cx + jitterX) * 26 + 4,
            y: (cy + jitterY) * 18 - 5,
            rotation: cr * 9,
          };
        });
        gsap.set(chars, {
          x: (i, el) => el._dust.x,
          y: (i, el) => el._dust.y,
          rotation: (i, el) => el._dust.rotation,
          opacity: 0.02,
          filter: "blur(2.4px)",
          force3D: true,
        });
        const clearFilter = () => {
          for (let i = 0; i < chars.length; i++) chars[i].style.filter = "";
        };
        gsap.to(chars, {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: { each: 0.007, from: "random" },
          scrollTrigger: {
            trigger: scene,
            start: "top bottom",
            end: "top 55%",
            scrub: 0.4,
            onLeave: clearFilter,
          },
        });
      }

      // ----------------------------------------------------------------
      // Dissolve scrub timeline — single ScrollTrigger + pin.
      //   • The circle inside the SVG mask grows from r=0 → r=0.85 (bbox
      //     units). Its edge is torn organically by the feTurbulence /
      //     feDisplacementMap filter, so the reveal never traces a
      //     smooth curve.
      //   • The masked surface (border + bg + text + chips) drifts
      //     grayscale + a hair of blur as it dissolves, matching the
      //     reference shader's `uGrayscale` uniform.
      //   • SolarSystem behind emerges from opacity 0 + blurred +
      //     scaled-down 0.94 → sharp + full-size, entering focus as the
      //     tear consumes the surface.
      // ----------------------------------------------------------------
      // Rest states — polygon at progress 0 (already invisible via
      // `updatePolygon(0)`), no displacement, wrapper crisp + flat +
      // grayscale 0. IMPORTANT: no CSS blur, no drop-shadow, no
      // whole-content warp URL. Those were the frame-cost drivers; the
      // scroll-scrub used to hitch on them. Now the only per-frame
      // filter work is a small SVG turbulence + displacement applied
      // to the polygon (which is tiny during the first half of the
      // dissolve) plus a cheap CSS grayscale drift.
      gsap.set(disp, { attr: { scale: 0 } });
      gsap.set(masked, {
        opacity: 1,
        scale: 1,
        rotationX: 0,
        z: 0,
        filter: "grayscale(0)",
        transformOrigin: "50% 50%",
      });
      gsap.set(system, {
        opacity: 0,
        scale: 0.96,
        filter: "grayscale(0.25)",
      });
      if (glow) {
        gsap.set(glow, {
          opacity: 0,
          scale: 0.35,
          transformOrigin: "50% 50%",
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          pin: pinRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // POLYGON GROWTH — a scalar-only proxy tween that drives the
      // polygon's SVG `points` string via onUpdate. Six vertices, all
      // arithmetic; no ScrollTrigger-side reflow, no filter re-init.
      // This is what replaces the ellipse rx/ry tween — cheaper AND
      // produces the angular / chamfered shape the section wants.
      const polyState = { p: 0 };
      tl.to(
        polyState,
        {
          p: 2.6,
          ease: "power2.in",
          duration: 0.72,
          onUpdate: () => updatePolygon(polyState.p),
        },
        0.14
      );

      // Mask-boundary displacement — the wobble on the polygon edge.
      // Ramps up (peak tearing) then eases back down so the final
      // settled edge isn't violently jagged. Two chained tweens on
      // the same target form the "peak-then-decay" shape.
      tl.to(disp, { attr: { scale: 0.12 }, ease: "power2.in", duration: 0.30 }, 0.14);
      tl.to(disp, { attr: { scale: 0.04 }, ease: "power2.out", duration: 0.36 }, 0.48);

      // Grayscale drift only — no CSS blur, no drop-shadow. The
      // wrapper simply drains of colour as it dissolves. The soft red
      // halo formerly provided by `drop-shadow` is now painted by the
      // separate glow overlay behind the mask (much cheaper — a plain
      // radial-gradient div, composited by the GPU).
      tl.to(
        masked,
        {
          filter: "grayscale(0.55)",
          scale: 0.985,
          ease: "power1.in",
          duration: 0.55,
        },
        0.18
      );

      // Subtle 3-D tilt — the surface leans very slightly forward as
      // it tears. Kept restrained: rotateX 1.6°, z −40 px.
      tl.to(
        masked,
        {
          rotationX: -1.6,
          z: -40,
          ease: "power2.inOut",
          duration: 0.55,
        },
        0.18
      );

      // RED GLOW — a soft crimson radial gradient that scales out from
      // the section centre and fades. Because the glow div sits
      // behind the mask with `mix-blend-mode: screen`, it becomes
      // visible through the tear as the polygon carves the surface
      // away, painting a warm halo onto the SolarSystem underneath.
      // Peak opacity mid-dissolve, decays gently toward the end so the
      // final rest state isn't hazed over.
      if (glow) {
        tl.to(
          glow,
          {
            opacity: 0.75,
            scale: 1.15,
            ease: "power2.out",
            duration: 0.42,
          },
          0.18
        );
        tl.to(
          glow,
          {
            opacity: 0.32,
            scale: 1.35,
            ease: "power1.inOut",
            duration: 0.30,
          },
          0.60
        );
      }

      // SolarSystem behind — fades in mid-dissolve so it feels like it
      // was already there, not born on scroll.
      tl.to(
        system,
        {
          opacity: 1,
          scale: 1,
          filter: "grayscale(0)",
          ease: "power2.out",
          duration: 0.60,
        },
        0.30
      );

      // Cleanup when the media query stops matching.
      return () => {
        ro.disconnect();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section id="audience" className="relative">
      {/*
        DESKTOP / large-tablet (≥ lg) — center-origin organic dissolve.
      */}
      <div
        ref={sceneRef}
        className="relative hidden min-h-[220vh] lg:block"
        aria-labelledby="audience-heading"
      >
        {/*
          Global SVG defs for the dissolve. Placed inside the section so
          both the filter and the mask are IN the DOM and reachable via
          `url(#…)` from CSS — a 0×0 SVG with `position: absolute` so it
          takes no layout space of its own.

          maskContentUnits + filter primitiveUnits both "objectBoundingBox"
          keeps every numeric value expressed as a fraction of the masked
          element's own bbox, so the effect scales identically across
          different viewport sizes without JS-driven attribute recomputation.
        */}
        <svg
          width="1"
          height="1"
          aria-hidden
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <defs>
            {/*
              TEAR filter — single-pass turbulence + displacement + a
              tiny final gaussian blur that softens the polygon's alpha
              edge into a "misty" boundary instead of a hard cut.
              `primitiveUnits="objectBoundingBox"` keeps the frequency
              tuned to the polygon's own size, so as the polygon grows
              the noise scale grows proportionally — the wobble reads
              at the same relative amplitude the whole way through.
              Kept intentionally cheap (3 octaves, one pass) so the
              scroll-scrub stays at 60 fps.
            */}
            <filter
              id="audience-tear-filter"
              x="-25%"
              y="-25%"
              width="150%"
              height="150%"
              primitiveUnits="objectBoundingBox"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="6 4.5"
                numOctaves="3"
                seed="17"
                result="noise"
              />
              <feDisplacementMap
                ref={dispRef}
                in="SourceGraphic"
                in2="noise"
                scale="0"
                result="displaced"
              />
              <feGaussianBlur in="displaced" stdDeviation="0.006" />
            </filter>

            {/*
              Mask — `userSpaceOnUse` so the polygon lives in the target
              element's own pixel coordinates. The rect covers a
              generous 4000×3000 region so it always paints past the
              wrapper even at ultrawide viewports; anything outside the
              wrapper is invisible anyway. The polygon's points are
              rewritten every scroll frame by the GSAP `onUpdate`, so
              the growth happens by re-drawing the shape at pixel
              coords — no CSS transform, no aspect stretch.
            */}
            <mask
              id="audience-tear-mask"
              maskUnits="objectBoundingBox"
              maskContentUnits="objectBoundingBox"
              x="0"
              y="0"
              width="1"
              height="1"
            >
              {/*
                A rect fully covering the mask's objectBoundingBox
                coordinate space (0..1). WHITE = target visible. This
                is the "reveal everything" baseline for the mask.
              */}
              <rect
                x="0"
                y="0"
                width="1"
                height="1"
                fill="white"
              />
              {/*
                The polygon uses userSpaceOnUse coordinates via its own
                explicit CSS transform — see the useLayoutEffect below.
                Points are set in bbox-normalised space [0..1] centered
                at (0.5, 0.5). This keeps the polygon's coordinate
                system consistent with the rect and avoids the empty-
                mask + degenerate-shape black-flood bug we hit before.
              */}
              <polygon
                ref={polygonRef}
                points="0.5,0.5 0.5,0.5 0.5,0.5"
                fill="black"
                filter="url(#audience-tear-filter)"
              />
            </mask>
          </defs>
        </svg>

        <div
          ref={pinRef}
          className="relative flex h-screen w-full items-center overflow-hidden"
          style={{
            // Perspective on the pin container so the maskedRef's tiny
            // rotateX during dissolve reads as actual 3-D tilt rather
            // than a flat 2-D shear. 1600 px puts the vanishing point
            // comfortably behind the screen for a subtle push.
            perspective: "1600px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* SolarSystem — always in DOM, always animating on its own
              CSS orbit. Sits behind the masked surface; the tear
              exposes it. */}
          <div
            ref={systemRef}
            data-audience-system
            aria-hidden
            className="chamfer-shape pointer-events-none absolute inset-6 z-0 flex items-center justify-center md:inset-10"
            style={{
              "--chamfer-size": "14px",
              willChange: "opacity, filter, transform",
            }}
          >
            <SolarSystem className="max-w-[900px]" />
          </div>

          {/*
            Soft red glow — a radial-gradient div that sits BETWEEN the
            SolarSystem and the masked surface. `mix-blend-mode: screen`
            makes it brighten whatever's underneath, so as the tear
            opens the glow paints a warm halo onto the SolarSystem
            visible through the hole. Everything is composited by the
            GPU (no filters, no per-frame paint work), which is what
            makes the scroll stay smooth.
          */}
          <div
            ref={glowRef}
            data-audience-glow
            aria-hidden
            className="chamfer-shape pointer-events-none absolute inset-6 z-[1] md:inset-10"
            style={{
              "--chamfer-size": "14px",
              background:
                "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(255,60,90,0.45) 0%, rgba(191,10,48,0.22) 22%, rgba(191,10,48,0.08) 45%, transparent 70%)",
              mixBlendMode: "screen",
              willChange: "opacity, transform",
              transformOrigin: "50% 50%",
              opacity: 0,
            }}
          />

          {/*
            The masked "surface" — everything the section reads as
            normally lives inside this wrapper: the chamfered background
            hole, the chamfered muted border, and the FrontContent
            (heading + chip grid). All three dissolve together under
            the same mask so the tear consumes the entire section as
            one continuous surface, not just its interior text.
          */}
          <div
            ref={maskedRef}
            data-audience-masked
            className="absolute inset-0 z-10"
            style={{
              mask: "url(#audience-tear-mask)",
              WebkitMask: "url(#audience-tear-mask)",
              maskType: "alpha",
              // Only a single lightweight CSS filter: grayscale drift.
              // No blur, no drop-shadow, no whole-content warp URL —
              // those made the scroll-scrub hitch. The soft red halo
              // is now a plain compositor-painted overlay (glowRef).
              filter: "grayscale(0)",
              transformOrigin: "50% 50%",
              backfaceVisibility: "hidden",
              willChange: "filter, transform, opacity",
            }}
          >
            {/* Chamfered bg-background hole — mimics SectionShell so
                the section reads identically to Services / About at rest. */}
            <div
              aria-hidden
              className="chamfer-shape pointer-events-none absolute inset-6 bg-background md:inset-10"
              style={{ "--chamfer-size": "14px" }}
            />
            {/* Chamfered muted border — static; the dissolve tears it
                open just like the rest of the surface. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-6 md:inset-10"
              style={{
                border:
                  "1px solid color-mix(in srgb, var(--muted) 45%, transparent)",
                clipPath:
                  "polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)",
              }}
            />

            {/* Content stage */}
            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-center px-6 md:px-16">
              <FrontContent />
            </div>
          </div>
        </div>
      </div>

      {/*
        MOBILE / small-tablet (< lg) — no dissolve, no pin. Standard
        SectionShell stack: heading, para, (tablet-only) SolarSystem,
        chip grid. Below md the SolarSystem is hidden so mobile gets a
        clean, static text-only layout.
      */}
      <SectionShell
        ref={mobileSectionRef}
        className="py-32 md:py-48 lg:hidden"
        innerClassName="mx-auto max-w-[1600px] px-6 md:px-16"
      >
        <div className="flex flex-col gap-16">
          <div ref={mobileScrubRef} className="flex flex-col gap-8">
            <MaskedLine className="text-[10px] uppercase tracking-[0.32em] text-accent">
              <span className="inline-flex items-center gap-3">
                <span
                  data-reveal="icon"
                  className="inline-block h-1.5 w-1.5 bg-accent"
                />
                Who we serve / 005
              </span>
            </MaskedLine>

            <h2 className="text-[clamp(2.25rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
              <ScrubText>We support business owners</ScrubText>{" "}
              <span className="text-foreground/70">
                <ScrubText>who need results,</ScrubText>
              </span>{" "}
              <StencilFill className="text-accent">not noise.</StencilFill>
            </h2>

            <p className="max-w-md text-sm leading-relaxed text-foreground/70">
              <MaskedLine block>
                Nine kinds of teams keep hiring us for the
              </MaskedLine>
              <MaskedLine block>
                same reason — a senior in the room, every day,
              </MaskedLine>
              <MaskedLine block>and work that moves a number.</MaskedLine>
            </p>
          </div>

          <div className="hidden md:block">
            <SolarSystem />
          </div>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {AUDIENCE.map((a) => (
              <li key={a.id}>
                <span
                  data-reveal="icon"
                  className="chamfer chamfer-xs relative flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-foreground/85"
                  style={{
                    "--chamfer-border-color":
                      "color-mix(in srgb, var(--muted) 45%, transparent)",
                    "--chamfer-bg": "var(--surface)",
                    backgroundImage: "var(--card-pinstripe)",
                  }}
                >
                  <span className="inline-block h-1.5 w-1.5 shrink-0 bg-accent" />
                  <span className="leading-tight">{a.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>
    </section>
  );
}
