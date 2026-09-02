import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed";

export async function GET() {
  try {
    const result = await ensureSeeded();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await ensureSeeded();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
