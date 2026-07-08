"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function useGsap(setup, deps = []) {
  const scopeRef = useRef(null);

  useLayoutEffect(() => {
    if (!scopeRef.current) return;
    const ctx = gsap.context(setup, scopeRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
