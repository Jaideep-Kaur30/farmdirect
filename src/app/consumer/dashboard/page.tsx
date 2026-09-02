"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Star,
  CheckCircle2,
  Clock,
  Truck,
  Award,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";

interface ConsumerOrder {
  id: number;
  product_id: number;
  farmer_id: number;
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
  farmer: {
    name: string;
    phone: string;
    location: string;
  };
  has_review: boolean;
}

export default function ConsumerDashboardPage() {
  const { lang } = useLanguage();
  const { user, switchDemoPersona } = useAuth();

  // If logged in as Consumer, use their ID; otherwise fallback to Meera Sharma (ID=11)
  const consumerId = user?.role === "consumer" ? user.id : 11;

  const [orders, setOrders] = useState<ConsumerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<ConsumerOrder | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/consumer/${consumerId}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consumerId]);

  const totalSavings = orders.reduce(
    (sum, o) => sum + (o.middleman_savings || 0),
    0
  );

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: reviewOrder.id,
          farmer_id: reviewOrder.farmer_id,
          consumer_id: consumerId,
          rating,
          comment,
        }),
      });
      setReviewOrder(null);
      setComment("");
      fetchOrders();
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      {/* Role Notice Banner if logged in as Farmer or Admin */}
      {user && user.role !== "consumer" && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-[#1E392A]">
                {lang === "HI"
                  ? `आप अभी ${user.role.toUpperCase()} (${user.name}) के रूप में लॉग-इन हैं।`
                  : `You are currently logged in as ${user.role.toUpperCase()} (${user.name}).`}
              </p>
              <p className="text-xs text-[#5D6B63]">
                {lang === "HI"
                  ? "ग्राहक के ऑर्डर, सीधी बचत और किसान रेटिंग जांचने के लिए नीचे बटन से ग्राहक रोल पर स्विच करें।"
                  : "To place orders, review farmers, and view household savings as a Consumer, switch to Consumer Demo Mode."}
              </p>
            </div>
          </div>
          <button
            onClick={() => switchDemoPersona("consumer")}
            className="px-5 py-2.5 rounded-xl bg-[#C25E00] hover:bg-[#A34E00] text-white text-xs font-bold shrink-0 shadow-sm"
          >
            🛒 Switch to Consumer (Meera Sharma) →
          </button>
        </div>
      )}

      {/* Consumer Header & Savings Card */}
      <div className="bg-[#1E392A] text-white rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border-b-4 border-[#16A34A]">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white text-xs font-bold">
            {lang === "HI" ? "ग्राहक डैशबोर्ड (SIH 2026)" : "CONSUMER MANDI DASHBOARD"}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-2">
            {user?.role === "consumer"
              ? user.name
              : "Meera Sharma (Consumer Demo)"}
          </h1>
          <p className="text-xs text-[#DCE4DF] mt-0.5">
            {user?.role === "consumer"
              ? user.address || "Flat 402, Narmada Apartments, South Delhi"
              : "Flat 402, Narmada Apartments, South Delhi"}
          </p>
        </div>

        <div className="bg-[#122319] px-6 py-4 rounded-2xl border border-[#244633] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-[#16A34A] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-emerald-300 font-semibold block">
              {lang === "HI"
                ? "आपकी कुल बिचौलिया बचत"
                : "Total Middleman Savings vs Mandi"}
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#16A34A]">
              ₹{totalSavings.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#1E392A]">
          {lang === "HI"
            ? `मेरे डायरेक्ट-मंडी ऑर्डर (${orders.length})`
            : `My Direct-from-Farmer Orders (${orders.length})`}
        </h2>
        <Link
          href="/marketplace"
          className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors"
        >
          {lang === "HI" ? "+ और फसलें खरीदें" : "+ Shop More Fresh Produce"}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DCE4DF] p-12 text-center">
          <h3 className="font-serif text-xl font-bold text-[#1E392A]">
            No orders placed yet
          </h3>
          <Link
            href="/marketplace"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-sm"
          >
            Browse Mandi Produce
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl border border-[#DCE4DF] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <Image
                  src={o.image_url || "/images/tomatoes.jpg"}
                  alt={o.crop_name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-2xl object-cover border border-[#DCE4DF] shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#5D6B63]">
                      Order #{o.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        o.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : o.status === "ready"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {o.status}
                    </span>
                    {o.middleman_savings > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-bold">
                        Saved ₹{o.middleman_savings}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1E392A]">
                    {o.quantity_ordered} {o.unit} •{" "}
                    {lang === "HI" ? o.crop_name_hi : o.crop_name}
                  </h3>

                  <p className="text-xs text-[#5D6B63] mt-1">
                    🌾 <strong>Farmer:</strong> {o.farmer?.name} ({o.farmer?.location})
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-[#5D6B63] block">
                    Direct Paid:
                  </span>
                  <span className="font-mono text-xl font-bold text-[#1E392A]">
                    ₹{o.total_price}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!o.has_review && (
                    <button
                      onClick={() => {
                        setReviewOrder(o);
                        setRating(5);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>{lang === "HI" ? "रेटिंग व समीक्षा दें" : "Rate Farmer"}</span>
                    </button>
                  )}
                  {o.has_review && (
                    <span className="px-3 py-2 rounded-xl bg-emerald-50 text-[#16A34A] text-xs font-bold">
                      ✓ Reviewed (5★)
                    </span>
                  )}
                  <Link
                    href={`/product/${o.product_id}`}
                    className="px-4 py-2.5 rounded-xl border border-[#DCE4DF] text-xs font-bold text-[#1E392A] hover:bg-gray-50"
                  >
                    Reorder
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Farmer Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#DCE4DF]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAEFEA]">
              <h3 className="font-serif text-xl font-bold text-[#1E392A]">
                {lang === "HI"
                  ? `किसान ${reviewOrder.farmer?.name} को रेटिंग दें`
                  : `Rate Farmer ${reviewOrder.farmer?.name}`}
              </h3>
              <button
                onClick={() => setReviewOrder(null)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="pt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E392A] mb-2">
                  Star Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-11 h-11 rounded-xl text-lg font-bold flex items-center justify-center transition-transform hover:scale-110 ${
                        star <= rating
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
                  Your Review / Comment
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other families about crop freshness, taste, and packaging..."
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE4DF] text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#DCE4DF] text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-sm"
                >
                  {submittingReview ? "Publishing..." : "Submit Verified Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
