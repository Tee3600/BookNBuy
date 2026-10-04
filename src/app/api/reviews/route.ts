import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Body = z.object({
  orderId: z.string().optional(),
  bookingId: z.string().optional(),
  buyerEmail: z.string().email(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).default(""),
});

// Reviews only after COMPLETED, one per order/booking.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success || (!parsed.data.orderId && !parsed.data.bookingId)) {
    return NextResponse.json({ error: "orderId or bookingId + buyerEmail + rating 1-5 required" }, { status: 400 });
  }
  const b = parsed.data;
  try {
    const buyer = await db.user.findUnique({ where: { email: b.buyerEmail } });
    if (!buyer) return NextResponse.json({ error: "Unknown buyer" }, { status: 404 });

    let vendorId: string | null = null;
    if (b.orderId) {
      const order = await db.order.findUnique({ where: { id: b.orderId } });
      if (!order || order.buyerId !== buyer.id) return NextResponse.json({ error: "Not your order" }, { status: 403 });
      if (order.status !== "COMPLETED") return NextResponse.json({ error: "Reviewable only after COMPLETED" }, { status: 409 });
      const dupe = await db.review.findFirst({ where: { orderId: b.orderId, buyerId: buyer.id } });
      if (dupe) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
      const item = await db.orderItem.findFirst({ where: { orderId: b.orderId } });
      const prod = item?.productId ? await db.product.findUnique({ where: { id: item.productId } }) : null;
      const bk = item?.bookingId ? await db.booking.findUnique({ where: { id: item.bookingId } }) : null;
      vendorId = prod?.vendorId ?? bk?.vendorId ?? null;
    } else {
      const bk = await db.booking.findUnique({ where: { id: b.bookingId } });
      if (!bk || bk.buyerId !== buyer.id) return NextResponse.json({ error: "Not your booking" }, { status: 403 });
      if (bk.status !== "COMPLETED") return NextResponse.json({ error: "Reviewable only after COMPLETED" }, { status: 409 });
      const dupe = await db.review.findFirst({ where: { bookingId: b.bookingId, buyerId: buyer.id } });
      if (dupe) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
      vendorId = bk.vendorId;
    }
    if (!vendorId) return NextResponse.json({ error: "No vendor found" }, { status: 422 });
    const r = await db.review.create({
      data: { vendorId, buyerId: buyer.id, orderId: b.orderId, bookingId: b.bookingId, rating: b.rating, comment: b.comment },
    });
    return NextResponse.json({ reviewId: r.id });
  } catch {
    return NextResponse.json({ error: "Reviews unavailable (Postgres unreachable)" }, { status: 503 });
  }
}
