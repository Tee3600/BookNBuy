import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminKey } from "@/lib/guards";
import { notify } from "@/lib/notify";

// Admin: list payouts + mark PAID with bank reference (MVP manual transfer).
export async function GET(req: Request) {
  if (!requireAdminKey(req)) return NextResponse.json({ error: "Admin key required" }, { status: 401 });
  try {
    const rows = await db.payout.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!requireAdminKey(req)) return NextResponse.json({ error: "Admin key required" }, { status: 401 });
  const parsed = z.object({ payoutId: z.string(), bankRef: z.string().min(2).max(200) }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "payoutId + bankRef required" }, { status: 400 });
  try {
    const p = await db.payout.update({
      where: { id: parsed.data.payoutId },
      data: { status: "PAID", bankRef: parsed.data.bankRef },
      include: {},
    });
    const vendor = await db.user.findUnique({ where: { id: p.vendorId } });
    if (vendor?.phone) await notify("payout.paid", vendor.phone, `BookNBuy: payout of ${p.amountNGN} NGN sent (ref ${parsed.data.bankRef}).`);
    return NextResponse.json({ payoutId: p.id, status: "PAID" });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
