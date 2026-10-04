import crypto from "crypto";
import { db } from "@/lib/db";
import { priceOrder, fxRateFor, PRODUCT_BPS, SERVICE_BPS } from "@/lib/fees";

const ESCROW_HOURS = Number(process.env.ESCROW_RELEASE_HOURS ?? 72);

export function paystackConfigured() {
  const k = process.env.PAYSTACK_SECRET_KEY ?? "";
  return k.length > 0 && k !== "sk_test_xxx";
}

export async function paystackInitialize(email: string, amountKobo: number, reference: string, callbackUrl: string) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount: amountKobo, reference, callback_url: callbackUrl }),
  });
  const data = await res.json();
  if (!res.ok || !data.status) throw new Error(data.message ?? "Paystack initialize failed");
  return data.data as { authorization_url: string; reference: string };
}

// Idempotent payment application: safe to call from verify + webhook replays.
// Applies stock decrement, booking confirmation, order PAID, per-vendor escrow HELD.
export async function applyPaymentByReference(reference: string) {
  return db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { reference }, include: { order: { include: { items: true } } } });
    if (!payment) return { applied: false as const, reason: "unknown-reference" };
    if (payment.status === "PAID") return { applied: true as const, duplicate: true, orderId: payment.orderId };

    const perVendor = new Map<string, number>();
    for (const item of payment.order.items) {
      if (item.type === "PRODUCT" && item.productId) {
        const p = await tx.product.findUnique({ where: { id: item.productId } });
        if (!p || p.stock < item.qty) throw new Error(`Out of stock: ${item.productId}`);
        await tx.product.update({ where: { id: p.id }, data: { stock: p.stock - item.qty } });
        const net = item.priceNGN * item.qty - Math.round(((item.priceNGN * item.qty) * PRODUCT_BPS) / 10000);
        perVendor.set(p.vendorId, (perVendor.get(p.vendorId) ?? 0) + net);
      } else if (item.type === "BOOKING" && item.bookingId) {
        const bk = await tx.booking.findUnique({ where: { id: item.bookingId } });
        if (!bk) throw new Error(`Unknown booking: ${item.bookingId}`);
        await tx.booking.update({ where: { id: bk.id }, data: { status: "CONFIRMED" } });
        const net = item.priceNGN - Math.round((item.priceNGN * SERVICE_BPS) / 10000);
        perVendor.set(bk.vendorId, (perVendor.get(bk.vendorId) ?? 0) + net);
      }
    }

    await tx.payment.update({ where: { id: payment.id }, data: { status: "PAID" } });
    await tx.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
    const releaseAfter = new Date(Date.now() + ESCROW_HOURS * 3600 * 1000);
    for (const [vendorId, amountHeld] of perVendor) {
      await tx.escrowLedger.create({ data: { paymentId: payment.id, vendorId, amountHeld, releaseAfter } });
    }
    return { applied: true as const, orderId: payment.orderId };
  });
}

export function newReference() {
  return `bbn_${Date.now().toString(36)}_${crypto.randomBytes(6).toString("hex")}`;
}

export { fxRateFor };
