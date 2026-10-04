import { db } from "@/lib/db";
import { formatNGN } from "@/lib/demo";
import { PayoutRequestForm } from "./request-form";

export default async function EarningsPage({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email ?? "";
  if (!email) {
    return <div><h1>Vendor earnings</h1><p>Open with <code>/vendor/earnings?email=you@example.com</code>.</p></div>;
  }
  let data: { pending: number; available: number; paidOut: number; payouts: Array<{ id: string; amountNGN: number; status: string; bankRef: string | null }> } | null = null;
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      const [held, released, payouts] = await Promise.all([
        db.escrowLedger.aggregate({ where: { vendorId: user.id, status: "HELD" }, _sum: { amountHeld: true } }),
        db.escrowLedger.aggregate({ where: { vendorId: user.id, status: { in: ["RELEASED", "PARTIAL"] } }, _sum: { amountReleased: true } }),
        db.payout.findMany({ where: { vendorId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
      ]);
      const claimed = payouts.filter((p) => p.status !== "CANCELLED").reduce((s, p) => s + p.amountNGN, 0);
      data = {
        pending: held._sum.amountHeld ?? 0,
        available: (released._sum.amountReleased ?? 0) - claimed,
        paidOut: payouts.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amountNGN, 0),
        payouts: payouts.map((p) => ({ id: p.id, amountNGN: p.amountNGN, status: p.status, bankRef: p.bankRef })),
      };
    }
  } catch { /* demo */ }

  if (!data) return <div><h1>Vendor earnings</h1><p>Unknown vendor or Postgres unreachable.</p></div>;
  return (
    <div>
      <h1>Earnings — {email}</h1>
      <p>Pending (escrow HELD): <strong>{formatNGN(data.pending)}</strong></p>
      <p>Available (released, unclaimed): <strong>{formatNGN(data.available)}</strong></p>
      <p>Paid out: <strong>{formatNGN(data.paidOut)}</strong></p>
      <h2>Request payout (manual bank transfer, MVP)</h2>
      <PayoutRequestForm vendorEmail={email} />
      <h2>Payout history</h2>
      <ul>{data.payouts.map((p) => <li key={p.id}>{formatNGN(p.amountNGN)} — {p.status}{p.bankRef ? ` (${p.bankRef})` : ""}</li>)}
      {data.payouts.length === 0 && <li>None yet.</li>}</ul>
    </div>
  );
}
