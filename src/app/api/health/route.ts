import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    await ensureSeeded();
    return Response.json({ ok: true, platform: "FarmDirect SIH 2026" });
  } catch (error) {
    console.error("Health check / seed error:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
