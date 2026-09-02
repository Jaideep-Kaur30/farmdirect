"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sprout,
  ShoppingBag,
  Tractor,
  ShieldCheck,
  Bell,
  Globe,
  UserCheck,
  Menu,
  X,
  RefreshCw,
  PlusCircle,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, switchDemoPersona } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [resettingDb, setResettingDb] = useState(false);
  const [notifCount, setNotifCount] = useState(3);

  const handleResetDemoData = async () => {
    setResettingDb(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      window.location.reload();
    } finally {
      setResettingDb(false);
    }
  };

  // Role-specific Navigation Links so Consumers only see Consumer items & Farmers see Farmer items
  const getNavLinks = () => {
    if (user?.role === "farmer") {
      return [
        {
          href: "/farmer/dashboard",
          labelEn: "Farmer Dashboard",
          labelHi: "किसान डैशबोर्ड",
          icon: Tractor,
        },
        {
          href: "/farmer/add-product",
          labelEn: "+ List Harvest",
          labelHi: "+ नई फसल बेचें",
          icon: PlusCircle,
        },
        {
          href: "/marketplace",
          labelEn: "View Live Mandi",
          labelHi: "मंडी बाज़ार देखें",
          icon: ShoppingBag,
        },
      ];
    }
    if (user?.role === "admin") {
      return [
        {
          href: "/admin/dashboard",
          labelEn: "MoCA Admin Panel",
          labelHi: "मंत्रालय एडमिन पैनल",
          icon: ShieldCheck,
        },
        {
          href: "/marketplace",
          labelEn: "Audit Marketplace",
          labelHi: "मंडी बाज़ार जांच",
          icon: ShoppingBag,
        },
      ];
    }
    // Default Consumer
    return [
      {
        href: "/marketplace",
        labelEn: "Mandi Marketplace",
        labelHi: "ताज़ा मंडी बाज़ार",
        icon: ShoppingBag,
      },
      {
        href: "/consumer/dashboard",
        labelEn: "My Orders & Savings",
        labelHi: "मेरे ऑर्डर व बचत",
        icon: ShoppingBag,
      },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-[#1E392A] text-white shadow-md border-b border-[#2d523d]">
      {/* Top SIH 2026 Judge Demo Banner */}
      <div className="bg-[#122319] px-3 py-1.5 text-xs border-b border-[#244633]">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#C25E00] text-white font-bold px-2 py-0.5 rounded text-[11px] tracking-wide">
              SIH 2026 • MoCA SPONSORED
            </span>
            <span className="text-[#C5D1CA] hidden sm:inline">
              {lang === "HI"
                ? "बिचौलिया आढ़तिया मुक्त डिजिटल मंडी प्रदर्शन"
                : "Aadhtiya-Free Direct Farmer-to-Consumer Digital Mandi"}
            </span>
          </div>

          {/* 1-Click Judge Role Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#C5D1CA] text-[11px] font-medium mr-1">
              {lang === "HI" ? "डेमो रोल बदलें:" : "Switch Role:"}
            </span>
            <button
              onClick={() => switchDemoPersona("farmer")}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                user?.role === "farmer"
                  ? "bg-[#16A34A] text-white ring-2 ring-emerald-300"
                  : "bg-[#254634] text-[#C5D1CA] hover:bg-[#2F5942]"
              }`}
            >
              🌾 {lang === "HI" ? "किसान (हरभजन सिंह)" : "Farmer (Harbhajan Singh)"}
            </button>
            <button
              onClick={() => switchDemoPersona("consumer")}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                user?.role === "consumer"
                  ? "bg-[#C25E00] text-white ring-2 ring-amber-300"
                  : "bg-[#254634] text-[#C5D1CA] hover:bg-[#2F5942]"
              }`}
            >
              🛒 {lang === "HI" ? "ग्राहक (मीरा शर्मा)" : "Consumer (Meera Sharma)"}
            </button>
            <button
              onClick={() => switchDemoPersona("admin")}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                user?.role === "admin"
                  ? "bg-[#D97706] text-white ring-2 ring-yellow-300"
                  : "bg-[#254634] text-[#C5D1CA] hover:bg-[#2F5942]"
              }`}
            >
              🏛️ {lang === "HI" ? "मंडी निदेशक (एडमिन)" : "MoCA Admin"}
            </button>

            <button
              onClick={handleResetDemoData}
              disabled={resettingDb}
              title="Reset Database to 22 Crops & 12 Demo Orders"
              className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 bg-[#2A4D3B] hover:bg-[#345F49] text-emerald-200 rounded text-[11px]"
            >
              <RefreshCw className={`w-3 h-3 ${resettingDb ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">Reset Demo DB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#16A34A] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-white block leading-none">
              FarmDirect
            </span>
            <span className="text-[11px] text-[#A3B8AD] tracking-wider uppercase">
              {lang === "HI" ? "किसान से सीधा घर" : "Kisan Direct Market"}
            </span>
          </div>
        </Link>

        {/* Desktop Links (Filtered strictly by logged-in Role) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#16A34A] text-white shadow-xs"
                    : "text-[#DCE4DF] hover:bg-[#294B37] hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {lang === "HI" ? item.labelHi : item.labelEn}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Bilingual EN/HI Toggle + Notification Bell + Active Role Pill */}
        <div className="flex items-center gap-2">
          {/* EN/HI Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#2A4D3B] hover:bg-[#345F49] text-xs font-bold text-white border border-[#3E6C54] transition-colors"
            title="Toggle English / Hindi (किसान भाषा)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-300" />
            <span className={lang === "EN" ? "text-white" : "text-emerald-300/70"}>EN</span>
            <span className="text-white/40">/</span>
            <span className={lang === "HI" ? "text-amber-300 underline" : "text-white/70"}>
              हिन्दी
            </span>
          </button>

          {/* In-App Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifModal(!showNotifModal)}
              className="p-2 rounded-lg bg-[#2A4D3B] hover:bg-[#345F49] text-white relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C25E00] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>

            {showNotifModal && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-[#1C2521] rounded-2xl shadow-xl border border-[#DCE4DF] p-4 z-50">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <span className="font-serif font-bold text-sm text-[#1E392A]">
                    {lang === "HI" ? "मंडी एवं ऑर्डर सूचनाएं" : "Live Mandi & Order Alerts"}
                  </span>
                  <button
                    onClick={() => {
                      setNotifCount(0);
                      setShowNotifModal(false);
                    }}
                    className="text-xs text-[#16A34A] font-semibold hover:underline"
                  >
                    {lang === "HI" ? "सभी पढ़ें" : "Mark all read"}
                  </button>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <p className="font-bold text-[#1E392A]">
                      🌾 New Direct Order Received!
                    </p>
                    <p className="text-[#5D6B63] mt-0.5">
                      Meera Sharma ordered 10 kg Desi Organic Tomatoes from Harbhajan Singh.
                    </p>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                      Save ₹180 middleman commission
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <p className="font-bold text-[#9A3412]">
                      📢 APMC Mandi Price Alert
                    </p>
                    <p className="text-[#5D6B63] mt-0.5">
                      Lasalgaon Red Onions APMC retail price updated to ₹38/kg. FarmDirect direct rate is ₹24/kg.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active User Badge showing Role */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2 bg-[#122319] px-3 py-1.5 rounded-full border border-[#244633]">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-xs font-semibold block text-white leading-none">
                  {user.name.split(" ")[0]}
                </span>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wide font-bold">
                  ROLE: {user.role.toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors"
            >
              {lang === "HI" ? "लॉगिन करें" : "Login"}
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg bg-[#2A4D3B] text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#122319] border-t border-[#244633] px-4 py-3 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-[#1E392A]"
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                {lang === "HI" ? item.labelHi : item.labelEn}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
