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
      const border = scope.querySelector("[data-reveal='border']");
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
      if (border) {
        borderRestingStroke = getComputedStyle(border).stroke;
        gsap.set(border, {
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

      if (border) {
        // Border build — three-phase premium reveal, all on the shared
        // timeline (single ScrollTrigger, no duplicates):
        //
        //   1. DRAW    — stroke starts crimson (#bf0a30) with a soft
        //                drop-shadow halo; strokeDashoffset animates
        //                1 → 0 so the accent stroke traces the entire
        //                chamfered polygon perimeter.
        //   2. PULSE   — the moment the outline completes, the halo
        //                briefly intensifies (drop-shadow 3px → 6px
        //                and alpha 0.28 → 0.45), reading as a single
        //                subtle heartbeat rather than a flashy flare.
        //   3. DECAY   — the stroke colour fades to the resting muted
        //                colour and the halo dissolves to zero over
        //                ~0.55 s. onComplete clears the inline stroke/
        //                filter overrides so future theme swaps keep
        //                propagating through the SVG `stroke="var(--
        //                muted)"` attribute.
        //
        // Border finishes ~1 s after the section touches the viewport
        // bottom — decoratively behind the ~0.35 s text arrival, so
        // the user is already reading when the halo dissolves.
        tl.to(
          border,
          {
            strokeDashoffset: 0,
            duration: DURATION.border,
            ease: EASE.softOut,
          },
          0.1
        );
        tl.to(
          border,
          {
            filter: "drop-shadow(0 0 6px rgba(191, 10, 48, 0.45))",
            duration: 0.18,
            ease: "power1.out",
          },
          `>-0.05`
        );
        tl.to(
          border,
          {
            stroke: borderRestingStroke || "#4a4a4a",
            filter: "drop-shadow(0 0 0px rgba(191, 10, 48, 0))",
            duration: 0.55,
            ease: "power2.out",
            onComplete: () => {
              // Hand the polygon back to the SVG attribute + CSS
              // variable pipeline so theme changes propagate.
              border.style.removeProperty("stroke");
              border.style.removeProperty("filter");
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
