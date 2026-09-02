import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const user = await getUserFromRequest(req);
    const body = await req.json();

    const productId = Number(body.product_id);
    const quantityOrdered = Number(body.quantity_ordered);
    const consumerId = user?.id || Number(body.consumer_id) || 11; // Default Meera Sharma
    const deliveryAddress =
      body.delivery_address || user?.address || "Flat 402, Narmada Apartments, New Delhi";

    if (!productId || !quantityOrdered || quantityOrdered <= 0) {
      return NextResponse.json(
        { error: "Product ID and a valid quantity greater than 0 are required." },
        { status: 400 }
      );
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product listing not found." }, { status: 404 });
    }

    if (product.quantityAvailable < quantityOrdered) {
      return NextResponse.json(
        {
          error: `Only ${product.quantityAvailable} ${product.unit} available in farmer stock.`,
        },
        { status: 400 }
      );
    }

    const unitPrice = product.pricePerUnit;
    const totalPrice = Math.round(unitPrice * quantityOrdered * 100) / 100;
    const savingsPerUnit = Math.max(0, product.mandiReferencePrice - unitPrice);
    const middlemanSavings = Math.round(savingsPerUnit * quantityOrdered * 100) / 100;

    // Reduce stock
    const newQty = Math.max(0, product.quantityAvailable - quantityOrdered);
    await db
      .update(products)
      .set({
        quantityAvailable: newQty,
        status: newQty === 0 ? "sold_out" : "active",
      })
      .where(eq(products.id, product.id));

    const [newOrder] = await db
      .insert(orders)
      .values({
        productId: product.id,
        consumerId,
        farmerId: product.farmerId,
        quantityOrdered,
        unitPrice,
        totalPrice,
        middlemanSavings,
        deliveryAddress,
        status: "pending",
      })
      .returning();

    // Fetch farmer & product info to return
    const [farmer] = await db
      .select()
      .from(users)
      .where(eq(users.id, product.farmerId))
      .limit(1);

    return NextResponse.json(
      {
        message: `Order placed! You saved ₹${middlemanSavings} by buying directly from farmer ${farmer?.name || ""}`,
        order: {
          ...newOrder,
          product_name: product.cropName,
          product_image: product.imageUrl,
          unit: product.unit,
          farmer_name: farmer?.name,
          farmer_phone: farmer?.phone,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
