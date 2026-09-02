import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, products, orders } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export async function GET() {
  try {
    await ensureSeeded();
    const allUsers = await db.select().from(users);
    const allProducts = await db.select().from(products);
    const allOrders = await db.select().from(orders);

    const totalFarmers = allUsers.filter((u) => u.role === "farmer").length;
    const totalConsumers = allUsers.filter((u) => u.role === "consumer").length;
    const totalListings = allProducts.length;
    const activeListings = allProducts.filter((p) => p.status === "active").length;
    const totalOrders = allOrders.length;

    const totalTransactionValue = allOrders.reduce(
      (sum, o) => sum + (o.totalPrice || 0),
      0
    );
    const totalMiddlemanSavings = allOrders.reduce(
      (sum, o) => sum + (o.middlemanSavings || 0),
      0
    );

    // Mandi category breakdown
    const categoryBreakdown = {
      vegetable: allProducts.filter((p) => p.category === "vegetable").length,
      fruit: allProducts.filter((p) => p.category === "fruit").length,
      grain: allProducts.filter((p) => p.category === "grain").length,
      dairy: allProducts.filter((p) => p.category === "dairy").length,
      other: allProducts.filter((p) => p.category === "other").length,
    };

    return NextResponse.json({
      stats: {
        total_users: allUsers.length,
        total_farmers: totalFarmers,
        total_consumers: totalConsumers,
        total_listings: totalListings,
        active_listings: activeListings,
        total_orders: totalOrders,
        total_transaction_value: Math.round(totalTransactionValue),
        total_middleman_savings: Math.round(totalMiddlemanSavings),
        category_breakdown: categoryBreakdown,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
