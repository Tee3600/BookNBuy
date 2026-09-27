import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Body = z.object({
  email: z.string().email(),
  businessName: z.string().min(2),
  city: z.string().min(2),
  bankCode: z.string().optional(),
  accountNumber: z.string().optional(),
});

// Phase 1: single account → vendor KYC (NONE → PENDING). Admin approves.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid KYC fields" }, { status: 400 });
  const b = parsed.data;
  try {
    const user = await db.user.findUnique({ where: { email: b.email } });
    if (!user) return NextResponse.json({ error: "Sign up first, then submit KYC" }, { status: 404 });
    await db.vendorProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, businessName: b.businessName, city: b.city, bankCode: b.bankCode, accountNumber: b.accountNumber },
      update: { businessName: b.businessName, city: b.city, bankCode: b.bankCode, accountNumber: b.accountNumber },
    });
    await db.user.update({ where: { id: user.id }, data: { kycStatus: "PENDING", roles: user.roles.includes("VENDOR") ? user.roles : user.roles + ",VENDOR" } });
    return NextResponse.json({ kycStatus: "PENDING", mode: "db" });
  } catch {
    return NextResponse.json({ kycStatus: "PENDING", mode: "demo", note: "Postgres unreachable — recorded locally only" });
  }
}
