# Progress — BookNBuy prototype

## Phase reached: Phase 4 (escrow + disputes + reviews), demo-fallback mode
Date: 2026-10-04. Commit: see `git log`.

Working locally (`npm run dev` → http://localhost:3000):
- Phase 0–2 (unchanged): `/`, `/api/health`, `/signup`, `/login`, `/vendor/onboard`, `/admin/vendors`, `/catalog`, `/book/[serviceId]`, `/vendor/products`, `/vendor/services`
- Phase 3 — cart + checkout: `/cart` (localStorage cart, server fee preview via `/api/checkout/quote`, FX quote with 30-min lock), `POST /api/checkout` (authoritative DB re-price → Order PENDING + Payment PENDING → Paystack initialize or demo mode), `/checkout/callback?reference=` + `GET /api/checkout/verify` (Paystack verify or demo confirm → idempotent apply: stock decrement, bookings CONFIRMED, order PAID, per-vendor escrow HELD), `POST /api/webhooks/paystack` (HMAC-SHA512 raw-body check, charge.success, replay-safe), `npm run order:expire` (cancels PENDING orders + quotes older than 30 min)
- Phase 4 — escrow + trust: `/orders/[id]` (items, payments, escrow held/released, confirm/dispute/review actions), buyer early confirm (`POST /api/orders/[id]/confirm` → COMPLETED + escrow released), disputes in-window (`POST /api/disputes` → DISPUTED, release frozen), admin queue `/admin/disputes` + `POST /api/admin/disputes` (release/refund/partial), `POST /api/reviews` (COMPLETED only, one per order/booking), `npm run escrow:release` (skips DISPUTED orders, COMPLETES orders with no HELD escrow left)

## What comes next (roadmap)
- Phase 5: fulfillment (COURIER/BIKE/WAYBILL/SELF) + Termii/Africa's Talking notifications + payouts + full admin queue
- Phase 6: hardening (rate limits, RBAC audit), seed demo, mobile pass, metrics

## To run with real DB (local-first, no Supabase/Vercel)
1. Install Docker Desktop, then `docker compose up -d db`
2. Copy `.env.example` → `.env`, fill `BETTER_AUTH_SECRET` + R2 keys (+ Paystack keys for live checkout)
3. `npm install`, `npx prisma migrate dev --name init`, `npm run db:seed`, `npm run dev`

Pending: schema changed `EscrowLedger` to per-vendor rows (`@@unique([paymentId, vendorId])`, `Payment.escrows[]`) — run `npx prisma migrate dev` once Postgres is up. Until then the app serves demo-fallback pages.

## Demo video
Compulsory screen demo is recorded separately by the owner (submitted via form, not in repo).
Suggested 2-min script: homepage → catalog filter → book a slot → vendor add product → admin approve → health endpoint.
