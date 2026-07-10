"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, registerGsap } from "@/animations/register";
import ProjectMock, { MOCK_VARIANT_KEYS } from "@/components/ProjectMock";

/**
 * ProjectModal — click-a-sphere-card → enlarged card + metadata.
 *
 * Behaviour:
 *   - React portal into <body> so it lives outside SmoothScroll's
 *     transformed #smooth-content wrapper (fixed positioning stays
 *     honest, no transform-context weirdness).
 *   - GSAP timeline for enter/exit — one shared `tlRef` so the exit
 *     always reverses the enter, no half-baked states.
 *   - Scroll lock: pauses ScrollSmoother if present (desktop path),
 *     otherwise sets body.overflow = "hidden" (touch / reduced-motion
 *     path). Because we PAUSE rather than mutate scroll position, the
 *     scroller is exactly where the user left it on close — no
 *     restore-and-jump.
 *   - Focus trap: `Tab` / `Shift+Tab` cycles within the panel; Escape
 *     closes; opening focus lands on the close button; closing focus
 *     returns to the trigger card.
 *   - Everything the modal paints is inside a chamfered clip so it
 *     shares the site's corner language.
 *
 * Props:
 *   open      boolean — modal visibility (driven by parent state).
 *   project   { client, role, year, title, tag } or null.
 *   index     number — card position on the sphere (00-17), shown in
 *             the "NN / 18" marker for continuity with the card face.
 *   onClose   () => void — parent-owned close handler.
 */
export default function ProjectModal({ open, project, index, onClose }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusRef = useRef(null);
  const tlRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    registerGsap();

    lastFocusRef.current =
      typeof document !== "undefined" ? document.activeElement : null;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const ctx = gsap.context(() => {
      // Use `opacity` (not `autoAlpha`) so visibility stays "visible"
      // throughout the tween — that keeps the close button focusable
      // from frame 0, which is what makes the focus trap actually trap.
      gsap.set(overlay, { opacity: 0 });
      gsap.set(panel, { opacity: 0, y: 32, scale: 0.96 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(overlay, {
        opacity: 1,
        duration: 0.32,
        ease: "power2.out",
      }).to(
        panel,
        { opacity: 1, y: 0, scale: 1, duration: 0.55 },
        "-=0.18"
      );
      tlRef.current = tl;
    });

    // Focus the close button. Do it once synchronously (works because
    // opacity, not visibility, is animating) and once more on the next
    // frame as a belt-and-suspenders — some browsers de-focus during
    // React commits.
    closeBtnRef.current?.focus();
    const focusRaf = requestAnimationFrame(() =>
      closeBtnRef.current?.focus()
    );

    // Scroll lock. The hard path — `html { overflow: hidden }` freezes
    // the browser's own scroll no matter what scroll library is on top.
    // We ALSO pause ScrollSmoother so its pinned ScrollTriggers stop
    // chasing scroll position, and save the current scrollY to write
    // back on close (belt and suspenders in case smoother somehow
    // moves during the pause window).
    const smoother =
      typeof window !== "undefined" ? window.__smoother__ : null;
    const savedScrollY = smoother
      ? smoother.scrollTop()
      : typeof window !== "undefined"
        ? window.scrollY
        : 0;
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    if (smoother?.paused) smoother.paused(true);

    // Focus trap + Escape.
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = panel.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      cancelAnimationFrame(focusRaf);
      document.removeEventListener("keydown", handleKey);
      html.style.overflow = prevHtmlOverflow;
      // Restore scroll BEFORE unpausing the smoother so the smoother
      // resumes at the correct target rather than snapping to its
      // last internal position.
      if (typeof window !== "undefined") {
        window.scrollTo(0, savedScrollY);
      }
      if (smoother?.scrollTop) smoother.scrollTop(savedScrollY);
      if (smoother?.paused) smoother.paused(false);
      ctx.revert();
      // Restore focus to the card that was clicked so keyboard users
      // continue in place.
      lastFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  const handleOverlayMouseDown = (e) => {
    // Click OUTSIDE the panel closes; clicks that start inside the
    // panel don't (guards against click-drag selection releasing on
    // the overlay).
    if (e.target === overlayRef.current) onClose();
  };

  if (!mounted || !open || !project) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onMouseDown={handleOverlayMouseDown}
      // data-cursor="close" tells the global Cursor component to swap
      // to its "click to close" affordance (X icon, accent color) over
      // the backdrop. The panel itself resets it back to `default`.
      data-cursor="close"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md md:px-8"
      style={{ opacity: 0 }}
    >
      <div
        ref={panelRef}
        // Reset cursor to `default` inside the panel so the "click to
        // close" X doesn't follow the pointer over readable content —
        // the close button then re-overrides to `button` on its own.
        data-cursor="default"
        className="chamfer chamfer-lg relative flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-y-auto md:max-w-[640px]"
        style={{
          "--chamfer-border-color":
            "color-mix(in srgb, var(--muted) 55%, transparent)",
          "--chamfer-bg": "var(--card-pinstripe), var(--surface)",
          opacity: 0,
        }}
      >
        {/* Close button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close project"
          data-cursor="button"
          className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center text-foreground/60 outline-none transition-colors hover:text-accent focus-visible:text-accent md:right-6 md:top-6"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 2L14 14M14 2L2 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Enlarged mock — mirrors the sphere-card face but scaled up
            so a click feels like the card zoomed in. Same ProjectMock
            SVG the sphere renders, at a hero read size. Variant is
            derived from index the same way the sphere derives it, so
            the modal always shows the card the user clicked. */}
        <div
          className="chamfer chamfer-md relative mx-5 mt-14 aspect-[4/3] shrink-0 overflow-hidden md:mx-8 md:mt-16"
          style={{
            "--chamfer-border-color":
              "color-mix(in srgb, var(--muted) 40%, transparent)",
            "--chamfer-bg": "var(--surface)",
          }}
        >
          <div className="absolute inset-[1px] overflow-hidden">
            <ProjectMock
              variant={
                MOCK_VARIANT_KEYS[index % MOCK_VARIANT_KEYS.length] ||
                project.mock ||
                "northwind"
              }
              showCaption={false}
            />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)",
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-between p-4 md:p-6">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] md:text-xs">
                {String(index + 1).padStart(2, "0")} / 18
              </span>
              <span className="inline-block h-1.5 w-1.5 bg-accent" />
            </div>

            <div className="text-center font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] md:text-xs">
              {project.tag}
            </div>
          </div>
        </div>

        {/* Metadata block */}
        <div className="relative z-10 flex flex-col gap-5 px-5 pb-8 pt-7 md:gap-6 md:px-8 md:pb-10 md:pt-8">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-foreground/50">
            <span className="inline-block h-1.5 w-1.5 bg-accent" />
            <span>{project.client}</span>
            <span className="h-px w-6 bg-muted" />
            <span>{project.year}</span>
          </div>

          <h3
            id="project-modal-title"
            className="font-display text-2xl leading-[1.05] tracking-[-0.01em] text-foreground md:text-3xl"
          >
            {project.title}
          </h3>

          <p className="text-sm leading-relaxed text-foreground/70 md:text-[15px]">
            {project.role}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
