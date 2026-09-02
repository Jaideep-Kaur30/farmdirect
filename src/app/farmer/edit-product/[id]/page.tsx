"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { lang } = useLanguage();

  const [cropName, setCropName] = useState("");
  const [cropNameHi, setCropNameHi] = useState("");
  const [category, setCategory] = useState("vegetable");
  const [unit, setUnit] = useState("kg");
  const [quantityAvailable, setQuantityAvailable] = useState(100);
  const [pricePerUnit, setPricePerUnit] = useState(30);
  const [mandiRefPrice, setMandiRefPrice] = useState(48);
  const [imageUrl, setImageUrl] = useState("/images/tomatoes.jpg");
  const [harvestDate, setHarvestDate] = useState("2026-03-30");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          const p = data.product;
          setCropName(p.crop_name);
          setCropNameHi(p.crop_name_hi || p.crop_name);
          setCategory(p.category);
          setUnit(p.unit);
          setQuantityAvailable(p.quantity_available);
          setPricePerUnit(p.price_per_unit);
          setMandiRefPrice(p.mandi_reference_price);
          setImageUrl(p.image_url || "/images/tomatoes.jpg");
          setHarvestDate(p.harvest_date || "2026-03-30");
          setDescription(p.description || "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_name: cropName,
          crop_name_hi: cropNameHi,
          category,
          unit,
          quantity_available: quantityAvailable,
          price_per_unit: pricePerUnit,
          mandi_reference_price: mandiRefPrice,
          image_url: imageUrl,
          harvest_date: harvestDate,
          description,
        }),
      });
      router.push("/farmer/dashboard");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center">Loading listing...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/farmer/dashboard"
        className="inline-flex items-center gap-1 text-xs font-bold text-[#5D6B63] hover:text-[#16A34A] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Farmer Dashboard
      </Link>

      <div className="bg-white rounded-3xl border border-[#DCE4DF] p-6 sm:p-8 shadow-md">
        <h1 className="font-serif text-2xl font-bold text-[#1E392A] mb-6">
          {lang === "HI" ? "फसल सूची संपादित करें" : "Edit Produce Listing"}
        </h1>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-1">
              Crop Name (English)
            </label>
            <input
              type="text"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-1">
              Crop Name (Hindi / हिंदी)
            </label>
            <input
              type="text"
              value={cropNameHi}
              onChange={(e) => setCropNameHi(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E392A] mb-1">
                Quantity Available ({unit})
              </label>
              <input
                type="number"
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16A34A] mb-1">
                Direct Farm Price (₹/{unit})
              </label>
              <input
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#16A34A] font-mono font-bold text-[#16A34A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E392A] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/farmer/dashboard"
              className="px-6 py-3 rounded-xl border border-[#DCE4DF] text-sm font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#16A34A] text-white font-bold text-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
