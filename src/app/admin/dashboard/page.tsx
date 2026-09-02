"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { lang } = useLanguage();
  const { user, switchDemoPersona } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "overview" | "moderation" | "users" | "orders"
  >("overview");
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, usersRes, ordRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/products"),
        fetch("/api/admin/users"),
        fetch("/api/admin/orders"),
      ]);
      const statsData = await statsRes.json();
      const prodData = await prodRes.json();
      const usersData = await usersRes.json();
      const ordData = await ordRes.json();

      if (statsData.stats) setStats(statsData.stats);
      if (prodData.products) setProducts(prodData.products);
      if (usersData.users) setUsers(usersData.users);
      if (ordData.orders) setOrders(ordData.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleModerateProduct = async (productId: number) => {
    await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    fetchAdminData();
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      {/* Role Notice Banner if logged in as Farmer or Consumer */}
      {user && user.role !== "admin" && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-[#1E392A]">
                {lang === "HI"
                  ? `आप अभी ${user.role.toUpperCase()} (${user.name}) के रूप में लॉग-इन हैं।`
                  : `You are currently viewing as ${user.role.toUpperCase()} (${user.name}).`}
              </p>
              <p className="text-xs text-[#5D6B63]">
                {lang === "HI"
                  ? "मंत्रालय के पूर्ण प्रशासनिक अधिकार और फर्जी लिस्टिंग मॉडरेशन के लिए एडमिन रोल पर स्विच करें।"
                  : "To test moderating fake listings and auditing Ministry statistics, switch to MoCA Admin mode."}
              </p>
            </div>
          </div>
          <button
            onClick={() => switchDemoPersona("admin")}
            className="px-5 py-2.5 rounded-xl bg-[#1E392A] hover:bg-[#122319] text-white text-xs font-bold shrink-0 shadow-sm"
          >
            🏛️ Switch to MoCA Admin (Dr. Arvind Swaminathan) →
          </button>
        </div>
      )}

      {/* MoCA Header Banner */}
      <div className="bg-[#1E392A] text-white rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border-b-4 border-[#C25E00]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C25E00] flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#C25E00] text-white text-xs font-bold">
              MINISTRY OF CONSUMER AFFAIRS • SIH 2026 ADMIN
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
              National Mandi Governance & Moderation Console
            </h1>
            <p className="text-xs text-[#DCE4DF]">
              Admin: Dr. Arvind Swaminathan (MoCA Mandi Director) • Krishi Bhawan, New Delhi
            </p>
          </div>
        </div>

        <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-[#16A34A] text-xs font-bold border border-emerald-500/30">
          ● Live APMC Audit System Active
        </span>
      </div>

      {/* Basic Platform Impact Counts */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 shadow-xs">
            <span className="text-xs font-bold uppercase text-[#5D6B63]">
              Total Users
            </span>
            <p className="font-serif text-3xl font-bold text-[#1E392A] mt-1">
              {stats.total_users}
            </p>
            <span className="text-xs text-[#16A34A]">
              {stats.total_farmers} Farmers • {stats.total_consumers} Consumers
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 shadow-xs">
            <span className="text-xs font-bold uppercase text-[#5D6B63]">
              Total Crop Listings
            </span>
            <p className="font-serif text-3xl font-bold text-[#1E392A] mt-1">
              {stats.total_listings}
            </p>
            <span className="text-xs text-emerald-700">
              {stats.active_listings} Active Direct Crops
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 shadow-xs">
            <span className="text-xs font-bold uppercase text-[#5D6B63]">
              Total Direct Orders
            </span>
            <p className="font-serif text-3xl font-bold text-[#1E392A] mt-1">
              {stats.total_orders}
            </p>
            <span className="text-xs text-blue-700">Direct Farmer Payouts</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE4DF] p-5 shadow-xs">
            <span className="text-xs font-bold uppercase text-[#5D6B63]">
              Total GMV Value
            </span>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-[#16A34A] mt-1">
              ₹{stats.total_transaction_value.toLocaleString("en-IN")}
            </p>
            <span className="text-xs text-[#5D6B63]">Direct Farm Transactions</span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-[#16A34A] p-5 shadow-xs bg-emerald-50/50">
            <span className="text-xs font-bold uppercase text-emerald-800">
              Middleman Savings
            </span>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-[#16A34A] mt-1">
              ₹{stats.total_middleman_savings.toLocaleString("en-IN")}
            </p>
            <span className="text-xs text-emerald-800">
              Transferred to Citizens
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#DCE4DF] pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "overview"
              ? "bg-[#1E392A] text-white"
              : "bg-white text-[#5D6B63] hover:bg-gray-100"
          }`}
        >
          📊 Analytics Overview
        </button>
        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "moderation"
              ? "bg-[#C25E00] text-white"
              : "bg-white text-[#5D6B63] hover:bg-gray-100"
          }`}
        >
          🛡️ Moderate Listings ({products.filter((p) => p.status !== "removed").length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "users"
              ? "bg-[#1E392A] text-white"
              : "bg-white text-[#5D6B63] hover:bg-gray-100"
          }`}
        >
          👥 All Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "orders"
              ? "bg-[#1E392A] text-white"
              : "bg-white text-[#5D6B63] hover:bg-gray-100"
          }`}
        >
          📦 Platform Orders Audit ({orders.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-[#DCE4DF] p-6">
            <h3 className="font-serif text-lg font-bold text-[#1E392A] mb-4">
              Ministry of Consumer Affairs Policy Impact
            </h3>
            <ul className="space-y-3 text-sm text-[#5D6B63]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                <span>
                  <strong>Zero Mandi Tax:</strong> Farmers retain 100% of listed price with instant digital payment.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                <span>
                  <strong>Price Gouging Protection:</strong> Listings exceeding +15% above APMC benchmark are flagged.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                <span>
                  <strong>Bilingual Hindi Voice Assistant:</strong> Accessible to non-English speaking Indian farmers.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-[#DCE4DF] p-6">
            <h3 className="font-serif text-lg font-bold text-[#1E392A] mb-4">
              Category Distribution Across India
            </h3>
            {stats && stats.category_breakdown && (
              <div className="space-y-3">
                {Object.entries(stats.category_breakdown).map(
                  ([cat, count]: [string, any]) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#DCE4DF]"
                    >
                      <span className="font-bold uppercase text-xs text-[#1E392A]">
                        {cat}
                      </span>
                      <span className="font-mono font-bold text-sm text-[#16A34A]">
                        {count} Active Crops
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Moderation */}
      {activeTab === "moderation" && (
        <div className="bg-white rounded-3xl border border-[#DCE4DF] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#EAEFEA] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1E392A]">
                Produce Moderation & Fake Listing Guard
              </h3>
              <p className="text-xs text-[#5D6B63]">
                Remove duplicate or artificially inflated produce listings with 1 click.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-xs uppercase text-[#5D6B63] border-b border-[#DCE4DF]">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Crop Name</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Direct Price</th>
                  <th className="p-4">APMC Mandi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFEA]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold">#{p.id}</td>
                    <td className="p-4 font-bold text-[#1E392A]">
                      {p.crop_name}
                    </td>
                    <td className="p-4 text-xs">
                      {p.farmer_name} ({p.farmer_location})
                    </td>
                    <td className="p-4 font-mono font-bold text-[#16A34A]">
                      ₹{p.price_per_unit}/{p.unit}
                    </td>
                    <td className="p-4 font-mono text-red-600 line-through">
                      ₹{p.mandi_reference_price}/{p.unit}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          p.status === "removed"
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {p.status !== "removed" ? (
                        <button
                          onClick={() => handleModerateProduct(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Moderate & Remove
                        </button>
                      ) : (
                        <span className="text-xs text-red-700 font-bold">
                          Moderated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-[#DCE4DF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-xs uppercase text-[#5D6B63] border-b border-[#DCE4DF]">
                <tr>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Location / Mandi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFEA]">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="p-4 font-mono font-bold">#{u.id}</td>
                    <td className="p-4 font-bold text-[#1E392A]">{u.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          u.role === "farmer"
                            ? "bg-[#16A34A] text-white"
                            : u.role === "admin"
                            ? "bg-[#C25E00] text-white"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{u.phone}</td>
                    <td className="p-4 text-xs text-[#5D6B63]">{u.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-[#DCE4DF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-xs uppercase text-[#5D6B63] border-b border-[#DCE4DF]">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Crop</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Consumer</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4">Middleman Savings</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFEA]">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="p-4 font-mono font-bold">#{o.id}</td>
                    <td className="p-4 font-bold text-[#1E392A]">
                      {o.quantity_ordered} {o.unit} {o.crop_name}
                    </td>
                    <td className="p-4 text-xs">{o.farmer_name}</td>
                    <td className="p-4 text-xs">{o.consumer_name}</td>
                    <td className="p-4 font-mono font-bold text-[#1E392A]">
                      ₹{o.total_price}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#16A34A]">
                      +₹{o.middleman_savings}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
