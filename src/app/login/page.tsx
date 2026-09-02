"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Sprout, Tractor, ShoppingBag, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, switchDemoPersona } = useAuth();
  const { lang } = useLanguage();

  const [phone, setPhone] = useState("9876543210");
  const [password, setPassword] = useState("farmer123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await loginWithCredentials(phone, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Login failed");
      return;
    }

    if (phone === "9876543210" || phone.startsWith("98765")) {
      router.push("/farmer/dashboard");
    } else {
      router.push("/marketplace");
    }
  };

  const handleInstantJudgeLogin = async (
    role: "farmer" | "consumer" | "admin",
    targetRoute: string
  ) => {
    await switchDemoPersona(role);
    router.push(targetRoute);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-[#DCE4DF] p-6 sm:p-8 shadow-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center mx-auto mb-3">
            <Sprout className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1E392A]">
            {lang === "HI" ? "FarmDirect लॉगिन" : "Login to FarmDirect"}
          </h1>
          <p className="text-xs text-[#5D6B63] mt-1">
            SIH 2026 Direct Farmer-to-Consumer Digital Mandi
          </p>
        </div>

        {/* 1-Click Judge Demo Persona Cards */}
        <div className="mb-6 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C25E00] block text-center">
            ⚡ SIH 2026 Instant Demo Credentials (Click to Login)
          </span>

          <button
            type="button"
            onClick={() => handleInstantJudgeLogin("farmer", "/farmer/dashboard")}
            className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-left flex items-center justify-between transition-colors"
          >
            <div>
              <span className="text-xs font-bold text-[#1E392A] block">
                🌾 Farmer Persona (Sardar Harbhajan Singh)
              </span>
              <span className="text-[11px] text-[#5D6B63]">
                Phone: 9876543210 • Password: farmer123
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#16A34A] text-white text-[11px] font-bold">
              Enter Farmer →
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleInstantJudgeLogin("consumer", "/marketplace")}
            className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-left flex items-center justify-between transition-colors"
          >
            <div>
              <span className="text-xs font-bold text-[#1E392A] block">
                🛒 Consumer Persona (Meera Sharma)
              </span>
              <span className="text-[11px] text-[#5D6B63]">
                Phone: 9811111111 • Password: consumer123
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#C25E00] text-white text-[11px] font-bold">
              Enter Consumer →
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleInstantJudgeLogin("admin", "/admin/dashboard")}
            className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-300 text-left flex items-center justify-between transition-colors"
          >
            <div>
              <span className="text-xs font-bold text-[#1E392A] block">
                🏛️ Ministry of Consumer Affairs Admin
              </span>
              <span className="text-[11px] text-[#5D6B63]">
                Phone: 9999999999 • Password: admin123
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#1E392A] text-white text-[11px] font-bold">
              Enter Admin →
            </span>
          </button>
        </div>

        <div className="relative my-6 text-center">
          <span className="bg-white px-3 text-xs text-[#5D6B63]">
            Or enter phone number & password
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-1">
              Phone Number (10 digits)
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-xs text-[#5D6B63] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-[#16A34A] hover:underline">
            Register as Farmer or Consumer
          </Link>
        </p>
      </div>
    </div>
  );
}
