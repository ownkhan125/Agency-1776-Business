"use client";

import { Fragment } from "react";
import { cn } from "@/utils/cn";

/**
 * ScrubText splits a string into words and per-character inline-block spans.
 * Word wrappers keep line-wrap points natural; character spans expose
 * [data-scrub="char"] hooks that useScrubReveal transforms into a Thanos-snap
 * particle materialization tied to scroll progress.
 *
 * Two granularities:
 *   • default (per-char) — best for short/medium headings where each
 *     letter's individual dust motion reads
 *   • `mode="word"` — skips the inner per-char split and animates
 *     whole words. Used for oversized paragraphs (e.g. About's
 *     "A small studio built around one belief…" — 15 words, 84 chars)
 *     where per-char animation costs 5–8× more per frame than
 *     per-word while producing a visually indistinguishable dust
 *     materialization at heading scale. Same [data-scrub="word"]
 *     hook — useScrubReveal automatically picks word-targets when no
 *     char-targets exist in scope.
 *
 * DOM shape is deterministic from `children`, so SSR/CSR render identical
 * trees (no hydration mismatch). Whitespace between words is preserved
 * verbatim so screen readers read the text intact.
 */
export function ScrubText({
  as: Tag = "span",
  mode = "char",
  className,
  wordClassName,
  charClassName,
  children,
}) {
  const text = typeof children === "string" ? children : String(children ?? "");
  const words = text.split(/\s+/).filter(Boolean);
  const perWord = mode === "word";

  return (
    <Tag className={cn("inline", className)}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span
            data-scrub="word"
            className={cn(
              "inline-block whitespace-nowrap align-baseline",
              wordClassName
            )}
          >
            {perWord
              ? word
              : Array.from(word).map((ch, ci) => (
                  <span
                    key={ci}
                    data-scrub="char"
                    className={cn("inline-block align-baseline", charClassName)}
                  >
                    {ch}
                  </span>
                ))}
          </span>
          {wi < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
