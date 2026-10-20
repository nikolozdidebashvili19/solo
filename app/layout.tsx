import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "SOLO Business Card — Your Money. Elevated.",
  description: "More than a card. A statement. A premium financial experience designed around the way you live, spend, and move.",
};

export const viewport: Viewport = {
  themeColor: "#010205",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preload" as="image" href="/frames/frame-001.webp" type="image/webp" />
      </head>
      <body className="bg-void font-sans">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
