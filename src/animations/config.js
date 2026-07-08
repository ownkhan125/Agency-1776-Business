export const EASE = {
  out: "power3.out",
  softOut: "expo.out",
  inOut: "power2.inOut",
  linear: "none",
};

// Aggressively tightened — text/icons lead the timeline (t=0) with
// particles + border layered decoratively behind. Every content phase
// lands in <=0.7s from trigger fire, so headings are readable almost
// immediately after a section crosses the viewport bottom.
export const DURATION = {
  particle: 0.3,
  border: 0.35,
  icon: 0.28,
  text: 0.3,
};

export const STAGGER = {
  icon: 0.03,
  textLine: 0.022,
  scrubWord: 0.018,
  scrubChar: 0.007,
  particle: 0.006,
};

// Section timeline fires the instant the section top touches the
// viewport bottom — no wait at all. Everything from borders to text
// starts assembling immediately.
export const SECTION_TRIGGER = {
  start: "top bottom",
  toggleActions: "play none none reverse",
};

// Heading scrub — trigger element is the heading COLUMN (the ref
// itself), so `top bottom` fires the instant that column's top edge
// crosses the viewport bottom. `end: "top 55%"` shortens the scrub
// range to ~45% of the viewport so the heading is fully materialized
// while the section is still entering (~45% visibility). Combined
// with the reordered section timeline (text-first), headings feel
// readable "almost immediately" as the user hits each section.
export const SCRUB_TRIGGER = {
  start: "top bottom",
  end: "top 55%",
  scrub: 0.4,
};

// Thanos-snap heading dust amplitudes. Adapted from the Red Stapler
// reference philosophy: instead of purely-independent per-char random
// vectors, useScrubReveal uses a smooth-noise function keyed on char
// index so adjacent chars share similar drift (weighted spatial
// clustering — like the reference's `weightedRandomDistrib` bunching
// pixels into a peak). `xBias`/`yBias` add a coherent directional
// nudge so the whole heading reads as a single dust cloud moving in
// one direction, echoing the reference's uniform `+100, -100` sweep.
//
// Amplitudes tuned so the dust is clearly visible mid-scrub without
// tipping into flashy territory — chars are readable throughout,
// materialization feels like fog lifting.
export const SNAP = {
  x: 26,
  y: 18,
  xBias: 4,   // slight rightward drift for the cloud
  yBias: -5,  // slight upward drift
  rotation: 9,
  // filter: blur() is applied per-character during scrub — animating it
  // on 200+ chars is GPU-expensive. 2.4 px still reads as haze/dust
  // while nearly halving the per-frame blur cost vs 4.5.
  blur: 2.4,
  fromOpacity: 0.02,
};

// Particle field driving section assembly. Reference philosophy is the
// Thanos-snap dust that CONVERGES back into shape (rather than fades in
// place). `drift` is the max px displacement from rest that particles
// start at — larger values give a more dramatic "arrival" feel.
export const PARTICLES = {
  count: 40,
  drift: 70,        // px range particles arrive from before converging
  opacityPeak: 0.55,
  opacityAmbient: 0.14,
  sizeMin: 1.4,
  sizeMax: 3.2,
};
