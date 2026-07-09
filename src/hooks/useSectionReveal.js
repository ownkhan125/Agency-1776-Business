"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/animations/register";
import {
  DURATION,
  EASE,
  PARTICLES,
  SECTION_TRIGGER,
  STAGGER,
} from "@/animations/config";

/**
 * Orchestrates a section entrance as a single ScrollTrigger timeline.
 * Phases are placed with `text-first` scheduling so readable content
 * never waits on decorative reveals:
 *
 *   1. text      — [data-reveal="text-line"] yPercent 115→0 at t=0
 *   2. icons     — [data-reveal="icon"] autoAlpha+y+scale at t=0.05
 *   3. particles — [data-reveal="particle"] converge dust at t=0
 *   4. border    — [data-reveal="border"] strokeDashoffset 1→0 at t=0.1
 *
 * Text lines become readable within ~350 ms of the section touching
 * the viewport bottom; the decorative layers (particles converging +
 * chamfered border stroke-in) run alongside without gating readability.
 *
 * All four phases share ONE ScrollTrigger — no duplicates on remount
 * thanks to gsap.context.revert().
 */
export function useSectionReveal({
  start = SECTION_TRIGGER.start,
  toggleActions = SECTION_TRIGGER.toggleActions,
  // Origin of the icon-phase stagger. Left undefined by default so the
  // existing "start of DOM order" cascade is unchanged. Sections with
  // grid-of-cards content pass `staggerFrom: "center"` to get the
  // center-out staggered reveal pattern popularised by the reference
  // shadcn "staggered-grid" component — middle cards materialise first
  // and outer cards follow, without touching the animation style or
  // any of the other timeline phases.
  staggerFrom,
} = {}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    registerGsap();
    const scope = ref.current;

    const ctx = gsap.context(() => {
      const particles = scope.querySelectorAll("[data-reveal='particle']");
      // Two border variants live side-by-side in SectionShell (the
      // desktop chamfered polygon and the mobile top+bottom lines) —
      // only one is visible per viewport via a CSS media-query class,
      // but both need the reveal timeline applied so scroll-in works
      // correctly on either.
      const borders = scope.querySelectorAll("[data-reveal='border']");
      const icons = scope.querySelectorAll("[data-reveal='icon']");
      const lines = scope.querySelectorAll("[data-reveal='text-line']");

      if (particles.length) {
        // Start displaced — dust arriving from off-position — so the
        // reveal reads as convergence, not fade-in-place.
        gsap.set(particles, {
          autoAlpha: 0,
          scale: 0.4,
          x: (_, el) => parseFloat(el.dataset.particleDx) || 0,
          y: (_, el) => parseFloat(el.dataset.particleDy) || 0,
        });
      }
      // Cache the border's resting stroke color BEFORE we override it
      // with the accent-draw effect. Reads the computed value (SVG
      // attribute `stroke="var(--muted)"` resolves through), so we
      // decay back to the current theme's muted colour on completion
      // and end up matching the SVG attribute state again.
      let borderRestingStroke = null;
      if (borders.length) {
        // Read the resting stroke off the first border — both variants
        // share the same `stroke` attribute passed into SectionShell,
        // so one sample is enough for the decay-back colour.
        borderRestingStroke = getComputedStyle(borders[0]).stroke;
        gsap.set(borders, {
          strokeDashoffset: 1,
          stroke: "#bf0a30",
          strokeWidth: 1,
          filter: "drop-shadow(0 0 3px rgba(191, 10, 48, 0.28))",
        });
      }
      if (icons.length)
        gsap.set(icons, { autoAlpha: 0, y: 24, scale: 0.94 });
      if (lines.length) gsap.set(lines, { yPercent: 115 });

      const tl = gsap.timeline({
        defaults: { ease: EASE.out },
        scrollTrigger: {
          trigger: scope,
          start,
          toggleActions,
        },
      });

      // Text lines LEAD the timeline — readable content is prioritized
      // so headings/body land within ~0.35 s of the trigger firing.
      if (lines.length) {
        tl.to(
          lines,
          {
            yPercent: 0,
            duration: DURATION.text,
            stagger: { each: STAGGER.textLine, amount: 0.22 },
          },
          0
        );
      }

      if (icons.length) {
        // Center-out ordering when the caller opts in — matches the
        // "columns delay from center" behaviour of the shadcn
        // staggered-grid reference (middle items delay 0, outer items
        // proportional). No effect on any other tween property.
        const iconStagger = { each: STAGGER.icon, amount: 0.22 };
        if (staggerFrom) iconStagger.from = staggerFrom;
        tl.to(
          icons,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: DURATION.icon,
            stagger: iconStagger,
          },
          0.05
        );
      }

      if (particles.length) {
        // Decorative: particles converge to peak alongside text/icons.
        tl.to(
          particles,
          {
            autoAlpha: PARTICLES.opacityPeak,
            scale: 1,
            x: 0,
            y: 0,
            duration: DURATION.particle,
            ease: EASE.softOut,
            stagger: { each: STAGGER.particle, from: "random" },
          },
          0
        );
        // Dim to ambient after peak — chained relative to particle-converge.
        tl.to(
          particles,
          {
            autoAlpha: PARTICLES.opacityAmbient,
            duration: 0.35,
            ease: EASE.softOut,
            stagger: 0.005,
          },
          DURATION.particle
        );
      }

      if (borders.length) {
        // Border build — three-phase premium reveal, all on the shared
        // timeline. Both the desktop chamfered polygon and the mobile
        // top+bottom lines get the same DRAW → PULSE → DECAY treatment,
        // so whichever variant is visible for the current viewport gets
        // the identical reveal.
        tl.to(
          borders,
          {
            strokeDashoffset: 0,
            duration: DURATION.border,
            ease: EASE.softOut,
          },
          0.1
        );
        tl.to(
          borders,
          {
            filter: "drop-shadow(0 0 6px rgba(191, 10, 48, 0.45))",
            duration: 0.18,
            ease: "power1.out",
          },
          `>-0.05`
        );
        tl.to(
          borders,
          {
            stroke: borderRestingStroke || "#4a4a4a",
            filter: "drop-shadow(0 0 0px rgba(191, 10, 48, 0))",
            duration: 0.55,
            ease: "power2.out",
            onComplete: () => {
              // Hand the borders back to the SVG attribute + CSS
              // variable pipeline so theme changes propagate.
              for (let i = 0; i < borders.length; i++) {
                borders[i].style.removeProperty("stroke");
                borders[i].style.removeProperty("filter");
              }
            },
          },
          `>-0.05`
        );
      }
    }, scope);

    return () => ctx.revert();
  }, [start, toggleActions, staggerFrom]);

  return ref;
}
