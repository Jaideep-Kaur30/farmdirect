"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Tractor, ShoppingBag } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { lang } = useLanguage();

  const [role, setRole] = useState<"farmer" | "consumer">("farmer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          password,
          role,
          location: location || (role === "farmer" ? "Karnal Mandi, Haryana" : "New Delhi"),
          address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      localStorage.setItem("farmdirect_token", data.token);
      await refreshUser();
      if (role === "farmer") {
        router.push("/farmer/dashboard");
      } else {
        router.push("/marketplace");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-[#DCE4DF] p-6 sm:p-8 shadow-md">
        <h1 className="font-serif text-2xl font-bold text-[#1E392A] text-center mb-6">
          {lang === "HI"
            ? "FarmDirect पर नया पंजीकरण"
            : "Create FarmDirect Account"}
        </h1>

        {/* Role Picker */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${
              role === "farmer"
                ? "border-[#16A34A] bg-emerald-50 text-[#1E392A]"
                : "border-[#DCE4DF] bg-white text-[#5D6B63]"
            }`}
          >
            <Tractor className="w-7 h-7 mx-auto mb-1 text-[#16A34A]" />
            <span className="font-bold text-sm block">
              {lang === "HI" ? "मैं किसान हूँ" : "I am a Farmer"}
            </span>
            <span className="text-[11px] block text-[#5D6B63]">
              Sell produce direct
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole("consumer")}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${
              role === "consumer"
                ? "border-[#C25E00] bg-amber-50 text-[#1E392A]"
                : "border-[#DCE4DF] bg-white text-[#5D6B63]"
            }`}
          >
            <ShoppingBag className="w-7 h-7 mx-auto mb-1 text-[#C25E00]" />
            <span className="font-bold text-sm block">
              {lang === "HI" ? "मैं ग्राहक हूँ" : "I am a Consumer"}
            </span>
            <span className="text-[11px] block text-[#5D6B63]">
              Buy 30% cheaper
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === "farmer" ? "Sardar Gurpreet Singh" : "Priya Nair"}
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-1">
              Phone Number (10 digits)
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876500000"
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-1">
              {role === "farmer"
                ? "Village & Mandi (e.g. Karnal, Haryana)"
                : "City / Locality (e.g. South Delhi)"}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={role === "farmer" ? "Village Taraori, Karnal" : "New Delhi"}
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] text-sm"
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
            {loading ? "Creating Account..." : "Create Account & Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-[#5D6B63] mt-6">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-[#16A34A] hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
