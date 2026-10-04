import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApprovedVendor } from "@/lib/guards";
import { notify } from "@/lib/notify";

const Body = z.object({
  orderId: z.string(),
  vendorEmail: z.string().email(),
  method: z.enum(["COURIER", "BIKE", "WAYBILL", "SELF"]),
  trackingRef: z.string().max(200).default(""),
  receiptPhoto: z.string().max(500).default(""), // waybill receipt photo URL (R2 public URL)
  markDelivered: z.boolean().default(false),
});

// Vendor fulfillment update. PAID → IN_TRANSIT (shipped) → DELIVERED.
// WAYBILL requires a park/receipt reference; photo required in spirit —
// enforced as warning in demo mode, hard-required with DB.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "orderId, vendorEmail, method required" }, { status: 400 });
  const b = parsed.data;
  try {
    const vendor = await requireApprovedVendor(b.vendorEmail);
    const order = await db.order.findUnique({ where: { id: b.orderId }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Unknown order" }, { status: 404 });
    if (order.status !== "PAID" && order.status !== "FULFILLING" && order.status !== "IN_TRANSIT") {
      return NextResponse.json({ error: `Cannot fulfill from ${order.status}` }, { status: 409 });
    }
    // Vendor must own at least one line on this order.
    const owns = await ownsOrder(vendor.id, order.id);
    if (!owns) return NextResponse.json({ error: "Order has none of your items" }, { status: 403 });
    if (b.method === "WAYBILL" && !b.trackingRef) {
      return NextResponse.json({ error: "Waybill needs park/receipt number in trackingRef" }, { status: 400 });
    }

    const next = b.markDelivered ? "DELIVERED" : "IN_TRANSIT";
    await db.fulfillment.upsert({
      where: { orderId: order.id },
      create: { orderId: order.id, method: b.method, trackingRef: b.trackingRef || b.receiptPhoto || null, status: next },
      update: { method: b.method, trackingRef: b.trackingRef || b.receiptPhoto || null, status: next },
    });
    await db.order.update({ where: { id: order.id }, data: { status: b.markDelivered ? "DELIVERED" : order.status === "PAID" ? "FULFILLING" : "IN_TRANSIT" } });

    const buyer = await db.user.findUnique({ where: { id: order.buyerId } });
    if (buyer?.phone) {
      await notify(b.markDelivered ? "order.delivered" : "order.in_transit", buyer.phone,
        b.markDelivered ? `BookNBuy: order ${order.id.slice(0, 8)} delivered. Confirm receipt in-app.` : `BookNBuy: order ${order.id.slice(0, 8)} is on the way (${b.method}).`);
    }
    return NextResponse.json({ orderId: order.id, fulfillment: next, mode: "db" });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "Vendor not approved" || msg === "Order has none of your items") {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: "Fulfillment unavailable (Postgres unreachable)" }, { status: 503 });
  }
}

async function ownsOrder(vendorUserId: string, orderId: string) {
  const items = await db.orderItem.findMany({ where: { orderId } });
  for (const i of items) {
    if (i.productId) {
      const p = await db.product.findUnique({ where: { id: i.productId } });
      if (p?.vendorId === vendorUserId) return true;
    }
    if (i.bookingId) {
      const bk = await db.booking.findUnique({ where: { id: i.bookingId } });
      if (bk?.vendorId === vendorUserId) return true;
    }
  }
  return false;
}
