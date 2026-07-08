"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/animations/register";
import { EASE, SCRUB_TRIGGER, STAGGER, SNAP } from "@/animations/config";

/**
 * Thanos-snap materialization for [data-scrub="char"] descendants.
 *
 * Two modes:
 *   - default (scroll-scrub) — dust ⇄ sharp tied to a ScrollTrigger, so
 *     chars converge as the section enters view and dissolve back on
 *     reverse scroll. Used by content sections.
 *   - `immediate: true` — no ScrollTrigger. The whole tween plays once
 *     on mount over `playDuration` seconds. Used by Hero so the heading
 *     is fully materialized on page load and does not depend on scroll.
 *
 * Trigger element: for scroll-scrub mode, the ScrollTrigger fires off
 * the ref itself — the heading column. Anchoring to the outer section
 * fires the scrub while the heading is still hidden behind the section's
 * py-32/py-48 padding, so the materialization runs off-viewport and the
 * user sees a fully-assembled heading when it finally scrolls in. Using
 * the ref keeps the scrub range synchronised with the heading's actual
 * on-screen travel, so the effect kicks in the instant the eyebrow /
 * heading first crosses into view.
 *
 * Falls back gracefully:
 *   - If only [data-scrub="word"] markers are present, they animate as
 *     whole tokens instead of per-char.
 *   - Respects prefers-reduced-motion: opacity-only, no drift/blur.
 */
export function useScrubReveal({
  immediate = false,
  playDuration = 1.3,
  start = SCRUB_TRIGGER.start,
  end = SCRUB_TRIGGER.end,
  scrub = SCRUB_TRIGGER.scrub,
  stagger = STAGGER.scrubChar,
  drift = SNAP,
} = {}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    registerGsap();
    const scope = ref.current;
    // Trigger element = the ref itself (the heading column). Section-
    // anchored triggers fired before the heading was visible; ref-
    // anchored triggers sync the scrub 1:1 with heading visibility.
    const trigger = scope;

    const ctx = gsap.context(() => {
      const chars = scope.querySelectorAll("[data-scrub='char']");
      const words = scope.querySelectorAll("[data-scrub='word']");
      const targets = chars.length ? chars : words;
      if (!targets.length) return;

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        // Reduced-motion: skip drift/blur entirely, opacity-only.
        // Also honors immediate mode (no ScrollTrigger).
        const perStagger = chars.length ? stagger : STAGGER.scrubWord;
        if (immediate) {
          gsap.fromTo(
            targets,
            { opacity: 0.15 },
            {
              opacity: 1,
              ease: EASE.softOut,
              duration: playDuration,
              stagger: { each: perStagger, amount: 0.25, from: "random" },
            }
          );
        } else {
          gsap.fromTo(
            targets,
            { opacity: 0.15 },
            {
              opacity: 1,
              ease: "none",
              stagger: perStagger,
              scrollTrigger: { trigger, start, end, scrub },
            }
          );
        }
        return;
      }

      // Smooth-noise dust vectors — adjacent chars share similar drift
      // ("weighted spatial clustering" adapted from the Red Stapler
      // reference's `weightedRandomDistrib`) plus a small per-char
      // jitter for individuality, and a global directional bias
      // (xBias / yBias) so the whole heading reads as a coherent dust
      // cloud moving in one direction.
      const rand = gsap.utils.random;
      const smoothNoise = (i, phase) =>
        Math.sin(i * 0.42 + phase) * 0.6 +
        Math.sin(i * 0.13 + phase * 2.3) * 0.4;
      const xBias = drift.xBias ?? 0;
      const yBias = drift.yBias ?? 0;
      targets.forEach((el, i) => {
        const cx = smoothNoise(i, 1.1);
        const cy = smoothNoise(i, 2.7);
        const cr = smoothNoise(i, 3.9);
        const jitterX = (rand(0, 1) - 0.5) * 0.5;
        const jitterY = (rand(0, 1) - 0.5) * 0.5;
        el._dust = {
          x: (cx + jitterX) * drift.x + xBias,
          y: (cy + jitterY) * drift.y + yBias,
          rotation: cr * drift.rotation,
        };
      });

      gsap.set(targets, {
        x: (i, el) => el._dust.x,
        y: (i, el) => el._dust.y,
        rotation: (i, el) => el._dust.rotation,
        opacity: drift.fromOpacity ?? 0,
        filter: `blur(${drift.blur}px)`,
        force3D: true,
      });

      const perStagger = chars.length ? stagger : STAGGER.scrubWord;

      // Clearing `filter` on completion is measurably faster than
      // leaving it at `blur(0px)`: the browser drops the filter effect
      // node from the compositor tree entirely, so all subsequent scroll
      // frames pay 0 GPU-blur cost for these chars. onComplete runs once
      // the tween finishes (or the scrub reaches its end); the reversed
      // state is re-entered by GSAP on scroll-back automatically.
      const clearFilter = () => {
        for (let i = 0; i < targets.length; i++) targets[i].style.filter = "";
      };

      if (immediate) {
        // Play once on mount — Hero uses this so entrance is not
        // gated by scroll position. Amount tightened so the last char
        // arrives within `playDuration + 0.3s` — no long tail of
        // stragglers after the page is otherwise settled.
        gsap.to(targets, {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          filter: "blur(0px)",
          ease: EASE.softOut,
          duration: playDuration,
          stagger: { each: perStagger, amount: 0.3, from: "random" },
          onComplete: clearFilter,
        });
      } else {
        gsap.to(targets, {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: { each: perStagger, from: "random" },
          scrollTrigger: {
            trigger, start, end, scrub,
            onLeave: clearFilter,
          },
        });
      }
    }, scope);

    return () => ctx.revert();
  }, [immediate, playDuration, start, end, scrub, stagger, drift]);

  return ref;
}
