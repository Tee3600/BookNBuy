import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Body = z.object({ buyerEmail: z.string().email() });

// Buyer confirms receipt → order COMPLETED + HELD escrows released early.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "buyerEmail required" }, { status: 400 });
  try {
    const order = await db.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Unknown order" }, { status: 404 });
    const buyer = await db.user.findUnique({ where: { email: parsed.data.buyerEmail } });
    if (!buyer || buyer.id !== order.buyerId) return NextResponse.json({ error: "Not your order" }, { status: 403 });
    if (order.status !== "PAID" && order.status !== "DELIVERED") {
      return NextResponse.json({ error: `Cannot confirm from ${order.status}` }, { status: 409 });
    }
    const released = await db.$transaction(async (tx) => {
      const held = await tx.escrowLedger.findMany({ where: { payment: { orderId: order.id }, status: "HELD" } });
      for (const e of held) {
        await tx.escrowLedger.update({ where: { id: e.id }, data: { status: "RELEASED", amountReleased: e.amountHeld } });
      }
      await tx.order.update({ where: { id: order.id }, data: { status: "COMPLETED" } });
      return held.reduce((s, e) => s + e.amountHeld, 0);
    });
    return NextResponse.json({ orderId: order.id, status: "COMPLETED", released });
  } catch {
    return NextResponse.json({ error: "Confirm unavailable (Postgres unreachable)" }, { status: 503 });
  }
}
