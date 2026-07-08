"use client";

import { useMemo } from "react";
import { PARTICLES } from "@/animations/config";

/**
 * Sparse particle field layered inside a SectionShell. Positions and
 * per-particle motion offsets are seeded deterministically from an
 * (id, index) pair — SSR and CSR render identical trees, so no
 * hydration mismatch. Elements carry `data-reveal="particle"` and
 * dataset offsets that useSectionReveal reads to drive the assembly
 * phase (scattered → drifting toward rest → dimming to ambient).
 *
 * Particles sit inside a pointer-events:none absolute container so
 * they contribute nothing to layout and never intercept input.
 */
function hash01(a, b) {
  // Cheap deterministic pseudo-random in [0, 1) — avoids Math.random()
  // so SSR/CSR agree without any seeding library.
  const x = Math.sin(a * 9973 + b * 43_147 + 0.5) * 43758.5453;
  return x - Math.floor(x);
}

export function SectionParticles({
  id = "section",
  count = PARTICLES.count,
  drift = PARTICLES.drift,
  sizeMin = PARTICLES.sizeMin,
  sizeMax = PARTICLES.sizeMax,
  color = "var(--accent)",
}) {
  const particles = useMemo(() => {
    const seed = id
      .split("")
      .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
    return Array.from({ length: count }, (_, i) => {
      const rx = hash01(seed, i * 4 + 1);
      const ry = hash01(seed, i * 4 + 2);
      const rDx = hash01(seed, i * 4 + 3);
      const rDy = hash01(seed, i * 4 + 4);
      const rSize = hash01(seed, i * 4 + 5);
      const rDelay = hash01(seed, i * 4 + 6);
      // Bias away from the horizontal centerline so particles feel like
      // they're feeding the border rather than crowding the text.
      const centerBias = Math.abs(ry - 0.5) < 0.15 ? (ry < 0.5 ? -0.18 : 0.18) : 0;
      return {
        left: `${(rx * 100).toFixed(2)}%`,
        top: `${((ry + centerBias) * 100).toFixed(2)}%`,
        dx: ((rDx - 0.5) * drift).toFixed(2),
        dy: ((rDy - 0.5) * drift).toFixed(2),
        size: (sizeMin + rSize * (sizeMax - sizeMin)).toFixed(2),
        delay: rDelay.toFixed(3),
      };
    });
  }, [id, count, drift, sizeMin, sizeMax]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p, i) => (
        <span
          key={i}
          data-reveal="particle"
          data-particle-dx={p.dx}
          data-particle-dy={p.dy}
          data-particle-delay={p.delay}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: color,
            opacity: 0,
            transform: "translate3d(0,0,0) scale(0.4)",
          }}
        />
      ))}
    </div>
  );
}
