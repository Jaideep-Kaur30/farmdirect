import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, users, reviews } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ consumer_id: string }> }
) {
  try {
    await ensureSeeded();
    const { consumer_id } = await context.params;
    const consumerId = Number(consumer_id);

    const rows = await db
      .select({
        order: orders,
        cropName: products.cropName,
        cropNameHi: products.cropNameHi,
        unit: products.unit,
        imageUrl: products.imageUrl,
        farmerName: users.name,
        farmerPhone: users.phone,
        farmerLocation: users.location,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.farmerId, users.id))
      .where(eq(orders.consumerId, consumerId))
      .orderBy(desc(orders.id));

    const existingReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.consumerId, consumerId));

    const reviewByOrderId = new Map(
      existingReviews.filter((r) => r.orderId).map((r) => [r.orderId, r])
    );

    const formatted = rows.map((r) => ({
      id: r.order.id,
      product_id: r.order.productId,
      farmer_id: r.order.farmerId,
      crop_name: r.cropName || "Direct Farm Harvest",
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
      farmer: {
        name: r.farmerName || "Farmer",
        phone: r.farmerPhone || "9876543210",
        location: r.farmerLocation || "Karnal Mandi",
      },
      has_review: reviewByOrderId.has(r.order.id),
      review: reviewByOrderId.get(r.order.id) || null,
    }));

    return NextResponse.json({
      orders: formatted,
      count: formatted.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
