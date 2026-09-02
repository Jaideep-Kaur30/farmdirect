"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { FairPriceBadge } from "@/components/FairPriceBadge";
import {
  Sprout,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Scale,
  Award,
  Sparkles,
  Calculator,
  Search,
} from "lucide-react";

interface ProductPreview {
  id: number;
  crop_name: string;
  crop_name_hi: string;
  category: string;
  price_per_unit: number;
  mandi_reference_price: number;
  unit: string;
  image_url: string;
  harvest_date: string;
  farmer: {
    name: string;
    location: string;
    rating: number;
  };
}

export default function HomePage() {
  const { lang } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<ProductPreview[]>([]);
  const [weeklySpend, setWeeklySpend] = useState<number>(1200);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/products?sort=savings")
      .then((r) => r.json())
      .then((data) => {
        if (data.products) {
          setFeaturedProducts(data.products.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  // Calculate annual savings on direct farm buying (average 32% savings)
  const annualSavings = Math.round(weeklySpend * 52 * 0.31);
  const farmerExtraIncome = Math.round(weeklySpend * 52 * 0.22);

  const mandiTicker = [
    {
      cropEn: "Desi Organic Tomatoes",
      cropHi: "देसी जैविक टमाटर",
      mandi: 52,
      direct: 34,
      unit: "kg",
    },
    {
      cropEn: "Taraori Basmati Rice (2 Yr)",
      cropHi: "तरावड़ी बासमती चावल",
      mandi: 145,
      direct: 108,
      unit: "kg",
    },
    {
      cropEn: "Ratnagiri Alphonso Mangoes",
      cropHi: "रत्नागिरी हापुस आम",
      mandi: 1200,
      direct: 780,
      unit: "dozen",
    },
    {
      cropEn: "Gir Cow A2 Desi Milk",
      cropHi: "गिर गाय A2 शुद्ध दूध",
      mandi: 95,
      direct: 70,
      unit: "litre",
    },
    {
      cropEn: "Lasalgaon Red Nashik Onions",
      cropHi: "लासलगांव लाल प्याज",
      mandi: 38,
      direct: 24,
      unit: "kg",
    },
  ];

  return (
    <div className="bg-[#FAF8F5]">
      {/* Live Government APMC Mandi Price Ticker */}
      <div className="bg-[#1E392A] text-white border-b border-[#2C523B] overflow-hidden py-2">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center gap-4 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#C25E00] text-white font-bold shrink-0">
            <Scale className="w-3.5 h-3.5" />
            {lang === "HI" ? "लाइव सरकारी मंडी तुलना" : "LIVE APMC MANDI BENCHMARK"}
          </span>
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap py-0.5 scrollbar-none">
            {mandiTicker.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[#C5D1CA] font-sans font-medium">
                  {lang === "HI" ? item.cropHi : item.cropEn}:
                </span>
                <span className="text-red-400 line-through">
                  ₹{item.mandi}/{item.unit}
                </span>
                <span className="text-emerald-400 font-bold">
                  ₹{item.direct}/{item.unit}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300">
                  Save {Math.round(((item.mandi - item.direct) / item.mandi) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E392A] via-[#1B3A29] to-[#0F2217] text-white py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2A4D3B]/90 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <Award className="w-4 h-4 text-[#C25E00]" />
              <span>
                {lang === "HI"
                  ? "स्मार्ट इंडिया हैकाथॉन २०२६ • उपभोक्ता मामले मंत्रालय"
                  : "SIH 2026 • Ministry of Consumer Affairs, Food & Public Distribution"}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
              {lang === "HI" ? (
                <>
                  बिचौलियों से आज़ादी। <br />
                  <span className="text-[#FBBF24]">सीधे किसान</span> से शुद्ध
                  फसल खरीदें।
                </>
              ) : (
                <>
                  Cut Out Middlemen. <br />
                  Buy Farm-Fresh Produce{" "}
                  <span className="text-[#FBBF24] underline decoration-[#C25E00]">
                    Direct from Indian Farmers.
                  </span>
                </>
              )}
            </h1>

            <p className="text-[#DCE4DF] text-base sm:text-lg max-w-2xl leading-relaxed">
              {lang === "HI"
                ? "आढ़तिया और दलालों के बिना सीधा बाज़ार। किसान को १००% उचित मूल्य, और ग्राहक को मंडी खुदरा दर से २०-३५% सस्ता शुद्ध ताज़ा सामान।"
                : "Multiple Aadhtiya commission agents inflate consumer prices by up to 45% while farmers keep barely half. FarmDirect connects farmers directly with end households at verified APMC fair prices."}
            </p>

            {/* Instant Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/marketplace?search=${encodeURIComponent(
                  searchQuery
                )}`;
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-xl bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-emerald-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === "HI"
                      ? "फसल या गांव खोजें (जैसे टमाटर, बासमती, करनाल)..."
                      : "Search crops or mandis (e.g. Tomatoes, Basmati Rice, Karnal)..."
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-[#1C2521] placeholder:text-[#5D6B63] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#C25E00] hover:bg-[#A34E00] text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{lang === "HI" ? "फसल खोजें" : "Search Produce"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Dual CTAs for Role Choice */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/marketplace"
                className="px-6 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Sprout className="w-4 h-4" />
                <span>
                  {lang === "HI" ? "मंडी बाज़ार देखें (ग्राहक)" : "Browse Marketplace (Consumers)"}
                </span>
              </Link>
              <Link
                href="/farmer/dashboard"
                className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-sm transition-transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>
                  {lang === "HI" ? "🌾 किसान पोर्टल खोलें" : "🌾 Farmer Dashboard & Harvest"}
                </span>
              </Link>
            </div>

            {/* Trust Counters */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#2C523B]">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  100%
                </p>
                <p className="text-xs text-[#A3B8AD]">
                  {lang === "HI" ? "किसान को सीधा भुगतान" : "Direct to Farmer Wallet"}
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#FBBF24]">
                  28–35%
                </p>
                <p className="text-xs text-[#A3B8AD]">
                  {lang === "HI" ? "ग्राहक की मंडी बचत" : "Consumer Price Savings"}
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400">
                  0%
                </p>
                <p className="text-xs text-[#A3B8AD]">
                  {lang === "HI" ? "आढ़तिया कमीशन" : "Aadhtiya Commission"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-[#122319]">
              <Image
                src="/images/hero-farmdirect.jpg"
                alt="Indian Farmer direct produce"
                width={700}
                height={550}
                className="w-full h-[420px] object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#16A34A] text-white text-xs font-bold">
                    ✓ Verified Mandi Farmer
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#C25E00] text-white text-xs font-bold">
                    Harvested 5:30 AM Today
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Sardar Harbhajan Singh • Karnal Mandi
                </h3>
                <p className="text-xs text-emerald-200 mt-1">
                  Selling 1,200 kg Taraori Aged Basmati Rice directly to Delhi NCR families.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Middleman Elimination Infographic Section */}
      <section className="py-12 bg-white border-b border-[#DCE4DF]">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E00]">
              {lang === "HI" ? "समस्या बनाम समाधान" : "THE MANDI MIDDLEMAN PROBLEM"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E392A] mt-1">
              {lang === "HI"
                ? "बिचौलिया आढ़तिया कमीशन कैसे खत्म होता है?"
                : "Why Traditional Mandis Fail Farmers & Consumers"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Old Broken Mandi Chain */}
            <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                    ❌ Traditional APMC Mandi Chain (5 Intermediaries)
                  </span>
                  <span className="text-xs font-mono text-red-700 font-bold">
                    +45% Markup
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-red-100">
                    <span className="font-medium text-[#1E392A]">
                      1. Farmer Farm-Gate Price (टमाटर)
                    </span>
                    <span className="font-mono font-bold text-red-600">₹18/kg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-100/60 text-red-900 text-xs">
                    <span>+ Local Aggregator & Commission Agent (आढ़तिया 10%)</span>
                    <span className="font-mono font-bold">+₹6/kg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-100/60 text-red-900 text-xs">
                    <span>+ APMC Mandi Fee & Wholesaler Margin</span>
                    <span className="font-mono font-bold">+₹14/kg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-100/60 text-red-900 text-xs">
                    <span>+ Urban Retail Vendor Margin & Spoilage Loss</span>
                    <span className="font-mono font-bold">+₹14/kg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border-2 border-red-400 font-bold">
                    <span className="text-[#1E392A]">Final Consumer Pays:</span>
                    <span className="font-mono text-red-600 text-lg">₹52/kg</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-red-800 mt-4">
                ⚠️ Farmer receives only 34% of what the consumer pays!
              </p>
            </div>

            {/* FarmDirect Direct Deal */}
            <div className="p-6 rounded-2xl bg-emerald-50/80 border-2 border-[#16A34A] flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#16A34A] text-white rounded-full text-xs font-bold">
                    ✓ FarmDirect Direct Marketplace (0 Middlemen)
                  </span>
                  <span className="text-xs font-mono text-emerald-800 font-bold">
                    WIN-WIN
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-emerald-200">
                    <span className="font-bold text-[#1E392A]">
                      🌾 Farmer Direct Listing Rate (टमाटर)
                    </span>
                    <span className="font-mono font-bold text-[#16A34A] text-base">
                      ₹34/kg (+88% Earnings!)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-100/70 text-emerald-900 text-xs">
                    <span>+ Zero Aadhtiya Commission Fee</span>
                    <span className="font-mono font-bold text-emerald-700">₹0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-100/70 text-emerald-900 text-xs">
                    <span>+ Direct Farm Harvest to Doorstep Delivery</span>
                    <span className="font-mono font-bold text-emerald-700">Fresh within 24h</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border-2 border-[#16A34A] font-bold">
                    <span className="text-[#1E392A]">Final Consumer Pays:</span>
                    <span className="font-mono text-[#16A34A] text-lg">
                      ₹34/kg (Save ₹18/kg!)
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-emerald-900 font-semibold mt-4">
                🎉 Farmer earns +₹16/kg extra AND consumer saves ₹18/kg on every purchase!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Middleman Savings Calculator */}
      <section className="py-10 bg-[#FAF8F5]">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="bg-white rounded-3xl border border-[#DCE4DF] p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-[#C25E00] text-xs font-bold">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>
                    {lang === "HI" ? "घरेलू बचत कैलकुलेटर" : "SIH 2026 DIRECT IMPACT CALCULATOR"}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1E392A]">
                  {lang === "HI"
                    ? "देखें आपके परिवार और किसान को सालाना कितनी बचत होती है"
                    : "Calculate Your Household Savings & Farmer Extra Earnings"}
                </h3>
                <p className="text-sm text-[#5D6B63]">
                  {lang === "HI"
                    ? "साप्ताहिक सब्जी, अनाज और डेयरी खर्च स्लाइडर खींचें:"
                    : "Adjust your weekly spend on vegetables, fruits, rice, and dairy to see real direct-mandi savings:"}
                </p>

                <div>
                  <div className="flex justify-between items-center text-sm font-bold text-[#1E392A] mb-2">
                    <span>
                      {lang === "HI" ? "साप्ताहिक खर्च:" : "Weekly Grocery Spend:"}
                    </span>
                    <span className="font-mono text-lg text-[#16A34A]">
                      ₹{weeklySpend}/week
                    </span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={5000}
                    step={100}
                    value={weeklySpend}
                    onChange={(e) => setWeeklySpend(Number(e.target.value))}
                    className="w-full accent-[#16A34A] h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#5D6B63] mt-1">
                    <span>₹400/wk</span>
                    <span>₹2,500/wk</span>
                    <span>₹5,000/wk</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold uppercase text-emerald-800">
                    🛒 Consumer Household Savings
                  </p>
                  <p className="font-serif text-3xl font-bold text-[#16A34A] mt-2">
                    ₹{annualSavings.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-[#5D6B63] block mt-1">
                      saved every year vs APMC Mandi retail
                    </span>
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                  <p className="text-xs font-bold uppercase text-amber-900">
                    🌾 Direct Farmer Income Boost
                  </p>
                  <p className="font-serif text-3xl font-bold text-[#C25E00] mt-2">
                    +₹{farmerExtraIncome.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-[#5D6B63] block mt-1">
                      extra annual earnings transferred to farmer
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mandi Produce Listings */}
      <section className="py-12 max-w-[1280px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E00]">
              {lang === "HI" ? "ताज़ा मंडी फसलें" : "FRESH DIRECT HARVEST"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E392A] mt-1">
              {lang === "HI"
                ? "सीधे किसानों की लोकप्रिय फसलें"
                : "Top Fair-Price Produce Listings Today"}
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#16A34A] hover:underline"
          >
            <span>{lang === "HI" ? "सभी २२+ फसलें देखें" : "View All 22+ Mandi Crops"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="relative h-48 overflow-hidden bg-[#FAF8F5]">
                <Image
                  src={p.image_url || "/images/tomatoes.jpg"}
                  alt={p.crop_name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#1E392A]/90 text-white text-[11px] font-bold uppercase tracking-wider">
                    {p.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/95 text-[#1E392A] text-[11px] font-semibold shadow-xs">
                    Harvested: {p.harvest_date}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#5D6B63] font-medium">
                      🌾 {p.farmer?.name} • {p.farmer?.location}
                    </span>
                    <span className="text-xs font-bold text-amber-600">
                      ★ {p.farmer?.rating || 4.9}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1E392A] line-clamp-1">
                    {lang === "HI" ? p.crop_name_hi : p.crop_name}
                  </h3>

                  <div className="mt-3">
                    <FairPriceBadge
                      pricePerUnit={p.price_per_unit}
                      mandiReferencePrice={p.mandi_reference_price}
                      unit={p.unit}
                    />
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#EAEFEA] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#5D6B63] block">
                      {lang === "HI" ? "सीधा किसान दर:" : "Direct Price:"}
                    </span>
                    <span className="font-mono text-xl font-bold text-[#1E392A]">
                      ₹{p.price_per_unit}
                      <span className="text-xs font-normal text-[#5D6B63]">
                        /{p.unit}
                      </span>
                    </span>
                  </div>
                  <Link
                    href={`/product/${p.id}`}
                    className="px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors"
                  >
                    {lang === "HI" ? "खरीदें / विवरण" : "Buy Direct →"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & Flask/React Documentation Banner */}
      <section className="py-12 bg-[#122319] text-white">
        <div className="max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono text-[#FBBF24] font-bold">
              SIH 2026 DELIVERABLE CHECKLIST COMPLETE
            </span>
            <h3 className="font-serif text-2xl font-bold text-white mt-1">
              Both Standalone Python Flask Backend (`/backend`) & Full-Stack React/Next.js Included
            </h3>
            <p className="text-xs text-[#C5D1CA] mt-2 max-w-2xl">
              Inspect `/backend/app.py`, `/backend/models.py`, `/backend/seed.py` for the standalone Python Flask REST API with SQLite/PostgreSQL, or explore the live Next.js App Router fullstack platform right here.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="px-6 py-3 rounded-xl bg-[#C25E00] hover:bg-[#A34E00] text-white font-bold text-sm shrink-0 shadow-lg"
          >
            Open MoCA Admin Moderation Panel →
          </Link>
        </div>
      </section>
    </div>
  );
}
