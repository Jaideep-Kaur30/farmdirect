"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { FairPriceBadge } from "@/components/FairPriceBadge";
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  ShoppingCart,
  X,
  Sparkles,
} from "lucide-react";

interface ProductRow {
  id: number;
  farmer_id: number;
  crop_name: string;
  crop_name_hi: string;
  category: string;
  quantity_available: number;
  unit: string;
  price_per_unit: number;
  mandi_reference_price: number;
  image_url: string;
  harvest_date: string;
  description: string;
  description_hi: string;
  farmer: {
    id: number;
    name: string;
    location: string;
    phone: string;
    rating: number;
    reviewCount: number;
  };
  fair_price: {
    badgeType: string;
    savingsPercentage: number;
    savingsRupees: number;
  };
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const { user } = useAuth();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("savings");

  // Quick Order Modal state
  const [quickOrderProduct, setQuickOrderProduct] = useState<ProductRow | null>(null);
  const [orderQty, setOrderQty] = useState(5);
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.address || "Flat 402, Narmada Apartments, South Delhi"
  );
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      params.set("maxPrice", String(maxPrice));
      if (locationFilter) params.set("location", locationFilter);
      params.set("sort", sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sortBy]);

  const categories = [
    { key: "all", labelEn: "All Crops (20+)", labelHi: "सभी फसलें" },
    { key: "vegetable", labelEn: "Vegetables", labelHi: "सब्जियां" },
    { key: "fruit", labelEn: "Fruits", labelHi: "फल" },
    { key: "grain", labelEn: "Grains & Pulses", labelHi: "अनाज व दालें" },
    { key: "dairy", labelEn: "Farm Dairy & Ghee", labelHi: "डेयरी एवं शुद्ध घी" },
    { key: "other", labelEn: "Spices & Honey", labelHi: "मसाले एवं शहद" },
  ];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickOrderProduct) return;
    setOrderSubmitting(true);
    setOrderSuccessMsg("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: quickOrderProduct.id,
          quantity_ordered: orderQty,
          consumer_id: user?.id || 11,
          delivery_address: deliveryAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Order error");
        return;
      }
      setOrderSuccessMsg(data.message);
      fetchProducts();
      setTimeout(() => {
        setQuickOrderProduct(null);
        setOrderSuccessMsg("");
      }, 2000);
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-[#1E392A] text-white rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
            {lang === "HI" ? "मंडी बिचौलिया मुक्त बाज़ार" : "DIRECT MANDI MARKETPLACE"}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold mt-1">
            {lang === "HI"
              ? "भारत के किसानों की ताज़ा फसलें"
              : "Farm-Fresh Produce Direct from Indian Farmers"}
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE4DF] mt-1">
            {lang === "HI"
              ? "हर दाम की सरकारी APMC मंडी दर से तुलना की जाती है। सीधे किसान को भुगतान।"
              : "Every listed crop includes verified APMC Government Mandi price comparison so you see your savings immediately."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/consumer/dashboard"
            className="px-4 py-2.5 rounded-xl bg-[#2A4D3B] hover:bg-[#345F49] text-white text-xs font-bold transition-colors"
          >
            {lang === "HI" ? "📦 मेरे ऑर्डर व बचत" : "📦 My Order History"}
          </Link>
          <Link
            href="/farmer/add-product"
            className="px-4 py-2.5 rounded-xl bg-[#C25E00] hover:bg-[#A34E00] text-white text-xs font-bold transition-colors"
          >
            {lang === "HI" ? "+ नई फसल बेचें (किसान)" : "+ List Crop (Farmers)"}
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#DCE4DF] p-4 sm:p-5 mb-8 shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchProducts();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          {/* Text Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#5D6B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                lang === "HI"
                  ? "फसल या किसान खोजें (टमाटर, बासमती, करनाल)..."
                  : "Search crop name, village, or farmer..."
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE4DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
          </div>

          {/* Location Filter */}
          <div className="sm:col-span-3 relative">
            <MapPin className="w-4 h-4 text-[#5D6B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder={
                lang === "HI" ? "मंडी / शहर (जैसे Karnal)" : "Mandi/City (e.g. Karnal)"
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE4DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#DCE4DF] text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            >
              <option value="savings">
                {lang === "HI" ? "सर्वाधिक मंडी बचत %" : "Highest Mandi Savings %"}
              </option>
              <option value="cheapest">
                {lang === "HI" ? "सबसे कम कीमत" : "Lowest Price First"}
              </option>
              <option value="rating">
                {lang === "HI" ? "उच्चतम किसान रेटिंग" : "Top Rated Farmers"}
              </option>
            </select>
          </div>

          {/* Apply Filter Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm transition-colors"
            >
              {lang === "HI" ? "फ़िल्टर करें" : "Filter Crops"}
            </button>
          </div>
        </form>

        {/* Category Pills & Price Slider */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-[#EAEFEA]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  category === c.key
                    ? "bg-[#1E392A] text-white shadow-xs"
                    : "bg-[#F3F6F4] text-[#5D6B63] hover:bg-[#E5ECE7] hover:text-[#1E392A]"
                }`}
              >
                {lang === "HI" ? c.labelHi : c.labelEn}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="font-semibold text-[#1E392A]">
              {lang === "HI" ? "अधिकतम दर:" : "Max Price:"} ₹{maxPrice}
            </span>
            <input
              type="range"
              min={25}
              max={3000}
              step={25}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
              }}
              onMouseUp={fetchProducts}
              className="accent-[#16A34A] w-32 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-gray-200 animate-pulse border border-[#DCE4DF]"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DCE4DF] p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1E392A]">
            {lang === "HI"
              ? "इस खोज के लिए कोई फसल नहीं मिली"
              : "No produce listings match this filter"}
          </h3>
          <p className="text-sm text-[#5D6B63] mt-1 mb-6">
            Try adjusting your search criteria or price slider to see active crops.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCategory("all");
              setLocationFilter("");
              setMaxPrice(3000);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#DCE4DF] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative h-48 overflow-hidden bg-[#FAF8F5]">
                  <Image
                    src={p.image_url || "/images/tomatoes.jpg"}
                    alt={p.crop_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#1E392A]/90 text-white text-[11px] font-bold uppercase">
                      {p.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/95 text-[#1E392A] text-[11px] font-semibold">
                      Stock: {p.quantity_available} {p.unit}
                    </span>
                  </div>
                </div>

                {/* Farmer Info & Title */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-[#5D6B63] mb-1.5">
                    <span className="font-medium truncate max-w-[70%]">
                      🌾 {p.farmer?.name} • {p.farmer?.location}
                    </span>
                    <span className="font-bold text-amber-600 shrink-0">
                      ★ {p.farmer?.rating || 4.9}
                    </span>
                  </div>

                  <Link href={`/product/${p.id}`}>
                    <h3 className="font-serif text-lg font-bold text-[#1E392A] group-hover:text-[#16A34A] transition-colors line-clamp-1">
                      {lang === "HI" ? p.crop_name_hi : p.crop_name}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#5D6B63] mt-1 line-clamp-2">
                    {lang === "HI" ? p.description_hi : p.description}
                  </p>

                  <div className="mt-3">
                    <FairPriceBadge
                      pricePerUnit={p.price_per_unit}
                      mandiReferencePrice={p.mandi_reference_price}
                      unit={p.unit}
                    />
                  </div>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="px-5 py-4 bg-[#FAF8F5] border-t border-[#EAEFEA] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#5D6B63] block">
                    {lang === "HI" ? "सीधा किसान मूल्य:" : "Direct Farm Rate:"}
                  </span>
                  <span className="font-mono text-xl font-bold text-[#1E392A]">
                    ₹{p.price_per_unit}
                    <span className="text-xs font-normal text-[#5D6B63]">
                      /{p.unit}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/product/${p.id}`}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE4DF] hover:bg-gray-50 text-xs font-bold text-[#1E392A]"
                  >
                    {lang === "HI" ? "रुझान चार्ट" : "Details"}
                  </Link>
                  <button
                    onClick={() => {
                      setQuickOrderProduct(p);
                      setOrderQty(p.unit === "dozen" ? 2 : 10);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{lang === "HI" ? "खरीदें" : "Order"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Place Order Modal */}
      {quickOrderProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE4DF]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAEFEA]">
              <div>
                <span className="text-xs font-bold uppercase text-[#16A34A]">
                  DIRECT FARMER ORDER (SIH 2026)
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1E392A]">
                  {lang === "HI"
                    ? quickOrderProduct.crop_name_hi
                    : quickOrderProduct.crop_name}
                </h3>
              </div>
              <button
                onClick={() => setQuickOrderProduct(null)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-[#16A34A] mx-auto" />
                <h4 className="font-serif text-xl font-bold text-[#1E392A]">
                  Order Placed Successfully!
                </h4>
                <p className="text-sm text-[#5D6B63]">{orderSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="pt-4 space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1E392A] block">
                      Farmer: {quickOrderProduct.farmer?.name}
                    </span>
                    <span className="text-[#5D6B63]">
                      Location: {quickOrderProduct.farmer?.location}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    ₹{quickOrderProduct.price_per_unit}/{quickOrderProduct.unit}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
                    Quantity to Order ({quickOrderProduct.unit}) • Available:{" "}
                    {quickOrderProduct.quantity_available} {quickOrderProduct.unit}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={quickOrderProduct.quantity_available}
                    value={orderQty}
                    onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] font-mono text-base font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
                    Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DCE4DF] text-sm"
                  />
                </div>

                {/* Savings summary */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCE4DF] space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5D6B63]">APMC Mandi Retail Cost:</span>
                    <span className="font-mono line-through text-red-600">
                      ₹
                      {Math.round(
                        quickOrderProduct.mandi_reference_price * orderQty
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1E392A]">
                    <span>FarmDirect Direct Price:</span>
                    <span className="font-mono text-[#16A34A]">
                      ₹
                      {Math.round(
                        quickOrderProduct.price_per_unit * orderQty
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#DCE4DF] font-bold text-[#16A34A]">
                    <span>Your Middleman Savings:</span>
                    <span className="font-mono">
                      ₹
                      {Math.max(
                        0,
                        Math.round(
                          (quickOrderProduct.mandi_reference_price -
                            quickOrderProduct.price_per_unit) *
                            orderQty
                        )
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuickOrderProduct(null)}
                    className="px-5 py-2.5 rounded-xl border border-[#DCE4DF] text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm"
                  >
                    {orderSubmitting
                      ? "Confirming with Farmer..."
                      : `Confirm Direct Order • ₹${Math.round(
                          quickOrderProduct.price_per_unit * orderQty
                        )}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading Mandi...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
