// Notifications hook (Phase 5). Local-first: always logs; sends SMS/WhatsApp
// via Termii only when TERMI_API_KEY is set. Best-effort — never throws,
// never blocks the money/order flow on failure.
export type NotifyEvent =
  | "order.paid" | "order.in_transit" | "order.delivered" | "order.completed"
  | "dispute.opened" | "dispute.resolved" | "payout.requested" | "payout.paid";

export async function notify(event: NotifyEvent, to: string, message: string) {
  console.log(`[notify:${event}] to=${to} msg=${message}`);
  const key = process.env.TERMI_API_KEY;
  const from = process.env.TERMI_SENDER ?? "BookNBuy";
  if (!key || !to) return { sent: false as const, mode: "log" as const };
  try {
    const res = await fetch("https://v3.api.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, from, sms: message, type: "plain", api_key: key, channel: "generic" }),
    });
    return { sent: res.ok, mode: "termii" as const };
  } catch {
    return { sent: false as const, mode: "log" as const };
  }
}
