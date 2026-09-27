# Progress — BookNBuy prototype

## Phase reached: Phase 2 (Catalog + slot booking UI + APIs), demo-fallback mode
Date: 2026-09-27. Commit: see `git log`.

Working locally (`npm run dev` → http://localhost:3000):
- `/` — homepage with DB status + links to all flows
- `/api/health` — `{ok:true, db: postgres-local | demo-fallback}`
- `/signup`, `/login` — Better Auth email+password (needs local Postgres)
- `/vendor/onboard` — KYC submit → PENDING (DB or demo confirmation)
- `/admin/vendors` — approval queue (DB or demo row)
- `/catalog?q=&city=&max=` — products + services search/filter (DB or demo data)
- `/book/[serviceId]` — slot picker + booking POST (409 on double-book when on DB)
- `/vendor/products`, `/vendor/services` — vendor create forms + APIs (approved-vendor guard on DB)

## What comes next (roadmap)
- Phase 3: unified cart + Paystack checkout + webhook (idempotent by reference, 30-min FX quote lock, order expiry)
- Phase 4: escrow HELD→RELEASED auto-release job wiring + disputes + reviews
- Phase 5: fulfillment (COURIER/BIKE/WAYBILL/SELF) + Termii/Africa's Talking notifications + payouts + full admin queue
- Phase 6: hardening (rate limits, RBAC audit), seed demo, mobile pass, metrics

## To run with real DB (local-first, no Supabase/Vercel)
1. `docker compose up -d db`
2. Copy `.env.example` → `.env`, fill `BETTER_AUTH_SECRET` + R2 keys
3. `npm install`, `npx prisma migrate dev --name init`, `npm run db:seed`, `npm run dev`

## Demo video
Compulsory screen demo is recorded separately by the owner (submitted via form, not in repo).
Suggested 2-min script: homepage → catalog filter → book a slot → vendor add product → admin approve → health endpoint.
