// Expire unpaid orders: the 30-min FX-quote lock and unpaid-order window
// share one enforcement point. Run via: npm run order:expire
// (cron in prod; manual in local dev).
import { PrismaClient } from "@prisma/client";
import { QUOTE_TTL_MIN } from "../src/lib/fees";

const db = new PrismaClient();

async function main() {
  const cutoff = new Date(Date.now() - QUOTE_TTL_MIN * 60000);
  const stale = await db.order.findMany({
    where: { status: "PENDING", createdAt: { lte: cutoff } },
    select: { id: true },
  });
  console.log(`Stale unpaid orders: ${stale.length}`);
  for (const o of stale) {
    await db.$transaction([
      db.payment.updateMany({ where: { orderId: o.id, status: "PENDING" }, data: { status: "FAILED" } }),
      db.booking.updateMany({ where: { id: { in: await bookingIds(o.id) }, status: "PENDING_PAYMENT" }, data: { status: "CANCELLED" } }),
      db.order.update({ where: { id: o.id }, data: { status: "CANCELLED" } }),
    ]);
  }
}

async function bookingIds(orderId: string) {
  const items = await db.orderItem.findMany({ where: { orderId, type: "BOOKING" } });
  return items.map((i) => i.bookingId).filter((b): b is string => !!b);
}

main().finally(() => db.$disconnect());
