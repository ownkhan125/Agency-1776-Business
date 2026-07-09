"use client";

import { useEffect, useRef } from "react";

/**
 * Grid-attractor particle backdrop for the Hero section.
 *
 * Philosophy adapted from Alex Andrix's "spipa" CodePen:
 *   1000×1000 data-space grid → each cell has a radial-field value
 *   peaking at r≈100 (ring-shaped attractor). Particles are spring-
 *   pulled toward their current attractor grid spot; every frame with
 *   50% chance, the attractor tries to migrate to the 4-neighbour with
 *   the highest `field + chaos*rand` value, subject to a busyAge gate
 *   (fresh spots or wall-faded spots only). Result: particles orbit the
 *   ring, leave fading trails, look like a slow-exposure swirl.
 *
 * My branding:
 *   - Cream (hue 38) with ~15% accent-red (hue 350) tint particles
 *   - Low sat + high lum + ~0.42 alpha = soft, light, non-distracting
 *   - 0.10 background fade = trails that fade over ~15 frames
 *   - maxPop 80, birthFreq 4 (vs reference's 300/2) for a lighter feel
 *
 * Perf:
 *   - Single rAF loop; NO GSAP, NO ScrollTrigger — cannot conflict with
 *     the existing scroll/animation stack
 *   - IntersectionObserver pause when Hero scrolls out of view
 *   - prefers-reduced-motion → one static frame with a seed of 30
 *     particles, no rAF loop
 *   - devicePixelRatio capped at 2 (no wasted GPU on 3× Retina)
 *   - Debounced 200ms resize with full re-seed
 *   - pointer-events: none + aria-hidden = never intercepts input
 *
 * Containment: canvas is inset-6 md:inset-10 to match the SectionShell
 * chamfered border rect, so the effect visually respects the Hero
 * container instead of bleeding to the section edges.
 */

const CONFIG = {
  // Data-space grid (fixed 1000-unit square, like the reference)
  dataExtent: 500,        // grid spans -500 .. +500 in data units
  gridSize: 12,           // px per grid cell (reference: 8 — coarser for perf)
  ringRadius: 100,        // r0 — where the radial field peaks
  // Particle physics
  lifespan: 600,          // frames before particle dies of old age
  birthFreq: 5,           // birth 1 particle every N frames
  maxPop: 55,             // hard cap on live particles (was 80 — perf)
  chaos: 30,              // random noise added to field comparisons
  spring: 8,              // pull strength toward attractor
  viscosity: 0.4,         // velocity damping
  stepScale: 0.1,         // p.x += stepScale * p.xSpeed
  // Rendering
  zoom: 1.6,              // data → canvas coordinate scale
  fadeAlpha: 0.10,        // background-tinted fade per frame (trail decay)
  particleAlpha: 0.32,    // fallback when CSS var is missing
  particleWidth: 1.4,     // px stroke width
  hueDriftPerFrame: 0,    // no monotonic drift — stay on brand
  drawFps: 30,            // canvas repaints at ~30 fps; rAF still 60 fps
};

// Snapshot the theme-tunable values from CSS custom properties. Any
// component-consumable palette knob is exposed on --backdrop-* tokens
// in globals.css, one set per theme, so the canvas retunes when the
// theme toggles without needing per-theme code paths here.
function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const num = (name, fallback) => {
    const v = parseFloat(cs.getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  };
  const rgb = (cs.getPropertyValue("--backdrop-fade").trim() || "0, 0, 0");
  return {
    fadeRgb: rgb,
    hue: num("--backdrop-particle-hue", 350),
    satMin: num("--backdrop-particle-sat-min", 28),
    satMax: num("--backdrop-particle-sat-max", 36),
    lumMin: num("--backdrop-particle-lum-min", 68),
    lumMax: num("--backdrop-particle-lum-max", 82),
    alpha: num("--backdrop-particle-alpha", CONFIG.particleAlpha),
  };
}

export default function HeroBackdrop() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef(null);
  const runningRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Skip the whole grid-attractor particle simulation below tablet.
    // The physics loop + canvas fills are the single biggest per-frame
    // cost on the home page, and the swirl is far too subtle at
    // phone-scale to justify. Static one-shot fill covers the canvas
    // in the theme's background colour so the Hero still reads as a
    // solid block.
    const isMobile =
      window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rgb = getComputedStyle(document.documentElement)
        .getPropertyValue("--backdrop-fade")
        .trim() || "0, 0, 0";
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.fillRect(0, 0, rect.width, rect.height);
      return;
    }

    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Theme-driven palette — mutated by the theme-change listener below
    // so already-alive particles keep drifting, only their colour band
    // shifts. New births use the fresh values immediately.
    let palette = readPalette();

    const buildGrid = () => {
      const grid = [];
      const gridSteps = Math.floor(
        (2 * CONFIG.dataExtent) / CONFIG.gridSize
      );
      const maxIndex = gridSteps * gridSteps;
      let i = 0;
      const lastEdge = -CONFIG.dataExtent + CONFIG.gridSize * (gridSteps - 1);
      for (let xx = -CONFIG.dataExtent; i < maxIndex; xx += CONFIG.gridSize) {
        for (
          let yy = -CONFIG.dataExtent;
          yy <= lastEdge && i < maxIndex;
          yy += CONFIG.gridSize
        ) {
          const r = Math.sqrt(xx * xx + yy * yy);
          let field;
          if (r < CONFIG.ringRadius) {
            field = (255 / CONFIG.ringRadius) * r;
          } else {
            field = 255 - Math.min(255, (r - CONFIG.ringRadius) / 2);
          }
          const isEdge =
            xx === -CONFIG.dataExtent
              ? "left"
              : xx === lastEdge
              ? "right"
              : yy === -CONFIG.dataExtent
              ? "top"
              : yy === lastEdge
              ? "bottom"
              : false;
          grid.push({
            x: xx,
            y: yy,
            busyAge: 0,
            spotIndex: i,
            isEdge,
            field,
          });
          i++;
        }
      }
      return { grid, gridMaxIndex: i, gridSteps };
    };

    const setupState = () => {
      const rect = canvas.getBoundingClientRect();
      // Cap at 1.5 (was 2). On 2x/3x retina, this halves the canvas
      // pixel count vs a 2x cap — massive fillRect cost reduction with
      // no perceptible quality loss on strokes 1.4 px wide.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { grid, gridMaxIndex, gridSteps } = buildGrid();

      // Initial fully-opaque theme-background fill so we don't see the
      // browser default (which would be black in dark mode, white in
      // light — either way, not aligned with the section behind).
      ctx.fillStyle = `rgb(${palette.fadeRgb})`;
      ctx.fillRect(0, 0, rect.width, rect.height);

      return {
        w: rect.width,
        h: rect.height,
        xC: rect.width / 2,
        yC: rect.height / 2,
        grid,
        gridMaxIndex,
        gridSteps,
        particles: [],
        stepCount: 0,
      };
    };

    const dataToCanvas = (state, x, y) => ({
      x: state.xC + x * CONFIG.zoom,
      y: state.yC + y * CONFIG.zoom,
    });

    const birth = (state) => {
      const idx = Math.floor(Math.random() * state.gridMaxIndex);
      const spot = state.grid[idx];
      const p = palette;
      state.particles.push({
        // Slight per-particle hue jitter (±4°) so the swarm feels alive
        // without ever drifting off brand.
        hue: p.hue + (Math.random() * 8 - 4),
        // Sat + lum bands are pulled from CSS custom properties — they
        // shift automatically between dark and light themes (light theme
        // uses darker particles so they read against a cream background).
        sat: p.satMin + Math.floor(Math.random() * (p.satMax - p.satMin)),
        lum: p.lumMin + Math.floor(Math.random() * (p.lumMax - p.lumMin)),
        x: spot.x,
        y: spot.y,
        xLast: spot.x,
        yLast: spot.y,
        xSpeed: 0,
        ySpeed: 0,
        age: 0,
        ageSinceStuck: 0,
        attractor: { oldIndex: idx, gridSpotIndex: idx },
        dead: false,
      });
    };

    const move = (state) => {
      const parts = state.particles;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p.dead) continue;

        p.xLast = p.x;
        p.yLast = p.y;

        let index = p.attractor.gridSpotIndex;
        let gridSpot = state.grid[index];

        if (Math.random() < 0.5) {
          if (!gridSpot.isEdge) {
            const top = state.grid[index - 1];
            const bot = state.grid[index + 1];
            const left = state.grid[index - state.gridSteps];
            const right = state.grid[index + state.gridSteps];

            // maxBy(field + chaos*rand) across 4 neighbours
            let best = top;
            let bestVal = top.field + CONFIG.chaos * Math.random();
            let v = bot.field + CONFIG.chaos * Math.random();
            if (v > bestVal) {
              best = bot;
              bestVal = v;
            }
            v = left.field + CONFIG.chaos * Math.random();
            if (v > bestVal) {
              best = left;
              bestVal = v;
            }
            v = right.field + CONFIG.chaos * Math.random();
            if (v > bestVal) {
              best = right;
              bestVal = v;
            }

            if (best.busyAge === 0 || best.busyAge > 15) {
              p.ageSinceStuck = 0;
              p.attractor.oldIndex = index;
              p.attractor.gridSpotIndex = best.spotIndex;
              gridSpot = best;
              gridSpot.busyAge = 1;
            } else {
              p.ageSinceStuck++;
            }
          } else {
            p.ageSinceStuck++;
          }
          if (p.ageSinceStuck >= 10) p.dead = true;
        }

        // Spring + viscosity toward attractor
        const dx = p.x - gridSpot.x;
        const dy = p.y - gridSpot.y;
        p.xSpeed = (p.xSpeed - CONFIG.spring * dx) * CONFIG.viscosity;
        p.ySpeed = (p.ySpeed - CONFIG.spring * dy) * CONFIG.viscosity;
        p.x += CONFIG.stepScale * p.xSpeed;
        p.y += CONFIG.stepScale * p.ySpeed;

        p.age++;
        if (p.age > CONFIG.lifespan) p.dead = true;
      }

      // Cull dead — filter is fast at N ≤ 80
      if (parts.some((p) => p.dead)) {
        state.particles = parts.filter((p) => !p.dead);
      }
    };

    const draw = (state) => {
      // Fade previous frame — colour drains toward the current theme's
      // background (black in dark mode, cream in light mode) so trails
      // dissolve naturally into the section behind them.
      ctx.fillStyle = `rgba(${palette.fadeRgb}, ${CONFIG.fadeAlpha})`;
      ctx.fillRect(0, 0, state.w, state.h);

      const parts = state.particles;
      ctx.lineWidth = CONFIG.particleWidth;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const h = p.hue + state.stepCount * CONFIG.hueDriftPerFrame;
        const style = `hsla(${h}, ${p.sat}%, ${p.lum}%, ${palette.alpha})`;
        ctx.strokeStyle = style;
        ctx.fillStyle = style;

        const last = dataToCanvas(state, p.xLast, p.yLast);
        const now = dataToCanvas(state, p.x, p.y);
        const attracSpot = state.grid[p.attractor.gridSpotIndex];
        const attrac = dataToCanvas(state, attracSpot.x, attracSpot.y);
        const oldSpot = state.grid[p.attractor.oldIndex];
        const oldAttrac = dataToCanvas(state, oldSpot.x, oldSpot.y);

        // Particle trail segment
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(now.x, now.y);
        ctx.stroke();

        // Attractor migration line + tiny arc — the "structure" trace
        ctx.beginPath();
        ctx.moveTo(oldAttrac.x, oldAttrac.y);
        ctx.lineTo(attrac.x, attrac.y);
        ctx.arc(attrac.x, attrac.y, 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
      }
    };

    const evolve = () => {
      const state = stateRef.current;
      if (!state) return;
      state.stepCount++;

      // Age busy grid spots (wall-fade timer)
      const grid = state.grid;
      for (let i = 0; i < grid.length; i++) {
        if (grid[i].busyAge > 0) grid[i].busyAge++;
      }

      if (
        state.stepCount % CONFIG.birthFreq === 0 &&
        state.particles.length + 1 < CONFIG.maxPop
      ) {
        birth(state);
      }
      move(state);
      draw(state);
    };

    // Throttle canvas draws to CONFIG.drawFps. rAF still schedules at
    // display rate; we skip evolve() on non-draw ticks. The particle
    // physics steps in 1:1 with drawn frames, so slowing the draw rate
    // slows the physics simulation identically — no lag, just a smoother
    // apparent motion. 60→30 fps roughly halves the canvas cost while
    // remaining visually indistinguishable for slow-orbiting trails.
    const drawInterval = 1000 / CONFIG.drawFps;
    let lastDraw = 0;
    const tick = (t) => {
      if (!runningRef.current) return;
      if (t - lastDraw >= drawInterval) {
        lastDraw = t;
        evolve();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      if (reduced) {
        // Static frame — seed ~30 particles and paint once, no rAF
        const state = stateRef.current;
        for (let i = 0; i < 30; i++) birth(state);
        move(state);
        draw(state);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const stop = () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };

    stateRef.current = setupState();

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    // Theme change → re-read the palette; drop-fade transitions through
    // ~1 second so trails naturally recolour without a hard cut.
    const onThemeChange = () => {
      palette = readPalette();
    };
    window.addEventListener("theme-change", onThemeChange);

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasRunning = runningRef.current;
        stop();
        stateRef.current = setupState();
        if (wasRunning || reduced) start();
      }, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("theme-change", onThemeChange);
      clearTimeout(resizeTimer);
      stop();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-hero-backdrop
      className="absolute inset-6 h-[calc(100%-3rem)] w-[calc(100%-3rem)] md:inset-10 md:h-[calc(100%-5rem)] md:w-[calc(100%-5rem)]"
    />
  );
}
