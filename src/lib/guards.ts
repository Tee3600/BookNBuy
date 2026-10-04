import { db } from "./db";

// RBAC helpers (Phase 6). Vendor routes require an approved VendorProfile.
// Admin routes require x-admin-key only when ADMIN_KEY is configured;
// otherwise open with a console warning (local-demo default).
export async function requireApprovedVendor(vendorEmail: string) {
  const user = await db.user.findUnique({ where: { email: vendorEmail }, include: { vendor: true } });
  if (!user?.vendor?.approved) throw new Error("Vendor not approved");
  return user;
}

export function requireAdminKey(req: Request): boolean {
  const need = process.env.ADMIN_KEY ?? "";
  if (!need) {
    console.warn("[rbac] ADMIN_KEY unset — admin API open (local demo only)");
    return true;
  }
  return req.headers.get("x-admin-key") === need;
}
