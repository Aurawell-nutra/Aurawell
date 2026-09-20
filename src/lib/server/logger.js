import "server-only";

// Minimal structured logger. Callers must never pass passwords, cookies, card/UPI data,
// Razorpay signatures or secret keys. Known sensitive keys are redacted defensively.
const SENSITIVE = /pass|secret|token|signature|cookie|authorization|card|cvv|upi|otp/i;

function redact(value, depth = 0) {
  if (depth > 4 || value == null) return value;
  if (value instanceof Error) return { name: value.name, message: value.message, code: value.code };
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SENSITIVE.test(k) ? "[redacted]" : redact(v, depth + 1)]));
  }
  return value;
}

export const logger = {
  info: (msg, meta) => console.info(`[aurawell] ${msg}`, meta ? redact(meta) : ""),
  warn: (msg, meta) => console.warn(`[aurawell] ${msg}`, meta ? redact(meta) : ""),
  error: (msg, meta) => console.error(`[aurawell] ${msg}`, meta ? redact(meta) : ""),
};
