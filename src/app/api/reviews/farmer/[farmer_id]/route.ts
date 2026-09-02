import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ farmer_id: string }> }
) {
  try {
    const { farmer_id } = await context.params;
    const farmerId = Number(farmer_id);

    const rows = await db
      .select({
        review: reviews,
        consumerName: users.name,
        consumerLocation: users.location,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.consumerId, users.id))
      .where(eq(reviews.farmerId, farmerId))
      .orderBy(desc(reviews.id));

    const totalStars = rows.reduce((acc, r) => acc + r.review.rating, 0);
    const averageRating =
      rows.length > 0 ? Math.round((totalStars / rows.length) * 10) / 10 : 4.9;

    return NextResponse.json({
      farmer_id: farmerId,
      average_rating: averageRating,
      total_reviews: rows.length,
      reviews: rows.map((r) => ({
        id: r.review.id,
        rating: r.review.rating,
        comment: r.review.comment,
        created_at: r.review.createdAt,
        consumer_name: r.consumerName || "Verified Consumer",
        consumer_location: r.consumerLocation || "Delhi NCR",
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
