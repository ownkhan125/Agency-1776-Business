"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, registerGsap } from "@/animations/register";

/**
 * Global page transition — Thanos-snap materialization for entire pages.
 *
 * On enter (pathname change → mount) the page assembles from a soft blur
 * halo into sharp focus (scale 0.995 → 1, blur 6 px → 0, brightness
 * 1.08 → 1, opacity 0 → 1, radial red overlay dissolves). On exit
 * (internal Link click) the current page dissolves back into a dust
 * cloud (blur 0 → 6 px, brightness 1 → 1.15, opacity 1 → 0, overlay
 * re-appears) *before* the router routes — so no white flash between
 * pages.
 *
 * The blur + brightness pair reads as "particles scattering" at
 * page scale — the same visual vocabulary as the per-char SNAP dust in
 * `useScrubReveal`, just applied to the whole content column. Kept at
 * the SAME crimson accent (rgba 191/10/48) that HeroBackdrop and
 * LightLines already paint, so the transition feels like a natural
 * extension of the wallpaper, not a foreign overlay.
 *
 * Handles every navigation path:
 *   • Internal `<Link>` / `<a href="/…">` click → exit + push
 *   • Browser Back / Forward → popstate fires, Next.js handles URL,
 *     enter animation runs on the next commit (no exit — the browser
 *     navigates immediately, we can't intercept)
 *   • Direct URL / refresh → enter animation only, no exit needed
 *   • Hash-only (`#services`) or external / new-tab links → passthrough
 *
 * Zero conflict with existing GSAP timelines: only touches the
 * top-level content wrapper's opacity / scale / filter — never a child
 * element. All in-page ScrollTriggers, MaskedLine reveals, StencilFill
 * boots and scrub materializations run untouched inside the wrapper.
 */

// Kept in sync with the site's SNAP dust vocabulary.
const ENTER_DURATION = 0.7;
const EXIT_DURATION = 0.42;
const EXIT_BLUR = 6;
const EXIT_SCALE = 0.995;

// True if the href is a same-origin route that PageTransition should
// intercept. Hash-only, external, new-tab, modified-click all skip.
function isTransitionableHref(href, link, event, currentPath) {
  if (!href) return false;
  if (!href.startsWith("/")) return false;
  if (href.startsWith("//")) return false;
  if (link.target === "_blank") return false;
  if (link.hasAttribute("download")) return false;
  if (link.hasAttribute("data-no-transition")) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey) return false;
  if (event.button !== 0) return false;
  if (href === currentPath) return false;
  // Same-page hash — let native anchor scroll handle it.
  if (href.includes("#") && href.split("#")[0] === currentPath) return false;
  return true;
}

export default function PageTransition({ children }) {
  const contentRef = useRef(null);
  const overlayRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  // Prevents double-fire when a user rapid-clicks; also blocks the
  // second `pushState` if a link click and a popstate race.
  const isNavigatingRef = useRef(false);

  // ENTER — fires on every mount + pathname change (including
  // Back/Forward and direct loads).
  useLayoutEffect(() => {
    registerGsap();
    const content = contentRef.current;
    const overlay = overlayRef.current;
    if (!content) return;

    // Reset guard: whatever navigation brought us here is complete.
    isNavigatingRef.current = false;

    // Wipe any leftover exit tween tracking on this element.
    gsap.killTweensOf([content, overlay].filter(Boolean));

    // Assemble from dust.
    gsap.set(content, {
      autoAlpha: 0,
      scale: EXIT_SCALE,
      filter: `blur(${EXIT_BLUR}px) brightness(1.08)`,
    });
    gsap.to(content, {
      autoAlpha: 1,
      scale: 1,
      filter: "blur(0px) brightness(1)",
      duration: ENTER_DURATION,
      ease: "power3.out",
    });
    if (overlay) {
      gsap.set(overlay, { autoAlpha: 1 });
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }

    // Content height changes on route change — refresh ScrollTrigger
    // so pinned sections and reveals reattach to the correct scroll
    // proxy. Run after the enter tween begins so measurements happen
    // against the visible layout.
    const rafId = requestAnimationFrame(() => {
      if (typeof window === "undefined") return;
      const smoother = window.__smoother__;
      if (smoother?.refresh) smoother.refresh(true);
      // In case ScrollSmoother is absent (touch / reduced-motion):
      // ScrollTrigger.refresh is a safe no-op if the registry is empty.
      import("gsap/ScrollTrigger")
        .then((m) => m.ScrollTrigger?.refresh?.())
        .catch(() => {});
    });
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  // EXIT — intercept internal Link clicks; play dissolve before push.
  useEffect(() => {
    const onClick = (e) => {
      if (isNavigatingRef.current) return;
      const link = e.target.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!isTransitionableHref(href, link, e, pathname)) return;

      e.preventDefault();
      isNavigatingRef.current = true;

      const content = contentRef.current;
      const overlay = overlayRef.current;

      gsap.killTweensOf([content, overlay].filter(Boolean));

      if (content) {
        gsap.to(content, {
          autoAlpha: 0,
          scale: EXIT_SCALE,
          filter: `blur(${EXIT_BLUR}px) brightness(1.15)`,
          duration: EXIT_DURATION,
          ease: "power2.in",
          onComplete: () => router.push(href),
        });
      } else {
        router.push(href);
      }
      if (overlay) {
        gsap.to(overlay, {
          autoAlpha: 1,
          duration: EXIT_DURATION * 0.75,
          ease: "power2.out",
        });
      }
    };

    // Capture-phase listener catches clicks before <Link> child handlers.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router]);

  return (
    <>
      {/*
        Dust overlay — a soft radial red haze that briefly appears
        during the transition, matching the crimson particles used in
        HeroBackdrop / LightLines. Kept at z-[150] so it sits above
        content but below TopBar (z-60) is not true — it must sit
        below TopBar and Nav so the chrome stays legible during
        transition. z-40 is below Nav (z-50); we use z-40.
      */}
      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(191, 10, 48, 0.10) 0%, rgba(0, 0, 0, 0.55) 55%, rgba(0, 0, 0, 0.85) 100%)",
          opacity: 0,
        }}
      />
      <div ref={contentRef} data-page-transition>
        {children}
      </div>
    </>
  );
}
