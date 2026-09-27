import { NextResponse } from "next/server";
import { dbReachable } from "@/lib/store";

export async function GET() {
  const db = await dbReachable();
  return NextResponse.json({
    ok: true,
    service: "booknbuy",
    phase: "0-2",
    db: db ? "postgres-local" : "demo-fallback",
    time: new Date().toISOString(),
  });
}
