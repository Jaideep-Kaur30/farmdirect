"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { switchDemoPersona } = useAuth();

  const handleEnterAdmin = async () => {
    await switchDemoPersona("admin");
    router.push("/admin/dashboard");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl border border-[#DCE4DF] p-8 shadow-md">
        <div className="w-14 h-14 rounded-2xl bg-[#C25E00] text-white flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#1E392A]">
          MoCA Governance Console Login
        </h1>
        <p className="text-xs text-[#5D6B63] mt-2 mb-6">
          Ministry of Consumer Affairs, Food & Public Distribution • SIH 2026
        </p>

        <button
          onClick={handleEnterAdmin}
          className="w-full py-3.5 rounded-xl bg-[#C25E00] hover:bg-[#A34E00] text-white font-bold text-sm shadow-md"
        >
          Enter as Dr. Arvind Swaminathan (Director) →
        </button>
      </div>
    </div>
  );
}
