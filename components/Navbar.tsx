"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { APPLY_URL, BRAND, NAV, NavId, activeNav, scrollToId } from "@/lib/site";
import { useStoryProgress } from "@/lib/useStoryProgress";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const { scrollY } = useScroll();
  const progress = useStoryProgress();
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<NavId>("overview");
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 24));
  useMotionValueEvent(progress, "change", (p) => setActive(activeNav(p)));

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={false}
        animate={{
          backgroundColor: solid || open ? "rgba(1,2,5,0.72)" : "rgba(1,2,5,0)",
          borderColor: solid || open ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0)",
          backdropFilter: solid || open ? "saturate(180%) blur(20px)" : "saturate(100%) blur(0px)",
        }}
        transition={{ duration: 0.5, ease }}
        className="border-b"
        style={{ WebkitBackdropFilter: solid || open ? "saturate(180%) blur(20px)" : "none" }}
      >
        <nav className="mx-auto flex h-12 max-w-[1200px] items-center justify-between px-5 md:px-8">
          <a
            href="#overview"
            onClick={go("overview")}
            className="text-[15px] font-semibold tracking-[0.32em] text-white/90 transition-opacity hover:opacity-70"
          >
            {BRAND}
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  className={`relative py-1 text-[12px] tracking-[0.01em] transition-colors duration-300 ${
                    active === item.id ? "text-white" : "text-white/55 hover:text-white/90"
                  }`}
                >
                  {item.label}
                  {active === item.id && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
                      transition={{ duration: 0.5, ease }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a href={APPLY_URL} onClick={go("apply")} className="btn-accent px-4 py-1.5 text-[12px]">
              Apply Now
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="relative -mr-2 flex h-9 w-9 items-center justify-center md:hidden"
            >
              <span
                className={`absolute h-px w-4 bg-white/80 transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[3px]"}`}
              />
              <span
                className={`absolute h-px w-4 bg-white/80 transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[3px]"}`}
              />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease }}
              className="overflow-hidden px-5 md:hidden"
            >
              {NAV.map((item) => (
                <li key={item.id} className="border-t border-white/[0.06] first:border-t-0">
                  <a
                    href={`#${item.id}`}
                    onClick={go(item.id)}
                    className={`block py-3.5 text-[17px] font-medium tracking-tight ${
                      active === item.id ? "text-white" : "text-white/60"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="h-3" />
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Story progress hairline */}
      <motion.div
        aria-hidden
        className="h-px origin-left bg-gradient-to-r from-accent/0 via-accent/70 to-accent-light/80 transition-opacity duration-500"
        style={{ scaleX: progress, opacity: solid ? 1 : 0 }}
      />
    </header>
  );
}
