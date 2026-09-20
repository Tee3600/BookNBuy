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
