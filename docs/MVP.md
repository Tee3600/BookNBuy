# BookNBuy — MVP

Single-file MVP reference. Status: implemented (Phases 0–6), `tsc --noEmit` clean.
Details: `README.md`, `PROGRESS.md`, `docs/gemini-code-1789943796558.md`.

## 1. What it is
Unified marketplace: buy goods + book services on one account. NGN-first, diaspora-ready
(pay in USD/GBP/EUR, vendors settle in NGN).

## 2. Stack
Next.js 14 App Router + TypeScript + Tailwind · Prisma + Postgres (local Docker, no Supabase)
· Better Auth email+password · Paystack (cards, transfer, USSD, Apple Pay) · R2 (S3-compatible
photos) · Termii SMS (log-first without key).

## 3. Money math (`src/lib/fees.ts`)
- Commission: 8% products (`COMMISSION_PRODUCT_BPS`), 10% services (`COMMISSION_SERVICE_BPS`), + ₦100 flat/order.
- FX: NGN settlement; diaspora sees quote with 2% buffer, locked 30 min (unpaid orders expire via `npm run order:expire`).

## 4. Flows and routes
| Flow | UI | API |
|---|---|---|
| Auth + roles BUYER/VENDOR/ADMIN | `/signup`, `/login` | `/api/auth/[...all]` (Better Auth) |
| Vendor KYC → admin approve | `/vendor/onboard`, `/admin/vendors` | `POST /api/vendor/onboard`, `POST /api/admin/vendors` |
| Products / Services CRUD | `/vendor/products`, `/vendor/services`, `/catalog` | `POST /api/vendor/products`, `POST /api/vendor/services` |
| Slot booking (409 on double-book via `@@unique([vendorId, startAt])`) | `/book/[serviceId]` | `POST /api/bookings` |
| Cart + fee preview + FX quote | `/cart` (localStorage) | `POST /api/checkout/quote` |
| Checkout: DB re-price → Order PENDING + Payment PENDING → Paystack init or demo | `/cart`, `/checkout/callback?reference=` | `POST /api/checkout`, `GET /api/checkout/verify` |
| Webhook (HMAC-SHA512 raw body, replay-safe by `Payment.reference`) | — | `POST /api/webhooks/paystack` (charge.success → idempotent `applyPaymentByReference`: stock decrement, bookings CONFIRMED, order PAID, per-vendor escrow HELD) |
| Order view, early confirm, dispute, review | `/orders/[id]` | `POST /api/orders/[id]/confirm` (→ COMPLETED + escrow RELEASED) |
| Fulfillment PAID→FULFILLING→IN_TRANSIT→DELIVERED (COURIER/BIKE/WAYBILL/SELF; WAYBILL needs receipt no.) | FulfillForm on `/orders/[id]` | `POST /api/fulfillment` |
| Disputes in 72h window → DISPUTED (funds frozen) → admin release/refund/partial | `/orders/[id]`, `/admin/disputes` | `POST /api/disputes`, `POST /api/admin/disputes` |
| Reviews (COMPLETED only, one per order/booking) | `/orders/[id]` | `POST /api/reviews` |
| Payouts (manual-transfer requests → admin marks PAID with bank ref) | `/vendor/earnings?email=`, `/admin/payouts`, `/admin` | `POST /api/payouts`, `POST /api/admin/payouts` |
| Health | `/api/health` → `{ok, db: postgres-local \| demo-fallback}` | — |

## 5. State machines
- Order: `PENDING > PAID > FULFILLING > IN_TRANSIT > DELIVERED > COMPLETED | DISPUTED | REFUNDED | CANCELLED`
- Booking: `PENDING_PAYMENT > CONFIRMED > COMPLETED | CANCELLED | NO_SHOW`
- Escrow: `HELD > RELEASED | REFUNDED | PARTIAL`; auto-release after `ESCROW_RELEASE_HOURS` (72) via `npm run escrow:release` (skips DISPUTED).

## 6. Run (local-first)
1. `docker compose up -d db`
2. Copy `.env.example` → `.env`; set `BETTER_AUTH_SECRET` (32+ chars), R2 keys, Paystack keys for live checkout.
3. `npm install` · `npx prisma migrate dev --name init` (applies per-vendor escrow `@@unique([paymentId, vendorId])`) · `npm run db:seed` · `npm run dev`
4. Without DB the app still renders via demo-fallback data; money writes return 503.

## 7. Hardening (done in MVP)
Rate limits (20/min on checkout/bookings/disputes/onboard), approved-vendor guards + `x-admin-key` when `ADMIN_KEY` set, webhook HMAC enforced, `not-found.tsx`, 480px mobile rules.

## 8. Out of scope (post-MVP)
Native apps, live GPS, automated Paystack Transfers, multi-currency settlement, in-app chat, promos/coupons, courier APIs, recommendations, Redis rate limits, editable commission config.
