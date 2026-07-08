"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "@/animations/register";

/**
 * Premium theme toggle — chamfered square button housing a sun and
 * moon SVG. On click, GSAP crossfades the two icons with a 90° rotation
 * and a spring-scale bounce on the button chassis. Theme change is
 * applied immediately to <html> (class + data-theme) and persisted to
 * localStorage. The pre-hydration script in layout.js reads the same
 * key on next load, so no flash of the wrong theme.
 *
 * Icons use `currentColor`, and the button uses `text-foreground` +
 * `border-muted/40`, so it repaints correctly for both themes without
 * any per-theme JS. The dispatched `theme-change` CustomEvent lets
 * canvas-based components (HeroBackdrop) retune their palette without
 * re-mounting or duplicating storage reads.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState("black");
  const sunRef = useRef(null);
  const moonRef = useRef(null);
  const buttonRef = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    registerGsap();
    const current =
      document.documentElement.getAttribute("data-theme") || "black";
    setTheme(current);

    // Set initial icon positions without animation
    if (current === "light") {
      gsap.set(sunRef.current, { opacity: 1, rotation: 0, scale: 1 });
      gsap.set(moonRef.current, { opacity: 0, rotation: -90, scale: 0.7 });
    } else {
      gsap.set(sunRef.current, { opacity: 0, rotation: 90, scale: 0.7 });
      gsap.set(moonRef.current, { opacity: 1, rotation: 0, scale: 1 });
    }
    mounted.current = true;
  }, []);

  const toggle = () => {
    const next = theme === "black" ? "light" : "black";
    setTheme(next);

    const html = document.documentElement;
    html.setAttribute("data-theme", next);
    html.classList.remove("theme-black", "theme-light");
    html.classList.add(`theme-${next}`);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      // silent
    }
    // Broadcast so canvas-based components can retune their palette
    window.dispatchEvent(
      new CustomEvent("theme-change", { detail: { theme: next } })
    );

    if (next === "light") {
      gsap.to(moonRef.current, {
        opacity: 0,
        rotation: 90,
        scale: 0.7,
        duration: 0.4,
        ease: "power2.inOut",
      });
      gsap.to(sunRef.current, {
        opacity: 1,
        rotation: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.inOut",
      });
    } else {
      gsap.to(sunRef.current, {
        opacity: 0,
        rotation: -90,
        scale: 0.7,
        duration: 0.4,
        ease: "power2.inOut",
      });
      gsap.to(moonRef.current, {
        opacity: 1,
        rotation: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.inOut",
      });
    }

    // Button chassis bounce
    gsap.fromTo(
      buttonRef.current,
      { scale: 0.88 },
      { scale: 1, duration: 0.45, ease: "back.out(2.2)" }
    );
  };

  return (
    <button
      ref={buttonRef}
      onClick={toggle}
      type="button"
      aria-label={
        theme === "black" ? "Switch to light mode" : "Switch to dark mode"
      }
      title={theme === "black" ? "Light mode" : "Dark mode"}
      data-cursor="button"
      data-theme-toggle
      className="chamfer chamfer-xs relative inline-flex h-10 w-10 items-center justify-center border border-muted/40 text-foreground transition-colors hover:border-accent"
      style={{ "--chamfer-size": "5px" }}
    >
      {/* Sun */}
      <svg
        ref={sunRef}
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute h-[18px] w-[18px]"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v1.5" />
        <path d="M12 19.5V21" />
        <path d="M4.22 4.22l1.06 1.06" />
        <path d="M18.72 18.72l1.06 1.06" />
        <path d="M3 12h1.5" />
        <path d="M19.5 12H21" />
        <path d="M4.22 19.78l1.06-1.06" />
        <path d="M18.72 5.28l1.06-1.06" />
      </svg>
      {/* Moon */}
      <svg
        ref={moonRef}
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute h-[18px] w-[18px]"
      >
        <path d="M20.5 13.2A8 8 0 1 1 10.8 3.5a6.5 6.5 0 0 0 9.7 9.7Z" />
      </svg>
    </button>
  );
}
