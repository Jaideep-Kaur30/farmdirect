import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, users, reviews, mandiPriceHistory } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { getFairPriceAnalysis, MANDI_REFERENCE_TABLE } from "@/lib/mandi";

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const category = searchParams.get("category") || "all";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 10000;
    const location = (searchParams.get("location") || "").toLowerCase().trim();
    const farmerIdParam = searchParams.get("farmer_id") || searchParams.get("farmerId");
    const sort = searchParams.get("sort") || "savings"; // 'savings' | 'cheapest' | 'newest'

    const allProducts = await db
      .select({
        product: products,
        farmerName: users.name,
        farmerLocation: users.location,
        farmerPhone: users.phone,
        farmerAvatar: users.avatarUrl,
      })
      .from(products)
      .innerJoin(users, eq(products.farmerId, users.id))
      .orderBy(desc(products.id));

    // Get farmer ratings
    const allReviews = await db.select().from(reviews);
    const farmerRatingMap: Record<number, { sum: number; count: number }> = {};
    for (const r of allReviews) {
      if (!farmerRatingMap[r.farmerId]) {
        farmerRatingMap[r.farmerId] = { sum: 0, count: 0 };
      }
      farmerRatingMap[r.farmerId].sum += r.rating;
      farmerRatingMap[r.farmerId].count += 1;
    }

    const priceHistories = await db.select().from(mandiPriceHistory);

    let enriched = allProducts.map((row) => {
      const p = row.product;
      const fairAnalysis = getFairPriceAnalysis(p.pricePerUnit, p.mandiReferencePrice);
      const ratingStats = farmerRatingMap[p.farmerId] || { sum: 48, count: 10 };
      const avgRating = Math.round((ratingStats.sum / Math.max(1, ratingStats.count)) * 10) / 10;
      const history = priceHistories.filter(
        (h) => h.cropName.toLowerCase() === p.cropName.toLowerCase()
      );

      return {
        id: p.id,
        farmer_id: p.farmerId,
        crop_name: p.cropName,
        crop_name_hi: p.cropNameHi || p.cropName,
        category: p.category,
        quantity_available: p.quantityAvailable,
        unit: p.unit,
        price_per_unit: p.pricePerUnit,
        mandi_reference_price: p.mandiReferencePrice,
        image_url: p.imageUrl || "/images/tomatoes.jpg",
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
          reviewCount: ratingStats.count,
        },
        fair_price: fairAnalysis,
        price_history: history,
      };
    });

    // Filter by farmerId if passed
    if (farmerIdParam) {
      const fid = Number(farmerIdParam);
      enriched = enriched.filter((item) => item.farmer_id === fid);
    }

    // Exclude removed products for consumers
    enriched = enriched.filter((item) => item.status !== "removed");

    // Text search
    if (search) {
      enriched = enriched.filter(
        (item) =>
          item.crop_name.toLowerCase().includes(search) ||
          (item.crop_name_hi && item.crop_name_hi.toLowerCase().includes(search)) ||
          item.farmer.name.toLowerCase().includes(search) ||
          (item.farmer.location && item.farmer.location.toLowerCase().includes(search))
      );
    }

    // Category filter
    if (category && category !== "all") {
      enriched = enriched.filter((item) => item.category === category);
    }

    // Price range
    enriched = enriched.filter(
      (item) => item.price_per_unit >= minPrice && item.price_per_unit <= maxPrice
    );

    // Location search
    if (location) {
      enriched = enriched.filter(
        (item) =>
          item.farmer.location &&
          item.farmer.location.toLowerCase().includes(location)
      );
    }

    // Sorting
    if (sort === "cheapest") {
      enriched.sort((a, b) => a.price_per_unit - b.price_per_unit);
    } else if (sort === "savings") {
      enriched.sort((a, b) => b.fair_price.savingsPercentage - a.fair_price.savingsPercentage);
    } else if (sort === "rating") {
      enriched.sort((a, b) => b.farmer.rating - a.farmer.rating);
    }

    return NextResponse.json({
      products: enriched,
      count: enriched.length,
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const user = await getUserFromRequest(req);
    const body = await req.json();

    // Allow farmers or if farmer_id is provided in demo mode
    const farmerId = user?.id || Number(body.farmer_id) || 1;

    const {
      crop_name,
      crop_name_hi,
      category = "vegetable",
      quantity_available,
      unit = "kg",
      price_per_unit,
      mandi_reference_price,
      image_url,
      harvest_date,
      description,
      description_hi,
    } = body;

    if (!crop_name || !quantity_available || !price_per_unit) {
      return NextResponse.json(
        { error: "Crop name, quantity available, and price per unit are required." },
        { status: 400 }
      );
    }

    // Lookup APMC reference price if not provided
    const lookupRef = MANDI_REFERENCE_TABLE[crop_name];
    const mandiPrice =
      Number(mandi_reference_price) ||
      lookupRef?.mandiAveragePrice ||
      Math.round(Number(price_per_unit) * 1.38);

    const [newProduct] = await db
      .insert(products)
      .values({
        farmerId,
        cropName: crop_name.trim(),
        cropNameHi: crop_name_hi || crop_name.trim(),
        category,
        quantityAvailable: Number(quantity_available),
        unit,
        pricePerUnit: Number(price_per_unit),
        mandiReferencePrice: mandiPrice,
        imageUrl: image_url || "/images/tomatoes.jpg",
        harvestDate: harvest_date || new Date().toISOString().split("T")[0],
        description: description || `Fresh ${crop_name} directly from farmer harvest.`,
        descriptionHi: description_hi || `ताजा ${crop_name} सीधे किसान से।`,
        status: "active",
      })
      .returning();

    return NextResponse.json(
      {
        message: "Produce listing created successfully!",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
