"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/animations/register";
import { cn } from "@/utils/cn";

const TABS = [
  { id: "business",    label: "Business",                 active: true,  href: null },
  { id: "politicians", label: "Politicians or Candidates", active: false, href: null },
  { id: "nonprofit",   label: "Nonprofit",                active: false, href: null },
];

// Top Bar palette is intentionally frozen to the dark-theme values and
// applied via inline styles / arbitrary Tailwind colors — so the strip
// above the Navbar reads identically in both light and dark mode. Only
// the accent (crimson) is shared across themes, so it can still use
// the token.
const TOPBAR_BG      = "rgba(0, 0, 0, 0.95)";        // dark theme --background @ 95%
const TOPBAR_BORDER  = "rgba(74, 74, 74, 0.4)";      // dark theme --muted @ 40%
const TOPBAR_FG      = "#f5f2ec";                    // dark theme --foreground (cream)
const TOPBAR_FG_HALF = "rgba(245, 242, 236, 0.5)";
const TOPBAR_FG_45   = "rgba(245, 242, 236, 0.45)";
const TOPBAR_FG_30   = "rgba(245, 242, 236, 0.3)";

export default function TopBar() {
  const scopeRef = useRef(null);

  useLayoutEffect(() => {
    if (!scopeRef.current) return;
    registerGsap();
    const scope = scopeRef.current;
    const ctx = gsap.context(() => {
      const inactive = scope.querySelectorAll("[data-topbar-tab='inactive']");
      inactive.forEach((el) => {
        const hoverIn  = () => gsap.to(el, { color: TOPBAR_FG,    duration: 0.35, ease: "power2.out" });
        const hoverOut = () => gsap.to(el, { color: TOPBAR_FG_45, duration: 0.35, ease: "power2.out" });
        el.addEventListener("mouseenter", hoverIn);
        el.addEventListener("mouseleave", hoverOut);
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={scopeRef}
      data-cursor="link"
      data-topbar-root
      className="fixed inset-x-0 top-0 z-[60] border-b backdrop-blur-md"
      style={{ backgroundColor: TOPBAR_BG, borderBottomColor: TOPBAR_BORDER }}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2 md:px-12">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar sm:gap-2 lg:flex-none lg:gap-4">
          {TABS.map((t) => (
            <TopBarTab key={t.id} tab={t} />
          ))}
        </div>

        <div
          className="hidden shrink-0 items-center gap-4 whitespace-nowrap text-[10px] uppercase tracking-[0.28em] lg:flex"
          style={{ color: TOPBAR_FG_HALF }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
            Business Division
          </span>
          <span style={{ color: TOPBAR_FG_30 }}>/</span>
          <span>Est. MMXXIV</span>
        </div>
      </div>
    </div>
  );
}

function TopBarTab({ tab }) {
  const isActive = tab.active;
  const Wrapper = tab.href ? "a" : "span";

  return (
    <Wrapper
      href={tab.href || undefined}
      data-topbar-tab={isActive ? "active" : "inactive"}
      data-cursor={tab.href ? "link" : "default"}
      aria-current={isActive ? "page" : undefined}
      role={tab.href ? undefined : "presentation"}
      className={cn(
        "relative inline-flex select-none items-center whitespace-nowrap px-3 py-2 text-[10px] uppercase tracking-[0.28em] transition-opacity md:px-5 md:text-[11px]",
        isActive ? "text-accent" : "cursor-not-allowed",
        tab.href ? "cursor-pointer" : ""
      )}
      style={isActive ? undefined : { color: TOPBAR_FG_45 }}
      title={isActive ? undefined : "Coming soon"}
    >
      {isActive && (
        <span
          aria-hidden
          className="chamfer chamfer-xs absolute inset-y-1 left-0 right-0 -z-0"
          style={{
            "--chamfer-border-color":
              "color-mix(in srgb, var(--accent) 60%, transparent)",
            "--chamfer-bg": "color-mix(in srgb, var(--accent) 6%, transparent)",
          }}
        />
      )}
      <span className="relative z-10">{tab.label}</span>
    </Wrapper>
  );
}
