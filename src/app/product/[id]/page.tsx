"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { FairPriceBadge } from "@/components/FairPriceBadge";
import { MandiPriceChart } from "@/components/MandiPriceChart";
import {
  Sprout,
  MapPin,
  Calendar,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Star,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";

interface ProductDetail {
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
    avatarUrl?: string;
    rating: number;
    reviews: Array<{
      id: number;
      rating: number;
      comment: string;
      consumer_name: string;
      created_at: string;
    }>;
  };
  price_history: Array<{
    dayLabel: string;
    mandiPrice: number;
    farmDirectPrice: number;
  }>;
}

export default function SingleProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lang } = useLanguage();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(10);
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.address || "Flat 402, Narmada Apartments, Ring Road, South Delhi"
  );
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setQuantity(data.product.unit === "dozen" ? 2 : 10);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setPlacingOrder(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          quantity_ordered: quantity,
          consumer_id: user?.id || 11,
          delivery_address: deliveryAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Order error");
        return;
      }
      setOrderConfirmation(data);
      // Refresh stock
      setProduct({
        ...product,
        quantity_available: Math.max(0, product.quantity_available - quantity),
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-12">
        <div className="h-96 rounded-3xl bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#1E392A]">
          Produce Listing Not Found
        </h2>
        <Link
          href="/marketplace"
          className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-sm"
        >
          Back to Mandi Marketplace
        </Link>
      </div>
    );
  }

  const totalCost = Math.round(product.price_per_unit * quantity);
  const mandiCost = Math.round(product.mandi_reference_price * quantity);
  const totalSavings = Math.max(0, mandiCost - totalCost);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-[#5D6B63]">
        <Link href="/marketplace" className="hover:text-[#16A34A] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          {lang === "HI" ? "मंडी बाज़ार" : "Marketplace"}
        </Link>
        <span>/</span>
        <span className="text-[#1E392A]">
          {lang === "HI" ? product.crop_name_hi : product.crop_name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image, Price Chart, Description, Reviews */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Card */}
          <div className="bg-white rounded-3xl border border-[#DCE4DF] overflow-hidden shadow-xs">
            <div className="relative h-80 sm:h-96 bg-[#FAF8F5]">
              <Image
                src={product.image_url || "/images/tomatoes.jpg"}
                alt={product.crop_name}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#1E392A] text-white text-xs font-bold uppercase">
                  {product.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#16A34A] text-white text-xs font-bold">
                  ✓ Fresh Harvest ({product.harvest_date})
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E392A]">
                  {lang === "HI" ? product.crop_name_hi : product.crop_name}
                </h1>
                <FairPriceBadge
                  pricePerUnit={product.price_per_unit}
                  mandiReferencePrice={product.mandi_reference_price}
                  unit={product.unit}
                  size="md"
                />
              </div>

              <p className="text-sm text-[#5D6B63] leading-relaxed">
                {lang === "HI" ? product.description_hi : product.description}
              </p>

              {/* Farmer Trust Row */}
              <div className="mt-6 p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCE4DF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      product.farmer.avatarUrl ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                    }
                    alt={product.farmer.name}
                    width={52}
                    height={52}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#16A34A]"
                  />
                  <div>
                    <span className="font-bold text-sm text-[#1E392A] block">
                      {product.farmer.name}
                    </span>
                    <span className="text-xs text-[#5D6B63] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#16A34A]" />
                      {product.farmer.location}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {product.farmer.rating} / 5.0
                  </span>
                  <span className="text-[11px] text-[#5D6B63] block mt-1">
                    Verified MoCA Farmer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart.js 30-Day Agmarknet Price Trend */}
          <MandiPriceChart
            cropName={product.crop_name}
            unit={product.unit}
            history={product.price_history}
          />

          {/* Verified Customer Reviews */}
          <div className="bg-white rounded-3xl border border-[#DCE4DF] p-6 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-[#1E392A] mb-4">
              {lang === "HI"
                ? `किसान ${product.farmer.name} की ग्राहक समीक्षाएं`
                : `Verified Consumer Reviews for ${product.farmer.name}`}
            </h3>

            {product.farmer.reviews && product.farmer.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.farmer.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCE4DF]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-[#1E392A]">
                        {rev.consumer_name}
                      </span>
                      <span className="text-xs font-bold text-amber-600">
                        {"★".repeat(rev.rating)}
                      </span>
                    </div>
                    <p className="text-xs text-[#5D6B63]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5D6B63]">
                Be the first to review after purchasing this farm harvest!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Order Placement Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl border border-[#DCE4DF] p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAEFEA]">
              <div>
                <span className="text-xs font-bold uppercase text-[#16A34A]">
                  DIRECT FARMER PURCHASE
                </span>
                <p className="font-mono text-3xl font-bold text-[#1E392A] mt-1">
                  ₹{product.price_per_unit}
                  <span className="text-sm font-normal text-[#5D6B63]">
                    {" "}
                    / {product.unit}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-red-600 line-through font-mono block">
                  APMC Mandi: ₹{product.mandi_reference_price}/{product.unit}
                </span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white text-xs font-bold">
                  Save ₹
                  {Math.max(
                    0,
                    product.mandi_reference_price - product.price_per_unit
                  )}
                  /{product.unit}
                </span>
              </div>
            </div>

            {orderConfirmation ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-[#16A34A] text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto" />
                <h4 className="font-serif text-lg font-bold text-[#1E392A]">
                  {lang === "HI" ? "ऑर्डर सफलतापूर्वक दर्ज!" : "Direct Order Confirmed!"}
                </h4>
                <p className="text-xs text-[#5D6B63]">
                  {orderConfirmation.message}
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/consumer/dashboard"
                    className="w-full py-2.5 rounded-xl bg-[#16A34A] text-white text-xs font-bold text-center"
                  >
                    Track Order & View Savings →
                  </Link>
                  <button
                    onClick={() => setOrderConfirmation(null)}
                    className="w-full py-2 rounded-xl bg-white border text-xs font-semibold"
                  >
                    Place Another Order
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOrder} className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#1E392A] mb-1.5">
                    <span>
                      {lang === "HI" ? "मात्रा चुनें" : "Select Quantity"} (
                      {product.unit})
                    </span>
                    <span className="text-[#16A34A]">
                      Stock: {product.quantity_available} {product.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 5))}
                      className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#DCE4DF] font-bold text-lg"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={product.quantity_available}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(
                            product.quantity_available,
                            Math.max(1, Number(e.target.value))
                          )
                        )
                      }
                      className="flex-1 text-center py-2.5 rounded-xl border border-[#DCE4DF] font-mono text-lg font-bold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          Math.min(product.quantity_available, quantity + 5)
                        )
                      }
                      className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#DCE4DF] font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E392A] mb-1.5">
                    {lang === "HI"
                      ? "डिलीवरी का पता"
                      : "Delivery Address in City"}
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DCE4DF] text-sm"
                  />
                </div>

                {/* Direct Breakdown */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCE4DF] space-y-2 text-sm">
                  <div className="flex justify-between text-[#5D6B63]">
                    <span>APMC Mandi Wholesaler Total:</span>
                    <span className="font-mono line-through text-red-600">
                      ₹{mandiCost}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1E392A]">
                    <span>FarmDirect Direct Price:</span>
                    <span className="font-mono text-[#16A34A] text-lg">
                      ₹{totalCost}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#DCE4DF] font-bold text-[#16A34A]">
                    <span>🎉 Your Direct Savings:</span>
                    <span className="font-mono">₹{totalSavings}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder || product.quantity_available <= 0}
                  className="w-full py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {placingOrder
                      ? "Confirming with Farmer..."
                      : lang === "HI"
                      ? `सीधे किसान से ऑर्डर करें • ₹${totalCost}`
                      : `Place Direct Order • ₹${totalCost}`}
                  </span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-[#EAEFEA] space-y-2 text-xs text-[#5D6B63]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Zero Aadhtiya commission fee — Farmer receives 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#16A34A]" />
                <span>Harvest Date: {product.harvest_date} • Farm Fresh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
