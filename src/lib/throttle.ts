type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export type ThrottleResult = { ok: true } | { ok: false; retryAfterSec: number };

/**
 * In-memory per-key rate limit. Returns ok:false with retry hint when the
 * caller is over the window. Resets itself as timestamps age out.
 *
 * Note: this is per-process state. Good enough for a single Vercel runtime
 * instance; swap for Upstash when we need global limits.
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): ThrottleResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  const cutoff = now - windowMs;
  const recent = bucket.timestamps.filter((t) => t > cutoff);
  if (recent.length >= maxRequests) {
    const oldest = recent[0];
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
    buckets.set(key, { timestamps: recent });
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }
  recent.push(now);
  buckets.set(key, { timestamps: recent });
  return { ok: true };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
