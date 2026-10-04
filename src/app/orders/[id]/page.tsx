import { db } from "@/lib/db";
import { formatNGN } from "@/lib/demo";
import { ConfirmButton, DisputeForm, FulfillForm, ReviewForm } from "./actions";

export default async function OrderPage({ params }: { params: { id: string } }) {
  let order: Awaited<ReturnType<typeof db.order.findUnique>> | null = null;
  let detail: { items: Array<{ type: string; qty: number; priceNGN: number }>; payments: Array<{ reference: string; status: string }>; escrowHeld: number; escrowReleased: number; fulfillment: { method: string; trackingRef: string | null; status: string } | null; dispute: { status: string; reason: string } | null; reviews: Array<{ rating: number; comment: string | null }> } | null = null;
  try {
    order = await db.order.findUnique({ where: { id: params.id } });
    if (order) {
      const [items, payments, escrows, fulfillment, dispute, reviews] = await Promise.all([
        db.orderItem.findMany({ where: { orderId: order.id } }),
        db.payment.findMany({ where: { orderId: order.id } }),
        db.escrowLedger.findMany({ where: { payment: { orderId: order.id } } }),
        db.fulfillment.findUnique({ where: { orderId: order.id } }),
        db.dispute.findUnique({ where: { orderId: order.id } }),
        db.review.findMany({ where: { orderId: order.id } }),
      ]);
      detail = {
        items: items.map((i) => ({ type: i.type, qty: i.qty, priceNGN: i.priceNGN })),
        payments: payments.map((p) => ({ reference: p.reference, status: p.status })),
        escrowHeld: escrows.filter((e) => e.status === "HELD").reduce((s, e) => s + e.amountHeld, 0),
        escrowReleased: escrows.reduce((s, e) => s + e.amountReleased, 0),
        fulfillment: fulfillment ? { method: fulfillment.method, trackingRef: fulfillment.trackingRef, status: fulfillment.status } : null,
        dispute: dispute ? { status: dispute.status, reason: dispute.reason } : null,
        reviews: reviews.map((r) => ({ rating: r.rating, comment: r.comment })),
      };
    }
  } catch { /* demo: DB unreachable */ }

  if (!order || !detail) return <div><h1>Order {params.id}</h1><p>Not found (or Postgres unreachable).</p></div>;

  return (
    <div>
      <h1>Order {order.id.slice(0, 8)}… — {order.status}</h1>
      <p>Total {formatNGN(order.totalNGN)} (fees {formatNGN(order.feeNGN)})</p>
      <h2>Items</h2>
      <ul>{detail.items.map((i, n) => <li key={n}>{i.type} × {i.qty} — {formatNGN(i.priceNGN * i.qty)}</li>)}</ul>
      <h2>Payments</h2>
      <ul>{detail.payments.map((p) => <li key={p.reference}>{p.reference} — {p.status}</li>)}</ul>
      <p>Escrow held {formatNGN(detail.escrowHeld)} · released {formatNGN(detail.escrowReleased)}</p>
      <h2>Fulfillment</h2>
      {detail.fulfillment
        ? <p>{detail.fulfillment.method} — {detail.fulfillment.status}{detail.fulfillment.trackingRef ? ` — ${detail.fulfillment.trackingRef}` : ""}</p>
        : <p>Not yet dispatched.</p>}
      {(order.status === "PAID" || order.status === "FULFILLING" || order.status === "IN_TRANSIT") && (
        <div><h2>Vendor: update fulfillment</h2><FulfillForm orderId={order.id} /></div>
      )}

      {detail.dispute
        ? <p><strong>Dispute {detail.dispute.status}:</strong> {detail.dispute.reason}</p>
        : (order.status === "PAID" || order.status === "DELIVERED") && (
          <div><h2>Confirm receipt (releases escrow early)</h2><ConfirmButton orderId={order.id} />
          <h2>Problem? Open a dispute (freezes funds)</h2><DisputeForm orderId={order.id} /></div>
        )}

      {order.status === "COMPLETED" && (
        <div><h2>Leave a review</h2><ReviewForm orderId={order.id} /></div>
      )}
      {detail.reviews.length > 0 && (
        <div><h2>Reviews</h2><ul>{detail.reviews.map((r, n) => <li key={n}>{"★".repeat(r.rating)} — {r.comment}</li>)}</ul></div>
      )}
    </div>
  );
}
