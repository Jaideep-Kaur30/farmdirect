import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signAuthToken } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const { name, phone, password, role = "consumer", location, pincode, address } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "Name, phone number, and password are required." },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone.trim()))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this phone number already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const validRole = ["farmer", "consumer", "admin"].includes(role) ? role : "consumer";

    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        role: validRole,
        phone: phone.trim(),
        passwordHash,
        location: location || "India",
        pincode: pincode || "",
        address: address || "",
        avatarUrl:
          validRole === "farmer"
            ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      })
      .returning();

    const token = await signAuthToken({
      userId: newUser.id,
      role: newUser.role as "farmer" | "consumer" | "admin",
      name: newUser.name,
      phone: newUser.phone,
    });

    const res = NextResponse.json(
      {
        message: "Account created successfully",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          role: newUser.role,
          phone: newUser.phone,
          location: newUser.location,
          address: newUser.address,
        },
      },
      { status: 201 }
    );

    res.cookies.set("farmdirect_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message || "Failed to signup" }, { status: 500 });
  }
}
