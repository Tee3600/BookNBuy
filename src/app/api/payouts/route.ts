import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApprovedVendor } from "@/lib/guards";
import { notify } from "@/lib/notify";

// Vendor requests a payout of released earnings (MVP: manual bank transfer
// recorded here; Paystack Transfer automation is post-MVP).
export async function POST(req: Request) {
  const parsed = z.object({
    vendorEmail: z.string().email(),
    amountNGN: z.number().int().positive(),
  }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "vendorEmail + amountNGN required" }, { status: 400 });
  try {
    const vendor = await requireApprovedVendor(parsed.data.vendorEmail);
    const released = await db.escrowLedger.aggregate({
      where: { vendorId: vendor.id, status: { in: ["RELEASED", "PARTIAL"] } },
      _sum: { amountReleased: true },
    });
    const paidOut = await db.payout.aggregate({
      where: { vendorId: vendor.id, status: { in: ["PENDING", "PAID"] } },
      _sum: { amountNGN: true },
    });
    const available = (released._sum.amountReleased ?? 0) - (paidOut._sum.amountNGN ?? 0);
    if (parsed.data.amountNGN > available) {
      return NextResponse.json({ error: `Only ${available} NGN available`, available }, { status: 409 });
    }
    const p = await db.payout.create({ data: { vendorId: vendor.id, amountNGN: parsed.data.amountNGN, status: "PENDING" } });
    const v = await db.vendorProfile.findUnique({ where: { userId: vendor.id } });
    if (vendor.phone) await notify("payout.requested", vendor.phone, `BookNBuy: payout of ${parsed.data.amountNGN} NGN requested.`);
    return NextResponse.json({ payoutId: p.id, status: "PENDING", bankHint: v?.accountNumber ? `→ •••${v.accountNumber.slice(-4)}` : undefined });
  } catch (e) {
    if ((e as Error).message === "Vendor not approved") return NextResponse.json({ error: "Vendor not approved" }, { status: 403 });
    return NextResponse.json({ error: "Payouts unavailable (Postgres unreachable)" }, { status: 503 });
  }
}

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("vendorEmail") ?? "";
  if (!email) return NextResponse.json({ error: "vendorEmail required" }, { status: 400 });
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Unknown vendor" }, { status: 404 });
    const payouts = await db.payout.findMany({ where: { vendorId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json(payouts);
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
