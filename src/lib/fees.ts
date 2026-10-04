// Fees + FX quotes (Phase 3). Single source of truth for pricing math.
// Commission: 8% products, 10% services, +₦100 flat per order (configurable via env).
// FX: NGN settlement; diaspora buyers see an informational quote in USD/GBP/EUR
// locked for 30 min. The lock is enforced by unpaid-order expiry (same window).

export const PRODUCT_BPS = Number(process.env.COMMISSION_PRODUCT_BPS ?? 800);
export const SERVICE_BPS = Number(process.env.COMMISSION_SERVICE_BPS ?? 1000);
export const FLAT_FEE_NGN = 100;
export const QUOTE_TTL_MIN = 30;
const FX_BUFFER = 1.02;

const FX_DEFAULTS: Record<string, number> = { USD: 1500, GBP: 1900, EUR: 1600 };

export function fxRateFor(currency: string): number {
  const env = process.env[`FX_${currency}_NGN`];
  const base = env ? Number(env) : FX_DEFAULTS[currency];
  if (!base || base <= 0) throw new Error(`Unsupported currency: ${currency}`);
  return base * FX_BUFFER;
}

export type FeeBreakdown = {
  subtotalNGN: number;
  commissionNGN: number;
  flatNGN: number;
  feeNGN: number;
  totalNGN: number;
};

export function priceOrder(lines: Array<{ priceNGN: number; qty: number; kind: "PRODUCT" | "BOOKING" }>): FeeBreakdown {
  const subtotalNGN = lines.reduce((s, l) => s + l.priceNGN * l.qty, 0);
  const commissionNGN = lines.reduce(
    (s, l) => s + Math.round(((l.priceNGN * l.qty) * (l.kind === "PRODUCT" ? PRODUCT_BPS : SERVICE_BPS)) / 10000),
    0
  );
  const flatNGN = lines.length > 0 ? FLAT_FEE_NGN : 0;
  const feeNGN = commissionNGN + flatNGN;
  return { subtotalNGN, commissionNGN, flatNGN, feeNGN, totalNGN: subtotalNGN + feeNGN };
}

export type FxQuote = {
  currency: string;
  rateNGN: number;
  amountBuyer: number;
  quotedAt: string;
  expiresAt: string;
};

export function quoteFx(totalNGN: number, currency: string): FxQuote {
  const rateNGN = fxRateFor(currency);
  const now = new Date();
  return {
    currency,
    rateNGN,
    amountBuyer: Math.ceil((totalNGN / rateNGN) * 100) / 100,
    quotedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + QUOTE_TTL_MIN * 60000).toISOString(),
  };
}
