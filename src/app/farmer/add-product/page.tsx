"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { MANDI_REFERENCE_TABLE } from "@/lib/mandi";
import {
  Sprout,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Scale,
  Sparkles,
} from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { user } = useAuth();

  const presetCrops = Object.keys(MANDI_REFERENCE_TABLE);

  const [selectedCrop, setSelectedCrop] = useState("Desi Organic Tomatoes");
  const [customCropName, setCustomCropName] = useState("");
  const [category, setCategory] = useState("vegetable");
  const [unit, setUnit] = useState("kg");
  const [quantityAvailable, setQuantityAvailable] = useState(250);
  const [pricePerUnit, setPricePerUnit] = useState(34);
  const [mandiRefPrice, setMandiRefPrice] = useState(52);
  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(
    "Handpicked vine-ripened fresh organic harvest direct from farmer field."
  );
  const [imageUrl, setImageUrl] = useState("/images/tomatoes.jpg");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelectPreset = (cropKey: string) => {
    setSelectedCrop(cropKey);
    const ref = MANDI_REFERENCE_TABLE[cropKey];
    if (ref) {
      setCategory(ref.category);
      setUnit(ref.unit);
      setMandiRefPrice(ref.mandiAveragePrice);
      setPricePerUnit(Math.round(ref.mandiAveragePrice * 0.68));
      if (cropKey.includes("Tomato")) setImageUrl("/images/tomatoes.jpg");
      else if (cropKey.includes("Basmati")) setImageUrl("/images/basmati-rice.jpg");
      else if (cropKey.includes("Mango")) setImageUrl("/images/alphonso-mango.jpg");
      else if (cropKey.includes("Milk")) setImageUrl("/images/desi-milk.jpg");
      else if (cropKey.includes("Onion")) setImageUrl("/images/nashik-onions.jpg");
      else if (cropKey.includes("Palak") || cropKey.includes("Spinach"))
        setImageUrl("/images/organic-spinach.jpg");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setImageUrl(data.url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const finalCropName = customCropName.trim() || selectedCrop;
    const refObj = MANDI_REFERENCE_TABLE[selectedCrop];

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_id: user?.id || 1,
          crop_name: finalCropName,
          crop_name_hi: refObj?.cropNameHi || finalCropName,
          category,
          quantity_available: quantityAvailable,
          unit,
          price_per_unit: pricePerUnit,
          mandi_reference_price: mandiRefPrice,
          image_url: imageUrl,
          harvest_date: harvestDate,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create listing");
        return;
      }
      router.push("/farmer/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  const savingsPct =
    mandiRefPrice > 0
      ? Math.max(0, Math.round(((mandiRefPrice - pricePerUnit) / mandiRefPrice) * 100))
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/farmer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5D6B63] hover:text-[#16A34A] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === "HI" ? "वापस किसान डैशबोर्ड" : "Back to Farmer Dashboard"}
      </Link>

      <div className="bg-white rounded-3xl border border-[#DCE4DF] p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between pb-6 border-b border-[#EAEFEA] mb-6">
          <div>
            <span className="text-xs font-bold uppercase text-[#C25E00]">
              {lang === "HI" ? "नई फसल लिस्टिंग" : "ADD DIRECT MANDI PRODUCE"}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E392A] mt-1">
              {lang === "HI"
                ? "सीधे ग्राहकों को अपनी ताज़ा फसल बेचें"
                : "List Your Harvest for Direct Household Sale"}
            </h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-bold border border-emerald-200">
            ✓ Zero Aadhtiya Fee
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preset Crop Selection */}
          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-2">
              {lang === "HI"
                ? "लोकप्रिय फसल चुनें (या अपना नाम लिखें):"
                : "Select Crop from Govt Mandi Catalog (or type custom):"}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {presetCrops.slice(0, 6).map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCrop === key
                      ? "bg-[#1E392A] text-white shadow-xs"
                      : "bg-[#FAF8F5] text-[#5D6B63] hover:bg-gray-200"
                  }`}
                >
                  {MANDI_REFERENCE_TABLE[key].cropName}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={customCropName}
              onChange={(e) => setCustomCropName(e.target.value)}
              placeholder="Or enter custom crop name (e.g. Organic Nagpur Oranges)"
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] text-sm"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
                {lang === "HI" ? "फसल श्रेणी (Category)" : "Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] text-sm font-semibold bg-white"
              >
                <option value="vegetable">Vegetable (सब्जियां)</option>
                <option value="fruit">Fruit (फल)</option>
                <option value="grain">Grain & Pulses (अनाज व दालें)</option>
                <option value="dairy">Dairy & Ghee (डेयरी)</option>
                <option value="other">Spices & Honey (मसाले)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
                {lang === "HI" ? "इकाई (Unit)" : "Measurement Unit"}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] text-sm font-semibold bg-white"
              >
                <option value="kg">Per Kilogram (kg)</option>
                <option value="quintal">Per Quintal (100 kg)</option>
                <option value="dozen">Per Dozen (12 pcs)</option>
                <option value="litre">Per Litre (litre)</option>
              </select>
            </div>
          </div>

          {/* Quantity & Price vs Mandi Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
                {lang === "HI" ? "उपलब्ध मात्रा" : `Quantity Available (${unit})`}
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] font-mono text-base font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16A34A] mb-1.5">
                {lang === "HI"
                  ? "आपका सीधा किसान दर (₹)"
                  : `Your Direct Farm Rate (₹/${unit})`}
              </label>
              <input
                type="number"
                min={1}
                required
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#16A34A] font-mono text-base font-bold text-[#16A34A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#C25E00] mb-1.5">
                APMC Mandi Retail Avg (₹/{unit})
              </label>
              <input
                type="number"
                min={1}
                required
                value={mandiRefPrice}
                onChange={(e) => setMandiRefPrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-amber-300 font-mono text-base font-bold"
              />
            </div>
          </div>

          {/* Live Fair Price Badge preview */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E392A]">
              {lang === "HI"
                ? "ग्राहक को दिखने वाला उचित मूल्य बैज:"
                : "Consumer Fair-Price Badge Preview:"}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#16A34A] text-white text-xs font-bold">
              FAIR PRICE • SAVE {savingsPct}% VS MANDI
            </span>
          </div>

          {/* Harvest Date & Photo Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
                {lang === "HI" ? "कटाई की तिथि" : "Harvest Date"}
              </label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
                {lang === "HI" ? "फसल की फोटो अपलोड करें" : "Upload Produce Photo"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DCE4DF] text-xs bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
              {lang === "HI" ? "फसल का विवरण" : "Harvest Description"}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAEFEA]">
            <Link
              href="/farmer/dashboard"
              className="px-6 py-3.5 rounded-xl border border-[#DCE4DF] text-sm font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm shadow-md"
            >
              {submitting
                ? "Publishing Harvest..."
                : lang === "HI"
                ? "🌾 मंडी बाज़ार में लिस्ट करें"
                : "🌾 Publish Produce Listing Live"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
