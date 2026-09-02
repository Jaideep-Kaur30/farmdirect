import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ farmer_id: string }> }
) {
  try {
    await ensureSeeded();
    const { farmer_id } = await context.params;
    const farmerId = Number(farmer_id);

    const rows = await db
      .select({
        order: orders,
        cropName: products.cropName,
        cropNameHi: products.cropNameHi,
        unit: products.unit,
        imageUrl: products.imageUrl,
        consumerName: users.name,
        consumerPhone: users.phone,
        consumerLocation: users.location,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.consumerId, users.id))
      .where(eq(orders.farmerId, farmerId))
      .orderBy(desc(orders.id));

    const formatted = rows.map((r) => ({
      id: r.order.id,
      product_id: r.order.productId,
      crop_name: r.cropName || "Direct Produce",
      crop_name_hi: r.cropNameHi || r.cropName,
      unit: r.unit || "kg",
      image_url: r.imageUrl || "/images/tomatoes.jpg",
      quantity_ordered: r.order.quantityOrdered,
      unit_price: r.order.unitPrice,
      total_price: r.order.totalPrice,
      middleman_savings: r.order.middlemanSavings,
      status: r.order.status,
      delivery_address: r.order.deliveryAddress,
      created_at: r.order.createdAt,
      consumer: {
        name: r.consumerName || "Consumer",
        phone: r.consumerPhone || "9811111111",
        location: r.consumerLocation || "Delhi",
      },
    }));

    return NextResponse.json({
      orders: formatted,
      count: formatted.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
