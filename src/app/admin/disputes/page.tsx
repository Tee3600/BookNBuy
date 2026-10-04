"use client";
import { useEffect, useState } from "react";

type Dispute = { orderId: string; reason: string; status: string; createdAt: string };

export default function AdminDisputesPage() {
  const [list, setList] = useState<Dispute[]>([]);
  const [msg, setMsg] = useState("Loading…");
  const [resolution, setResolution] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/disputes");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
      setMsg(Array.isArray(data) ? "" : (data.error ?? ""));
    } catch { setMsg("Unavailable (Postgres unreachable)."); }
  }
  useEffect(() => { load(); }, []);

  async function resolve(orderId: string, action: "release" | "refund" | "partial") {
    setMsg("Resolving…");
    const res = await fetch("/api/admin/disputes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action, resolution, ...(action === "partial" ? { amountNGN: Number(prompt("Vendor share (NGN)?") ?? 0) } : {}) }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Resolved: ${data.action}.` : `Error: ${data.error}`);
    load();
  }

  return (
    <div>
      <h1>Disputes queue</h1>
      <label>Resolution note<input value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="optional note" /></label>
      {list.length === 0 && <p>{msg || "No open disputes."}</p>}
      <ul>
        {list.map((d) => (
          <li key={d.orderId}>
            <a href={`/orders/${d.orderId}`}>{d.orderId.slice(0, 8)}…</a> — {d.reason}{" "}
            <button onClick={() => resolve(d.orderId, "release")}>Release to vendor</button>{" "}
            <button onClick={() => resolve(d.orderId, "refund")}>Refund buyer</button>{" "}
            <button onClick={() => resolve(d.orderId, "partial")}>Partial</button>
          </li>
        ))}
      </ul>
      <p>{msg}</p>
    </div>
  );
}
