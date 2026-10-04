// In-memory token bucket (Phase 6). Per-process, local-dev grade:
// protects checkout/booking/dispute/onboard writes from spam/OTP abuse.
// Prod would use Redis; documented in PROGRESS.md.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= max;
}

export function clientKey(req: Request, scope: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${scope}:${ip}`;
}
