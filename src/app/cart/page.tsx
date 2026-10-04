"use client";
import { useEffect, useMemo, useState } from "react";
import { loadCart, saveCart, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [preview, setPreview] = useState<null | { subtotalNGN: number; feeNGN: number; totalNGN: number; fx: null | { amountBuyer: number; currency: string; expiresAt: string } }>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => { setCart(loadCart()); }, []);
  const count = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  function removeAt(idx: number) {
    const next = cart.filter((_, i) => i !== idx);
    setCart(next); saveCart(next); setPreview(null);
  }

  async function quote() {
    setMsg("Pricing…");
    const res = await fetch("/api/checkout/quote", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: cart.map((c) => ({ priceNGN: c.priceNGN, qty: c.qty, kind: c.kind })), currency }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(`Error: ${data.error}`); return; }
    setPreview(data); setMsg("");
  }

  async function checkout() {
    if (!preview) { setMsg("Get a price preview first."); return; }
    setMsg("Creating order…");
    const res = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerEmail: email, items: cart.map((c) => ({ kind: c.kind, refId: c.refId, qty: c.qty })), currencyPaid: currency }),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(`Error: ${data.error}`); return; }
    if (data.mode === "live" && data.checkoutUrl) {
      setCart([]); saveCart([]);
      window.location.href = data.checkoutUrl;
    } else {
      setMsg(`Order ${data.orderId} created (demo mode). Confirm payment: /checkout/callback?reference=${data.reference}`);
    }
  }

  return (
    <div>
      <h1>Cart ({count} items)</h1>
      {cart.length === 0 && <p>Empty. Add products from <a href="/catalog">catalog</a> or bookings from a service page.</p>}
      <ul>
        {cart.map((c, i) => (
          <li key={i}>{c.title} — {c.kind} × {c.qty} — ₦{(c.priceNGN * c.qty).toLocaleString()}
            <button onClick={() => removeAt(i)} style={{ marginLeft: 8 }}>Remove</button>
          </li>
        ))}
      </ul>
      {cart.length > 0 && (
        <div>
          <label htmlFor="email">Account email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="cur">Pay in</label>
          <select id="cur" value={currency} onChange={(e) => { setCurrency(e.target.value); setPreview(null); }}>
            <option>NGN</option><option>USD</option><option>GBP</option><option>EUR</option>
          </select>
          <p>
            <button className="btn btn-secondary" onClick={quote}>Preview price</button>{" "}
            <button className="btn btn-primary" onClick={checkout}>Checkout</button>
          </p>
          {preview && (
            <p>Subtotal ₦{preview.subtotalNGN.toLocaleString()} + fees ₦{preview.feeNGN.toLocaleString()} = <strong>₦{preview.totalNGN.toLocaleString()}</strong>
            {preview.fx && <> (≈ {preview.fx.currency} {preview.fx.amountBuyer}, quote expires {new Date(preview.fx.expiresAt).toLocaleTimeString()})</>}</p>
          )}
        </div>
      )}
      <p>{msg}</p>
    </div>
  );
}
