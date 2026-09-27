import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Body = z.object({
  vendorEmail: z.string().email(),
  title: z.string().min(2),
  priceNGN: z.coerce.number().int().positive(),
  durationMin: z.coerce.number().int().positive().default(60),
  bufferMin: z.coerce.number().int().min(0).default(0),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid service fields" }, { status: 400 });
  const b = parsed.data;
  try {
    const user = await db.user.findUnique({ where: { email: b.vendorEmail }, include: { vendor: true } });
    if (!user?.vendor?.approved) return NextResponse.json({ error: "Vendor not approved" }, { status: 403 });
    const s = await db.service.create({
      data: { vendorId: user.id, title: b.title, priceNGN: b.priceNGN, durationMin: b.durationMin, bufferMin: b.bufferMin },
    });
    return NextResponse.json({ serviceId: s.id, mode: "db" });
  } catch {
    return NextResponse.json({ serviceId: "demo-service", mode: "demo", note: "Postgres unreachable — demo confirmation" });
  }
}
