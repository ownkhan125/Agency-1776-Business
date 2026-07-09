"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

/**
 * SolarSystem — decorative 3D orbit visualization.
 *
 * Adapted from the vengenceui reference (isometric planet-orbit widget),
 * re-skinned to the studio's design system:
 *
 *   • Palette is 100 % on-brand — every planet card, ring, and dust mote
 *     paints in the site's crimson accent (`#bf0a30`) at varying alphas.
 *     No neon tech colours, no palette drift.
 *   • Cards use the site's chamfered outline (`.chamfer .chamfer-xs`),
 *     pinstripe background, and 10 px uppercase tracked labels — the same
 *     treatment used by TopBar / eyebrows elsewhere.
 *   • The centre "sun" is a chamfered plaque with a soft crimson halo
 *     and two counter-rotating dashed rings, all built from existing
 *     tokens.
 *   • Motion is pure CSS keyframes (see globals.css `solar-*`) — no rAF,
 *     no per-frame JS. `prefers-reduced-motion` freezes every layer at
 *     its initial frame via a global media query.
 *
 * How the orbit works (kept from the reference for correctness):
 *   Each orbit slot is TWO nested rotators:
 *     1. `.solar-orbit` runs (translate → rotateZ → translateX) so the
 *        node traces a circle of radius `--orbit-radius` around origin.
 *     2. `.solar-billboard` on the child runs the equal-and-opposite
 *        rotateZ so the card cancels the orbit's rotation and appears
 *        to stay upright + facing the camera as it revolves.
 *   Both rotators share `--orbit-duration`; the pair-cancel is exact.
 *
 * Perf:
 *   • ~30 tweened transforms, all composited by the GPU.
 *   • Hover lifts one card via a scale + border-color transition — no
 *     layout thrash.
 *   • Container is `overflow: hidden` at the section scale so the outer
 *     ring can bleed to the section border without escaping into the
 *     next section on mobile.
 */

// `mobile: false` — chips + ring hidden below md so the widget doesn't
// overcrowd narrow viewports. Full audience list is still communicated
// through the chamfered chip grid in the copy column.
const AUDIENCE_ORBITS = [
  {
    id: "inner",
    duration: 26,
    accentAlpha: 0.95,
    mobile: true,
    items: [
      { id: "services",     label: "Services",     glyph: "briefcase" },
      { id: "local",        label: "Local",        glyph: "pin" },
      { id: "consultants",  label: "Consultants",  glyph: "bulb" },
    ],
  },
  {
    id: "mid",
    duration: 34,
    accentAlpha: 0.75,
    mobile: true,
    items: [
      { id: "contractors",  label: "Contractors",  glyph: "wrench" },
      { id: "professional", label: "Professional", glyph: "badge" },
      { id: "coaches",      label: "Coaches",      glyph: "compass" },
    ],
  },
  {
    id: "outer",
    duration: 44,
    accentAlpha: 0.55,
    mobile: false,
    items: [
      { id: "startups",  label: "Startups",  glyph: "rocket" },
      { id: "growth",    label: "Growth",    glyph: "arrow-up" },
      { id: "upgrade",   label: "Upgrade",   glyph: "chevron-up" },
    ],
  },
];

// Cosmic dust — tiny crimson motes drifting on their own micro-orbits.
// Deterministic delays + radii so the swarm looks composed, not random.
const DUST = [
  { delay: -4,  radius: 130, alpha: 0.5 },
  { delay: -11, radius: 220, alpha: 0.35 },
  { delay: -19, radius: 300, alpha: 0.4 },
  { delay: -28, radius: 380, alpha: 0.28 },
  { delay: -7,  radius: 180, alpha: 0.45 },
  { delay: -15, radius: 340, alpha: 0.3 },
  { delay: -23, radius: 420, alpha: 0.25 },
];

// Tiny stroke glyphs — same visual grammar as the site's icons
// (thin strokes, no fills, 12-px viewBox). One per audience type; kept
// intentionally minimal because at orbit radii the label carries meaning
// and the glyph just adds a small anchor mark.
const GLYPHS = {
  briefcase: (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <rect x="1.5" y="3.5" width="9" height="7" stroke="currentColor" strokeWidth="1" />
      <path d="M4.5 3.5V2.5h3V3.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <path d="M6 1.5c2 0 3.5 1.5 3.5 3.5 0 2.5-3.5 5.5-3.5 5.5S2.5 7.5 2.5 5c0-2 1.5-3.5 3.5-3.5z" stroke="currentColor" strokeWidth="1" />
      <circle cx="6" cy="5" r="1.2" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  bulb: (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <path d="M6 1.5a3 3 0 0 1 1.8 5.4v1.6H4.2V6.9A3 3 0 0 1 6 1.5z" stroke="currentColor" strokeWidth="1" />
      <path d="M4.5 9.5h3M5 10.5h2" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <path d="M8.5 1.5l-2 2 2 2 2-2-2-2zM6 4L2 8v2h2l4-4" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  ),
  badge: (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <path d="M6 1.5l4 2v3.5L6 10.5 2 7V3.5l4-2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="6" cy="5.5" r="1.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
      <path d="M4.5 7.5l1.5-4 1.5 4-1.5-1.5-1.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  ),
  rocket: (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <path d="M6 1.5c2 1.5 3 3.5 3 5.5L6 9 3 7c0-2 1-4 3-5.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M4 8.5l-1.5 2M8 8.5l1.5 2" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  "arrow-up": (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <path d="M6 10.5V2M2.5 5.5L6 2l3.5 3.5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  ),
  "chevron-up": (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
      <path d="M2 8l4-4 4 4M2 5l4-4 4 4" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  ),
};

/**
 * Center BrandMark — the site-wide chamfered A monogram, reused so the
 * "sun" reads as the studio itself at the centre of the audience orbit.
 */
function CoreMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8 md:h-9 md:w-9">
      <polygon
        points="6,1 42,1 47,6 47,42 42,47 6,47 1,42 1,6"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M12 34 24 14 36 34"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M17 34h14" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export default function SolarSystem({ className }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      className={cn(
        // Full-bleed container inside its column. Fixed heights per bp
        // guarantee no layout shift as the orbits mount. `overflow: hidden`
        // clips the outermost orbit on narrow viewports so the widget
        // never bleeds into a sibling column.
        "relative mx-auto flex w-full items-center justify-center overflow-hidden",
        "h-[380px] sm:h-[440px] md:h-[520px] lg:h-[580px]",
        // Radius CSS vars are declared here via Tailwind arbitrary
        // properties. Every orbit ring, dust mote, and planet slot reads
        // `var(--orbit-r-inner|mid|outer)` so they stay in perfect
        // lockstep at every breakpoint. Radii are sized to the plane's
        // half-width MINUS the widest chip's half-width (~48 px) so a
        // chip at the outer orbit's furthest point still stays inside
        // the plane on every breakpoint — no chips get chopped off the
        // side as they revolve.
        "[--orbit-r-inner:85px] [--orbit-r-mid:135px] [--orbit-r-outer:135px]",
        "sm:[--orbit-r-inner:105px] sm:[--orbit-r-mid:160px] sm:[--orbit-r-outer:170px]",
        "md:[--orbit-r-inner:175px] md:[--orbit-r-mid:255px] md:[--orbit-r-outer:335px]",
        "lg:[--orbit-r-inner:215px] lg:[--orbit-r-mid:310px] lg:[--orbit-r-outer:395px]",
        className
      )}
      style={{
        perspective: "1400px",
      }}
    >
      {/* Tilted world plane — every orbit ring, dust mote, and sun-halo
          child inherits this rotation so the whole system reads as one
          coherent isometric plane. */}
      <div
        className="relative flex h-[380px] w-[380px] items-center justify-center sm:h-[440px] sm:w-[440px] md:h-[820px] md:w-[820px] lg:h-[940px] lg:w-[940px]"
        style={{
          transform: "rotateX(65deg) rotateY(-10deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Dashed orbit rings — decorative outlines showing the paths
            the planets take. Sized off the same radius vars as the
            orbit items so they always match exactly. */}
        {AUDIENCE_ORBITS.map((orbit) => (
          <div
            key={`${orbit.id}-ring`}
            aria-hidden
            className={cn(
              "pointer-events-none absolute rounded-full border border-dashed",
              // Hide the outer ring on narrow viewports — same rule the
              // outer orbit chips follow so nothing floats unmatched.
              !orbit.mobile && "hidden md:block"
            )}
            style={{
              width: `calc(2 * var(--orbit-r-${orbit.id}))`,
              height: `calc(2 * var(--orbit-r-${orbit.id}))`,
              borderColor: "color-mix(in srgb, var(--muted) 55%, transparent)",
            }}
          />
        ))}

        {/* Cosmic dust — tiny crimson motes on their own micro-orbits.
            Sits behind planet cards. */}
        {DUST.map((d, i) => (
          <div
            key={`dust-${i}`}
            aria-hidden
            className="solar-orbit pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
            style={{
              backgroundColor: `rgba(191, 10, 48, ${d.alpha})`,
              boxShadow: `0 0 6px rgba(191, 10, 48, ${d.alpha + 0.1})`,
              animationDelay: `${d.delay}s`,
              animationDuration: `28s`,
              "--orbit-radius": `${d.radius}px`,
              "--orbit-duration": "28s",
            }}
          />
        ))}

        {/* Central sun — a chamfered plaque with a soft crimson halo
            and two counter-rotating dashed rings. Sits on its own
            counter-tilted layer so it stays flat to the camera while
            the world plane is pitched 65°. */}
        <div
          className="pointer-events-none absolute z-20 flex h-[120px] w-[120px] items-center justify-center md:h-[150px] md:w-[150px]"
          style={{
            transform: "rotateY(10deg) rotateX(-65deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Halo */}
          <div
            aria-hidden
            className="solar-sun-pulse absolute h-[100px] w-[100px] rounded-full blur-md md:h-[130px] md:w-[130px]"
            style={{ background: "rgba(191, 10, 48, 0.28)" }}
          />
          {/* Plaque */}
          <div
            className="chamfer chamfer-sm relative z-10 flex h-[64px] w-[64px] items-center justify-center text-foreground md:h-[80px] md:w-[80px]"
            style={{
              "--chamfer-border-color":
                "color-mix(in srgb, var(--accent) 65%, transparent)",
              "--chamfer-bg": "var(--background)",
              backgroundImage: "var(--card-pinstripe)",
              boxShadow: "0 0 24px rgba(191, 10, 48, 0.28)",
            }}
          >
            <CoreMark />
          </div>
          {/* Counter-rotating dashed rings */}
          <div
            aria-hidden
            className="solar-spin-cw pointer-events-none absolute h-[130px] w-[130px] rounded-full border border-dashed md:h-[170px] md:w-[170px]"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
            }}
          />
          <div
            aria-hidden
            className="solar-spin-ccw pointer-events-none absolute h-[170px] w-[170px] rounded-full border border-dashed md:h-[210px] md:w-[210px]"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
            }}
          />
        </div>

        {/* Planet nodes — outer element orbits, inner card counter-rotates. */}
        {AUDIENCE_ORBITS.map((orbit) =>
          orbit.items.map((item, idx) => {
            // Angular spacing per orbit (chips are evenly distributed).
            // The mid + outer orbits are additionally rotated by a half-
            // interval so their chips interleave with the inner orbit
            // instead of stacking on the same radial line. This is the
            // difference between "planets clustered along one ray at
            // t=0" and "planets nicely spread around the star". Purely
            // a start-phase shift; the orbit period is unchanged.
            const interval = orbit.duration / orbit.items.length;
            const phaseShift =
              orbit.id === "mid" ? interval / 2 : orbit.id === "outer" ? interval / 3 : 0;
            const delay = -interval * idx - phaseShift;
            const isHovered = hovered === item.id;
            return (
              <div
                key={item.id}
                aria-hidden
                className={cn(
                  "solar-orbit pointer-events-none absolute left-1/2 top-1/2 h-0 w-0",
                  // Outer-orbit chips are hidden below md so the tilted
                  // plane isn't overcrowded on phones — full audience list
                  // remains reachable through the left-column chip grid.
                  !orbit.mobile && "hidden md:block"
                )}
                style={{
                  animationDelay: `${delay}s`,
                  animationDuration: `${orbit.duration}s`,
                  "--orbit-radius": `var(--orbit-r-${orbit.id})`,
                  "--orbit-duration": `${orbit.duration}s`,
                  zIndex: isHovered ? 30 : 10,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Laser beam back to the sun — appears on hover, echoes
                    the site's stencil/scan light-line vocabulary. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute right-0 top-1/2 h-px origin-right -translate-y-1/2 transition-opacity duration-300"
                  style={{
                    width: `var(--orbit-r-${orbit.id})`,
                    opacity: isHovered ? 1 : 0,
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(191,10,48,0.15) 20%, rgba(191,10,48,0.8) 100%)",
                    boxShadow: "0 0 8px rgba(191,10,48,0.6)",
                  }}
                />
                {/* Billboard-cancelling card. `pointer-events: auto` so
                    users can still hover individual audience chips even
                    though the parent orbit slot is passive. */}
                <div
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    "solar-billboard chamfer chamfer-xs absolute left-1/2 top-1/2 flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] transition-[scale,color,border-color] duration-300",
                    "cursor-default"
                  )}
                  style={{
                    animationDelay: `${delay}s`,
                    animationDuration: `${orbit.duration}s`,
                    "--orbit-duration": `${orbit.duration}s`,
                    "--chamfer-border-color": isHovered
                      ? "var(--accent)"
                      : `color-mix(in srgb, var(--muted) ${Math.round(
                          orbit.accentAlpha * 55
                        )}%, transparent)`,
                    "--chamfer-bg": "var(--background)",
                    backgroundImage: "var(--card-pinstripe)",
                    color: isHovered
                      ? "var(--accent)"
                      : "color-mix(in srgb, var(--foreground) 80%, transparent)",
                    scale: isHovered ? 1.06 : 1,
                    pointerEvents: "auto",
                  }}
                >
                  <span className="text-current">{GLYPHS[item.glyph]}</span>
                  <span>{item.label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
