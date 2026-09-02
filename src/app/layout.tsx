import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "FarmDirect — Direct Farmer to Consumer Digital Mandi | SIH 2026",
  description:
    "Ministry of Consumer Affairs, Food & Public Distribution SIH 2026 Solution: Eliminate Aadhtiya middlemen so farmers earn 100% fair prices and consumers buy 30% cheaper.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} ${plexMono.variable}`}
    >
      <body className="bg-[#FAF8F5] text-[#1C2521] font-sans antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="bg-[#1E392A] text-white py-10 mt-16 border-t border-[#2F5942]">
              <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-serif text-xl font-bold text-white">
                      FarmDirect
                    </span>
                    <span className="bg-[#C25E00] text-white text-[11px] px-2 py-0.5 rounded font-bold">
                      SIH 2026
                    </span>
                  </div>
                  <p className="text-xs text-[#C5D1CA] leading-relaxed">
                    Direct Farmer-to-Consumer Digital Marketplace sponsored by the{" "}
                    <strong className="text-white">
                      Ministry of Consumer Affairs, Food & Public Distribution
                    </strong>
                    . Eliminating APMC Aadhtiya middlemen.
                  </p>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm mb-3 text-emerald-300">
                    Farmer Portal • किसान
                  </h4>
                  <ul className="text-xs text-[#C5D1CA] space-y-2">
                    <li>
                      <a href="/farmer/dashboard" className="hover:text-white">
                        My Harvest Dashboard (मेरी फसल)
                      </a>
                    </li>
                    <li>
                      <a href="/farmer/add-product" className="hover:text-white">
                        List Produce for Sale (नई फसल बेचें)
                      </a>
                    </li>
                    <li>
                      <a href="/farmer/dashboard" className="hover:text-white">
                        Manage Direct Orders (ऑर्डर प्रबंधन)
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm mb-3 text-amber-300">
                    Consumer Mandi • ग्राहक
                  </h4>
                  <ul className="text-xs text-[#C5D1CA] space-y-2">
                    <li>
                      <a href="/marketplace" className="hover:text-white">
                        Browse Fresh Mandi Listings
                      </a>
                    </li>
                    <li>
                      <a href="/consumer/dashboard" className="hover:text-white">
                        Track Orders & Middleman Savings
                      </a>
                    </li>
                    <li>
                      <a href="/marketplace?category=vegetable" className="hover:text-white">
                        Desi Organic Vegetables (सब्जियां)
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm mb-3 text-emerald-300">
                    MoCA Governance • मंत्रालय
                  </h4>
                  <p className="text-xs text-[#C5D1CA] mb-2">
                    Full Flask REST API (/backend) + Next.js App Router fullstack platform with APMC Mandi fair-price verification.
                  </p>
                  <a
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A4D3B] hover:bg-[#345F49] text-xs font-bold text-white transition-colors"
                  >
                    Launch Admin Moderation Panel →
                  </a>
                </div>
              </div>
              <div className="max-w-[1280px] mx-auto px-4 pt-6 mt-6 border-t border-[#2B4F3A] flex flex-wrap items-center justify-between text-xs text-[#A3B8AD]">
                <span>© 2026 FarmDirect • Smart India Hackathon Prototype</span>
                <span>Both /backend (Flask + SQLite) & /frontend (React) included</span>
              </div>
            </footer>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
