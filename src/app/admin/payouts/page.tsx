"use client";
import { useEffect, useState } from "react";

type Payout = { id: string; vendorId: string; amountNGN: number; status: string; bankRef: string | null };

export default function AdminPayoutsPage() {
  const [list, setList] = useState<Payout[]>([]);
  const [msg, setMsg] = useState("Loading…");
  const [bankRef, setBankRef] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/payouts");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
      setMsg(Array.isArray(data) ? "" : (data.error ?? ""));
    } catch { setMsg("Unavailable (Postgres unreachable)."); }
  }
  useEffect(() => { load(); }, []);

  async function markPaid(id: string) {
    if (!bankRef) { setMsg("Enter the bank transfer reference first."); return; }
    setMsg("Marking paid…");
    const res = await fetch("/api/admin/payouts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoutId: id, bankRef }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Marked PAID." : `Error: ${data.error}`);
    load();
  }

  return (
    <div>
      <h1>Payouts queue</h1>
      <label>Bank transfer ref<input value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="e.g. TRF-2026-001" /></label>
      {list.length === 0 && <p>{msg || "Queue empty."}</p>}
      <ul>
        {list.map((p) => (
          <li key={p.id}>₦{p.amountNGN.toLocaleString()} — {p.status}{p.bankRef ? ` (${p.bankRef})` : ""}{" "}
            {p.status === "PENDING" && <button onClick={() => markPaid(p.id)}>Mark paid</button>}
          </li>
        ))}
      </ul>
      <p>{msg}</p>
    </div>
  );
}
