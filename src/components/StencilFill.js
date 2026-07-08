"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/animations/register";
import { SECTION_TRIGGER } from "@/animations/config";

/**
 * CRT Boot — per-letter phosphor ignition reveal for red heading words.
 *
 * The classic monitor turn-on motion translated to typography:
 *   1. Each letter starts as a compressed horizontal band
 *      (`clip-path: inset(50% 0 50% 0)`) — the CRT scan line at rest.
 *   2. The wrapper wears a bright ignition filter
 *      (`brightness(2.8) drop-shadow(0 0 10px accent 55%)`) — cathode
 *      strikes, phosphor peaks.
 *   3. Letters unroll vertically to full paint (`inset(0 0 0 0)`),
 *      staggered left→right with an expo.out ease so the "screen
 *      opens" from a horizontal line to a full display.
 *   4. The wrapper's filter decays back to identity (brightness 1,
 *      shadow 0) — phosphor cools down and the picture settles.
 *
 * Perf notes:
 *   • Filter is animated ONCE on the container, not N times per
 *     letter — 1 filter tween + N clip-path tweens keeps the frame
 *     budget flat regardless of word length.
 *   • clip-path + filter are both compositor-owned; no layout, no
 *     paint on children.
 *   • `will-change: clip-path` on each letter to keep them on a GPU
 *     layer for the duration of the reveal.
 *
 * Two trigger modes:
 *   • immediate: true  — plays once on mount (used by Hero, which is
 *                        always in view on load; a small delay lets the
 *                        surrounding white-text dust start materializing
 *                        first, so the red word reads as punctuation).
 *   • immediate: false — scroll-triggered with the shared
 *                        `SECTION_TRIGGER.start` + `toggleActions`, so
 *                        the CRT boot replays on reverse scroll exactly
 *                        like every other section reveal — no
 *                        additional ScrollTrigger surface area.
 */
export function StencilFill({
  as: Tag = "span",
  immediate = false,
  delay = immediate ? 0.35 : 0,
  duration = 0.55,
  stagger = 0.05,
  className,
  children,
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    registerGsap();
    const scope = ref.current;

    const ctx = gsap.context(() => {
      const letters = scope.querySelectorAll("[data-stencil-letter]");
      if (!letters.length) return;

      // -----------------------------------------------------------------
      // COLD-TUBE INITIAL STATE
      // Wrapper wears the ignition halo (text-shadow is text-specific,
      // renders as crisp per-glyph phosphor glow — much more visible
      // than drop-shadow filter). Each letter is compressed to a
      // horizontal scan band via clip-path and reduced opacity — the
      // dormant CRT.
      // -----------------------------------------------------------------
      gsap.set(scope, {
        // Stacked shadows = tight inner phosphor + wider outer bloom.
        // Alpha 1.0/0.75/0.4 make the ignition unmistakable.
        textShadow:
          "0 0 6px rgba(255, 60, 90, 1), 0 0 18px rgba(191, 10, 48, 0.75), 0 0 40px rgba(191, 10, 48, 0.4)",
        // Slight blur while the tube is warming — clears as we decay.
        filter: "brightness(1.4) blur(0.6px)",
        // Sub-pixel horizontal scale = classic CRT tube pinch-to-line.
        scaleX: 1.015,
      });
      gsap.set(letters, {
        // Compressed to a very thin horizontal scan band. Not 50/50 so
        // it isn't fully invisible — the band itself is a visible cue.
        clipPath: "inset(47% 0 47% 0)",
        opacity: 0.5,
      });

      const scrollTrigger = immediate
        ? undefined
        : {
            trigger: scope,
            start: SECTION_TRIGGER.start,
            toggleActions: SECTION_TRIGGER.toggleActions,
          };

      const tl = gsap.timeline({ delay, scrollTrigger });

      // -----------------------------------------------------------------
      // PHASE 1 — IGNITION SPIKE (t = 0.00 → 0.10s)
      // Tube strikes: opacity slams to 1, wrapper brightness peaks.
      // This is the "flash" the eye catches even at a glance.
      // -----------------------------------------------------------------
      tl.to(
        letters,
        {
          opacity: 1,
          duration: 0.08,
          ease: "power1.out",
        },
        0
      );
      tl.to(
        scope,
        {
          filter: "brightness(1.9) blur(0.4px)",
          duration: 0.08,
          ease: "power1.out",
        },
        0
      );

      // -----------------------------------------------------------------
      // PHASE 2 — VERTICAL UNROLL (t = 0.05 → 0.75s)
      // Scan bands widen from a horizontal line to full paint, letters
      // staggered left→right so the boot reads as a sweep across the
      // word. Slower + larger stagger = more clearly visible motion.
      // -----------------------------------------------------------------
      tl.to(
        letters,
        {
          clipPath: "inset(0 0 0 0)",
          duration: Math.max(duration, 0.7),
          ease: "expo.out",
          stagger: { each: Math.max(stagger, 0.08), from: "start" },
        },
        0.05
      );

      // Tube X-scale settles alongside the unroll.
      tl.to(
        scope,
        {
          scaleX: 1,
          duration: 0.55,
          ease: "power2.out",
        },
        0.05
      );

      // -----------------------------------------------------------------
      // PHASE 3 — SUSTAINED GLOW (t = 0.75 → 1.05s)
      // Hold the glow for ~0.3s so the ignition is comfortably visible
      // even to a scanning eye, before decaying.
      // -----------------------------------------------------------------
      tl.to(
        scope,
        {
          filter: "brightness(1.35) blur(0px)",
          duration: 0.3,
          ease: "none",
        },
        ">"
      );

      // -----------------------------------------------------------------
      // PHASE 4 — PHOSPHOR COOL-DOWN (t = 1.05 → 2.05s)
      // Shadow bloom fades and brightness returns to identity. Slow
      // and cinematic — the eye reads a red halo fading, not a jump.
      // -----------------------------------------------------------------
      tl.to(
        scope,
        {
          textShadow:
            "0 0 0px rgba(255, 60, 90, 0), 0 0 0px rgba(191, 10, 48, 0), 0 0 0px rgba(191, 10, 48, 0)",
          filter: "brightness(1) blur(0px)",
          duration: 1.0,
          ease: "power2.out",
        },
        ">"
      );
    }, scope);

    return () => ctx.revert();
  }, [immediate, delay, duration, stagger]);

  // Deterministic character split — SSR and CSR render identical DOM
  // so no hydration mismatch, and screen readers still see the original
  // text run (data-stencil-letter spans are transparent to a11y trees).
  const text = typeof children === "string" ? children : String(children ?? "");
  const chars = Array.from(text);

  return (
    <Tag
      ref={ref}
      data-stencil-fill
      className={className}
      style={{ display: "inline-block" }}
    >
      {chars.map((ch, i) => (
        <Fragment key={i}>
          <span
            data-stencil-letter
            style={{
              display: "inline-block",
              willChange: "clip-path",
              // Preserve intra-word whitespace verbatim so any spaces
              // in the wrapped string keep their visible width.
              whiteSpace: "pre",
            }}
          >
            {ch}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

export default StencilFill;
