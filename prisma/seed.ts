// Seed demo personas + catalog (Phase 6 data, usable now for local demo).
// Run: npm run db:seed  (requires local Postgres: docker compose up -d db + prisma migrate)
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const amaka = await db.user.upsert({
    where: { email: "amaka@example.com" },
    create: { name: "Amaka", email: "amaka@example.com", roles: "BUYER,VENDOR", kycStatus: "APPROVED", emailVerified: true },
    update: { kycStatus: "APPROVED" },
  });
  await db.vendorProfile.upsert({
    where: { userId: amaka.id },
    create: { userId: amaka.id, businessName: "Adaeze's Boutique", city: "Abuja", approved: true },
    update: { approved: true },
  });
  await db.user.upsert({
    where: { email: "tobi@example.com" },
    create: { name: "Tobi", email: "tobi@example.com", roles: "BUYER", emailVerified: true },
    update: {},
  });
  await db.user.upsert({
    where: { email: "kemi@example.co.uk" },
    create: { name: "Kemi", email: "kemi@example.co.uk", roles: "BUYER", emailVerified: true },
    update: {},
  });

  const existing = await db.product.findFirst({ where: { vendorId: amaka.id } });
  if (!existing) {
    await db.product.createMany({
      data: [
        { vendorId: amaka.id, title: "Ankara Gown — Ready to Wear", description: "Seed", priceNGN: 25000, stock: 12, images: "[]" },
        { vendorId: amaka.id, title: "Aso-Oke Head Tie (Gele)", description: "Seed", priceNGN: 8500, stock: 30, images: "[]" },
      ],
    });
    await db.service.createMany({
      data: [
        { vendorId: amaka.id, title: "Bespoke Tailoring — Blouse", priceNGN: 8500, durationMin: 60 },
        { vendorId: amaka.id, title: "Bridal Consultation", priceNGN: 15000, durationMin: 90 },
      ],
    });
  }
  console.log("Seed done: amaka/tobi/kemi + Amaka catalog.");
}

main().finally(() => db.$disconnect());
