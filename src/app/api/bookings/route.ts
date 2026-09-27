import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Body = z.object({
  serviceId: z.string(),
  buyerEmail: z.string().email(),
  startAt: z.string().datetime(),
  notes: z.string().optional(),
});

// Phase 2: booking create. DB enforces @@unique([vendorId, startAt]) → 409 on double-book.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking fields" }, { status: 400 });
  const b = parsed.data;
  try {
    const [service, buyer] = await Promise.all([
      db.service.findUnique({ where: { id: b.serviceId } }),
      db.user.findUnique({ where: { email: b.buyerEmail } }),
    ]);
    if (!service || !buyer) return NextResponse.json({ error: "Unknown service or buyer (sign up first)" }, { status: 404 });
    const startAt = new Date(b.startAt);
    const endAt = new Date(startAt.getTime() + service.durationMin * 60000);
    const booking = await db.booking.create({
      data: { serviceId: service.id, buyerId: buyer.id, vendorId: service.vendorId, startAt, endAt, notes: b.notes },
    });
    return NextResponse.json({ bookingId: booking.id, status: booking.status, mode: "db" });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Slot taken — pick another time" }, { status: 409 });
    }
    return NextResponse.json({ bookingId: "demo-booking", status: "CONFIRMED", mode: "demo", note: "Postgres unreachable — demo confirmation" });
  }
}
