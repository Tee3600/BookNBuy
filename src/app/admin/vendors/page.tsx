import { db } from "@/lib/db";

export default async function AdminVendorsPage() {
  let vendors: Array<{ userId: string; businessName: string; city: string; approved: boolean; email: string }> = [];
  let mode = "demo";
  try {
    const rows = await db.vendorProfile.findMany({ take: 50, include: { user: true } });
    vendors = rows.map((v) => ({ userId: v.userId, businessName: v.businessName, city: v.city, approved: v.approved, email: v.user.email }));
    mode = "db";
  } catch {
    vendors = [{ userId: "demo-amaka", businessName: "Adaeze's Boutique", city: "Abuja", approved: false, email: "amaka@example.com" }];
  }

  return (
    <div>
      <h1>Vendor approvals ({mode})</h1>
      <ul>
        {vendors.map((v) => (
          <li key={v.userId}>
            <strong>{v.businessName}</strong> — {v.city} — {v.email} — {v.approved ? "APPROVED" : "PENDING"}
            {!v.approved && (
              <form action={`/api/admin/vendors`} method="post" style={{ display: "inline", marginLeft: 8 }}>
                <input type="hidden" name="userId" value={v.userId} />
                <button type="submit">Approve</button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <p>Approve/reject writes to local Postgres when reachable; demo row otherwise.</p>
    </div>
  );
}
