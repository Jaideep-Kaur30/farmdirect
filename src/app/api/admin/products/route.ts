import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export async function GET() {
  try {
    await ensureSeeded();
    const rows = await db
      .select({
        product: products,
        farmerName: users.name,
        farmerPhone: users.phone,
        farmerLocation: users.location,
      })
      .from(products)
      .leftJoin(users, eq(products.farmerId, users.id))
      .orderBy(desc(products.id));

    return NextResponse.json({
      products: rows.map((r) => ({
        ...r.product,
        farmer_name: r.farmerName,
        farmer_phone: r.farmerPhone,
        farmer_location: r.farmerLocation,
      })),
      count: rows.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
