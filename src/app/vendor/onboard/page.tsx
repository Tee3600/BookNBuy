"use client";
import { useState } from "react";

export default function VendorOnboardPage() {
  const [form, setForm] = useState({ email: "", businessName: "", city: "", bankCode: "", accountNumber: "" });
  const [msg, setMsg] = useState("");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Submitting KYC…");
    const res = await fetch("/api/vendor/onboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(res.ok ? `KYC ${data.kycStatus} (mode: ${data.mode}). Await admin approval.` : `Error: ${data.error}`);
  }

  return (
    <div>
      <h1>Become a vendor</h1>
      <p>One account for buying and selling. KYC goes to PENDING; an admin approves it.</p>
      <form onSubmit={submit}>
        <label htmlFor="email">Account email</label>
        <input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        <label htmlFor="biz">Business name</label>
        <input id="biz" required value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
        <label htmlFor="city">City</label>
        <input id="city" required value={form.city} onChange={(e) => set("city", e.target.value)} />
        <label htmlFor="bank">Bank code</label>
        <input id="bank" value={form.bankCode} onChange={(e) => set("bankCode", e.target.value)} placeholder="e.g. 058" />
        <label htmlFor="acct">Account number</label>
        <input id="acct" value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} placeholder="10-digit NUBAN" />
        <p><button className="btn btn-primary" type="submit">Submit KYC</button></p>
      </form>
      <p>{msg}</p>
    </div>
  );
}
