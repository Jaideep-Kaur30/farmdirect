import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export async function GET() {
  try {
    await ensureSeeded();
    const farmersTable = alias(users, "farmer_user");
    const consumersTable = alias(users, "consumer_user");

    const rows = await db
      .select({
        order: orders,
        cropName: products.cropName,
        unit: products.unit,
        farmerName: farmersTable.name,
        farmerLocation: farmersTable.location,
        consumerName: consumersTable.name,
        consumerPhone: consumersTable.phone,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(farmersTable, eq(orders.farmerId, farmersTable.id))
      .leftJoin(consumersTable, eq(orders.consumerId, consumersTable.id))
      .orderBy(desc(orders.id));

    return NextResponse.json({
      orders: rows.map((r) => ({
        id: r.order.id,
        product_id: r.order.productId,
        crop_name: r.cropName || "Direct Produce",
        unit: r.unit || "kg",
        quantity_ordered: r.order.quantityOrdered,
        unit_price: r.order.unitPrice,
        total_price: r.order.totalPrice,
        middleman_savings: r.order.middlemanSavings,
        status: r.order.status,
        created_at: r.order.createdAt,
        farmer_name: r.farmerName,
        farmer_location: r.farmerLocation,
        consumer_name: r.consumerName,
        consumer_phone: r.consumerPhone,
        delivery_address: r.order.deliveryAddress,
      })),
      count: rows.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
