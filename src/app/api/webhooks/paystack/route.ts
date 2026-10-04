import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { applyPaymentByReference } from "@/lib/payments";

// Paystack webhook: HMAC-SHA512 over the RAW body. Idempotent —
// charge.success replays dedupe by Payment.reference inside applyPaymentByReference.
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(raw, sig)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }
  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await applyPaymentByReference(event.data.reference);
    } catch (e) {
      // Stock changed since checkout etc. — acknowledge receipt, admin resolves.
      console.error("webhook apply failed:", (e as Error).message);
    }
  }
  return NextResponse.json({ received: true });
}
