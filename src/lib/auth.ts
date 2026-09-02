import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "farmdirect-sih-2026-super-secret-key"
);

export interface TokenPayload {
  userId: number;
  role: "farmer" | "consumer" | "admin";
  name: string;
  phone: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signAuthToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: Number(payload.userId),
      role: payload.role as "farmer" | "consumer" | "admin",
      name: String(payload.name),
      phone: String(payload.phone),
    };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: NextRequest) {
  // First look in Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice("Bearer ".length).trim();
  } else {
    // Check cookie fallback
    token = req.cookies.get("farmdirect_token")?.value || "";
  }

  if (!token) return null;
  const decoded = await verifyAuthToken(token);
  if (!decoded) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);

  if (!dbUser) return null;

  return {
    id: dbUser.id,
    name: dbUser.name,
    role: dbUser.role as "farmer" | "consumer" | "admin",
    phone: dbUser.phone,
    location: dbUser.location,
    pincode: dbUser.pincode,
    address: dbUser.address,
    avatarUrl: dbUser.avatarUrl,
    createdAt: dbUser.createdAt,
  };
}
