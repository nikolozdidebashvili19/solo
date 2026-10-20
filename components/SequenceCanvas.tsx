"use client";

import { MotionValue, useMotionValueEvent } from "framer-motion";
import { RefObject, useCallback, useEffect, useRef } from "react";
import {
  COMPACT_KEYS,
  FRAME_COUNT,
  FRAME_H,
  FRAME_W,
  WIDE_KEYS,
  framePath,
  isCompactViewport,
  sampleCamera,
} from "@/lib/sequence";

type Props = {
  progress: MotionValue<number>;
  /** Positioned in lock-step with the drawn frame so HTML callouts stay glued to the cards. */
  stageRef: RefObject<HTMLDivElement>;
  onLoadProgress?: (loaded: number, total: number) => void;
};

const MAX_DPR = 2;

export default function SequenceCanvas({ progress, stageRef, onLoadProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>(Array(FRAME_COUNT).fill(null));
  // Low-res copy of frame 0. Its outermost rows/columns get stretched to the viewport
  // edges, so the frame blends into the page at any aspect ratio.
  const edges = useRef<HTMLCanvasElement | null>(null);
  const corners = useRef<string[]>([]);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const raf = useRef(0);

  const nearestLoaded = (i: number) => {
    const list = frames.current;
    for (let d = 0; d < FRAME_COUNT; d++) {
      if (list[i - d]) return list[i - d];
      if (list[i + d]) return list[i + d];
    }
    return null;
  };

  const draw = useCallback(() => {
    raf.current = 0;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w: W, h: H, dpr } = size.current;

    const compact = isCompactViewport(W, H);
    const cam = sampleCamera(compact ? COMPACT_KEYS : WIDE_KEYS, progress.get());
    const base = compact ? W / FRAME_W : Math.min(W / FRAME_W, H / FRAME_H);
    const s = base * cam.scale;
    const dw = FRAME_W * s;
    const dh = FRAME_H * s;
    const dx = (W - dw) / 2 + cam.x * W;
    const dy = (H - dh) / 2 + cam.y * H;

    const stage = stageRef.current;
    if (stage) {
      stage.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      stage.style.width = `${dw}px`;
      stage.style.height = `${dh}px`;
    }

    const i0 = Math.floor(cam.frame);
    const t = cam.frame - i0;
    const a = nearestLoaded(i0);
    if (!a) return;
    const b = frames.current[Math.min(i0 + 1, FRAME_COUNT - 1)];

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = "high";

    const e = edges.current;
    if (e) {
      const ew = e.width;
      const eh = e.height;
      const right = dx + dw;
      const bottom = dy + dh;
      // 1px overlap into the frame so no hairline gap survives sub-pixel positions.
      if (dy > 0) ctx.drawImage(e, 0, 0, ew, 1, dx, 0, dw, dy + 1);
      if (bottom < H) ctx.drawImage(e, 0, eh - 1, ew, 1, dx, bottom - 1, dw, H - bottom + 1);
      if (dx > 0) ctx.drawImage(e, 0, 0, 1, eh, 0, dy, dx + 1, dh);
      if (right < W) ctx.drawImage(e, ew - 1, 0, 1, eh, right - 1, dy, W - right + 1, dh);
      const [tl, tr, bl, br] = corners.current;
      if (dx > 0 && dy > 0) fill(ctx, tl, 0, 0, dx + 1, dy + 1);
      if (right < W && dy > 0) fill(ctx, tr, right - 1, 0, W - right + 1, dy + 1);
      if (dx > 0 && bottom < H) fill(ctx, bl, 0, bottom - 1, dx + 1, H - bottom + 1);
      if (right < W && bottom < H) fill(ctx, br, right - 1, bottom - 1, W - right + 1, H - bottom + 1);
    }

    ctx.globalAlpha = 1;
    ctx.drawImage(a, dx, dy, dw, dh);
    // Cross-dissolve to the next frame for sub-frame smoothness on slow scrolls.
    if (b && b !== a && t > 0.02) {
      ctx.globalAlpha = t;
      ctx.drawImage(b, dx, dy, dw, dh);
      ctx.globalAlpha = 1;
    }
  }, [progress, stageRef]);

  const schedule = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(draw);
  }, [draw]);

  useMotionValueEvent(progress, "change", schedule);

  // Size the backing store to the viewport (capped DPR keeps 4K screens cheap).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      size.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (raf.current) cancelAnimationFrame(raf.current);
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  // Load frame 0 first (it also seeds the edge sampler), then the rest in parallel.
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = framePath(i);
        img
          .decode()
          .then(() => {
            if (cancelled) return;
            frames.current[i] = img;
            if (i === 0) buildEdges(img);
            loaded++;
            onLoadProgress?.(loaded, FRAME_COUNT);
            schedule();
          })
          .catch(() => {})
          .finally(resolve);
      });

    const buildEdges = (img: HTMLImageElement) => {
      const c = document.createElement("canvas");
      c.width = 192;
      c.height = 108;
      const cx = c.getContext("2d", { willReadFrequently: true });
      if (!cx) return;
      cx.imageSmoothingQuality = "high";
      cx.drawImage(img, 0, 0, c.width, c.height);
      const px = (x: number, y: number) => {
        const d = cx.getImageData(x, y, 1, 1).data;
        return `rgb(${d[0]},${d[1]},${d[2]})`;
      };
      corners.current = [px(0, 0), px(c.width - 1, 0), px(0, c.height - 1), px(c.width - 1, c.height - 1)];
      edges.current = c;
    };

    load(0).then(() => {
      if (cancelled) return;
      for (let i = 1; i < FRAME_COUNT; i++) load(i);
    });

    return () => {
      cancelled = true;
    };
  }, [onLoadProgress, schedule]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

function fill(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
