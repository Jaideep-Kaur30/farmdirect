import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export async function GET() {
  try {
    await ensureSeeded();
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
        phone: users.phone,
        location: users.location,
        pincode: users.pincode,
        address: users.address,
        avatar_url: users.avatarUrl,
        created_at: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.id));

    return NextResponse.json({
      users: rows,
      count: rows.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
