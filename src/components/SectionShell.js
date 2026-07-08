"use client";

import { forwardRef, useLayoutEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import { SectionParticles } from "@/components/SectionParticles";

/**
 * SectionShell wraps a page section with:
 *   - a particle field ([data-reveal="particle"]) layered behind content
 *     so useSectionReveal can drive the section-build assembly phase
 *   - an absolutely-positioned SVG polygon whose stroke draws in on
 *     scroll ([data-reveal="border"]) — chamfered corners match the
 *     site-wide corner treatment
 *   - a content well that sits above both layers
 *
 * The polygon uses pathLength="1" so a single strokeDashoffset tween
 * works regardless of the rendered size. Points are computed from the
 * measured container size — SVG polygon points can't be percentages,
 * and preserveAspectRatio="none" would skew 45° chamfers on wide
 * sections. We update points imperatively via ResizeObserver so the
 * polygon is present in the DOM at mount time (before useSectionReveal
 * queries [data-reveal="border"]).
 */

// Corner-cut in px for the section-scale border. Matches --chamfer-size
// on `.chamfer-lg` so section outlines feel harmonized with contained
// cards/inputs at the outer scale.
const SECTION_CHAMFER = 14;

const SectionShell = forwardRef(function SectionShell(
  {
    as: Tag = "section",
    id,
    className,
    innerClassName,
    children,
    borderColor = "var(--muted)",
    borderInset = "inset-6 md:inset-10",
    showBorder = true,
    particles = true,
    particleCount,
    particleColor,
    backdrop = null,
    ...rest
  },
  ref
) {
  const borderBoxRef = useRef(null);
  const polygonRef = useRef(null);

  useLayoutEffect(() => {
    if (!showBorder) return;
    const box = borderBoxRef.current;
    const poly = polygonRef.current;
    if (!box || !poly) return;

    const update = () => {
      const rect = box.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;
      const c = Math.min(SECTION_CHAMFER, w / 2, h / 2);
      const points = [
        [c, 0],
        [w - c, 0],
        [w, c],
        [w, h - c],
        [w - c, h],
        [c, h],
        [0, h - c],
        [0, c],
      ]
        .map((p) => p.join(","))
        .join(" ");
      poly.setAttribute("points", points);
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(box);
    return () => ro.disconnect();
  }, [showBorder]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={cn("relative isolate", className)}
      {...rest}
    >
      {/*
        Opaque chamfered "hole" that masks the global LightLines
        wallpaper (rendered fixed behind everything in <Home>). The
        div is inset to the same `borderInset` value used by the SVG
        border ring, and clipped to the same 14px chamfer via
        `.chamfer-shape`. Result: the wallpaper is only visible in
        the strip *outside* the chamfered outline — between and
        around sections — never inside a section, over a border, or
        through a card.

        Painted first among the Tag's positioned children so backdrop
        / particles / border / content all sit above it in the paint
        order (all share default z-index within `relative isolate`,
        so tree order decides).
      */}
      {showBorder && (
        <div
          aria-hidden
          className={cn(
            "chamfer-shape pointer-events-none absolute bg-background",
            borderInset
          )}
          style={{ "--chamfer-size": "14px" }}
        />
      )}
      {backdrop && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          {backdrop}
        </div>
      )}
      {particles && (
        <div
          aria-hidden
          className={cn("pointer-events-none absolute z-0", borderInset)}
        >
          <SectionParticles
            id={id || "section"}
            count={particleCount}
            color={particleColor}
          />
        </div>
      )}
      {showBorder && (
        <div
          ref={borderBoxRef}
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-0",
            borderInset
          )}
        >
          <svg
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            className="block overflow-visible"
          >
            <polygon
              ref={polygonRef}
              data-reveal="border"
              points="0,0 0,0"
              fill="none"
              stroke={borderColor}
              strokeWidth="1"
              pathLength="1"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: 1,
                willChange: "stroke-dashoffset",
              }}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
      <div className={cn("relative z-10", innerClassName)}>{children}</div>
    </Tag>
  );
});

export default SectionShell;
