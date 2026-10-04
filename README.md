# BookNBuy — MVP

Unified marketplace to buy goods + book services in one account (NGN-first, diaspora-ready).

PRD: `docs/gemini-code-1789943796558.md`

## Stack (MVP)
- Next.js 14 App Router + TypeScript + Tailwind
- Prisma + SQLite (dev) -> Postgres (prod)
- NextAuth (email+password, OTP post-MVP)
- Paystack (cards, bank transfer, USSD, Apple Pay)
- Termii / Africa's Talking for SMS/WhatsApp (notifications)

## Quickstart (requires Node 20+)

1. Install Node LTS from https://nodejs.org, then:
```powershell
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```
2. Open http://localhost:3000
3. Health check: http://localhost:3000/api/health

## MVP build order
1. Auth + roles (BUYER/VENDOR/ADMIN)
2. Vendor KYC + admin approve
3. Products CRUD + Services + slot booking (unique vendor+startAt guard)
4. Unified cart -> Order + Paystack checkout + webhook
5. Escrow HELD -> RELEASED (72h auto-release job) + disputes
6. Manual fulfillment (COURIER/BIKE/WAYBILL/SELF) + SMS/WhatsApp notify
7. Reviews + vendor payouts

## Env
See `.env.example`. Never commit `.env`.

## Demo script (Phase 6, ~5 min, local)
1. `docker compose up -d db`, `.env` filled, `npm install`, `npx prisma migrate dev --name init`, `npm run db:seed`, `npm run dev`
2. Tobi (buyer): sign up `tobi@example.com` → `/catalog?q=gele` → `/book/s…` pick slot → `/cart` preview (NGN + USD quote) → checkout (Paystack test) → `/checkout/callback?reference=…` → order PAID, escrow HELD
3. Amaka (vendor): `/vendor/earnings?email=amaka@example.com` shows pending → update `/orders/…` fulfillment BIKE → DELIVERED → Tobi confirms → COMPLETED + review
4. Dispute path: open dispute on a PAID order → `/admin/disputes` resolve (release/refund/partial) → `npm run escrow:release` skips DISPUTED
5. Payout: Amaka requests payout → `/admin/payouts` mark PAID with bank ref
6. Health: `/api/health` → `{ok:true}`

## Success metrics (PRD §9, first 3 months)
50 vendors · 200 completed orders/bookings · <5% disputes · >60% auto-release without dispute · >35% checkout conversion · payout T+2 days.
