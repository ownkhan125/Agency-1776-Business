"use client";

import { cn } from "@/utils/cn";

/**
 * MaskedLine wraps its children in an overflow-hidden mask and marks the
 * inner element as [data-reveal="text-line"] so useSectionReveal can slide
 * it up from below the mask on scroll entrance.
 *
 * Use for headings, subheads, eyebrows, and CTAs where a masked line
 * reveal reads more premium than a plain fade-up.
 */
export function MaskedLine({
  as: Tag = "span",
  innerAs: InnerTag = "span",
  className,
  innerClassName,
  block = false,
  children,
}) {
  return (
    <Tag
      className={cn(
        block
          ? "block overflow-hidden"
          : "inline-block overflow-hidden align-bottom",
        "[line-height:1.1]",
        className
      )}
    >
      <InnerTag
        data-reveal="text-line"
        className={cn(
          "inline-block will-change-transform [transform:translate3d(0,0,0)]",
          innerClassName
        )}
      >
        {children}
      </InnerTag>
    </Tag>
  );
}
