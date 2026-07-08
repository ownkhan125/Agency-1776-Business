"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, registerGsap } from "@/animations/register";
import { cn } from "@/utils/cn";
import CTAButton from "@/components/CTAButton";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Nav — three responsive modes:
 *
 *   <lg  (< 1024)  : logo + ThemeToggle + hamburger button.
 *                    Full nav lives in a right-side slide-in drawer
 *                    (GSAP timeline, scroll-locked, focus-trapped,
 *                    Esc/click-outside to close). Same modal-aware
 *                    cursor variants as ProjectModal — `close` over
 *                    the backdrop, `default` inside the panel.
 *   lg+ (>= 1024) : logo + inline nav links + ThemeToggle + CTAButton.
 *                   Full cinematic hover (brackets slide-in, accent
 *                   bar draw, glow, label rise) as before.
 *
 * Active state is derived from `usePathname` — the current-page link
 * stays highlighted until the user navigates elsewhere.
 */

const LINKS = [
  { id: "services", href: "/services", label: "Services", matchPrefix: "/services" },
  { id: "about",    href: "/about",    label: "About",    matchPrefix: "/about" },
  { id: "work",     href: "/work",     label: "Portfolio", matchPrefix: "/work" },
  { id: "pricing",  href: "/pricing",  label: "Pricing",  matchPrefix: "/pricing" },
  { id: "contact",  href: "/contact",  label: "Contact",  matchPrefix: "/contact" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const activeId = LINKS.find((l) =>
    pathname === l.href || pathname?.startsWith(l.matchPrefix + "/")
  )?.id;

  const linksRef = useRef(null);
  const animsRef = useRef(null);

  const drawerPanelRef = useRef(null);
  const drawerBackdropRef = useRef(null);
  const menuBtnRef = useRef(null);
  const drawerFirstLinkRef = useRef(null);
  const lastFocusRef = useRef(null);

  // GSAP cinematic hover — inline nav (lg+ only).
  useLayoutEffect(() => {
    if (!linksRef.current) return;
    registerGsap();

    const scope = linksRef.current;
    const ctx = gsap.context(() => {
      const items = scope.querySelectorAll("[data-nav-link]");

      const enterAnim = (item) => {
        const label   = item.querySelector("[data-nav-label]");
        const glow    = item.querySelector("[data-nav-glow]");
        const bracket = item.querySelectorAll("[data-nav-bracket]");
        const bar     = item.querySelector("[data-nav-bar]");
        gsap.killTweensOf([label, glow, bracket, bar]);
        gsap.to(label, { y: -2, duration: 0.45, ease: "power3.out" });
        gsap.to(glow,  { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out" });
        gsap.to(bar,   { scaleX: 1, duration: 0.6, ease: "expo.out", transformOrigin: "left center" });
        gsap.to(bracket, {
          opacity: 1, x: 0,
          duration: 0.45, ease: "power3.out",
          stagger: 0.04,
        });
      };
      const leaveAnim = (item) => {
        const label   = item.querySelector("[data-nav-label]");
        const glow    = item.querySelector("[data-nav-glow]");
        const bracket = item.querySelectorAll("[data-nav-bracket]");
        const bar     = item.querySelector("[data-nav-bar]");
        gsap.killTweensOf([label, glow, bracket, bar]);
        gsap.to(label, { y: 0, duration: 0.4, ease: "power3.out" });
        gsap.to(glow,  { opacity: 0, scale: 0.6, duration: 0.4, ease: "power2.out" });
        gsap.to(bar, {
          scaleX: 0, duration: 0.4,
          ease: "power2.out",
          transformOrigin: "right center",
        });
        gsap.to(bracket, {
          opacity: 0,
          x: (i) => (i === 0 ? -6 : 6),
          duration: 0.35, ease: "power2.out",
        });
      };

      animsRef.current = { enterAnim, leaveAnim, items: Array.from(items) };

      items.forEach((item) => {
        const bracket = item.querySelectorAll("[data-nav-bracket]");
        const bar     = item.querySelector("[data-nav-bar]");
        const glow    = item.querySelector("[data-nav-glow]");

        gsap.set(bracket, { opacity: 0, x: (i) => (i === 0 ? -6 : 6) });
        gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(glow, { opacity: 0, scale: 0.6 });

        if (item.dataset.active === "true") {
          gsap.set(bracket, { opacity: 1, x: 0 });
          gsap.set(bar, { scaleX: 1, transformOrigin: "left center" });
          gsap.set(glow, { opacity: 1, scale: 1 });
          const label = item.querySelector("[data-nav-label]");
          gsap.set(label, { y: -2 });
        }

        item.dataset.hovered = "false";
        const enter = () => {
          item.dataset.hovered = "true";
          enterAnim(item);
        };
        const leave = () => {
          item.dataset.hovered = "false";
          if (item.dataset.active !== "true") leaveAnim(item);
        };

        item.addEventListener("mouseenter", enter);
        item.addEventListener("mouseleave", leave);
        item.addEventListener("focusin",  enter);
        item.addEventListener("focusout", leave);
      });
    }, scope);

    return () => {
      animsRef.current = null;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const a = animsRef.current;
    if (!a) return;
    a.items.forEach((item) => {
      const isActive = item.dataset.active === "true";
      if (isActive) a.enterAnim(item);
      else if (item.dataset.hovered !== "true") a.leaveAnim(item);
    });
  }, [activeId]);

  // Drawer open/close — GSAP slide-in + scroll lock. Modeled on the
  // ProjectModal machinery so the two share behavior (Esc, click-
  // outside, html.overflow=hidden, ScrollSmoother.paused, focus
  // restore).
  useLayoutEffect(() => {
    if (!menuOpen) return;
    registerGsap();

    const panel = drawerPanelRef.current;
    const backdrop = drawerBackdropRef.current;
    if (!panel || !backdrop) return;

    lastFocusRef.current =
      typeof document !== "undefined" ? document.activeElement : null;

    const ctx = gsap.context(() => {
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(panel, { x: "100%" });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(backdrop, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      }).to(panel, { x: "0%", duration: 0.55 }, "-=0.2");
    });

    // First link focused so keyboard users land on nav content.
    const focusRaf = requestAnimationFrame(() =>
      drawerFirstLinkRef.current?.focus()
    );

    // Scroll lock — html overflow + smoother pause (mirrors modal).
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const smoother =
      typeof window !== "undefined" ? window.__smoother__ : null;
    const savedScrollY = smoother
      ? smoother.scrollTop()
      : typeof window !== "undefined"
        ? window.scrollY
        : 0;
    if (smoother?.paused) smoother.paused(true);

    // Focus trap + Escape.
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (e.key === "Tab") {
        const focusable = panel.querySelectorAll(
          'a, button, [href], [tabindex]:not([tabindex="-1"])'
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
      html.style.overflow = prevOverflow;
      if (typeof window !== "undefined") {
        window.scrollTo(0, savedScrollY);
      }
      if (smoother?.scrollTop) smoother.scrollTop(savedScrollY);
      if (smoother?.paused) smoother.paused(false);
      ctx.revert();
      // Return focus to the hamburger.
      lastFocusRef.current?.focus?.();
    };
  }, [menuOpen]);

  // Legacy hash-scroll for any remaining `#anchor` links (only Home
  // still uses these for in-page section jumps). Route links flow
  // through <Link> and don't go through this handler.
  const handleClick = (e, href) => {
    if (!href?.startsWith("#")) return;
    const el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    const smoother = typeof window !== "undefined" && window.__smoother__;
    if (smoother) {
      smoother.scrollTo(el, true, "top 100px");
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDrawerLinkClick = () => {
    // Route <Link>s handle their own navigation; closing the drawer is
    // all the JSX handler needs to do.
    setMenuOpen(false);
  };

  const handleBackdropMouseDown = (e) => {
    if (e.target === drawerBackdropRef.current) setMenuOpen(false);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-9 z-50 border-b border-muted/30 bg-background/70 backdrop-blur-md md:top-10"
        data-cursor="link"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3.5 md:gap-4 md:px-8 md:py-4 lg:px-12 lg:py-5">
          {/* Logo */}
          <Link
            href="/"
            data-cursor="link"
            aria-label="Home"
            className="group inline-flex shrink-0 items-center gap-2.5 text-foreground sm:gap-3"
          >
            <span
              className="chamfer chamfer-xs grid h-7 w-7 place-items-center"
              style={{
                "--chamfer-border-color":
                  "color-mix(in srgb, var(--muted) 70%, transparent)",
              }}
            >
              <span className="h-2 w-2 bg-accent transition-transform duration-500 group-hover:rotate-45" />
            </span>
            <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.24em] sm:text-sm sm:tracking-[0.28em]">
              Agency 1776
            </span>
          </Link>

          {/* Inline nav — lg+ only */}
          <nav
            ref={linksRef}
            aria-label="Primary"
            className="hidden min-w-0 items-center justify-center gap-2 lg:flex lg:gap-3 xl:gap-6"
          >
            {LINKS.map((l) => {
              const isActive = activeId === l.id;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-nav-link
                  data-active={isActive ? "true" : "false"}
                  data-cursor="link"
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-3 text-[10px] uppercase tracking-[0.18em] outline-none lg:px-3 lg:text-[11px] lg:tracking-[0.24em]",
                    isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  <span
                    aria-hidden
                    data-nav-glow
                    className={cn(
                      "chamfer-shape pointer-events-none absolute inset-0 -z-10",
                      "bg-[radial-gradient(closest-side,rgba(191,10,48,0.35),rgba(191,10,48,0)_75%)]"
                    )}
                    style={{ "--chamfer-size": "4px" }}
                  />
                  <span
                    aria-hidden
                    data-nav-bracket
                    className="inline-block text-accent/80 text-[10px]"
                  >
                    [
                  </span>
                  <span data-nav-label className="inline-block">
                    {l.label}
                  </span>
                  <span
                    aria-hidden
                    data-nav-bracket
                    className="inline-block text-accent/80 text-[10px]"
                  >
                    ]
                  </span>
                  <span
                    aria-hidden
                    data-nav-bar
                    className="pointer-events-none absolute inset-x-3 bottom-1 h-px bg-accent"
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {/* CTA promoted to xl+ so 1024-1279px shows only logo +
                inline nav + toggle. At 1024px the logo + 5 nav links +
                toggle + CTA overshoot the viewport by ~70px and
                collide with each other; deferring the CTA to xl gives
                every element breathing room without shrinking the
                nav's tracking. Contact link stays reachable via the
                inline nav. */}
            <div className="hidden xl:block">
              <CTAButton href="/contact">Start a project</CTAButton>
            </div>
            {/* Hamburger — hidden at lg+ */}
            <button
              ref={menuBtnRef}
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
              onClick={() => setMenuOpen((v) => !v)}
              data-cursor="button"
              className="chamfer chamfer-xs inline-flex h-9 w-9 shrink-0 items-center justify-center text-foreground outline-none lg:hidden"
              style={{
                "--chamfer-border-color":
                  "color-mix(in srgb, var(--muted) 60%, transparent)",
                "--chamfer-bg": "var(--background)",
              }}
            >
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                aria-hidden
              >
                <line
                  x1="0"
                  y1="1"
                  x2="14"
                  y2="1"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="square"
                />
                <line
                  x1="0"
                  y1="5"
                  x2="14"
                  y2="5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="square"
                />
                <line
                  x1="0"
                  y1="9"
                  x2="14"
                  y2="9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="square"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in drawer — only mounted while `menuOpen` is true so GSAP
          doesn't re-run on every render. */}
      {menuOpen && (
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-[90] lg:hidden"
        >
          <div
            ref={drawerBackdropRef}
            data-cursor="close"
            onMouseDown={handleBackdropMouseDown}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            style={{ opacity: 0 }}
          />
          <div
            ref={drawerPanelRef}
            data-cursor="default"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col overflow-y-auto border-l border-muted/40 bg-surface"
            style={{ transform: "translateX(100%)" }}
          >
            <div className="flex items-center justify-between border-b border-muted/30 px-6 py-5">
              <span className="text-[10px] uppercase tracking-[0.32em] text-foreground/50">
                Menu
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                data-cursor="button"
                className="inline-flex h-9 w-9 items-center justify-center text-foreground/60 outline-none transition-colors hover:text-accent focus-visible:text-accent"
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
            </div>

            <nav
              aria-label="Primary"
              className="flex flex-1 flex-col gap-1 px-6 py-8"
            >
              {LINKS.map((l, i) => {
                const isActive = activeId === l.id;
                return (
                  <Link
                    key={l.href}
                    ref={i === 0 ? drawerFirstLinkRef : undefined}
                    href={l.href}
                    onClick={handleDrawerLinkClick}
                    aria-current={isActive ? "page" : undefined}
                    data-cursor="link"
                    className={cn(
                      "group relative flex items-center gap-4 py-4 text-xl uppercase tracking-[0.06em] outline-none focus-visible:text-accent",
                      isActive
                        ? "text-foreground"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "inline-block h-2 w-2 shrink-0 bg-accent transition-opacity duration-300",
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                      )}
                    />
                    <span className="font-display">{l.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-muted/30 px-6 py-6">
              <CTAButton href="/contact" onClick={handleDrawerLinkClick}>
                Start a project
              </CTAButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
