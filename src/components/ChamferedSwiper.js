"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { gsap, registerGsap } from "@/animations/register";
import { cn } from "@/utils/cn";

/**
 * ChamferedSwiper — a horizontal card rail with a stacked-peek layout.
 *
 * Interaction language (deliberately distinct from generic Swiper JS):
 *
 *   • The active card sits fully forward at scale 1 with a chamfered
 *     accent border. The next 2 cards on either side "peek" as
 *     dimmed chamfered slabs at scale 0.9 / 0.82, with progressively
 *     lower opacity. This gives a physical-stack feel — like flipping
 *     through printed process cards on a shelf.
 *   • Dragging the rail applies a 3D perspective tilt (rotateY) via
 *     GSAP quickTo, so the whole stack banks into the drag direction.
 *     Release → GSAP momentum decays back to identity while snapping
 *     to the nearest card index.
 *   • A chamfered "range strip" progress indicator at the bottom
 *     shows current / total, with GSAP tweening the fill on each
 *     index change. Prev/next chevrons are chamfered pills that read
 *     as sibling of the site's CTA button, not stock arrows.
 *
 * The swiper handles its own input; caller renders any React node per
 * slide via a `slides` array. The wrapper is fully static in SSR
 * (index 0 rendered normally) — motion only attaches after mount.
 *
 * Zero GSAP conflicts: the two GSAP tweens created here (perspective
 * tilt + progress fill) are on element references owned by this
 * component and reverted via `gsap.context` on unmount.
 */
export default function ChamferedSwiper({
  slides = [],
  eyebrow,
  className,
  cardClassName,
  ariaLabel = "Content carousel",
}) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const trackRef = useRef(null);
  const railRef = useRef(null);
  const progressRef = useRef(null);
  const tiltTweenRef = useRef(null);
  const dragX = useMotionValue(0);

  // Card width AND measured track width, both held in state so a resize
  // triggers a full re-layout of the rail. Previously trackWidth was read
  // inline inside useMemo — that only re-ran when `cardWidth` changed, so
  // a viewport resize that kept the same card ratio (rare but possible)
  // could leave the rail pinned to a stale gutter.
  const [cardWidth, setCardWidth] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const el = trackRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.getBoundingClientRect().width;
      if (!w) return;
      // Card = 72% of track on desktop, 82% on tablet, 90% on mobile
      const ratio = w >= 1024 ? 0.72 : w >= 700 ? 0.82 : 0.9;
      setTrackWidth(w);
      setCardWidth(Math.round(w * ratio));
    };
    compute();
    // ResizeObserver on the actual track element — catches container-driven
    // resizes (parent flex/grid changes) that `window.resize` misses.
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, []);

  // Bank the rail into the drag direction via GSAP quickTo.
  useEffect(() => {
    if (!railRef.current) return;
    registerGsap();
    const ctx = gsap.context(() => {
      tiltTweenRef.current = gsap.quickTo(railRef.current, "rotationY", {
        duration: 0.35,
        ease: "power3.out",
      });
    }, railRef);
    return () => ctx.revert();
  }, []);

  // Tween the progress bar fill on every index change.
  useEffect(() => {
    if (!progressRef.current || !total) return;
    registerGsap();
    const pct = ((index + 1) / total) * 100;
    gsap.to(progressRef.current, {
      width: `${pct}%`,
      duration: 0.55,
      ease: "power3.out",
    });
  }, [index, total]);

  const goTo = (i) => setIndex(Math.max(0, Math.min(total - 1, i)));

  const onDrag = (_, info) => {
    // Bank the rail 0.03 deg per pixel of horizontal drag, capped ±10.
    const tilt = Math.max(-10, Math.min(10, info.offset.x * 0.03));
    tiltTweenRef.current?.(-tilt); // negative so a right-drag banks the right edge back
  };
  const onDragEnd = (_, info) => {
    // Snap to the nearest index based on drag distance + velocity. A fling
    // (|velocity| > 400 px/s) with any offset in that direction counts as
    // an intentional slide change even if the offset is under threshold.
    const threshold = cardWidth * 0.18;
    const fling = Math.abs(info.velocity.x) > 400 ? Math.sign(info.velocity.x) : 0;
    let next = index;
    if (info.offset.x < -threshold || fling < 0) next = index + 1;
    else if (info.offset.x > threshold || fling > 0) next = index - 1;
    goTo(next);
    tiltTweenRef.current?.(0);
  };

  const railX = useMemo(() => {
    if (!cardWidth || !trackWidth) return 0;
    const gutter = (trackWidth - cardWidth) / 2;
    return gutter - index * cardWidth;
  }, [index, cardWidth, trackWidth]);

  return (
    <section
      aria-label={ariaLabel}
      className={cn("relative", className)}
    >
      {eyebrow && (
        <div className="mb-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-accent">
            <span className="inline-block h-1.5 w-1.5 bg-accent" />
            {eyebrow}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/40">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </div>
        </div>
      )}

      <div
        ref={trackRef}
        className="relative overflow-hidden"
        style={{ perspective: "1400px" }}
      >
        <motion.div
          ref={railRef}
          drag="x"
          // Free 1:1 pointer tracking. The previous config —
          // `dragElastic:0.12` + `dragConstraints:{left:0, right:0}` —
          // clamped visual drag to 12 % of the finger's real offset,
          // so the rail felt dead even though onDragEnd's threshold
          // still fired (it reads raw `info.offset.x`). No constraints
          // means motion lets the rail follow the finger, and
          // `dragMomentum:false` stops it dead on release so
          // `animate={x: railX}` cleanly tweens to the new index
          // without fighting inertia.
          dragMomentum={false}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          animate={{ x: railX }}
          transition={{ type: "spring", stiffness: 240, damping: 32, mass: 0.7 }}
          style={{
            x: dragX,
            display: "flex",
            gap: 0,
            cursor: "grab",
            transformStyle: "preserve-3d",
            // Allow vertical page scroll to pass through the rail while
            // horizontal gestures still drag the carousel. Without this,
            // mobile users get their scroll hijacked as soon as their
            // finger touches the rail.
            touchAction: "pan-y",
          }}
          whileTap={{ cursor: "grabbing" }}
          data-cursor="card"
        >
          {slides.map((slide, i) => (
            <Slide
              key={i}
              index={i}
              activeIndex={index}
              width={cardWidth}
              className={cardClassName}
            >
              {slide}
            </Slide>
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <ChevBtn dir="prev" disabled={index === 0} onClick={() => goTo(index - 1)} />
          <ChevBtn dir="next" disabled={index === total - 1} onClick={() => goTo(index + 1)} />
        </div>

        {/* Chamfered range strip */}
        <div className="flex flex-1 items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.28em] text-foreground/40">
            Progress
          </span>
          <div
            className="chamfer chamfer-xs relative h-2 flex-1 overflow-hidden"
            style={{
              "--chamfer-border-color":
                "color-mix(in srgb, var(--muted) 60%, transparent)",
              "--chamfer-bg": "color-mix(in srgb, var(--muted) 25%, transparent)",
            }}
          >
            <div
              ref={progressRef}
              className="absolute inset-y-0 left-0 bg-accent"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Dot ladder */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Slide selector">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              data-cursor="button"
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 transition-[width,background-color] duration-500",
                i === index ? "w-8 bg-accent" : "w-3 bg-foreground/25 hover:bg-foreground/45"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Slide({ index, activeIndex, width, className, children }) {
  const distance = index - activeIndex;
  const abs = Math.abs(distance);
  // Depth-of-field style peek: active is prominent, neighbours dim and
  // scale down, farther slides are near-invisible so the eye locks on
  // the active card without them being fully hidden.
  const scale = abs === 0 ? 1 : abs === 1 ? 0.9 : 0.82;
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.55 : 0.2;
  const rotY = distance === 0 ? 0 : distance > 0 ? -6 : 6;

  return (
    <motion.div
      role="group"
      aria-roledescription="slide"
      aria-hidden={index !== activeIndex}
      className={cn("relative shrink-0 px-3 md:px-5", className)}
      style={{ width, transformStyle: "preserve-3d" }}
      animate={{ scale, opacity, rotateY: rotY }}
      transition={{ type: "spring", stiffness: 240, damping: 32, mass: 0.7 }}
    >
      {children}
    </motion.div>
  );
}

function ChevBtn({ dir, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      data-cursor="button"
      className={cn(
        "chamfer chamfer-xs relative inline-flex h-11 w-11 items-center justify-center text-foreground outline-none transition-opacity",
        disabled ? "cursor-not-allowed opacity-30" : "hover:text-accent"
      )}
      style={{
        "--chamfer-border-color":
          "color-mix(in srgb, var(--muted) 60%, transparent)",
        "--chamfer-bg": "var(--background)",
      }}
    >
      <svg
        aria-hidden
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className={cn("relative z-10", dir === "prev" && "rotate-180")}
      >
        <path
          d="M2 6h8m0 0L6 2m4 4L6 10"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}
