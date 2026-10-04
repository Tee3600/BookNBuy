"use client";
import { useState } from "react";

export function PayoutRequestForm({ vendorEmail }: { vendorEmail: string }) {
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Requesting…");
    const res = await fetch("/api/payouts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorEmail, amountNGN: Number(amount) }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Requested ${amount} NGN (${data.payoutId?.slice(0, 8)}…).` : `Error: ${data.error}`);
  }
  return (
    <form onSubmit={go}>
      <label>Amount (NGN)<input inputMode="numeric" required value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
      <p><button className="btn btn-primary" type="submit">Request payout</button> {msg && <span>{msg}</span>}</p>
    </form>
  );
}
