import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signAuthToken } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const { role } = await req.json();

    let targetPhone = "9811111111"; // Default Consumer (Meera Sharma)
    if (role === "farmer") targetPhone = "9876543210"; // Sardar Harbhajan Singh
    if (role === "admin") targetPhone = "9999999999"; // Dr. Arvind Swaminathan

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, targetPhone))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
    }

    const token = await signAuthToken({
      userId: user.id,
      role: user.role as "farmer" | "consumer" | "admin",
      name: user.name,
      phone: user.phone,
    });

    const res = NextResponse.json({
      message: `Switched demo role to ${user.role.toUpperCase()}: ${user.name}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        location: user.location,
        pincode: user.pincode,
        address: user.address,
        avatarUrl: user.avatarUrl,
      },
    });

    res.cookies.set("farmdirect_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
