import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Georgian } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Inter has no Georgian glyphs; Latin text still renders in Inter, Georgian falls through to Noto.
const georgian = Noto_Sans_Georgian({ subsets: ["georgian"], variable: "--font-georgian", display: "swap" });

export const metadata: Metadata = {
  title: "SOLO Business ბარათი — თქვენი ფული. ახალ დონეზე.",
  description:
    "მეტი, ვიდრე ბარათი. თქვენი სტილი. პრემიუმ ფინანსური გამოცდილება, შექმნილი იმისთვის, თუ როგორ ცხოვრობთ, ხარჯავთ და მოძრაობთ.",
};

export const viewport: Viewport = {
  themeColor: "#010205",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${inter.variable} ${georgian.variable}`}>
      <head>
        <link rel="preload" as="image" href="/frames/frame-001.webp" type="image/webp" />
      </head>
      <body className="bg-void font-sans">
        <SmoothScroll />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
