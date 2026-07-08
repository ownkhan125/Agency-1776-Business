"use client";

import { useLayoutEffect, useRef } from "react";
import {
  gsap,
  registerGsap,
  ScrollSmoother,
  ScrollTrigger,
} from "@/animations/register";

/**
 * GSAP-only smooth scrolling wrapper.
 *
 * Structure:
 *   #smooth-wrapper > #smooth-content > (children)
 *
 * Fixed elements (top-bar, nav, cursor) must live OUTSIDE this wrapper so
 * their `position: fixed` isn't affected by the transformed content.
 *
 * We expose the smoother on `window.__smoother__` so anchor clicks can call
 * `smoother.scrollTo(el, true, 'top 100px')`.
 */
export default function SmoothScroll({ children }) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;
    registerGsap();

    // Bail on reduced-motion or touch devices — native scroll is preferable.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia?.("(hover: none)").matches;

    if (prefersReduced || isTouch) return;

    let smoother;
    const ctx = gsap.context(() => {
      smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.1,
        effects: false,
        normalizeScroll: true,
        ignoreMobileResize: true,
      });
      if (typeof window !== "undefined") {
        window.__smoother__ = smoother;
      }
      // Refresh any pre-existing ScrollTriggers so they use the new scroll proxy.
      ScrollTrigger.refresh();
    });

    return () => {
      if (typeof window !== "undefined") delete window.__smoother__;
      ctx.revert();
    };
  }, []);

  return (
    <div ref={wrapperRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content">
        {children}
      </div>
    </div>
  );
}
