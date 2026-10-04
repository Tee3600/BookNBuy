import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Body = z.object({
  orderId: z.string(),
  action: z.enum(["release", "refund", "partial"]),
  amountNGN: z.number().int().positive().optional(), // required for partial (vendor share)
  resolution: z.string().max(500).default(""),
});

// Admin resolves: release (vendor paid, order COMPLETED), refund (buyer,
// escrow REFUNDED, order REFUNDED), partial (split, order COMPLETED).
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "orderId + action required" }, { status: 400 });
  const { orderId, action, amountNGN, resolution } = parsed.data;
  try {
    const result = await db.$transaction(async (tx) => {
      const dispute = await tx.dispute.findUnique({ where: { orderId } });
      if (!dispute || dispute.status !== "OPEN") throw new Error("No open dispute");
      const held = await tx.escrowLedger.findMany({ where: { payment: { orderId }, status: "HELD" } });

      if (action === "release") {
        for (const e of held) {
          await tx.escrowLedger.update({ where: { id: e.id }, data: { status: "RELEASED", amountReleased: e.amountHeld } });
        }
        await tx.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } });
      } else if (action === "refund") {
        for (const e of held) {
          await tx.escrowLedger.update({ where: { id: e.id }, data: { status: "REFUNDED" } });
        }
        await tx.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } });
      } else {
        if (!amountNGN) throw new Error("amountNGN required for partial");
        let rest = amountNGN;
        for (const e of held) {
          const give = Math.min(e.amountHeld, rest);
          await tx.escrowLedger.update({
            where: { id: e.id },
            data: { status: "PARTIAL", amountReleased: give },
          });
          rest -= give;
        }
        await tx.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } });
      }
      await tx.dispute.update({ where: { orderId }, data: { status: "RESOLVED", resolution: `${action}: ${resolution}` } });
      return { action };
    });
    return NextResponse.json({ orderId, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}

export async function GET() {
  try {
    const open = await db.dispute.findMany({ where: { status: "OPEN" }, take: 50 });
    return NextResponse.json(open);
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
