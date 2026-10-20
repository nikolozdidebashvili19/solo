"use client";

import {
  MotionValue,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import SequenceCanvas from "@/components/SequenceCanvas";
import {
  FAMILY_LABELS,
  FRAME_H,
  FRAME_W,
  FRONT_CARD,
  HERO_CARD,
  pct,
} from "@/lib/sequence";
import { useLang } from "@/lib/i18n";
import { APPLY_URL, NAV, scrollToId } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Layout helpers                                                            */
/* -------------------------------------------------------------------------- */

// Mirrors isCompactViewport() and the `wide:` Tailwind screen.
function useIsWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (min-aspect-ratio: 9/10)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

type Window4 = [number, number, number, number];

const BeatContext = createContext<{ progress: MotionValue<number>; win: Window4 } | null>(null);

/**
 * A copy block that fades/slides in and out over a progress window
 * [inStart, inEnd, outStart, outEnd]. Use 0/0 or 1/1 pairs to skip a side.
 */
function Beat({
  progress,
  win,
  from = "center",
  className = "",
  children,
}: {
  progress: MotionValue<number>;
  win: Window4;
  from?: "left" | "right" | "center";
  className?: string;
  children: ReactNode;
}) {
  const wide = useIsWide();
  const dir = !wide || from === "center" ? 0 : from === "left" ? -1 : 1;
  const [a, b, c, d] = win;
  const opacity = useTransform(progress, win, [a === b ? 1 : 0, 1, 1, c === d ? 1 : 0]);
  const x = useTransform(progress, win, [dir * 56, 0, 0, dir * 24]);
  const y = useTransform(progress, win, [dir ? 0 : 28, 0, 0, dir ? 0 : -20]);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.6 ? "auto" : "none"));

  return (
    <BeatContext.Provider value={{ progress, win }}>
      {/* Outer div owns layout transforms; motion owns the animated ones. */}
      <div className={`pointer-events-none ${className}`}>
        <motion.div style={{ opacity, x, y, pointerEvents }} className="will-change-transform">
          {children}
        </motion.div>
      </div>
    </BeatContext.Provider>
  );
}

/** Staggered line inside a Beat. */
function Reveal({ i = 0, className = "", children }: { i?: number; className?: string; children: ReactNode }) {
  const ctx = useContext(BeatContext)!;
  const [a, b] = ctx.win;
  const delay = i * 0.006;
  const start = a === b ? -1 : a + delay;
  const end = a === b ? 0 : b + delay;
  const opacity = useTransform(ctx.progress, [start, end], [0, 1]);
  const y = useTransform(ctx.progress, [start, end], [18, 0]);
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Opacity for a progress window, for overlays that don't need the Beat motion. */
function useWindow(progress: MotionValue<number>, win: Window4) {
  return useTransform(progress, win, [0, 1, 1, 0]);
}

/* -------------------------------------------------------------------------- */
/*  Overlays glued to the frame (children of the stage)                       */
/* -------------------------------------------------------------------------- */

const at = (x: number, y: number) => ({ left: pct(x, FRAME_W), top: pct(y, FRAME_H) });

/** Slow specular sweep across the hero card. */
function HeroSweep({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.06], [1, 0]);
  const r = HERO_CARD.r;
  return (
    <motion.div
      aria-hidden
      style={{
        opacity,
        left: pct(HERO_CARD.x, FRAME_W),
        top: pct(HERO_CARD.y, FRAME_H),
        width: pct(HERO_CARD.w, FRAME_W),
        height: pct(HERO_CARD.h, FRAME_H),
        borderRadius: `${(r / HERO_CARD.w) * 100}% / ${(r / HERO_CARD.h) * 100}%`,
      }}
      className="absolute overflow-hidden"
    >
      <div className="sweep absolute inset-y-[-30%] left-0 w-[45%]" />
    </motion.div>
  );
}

/** Platinum light tracing the front card's edge, drawn by scroll. */
function CardTrace({ progress }: { progress: MotionValue<number> }) {
  const pathLength = useTransform(progress, [0.69, 0.79], [0, 1]);
  const opacity = useTransform(progress, [0.68, 0.7, 0.81, 0.85], [0, 1, 1, 0]);
  const { x, y, w, h, r } = FRONT_CARD.rect;
  return (
    <motion.svg
      aria-hidden
      viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
      className="absolute inset-0 h-full w-full overflow-visible"
      style={{ opacity, filter: "drop-shadow(0 0 6px rgba(199,203,209,0.5))" }}
    >
      <defs>
        <linearGradient id="trace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#C7CBD1" />
          <stop offset="100%" stopColor="#8E97A3" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill="none"
        stroke="url(#trace)"
        strokeWidth={2.5}
        style={{ pathLength }}
      />
    </motion.svg>
  );
}

function Callout({
  x,
  y,
  label,
  caption,
  side,
  progress,
  win,
}: {
  x: number;
  y: number;
  label: string;
  caption: string;
  side: "left" | "right";
  progress: MotionValue<number>;
  win: Window4;
}) {
  const opacity = useWindow(progress, win);
  const line = useTransform(progress, [win[0], win[1]], [0, 1]);
  return (
    <motion.div style={{ ...at(x, y), opacity }} className="absolute">
      {/* pulse ring on the feature */}
      <span className="absolute left-0 top-0 block h-[clamp(36px,6vw,84px)] w-[clamp(36px,6vw,84px)] -translate-x-1/2 -translate-y-1/2">
        <span className="pulse-ring absolute inset-0 rounded-full border border-accent/60" />
        <span className="absolute inset-[30%] rounded-full bg-accent/10 blur-md" />
      </span>
      {/* leader + label */}
      <div
        className={`absolute top-0 hidden items-center wide:flex ${
          side === "left" ? "right-[clamp(22px,3.4vw,48px)] flex-row-reverse" : "left-[clamp(22px,3.4vw,48px)]"
        }`}
      >
        <motion.span
          style={{ scaleX: line }}
          className={`block h-px w-[clamp(28px,5vw,80px)] from-accent/80 to-accent/10 ${
            side === "left" ? "origin-right bg-gradient-to-l" : "origin-left bg-gradient-to-r"
          }`}
        />
        <div
          className={`whitespace-nowrap rounded-lg border border-white/10 bg-void/70 px-3 py-2 backdrop-blur-md ${
            side === "left" ? "text-right" : ""
          }`}
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-accent-light/90">{label}</div>
          <div className="mt-1 hidden text-[12px] text-white/55 wide:block">{caption}</div>
        </div>
      </div>
    </motion.div>
  );
}

function FamilyLabels({ progress }: { progress: MotionValue<number> }) {
  const opacity = useWindow(progress, [0.52, 0.56, 0.61, 0.64]);
  const y = useTransform(progress, [0.52, 0.56], [8, 0]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 hidden wide:block">
      {FAMILY_LABELS.map((l) => (
        <div key={l.name} style={at(l.x, l.y)} className="absolute -translate-x-1/2 -translate-y-1/2">
          <span className="glass whitespace-nowrap rounded-full px-3 py-1 text-[11px] tracking-[0.06em] text-white/75">
            {l.name}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Copy                                                                      */
/* -------------------------------------------------------------------------- */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] text-accent/90 ka:tracking-[0.1em]">
      <span className="h-px w-6 bg-gradient-to-r from-accent to-accent/0" />
      {children}
    </div>
  );
}

function Point({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-t border-white/[0.07] py-4 ka:py-3 ka:wide:py-4">
      <span className="pt-[3px] text-[11px] font-medium tabular-nums tracking-[0.12em] text-accent/80">{n}</span>
      <p className="text-[15px] leading-relaxed text-white/60 wide:text-[16px]">{children}</p>
    </div>
  );
}

const sideBlock = "wide:w-[min(420px,29vw)]";
const headline = "text-heading font-semibold tracking-tightest leading-[1.02] ka:tracking-tight ka:leading-[1.12]";
const sectionTitle = "text-[clamp(2.25rem,4.2vw,4rem)] ka:text-[clamp(1.625rem,3.3vw,3.25rem)]";

/* -------------------------------------------------------------------------- */
/*  Story                                                                     */
/* -------------------------------------------------------------------------- */

export default function CardStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(0);
  const { t } = useLang();

  const { scrollYProgress: progress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const onLoadProgress = useCallback((n: number) => setLoaded(n), []);

  // Ambient warm glow: present in the hero, recedes, warms up for benefits, settles for the finale.
  const glow = useTransform(progress, [0, 0.15, 0.3, 0.5, 0.65, 0.8, 0.92, 1], [0.8, 0.45, 0.3, 1, 0.75, 0.35, 0.7, 0.7]);
  const glowX = useTransform(progress, [0, 0.19, 0.45, 0.62, 0.7, 0.92], [50, 65, 34, 34, 66, 50]);
  const glowBg = useMotionTemplate`radial-gradient(42% 46% at ${glowX}% 55%, rgba(150,170,195,0.07), rgba(10,14,20,0.05) 55%, transparent 75%)`;
  const cue = useTransform(progress, [0, 0.04], [1, 0]);

  return (
    <section id="story" ref={sectionRef} className="relative h-[500svh]">
      {/* Nav anchors, positioned at story progress */}
      {NAV.map((n) => (
        <div
          key={n.id}
          id={n.id}
          aria-hidden
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: `calc((100% - 100svh) * ${n.at})` }}
        />
      ))}

      <div className="sticky top-0 h-[100svh] overflow-hidden bg-void">
        <SequenceCanvas progress={progress} stageRef={stageRef} onLoadProgress={onLoadProgress} />

        {/* Frame-space overlays */}
        <div ref={stageRef} className="pointer-events-none absolute left-0 top-0 origin-top-left">
          <HeroSweep progress={progress} />
          <CardTrace progress={progress} />
          <Callout
            {...FRONT_CARD.chip}
            side="left"
            label={t.callouts.chip.label}
            caption={t.callouts.chip.caption}
            progress={progress}
            win={[0.7, 0.735, 0.81, 0.845]}
          />
          <Callout
            {...FRONT_CARD.contactless}
            side="right"
            label={t.callouts.contactless.label}
            caption={t.callouts.contactless.caption}
            progress={progress}
            win={[0.72, 0.755, 0.81, 0.845]}
          />
          <FamilyLabels progress={progress} />
        </div>

        {/* Atmosphere */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: glow, background: glowBg }} />
        <div aria-hidden className="grid-hints pointer-events-none absolute inset-0 mx-auto max-w-[1280px] px-6 wide:px-10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[18svh] bg-gradient-to-t from-void via-void/70 to-transparent" />

        {/* ------------------------------ Copy ------------------------------ */}
        <div className="absolute inset-0">
          {/* Hero 0–15% */}
          <Beat progress={progress} win={[0, 0, 0.08, 0.13]} className="absolute inset-x-6 top-[15svh] text-center wide:top-[14svh]">
            <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.12, delayChildren: 0.25 }}>
              <motion.p
                variants={rise}
                className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-accent/90"
              >
                {t.hero.eyebrow}
              </motion.p>
              <motion.h1
                variants={rise}
                className={`${headline} mx-auto text-[clamp(2.75rem,min(7vw,11svh),6.5rem)] ka:text-[clamp(2.125rem,min(5.6vw,9svh),5.25rem)]`}
              >
                {t.hero.title}
              </motion.h1>
              <motion.p variants={rise} className="mt-4 text-[clamp(1.125rem,1.6vw,1.5rem)] font-medium tracking-tight text-white/85">
                {t.hero.tagline}
              </motion.p>
              <motion.p variants={rise} className="mx-auto mt-3 max-w-[460px] text-[15px] leading-relaxed text-white/55 wide:text-[17px]">
                {t.hero.body}
              </motion.p>
            </motion.div>
          </Beat>

          {/* Craftsmanship 15–40% — copy left, card right */}
          <Beat
            progress={progress}
            win={[0.17, 0.22, 0.35, 0.4]}
            from="left"
            className={`absolute inset-x-6 bottom-[8svh] wide:inset-x-auto wide:bottom-auto wide:left-[6vw] wide:top-1/2 wide:-translate-y-1/2 ${sideBlock}`}
          >
            <Reveal i={0}><Eyebrow>{t.craft.eyebrow}</Eyebrow></Reveal>
            <Reveal i={1}>
              <h2 className={`${headline} ${sectionTitle}`}>{t.craft.title}</h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 text-[16px] leading-relaxed text-white/60 wide:text-[17px]">
                {t.craft.body1}
              </p>
            </Reveal>
            <Reveal i={3} className="hidden wide:block">
              <p className="mt-3 text-[17px] leading-relaxed text-white/60">
                {t.craft.body2}
              </p>
            </Reveal>
            <Reveal i={4} className="mt-7 hidden gap-2 wide:flex">
              {t.craft.chips.map((chip) => (
                <span key={chip} className="glass rounded-full px-3 py-1 text-[11px] tracking-[0.04em] text-white/70">
                  {chip}
                </span>
              ))}
            </Reveal>
          </Beat>

          {/* Benefits 40–65% — copy right, cards left */}
          <Beat
            progress={progress}
            win={[0.44, 0.49, 0.6, 0.645]}
            from="right"
            className={`absolute inset-x-6 bottom-[6svh] wide:inset-x-auto wide:bottom-auto wide:right-[6vw] wide:top-1/2 wide:-translate-y-1/2 ${sideBlock}`}
          >
            <Reveal i={0}><Eyebrow>{t.benefits.eyebrow}</Eyebrow></Reveal>
            <Reveal i={1}>
              <h2 className={`${headline} ${sectionTitle}`}>{t.benefits.title}</h2>
            </Reveal>
            <div className="mt-6">
              {t.benefits.points.map((point, i) => (
                <Reveal key={i} i={i + 2}>
                  <Point n={String(i + 1).padStart(2, "0")}>{point}</Point>
                </Reveal>
              ))}
            </div>
          </Beat>

          {/* Security 65–85% — copy left, cards right */}
          <Beat
            progress={progress}
            win={[0.69, 0.74, 0.81, 0.85]}
            from="left"
            className={`absolute inset-x-6 bottom-[6svh] wide:inset-x-auto wide:bottom-auto wide:left-[6vw] wide:top-1/2 wide:-translate-y-1/2 ${sideBlock}`}
          >
            <Reveal i={0}><Eyebrow>{t.security.eyebrow}</Eyebrow></Reveal>
            <Reveal i={1}>
              <h2 className={`${headline} ${sectionTitle}`}>{t.security.title}</h2>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 text-[16px] leading-relaxed text-white/60 wide:text-[17px]">
                {t.security.body1}
              </p>
            </Reveal>
            <Reveal i={3}>
              <p className="mt-3 text-[16px] leading-relaxed text-white/60 wide:text-[17px]">
                {t.security.body2}
              </p>
            </Reveal>
            <Reveal i={4} className="hidden wide:block">
              <p className="mt-3 text-[17px] leading-relaxed text-white/60">
                {t.security.body3}
              </p>
            </Reveal>
          </Beat>

          {/* Final CTA 85–100% */}
          <Beat
            progress={progress}
            win={[0.89, 0.94, 1, 1]}
            className="absolute inset-x-6 bottom-[7svh] text-center"
          >
            <Reveal i={0}>
              <h2 className={`${headline} mx-auto text-[clamp(2.25rem,min(5vw,7.5svh),4.75rem)] ka:text-[clamp(1.75rem,min(4.2vw,6.5svh),4rem)]`}>{t.final.title}</h2>
            </Reveal>
            <Reveal i={1}>
              <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-relaxed text-white/60 wide:text-[18px]">
                {t.final.body}
              </p>
            </Reveal>
            <Reveal i={2} className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-7">
              <a href={APPLY_URL} className="btn-accent btn-accent-lg px-8 py-3.5 text-[15px]">
                {t.applyNow}
              </a>
              <a
                href="#benefits"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("benefits");
                }}
                className="link-underline text-[15px] font-medium text-white/75 hover:text-white"
              >
                {t.final.explore} <span aria-hidden>›</span>
              </a>
            </Reveal>
            <Reveal i={3}>
              <p className="mt-6 text-[11px] tracking-wide text-white/35">
                {t.final.terms}
              </p>
            </Reveal>
          </Beat>
        </div>

        {/* Scroll cue + loading state */}
        <motion.div
          style={{ opacity: cue }}
          className="pointer-events-none absolute inset-x-0 bottom-[3.5svh] flex flex-col items-center gap-3"
        >
          <span className="text-[10px] uppercase tracking-[0.32em] text-white/40 ka:tracking-[0.12em]">
            {loaded < 84 ? t.loading(Math.round((loaded / 84) * 100)) : t.scrollCue}
          </span>
          <span className="scroll-cue relative block h-9 w-px overflow-hidden bg-white/10" />
        </motion.div>
      </div>
    </section>
  );
}

const rise = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.1, ease } },
};
