"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { setLenis } from "@/lib/site";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    setLenis(lenis);

    let id = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
