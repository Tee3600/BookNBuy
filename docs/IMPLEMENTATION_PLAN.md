# Implementation Plan — BookNBuy (derived from PRD)

Source PRD: `docs/gemini-code-1789943796558.md` (+ canonical copy `docs/PRD.md`)
Stack snapshot: Next.js 14 App Router + TypeScript, Prisma, NextAuth, Paystack, Cloudinary.
**App & DB run locally for now** — no cloud deploy required for Phases 0–5.

## Phase 0 — Local foundation (0.5 day)
Goal: anyone can clone and run.
Outputs:
- `npm install` passes on Node 20+
- `npx prisma migrate dev --name init` creates SQLite `dev.db`
- `npm run dev` serves `/` + `GET /api/health` → `{ok:true}`
- `.env.example` documented; `.env` never committed
Done when: health endpoint returns 200 locally, Prisma Studio opens.

## Phase 1 — Auth, roles, vendor KYC (2–3 days)
PRD §3.1, §4.1–4.2, §4.13
Outputs:
- `src/app/(auth)/login|signup` + NextAuth session
- `User.roles` = BUYER/VENDOR/ADMIN; `KycStatus` flow NONE→PENDING→APPROVED/REJECTED
- `src/app/vendor/onboard` form (businessName, city, bankCode, accountNumber)
- `src/app/admin/vendors` approve/reject queue + audit log entry
Done when: one account can sign up → apply as vendor → get approved → see vendor dashboard link.

## Phase 2 — Catalog + slot booking (3–4 days)
PRD §3.2–3.3, §4.3–4.4, §6 Product/Service/Booking
Outputs:
- `Product` CRUD + image upload abstraction (`src/lib/storage.ts` → Cloudinary now, S3 later)
- `Service` CRUD (duration, buffer, workingHours JSON, blackout dates)
- Slot generation (`src/lib/booking.ts`) + booking create in DB transaction
- Anti-double-book: `@@unique([vendorId, startAt])`; catch P2002 → "slot taken"
- Buyer search/filter (keyword, category, price, city) + availability view
Done when: vendor creates product + service; two concurrent bookings for same slot → exactly one succeeds.

## Phase 3 — Unified cart + Paystack checkout (3–4 days)
PRD §3.4, §4.5–4.6, §5, §6 Order/OrderItem/Payment
Outputs:
- Cart with `PRODUCT` + `BOOKING` line items; fee preview (subtotal, delivery, service fee, FX quote w/ 30-min lock)
- `POST /api/checkout` creates Order(PENDING) + Payment(PENDING, unique reference)
- Paystack initialize → callback → `POST /api/webhooks/paystack` verifies HMAC-SHA512, idempotent by reference → Payment PAID → Order PAID
- Expire unpaid orders after 30 min
Done when: test checkout (Paystack test key) marks order PAID; replayed webhook does not double-apply.

## Phase 4 — Escrow, disputes, reviews (2–3 days)
PRD §3.6, §4.7–4.10, §4.12, §6 EscrowLedger/Dispute/Review
Outputs:
- On Payment PAID → EscrowLedger(HELD, releaseAfter = now + 72h)
- `scripts/escrow-release.ts` releases due HELD → RELEASED; runnable via `npm run escrow:release`
- Buyer confirm-receipt early-release; dispute open (reason + photos) freezes release
- Admin resolve → RELEASED / REFUNDED / PARTIAL; Review allowed only after COMPLETED (one per order/booking)
Done when: paid order → HELD → auto RELEASED after window; disputed order stays HELD until resolved.

## Phase 5 — Fulfillment, notifications, payouts, admin (2–3 days)
PRD §3.5, §3.7–3.8, §4.11, §4.13
Outputs:
- Fulfillment update (COURIER|BIKE|WAYBILL|SELF + trackingRef/receipt photo); state machine PENDING→…→COMPLETED|DISPUTED|REFUNDED
- Notifications hook (`src/lib/notify.ts` → email log + Termii/Africa's Talking stub) on confirmed/in-transit/delivered/completed/payout
- Vendor earnings view (pending/available/paid); payout record (manual bank transfer in MVP, Paystack Transfer post-MVP)
- Admin queue: orders, disputes, payouts, commission config
Done when: vendor fulfills via WAYBILL + receipt no.; buyer gets status updates; earnings move pending→available→paid.

## Phase 6 — Hardening + demo (2 days)
PRD §7, §9
Outputs:
- Rate-limit auth/OTP, RBAC checks on vendor/admin routes, webhook signature enforced
- Mobile-first pass (360px), empty/error states, seed demo data (Tobi buyer, Amaka vendor, Kemi diaspora)
- README demo script + success-metric checklist (§9)
Done when: fresh clone → seed → login as 3 personas → full buy + book flow locally without errors.

## Tool review (for §2 of task)
- Framework: Next.js 14 App Router (web + API routes in one deployable; mobile apps post-MVP reuse the API)
- Database: Prisma ORM; SQLite locally in Phases 0–3, Postgres (Docker) locally from Phase 4; Postgres managed in prod
- Authentication: NextAuth (self-hosted sessions, email+password now, SMS/WhatsApp OTP next)
- File storage: Cloudinary for MVP product/dispute photos (fast unsigned uploads); S3-compatible path post-MVP
- Local-first: `npm run dev` + SQLite file / local Postgres container; Paystack test keys; no cloud dependency to demo.
