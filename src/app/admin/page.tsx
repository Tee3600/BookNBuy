import Link from "next/link";
import { PRODUCT_BPS, SERVICE_BPS, FLAT_FEE_NGN } from "@/lib/fees";

// Admin home: queues + visible commission config (MVP read-only from env;
// editable config UI is post-MVP).
export default function AdminPage() {
  return (
    <div>
      <h1>Admin</h1>
      <ul>
        <li><Link href="/admin/vendors">Vendor approvals</Link></li>
        <li><Link href="/admin/disputes">Disputes queue</Link></li>
        <li><Link href="/admin/payouts">Payouts queue</Link></li>
      </ul>
      <h2>Commission config (from env)</h2>
      <ul>
        <li>Products: {PRODUCT_BPS / 100}%</li>
        <li>Services: {SERVICE_BPS / 100}%</li>
        <li>Flat per order: ₦{FLAT_FEE_NGN}</li>
      </ul>
      <p>Mutations on admin APIs require <code>x-admin-key</code> when <code>ADMIN_KEY</code> is set (Phase 6 RBAC).</p>
    </div>
  );
}
