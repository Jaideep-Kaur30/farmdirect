"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { FairPriceBadge } from "@/components/FairPriceBadge";
import {
  Tractor,
  Plus,
  Volume2,
  CheckCircle2,
  Clock,
  PackageCheck,
  Trash2,
  Edit3,
  TrendingUp,
  Award,
  AlertCircle,
} from "lucide-react";

interface FarmerOrder {
  id: number;
  product_id: number;
  crop_name: string;
  crop_name_hi: string;
  unit: string;
  image_url: string;
  quantity_ordered: number;
  unit_price: number;
  total_price: number;
  middleman_savings: number;
  status: string;
  delivery_address: string;
  created_at: string;
  consumer: {
    name: string;
    phone: string;
    location: string;
  };
}

interface FarmerListing {
  id: number;
  crop_name: string;
  crop_name_hi: string;
  category: string;
  quantity_available: number;
  unit: string;
  price_per_unit: number;
  mandi_reference_price: number;
  image_url: string;
  status: string;
}

export default function FarmerDashboardPage() {
  const { lang, speakHindi } = useLanguage();
  const { user, switchDemoPersona } = useAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "listings">("orders");
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [listings, setListings] = useState<FarmerListing[]>([]);
  const [loading, setLoading] = useState(true);

  // If user is logged in as farmer, use their ID; otherwise fallback to Harbhajan Singh (id=1)
  const farmerId = user?.role === "farmer" ? user.id : 1;

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        fetch(`/api/orders/farmer/${farmerId}`),
        fetch(`/api/products?farmer_id=${farmerId}`),
      ]);
      const ordData = await ordRes.json();
      const prodData = await prodRes.json();
      if (ordData.orders) setOrders(ordData.orders);
      if (prodData.products) setListings(prodData.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId]);

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    loadData();
  };

  const handleDeleteListing = async (productId: number) => {
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    loadData();
  };

  const totalEarnings = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const handleVoiceSummary = () => {
    const text =
      lang === "HI"
        ? `नमस्ते सरदार हरभजन सिंह जी। आपकी कुल ${listings.length} फसलें सक्रिय हैं, और आपको कुल ${orders.length} ऑर्डर मिले हैं। आपकी सीधी कमाई ${totalEarnings} रुपये है।`
        : `Hello Harbhajan Singh. You have ${listings.length} active listings and ${orders.length} direct orders. Total earnings are ₹${totalEarnings}.`;
    speakHindi(text);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      {/* Role Notice Banner if logged in as a Consumer */}
      {user && user.role !== "farmer" && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-[#1E392A]">
                {lang === "HI"
                  ? `आप अभी ग्राहक (${user.name}) के रूप में लॉग-इन हैं।`
                  : `You are currently logged in as Consumer (${user.name}).`}
              </p>
              <p className="text-xs text-[#5D6B63]">
                {lang === "HI"
                  ? "किसान पोर्टल देखने और ऑर्डर स्वीकार करने के लिए नीचे दिए गए बटन से किसान रोल पर स्विच करें।"
                  : "To test listing produce and confirming orders as a Farmer, click the button to switch to Farmer Demo Mode."}
              </p>
            </div>
          </div>
          <button
            onClick={() => switchDemoPersona("farmer")}
            className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shrink-0 shadow-sm"
          >
            🌾 Switch to Farmer (Sardar Harbhajan Singh) →
          </button>
        </div>
      )}

      {/* Farmer Welcome Banner */}
      <div className="bg-[#1E392A] text-white rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border-b-4 border-[#C25E00]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#16A34A] flex items-center justify-center text-white shrink-0 shadow-lg">
            <Tractor className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C25E00] text-white text-xs font-bold">
                {lang === "HI" ? "किसान पोर्टल (SIH 2026)" : "FARMER MANDI PORTAL"}
              </span>
              <span className="text-xs text-emerald-300">
                ● 100% Zero Middleman Commission
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
              {user?.role === "farmer"
                ? user.name
                : "Sardar Harbhajan Singh (Farmer Demo)"}
            </h1>
            <p className="text-xs text-[#DCE4DF]">
              {user?.role === "farmer"
                ? user.location || "Karnal Mandi, Haryana"
                : "Karnal Mandi, Haryana"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleVoiceSummary}
            className="px-4 py-3 rounded-2xl bg-[#2A4D3B] hover:bg-[#345F49] text-white text-xs font-bold flex items-center gap-2 border border-[#3E6C54]"
            title="Listen to Hindi summary"
          >
            <Volume2 className="w-4 h-4 text-[#FBBF24]" />
            <span>{lang === "HI" ? "🔊 बोलकर सुनें" : "🔊 Listen Voice Summary"}</span>
          </button>
          <Link
            href="/farmer/add-product"
            className="px-6 py-3.5 rounded-2xl bg-[#C25E00] hover:bg-[#A34E00] text-white text-sm font-bold shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>
              {lang === "HI" ? "नई फसल बेचें (Add Produce)" : "+ List New Harvest"}
            </span>
          </Link>
        </div>
      </div>

      {/* Tactile Big KPI Cards for Farmers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border-2 border-[#DCE4DF] p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-[#5D6B63]">
            {lang === "HI" ? "सक्रिय फसलें" : "Active Harvest Listings"}
          </span>
          <p className="font-serif text-3xl font-bold text-[#1E392A] mt-2">
            {listings.length}
            <span className="text-xs font-normal text-[#16A34A] block mt-1">
              {lang === "HI" ? "सीधे बाज़ार में लाइव" : "Live on FarmDirect"}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-amber-300 p-5 shadow-xs bg-amber-50/40">
          <span className="text-xs font-bold uppercase text-amber-900">
            {lang === "HI" ? "नए लंबित ऑर्डर" : "Pending Orders"}
          </span>
          <p className="font-serif text-3xl font-bold text-[#C25E00] mt-2">
            {pendingOrders}
            <span className="text-xs font-normal text-[#5D6B63] block mt-1">
              {lang === "HI" ? "पुष्टि करने के लिए तैयार" : "Awaiting confirmation"}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#16A34A] p-5 shadow-xs bg-emerald-50/40">
          <span className="text-xs font-bold uppercase text-emerald-800">
            {lang === "HI" ? "कुल सीधी कमाई" : "Total Direct Wallet Earnings"}
          </span>
          <p className="font-serif text-3xl font-bold text-[#16A34A] mt-2">
            ₹{totalEarnings.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-[#5D6B63] block mt-1">
              100% paid without Aadhtiya cut
            </span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#DCE4DF] p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-[#5D6B63]">
            {lang === "HI" ? "आढ़तिया कमीशन बचत" : "Extra Earned vs Mandi"}
          </span>
          <p className="font-serif text-3xl font-bold text-[#1E392A] mt-2">
            +₹{Math.round(totalEarnings * 0.28).toLocaleString("en-IN")}
            <span className="text-xs font-normal text-[#16A34A] block mt-1">
              +28% higher than farm-gate price
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-6 border-b border-[#DCE4DF] pb-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === "orders"
              ? "bg-[#1E392A] text-white shadow-xs"
              : "bg-white text-[#5D6B63] hover:bg-gray-100"
          }`}
        >
          📦{" "}
          {lang === "HI"
            ? `आने वाले ऑर्डर (${orders.length})`
            : `Incoming Direct Orders (${orders.length})`}
        </button>
        <button
          onClick={() => setActiveTab("listings")}
          className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === "listings"
              ? "bg-[#1E392A] text-white shadow-xs"
              : "bg-white text-[#5D6B63] hover:bg-gray-100"
          }`}
        >
          🌾{" "}
          {lang === "HI"
            ? `मेरी फसलें (${listings.length})`
            : `My Produce Listings (${listings.length})`}
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#DCE4DF] p-12 text-center">
              <h3 className="font-serif text-xl font-bold text-[#1E392A]">
                No orders received yet
              </h3>
              <p className="text-xs text-[#5D6B63] mt-1">
                List more seasonal crops to receive direct orders from families.
              </p>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-3xl border-2 border-[#DCE4DF] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src={o.image_url || "/images/tomatoes.jpg"}
                    alt={o.crop_name}
                    width={84}
                    height={84}
                    className="w-20 h-20 rounded-2xl object-cover border border-[#DCE4DF] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1E392A] text-white text-xs font-bold">
                        Order #{o.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          o.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "ready"
                            ? "bg-blue-100 text-blue-800"
                            : o.status === "confirmed"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-orange-100 text-orange-900"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#1E392A]">
                      {o.quantity_ordered} {o.unit} •{" "}
                      {lang === "HI" ? o.crop_name_hi : o.crop_name}
                    </h3>
                    <p className="text-xs text-[#5D6B63] mt-1">
                      👤 <strong>Buyer:</strong> {o.consumer?.name} ({o.consumer?.phone})
                      <br />
                      📍 <strong>Delivery:</strong> {o.delivery_address}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-[#5D6B63] block">
                      Direct Payout:
                    </span>
                    <span className="font-mono text-2xl font-bold text-[#16A34A]">
                      ₹{o.total_price}
                    </span>
                  </div>

                  {/* 1-Tap Status Progress Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {o.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "confirmed")}
                        className="px-5 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-sm"
                      >
                        {lang === "HI" ? "✓ ऑर्डर स्वीकारें" : "✓ Accept & Confirm"}
                      </button>
                    )}
                    {o.status === "confirmed" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "ready")}
                        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                      >
                        {lang === "HI" ? "🚚 पिकअप के लिए तैयार" : "🚚 Mark Ready for Delivery"}
                      </button>
                    )}
                    {o.status === "ready" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "completed")}
                        className="px-5 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-sm"
                      >
                        {lang === "HI" ? "🎉 पूर्ण (Completed)" : "🎉 Mark Completed"}
                      </button>
                    )}
                    {o.status === "completed" && (
                      <span className="px-4 py-2.5 rounded-xl bg-emerald-50 text-[#16A34A] font-bold text-xs border border-emerald-200">
                        ✓ Payment Received
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: My Listings */}
      {activeTab === "listings" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-[#DCE4DF] overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-[#FAF8F5]">
                  <Image
                    src={p.image_url || "/images/tomatoes.jpg"}
                    alt={p.crop_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-bold uppercase text-[#16A34A]">
                    Stock: {p.quantity_available} {p.unit}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1E392A] mt-1">
                    {lang === "HI" ? p.crop_name_hi : p.crop_name}
                  </h3>
                  <div className="mt-2">
                    <FairPriceBadge
                      pricePerUnit={p.price_per_unit}
                      mandiReferencePrice={p.mandi_reference_price}
                      unit={p.unit}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-[#EAEFEA] flex items-center justify-between">
                <span className="font-mono font-bold text-lg text-[#1E392A]">
                  ₹{p.price_per_unit}/{p.unit}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/farmer/edit-product/${p.id}`}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#DCE4DF] text-xs font-bold text-[#1E392A] hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{lang === "HI" ? "संपादित करें" : "Edit"}</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteListing(p.id)}
                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
