import type Lenis from "lenis";

export const BRAND = "SOLO";

/** Replace with the real application flow. */
export const APPLY_URL = "#apply";

/** Nav targets, expressed as story progress (anchors are placed inside the pinned section). */
export const NAV = [
  { id: "overview", label: "Overview", at: 0 },
  { id: "benefits", label: "Benefits", at: 0.52 },
  { id: "rewards", label: "Rewards", at: 0.58 },
  { id: "security", label: "Security", at: 0.77 },
  { id: "features", label: "Features", at: 0.28 },
  { id: "apply", label: "Apply", at: 1 },
] as const;

export type NavId = (typeof NAV)[number]["id"];

/** Which nav item is "current" for a given story progress. */
export function activeNav(p: number): NavId {
  if (p < 0.15) return "overview";
  if (p < 0.4) return "features";
  if (p < 0.54) return "benefits";
  if (p < 0.65) return "rewards";
  if (p < 0.85) return "security";
  return "apply";
}

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
