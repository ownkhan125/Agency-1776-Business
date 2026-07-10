"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/animations/register";

/**
 * Square-frame + chamfered triangle cursor with premium motion.
 *
 * DOM (two nested transform layers so scale-based effects never fight):
 *   mainRef  → position (quickTo lerp) · variant width/height · color ·
 *              velocity-driven scaleX/scaleY (stretch) · rotation (tilt)
 *   breathRef → idle breathing (yoyo scale pulse) · click compression
 *
 * Motion behaviours:
 *   · Soft-follow lerp on position (0.28s power3)
 *   · Velocity stretch — cursor elongates along dominant motion axis and
 *     slightly compresses on the perpendicular, decaying back to 1/1
 *   · Velocity tilt — up to ±3° based on horizontal speed
 *   · Idle breathing — after ~750 ms with no movement, breathRef scales
 *     between 1.0 and 1.035 on a slow sine yoyo
 *   · Auto-settle — before breathing engages, velocity transforms ease
 *     back to identity so the resting cursor is centred on its true
 *     pointer position
 *   · Magnetic pull — main frame drifts ~32% toward hovered magnetic
 *     element's bounding-box centre
 *   · State morph — width/height/color/triangle rotation/rect stroke +
 *     fill all tweened with power3.out on variant change
 *
 * Suppressed on touch or reduced-motion. Adds `cursor-none-root` class
 * on <html> so global CSS hides the native cursor only under the same
 * media query.
 */

// Each variant carries `xOpacity` (close-X icon) and `eyeOpacity` (view
// eye icon). Non-icon variants set both to 0. Only ONE glyph is shown
// per state at any time — the triangle, the X, or the eye — resolved
// by the three opacity fields below.
const VARIANTS = {
  default: {
    w: 50,
    h: 50,
    color: "var(--foreground)",
    triRot: 0,
    triScale: 1,
    triOpacity: 1,
    xOpacity: 0,
    eyeOpacity: 0,
    rectStroke: 1,
    rectFill: 0,
  },
  link: {
    w: 50,
    h: 50,
    color: "var(--accent)",
    triRot: 0,
    triScale: 1,
    triOpacity: 1,
    xOpacity: 0,
    eyeOpacity: 0,
    rectStroke: 1,
    rectFill: 0,
  },
  button: {
    w: 92,
    h: 92,
    color: "var(--accent)",
    triRot: 90,
    triScale: 1.1,
    triOpacity: 1,
    xOpacity: 0,
    eyeOpacity: 0,
    rectStroke: 1,
    rectFill: 0,
  },
  card: {
    w: 125,
    h: 125,
    color: "var(--foreground)",
    triRot: 0,
    triScale: 1.2,
    triOpacity: 1,
    xOpacity: 0,
    eyeOpacity: 0,
    rectStroke: 1,
    rectFill: 0,
  },
  media: {
    w: 152,
    h: 152,
    color: "var(--accent)",
    triRot: 90,
    triScale: 1.3,
    triOpacity: 1,
    xOpacity: 0,
    eyeOpacity: 0,
    rectStroke: 1,
    rectFill: 0,
  },
  text: {
    w: 4,
    h: 42,
    color: "var(--foreground)",
    triRot: 0,
    triScale: 1,
    triOpacity: 0,
    xOpacity: 0,
    eyeOpacity: 0,
    rectStroke: 0,
    rectFill: 1,
  },
  // "Click to close" affordance — used when the pointer is over the
  // modal backdrop (data-cursor="close"). Frame stays chamfered/clean,
  // triangle fades out, and a crisp X materialises in the middle.
  close: {
    w: 110,
    h: 110,
    color: "var(--accent)",
    triRot: 0,
    triScale: 1,
    triOpacity: 0,
    xOpacity: 1,
    eyeOpacity: 0,
    rectStroke: 1,
    rectFill: 0,
  },
  // "View project" affordance — used when the pointer is over a
  // portfolio card that navigates to a case detail page. Frame widens
  // to the media/card scale, triangle fades out, eye glyph fades in.
  // Colour stays foreground (not accent) so the eye reads as a neutral
  // "look inside" signal rather than a call-to-action.
  view: {
    w: 118,
    h: 118,
    color: "var(--foreground)",
    triRot: 0,
    triScale: 1,
    triOpacity: 0,
    xOpacity: 0,
    eyeOpacity: 1,
    rectStroke: 1,
    rectFill: 0,
  },
};

const IDLE_DELAY_MS = 750;
const BREATH_START_DELAY = 0.35;
const BREATH_DURATION = 2.4;
const BREATH_SCALE = 1.035;
const MAG_STRENGTH = 0.32;
const MAX_VEL = 22;         // px/frame equivalent considered "fast"
const MAX_STRETCH = 0.07;   // 1 → 1.07 stretch along dominant axis
const MAX_COMPRESS = 0.03;  // 1 → 0.97 compression on perpendicular
const MAX_TILT = 3;         // degrees

export default function Cursor() {
  const mainRef = useRef(null);
  const breathRef = useRef(null);
  const rectRef = useRef(null);
  const triRef = useRef(null);
  const xRef = useRef(null);
  const eyeRef = useRef(null);
  const stateRef = useRef({ variant: "default" });
  const magneticRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    registerGsap();

    const noHover = window.matchMedia("(hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (noHover || reduced) return;

    document.documentElement.classList.add("cursor-none-root");

    const main = mainRef.current;
    const breath = breathRef.current;
    const rect = rectRef.current;
    const tri = triRef.current;
    const xIcon = xRef.current;
    const eyeIcon = eyeRef.current;
    if (!main || !breath || !rect || !tri || !xIcon || !eyeIcon) return;

    gsap.set(main, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(tri, { transformOrigin: "50% 50%" });
    gsap.set(xIcon, { transformOrigin: "50% 50%", opacity: 0 });
    gsap.set(eyeIcon, { transformOrigin: "50% 50%", opacity: 0, scale: 0.85 });
    gsap.set(breath, { transformOrigin: "50% 50%", scale: 1 });

    // Position lerp
    const posX = gsap.quickTo(main, "x", { duration: 0.28, ease: "power3" });
    const posY = gsap.quickTo(main, "y", { duration: 0.28, ease: "power3" });
    // Velocity-driven transforms — slightly longer lerp for inertia feel
    const sxTo = gsap.quickTo(main, "scaleX", { duration: 0.45, ease: "power2.out" });
    const syTo = gsap.quickTo(main, "scaleY", { duration: 0.45, ease: "power2.out" });
    const rotTo = gsap.quickTo(main, "rotation", { duration: 0.5, ease: "power2.out" });

    let idleTimer = null;
    let breathingActive = false;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let firstMove = true;

    const settleVelocityToIdentity = () => {
      sxTo(1);
      syTo(1);
      rotTo(0);
    };

    const stopBreathing = () => {
      if (!breathingActive) return;
      breathingActive = false;
      gsap.killTweensOf(breath);
      gsap.to(breath, {
        scale: 1,
        duration: 0.35,
        ease: "power2.out",
      });
    };

    const startBreathing = () => {
      settleVelocityToIdentity();
      breathingActive = true;
      gsap.to(breath, {
        scale: BREATH_SCALE,
        duration: BREATH_DURATION,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: BREATH_START_DELAY,
      });
    };

    const scheduleIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(startBreathing, IDLE_DELAY_MS);
    };

    const onMove = (e) => {
      const t = performance.now();

      // Velocity from previous sample — skipped on the very first event
      // and after a long pause so we don't get a spurious huge delta.
      if (lastT !== 0 && t - lastT < 120) {
        const dt = Math.max(1, t - lastT);
        const vx = ((e.clientX - lastX) / dt) * 16;
        const vy = ((e.clientY - lastY) / dt) * 16;
        const absVx = Math.abs(vx);
        const absVy = Math.abs(vy);

        // Elongate along the dominant motion axis, subtly compress the
        // perpendicular so the cursor reads as being pulled through
        // space rather than growing.
        let targetSX;
        let targetSY;
        if (absVx >= absVy) {
          const s = Math.min(absVx / MAX_VEL, 1);
          targetSX = 1 + s * MAX_STRETCH;
          targetSY = 1 - s * MAX_COMPRESS;
        } else {
          const s = Math.min(absVy / MAX_VEL, 1);
          targetSY = 1 + s * MAX_STRETCH;
          targetSX = 1 - s * MAX_COMPRESS;
        }
        const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, vx * 0.05));

        sxTo(targetSX);
        syTo(targetSY);
        rotTo(tilt);
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = t;

      // Magnetic pull — bias the target toward the magnetic element's
      // centre while leaving the true pointer velocity untouched.
      let mx = e.clientX;
      let my = e.clientY;
      const mag = magneticRef.current;
      if (mag) {
        const r = mag.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        mx = e.clientX + (cx - e.clientX) * MAG_STRENGTH;
        my = e.clientY + (cy - e.clientY) * MAG_STRENGTH;
      }
      posX(mx);
      posY(my);

      if (firstMove) {
        firstMove = false;
        gsap.to(main, { opacity: 1, duration: 0.35, ease: "power2.out" });
      }

      stopBreathing();
      scheduleIdle();
    };

    const setVariant = (variant) => {
      if (stateRef.current.variant === variant) return;
      stateRef.current.variant = variant;
      const v = VARIANTS[variant] || VARIANTS.default;
      gsap.to(main, {
        width: v.w,
        height: v.h,
        color: v.color,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(tri, {
        rotation: v.triRot,
        scale: v.triScale,
        opacity: v.triOpacity,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(xIcon, {
        opacity: v.xOpacity,
        // Subtle scale pop on show → 1.0 in — reads as a click affordance.
        scale: v.xOpacity > 0 ? 1 : 0.85,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(eyeIcon, {
        opacity: v.eyeOpacity,
        // Same subtle scale pop as the X — reads as a lens focusing in.
        scale: v.eyeOpacity > 0 ? 1 : 0.85,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(rect, {
        fillOpacity: v.rectFill,
        strokeOpacity: v.rectStroke,
        duration: 0.3,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const resolveVariant = (el) => {
      if (!el) return "default";
      const explicit = el.closest("[data-cursor]");
      if (explicit) {
        const val = explicit.getAttribute("data-cursor");
        if (val) return val;
      }
      if (el.closest("button, [role='button'], [data-cta]")) return "button";
      if (el.closest("a")) return "link";
      if (
        el.closest(
          "input[type='text'], input[type='email'], input[type='search'], textarea, [contenteditable='true']"
        )
      ) {
        return "text";
      }
      if (el.closest("article, figure, img, video")) return "card";
      return "default";
    };

    const resolveMagnetic = (el) => {
      if (!el) return null;
      return el.closest(
        "[data-cursor-magnetic], button, [data-cta], [role='button']"
      );
    };

    const onOver = (e) => {
      setVariant(resolveVariant(e.target));
      magneticRef.current = resolveMagnetic(e.target);
    };
    const onOut = (e) => {
      if (magneticRef.current && !magneticRef.current.contains(e.relatedTarget)) {
        magneticRef.current = null;
      }
    };
    const onDown = () =>
      gsap.to(breath, {
        scale: 0.86,
        duration: 0.15,
        ease: "power2.out",
        overwrite: "auto",
      });
    const onUp = () =>
      gsap.to(breath, {
        scale: 1,
        duration: 0.28,
        ease: "power3.out",
        overwrite: "auto",
      });
    const onLeaveWin = () =>
      gsap.to(main, { opacity: 0, duration: 0.2, overwrite: "auto" });
    const onEnterWin = () =>
      gsap.to(main, { opacity: 1, duration: 0.2, overwrite: "auto" });

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeaveWin);
    document.documentElement.addEventListener("mouseenter", onEnterWin);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeaveWin);
      document.documentElement.removeEventListener("mouseenter", onEnterWin);
      document.documentElement.classList.remove("cursor-none-root");
      clearTimeout(idleTimer);
      gsap.killTweensOf(main);
      gsap.killTweensOf(breath);
      gsap.killTweensOf(rect);
      gsap.killTweensOf(tri);
      gsap.killTweensOf(xIcon);
      gsap.killTweensOf(eyeIcon);
    };
  }, []);

  return (
    <div
      ref={mainRef}
      aria-hidden
      data-cursor-main
      // z-[300] sits ABOVE the ProjectModal overlay (z-[200]) so the
      // custom cursor keeps rendering over the backdrop and panel
      // rather than being covered by the modal's backdrop-blur layer.
      // Still under browser chrome — remains pointer-events:none.
      className="pointer-events-none fixed left-0 top-0 z-[300] will-change-transform"
      style={{
        width: 50,
        height: 50,
        color: "var(--foreground)",
      }}
    >
      <div
        ref={breathRef}
        className="pointer-events-none h-full w-full will-change-transform"
      >
        <svg
          viewBox="0 0 32 32"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ overflow: "visible" }}
        >
          {/*
            Outer frame in every state except `text` — where its stroke
            fades out and its fill fades in to become a solid I-beam.
            Inset by 0.5 with a 1-unit stroke so the outline sits inside
            the SVG bounds regardless of container size.
          */}
          <rect
            ref={rectRef}
            x="0.5"
            y="0.5"
            width="31"
            height="31"
            fill="currentColor"
            fillOpacity="0"
            stroke="currentColor"
            strokeOpacity="1"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/*
            Triangle drawn as three disconnected line segments so the
            base does not touch the two sides — symmetric gap at the
            bottom-left and bottom-right corners. Peak stays sharp.
          */}
          <g ref={triRef}>
            <line
              x1="16"
              y1="10"
              x2="10"
              y2="21"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="16"
              y1="10"
              x2="22"
              y2="21"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="10.5"
              y1="22"
              x2="21.5"
              y2="22"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
              vectorEffect="non-scaling-stroke"
            />
          </g>
          {/*
            X — "click to close" icon. Hidden by default (opacity 0) and
            faded in only when the `close` variant is active. Two crossed
            lines centered on the same origin the triangle uses so the
            morph reads as a swap, not a shift. `vectorEffect="non-
            scaling-stroke"` keeps the stroke crisp at the ~2.2× scale
            the close variant renders at.
          */}
          <g ref={xRef}>
            <line
              x1="10"
              y1="10"
              x2="22"
              y2="22"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="22"
              y1="10"
              x2="10"
              y2="22"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
              vectorEffect="non-scaling-stroke"
            />
          </g>
          {/*
            Eye — "view this project" icon. Hidden by default (opacity 0)
            and faded in only when the `view` variant is active. Almond
            outline + centred pupil, drawn as two symmetric quadratic
            curves so the glyph reads at the ~2.4× scale the view
            variant renders at. Same 32x32 origin as the triangle + X so
            all three icons swap without a positional shift.
          */}
          <g ref={eyeRef}>
            <path
              d="M8 16 Q 16 9 24 16 Q 16 23 8 16 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx="16"
              cy="16"
              r="2.5"
              fill="currentColor"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
