// Run via: npm run escrow:release
// Releases due HELD escrows (releaseAfter <= now) EXCEPT on DISPUTED orders
// (funds stay frozen until admin resolves). When an order's escrows are all
// released, the order is marked COMPLETED. Wire to cron in prod; manual locally.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const due = await db.escrowLedger.findMany({
    where: {
      status: "HELD",
      releaseAfter: { lte: new Date() },
      payment: { order: { status: { not: "DISPUTED" } } },
    },
    include: { payment: { select: { orderId: true } } },
  });
  console.log(`Due for release: ${due.length}`);
  const touched = new Set<string>();
  for (const e of due) {
    await db.escrowLedger.update({
      where: { id: e.id },
      data: { status: "RELEASED", amountReleased: e.amountHeld },
    });
    touched.add(e.payment.orderId);
  }
  for (const orderId of touched) {
    const remaining = await db.escrowLedger.count({ where: { payment: { orderId }, status: "HELD" } });
    if (remaining === 0) {
      await db.order.updateMany({ where: { id: orderId, status: "PAID" }, data: { status: "COMPLETED" } });
    }
  }
  console.log(`Released, orders touched: ${touched.size}`);
}

main().finally(() => db.$disconnect());
