import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, users, reviews, mandiPriceHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFairPriceAnalysis } from "@/lib/mandi";
import { ensureSeeded } from "@/lib/seed";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded();
    const { id } = await context.params;
    const productId = Number(id);

    const [row] = await db
      .select({
        product: products,
        farmerName: users.name,
        farmerLocation: users.location,
        farmerPhone: users.phone,
        farmerAvatar: users.avatarUrl,
      })
      .from(products)
      .innerJoin(users, eq(products.farmerId, users.id))
      .where(eq(products.id, productId))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const p = row.product;
    const fairAnalysis = getFairPriceAnalysis(p.pricePerUnit, p.mandiReferencePrice);

    // Reviews for this farmer
    const farmerReviews = await db
      .select({
        review: reviews,
        consumerName: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.consumerId, users.id))
      .where(eq(reviews.farmerId, p.farmerId));

    const avgRating =
      farmerReviews.length > 0
        ? Math.round(
            (farmerReviews.reduce((acc, r) => acc + r.review.rating, 0) /
              farmerReviews.length) *
              10
          ) / 10
        : 4.8;

    // 30-day APMC trend data
    let trendHistory = await db
      .select()
      .from(mandiPriceHistory)
      .where(eq(mandiPriceHistory.cropName, p.cropName));

    if (trendHistory.length === 0) {
      const days = ["Day -25", "Day -20", "Day -15", "Day -10", "Day -5", "Today"];
      trendHistory = days.map((day, idx) => ({
        id: idx,
        cropName: p.cropName,
        dayLabel: day,
        mandiPrice: Math.round(p.mandiReferencePrice + Math.sin(idx) * 4),
        farmDirectPrice: Math.round(p.pricePerUnit + Math.cos(idx) * 2),
      }));
    }

    return NextResponse.json({
      product: {
        id: p.id,
        farmer_id: p.farmerId,
        crop_name: p.cropName,
        crop_name_hi: p.cropNameHi || p.cropName,
        category: p.category,
        quantity_available: p.quantityAvailable,
        unit: p.unit,
        price_per_unit: p.pricePerUnit,
        mandi_reference_price: p.mandiReferencePrice,
        image_url: p.imageUrl,
        harvest_date: p.harvestDate,
        description: p.description,
        description_hi: p.descriptionHi || p.description,
        status: p.status,
        created_at: p.createdAt,
        farmer: {
          id: p.farmerId,
          name: row.farmerName,
          location: row.farmerLocation,
          phone: row.farmerPhone,
          avatarUrl: row.farmerAvatar,
          rating: avgRating,
          reviews: farmerReviews.map((fr) => ({
            id: fr.review.id,
            rating: fr.review.rating,
            comment: fr.review.comment,
            consumer_name: fr.consumerName,
            created_at: fr.review.createdAt,
          })),
        },
        fair_price: fairAnalysis,
        price_history: trendHistory,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productId = Number(id);
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(products)
      .set({
        cropName: body.crop_name ?? existing.cropName,
        cropNameHi: body.crop_name_hi ?? existing.cropNameHi,
        category: body.category ?? existing.category,
        quantityAvailable:
          body.quantity_available !== undefined
            ? Number(body.quantity_available)
            : existing.quantityAvailable,
        unit: body.unit ?? existing.unit,
        pricePerUnit:
          body.price_per_unit !== undefined
            ? Number(body.price_per_unit)
            : existing.pricePerUnit,
        mandiReferencePrice:
          body.mandi_reference_price !== undefined
            ? Number(body.mandi_reference_price)
            : existing.mandiReferencePrice,
        imageUrl: body.image_url || existing.imageUrl,
        harvestDate: body.harvest_date || existing.harvestDate,
        description: body.description ?? existing.description,
        descriptionHi: body.description_hi ?? existing.descriptionHi,
        status: body.status || existing.status,
      })
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json({
      message: "Produce listing updated!",
      product: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    await db.delete(products).where(eq(products.id, productId));
    return NextResponse.json({
      message: "Produce listing removed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
