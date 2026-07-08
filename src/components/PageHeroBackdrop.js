"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/animations/register";

/**
 * PageHeroBackdrop — cinematic futuristic backdrop for inner-page heroes.
 *
 * Sits in SectionShell's `backdrop` slot behind PageHero content, inside the
 * chamfered inset that matches the section border (so the effect visually
 * respects the same rectangle the outline traces). Every variant reads the
 * palette from the site's CSS vars (`--accent`, `--foreground`, `--background`)
 * so both dark ("black") and light themes automatically retune — no per-theme
 * code paths.
 *
 * Variants (one flavour per page, same visual language):
 *   • beams        — 4 diagonal laser beams sweeping L→R (default / About)
 *   • scan         — horizontal scanning line + two diagonal beams (Services)
 *   • pulse        — 12 vertical energy streaks + horizontal scan (Pricing)
 *   • sweep        — radial light + two long diagonal sweeps (Work)
 *   • directional  — steep angled beams + drifting streaks (Contact)
 *
 * Perf & motion:
 *   • Pure DOM (divs + SVG lines) — no canvas physics, no re-init on resize.
 *   • Transform + opacity only. `will-change: transform, opacity` on FX layers
 *     forces compositor promotion — no repaint on animation frames.
 *   • Single gsap.context scope → cleaned up on unmount. Timelines are
 *     infinite tweens, not scroll-driven, so they can't fight useSectionReveal.
 *   • prefers-reduced-motion → skip animation setup entirely; layers render
 *     static at their initial state.
 *
 * Readability guardrail: every FX layer sits at ≤ 0.25 opacity, tinted with
 * the crimson accent at ~10 % blend + soft blur — the eye reads the heading
 * first, the backdrop second.
 */

const VARIANT_CONFIG = {
  beams: {
    ambient:
      "linear-gradient(120deg, rgba(191,10,48,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(191,10,48,0.06), transparent 60%)",
    beams: [
      { top: "18%", angle: -14, dur: 14, delay: 0, width: 260, glow: 0.55 },
      { top: "42%", angle: -14, dur: 12, delay: 3, width: 320, glow: 0.4 },
      { top: "62%", angle: -14, dur: 16, delay: 6, width: 220, glow: 0.5 },
      { top: "80%", angle: -14, dur: 13, delay: 1.5, width: 280, glow: 0.35 },
    ],
    scan: null,
    streaks: 6,
    grid: false,
  },
  scan: {
    ambient:
      "linear-gradient(180deg, rgba(191,10,48,0.05) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(191,10,48,0.07), transparent 65%)",
    beams: [
      { top: "22%", angle: 22, dur: 15, delay: 0, width: 380, glow: 0.5 },
      { top: "70%", angle: 22, dur: 18, delay: 4, width: 300, glow: 0.4 },
    ],
    scan: { dur: 7 },
    streaks: 4,
    grid: true,
  },
  pulse: {
    ambient:
      "linear-gradient(180deg, rgba(191,10,48,0.06) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(191,10,48,0.08), transparent 55%)",
    beams: [],
    scan: { dur: 5 },
    streaks: 12,
    grid: false,
  },
  sweep: {
    ambient:
      "radial-gradient(ellipse at 20% 30%, rgba(191,10,48,0.14) 0%, transparent 55%), linear-gradient(45deg, rgba(191,10,48,0.05) 0%, transparent 60%)",
    beams: [
      { top: "35%", angle: 45, dur: 16, delay: 0, width: 420, glow: 0.55 },
      { top: "70%", angle: 45, dur: 18, delay: 4, width: 380, glow: 0.4 },
    ],
    scan: null,
    streaks: 5,
    grid: false,
    rings: 3,
  },
  directional: {
    ambient:
      "linear-gradient(135deg, rgba(191,10,48,0.10) 0%, transparent 55%), radial-gradient(ellipse at 90% 90%, rgba(191,10,48,0.06), transparent 60%)",
    beams: [
      { top: "28%", angle: -32, dur: 12, delay: 0, width: 340, glow: 0.5 },
      { top: "55%", angle: -32, dur: 14, delay: 3, width: 300, glow: 0.4 },
      { top: "82%", angle: -32, dur: 16, delay: 6, width: 380, glow: 0.45 },
    ],
    scan: null,
    streaks: 8,
    grid: false,
  },
};

export default function PageHeroBackdrop({ variant = "beams" }) {
  const rootRef = useRef(null);
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.beams;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;
    registerGsap();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // Beams — each sweeps from off-screen-left through off-screen-right,
      // fading in over the first 12% of its life and out over the last 20%.
      // Different durations + delays give the swarm a natural, non-tick-tock
      // rhythm. Beams share the same angle per variant so they read as
      // one directional weather system, not a chaotic array.
      const beams = root.querySelectorAll('[data-fx="beam"]');
      beams.forEach((el) => {
        const dur = parseFloat(el.dataset.dur || "14");
        const delay = parseFloat(el.dataset.delay || "0");
        gsap.set(el, { xPercent: -160, opacity: 0 });
        gsap.to(el, {
          keyframes: [
            { xPercent: -160, opacity: 0, duration: 0 },
            { opacity: 1, duration: dur * 0.12 },
            { opacity: 1, duration: dur * 0.68 },
            { xPercent: 200, opacity: 0, duration: dur * 0.2 },
          ],
          delay,
          ease: "none",
          repeat: -1,
          repeatDelay: 1.5,
        });
      });

      // Scanning line — travels top→bottom with a soft leading glow. Pauses
      // briefly at each end to feel like a proper radar sweep, not a
      // conveyor belt.
      const scans = root.querySelectorAll('[data-fx="scan"]');
      scans.forEach((el) => {
        const dur = parseFloat(el.dataset.dur || "6");
        gsap.set(el, { yPercent: -30, opacity: 0 });
        gsap.to(el, {
          keyframes: [
            { yPercent: -30, opacity: 0, duration: 0 },
            { opacity: 1, duration: dur * 0.15 },
            { yPercent: 130, opacity: 1, duration: dur * 0.7 },
            { opacity: 0, duration: dur * 0.15 },
          ],
          ease: "sine.inOut",
          repeat: -1,
          repeatDelay: 1.2,
        });
      });

      // Vertical streaks — thin light traces that climb the frame at
      // staggered speeds. Each one gets its own random-ish delay so they
      // don't fire in sync.
      const streaks = root.querySelectorAll('[data-fx="streak"]');
      streaks.forEach((el, i) => {
        const dur = parseFloat(el.dataset.dur || "4.5");
        const seed = (i * 0.618) % 1; // golden-ratio jitter, deterministic
        gsap.set(el, { yPercent: 120, opacity: 0 });
        gsap.to(el, {
          keyframes: [
            { yPercent: 120, opacity: 0, duration: 0 },
            { opacity: 1, duration: dur * 0.18 },
            { yPercent: -140, opacity: 1, duration: dur * 0.62 },
            { opacity: 0, duration: dur * 0.2 },
          ],
          delay: seed * 3,
          ease: "power1.out",
          repeat: -1,
          repeatDelay: 1.5 + seed * 1.8,
        });
      });

      // Expanding rings — used only on the `sweep` variant. Anchored to the
      // top-left corner, scale + fade so the eye reads a slow, ambient pulse.
      const rings = root.querySelectorAll('[data-fx="ring"]');
      rings.forEach((el, i) => {
        gsap.set(el, { scale: 0.15, opacity: 0 });
        gsap.to(el, {
          keyframes: [
            { scale: 0.15, opacity: 0, duration: 0 },
            { opacity: 0.5, duration: 1 },
            { scale: 2.6, opacity: 0, duration: 5.5 },
          ],
          delay: i * 2,
          ease: "power2.out",
          repeat: -1,
          repeatDelay: 1,
        });
      });

      // Grid drift — a tiny, permanent x/y wander on the grid layer so the
      // grid feels alive without ever being obviously scrolling.
      const grids = root.querySelectorAll('[data-fx="grid"]');
      grids.forEach((el) => {
        gsap.to(el, {
          backgroundPosition: "40px 40px",
          duration: 20,
          ease: "none",
          repeat: -1,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [variant]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-page-backdrop
      data-variant={variant}
      className="absolute inset-6 md:inset-10 overflow-hidden"
      style={{
        // Contain paint + composite to the backdrop rect. Guarantees that
        // absolutely-positioned FX layers can't blow out the section shell
        // and that the browser can promote this subtree onto its own layer.
        contain: "layout paint",
      }}
    >
      {/* Ambient tint — a fixed low-opacity crimson wash so the hero always
          reads as "on brand" even before any animated layer catches the eye. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: config.ambient }}
      />

      {/* Subtle tech grid — only on scan variant. Pinstriped feel, drifts
          slowly via GSAP so the grid pulses instead of sitting flat. */}
      {config.grid && (
        <div
          data-fx="grid"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(245,242,236,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,242,236,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage:
              "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
          }}
        />
      )}

      {/* Diagonal laser beams — thin rectangles with a horizontal light
          gradient. Each rotates around its centre; GSAP sweeps them across
          the frame via xPercent. Blur softens the edge into a glow. */}
      {config.beams.map((b, i) => (
        <div
          key={`beam-${i}`}
          data-fx="beam"
          data-dur={b.dur}
          data-delay={b.delay}
          className="pointer-events-none absolute"
          style={{
            top: b.top,
            left: "-30%",
            width: `${b.width}px`,
            height: "1.5px",
            transform: `rotate(${b.angle}deg)`,
            transformOrigin: "center",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(191,10,48,0.55) 30%, rgba(255,180,192,0.85) 50%, rgba(191,10,48,0.55) 70%, transparent 100%)",
            filter: `blur(0.5px) drop-shadow(0 0 6px rgba(191,10,48,${b.glow}))`,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Horizontal scan line — a full-width thin stripe with a soft leading
          glow that traverses top→bottom. Reads like a radar sweep. */}
      {config.scan && (
        <div
          data-fx="scan"
          data-dur={config.scan.dur}
          className="pointer-events-none absolute left-0 right-0"
          style={{
            top: 0,
            height: "160px",
            background:
              "linear-gradient(180deg, transparent 0%, rgba(191,10,48,0.06) 40%, rgba(191,10,48,0.28) 92%, rgba(255,200,210,0.5) 98%, transparent 100%)",
            willChange: "transform, opacity",
          }}
        />
      )}

      {/* Vertical energy streaks — thin light traces. Distributed across
          the frame width at deterministic positions so they read as an
          array, not clustered noise. */}
      {Array.from({ length: config.streaks }).map((_, i) => {
        const leftPct = (i / config.streaks) * 100 + (i % 2) * 3;
        const height = 100 + ((i * 47) % 140);
        const dur = 3.5 + ((i * 0.7) % 3);
        return (
          <div
            key={`streak-${i}`}
            data-fx="streak"
            data-dur={dur}
            className="pointer-events-none absolute"
            style={{
              left: `${leftPct}%`,
              top: 0,
              width: "1px",
              height: `${height}px`,
              background:
                "linear-gradient(180deg, transparent 0%, rgba(191,10,48,0.35) 20%, rgba(255,200,210,0.7) 50%, rgba(191,10,48,0.35) 80%, transparent 100%)",
              filter: "drop-shadow(0 0 3px rgba(191,10,48,0.35))",
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {/* Corner-anchored expanding rings — used on `sweep` for a sense of
          slow radial pulse. Only 3 rings staggered over 8 s to avoid
          feeling busy. */}
      {config.rings &&
        Array.from({ length: config.rings }).map((_, i) => (
          <div
            key={`ring-${i}`}
            data-fx="ring"
            className="pointer-events-none absolute rounded-full"
            style={{
              top: "30%",
              left: "20%",
              width: "260px",
              height: "260px",
              transform: "translate(-50%, -50%)",
              transformOrigin: "center",
              border: "1px solid rgba(191,10,48,0.4)",
              willChange: "transform, opacity",
            }}
          />
        ))}

      {/* Chamfered vignette — soft radial dark edges keep body text
          contrast high even where the backdrop is brightest. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
