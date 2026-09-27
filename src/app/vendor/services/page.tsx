"use client";
import { useState } from "react";

export default function VendorServicesPage() {
  const [form, setForm] = useState({ vendorEmail: "", title: "", priceNGN: "", durationMin: "60", bufferMin: "0" });
  const [msg, setMsg] = useState("");
  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Saving…");
    const res = await fetch("/api/vendor/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(res.ok ? `Saved (${data.serviceId}, mode: ${data.mode}).` : `Error: ${data.error}`);
  }

  return (
    <div>
      <h1>Add service</h1>
      <form onSubmit={submit}>
        <label htmlFor="ve">Vendor account email</label>
        <input id="ve" type="email" required value={form.vendorEmail} onChange={(e) => set("vendorEmail", e.target.value)} />
        <label htmlFor="t">Title</label>
        <input id="t" required value={form.title} onChange={(e) => set("title", e.target.value)} />
        <label htmlFor="p">Price (NGN)</label>
        <input id="p" inputMode="numeric" required value={form.priceNGN} onChange={(e) => set("priceNGN", e.target.value)} />
        <label htmlFor="dur">Duration (minutes)</label>
        <input id="dur" inputMode="numeric" value={form.durationMin} onChange={(e) => set("durationMin", e.target.value)} />
        <label htmlFor="buf">Buffer (minutes)</label>
        <input id="buf" inputMode="numeric" value={form.bufferMin} onChange={(e) => set("bufferMin", e.target.value)} />
        <p><button className="btn btn-primary" type="submit">Save service</button></p>
      </form>
      <p>{msg}</p>
    </div>
  );
}
