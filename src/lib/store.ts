// Data access with graceful DB fallback (Phase 0–2 prototype).
// Tries local Postgres via Prisma; falls back to demo data when unreachable
// (e.g. `docker compose up -d db` not run yet, or migrate pending).
import { db } from "./db";
import { DEMO_PRODUCTS, DEMO_SERVICES } from "./demo";

export type CatalogQuery = { keyword?: string; city?: string; maxPrice?: number };

export async function getCatalog(q: CatalogQuery) {
  try {
    const [products, services] = await Promise.all([
      db.product.findMany({ take: 50, include: { vendor: true } }),
      db.service.findMany({ take: 50, include: { vendor: true } }),
    ]);
    const kw = (q.keyword ?? "").toLowerCase();
    return {
      source: "db" as const,
      products: products
        .map((p) => ({ id: p.id, title: p.title, priceNGN: p.priceNGN, stock: p.stock, city: p.vendor.city, vendor: p.vendor.businessName }))
        .filter((p) => (!kw || p.title.toLowerCase().includes(kw)) && (!q.city || p.city === q.city) && (!q.maxPrice || p.priceNGN <= q.maxPrice)),
      services: services
        .map((s) => ({ id: s.id, title: s.title, priceNGN: s.priceNGN, durationMin: s.durationMin, city: s.vendor.city, vendor: s.vendor.businessName }))
        .filter((s) => (!kw || s.title.toLowerCase().includes(kw)) && (!q.city || s.city === q.city) && (!q.maxPrice || s.priceNGN <= q.maxPrice)),
    };
  } catch {
    const kw = (q.keyword ?? "").toLowerCase();
    const match = (t: string, c: string, p: number) =>
      (!kw || t.toLowerCase().includes(kw)) && (!q.city || c === q.city) && (!q.maxPrice || p <= q.maxPrice);
    return {
      source: "demo" as const,
      products: DEMO_PRODUCTS.filter((p) => match(p.title, p.city, p.priceNGN)),
      services: DEMO_SERVICES.filter((s) => match(s.title, s.city, s.priceNGN)),
    };
  }
}

export async function dbReachable() {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
