// Demo fallback data (Amaka's boutique, Phase 2 prototype).
// Used when Postgres is unreachable so the working page still opens locally.
// Real data path: Prisma → local Postgres (docker-compose.yml).

export const DEMO_VENDOR = {
  userId: "demo-amaka",
  businessName: "Adaeze's Boutique",
  city: "Abuja",
  approved: true,
};

export const DEMO_PRODUCTS = [
  { id: "p1", title: "Ankara Gown — Ready to Wear", priceNGN: 25000, stock: 12, city: "Abuja", vendor: "Adaeze's Boutique" },
  { id: "p2", title: "Aso-Oke Head Tie (Gele)", priceNGN: 8500, stock: 30, city: "Abuja", vendor: "Adaeze's Boutique" },
  { id: "p3", title: "Men's Senator Set", priceNGN: 32000, stock: 8, city: "Lagos", vendor: "Tobi Stitches" },
];

export const DEMO_SERVICES = [
  { id: "s1", title: "Bespoke Tailoring — Blouse", priceNGN: 8500, durationMin: 60, city: "Abuja", vendor: "Adaeze's Boutique" },
  { id: "s2", title: "Bridal Consultation", priceNGN: 15000, durationMin: 90, city: "Abuja", vendor: "Adaeze's Boutique" },
];

export function formatNGN(kobo: number) {
  return "₦" + kobo.toLocaleString("en-NG");
}
