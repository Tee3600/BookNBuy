"use client";
import { useState } from "react";

export function ConfirmButton({ orderId }: { orderId: string }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function go() {
    setMsg("Confirming…");
    const res = await fetch(`/api/orders/${orderId}/confirm`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ buyerEmail: email }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Receipt confirmed — escrow released early (${data.released}).` : `Error: ${data.error}`);
  }
  return (
    <span>
      <input type="email" required placeholder="your email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: 220 }} />{" "}
      <button className="btn btn-primary" onClick={go}>Confirm receipt</button> {msg && <span>{msg}</span>}
    </span>
  );
}

export function DisputeForm({ orderId }: { orderId: string }) {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Opening dispute…");
    const res = await fetch("/api/disputes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, buyerEmail: email, reason }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Dispute OPEN — funds frozen until resolved." : `Error: ${data.error}`);
  }
  return (
    <form onSubmit={go}>
      <label>Your email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>What went wrong?<input required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. wrong size delivered" /></label>
      <p><button className="btn btn-secondary" type="submit">Open dispute</button> {msg && <span>{msg}</span>}</p>
    </form>
  );
}

export function ReviewForm({ orderId }: { orderId: string }) {
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Posting…");
    const res = await fetch("/api/reviews", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, buyerEmail: email, rating: Number(rating), comment }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Review posted (${data.reviewId}).` : `Error: ${data.error}`);
  }
  return (
    <form onSubmit={go}>
      <label>Your email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Rating (1–5)<input inputMode="numeric" value={rating} onChange={(e) => setRating(e.target.value)} /></label>
      <label>Comment<input value={comment} onChange={(e) => setComment(e.target.value)} /></label>
      <p><button className="btn btn-secondary" type="submit">Post review</button> {msg && <span>{msg}</span>}</p>
    </form>
  );
}

export function FulfillForm({ orderId }: { orderId: string }) {
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("BIKE");
  const [trackingRef, setTrackingRef] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState("");
  const [delivered, setDelivered] = useState(false);
  const [msg, setMsg] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Updating…");
    const res = await fetch("/api/fulfillment", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, vendorEmail: email, method, trackingRef, receiptPhoto, markDelivered: delivered }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Fulfillment: ${data.fulfillment}.` : `Error: ${data.error}`);
  }
  return (
    <form onSubmit={go}>
      <label>Vendor email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Method
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>COURIER</option><option>BIKE</option><option>WAYBILL</option><option>SELF</option>
        </select>
      </label>
      <label>Tracking / waybill receipt no.<input value={trackingRef} onChange={(e) => setTrackingRef(e.target.value)} placeholder="park + receipt no. for waybill" /></label>
      <label>Receipt photo URL<input value={receiptPhoto} onChange={(e) => setReceiptPhoto(e.target.value)} placeholder="https://…" /></label>
      <label><input type="checkbox" checked={delivered} onChange={(e) => setDelivered(e.target.checked)} style={{ width: "auto" }} /> Mark delivered</label>
      <p><button className="btn btn-primary" type="submit">Update fulfillment</button> {msg && <span>{msg}</span>}</p>
    </form>
  );
}
