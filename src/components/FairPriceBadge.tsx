"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface FairPriceBadgeProps {
  pricePerUnit: number;
  mandiReferencePrice: number;
  unit?: string;
  size?: "sm" | "md";
}

export function FairPriceBadge({
  pricePerUnit,
  mandiReferencePrice,
  unit = "kg",
  size = "sm",
}: FairPriceBadgeProps) {
  const { lang } = useLanguage();
  const savingsPct =
    mandiReferencePrice > 0
      ? Math.max(0, Math.round(((mandiReferencePrice - pricePerUnit) / mandiReferencePrice) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full px-2.5 py-0.5 ${
            size === "md" ? "text-xs px-3 py-1" : "text-[11px]"
          } ${
            savingsPct >= 18
              ? "bg-[#16A34A] text-white shadow-xs"
              : savingsPct >= 5
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-amber-100 text-amber-900 border border-amber-300"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {savingsPct >= 5
            ? lang === "HI"
              ? `सरकारी उचित दर • ${savingsPct}% बचत`
              : `FAIR PRICE • SAVE ${savingsPct}% VS MANDI`
            : lang === "HI"
            ? "सीधा किसान मूल्य"
            : "DIRECT FARM PRICE"}
        </span>

        {mandiReferencePrice > pricePerUnit && (
          <span className="text-xs text-[#5D6B63]">
            {lang === "HI" ? "मंडी भाव:" : "Mandi Avg:"}{" "}
            <span className="line-through text-red-600 font-medium">
              ₹{mandiReferencePrice}/{unit}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
