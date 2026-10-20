"use client";

import { useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Story progress (0→1 across the pinned section) for components that live outside it,
 * such as the navbar. Mirrors useScroll({ target, offset: ["start start", "end end"] }).
 */
export function useStoryProgress(id = "story") {
  const { scrollY } = useScroll();
  const progress = useMotionValue(0);
  const bounds = useRef({ top: 0, span: 1 });

  const update = (y: number) => {
    const { top, span } = bounds.current;
    progress.set(Math.min(1, Math.max(0, (y - top) / span)));
  };

  useEffect(() => {
    const measure = () => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      bounds.current = { top, span: Math.max(1, el.offsetHeight - window.innerHeight) };
      update(window.scrollY);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useMotionValueEvent(scrollY, "change", update);
  return progress;
}
