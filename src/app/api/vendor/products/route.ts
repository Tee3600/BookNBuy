import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Body = z.object({
  vendorEmail: z.string().email(),
  title: z.string().min(2),
  description: z.string().min(2),
  priceNGN: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid product fields" }, { status: 400 });
  const b = parsed.data;
  try {
    const user = await db.user.findUnique({ where: { email: b.vendorEmail }, include: { vendor: true } });
    if (!user?.vendor?.approved) return NextResponse.json({ error: "Vendor not approved" }, { status: 403 });
    const p = await db.product.create({
      data: { vendorId: user.id, title: b.title, description: b.description, priceNGN: b.priceNGN, stock: b.stock, images: JSON.stringify(b.imageUrl ? [b.imageUrl] : []) },
    });
    return NextResponse.json({ productId: p.id, mode: "db" });
  } catch {
    return NextResponse.json({ productId: "demo-product", mode: "demo", note: "Postgres unreachable — demo confirmation" });
  }
}
