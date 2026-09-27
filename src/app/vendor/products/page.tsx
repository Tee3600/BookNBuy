"use client";
import { useState } from "react";

export default function VendorProductsPage() {
  const [form, setForm] = useState({ vendorEmail: "", title: "", description: "", priceNGN: "", stock: "", imageUrl: "" });
  const [msg, setMsg] = useState("");
  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Saving…");
    const res = await fetch("/api/vendor/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(res.ok ? `Saved (${data.productId}, mode: ${data.mode}).` : `Error: ${data.error}`);
  }

  return (
    <div>
      <h1>Add product</h1>
      <p>Photos: paste an image URL for now — direct R2 upload (presigned URL) lands in Phase 3.</p>
      <form onSubmit={submit}>
        <label htmlFor="ve">Vendor account email</label>
        <input id="ve" type="email" required value={form.vendorEmail} onChange={(e) => set("vendorEmail", e.target.value)} />
        <label htmlFor="t">Title</label>
        <input id="t" required value={form.title} onChange={(e) => set("title", e.target.value)} />
        <label htmlFor="d">Description</label>
        <input id="d" required value={form.description} onChange={(e) => set("description", e.target.value)} />
        <label htmlFor="p">Price (NGN)</label>
        <input id="p" inputMode="numeric" required value={form.priceNGN} onChange={(e) => set("priceNGN", e.target.value)} />
        <label htmlFor="s">Stock</label>
        <input id="s" inputMode="numeric" required value={form.stock} onChange={(e) => set("stock", e.target.value)} />
        <label htmlFor="img">Image URL (R2 public URL after upload)</label>
        <input id="img" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
        <p><button className="btn btn-primary" type="submit">Save product</button></p>
      </form>
      <p>{msg}</p>
    </div>
  );
}
