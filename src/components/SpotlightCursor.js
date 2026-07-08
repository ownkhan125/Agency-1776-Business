"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/animations/register";

/**
 * Spotlight — a subtle radial red halo that follows the cursor at
 * pointer speed (no lerp). Designed to sit UNDER the existing Cursor
 * component so both effects composite together without any interaction
 * (no shared refs, no shared listeners).
 *
 * Perf:
 *   • single fixed div, single radial gradient — no canvas, no rAF loop
 *   • position is written straight to `element.style.transform` on
 *     `mousemove` — no GSAP lerp on x/y, so the halo never lags behind
 *     the cursor on fast moves, hover-jumps, or accordion clicks
 *   • variant SCALE is the ONLY animated property (GSAP quickTo, 0.4 s)
 *     so hover transitions between link → button → card feel premium,
 *     while position stays snapped to the pointer
 *   • pointer-events: none — never intercepts input
 *   • suppressed on touch and reduced-motion (same criteria as Cursor)
 */

const VARIANT_SCALE = {
  default: 1,
  link: 1.15,
  button: 1.35,
  card: 1.55,
  media: 1.6,
  text: 0.85,
  close: 1.25,
};

export default function SpotlightCursor() {
  const ref = useRef(null);
  const variantRef = useRef("default");

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const noHover = window.matchMedia("(hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (noHover || reduced) return;

    registerGsap();
    const el = ref.current;
    if (!el) return;

    // State captured in closure. Declared BEFORE the writers/tweens
    // that reference them so there's no temporal-dead-zone hazard when
    // an onUpdate fires between events.
    const state = { x: 0, y: 0, scale: 1 };
    let firstMove = true;

    // Writes the current state to the compositor in a single transform:
    // translate3d for GPU-promoted position + centering shift + scale.
    const write = () => {
      el.style.transform =
        `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) scale(${state.scale})`;
    };

    // Prime opacity + centering; transform is set imperatively above.
    gsap.set(el, { opacity: 0 });
    write();

    // Scale still lerps softly — variant transitions read as premium
    // when the halo grows into a card / button / media, not snapped.
    // Position is snapped separately via write() on every event.
    const scaleTo = gsap.quickTo(state, "scale", {
      duration: 0.4,
      ease: "power3.out",
      onUpdate: write,
    });

    const onMove = (e) => {
      state.x = e.clientX;
      state.y = e.clientY;
      write();
      if (firstMove) {
        firstMove = false;
        gsap.to(el, { opacity: 1, duration: 0.5, ease: "power2.out" });
      }
    };

    const resolveVariant = (target) => {
      if (!target || target.nodeType !== 1) return "default";
      const explicit = target.closest("[data-cursor]");
      if (explicit) {
        const val = explicit.getAttribute("data-cursor");
        if (val && val in VARIANT_SCALE) return val;
      }
      if (target.closest("button, [role='button'], [data-cta]")) return "button";
      if (target.closest("a")) return "link";
      if (
        target.closest(
          "input[type='text'], input[type='email'], input[type='search'], textarea, [contenteditable='true']"
        )
      )
        return "text";
      if (target.closest("article, figure, img, video")) return "card";
      return "default";
    };

    const onOver = (e) => {
      const next = resolveVariant(e.target);
      if (next === variantRef.current) return;
      variantRef.current = next;
      scaleTo(VARIANT_SCALE[next] ?? 1);
    };

    const onLeaveWin = () =>
      gsap.to(el, { opacity: 0, duration: 0.3, ease: "power2.out" });
    const onEnterWin = () =>
      gsap.to(el, { opacity: 1, duration: 0.3, ease: "power2.out" });

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeaveWin);
    document.documentElement.addEventListener("mouseenter", onEnterWin);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeaveWin);
      document.documentElement.removeEventListener("mouseenter", onEnterWin);
      gsap.killTweensOf(el);
      gsap.killTweensOf(state);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-spotlight-cursor
      // z-[299] sits UNDER the main Cursor (z-[300]) but above every
      // page-level content layer. mix-blend-mode keeps the light from
      // washing out the accent red and preserves readability of the
      // text underneath.
      className="pointer-events-none fixed left-0 top-0 z-[299] h-[360px] w-[360px] will-change-transform"
      style={{
        background:
          "radial-gradient(closest-side, rgba(191,10,48,0.28), rgba(191,10,48,0.10) 40%, rgba(191,10,48,0) 72%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
