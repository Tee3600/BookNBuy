import Link from "next/link";
import { dbReachable } from "@/lib/store";

export default async function AppHub() {
  const db = await dbReachable();
  return (
    <div>
      <h1>App hub (prototype)</h1>
      <p>
        <Link href="/">← Back to landing page</Link>
      </p>
      <p>
        Database: <strong>{db ? "connected (local Postgres)" : "demo mode (Postgres not reachable — run npm run db:up)"}</strong>
      </p>
      <nav>
        <ul>
          <li><Link href="/catalog">Browse catalog (products + services)</Link></li>
          <li><Link href="/cart">Cart + checkout (Paystack)</Link></li>
          <li><Link href="/login">Log in</Link> · <Link href="/signup">Sign up</Link></li>
          <li><Link href="/vendor/onboard">Become a vendor (KYC)</Link> · <Link href="/vendor/earnings?email=amaka@example.com">Vendor earnings</Link></li>
          <li><Link href="/vendor/products">Vendor: add product</Link> · <Link href="/vendor/services">Vendor: add service</Link></li>
          <li><Link href="/admin/vendors">Admin: vendor approvals</Link> · <Link href="/admin/disputes">Admin: disputes</Link> · <Link href="/admin/payouts">Admin: payouts</Link> · <Link href="/admin">Admin home</Link></li>
          <li><Link href="/api/health">API health</Link></li>
        </ul>
      </nav>
    </div>
  );
}
