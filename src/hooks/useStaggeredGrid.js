"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/animations/register";

/**
 * Column-cascade staggered grid reveal — adapts vengenceui's shadcn
 * "staggered-grid" motion to GSAP timelines inside the studio's
 * ScrollSmoother stack:
 *
 *   items grouped by [data-col]  →  each column tween starts at
 *   `|col - middle| * delayPerCol` on ONE shared timeline that fires
 *   the instant the grid crosses the viewport bottom
 *
 * The timeline is INTENTIONALLY not scroll-scrubbed: scrub required
 * the grid to reach `end: "center center"`, which is physically
 * unreachable for the Footer (last element on the page — the page
 * cannot scroll far enough for the Footer center to hit viewport
 * center). Fixed-duration playback lets the Footer keycaps land
 * naturally the moment the board enters view, and lets content
 * sections finish assembling well before they reach 70–80 % visibility.
 *
 * Cards enter from `yPercent: 220` with `autoAlpha: 0`. Middle
 * columns arrive first; outer columns ripple out with `delayPerCol`
 * spacing. Total cascade is <1.2 s regardless of scroll speed.
 *
 * Single ScrollTrigger per hook instance; `gsap.context.revert()`
 * cleans up on unmount so remount can never accumulate triggers.
 */
export function useStaggeredGrid({
  itemSelector = "[data-stagger-item]",
  start = "top 92%",
  yPercent = 200,
  duration = 0.7,
  delayPerCol = 0.09,
  ease = "power3.out",
  toggleActions = "play none none reverse",
  // When true, the trigger fires once and disables itself. Used by the
  // Footer so its keycaps never revert on scroll-up and never reset
  // when PageTransition calls `ScrollTrigger.refresh(true)` after a
  // route change — both scenarios were leaving the keycaps stuck at
  // their initial hidden state (yPercent 200, autoAlpha 0).
  once = false,
} = {}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    registerGsap();
    const gridEl = ref.current;

    const ctx = gsap.context(() => {
      const items = Array.from(gridEl.querySelectorAll(itemSelector));
      if (!items.length) return;

      // Group by data-col (falls back to index-mod-columns if missing).
      const columns = new Map();
      items.forEach((item, i) => {
        const col = parseInt(item.dataset.col ?? String(i), 10);
        if (!columns.has(col)) columns.set(col, []);
        columns.get(col).push(item);
      });

      const colKeys = Array.from(columns.keys()).sort((a, b) => a - b);
      const middleCol = (colKeys[colKeys.length - 1] + colKeys[0]) / 2;

      // Initial: cards below their final position, fully invisible.
      gsap.set(items, { yPercent, autoAlpha: 0 });

      // ONE timeline + ONE ScrollTrigger for the whole grid.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: gridEl,
          start,
          toggleActions,
          once,
        },
      });

      colKeys.forEach((colKey) => {
        const colItems = columns.get(colKey);
        const delay = Math.abs(colKey - middleCol) * delayPerCol;
        tl.to(
          colItems,
          {
            yPercent: 0,
            autoAlpha: 1,
            ease,
            duration,
          },
          delay
        );
      });
    }, gridEl);

    return () => ctx.revert();
  }, [itemSelector, start, yPercent, duration, delayPerCol, ease, toggleActions, once]);

  return ref;
}
