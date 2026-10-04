import { NextResponse } from "next/server";
import { z } from "zod";
import { priceOrder, quoteFx } from "@/lib/fees";

const Line = z.object({
  priceNGN: z.number().int().positive(),
  qty: z.number().int().positive().default(1),
  kind: z.enum(["PRODUCT", "BOOKING"]),
});

const Body = z.object({
  lines: z.array(Line).min(1).max(50),
  currency: z.string().regex(/^(NGN|USD|GBP|EUR)$/).default("NGN"),
});

// Pure fee preview + FX quote (no DB). Checkout re-prices authoritatively.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid quote request" }, { status: 400 });
  const fees = priceOrder(parsed.data.lines);
  const fx = parsed.data.currency === "NGN" ? null : quoteFx(fees.totalNGN, parsed.data.currency);
  return NextResponse.json({ ...fees, fx });
}
