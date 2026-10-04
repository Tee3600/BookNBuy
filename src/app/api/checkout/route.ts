import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { priceOrder, fxRateFor } from "@/lib/fees";
import { applyPaymentByReference, newReference, paystackConfigured, paystackInitialize } from "@/lib/payments";

const Item = z.object({
  kind: z.enum(["PRODUCT", "BOOKING"]),
  refId: z.string(),
  qty: z.number().int().positive().default(1),
});

const Body = z.object({
  buyerEmail: z.string().email(),
  items: z.array(Item).min(1).max(20),
  currencyPaid: z.string().regex(/^(NGN|USD|GBP|EUR)$/).default("NGN"),
});

// Phase 3 checkout: authoritative re-price from DB → Order(PENDING) +
// Payment(PENDING) → Paystack initialize (or demo mode without keys).
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout" }, { status: 400 });
  const { buyerEmail, items, currencyPaid } = parsed.data;

  try {
    const buyer = await db.user.findUnique({ where: { email: buyerEmail } });
    if (!buyer) return NextResponse.json({ error: "Sign up first" }, { status: 404 });

    // Authoritative pricing from DB (never trust client totals).
    const lines: Array<{ kind: "PRODUCT" | "BOOKING"; refId: string; priceNGN: number; qty: number }> = [];
    for (const it of items) {
      if (it.kind === "PRODUCT") {
        const p = await db.product.findUnique({ where: { id: it.refId } });
        if (!p || p.status !== "ACTIVE") return NextResponse.json({ error: `Unavailable product: ${it.refId}` }, { status: 409 });
        if (p.stock < it.qty) return NextResponse.json({ error: `Insufficient stock: ${p.title}` }, { status: 409 });
        lines.push({ kind: "PRODUCT", refId: p.id, priceNGN: p.priceNGN, qty: it.qty });
      } else {
        const bk = await db.booking.findUnique({ where: { id: it.refId } });
        if (!bk || bk.buyerId !== buyer.id) return NextResponse.json({ error: `Unknown booking: ${it.refId}` }, { status: 404 });
        if (bk.status !== "PENDING_PAYMENT") return NextResponse.json({ error: "Booking already paid" }, { status: 409 });
        const svc = await db.service.findUnique({ where: { id: bk.serviceId } });
        lines.push({ kind: "BOOKING", refId: bk.id, priceNGN: svc?.priceNGN ?? 0, qty: 1 });
      }
    }

    const fees = priceOrder(lines.map((l) => ({ priceNGN: l.priceNGN, qty: l.qty, kind: l.kind })));
    const fxRate = currencyPaid === "NGN" ? null : fxRateFor(currencyPaid);
    const reference = newReference();

    const order = await db.$transaction(async (tx) => {
      const o = await tx.order.create({ data: { buyerId: buyer.id, totalNGN: fees.totalNGN, feeNGN: fees.feeNGN, status: "PENDING" } });
      for (const l of lines) {
        await tx.orderItem.create({
          data: {
            orderId: o.id, type: l.kind,
            productId: l.kind === "PRODUCT" ? l.refId : null,
            bookingId: l.kind === "BOOKING" ? l.refId : null,
            qty: l.qty, priceNGN: l.priceNGN,
          },
        });
      }
      await tx.payment.create({
        data: { orderId: o.id, provider: "paystack", reference, amountNGN: fees.totalNGN, currencyPaid, fxRate, status: "PENDING" },
      });
      return o;
    });

    if (!paystackConfigured()) {
      return NextResponse.json({
        orderId: order.id, reference, mode: "demo",
        note: "Paystack keys not set — confirm via /api/checkout/verify (demo) or set keys for live checkout.",
        ...fees,
      });
    }

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const init = await paystackInitialize(buyerEmail, fees.totalNGN * 100, reference, `${appUrl}/checkout/callback?reference=${reference}`);
    return NextResponse.json({ orderId: order.id, reference, mode: "live", checkoutUrl: init.authorization_url, ...fees });
  } catch {
    return NextResponse.json({ error: "Checkout unavailable (Postgres unreachable)" }, { status: 503 });
  }
}

// Demo confirm + live verify: GET /api/checkout/verify?reference=…
export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get("reference") ?? "";
  if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });
  try {
    if (!paystackConfigured()) {
      const r = await applyPaymentByReference(reference);
      return NextResponse.json({ reference, mode: "demo", ...r });
    }
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await res.json();
    if (!res.ok || !data.status || data.data.status !== "success") {
      return NextResponse.json({ reference, verified: false, message: data.message ?? "Not paid" }, { status: 402 });
    }
    const r = await applyPaymentByReference(reference);
    return NextResponse.json({ reference, verified: true, mode: "live", ...r });
  } catch {
    return NextResponse.json({ error: "Verify unavailable (Postgres unreachable)" }, { status: 503 });
  }
}
