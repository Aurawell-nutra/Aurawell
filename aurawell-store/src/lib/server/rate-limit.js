// In-memory fixed-window rate limiter.
// LIMITATION: state lives in a single Node.js process. It resets on restart and is not shared
// between multiple server instances. For multi-instance production deployments, replace the
// store with Redis (see docs/security.md).

const buckets = new Map();
let lastSweep = Date.now();

function sweep(now) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

/**
 * @param {string} key      e.g. `login:${ip}`
 * @param {number} limit    max hits per window
 * @param {number} windowMs window length
 * @returns {{ ok: boolean, remaining: number, retryAfter: number }}
 */
export function rateLimit(key, limit, windowMs, now = Date.now()) {
  sweep(now);
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  const ok = bucket.count <= limit;
  return { ok, remaining: Math.max(0, limit - bucket.count), retryAfter: ok ? 0 : Math.ceil((bucket.resetAt - now) / 1000) };
}

export function resetRateLimit(key) {
  buckets.delete(key);
}

export const LIMITS = {
  adminLoginPerIp: [10, 15 * 60_000],
  adminLoginPerEmail: [5, 15 * 60_000],
  reviewPerIp: [5, 60 * 60_000],
  checkoutPerIp: [15, 10 * 60_000],
  paymentVerifyPerIp: [30, 10 * 60_000],
  orderLookupPerIp: [20, 10 * 60_000],
  contactPerIp: [5, 60 * 60_000],
  newsletterPerIp: [5, 60 * 60_000],
  unsubscribePerIp: [30, 60 * 60_000],
  publicApiPerIp: [120, 60_000],
  uploadPerAdmin: [30, 10 * 60_000],
};
