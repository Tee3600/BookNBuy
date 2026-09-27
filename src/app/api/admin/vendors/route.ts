import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Approve (or reject) a vendor: sets VendorProfile.approved + User.kycStatus.
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const userId = form?.get("userId")?.toString() ?? (await req.json().catch(() => ({}))).userId;
  const approve = (form?.get("approve")?.toString() ?? "true") !== "false";
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  try {
    await db.vendorProfile.update({ where: { userId }, data: { approved: approve } });
    await db.user.update({ where: { id: userId }, data: { kycStatus: approve ? "APPROVED" : "REJECTED" } });
    return NextResponse.json({ userId, approved: approve, mode: "db" });
  } catch {
    return NextResponse.json({ userId, approved: approve, mode: "demo", note: "Postgres unreachable" });
  }
}
