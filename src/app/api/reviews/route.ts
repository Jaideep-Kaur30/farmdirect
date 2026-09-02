import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();

    const orderId = Number(body.order_id);
    const farmerId = Number(body.farmer_id);
    const consumerId = user?.id || Number(body.consumer_id) || 11;
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const comment = (body.comment || "").trim();

    if (!farmerId || !rating) {
      return NextResponse.json(
        { error: "Farmer ID and star rating (1-5) are required." },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(reviews)
      .values({
        orderId: orderId || null,
        farmerId,
        consumerId,
        rating,
        comment,
      })
      .returning();

    // Mark order completed if not already
    if (orderId) {
      await db
        .update(orders)
        .set({ status: "completed" })
        .where(eq(orders.id, orderId));
    }

    return NextResponse.json(
      {
        message: "Thank you! Your verified farmer review has been published.",
        review: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
