import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Body = z.object({
  orderId: z.string(),
  buyerEmail: z.string().email(),
  reason: z.string().min(5).max(1000),
  photos: z.array(z.string()).max(5).default([]),
});

const INSPECTION_HOURS = Number(process.env.ESCROW_RELEASE_HOURS ?? 72);

// Buyer opens a dispute within the inspection window → order DISPUTED (funds frozen).
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "orderId, buyerEmail, reason (5+ chars) required" }, { status: 400 });
  const b = parsed.data;
  try {
    const order = await db.order.findUnique({ where: { id: b.orderId }, include: { payments: true } });
    if (!order) return NextResponse.json({ error: "Unknown order" }, { status: 404 });
    const buyer = await db.user.findUnique({ where: { email: b.buyerEmail } });
    if (!buyer || buyer.id !== order.buyerId) return NextResponse.json({ error: "Not your order" }, { status: 403 });
    if (order.status !== "PAID" && order.status !== "DELIVERED") {
      return NextResponse.json({ error: `Cannot dispute from ${order.status}` }, { status: 409 });
    }
    const paidAt = order.payments.find((p) => p.status === "PAID")?.createdAt ?? order.createdAt;
    if (Date.now() - paidAt.getTime() > INSPECTION_HOURS * 3600 * 1000) {
      return NextResponse.json({ error: "Inspection window expired" }, { status: 409 });
    }
    await db.$transaction([
      db.dispute.upsert({
        where: { orderId: order.id },
        create: { orderId: order.id, reason: b.reason, photos: JSON.stringify(b.photos) },
        update: { reason: b.reason, photos: JSON.stringify(b.photos), status: "OPEN" },
      }),
      db.order.update({ where: { id: order.id }, data: { status: "DISPUTED" } }),
    ]);
    return NextResponse.json({ orderId: order.id, status: "DISPUTED" });
  } catch {
    return NextResponse.json({ error: "Disputes unavailable (Postgres unreachable)" }, { status: 503 });
  }
}
