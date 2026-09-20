// Razorpay signature checks. Uses constant-time comparison to avoid timing attacks.
import crypto from "node:crypto";

function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length || !/^[a-f0-9]+$/.test(b)) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

export function hmacSha256Hex(secret, payload) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/** Checkout signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature({ orderId, paymentId, signature, secret }) {
  if (!secret || !orderId || !paymentId || !signature) return false;
  return safeEqualHex(hmacSha256Hex(secret, `${orderId}|${paymentId}`), signature);
}

/** Webhook signature = HMAC_SHA256(raw request body, webhook_secret). */
export function verifyWebhookSignature({ rawBody, signature, secret }) {
  if (!secret || typeof rawBody !== "string" || !signature) return false;
  return safeEqualHex(hmacSha256Hex(secret, rawBody), signature);
}

export function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function safeEqualString(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}
