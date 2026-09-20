// Run via: npm run escrow:release
// Finds EscrowLedger rows where status=HELD and releaseAfter <= now()
// and marks them RELEASED. Wire to cron (e.g., GitHub Actions / Render cron)
// post-MVP. MVP can run manually.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const due = await db.escrowLedger.findMany({
    where: { status: "HELD", releaseAfter: { lte: new Date() } }
  });
  console.log(`Due for release: ${due.length}`);
  for (const e of due) {
    await db.escrowLedger.update({
      where: { id: e.id },
      data: { status: "RELEASED", amountReleased: e.amountHeld }
    });
  }
}

main().finally(() => db.$disconnect());
