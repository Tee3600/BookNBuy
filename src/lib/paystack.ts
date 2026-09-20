// Paystack helpers (MVP): initialize transaction + verify webhook signature.
// Docs: https://paystack.com/docs/payments/webhooks - verify x-paystack-signature with HMAC SHA512.
import crypto from "crypto";

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";
  if (!signature) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}
