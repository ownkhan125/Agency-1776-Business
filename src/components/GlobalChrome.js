"use client";

import TopBar from "@/components/TopBar";
import Nav from "@/components/Nav";
import Cursor from "@/components/Cursor";
import SpotlightCursor from "@/components/SpotlightCursor";
import SmoothScroll from "@/components/SmoothScroll";
import PageTransition from "@/components/PageTransition";
import { LightLines } from "@/components/ui/LightLines";
import Footer from "@/sections/Footer";

/**
 * Global chrome — every route gets the same fixed wallpaper, top bar,
 * nav, cursor, smooth-scroll wrapper, and footer. Individual page.js
 * files only need to render their unique <main> content.
 *
 * Structure mirrors what the home page used to render inline, so no
 * visual regression on `/`. Content is composed via `children` inside
 * SmoothScroll so ScrollTriggers registered by page sections attach
 * to the correct scroll proxy.
 */
export default function GlobalChrome({ children }) {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <LightLines
          linesOpacity={0.05}
          lightsOpacity={0.32}
          speedMultiplier={0.55}
          lineColor="var(--foreground)"
          lightColor="var(--accent)"
          gradientFrom="transparent"
          gradientTo="transparent"
        />
      </div>
      <TopBar />
      <Nav />
      <SpotlightCursor />
      <Cursor />
      <SmoothScroll>
        {/* PageTransition wraps only the route content, not the
            persistent Footer — the footer never dissolves; the "page"
            that Thanos-snaps is the main article column that swaps
            on navigation. */}
        <PageTransition>
          <main className="relative flex flex-col">{children}</main>
        </PageTransition>
        <Footer />
      </SmoothScroll>
    </>
  );
}
