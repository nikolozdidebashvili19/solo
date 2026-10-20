"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "ka" | "en";

/** Georgian is what visitors see on entry; English is one tap away in the navbar. */
export const DEFAULT_LANG: Lang = "ka";
const STORAGE_KEY = "solo-lang";

const en = {
  nav: {
    overview: "Overview",
    benefits: "Benefits",
    rewards: "Rewards",
    security: "Security",
    features: "Features",
    apply: "Apply",
  },
  applyNow: "Apply Now",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  switchLang: "ქართული",
  switchLangLabel: "Switch to Georgian",

  hero: {
    eyebrow: "SOLO Business · Preferred",
    title: "Your Money. Elevated.",
    tagline: "More than a card. A statement.",
    body: "A premium financial experience designed around the way you live, spend, and move.",
  },
  craft: {
    eyebrow: "Design",
    title: "Precision in every detail.",
    body1: "Crafted with a refined finish, considered proportions, and a distinctive premium design.",
    body2: "Every detail is designed to deliver a seamless experience, wherever life takes you.",
    chips: ["EMV chip", "Contactless", "Mastercard®"],
  },
  benefits: {
    eyebrow: "Benefits",
    title: "Everyday spending, elevated.",
    points: [
      "Enjoy a premium payment experience wherever your card is accepted.",
      "Make eligible purchases with convenient contactless payments.",
      "Discover rewards and benefits designed around your lifestyle.",
    ],
  },
  security: {
    eyebrow: "Security",
    title: "Confidence in every transaction.",
    body1: "Designed to make everyday payments simple and convenient.",
    body2: "Manage your card and monitor eligible transactions through a seamless digital experience.",
    body3: "Experience modern payment technology with security features designed to help protect your account.",
  },
  final: {
    title: "A better way to move money.",
    body: "Designed for your lifestyle. Built for everyday possibilities.",
    explore: "Explore Card Benefits",
    terms: "Terms, eligibility requirements, fees, and conditions apply.",
  },
  callouts: {
    chip: { label: "EMV chip", caption: "Chip-enabled card payments" },
    contactless: { label: "Contactless", caption: "Tap to pay where accepted" },
  },
  loading: (pct: number) => `Loading ${pct}%`,
  scrollCue: "Scroll to explore",

  footer: {
    legal:
      "Terms, eligibility requirements, fees, and conditions apply. Card issuance is subject to approval. Benefits, rewards, and features vary by card and may change. Contactless payments are available where accepted. Mastercard and Visa are registered trademarks of their respective owners.",
    rights: "All rights reserved.",
  },
};

export type Dict = typeof en;

const ka: Dict = {
  nav: {
    overview: "მიმოხილვა",
    benefits: "უპირატესობები",
    rewards: "ჯილდოები",
    security: "უსაფრთხოება",
    features: "ფუნქციები",
    apply: "შეკვეთა",
  },
  applyNow: "შეუკვეთეთ",
  openMenu: "მენიუს გახსნა",
  closeMenu: "მენიუს დახურვა",
  switchLang: "English",
  switchLangLabel: "ინგლისურ ენაზე გადართვა",

  hero: {
    eyebrow: "SOLO Business · Preferred",
    title: "თქვენი ფული. ახალ დონეზე.",
    tagline: "მეტი, ვიდრე ბარათი. თქვენი სტილი.",
    body: "პრემიუმ ფინანსური გამოცდილება თქვენი ცხოვრების რიტმისთვის.",
  },
  craft: {
    eyebrow: "დიზაინი",
    title: "სიზუსტე ყველა დეტალში.",
    body1: "დახვეწილი ზედაპირი, გააზრებული პროპორციები და გამორჩეული პრემიუმ დიზაინი.",
    body2: "ყოველი დეტალი — უწყვეტი გამოცდილებისთვის, სადაც არ უნდა იყოთ.",
    chips: ["EMV ჩიპი", "უკონტაქტო", "Mastercard®"],
  },
  benefits: {
    eyebrow: "უპირატესობები",
    title: "ყოველდღიური ხარჯები, ახალ დონეზე.",
    points: [
      "პრემიუმ გადახდა ყველგან, სადაც ბარათი მიიღება.",
      "სწრაფი და მოსახერხებელი უკონტაქტო გადახდა.",
      "ჯილდოები და შეღავათები თქვენი ცხოვრების სტილისთვის.",
    ],
  },
  security: {
    eyebrow: "უსაფრთხოება",
    title: "ნდობა ყველა ტრანზაქციაში.",
    body1: "ყოველდღიური გადახდები — მარტივი და მოსახერხებელი.",
    body2: "მართეთ ბარათი და ადევნეთ თვალი ტრანზაქციებს ციფრულად.",
    body3: "თანამედროვე ტექნოლოგია და უსაფრთხოების ფუნქციები თქვენი ანგარიშის დასაცავად.",
  },
  final: {
    title: "ფულის მართვის უკეთესი გზა.",
    body: "თქვენი სტილისთვის. ყოველი დღისთვის.",
    explore: "ბარათის უპირატესობები",
    terms: "მოქმედებს პირობები, საკომისიოები და შესაბამისობის მოთხოვნები.",
  },
  callouts: {
    chip: { label: "EMV ჩიპი", caption: "ჩიპით გადახდა" },
    contactless: { label: "უკონტაქტო", caption: "შეეხეთ და გადაიხადეთ, სადაც მიიღება" },
  },
  loading: (pct: number) => `იტვირთება ${pct}%`,
  scrollCue: "გადაახვიეთ ქვემოთ",

  footer: {
    legal:
      "მოქმედებს წესები, შესაბამისობის მოთხოვნები, საკომისიოები და პირობები. ბარათის გაცემა ექვემდებარება დამტკიცებას. უპირატესობები, ჯილდოები და ფუნქციები განსხვავდება ბარათის მიხედვით და შეიძლება შეიცვალოს. უკონტაქტო გადახდა ხელმისაწვდომია იქ, სადაც ის მიიღება. Mastercard და Visa მათი შესაბამისი მფლობელების რეგისტრირებული სავაჭრო ნიშნებია.",
    rights: "ყველა უფლება დაცულია.",
  },
};

const DICTS: Record<Lang, Dict> = { ka, en };

const LangContext = createContext<{ lang: Lang; t: Dict; toggle: () => void }>({
  lang: DEFAULT_LANG,
  t: DICTS[DEFAULT_LANG],
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  // Restore an explicit choice from a previous visit.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "ka" || saved === "en") setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((l) => {
      const next = l === "ka" ? "en" : "ka";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return <LangContext.Provider value={{ lang, t: DICTS[lang], toggle }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
