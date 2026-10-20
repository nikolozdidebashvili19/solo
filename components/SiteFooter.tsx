import { BRAND } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="relative bg-void">
      <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-20 wide:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="text-[15px] font-semibold tracking-[0.32em] text-white/85">{BRAND}</div>
          <p className="max-w-[640px] text-[12px] leading-relaxed text-white/40">
            Terms, eligibility requirements, fees, and conditions apply. Card issuance is subject to approval.
            Benefits, rewards, and features vary by card and may change. Contactless payments are available where
            accepted. Mastercard and Visa are registered trademarks of their respective owners.
          </p>
        </div>
        <p className="mt-10 text-[11px] text-white/30">© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
      </div>
    </footer>
  );
}
