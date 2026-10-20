"use client";

import { useLang } from "@/lib/i18n";
import { BRAND } from "@/lib/site";

export default function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="relative bg-void">
      <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-20 wide:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="text-[15px] font-semibold tracking-[0.32em] text-white/85">{BRAND}</div>
          <p className="max-w-[640px] text-[12px] leading-relaxed text-white/40">
            {t.footer.legal}
          </p>
        </div>
        <p className="mt-10 text-[11px] text-white/30">© {new Date().getFullYear()} {BRAND}. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
