"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CallbackInner() {
  const ref = useSearchParams().get("reference") ?? "";
  const [msg, setMsg] = useState("Verifying payment…");

  useEffect(() => {
    if (!ref) { setMsg("Missing reference."); return; }
    fetch(`/api/checkout/verify?reference=${encodeURIComponent(ref)}`)
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .then(({ ok, data }) => setMsg(ok
        ? `Paid. Order ${data.orderId} → escrow HELD. View: /orders/${data.orderId}`
        : `Not confirmed: ${data.message ?? data.error}`))
      .catch(() => setMsg("Verify unavailable."));
  }, [ref]);

  return <div><h1>Checkout result</h1><p>{msg}</p></div>;
}

export default function CheckoutCallbackPage() {
  return <Suspense><CallbackInner /></Suspense>;
}
