// Generates BookNBuy PWA icons (forest + gold monogram). Run: node scripts/make-icons.mjs
import sharp from "sharp";
import fs from "fs";

fs.mkdirSync("public/icons", { recursive: true });

const B = (size, pad = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#0A2E1F"/>
  <rect x="${size * 0.06}" y="${size * 0.06}" width="${size * 0.88}" height="${size * 0.88}" rx="${size * 0.18}" fill="none" stroke="#F5A623" stroke-width="${size * 0.02}"/>
  <text x="50%" y="68%" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="${size * (pad ? 0.42 : 0.56)}" fill="#F5A623">B</text>
</svg>`;

const jobs = [
  ["public/icons/icon-192.png", 192, 0],
  ["public/icons/icon-512.png", 512, 0],
  ["public/icons/maskable-512.png", 512, 1],
  ["public/icons/apple-touch-180.png", 180, 0],
];
for (const [out, size, pad] of jobs) {
  await sharp(Buffer.from(B(size, pad))).png().toFile(out);
  console.log("wrote", out);
}
