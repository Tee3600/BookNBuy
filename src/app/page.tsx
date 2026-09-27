import Link from "next/link";
import { dbReachable } from "@/lib/store";

export default async function Home() {
  const db = await dbReachable();
  return (
    <div>
      <h1>Buy goods, book services — one account.</h1>
      <p>
        BookNBuy prototype (Phases 0–2). Local-first: Next.js + local Postgres + Better Auth + Cloudflare R2.
        No Supabase, no Vercel.
      </p>
      <p>
        Database: <strong>{db ? "connected (local Postgres)" : "demo mode (Postgres not reachable — run docker compose up -d db)"}</strong>
      </p>
      <nav>
        <ul>
          <li><Link href="/catalog">Browse catalog (products + services)</Link></li>
          <li><Link href="/login">Log in</Link> · <Link href="/signup">Sign up</Link></li>
          <li><Link href="/vendor/onboard">Become a vendor (KYC)</Link></li>
          <li><Link href="/vendor/products">Vendor: add product</Link> · <Link href="/vendor/services">Vendor: add service</Link></li>
          <li><Link href="/admin/vendors">Admin: vendor approvals</Link></li>
          <li><Link href="/api/health">API health</Link></li>
        </ul>
      </nav>
    </div>
  );
}
