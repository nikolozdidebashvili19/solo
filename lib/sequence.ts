/**
 * Image-sequence + camera choreography for the card story.
 *
 * The footage (84 frames, 1920×1080) has two phases:
 *   frames 0–36   the SOLO Business card alone, drifting with subtle parallax
 *   frames 37–83  the card fans out into the family (Club · Business · SOLO X)
 *
 * On top of the frame index we run a 2D "camera" (pan + scale) so the cards
 * step aside for each copy block. Everything is keyed on story progress 0→1.
 */

export const FRAME_COUNT = 84;
export const FRAME_W = 1920;
export const FRAME_H = 1080;

export const framePath = (i: number) =>
  `/frames/frame-${String(i + 1).padStart(3, "0")}.webp`;

/** Story beats as progress ranges. Copy, nav state and callouts all read from here. */
export const BEATS = {
  hero: [0, 0.15],
  craft: [0.15, 0.4],
  benefits: [0.4, 0.65],
  security: [0.65, 0.85],
  final: [0.85, 1],
} as const;

export type Camera = {
  /** fractional frame index */
  frame: number;
  /** horizontal pan, fraction of viewport width */
  x: number;
  /** vertical pan, fraction of viewport height */
  y: number;
  /** multiplier on the base fit */
  scale: number;
};

type Key = Camera & { at: number };

// Wide layouts: copy sits beside the cards, so the camera pans opposite the text.
export const WIDE_KEYS: Key[] = [
  { at: 0.0, frame: 0, x: 0, y: 0.135, scale: 0.75 },
  { at: 0.1, frame: 4, x: 0, y: 0.09, scale: 0.8 },
  { at: 0.19, frame: 12, x: 0.15, y: 0.01, scale: 0.88 },
  { at: 0.36, frame: 32, x: 0.15, y: 0.01, scale: 0.88 },
  { at: 0.45, frame: 46, x: -0.16, y: 0.02, scale: 0.7 },
  { at: 0.62, frame: 62, x: -0.16, y: 0.02, scale: 0.7 },
  { at: 0.7, frame: 68, x: 0.16, y: 0.02, scale: 0.7 },
  { at: 0.83, frame: 77, x: 0.16, y: 0.02, scale: 0.7 },
  { at: 0.92, frame: 83, x: 0, y: -0.1, scale: 0.68 },
  { at: 1.0, frame: 83, x: 0, y: -0.1, scale: 0.68 },
];

// Compact (phones, portrait tablets): copy stacks above/below, camera only moves vertically.
export const COMPACT_KEYS: Key[] = [
  { at: 0.0, frame: 0, x: 0, y: 0.12, scale: 1.45 },
  { at: 0.1, frame: 4, x: 0, y: 0.1, scale: 1.45 },
  { at: 0.19, frame: 12, x: 0, y: -0.07, scale: 1.4 },
  { at: 0.36, frame: 32, x: 0, y: -0.07, scale: 1.4 },
  { at: 0.45, frame: 46, x: 0, y: -0.14, scale: 1.12 },
  { at: 0.62, frame: 62, x: 0, y: -0.14, scale: 1.12 },
  { at: 0.7, frame: 68, x: 0, y: -0.14, scale: 1.12 },
  { at: 0.83, frame: 77, x: 0, y: -0.14, scale: 1.12 },
  { at: 0.92, frame: 83, x: 0, y: -0.17, scale: 1.08 },
  { at: 1.0, frame: 83, x: 0, y: -0.17, scale: 1.08 },
];

/** Shared breakpoint so canvas framing and CSS layout (`wide:` screen) always agree. */
export const isCompactViewport = (w: number, h: number) => w < 768 || w / h < 0.9;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function sampleCamera(keys: Key[], progress: number): Camera {
  const p = clamp01(progress);
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].at) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t = clamp01((p - a.at) / (b.at - a.at));
  const e = easeInOutCubic(t);
  return {
    // Frames advance linearly so the footage keeps its own pacing; the camera eases.
    frame: lerp(a.frame, b.frame, t),
    x: lerp(a.x, b.x, e),
    y: lerp(a.y, b.y, e),
    scale: lerp(a.scale, b.scale, e),
  };
}

/**
 * Feature positions on the front card, in frame pixels. Valid from frame ~37,
 * once the fan-out starts and the front card holds still.
 */
export const FRONT_CARD = {
  rect: { x: 597, y: 385, w: 748, h: 480, r: 30 },
  chip: { x: 705, y: 603 },
  contactless: { x: 1280, y: 598 },
};

/** The lone card in the opening frames — used to clip the hero light sweep. */
export const HERO_CARD = { x: 524, y: 340, w: 894, h: 570, r: 34 };

/** Where each card's name pill floats once the fan has settled (frames ≥ 55). */
export const FAMILY_LABELS = [
  { name: "SOLO Club", x: 400, y: 815 },
  { name: "SOLO Business", x: 971, y: 915 },
  { name: "SOLO X", x: 1510, y: 820 },
];

export const pct = (v: number, of: number) => `${(v / of) * 100}%`;
